import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.send("Backend API is running (TypeScript version)!");
});

// Example route
app.post("/generate", (req: Request, res: Response) => {
  const { prompt } = req.body;
  res.json({ message: `You sent: ${prompt}` });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`⚡ Server running on port ${PORT}`));
