import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ShowcaseShowClient } from './ShowcaseShowClient'

export const dynamic = 'force-static'

const getShowcase = cache(async (slug: string) => {
    return prisma.showcase.findUnique({
        where: { slug },
        include: {
            classification: true,
            samples: { orderBy: { orderNo: 'asc' } },
            metrics: { orderBy: { orderNo: 'asc' } },
        },
    })
})

export async function generateStaticParams() {
    const showcases = await prisma.showcase.findMany({ select: { slug: true } })
    return showcases.map((s) => ({ id: s.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const showcase = await getShowcase(id)

    if (!showcase) return { title: '未找到展示区' }

    return {
        title: `${showcase.name} | Spotify 广告`,
        description: showcase.tagline,
    }
}

export default async function ShowcaseDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    const [showcase, allClassifications] = await Promise.all([
        getShowcase(id),
        prisma.classification.findMany({
            select: {
                id: true,
                name: true,
                showcases: {
                    select: { id: true, name: true, slug: true },
                    orderBy: { orderNo: 'asc' },
                },
            },
            orderBy: { orderNo: 'asc' },
        }),
    ])

    if (!showcase) notFound()

    return (
        <ShowcaseShowClient
            showcase={showcase}
            allClassifications={allClassifications}
        />
    )
}
