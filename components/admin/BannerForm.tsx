'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { FileOrUrlInput } from '@/components/ui/file-or-url-input'
import { UploadProgressList } from '@/components/ui/upload-progress'
import { useFileUpload } from '@/lib/hooks/use-file-upload'
import { toast } from 'sonner'

interface BannerFormProps {
    initialData?: {
        id: string
        order_no: number
        image: string | null
        title: string | null
        caption: string | null
        short_description: string | null
        cta_button_text: string | null
        cta_button_href: string | null
    }
}

export function BannerForm({ initialData }: BannerFormProps) {
    const router = useRouter()
    const isEdit = !!initialData
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image ?? null)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imageDirectUrl, setImageDirectUrl] = useState('')
    const upload = useFileUpload()

    const handleImageFile = (file: File | null) => {
        setImageFile(file)
        setImageDirectUrl('')
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => setImagePreview(reader.result as string)
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError('')

        try {
            const form = e.currentTarget
            const formData = new FormData(form)
            formData.delete('image')

            // Direct URL takes priority — skip upload entirely
            if (imageDirectUrl) {
                formData.set('image_url', imageDirectUrl)
            } else if (imageFile) {
                const results = await upload.uploadFiles([imageFile])
                const urls = Array.from(results.values())
                if (urls.length === 0) {
                    throw new Error('Image upload failed')
                }
                formData.set('image_url', urls[0])
            }

            const url = isEdit ? `/api/banners/${initialData.id}` : '/api/banners'
            const response = await fetch(url, {
                method: isEdit ? 'PUT' : 'POST',
                body: formData,
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to save banner')
            }

            toast.success(isEdit ? 'Banner updated successfully' : 'Banner created successfully')
            router.push('/admin/banners')
            router.refresh()
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Something went wrong'
            setError(msg)
            toast.error(msg)
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {/* Upload Progress */}
            {upload.items.length > 0 && (
                <UploadProgressList
                    items={upload.items}
                    overallProgress={upload.overallProgress}
                    onCancel={() => upload.abort()}
                />
            )}

            {/* Order No */}
            <div className="space-y-2">
                <Label htmlFor="order_no">Order No</Label>
                <Input
                    id="order_no"
                    name="order_no"
                    type="number"
                    defaultValue={initialData?.order_no ?? 0}
                    disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500">Lower number = shown first on homepage</p>
            </div>

            {/* Banner Image */}
            <FileOrUrlInput
                id="image"
                label="Banner Image"
                accept="image/*"
                disabled={isSubmitting}
                directUrl={imageDirectUrl}
                onFileChange={handleImageFile}
                onUrlChange={(url) => {
                    setImageDirectUrl(url)
                    setImageFile(null)
                }}
                preview={imagePreview && !imageDirectUrl ? (
                    <img src={imagePreview} alt="Preview" className="mt-2 max-h-48 rounded object-cover" />
                ) : undefined}
            />

            {/* Title */}
            <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                    id="title"
                    name="title"
                    defaultValue={initialData?.title ?? ''}
                    disabled={isSubmitting}
                />
            </div>

            {/* Caption */}
            <div className="space-y-2">
                <Label htmlFor="caption">Caption</Label>
                <Input
                    id="caption"
                    name="caption"
                    defaultValue={initialData?.caption ?? ''}
                    disabled={isSubmitting}
                />
            </div>

            {/* Short Description */}
            <div className="space-y-2">
                <Label htmlFor="short_description">Short Description</Label>
                <Textarea
                    id="short_description"
                    name="short_description"
                    defaultValue={initialData?.short_description ?? ''}
                    disabled={isSubmitting}
                />
            </div>

            {/* CTA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="cta_button_text">CTA Button Text</Label>
                    <Input
                        id="cta_button_text"
                        name="cta_button_text"
                        defaultValue={initialData?.cta_button_text ?? ''}
                        disabled={isSubmitting}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="cta_button_href">CTA Button URL</Label>
                    <Input
                        id="cta_button_href"
                        name="cta_button_href"
                        defaultValue={initialData?.cta_button_href ?? ''}
                        disabled={isSubmitting}
                        placeholder="/showcases"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4">
                <Button type="submit" disabled={isSubmitting || upload.isUploading}>
                    {upload.isUploading ? 'Uploading...' : isSubmitting ? 'Saving...' : isEdit ? 'Update Banner' : 'Create Banner'}
                </Button>
                <Link href="/admin/banners">
                    <Button type="button" variant="outline" disabled={isSubmitting}>
                        Cancel
                    </Button>
                </Link>
            </div>
        </form>
    )
}
