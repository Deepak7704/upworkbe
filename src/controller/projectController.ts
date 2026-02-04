import type { AuthRequest } from "./authController";
import { Router } from "express";
import express from "express";
import type { Response } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { projectSchema } from "../types/zod";
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
router.get('/',authMiddleware,async(req:AuthRequest,res:Response)=>{
    const {category,minBudget,maxBudget,status,skills} = req.query;
    const specificProject = await prisma.projects.findUnique
    const response = await prisma.projects.findMany();

})
export default router;