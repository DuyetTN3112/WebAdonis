import { useState, useEffect } from 'react'
import { usePage } from '@inertiajs/react'
import feather from 'feather-icons'


export default function Auth() {
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [password, setPassword] = useState('')
  const { props } = usePage()
  const errors = props.errors || {}
  const csrfToken = props.csrfToken as string

  useEffect(() => {
    feather.replace()
  }, [passwordVisible])

  return (
    <div className="bg-custom-black min-h-screen flex px-4 py-8">
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
          {['Ask Questions', 'Connect with Communities', 'Comment on Post', 'Contact'].map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-black text-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right section */}
      <div className="w-1/2 pl-12 flex justify-center mt-[3cm]">
        {!showLogin ? (
          <div className="bg-custom-black p-6 rounded-lg border border-gray-700 w-[70%]">
            <h2 className="text-4xl font-bold text-white mb-2 text-center">Sign up for free</h2>
            <p className="text-center text-white mb-6">and enhance your experience</p>
            <form action="/register" method="POST" className="space-y-4">
              <div>
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  className="w-full p-2 rounded bg-custom-darkGray text-white border border-gray-700"
                />
                {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
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
                  onChange={(e) => setPassword(e.target.value)}
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
                {errors.phone_number && <p className="text-red-500 text-sm">{errors.phone_number}</p>}
              </div>
              <div>
                <input
                  type="text"
                  name="student_id"
                  placeholder="Student ID"
                  className="w-full p-2 rounded bg-custom-darkGray text-white border border-gray-700"
                />
                {errors.student_id && <p className="text-red-500 text-sm">{errors.student_id}</p>}
              </div>
              {password.length > 0 && (
                <div className="text-white text-sm">
                  Password Strength: <span>{password.length >= 8 ? 'Strong' : 'Weak'}</span>
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
              <span className="text-custom-blue hover:underline cursor-pointer">Terms and Conditions</span>.
            </p>
          </div>
        ) : (
          <div className="bg-custom-darkGray p-8 rounded-lg w-[400px] relative">
            <button className="absolute top-4 right-4 text-white" onClick={() => setShowLogin(false)}>
              <i data-feather="x"></i>
            </button>
            <div className="text-4xl font-bold mb-4 text-center">
              <span className="text-white">Forum</span>
              <span className="bg-custom-blue text-custom-black px-2 py-1 rounded">GW</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2 text-center">Member Sign in</h2>
            <p className="text-center text-white mb-6">Access your ForumGW account</p>
            <form action="/login" method="POST" className="space-y-4">
                {/* Thêm CSRF token vào form */}
              <input type="hidden" name="_csrf" value={csrfToken} />
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
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="absolute right-2 top-2 text-white"
                >
                  <i data-feather={passwordVisible ? 'eye-off' : 'eye'}></i>
                </button>
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