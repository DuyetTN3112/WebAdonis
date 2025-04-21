import { Head, Link } from '@inertiajs/react'
import Layout from './layouts/layout'
import { useState, useEffect } from 'react'
import feather from 'feather-icons'
import { cn } from '@/lib/utils'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar'
import { Badge } from '../components/ui/badge'
import { ScrollArea } from '../components/ui/scroll-area'

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
  current_filter?: string
}

export default function PostPage({ user, posts, current_filter }: PostProps) {
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

  useEffect(() => {
    feather.replace()
  }, [])

  const handleLikeDislike = async (postId: number, type: 'like' | 'dislike') => {
    try {
      const response = await fetch(`/posts/${postId}/like-dislike`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || ''
        },
        body: JSON.stringify({ type })
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const data = await response.json()

      // Update the post in the posts array
      const updatedPosts = posts.data.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            like_count: data.likes,
            dislike_count: data.dislikes,
            liked: data.liked_users,
            disliked: data.disliked_users
          }
        }
        return post
      })

      // Update the posts in the state
      posts.data = updatedPosts
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleAddComment = async (postId: number) => {
    if (!newComments[postId]?.trim()) return

    const formData = new FormData()
    formData.append('content', newComments[postId])
    if (commentImages[postId]) {
      formData.append('image', commentImages[postId] as File)
    }

    try {
      const response = await fetch(`/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || ''
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const data = await response.json()

      // Update comments for the post
      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), data.comment]
      }))

      // Clear the comment input
      setNewComments(prev => ({ ...prev, [postId]: '' }))
      setCommentImages(prev => ({ ...prev, [postId]: null }))
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleDeleteComment = async (commentId: number, postId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bình luận này không?')) return

    try {
      const response = await fetch(`/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || ''
        }
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      // Remove the comment from the state
      setComments(prev => ({
        ...prev,
        [postId]: (prev[postId] || []).filter(c => c.id !== commentId)
      }))
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleEditComment = async () => {
    if (!editingComment.id || !editingComment.postId || !editingComment.content.trim()) return

    try {
      const response = await fetch(`/comments/${editingComment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || ''
        },
        body: JSON.stringify({ content: editingComment.content })
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      // const data = await response.json()

      // Update the comment in the state
      setComments(prev => ({
        ...prev,
        [editingComment.postId!]: (prev[editingComment.postId!] || []).map(c => 
          c.id === editingComment.id ? { ...c, content: editingComment.content } : c
        )
      }))

      // Reset editing state
      setEditingComment({ id: null, postId: null, content: '' })
    } catch (error) {
      console.error('Error:', error)
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

    try {
      const response = await fetch('/posts', {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || ''
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const data = await response.json()

      // Add the new post to the beginning of the list
      posts.data = [data.post, ...posts.data]

      // Reset form
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

  return (
    <>
      <Head title="Posts | ForumGW" />
      
      <div className="container px-4 py-8 mx-auto">
        {/* Create Post Button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">
            {user ? `Welcome ${user.username}` : 'Recent Posts'}
          </h1>
          
          {user && (
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-custom-orange hover:bg-custom-orange-dark text-black"
            >
              Create Post
            </Button>
          )}
        </div>

        {/* Filter Options */}
        <div className="flex space-x-4 mb-6">
          <Link
            href="/?filter=most_view"
            className={cn(
              "flex items-center space-x-2 px-4 py-2 text-sm hover:text-custom-orange transition-colors",
              current_filter === 'most_view' ? 'text-custom-orange' : 'text-custom-lightGray'
            )}
          >
            <i data-feather="eye" className="w-4 h-4" />
            <span>Most View</span>
          </Link>
          <Link
            href="/?filter=most_liked"
            className={cn(
              "flex items-center space-x-2 px-4 py-2 text-sm hover:text-custom-orange transition-colors",
              current_filter === 'most_liked' ? 'text-custom-orange' : 'text-custom-lightGray'
            )}
          >
            <i data-feather="thumbs-up" className="w-4 h-4" />
            <span>Most Liked</span>
          </Link>
          <Link
            href="/?filter=most_disliked"
            className={cn(
              "flex items-center space-x-2 px-4 py-2 text-sm hover:text-custom-orange transition-colors",
              current_filter === 'most_disliked' ? 'text-custom-orange' : 'text-custom-lightGray'
            )}
          >
            <i data-feather="thumbs-down" className="w-4 h-4" />
            <span>Most Disliked</span>
          </Link>
          {current_filter && (
            <Link
              href="/"
              className="flex items-center space-x-2 px-4 py-2 text-sm text-custom-lightGray hover:text-custom-orange transition-colors"
            >
              <i data-feather="x" className="w-4 h-4" />
              <span>Clear Filter</span>
            </Link>
          )}
        </div>

        {/* Posts List */}
        <div className="space-y-6">
          {posts.data.map(post => (
            <Card key={post.id} className="bg-custom-darkGray border-custom-orange">
              <CardHeader className="flex flex-row items-center space-x-3 space-y-0">
                <Avatar>
                  <AvatarImage 
                    src={post.user?.avatar ? `/uploads/${post.user.avatar}` : '/uploads/votri.jpg'} 
                    alt={post.user?.username || 'User'}
                  />
                  <AvatarFallback>{post.user?.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{post.user?.username || 'Unknown User'}</h3>
                  <p className="text-sm text-custom-lightGray">
                    {new Date(post.created_at).toLocaleString()}
                  </p>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <h2 className="text-xl font-bold">{post.title}</h2>
                <p className="text-custom-lightGray whitespace-pre-line">{post.content}</p>
                
                {post.image && (
                  <img
                    src={`/uploads/${post.image}`}
                    alt="Post"
                    className="w-full object-cover max-h-96 rounded-lg"
                  />
                )}
                
                {/* Module Tags */}
                {post.modules && post.modules.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.modules.map(module => (
                      <Badge key={module.id} variant="outline" className="bg-custom-mediumGray border-custom-orange">
                        #{module.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="flex items-center justify-between border-t border-custom-mediumGray py-3">
                <div className="flex items-center space-x-6">
                  <button className="flex items-center space-x-2 text-custom-lightGray hover:text-custom-orange transition">
                    <i data-feather="eye" className="w-5 h-5" />
                    <span>{post.view_count} views</span>
                  </button>
                  
                  <button 
                    onClick={() => handleLikeDislike(post.id, 'like')}
                    className={cn(
                      "flex items-center space-x-2 hover:text-custom-orange transition",
                      isLiked(post) ? 'text-blue-500' : 'text-custom-lightGray'
                    )}
                  >
                    <i data-feather="thumbs-up" className="w-5 h-5" />
                    <span>{post.like_count} likes</span>
                  </button>
                  
                  <button 
                    onClick={() => handleLikeDislike(post.id, 'dislike')}
                    className={cn(
                      "flex items-center space-x-2 hover:text-custom-orange transition",
                      isDisliked(post) ? 'text-red-500' : 'text-custom-lightGray'
                    )}
                  >
                    <i data-feather="thumbs-down" className="w-5 h-5" />
                    <span>{post.dislike_count} dislikes</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 text-custom-lightGray hover:text-custom-orange transition">
                    <i data-feather="share-2" className="w-5 h-5" />
                    <span>Share</span>
                  </button>
                </div>
              </CardFooter>
              
              {/* Comments Section */}
              <div className="px-6 pb-6">
                <h4 className="font-semibold text-sm text-gray-300 mb-2">Comments:</h4>
                
                {(comments[post.id] || post.comments)?.length === 0 ? (
                  <p className="text-gray-500">No comments</p>
                ) : (
                  <ScrollArea className="h-64 rounded-md border border-custom-mediumGray p-4">
                    {(comments[post.id] || post.comments)?.map(comment => (
                      <div key={comment.id} className="ml-4 mb-4">
                        <div className="flex items-center mb-1">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage 
                              src={comment.user?.avatar ? `/uploads/${comment.user.avatar}` : '/uploads/votri.jpg'} 
                              alt={comment.user?.username || 'User'}
                            />
                            <AvatarFallback>{comment.user?.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                          </Avatar>
                          <strong className="text-sm">{comment.user?.username || 'Unknown User'}</strong>
                          <span className="ml-2 text-xs text-custom-lightGray">
                            {new Date(comment.created_at).toLocaleString()}
                          </span>
                          
                          {user?.id === comment.user_id && (
                            <div className="ml-auto flex space-x-2">
                              <button 
                                onClick={() => setEditingComment({ 
                                  id: comment.id, 
                                  postId: post.id, 
                                  content: comment.content 
                                })}
                                className="text-custom-lightGray hover:text-custom-orange"
                              >
                                <i data-feather="edit" className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteComment(comment.id, post.id)}
                                className="text-custom-lightGray hover:text-custom-orange"
                              >
                                <i data-feather="trash" className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-300 whitespace-pre-line">{comment.content}</p>
                        {comment.image && (
                          <img 
                            src={`/uploads/${comment.image}`} 
                            alt="Comment" 
                            className="mt-2 max-h-40 rounded"
                          />
                        )}
                      </div>
                    ))}
                  </ScrollArea>
                )}
                
                {user && (
                  <div className="mt-4 flex items-center space-x-2">
                    <Input
                      type="text"
                      value={newComments[post.id] || ''}
                      onChange={(e) => setNewComments(prev => ({ ...prev, [post.id]: e.target.value }))}
                      placeholder="Write a comment..."
                      className="flex-grow bg-custom-black border-custom-mediumGray text-white"
                    />
                    <input
                      type="file"
                      id={`comment-image-${post.id}`}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setCommentImages(prev => ({ 
                        ...prev, 
                        [post.id]: e.target.files?.[0] || null 
                      }))}
                    />
                    <label 
                      htmlFor={`comment-image-${post.id}`}
                      className="text-custom-lightGray hover:text-custom-orange cursor-pointer p-2"
                    >
                      <i data-feather="image" className="w-5 h-5" />
                    </label>
                    <button
                      onClick={() => handleAddComment(post.id)}
                      className="text-custom-lightGray hover:text-custom-orange p-2"
                    >
                      <i data-feather="send" className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {posts.meta.last_page > 1 && (
          <nav className="flex justify-center items-center space-x-2 mt-6">
            {posts.meta.current_page > 1 && (
              <>
                <Link
                  href="/?page=1"
                  className="px-4 py-2 bg-custom-darkGray text-white rounded-md hover:bg-custom-orange transition-colors"
                >
                  First
                </Link>
                <Link
                  href={`/?page=${posts.meta.current_page - 1}`}
                  className="px-4 py-2 bg-custom-darkGray text-white rounded-md hover:bg-custom-orange transition-colors"
                >
                  Previous
                </Link>
              </>
            )}

            {Array.from({ length: posts.meta.last_page }, (_, i) => i + 1).map(page => (
              <Link
                key={page}
                href={`/?page=${page}`}
                className={cn(
                  "px-4 py-2 rounded-md transition-colors",
                  page === posts.meta.current_page
                    ? "bg-custom-orange text-white"
                    : "bg-custom-darkGray text-custom-lightGray hover:bg-custom-mediumGray"
                )}
              >
                {page}
              </Link>
            ))}

            {posts.meta.current_page < posts.meta.last_page && (
              <>
                <Link
                  href={`/?page=${posts.meta.current_page + 1}`}
                  className="px-4 py-2 bg-custom-darkGray text-white rounded-md hover:bg-custom-orange transition-colors"
                >
                  Next
                </Link>
                <Link
                  href={`/?page=${posts.meta.last_page}`}
                  className="px-4 py-2 bg-custom-darkGray text-white rounded-md hover:bg-custom-orange transition-colors"
                >
                  Last
                </Link>
              </>
            )}
          </nav>
        )}
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-custom-darkGray rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-custom-orange">Create New Post</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <i data-feather="x" className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2">Title *</label>
                <Input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder="Enter title"
                  className="w-full bg-custom-mediumGray border-custom-mediumGray text-white"
                />
              </div>

              <div>
                <label className="block text-white mb-2">Content *</label>
                <Textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder="Enter description"
                  rows={6}
                  className="w-full bg-custom-mediumGray border-custom-mediumGray text-white"
                />
              </div>

              <div>
                <label className="block text-white mb-2">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewPost({ ...newPost, image: e.target.files?.[0] || null })}
                  className="w-full p-3 bg-custom-mediumGray border border-custom-mediumGray text-white rounded-lg file:mr-4 file:rounded-full file:border-0 file:bg-custom-orange file:text-black file:px-4 file:py-2 hover:file:bg-custom-orange-dark"
                />
              </div>

              <div>
                <label className="block text-white mb-2">Modules</label>
                <div className="relative">
                  <Input
                    type="text"
                    value={moduleSearch}
                    onChange={(e) => {
                      setModuleSearch(e.target.value)
                      if (e.target.value.startsWith('#')) {
                        setModuleDropdownVisible(true)
                      } else {
                        setModuleDropdownVisible(false)
                      }
                    }}
                    placeholder="Type # to select modules"
                    className="w-full bg-custom-mediumGray border-custom-mediumGray text-white"
                  />

                  {/* Selected Modules */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedModules.map(module => (
                      <Badge key={module.id} className="flex items-center bg-custom-orange text-black">
                        #{module.name}
                        <button 
                          type="button" 
                          onClick={() => removeModule(module.id)}
                          className="ml-2 text-black hover:text-white"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>

                  {/* Module Dropdown */}
                  {moduleDropdownVisible && (
                    <div className="absolute z-10 w-full bg-custom-mediumGray border border-custom-mediumGray rounded-lg mt-1 max-h-60 overflow-y-auto">
                      {/* In a real app, you would fetch modules based on search */}
                      <div 
                        className="px-4 py-2 hover:bg-custom-orange cursor-pointer"
                        onClick={() => addModule({ id: 1, name: 'Web Programming' })}
                      >
                        #Web Programming
                      </div>
                      <div 
                        className="px-4 py-2 hover:bg-custom-orange cursor-pointer"
                        onClick={() => addModule({ id: 2, name: 'Database' })}
                      >
                        #Database
                      </div>
                      <div 
                        className="px-4 py-2 hover:bg-custom-orange cursor-pointer"
                        onClick={() => addModule({ id: 3, name: 'Information Security' })}
                      >
                        #Information Security
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleCreatePost}
                  className="bg-custom-orange hover:bg-custom-orange-dark text-black"
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Comment Modal */}
      {editingComment.id && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-custom-darkGray rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-2xl font-bold text-custom-orange mb-4">Edit Comment</h2>
            <Textarea
              value={editingComment.content}
              onChange={(e) => setEditingComment({ ...editingComment, content: e.target.value })}
              rows={4}
              className="w-full bg-custom-mediumGray border-custom-mediumGray text-white mb-4"
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setEditingComment({ id: null, postId: null, content: '' })}
                className="text-white border-custom-mediumGray hover:bg-custom-mediumGray"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditComment}
                className="bg-custom-orange hover:bg-custom-orange-dark text-black"
              >
                Update
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

PostPage.layout = (page: React.ReactNode) => <Layout>{page}</Layout>