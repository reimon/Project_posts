import request from "supertest";
import express from "express";
import bodyParser from "body-parser";
import postRoutes from "../src/routes/post";
import commentRoutes from "../src/routes/comment";

const app = express();
app.use(bodyParser.json());
app.use("/api", postRoutes);
app.use("/api", commentRoutes);

describe("Post API", () => {
  let postId: number;

  it("should create a new post", async () => {
    const res = await request(app)
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
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("post_id");
    postId = res.body.post_id;
  });

  it("should get all posts", async () => {
    const res = await request(app).get("/api/posts");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it("should get post by user ID", async () => {
    const res = await request(app).get("/api/posts/user/2");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it("should like a post", async () => {
    const res = await request(app)
      .post(`/api/post/${postId}/like`)
      .send({ userId: 2 });
    expect(res.statusCode).toEqual(200);
    expect(res.body.likes).toBeGreaterThan(0);
  });

  it("should dislike a post", async () => {
    const res = await request(app)
      .post(`/api/post/${postId}/dislike`)
      .send({ userId: 2 });
    expect(res.statusCode).toEqual(200);
    expect(res.body.likes).toEqual(0);
  });

  it("should delete a post", async () => {
    const res = await request(app).delete(`/api/post/${postId}/2`);
    expect(res.statusCode).toEqual(200);
  });
});
