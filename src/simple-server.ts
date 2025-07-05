import express from "express";
import cors from "cors";
import { Effect, Layer, Cause, Exit, Schema } from "effect";
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
import { AppError, ValidationError } from "./errors";

const app = express();

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use(express.static("public"));

// Create the runtime with all layers
const AppLive = Layer.mergeAll(
  MongoDBLive,
  BookRepositoryLive,
  BookServiceLive,
  AuthorRepositoryLive,
  AuthorServiceLive,
);

// Helper function to run Effect programs
const runEffect = <A, E, R>(effect: Effect.Effect<A, E, R>) => {
  return Effect.runPromiseExit(Effect.provide(effect, AppLive as Layer.Layer<R>));
};

// =============================================================================
// BOOK ROUTES
// =============================================================================

app.get("/api/books", async (req, res, next) => {
  const effect = Effect.gen(function* () {
    const bookService = yield* BookService;
    return yield* bookService.getAllBooks();
  });

  runEffect(effect).then(handleResponse(res, next));
});

app.get("/api/books/:id", async (req, res, next) => {
  const id = req.params.id as BookId;
  const effect = Effect.gen(function* () {
    const bookService = yield* BookService;
    return yield* bookService.getBookById(id);
  });

  runEffect(effect).then(handleResponse(res, next));
});

app.post("/api/books", async (req, res, next) => {
  const effect = Effect.gen(function* () {
    // Validate request body
    const bookData = yield* Effect.try({
      try: () => Schema.decodeUnknownSync(CreateBookRequest)(req.body),
      catch: (error) => new ValidationError({ message: `Invalid request data: ${error}` }),
    });
    
    const bookService = yield* BookService;
    return yield* bookService.createBook(bookData);
  });

  runEffect(effect).then(handleResponse(res, next, 201));
});

app.put("/api/books/:id", async (req, res, next) => {
  const id = req.params.id as BookId;
  const effect = Effect.gen(function* () {
    // Validate request body
    const updateData = yield* Effect.try({
      try: () => Schema.decodeUnknownSync(UpdateBookRequest)(req.body),
      catch: (error) => new ValidationError({ message: `Invalid request data: ${error}` }),
    });
    
    const bookService = yield* BookService;
    return yield* bookService.updateBook(id, updateData);
  });

  runEffect(effect).then(handleResponse(res, next));
});

app.delete("/api/books/:id", async (req, res, next) => {
  const id = req.params.id as BookId;
  const effect = Effect.gen(function* () {
    const bookService = yield* BookService;
    return yield* bookService.deleteBook(id);
  });

  runEffect(effect).then(handleResponse(res, next, 200, { message: "Book deleted successfully" }));
});

app.get("/api/books/search/:query", async (req, res, next) => {
  const query = req.params.query;
  const effect = Effect.gen(function* () {
    const bookService = yield* BookService;
    return yield* bookService.searchBooks(query);
  });

  runEffect(effect).then(handleResponse(res, next));
});

app.get("/api/books/genre/:genre", async (req, res, next) => {
  const genre = req.params.genre;
  const effect = Effect.gen(function* () {
    const bookService = yield* BookService;
    return yield* bookService.getBooksByGenre(genre);
  });

  runEffect(effect).then(handleResponse(res, next));
});

app.get("/api/books/author/:author", async (req, res, next) => {
  const author = req.params.author;
  const effect = Effect.gen(function* () {
    const bookService = yield* BookService;
    return yield* bookService.getBooksByAuthor(author);
  });

  runEffect(effect).then(handleResponse(res, next));
});

app.patch("/api/books/:id/stock", async (req, res, next) => {
  const id = req.params.id as BookId;
  const { quantity } = req.body as { quantity: number };
  const effect = Effect.gen(function* () {
    const bookService = yield* BookService;
    return yield* bookService.updateStock(id, quantity);
  });

  runEffect(effect).then(handleResponse(res, next));
});

// =============================================================================
// AUTHOR ROUTES
// =============================================================================

app.get("/api/authors", async (req, res, next) => {
  const effect = Effect.gen(function* () {
    const authorService = yield* AuthorService;
    return yield* authorService.getAllAuthors();
  });

  runEffect(effect).then(handleResponse(res, next));
});

app.get("/api/authors/:id", async (req, res, next) => {
  const id = req.params.id as AuthorId;
  const effect = Effect.gen(function* () {
    const authorService = yield* AuthorService;
    return yield* authorService.getAuthorById(id);
  });

  runEffect(effect).then(handleResponse(res, next));
});

app.post("/api/authors", async (req, res, next) => {
  try {
    // Validate request body first
    const authorData = Schema.decodeUnknownSync(CreateAuthorRequest)(req.body);
    
    const effect = Effect.gen(function* () {
      const authorService = yield* AuthorService;
      return yield* authorService.createAuthor(authorData);
    });

    runEffect(effect).then(handleResponse(res, next, 201));
  } catch (error) {
    // Send validation error directly
    console.log('Validation error caught:', error);
    res.status(400).json({ error: `Missing required fields` });
  }
});

app.put("/api/authors/:id", async (req, res, next) => {
  const id = req.params.id as AuthorId;
  const effect = Effect.gen(function* () {
    // Validate request body
    const updateData = yield* Effect.try({
      try: () => Schema.decodeUnknownSync(UpdateAuthorRequest)(req.body),
      catch: (error) => new ValidationError({ message: `Invalid request data: ${error}` }),
    });
    
    const authorService = yield* AuthorService;
    return yield* authorService.updateAuthor(id, updateData);
  });

  runEffect(effect).then(handleResponse(res, next));
});

app.delete("/api/authors/:id", async (req, res, next) => {
  const id = req.params.id as AuthorId;
  const effect = Effect.gen(function* () {
    const authorService = yield* AuthorService;
    return yield* authorService.deleteAuthor(id);
  });

  runEffect(effect).then(handleResponse(res, next, 200, { message: "Author deleted successfully" }));
});

app.get("/api/authors/search/:query", async (req, res, next) => {
  const query = req.params.query;
  const effect = Effect.gen(function* () {
    const authorService = yield* AuthorService;
    return yield* authorService.searchAuthors(query);
  });

  runEffect(effect).then(handleResponse(res, next));
});

app.get("/api/authors/nationality/:nationality", async (req, res, next) => {
  const nationality = req.params.nationality;
  const effect = Effect.gen(function* () {
    const authorService = yield* AuthorService;
    return yield* authorService.getAuthorsByNationality(nationality);
  });

  runEffect(effect).then(handleResponse(res, next));
});

app.get("/api/authors/name/:name", async (req, res, next) => {
  const name = req.params.name;
  const effect = Effect.gen(function* () {
    const authorService = yield* AuthorService;
    return yield* authorService.getAuthorsByName(name);
  });

  runEffect(effect).then(handleResponse(res, next));
});

// =============================================================================
// UTILITY ROUTES
// =============================================================================

// Get books with populated author details
app.get("/api/books-with-authors", async (req, res, next) => {
  const effect = Effect.gen(function* () {
    const bookService = yield* BookService;
    const authorService = yield* AuthorService;

    const books = yield* bookService.getAllBooks();
    const result = [];

    for (const book of books) {
      const authors = yield* authorService.getAuthorsByIds([...book.authorIds]);
      result.push({
        ...book,
        authors: authors,
      });
    }

    return result;
  });

  runEffect(effect).then(handleResponse(res, next));
});

// Get specific book with populated author details
app.get("/api/books-with-authors/:id", async (req, res, next) => {
  const id = req.params.id as BookId;
  const effect = Effect.gen(function* () {
    const bookService = yield* BookService;
    const authorService = yield* AuthorService;

    const book = yield* bookService.getBookById(id);
    const authors = yield* authorService.getAuthorsByIds([...book.authorIds]);

    return {
      ...book,
      authors: authors,
    };
  });

  runEffect(effect).then(handleResponse(res, next));
});

// =============================================================================
// ERROR HANDLING
// =============================================================================

const handleResponse = <A>(res: express.Response, next: express.NextFunction, status = 200, successMessage?: any) => (exit: Exit.Exit<A, AppError>) => {
  if (Exit.isSuccess(exit)) {
    res.status(status).json(successMessage ?? exit.value);
  } else {
    const error = Cause.failureOption(exit.cause);
    if (error._tag === "Some") {
      next(error.value);
    } else {
      next(new Error("Unknown error"));
    }
  }
};

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Handle JSON parsing errors
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: "Invalid JSON payload" });
  }

  // Handle our custom error types
  if (err._tag) {
    switch (err._tag) {
      case "NotFoundError":
        res.status(404).json({ error: err.message });
        break;
      case "ValidationError":
        res.status(400).json({ error: err.message });
        break;
      case "DatabaseError":
        res.status(500).json({ error: err.message });
        break;
      case "BusinessError":
        res.status(409).json({ error: err.message });
        break;
      default:
        res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.status(500).json({ error: "Internal Server Error" });
  }
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
