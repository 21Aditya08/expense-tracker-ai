import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '@/lib/api'

export default function Login() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const usernameOrEmail = String(form.get('usernameOrEmail') || '')
    const password = String(form.get('password') || '')
    try {
      const { data } = await api.post('/auth/login', { usernameOrEmail, password })
      // Expecting { accessToken, tokenType, user }
      localStorage.setItem('token', data.accessToken)
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/dashboard')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-white shadow p-6 rounded">
        <h1 className="text-2xl font-semibold mb-4 text-center">Sign in</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Username or Email</label>
            <input
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
              name="usernameOrEmail"
              type="text"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
              name="password"
              type="password"
              required
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="text-sm mt-4 text-center">
          Don't have an account?{' '}
          <Link className="text-blue-600 hover:underline" to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
