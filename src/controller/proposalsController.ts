import { Router } from "express";
import express from 'express';
import type { Response } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { prisma } from '../../lib/prisma';
import type { AuthRequest } from "./authController";
import { proposalSchema } from "../types/zod";
import { Decimal } from "@prisma/client/runtime/client";
const router = express.Router();
router.put('/proposalId/accept', authMiddleware, async (req: AuthRequest, res: Response) => {
    //this route helps to accept a propsal from a freelancer
    //only client have the access to accept a proposal
    if (req.user?.role === 'freelancer') {
        return res.status(401).json({
            "success": false,
            "data": null,
            "error": "FORBIDDEN"
        })
    }
    const proposalId = req.params.proposalId as string;
    // only the project owner should be able to access this route
    //check user
    const propsal = await prisma.proposals.findUnique({
        where: {
            id: proposalId
        }, select: {
            id: true,
            status: true,
            proposed_price: true
            ,
            project: {
                select: {
                    client_id: true
                }
            }
        }
    })
    //check whether the proposal exists or not 
    if (!propsal?.id) {
        return res.status(404).json({
            "success": false,
            "data": null,
            "error": "PROPOSAL_NOT_FOUND"
        })
    }
    if (req.user?.userId !== propsal?.project.client_id) {
        return res.status(403).json({
            "success": false,
            "data": null,
            "error": "FORBIDDEN"
        })
    }
    if (propsal?.status === 'accepted' || propsal?.status === 'rejected') {
        return res.status(400).json({
            "success": false,
            "data": null,
            "error": "PROPOSAL_ALREADY_PROCESSED"
        })
    }
    const isValidSchema = proposalSchema.safeParse(req.body);
    if (!isValidSchema.success) {
        return res.status(400).json({
            "success": false,
            "data": null,
            "error": "INVALID_REQUEST"
        })
    }
    const { milestones } = isValidSchema.data;
    const totalAmount = milestones.reduce((sum, milestone) => sum + milestone.amount, 0);
    if (new Decimal(totalAmount) != propsal.proposed_price) {
        return res.status(400).json({
            "success": false,
            "data": null,
            "error": "INVALID_MILESTONE_AMOUNTS"
        })
    }


})
export default router;