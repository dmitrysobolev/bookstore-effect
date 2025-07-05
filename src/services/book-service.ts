import { Context, Effect, Layer, Option } from "effect";
import {
  BookRepository,
  BookRepositoryLive,
} from "../repositories/book-repository";
import {
  Book,
  BookId,
  CreateBookRequest,
  UpdateBookRequest,
} from "../models/book";
import { AuthorService, AuthorServiceLive } from "./author-service";
import { AuthorId } from "../models/author";

export interface BookService {
  getAllBooks: () => Effect.Effect<Book[], Error>;
  getBookById: (id: BookId) => Effect.Effect<Option.Option<Book>, Error>;
  createBook: (book: CreateBookRequest) => Effect.Effect<Book, Error>;
  updateBook: (
    id: BookId,
    book: UpdateBookRequest,
  ) => Effect.Effect<Option.Option<Book>, Error>;
  deleteBook: (id: BookId) => Effect.Effect<boolean, Error>;
  searchBooks: (query: string) => Effect.Effect<Book[], Error>;
  getBooksByGenre: (genre: string) => Effect.Effect<Book[], Error>;
  getBooksByAuthor: (authorName: string) => Effect.Effect<Book[], Error>;
  updateStock: (
    id: BookId,
    quantity: number,
  ) => Effect.Effect<Option.Option<Book>, Error>;
}

export const BookService = Context.GenericTag<BookService>("BookService");

const make = Effect.gen(function* () {
  const bookRepository = yield* BookRepository;
  const authorService = yield* AuthorService;

  const getAllBooks = () => bookRepository.findAll();

  const getBookById = (id: BookId) => bookRepository.findById(id);

  const createBook = (bookData: CreateBookRequest) =>
    Effect.gen(function* () {
      // Validate that all author IDs exist
      for (const authorId of bookData.authorIds) {
        const authorExists =
          yield* authorService.validateAuthorExists(authorId);
        if (!authorExists) {
          yield* Effect.fail(
            new Error(`Author with ID ${authorId} does not exist`),
          );
        }
      }

      const existingBook = yield* bookRepository
        .findAll()
        .pipe(
          Effect.map((books) => books.find((b) => b.isbn === bookData.isbn)),
        );

      if (existingBook) {
        yield* Effect.fail(
          new Error(`Book with ISBN ${bookData.isbn} already exists`),
        );
      }

      return yield* bookRepository.create(bookData);
    });

  const updateBook = (id: BookId, updateData: UpdateBookRequest) =>
    Effect.gen(function* () {
      // Validate author IDs if they are being updated
      if (updateData.authorIds) {
        for (const authorId of updateData.authorIds) {
          const authorExists =
            yield* authorService.validateAuthorExists(authorId);
          if (!authorExists) {
            yield* Effect.fail(
              new Error(`Author with ID ${authorId} does not exist`),
            );
          }
        }
      }

      return yield* bookRepository.update(id, updateData);
    });

  const deleteBook = (id: BookId) => bookRepository.delete(id);

  const searchBooks = (query: string) =>
    Effect.gen(function* () {
      const books = yield* bookRepository.findAll();
      const filteredBooks = [];

      for (const book of books) {
        // Check title and genre
        if (
          book.title.toLowerCase().includes(query.toLowerCase()) ||
          book.genre.toLowerCase().includes(query.toLowerCase())
        ) {
          filteredBooks.push(book);
          continue;
        }

        // Check authors by getting author details
        const authors = yield* authorService.getAuthorsByIds([
          ...book.authorIds,
        ]);
        const authorMatch = authors.some(
          (author) =>
            author.firstName.toLowerCase().includes(query.toLowerCase()) ||
            author.lastName.toLowerCase().includes(query.toLowerCase()) ||
            author.fullName.toLowerCase().includes(query.toLowerCase()),
        );

        if (authorMatch) {
          filteredBooks.push(book);
        }
      }

      return filteredBooks;
    });

  const getBooksByGenre = (genre: string) =>
    bookRepository
      .findAll()
      .pipe(
        Effect.map((books) =>
          books.filter(
            (book) => book.genre.toLowerCase() === genre.toLowerCase(),
          ),
        ),
      );

  const getBooksByAuthor = (authorName: string) =>
    Effect.gen(function* () {
      // First find authors matching the name
      const matchingAuthors = yield* authorService.getAuthorsByName(authorName);
      const authorIds = matchingAuthors
        .map((author) => author._id!)
        .filter(Boolean) as AuthorId[];

      if (authorIds.length === 0) {
        return [];
      }

      // Then find books by those author IDs
      const allBooks = yield* bookRepository.findAll();
      return allBooks.filter((book) =>
        book.authorIds.some((authorId) => authorIds.includes(authorId)),
      );
    });

  const updateStock = (id: BookId, quantity: number) =>
    Effect.gen(function* () {
      const book = yield* bookRepository.findById(id);

      if (Option.isNone(book)) {
        return Option.none();
      }

      const currentBook = book.value;
      const newStock = currentBook.stock + quantity;

      if (newStock < 0) {
        yield* Effect.fail(new Error("Insufficient stock"));
      }

      return yield* bookRepository.update(id, { stock: newStock });
    });

  return {
    getAllBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook,
    searchBooks,
    getBooksByGenre,
    getBooksByAuthor,
    updateStock,
  };
});

export const BookServiceLive = Layer.effect(BookService, make).pipe(
  Layer.provide(BookRepositoryLive),
  Layer.provide(AuthorServiceLive),
);
