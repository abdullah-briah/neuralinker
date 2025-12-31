import { GoogleAuth } from "google-auth-library";
import "dotenv/config";
import prisma from "./prisma";
import { Prisma } from "@prisma/client";

/* ===============================
   Google Gemini Initialization
================================ */

console.log("🔹 AI Service initialized using GOOGLE_CREDENTIALS env variable");

if (!process.env.GOOGLE_CREDENTIALS) {
    throw new Error("❌ GOOGLE_CREDENTIALS environment variable is not set");
}

const auth = new GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
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
    matchedSkills: string[];
    unmatchedSkills: string[];
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
   Local Heuristic Fallback (Updated)
================================ */

const calculateProfileProjectMatch = (
    user: {
        name: string;
        title: string;
        bio: string;
        skills: string[];
    },
    project: {
        title: string;
        shortDescription: string;
        requiredSkills: string[];
    }
): MatchResult => {

    const normalize = (s: string) => s.toLowerCase().trim();

    // كلمات المستخدم: skills + title + bio
    const userWords = new Set<string>();
    user.skills.forEach(s => userWords.add(normalize(s)));
    if (user.title) userWords.add(normalize(user.title));
    user.bio.split(/\W+/).map(w => w.trim()).filter(Boolean).forEach(w => userWords.add(normalize(w)));

    // كلمات المشروع: requiredSkills + title + shortDescription
    const projectWords = new Set<string>();
    project.requiredSkills.forEach(s => projectWords.add(normalize(s)));
    project.title.split(/\W+/).map(w => w.trim()).filter(Boolean).forEach(w => projectWords.add(normalize(w)));
    project.shortDescription.split(/\W+/).map(w => w.trim()).filter(Boolean).forEach(w => projectWords.add(normalize(w)));

    // مطابقة الكلمات
    const matchedSkills = Array.from(projectWords).filter(w => userWords.has(w));
    const unmatchedSkills = Array.from(projectWords).filter(w => !userWords.has(w));

    const score = Math.round((matchedSkills.length / (projectWords.size || 1)) * 100);

    // تحليل نصي
    let reason = `${user.name} Match Analysis:\n`;
    reason += `- Matched keywords: ${matchedSkills.slice(0, 10).join(", ") || "None"}\n`;
    reason += `- Missing / unmatched keywords: ${unmatchedSkills.slice(0, 10).join(", ") || "None"}\n`;

    if (score >= 70) {
        reason += `- Overall fit: Strong match.`;
    } else if (score >= 40) {
        reason += `- Overall fit: Potential match.`;
    } else {
        reason += `- Overall fit: Weak match.`;
    }

    return {
        score,
        reason,
        matchedSkills,
        unmatchedSkills
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
        shortDescription: string;
        requiredSkills: string[];
        category?: string;
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
            matchedSkills: [],
            unmatchedSkills: []
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
  "reason": "string",
  "matchedSkills": string[],
  "unmatchedSkills": string[]
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
        return calculateProfileProjectMatch(userProfile, {
            title: projectDetails.title,
            shortDescription: projectDetails.shortDescription,
            requiredSkills: projectDetails.requiredSkills
        });
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
        shortDescription: string;
        requiredSkills: unknown;
        category?: string;
    }
) => {

    const result = await analyzeMatch(
        {
            ...userProfile,
            skills: normalizeSkills(userProfile.skills),
        },
        {
            ...projectDetails,
            requiredSkills: normalizeSkills(projectDetails.requiredSkills),
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
