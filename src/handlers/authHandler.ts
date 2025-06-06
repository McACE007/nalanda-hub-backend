import { Request, Response } from "express";
import { LoginRequest, RegisterRequest } from "../types";

export async function handleLogin(req: Request, res: Response) {
  const parsedRequest = LoginRequest.safeParse(req.body);

  if (!parsedRequest.success) {
    res.status(411).send({ message: "Invalid input given" });
    return;
  }

  //kuch kuch log
  res.send({ message: "Login successful" });
}

export async function handleRegister(req: Request, res: Response) {
  const parsedRequest = RegisterRequest.safeParse(req.body);

  if (!parsedRequest.success) {
    res.status(411).send({ message: "Invalid input given" });
    return;
  }

  res.send({ message: "Registered sucessfully" });
}
