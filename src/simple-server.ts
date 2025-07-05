import express from "express";
import cors from "cors";
import { Effect, Layer, Console } from "effect";
import { MongoDBLive } from "./database";
import { BookRepositoryLive } from "./repositories/book-repository";
import { BookServiceLive } from "./services/book-service";
import { BookService } from "./services/book-service";
import { AuthorRepositoryLive } from "./repositories/author-repository";
import { AuthorServiceLive } from "./services/author-service";
import { AuthorService } from "./services/author-service";
import { BookId, CreateBookRequest, UpdateBookRequest } from "./models/book";
import {
  AuthorId,
  CreateAuthorRequest,
  UpdateAuthorRequest,
} from "./models/author";

const app = express();

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use(express.static('public'));

// Create the runtime with all layers
const AppLive = Layer.mergeAll(
  MongoDBLive,
  BookRepositoryLive,
  BookServiceLive,
  AuthorRepositoryLive,
  AuthorServiceLive,
);

// Helper function to run Effect programs for Book operations
const runBookEffect = async <A>(
  effect: Effect.Effect<A, Error, BookService>,
) => {
  return Effect.runPromise(Effect.provide(effect, AppLive));
};

// Helper function to run Effect programs for Author operations
const runAuthorEffect = async <A>(
  effect: Effect.Effect<A, Error, AuthorService>,
) => {
  return Effect.runPromise(Effect.provide(effect, AppLive));
};

// =============================================================================
// BOOK ROUTES
// =============================================================================

app.get("/api/books", async (req: any, res: any) => {
  try {
    const books = await runBookEffect(
      Effect.gen(function* () {
        const bookService = yield* BookService;
        return yield* bookService.getAllBooks();
      }),
    );
    res.json(books);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/books/:id", async (req: any, res: any) => {
  try {
    const id = req.params.id as BookId;
    const book = await runBookEffect(
      Effect.gen(function* () {
        const bookService = yield* BookService;
        return yield* bookService.getBookById(id);
      }),
    );

    if (book._tag === "None") {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json(book.value);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/books", async (req: any, res: any) => {
  try {
    const bookData = req.body as CreateBookRequest;
    const book = await runBookEffect(
      Effect.gen(function* () {
        const bookService = yield* BookService;
        return yield* bookService.createBook(bookData);
      }),
    );
    res.status(201).json(book);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/books/:id", async (req: any, res: any) => {
  try {
    const id = req.params.id as BookId;
    const updateData = req.body as UpdateBookRequest;
    const book = await runBookEffect(
      Effect.gen(function* () {
        const bookService = yield* BookService;
        return yield* bookService.updateBook(id, updateData);
      }),
    );

    if (book._tag === "None") {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json(book.value);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/books/:id", async (req: any, res: any) => {
  try {
    const id = req.params.id as BookId;
    const deleted = await runBookEffect(
      Effect.gen(function* () {
        const bookService = yield* BookService;
        return yield* bookService.deleteBook(id);
      }),
    );

    if (!deleted) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json({ message: "Book deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/books/search/:query", async (req: any, res: any) => {
  try {
    const query = req.params.query;
    const books = await runBookEffect(
      Effect.gen(function* () {
        const bookService = yield* BookService;
        return yield* bookService.searchBooks(query);
      }),
    );
    res.json(books);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/books/genre/:genre", async (req: any, res: any) => {
  try {
    const genre = req.params.genre;
    const books = await runBookEffect(
      Effect.gen(function* () {
        const bookService = yield* BookService;
        return yield* bookService.getBooksByGenre(genre);
      }),
    );
    res.json(books);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/books/author/:author", async (req: any, res: any) => {
  try {
    const author = req.params.author;
    const books = await runBookEffect(
      Effect.gen(function* () {
        const bookService = yield* BookService;
        return yield* bookService.getBooksByAuthor(author);
      }),
    );
    res.json(books);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.patch("/api/books/:id/stock", async (req: any, res: any) => {
  try {
    const id = req.params.id as BookId;
    const { quantity } = req.body as { quantity: number };
    const book = await runBookEffect(
      Effect.gen(function* () {
        const bookService = yield* BookService;
        return yield* bookService.updateStock(id, quantity);
      }),
    );

    if (book._tag === "None") {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json(book.value);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================================================
// AUTHOR ROUTES
// =============================================================================

app.get("/api/authors", async (req: any, res: any) => {
  try {
    const authors = await runAuthorEffect(
      Effect.gen(function* () {
        const authorService = yield* AuthorService;
        return yield* authorService.getAllAuthors();
      }),
    );
    res.json(authors);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/authors/:id", async (req: any, res: any) => {
  try {
    const id = req.params.id as AuthorId;
    const author = await runAuthorEffect(
      Effect.gen(function* () {
        const authorService = yield* AuthorService;
        return yield* authorService.getAuthorById(id);
      }),
    );

    if (author._tag === "None") {
      return res.status(404).json({ error: "Author not found" });
    }

    res.json(author.value);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/authors", async (req: any, res: any) => {
  try {
    const authorData = req.body as CreateAuthorRequest;
    const author = await runAuthorEffect(
      Effect.gen(function* () {
        const authorService = yield* AuthorService;
        return yield* authorService.createAuthor(authorData);
      }),
    );
    res.status(201).json(author);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/authors/:id", async (req: any, res: any) => {
  try {
    const id = req.params.id as AuthorId;
    const updateData = req.body as UpdateAuthorRequest;
    const author = await runAuthorEffect(
      Effect.gen(function* () {
        const authorService = yield* AuthorService;
        return yield* authorService.updateAuthor(id, updateData);
      }),
    );

    if (author._tag === "None") {
      return res.status(404).json({ error: "Author not found" });
    }

    res.json(author.value);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/authors/:id", async (req: any, res: any) => {
  try {
    const id = req.params.id as AuthorId;
    const deleted = await runAuthorEffect(
      Effect.gen(function* () {
        const authorService = yield* AuthorService;
        return yield* authorService.deleteAuthor(id);
      }),
    );

    if (!deleted) {
      return res.status(404).json({ error: "Author not found" });
    }

    res.json({ message: "Author deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/authors/search/:query", async (req: any, res: any) => {
  try {
    const query = req.params.query;
    const authors = await runAuthorEffect(
      Effect.gen(function* () {
        const authorService = yield* AuthorService;
        return yield* authorService.searchAuthors(query);
      }),
    );
    res.json(authors);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/authors/nationality/:nationality", async (req: any, res: any) => {
  try {
    const nationality = req.params.nationality;
    const authors = await runAuthorEffect(
      Effect.gen(function* () {
        const authorService = yield* AuthorService;
        return yield* authorService.getAuthorsByNationality(nationality);
      }),
    );
    res.json(authors);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/authors/name/:name", async (req: any, res: any) => {
  try {
    const name = req.params.name;
    const authors = await runAuthorEffect(
      Effect.gen(function* () {
        const authorService = yield* AuthorService;
        return yield* authorService.getAuthorsByName(name);
      }),
    );
    res.json(authors);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================================================
// UTILITY ROUTES
// =============================================================================

// Get books with populated author details
app.get("/api/books-with-authors", async (req: any, res: any) => {
  try {
    const booksWithAuthors = await Effect.runPromise(
      Effect.provide(
        Effect.gen(function* () {
          const bookService = yield* BookService;
          const authorService = yield* AuthorService;

          const books = yield* bookService.getAllBooks();
          const result = [];

          for (const book of books) {
            const authors = yield* authorService.getAuthorsByIds([
              ...book.authorIds,
            ]);
            result.push({
              ...book,
              authors: authors,
            });
          }

          return result;
        }),
        AppLive,
      ),
    );
    res.json(booksWithAuthors);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific book with populated author details
app.get("/api/books-with-authors/:id", async (req: any, res: any) => {
  try {
    const id = req.params.id as BookId;
    const bookWithAuthors = await Effect.runPromise(
      Effect.provide(
        Effect.gen(function* () {
          const bookService = yield* BookService;
          const authorService = yield* AuthorService;

          const book = yield* bookService.getBookById(id);

          if (book._tag === "None") {
            return null;
          }

          const authors = yield* authorService.getAuthorsByIds([
            ...book.value.authorIds,
          ]);

          return {
            ...book.value,
            authors: authors,
          };
        }),
        AppLive,
      ),
    );

    if (!bookWithAuthors) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json(bookWithAuthors);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================================================
// ERROR HANDLING
// =============================================================================

// 404 handler
app.use((req: any, res: any) => {
  res.status(404).json({ error: "Not Found" });
});

// Error handler
app.use((err: Error, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    console.log("Starting Bookstore Management API...");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log("");
      console.log("=== BOOK ENDPOINTS ===");
      console.log(`  GET    http://localhost:${PORT}/api/books`);
      console.log(`  GET    http://localhost:${PORT}/api/books/:id`);
      console.log(`  POST   http://localhost:${PORT}/api/books`);
      console.log(`  PUT    http://localhost:${PORT}/api/books/:id`);
      console.log(`  DELETE http://localhost:${PORT}/api/books/:id`);
      console.log(`  GET    http://localhost:${PORT}/api/books/search/:query`);
      console.log(`  GET    http://localhost:${PORT}/api/books/genre/:genre`);
      console.log(`  GET    http://localhost:${PORT}/api/books/author/:author`);
      console.log(`  PATCH  http://localhost:${PORT}/api/books/:id/stock`);
      console.log("");
      console.log("=== AUTHOR ENDPOINTS ===");
      console.log(`  GET    http://localhost:${PORT}/api/authors`);
      console.log(`  GET    http://localhost:${PORT}/api/authors/:id`);
      console.log(`  POST   http://localhost:${PORT}/api/authors`);
      console.log(`  PUT    http://localhost:${PORT}/api/authors/:id`);
      console.log(`  DELETE http://localhost:${PORT}/api/authors/:id`);
      console.log(
        `  GET    http://localhost:${PORT}/api/authors/search/:query`,
      );
      console.log(
        `  GET    http://localhost:${PORT}/api/authors/nationality/:nationality`,
      );
      console.log(`  GET    http://localhost:${PORT}/api/authors/name/:name`);
      console.log("");
      console.log("=== UTILITY ENDPOINTS ===");
      console.log(`  GET    http://localhost:${PORT}/api/books-with-authors`);
      console.log(
        `  GET    http://localhost:${PORT}/api/books-with-authors/:id`,
      );
      console.log("");
      console.log("Ready to accept requests!");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
