import "dotenv/config"
import express from "express";
import cors from "cors";
import { getApolloServerMiddleware } from "../graphql";
import { setUpEventListener } from "./utils/events";
function main() {
  const app = express();
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
      app.use("/graphql", cors(), express.json(), middleware);
    });
}

main()
