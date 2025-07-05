import { Context, Effect, Layer, Option } from "effect";
import { ObjectId } from "mongodb";
import { MongoDB, MongoDBLive } from "../database";
import {
  Author,
  AuthorId,
  CreateAuthorRequest,
  UpdateAuthorRequest,
} from "../models/author";
import { DatabaseError, NotFoundError } from "../errors";

export interface AuthorRepository {
  findAll: () => Effect.Effect<Author[], DatabaseError>;
  findById: (id: AuthorId) => Effect.Effect<Author, DatabaseError | NotFoundError>;
  findByIds: (ids: AuthorId[]) => Effect.Effect<Author[], DatabaseError>;
  create: (author: CreateAuthorRequest) => Effect.Effect<Author, DatabaseError>;
  update: (
    id: AuthorId,
    author: UpdateAuthorRequest,
  ) => Effect.Effect<Author, DatabaseError | NotFoundError>;
  delete: (id: AuthorId) => Effect.Effect<void, DatabaseError | NotFoundError>;
  findByName: (name: string) => Effect.Effect<Author[], DatabaseError>;
  findByNationality: (nationality: string) => Effect.Effect<Author[], DatabaseError>;
}

export const AuthorRepository =
  Context.GenericTag<AuthorRepository>("AuthorRepository");

const make = Effect.gen(function* () {
  const { db } = yield* MongoDB;
  const collection = db.collection("authors");

  const findAll = (): Effect.Effect<Author[], DatabaseError> =>
    Effect.tryPromise({
      try: () => collection.find({}).toArray(),
      catch: (error) =>
        new DatabaseError({
          message: `Failed to find all authors: ${error}`,
        }),
    }).pipe(
      Effect.map((authors) =>
        authors.map(
          (author) => ({ ...author, _id: author._id.toString() }) as Author,
        ),
      ),
    );

  const findById = (
    id: AuthorId,
  ): Effect.Effect<Author, DatabaseError | NotFoundError> =>
    Effect.tryPromise({
      try: () => collection.findOne({ _id: new ObjectId(id) }),
      catch: (error) =>
        new DatabaseError({
          message: `Failed to find author by id: ${error}`,
        }),
    }).pipe(
      Effect.flatMap((author) =>
        author
          ? Effect.succeed({ ...author, _id: author._id.toString() } as Author)
          : Effect.fail(
              new NotFoundError({ message: `Author with id ${id} not found` }),
            ),
      ),
    );

  const findByIds = (ids: AuthorId[]): Effect.Effect<Author[], DatabaseError> =>
    Effect.tryPromise({
      try: () =>
        collection
          .find({ _id: { $in: ids.map((id) => new ObjectId(id)) } })
          .toArray(),
      catch: (error) =>
        new DatabaseError({
          message: `Failed to find authors by ids: ${error}`,
        }),
    }).pipe(
      Effect.map((authors) =>
        authors.map(
          (author) => ({ ...author, _id: author._id.toString() }) as Author,
        ),
      ),
    );

  const create = (
    authorData: CreateAuthorRequest,
  ): Effect.Effect<Author, DatabaseError> =>
    Effect.gen(function* () {
      const now = new Date();
      const authorToInsert = {
        ...authorData,
        createdAt: now,
        updatedAt: now,
      };

      const result = yield* Effect.tryPromise({
        try: () => collection.insertOne(authorToInsert),
        catch: (error) =>
          new DatabaseError({ message: `Failed to create author: ${error}` }),
      });

      const insertedAuthor = yield* Effect.tryPromise({
        try: () => collection.findOne({ _id: result.insertedId }),
        catch: (error) =>
          new DatabaseError({
            message: `Failed to find created author: ${error}`,
          }),
      });

      if (!insertedAuthor) {
        return yield* Effect.fail(
          new DatabaseError({ message: "Failed to create author" }),
        );
      }

      return {
        ...insertedAuthor!,
        _id: insertedAuthor!._id.toString(),
      } as Author;
    });

  const update = (
    id: AuthorId,
    updateData: UpdateAuthorRequest,
  ): Effect.Effect<Author, DatabaseError | NotFoundError> =>
    Effect.gen(function* () {
      const now = new Date();
      const result = yield* Effect.tryPromise({
        try: () =>
          collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: { ...updateData, updatedAt: now } },
            { returnDocument: "after" },
          ),
        catch: (error) =>
          new DatabaseError({ message: `Failed to update author: ${error}` }),
      });

      if (!result) {
        return yield* Effect.fail(
          new NotFoundError({ message: `Author with id ${id} not found` }),
        );
      }

      return { ...result, _id: result._id.toString() } as Author;
    });

  const deleteAuthor = (
    id: AuthorId,
  ): Effect.Effect<void, DatabaseError | NotFoundError> =>
    Effect.tryPromise({
      try: () => collection.deleteOne({ _id: new ObjectId(id) }),
      catch: (error) =>
        new DatabaseError({ message: `Failed to delete author: ${error}` }),
    }).pipe(
      Effect.flatMap((result) =>
        result.deletedCount > 0
          ? Effect.succeed(undefined)
          : Effect.fail(
              new NotFoundError({ message: `Author with id ${id} not found` }),
            ),
      ),
    );

  const findByName = (name: string): Effect.Effect<Author[], DatabaseError> =>
    Effect.tryPromise({
      try: () =>
        collection
          .find({
            $or: [
              { firstName: new RegExp(name, "i") },
              { lastName: new RegExp(name, "i") },
              { fullName: new RegExp(name, "i") },
            ],
          })
          .toArray(),
      catch: (error) =>
        new DatabaseError({
          message: `Failed to find authors by name: ${error}`,
        }),
    }).pipe(
      Effect.map((authors) =>
        authors.map(
          (author) => ({ ...author, _id: author._id.toString() }) as Author,
        ),
      ),
    );

  const findByNationality = (
    nationality: string,
  ): Effect.Effect<Author[], DatabaseError> =>
    Effect.tryPromise({
      try: () =>
        collection
          .find({ nationality: new RegExp(nationality, "i") })
          .toArray(),
      catch: (error) =>
        new DatabaseError({
          message: `Failed to find authors by nationality: ${error}`,
        }),
    }).pipe(
      Effect.map((authors) =>
        authors.map(
          (author) => ({ ...author, _id: author._id.toString() }) as Author,
        ),
      ),
    );

  return {
    findAll,
    findById,
    findByIds,
    create,
    update,
    delete: deleteAuthor,
    findByName,
    findByNationality,
  };
});

export const AuthorRepositoryLive = Layer.effect(AuthorRepository, make).pipe(
  Layer.provide(MongoDBLive),
);
