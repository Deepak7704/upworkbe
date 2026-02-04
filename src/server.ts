import { Router } from "express";
import express from 'express';
import authHandler from "./controller/authController"
const router = express.Router();
router.use('/auth',authHandler);
router.use('/services',servicesHandler);
export default router;