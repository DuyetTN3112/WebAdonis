import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { UserRole } from '#models/user'
import { registerValidator, loginValidator, updateAccountValidator } from '#validators/auth'
import type { MultipartFile } from '@adonisjs/core/bodyparser'
import type { AuthService } from '@adonisjs/auth/types'

type RegisterData = {
  email: string
  password: string
  student_id: string
  full_name: string
  phone?: string
  avatar?: string
}

type LoginData = {
  email: string
  password: string
}

type UpdateAccountData = {
  full_name?: string
  phone?: string
  current_password?: string
  new_password?: string
  avatar?: MultipartFile
}

interface WebAuthService extends AuthService {
  use(guard: 'web'): {
    login(user: User): Promise<void>
    attempt(email: string, password: string): Promise<void>
    logout(): Promise<void>
    user: User | null
    getUserOrFail(): User
  }
}

export default class AuthController {
  @inject()
  async register({ inertia }: HttpContext) {
    return inertia.render('auth')
  }

  @inject()
  async login({ inertia }: HttpContext) {
    return inertia.render('auth/login')
  }

  @inject()
  async store({ request, response, auth }: HttpContext & { auth: WebAuthService }) {
    // Validate request data using VineJS
    const data = (await request.validateUsing(registerValidator)) as RegisterData

    // Check for existing user
    const existingUser = await User.query()
      .where('email', data.email)
      .orWhere('student_id', data.student_id)
      .first()

    if (existingUser) {
      return response
        .redirect()
        .back()
        .withErrors({
          email: existingUser.email === data.email ? 'Email đã tồn tại' : null,
          student_id:
            existingUser.student_id === data.student_id ? 'Mã sinh viên đã tồn tại' : null,
        })
    }

    // Create user with default role as USER
    const user = await User.create({
      ...data,
      role: UserRole.USER,
    })

    await auth.use('web').login(user)

    return response.redirect().toRoute('home')
  }

  @inject()
  async authenticate({ request, response, auth }: HttpContext & { auth: WebAuthService }) {
    // Validate login data
    const { email, password } = (await request.validateUsing(loginValidator)) as LoginData

    try {
      await auth.use('web').attempt(email, password)
      const user = auth.use('web').user
      if (!user) {
        throw new Error('User not found')
      }
      return response.redirect().toRoute(user.role === UserRole.ADMIN ? 'admin.dashboard' : 'home')
    } catch {
      return response.redirect().back().withErrors({
        email: 'Thông tin đăng nhập không chính xác',
      })
    }
  }

  @inject()
  async logout({ response, auth }: HttpContext & { auth: WebAuthService }) {
    await auth.use('web').logout()
    return response.redirect().toPath('/')
  }

  @inject()
  async updateProfile({ request, response, auth }: HttpContext & { auth: WebAuthService }) {
    const user = auth.use('web').getUserOrFail()
    // Validate update data
    const data = (await request.validateUsing(updateAccountValidator)) as UpdateAccountData

    try {
      const updateData = {
        full_name: data.full_name,
        phone_number: data.phone,
        current_password: data.current_password,
        new_password: data.new_password,
      }
      await user.merge(updateData).save()

      return response.redirect().back().withSuccess('Cập nhật thông tin thành công')
    } catch (error) {
      return response.redirect().back().withErrors({ error: 'Không thể cập nhật thông tin' })
    }
  }

  @inject()
  async deleteAccount({ response, auth }: HttpContext & { auth: WebAuthService }) {
    const user = auth.use('web').getUserOrFail()
    await user.delete()
    await auth.use('web').logout()
    return response.redirect().toPath('/')
  }
}
