import { prisma } from '@/lib/prisma'
import { ShowcasesIndexClient } from './ShowcasesIndexClient'

export const metadata = {
    title: 'Showcases | Spotify Advertising',
    description: 'Hear some of the best in-class audio and video campaigns created by global brands and agencies.',
}

export default async function ShowcasesPage() {
    const classifications = await prisma.classification.findMany({
        orderBy: { orderNo: 'asc' },
        include: {
            showcases: {
                orderBy: { orderNo: 'asc' },
                include: {
                    samples: { orderBy: { orderNo: 'asc' } },
                    metrics: { orderBy: { orderNo: 'asc' } },
                },
            },
        },
    })

    return <ShowcasesIndexClient classifications={classifications} />
}
