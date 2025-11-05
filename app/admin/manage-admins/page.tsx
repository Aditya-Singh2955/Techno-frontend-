"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

type AdminRow = {
  _id: string
  name: string
  email: string
  password: string
  role: string
}

export default function ManageAdminsPage() {
  const [admins, setAdmins] = useState<AdminRow[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { toast } = useToast()

  const getAuthHeaders = (): Record<string, string> => {
    let token: string | null = null
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('findr_token') || localStorage.getItem('authToken')
    }
    return token ? { 'Authorization': `Bearer ${token}` } : {}
  }

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://techno-backend-a0s0.onrender.com/api/v1'

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      const resp = await fetch(`${API_BASE_URL}/admin/admins`, {
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }
      })
      const data = await resp.json()
      if (!resp.ok || !data?.success) throw new Error(data?.message || 'Failed to load admins')
      setAdmins(data.data || [])
    } catch (e) {
      toast({ title: 'Failed to load admins', description: e instanceof Error ? e.message : 'Error', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const deleteAdmin = async (id: string) => {
    if (admins.length <= 1) {
      toast({ title: 'Action not allowed', description: 'Cannot delete the last remaining admin', variant: 'destructive' })
      return
    }
    try {
      setDeletingId(id)
      const resp = await fetch(`${API_BASE_URL}/admin/admins/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }
      })
      const data = await resp.json()
      if (!resp.ok || !data?.success) throw new Error(data?.message || 'Failed to delete admin')
      toast({ title: 'Admin deleted' })
      setAdmins(prev => prev.filter(a => a._id !== id))
    } catch (e) {
      toast({ title: 'Delete failed', description: e instanceof Error ? e.message : 'Error', variant: 'destructive' })
    } finally {
      setDeletingId(null)
    }
  }

  useEffect(() => {
    fetchAdmins()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Manage Admins</h1>
            <p className="text-emerald-100 text-sm">View and remove admin credentials.</p>
          </div>
          <Button onClick={fetchAdmins} variant="outline" className="bg-white/20 hover:bg-white/30 text-white border-white/30">Refresh</Button>
        </div>
      </div>

      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-lg">All Admin Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-gray-600">Loading...</div>
          ) : admins.length === 0 ? (
            <div className="text-gray-600">No admins found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Password</th>
                    <th className="py-2 pr-4">Role</th>
                    <th className="py-2 pr-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map(a => (
                    <tr key={a._id} className="border-t">
                      <td className="py-2 pr-4 font-medium text-gray-900">{a.name}</td>
                      <td className="py-2 pr-4 text-gray-700">{a.email}</td>
                      <td className="py-2 pr-4 text-gray-700">{a.password}</td>
                      <td className="py-2 pr-4 capitalize text-gray-700">{a.role}</td>
                      <td className="py-2 pr-4">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteAdmin(a._id)}
                          disabled={deletingId === a._id || admins.length <= 1}
                        >
                          {deletingId === a._id ? 'Deleting...' : (admins.length <= 1 ? 'Locked' : 'Delete')}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


