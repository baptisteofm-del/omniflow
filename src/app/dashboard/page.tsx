'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.push('/dashboard-app/dashboard')
  }, [router])

  return null
}
