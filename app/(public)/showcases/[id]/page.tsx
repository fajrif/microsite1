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

    const allClassifications = await prisma.classification.findMany({
        select: {
            id: true,
            name: true,
            showcases: {
                select: { id: true, name: true },
                orderBy: { createdAt: 'asc' },
            },
        },
        orderBy: { id: 'asc' },
    })

    return (
        <ShowcaseShowClient
            showcase={showcase}
            allClassifications={allClassifications}
        />
    )
}
