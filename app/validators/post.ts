// app/validators/post.ts
import vine from '@vinejs/vine'

export const createPostValidator = vine.compile(
  vine.object({
    title: vine.string().minLength(5),
    content: vine.string().optional(),
    // image: vine.file({ size: '2mb', extnames: ['jpg', 'png'] }).optional(),
    modules: vine.array(vine.number()).optional(),
  })
)

export const updatePostValidator = vine.compile(
  vine.object({
    title: vine.string().minLength(5),
    content: vine.string().optional(),
    // image: vine.file({ size: '2mb', extnames: ['jpg', 'png'] }).optional(),
  })
)
