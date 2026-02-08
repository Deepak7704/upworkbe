import { Router } from "express";
import express from 'express';
import authHandler from "./controller/authController"
import servicesHandler from "./controller/serviceController";
import projectHandler from "./controller/projectController";
import proposalsHandler from './controller/proposalsController'
const router = express.Router();
router.use('/auth',authHandler);
router.use('/services',servicesHandler);
router.use('/projects',projectHandler);
router.use('/proposals',proposalsHandler);
export default router;