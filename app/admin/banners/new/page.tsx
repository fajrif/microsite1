import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { BannerForm } from '@/components/admin/BannerForm'

export default async function NewBannerPage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/admin/login')

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Add Banner</h1>
                <p className="mt-2 text-gray-600">Create a new homepage banner</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
                <BannerForm />
            </div>
        </div>
    )
}
