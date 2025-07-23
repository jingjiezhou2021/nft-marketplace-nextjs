import "dotenv/config";
import express from "express";
import cors from "cors";
import { getApolloServerMiddleware } from "../graphql";
import { setUpEventListener } from "./utils/events";
import path from "path";
import fs from "fs";
import { graphqlUploadExpress } from "graphql-upload-ts";
function main() {
  const app = express();
  app.use(cors());
  // Ensure upload folder exists
  const uploadDir = path.join(process.cwd(), "upload");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }
  app.use(express.static(uploadDir));
  // Enable file uploads
  app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 5 }));
  const port = process.env.port || 3000;
  const server = app.listen(port, () => {
    console.log(`🚀 Express server running on http://localhost:${port}`);
  });
  process.on("SIGINT", (code) => {
    console.log("🛑 Shutting down Express Server...");
    server.close();
  });
  setUpEventListener()
    .then(() => {
      return getApolloServerMiddleware();
    })
    .then((middleware) => {
      app.use("/graphql", express.json(), middleware);
    });
}

main();
