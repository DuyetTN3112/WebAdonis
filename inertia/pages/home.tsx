import { Head } from '@inertiajs/react'
import Layout from './layouts/layout'
interface User {
  id: number
  name: string
  avatar?: string
}

interface Post {
  id: number
  title: string
  content: string
  image?: string
  username: string
  created_at: string
  view_count: number
  like_count: number
  dislike_count: number
  comments: Comment[]
}

interface Comment {
  id: number
  user_id: number
  username: string
  content: string
  created_at: string
}

interface HomeProps {
  user: User
  posts: Post[]
  current_filter?: string
}

export default function Home({ user, posts, current_filter }: HomeProps) {
  return (
    <>
      <Head title="ForumGW" />
      <div className="container px-4 py-8 mx-auto">
        <h1 className="text-black text-3xl font-bold mb-6">Welcome {user.name}</h1>

        {posts?.data?.map((post) => (
          <div
            key={post.id}
            className="bg-custom-darkGray text-black rounded-lg p-4 mb-6 border border-custom-orange"
          >
            <div className="flex items-center mb-4">
              <img
                src={user.avatar ? `/uploads/${user.avatar}` : '/uploads/votri.jpg'}
                className="w-10 h-10 rounded-full mr-3 object-cover"
                alt="User Avatar"
              />
              <div>
                <h3 className="font-semibold">{post.username}</h3>
                <p className="text-sm text-custom-lightGray">{post.created_at}</p>
              </div>
            </div>

            <h2 className="text-xl font-bold mb-2">{post.title}</h2>
            <p className="text-custom-lightGray mb-2">{post.content}</p>

            {post.image && (
              <img
                src={post.image}
                alt="Post"
                className="w-full object-cover max-h-96 rounded-lg mb-4"
              />
            )}

            <div className="flex space-x-4 text-custom-lightGray">
              <span>👁 {post.view_count}</span>
              <span>👍 {post.like_count}</span>
              <span>👎 {post.dislike_count}</span>
            </div>

            <div className="mt-4">
              <h4 className="text-sm text-gray-300 mb-1">Comments:</h4>
              {post.comments.length === 0 && <p className="text-gray-500">No comments</p>}
              {post.comments.map((c) => (
                <div key={c.id} className="ml-4 mb-2">
                  <strong className="text-sm">{c.username}</strong>
                  <span className="ml-2 text-xs text-custom-lightGray">{c.created_at}</span>
                  <p className="text-sm text-gray-300">{c.content}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
Home.layout = (page) => <Layout>{page}</Layout>