import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

// Main routes with Inertia
router.get('/', [() => import('#controllers/http/post_controller'), 'index'])
router.get('/modules', [() => import('#controllers/http/module_controller'), 'index'])
router.get('/posts', [() => import('#controllers/http/post_controller'), 'index'])

// API routes for data fetching
router.get('/api/modules', [() => import('#controllers/http/module_controller'), 'getModules'])
router.get('/api/modules/:id/posts', [() => import('#controllers/http/module_controller'), 'getPosts'])
