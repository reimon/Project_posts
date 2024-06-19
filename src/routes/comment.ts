import { Router, Request, Response } from "express";
import Comment, { CommentData } from "../models/comment";

const router = Router();

// Get comments by post_id
router.get("/comments/:post_id", async (req: Request, res: Response) => {
  try {
    const post_id = parseInt(req.params.post_id);
    const comments = await Comment.findByPostId(post_id);
    res.json(comments);
  } catch (err) {
    console.error("Error getting comments:", (err as Error).message);
    res.status(500).json({ message: (err as Error).message });
  }
});

// Create a new comment
router.post("/comments", async (req: Request, res: Response) => {
  const { post_id, user_id, content } = req.body;
  try {
    const lastCommentId = await Comment.findLastCommentIdByPostId(post_id);
    const comment_id = lastCommentId + 1;
    const datetime = new Date().toISOString();
    const comment = new Comment({
      id: "",
      comment_id,
      post_id,
      user_id,
      content,
      datetime,
    });
    const newComment = await comment.save();
    res.status(201).json(newComment);
  } catch (err) {
    console.error("Error creating comment:", (err as Error).message);
    res.status(400).json({ message: (err as Error).message });
  }
});

// Delete a comment
router.delete("/comments/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    await Comment.deleteById(id);
    res.json({ message: "Comment deleted" });
  } catch (err) {
    console.error("Error deleting comment:", (err as Error).message);
    res.status(500).json({ message: (err as Error).message });
  }
});

export default router;
