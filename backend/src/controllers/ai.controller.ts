import { Response } from "express";
import { AuthRequest } from "../types/express";
import * as aiService from "../services/ai.service";
import { MatchResult } from "../services/ai.service";

/**
 * Create AI Insight (Manual or System Triggered)
 */
export const create = async (req: AuthRequest, res: Response) => {
    try {
        const { joinRequestId, result } = req.body as {
            joinRequestId: string;
            result: MatchResult;
        };

        if (!joinRequestId || !result) {
            return res.status(400).json({
                message: "joinRequestId and result are required"
            });
        }

        const insight = await aiService.createInsight(joinRequestId, result);
        return res.status(201).json(insight);

    } catch (error: any) {
        console.error("AI Insight Create Error:", error);
        return res.status(500).json({ message: error.message });
    }
};

/**
 * Get AI Insight by JoinRequest ID
 */
export const get = async (req: AuthRequest, res: Response) => {
    try {
        const { joinRequestId } = req.params;

        if (!joinRequestId) {
            return res.status(400).json({
                message: "joinRequestId param is required"
            });
        }

        const insight = await aiService.getInsight(joinRequestId);

        if (!insight) {
            return res.status(404).json({ message: "AI Insight not found" });
        }

        return res.json(insight);

    } catch (error: any) {
        console.error("AI Insight Get Error:", error);
        return res.status(500).json({ message: error.message });
    }
};
