import { CosmosClient } from "@azure/cosmos";
import dotenv from "dotenv";

dotenv.config();

const endpoint = process.env.COSMOS_DB_ENDPOINT!;
const key = process.env.COSMOS_DB_KEY!;
const databaseId = process.env.COSMOS_DB_DATABASE_ID!;
const containerId = process.env.COSMOS_DB_CONTAINER_ID!;

if (!endpoint || !key || !databaseId || !containerId) {
  throw new Error(
    "Please make sure you have the necessary environment variables set"
  );
}

const client = new CosmosClient({ endpoint, key });

export { client, databaseId, containerId };

export async function initializeDatabase() {
  const { database } = await client.databases.createIfNotExists({
    id: databaseId,
  });
  console.log(`Created database: ${database.id}`);

  const { container } = await client
    .database(databaseId)
    .containers.createIfNotExists({ id: containerId });
  console.log(`Created container: ${container.id}`);
}
