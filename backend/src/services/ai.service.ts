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

    const userTokens = new Set([
        ...user.skills,
        ...tokenize(user.title),
        ...tokenize(user.bio),
    ]);

    const projectTokens = new Set([
        ...project.requiredSkills,
        ...tokenize(project.title),
        ...tokenize(project.shortDescription),
    ]);

    const matched = Array.from(projectTokens).filter(t => userTokens.has(t));
    const unmatched = Array.from(projectTokens).filter(t => !userTokens.has(t));

    /* ---------- Skill Match ---------- */
    const skillScore =
        (matched.length / Math.max(projectTokens.size, 1)) * 60;

    /* ---------- Semantic Overlap ---------- */
    const semanticScore =
        (matched.length > 0 ? 1 : 0) * 20;

    /* ---------- Domain Awareness ---------- */
    let domainScore = 0;
    if (project.category && user.title) {
        if (
            project.category.toLowerCase().includes("data") &&
            user.title.toLowerCase().includes("data")
        ) {
            domainScore = 15;
        } else if (
            project.category.toLowerCase().includes("web") &&
            user.skills.some(s =>
                ["sql", "python", "api"].includes(s)
            )
        ) {
            domainScore = 8; // transferable
        }
    }

    /* ---------- Transferable Skills Bonus ---------- */
    const transferableSkills = ["python", "sql", "analysis", "logic"];
    const transferableScore =
        user.skills.some(s => transferableSkills.includes(s)) ? 5 : 0;

    let rawScore =
        skillScore +
        semanticScore +
        domainScore +
        transferableScore;

    /* ---------- Floor & Cap ---------- */
    rawScore = Math.max(rawScore, 10);
    rawScore = Math.min(rawScore, 100);

    /* ---------- Reason ---------- */
    let reason = `AI Match Evaluation for ${user.name}:\n`;
    reason += `- Matched keywords: ${matched.slice(0, 8).join(", ") || "None"}\n`;
    reason += `- Missing keywords: ${unmatched.slice(0, 8).join(", ") || "None"}\n`;

    if (domainScore > 0 && domainScore < 15) {
        reason += `- Note: Different primary domain, but transferable skills detected.\n`;
    }

    if (rawScore >= 80) {
        reason += `- Overall assessment: Excellent fit.`;
    } else if (rawScore >= 50) {
        reason += `- Overall assessment: Good potential match.`;
    } else {
        reason += `- Overall assessment: Partial match with learning potential.`;
    }

    return {
        score: Math.round(rawScore),
        reason,
        matchedSkills: matched,
        unmatchedSkills: unmatched,
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

