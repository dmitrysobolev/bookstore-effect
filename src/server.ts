import { Context, Effect, Layer } from "effect"
import { HttpServer } from "@effect/platform"
import { NodeHttpServer } from "@effect/platform-node"

export interface ServerConfig {
  readonly port: number
  readonly host: string
}

export const ServerConfig = Context.GenericTag<ServerConfig>("ServerConfig")

export const ServerConfigLive = Layer.succeed(ServerConfig, {
  port: 3000,
  host: "localhost"
})

const make = Effect.gen(function* () {
  const config = yield* ServerConfig
  
  const server = yield* HttpServer.HttpServer
  
  return yield* server.serve({
    port: config.port,
    host: config.host
  })
})

export const ServerLive = Layer.scopedDiscard(
  Effect.gen(function* () {
    const config = yield* ServerConfig
    const server = yield* HttpServer.HttpServer
    
    yield* server.serve({
      port: config.port,
      host: config.host
    })
    
    yield* Effect.log(`Server running on http://${config.host}:${config.port}`)
  })
).pipe(
  Layer.provide(NodeHttpServer.layer)
)