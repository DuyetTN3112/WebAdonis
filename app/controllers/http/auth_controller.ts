// app/Controllers/Http/AuthController.ts
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import User, { UserRole } from '#models/user'
import { registerValidator, loginValidator } from '#validators/auth'
// import { updateAccountValidator } from '#validators/auth'
// import type { MultipartFile } from '@ioc:Adonis/Core/BodyParser'

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
    console.log('Hiển thị trang đăng ký')
    return inertia.render('auth', { csrfToken: request.csrfToken })
  }

  @inject()
  public async login({ inertia, request }: HttpContext) {
    return inertia.render('auth', { showLogin: true, csrfToken: request.csrfToken })
  }

  @inject()
  public async store({ request, response, auth, session }: HttpContext) {
    console.log('Bắt đầu quá trình đăng ký người dùng')
    try {
      const data = (await request.validateUsing(registerValidator)) as RegisterData
      console.log('Dữ liệu đăng ký:', data)

      const existingUser = await User.query()
        .where('email', data.email)
        .orWhere('student_id', data.student_id)
        .first()

      if (existingUser) {
        console.log('Người dùng đã tồn tại:', {
          email: existingUser.email,
          student_id: existingUser.student_id,
        })
        session.flash('errors', {
          email: existingUser.email === data.email ? 'Email đã tồn tại' : '',
          student_id: existingUser.student_id === data.student_id ? 'Mã sinh viên đã tồn tại' : '',
        })
        return response.redirect().back()
      }

      console.log('Tạo người dùng mới...')
      const user = await User.create({ ...data, role: UserRole.USER })
      console.log('Đã tạo người dùng:', user.toJSON())

      console.log('Đăng nhập người dùng...')
      await auth.use('web').login(user)
      console.log('Đăng nhập thành công, user:', user)
      console.log('Session sau đăng nhập:', session.all())
      console.log('Đăng nhập thành công')

      console.log('Session ID:', session.sessionId)
      console.log('Session Data:', session.all())
      console.log('auth.user:', auth.user)
      console.log('auth.isAuthenticated:', await auth.check())

      console.log('Chuyển hướng đến trang bài viết')
      return response.redirect().toPath('/posts')
    } catch (error) {
      console.error('Lỗi trong quá trình đăng ký:', error.message)
      console.error('Chi tiết lỗi:', error.stack)
      session.flash('errors', { error: 'Đã xảy ra lỗi khi đăng ký' })
      return response.redirect().back()
    }
  }

  @inject()
  public async authenticate({ request, response, auth, session }: HttpContext) {
    try {
      const { email, password } = await request.validateUsing(loginValidator)
      console.log('Đang xác thực người dùng:', { email, password })
      const user = await User.findBy('email', email)
      console.log(
        'Kết quả tìm kiếm người dùng:',
        user ? `Tìm thấy (ID: ${user.id})` : 'Không tìm thấy'
      )
      if (!user) {
        session.flash('errors', { error: 'Tài khoản không tồn tại' })
        return response.redirect().back()
      }
      // Debug mật khẩu - QUAN TRỌNG: kiểm tra mật khẩu trong DB
      console.log('Mật khẩu hiện tại:', password)
      console.log('Hash trong DB:', user.password)
      const isPasswordValid = await user.verifyPassword(password)
      console.log('Kết quả xác thực mật khẩu:', isPasswordValid ? 'Hợp lệ' : 'Không hợp lệ')
      if (!isPasswordValid) {
        session.flash('errors', { error: 'Sai mật khẩu' })
        return response.redirect().back()
      }
      // Xóa session hiện tại và tạo mới
      await session.regenerate()
      // Đăng nhập và lưu session
      await auth.use('web').login(user)
      // Kiểm tra session đã lưu đúng chưa
      console.log('Session ID:', session.sessionId)
      console.log('Session Data:', session.all())
      console.log('auth.user sau khi đăng nhập:', auth.user)
      console.log('auth.isAuthenticated:', await auth.check())
      // Redis debug
      try {
        const redisModule = await import('@adonisjs/redis/services/main')
        const redis = redisModule.default
        // Thử cả hai định dạng key có thể có
        const sessionKey1 = `session:${session.sessionId}`
        const sessionKey2 = `${session.sessionId}:session`
        const sessionData1 = await redis.get(sessionKey1)
        const sessionData2 = await redis.get(sessionKey2)
        console.log('Redis Session Key 1:', sessionKey1)
        console.log('Redis Session Data 1:', sessionData1)
        console.log('Redis Session Key 2:', sessionKey2)
        console.log('Redis Session Data 2:', sessionData2)
      } catch (error) {
        console.error('Redis error:', error)
      }
      return response.redirect().toPath('/posts')
    } catch (error) {
      console.error('Lỗi đăng nhập:', error)
      session.flash('errors', { error: 'Đăng nhập thất bại. Vui lòng thử lại.' })
      return response.redirect().back()
    }
  }

  @inject()
  public async logout({ response, auth, session, request }: HttpContext) {
    console.log('Bắt đầu quá trình đăng xuất')
    try {
      // In thông tin debug
      console.log('Session ID trước khi logout:', session.sessionId)
      console.log('CSRF Token:', request.csrfToken)
      console.log('POST data:', request.all())
      // Kiểm tra xem người dùng có đăng nhập không
      if (await auth.check()) {
        console.log('Đang đăng xuất người dùng...')
        await auth.use('web').logout()
        // Xóa session
        await session.regenerate()
        // Thêm thông báo thành công
        session.flash('message', 'Đăng xuất thành công!')
        console.log('Đăng xuất thành công')
      } else {
        console.log('Không có người dùng đang đăng nhập')
      }

      console.log('Chuyển hướng về trang chủ')
      return response.redirect().toPath('/')
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error.message)
      console.error('Chi tiết lỗi:', error.stack)
      // Xóa session dù có lỗi
      try {
        await auth.use('web').logout()
        await session.regenerate()
      } catch (innerError) {
        console.error('Lỗi khi cố gắng xóa session:', innerError)
      }
      // Thêm thông báo lỗi
      session.flash('error', 'Có lỗi xảy ra khi đăng xuất!')
      return response.redirect().toPath('/')
    }
  }

  @inject()
  public async deleteAccount({ response, auth, session, request }: HttpContext) {
    console.log('Bắt đầu quá trình xóa tài khoản')
    try {
      const user = auth.use('web').user

      if (!user) {
        session.flash('error', 'Bạn cần đăng nhập để thực hiện hành động này')
        return response.redirect().toPath('/login')
      }

      console.log('Người dùng sẽ bị xóa:', user.toJSON())

      // Thực hiện xóa tài khoản
      try {
        await user.delete()
        console.log('Đã xóa người dùng thành công')
      } catch (deleteError) {
        console.error('Lỗi xóa người dùng:', deleteError)
        // Xử lý lỗi khóa ngoại
        if (deleteError.code === 'ER_ROW_IS_REFERENCED_2') {
          let errorMessage = 'Không thể xóa tài khoản vì còn dữ liệu liên quan.'
          // Nếu là API request, trả về lỗi dạng JSON
          if (request.accepts(['html', 'json']) === 'json') {
            return response.status(400).json({
              success: false,
              message: errorMessage,
              detail: 'Cần xóa các bình luận và bài viết trước khi xóa tài khoản',
            })
          }
          session.flash('error', errorMessage)
          return response.redirect().back()
        }
        // Nếu là lỗi khác
        if (request.accepts(['html', 'json']) === 'json') {
          return response.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi xóa tài khoản',
          })
        }
        session.flash('error', 'Có lỗi xảy ra khi xóa tài khoản')
        return response.redirect().back()
      }

      // Đăng xuất người dùng
      await auth.use('web').logout()
      console.log('Đăng xuất thành công')

      // Thêm thông báo
      session.flash('message', 'Tài khoản của bạn đã được xóa thành công')

      // Chuyển hướng về trang đăng ký/đăng nhập
      return response.redirect().toPath('/')
    } catch (error) {
      console.error('Lỗi khi xóa tài khoản:', error.message)
      console.error('Chi tiết lỗi:', error.stack)

      // Xử lý lỗi
      if (error.name === 'AuthenticationException') {
        session.flash('error', 'Bạn chưa đăng nhập')
        return response.redirect().toPath('/login')
      }

      // Thông báo lỗi
      session.flash('error', 'Có lỗi xảy ra khi xóa tài khoản')

      // Kiểm tra nếu là API request
      if (request.accepts(['html', 'json']) === 'json') {
        return response.status(500).json({
          success: false,
          message: 'Đã xảy ra lỗi khi xóa tài khoản',
        })
      }

      return response.redirect().toPath('/')
    }
  }
}
