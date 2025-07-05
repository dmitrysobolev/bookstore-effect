import { Schema } from "effect";

export class NotFoundError extends Schema.TaggedError<NotFoundError>()("NotFoundError", {
  message: Schema.String,
}) {}

export class ValidationError extends Schema.TaggedError<ValidationError>()("ValidationError", {
  message: Schema.String,
}) {}

export class DatabaseError extends Schema.TaggedError<DatabaseError>()("DatabaseError", {
  message: Schema.String,
}) {}

export class BusinessError extends Schema.TaggedError<BusinessError>()("BusinessError", {
    message: Schema.String,
}) {}

export type AppError = NotFoundError | ValidationError | DatabaseError | BusinessError;
