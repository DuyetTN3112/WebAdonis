import { Head, useForm } from '@inertiajs/react'
import Layout from '../../app/layout'

export default function Register() {
  const { data, setData, post, processing, errors } = useForm({
    email: '',
    password: '',
    student_id: '',
    full_name: '',
    phone: '',
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/register')
  }

  return (
    <Layout title="Register">
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Create your account
            </h2>
          </div>
          <form onSubmit={submit} className="mt-8 space-y-6">
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="full_name" className="sr-only">Full Name</label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  value={data.full_name}
                  onChange={e => setData('full_name', e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Full Name"
                />
                {errors.full_name && <div className="text-red-500 text-sm mt-1">{errors.full_name}</div>}
              </div>
              <div>
                <label htmlFor="student_id" className="sr-only">Student ID</label>
                <input
                  id="student_id"
                  name="student_id"
                  type="text"
                  required
                  value={data.student_id}
                  onChange={e => setData('student_id', e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Student ID"
                />
                {errors.student_id && <div className="text-red-500 text-sm mt-1">{errors.student_id}</div>}
              </div>
              <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={data.email}
                  onChange={e => setData('email', e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                />
                {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
              </div>
              <div>
                <label htmlFor="phone" className="sr-only">Phone Number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={data.phone}
                  onChange={e => setData('phone', e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Phone Number (optional)"
                />
                {errors.phone && <div className="text-red-500 text-sm mt-1">{errors.phone}</div>}
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={data.password}
                  onChange={e => setData('password', e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
                {errors.password && <div className="text-red-500 text-sm mt-1">{errors.password}</div>}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={processing}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {processing ? 'Registering...' : 'Register'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
} 