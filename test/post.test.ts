import request from "supertest";
import express from "express";
import bodyParser from "body-parser";
import postRoutes from "../src/routes/post";
import commentRoutes from "../src/routes/comment";

// Cria uma instância do aplicativo Express e configura o middleware
const app = express();
app.use(bodyParser.json());
app.use("/api", postRoutes);
app.use("/api", commentRoutes);

describe("Comment API", () => {
  let postId: number;
  let commentId: string;

  // Antes de todos os testes, cria um post para associar comentários
  beforeAll(async () => {
    const postRes = await request(app)
      .post("/api/post")
      .send({
        userid: 2,
        location: "São Paulo, Av. Paulista, 400",
        latitude: -23.562928,
        longitude: -46.653232,
        imagens: [
          "https://example.com/image1.jpg",
          "https://example.com/image2.jpg",
        ],
        eventType: "Buraco na pista",
        Datatime: "2024-06-19T22:32:06.822Z",
        description: "Descrição do post",
      });
    postId = postRes.body.post_id;
  });

  // Teste para criar um novo comentário
  it("should create a new comment", async () => {
    const res = await request(app).post(`/api/comments/${postId}`).send({
      user_id: 2,
      text: "Este é um comentário de teste",
      Datatime: "2024-06-19T22:32:06.822Z",
    });
    expect(res.statusCode).toEqual(201); // Verifica se o status da resposta é 201 (Criado)
    expect(res.body).toHaveProperty("id"); // Verifica se a resposta possui a propriedade 'id'
    commentId = res.body.id; // Armazena o ID do comentário para os próximos testes
  });

  // Teste para obter todos os comentários de um post
  it("should get comments for a post", async () => {
    const res = await request(app).get(`/api/comments/${postId}`);
    expect(res.statusCode).toEqual(200); // Verifica se o status da resposta é 200 (OK)
    expect(res.body).toBeInstanceOf(Array); // Verifica se a resposta é uma instância de Array
  });

  // Teste para dar like em um comentário
  it("should like a comment", async () => {
    const res = await request(app)
      .post(`/api/comments/${commentId}/like`)
      .send({ userId: 2 });
    expect(res.statusCode).toEqual(200); // Verifica se o status da resposta é 200 (OK)
    expect(res.body.likes).toBeGreaterThan(0); // Verifica se o número de likes é maior que 0
  });

  // Teste para dar dislike em um comentário
  it("should dislike a comment", async () => {
    const res = await request(app)
      .post(`/api/comments/${commentId}/dislike`)
      .send({ userId: 2 });
    expect(res.statusCode).toEqual(200); // Verifica se o status da resposta é 200 (OK)
    expect(res.body.likes).toEqual(0); // Verifica se o número de likes é 0
  });
});
