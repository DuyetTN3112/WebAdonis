import vine from '@vinejs/vine'

export const registerValidator = vine.compile(
  vine.object({
    username: vine.string().minLength(3),
    email: vine.string().email(),
    password: vine.string().minLength(8),
    student_id: vine.string(),
    phone_number: vine.string().optional(),
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
    username: vine.string().minLength(3).optional(),
    phone_number: vine.string().optional(),
    current_password: vine.string().optional(),
    new_password: vine.string().minLength(6).optional(),
  })
)

export const updatePasswordValidator = vine.compile(
  vine.object({
    current_password: vine.string(),
    new_password: vine.string().minLength(8),
    confirm_password: vine.string().confirmed({ confirmationField: 'new_password' }),
  })
)
