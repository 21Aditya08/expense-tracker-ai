import { useEffect, useMemo, useState } from 'react'
import api from '@/lib/api'
import { Category, Expense, Page } from '@/types'

type ExpenseForm = Partial<Pick<Expense, 'id' | 'title' | 'description' | 'amount' | 'expenseDate' | 'categoryId'>>

export default function ExpenseSection() {
  const [items, setItems] = useState<Expense[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<ExpenseForm>({ expenseDate: new Date().toISOString().slice(0, 10) })
  const [filters, setFilters] = useState<{ startDate?: string; endDate?: string; categoryId?: number }>({})

  const params = useMemo(() => ({ page, size, sort: 'expenseDate,desc', ...filters }), [page, size, filters])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get<Page<Expense>>('/expenses', { params })
      setItems(data.content)
      setTotalPages(data.totalPages)
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load expenses')
    } finally {
      setLoading(false)
    }
  }

  async function loadCategories() {
    try {
      const { data } = await api.get<Page<Category>>('/categories', { params: { page: 0, size: 100, sort: 'name,asc', type: 'EXPENSE' } })
      setCategories(data.content)
    } catch {
      // ignore for now
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, filters])

  useEffect(() => {
    loadCategories()
  }, [])

  function onEdit(exp: Expense) {
    setForm({ id: exp.id, title: exp.title, description: exp.description, amount: exp.amount, expenseDate: exp.expenseDate, categoryId: exp.categoryId })
  }

  function resetForm() {
    setForm({ expenseDate: new Date().toISOString().slice(0, 10) })
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const payload = { ...form, amount: Number(form.amount), categoryId: Number(form.categoryId) }
    try {
      if (form.id) {
        await api.put(`/expenses/${form.id}`, payload)
      } else {
        await api.post(`/expenses`, payload)
      }
      resetForm()
      load()
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to save expense')
    }
  }

  async function onDelete(id: number) {
    if (!confirm('Delete this expense?')) return
    try {
      await api.delete(`/expenses/${id}`)
      load()
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to delete expense')
    }
  }

  return (
    <section className="bg-white shadow rounded p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Expenses</h2>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
        <input type="date" className="border rounded px-2 py-1" value={filters.startDate || ''} onChange={(e) => setFilters({ ...filters, startDate: e.target.value || undefined })} />
        <input type="date" className="border rounded px-2 py-1" value={filters.endDate || ''} onChange={(e) => setFilters({ ...filters, endDate: e.target.value || undefined })} />
        <select className="border rounded px-2 py-1" value={filters.categoryId || ''} onChange={(e) => setFilters({ ...filters, categoryId: e.target.value ? Number(e.target.value) : undefined })}>
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button className="border px-3 py-1 rounded" onClick={() => setFilters({})}>Clear</button>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-4">
        <input className="border rounded px-2 py-1" placeholder="Title" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <input className="border rounded px-2 py-1" placeholder="Description" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input className="border rounded px-2 py-1" placeholder="Amount" type="number" step="0.01" value={form.amount ?? ''} onChange={(e) => setForm({ ...form, amount: e.target.value ? Number(e.target.value) : undefined })} required />
        <input className="border rounded px-2 py-1" type="date" value={form.expenseDate || ''} onChange={(e) => setForm({ ...form, expenseDate: e.target.value })} required />
        <select className="border rounded px-2 py-1" value={form.categoryId ?? ''} onChange={(e) => setForm({ ...form, categoryId: e.target.value ? Number(e.target.value) : undefined })} required>
          <option value="" disabled>Select Category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">{form.id ? 'Update' : 'Add'}</button>
          {form.id && <button type="button" className="border px-3 py-1 rounded" onClick={resetForm}>Cancel</button>}
        </div>
      </form>

      {/* List */}
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-2">Date</th>
                <th className="py-2 pr-2">Title</th>
                <th className="py-2 pr-2">Category</th>
                <th className="py-2 pr-2">Amount</th>
                <th className="py-2 pr-2">Description</th>
                <th className="py-2 pr-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((e) => (
                <tr key={e.id} className="border-b">
                  <td className="py-2 pr-2">{e.expenseDate}</td>
                  <td className="py-2 pr-2">{e.title}</td>
                  <td className="py-2 pr-2">{e.categoryName}</td>
                  <td className="py-2 pr-2">₹ {e.amount.toFixed(2)}</td>
                  <td className="py-2 pr-2">{e.description}</td>
                  <td className="py-2 pr-2 space-x-2">
                    <button className="text-blue-600" onClick={() => onEdit(e)}>Edit</button>
                    <button className="text-red-600" onClick={() => onDelete(e.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
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
