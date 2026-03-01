import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ShowcaseShowClient } from './ShowcaseShowClient'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const showcase = await prisma.showcase.findUnique({
        where: { id },
        select: { name: true, tagline: true },
    })

    if (!showcase) return { title: 'Showcase Not Found' }

    return {
        title: `${showcase.name} | Showcases | Spotify Advertising`,
        description: showcase.tagline,
    }
}

export default async function ShowcaseDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    const showcase = await prisma.showcase.findUnique({
        where: { id },
        include: {
            classification: true,
            samples: true,
            metrics: true,
        },
    })

    if (!showcase) notFound()

    // Get next showcase for navigation
    const nextShowcase = await prisma.showcase.findFirst({
        where: {
            createdAt: { gt: showcase.createdAt },
        },
        orderBy: { createdAt: 'asc' },
        select: { id: true, name: true },
    })

    // If no next, wrap around to first
    const fallbackNext = !nextShowcase
        ? await prisma.showcase.findFirst({
            where: { id: { not: showcase.id } },
            orderBy: { createdAt: 'asc' },
            select: { id: true, name: true },
        })
        : null

    return (
        <ShowcaseShowClient
            showcase={showcase}
            nextShowcase={nextShowcase || fallbackNext}
        />
    )
}
