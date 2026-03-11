import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { BannersClient } from '@/components/admin/BannersClient'

export default async function BannersPage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/admin/login')

    return <BannersClient />
}
