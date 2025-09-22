import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '@/lib/api'

export default function Signup() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const payload = {
      username: String(form.get('username') || ''),
      email: String(form.get('email') || ''),
      password: String(form.get('password') || ''),
      name: String(form.get('name') || ''),
      firstName: String(form.get('firstName') || ''),
      lastName: String(form.get('lastName') || ''),
      phoneNumber: String(form.get('phoneNumber') || ''),
    }
    try {
      await api.post('/auth/signup', payload)
      navigate('/login')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-white shadow p-6 rounded">
        <h1 className="text-2xl font-semibold mb-4 text-center">Create account</h1>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm mb-1">First name</label>
              <input className="w-full border rounded px-3 py-2" name="firstName" />
            </div>
            <div>
              <label className="block text-sm mb-1">Last name</label>
              <input className="w-full border rounded px-3 py-2" name="lastName" />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">Display name</label>
            <input className="w-full border rounded px-3 py-2" name="name" />
          </div>
          <div>
            <label className="block text-sm mb-1">Username</label>
            <input className="w-full border rounded px-3 py-2" name="username" required />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input className="w-full border rounded px-3 py-2" name="email" type="email" required />
          </div>
          <div>
            <label className="block text-sm mb-1">Phone</label>
            <input className="w-full border rounded px-3 py-2" name="phoneNumber" />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input className="w-full border rounded px-3 py-2" name="password" type="password" required />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded mt-2"
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>
        <p className="text-sm mt-4 text-center">
          Already have an account?{' '}
          <Link className="text-blue-600 hover:underline" to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
