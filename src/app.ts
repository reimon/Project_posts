import express, { Request, Response, NextFunction } from "express";
import path from "path";
import bodyParser from "body-parser";
import postRouter from "./routes/post";
import { testConnection } from "./config/database";

const app = express();

// Middleware setup
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/api", postRouter);

// Custom Error type
interface CustomError extends Error {
  status?: number;
}

// Error handling
app.use((req: Request, res: Response, next: NextFunction) => {
  const err: CustomError = new Error("Not Found");
  err.status = 404;
  next(err);
});

app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
  console.error(err.message); // Log the error message
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: req.app.get("env") === "development" ? err : {},
  });
});

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await testConnection();
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start the server:", (error as Error).message);
  }
}

startServer();

export default app;
