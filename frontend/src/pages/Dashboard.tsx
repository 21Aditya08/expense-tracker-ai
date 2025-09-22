import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/api'
import CategorySection from '@/components/CategorySection'
import ExpenseSection from '@/components/ExpenseSection'

type User = {
  id: number
  username: string
  email: string
  name?: string
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get('/users/me')
        setUser(data)
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load user')
        if (err?.response?.status === 401) {
          localStorage.removeItem('token')
          navigate('/login')
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [navigate])

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  if (loading) return <p className="p-6">Loading...</p>
  if (error) return <p className="p-6 text-red-600">{error}</p>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Welcome{user?.name ? `, ${user.name}` : ''}</h1>
        <button onClick={logout} className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded">Logout</button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ExpenseSection />
        <CategorySection />
      </div>
    </div>
  )
}
