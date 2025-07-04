import { Schema } from "effect"

export const AuthorId = Schema.String.pipe(Schema.brand("AuthorId"))
export type AuthorId = typeof AuthorId.Type

export const Author = Schema.Struct({
  _id: Schema.optional(AuthorId),
  firstName: Schema.String,
  lastName: Schema.String,
  fullName: Schema.String,
  biography: Schema.optional(Schema.String),
  birthDate: Schema.optional(Schema.Date),
  nationality: Schema.optional(Schema.String),
  website: Schema.optional(Schema.String),
  socialLinks: Schema.optional(Schema.Struct({
    twitter: Schema.optional(Schema.String),
    facebook: Schema.optional(Schema.String),
    instagram: Schema.optional(Schema.String),
    linkedin: Schema.optional(Schema.String)
  })),
  profileImageUrl: Schema.optional(Schema.String),
  createdAt: Schema.optional(Schema.Date),
  updatedAt: Schema.optional(Schema.Date)
})

export type Author = typeof Author.Type

export const CreateAuthorRequest = Schema.Struct({
  firstName: Schema.String,
  lastName: Schema.String,
  fullName: Schema.String,
  biography: Schema.optional(Schema.String),
  birthDate: Schema.optional(Schema.Date),
  nationality: Schema.optional(Schema.String),
  website: Schema.optional(Schema.String),
  socialLinks: Schema.optional(Schema.Struct({
    twitter: Schema.optional(Schema.String),
    facebook: Schema.optional(Schema.String),
    instagram: Schema.optional(Schema.String),
    linkedin: Schema.optional(Schema.String)
  })),
  profileImageUrl: Schema.optional(Schema.String)
})

export type CreateAuthorRequest = typeof CreateAuthorRequest.Type

export const UpdateAuthorRequest = Schema.Struct({
  firstName: Schema.optional(Schema.String),
  lastName: Schema.optional(Schema.String),
  fullName: Schema.optional(Schema.String),
  biography: Schema.optional(Schema.String),
  birthDate: Schema.optional(Schema.Date),
  nationality: Schema.optional(Schema.String),
  website: Schema.optional(Schema.String),
  socialLinks: Schema.optional(Schema.Struct({
    twitter: Schema.optional(Schema.String),
    facebook: Schema.optional(Schema.String),
    instagram: Schema.optional(Schema.String),
    linkedin: Schema.optional(Schema.String)
  })),
  profileImageUrl: Schema.optional(Schema.String)
})

export type UpdateAuthorRequest = typeof UpdateAuthorRequest.Type
