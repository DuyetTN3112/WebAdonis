import router from '@adonisjs/core/services/router'

router.get('/dashboard', 'dashboard_controller.index').middleware(router.middleware.auth)
router.get('/register', 'auth_controller.register')
router.post('/register', 'auth_controller.handleRegister')
