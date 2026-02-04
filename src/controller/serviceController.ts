import type { AuthRequest } from "./authController";
import { Router } from "express";
import express from "express";
import type { Response } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { serveicesSchema } from "../types/zod";
import { prisma } from "../../lib/prisma";
import { id } from "zod/locales";
const router = express.Router();
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    const body = serveicesSchema.safeParse(req.body);
    if (!body.success) {
        return res.status(400).json({
            "success": false,
            "data": null,
            "error": "INVALID_REQUEST"
        })
    }
    const { title, description, category, pricing_type, price, delivery_days } = body.data;
    //create services
    const userEmail = req.user?.email;
    try {
        const checkUser = await prisma.user.findUnique({
            where: {
                email: userEmail
            }
        });
        if (checkUser?.role === 'client') {
            return res.status(403).json({
                "success": false,
                "data": null,
                "error": "FORBIDDEN"
            })
        }
        //create a service
        const freelancer_id = req.user?.userId!;
        const service = await prisma.services.create({
            data: {
                freelancer_id,
                title,
                description,
                category,
                pricing_type,
                price,
                delivery_days,
            }
        });
        return res.status(201).json({
            "success": true,
            "data": {
                "id": service.id,
                "freelancerId": service.freelancer_id,
                "title": service.title,
                "description": service.description,
                "category": service.category,
                "pricingType": service.pricing_type,
                "price": service.price,
                "deliveryDays": service.delivery_days,
                "rating": service.rating,
                "totalReviews": service.total_reviews
            },
            "error": null
        })

    } catch (error) {
        return res.status(400).json({
            "success": false,
            "data": null,
            "error": "creating a service failed"
        })
    }


})
export default router;