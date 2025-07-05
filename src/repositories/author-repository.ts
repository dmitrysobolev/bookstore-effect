import { Context, Effect, Layer, Option } from "effect"
import { ObjectId } from "mongodb"
import { MongoDB, MongoDBLive } from "../database"
import { Author, AuthorId, CreateAuthorRequest, UpdateAuthorRequest } from "../models/author"

export interface AuthorRepository {
  findAll: () => Effect.Effect<Author[], Error>
  findById: (id: AuthorId) => Effect.Effect<Option.Option<Author>, Error>
  findByIds: (ids: AuthorId[]) => Effect.Effect<Author[], Error>
  create: (author: CreateAuthorRequest) => Effect.Effect<Author, Error>
  update: (id: AuthorId, author: UpdateAuthorRequest) => Effect.Effect<Option.Option<Author>, Error>
  delete: (id: AuthorId) => Effect.Effect<boolean, Error>
  findByName: (name: string) => Effect.Effect<Author[], Error>
  findByNationality: (nationality: string) => Effect.Effect<Author[], Error>
}

export const AuthorRepository = Context.GenericTag<AuthorRepository>("AuthorRepository")

const make = Effect.gen(function* () {
  const { db } = yield* MongoDB
  const collection = db.collection("authors")

  const findAll = (): Effect.Effect<Author[], Error> =>
    Effect.promise(() => collection.find({}).toArray()).pipe(
      Effect.map(authors =>
        authors.map(author => ({ ...author, _id: author._id.toString() }) as Author)
      ),
      Effect.mapError(error => new Error(`Failed to find all authors: ${error}`))
    )

  const findById = (id: AuthorId): Effect.Effect<Option.Option<Author>, Error> =>
    Effect.promise(() => collection.findOne({ _id: new ObjectId(id) })).pipe(
      Effect.map(author =>
        author
          ? Option.some({ ...author, _id: author._id.toString() } as Author)
          : Option.none()
      ),
      Effect.mapError(error => new Error(`Failed to find author by id: ${error}`))
    )

  const findByIds = (ids: AuthorId[]): Effect.Effect<Author[], Error> =>
    Effect.promise(() =>
      collection.find({ _id: { $in: ids.map(id => new ObjectId(id)) } }).toArray()
    ).pipe(
      Effect.map(authors =>
        authors.map(author => ({ ...author, _id: author._id.toString() }) as Author)
      ),
      Effect.mapError(error => new Error(`Failed to find authors by ids: ${error}`))
    )

  const create = (authorData: CreateAuthorRequest): Effect.Effect<Author, Error> =>
    Effect.gen(function* () {
      const now = new Date()
      const authorToInsert = {
        ...authorData,
        createdAt: now,
        updatedAt: now
      }

      const result = yield* Effect.promise(() => collection.insertOne(authorToInsert))
      const insertedAuthor = yield* Effect.promise(() =>
        collection.findOne({ _id: result.insertedId })
      )

      if (!insertedAuthor) {
        yield* Effect.fail(new Error("Failed to create author"))
      }

      return { ...insertedAuthor!, _id: insertedAuthor!._id.toString() } as Author
    })

  const update = (id: AuthorId, updateData: UpdateAuthorRequest): Effect.Effect<Option.Option<Author>, Error> =>
    Effect.gen(function* () {
      const now = new Date()
      const result = yield* Effect.promise(() =>
        collection.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: { ...updateData, updatedAt: now } },
          { returnDocument: "after" }
        )
      )

      return result
        ? Option.some({ ...result, _id: result._id.toString() } as Author)
        : Option.none()
    })

  const deleteAuthor = (id: AuthorId): Effect.Effect<boolean, Error> =>
    Effect.promise(() => collection.deleteOne({ _id: new ObjectId(id) })).pipe(
      Effect.map(result => result.deletedCount > 0),
      Effect.mapError(error => new Error(`Failed to delete author: ${error}`))
    )

  const findByName = (name: string): Effect.Effect<Author[], Error> =>
    Effect.promise(() =>
      collection.find({
        $or: [
          { firstName: new RegExp(name, "i") },
          { lastName: new RegExp(name, "i") },
          { fullName: new RegExp(name, "i") }
        ]
      }).toArray()
    ).pipe(
      Effect.map(authors =>
        authors.map(author => ({ ...author, _id: author._id.toString() }) as Author)
      ),
      Effect.mapError(error => new Error(`Failed to find authors by name: ${error}`))
    )

  const findByNationality = (nationality: string): Effect.Effect<Author[], Error> =>
    Effect.promise(() =>
      collection.find({ nationality: new RegExp(nationality, "i") }).toArray()
    ).pipe(
      Effect.map(authors =>
        authors.map(author => ({ ...author, _id: author._id.toString() }) as Author)
      ),
      Effect.mapError(error => new Error(`Failed to find authors by nationality: ${error}`))
    )

  return {
    findAll,
    findById,
    findByIds,
    create,
    update,
    delete: deleteAuthor,
    findByName,
    findByNationality
  }
})

export const AuthorRepositoryLive = Layer.effect(AuthorRepository, make).pipe(
  Layer.provide(MongoDBLive)
)
