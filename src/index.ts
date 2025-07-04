import { Effect, Layer, LogLevel, Logger } from "effect";
import { HttpServer } from "@effect/platform";
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import { MongoDBLive } from "./database";
import { BookRepositoryLive } from "./repositories/book-repository";
import { AuthorRepositoryLive } from "./repositories/author-repository";
import { BookServiceLive } from "./services/book-service";
import { AuthorServiceLive } from "./services/author-service";
import { bookRoutes } from "./routes/book-routes";
import { authorRoutes } from "./routes/author-routes";
import { ServerConfigLive } from "./server";

const HttpLive = HttpServer.router.empty.pipe(
  HttpServer.router.mount("/api", bookRoutes),
  HttpServer.router.mount("/api", authorRoutes),
  HttpServer.router.catchAll((request) =>
    Effect.succeed(
      HttpServer.response.json({ error: "Not Found" }, { status: 404 }),
    ),
  ),
  HttpServer.serve(HttpServer.middleware.logger),
  HttpServer.withLogAddress,
);

const AppLive = HttpLive.pipe(
  Layer.provide(NodeHttpServer.layer),
  Layer.provide(BookServiceLive),
  Layer.provide(AuthorServiceLive),
  Layer.provide(BookRepositoryLive),
  Layer.provide(AuthorRepositoryLive),
  Layer.provide(MongoDBLive),
  Layer.provide(ServerConfigLive),
  Layer.provide(Logger.minimumLogLevel(LogLevel.Info)),
);

const program = Effect.gen(function* () {
  yield* Effect.log("Starting Bookstore Management API...");
  yield* Effect.log("Server running on http://localhost:3000");
  yield* Effect.log("API endpoints available at:");
  yield* Effect.log("  Books: http://localhost:3000/api/books");
  yield* Effect.log("  Authors: http://localhost:3000/api/authors");
});

program.pipe(Effect.provide(AppLive), NodeRuntime.runMain);
