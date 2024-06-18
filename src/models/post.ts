import { client, databaseId, containerId } from "../config/database";

const container = client.database(databaseId).container(containerId);

interface PostData {
  id: string;
  userid: number;
  location: string;
  latitude: number;
  longitude: number;
  imagens: string[];
  eventType: string;
  Datatime: string;
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

  constructor(data: PostData) {
    this.id = data.id;
    this.userid = data.userid;
    this.location = data.location;
    this.latitude = data.latitude;
    this.longitude = data.longitude;
    this.imagens = data.imagens;
    this.eventType = data.eventType;
    this.Datatime = data.Datatime;
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
    return savedPost;
  }

  async remove(): Promise<void> {
    await container.item(this.id).delete();
  }
}

export default Post;
