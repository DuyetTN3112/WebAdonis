// D:\WebAdonis\inertia\pages\auth.tsx
import { useState, useEffect } from 'react'
import { usePage, router } from '@inertiajs/react'
import feather from 'feather-icons'

export default function Auth() {
  const { props } = usePage()
  const debugError = props.errors?.debug
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [showLogin, setShowLogin] = useState(false)

  // Controlled input state for login
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPass, setLoginPass] = useState('')
  
  const errors = props.errors || {}
  const csrfToken = props.csrfToken as string
  const message = props.message as string | undefined

  useEffect(() => {
    feather.replace()
  }, [passwordVisible])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    router.post(
      '/login',
      { email: loginEmail, password: loginPass, _csrf: csrfToken },
      {
        onError: (errors) => {
          console.error('🛑 Validation errors:', errors)
        },
        onSuccess: () => {
          // Navigate to posts page on successful login
          router.get('/posts', {}, { preserveState: true })
        },
        onFinish: () => {
          console.log('🚀 Visit /login hoàn tất')
        },
      }
    )
  }

  return (
    <div className="bg-custom-black min-h-screen flex px-4 py-8">

      {debugError && (
        <div className="fixed bottom-0 left-0 right-0 bg-red-900 p-4 text-xs text-gray-300">
          <div className="container mx-auto">
            <details>
              <summary>Thông tin debug lỗi</summary>
              <pre className="whitespace-pre-wrap">{JSON.stringify(JSON.parse(debugError), null, 2)}</pre>
            </details>
          </div>
        </div>
      )}

      {/* Left section */}
      <div className="w-1/2 pr-8 flex flex-col items-start">
        <div className="mb-48" />
        <div className="text-4xl font-bold mb-8 self-start">
          <span className="text-black">Forum</span>
          <span className="bg-custom-blue text-custom-black px-2 py-1 rounded">GW</span>
        </div>
        <h1 className="text-5xl font-bold text-black text-left mb-12">
          THERE'S A LOT MORE TO FORUMGW THAN YOU THINK!
        </h1>
        <div className="flex justify-between items-center w-full">
          {['Ask Questions', 'Connect with Communities', 'Comment on Post', 'Contact'].map(
            (item, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="text-black text-sm">{item}</span>
              </div>
            )
          )}
        </div>
      </div>

      {/* Right section */}
      <div className="w-1/2 pl-12 flex justify-center mt-[3cm]">
        {!showLogin ? (
          <div className="bg-custom-black p-6 rounded-lg border border-gray-700 w-[70%]">
            <h2 className="text-4xl font-bold text-white mb-2 text-center">
              Sign up for free
            </h2>
            <p className="text-center text-white mb-6">and enhance your experience</p>
            <form action="/register" method="POST" className="space-y-4">
              {/* signup form unchanged */}
              <div>
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  className="w-full p-2 rounded bg-custom-darkGray text-white border border-gray-700"
                />
                {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="w-full p-2 rounded bg-custom-darkGray text-white border border-gray-700"
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>
              <div className="relative">
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  className="w-full p-2 rounded bg-custom-darkGray text-white border border-gray-700"
                  onChange={(e) => setLoginPass(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="absolute right-2 top-2 text-white"
                >
                  <i data-feather={passwordVisible ? 'eye-off' : 'eye'}></i>
                </button>
              </div>
              <div>
                <input
                  type="text"
                  name="phone_number"
                  placeholder="Phone Number (Optional)"
                  className="w-full p-2 rounded bg-custom-darkGray text-white border border-gray-700"
                />
                {errors.phone_number && (
                  <p className="text-red-500 text-sm">{errors.phone_number}</p>
                )}
              </div>
              <div>
                <input
                  type="text"
                  name="student_id"
                  placeholder="Student ID"
                  className="w-full p-2 rounded bg-custom-darkGray text-white border border-gray-700"
                />
                {errors.student_id && (
                  <p className="text-red-500 text-sm">{errors.student_id}</p>
                )}
              </div>
              {loginPass.length > 0 && (
                <div className="text-white text-sm">
                  Password Strength: <span>{loginPass.length >= 8 ? 'Strong' : 'Weak'}</span>
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-custom-blue text-custom-black p-2 rounded font-bold hover:bg-opacity-90"
              >
                Sign Up!
              </button>
              <div className="text-center text-white">
                Or{' '}
                <button
                  type="button"
                  onClick={() => setShowLogin(true)}
                  className="text-custom-blue hover:underline"
                >
                  Log in
                </button>
              </div>
            </form>
            <p className="text-white text-sm text-center mt-4">
              By signing up, you agree to our{' '}
              <span className="text-custom-blue hover:underline cursor-pointer">
                Terms and Conditions
              </span>.
            </p>
          </div>
        ) : (
          <div className="bg-custom-darkGray p-8 rounded-lg w-[400px] relative">
            <button
              className="absolute top-4 right-4 text-white"
              onClick={() => setShowLogin(false)}
            >
              <i data-feather="x"></i>
            </button>
            <div className="text-4xl font-bold mb-4 text-center">
              <span className="text-white">Forum</span>
              <span className="bg-custom-blue text-custom-black px-2 py-1 rounded">GW</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2 text-center">
              Member Sign in
            </h2>
            <p className="text-center text-white mb-6">
              Access your ForumGW account
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.error && (
                <div className="mb-4 p-2 bg-red-500 text-white rounded">
                  {errors.error}
                </div>
              )}
              {message && (
                <div className="mb-4 p-2 bg-green-600 text-white rounded">
                  {message}
                </div>
              )}
              <input type="hidden" name="_csrf" value={csrfToken} />
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="w-full p-2 rounded bg-custom-darkGray text-white border border-gray-700"
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>
              <div className="relative">
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  placeholder="Password"
                  value={loginPass}
                  onChange={e => setLoginPass(e.target.value)}
                  className="w-full p-2 rounded bg-custom-darkGray text-white border border-gray-700"
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="absolute right-2 top-2 text-white"
                >
                  <i data-feather={passwordVisible ? 'eye-off' : 'eye'}></i>
                </button>
                {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
              </div>
              <button
                type="submit"
                className="w-full bg-custom-blue text-custom-black p-2 rounded font-bold hover:bg-opacity-90"
              >
                Sign in
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}