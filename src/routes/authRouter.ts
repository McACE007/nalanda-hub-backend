import { Router } from "express";
import { handleLogin, handleRegister } from "../handlers/authHandler";

const authRouter = Router();

authRouter.get("/login", handleLogin);
authRouter.get("/register", handleRegister);

export default authRouter;
