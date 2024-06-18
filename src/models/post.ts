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
  }

  static async findAll(): Promise<PostData[]> {
    const { resources: posts } = await container.items
      .query("SELECT * FROM c")
      .fetchAll();
    return posts;
  }

  static async findById(id: string): Promise<PostData | null> {
    const { resource: post } = await container.item(id).read();
    return post || null;
  }

  async save(): Promise<PostData> {
    const { resource: savedPost } = await container.items.upsert(this);
    if (!savedPost) {
      throw new Error("Failed to save post");
    }

    // Explicitly map the savedPost properties to a PostData object
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
    };

    return result;
  }

  async incrementLikes(): Promise<PostData> {
    this.likes += 1;
    return this.save();
  }

  async remove(): Promise<void> {
    await container.item(this.id).delete();
  }
}

export default Post;
