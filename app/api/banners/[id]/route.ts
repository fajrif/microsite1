import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { uploadFile, deleteFile } from '@/lib/storage'

// GET /api/banners/[id]
export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params
        const banner = await prisma.banner.findUnique({ where: { id } })
        if (!banner) {
            return NextResponse.json({ error: 'Banner not found' }, { status: 404 })
        }
        return NextResponse.json(banner)
    } catch (error) {
        console.error('Error fetching banner:', error)
        return NextResponse.json({ error: 'Failed to fetch banner' }, { status: 500 })
    }
}

// PUT /api/banners/[id]
export async function PUT(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const imageFile = formData.get('image') as File | null

        const current = await prisma.banner.findUnique({ where: { id }, select: { image: true } })
        let imageUrl: string | null | undefined = undefined

        if (imageFile && imageFile.size > 0) {
            if (current?.image) {
                try { await deleteFile(current.image) } catch {}
            }
            imageUrl = await uploadFile(imageFile, imageFile.name)
        }

        const data: any = {
            order_no: parseInt(formData.get('order_no') as string) || 0,
            title: (formData.get('title') as string) || null,
            caption: (formData.get('caption') as string) || null,
            short_description: (formData.get('short_description') as string) || null,
            cta_button_text: (formData.get('cta_button_text') as string) || null,
            cta_button_href: (formData.get('cta_button_href') as string) || null,
        }
        if (imageUrl !== undefined) {
            data.image = imageUrl
        }

        const banner = await prisma.banner.update({ where: { id }, data })
        return NextResponse.json(banner)
    } catch (error) {
        console.error('Error updating banner:', error)
        return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 })
    }
}

// DELETE /api/banners/[id]
export async function DELETE(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const banner = await prisma.banner.findUnique({ where: { id }, select: { image: true } })
        if (banner?.image) {
            try { await deleteFile(banner.image) } catch {}
        }

        await prisma.banner.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting banner:', error)
        return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 })
    }
}
