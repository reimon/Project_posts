import express from "express";
import bodyParser from "body-parser";
import postRoutes from "./routes/post";
import commentRoutes from "./routes/comment";
import { initializeDatabase } from "./config/database";

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use("/api", postRoutes);
app.use("/api", commentRoutes);

initializeDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err: any) => {
    console.error("Failed to initialize database:", err);
  });

export default app;
