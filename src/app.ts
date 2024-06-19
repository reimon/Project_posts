import express, { Application, Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import postRoutes from "./routes/post";
import commentRoutes from "./routes/comment"; // Importando as rotas de comentários
import { initializeDatabase } from "./config/database";

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Inicializando o banco de dados
initializeDatabase()
  .then(() => {
    console.log("Database connection successful");

    // Registrando as rotas
    app.use("/api", postRoutes);
    app.use("/api", commentRoutes); // Registrando as rotas de comentários

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", (err as Error).message);
  });

// Middleware para lidar com erros
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

export default app;
