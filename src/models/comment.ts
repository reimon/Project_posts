import { client, databaseId, containerId } from "../config/database";
import { Container } from "@azure/cosmos";
import { v4 as uuidv4 } from "uuid"; // Importando a biblioteca uuid

const container: Container = client.database(databaseId).container(containerId);

export interface CommentData {
  id: string;
  comment_id: number;
  post_id: number;
  user_id: number;
  content: string;
  datetime: string;
}

class Comment {
  id: string;
  comment_id: number;
  post_id: number;
  user_id: number;
  content: string;
  datetime: string;

  constructor(data: CommentData) {
    this.id = uuidv4(); // Gerando um ID único
    this.comment_id = data.comment_id;
    this.post_id = data.post_id;
    this.user_id = data.user_id;
    this.content = data.content;
    this.datetime = data.datetime;
  }

  static async findByPostId(post_id: number): Promise<CommentData[]> {
    const querySpec = {
      query: "SELECT * FROM c WHERE c.post_id = @post_id",
      parameters: [{ name: "@post_id", value: post_id }],
    };
    const { resources: comments } = await container.items
      .query(querySpec)
      .fetchAll();
    return comments;
  }

  static async findLastCommentIdByPostId(post_id: number): Promise<number> {
    const querySpec = {
      query: "SELECT VALUE MAX(c.comment_id) FROM c WHERE c.post_id = @post_id",
      parameters: [{ name: "@post_id", value: post_id }],
    };
    const { resources } = await container.items.query(querySpec).fetchAll();
    return resources[0] || 0;
  }

  async save(): Promise<CommentData> {
    const { resource: savedComment } = await container.items.upsert(this);
    if (!savedComment) {
      throw new Error("Failed to save comment");
    }

    const commentData: CommentData = {
      id: savedComment.id,
      comment_id: savedComment.comment_id,
      post_id: savedComment.post_id,
      user_id: savedComment.user_id,
      content: savedComment.content,
      datetime: savedComment.datetime,
    };

    return commentData;
  }

  static async deleteById(id: string): Promise<void> {
    try {
      const { resource } = await container
        .item(id, undefined)
        .read<CommentData>();
      if (!resource) {
        throw new Error(`Comment with ID ${id} not found`);
      }
      await container.item(id, undefined).delete();
    } catch (err) {
      console.error("Error deleting comment:", err);
      throw new Error(
        `Failed to delete comment with ID ${id}: ${(err as Error).message}`
      );
    }
  }
}

export default Comment;
