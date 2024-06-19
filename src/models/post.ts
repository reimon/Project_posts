import { client, databaseId, containerId } from "../config/database";
import { Container } from "@azure/cosmos";

const container: Container = client.database(databaseId).container(containerId);

export interface PostData {
  id: string;
  post_id: number;
  userid: number;
  location: string;
  latitude: number;
  longitude: number;
  imagens: string[];
  eventType: string;
  Datatime: string;
  likes: number;
  likedBy: number[];
}

class Post {
  id: string;
  post_id: number;
  userid: number;
  location: string;
  latitude: number;
  longitude: number;
  imagens: string[];
  eventType: string;
  Datatime: string;
  likes: number;
  likedBy: number[];

  constructor(data: PostData) {
    this.id = data.id;
    this.post_id = data.post_id;
    this.userid = data.userid;
    this.location = data.location;
    this.latitude = data.latitude;
    this.longitude = data.longitude;
    this.imagens = data.imagens;
    this.eventType = data.eventType;
    this.Datatime = data.Datatime;
    this.likes = data.likes || 0;
    this.likedBy = data.likedBy || [];
  }

  static async findAll(): Promise<PostData[]> {
    const { resources: posts } = await container.items
      .query("SELECT * FROM c")
      .fetchAll();
    return posts;
  }

  static async findById(id: string): Promise<Post | null> {
    try {
      const { resource } = await container.item(id, id).read<PostData>();
      if (!resource) {
        return null;
      }
      return new Post(resource);
    } catch (err) {
      console.error("Error finding post by id:", err);
      return null;
    }
  }

  static async findByPostId(post_id: number): Promise<Post | null> {
    const querySpec = {
      query: "SELECT * FROM c WHERE c.post_id = @post_id",
      parameters: [{ name: "@post_id", value: post_id }],
    };
    const { resources: posts } = await container.items
      .query(querySpec)
      .fetchAll();
    if (posts.length === 0) {
      return null;
    }
    return new Post(posts[0]);
  }

  static async findByUserId(userid: number): Promise<PostData[]> {
    const querySpec = {
      query: "SELECT * FROM c WHERE c.userid = @userid",
      parameters: [{ name: "@userid", value: userid }],
    };
    const { resources: posts } = await container.items
      .query(querySpec)
      .fetchAll();
    return posts;
  }

  static async findLastPostIdByUserId(userid: number): Promise<number> {
    const querySpec = {
      query: "SELECT VALUE MAX(c.post_id) FROM c WHERE c.userid = @userid",
      parameters: [{ name: "@userid", value: userid }],
    };
    const { resources } = await container.items.query(querySpec).fetchAll();
    return resources[0] || 0;
  }

  async save(): Promise<PostData> {
    const { resource: savedPost } = await container.items.upsert(this);
    if (!savedPost) {
      throw new Error("Failed to save post");
    }

    const postData: PostData = {
      id: savedPost.id,
      post_id: savedPost.post_id,
      userid: savedPost.userid,
      location: savedPost.location,
      latitude: savedPost.latitude,
      longitude: savedPost.longitude,
      imagens: savedPost.imagens,
      eventType: savedPost.eventType,
      Datatime: savedPost.Datatime,
      likes: savedPost.likes,
      likedBy: savedPost.likedBy,
    };

    return postData;
  }

  async incrementLikes(userId: number): Promise<PostData> {
    if (this.likedBy.includes(userId)) {
      throw new Error("User has already liked this post");
    }
    this.likes += 1;
    this.likedBy.push(userId);
    return this.save();
  }

  async decrementLikes(userId: number): Promise<PostData> {
    const userIndex = this.likedBy.indexOf(userId);
    if (userIndex === -1) {
      throw new Error("User has not liked this post");
    }
    this.likes -= 1;
    this.likedBy.splice(userIndex, 1);
    return this.save();
  }

  static async deleteByPostId(post_id: number): Promise<void> {
    try {
      const post = await this.findByPostId(post_id);
      if (!post) {
        throw new Error(`Post with post_id ${post_id} not found`);
      }
      await container.item(post.id, undefined).delete();
    } catch (err) {
      console.error("Error deleting post:", err);
      throw new Error(
        `Failed to delete post with post_id ${post_id}: ${
          (err as Error).message
        }`
      );
    }
  }
}

export default Post;
