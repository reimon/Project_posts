import { CosmosClient } from "@azure/cosmos";
import config from "./config";

const client = new CosmosClient({ endpoint: config.endpoint, key: config.key });

const databaseId = config.database.id;
const containerId = config.container.id;

async function createDatabase() {
  const { database } = await client.databases.createIfNotExists({
    id: databaseId,
  });
  console.log(`Created database:\n${database.id}\n`);
}

async function createContainer() {
  const { container } = await client
    .database(databaseId)
    .containers.createIfNotExists({ id: containerId });
  console.log(`Created container:\n${container.id}\n`);
}

async function init() {
  await createDatabase();
  await createContainer();
}

export { init, client, databaseId, containerId };
