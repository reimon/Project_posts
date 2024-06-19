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
    this.likes = data.likes;
    this.likedBy = data.likedBy;
  }

  static async findAll(): Promise<Post[]> {
    const querySpec = {
      query: "SELECT * FROM c",
    };
    const { resources: posts } = await container.items
      .query(querySpec)
      .fetchAll();
    return posts.map((post) => new Post(post));
  }

  static async findByUserId(userid: number): Promise<Post[]> {
    const querySpec = {
      query: "SELECT * FROM c WHERE c.userid = @userid",
      parameters: [{ name: "@userid", value: userid }],
    };
    const { resources: posts } = await container.items
      .query(querySpec)
      .fetchAll();
    return posts.map((post) => new Post(post));
  }

  static async findLastPostIdByUserId(userid: number): Promise<number> {
    const querySpec = {
      query: "SELECT VALUE MAX(c.post_id) FROM c WHERE c.userid = @userid",
      parameters: [{ name: "@userid", value: userid }],
    };
    const { resources } = await container.items.query(querySpec).fetchAll();
    return resources[0] || 0;
  }

  static async findById(id: string): Promise<Post | null> {
    const { resource: post } = await container
      .item(id, undefined)
      .read<PostData>();
    return post ? new Post(post) : null;
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

  async save(): Promise<PostData> {
    const { resource: savedPost } = await container.items.upsert(this);
    if (!savedPost) {
      throw new Error("Failed to save post");
    }

    return {
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
    } as PostData;
  }

  static async deleteByPostId(post_id: number): Promise<void> {
    const querySpec = {
      query: "SELECT * FROM c WHERE c.post_id = @post_id",
      parameters: [{ name: "@post_id", value: post_id }],
    };
    const { resources: posts } = await container.items
      .query(querySpec)
      .fetchAll();
    if (posts.length === 0) {
      throw new Error(`Post with ID ${post_id} not found`);
    }
    for (const post of posts) {
      await container.item(post.id, undefined).delete();
    }
  }

  async incrementLikes(userId: number): Promise<PostData> {
    if (!this.likedBy.includes(userId)) {
      this.likes += 1;
      this.likedBy.push(userId);
      return await this.save();
    }
    throw new Error("User already liked this post");
  }

  async decrementLikes(userId: number): Promise<PostData> {
    const index = this.likedBy.indexOf(userId);
    if (index !== -1) {
      this.likes -= 1;
      this.likedBy.splice(index, 1);
      return await this.save();
    }
    throw new Error("User has not liked this post");
  }
}

export default Post;
