import 'dotenv/config';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import express from 'express';
import type { Request, Response } from 'express';
import { signinSchema, signupSchema } from '../types/zod';
import { prisma } from '../../lib/prisma';
import bcrypt from 'bcryptjs';

export interface AuthRequest extends Request {
    user?: {
        userId: string,
        role: 'client' | 'freelancer',
        email: string
    }
}
export interface Jwt_Payload {
    userId: string,
    role: 'client' | 'freelancer',
    email: string
}

const router = express.Router();
router.post('/signup', async (req: Request, res: Response) => {
    const parsedBody = signupSchema.safeParse(req.body);
    if (!parsedBody.success) {
        return res.status(400).json({
            "success": false,
            "data": null,
            "error": "INVALID_REQUEST"
        })
    }
    const { name, email, password, role, bio = null, skills, hourlyRate = null } = parsedBody.data;
    try {
        const isExistingUser = await prisma.user.findUnique({ where: { email } });
        if (isExistingUser) {
            return res.status(400).json({
                "success": false,
                "data": null,
                "error": "EMAIL_ALREADY_EXISTS"
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                bio,
                skills,
                hourly_rate: hourlyRate
            }
        })
    } catch (error) {
        return res.status(400).json({
            "success": false,
            "data": null,
            "error": "SIGNUP FAILED"
        })
    }

})
router.post('/login', async (req: Request, res: Response) => {
    const parsedSigninBody = signinSchema.safeParse(req.body);
    if (!parsedSigninBody) {
        return res.status(400).json({
            "success": false,
            "data": null,
            "error": "INVALID_REQUEST"
        })
    }
    const { email, password } = parsedSigninBody.data!;
    try {
        const checkUser = await prisma.user.findUnique({
            where: {
                email
            }
        })
        if (!checkUser) {
            return res.status(401).json({
                "success": false,
                "data": null,
                "error": "INVALID_CREDENTIALS"
            })
        }
        const verifyPassword = await bcrypt.compare(password, checkUser.password);
        if (!verifyPassword) {
            return res.status(401).json({
                "success": false,
                "data": null,
                "error": "INVALID_CREDENTIALS"
            })
        }
        const token = jwt.sign({ userId: checkUser.id, role: checkUser.role, email: checkUser.email }, process.env.JWT_SECRET!);
        return res.status(200).json({
            "success": true,
            "data": {
                "token": token,
                "user": {
                    "id": checkUser.id,
                    "name": checkUser.name,
                    "email": checkUser.email,
                    "role": checkUser.role
                }
            },
            "error": null
        })
    } catch (error) {
        return res.status(400).json({
            "success": false,
            "data": null,
            "error": "INVALID_REQUEST"
        })
    }
})
export default router;
