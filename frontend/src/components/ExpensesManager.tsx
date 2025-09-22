import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { Category, Expense, Page } from '@/types'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Calendar as CalendarIcon, Pencil, Trash2, Plus } from 'lucide-react'

const expenseSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, 'Title is required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  expenseDate: z.coerce.date(),
  categoryId: z.coerce.number().min(1, 'Category is required'),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof expenseSchema>

export default function ExpensesManager() {
  const qc = useQueryClient()
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Expense | null>(null)
  const [filters, setFilters] = useState<{ startDate?: string; endDate?: string; categoryId?: number }>({})

  const params = useMemo(() => ({ page, size, sort: 'expenseDate,desc', ...filters }), [page, size, filters])

  const expensesQuery = useQuery<Page<Expense>>({
    queryKey: ['expenses', params],
    queryFn: async () => (await api.get<Page<Expense>>('/expenses', { params })).data,
    placeholderData: (prev) => prev,
  })

  const categoriesQuery = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => (await api.get<Page<Category>>('/categories', { params: { page: 0, size: 100, sort: 'name,asc', type: 'EXPENSE' } })).data.content,
  })

  const createMutation = useMutation({
    mutationFn: (payload: any) => api.post('/expenses', payload),
    onSuccess: () => {
      toast.success('Expense created')
      qc.invalidateQueries({ queryKey: ['expenses'] })
      setOpen(false)
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to create expense'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) => api.put(`/expenses/${id}`, payload),
    onSuccess: () => {
      toast.success('Expense updated')
      qc.invalidateQueries({ queryKey: ['expenses'] })
      setOpen(false)
      setEditing(null)
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to update expense'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/expenses/${id}`),
    onSuccess: () => {
      toast.success('Expense deleted')
      qc.invalidateQueries({ queryKey: ['expenses'] })
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to delete expense'),
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(expenseSchema) as any,
    defaultValues: { title: '', amount: 0, expenseDate: new Date(), categoryId: undefined as any, description: '' },
  })

  function openCreate() {
    setEditing(null)
    form.reset({ title: '', amount: 0, expenseDate: new Date(), categoryId: undefined, description: '' })
    setOpen(true)
  }
  function openEdit(exp: Expense) {
    setEditing(exp)
    form.reset({
      id: exp.id,
      title: exp.title,
      amount: exp.amount,
      expenseDate: new Date(exp.expenseDate),
      categoryId: exp.categoryId!,
      description: exp.description || '',
    })
    setOpen(true)
  }

  function onSubmit(values: FormValues) {
    const payload = {
      title: values.title,
      amount: values.amount,
      expenseDate: format(values.expenseDate, 'yyyy-MM-dd'),
      categoryId: values.categoryId,
      description: values.description || undefined,
    }
    if (editing?.id) {
      updateMutation.mutate({ id: editing.id, payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  return (
    <section className="bg-white shadow rounded p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Expenses</h2>
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4" /> Add Expense
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
        <Input type="date" value={filters.startDate || ''} onChange={(e) => setFilters({ ...filters, startDate: e.target.value || undefined })} />
        <Input type="date" value={filters.endDate || ''} onChange={(e) => setFilters({ ...filters, endDate: e.target.value || undefined })} />
        <select className="border rounded px-2 py-1" value={filters.categoryId || ''} onChange={(e) => setFilters({ ...filters, categoryId: e.target.value ? Number(e.target.value) : undefined })}>
          <option value="">All Categories</option>
          {categoriesQuery.data?.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <Button variant="outline" onClick={() => setFilters({})}>Clear</Button>
      </div>

      {/* Table */}
      {expensesQuery.isLoading ? (
        <p>Loading...</p>
      ) : expensesQuery.isError ? (
        <p className="text-red-600">{(expensesQuery.error as any)?.message || 'Failed to load expenses'}</p>
      ) : (
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expensesQuery.data?.content.map((e: Expense) => (
                <TableRow key={e.id}>
                  <TableCell>{e.expenseDate}</TableCell>
                  <TableCell>{e.title}</TableCell>
                  <TableCell>{e.categoryName}</TableCell>
                  <TableCell>₹ {Number(e.amount).toFixed(2)}</TableCell>
                  <TableCell className="space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(e)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => { if (confirm('Delete this expense?')) deleteMutation.mutate(e.id) }}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-end gap-2 mt-3">
        <Button variant="outline" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Prev</Button>
  <span>Page {page + 1} / {Math.max((expensesQuery.data?.totalPages as number) || 1, 1)}</span>
  <Button variant="outline" disabled={(page + 1) >= ((expensesQuery.data?.totalPages as number) || 1)} onClick={() => setPage((p) => p + 1)}>Next</Button>
        <select className="border rounded px-2 py-1" value={size} onChange={(e) => setSize(parseInt(e.target.value))}>
          {[10, 20, 50].map((s) => <option key={s} value={s}>{s} / page</option>)}
        </select>
      </div>

      {/* Dialog Form */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
          </DialogHeader>
          <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit as any)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" {...form.register('title')} />
                {form.formState.errors.title && <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>}
              </div>
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" type="number" step="0.01" {...form.register('amount', { valueAsNumber: true })} />
                {form.formState.errors.amount && <p className="text-sm text-red-600">{form.formState.errors.amount.message}</p>}
              </div>
              <div>
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" /> {form.watch('expenseDate') ? format(form.watch('expenseDate'), 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Calendar selected={form.watch('expenseDate')} onSelect={(d?: Date) => d && form.setValue('expenseDate', d)} />
                  </PopoverContent>
                </Popover>
                {form.formState.errors.expenseDate && <p className="text-sm text-red-600">{form.formState.errors.expenseDate.message as string}</p>}
              </div>
              <div>
                <Label htmlFor="categoryId">Category</Label>
                <select id="categoryId" className="border rounded px-2 py-1 w-full" {...form.register('categoryId', { valueAsNumber: true })}>
                  <option value="">Select category</option>
                  {categoriesQuery.data?.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {form.formState.errors.categoryId && <p className="text-sm text-red-600">{form.formState.errors.categoryId.message as string}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" {...form.register('description')} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>{editing ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  )
}
