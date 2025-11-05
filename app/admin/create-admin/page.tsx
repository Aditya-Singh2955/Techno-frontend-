"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { ShieldPlus } from "lucide-react"
import Link from "next/link"

export default function CreateAdminPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const getAuthHeaders = (): Record<string, string> => {
    let token: string | null = null
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('findr_token') || localStorage.getItem('authToken')
    }
    return token ? { 'Authorization': `Bearer ${token}` } : {}
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://techno-backend-a0s0.onrender.com/api/v1'
      const response = await fetch(`${API_BASE_URL}/admin/create-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ name, email, password })
      })

      const data = await response.json()

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'Failed to create admin')
      }

      toast({ title: "Admin created", description: data.message || "Admin created successfully" })
      setName("")
      setEmail("")
      setPassword("")
    } catch (err) {
      toast({ title: "Failed to create admin", description: err instanceof Error ? err.message : 'Something went wrong', variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3">
          <ShieldPlus className="w-6 h-6" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Create Admin Account</h1>
            <p className="text-emerald-100 text-sm">Add a new administrator to the platform.</p>
          </div>
        </div>
      </div>

      <Card className="max-w-2xl shadow-lg border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Admin details</CardTitle>
            <Link href="/admin/manage-admins">
              <Button variant="outline" className="hover:bg-emerald-50">Manage Admins</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Jane Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="jane@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Strong password"
                minLength={8}
              />
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700">
                {submitting ? "Creating..." : "Create Admin"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


