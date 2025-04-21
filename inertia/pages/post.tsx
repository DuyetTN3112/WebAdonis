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
import { MoreVertical, ThumbsUp, ThumbsDown, MessageCircle, Edit, Trash2, Plus } from 'lucide-react'

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

  if (loading) {
    return (
      <div className="flex-grow p-8 space-y-6">
        <Skeleton className="h-12 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-custom-darkGray border-none">
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
      <main className="flex-grow p-8 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-custom-orange">Posts</h1>
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button className="bg-custom-orange hover:bg-custom-orange/90">
                <Plus className="w-4 h-4 mr-2" />
                Create Post
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-custom-darkGray border-none">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-white">Create New Post</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Title"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="bg-custom-gray border-none text-white"
                />
                <Textarea
                  placeholder="Content"
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="bg-custom-gray border-none text-white min-h-[200px]"
                />
                <Button
                  onClick={handleCreatePost}
                  className="w-full bg-custom-orange hover:bg-custom-orange/90"
                >
                  Create Post
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue={current_filter || 'all'} className="w-full">
          <TabsList className="bg-custom-darkGray">
            <TabsTrigger value="all">All Posts</TabsTrigger>
            <TabsTrigger value="my-posts">My Posts</TabsTrigger>
            <TabsTrigger value="liked">Liked Posts</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-6">
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                {posts.data.map((post) => (
                  <Card key={post.id} className="bg-custom-darkGray border-none">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={post.user.avatar} />
                            <AvatarFallback>{post.user.username[0].toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-white">{post.user.username}</h3>
                            <p className="text-sm text-custom-lightGray">
                              {new Date(post.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-custom-darkGray border-none">
                            <DropdownMenuItem className="text-white">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h2 className="text-xl font-bold text-white mb-2">{post.title}</h2>
                      <p className="text-custom-lightGray">{post.content}</p>
                      {post.modules && post.modules.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {post.modules.map((module) => (
                            <Badge key={module.id} variant="secondary" className="bg-custom-orange/20 text-custom-orange">
                              {module.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <div className="flex space-x-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLikeDislike(post.id, 'like')}
                          className={cn(
                            'text-custom-lightGray hover:text-custom-orange',
                            post.liked && 'text-custom-orange'
                          )}
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          {post.like_count}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLikeDislike(post.id, 'dislike')}
                          className={cn(
                            'text-custom-lightGray hover:text-red-500',
                            post.disliked && 'text-red-500'
                          )}
                        >
                          <ThumbsDown className="h-4 w-4 mr-1" />
                          {post.dislike_count}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-custom-lightGray hover:text-custom-orange"
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {post.comments.length}
                        </Button>
                      </div>
                      <Badge variant="secondary" className="bg-custom-gray text-custom-lightGray">
                        {post.view_count} views
                      </Badge>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          {/* ... other TabsContent components ... */}
        </Tabs>
      </main>
    </Layout>
  )
}