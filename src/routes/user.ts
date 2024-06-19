import { Router, Request, Response } from "express";
import Post from "../models/post";

const router = Router();

// Delete user and their posts
router.delete("/user/:userid", async (req: Request, res: Response) => {
  try {
    const userid = parseInt(req.params.userid);

    // Delete user's posts
    await Post.deleteByUserId(userid);

    // Add logic to delete the user from the database if you have a user model
    // await User.deleteById(userid);

    res.json({ message: `User ${userid} and their posts deleted` });
  } catch (err) {
    console.error(
      "Error deleting user and their posts:",
      (err as Error).message
    );
    res.status(500).json({ message: (err as Error).message });
  }
});

export default router;
