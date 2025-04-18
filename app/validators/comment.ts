import vine from '@vinejs/vine'

export const createCommentValidator = {
  schema: vine.object({
    content: vine.string().escape().trim().minLength(1).maxLength(2000),
    image: vine.string().optional(),
  }),
}

export const updateCommentValidator = {
  schema: vine.object({
    content: vine.string().escape().trim().minLength(1).maxLength(2000),
  }),
}
