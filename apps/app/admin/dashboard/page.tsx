'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Users, Plus, Mail, Trash2, Loader2, CheckCircle2, XCircle, LogOut, DollarSign, TrendingUp, TrendingDown, Receipt } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'

// --- TYPE DEFINITIONS ---
interface Cashier {
  id: string
  name: string
  email: string
}

interface Transaction {
  id: string
  cashier_name: string
  amount: number
  type: "sale" | "refund" | "void" | "income" | "expense"
  description: string
  created_at: string
}

// --- HELPER FUNCTIONS ---
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'NGN' }).format(amount);
}

// --- MAIN COMPONENT ---
export default function AdminDashboardPage() {
  const [cashiers, setCashiers] = useState<Cashier[]>([])
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([])
  const [isAddingCashier, setIsAddingCashier] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  const [successOpen, setSuccessOpen] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorOpen, setErrorOpen] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const API_BASE = 'http://localhost:5000'

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
        window.location.href = "/admin/login";
        return;
    }
    fetchAllData(token);
  }, [])

  const fetchAllData = async (token: string) => {
    setIsFetching(true)
    try {
      const [cashiersRes, transactionsRes] = await Promise.all([
        fetch(`${API_BASE}/api/cashier`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/transactions`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (!cashiersRes.ok) throw new Error('Failed to fetch cashiers');
      if (!transactionsRes.ok) throw new Error('Failed to fetch transactions');

      const cashiersData = await cashiersRes.json();
      const transactionsData = await transactionsRes.json();
      
      setCashiers(cashiersData);
      setAllTransactions(transactionsData);

    } catch (err: any) {
      openError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setIsFetching(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/admin/login";
  }

  // --- STATS CALCULATION ---
  const stats = useMemo(() => {
    const totalIn = allTransactions
      .filter(tx => tx.type === "sale" || tx.type === "income")
      .reduce((acc, tx) => acc + tx.amount, 0);

    const totalOut = allTransactions
      .filter(tx => tx.type === "refund" || tx.type === "expense")
      .reduce((acc, tx) => acc + tx.amount, 0);

    return {
      balance: totalIn - totalOut,
      totalIn,
      totalOut,
      cashierCount: cashiers.length
    }
  }, [allTransactions, cashiers])

  // --- CASHIER MANAGEMENT HANDLERS ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const token = localStorage.getItem("adminToken");
    if (!token) return openError("Authentication error. Please log in again.");

    try {
        const res = await fetch(`${API_BASE}/api/cashier`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(formData),
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body.message || 'Failed to add cashier');

        openSuccess('Cashier added successfully!');
        setFormData({ name: '', email: '', password: '' });
        setIsAddingCashier(false);
        fetchAllData(token); // Refresh all data
    } catch (err: any) {
        openError(err.message);
    } finally {
        setIsLoading(false);
    }
  }

  const confirmDelete = (id: string) => {
    setPendingDeleteId(id);
    setDeleteOpen(true);
  }

  const handleDelete = async () => {
    if (!pendingDeleteId) return;
    const token = localStorage.getItem("adminToken");
    if (!token) return openError("Authentication error. Please log in again.");

    try {
        const res = await fetch(`${API_BASE}/api/cashier/${pendingDeleteId}`, { 
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to delete cashier');

        openSuccess('Cashier removed successfully');
        setCashiers(prev => prev.filter(c => c.id !== pendingDeleteId));
    } catch (err: any) {
        openError(err.message);
    } finally {
        setPendingDeleteId(null);
        setDeleteOpen(false);
    }
  }

  // --- MODAL UTILITIES ---
  const openError = (msg: string) => { setErrorMsg(msg); setErrorOpen(true); }
  const openSuccess = (msg: string) => { setSuccessMsg(msg); setSuccessOpen(true); }
  
  // --- RENDER LOGIC ---
  if (isFetching && !cashiers.length) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-slate-300">
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">

            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-50">Admin Dashboard</h1>
                    <p className="text-md text-gray-500 dark:text-slate-400">Overall business performance and cashier management.</p>
                </div>
                <Button onClick={handleLogout} variant="outline" className="mt-4 sm:mt-0 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                </Button>
              </div>
            </CardHeader>

            {isAddingCashier && (
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Cashier Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Enter full name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter email address"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter password"
                      value={formData.password}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <span className="inline-flex items-center justify-center">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding Cashier...
                      </span>
                    ) : (
                      'Add Cashier'
                    )}
                  </Button>
                </form>
              </CardContent>
            )}
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Registered Cashiers</CardTitle>
              <CardDescription>View all cashiers in the system</CardDescription>
            </CardHeader>
            <CardContent>
              {isFetching ? (
                <div className="flex justify-center items-center py-8 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  Loading cashiers...
                </div>
              ) : cashiers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No cashiers registered yet</p>
                  <p className="text-sm">Add your first cashier to get started</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {cashiers.map((cashier) => (
                    <div key={cashier.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{cashier.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="w-4 h-4" />
                            {cashier.email}
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => confirmDelete(cashier.id)}
                          aria-label={`Delete ${cashier.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Success
            </DialogTitle>
            <DialogDescription>{successMsg}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setSuccessOpen(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={errorOpen} onOpenChange={setErrorOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="w-5 h-5" />
              Error
            </DialogTitle>
            <DialogDescription>{errorMsg}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="destructive" onClick={() => setErrorOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete cashier?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove the cashier account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingDeleteId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// --- SUB-COMPONENTS ---
function StatCard({ icon: Icon, title, value, color }: { icon: React.ElementType, title: string, value: string, color: string }) {
    return (
        <Card className="shadow-sm bg-white dark:bg-slate-800 dark:border-slate-700">
            <CardContent className="p-6 flex items-center">
                <div className={`p-3 rounded-full bg-gray-100 dark:bg-slate-700 mr-4 ${color}`}>
                    <Icon className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-slate-400">{title}</p>
                    <p className="text-2xl font-semibold text-gray-800 dark:text-slate-50">{value}</p>
                </div>
            </CardContent>
        </Card>
    )
}

function TransactionItem({ tx }: { tx: Transaction }) {
    const isOutflow = tx.type === "refund" || tx.type === "expense";
    return (
        <div className="border dark:border-slate-700 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="flex items-center mb-2 sm:mb-0">
                <div className={`p-2 rounded-full mr-3 ${isOutflow ? 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-500' : 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400'}`}>
                    {isOutflow ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                </div>
                <div>
                    <p className="font-semibold text-gray-800 dark:text-slate-50">{tx.description}</p>
                    <div className="flex items-center flex-wrap gap-x-4 text-sm text-gray-500 dark:text-slate-400">
                        <Badge variant="secondary" className="capitalize dark:bg-slate-600 dark:text-slate-300">{tx.cashier_name}</Badge>
                        <Badge variant="outline" className="capitalize dark:border-slate-600 dark:text-slate-400">{tx.type}</Badge>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4 mt-2 sm:mt-0 self-end sm:self-center">
                <p className={`font-semibold text-lg ${isOutflow ? 'text-red-600 dark:text-red-500' : 'text-green-600 dark:text-green-400'}`}>
                    {isOutflow ? '-' : '+'} {formatCurrency(tx.amount)}
                </p>
            </div>
        </div>
    )
}