import vine from '@vinejs/vine'

export const createModuleValidator = vine.compile(
  vine.object({
    name: vine.string().trim().maxLength(255),
    description: vine.string().trim().maxLength(1000).optional(),
    is_private: vine.boolean().optional(),
    is_hidden: vine.boolean().optional(),
    user_id: vine.number(),
  })
)

export const updateModuleValidator = vine.compile(
  vine.object({
    name: vine.string().trim().maxLength(255).optional(),
    description: vine.string().trim().maxLength(1000).optional(),
    is_private: vine.boolean().optional(),
    is_hidden: vine.boolean().optional(),
  })
)

export const moduleIdValidator = vine.compile(
  vine.object({
    module_id: vine.number(),
  })
)
