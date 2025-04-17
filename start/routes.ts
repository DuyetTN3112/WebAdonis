import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Auth routes
router
  .group(() => {
    router.get('/register', 'auth_controller.register').as('auth.register')
    router.post('/register', 'auth_controller.store')
    router.get('/login', 'auth_controller.login').as('auth.login')
    router.post('/login', 'auth_controller.authenticate')
    router.post('/logout', 'auth_controller.logout')
  })
  .use(middleware.guest)

// Protected routes (require authentication)
router
  .group(() => {
    // Home page
    router.get('/home', 'home_controller.index').as('home')
    // Posts
    router.resource('posts', 'posts_controller')
    // Comments
    router.resource('comments', 'comments_controller')
    // Modules
    router.resource('modules', 'modules_controller')
    // Users
    router.resource('users', 'users_controller')
    // Profile
    router.get('/profile', 'user_controller.show').as('profile')
    router.put('/profile', 'user_controller.update')
  })
  .use(middleware.auth)

router
  .group(() => {
    router.get('/admin', 'admin_controller.index').as('admin.dashboard')
    router.resource('admin/users', 'admin/users_controller')
    router.resource('admin/posts', 'admin/posts_controller')
    router.resource('admin/modules', 'admin/modules_controller')
  })
  .use([middleware.auth, middleware.admin])
  .prefix('/admin')

router.get('/test-redis', 'redis_test_controller.testConnection')

// Root route - render register page directly with Inertia
router.get('/', 'auth_controller.register')
