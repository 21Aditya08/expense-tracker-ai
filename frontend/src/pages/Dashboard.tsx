import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/api'
import CategorySection from '@/components/CategorySection'
import ExpensesManager from '@/components/ExpensesManager'
import { useQuery } from '@tanstack/react-query'

type User = {
  id: number
  username: string
  email: string
  name?: string
}

export default function Dashboard() {
  const navigate = useNavigate()

  const userQuery = useQuery<User>({
    queryKey: ['me'],
    queryFn: async () => (await api.get('/users/me')).data,
    retry: false,
  })

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  useEffect(() => {
    if (userQuery.isError && (userQuery.error as any)?.response?.status === 401) {
      localStorage.removeItem('token')
      navigate('/login')
    }
  }, [userQuery.isError, navigate])

  if (userQuery.isLoading) return <p className="p-6">Loading...</p>
  if (userQuery.isError) return <p className="p-6 text-red-600">Failed to load user</p>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
  <h1 className="text-2xl font-semibold">Welcome{userQuery.data?.name ? `, ${userQuery.data.name}` : ''}</h1>
        <button onClick={logout} className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded">Logout</button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ExpensesManager />
        <CategorySection />
      </div>
    </div>
  )
}
