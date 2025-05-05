// start/routes.ts
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
import Redis from '@adonisjs/redis/services/main'

router
  .group(() => {
    // Public routes (show auth page for unauthenticated users)
    router
      .get('/', [() => import('#controllers/http/auth_controller'), 'register'])
      .use(middleware.guest())
    router
      .get('/login', [() => import('#controllers/http/auth_controller'), 'login'])
      .use(middleware.guest())
    router
      .post('/register', [() => import('#controllers/http/auth_controller'), 'store'])
      .use(middleware.guest())
    router
      .post('/login', [() => import('#controllers/http/auth_controller'), 'authenticate'])
      .use(middleware.guest())
    router.post('/logout', [() => import('#controllers/http/auth_controller'), 'logout'])
    // Thêm route GET cho logout để xử lý link từ sidebar
    router.get('/logout', [() => import('#controllers/http/auth_controller'), 'logout'])
    // router
    //   .post('/update_profile', [() => import('#controllers/http/auth_controller'), 'updateProfile'])
    //   .use(middleware.auth())

    router
      .delete('/delete_account', [
        () => import('#controllers/http/auth_controller'),
        'deleteAccount',
      ])
      .use(middleware.auth())

    // Protected routes
    router
      .get('/posts', [() => import('#controllers/http/post_controller'), 'index'])
      .use(middleware.auth())
    router
      .post('/posts', [() => import('#controllers/http/post_controller'), 'store'])
      .use(middleware.auth())
    router
      .delete('/posts/:id', [() => import('#controllers/http/post_controller'), 'destroy'])
      .use(middleware.auth())
    router
      .put('/posts/:id', [() => import('#controllers/http/post_controller'), 'update'])
      .use(middleware.auth())
    router.get('/modules', [() => import('#controllers/http/module_controller'), 'index'])
    router
      .get('/profile', [() => import('#controllers/http/user_controller'), 'index'])
      .use(middleware.auth({ guards: ['web'] }))

    router.put('/profile', [() => import('#controllers/http/user_controller'), 'update'])
    router.post('/profile/avatar', [
      () => import('#controllers/http/user_controller'),
      'updateAvatar',
    ])
    router
      .post('/profile/password', [
        () => import('#controllers/http/user_controller'),
        'updatePassword',
      ])
      .use(middleware.auth())
    router
      .post('/post/:id/like-dislike', [
        () => import('#controllers/http/post_controller'),
        'likeDislike',
      ])
      .use(middleware.auth())

    // Comment routes
    router
      .post('/posts/:post_id/comments', '#controllers/http/comment_controller.store')
      .use(middleware.auth())

    router
      .get('/comments/:id/edit', '#controllers/http/comment_controller.edit')
      .use(middleware.auth())

    router
      .put('/comments/:id', '#controllers/http/comment_controller.update')
      .use(middleware.auth())

    router
      .delete('/comments/:id', '#controllers/http/comment_controller.destroy')
      .use(middleware.auth())

    // Notification routes
    router
      .get('/notifications', '#controllers/http/notification_controller.index')
      .use(middleware.auth())

    router
      .post(
        '/notifications/:id/mark-as-read',
        '#controllers/http/notification_controller.markAsRead'
      )
      .use(middleware.auth())

    router
      .post(
        '/notifications/mark-all-as-read',
        '#controllers/http/notification_controller.markAllAsRead'
      )
      .use(middleware.auth())

    router
      .get(
        '/notifications/unread-count',
        '#controllers/http/notification_controller.getUnreadCount'
      )
      .use(middleware.auth())
    router
      .delete('/notifications/:id', '#controllers/http/notification_controller.destroy')
      .use(middleware.auth())

    // API routes (protected)
    router.get('/api/modules', [() => import('#controllers/http/module_controller'), 'getModules'])
    // routes.ts
    router.get('/api/modules/:id/posts', '#controllers/http/module_controller.getPosts')

    router.get('/search', '#controllers/http/search_controller.handle').use(middleware.auth())

    router.get('/test-redis', async () => {
      await Redis.set('test-key', 'hello')
      return 'ok'
    })

    router.get('/me', async ({ auth }) => {
      await auth.check() // kiểm tra đã đăng nhập chưa
      return auth.user // trả về thông tin user hiện tại
    })

    router.get('/test-redis-key', async ({ response }) => {
      try {
        const redisModule = await import('@adonisjs/redis/services/main')
        const redis = redisModule.default
        // Test set/get
        await redis.set('test_key', 'Thử nghiệm Redis')
        const value = await redis.get('test_key')

        // Liệt kê tất cả keys
        const keys = await redis.keys('*')
        return response.json({
          success: true,
          value,
          keys,
          message: 'Redis hoạt động tốt',
        })
      } catch (error) {
        return response.status(500).json({
          success: false,
          error: error.message,
          message: 'Redis không hoạt động',
        })
      }
    })
  })
  .use(middleware.silentAuth())
