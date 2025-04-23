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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Skeleton } from '../components/ui/skeleton'
import { MoreVertical, ThumbsUp, ThumbsDown, MessageCircle, Edit, Trash2, Plus, Eye, Share2, Send, Image as ImageIcon, X } from 'lucide-react'

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
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    feather.replace()
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

      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), data.comment]
      }))

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

      setComments(prev => ({
        ...prev,
        [editingComment.postId!]: (prev[editingComment.postId!] || []).map(c => 
          c.id === editingComment.id ? { ...c, content: editingComment.content } : c
        )
      }))

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
                      <p className="text-sm text-[#CCCCCC]">{new Date(post.created_at).toLocaleDateString()}</p>
                    </div>
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
                        {post.comments.map((comment) => (
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
                              <span className="text-xs text-[#CCCCCC] ml-2">{new Date(comment.created_at).toLocaleDateString()}</span>

                              {user && comment.user_id === user.id && (
                                <div className="ml-auto flex space-x-2">
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
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleDeleteComment(comment.id, post.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-[#CCCCCC] hover:text-[#FF9900]" />
                                  </Button>
                                </div>
                              )}
                            </div>
                            {/* Comment text set to white */}
                            <p className="text-sm text-white">{comment.content}</p>
                          </div>
                        ))}
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
              <DialogTitle className="text-2xl font-bold text-[#FF6B00]">Edit Comment</DialogTitle>
            </DialogHeader>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleEditComment()
              }}
              className="space-y-4"
            >
              <Textarea
                value={editingComment.content}
                onChange={(e) => setEditingComment(prev => ({ ...prev, content: e.target.value }))}
                rows={4}
                required
                className="w-full p-3 bg-[#2C2C2C] border border-gray-600 text-white rounded-lg"
              />

              <div className="flex justify-end space-x-2">
                <Button type="submit" className="bg-[#FF6B00] text-white px-4 py-2 rounded hover:bg-[#FF8533]">
                  Update
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEditingComment({ id: null, postId: null, content: '' })}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </Layout>
  )
}