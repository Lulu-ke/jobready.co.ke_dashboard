'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Loader2, Building2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed')
        return
      }

      // Redirect based on role
      if (data.isAdmin) {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md shadow-lg border-gray-200">
        <CardHeader className="text-center space-y-2 pb-2">
          <div className="mx-auto w-12 h-12 rounded-xl bg-teal-700 flex items-center justify-center mb-2">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 tracking-tight">
            JobReady
          </CardTitle>
          <CardDescription className="text-gray-500">
            Sign in to your employer dashboard
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 bg-white border-gray-300 focus:border-teal-700 focus:ring-teal-700/20"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 bg-white border-gray-300 focus:border-teal-700 focus:ring-teal-700/20"
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-0 pb-6">
          <button
            type="button"
            onClick={() => router.push('/register')}
            className="text-sm text-teal-700 hover:text-teal-800 font-medium hover:underline cursor-pointer"
          >
            Register your company
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail('')
              setPassword('')
              setError('')
            }}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            Admin Login
          </button>
        </CardFooter>
      </Card>
    </div>
  )
}
