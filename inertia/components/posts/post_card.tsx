import { Avatar, AvatarImage, AvatarFallback } from '@/lib/ui/avatar'
import { Button } from '@/lib/ui/button'
import { Eye, ThumbsUp, ThumbsDown, Share2 } from 'lucide-react'
// import CommentSection from './comment_section'
import { Card } from '@/lib/ui/card'

interface Post {
  id: number
  title: string
  content: string
  username: string
  created_at: string
  image?: string
  view_count: number
  like_count: number
  dislike_count: number
  comments: Comment[]
}

export default function PostCard({ post }: { post: Post }) {
  return (
    <Card className="p-4 border-orange-500">
      <div className="flex items-center mb-4">
        <Avatar>
          <AvatarImage src={post.image || '/uploads/votri.jpg'} />
          <AvatarFallback>{post.username.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="ml-4">
          <h3 className="font-bold">{post.username}</h3>
          <p className="text-sm text-gray-400">{post.created_at}</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-xl font-bold">{post.title}</h2>
        <p className="text-gray-300 whitespace-pre-line">{post.content}</p>
        
        {post.image && (
          <div className="rounded-lg overflow-hidden">
            <img 
              src={post.image} 
              alt="Post content" 
              className="w-full object-cover max-h-96"
            />
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-6 my-4 py-2 border-y border-gray-700">
        <Button variant="ghost" className="flex items-center space-x-2 text-gray-400">
          <Eye className="w-5 h-5" />
          <span>{post.view_count} views</span>
        </Button>
        
        <Button variant="ghost" className="flex items-center space-x-2 text-gray-400">
          <ThumbsUp className="w-5 h-5" />
          <span>{post.like_count} likes</span>
        </Button>
        
        <Button variant="ghost" className="flex items-center space-x-2 text-gray-400">
          <ThumbsDown className="w-5 h-5" />
          <span>{post.dislike_count} dislikes</span>
        </Button>
        
        <Button variant="ghost" className="flex items-center space-x-2 text-gray-400">
          <Share2 className="w-5 h-5" />
          <span>Share</span>
        </Button>
      </div>
      
      {/* <CommentSection postId={post.id} comments={post.comments} /> */}
    </Card>
  )
}