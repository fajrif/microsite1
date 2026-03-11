import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { uploadFile } from '@/lib/storage'

// GET /api/banners
export async function GET() {
    try {
        const banners = await prisma.banner.findMany({
            orderBy: { order_no: 'asc' },
        })
        return NextResponse.json({ banners })
    } catch (error) {
        console.error('Error fetching banners:', error)
        return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 })
    }
}

// POST /api/banners
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const imageFile = formData.get('image') as File | null
        let imageUrl: string | null = null

        if (imageFile && imageFile.size > 0) {
            imageUrl = await uploadFile(imageFile, imageFile.name)
        }

        const banner = await prisma.banner.create({
            data: {
                order_no: parseInt(formData.get('order_no') as string) || 0,
                image: imageUrl,
                title: (formData.get('title') as string) || null,
                caption: (formData.get('caption') as string) || null,
                short_description: (formData.get('short_description') as string) || null,
                cta_button_text: (formData.get('cta_button_text') as string) || null,
                cta_button_href: (formData.get('cta_button_href') as string) || null,
            },
        })

        return NextResponse.json(banner, { status: 201 })
    } catch (error) {
        console.error('Error creating banner:', error)
        return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 })
    }
}
