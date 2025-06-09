import { Request, Response } from "express";
import { LoginRequest, RegisterRequest } from "../types";
import { prisma } from "../db";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import bcrypt from "bcrypt";

const MOD_PREFIX = "mod_";

export async function handleLogin(req: Request, res: Response) {
  try {
    const parsedRequest = LoginRequest.safeParse(req.body);

    if (!parsedRequest.success) {
      res.status(411).send({ message: "Invalid input given" });
      return;
    }

    let token;

    if (parsedRequest.data.email.startsWith(MOD_PREFIX)) {
      const mod = await prisma.moderator.findUnique({
        where: {
          email: parsedRequest.data.email.substring(MOD_PREFIX.length),
        },
      });

      if (!mod) {
        res.send({ message: "Invalid credentials" });
        return;
      }

      const isPasswordCorrect = await bcrypt.compare(
        parsedRequest.data.password,
        mod.password
      );
      if (!isPasswordCorrect) {
        res.send({ message: "Invalid credentials" });
        return;
      }

      token = jwt.sign({ userId: mod.id }, JWT_SECRET);
    } else {
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

      token = jwt.sign({ userId: user.id }, JWT_SECRET);
    }

    res.send({ message: "Login successful", token });
  } catch (e) {
    console.log(e);
    res.send({ message: "Something went wrong!" });
  }
}

export async function handleRegister(req: Request, res: Response) {
  try {
    const parsedRequest = RegisterRequest.safeParse(req.body);

    if (!parsedRequest.success) {
      res.status(411).send({ message: "Invalid input given" });
      return;
    }

    if (parsedRequest.data.password !== parsedRequest.data.confirmPassword) {
      res.send({ message: "Mismatch password" });
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: parsedRequest.data.email,
      },
    });

    if (existingUser) {
      res.send({ message: "Email is already used, Please try different one." });
      return;
    }

    const hashedPassword = await bcrypt.hash(parsedRequest.data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: parsedRequest.data.email,
        fullName: parsedRequest.data.fullName,
        password: hashedPassword,
        branchId: parsedRequest.data.branchId,
      },
    });

    res.send({ message: "Registered sucessfully" });
  } catch (e) {
    console.log(e);
    res.send({ message: "Something went wrong!" });
  }
}
