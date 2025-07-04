import { Effect, Option, Schema } from "effect"
import { HttpRouter, HttpServerRequest, HttpServerResponse } from "@effect/platform"
import { AuthorService } from "../services/author-service"
import { AuthorId, CreateAuthorRequest, UpdateAuthorRequest } from "../models/author"

const jsonResponse = <T>(data: T) =>
  HttpServerResponse.json(data)

const errorResponse = (error: Error) =>
  HttpServerResponse.json({ error: error.message }, { status: 500 })

export const authorRoutes = HttpRouter.empty.pipe(
  HttpRouter.get("/authors", Effect.gen(function* () {
    const authorService = yield* AuthorService
    const authors = yield* authorService.getAllAuthors()
    return jsonResponse(authors)
  })),

  HttpRouter.get("/authors/:id", Effect.gen(function* () {
    const request = yield* HttpServerRequest.HttpServerRequest
    const id = request.params.id as AuthorId
    const authorService = yield* AuthorService
    const author = yield* authorService.getAuthorById(id)

    if (Option.isNone(author)) {
      return HttpServerResponse.json({ error: "Author not found" }, { status: 404 })
    }

    return jsonResponse(author.value)
  })),

  HttpRouter.post("/authors", Effect.gen(function* () {
    const request = yield* HttpServerRequest.HttpServerRequest
    const body = yield* request.json
    const authorData = yield* Schema.decodeUnknown(CreateAuthorRequest)(body)

    const authorService = yield* AuthorService
    const author = yield* authorService.createAuthor(authorData)

    return jsonResponse(author)
  })),

  HttpRouter.put("/authors/:id", Effect.gen(function* () {
    const request = yield* HttpServerRequest.HttpServerRequest
    const id = request.params.id as AuthorId
    const body = yield* request.json
    const updateData = yield* Schema.decodeUnknown(UpdateAuthorRequest)(body)

    const authorService = yield* AuthorService
    const author = yield* authorService.updateAuthor(id, updateData)

    if (Option.isNone(author)) {
      return HttpServerResponse.json({ error: "Author not found" }, { status: 404 })
    }

    return jsonResponse(author.value)
  })),

  HttpRouter.delete("/authors/:id", Effect.gen(function* () {
    const request = yield* HttpServerRequest.HttpServerRequest
    const id = request.params.id as AuthorId
    const authorService = yield* AuthorService
    const deleted = yield* authorService.deleteAuthor(id)

    if (!deleted) {
      return HttpServerResponse.json({ error: "Author not found" }, { status: 404 })
    }

    return HttpServerResponse.json({ message: "Author deleted successfully" })
  })),

  HttpRouter.get("/authors/search/:query", Effect.gen(function* () {
    const request = yield* HttpServerRequest.HttpServerRequest
    const query = request.params.query
    const authorService = yield* AuthorService
    const authors = yield* authorService.searchAuthors(query)

    return jsonResponse(authors)
  })),

  HttpRouter.get("/authors/nationality/:nationality", Effect.gen(function* () {
    const request = yield* HttpServerRequest.HttpServerRequest
    const nationality = request.params.nationality
    const authorService = yield* AuthorService
    const authors = yield* authorService.getAuthorsByNationality(nationality)

    return jsonResponse(authors)
  })),

  HttpRouter.get("/authors/name/:name", Effect.gen(function* () {
    const request = yield* HttpServerRequest.HttpServerRequest
    const name = request.params.name
    const authorService = yield* AuthorService
    const authors = yield* authorService.getAuthorsByName(name)

    return jsonResponse(authors)
  }))
)
