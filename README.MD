# Post App with Azure Cosmos DB and TypeScript

This project demonstrates a Node.js application using TypeScript and Azure Cosmos DB SQL API to manage posts. Users can create posts, view them, update them, delete them, and like them.

## Features

- Create a new post with detailed information.
- View all posts.
- Update a post.
- Delete a post.
- Like a post.

## Technologies Used

- Node.js
- TypeScript
- Express.js
- Azure Cosmos DB SQL API

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm (Node Package Manager)
- TypeScript
- Azure Cosmos DB Account

### Installation

1. Clone the repository:

```bash
git clone git@github.com:reimon/Project_posts.git

cd Project_posts

npm install

```

Configure Azure Cosmos DB:

Create a config.ts file in the src/config directory with your Cosmos DB configuration:

```bash
const config = {
  endpoint: "YOUR_COSMOS_DB_ENDPOINT",
  key: "YOUR_COSMOS_DB_KEY",
  database: {
    id: "YOUR_DATABASE_ID",
  },
  container: {
    id: "YOUR_CONTAINER_ID",
  },
};

export default config;

```

Initialize the database:

```bash
npm run build
node dist/config/database.js
```

Start the application:

```bash
npm start
```

The application will be running on http://localhost:3000.
