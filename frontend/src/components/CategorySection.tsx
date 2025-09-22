import { useEffect, useMemo, useState } from 'react'
import api from '@/lib/api'
import { Category, Page } from '@/types'

type FormState = Partial<Pick<Category, 'name' | 'description' | 'iconName' | 'colorCode' | 'type'>> & { id?: number }

export default function CategorySection() {
  const [items, setItems] = useState<Category[]>([])
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>({ type: 'EXPENSE' })

  const params = useMemo(() => ({ page, size, sort: 'name,asc', type: 'EXPENSE' }), [page, size])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get<Page<Category>>('/categories', { params })
      setItems(data.content)
      setTotalPages(data.totalPages)
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size])

  function onEdit(cat: Category) {
    setForm({ id: cat.id, name: cat.name, description: cat.description, iconName: cat.iconName, colorCode: cat.colorCode, type: cat.type })
  }

  function resetForm() {
    setForm({ type: 'EXPENSE' })
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const payload = { ...form, type: form.type || 'EXPENSE' }
    try {
      if (form.id) {
        await api.put(`/categories/${form.id}`, payload)
      } else {
        await api.post(`/categories`, payload)
      }
      resetForm()
      load()
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to save category')
    }
  }

  async function onDelete(id: number) {
    if (!confirm('Delete this category?')) return
    try {
      await api.delete(`/categories/${id}`)
      load()
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to delete category')
    }
  }

  return (
    <section className="bg-white shadow rounded p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Categories</h2>
      </div>
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-4">
        <input className="border rounded px-2 py-1" placeholder="Name" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="border rounded px-2 py-1" placeholder="Description" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input className="border rounded px-2 py-1" placeholder="Icon" value={form.iconName || ''} onChange={(e) => setForm({ ...form, iconName: e.target.value })} />
        <input className="border rounded px-2 py-1" placeholder="#Color" value={form.colorCode || ''} onChange={(e) => setForm({ ...form, colorCode: e.target.value })} />
        <div className="flex gap-2">
          <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">
            {form.id ? 'Update' : 'Add'}
          </button>
          {form.id && (
            <button type="button" className="border px-3 py-1 rounded" onClick={resetForm}>Cancel</button>
          )}
        </div>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-2">Name</th>
                <th className="py-2 pr-2">Description</th>
                <th className="py-2 pr-2">Icon</th>
                <th className="py-2 pr-2">Color</th>
                <th className="py-2 pr-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-b">
                  <td className="py-2 pr-2">{c.name}</td>
                  <td className="py-2 pr-2">{c.description}</td>
                  <td className="py-2 pr-2">{c.iconName}</td>
                  <td className="py-2 pr-2">{c.colorCode}</td>
                  <td className="py-2 pr-2 space-x-2">
                    <button className="text-blue-600" onClick={() => onEdit(c)}>Edit</button>
                    <button className="text-red-600" onClick={() => onDelete(c.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-end gap-2 mt-3">
        <button disabled={page === 0} className="border px-2 py-1 rounded" onClick={() => setPage((p) => p - 1)}>Prev</button>
        <span>Page {page + 1} / {Math.max(totalPages, 1)}</span>
        <button disabled={page + 1 >= totalPages} className="border px-2 py-1 rounded" onClick={() => setPage((p) => p + 1)}>Next</button>
        <select className="border rounded px-2 py-1" value={size} onChange={(e) => setSize(parseInt(e.target.value))}>
          {[10, 20, 50].map((s) => <option key={s} value={s}>{s} / page</option>)}
        </select>
      </div>
    </section>
  )
}
