import { Context, Effect, Layer, Option } from "effect";
import { ObjectId } from "mongodb";
import { MongoDB, MongoDBLive } from "../database";
import {
  Book,
  BookId,
  CreateBookRequest,
  UpdateBookRequest,
} from "../models/book";
import { DatabaseError, NotFoundError } from "../errors";

export interface BookRepository {
  findAll: () => Effect.Effect<Book[], DatabaseError>;
  findById: (id: BookId) => Effect.Effect<Book, DatabaseError | NotFoundError>;
  create: (book: CreateBookRequest) => Effect.Effect<Book, DatabaseError>;
  update: (
    id: BookId,
    book: UpdateBookRequest,
  ) => Effect.Effect<Book, DatabaseError | NotFoundError>;
  delete: (id: BookId) => Effect.Effect<void, DatabaseError | NotFoundError>;
}

export const BookRepository =
  Context.GenericTag<BookRepository>("BookRepository");

const make = Effect.gen(function* () {
  const { db } = yield* MongoDB;
  const collection = db.collection("books");

  const findAll = (): Effect.Effect<Book[], DatabaseError> =>
    Effect.tryPromise({
      try: () => collection.find({}).toArray(),
      catch: (error) =>
        new DatabaseError({
          message: `Failed to find all books: ${error}`,
        }),
    }).pipe(
      Effect.map((books) =>
        books.map((book) => ({ ...book, _id: book._id.toString() }) as Book),
      ),
    );

  const findById = (
    id: BookId,
  ): Effect.Effect<Book, DatabaseError | NotFoundError> =>
    Effect.tryPromise({
      try: () => collection.findOne({ _id: new ObjectId(id) }),
      catch: (error) =>
        new DatabaseError({
          message: `Failed to find book by id: ${error}`,
        }),
    }).pipe(
      Effect.flatMap((book) =>
        book
          ? Effect.succeed({ ...book, _id: book._id.toString() } as Book)
          : Effect.fail(
              new NotFoundError({ message: `Book with id ${id} not found` }),
            ),
      ),
    );

  const create = (
    bookData: CreateBookRequest,
  ): Effect.Effect<Book, DatabaseError> =>
    Effect.gen(function* () {
      const now = new Date();
      const bookToInsert = {
        ...bookData,
        createdAt: now,
        updatedAt: now,
      };

      const result = yield* Effect.tryPromise({
        try: () => collection.insertOne(bookToInsert),
        catch: (error) =>
          new DatabaseError({ message: `Failed to create book: ${error}` }),
      });

      const insertedBook = yield* Effect.tryPromise({
        try: () => collection.findOne({ _id: result.insertedId }),
        catch: (error) =>
          new DatabaseError({
            message: `Failed to find created book: ${error}`,
          }),
      });

      if (!insertedBook) {
        return yield* Effect.fail(
          new DatabaseError({ message: "Failed to create book" }),
        );
      }

      return { ...insertedBook!, _id: insertedBook!._id.toString() } as Book;
    });

  const update = (
    id: BookId,
    updateData: UpdateBookRequest,
  ): Effect.Effect<Book, DatabaseError | NotFoundError> =>
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
          new DatabaseError({ message: `Failed to update book: ${error}` }),
      });

      if (!result) {
        return yield* Effect.fail(
          new NotFoundError({ message: `Book with id ${id} not found` }),
        );
      }

      return { ...result, _id: result._id.toString() } as Book;
    });

  const deleteBook = (
    id: BookId,
  ): Effect.Effect<void, DatabaseError | NotFoundError> =>
    Effect.tryPromise({
      try: () => collection.deleteOne({ _id: new ObjectId(id) }),
      catch: (error) =>
        new DatabaseError({ message: `Failed to delete book: ${error}` }),
    }).pipe(
      Effect.flatMap((result) =>
        result.deletedCount > 0
          ? Effect.succeed(undefined)
          : Effect.fail(
              new NotFoundError({ message: `Book with id ${id} not found` }),
            ),
      ),
    );

  return {
    findAll,
    findById,
    create,
    update,
    delete: deleteBook,
  };
});

export const BookRepositoryLive = Layer.effect(BookRepository, make).pipe(
  Layer.provide(MongoDBLive),
);
