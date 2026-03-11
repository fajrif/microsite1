'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { BannerTable } from './BannerTable'

interface Banner {
    id: string
    order_no: number
    image: string | null
    title: string | null
    caption: string | null
    short_description: string | null
    cta_button_text: string | null
    cta_button_href: string | null
}

export function BannersClient() {
    const [banners, setBanners] = useState<Banner[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchBanners = useCallback(async () => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/banners')
            if (!response.ok) throw new Error('Failed to fetch banners')
            const data = await response.json()
            setBanners(data.banners)
        } catch (error) {
            console.error('Error fetching banners:', error)
            toast.error('Failed to load banners')
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchBanners()
    }, [fetchBanners])

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/banners/${id}`, { method: 'DELETE' })
            if (!response.ok) throw new Error('Failed to delete banner')
            toast.success('Banner deleted successfully')
            await fetchBanners()
        } catch (error) {
            console.error('Error deleting banner:', error)
            toast.error('Failed to delete banner')
            throw error
        }
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Banners</h1>
                    <p className="mt-2 text-gray-600">
                        Manage homepage banners. The banner with the lowest order number is shown first.
                    </p>
                </div>
                <Link href="/admin/banners/new">
                    <Button>Add Banner</Button>
                </Link>
            </div>
            <Card className="gap-4">
                <CardHeader />
                <CardContent>
                    <BannerTable
                        banners={banners}
                        isLoading={isLoading}
                        onDelete={handleDelete}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
