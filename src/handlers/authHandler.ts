import { Request, Response } from "express";

export async function handleLogin(req: Request, res: Response) {
  res.send("Login Hanlder");
}

export async function handleRegister(req: Request, res: Response) {
  res.send("Register Hanlder");
}
