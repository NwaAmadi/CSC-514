'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Users, Plus, Mail, Trash2, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface Cashier {
  id: string
  name: string
  email: string
}

export default function AdminDashboardPage() {
  const [cashiers, setCashiers] = useState<Cashier[]>([])
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

  const openError = (msg: string) => {
    setErrorMsg(msg)
    setErrorOpen(true)
  }
  const openSuccess = (msg: string) => {
    setSuccessMsg(msg)
    setSuccessOpen(true)
  }

  const fetchCashiers = async () => {
    try {
      setIsFetching(true)
      const res = await fetch(`${API_BASE}/api/cashier`)
      if (!res.ok) throw new Error('Failed to fetch cashiers')
      const data: Cashier[] = await res.json()
      setCashiers(data)
    } catch (err: any) {
      openError(err.message || 'Failed to fetch cashiers')
    } finally {
      setIsFetching(false)
    }
  }

  useEffect(() => {
    fetchCashiers()
    
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setIsLoading(false)
      return openError('All fields are required')
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setIsLoading(false)
      return openError('Please enter a valid email address')
    }
    if (cashiers.some((c) => c.email === formData.email.trim())) {
      setIsLoading(false)
      return openError('A cashier with this email already exists')
    }

    try {
      const res = await fetch(`${API_BASE}/api/cashier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.message || 'Failed to add cashier')

      openSuccess('Cashier added successfully!')
      setFormData({ name: '', email: '', password: '' })
      setIsAddingCashier(false)
      fetchCashiers()
    } catch (err: any) {
      openError(err.message || 'Failed to add cashier')
    } finally {
      setIsLoading(false)
    }
  }

  const confirmDelete = (id: string) => {
    setPendingDeleteId(id)
    setDeleteOpen(true)
  }

  const handleDelete = async () => {
    if (!pendingDeleteId) return
    try {
      const res = await fetch(`${API_BASE}/api/cashier/${pendingDeleteId}`, { method: 'DELETE' })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.message || 'Failed to delete cashier')

      openSuccess('Cashier removed successfully')
      setCashiers((prev) => prev.filter((c) => c.id !== pendingDeleteId))
    } catch (err: any) {
      openError(err.message || 'Failed to delete cashier')
    } finally {
      setPendingDeleteId(null)
      setDeleteOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8">
         
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Cashier Management</CardTitle>
                  <CardDescription>Add new cashiers to the system</CardDescription>
                </div>
                <Button onClick={() => setIsAddingCashier((v) => !v)}>
                  <Plus className="w-4 h-4 mr-2" />
                  {isAddingCashier ? 'Cancel' : 'Add Cashier'}
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
