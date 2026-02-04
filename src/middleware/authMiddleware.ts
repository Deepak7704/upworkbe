import 'dotenv/config';
import jwt from 'jsonwebtoken';
import type { Jwt_Payload } from '../controller/authController';
import type { AuthRequest } from '../controller/authController';
import type { NextFunction } from 'express';
import type { Response } from 'express';

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;
    if (!token || token.startsWith('Bearer ')) {
        return res.status(400).json({
            "success": false,
            "data": null,
            "error": "INVALID_REQUEST"
        })
    }
    const validToken = token.split(" ")[1];
    if(!validToken) {
        return res.status(400).json({
            "success": false,
            "data": null,
            "error": "INVALID_REQUEST"
        })
    }
    const decoded = jwt.verify(validToken,process.env.JWT_SECRET!) as Jwt_Payload
    req.user = decoded;
    next();
}