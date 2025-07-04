import { Context, Effect, Layer, Option } from "effect";
import { AuthorRepository } from "../repositories/author-repository";
import {
  Author,
  AuthorId,
  CreateAuthorRequest,
  UpdateAuthorRequest,
} from "../models/author";

export interface AuthorService {
  getAllAuthors: () => Effect.Effect<Author[], Error>;
  getAuthorById: (id: AuthorId) => Effect.Effect<Option.Option<Author>, Error>;
  getAuthorsByIds: (ids: AuthorId[]) => Effect.Effect<Author[], Error>;
  createAuthor: (author: CreateAuthorRequest) => Effect.Effect<Author, Error>;
  updateAuthor: (
    id: AuthorId,
    author: UpdateAuthorRequest,
  ) => Effect.Effect<Option.Option<Author>, Error>;
  deleteAuthor: (id: AuthorId) => Effect.Effect<boolean, Error>;
  searchAuthors: (query: string) => Effect.Effect<Author[], Error>;
  getAuthorsByNationality: (
    nationality: string,
  ) => Effect.Effect<Author[], Error>;
  validateAuthorExists: (id: AuthorId) => Effect.Effect<boolean, Error>;
  getAuthorsByName: (name: string) => Effect.Effect<Author[], Error>;
}

export const AuthorService = Context.GenericTag<AuthorService>("AuthorService");

const make = Effect.gen(function* () {
  const authorRepository = yield* AuthorRepository;

  const getAllAuthors = () => authorRepository.findAll();

  const getAuthorById = (id: AuthorId) => authorRepository.findById(id);

  const getAuthorsByIds = (ids: AuthorId[]) => authorRepository.findByIds(ids);

  const createAuthor = (authorData: CreateAuthorRequest) =>
    Effect.gen(function* () {
      // Check if author with same full name already exists
      const existingAuthors = yield* authorRepository.findByName(
        authorData.fullName,
      );
      const duplicateAuthor = existingAuthors.find(
        (author) =>
          author.fullName.toLowerCase() === authorData.fullName.toLowerCase(),
      );

      if (duplicateAuthor) {
        yield* Effect.fail(
          new Error(`Author with name "${authorData.fullName}" already exists`),
        );
      }

      return yield* authorRepository.create(authorData);
    });

  const updateAuthor = (id: AuthorId, updateData: UpdateAuthorRequest) =>
    Effect.gen(function* () {
      // If updating fullName, check for duplicates
      if (updateData.fullName) {
        const existingAuthors = yield* authorRepository.findByName(
          updateData.fullName,
        );
        const duplicateAuthor = existingAuthors.find(
          (author) =>
            author.fullName.toLowerCase() ===
              updateData.fullName!.toLowerCase() && author._id !== id,
        );

        if (duplicateAuthor) {
          yield* Effect.fail(
            new Error(
              `Author with name "${updateData.fullName}" already exists`,
            ),
          );
        }
      }

      return yield* authorRepository.update(id, updateData);
    });

  const deleteAuthor = (id: AuthorId) => authorRepository.delete(id);

  const searchAuthors = (query: string) =>
    authorRepository
      .findAll()
      .pipe(
        Effect.map((authors) =>
          authors.filter(
            (author) =>
              author.firstName.toLowerCase().includes(query.toLowerCase()) ||
              author.lastName.toLowerCase().includes(query.toLowerCase()) ||
              author.fullName.toLowerCase().includes(query.toLowerCase()) ||
              (author.biography &&
                author.biography.toLowerCase().includes(query.toLowerCase())) ||
              (author.nationality &&
                author.nationality.toLowerCase().includes(query.toLowerCase())),
          ),
        ),
      );

  const getAuthorsByNationality = (nationality: string) =>
    authorRepository.findByNationality(nationality);

  const validateAuthorExists = (id: AuthorId) =>
    authorRepository.findById(id).pipe(Effect.map(Option.isSome));

  const getAuthorsByName = (name: string) => authorRepository.findByName(name);

  return {
    getAllAuthors,
    getAuthorById,
    getAuthorsByIds,
    createAuthor,
    updateAuthor,
    deleteAuthor,
    searchAuthors,
    getAuthorsByNationality,
    validateAuthorExists,
    getAuthorsByName,
  };
});

export const AuthorServiceLive = Layer.effect(AuthorService, make).pipe(
  Layer.provide(AuthorRepository),
);
