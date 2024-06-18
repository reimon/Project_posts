import dotenv from "dotenv";

dotenv.config();

const config = {
  endpoint: process.env.COSMOS_DB_ENDPOINT as string,
  key: process.env.COSMOS_DB_KEY as string,
  database: {
    id: process.env.COSMOS_DB_DATABASE_ID as string,
  },
  container: {
    id: process.env.COSMOS_DB_CONTAINER_ID as string,
  },
};

export default config;
