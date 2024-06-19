import { Router, Request, Response } from "express";
import Post from "../models/post";

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

// Get posts by user ID
router.get("/posts/user/:userid", async (req: Request, res: Response) => {
  const userid = parseInt(req.params.userid);
  try {
    const posts = await Post.findByUserId(userid);
    res.json(posts);
  } catch (err) {
    console.error("Error getting posts by user ID:", (err as Error).message);
    res.status(500).json({ message: (err as Error).message });
  }
});

// Get posts grouped by user
router.get("/posts/grouped-by-user", async (req: Request, res: Response) => {
  try {
    const posts = await Post.findAll();
    const groupedPosts = posts.reduce((acc: Record<number, any>, post) => {
      if (!acc[post.userid]) {
        acc[post.userid] = [];
      }
      acc[post.userid].push(post);
      return acc;
    }, {});
    res.json(groupedPosts);
  } catch (err) {
    console.error(
      "Error getting posts grouped by user:",
      (err as Error).message
    );
    res.status(500).json({ message: (err as Error).message });
  }
});

// Create a new post
router.post("/post", async (req: Request, res: Response) => {
  const {
    userid,
    location,
    latitude,
    longitude,
    imagens,
    eventType,
    Datatime,
  } = req.body;
  try {
    const lastPostId = await Post.findLastPostIdByUserId(userid);
    const post_id = lastPostId + 1;
    const post = new Post({
      id: "",
      post_id,
      userid,
      location,
      latitude,
      longitude,
      imagens,
      eventType,
      Datatime,
      likes: 0,
      likedBy: [],
    });
    const newPost = await post.save();
    res.status(201).json(newPost);
  } catch (err) {
    console.error("Error creating post:", (err as Error).message);
    res.status(400).json({ message: (err as Error).message });
  }
});

// Update a post
router.put("/post/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { location, latitude, longitude, eventType, likes, likedBy } = req.body;
  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    post.location = location;
    post.latitude = latitude;
    post.longitude = longitude;
    post.eventType = eventType;
    post.likes = likes;
    post.likedBy = likedBy;
    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (err) {
    console.error("Error updating post:", (err as Error).message);
    res.status(400).json({ message: (err as Error).message });
  }
});

// Delete a post
router.delete("/post/:post_id/:userid", async (req: Request, res: Response) => {
  const { post_id, userid } = req.params;
  try {
    const postIdNum = parseInt(post_id);
    const userIdNum = parseInt(userid);
    const posts = await Post.findByUserId(userIdNum);
    const postToDelete = posts.find((post) => post.post_id === postIdNum);
    if (!postToDelete) {
      return res.status(404).json({
        message: `Post with ID ${post_id} not found for user ${userid}`,
      });
    }
    await Post.deleteByPostId(postIdNum);
    res.json({ message: "Post deleted" });
  } catch (err) {
    console.error("Error deleting post:", (err as Error).message);
    res.status(500).json({ message: (err as Error).message });
  }
});

// Like a post
router.post("/post/:post_id/like", async (req: Request, res: Response) => {
  const { post_id } = req.params;
  const { userId } = req.body;
  try {
    const post = await Post.findById(post_id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const updatedPost = await post.incrementLikes(userId);
    res.json(updatedPost);
  } catch (err) {
    console.error("Error liking post:", (err as Error).message);
    res.status(400).json({ message: (err as Error).message });
  }
});

// Dislike a post
router.post("/post/:post_id/dislike", async (req: Request, res: Response) => {
  const { post_id } = req.params;
  const { userId } = req.body;
  try {
    const post = await Post.findById(post_id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const updatedPost = await post.decrementLikes(userId);
    res.json(updatedPost);
  } catch (err) {
    console.error("Error disliking post:", (err as Error).message);
    res.status(400).json({ message: (err as Error).message });
  }
});

export default router;
