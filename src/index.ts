import { Effect, Layer, Context } from "effect";
import { NodeRuntime } from "@effect/platform-node";
import express, { Request, Response, RequestHandler } from "express";
import { MongoDBLive } from "./database";
import { BookRepositoryLive } from "./repositories/book-repository";
import { BookServiceLive } from "./services/book-service";
import { BookService } from "./services/book-service";
import { BookId, CreateBookRequest, UpdateBookRequest } from "./models/book";

const app = express();
app.use(express.json());

// Create the runtime with all layers
const AppLive = Layer.mergeAll(
  MongoDBLive,
  BookRepositoryLive,
  BookServiceLive,
);

const runtime = NodeRuntime.runMain;

// Helper function to run Effect with proper error handling
const runEffect = <A>(effect: Effect.Effect<A, Error, BookService>) => {
  return Effect.runPromise(Effect.provide(effect, AppLive));
};

// Routes
app.get("/api/books", async (req: Request, res: Response) => {
  try {
    const books = await runEffect(
      Effect.gen(function* () {
        const bookService = yield* BookService;
        return yield* bookService.getAllBooks();
      }),
    );
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get("/api/books/:id", async (req, res) => {
  try {
    const id = req.params.id as BookId;
    const book = await runEffect(
      Effect.gen(function* () {
        const bookService = yield* BookService;
        return yield* bookService.getBookById(id);
      }),
    );

    if (book._tag === "None") {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json(book.value);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post("/api/books", async (req: Request, res: Response) => {
  try {
    const bookData = req.body as CreateBookRequest;
    const book = await runEffect(
      Effect.gen(function* () {
        const bookService = yield* BookService;
        return yield* bookService.createBook(bookData);
      }),
    );
    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.put("/api/books/:id", async (req, res) => {
  try {
    const id = req.params.id as BookId;
    const updateData = req.body as UpdateBookRequest;
    const book = await runEffect(
      Effect.gen(function* () {
        const bookService = yield* BookService;
        return yield* bookService.updateBook(id, updateData);
      }),
    );

    if (book._tag === "None") {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json(book.value);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.delete("/api/books/:id", async (req, res) => {
  try {
    const id = req.params.id as BookId;
    const deleted = await runEffect(
      Effect.gen(function* () {
        const bookService = yield* BookService;
        return yield* bookService.deleteBook(id);
      }),
    );

    if (!deleted) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get("/api/books/search/:query", async (req: Request, res: Response) => {
  try {
    const query = req.params.query;
    const books = await runEffect(
      Effect.gen(function* () {
        const bookService = yield* BookService;
        return yield* bookService.searchBooks(query);
      }),
    );
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get("/api/books/genre/:genre", async (req: Request, res: Response) => {
  try {
    const genre = req.params.genre;
    const books = await runEffect(
      Effect.gen(function* () {
        const bookService = yield* BookService;
        return yield* bookService.getBooksByGenre(genre);
      }),
    );
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get("/api/books/author/:author", async (req: Request, res: Response) => {
  try {
    const author = req.params.author;
    const books = await runEffect(
      Effect.gen(function* () {
        const bookService = yield* BookService;
        return yield* bookService.getBooksByAuthor(author);
      }),
    );
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.patch("/api/books/:id/stock", async (req, res) => {
  try {
    const id = req.params.id as BookId;
    const { quantity } = req.body as { quantity: number };
    const book = await runEffect(
      Effect.gen(function* () {
        const bookService = yield* BookService;
        return yield* bookService.updateStock(id, quantity);
      }),
    );

    if (book._tag === "None") {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json(book.value);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Not Found" });
});

// Error handler
app.use(
  (err: Error, req: Request, res: Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error" });
  },
);

const PORT = process.env.PORT || 3000;

// Initialize and start server
async function startServer() {
  try {
    // Initialize the Effect runtime
    console.log("Initializing Effect runtime...");

    // Start the Express server
    app.listen(PORT, () => {
      console.log("Starting Bookstore Management API...");
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(
        `API endpoints available at http://localhost:${PORT}/api/books`,
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
