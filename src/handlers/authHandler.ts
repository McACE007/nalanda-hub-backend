import { Request, Response } from "express";
import { LoginRequest, RegisterRequest } from "../types";
import { prisma } from "../db";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import bcrypt from "bcrypt";

export async function handleLogin(req: Request, res: Response) {
  try {
    const parsedRequest = LoginRequest.safeParse(req.body);

    if (!parsedRequest.success) {
      res.status(411).send({ message: "Invalid input given" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        email: parsedRequest.data.email,
      },
    });

    if (!user) {
      res.send({ message: "Invalid credentials" });
      return;
    }

    const isPasswordCorrect = await bcrypt.compare(
      parsedRequest.data.password,
      user.password
    );

    if (!isPasswordCorrect) {
      res.send({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, userRole: user.role },
      JWT_SECRET
    );

    res.send({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.fullName,
        role: user.role,
      },
    });
  } catch (e) {
    console.log(e);
    res.send({ message: "Something went wrong!" });
  }
}

export async function handleRegister(req: Request, res: Response) {
  try {
    const { success, error, data } = RegisterRequest.safeParse(req.body);

    if (!success) {
      console.error(error);
      res.status(400).send({ success: false, error });
      return;
    }

    if (data.password !== data.confirmPassword) {
      res.send({ success: false, error: "Passwords did not match" });
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (existingUser) {
      res.status(409).send({
        success: false,
        error: "Email is already used, Please try different one.",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        fullName: data.fullName,
        password: hashedPassword,
        branchId: data.branchId,
      },
    });
    res
      .status(201)
      .send({
        success: true,
        message: "Registered sucessfully",
        userId: user.id,
      });
  } catch (e) {
    console.error(e);
    res.status(500).send({ success: false, error: "Failed to register user" });
  }
}
