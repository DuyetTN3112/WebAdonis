import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import User, { UserRole } from '#models/user'
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
  async store({ request, response, auth, session }: HttpContext & { auth: WebAuthService }) {
    const data = (await request.validateUsing(registerValidator)) as RegisterData

    const existingUser = await User.query()
      .where('email', data.email)
      .orWhere('student_id', data.student_id)
      .first()

    if (existingUser) {
      session.flash('errors', {
        email: existingUser.email === data.email ? 'Email đã tồn tại' : '',
        student_id: existingUser.student_id === data.student_id ? 'Mã sinh viên đã tồn tại' : '',
      })
      return response.redirect().back()
    }

    const user = await User.create({
      ...data,
      role: UserRole.USER,
    })

    await auth.use('web').login(user)
    return response.redirect().toRoute('post')
  }

  @inject()
  async authenticate({ request, response, auth, session }: HttpContext & { auth: WebAuthService }) {
    const { email, password } = (await request.validateUsing(loginValidator)) as LoginData

    try {
      await auth.use('web').attempt(email, password)
      const user = auth.use('web').user
      if (!user) {
        throw new Error('User not found')
      }

      return response.redirect().toRoute(user.role === UserRole.ADMIN ? 'admin.dashboard' : 'post')
    } catch {
      session.flash('errors', {
        email: 'Thông tin đăng nhập không chính xác',
      })
      return response.redirect().back()
    }
  }

  @inject()
  async logout({ response, auth }: HttpContext & { auth: WebAuthService }) {
    await auth.use('web').logout()
    return response.redirect().toPath('/')
  }

  @inject()
  async updateProfile({
    request,
    response,
    auth,
    session,
  }: HttpContext & { auth: WebAuthService }) {
    const user = auth.use('web').getUserOrFail()
    const data = (await request.validateUsing(updateAccountValidator)) as UpdateAccountData

    try {
      const updateData = {
        full_name: data.full_name,
        phone_number: data.phone,
        current_password: data.current_password,
        new_password: data.new_password,
      }

      await user.merge(updateData).save()

      session.flash('success', 'Cập nhật thông tin thành công')
      return response.redirect().back()
    } catch (error) {
      session.flash('errors', { error: 'Không thể cập nhật thông tin' })
      return response.redirect().back()
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
