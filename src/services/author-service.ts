import { Context, Effect, Layer, Option } from "effect";
import {
  AuthorRepository,
  AuthorRepositoryLive,
} from "../repositories/author-repository";
import {
  Author,
  AuthorId,
  CreateAuthorRequest,
  UpdateAuthorRequest,
} from "../models/author";
import { AppError, BusinessError, NotFoundError } from "../errors";

export interface AuthorService {
  getAllAuthors: () => Effect.Effect<Author[], AppError>;
  getAuthorById: (id: AuthorId) => Effect.Effect<Author, AppError>;
  getAuthorsByIds: (ids: AuthorId[]) => Effect.Effect<Author[], AppError>;
  createAuthor: (author: CreateAuthorRequest) => Effect.Effect<Author, AppError>;
  updateAuthor: (
    id: AuthorId,
    author: UpdateAuthorRequest,
  ) => Effect.Effect<Author, AppError>;
  deleteAuthor: (id: AuthorId) => Effect.Effect<void, AppError>;
  searchAuthors: (query: string) => Effect.Effect<Author[], AppError>;
  getAuthorsByNationality: (
    nationality: string,
  ) => Effect.Effect<Author[], AppError>;
  validateAuthorExists: (id: AuthorId) => Effect.Effect<boolean, AppError>;
  getAuthorsByName: (name: string) => Effect.Effect<Author[], AppError>;
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
        return yield* Effect.fail(
          new BusinessError({
            message: `Author with name "${authorData.fullName}" already exists`,
          }),
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
          return yield* Effect.fail(
            new BusinessError({
              message: `Author with name "${updateData.fullName}" already exists`,
            }),
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
    authorRepository.findById(id).pipe(
      Effect.as(true),
      Effect.catchTag("NotFoundError", () => Effect.succeed(false)),
    );

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
  Layer.provide(AuthorRepositoryLive),
);
