import { Schema } from "effect";
import { AuthorId } from "./author";

export const BookId = Schema.String.pipe(Schema.brand("BookId"));
export type BookId = typeof BookId.Type;

export const Book = Schema.Struct({
  _id: Schema.optional(BookId),
  title: Schema.String,
  authorIds: Schema.Array(AuthorId),
  isbn: Schema.String,
  price: Schema.Number,
  stock: Schema.Number,
  genre: Schema.String,
  description: Schema.optional(Schema.String),
  publishedDate: Schema.optional(Schema.Date),
  createdAt: Schema.optional(Schema.Date),
  updatedAt: Schema.optional(Schema.Date),
});

export type Book = typeof Book.Type;

export const CreateBookRequest = Schema.Struct({
  title: Schema.String,
  authorIds: Schema.Array(AuthorId),
  isbn: Schema.String,
  price: Schema.Number,
  stock: Schema.Number,
  genre: Schema.String,
  description: Schema.optional(Schema.String),
  publishedDate: Schema.optional(Schema.Date),
});

export type CreateBookRequest = typeof CreateBookRequest.Type;

export const UpdateBookRequest = Schema.Struct({
  title: Schema.optional(Schema.String),
  authorIds: Schema.optional(Schema.Array(AuthorId)),
  isbn: Schema.optional(Schema.String),
  price: Schema.optional(Schema.Number),
  stock: Schema.optional(Schema.Number),
  genre: Schema.optional(Schema.String),
  description: Schema.optional(Schema.String),
  publishedDate: Schema.optional(Schema.Date),
});

export type UpdateBookRequest = typeof UpdateBookRequest.Type;
