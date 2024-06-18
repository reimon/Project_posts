import { client, databaseId, containerId } from "../config/database";
import { Container, ItemDefinition, Resource } from "@azure/cosmos";

const container: Container = client.database(databaseId).container(containerId);

export interface PostData {
  id: string;
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
    const { resource: post } = await container.item(id).read();
    if (!post) {
      return null;
    }
    return new Post(post as PostData);
  }

  static async findByUserId(userid: number): Promise<PostData[]> {
    const querySpec = {
      query: "SELECT * FROM c WHERE c.userid = @userid",
      parameters: [
        {
          name: "@userid",
          value: userid,
        },
      ],
    };
    const { resources: posts } = await container.items
      .query(querySpec)
      .fetchAll();
    return posts;
  }

  async save(): Promise<PostData> {
    const { resource: savedPost } = await container.items.upsert(this);
    if (!savedPost) {
      throw new Error("Failed to save post");
    }

    const result: PostData = {
      id: savedPost.id,
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

    return result;
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

  async remove(): Promise<void> {
    await container.item(this.id).delete();
  }
}

export default Post;
