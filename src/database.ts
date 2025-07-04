import { Context, Effect, Layer } from "effect"
import { MongoClient, Db } from "mongodb"

export interface MongoDB {
  readonly db: Db
}

export const MongoDB = Context.GenericTag<MongoDB>("MongoDB")

const make = Effect.gen(function* () {
  const connectionString = process.env.MONGODB_URI || "mongodb://localhost:27017"
  const dbName = process.env.DB_NAME || "bookstore"
  
  const client = new MongoClient(connectionString)
  yield* Effect.promise(() => client.connect())
  
  const db = client.db(dbName)
  
  return {
    db
  }
})

export const MongoDBLive = Layer.effect(MongoDB, make)