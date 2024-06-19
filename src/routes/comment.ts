import { Router, Request, Response } from "express";
import Post from "../models/post";
import Comment from "../models/comment";

const router = Router();

// Get comments for a post
router.get("/comments/:post_id", async (req: Request, res: Response) => {
  const { post_id } = req.params;
  try {
    const comments = await Comment.findByPostId(parseInt(post_id));
    res.json(comments);
  } catch (err) {
    console.error("Error getting comments:", (err as Error).message);
    res.status(500).json({ message: (err as Error).message });
  }
});

// Add a comment to a post
router.post("/comments/:post_id", async (req: Request, res: Response) => {
  const { post_id } = req.params;
  const { user_id, text, Datatime } = req.body;
  try {
    const post = await Post.findByPostId(parseInt(post_id));
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const comment = new Comment({
      id: "",
      post_id: parseInt(post_id),
      user_id,
      text,
      Datatime,
      likes: 0,
      likedBy: [],
    });
    const newComment = await comment.save();
    res.status(201).json(newComment);
  } catch (err) {
    console.error("Error adding comment:", (err as Error).message);
    res.status(400).json({ message: (err as Error).message });
  }
});

// Like a comment
router.post(
  "/comments/:comment_id/like",
  async (req: Request, res: Response) => {
    const { comment_id } = req.params;
    const { userId } = req.body;
    try {
      const comment = await Comment.findById(comment_id);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      const updatedComment = await comment.incrementLikes(userId);
      res.json(updatedComment);
    } catch (err) {
      console.error("Error liking comment:", (err as Error).message);
      res.status(400).json({ message: (err as Error).message });
    }
  }
);

// Dislike a comment
router.post(
  "/comments/:comment_id/dislike",
  async (req: Request, res: Response) => {
    const { comment_id } = req.params;
    const { userId } = req.body;
    try {
      const comment = await Comment.findById(comment_id);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      const updatedComment = await comment.decrementLikes(userId);
      res.json(updatedComment);
    } catch (err) {
      console.error("Error disliking comment:", (err as Error).message);
      res.status(400).json({ message: (err as Error).message });
    }
  }
);

export default router;
