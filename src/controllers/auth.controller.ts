import { Request, Response } from "express";
import { prisma } from "../db";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../constants/global.constants";
import bcrypt from "bcrypt";
import { loginUserSchema, registerUserSchema } from "../schemas/user.schema";

export async function login(req: Request, res: Response) {
  try {
    const { success, error, data } = loginUserSchema.safeParse(req.body);

    if (!success) {
      res.status(400).send({ success: false, error });
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!user) {
      res.status(401).send({ success: false, error: "Invalid credentials" });
      return;
    }

    const isPasswordCorrect = await bcrypt.compare(
      data.password,
      user.password
    );

    if (!isPasswordCorrect) {
      res.status(401).send({ success: false, error: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        branchId: user.branchId,
        email: user.email,
        fullName: user.fullName,
      },
      JWT_SECRET
    );

    res.send({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.fullName,
        role: user.role,
        branchId: user.branchId,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).send({ success: false, error: "Falied to login user" });
  }
}

export async function register(req: Request, res: Response) {
  try {
    const { success, error, data } = registerUserSchema.safeParse(req.body);

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
    res.status(201).send({
      success: true,
      message: "Registered sucessfully",
      userId: user.id,
    });
  } catch (e) {
    console.error(e);
    res.status(500).send({ success: false, error: "Failed to register user" });
  }
}
