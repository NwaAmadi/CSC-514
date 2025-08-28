export interface Cashier {
  id: string
  name: string
  mobileNumber: string
  address: string
  email: string
  createdAt: string
}

export interface Transaction {
  id: string
  user_id: string
  created_at: string
  amount: number
  type: "sale" | "refund" | "void" |'payment'
  description: string
  cashierName: string
}

export type UserRole = "admin" | "cashier" | null

export interface AuthState {
  isAuthenticated: boolean
  userRole: UserRole
}