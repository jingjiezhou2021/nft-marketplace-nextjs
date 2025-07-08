import express from "express";
import cors from "cors";
import { getApolloServerMiddleware } from "../graphql";
import { setUpEventListener } from "./utils/events";
async function main() {
  await setUpEventListener();
  const app = express();
  const port = process.env.PORT || 3000;
  app.use(
    "/graphql",
    cors<cors.CorsRequest>(),
    express.json(),
    await getApolloServerMiddleware()
  );
  const server = app.listen(port, () => {
    console.log(`🚀 Express server running on http://localhost:${port}`);
  });
  process.on("SIGINT", (code) => {
    console.log("🛑 Shutting down Express Server...");
    server.close();
  });
}

main()
  .then(() => {
    console.log("server setup successful");
  })
  .catch((err) => {
    console.error("server setup failed", err);
  });
