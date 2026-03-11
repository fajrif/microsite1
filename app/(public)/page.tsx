import { prisma } from '@/lib/prisma'
import HomePageClient from './HomePageClient'

export default async function HomePage() {
    const banner = await prisma.banner.findFirst({
        orderBy: { order_no: 'asc' },
    })

    return <HomePageClient banner={banner} />
}
