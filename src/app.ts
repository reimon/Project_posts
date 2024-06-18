import express from "express";
import path from "path";
import bodyParser from "body-parser";
import postRouter from "./routes/post";

const app = express();

// Middleware setup
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/api", postRouter);

// Error handling
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err["status"] = 404;
  next(err);
});

app.use((err, req, res) => {
  res.status(err["status"] || 500);
  res.json({
    message: err.message,
    error: req.app.get("env") === "development" ? err : {},
  });
});

export default app;
