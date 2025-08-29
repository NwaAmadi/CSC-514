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
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard icon={DollarSign} title="Net Balance" value={formatCurrency(stats.balance)} color="text-blue-600 dark:text-blue-400" />
                <StatCard icon={TrendingUp} title="Total Inflow" value={formatCurrency(stats.totalIn)} color="text-green-600 dark:text-green-400" />
                <StatCard icon={TrendingDown} title="Total Outflow" value={formatCurrency(stats.totalOut)} color="text-red-600 dark:text-red-500" />
                <StatCard icon={Users} title="Total Cashiers" value={stats.cashierCount.toString()} color="text-purple-600 dark:text-purple-400" />
            </div>

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <aside className="lg:col-span-1 space-y-8">
                    <Card className="shadow-sm bg-white dark:bg-slate-800 dark:border-slate-700">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl text-gray-900 dark:text-slate-100">Manage Cashiers</CardTitle>
                                <CardDescription className="dark:text-slate-400">Add or remove cashiers</CardDescription>
                            </div>
                            <Button size="sm" onClick={() => setIsAddingCashier(v => !v)}>
                                <Plus className="w-4 h-4 mr-2" />
                                {isAddingCashier ? 'Cancel' : 'Add New'}
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {isAddingCashier && (
                                <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t dark:border-slate-700">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="dark:text-slate-400">Cashier Name</Label>
                                        <Input id="name" name="name" placeholder="Full name" value={formData.name} onChange={handleInputChange} disabled={isLoading} required className="dark:bg-slate-700 dark:border-slate-600"/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="dark:text-slate-400">Email Address</Label>
                                        <Input id="email" name="email" type="email" placeholder="email@example.com" value={formData.email} onChange={handleInputChange} disabled={isLoading} required className="dark:bg-slate-700 dark:border-slate-600"/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="dark:text-slate-400">Password</Label>
                                        <Input id="password" name="password" type="password" placeholder="Create a password" value={formData.password} onChange={handleInputChange} disabled={isLoading} required className="dark:bg-slate-700 dark:border-slate-600"/>
                                    </div>
                                    <Button type="submit" disabled={isLoading} className="w-full dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200">
                                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : null}
                                        {isLoading ? 'Creating...' : 'Create Cashier'}
                                    </Button>
                                </form>
                            )}

                            <div className="space-y-4 mt-6">
                                {isFetching && <div className="text-center dark:text-slate-500">Loading list...</div>}
                                {!isFetching && cashiers.length === 0 && <p className="text-center text-sm text-gray-500 dark:text-slate-500 py-4">No cashiers found.</p>}
                                {cashiers.map(cashier => (
                                    <div key={cashier.id} className="border dark:border-slate-700 rounded-lg p-3 flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold dark:text-slate-200">{cashier.name}</h3>
                                            <p className="text-sm text-muted-foreground dark:text-slate-400">{cashier.email}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => confirmDelete(cashier.id)} className="text-gray-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-500">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </aside>
                
                <section className="lg:col-span-2">
                    <Card className="shadow-sm bg-white dark:bg-slate-800 dark:border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-xl text-gray-900 dark:text-slate-100">Global Transaction History</CardTitle>
                            <CardDescription className="dark:text-slate-400">A log of all financial activities from all cashiers.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isFetching ? <div className="text-center py-8 dark:text-slate-400">Loading transactions...</div>
                            : allTransactions.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 dark:text-slate-500">
                                    <Receipt className="mx-auto h-12 w-12 text-gray-400 dark:text-slate-600" />
                                    <p className="mt-2">No transactions recorded yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                                    {allTransactions.map(tx => <TransactionItem key={tx.id} tx={tx} />)}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </section>
            </main>
        </div>

        
        <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
            <DialogContent className="dark:bg-slate-800 dark:border-slate-700">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-green-600 dark:text-green-400"><CheckCircle2/>Success</DialogTitle>
                    <DialogDescription className="dark:text-slate-400">{successMsg}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button onClick={() => setSuccessOpen(false)}>OK</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        <Dialog open={errorOpen} onOpenChange={setErrorOpen}>
            <DialogContent className="dark:bg-slate-800 dark:border-slate-700">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-500"><XCircle/>Error</DialogTitle>
                    <DialogDescription className="dark:text-slate-400">{errorMsg}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="destructive" onClick={() => setErrorOpen(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogContent className="dark:bg-slate-800 dark:border-slate-700">
                <AlertDialogHeader>
                    <AlertDialogTitle className="dark:text-slate-100">Delete cashier?</AlertDialogTitle>
                    <AlertDialogDescription className="dark:text-slate-400">This action cannot be undone. This will permanently remove the cashier account.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="dark:bg-slate-700 dark:border-slate-600 dark:hover:bg-slate-600">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
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