export type CategoryType = 'EXPENSE' | 'INCOME'

export interface Category {
  id: number
  name: string
  description?: string
  iconName?: string
  colorCode?: string
  isActive?: boolean
  type: CategoryType
}

export interface Expense {
  id: number
  title: string
  description?: string
  amount: number
  expenseDate: string
  type?: CategoryType
  paymentMethod?: string
  notes?: string
  receiptUrl?: string
  isRecurring?: boolean
  recurringFrequency?: string
  categoryId?: number
  categoryName?: string
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}
