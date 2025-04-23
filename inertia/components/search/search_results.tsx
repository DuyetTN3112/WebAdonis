import { Link } from '@inertiajs/react'

interface SearchResult {
  id: number
  title?: string
  content?: string
  username?: string
  email?: string
  avatar?: string
  name?: string
  description?: string
  user?: {
    username: string
    avatar: string
  }
}

interface SearchResultsProps {
  type: string
  results: SearchResult[]
  onResultClick?: () => void
}

export default function SearchResults({ type, results, onResultClick }: SearchResultsProps) {
  const escapeHtml = (unsafe: string) => {
    if (!unsafe) return ''
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
  }

  return (
    <div className="absolute top-full left-0 w-full max-h-[400px] bg-[#222222] border border-[#333333] rounded-lg shadow-lg mt-2 z-50">
      <div className="max-h-[400px] overflow-y-auto">
        {results.length === 0 ? (
          <div className="p-4 text-[#CCCCCC] text-center">
            Không tìm thấy kết quả phù hợp
          </div>
        ) : (
          <>
            {type === 'post' && results.map((post) => (
              <Link 
                key={post.id} 
                href={`/posts/${post.id}`}
                className="p-4 border-b border-[#333333] hover:bg-[#333333] cursor-pointer"
                onClick={onResultClick}
              >
                <h3 className="font-bold text-white" dangerouslySetInnerHTML={{ __html: escapeHtml(post.title || '') }} />
                <p className="text-[#CCCCCC]">
                  {escapeHtml(post.content?.substring(0, 100) || '')}
                </p>
                <span className="text-sm text-[#CCCCCC]">
                  Bởi {escapeHtml(post.user?.username || post.username || '')}
                </span>
              </Link>
            ))}

            {type === 'user' && results.map((user) => (
              <Link
                key={user.id}
                href={`/profile/${user.id}`}
                className="flex p-4 border-b border-[#333333] hover:bg-[#333333] cursor-pointer items-center"
                onClick={onResultClick}
              >
                <img 
                  src={user.avatar ? `/uploads/${user.avatar}` : '/uploads/votri.jpg'} 
                  className="w-10 h-10 rounded-full mr-3" 
                  alt={user.username || ''}
                />
                <div>
                  <h3 className="font-bold text-white">{escapeHtml(user.username || '')}</h3>
                  <p className="text-[#CCCCCC]">{escapeHtml(user.email || '')}</p>
                </div>
              </Link>
            ))}

            {type === 'module' && results.map((module) => (
              <Link
                key={module.id}
                href={`/modules/${module.id}`}
                className="block p-4 border-b border-[#333333] hover:bg-[#333333] cursor-pointer"
                onClick={onResultClick}
              >
                <h3 className="font-bold text-white">#{escapeHtml(module.name || '')}</h3>
                <p className="text-[#CCCCCC]">
                  {escapeHtml(module.description || 'Không có mô tả')}
                </p>
              </Link>
            ))}
          </>
        )}
      </div>
    </div>
  )
}