import type { AuthRequest } from "./authController";
import { Router } from "express";
import express from "express";
import type { Response } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { projectSchema, coverletterSchema } from "../types/zod";
import { prisma } from "../../lib/prisma";

const router = express.Router();
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    const body = projectSchema.safeParse(req.body);
    if (!body.success) {
        return res.status(400).json({
            "success": false,
            "data": null,
            "error": "INVALID_REQUEST"
        })
    }
    const { title, description, category, budget_min, budget_max, deadline, required_skills } = body.data;
    //create project
    const userEmail = req.user?.email;
    try {
        const checkUser = await prisma.user.findUnique({
            where: {
                email: userEmail
            }
        });
        if (checkUser?.role === 'freelancer') {
            return res.status(403).json({
                "success": false,
                "data": null,
                "error": "FORBIDDEN"
            })
        }
        //create a project
        const client_id = req.user?.userId!;
        const currentDate = new Date();
        if (deadline < currentDate) {
            return res.status(400).json({
                "success": false,
                "data": null,
                "error": "INVALID_REQUEST"
            })
        }
        if (budget_min > budget_max) {
            return res.status(400).json({
                "success": false,
                "data": null,
                "error": "INVALID_REQUEST"
            })
        }
        const project = await prisma.projects.create({
            data: {
                client_id,
                title,
                description,
                category,
                budget_min,
                budget_max,
                deadline,
                required_skills
            }
        });
        return res.status(201).json({
            "success": true,
            "data": {
                "id": project.id,
                "clientId": project.client_id,
                "title": project.title,
                "description": project.description,
                "category": project.category,
                "budgetMin": project.budget_min,
                "budgetMax": project.budget_max,
                "deadline": project.deadline,
                "status": project.status,
                "requiredSkills": project.required_skills,
                "createdAt": project.created_at
            },
            "error": null
        })

    } catch (error) {
        return res.status(400).json({
            "success": false,
            "data": null,
            "error": "creating a project failed"
        })
    }
});
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    const { category, minBudget, maxBudget, status, required_skills } = req.query;
    const where: any = {};
    if (category) {
        where.category = {
            equals: category,
            mode: "insensitive"
        };
    }
    if (status) {
        where.status = status;
    }
    if (minBudget) {
        where.min_budget = {
            gte: Number(minBudget),
        };
    }
    if (maxBudget) {
        where.max_budget = {
            lte: Number(maxBudget)
        };
    }
    if (required_skills) {
        where.required_skills = {
            hasSome: String(required_skills).split(",").map(s => s.trim()),
        };
    }
    if (Object.keys(where).length === 0) {
        where.status = "open";
    }
    try {
        const projects = await prisma.projects.findMany({
            where,
            include: {
                client: {
                    select: { name: true }
                },
                _count: {
                    select: { proposals: true }
                },
            },
            orderBy: {
                created_at: 'desc',
            }
        });
        res.status(200).json({
            success: true,
            "data": projects.map((p) => ({
                "id": p.id,
                "clientId": p.client_id,
                "clientName": p.client.name,
                "title": p.title,
                "description": p.description,
                "category": p.category,
                "budgetMin": p.budget_min,
                "budgetMax": p.budget_max,
                "deadline": p.deadline,
                "status": p.status,
                "requiredSkills": p.required_skills,
                "createdAt": p.created_at,
                "proposalCount": p._count.proposals
            }))
        })
    } catch {
        return res.status(400).json({
            "success": false,
            "data": null,
            "error": "Failed to get projects"
        })
    }
});
router.post('/:projectId/proposals', authMiddleware, async (req: AuthRequest, res: Response) => {
    const body = coverletterSchema.safeParse(req.body);
    if (!body.success) {
        return res.status(400).json({
            "success": false,
            "data": null,
            "error": "INVALID_REQUEST"
        })
    }
    const { cover_letter, proposed_price, estimated_duration } = body.data
    const projectId = req.params.projectId as string;
    if (!projectId) {
        return res.status(400).json({
            "success": false,
            "data": null,
            "error": "INVALID_REQUEST"
        })
    }
    if (req.user?.role === 'client') {
        return res.status(403).json({
            "success": false,
            "data": null,
            "error": "FORBIDDEN"
        })
    }
    const isValidProject = await prisma.projects.findUnique({
        where: {
            id: projectId
        },
        select: {
            status: true
        }
    });
    if (!isValidProject) {
        return res.status(404).json({
            "success": false,
            "data": null,
            "error": "PROJECT_NOT_FOUND"
        })
    }
    if (isValidProject.status != "open") {
        return res.status(400).json({
            "success": false,
            "data": null,
            "error": "PROJECT_NOT_OPEN"
        })
    }
    //check if a proposal exists for the same project id 
    const checkProposal = await prisma.proposals.findFirst({
        where: {
            project_id: projectId,
            freelancer_id: req.user?.userId
        }
    });
    if (checkProposal) {
        return res.status(400).json({
            "success": false,
            "data": null,
            "error": "PROPOSAL_ALREADY_EXISTS"
        })
    }
    //create a proposal with the given details
    const newProposal = await prisma.proposals.create({
        data: {
            project_id: projectId,
            freelancer_id: req.user?.userId!,
            cover_letter: cover_letter,
            proposed_price: proposed_price,
            estimated_duration: estimated_duration
        }
    });
    return res.status(201).json({
        "success": true,
        "data": {
            "id": newProposal.id,
            "projectId": newProposal.project_id,
            "freelancerId": newProposal.freelancer_id,
            "coverLetter": newProposal.cover_letter,
            "proposedPrice": newProposal.proposed_price,
            "estimatedDuration": newProposal.estimated_duration,
            "status": newProposal.status,
            "submittedAt": newProposal.submitted_at
        },
        "error": null
    })
})
export default router;