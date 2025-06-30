import express, { NextFunction, Request, Response } from "express";
import userRouter from "./routes/userRouter";
import authRouter from "./routes/authRouter";
import modRouter from "./routes/modRouter";
import contentRouter from "./routes/contentRouter";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://127.0.0.1:5173",
  })
);

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/mod", modRouter);
app.use("/api/contents", contentRouter);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
