import { Context, Effect, Layer, Option } from "effect";
import { ObjectId } from "mongodb";
import { MongoDB } from "../database";
import {
  Book,
  BookId,
  CreateBookRequest,
  UpdateBookRequest,
} from "../models/book";

export interface BookRepository {
  findAll: () => Effect.Effect<Book[], Error>;
  findById: (id: BookId) => Effect.Effect<Option.Option<Book>, Error>;
  create: (book: CreateBookRequest) => Effect.Effect<Book, Error>;
  update: (
    id: BookId,
    book: UpdateBookRequest,
  ) => Effect.Effect<Option.Option<Book>, Error>;
  delete: (id: BookId) => Effect.Effect<boolean, Error>;
}

export const BookRepository =
  Context.GenericTag<BookRepository>("BookRepository");

const make = Effect.gen(function* () {
  const { db } = yield* MongoDB;
  const collection = db.collection("books");

  const findAll = () =>
    Effect.promise(() => collection.find({}).toArray()).pipe(
      Effect.map((books) =>
        books.map((book) => ({ ...book, _id: book._id.toString() })),
      ),
    );

  const findById = (id: BookId) =>
    Effect.promise(() => collection.findOne({ _id: new ObjectId(id) })).pipe(
      Effect.map((book) =>
        book
          ? Option.some({ ...book, _id: book._id.toString() })
          : Option.none(),
      ),
    );

  const create = (bookData: CreateBookRequest) =>
    Effect.gen(function* () {
      const now = new Date();
      const bookToInsert = {
        ...bookData,
        createdAt: now,
        updatedAt: now,
      };

      const result = yield* Effect.promise(() =>
        collection.insertOne(bookToInsert),
      );
      const insertedBook = yield* Effect.promise(() =>
        collection.findOne({ _id: result.insertedId }),
      );

      if (!insertedBook) {
        yield* Effect.fail(new Error("Failed to create book"));
      }

      return { ...insertedBook!, _id: insertedBook!._id.toString() };
    });

  const update = (id: BookId, updateData: UpdateBookRequest) =>
    Effect.gen(function* () {
      const now = new Date();
      const result = yield* Effect.promise(() =>
        collection.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: { ...updateData, updatedAt: now } },
          { returnDocument: "after" },
        ),
      );

      return result
        ? Option.some({ ...result, _id: result._id.toString() })
        : Option.none();
    });

  const deleteBook = (id: BookId) =>
    Effect.promise(() => collection.deleteOne({ _id: new ObjectId(id) })).pipe(
      Effect.map((result) => result.deletedCount > 0),
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
  Layer.provide(MongoDB),
);
