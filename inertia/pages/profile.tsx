import { Head, Link } from '@inertiajs/react'
import Layout from './layouts/layout'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Camera, Edit, Trash2, ThumbsUp, ThumbsDown, Eye, Share2, Send, Image } from 'lucide-react'

// Import các tiện ích thời gian từ utils
import { formatDateTime, isWithinTimeLimit } from '../lib/utils'

// Thêm CSS với đường dẫn tương đối
import '../css/profile.css'

interface User {
  id: number
  username: string
  email: string
  phone_number?: string
  phoneNumber?: string
  student_id?: string
  studentId?: string
  avatar?: string
  role: number
  likes?: number
  dislikes?: number
}

interface Post {
  id: number
  title: string
  content: string
  view_count: number
  like_count: number
  dislike_count: number
  image?: string
  created_at: string
  modules?: Module[]
  user?: User
  comments?: Comment[]
}

interface Comment {
  id: number
  content: string
  created_at: string
  user: User
  user_id?: number
  post_id?: number
  image?: string
}

interface Module {
  id: number
  name: string
}

interface Activity {
  action: string
  ip: string
  timestamp: string
}

interface ProfileProps {
  user: User | null
  posts: Post[]
  activities?: Activity[]
  error?: string
  flashMessage?: string | null
  flashError?: string | null
  authError?: string | null
}

// Thêm một hàm utility để lấy CSRF token từ cookie
const getCSRFToken = (): string | null => {
  const tokenCookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='));
  
  if (tokenCookie) {
    return decodeURIComponent(tokenCookie.split('=')[1]);
  }
  
  return null;
};

export default function ProfilePage({ user, posts: initialPosts, activities = [], error, flashMessage, flashError, authError }: ProfileProps) {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showUpdatePostModal, setShowUpdatePostModal] = useState(false)
  const [currentPostId, setCurrentPostId] = useState<number | null>(null)
  const [currentAction, setCurrentAction] = useState<string | null>(null)
  const [showEditCommentModal, setShowEditCommentModal] = useState(false)
  const [currentCommentId, setCurrentCommentId] = useState<number | null>(null)
  const [currentCommentContent, setCurrentCommentContent] = useState('')
  const [newCommentContent, setNewCommentContent] = useState<{ [key: number]: string }>({})
  const [commentLoading, setCommentLoading] = useState<{ [key: number]: boolean }>({})
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
    student_id: user?.student_id || '',
    currentPassword: '',
    newPassword: ''
  })
  const [updatePostData, setUpdatePostData] = useState({
    id: 0,
    title: '',
    content: '',
    modules: [] as number[]
  })
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [updateMessage, setUpdateMessage] = useState<string | null>(null)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set())
  const [availableModules, setAvailableModules] = useState<Module[]>([])
  const [moduleSearch, setModuleSearch] = useState('')
  const [moduleDropdownVisible, setModuleDropdownVisible] = useState(false)
  const [posts, setPosts] = useState<Post[]>(initialPosts)

  // Lấy danh sách modules từ server
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await fetch('/modules')
        if (response.ok) {
          const data = await response.json()
          setAvailableModules(data)
        }
      } catch (error) {
        console.error('Error fetching modules:', error)
      }
    }
    
    fetchModules()
  }, [])
  
  // Chuyển đổi module IDs sang Module objects khi edit post
  useEffect(() => {
    if (updatePostData.modules.length > 0 && availableModules.length > 0) {
      // Lấy các module objects từ danh sách module IDs
      const selectedModuleSet = new Set<string>()
      updatePostData.modules.forEach(moduleId => {
        const module = availableModules.find(m => m.id === moduleId)
        if (module) {
          selectedModuleSet.add(module.name)
        }
      })
      setSelectedModules(selectedModuleSet)
    }
  }, [updatePostData.modules, availableModules])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdateError(null)
    try {
      // Lấy CSRF token từ cookie
      const csrfToken = getCSRFToken();

      const response = await fetch('/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-XSRF-TOKEN': csrfToken || '',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })
      const data = await response.json()
      if (data.success) {
        window.location.reload()
      } else {
        setUpdateError(data.message || 'Có lỗi khi cập nhật hồ sơ')
      }
    } catch (error: any) {
      setUpdateError('Lỗi khi cập nhật hồ sơ: ' + (error?.message || error))
      console.error('Error updating profile:', error)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarError(null)
    const file = e.target.files?.[0]
    if (file) {
      // Kiểm tra kích thước file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setAvatarError('Kích thước ảnh không được vượt quá 5MB')
        return
      }

      // Kiểm tra định dạng file
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        setAvatarError('Chỉ chấp nhận ảnh định dạng JPG, PNG hoặc GIF')
        return
      }

      const formDataUpload = new FormData()
      formDataUpload.append('avatar', file)
      try {
        // Lấy CSRF token từ cookie
        const csrfToken = getCSRFToken();

        const response = await fetch('/profile/avatar', {
          method: 'POST',
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': csrfToken || '',
            'Accept': 'application/json',
          },
          credentials: 'include',
          body: formDataUpload
        })
        if (response.ok) {
          window.location.reload()
        } else {
          setAvatarError('Lỗi khi upload avatar')
        }
      } catch (error: any) {
        setAvatarError('Lỗi khi upload avatar: ' + (error?.message || error))
        console.error('Error uploading avatar:', error)
      }
    }
  }

  const handlePostAction = (postId: number, action: string) => {
    setCurrentPostId(postId)
    setCurrentAction(action)
    
    if (action === 'edit') {
      // Tìm post hiện tại
      const post = posts.find(p => p.id === postId)
      if (post) {
        setUpdatePostData({
          id: post.id,
          title: post.title,
          content: post.content,
          modules: post.modules?.map(m => m.id) || []
        })
        setShowUpdatePostModal(true)
      }
    } else if (action === 'delete') {
      setShowDeleteModal(true)
    }
  }
  
  const handleProfileDelete = () => {
    setCurrentAction('deleteProfile')
    setShowDeleteModal(true)
  }

  const confirmAction = async () => {
    try {
      if (currentAction === 'delete' && currentPostId) {
        // Xóa bài viết
        // Lấy CSRF token từ cookie
        const csrfToken = getCSRFToken();

        const response = await fetch(`/posts/${currentPostId}`, {
          method: 'DELETE',
          headers: {
            'X-XSRF-TOKEN': csrfToken || '',
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json',
          },
          credentials: 'include',
        })
        if (response.ok) {
          window.location.reload()
        } else {
          setUpdateError('Lỗi khi xóa bài viết')
        }
      } else if (currentAction === 'deleteProfile') {
        // Xóa tài khoản
        // Lấy CSRF token từ cookie
        const csrfToken = getCSRFToken();

        const response = await fetch('/profile', {
          method: 'DELETE',
          headers: {
            'X-XSRF-TOKEN': csrfToken || '',
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json',
          },
          credentials: 'include',
        })
        if (response.ok) {
          window.location.href = '/auth'
        } else {
          setUpdateError('Lỗi khi xóa tài khoản')
        }
      }
      setShowDeleteModal(false)
    } catch (error) {
      setShowDeleteModal(false)
      setUpdateError('Có lỗi xảy ra: ' + error)
      console.error('Error during confirmation action:', error)
    }
  }

  const updatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdateError(null)
    
    try {
      // Validate dữ liệu
      if (!updatePostData.title.trim()) {
        setUpdateError('Vui lòng nhập tiêu đề bài viết')
        return
      }
      
      // Lấy CSRF token
      const csrfToken = getCSRFToken()
      
      // Tạo FormData để gửi dữ liệu
      const formData = new FormData()
      formData.append('title', updatePostData.title)
      formData.append('content', updatePostData.content || '')
      
      // Thêm modules nếu có
      updatePostData.modules.forEach(moduleId => {
        formData.append('modules[]', moduleId.toString())
      })
      
      // Thêm ảnh nếu có
      const fileInput = document.getElementById('post-image-upload') as HTMLInputElement
      if (fileInput && fileInput.files && fileInput.files.length > 0) {
        formData.append('image', fileInput.files[0])
      }
      
      // Gửi request cập nhật
      const response = await fetch(`/posts/${updatePostData.id}`, {
        method: 'PUT',
        headers: {
          'X-XSRF-TOKEN': csrfToken || '',
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: formData
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Cập nhật lại danh sách bài viết
        const updatedPosts = posts.map(post => 
          post.id === updatePostData.id ? data.post : post
        )
        setPosts(updatedPosts)
        
        // Đóng modal và hiển thị thông báo
        setShowUpdatePostModal(false)
        setUpdateMessage('Bài viết đã được cập nhật thành công')
        
        // Xóa thông báo sau 3 giây
        setTimeout(() => {
          setUpdateMessage(null)
        }, 3000)
      } else {
        setUpdateError(data.message || 'Có lỗi khi cập nhật bài viết')
      }
    } catch (error: any) {
      setUpdateError('Lỗi khi cập nhật bài viết: ' + (error?.message || error))
      console.error('Error updating post:', error)
    }
  }
  
  // Thêm module vào bài viết
  const addModule = (module: Module) => {
    if (!updatePostData.modules.includes(module.id)) {
      setUpdatePostData(prev => ({
        ...prev,
        modules: [...prev.modules, module.id]
      }))
      
      setSelectedModules(prev => {
        const newSet = new Set(prev)
        newSet.add(module.name)
        return newSet
      })
    }
    setModuleSearch('')
    setModuleDropdownVisible(false)
  }
  
  // Xóa module khỏi bài viết
  const removeModule = (moduleName: string) => {
    // Tìm module id từ tên
    const moduleToRemove = availableModules.find(m => m.name === moduleName)
    if (moduleToRemove) {
      setUpdatePostData(prev => ({
        ...prev,
        modules: prev.modules.filter(id => id !== moduleToRemove.id)
      }))
      
      setSelectedModules(prev => {
        const newSet = new Set(prev)
        newSet.delete(moduleName)
        return newSet
      })
    }
  }

  // Kiểm tra người dùng có quyền xóa bình luận không
  const canDeleteComment = (comment: Comment, post: Post) => {
    // Đảm bảo user không null
    if (!user) return false;
    
    // Nếu người dùng là chủ bài viết, có thể xóa bất kỳ comment nào
    if (post.user?.id === user.id) {
      return true;
    }
    
    // Nếu người dùng là người bình luận, chỉ có thể xóa trong vòng 1 giờ
    if (comment.user?.id === user.id) {
      // Sử dụng hàm utility thời gian
      return isWithinTimeLimit(comment.created_at);
    }
    
    return false;
  };

  // Cập nhật hàm handleCommentAction
  const handleCommentAction = (commentId: number, content: string, action: string, post: Post) => {
    setCurrentCommentId(commentId);
    setCurrentCommentContent(content);
    
    // Kiểm tra xem comment có ID âm không (tức là comment tạm thời đang chờ phản hồi từ server)
    if (commentId < 0 && action === 'edit') {
      setUpdateError('Bình luận đang được gửi lên máy chủ, vui lòng đợi trong giây lát');
      setTimeout(() => {
        setUpdateError(null);
      }, 3000);
      return;
    }
    
    if (action === 'edit') {
      setShowEditCommentModal(true);
    } else if (action === 'delete') {
      // Xử lý xóa bình luận
      if (confirm('Bạn có chắc chắn muốn xóa bình luận này không?')) {
        deleteComment(commentId, post.id);
      }
    }
  };

  // Cập nhật hàm deleteComment
  const deleteComment = async (commentId: number, postId: number) => {
    try {
      // Xóa comment trên UI ngay lập tức (optimistic UI update)
      setPosts(currentPosts => 
        currentPosts.map(post => {
          if (post.comments && post.comments.some(c => c.id === commentId)) {
            return {
              ...post,
              comments: post.comments.filter(c => c.id !== commentId)
            }
          }
          return post
        })
      );
      
      // Lấy CSRF token từ cookie
      const csrfToken = getCSRFToken();
      
      // Gửi request xóa đến server
      const response = await fetch(`/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'X-XSRF-TOKEN': csrfToken || '',
          'Accept': 'application/json',
        },
        credentials: 'include',
      });
      
      // Nếu request thất bại, hoàn tác thay đổi UI
      if (!response.ok) {
        // Đọc nội dung lỗi
        const errorData = await response.json().catch(() => ({ error: 'Lỗi không xác định' }));
        console.error('Lỗi khi xóa bình luận:', response.status, errorData);
        
        // Hiển thị thông báo lỗi
        if (response.status === 403) {
          if (errorData.error && errorData.error.includes('1 giờ')) {
            setUpdateError('Không thể xóa bình luận sau 1 giờ đăng.');
          } else {
            setUpdateError(errorData.error || 'Bạn không có quyền xóa bình luận này.');
          }
        } else {
          setUpdateError('Lỗi khi xóa bình luận');
        }
        
        // Tải lại trang nếu xóa thất bại để đồng bộ dữ liệu
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      setUpdateError('Lỗi: ' + (error?.message || String(error)));
      
      // Tải lại trang nếu có lỗi
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };

  // Cập nhật hàm xử lý cập nhật bình luận
  const handleUpdateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentCommentId || !currentCommentContent) {
      console.error('Thiếu thông tin comment cần cập nhật');
      return;
    }
    
    try {
      // Tìm comment trong posts
      let targetComment: Comment | null = null;
      
      posts.forEach(post => {
        if (post.comments) {
          const foundComment = post.comments.find(c => c.id === currentCommentId);
          if (foundComment) {
            targetComment = foundComment;
          }
        }
      });
      
      if (targetComment) {
        // Kiểm tra thời gian bình luận (1 giờ) sử dụng tiện ích thời gian
        if (!isWithinTimeLimit(targetComment.created_at)) {
          setShowEditCommentModal(false);
          setUpdateError('Không thể chỉnh sửa bình luận sau 1 giờ');
          
          // Chờ 3 giây rồi tải lại trang
          setTimeout(() => {
            window.location.reload();
          }, 3000);
          
          return;
        }
      }

      // Lấy CSRF token từ cookie
      const csrfToken = getCSRFToken();
      
      // Lưu nội dung cũ để hoàn tác nếu cần
      const originalContent = targetComment ? targetComment.content : '';
      
      // Đóng modal trước để UI phản hồi nhanh
      setShowEditCommentModal(false);
      
      // Cập nhật UI ngay lập tức (optimistic update)
      setPosts(currentPosts => 
        currentPosts.map(post => {
          if (post.comments) {
            // Tìm và cập nhật comment trong post
            const updatedComments = post.comments.map(c => 
              c.id === currentCommentId 
                ? { ...c, content: currentCommentContent }
                : c
            );
            
            if (updatedComments.some(c => c.id === currentCommentId)) {
              return { ...post, comments: updatedComments };
            }
          }
          return post;
        })
      );
      
      // Dữ liệu gửi đi
      const updateData = {
        content: currentCommentContent,
      };
      
      console.log("Dữ liệu gửi đi:", updateData);
      
      // Gửi request update đến server
      const response = await fetch(`/comments/${currentCommentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-XSRF-TOKEN': csrfToken || '',
          'Accept': 'application/json', // Yêu cầu server trả về JSON
        },
        body: JSON.stringify(updateData),
        credentials: 'include',
      });
      
      console.log("Status code:", response.status);
      console.log("Status text:", response.statusText);
      
      // Đọc toàn bộ response text
      const responseText = await response.text();
      console.log("Response text:", responseText);
      
      // Phân tích response
      let responseData;
      try {
        if (responseText) {
          responseData = JSON.parse(responseText);
          console.log("Response data:", responseData);
        }
      } catch (err) {
        console.error("Không thể parse JSON:", err);
      }
      
      if (!response.ok) {
        // Hoàn tác thay đổi UI khi server từ chối cập nhật
        setPosts(currentPosts => 
          currentPosts.map(post => {
            if (post.comments) {
              const revertedComments = post.comments.map(c => 
                c.id === currentCommentId 
                  ? { ...c, content: originalContent }
                  : c
              );
              
              if (revertedComments.some(c => c.id === currentCommentId)) {
                return { ...post, comments: revertedComments };
              }
            }
            return post;
          })
        );
        
        // Hiển thị lỗi từ server nếu có
        if (responseData && responseData.error) {
          setUpdateError(responseData.error);
        } else {
          setUpdateError('Lỗi khi cập nhật bình luận. Vui lòng thử lại!');
        }
        
        // Nếu cập nhật thất bại, tải lại trang sau 2 giây
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        
        return;
      }
      
      // Hiển thị thông báo thành công
      if (responseData && responseData.message) {
        setUpdateMessage(responseData.message);
        
        // Ẩn thông báo sau 3 giây
        setTimeout(() => {
          setUpdateMessage(null);
        }, 3000);
      }
    } catch (error: any) {
      console.error('Lỗi khi cập nhật bình luận:', error);
      setUpdateError('Lỗi: ' + (error?.message || String(error)));
      
      // Tải lại trang sau 2 giây nếu có lỗi
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };

  // Cập nhật hàm xử lý gửi comment để hiển thị ngay không reload
  const handleSubmitComment = async (e: React.FormEvent, postId: number) => {
    e.preventDefault();
    
    // Ngăn chặn hành động mặc định form
    if (e && e.preventDefault) e.preventDefault();
    
    // Kiểm tra nội dung comment
    if (!newCommentContent[postId] || newCommentContent[postId].trim() === '') {
      return;
    }
    
    // Đánh dấu đang xử lý
    setCommentLoading(prev => ({ ...prev, [postId]: true }));
    
    try {
      // Lấy CSRF token từ cookie
      const csrfToken = getCSRFToken();
      
      // Lưu lại nội dung comment để sử dụng ngay cả khi xóa input
      const commentContent = newCommentContent[postId];
      
      // Tạo ID tạm thời âm để phân biệt với ID thực
      const tempId = -Date.now();
      
      // Tạo comment tạm thời để hiển thị ngay lập tức
      const tempComment: Comment = {
        id: tempId,
        content: commentContent,
        created_at: new Date().toISOString(),
        user: user as User
      };
      
      // Hiển thị comment tạm thời ngay lập tức
      setPosts(currentPosts => 
        currentPosts.map(post => {
          if (post.id === postId) {
            // Tạo một bản sao của post và thêm comment tạm thời
            return {
              ...post,
              comments: [...(post.comments || []), tempComment]
            };
          }
          return post;
        })
      );
      
      // Reset nội dung comment ngay lập tức
      setNewCommentContent(prev => ({ ...prev, [postId]: '' }));
      
      // Gửi request với CSRF token trong header
      const response = await fetch(`/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-XSRF-TOKEN': csrfToken || '',
        },
        credentials: 'include',
        body: JSON.stringify({ content: commentContent })
      });
      
      // Kiểm tra content-type của response để xác định có phải JSON không
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      
      if (response.ok) {
        // Xử lý response thành công
        if (isJson) {
          try {
            const responseData = await response.json();
            console.log('Comment response data:', responseData);
            
            // Nếu có dữ liệu từ server, cập nhật comment tạm thời bằng comment thực
            if (responseData && responseData.comment) {
              setPosts(currentPosts => 
                currentPosts.map(post => {
                  if (post.id === postId) {
                    // Tìm và thay thế comment tạm thời bằng comment thực từ server
                    const updatedComments = post.comments?.filter(c => c.id !== tempId) || [];
                    return {
                      ...post,
                      comments: [...updatedComments, responseData.comment]
                    };
                  }
                  return post;
                })
              );
            }
          } catch (err) {
            console.warn('Could not parse JSON response, using default values');
          }
        }
      } else {
        // Nếu response không thành công, xóa comment tạm thời
        setPosts(currentPosts => 
          currentPosts.map(post => {
            if (post.id === postId) {
              return {
                ...post,
                comments: post.comments?.filter(c => c.id !== tempId) || []
              };
            }
            return post;
          })
        );
        
        // Hiển thị lỗi nếu có
        if (isJson) {
          try {
            const errorData = await response.json();
            setUpdateError(errorData.message || 'Có lỗi khi gửi bình luận');
          } catch (err) {
            console.warn('Response error could not be parsed as JSON');
            setUpdateError('Có lỗi khi gửi bình luận');
          }
        } else {
          setUpdateError('Có lỗi khi gửi bình luận');
        }
      }
    } catch (error: any) {
      console.error('Error posting comment:', error);
      setUpdateError('Lỗi khi gửi bình luận: ' + (error?.message || String(error)));
    } finally {
      setCommentLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleCommentChange = (postId: number, value: string) => {
    setNewCommentContent(prev => ({ ...prev, [postId]: value }))
  }

  useEffect(() => {
    // Initialize Feather Icons (nếu cần)
    // Bạn có thể sử dụng một thư viện tương tự với Lucide React
  }, [])

  if (authError) {
    return (
      <Layout>
        <div className="container mx-auto p-8">
          <div className="text-red-500">{authError}</div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto p-8">
          <div className="text-red-500">{error}</div>
        </div>
      </Layout>
    )
  }

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto p-8">
          <div>Please login to view profile</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <main className="container mx-auto p-4 lg:p-8 bg-black">
        {/* Flash Messages */}
        {flashMessage && (
          <div className="bg-green-500 text-white p-4 rounded mb-4">{flashMessage}</div>
        )}
        {flashError && (
          <div className="bg-red-500 text-white p-4 rounded mb-4">{flashError}</div>
        )}
        {updateError && (
          <div className="bg-red-500 text-white p-2 rounded mb-2">{updateError}</div>
        )}
        {updateMessage && (
          <div className="bg-green-500 text-white p-2 rounded mb-2">{updateMessage}</div>
        )}
        {avatarError && (
          <div className="bg-red-500 text-white p-2 rounded mb-2">{avatarError}</div>
        )}
        
        {/* Profile Section */}
        <section className="profile-card bg-[#1A1A1A] rounded-lg p-6 mb-8 shadow-lg w-full border border-[#333]">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="profile-avatar rounded-full border-4 border-[#FF9900] overflow-hidden w-36 h-36">
                  <img
                    src={user.avatar ? `/uploads/${user.avatar}` : '/uploads/default-avatar.jpg'}
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <input
                  type="file"
                  id="avatarUpload"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  accept="image/*"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute bottom-0 right-0 bg-[#FF9900] p-2 rounded-full hover:bg-opacity-80"
                  onClick={() => document.getElementById('avatarUpload')?.click()}
                >
                  <Camera className="w-4 h-4 text-black" />
                </Button>
              </div>
            </div>

            {/* Profile Delete Button */}
            <div className="absolute top-4 right-4">
              <Button
                variant="ghost"
                className="p-1.5 rounded-full hover:text-[#FF9900] transition-colors"
                onClick={handleProfileDelete}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>

            {/* User Info */}
            <div className="flex-grow w-full md:w-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <label className="text-[#999] text-sm">Full Name</label>
                    <p className="text-white text-lg font-semibold">{user.username}</p>
                  </div>
                  <div>
                    <label className="text-[#999] text-sm">Email</label>
                    <p className="text-white text-lg">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-[#999] text-sm">Phone Number</label>
                    <p className="text-white text-lg">{user.phone_number || user.phoneNumber || '-'}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-[#999] text-sm">Student ID</label>
                    <p className="text-white text-lg">{user.student_id || user.studentId || '-'}</p>
                  </div>
                  <div>
                    <label className="text-[#999] text-sm">Like</label>
                    <p className="text-white text-lg">{user.likes || '0'}</p>
                  </div>
                  <div>
                    <label className="text-[#999] text-sm">Dislike</label>
                    <p className="text-white text-lg">{user.dislikes || '0'}</p>
                  </div>
                </div>
              </div>

              <Button
                className="mt-6 px-6 py-2 bg-[#FF9900] text-black rounded-lg hover:bg-opacity-80 font-medium"
                onClick={() => setShowEditModal(true)}
              >
                Edit Profile
              </Button>
            </div>
          </div>
        </section>

        {/* Lower Section Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Account Activity Section */}
          <div className="md:col-span-1">
            <section className="activity-card bg-[#1A1A1A] rounded-lg p-6 shadow-lg border border-[#333]">
              <h2 className="text-2xl font-bold mb-6 text-white">Account Activity</h2>
              <div className="space-y-6">
                {activities && activities.length > 0 ? (
                  activities.map((activity, index) => (
                    <div key={index} className="border-l-4 border-[#FF9900] pl-4">
                      <p className="text-white">{activity.action}</p>
                      <p className="text-[#999] text-sm">IP: {activity.ip}</p>
                      <p className="text-[#FF9900] text-sm">{formatDateTime(activity.timestamp)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-[#999]">No recent activity</p>
                )}
              </div>
            </section>
          </div>

          {/* Posts Section */}
          <div className="md:col-span-2">
            <div className="space-y-6">
              <h3 className="font-bold text-white text-xl mb-4">Bài viết đã đăng</h3>
              
              {posts.length === 0 ? (
                <div className="text-[#999] p-4 bg-[#1A1A1A] rounded-lg border border-[#333]">Chưa có bài viết nào</div>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="post-card bg-[#1A1A1A] rounded-lg shadow-md p-4 border border-[#333]" data-post-id={post.id}>
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border-2 border-[#FF9900]">
                        <img 
                          src={post.user?.avatar ? `/uploads/${post.user.avatar}` : '/uploads/default-avatar.jpg'} 
                          alt="User Avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{post.user?.username || user.username}</h3>
                        <p className="text-sm text-[#999]">{formatDateTime(post.created_at)}</p>
                      </div>
                      <div className="ml-auto flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          className="p-1.5 rounded-full hover:bg-[#FF9900] hover:text-black transition-colors"
                          onClick={() => handlePostAction(post.id, 'edit')}
                        >
                          <Edit className="w-5 h-5 text-[#999]" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="p-1.5 rounded-full hover:bg-[#FF9900] hover:text-white transition-colors"
                          onClick={() => handlePostAction(post.id, 'delete')}
                        >
                          <Trash2 className="w-5 h-5 text-[#999]" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h2 className="text-xl font-bold text-white mb-2">{post.title}</h2>
                      <p className="text-gray-300 whitespace-pre-line">{post.content}</p>
                      
                      {post.image && (
                        <div className="rounded-lg overflow-hidden mb-4 border border-[#333]">
                          <img
                            src={post.image}
                            alt="Post content"
                            className="w-full object-cover max-h-96"
                          />
                        </div>
                      )}
                      
                      {post.modules && post.modules.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {post.modules.map((module) => (
                            <Badge key={module.id} variant="outline" className="bg-[#333] text-white post-module border border-[#444]" data-module-id={module.id}>
                              #{module.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 my-4 py-2 border-y border-[#333]">
                      <Button className="flex items-center space-x-2 text-[#999] hover:text-[#FF9900] transition" variant="ghost">
                        <Eye className="w-5 h-5" />
                        <span>{post.view_count} views</span>
                      </Button>
                      <Button className="flex items-center space-x-2 text-[#999] hover:text-[#FF9900] transition" variant="ghost">
                        <ThumbsUp className="w-5 h-5" />
                        <span>{post.like_count} likes</span>
                      </Button>
                      <Button className="flex items-center space-x-2 text-[#999] hover:text-[#FF9900] transition" variant="ghost">
                        <ThumbsDown className="w-5 h-5" />
                        <span>{post.dislike_count} dislikes</span>
                      </Button>
                      <Button className="flex items-center space-x-2 text-[#999] hover:text-[#FF9900] transition" variant="ghost">
                        <Share2 className="w-5 h-5" />
                        <span>Share</span>
                      </Button>
                    </div>

                    {/* Comments Section */}
                    <div className="pt-2">
                      <h4 className="font-semibold text-sm text-gray-300 mb-2">Bình luận:</h4>
                      {post.comments && post.comments.length > 0 ? (
                        post.comments.map((comment) => (
                          <div key={comment.id} className="ml-8 mt-2 p-2 bg-[#222] rounded border border-[#333]">
                            <div className="flex items-center mb-1">
                              <div className="w-6 h-6 rounded-full overflow-hidden mr-2 border border-[#FF9900]">
                                <img 
                                  src={comment.user?.avatar ? `/uploads/${comment.user.avatar}` : '/uploads/default-avatar.jpg'} 
                                  alt="User Avatar"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="font-semibold text-sm text-gray-300">{comment.user?.username}</span>
                              <span className="text-xs text-[#999] ml-2">{formatDateTime(comment.created_at)}</span>
                              
                              <div className="ml-auto flex">
                                {/* Hiển thị nút xóa cho người bình luận hoặc chủ bài viết */}
                                {canDeleteComment(comment, post) && (
                                  <Button 
                                    variant="ghost" 
                                    className="w-5 h-5 p-0"
                                    onClick={() => handleCommentAction(comment.id, comment.content, 'delete', post)}
                                    title={comment.user?.id === user.id ? "Xóa bình luận của bạn" : "Xóa bình luận này"}
                                  >
                                    <Trash2 className="w-4 h-4 text-[#999] hover:text-[#FF9900]" />
                                  </Button>
                                )}
                                
                                {/* Chỉ hiển thị nút sửa cho người bình luận */}
                                {comment.user?.id === user.id && (
                                  <Button 
                                    variant="ghost" 
                                    className="w-5 h-5 p-0 ml-2"
                                    onClick={() => handleCommentAction(comment.id, comment.content, 'edit', post)}
                                  >
                                    <Edit className="w-4 h-4 text-[#999] hover:text-[#FF9900]" />
                                  </Button>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-400">{comment.content}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-[#999] text-sm ml-2">Không có bình luận nào</p>
                      )}

                      {/* Comment Form */}
                      <div className="mt-4 flex items-center space-x-2">
                        <div className="flex-grow">
                          <form 
                            className="flex items-center space-x-2" 
                            onSubmit={(e) => handleSubmitComment(e, post.id)}
                          >
                            <input 
                              type="text" 
                              placeholder="Viết bình luận..." 
                              className="w-full p-2 bg-black border border-[#333] rounded focus:outline-none focus:ring-2 focus:ring-[#FF9900] text-white"
                              value={newCommentContent[post.id] || ''}
                              onChange={(e) => handleCommentChange(post.id, e.target.value)}
                              required
                            />
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="ghost" 
                                className="text-[#999] hover:text-[#FF9900]" 
                                type="submit"
                                disabled={commentLoading[post.id]}
                              >
                                {commentLoading[post.id] ? (
                                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#FF9900] border-t-transparent" />
                                ) : (
                                  <Send className="w-5 h-5" />
                                )}
                              </Button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="bg-[#1A1A1A] text-white border border-[#333] shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-[#FF9900]">
                Edit Profile
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-white mb-2">Username</label>
                <Input
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  className="w-full p-2 bg-[#222] border border-[#444] text-white rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-white mb-2">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full p-2 bg-[#222] border border-[#444] text-white rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-white mb-2">Phone Number</label>
                <Input
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="w-full p-2 bg-[#222] border border-[#444] text-white rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-white mb-2">Student ID</label>
                <Input
                  value={formData.student_id}
                  onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                  className="w-full p-2 bg-[#222] border border-[#444] text-white rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-white mb-2">Current Password</label>
                <Input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  required
                  className="w-full p-2 bg-[#222] border border-[#444] text-white rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-white mb-2">New Password</label>
                <Input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  placeholder="Leave blank to keep current"
                  className="w-full p-2 bg-[#222] border border-[#444] text-white rounded-lg"
                />
              </div>
              
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowEditModal(false)}
                  className="bg-[#555] text-white px-6 py-2 rounded"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[#FF9900] text-black px-6 py-2 rounded font-medium"
                >
                  Update
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Confirm Delete Modal */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent className="bg-[#1A1A1A] text-white border border-[#333] shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-[#FF9900]">
                {currentAction === 'delete' ? 'Xóa Bài Viết' : 'Xóa Tài Khoản'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              {currentAction === 'delete' ? (
                <p className="text-[#CCC] mb-6">
                  Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác.
                </p>
              ) : (
                <>
                  <p className="text-[#FF9900] font-semibold mb-2">
                    Cảnh báo: Hành động này không thể hoàn tác!
                  </p>
                  <p className="text-[#CCC] mb-2">
                    Khi xóa tài khoản, tất cả dữ liệu sau đây của bạn sẽ bị xóa vĩnh viễn:
                  </p>
                  <ul className="list-disc ml-5 text-[#CCC] mb-6">
                    <li>Thông tin cá nhân và hồ sơ</li>
                    <li>Tất cả bài viết và bình luận</li>
                    <li>Lịch sử hoạt động</li>
                    <li>Tất cả thông báo và tin nhắn</li>
                  </ul>
                  <p className="text-[#CCC] mb-6">
                    Bạn có chắc chắn muốn tiếp tục?
                  </p>
                </>
              )}
              
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-2 bg-[#444] text-white rounded-lg hover:bg-opacity-80"
                >
                  Hủy
                </Button>
                <Button 
                  type="button" 
                  onClick={confirmAction}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-opacity-80"
                >
                  {currentAction === 'delete' ? 'Xóa Bài Viết' : 'Xóa Tài Khoản'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Comment Modal */}
        <Dialog open={showEditCommentModal} onOpenChange={setShowEditCommentModal}>
          <DialogContent className="bg-[#1A1A1A] text-white border border-[#333] shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-[#FF9900]">
                Edit Comment
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleUpdateComment} className="space-y-4">
              <textarea 
                value={currentCommentContent}
                onChange={(e) => setCurrentCommentContent(e.target.value)}
                rows={4}
                required
                className="w-full p-3 bg-[#222] border border-[#444] text-white rounded-lg"
              ></textarea>
              
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowEditCommentModal(false)}
                  className="bg-[#555] text-white px-6 py-2 rounded"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[#FF9900] text-black px-6 py-2 rounded font-medium"
                >
                  Update
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Update Post Modal */}
        <Dialog open={showUpdatePostModal} onOpenChange={setShowUpdatePostModal}>
          <DialogContent className="bg-[#1A1A1A] text-white border border-[#333] shadow-xl max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-[#FF9900]">
                Chỉnh Sửa Bài Viết
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={updatePost} className="space-y-4">
              <div>
                <label className="block text-white mb-2">Tiêu đề *</label>
                <Input
                  value={updatePostData.title}
                  onChange={(e) => setUpdatePostData({ ...updatePostData, title: e.target.value })}
                  placeholder="Nhập tiêu đề"
                  required
                  className="w-full p-3 bg-[#222] border border-[#444] text-white rounded-lg focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]"
                />
              </div>
              
              <div>
                <label className="block text-white mb-2">Nội dung *</label>
                <textarea 
                  value={updatePostData.content}
                  onChange={(e) => setUpdatePostData({ ...updatePostData, content: e.target.value })}
                  placeholder="Nhập nội dung"
                  rows={6}
                  required
                  className="w-full p-3 bg-[#222] border border-[#444] text-white rounded-lg focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]"
                ></textarea>
              </div>
              
              <div>
                <label className="block text-white mb-2">Ảnh</label>
                <Input
                  type="file"
                  id="post-image-upload"
                  accept="image/*"
                  className="w-full p-3 bg-[#222] border border-[#444] text-white rounded-lg file:mr-4 file:rounded-full file:border-0 file:bg-[#FF9900] file:text-white file:px-4 file:py-2 hover:file:bg-opacity-80"
                />
              </div>
              
              <div>
                <label className="block text-white mb-2">Modules</label>
                
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Tìm modules"
                    value={moduleSearch}
                    onChange={(e) => {
                      setModuleSearch(e.target.value)
                      setModuleDropdownVisible(e.target.value.length > 0)
                    }}
                    className="w-full p-3 bg-[#222] border border-[#444] text-white rounded-lg focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]"
                  />
                  
                  {moduleDropdownVisible && (
                    <div className="absolute z-10 mt-1 w-full bg-[#222] border border-[#444] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {availableModules
                        .filter(module => 
                          module.name.toLowerCase().includes(moduleSearch.toLowerCase())
                        )
                        .slice(0, 10)
                        .map(module => (
                          <div
                            key={module.id}
                            className="p-2 hover:bg-[#333] cursor-pointer"
                            onClick={() => addModule(module)}
                          >
                            #{module.name}
                          </div>
                        ))
                      }
                      
                      {availableModules.filter(module => 
                        module.name.toLowerCase().includes(moduleSearch.toLowerCase())
                      ).length === 0 && (
                        <div className="p-2 text-gray-400">Không tìm thấy module</div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="mt-2 flex flex-wrap gap-1">
                  {Array.from(selectedModules).map(moduleName => (
                    <Badge 
                      key={moduleName} 
                      className="bg-[#333] hover:bg-[#444] text-white gap-1 py-1"
                    >
                      #{moduleName}
                      <button
                        type="button"
                        className="ml-1 text-gray-400 hover:text-white"
                        onClick={() => removeModule(moduleName)}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowUpdatePostModal(false)}
                  className="bg-[#333] text-white px-4 py-2 rounded-lg hover:bg-[#444]"
                >
                  Hủy
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[#FF9900] text-black px-4 py-2 rounded-lg hover:bg-opacity-80"
                >
                  Cập nhật
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </Layout>
  )
}