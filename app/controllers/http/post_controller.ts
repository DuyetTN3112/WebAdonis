import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import Post from '#models/post'
import Module from '#models/module'
import User from '#models/user'
import type { AuthService } from '@adonisjs/auth/types'
import { createPostValidator, updatePostValidator } from '#validators/post'
import app from '@adonisjs/core/services/app'

export default class PostsController {
  @inject()
  async index({ inertia, request, response, auth }: HttpContext) {
    try {
      console.log('Starting to fetch posts...')
      const page = Math.max(Number.parseInt(request.input('page', '1')) || 1, 1)
      const filter = request.input('filter')
      const limit = 10

      console.log('Building query with preloads...')
      let postsQuery = Post.query()
        .preload('user')
        .preload('comments', (query) => {
          query.preload('user')
        })
        .preload('modules')

      // Apply filters
      if (filter) {
        console.log('Applying filter:', filter)
        switch (filter) {
          case 'most_view':
            postsQuery.orderBy('view_count', 'desc')
            break
          case 'most_liked':
            postsQuery.orderBy('like_count', 'desc')
            break
          case 'most_disliked':
            postsQuery.orderBy('dislike_count', 'desc')
            break
          default:
            postsQuery.orderBy('created_at', 'desc')
        }
      } else {
        postsQuery.orderBy('created_at', 'desc')
      }

      console.log('Executing query...')
      const posts = await postsQuery.paginate(page, limit)
      const serializedPosts = posts.serialize()
      
      // Xử lý DateTime từ Luxon
      const postsArray = posts.all() // Lấy mảng dữ liệu thô
      
      // Log thông tin debug
      if (postsArray.length > 0) {
        console.log('Kiểm tra dữ liệu thời gian của bài đăng đầu tiên:', {
          id: postsArray[0].id,
          created_at: postsArray[0].created_at ? postsArray[0].created_at.toString() : null,
          updated_at: postsArray[0].updated_at ? postsArray[0].updated_at.toString() : null,
        })
      } else {
        console.log('Không có bài đăng')
      }

      // Cập nhật thời gian trong dữ liệu serialized
      serializedPosts.data = serializedPosts.data.map((post: any) => {
        // Tìm post gốc tương ứng
        const originalPost = postsArray.find((p: any) => p.id === post.id)
        if (originalPost) {
          // Chuyển đổi DateTime của Luxon sang chuỗi SQL
          if (originalPost.created_at) {
            post.created_at = originalPost.created_at.toSQL()
            console.log(`Post ${post.id} original date:`, originalPost.created_at.toSQL())
          }
          if (originalPost.updated_at) {
            post.updated_at = originalPost.updated_at.toSQL()
          }

          // Làm tương tự với comments
          if (post.comments && Array.isArray(post.comments) && originalPost.$preloaded?.comments) {
            const commentsWithDates = originalPost.$preloaded.comments
            
            post.comments = post.comments.map((comment: any) => {
              // Tìm comment gốc tương ứng
              const originalComment = commentsWithDates.find((c: any) => c.id === comment.id)
              if (originalComment && originalComment.created_at) {
                comment.created_at = originalComment.created_at.toSQL()
                console.log(`Comment ${comment.id} original date:`, originalComment.created_at.toSQL())
                
                if (originalComment.updated_at) {
                  comment.updated_at = originalComment.updated_at.toSQL()
                }
              }
              return comment
            })
          }
        }
        return post
      })

      console.log('Posts đã được chuẩn hóa')

      // Get all modules for create post
      const modules = await Module.all()

      // More defensive auth handling
      let user = null
      try {
        console.log('Attempting to get user from auth...')
        user = auth.use('web').user
        console.log('User from auth:', user ? 'Found' : 'Not found')
      } catch (error) {
        console.error('Auth error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack,
        })
      }

      console.log('Preparing response...')
      return inertia.render('post', {
        posts: serializedPosts,
        user: user ? user.serialize() : null,
        current_filter: filter,
        modules: modules.map((module) => module.serialize()),
      })
    } catch (error) {
      console.error('Detailed error in index:', {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack,
        details: error,
      })
      return response.status(500).json({
        message: 'Error loading posts',
        error: {
          name: error.name,
          message: error.message,
          code: error.code,
          details: error,
        },
      })
    }
  }

  @inject()
  async likeDislike({ request, response, auth }: HttpContext) {
    try {
      const post = await Post.findOrFail(request.param('id'))
      const type = request.input('type')
      const user = auth.use('web').getUserOrFail()
      const userId = user.id.toString()

      if (type === 'like') {
        // Remove from disliked if exists
        if (post.disliked?.includes(userId)) {
          const dislikedUsers = post.disliked.split(',').filter((id) => id !== userId)
          post.disliked = dislikedUsers.join(',')
          post.dislike_count = Math.max(0, post.dislike_count - 1)
        }

        // Add to liked if not exists
        if (!post.liked?.includes(userId)) {
          const likedUsers = post.liked ? post.liked.split(',') : []
          likedUsers.push(userId)
          post.liked = likedUsers.join(',')
          post.like_count += 1
        }
      } else {
        // Remove from liked if exists
        if (post.liked?.includes(userId)) {
          const likedUsers = post.liked.split(',').filter((id) => id !== userId)
          post.liked = likedUsers.join(',')
          post.like_count = Math.max(0, post.like_count - 1)
        }

        // Add to disliked if not exists
        if (!post.disliked?.includes(userId)) {
          const dislikedUsers = post.disliked ? post.disliked.split(',') : []
          dislikedUsers.push(userId)
          post.disliked = dislikedUsers.join(',')
          post.dislike_count += 1
        }
      }

      await post.save()

      return response.json({
        success: true,
        likes: post.like_count,
        dislikes: post.dislike_count,
      })
    } catch (error) {
      console.error('Error in likeDislike:', error)
      return response.status(500).json({ message: 'Error processing like/dislike', error })
    }
  }

  async search({ request, response, inertia }: HttpContext) {
    try {
      const query = request.input('q')
      let results = []

      if (query.startsWith('@')) {
        results = await User.query()
          .where('username', 'like', `%${query.slice(1)}%`)
          .limit(5)
      } else if (query.startsWith('#')) {
        results = await Module.query()
          .where('name', 'like', `%${query.slice(1)}%`)
          .limit(5)
      } else {
        results = await Post.query()
          .where('title', 'like', `%${query}%`)
          .orWhere('content', 'like', `%${query}%`)
          .limit(10)
      }

      return inertia.render('search', { results })
    } catch (error) {
      console.error('Error in search:', error)
      return response.status(500).json({ message: 'Error performing search', error })
    }
  }

  @inject()
  async store({ request, response, auth }: HttpContext) {
    try {
      const user = auth.use('web').getUserOrFail()
      const data = await request.validateUsing(createPostValidator)
      // Upload image if exists
      let imagePath = null
      const image = request.file('image')
      if (image) {
        await image.move(app.makePath('public/uploads'), {
          name: `${Date.now()}-${image.clientName}`,
          overwrite: true,
        })

        if (image.isValid) {
          imagePath = `uploads/${image.fileName}`
        }
      }

      // Create post
      const post = await Post.create({
        user_id: user.id,
        title: data.title,
        content: data.content || '',
        image: imagePath,
        view_count: 0,
        like_count: 0,
        dislike_count: 0,
      })

      // Attach modules if provided
      if (data.modules && data.modules.length > 0) {
        await post.related('modules').attach(data.modules)
      }

      // Return post with related data
      await post.load('user')
      await post.load('modules')

      return response.json({
        success: true,
        post: post.serialize(),
      })
    } catch (error) {
      console.error('Error in store post:', error)
      return response.status(500).json({
        success: false,
        message: 'Error creating post',
        error: error.message,
      })
    }
  }

  @inject()
  async update({ request, response, auth }: HttpContext) {
    try {
      // Lấy ID của bài viết từ tham số
      const postId = request.param('id')
      
      // Tìm bài viết theo ID
      const post = await Post.findOrFail(postId)
      
      // Lấy thông tin người dùng đang đăng nhập
      const user = auth.use('web').getUserOrFail()
      
      // Kiểm tra xem người dùng có quyền chỉnh sửa bài viết này không
      if (post.user_id !== user.id && user.role !== 1) {
        return response.status(403).json({
          success: false,
          message: 'Bạn không có quyền chỉnh sửa bài viết này',
        })
      }
      
      // Validate dữ liệu cập nhật
      const data = await request.validateUsing(updatePostValidator)
      
      // Cập nhật thông tin cơ bản
      post.title = data.title
      post.content = data.content || ''
      
      // Xử lý ảnh nếu được cung cấp
      const image = request.file('image')
      if (image) {
        await image.move(app.makePath('public/uploads'), {
          name: `${Date.now()}-${image.clientName}`,
          overwrite: true,
        })

        if (image.isValid) {
          post.image = `uploads/${image.fileName}`
        }
      }
      
      // Lưu thay đổi
      await post.save()
      
      // Cập nhật modules nếu được cung cấp
      if (data.modules) {
        // Detach tất cả modules hiện tại
        await post.related('modules').detach()
        
        // Attach modules mới
        if (data.modules.length > 0) {
          await post.related('modules').attach(data.modules)
        }
      }
      
      // Load các quan hệ
      await post.load('user')
      await post.load('modules')
      
      return response.json({
        success: true,
        message: 'Bài viết đã được cập nhật thành công',
        post: post.serialize(),
      })
    } catch (error) {
      console.error('Error updating post:', error)
      return response.status(500).json({
        success: false,
        message: 'Lỗi khi cập nhật bài viết',
        error: error.message,
      })
    }
  }

  @inject()
  async destroy({ request, response, auth }: HttpContext) {
    try {
      // Lấy ID của bài đăng từ tham số
      const postId = request.param('id')

      // Tìm bài đăng theo ID
      const post = await Post.findOrFail(postId)

      // Lấy thông tin người dùng đang đăng nhập
      const user = auth.use('web').getUserOrFail()

      // Kiểm tra xem người dùng có quyền xóa bài đăng này không
      if (post.user_id !== user.id && user.role !== 1) {
        return response.status(403).json({
          success: false,
          message: 'Bạn không có quyền xóa bài đăng này',
        })
      }
      
      // Xóa các liên kết với module trước (nếu có)
      await post.related('modules').detach()
      
      // Xóa tất cả bình luận liên quan đến bài đăng
      await post.related('comments').query().delete()
      
      // Xóa bài đăng
      await post.delete()
      
      return response.json({
        success: true,
        message: 'Bài đăng đã được xóa thành công',
      })
    } catch (error) {
      console.error('Error deleting post:', error)
      return response.status(500).json({
        success: false,
        message: 'Lỗi khi xóa bài đăng',
        error: error.message,
      })
    }
  }
}
