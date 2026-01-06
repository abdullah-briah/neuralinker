import { GoogleAuth } from "google-auth-library";
import "dotenv/config";
import prisma from "./prisma";
import { Prisma } from "@prisma/client";

/* ===============================
   Google Gemini Initialization
================================ */

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
        return skills.map(s => String(s).toLowerCase().trim()).filter(Boolean);
    }
    if (typeof skills === "string") {
        return skills
            .split(",")
            .map(s => s.toLowerCase().trim())
            .filter(Boolean);
    }
    return [];
};

const tokenize = (text: string): string[] =>
    text
        .toLowerCase()
        .split(/\W+/)
        .map(w => w.trim())
        .filter(w => w.length > 2);

/* ===============================
   Intelligent Heuristic Engine
================================ */

const calculateAdvancedMatch = (
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
        category?: string;
    }
): MatchResult => {

    /* ===============================
       1️⃣ Normalize Data
    =============================== */
    const normalize = (arr: string[]) =>
        arr.map(s => s.toLowerCase().trim());

    const userSkills = normalize(user.skills);
    const projectSkills = normalize(project.requiredSkills);

    /* ===============================
       2️⃣ Core Skill Matching (60%)
    =============================== */
    const matchedSkills = projectSkills.filter(skill =>
        userSkills.includes(skill)
    );

    const missingSkills = projectSkills.filter(skill =>
        !userSkills.includes(skill)
    );

    const skillScore =
        (matchedSkills.length / Math.max(projectSkills.length, 1)) * 60;

    /* ===============================
       3️⃣ Semantic Relevance (20%)
    =============================== */
    const tokenize = (text: string): string[] =>
        text
            .toLowerCase()
            .split(/\W+/)
            .filter(w => w.length > 3);

    const userTokens = new Set([
        ...tokenize(user.title),
        ...tokenize(user.bio),
    ]);

    const projectTokens = new Set([
        ...tokenize(project.title),
        ...tokenize(project.shortDescription),
    ]);

    const semanticOverlap = Array.from(projectTokens)
        .filter(t => userTokens.has(t));

    const semanticScore = Math.min(semanticOverlap.length * 3, 20);

    /* ===============================
       4️⃣ Domain Awareness (10%)
    =============================== */
    let domainScore = 0;
    if (project.category && user.title) {
        const category = project.category.toLowerCase();
        const title = user.title.toLowerCase();

        if (
            category.includes("web") &&
            (title.includes("full") || title.includes("frontend") || title.includes("backend"))
        ) {
            domainScore = 10;
        }

        if (
            category.includes("data") &&
            title.includes("data")
        ) {
            domainScore = 10;
        }
    }

    /* ===============================
       5️⃣ Adaptability Bonus (10%)
    =============================== */
    const transferableSkills = ["javascript", "sql", "api", "logic"];
    const adaptabilityScore =
        userSkills.some(s => transferableSkills.includes(s)) ? 10 : 0;

    /* ===============================
       6️⃣ Final Score
    =============================== */
    let finalScore =
        skillScore +
        semanticScore +
        domainScore +
        adaptabilityScore;

    finalScore = Math.min(Math.max(finalScore, 20), 100);

    /* ===============================
       7️⃣ Explain WHY (Human AI)
    =============================== */
    let reason = `AI Match Evaluation for ${user.name}:\n`;

    if (matchedSkills.length > 0) {
        reason += `- The candidate matches key required skills (${matchedSkills.join(", ")}), enabling partial contribution to the project.\n`;
    } else {
        reason += `- The candidate does not currently meet the core technical requirements of this project.\n`;
    }

    if (missingSkills.length > 0) {
        reason += `- However, important skills such as (${missingSkills.join(", ")}) are missing, which limits immediate productivity.\n`;
    }

    if (semanticOverlap.length > 0) {
        reason += `- The candidate’s background and experience show conceptual alignment with the project objectives.\n`;
    }

    if (adaptabilityScore > 0) {
        reason += `- Transferable skills indicate strong learning ability and adaptability.\n`;
    }

    if (finalScore >= 80) {
        reason += `- Overall assessment: Excellent fit with high readiness for immediate contribution.`;
    } else if (finalScore >= 55) {
        reason += `- Overall assessment: Good fit, but some onboarding or upskilling may be required.`;
    } else {
        reason += `- Overall assessment: Limited fit at the moment due to missing core skills, but suitable for growth-oriented roles.`;
    }

    /* ===============================
       8️⃣ Return
    =============================== */
    return {
        score: Math.round(finalScore),
        reason,
        matchedSkills,
        unmatchedSkills: missingSkills,
    };
};



/* ===============================
   AI Match (Gemini + Fallback)
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
            unmatchedSkills: [],
        };
    }

    try {
        const client = await auth.getClient();
        const token = (await client.getAccessToken()).token;
        if (!token) throw new Error("No token");

        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: `
Return STRICT JSON only:
{
  "score": number,
  "reason": "string",
  "matchedSkills": string[],
  "unmatchedSkills": string[]
}

Candidate:
${JSON.stringify(userProfile)}

Project:
${JSON.stringify(projectDetails)}
`,
                                },
                            ],
                        },
                    ],
                }),
            }
        );

        if (!response.ok) throw new Error("AI failed");

        const data = await response.json();
        const text =
            data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (text) {
            const match = text.match(/\{[\s\S]*\}/);
            if (match) return JSON.parse(match[0]);
        }

        throw new Error("Invalid AI output");
    } catch {
        return calculateAdvancedMatch(userProfile, projectDetails);
    }
};

/* ===============================
   Orchestration + Persistence
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


/* ===============================
   Backward Compatibility Helpers
================================ */

/**
 * Used by ai.controller.ts
 * Keeps old API stable
 */
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

/**
 * Used by ai.controller.ts
 */
export const getInsight = async (
    joinRequestId: string
) => {
    return prisma.aIInsight.findUnique({
        where: { joinRequestId },
    });
};

