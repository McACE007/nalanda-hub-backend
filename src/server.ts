import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./routes/auth.routes";
import contentRouter from "./routes/content.routes";
import userContentRouter from "./routes/user-content.routes";
import userRequestRouter from "./routes/user-request.routes";
import moderatorRequestRouter from "./routes/moderator-request.routes";

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

app.use("/api/auth", authRouter);
app.use("/api/user/contents", userContentRouter);
app.use("/api/user/requests", userRequestRouter);
app.use("/api/moderator/requests", moderatorRequestRouter);
app.use("/api/contents", contentRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
