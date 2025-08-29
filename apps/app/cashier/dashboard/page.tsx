'use client'

import { useEffect, useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Trash2, TrendingUp, TrendingDown, DollarSign, Receipt, PlusCircle, LogOut } from "lucide-react"

type Transaction = {
  id: string
  user_id: string
  cashier_name: string
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

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'NGN' }).format(amount);
}

export default function CashierDashboardPage() {
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

  useEffect(() => {
    const storedCashier = localStorage.getItem("cashier")
    const token = localStorage.getItem("cashierToken")
    if (!storedCashier || !token) {
      window.location.href = "/cashier/login";
      return
    }
    setCashier(JSON.parse(storedCashier))
  }, [])

  const loadTransactions = async (currentCashier: Cashier) => {
    if (!currentCashier) return
    setLoading(true)
    try {
      const token = localStorage.getItem("cashierToken")
      const res = await fetch(`${API_BASE}/api/transactions/${currentCashier.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Failed to fetch transactions")
      const data = await res.json()
      setTransactions(data)
    } catch (err: any) {
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

  const stats = useMemo(() => {
    const incomeTypes = ["sale", "income"];
    const expenseTypes = ["refund", "expense"];
    
    const totalIn = transactions
      .filter(tx => incomeTypes.includes(tx.type))
      .reduce((acc, tx) => acc + tx.amount, 0);

    const totalOut = transactions
      .filter(tx => expenseTypes.includes(tx.type))
      .reduce((acc, tx) => acc + tx.amount, 0);

    return {
      balance: totalIn - totalOut,
      totalIn,
      totalOut,
      totalTx: transactions.length
    }
  }, [transactions])

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
      const token = localStorage.getItem("cashierToken")
      const res = await fetch(`${API_BASE}/api/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: cashier.id,
          cashier_name: cashier.name,
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
      setTimeout(() => setSuccess(""), 3000); 
      setForm({ amount: "", type: "sale", description: "" })
      loadTransactions(cashier)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!cashier || !confirm("Are you sure you want to delete this transaction?")) return;
    try {
      const token = localStorage.getItem("cashierToken")
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

  const handleLogout = () => {
    localStorage.removeItem("cashier");
    localStorage.removeItem("cashierToken");
    window.location.href = "/cashier/login";
  }

  if (!cashier) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-lg text-gray-600">Loading Cashier Data...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Welcome, {cashier.name.split(' ')[0]}!</h1>
            <p className="text-md text-gray-500">Here is your transaction dashboard for today.</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="mt-4 sm:mt-0">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard icon={DollarSign} title="Net Balance" value={formatCurrency(stats.balance)} color="text-blue-600" />
            <StatCard icon={TrendingUp} title="Total Inflow" value={formatCurrency(stats.totalIn)} color="text-green-600" />
            <StatCard icon={TrendingDown} title="Total Outflow" value={formatCurrency(stats.totalOut)} color="text-red-600" />
        </div>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <aside className="lg:col-span-1">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <PlusCircle className="w-6 h-6 mr-2 text-blue-600"/>
                  New Transaction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input id="amount" type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required placeholder="0.00" />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as Transaction["type"] })}>
                      <SelectTrigger id="type"><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sale">Sale</SelectItem>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="refund">Refund</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                        <SelectItem value="void">Void</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required placeholder="e.g., Customer purchase" />
                  </div>
                  {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                  {success && <Alert variant="default"><AlertDescription>{success}</AlertDescription></Alert>}
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? "Saving..." : "Add Transaction"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </aside>

          <section className="lg:col-span-2">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Transaction History</CardTitle>
                <CardDescription>A log of all recent financial activities.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading transactions...</div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Receipt className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2">No transactions recorded yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((tx) => <TransactionItem key={tx.id} tx={tx} onDelete={handleDelete} />)}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

        </main>
      </div>
    </div>
  )
}



function StatCard({ icon: Icon, title, value, color }: { icon: React.ElementType, title: string, value: string, color: string }) {
    return (
        <Card className="shadow-sm">
            <CardContent className="p-6 flex items-center">
                <div className={`p-3 rounded-full bg-gray-100 mr-4 ${color}`}>
                    <Icon className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-2xl font-semibold text-gray-800">{value}</p>
                </div>
            </CardContent>
        </Card>
    )
}

function TransactionItem({ tx, onDelete }: { tx: Transaction, onDelete: (id: string) => void }) {
    const isOutflow = tx.type === "refund" || tx.type === "expense";
    return (
        <div className="border p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-gray-50 transition-colors">
            <div className="flex items-center mb-2 sm:mb-0">
                <div className={`p-2 rounded-full mr-3 ${isOutflow ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {isOutflow ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                </div>
                <div>
                    <p className="font-semibold text-gray-800">{tx.description}</p>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <Badge variant="outline" className="capitalize">{tx.type}</Badge>
                        <span>
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {new Date(tx.created_at).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4 mt-2 sm:mt-0 self-end sm:self-center">
                <p className={`font-semibold text-lg ${isOutflow ? 'text-red-600' : 'text-green-600'}`}>
                    {isOutflow ? '-' : '+'}
                    {formatCurrency(tx.amount)}
                </p>
                <Button size="icon" variant="ghost" className="text-gray-400 hover:text-red-500" onClick={() => onDelete(tx.id)}>
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
        </div>
    )
}