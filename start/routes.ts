import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

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
      .get('/modules', [() => import('#controllers/http/module_controller'), 'index'])
      .use(middleware.auth())

    // API routes (protected)
    router
      .get('/api/modules', [() => import('#controllers/http/module_controller'), 'getModules'])
      .use(middleware.auth())
    router
      .get('/api/modules/:id/posts', [
        () => import('#controllers/http/module_controller'),
        'getPosts',
      ])
      .use(middleware.auth())

    router.get('/search', '#controllers/search_controller.handle').use(middleware.auth())
  })
  .use(middleware.silentAuth())
