import { GoogleAuth } from "google-auth-library";
import path from "path";
import "dotenv/config";
import prisma from "./prisma";
import { Prisma } from "@prisma/client";

/* ===============================
   Google Gemini Initialization
================================ */

const KEY_FILE_PATH = path.join(
    process.cwd(),
    "keys",
    "gen-lang-client-0096271690-dfd82b22ff42.json"
);

console.log(`🔹 AI Service initialized with key: ${KEY_FILE_PATH}`);

const auth = new GoogleAuth({
    keyFile: KEY_FILE_PATH,
    scopes: [
        "https://www.googleapis.com/auth/generative-language",
        "https://www.googleapis.com/auth/cloud-platform",
    ],
});

/* ===============================
   Types
================================ */

export interface MatchResult {
    score: number;
    reason: string;
}

/* ===============================
   Helpers
================================ */

const normalizeSkills = (skills: unknown): string[] => {
    if (Array.isArray(skills)) {
        return skills
            .map(s => String(s))
            .filter(Boolean)
            .map(s => s.trim());
    }

    if (typeof skills === "string") {
        return skills
            .split(",")
            .map(s => s.trim())
            .filter(Boolean);
    }

    return [];
};

/* ===============================
   Local Heuristic Fallback
================================ */

const calculateHeuristicMatch = (
    userProfile: {
        name: string;
        title: string;
        bio: string;
        skills: string[];
    },
    projectDetails: {
        title: string;
        description: string;
        skills: string[];
        category: string;
    },
    errorMsg?: string
): MatchResult => {

    const normalize = (s: string) => s.toLowerCase().trim();

    const userSkills = new Set(userProfile.skills.map(normalize));
    const projectSkills = projectDetails.skills.map(normalize);

    const matchedSkills = projectSkills.filter(s => userSkills.has(s));
    const total = projectSkills.length || 1;

    const skillScore = (matchedSkills.length / total) * 100;

    let bonus = 0;
    if (
        userProfile.title &&
        projectDetails.title
            .toLowerCase()
            .includes(userProfile.title.toLowerCase())
    ) {
        bonus += 15;
    }

    const finalScore = Math.min(100, Math.round(skillScore + bonus));

    let reason: string;

    if (matchedSkills.length > 0) {
        if (finalScore >= 70) {
            reason = `${userProfile.name} is a strong match. `;
        } else if (finalScore >= 40) {
            reason = `${userProfile.name} is a potential match. `;
        } else {
            reason = `${userProfile.name} is a partial match. `;
        }

        reason += `Matched skills: ${matchedSkills.slice(0, 3).join(", ")}.`;
    } else {
        reason = `${userProfile.name} does not meet core requirements.`;
    }

    return {
        score: finalScore,
        reason: `${reason} (Fallback Analysis${errorMsg ? `: ${errorMsg}` : ""})`,
    };
};

/* ===============================
   AI Match Analysis
================================ */

export const analyzeMatch = async (
    userProfile: {
        name: string;
        title: string;
        bio: string;
        skills: string[];
    },
    projectDetails: {
        title: string;
        description: string;
        skills: string[];
        category: string;
    }
): Promise<MatchResult> => {

    const hasData =
        userProfile.skills.length > 0 ||
        Boolean(userProfile.bio) ||
        Boolean(userProfile.title);

    if (!hasData) {
        return {
            score: 0,
            reason: "Insufficient user profile data.",
        };
    }

    let selectedModel = "gemini-1.5-flash";
    let discoveryError = "";

    /* -------- Model Discovery -------- */
    try {
        const client = await auth.getClient();
        const token = (await client.getAccessToken()).token;

        if (token) {
            const res = await fetch(
                "https://generativelanguage.googleapis.com/v1beta/models",
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.ok) {
                const data = await res.json();
                const models = (data.models || [])
                    .filter((m: any) =>
                        m.supportedGenerationMethods?.includes("generateContent")
                    )
                    .map((m: any) => m.name.replace("models/", ""));

                const priority = [
                    "gemini-1.5-flash",
                    "gemini-1.5-pro",
                    "gemini-pro",
                ];

                selectedModel =
                    priority.find(p => models.includes(p)) ||
                    models[0] ||
                    selectedModel;
            }
        }
    } catch (e: any) {
        discoveryError = e.message;
    }

    /* -------- Prompt -------- */
    const prompt = `
You are an expert project evaluator.

Return STRICT JSON ONLY:
{
  "score": number,
  "reason": "string"
}
`;

    try {
        const client = await auth.getClient();
        const token = (await client.getAccessToken()).token;
        if (!token) throw new Error("No access token");

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `
Candidate:
${JSON.stringify(userProfile)}

Project:
${JSON.stringify(projectDetails)}

${prompt}
`
                        }]
                    }]
                }),
            }
        );

        if (!response.ok) {
            throw new Error(await response.text());
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (text) {
            const match = text.match(/\{[\s\S]*\}/);
            if (match) {
                return JSON.parse(match[0]);
            }
        }

        throw new Error("Invalid AI response");

    } catch (e: any) {
        return calculateHeuristicMatch(
            userProfile,
            projectDetails,
            discoveryError || e.message
        );
    }
};

/* ===============================
   AI Insight Persistence
================================ */

export const createInsight = async (
    joinRequestId: string,
    result: MatchResult
) => {
    return prisma.aIInsight.create({
        data: {
            type: "match_compatibility",
            joinRequestId,
            score: result.score,
            result: result as unknown as Prisma.InputJsonValue,
        },
    });
};

export const getInsight = async (
    joinRequestId: string
) => {
    return prisma.aIInsight.findUnique({
        where: { joinRequestId },
    });
};

/* ===============================
   Orchestration Helper
================================ */

export const analyzeAndSaveInsight = async (
    joinRequestId: string,
    userProfile: {
        name: string;
        title: string;
        bio: string;
        skills: unknown;
    },
    projectDetails: {
        title: string;
        description: string;
        skills: unknown;
        category: string;
    }
) => {

    const result = await analyzeMatch(
        {
            ...userProfile,
            skills: normalizeSkills(userProfile.skills),
        },
        {
            ...projectDetails,
            skills: normalizeSkills(projectDetails.skills),
        }
    );

    return prisma.aIInsight.create({
        data: {
            type: "match_compatibility",
            joinRequestId,
            score: result.score,
            result: result as unknown as Prisma.InputJsonValue,
        },
    });
};
