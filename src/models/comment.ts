import { v4 as uuidv4 } from "uuid";
import { client, databaseId, containerId } from "../config/database";
import { Container } from "@azure/cosmos";

const container: Container = client.database(databaseId).container(containerId);

export interface CommentData {
  id: string;
  post_id: number;
  user_id: number;
  text: string;
  Datatime: string;
  likes: number;
  likedBy: number[];
}

class Comment {
  id: string;
  post_id: number;
  user_id: number;
  text: string;
  Datatime: string;
  likes: number;
  likedBy: number[];

  constructor(data: CommentData) {
    this.id = data.id;
    this.post_id = data.post_id;
    this.user_id = data.user_id;
    this.text = data.text;
    this.Datatime = data.Datatime;
    this.likes = data.likes;
    this.likedBy = data.likedBy;
  }

  static async findByPostId(post_id: number): Promise<Comment[]> {
    const querySpec = {
      query:
        'SELECT * FROM c WHERE c.post_id = @post_id AND c.type = "comment"',
      parameters: [{ name: "@post_id", value: post_id }],
    };
    const { resources: comments } = await container.items
      .query(querySpec)
      .fetchAll();
    return comments.map((comment) => new Comment(comment));
  }

  static async findById(id: string): Promise<Comment | null> {
    const { resource: comment } = await container
      .item(id, undefined)
      .read<CommentData>();
    return comment ? new Comment(comment) : null;
  }

  async save(): Promise<CommentData> {
    this.id = this.id || uuidv4();
    const { resource: savedComment } = await container.items.upsert(this);
    if (!savedComment) {
      throw new Error("Failed to save comment");
    }

    return {
      id: savedComment.id,
      post_id: savedComment.post_id,
      user_id: savedComment.user_id,
      text: savedComment.text,
      Datatime: savedComment.Datatime,
      likes: savedComment.likes,
      likedBy: savedComment.likedBy,
    } as CommentData;
  }

  async incrementLikes(userId: number): Promise<CommentData> {
    if (!this.likedBy.includes(userId)) {
      this.likes += 1;
      this.likedBy.push(userId);
      return await this.save();
    }
    throw new Error("User already liked this comment");
  }

  async decrementLikes(userId: number): Promise<CommentData> {
    const index = this.likedBy.indexOf(userId);
    if (index !== -1) {
      this.likes -= 1;
      this.likedBy.splice(index, 1);
      return await this.save();
    }
    throw new Error("User has not liked this comment");
  }
}

export default Comment;
