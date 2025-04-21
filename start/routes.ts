import router from '@adonisjs/core/services/router'

router.get('/', [() => import('#controllers/http/post_controller'), 'index'])
