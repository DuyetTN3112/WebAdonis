/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
const HomeController = () => import('#controllers/http/home_controller')
router.get('/', [HomeController, 'index']) // đúng chuẩn AdonisJS
// router.get('/', async ({ inertia }) => {
//   return inertia.render('auth') // không cần import inertia
// })
