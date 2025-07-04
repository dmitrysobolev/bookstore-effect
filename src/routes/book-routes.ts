import { Effect, Option, Schema } from "effect";
import {
  HttpRouter,
  HttpServerRequest,
  HttpServerResponse,
} from "@effect/platform";
import { BookService } from "../services/book-service";
import { BookId, CreateBookRequest, UpdateBookRequest } from "../models/book";

const jsonResponse = <T>(data: T) => HttpServerResponse.json(data);

const errorResponse = (error: Error) =>
  HttpServerResponse.json({ error: error.message }, { status: 500 });

export const bookRoutes = HttpRouter.empty.pipe(
  HttpRouter.get(
    "/books",
    Effect.gen(function* () {
      const bookService = yield* BookService;
      const books = yield* bookService.getAllBooks();
      return jsonResponse(books);
    }),
  ),

  HttpRouter.get(
    "/books/:id",
    Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest;
      const id = request.params.id as BookId;
      const bookService = yield* BookService;
      const book = yield* bookService.getBookById(id);

      if (Option.isNone(book)) {
        return HttpServerResponse.json(
          { error: "Book not found" },
          { status: 404 },
        );
      }

      return jsonResponse(book.value);
    }),
  ),

  HttpRouter.post(
    "/books",
    Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest;
      const body = yield* request.json;
      const bookData = yield* Schema.decodeUnknown(CreateBookRequest)(body);

      const bookService = yield* BookService;
      const book = yield* bookService.createBook(bookData);

      return jsonResponse(book);
    }),
  ),

  HttpRouter.put(
    "/books/:id",
    Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest;
      const id = request.params.id as BookId;
      const body = yield* request.json;
      const updateData = yield* Schema.decodeUnknown(UpdateBookRequest)(body);

      const bookService = yield* BookService;
      const book = yield* bookService.updateBook(id, updateData);

      if (Option.isNone(book)) {
        return HttpServerResponse.json(
          { error: "Book not found" },
          { status: 404 },
        );
      }

      return jsonResponse(book.value);
    }),
  ),

  HttpRouter.delete(
    "/books/:id",
    Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest;
      const id = request.params.id as BookId;
      const bookService = yield* BookService;
      const deleted = yield* bookService.deleteBook(id);

      if (!deleted) {
        return HttpServerResponse.json(
          { error: "Book not found" },
          { status: 404 },
        );
      }

      return HttpServerResponse.json({ message: "Book deleted successfully" });
    }),
  ),

  HttpRouter.get(
    "/books/search/:query",
    Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest;
      const query = request.params.query;
      const bookService = yield* BookService;
      const books = yield* bookService.searchBooks(query);

      return jsonResponse(books);
    }),
  ),

  HttpRouter.get(
    "/books/genre/:genre",
    Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest;
      const genre = request.params.genre;
      const bookService = yield* BookService;
      const books = yield* bookService.getBooksByGenre(genre);

      return jsonResponse(books);
    }),
  ),

  HttpRouter.get(
    "/books/author/:author",
    Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest;
      const author = request.params.author;
      const bookService = yield* BookService;
      const books = yield* bookService.getBooksByAuthor(author);

      return jsonResponse(books);
    }),
  ),

  HttpRouter.patch(
    "/books/:id/stock",
    Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest;
      const id = request.params.id as BookId;
      const body = yield* request.json;
      const { quantity } = body as { quantity: number };

      const bookService = yield* BookService;
      const book = yield* bookService.updateStock(id, quantity);

      if (Option.isNone(book)) {
        return HttpServerResponse.json(
          { error: "Book not found" },
          { status: 404 },
        );
      }

      return jsonResponse(book.value);
    }),
  ),
);
