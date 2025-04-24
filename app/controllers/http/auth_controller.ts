import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import User, { UserRole } from '#models/user'
import { registerValidator, loginValidator } from '#validators/auth'
// import { updateAccountValidator } from '#validators/auth'
// import type { MultipartFile } from '@adonisjs/core/bodyparser'
// import hash from '@adonisjs/core/services/hash'

type RegisterData = {
  email: string
  password: string
  student_id: string
  username: string
  phone_number?: string
  avatar?: string
}

// type LoginData = {
//   email: string
//   password: string
// }

// type UpdateAccountData = {
//   username?: string
//   phone_number?: string
//   current_password?: string
//   new_password?: string
//   avatar?: MultipartFile
// }

export default class AuthController {
  @inject()
  async register({ inertia, request }: HttpContext) {
    console.log('Rendering register page')
    return inertia.render('auth', { csrfToken: request.csrfToken })
  }

  @inject()
  async login({ inertia, request }: HttpContext) {
    console.log('Rendering login page')
    return inertia.render('auth', { showLogin: true, csrfToken: request.csrfToken })
  }

  @inject()
  async store({ request, response, auth, session }: HttpContext) {
    console.log('Starting user registration process')

    try {
      const data = (await request.validateUsing(registerValidator)) as RegisterData
      console.log('Registration data:', data)

      const existingUser = await User.query()
        .where('email', data.email)
        .orWhere('student_id', data.student_id)
        .first()

      if (existingUser) {
        console.log('User already exists:', {
          email: existingUser.email,
          student_id: existingUser.student_id,
        })
        session.flash('errors', {
          email: existingUser.email === data.email ? 'Email đã tồn tại' : '',
          student_id: existingUser.student_id === data.student_id ? 'Mã sinh viên đã tồn tại' : '',
        })
        return response.redirect().back()
      }

      console.log('Creating new user...')
      const user = await User.create({
        ...data,
        role: UserRole.USER,
      })
      console.log('User created:', user.toJSON())

      console.log('Logging in user...')
      await auth.use('web').login(user)
      console.log('User logged in successfully')

      console.log('Redirecting to posts page')
      return response.redirect().toRoute('post')
    } catch (error) {
      console.error('Error during registration:', error.message)
      console.error('Stack trace:', error.stack)
      session.flash('errors', { error: 'Đã xảy ra lỗi khi đăng ký' })
      return response.redirect().back()
    }
  }

  @inject()
  async authenticate({ request, response, auth, session }: HttpContext) {
    try {
      console.log('Request body:', request.body()) // Log toàn bộ body request

      const { email, password } = await request.validateUsing(loginValidator)
      console.log('Validated credentials:', { email, password })

      // Kiểm tra CSRF token
      console.log('CSRF token:', request.input('_csrf'))

      const user = await User.verifyCredentials(email, password)
      console.log('User found:', user.toJSON())

      await auth.use('web').login(user)
      console.log('Login successful. Session:', {
        isAuthenticated: auth.isAuthenticated,
        user: auth.user,
      })
      return response.redirect().toRoute(user.role === UserRole.ADMIN ? 'admin.dashboard' : 'post')
    } catch (error) {
      console.error('Authentication failed:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
        session: session.all(),
        headers: request.headers(),
        cookies: request.cookiesList(),
      })

      session.flash('errors', {
        email: 'Thông tin đăng nhập không chính xác',
        _csrf: request.input('_csrf'), // Debug CSRF token
      })

      return response.redirect().back()
    }
  }

  @inject()
  async logout({ response, auth }: HttpContext) {
    console.log('Starting logout process')

    try {
      console.log('Logging out user...')
      await auth.use('web').logout()
      console.log('User logged out successfully')

      console.log('Redirecting to /')
      return response.redirect().toPath('/')
    } catch (error) {
      console.error('Logout error:', error.message)
      console.error('Stack trace:', error.stack)
      return response.redirect().toPath('/')
    }
  }

  // Comment phương thức updateProfile theo yêu cầu
  /*
  @inject()
  async updateProfile({ request, response, auth, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const data = (await request.validateUsing(updateAccountValidator)) as UpdateAccountData

    try {
      const updateData: Partial<UpdateAccountData> = {
        username: data.username,
        phone_number: data.phone_number,
      }

      if (data.avatar) {
        const file = data.avatar
        const fileName = `${Date.now()}-${file.clientName}`
        await file.moveToDisk('uploads', { name: fileName })
        updateData.avatar = `/uploads/${fileName}`
      }

      if (data.current_password && data.new_password) {
        const isPasswordValid = await hash.verify(user.password, data.current_password)
        if (!isPasswordValid) {
          session.flash('errors', { error: 'Mật khẩu hiện tại không đúng' })
          return response.redirect().back()
        }
        updateData.new_password = data.new_password
      }

      await user.merge(updateData).save()

      session.flash('success', 'Cập nhật thông tin thành công')
      return response.redirect().back()
    } catch (error) {
      session.flash('errors', { error: 'Không thể cập nhật thông tin' })
      return response.redirect().back()
    }
  }
  */

  @inject()
  async deleteAccount({ response, auth }: HttpContext) {
    console.log('Starting delete account process')

    try {
      const user = auth.getUserOrFail()
      console.log('User to delete:', user.toJSON())

      console.log('Deleting user...')
      await user.delete()
      console.log('User deleted successfully')

      console.log('Logging out user...')
      await auth.use('web').logout()
      console.log('User logged out successfully')

      console.log('Redirecting to /')
      return response.redirect().toPath('/')
    } catch (error) {
      console.error('Delete account error:', error.message)
      console.error('Stack trace:', error.stack)
      return response.redirect().toPath('/')
    }
  }
}
