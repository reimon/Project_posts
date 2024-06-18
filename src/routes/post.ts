import { Router, Request, Response } from "express";
import Post, { PostData } from "../models/post";

const router = Router();

// Get all posts
router.get("/posts", async (req: Request, res: Response) => {
  try {
    const posts = await Post.findAll();
    res.json(posts);
  } catch (err) {
    console.error("Error getting posts:", (err as Error).message);
    res.status(500).json({ message: (err as Error).message });
  }
});

// Create a new post
router.post("/post", async (req: Request, res: Response) => {
  const post = new Post(req.body);
  try {
    const newPost = await post.save();
    res.status(201).json(newPost);
  } catch (err) {
    console.error("Error creating post:", (err as Error).message);
    res.status(400).json({ message: (err as Error).message });
  }
});

// Update a post
router.put("/post/:id", async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    Object.assign(post, req.body);

    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (err) {
    console.error("Error updating post:", (err as Error).message);
    res.status(400).json({ message: (err as Error).message });
  }
});

// Delete a post
router.delete("/post/:id", async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    await post.remove();
    res.json({ message: "Post deleted" });
  } catch (err) {
    console.error("Error deleting post:", (err as Error).message);
    res.status(500).json({ message: (err as Error).message });
  }
});

// Like a post
router.post("/post/:id/like", async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const updatedPost = await post.incrementLikes();
    res.json(updatedPost);
  } catch (err) {
    console.error("Error liking post:", (err as Error).message);
    res.status(500).json({ message: (err as Error).message });
  }
});

export default router;
