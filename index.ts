import express from "express";
import jwt from "jsonwebtoken";
import cors from "cors";
import { signupHandler } from "./src/controller/authController";
import routesHandler from "./src/server";

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api',routesHandler);