import vine from '@vinejs/vine'

export const registerValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string().minLength(8),
    student_id: vine.string(),
    full_name: vine.string(),
    phone: vine.string().optional(),
    avatar: vine.string().optional(),
  })
)

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string(),
  })
)

export const updateAccountValidator = vine.compile(
  vine.object({
    full_name: vine.string().optional(),
    phone: vine.string().optional(),
    current_password: vine.string().optional(),
    new_password: vine.string().minLength(6).optional(),
  })
)
