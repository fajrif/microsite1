import { redirect, notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BannerForm } from '@/components/admin/BannerForm'

export default async function EditBannerPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/admin/login')

    const { id } = await params
    const banner = await prisma.banner.findUnique({ where: { id } })
    if (!banner) notFound()

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Banner</h1>
                <p className="mt-2 text-gray-600">Update banner details</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
                <BannerForm initialData={banner} />
            </div>
        </div>
    )
}
