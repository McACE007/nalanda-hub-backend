import { Router } from "express";
import { handleLogin, handleRegister } from "../handlers/authHandler";

const authRouter = Router();

authRouter.post("/login", handleLogin);
authRouter.post("/register", handleRegister);

export default authRouter;
