// app/Controllers/Http/AuthController.ts
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import User, { UserRole } from '#models/user'
import { registerValidator, loginValidator } from '#validators/auth'
// import { updateAccountValidator } from '#validators/auth'
// import type { MultipartFile } from '@ioc:Adonis/Core/BodyParser'
// import hash from '@ioc:Adonis/Core/Hash'

type RegisterData = {
  email: string
  password: string
  student_id: string
  username: string
  phone_number?: string
  avatar?: string
}

export default class AuthController {
  @inject()
  public async register({ inertia, request }: HttpContext) {
    console.log('Rendering register page')
    return inertia.render('auth', { csrfToken: request.csrfToken })
  }

  @inject()
  public async login({ inertia, request }: HttpContext) {
    return inertia.render('auth', { showLogin: true, csrfToken: request.csrfToken })
  }

  @inject()
  public async store({ request, response, auth, session }: HttpContext) {
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
      const user = await User.create({ ...data, role: UserRole.USER })
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
  public async authenticate({ request, response, auth, session }: HttpContext) {
    try {
      const { email, password } = await request.validateUsing(loginValidator)
      const user = await User.verifyCredentials(email, password)
      await auth.use('web').login(user)
      return response.redirect().toRoute('post')
    } catch (error) {
      // bug DB, hoặc creds sai
      session.flash('errors', { error: 'Thông tin đăng nhập không chính xác' })
      // Redirect back (Inertia sẽ gửi header X-Inertia-Location)
      return response.redirect().back()
    }
  }

  @inject()
  public async logout({ response, auth }: HttpContext) {
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

  // Commented out per requirements
  /*
  @inject()
  public async updateProfile(...) { ... }
  */

  @inject()
  public async deleteAccount({ response, auth }: HttpContext) {
    console.log('Starting delete account process')
    try {
      const user = auth.use('web').getUserOrFail()
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
