'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { showcaseSchema, type ShowcaseFormData } from '@/lib/validations/showcase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { FileOrUrlInput } from '@/components/ui/file-or-url-input'
import { UploadProgressList } from '@/components/ui/upload-progress'
import { useFileUpload } from '@/lib/hooks/use-file-upload'
import { toast } from 'sonner'
import { Plus, X } from 'lucide-react'

interface SampleEntry {
    id?: string
    name: string
    description: string
    imageFile: File | null
    imagePreview: string | null
    imageDirectUrl: string
    imageClearRequested: boolean
    desktopImageFile: File | null
    desktopImagePreview: string | null
    desktopImageDirectUrl: string
    desktopImageDeleted: boolean
    audioFile: File | null
    audioPreview: string | null
    audioDirectUrl: string
    audioDeleted: boolean
    videoFile: File | null
    videoPreview: string | null
    videoDirectUrl: string
    videoDeleted: boolean
    orderNo: number
    isExisting: boolean
}

interface MetricEntry {
    name: string
    short_description: string
    caption: string
    prefix: string
    value: string
    suffix: string
    hide_name: boolean
    orderNo: number
}

interface ShowcaseFormProps {
    initialData?: any
    classifications: Array<{ id: string; name: string }>
}

export function ShowcaseForm({ initialData, classifications }: ShowcaseFormProps) {
    const router = useRouter()
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const isEdit = !!initialData
    const upload = useFileUpload()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ShowcaseFormData>({
        resolver: zodResolver(showcaseSchema),
        defaultValues: {
            name: initialData?.name || '',
            classification_id: initialData?.classification_id || '',
            tagline: initialData?.tagline || '',
            description: initialData?.description || '',
            objective: initialData?.objective || '',
            solution: initialData?.solution || '',
            campaign_dates: initialData?.campaign_dates || '',
            market: initialData?.market || '',
            formats: initialData?.formats || '',
            source: initialData?.source || '',
            metrics_text: initialData?.metrics_text || '',
            orderNo: initialData?.orderNo ?? 0,
        },
    })

    // Samples state
    const [samples, setSamples] = useState<SampleEntry[]>(() => {
        if (initialData?.samples) {
            return initialData.samples.map((s: any) => ({
                id: s.id,
                name: s.name,
                description: s.description || '',
                imageFile: null,
                imagePreview: s.image,
                imageDirectUrl: '',
                imageClearRequested: false,
                desktopImageFile: null,
                desktopImagePreview: s.desktop_image || null,
                desktopImageDirectUrl: '',
                desktopImageDeleted: false,
                audioFile: null,
                audioPreview: s.audio || null,
                audioDirectUrl: '',
                audioDeleted: false,
                videoFile: null,
                videoPreview: s.video_link || null,
                videoDirectUrl: '',
                videoDeleted: false,
                orderNo: s.orderNo ?? 0,
                isExisting: true,
            }))
        }
        return []
    })

    // Metrics state
    const [metrics, setMetrics] = useState<MetricEntry[]>(() => {
        if (initialData?.metrics) {
            return initialData.metrics.map((m: any) => ({
                name: m.name,
                short_description: m.short_description || '',
                caption: m.caption || '',
                prefix: m.prefix || '',
                value: m.value.toString(),
                suffix: m.suffix || '',
                hide_name: m.hide_name || false,
                orderNo: m.orderNo ?? 0,
            }))
        }
        return []
    })

    const addSample = () => {
        setSamples([...samples, {
            name: '',
            description: '',
            imageFile: null,
            imagePreview: null,
            imageDirectUrl: '',
            imageClearRequested: false,
            desktopImageFile: null,
            desktopImagePreview: null,
            desktopImageDirectUrl: '',
            desktopImageDeleted: false,
            audioFile: null,
            audioPreview: null,
            audioDirectUrl: '',
            audioDeleted: false,
            videoFile: null,
            videoPreview: null,
            videoDirectUrl: '',
            videoDeleted: false,
            orderNo: 0,
            isExisting: false,
        }])
    }

    const removeSample = (index: number) => {
        setSamples(samples.filter((_, i) => i !== index))
    }

    const updateSample = (index: number, field: string, value: any) => {
        const updated = [...samples]
        ;(updated[index] as any)[field] = value
        setSamples(updated)
    }

    const handleSampleImageFile = (index: number, file: File | null) => {
        const updated = [...samples]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                updated[index].imageFile = file
                updated[index].imagePreview = reader.result as string
                updated[index].imageDirectUrl = ''
                updated[index].imageClearRequested = false
                setSamples([...updated])
            }
            reader.readAsDataURL(file)
        } else {
            updated[index].imageFile = null
            setSamples(updated)
        }
    }

    const handleClearSampleImage = (index: number) => {
        const updated = [...samples]
        updated[index].imageFile = null
        updated[index].imagePreview = null
        updated[index].imageDirectUrl = ''
        updated[index].imageClearRequested = true
        setSamples(updated)
        const input = document.getElementById(`sample-image-${index}`) as HTMLInputElement
        if (input) input.value = ''
    }

    const handleSampleDesktopImageFile = (index: number, file: File | null) => {
        const updated = [...samples]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                updated[index].desktopImageFile = file
                updated[index].desktopImagePreview = reader.result as string
                updated[index].desktopImageDirectUrl = ''
                updated[index].desktopImageDeleted = false
                setSamples([...updated])
            }
            reader.readAsDataURL(file)
        } else {
            updated[index].desktopImageFile = null
            setSamples(updated)
        }
    }

    const handleDeleteSampleDesktopImage = (index: number) => {
        const updated = [...samples]
        updated[index].desktopImageFile = null
        updated[index].desktopImagePreview = null
        updated[index].desktopImageDirectUrl = ''
        updated[index].desktopImageDeleted = true
        setSamples(updated)
        const input = document.getElementById(`sample-desktop-image-${index}`) as HTMLInputElement
        if (input) input.value = ''
    }

    const handleSampleAudioFile = (index: number, file: File | null) => {
        const updated = [...samples]
        if (file) {
            updated[index].audioFile = file
            updated[index].audioPreview = file.name
            updated[index].audioDirectUrl = ''
            updated[index].audioDeleted = false
        } else {
            updated[index].audioFile = null
        }
        setSamples(updated)
    }

    const handleDeleteSampleAudio = (index: number) => {
        const updated = [...samples]
        updated[index].audioFile = null
        updated[index].audioPreview = null
        updated[index].audioDirectUrl = ''
        updated[index].audioDeleted = true
        setSamples(updated)
        const input = document.getElementById(`sample-audio-${index}`) as HTMLInputElement
        if (input) input.value = ''
    }

    const handleSampleVideoFile = (index: number, file: File | null) => {
        const updated = [...samples]
        if (file) {
            updated[index].videoFile = file
            updated[index].videoPreview = file.name
            updated[index].videoDirectUrl = ''
            updated[index].videoDeleted = false
        } else {
            updated[index].videoFile = null
        }
        setSamples(updated)
    }

    const handleDeleteSampleVideo = (index: number) => {
        const updated = [...samples]
        updated[index].videoFile = null
        updated[index].videoPreview = null
        updated[index].videoDirectUrl = ''
        updated[index].videoDeleted = true
        setSamples(updated)
        const input = document.getElementById(`sample-video-${index}`) as HTMLInputElement
        if (input) input.value = ''
    }

    const addMetric = () => {
        setMetrics([...metrics, {
            name: '',
            short_description: '',
            caption: '',
            prefix: '',
            value: '',
            suffix: '',
            hide_name: false,
            orderNo: 0,
        }])
    }

    const removeMetric = (index: number) => {
        setMetrics(metrics.filter((_, i) => i !== index))
    }

    const updateMetric = (index: number, field: string, value: any) => {
        const updated = [...metrics]
        ;(updated[index] as any)[field] = value
        setMetrics(updated)
    }

    const onSubmit = async (data: ShowcaseFormData) => {
        setIsSubmitting(true)
        setError('')

        try {
            // Collect only files that need uploading (skip samples with direct URLs)
            const filesToUpload: File[] = []
            const fileMapping: { sampleIndex: number; type: 'image' | 'desktop_image' | 'audio' | 'video'; isExisting: boolean }[] = []

            for (let i = 0; i < samples.length; i++) {
                const sample = samples[i]

                if (sample.isExisting && sample.id) {
                    if (sample.imageClearRequested && !sample.imageFile && !sample.imageDirectUrl) {
                        setError(`Sample "${sample.name || `#${i + 1}`}": A new image is required after clearing`)
                        setIsSubmitting(false)
                        return
                    }
                } else {
                    if (!sample.imageFile && !sample.imageDirectUrl) {
                        setError(`Sample "${sample.name || `#${i + 1}`}": Image is required (upload a file or paste a URL)`)
                        setIsSubmitting(false)
                        return
                    }
                }

                // Only queue files for upload — direct URLs skip upload
                if (sample.imageFile && !sample.imageDirectUrl) {
                    filesToUpload.push(sample.imageFile)
                    fileMapping.push({ sampleIndex: i, type: 'image', isExisting: sample.isExisting })
                }
                if (sample.desktopImageFile && !sample.desktopImageDirectUrl) {
                    filesToUpload.push(sample.desktopImageFile)
                    fileMapping.push({ sampleIndex: i, type: 'desktop_image', isExisting: sample.isExisting })
                }
                if (sample.audioFile && !sample.audioDirectUrl) {
                    filesToUpload.push(sample.audioFile)
                    fileMapping.push({ sampleIndex: i, type: 'audio', isExisting: sample.isExisting })
                }
                if (sample.videoFile && !sample.videoDirectUrl) {
                    filesToUpload.push(sample.videoFile)
                    fileMapping.push({ sampleIndex: i, type: 'video', isExisting: sample.isExisting })
                }
            }

            // Pre-upload files with progress
            const uploadedUrls: Map<number, string> = new Map()
            if (filesToUpload.length > 0) {
                const results = await upload.uploadFiles(filesToUpload)
                const resultEntries = Array.from(results.entries())

                if (resultEntries.length !== filesToUpload.length) {
                    throw new Error('Some files failed to upload')
                }

                const urlValues = Array.from(results.values())
                for (let i = 0; i < urlValues.length; i++) {
                    uploadedUrls.set(i, urlValues[i])
                }
            }

            // Build form data
            const formData = new FormData()

            Object.entries(data).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, value.toString())
                }
            })

            // Build sample data with uploaded URLs or direct URLs
            const existingSamples: any[] = []
            const newSamples: any[] = []
            let existingSampleIndex = 0
            let newSampleIndex = 0

            for (let i = 0; i < samples.length; i++) {
                const sample = samples[i]

                // Helper: resolve URL for a field — direct URL takes priority, then uploaded URL
                const resolveUrl = (type: 'image' | 'desktop_image' | 'audio' | 'video'): string | null => {
                    const directUrl = type === 'image' ? sample.imageDirectUrl
                        : type === 'desktop_image' ? sample.desktopImageDirectUrl
                        : type === 'audio' ? sample.audioDirectUrl
                        : sample.videoDirectUrl
                    if (directUrl) return directUrl

                    for (let fi = 0; fi < fileMapping.length; fi++) {
                        const mapping = fileMapping[fi]
                        if (mapping.sampleIndex === i && mapping.type === type && mapping.isExisting === sample.isExisting) {
                            return uploadedUrls.get(fi) || null
                        }
                    }
                    return null
                }

                if (sample.isExisting && sample.id) {
                    existingSamples.push({
                        id: sample.id,
                        name: sample.name,
                        description: sample.description,
                        audio: sample.audioDeleted ? '' : (sample.audioPreview || ''),
                        video_link: sample.videoDeleted ? '' : (sample.videoPreview || ''),
                        orderNo: sample.orderNo,
                        remove_audio: sample.audioDeleted,
                        remove_video: sample.videoDeleted,
                        remove_desktop_image: sample.desktopImageDeleted,
                    })

                    const imageUrl = resolveUrl('image')
                    if (imageUrl) formData.append(`existing_sample_image_url_${existingSampleIndex}`, imageUrl)

                    const desktopImageUrl = resolveUrl('desktop_image')
                    if (desktopImageUrl) formData.append(`existing_sample_desktop_image_url_${existingSampleIndex}`, desktopImageUrl)

                    const audioUrl = resolveUrl('audio')
                    if (audioUrl) formData.append(`existing_sample_audio_url_${existingSampleIndex}`, audioUrl)

                    const videoUrl = resolveUrl('video')
                    if (videoUrl) formData.append(`existing_sample_video_url_${existingSampleIndex}`, videoUrl)

                    existingSampleIndex++
                } else {
                    newSamples.push({
                        name: sample.name,
                        description: sample.description,
                        audio: '',
                        video_link: '',
                        orderNo: sample.orderNo,
                    })

                    const imageUrl = resolveUrl('image')
                    if (imageUrl) formData.append(`sample_image_url_${newSampleIndex}`, imageUrl)

                    const desktopImageUrl = resolveUrl('desktop_image')
                    if (desktopImageUrl) formData.append(`sample_desktop_image_url_${newSampleIndex}`, desktopImageUrl)

                    const audioUrl = resolveUrl('audio')
                    if (audioUrl) formData.append(`sample_audio_url_${newSampleIndex}`, audioUrl)

                    const videoUrl = resolveUrl('video')
                    if (videoUrl) formData.append(`sample_video_url_${newSampleIndex}`, videoUrl)

                    newSampleIndex++
                }
            }

            formData.append('samples', JSON.stringify(newSamples))

            if (isEdit) {
                formData.append('existing_samples', JSON.stringify(existingSamples))
            }

            formData.append('metrics', JSON.stringify(metrics.map(m => ({
                ...m,
                value: parseFloat(m.value) || 0,
            }))))

            const url = isEdit ? `/api/showcases/${initialData.id}` : '/api/showcases'
            const response = await fetch(url, {
                method: isEdit ? 'PUT' : 'POST',
                body: formData,
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to save showcase')
            }

            toast.success(isEdit ? 'Showcase updated successfully' : 'Showcase created successfully')

            router.push('/admin/showcases')
            router.refresh()
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Something went wrong'
            setError(errorMessage)
            toast.error(errorMessage)
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

            {/* Basic Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input id="name" {...register('name')} disabled={isSubmitting} />
                    {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="classification_id">Classification *</Label>
                    <select
                        id="classification_id"
                        {...register('classification_id')}
                        className="w-full border rounded-md px-3 py-2 bg-white"
                        disabled={isSubmitting}
                    >
                        <option value="">Select a classification</option>
                        {classifications.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    {errors.classification_id && <p className="text-sm text-red-600">{errors.classification_id.message}</p>}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="tagline">Tagline *</Label>
                <Input id="tagline" {...register('tagline')} disabled={isSubmitting} />
                {errors.tagline && <p className="text-sm text-red-600">{errors.tagline.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...register('description')} disabled={isSubmitting} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="objective">Objective</Label>
                    <Textarea id="objective" {...register('objective')} disabled={isSubmitting} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="solution">Solution</Label>
                    <Textarea id="solution" {...register('solution')} disabled={isSubmitting} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="campaign_dates">Campaign Dates</Label>
                    <Input id="campaign_dates" {...register('campaign_dates')} disabled={isSubmitting} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="market">Market</Label>
                    <Input id="market" {...register('market')} disabled={isSubmitting} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="formats">Formats</Label>
                    <Input id="formats" {...register('formats')} disabled={isSubmitting} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="source">Source</Label>
                    <Input id="source" {...register('source')} disabled={isSubmitting} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="metrics_text">Metrics Text</Label>
                    <Input id="metrics_text" {...register('metrics_text')} disabled={isSubmitting} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="orderNo">Order No</Label>
                    <Input id="orderNo" type="number" {...register('orderNo', { valueAsNumber: true })} disabled={isSubmitting} placeholder="0" />
                </div>
            </div>

            {/* Samples Section */}
            <div className="pt-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Samples</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addSample}>
                        <Plus className="h-4 w-4 mr-1" /> Add Sample
                    </Button>
                </div>

                {samples.length === 0 && (
                    <p className="text-gray-500 text-sm">No samples added yet.</p>
                )}

                {samples.map((sample, index) => (
                    <div key={index} className="border rounded-lg p-4 mb-4 relative">
                        <button
                            type="button"
                            onClick={() => removeSample(index)}
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                            disabled={isSubmitting}
                        >
                            <X size={18} />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Sample Name *</Label>
                                <Input
                                    value={sample.name}
                                    onChange={(e) => updateSample(index, 'name', e.target.value)}
                                    disabled={isSubmitting}
                                    placeholder="e.g., Horsepower"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input
                                    value={sample.description}
                                    onChange={(e) => updateSample(index, 'description', e.target.value)}
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Order No</Label>
                                <Input
                                    type="number"
                                    value={sample.orderNo}
                                    onChange={(e) => updateSample(index, 'orderNo', parseInt(e.target.value) || 0)}
                                    disabled={isSubmitting}
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <FileOrUrlInput
                                id={`sample-image-${index}`}
                                label={sample.isExisting ? 'Replace Image' : 'Image *'}
                                accept="image/*"
                                disabled={isSubmitting}
                                directUrl={sample.imageDirectUrl}
                                onFileChange={(file) => handleSampleImageFile(index, file)}
                                onUrlChange={(url) => {
                                    const updated = [...samples]
                                    updated[index].imageDirectUrl = url
                                    updated[index].imageFile = null
                                    updated[index].imageClearRequested = false
                                    setSamples(updated)
                                }}
                                preview={<>
                                    {sample.imagePreview && !sample.imageDirectUrl && (
                                        <div className="relative inline-block mt-1">
                                            <img src={sample.imagePreview} alt="Preview" className="max-h-20 rounded" />
                                            <button
                                                type="button"
                                                onClick={() => handleClearSampleImage(index)}
                                                disabled={isSubmitting}
                                                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs leading-none"
                                                title="Clear image (new image required)"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    )}
                                    {sample.imageClearRequested && !sample.imagePreview && !sample.imageDirectUrl && (
                                        <p className="text-xs text-amber-600">Image cleared — upload a new image or paste a URL</p>
                                    )}
                                </>}
                            />
                            <FileOrUrlInput
                                id={`sample-desktop-image-${index}`}
                                label="Desktop Image (optional)"
                                accept="image/*"
                                disabled={isSubmitting}
                                directUrl={sample.desktopImageDirectUrl}
                                onFileChange={(file) => handleSampleDesktopImageFile(index, file)}
                                onUrlChange={(url) => {
                                    const updated = [...samples]
                                    updated[index].desktopImageDirectUrl = url
                                    updated[index].desktopImageFile = null
                                    updated[index].desktopImageDeleted = false
                                    setSamples(updated)
                                }}
                                preview={<>
                                    {sample.desktopImagePreview && !sample.desktopImageFile && !sample.desktopImageDirectUrl && (
                                        <div className="flex items-center gap-2">
                                            <img src={sample.desktopImagePreview} alt="Desktop preview" className="max-h-20 rounded" />
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteSampleDesktopImage(index)}
                                                disabled={isSubmitting}
                                                className="text-xs text-red-500 hover:text-red-700 whitespace-nowrap"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                    {sample.desktopImageDeleted && (
                                        <p className="text-xs text-red-500">Desktop image will be deleted on save</p>
                                    )}
                                    {sample.desktopImageFile && (
                                        <img src={sample.desktopImagePreview!} alt="Desktop preview" className="max-h-20 rounded mt-1" />
                                    )}
                                </>}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <FileOrUrlInput
                                id={`sample-audio-${index}`}
                                label={sample.isExisting && sample.audioPreview ? 'Replace Audio' : 'Audio File'}
                                accept="audio/*"
                                disabled={isSubmitting}
                                directUrl={sample.audioDirectUrl}
                                onFileChange={(file) => handleSampleAudioFile(index, file)}
                                onUrlChange={(url) => {
                                    const updated = [...samples]
                                    updated[index].audioDirectUrl = url
                                    updated[index].audioFile = null
                                    updated[index].audioDeleted = false
                                    setSamples(updated)
                                }}
                                preview={<>
                                    {sample.audioPreview && !sample.audioFile && !sample.audioDirectUrl && (
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs text-gray-500 truncate flex-1">Current: {sample.audioPreview}</p>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteSampleAudio(index)}
                                                disabled={isSubmitting}
                                                className="text-xs text-red-500 hover:text-red-700 whitespace-nowrap"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                    {sample.audioDeleted && (
                                        <p className="text-xs text-red-500">Audio will be deleted on save</p>
                                    )}
                                    {sample.audioFile && (
                                        <p className="text-xs text-green-600 truncate">New: {sample.audioFile.name}</p>
                                    )}
                                </>}
                            />

                            <FileOrUrlInput
                                id={`sample-video-${index}`}
                                label={sample.isExisting && sample.videoPreview ? 'Replace Video' : 'Video File'}
                                accept="video/*"
                                disabled={isSubmitting}
                                directUrl={sample.videoDirectUrl}
                                onFileChange={(file) => handleSampleVideoFile(index, file)}
                                onUrlChange={(url) => {
                                    const updated = [...samples]
                                    updated[index].videoDirectUrl = url
                                    updated[index].videoFile = null
                                    updated[index].videoDeleted = false
                                    setSamples(updated)
                                }}
                                preview={<>
                                    {sample.videoPreview && !sample.videoFile && !sample.videoDirectUrl && (
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs text-gray-500 truncate flex-1">Current: {sample.videoPreview}</p>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteSampleVideo(index)}
                                                disabled={isSubmitting}
                                                className="text-xs text-red-500 hover:text-red-700 whitespace-nowrap"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                    {sample.videoDeleted && (
                                        <p className="text-xs text-red-500">Video will be deleted on save</p>
                                    )}
                                    {sample.videoFile && (
                                        <p className="text-xs text-green-600 truncate">New: {sample.videoFile.name}</p>
                                    )}
                                </>}
                            />
                        </div>

                        {sample.isExisting && (
                            <div className="mt-2">
                                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">Existing</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Metrics Section */}
            <div className="pt-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Metrics</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addMetric}>
                        <Plus className="h-4 w-4 mr-1" /> Add Metric
                    </Button>
                </div>

                {metrics.length === 0 && (
                    <p className="text-gray-500 text-sm">No metrics added yet.</p>
                )}

                {metrics.map((metric, index) => (
                    <div key={index} className="border rounded-lg p-4 mb-4 relative">
                        <button
                            type="button"
                            onClick={() => removeMetric(index)}
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                            disabled={isSubmitting}
                        >
                            <X size={18} />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Name *</Label>
                                <Input
                                    value={metric.name}
                                    onChange={(e) => updateMetric(index, 'name', e.target.value)}
                                    disabled={isSubmitting}
                                    placeholder="e.g., impressions"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Value *</Label>
                                <Input
                                    type="number"
                                    step="any"
                                    value={metric.value}
                                    onChange={(e) => updateMetric(index, 'value', e.target.value)}
                                    disabled={isSubmitting}
                                    placeholder="e.g., 1.7"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Short Description</Label>
                                <Input
                                    value={metric.short_description}
                                    onChange={(e) => updateMetric(index, 'short_description', e.target.value)}
                                    disabled={isSubmitting}
                                    placeholder="e.g., Total Campaign"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
                            <div className="space-y-2">
                                <Label>Prefix</Label>
                                <Input
                                    value={metric.prefix}
                                    onChange={(e) => updateMetric(index, 'prefix', e.target.value)}
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Suffix</Label>
                                <Input
                                    value={metric.suffix}
                                    onChange={(e) => updateMetric(index, 'suffix', e.target.value)}
                                    disabled={isSubmitting}
                                    placeholder="e.g., M, K"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Caption</Label>
                                <Input
                                    value={metric.caption}
                                    onChange={(e) => updateMetric(index, 'caption', e.target.value)}
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Order No</Label>
                                <Input
                                    type="number"
                                    value={metric.orderNo}
                                    onChange={(e) => updateMetric(index, 'orderNo', parseInt(e.target.value) || 0)}
                                    disabled={isSubmitting}
                                    placeholder="0"
                                />
                            </div>
                            <div className="flex items-end space-x-2 pb-1">
                                <input
                                    type="checkbox"
                                    checked={metric.hide_name}
                                    onChange={(e) => updateMetric(index, 'hide_name', e.target.checked)}
                                    disabled={isSubmitting}
                                    className="h-4 w-4"
                                />
                                <Label className="text-sm">Hide Name</Label>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-4">
                <Button type="submit" disabled={isSubmitting || upload.isUploading}>
                    {upload.isUploading ? 'Uploading...' : isSubmitting ? 'Saving...' : isEdit ? 'Update Showcase' : 'Create Showcase'}
                </Button>
                <Link href="/admin/showcases">
                    <Button type="button" variant="outline" disabled={isSubmitting}>
                        Cancel
                    </Button>
                </Link>
            </div>
        </form>
    )
}
