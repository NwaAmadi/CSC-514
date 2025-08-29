'use client'

import { useEffect, useState } from "react"
// Note: Removed Next.js specific imports for compatibility
// import { useRouter } from "next/navigation" 
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Trash2 } from "lucide-react"

type Transaction = {
  id: string
  user_id: string
  cashier_name: string // Corrected from cashiername
  amount: number
  type: "sale" | "refund" | "void" | "income" | "expense"
  description: string
  created_at: string
}

type Cashier = {
  id: string
  name: string
  email: string
}

export default function CashierDashboardPage() {
  // const router = useRouter() // Removed for compatibility
  const [cashier, setCashier] = useState<Cashier | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({
    amount: "",
    type: "sale" as Transaction["type"],
    description: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const API_BASE = "http://localhost:5000"

  // Load cashier from localStorage
  useEffect(() => {
    const storedCashier = localStorage.getItem("cashier")
    const token = localStorage.getItem("cashierToken") // FIXED: Use correct token key

    if (!storedCashier || !token) {
      // router.push("/cashier/login") // Removed for compatibility
      window.location.href = "/cashier/login";
      return
    }

    setCashier(JSON.parse(storedCashier))
  }, []) // Removed router from dependency array

  // Load transactions
  const loadTransactions = async (currentCashier: Cashier) => {
    if (!currentCashier) return
    setLoading(true)
    try {
      const token = localStorage.getItem("cashierToken") // FIXED: Use correct token key
      const res = await fetch(`${API_BASE}/api/transactions/${currentCashier.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Failed to fetch transactions")
      const data = await res.json()
      setTransactions(data)
    } catch (err: any) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (cashier) {
        loadTransactions(cashier)
    }
  }, [cashier])

  // Add new transaction
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setSubmitting(true)

    if (!cashier) {
        setError("Cashier not loaded. Please refresh the page.");
        setSubmitting(false);
        return;
    }

    try {
      const token = localStorage.getItem("cashierToken") // FIXED: Use correct token key
      const res = await fetch(`${API_BASE}/api/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: cashier.id,
          cashier_name: cashier.name, // FIXED: Changed cashiername to cashier_name
          amount: parseFloat(form.amount),
          type: form.type,
          description: form.description,
        }),
      })

      if (!res.ok) {
        const { message } = await res.json()
        throw new Error(message || 'Failed to add transaction')
      }

      setSuccess("Transaction added successfully")
      setForm({ amount: "", type: "sale", description: "" })
      loadTransactions(cashier)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Delete transaction
  const handleDelete = async (id: string) => {
    if (!cashier) return;
    try {
      const token = localStorage.getItem("cashierToken") // FIXED: Use correct token key
      const res = await fetch(`${API_BASE}/api/transactions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Failed to delete transaction")
      loadTransactions(cashier)
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (!cashier) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <p className="ml-4">Loading cashier data...</p>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <Tabs defaultValue="transactions">
        <TabsList className="grid grid-cols-2 w-full mb-6">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="new">New Transaction</TabsTrigger>
        </TabsList>

        {/* Transactions List */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>All records for {cashier.name}</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? <p>Loading transactions...</p> : transactions.length === 0 ? (
                <p className="text-muted-foreground">No transactions yet.</p>
              ) : (
                <div className="space-y-4">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="border p-4 rounded flex justify-between items-center"
                    >
                      <div>
                        <p className="font-bold">{tx.type.toUpperCase()}</p>
                        <p>{tx.description}</p>
                        <p className="text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {new Date(tx.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge>{tx.amount.toFixed(2)} USD</Badge>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => handleDelete(tx.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add Transaction Form */}
        <TabsContent value="new">
          <Card>
            <CardHeader>
              <CardTitle>Add Transaction</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select
                    value={form.type}
                    onValueChange={(v) =>
                      setForm({ ...form, type: v as Transaction["type"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale">Sale</SelectItem>
                      <SelectItem value="refund">Refund</SelectItem>
                      <SelectItem value="void">Void</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    required
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert>
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : "Save"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
