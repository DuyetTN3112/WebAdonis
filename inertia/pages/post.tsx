import { Head, Link } from '@inertiajs/react'
import Layout from './layouts/layout'
import { useState, useEffect } from 'react'
import feather from 'feather-icons'

import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar'
import { Badge } from '../components/ui/badge'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { Skeleton } from '../components/ui/skeleton'
import { ThumbsUp, ThumbsDown, Edit, Trash2, Eye, Share2, Send, Image as ImageIcon, X } from 'lucide-react'

// Import các tiện ích thời gian
import { formatDateTime, isWithinTimeLimit } from '../lib/utils'

// Interfaces remain unchanged
interface User {
  id: number
  username: string
  email: string
  avatar?: string
  role: number
}

interface Post {
  id: number
  user_id: number
  title: string
  content: string
  view_count: number
  like_count: number
  dislike_count: number
  image?: string
  created_at: string
  updated_at: string
  liked: string | null
  disliked: string | null
  user: {
    id?: number
    username: string
    avatar?: string
  }
  comments: Comment[]
  modules?: Module[]
}

interface Comment {
  id: number
  user_id: number
  post_id: number
  content: string
  image?: string
  created_at: string
  user: {
    id?: number
    username: string
    avatar?: string
  }
}

interface Module {
  id: number
  name: string
  description?: string
}

interface PostProps {
  user: User | null
  posts: {
    data: Post[]
    meta: {
      current_page: number
      last_page: number
      per_page: number
      total: number
    }
  }
  current_filter: string | null
  modules: Module[]
}

export default function PostPage({ user, posts, current_filter, modules }: PostProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    image: null as File | null,
    modules: [] as number[]
  })
  const [selectedModules, setSelectedModules] = useState<Module[]>([])
  const [moduleSearch, setModuleSearch] = useState('')
  const [moduleDropdownVisible, setModuleDropdownVisible] = useState(false)
  const [comments, setComments] = useState<Record<number, Comment[]>>({})
  const [newComments, setNewComments] = useState<Record<number, string>>({})
  const [commentImages, setCommentImages] = useState<Record<number, File | null>>({})
  const [editingComment, setEditingComment] = useState<{ id: number | null, postId: number | null, content: string }>({ id: null, postId: null, content: '' })
  const [loading, setLoading] = useState(false)
  const [deletePostId, setDeletePostId] = useState<number | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [selectedEditModules, setSelectedEditModules] = useState<Module[]>([])
  const [editModuleSearch, setEditModuleSearch] = useState('')
  const [editModuleDropdownVisible, setEditModuleDropdownVisible] = useState(false)

  useEffect(() => {
    feather.replace()
    
    // Debug thông tin bài viết và người dùng
    if (posts && posts.data && posts.data.length > 0) {
      console.log('Debug post ownership:')
      posts.data.forEach(post => {
        console.log(`Post ID ${post.id}:`, {
          post_user_id: post.user_id,
          post_user: post.user?.id,
          current_user: user?.id,
          is_owner: isPostOwner(post)
        })
      })
    }
  }, [])

  const handleLikeDislike = async (postId: number, type: 'like' | 'dislike') => {
    try {
      setLoading(true)
      const response = await fetch(`/posts/${postId}/like-dislike`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      })

      if (!response.ok) throw new Error('Failed to update like/dislike')

    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddComment = async (postId: number) => {
    if (!newComments[postId]?.trim()) return

    // Lấy CSRF token từ XSRF-TOKEN cookie
    const token = document.cookie.split('; ')
      .find(row => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1];

    console.log('Sending comment to:', `/posts/${postId}/comments`)
    console.log('CSRF Token:', token ? 'Found' : 'Missing')
    console.log('Comment content:', newComments[postId])
    
    try {
      // Tạo body request dựa vào có hình ảnh hay không
      let requestOptions;
      if (commentImages[postId]) {
        // Sử dụng FormData nếu có ảnh
        const formData = new FormData()
        formData.append('content', newComments[postId])
        formData.append('image', commentImages[postId] as File)
        
        requestOptions = {
          method: 'POST',
          headers: {
            'X-XSRF-TOKEN': decodeURIComponent(token || ''),
          },
          body: formData
        };
      } else {
        // Sử dụng JSON nếu chỉ có text
        requestOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-XSRF-TOKEN': decodeURIComponent(token || ''),
            'Accept': 'application/json',
          },
          body: JSON.stringify({ content: newComments[postId] })
        };
      }
      
      const response = await fetch(`/posts/${postId}/comments`, requestOptions)

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        console.error('Error response:', response.status, errorData)
        throw new Error(`Network response was not ok: ${response.status}`)
      }

      const data = await response.json()
      console.log('Comment response data:', data)

      if (data.success && data.comment) {
        console.log('Adding new comment to UI:', data.comment)
        
        // Mở rộng state comments để thêm comment mới
        setComments(prev => {
          const updatedComments = { ...prev };
          if (!updatedComments[postId]) {
            updatedComments[postId] = [];
          }
          updatedComments[postId] = [...updatedComments[postId], data.comment];
          return updatedComments;
        });
        
        // Tìm và cập nhật comment trong posts.data
        const updatedPosts = posts.data.map(post => {
          if (post.id === postId) {
            // Thêm comment mới vào danh sách comments của post
            return {
              ...post,
              comments: [...post.comments, data.comment]
            };
          }
          return post;
        });
        
        // Cập nhật state posts với comments mới
        posts.data = updatedPosts;
      } else {
        console.error('Invalid response format:', data);
      }

      // Xóa nội dung comment đã nhập và hình ảnh
      setNewComments(prev => ({ ...prev, [postId]: '' }))
      setCommentImages(prev => ({ ...prev, [postId]: null }))
    } catch (error) {
      console.error('Error in handleAddComment:', error)
    }
  }

  // Cập nhật hàm kiểm tra xem người dùng có quyền xóa comment không
  const canDeleteComment = (comment: Comment) => {
    if (!user) return false
    
    // Thêm debug để kiểm tra thông tin người dùng
    console.log('Debug canDeleteComment:', {
      commentId: comment.id,
      commentUserId: comment.user_id,
      commentUserIdFromUser: comment.user && 'id' in comment.user ? comment.user.id : undefined,
      currentUserId: user.id,
      commentCreatedAt: comment.created_at
    })
    
    // Tìm bài viết mà comment thuộc về
    const postWithComment = posts.data.find(post => 
      post.comments.some(c => c.id === comment.id)
    )
    
    if (!postWithComment) {
      console.log('Không tìm thấy bài viết chứa comment này:', comment.id)
      return false
    }
    
    // Debug bài viết tìm được
    console.log('Bài viết chứa comment:', {
      postId: postWithComment.id,
      postUserId: postWithComment.user_id
    })
    
    // Nếu là chủ bài viết, cho phép xóa bất kỳ comment nào
    if (postWithComment.user_id === user.id) {
      console.log('Người dùng là chủ bài viết, cho phép xóa comment')
      return true
    }
    
    // Kiểm tra user_id từ comment hoặc từ object user trong comment
    const commentUserId = comment.user_id || (comment.user && 'id' in comment.user ? comment.user.id : undefined)
    
    // Nếu không phải chủ bài viết, chỉ cho phép xóa comment của chính họ và trong vòng 1 giờ
    if (commentUserId && commentUserId === user.id) {
      const withinTimeLimit = isWithinTimeLimit(comment.created_at)
      console.log('Người dùng là người viết comment:', {
        isWithinTimeLimit: withinTimeLimit,
        commentCreatedAt: comment.created_at
      })
      return withinTimeLimit
    }
    
    console.log('Không có quyền xóa comment')
    return false
  }

  const handleDeleteComment = async (commentId: number, postId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bình luận này không?')) return

    // Lấy CSRF token từ XSRF-TOKEN cookie
    const token = document.cookie.split('; ')
      .find(row => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1];

    try {
      const response = await fetch(`/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'X-XSRF-TOKEN': decodeURIComponent(token || ''),
          'Accept': 'application/json',
        }
      })

      if (!response.ok) {
        const data = await response.json()
        if (response.status === 403) {
          if (data.error.includes('1 giờ')) {
            alert('Bạn không thể xóa bình luận sau 1 giờ đăng.')
          } else {
            alert(data.error || 'Bạn không có quyền xóa bình luận này.')
          }
          return
        }
        throw new Error('Network response was not ok')
      }

      // Cập nhật state comments để xóa comment
      setComments(prev => ({
        ...prev,
        [postId]: (prev[postId] || []).filter(c => c.id !== commentId)
      }))
      
      // Cập nhật state posts.data để xóa comment
      const updatedPosts = posts.data.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: post.comments.filter(c => c.id !== commentId)
          };
        }
        return post;
      });
      
      posts.data = updatedPosts;
      
      console.log('Comment deleted successfully:', commentId);
    } catch (error) {
      console.error('Error in handleDeleteComment:', error)
    }
  }

  const handleEditComment = async () => {
    if (!editingComment.id || !editingComment.postId || !editingComment.content.trim()) return

    // Lấy CSRF token từ XSRF-TOKEN cookie
    const token = document.cookie.split('; ')
      .find(row => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1];

    // Thêm thông báo đang xử lý để giao diện phản hồi nhanh hơn
    const originalContent = editingComment.content
    
    try {
      console.log('Debug handleEditComment:', {
        commentId: editingComment.id,
        postId: editingComment.postId,
        content: editingComment.content
      })
      
      // Đóng modal trước để giao diện phản hồi nhanh
      const tempEditingComment = { ...editingComment }
      setEditingComment({ id: null, postId: null, content: '' })
      
      // Optimistic UI update - cập nhật UI ngay lập tức
      const updatedPosts = posts.data.map(post => {
        if (post.id === tempEditingComment.postId) {
          return {
            ...post,
            comments: post.comments.map(comment => 
              comment.id === tempEditingComment.id 
                ? { ...comment, content: tempEditingComment.content }
                : comment
            )
          };
        }
        return post;
      });
      
      posts.data = updatedPosts;
      
      // Gửi request
      const response = await fetch(`/comments/${tempEditingComment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': decodeURIComponent(token || ''),
          'Accept': 'application/json',
        },
        body: JSON.stringify({ content: tempEditingComment.content })
      })

      const responseText = await response.text()
      console.log('Response text:', responseText)
      
      let data = {}
      try {
        if (responseText) {
          data = JSON.parse(responseText)
          console.log('Comment updated data:', data)
        }
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError)
      }
      
      if (!response.ok) {
        if (response.status === 403) {
          const errorMessage = data && 'error' in data 
            ? data.error 
            : 'Bạn không thể chỉnh sửa bình luận này. Chỉ được phép chỉnh sửa trong vòng 1 giờ đầu.'
          
          // Hoàn tác thay đổi UI
          const revertedPosts = posts.data.map(post => {
            if (post.id === tempEditingComment.postId) {
              return {
                ...post,
                comments: post.comments.map(comment => 
                  comment.id === tempEditingComment.id 
                    ? { ...comment, content: originalContent }
                    : comment
                )
              }
            }
            return post
          })
          posts.data = revertedPosts
          
          alert(errorMessage)
          return
        }
        throw new Error(`Network response was not ok: ${response.status}`)
      }

      console.log('Comment updated successfully:', tempEditingComment.id)
    } catch (error) {
      console.error('Error in handleEditComment:', error)
      alert('Có lỗi xảy ra khi cập nhật bình luận. Vui lòng thử lại sau.')
    }
  }

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return

    const formData = new FormData()
    formData.append('title', newPost.title)
    formData.append('content', newPost.content)
    if (newPost.image) {
      formData.append('image', newPost.image)
    }
    newPost.modules.forEach(moduleId => {
      formData.append('modules[]', moduleId.toString())
    })

    const token = document.cookie.split('; ')
      .find(row => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1];

    try {
      const response = await fetch('/posts', {
        method: 'POST',
        headers: {
          'X-XSRF-TOKEN': decodeURIComponent(token || ''),
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const data = await response.json()

      posts.data = [data.post, ...posts.data]

      setNewPost({
        title: '',
        content: '',
        image: null,
        modules: []
      })
      setSelectedModules([])
      setShowCreateModal(false)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const addModule = (module: Module) => {
    if (!selectedModules.some(m => m.id === module.id)) {
      setSelectedModules([...selectedModules, module])
      setNewPost(prev => ({
        ...prev,
        modules: [...prev.modules, module.id]
      }))
    }
    setModuleSearch('')
    setModuleDropdownVisible(false)
  }

  const removeModule = (moduleId: number) => {
    setSelectedModules(selectedModules.filter(m => m.id !== moduleId))
    setNewPost(prev => ({
      ...prev,
      modules: prev.modules.filter(id => id !== moduleId)
    }))
  }

  const isLiked = (post: Post) => {
    return user && post.liked?.split(',').includes(user.id.toString())
  }

  const isDisliked = (post: Post) => {
    return user && post.disliked?.split(',').includes(user.id.toString())
  }

  // Kiểm tra xem người dùng có phải là chủ bài viết
  const isPostOwner = (post: Post) => {
    // Sửa lại điều kiện kiểm tra
    if (!user) return false
    
    // Kiểm tra nếu user_id có trong post
    if ('user_id' in post && user.id === post.user_id) {
      return true
    }
    
    // Hoặc kiểm tra qua đối tượng user nếu có
    if (post.user && 'id' in post.user && user.id === post.user.id) {
      return true
    }
    
    return false
  }

  // Hiển thị modal xác nhận xóa bài viết
  const handleDeleteClick = (postId: number) => {
    setDeletePostId(postId)
    setShowDeleteModal(true)
    setDeleteError(null)
  }

  // Hiển thị modal chỉnh sửa bài viết
  const handleEditClick = (post: Post) => {
    setEditingPost(post)
    
    // Tìm các module của bài viết
    if (post.modules && post.modules.length > 0) {
      setSelectedEditModules(post.modules)
    } else {
      setSelectedEditModules([])
    }
    
    setShowEditModal(true)
    setEditError(null)
  }
  
  // Thêm module vào bài viết đang chỉnh sửa
  const addEditModule = (module: Module) => {
    if (!selectedEditModules.some(m => m.id === module.id)) {
      setSelectedEditModules([...selectedEditModules, module])
    }
    setEditModuleSearch('')
    setEditModuleDropdownVisible(false)
  }
  
  // Xóa module khỏi bài viết đang chỉnh sửa
  const removeEditModule = (moduleId: number) => {
    setSelectedEditModules(selectedEditModules.filter(m => m.id !== moduleId))
  }
  
  // Xử lý cập nhật bài viết
  const handleUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingPost) return
    
    try {
      setEditError(null)
      
      // Lấy CSRF token từ cookie
      const token = document.cookie.split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];
      
      // Tạo FormData để gửi dữ liệu
      const formData = new FormData()
      formData.append('title', editingPost.title)
      formData.append('content', editingPost.content || '')
      
      // Thêm modules
      selectedEditModules.forEach(module => {
        formData.append('modules[]', module.id.toString())
      })
      
      // Thêm ảnh nếu có
      const fileInput = document.getElementById('edit-post-image') as HTMLInputElement
      if (fileInput && fileInput.files && fileInput.files.length > 0) {
        formData.append('image', fileInput.files[0])
      }
      
      // Gửi request
      const response = await fetch(`/posts/${editingPost.id}`, {
        method: 'PUT',
        headers: {
          'X-XSRF-TOKEN': decodeURIComponent(token || ''),
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json',
        },
        body: formData,
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Cập nhật UI
        const updatedPosts = {...posts}
        updatedPosts.data = updatedPosts.data.map(post => 
          post.id === editingPost.id ? data.post : post
        )
        
        // Đóng modal
        setShowEditModal(false)
        
        // Reload trang để hiển thị dữ liệu mới nhất
        window.location.reload()
      } else {
        setEditError(data.message || 'Có lỗi khi cập nhật bài viết')
      }
    } catch (error: any) {
      console.error('Error updating post:', error)
      setEditError('Lỗi khi cập nhật bài viết: ' + (error?.message || String(error)))
    }
  }

  // Xử lý xóa bài viết
  const handleDeletePost = async () => {
    if (!deletePostId) return
    
    try {
      setLoading(true)
      
      // Lấy CSRF token từ cookie
      const token = document.cookie.split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];
      
      const response = await fetch(`/posts/${deletePostId}`, {
        method: 'DELETE',
        headers: {
          'X-XSRF-TOKEN': decodeURIComponent(token || ''),
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json',
        },
        credentials: 'include'
      })
      
      if (response.ok) {
        // Cập nhật UI bằng cách loại bỏ bài viết đã xóa
        const updatedPosts = {...posts}
        updatedPosts.data = updatedPosts.data.filter(post => post.id !== deletePostId)
        // Đóng modal
        setShowDeleteModal(false)
        // Chuyển hướng đến trang chính với thông báo thành công
        window.location.href = '/posts?message=post_deleted'
      } else {
        // Xử lý lỗi
        const errorData = await response.json()
        setDeleteError(errorData.message || 'Có lỗi xảy ra khi xóa bài viết')
      }
    } catch (error: any) {
      console.error('Error deleting post:', error)
      setDeleteError('Lỗi khi xóa bài viết: ' + (error?.message || String(error)))
    } finally {
      setLoading(false)
    }
  }

  // Cập nhật hàm kiểm tra quyền chỉnh sửa comment (trong vòng 1 giờ)
  const canEditComment = (comment: Comment) => {
    if (!user) return false
    
    // Kiểm tra user_id từ comment hoặc từ comment.user
    const commentUserId = comment.user_id || (comment.user && 'id' in comment.user ? comment.user.id : undefined)
    
    if (!commentUserId || commentUserId !== user.id) return false
    
    // Debug thông tin
    console.log('Debug canEditComment:', {
      commentId: comment.id,
      commentUserId: commentUserId,
      currentUserId: user.id,
      commentCreatedAt: comment.created_at,
      isWithinTimeLimit: isWithinTimeLimit(comment.created_at)
    })
    
    // Chỉ người tạo comment mới được phép chỉnh sửa và trong vòng 1 giờ
    return isWithinTimeLimit(comment.created_at)
  }

  if (loading) {
    return (
      <div className="flex-grow p-8 space-y-6">
        <Skeleton className="h-12 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-[#222222] border-[#333333]">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Layout>
      <Head title="Posts" />
      <main className="flex-1 p-8 bg-black">
        <div className="container">
          {/* Create Post Button */}
          <div className="mb-8">
            <Card
              className="bg-[#222222] border-[#333333] hover:border-[#FF9900] transition-colors duration-200 cursor-pointer"
              onClick={() => setShowCreateModal(true)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={user?.avatar || "/uploads/votri.jpg"} alt="User Avatar" />
                    <AvatarFallback>{user?.username?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-grow bg-black rounded-full px-4 py-2.5 text-[#CCCCCC] hover:bg-gray-900 transition-colors duration-200">
                    What do you think?
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Create Post Modal */}
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogContent className="bg-[#1E1E1E] text-white border-none max-w-[600px] max-h-[90vh]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-[#FF6B00]">Create New Post</DialogTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-4 text-gray-400 hover:text-white"
                  onClick={() => setShowCreateModal(false)}
                >
                  <X className="h-6 w-6" />
                </Button>
              </DialogHeader>

              <form onSubmit={(e) => { e.preventDefault(); handleCreatePost(); }} className="space-y-4">
                <div>
                  <label className="block text-white mb-2">Title *</label>
                  <Input
                    type="text"
                    placeholder="Enter title"
                    required
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    className="w-full p-3 bg-[#2C2C2C] border border-gray-600 text-white rounded-lg
                    focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Content *</label>
                  <Textarea
                    placeholder="Enter description"
                    rows={6}
                    required
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    className="w-full p-3 bg-[#2C2C2C] border border-gray-600 text-white rounded-lg
                    focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Image</label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewPost({ ...newPost, image: e.target.files?.[0] || null })}
                    className="w-full p-3 bg-[#2C2C2C] border border-gray-600 text-white rounded-lg 
                    file:mr-4 file:rounded-full file:border-0 file:bg-[#FF6B00] file:text-white file:px-4 file:py-2
                    hover:file:bg-[#FF8533]"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-white mb-2" htmlFor="modules">Modules:</label>
                  
                  <div className="relative">
                    <input 
                      type="text" 
                      id="moduleInput"
                      value={moduleSearch}
                      onChange={(e) => {
                        setModuleSearch(e.target.value)
                        // Nếu bắt đầu bằng # hoặc có giá trị, hiển thị dropdown
                        if (e.target.value.startsWith('#') || e.target.value) {
                          setModuleDropdownVisible(true)
                        } else {
                          setModuleDropdownVisible(false)
                        }
                      }}
                      placeholder="Type # to select modules" 
                      className="w-full p-3 bg-[#2C2C2C] border border-gray-600 text-white rounded-lg 
                          focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]"
                    />
                    
                    <div id="moduleTagContainer" className="flex flex-wrap gap-2 mt-2">
                      {selectedModules.map(module => (
                        <span 
                          key={module.id}
                          className="px-3 py-1 bg-[#FF6B00] text-white rounded-full flex items-center"
                        >
                          #{module.name}
                          <button 
                            type="button" 
                            className="ml-2 text-white"
                            onClick={() => removeModule(module.id)}
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                    
                    {moduleDropdownVisible && (
                      <div
                        id="moduleDropdown" 
                        className="absolute z-10 w-full bg-[#2C2C2C] border border-gray-600 rounded-lg mt-1
                                max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-[#FF6B00] scrollbar-track-[#333333]"
                      >
                        {/* Lọc module dựa trên từ khóa tìm kiếm */}
                        {modules?.filter(module => 
                          moduleSearch.startsWith('#') 
                            ? module.name.toLowerCase().includes(moduleSearch.substring(1).toLowerCase())
                            : module.name.toLowerCase().includes(moduleSearch.toLowerCase())
                        ).map(module => (
                          <div 
                            key={module.id}
                            className="module-option px-4 py-2 hover:bg-[#FF6B00] cursor-pointer"
                            onClick={() => addModule(module)}
                          >
                            #{module.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-white mb-2">Suggested Modules:</h4>
                  <div className="flex flex-wrap gap-2">
                    {modules?.slice(0, 10).map(module => (
                      <span 
                        key={module.id}
                        className="suggested-module cursor-pointer px-3 py-1 bg-[#333333] text-white rounded-full hover:bg-[#FF6B00] transition"
                        onClick={() => addModule(module)}
                      >
                        #{module.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    className="bg-[#FF6B00] text-white px-6 py-2 rounded-lg hover:bg-[#FF8533] transition-colors duration-300"
                  >
                    Post
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Filter Controls */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Posts</h2>

            <div className="flex space-x-4">
              <Link
                href="?filter=most_view"
                className={`flex items-center space-x-2 px-4 py-2 text-sm ${current_filter === "most_view" ? "text-[#FF9900]" : "text-[#CCCCCC] hover:text-[#FF9900]"} transition-colors duration-200 group`}
              >
                <Eye
                  className={`w-4 h-4 ${current_filter === "most_view" ? "text-[#FF9900]" : "group-hover:text-[#FF9900]"}`}
                />
                <span>Most View</span>
              </Link>
              <Link
                href="?filter=most_liked"
                className={`flex items-center space-x-2 px-4 py-2 text-sm ${current_filter === "most_liked" ? "text-[#FF9900]" : "text-[#CCCCCC] hover:text-[#FF9900]"} transition-colors duration-200 group`}
              >
                <ThumbsUp
                  className={`w-4 h-4 ${current_filter === "most_liked" ? "text-[#FF9900]" : "group-hover:text-[#FF9900]"}`}
                />
                <span>Most Liked</span>
              </Link>
              <Link
                href="?filter=most_disliked"
                className={`flex items-center space-x-2 px-4 py-2 text-sm ${current_filter === "most_disliked" ? "text-[#FF9900]" : "text-[#CCCCCC] hover:text-[#FF9900]"} transition-colors duration-200 group`}
              >
                <ThumbsDown
                  className={`w-4 h-4 ${current_filter === "most_disliked" ? "text-[#FF9900]" : "group-hover:text-[#FF9900]"}`}
                />
                <span>Most Disliked</span>
              </Link>
              {current_filter && (
                <Link
                  href="?"
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-[#CCCCCC] hover:text-[#FF9900] transition-colors duration-200 group"
                >
                  <X className="w-4 h-4 group-hover:text-[#FF9900]" />
                  <span>Clear Filter</span>
                </Link>
              )}
            </div>
          </div>

          {/* Posts List - Adjusted spacing to 1cm (~space-y-4) */}
          <div className="space-y-4">
            {posts.data.map((post) => (
              <Card
                key={post.id}
                className="bg-[#222222] border border-[#FF9900] rounded-lg shadow-md"
                data-post-id={post.id}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center">
                    <Avatar className="w-10 h-10 mr-3">
                      <AvatarImage
                        src={post.user.avatar || "/uploads/votri.jpg"}
                        alt="User Avatar"
                      />
                      <AvatarFallback>{post.user.username?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      {/* User name set to white */}
                      <h3 className="font-bold text-white">{post.user.username}</h3>
                      {/* Sử dụng hàm formatDateTime để hiển thị thời gian */}
                      <p className="text-sm text-[#CCCCCC]">{formatDateTime(post.created_at)}</p>
                    </div>
                    
                    {/* Hiển thị nút xóa chỉ khi người dùng là chủ bài viết */}
                    {isPostOwner(post) && (
                      <div className="ml-auto flex items-center space-x-3">
                        <Button
                          variant="ghost"
                          className="flex items-center space-x-1 text-[#CCCCCC] hover:text-[#FF9900] bg-[#333] rounded-lg px-3 py-2"
                          onClick={() => handleEditClick(post)}
                        >
                          <Edit className="w-5 h-5 mr-1" />
                          <span>Sửa</span>
                        </Button>
                        <Button
                          variant="ghost"
                          className="flex items-center space-x-1 text-[#CCCCCC] hover:text-red-500 bg-[#333] rounded-lg px-3 py-2"
                          onClick={() => handleDeleteClick(post.id)}
                        >
                          <Trash2 className="w-5 h-5 mr-1" />
                          <span>Xóa</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-2">
                  {/* Post title set to white */}
                  <h2 className="text-xl font-bold text-white">{post.title}</h2>
                  {/* Body text set to white */}
                  <p className="text-white whitespace-pre-line">{post.content}</p>
                  {post.image && (
                    <div className="rounded-lg overflow-hidden">
                      <img
                        src={post.image || "/placeholder.svg"}
                        alt="Post content"
                        className="w-full object-cover max-h-96"
                      />
                    </div>
                  )}

                  {post.modules && post.modules.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.modules.map((module) => (
                        <Badge key={module.id} variant="outline" className="bg-[#333333] text-white">
                          #{module.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex flex-col space-y-4">
                  {/* Removed border from views, like, dislike, share */}
                  <div className="flex items-center space-x-6 w-full py-2">
                    <Button variant="ghost" className="flex items-center space-x-2 text-[#CCCCCC] hover:text-[#FF9900]">
                      <Eye className="w-5 h-5" />
                      <span>{post.view_count} views</span>
                    </Button>
                    <Button
                      variant="ghost"
                      className={`flex items-center space-x-2 ${isLiked(post) ? "text-[#FF9900]" : "text-[#CCCCCC] hover:text-[#FF9900]"}`}
                      onClick={() => handleLikeDislike(post.id, 'like')}
                    >
                      <ThumbsUp className="w-5 h-5" />
                      <span>{post.like_count} likes</span>
                    </Button>
                    <Button
                      variant="ghost"
                      className={`flex items-center space-x-2 ${isDisliked(post) ? "text-red-500" : "text-[#CCCCCC] hover:text-red-500"}`}
                      onClick={() => handleLikeDislike(post.id, 'dislike')}
                    >
                      <ThumbsDown className="w-5 h-5" />
                      <span>{post.dislike_count} dislikes</span>
                    </Button>
                    <Button variant="ghost" className="flex items-center space-x-2 text-[#CCCCCC] hover:text-[#FF9900]">
                      <Share2 className="w-5 h-5" />
                      <span>Share</span>
                    </Button>
                  </div>

                  {/* Comments Section */}
                  <div className="w-full">
                    {/* Comments label set to white */}
                    <h4 className="font-semibold text-sm text-white mb-2">Comments:</h4>

                    {post.comments && post.comments.length > 0 ? (
                      <div className="space-y-2">
                        {post.comments.map((comment) => {
                          console.log(`Raw comment ${comment.id} data:`, comment);
                          console.log(`Date string for comment ${comment.id}:`, comment.created_at);
                          
                          return (
                            <div key={comment.id} className="ml-8 p-2 bg-[#333333] rounded">
                              <div className="flex items-center mb-1">
                                <Avatar className="w-8 h-8 mr-2">
                                  <AvatarImage
                                    src={comment.user.avatar || "/uploads/votri.jpg"}
                                    alt="User Avatar"
                                  />
                                  <AvatarFallback>{comment.user.username?.charAt(0) || "U"}</AvatarFallback>
                                </Avatar>
                                {/* Comment user name set to white */}
                                <span className="font-semibold text-sm text-white">{comment.user.username}</span>
                                <span className="text-xs text-[#CCCCCC] ml-2">{formatDateTime(comment.created_at)}</span>

                                <div className="ml-auto flex space-x-2">
                                  {canEditComment(comment) && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => {
                                        setEditingComment({ id: comment.id, postId: post.id, content: comment.content })
                                      }}
                                    >
                                      <Edit className="h-4 w-4 text-[#CCCCCC] hover:text-[#FF9900]" />
                                    </Button>
                                  )}
                                  {canDeleteComment(comment) && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => handleDeleteComment(comment.id, post.id)}
                                    >
                                      <Trash2 className="h-4 w-4 text-[#CCCCCC] hover:text-[#FF9900]" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                              {/* Comment text set to white */}
                              <p className="text-sm text-white">{comment.content}</p>
                              {comment.image && (
                                <div className="mt-2">
                                  <img src={comment.image} alt="Comment image" className="max-h-48 rounded" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[#666666]">No comments yet.</p>
                    )}

                    {/* Add Comment Form */}
                    {user && (
                      <div className="mt-2 flex items-center space-x-2">
                        <form
                          className="flex items-center space-x-2 w-full"
                          onSubmit={(e) => {
                            e.preventDefault()
                            handleAddComment(post.id)
                          }}
                        >
                          <Input
                            type="text"
                            value={newComments[post.id] || ''}
                            onChange={(e) => setNewComments({ ...newComments, [post.id]: e.target.value })}
                            placeholder="Write a comment..."
                            className="w-full p-2 bg-black border border-[#333333] rounded focus:outline-none focus:ring-2 focus:ring-[#FF9900] text-white"
                          />
                          <Button
                            type="submit"
                            variant="ghost"
                            size="icon"
                            className="text-[#CCCCCC] hover:text-[#FF9900]"
                          >
                            <Send className="w-6 h-6" />
                          </Button>
                        </form>
                      </div>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {posts.meta && (
            <div className="flex justify-center items-center space-x-2 mt-6">
              {posts.meta.current_page > 1 && (
                <>
                  <Link
                    href="?page=1"
                    className="px-4 py-2 bg-[#222222] text-white rounded-md hover:bg-[#FF9900] transition-colors"
                  >
                    First
                  </Link>
                  <Link
                    href={`?page=${posts.meta.current_page - 1}`}
                    className="px-4 py-2 bg-[#222222] text-white rounded-md hover:bg-[#FF9900] transition-colors"
                  >
                    Previous
                  </Link>
                </>
              )}

              {posts.meta.current_page < posts.meta.last_page && (
                <>
                  <Link
                    href={`?page=${posts.meta.current_page + 1}`}
                    className="px-4 py-2 bg-[#222222] text-white rounded-md hover:bg-[#FF9900] transition-colors"
                  >
                    Next
                  </Link>
                  <Link
                    href={`?page=${posts.meta.last_page}`}
                    className="px-4 py-2 bg-[#222222] text-white rounded-md hover:bg-[#FF9900] transition-colors"
                  >
                    Last
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

        {/* Edit Comment Modal */}
        <Dialog open={!!editingComment.id} onOpenChange={(open) => !open && setEditingComment({ id: null, postId: null, content: '' })}>
          <DialogContent className="bg-[#1E1E1E] text-white border-none">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-[#FF6B00]">Chỉnh Sửa Bình Luận</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4 text-gray-400 hover:text-white"
                onClick={() => setEditingComment({ id: null, postId: null, content: '' })}
              >
                <X className="h-6 w-6" />
              </Button>
            </DialogHeader>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleEditComment()
              }}
              className="space-y-4"
            >
              <div className="text-sm text-[#CCCCCC] mb-2">
                <p>Lưu ý: Bạn chỉ có thể chỉnh sửa bình luận trong vòng 1 giờ sau khi đăng.</p>
              </div>
              
              <Textarea
                value={editingComment.content}
                onChange={(e) => setEditingComment(prev => ({ ...prev, content: e.target.value }))}
                rows={4}
                required
                className="w-full p-3 bg-[#2C2C2C] border border-gray-600 text-white rounded-lg focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]"
                placeholder="Nhập nội dung bình luận mới..."
              />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEditingComment({ id: null, postId: null, content: '' })}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                >
                  Hủy
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[#FF6B00] text-white px-4 py-2 rounded hover:bg-[#FF8533] transition-colors"
                >
                  Cập Nhật
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Post Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="bg-[#1E1E1E] text-white border-none max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-[#FF6B00]">Chỉnh Sửa Bài Viết</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4 text-gray-400 hover:text-white"
                onClick={() => setShowEditModal(false)}
              >
                <X className="h-6 w-6" />
              </Button>
            </DialogHeader>

            {editingPost && (
              <form onSubmit={handleUpdatePost} className="space-y-4">
                {editError && (
                  <div className="bg-red-500 text-white p-3 rounded-lg mb-4">
                    {editError}
                  </div>
                )}
                
                <div>
                  <label className="block text-white mb-2">Tiêu đề *</label>
                  <Input
                    type="text"
                    placeholder="Nhập tiêu đề"
                    required
                    value={editingPost.title}
                    onChange={(e) => setEditingPost({...editingPost, title: e.target.value})}
                    className="w-full p-3 bg-[#2C2C2C] border border-gray-600 text-white rounded-lg
                    focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Nội dung *</label>
                  <Textarea
                    placeholder="Nhập nội dung"
                    rows={6}
                    required
                    value={editingPost.content}
                    onChange={(e) => setEditingPost({...editingPost, content: e.target.value})}
                    className="w-full p-3 bg-[#2C2C2C] border border-gray-600 text-white rounded-lg
                    focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Hình ảnh</label>
                  <Input
                    type="file"
                    id="edit-post-image"
                    accept="image/*"
                    className="w-full p-3 bg-[#2C2C2C] border border-gray-600 text-white rounded-lg 
                    file:mr-4 file:rounded-full file:border-0 file:bg-[#FF6B00] file:text-white file:px-4 file:py-2
                    hover:file:bg-[#FF8533]"
                  />
                  {editingPost.image && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-400 mb-1">Hình ảnh hiện tại:</p>
                      <img 
                        src={editingPost.image} 
                        alt="Current image" 
                        className="max-h-40 rounded-lg border border-gray-600"
                      />
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <label className="block text-white mb-2" htmlFor="modules">Modules:</label>
                  
                  <div className="relative">
                    <input 
                      type="text" 
                      value={editModuleSearch}
                      onChange={(e) => {
                        setEditModuleSearch(e.target.value)
                        setEditModuleDropdownVisible(true)
                      }}
                      placeholder="Tìm kiếm modules" 
                      className="w-full p-3 bg-[#2C2C2C] border border-gray-600 text-white rounded-lg 
                          focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]"
                    />
                    
                    <div id="moduleTagContainer" className="flex flex-wrap gap-2 mt-2">
                      {selectedEditModules.map(module => (
                        <span 
                          key={module.id}
                          className="px-3 py-1 bg-[#FF6B00] text-white rounded-full flex items-center"
                        >
                          #{module.name}
                          <button 
                            type="button" 
                            className="ml-2 text-white"
                            onClick={() => removeEditModule(module.id)}
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                    
                    {editModuleDropdownVisible && (
                      <div
                        className="absolute z-10 w-full bg-[#2C2C2C] border border-gray-600 rounded-lg mt-1
                                max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-[#FF6B00] scrollbar-track-[#333333]"
                      >
                        {modules?.filter(module => 
                          module.name.toLowerCase().includes(editModuleSearch.toLowerCase())
                        ).slice(0, 10).map(module => (
                          <div 
                            key={module.id}
                            className="px-4 py-2 hover:bg-[#FF6B00] cursor-pointer"
                            onClick={() => addEditModule(module)}
                          >
                            #{module.name}
                          </div>
                        ))}
                        
                        {modules?.filter(module => 
                          module.name.toLowerCase().includes(editModuleSearch.toLowerCase())
                        ).length === 0 && (
                          <div className="px-4 py-2 text-gray-500">
                            Không tìm thấy module
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-4 gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowEditModal(false)}
                    className="bg-gray-600 text-white px-5 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#FF6B00] text-white px-5 py-2 rounded-lg hover:bg-[#FF8533] transition-colors"
                  >
                    Cập Nhật
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
        
        {/* Delete Post Confirmation Modal */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent className="bg-[#1E1E1E] text-white border-none">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-[#FF6B00]">Xác nhận xóa bài viết</DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <p className="text-white mb-4">
                Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.
              </p>
              
              {deleteError && (
                <div className="bg-red-500 text-white p-3 rounded mb-4">
                  {deleteError}
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowDeleteModal(false)}
                  className="bg-[#444] text-white px-4 py-2 rounded hover:bg-[#555]"
                  disabled={loading}
                >
                  Hủy
                </Button>
                <Button
                  type="button"
                  onClick={handleDeletePost}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    'Xóa bài viết'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </Layout>
  )
}