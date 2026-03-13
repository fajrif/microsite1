import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { showcaseSchema } from '@/lib/validations/showcase'
import { generateSlug } from '@/lib/slug'
import { uploadFile, deleteFile as deleteBlobIfExists } from '@/lib/storage'

// Allow up to 5 minutes for large file uploads
export const maxDuration = 300

// GET /api/showcases/[id]
export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params
        const showcase = await prisma.showcase.findUnique({
            where: { id: params.id },
            include: {
                classification: true,
                samples: { orderBy: { orderNo: 'asc' } },
                metrics: { orderBy: { orderNo: 'asc' } },
            },
        })

        if (!showcase) {
            return NextResponse.json(
                { error: 'Showcase not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(showcase)
    } catch (error) {
        console.error('Error fetching showcase:', error)
        return NextResponse.json(
            { error: 'Failed to fetch showcase' },
            { status: 500 }
        )
    }
}

// PUT /api/showcases/[id]
export async function PUT(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()

        // Get current showcase with samples
        const current = await prisma.showcase.findUnique({
            where: { id: params.id },
            include: { samples: true, metrics: true },
        })

        if (!current) {
            return NextResponse.json(
                { error: 'Showcase not found' },
                { status: 404 }
            )
        }

        // Parse showcase fields
        const showcaseData = {
            name: formData.get('name') as string,
            classification_id: formData.get('classification_id') as string,
            tagline: formData.get('tagline') as string,
            description: (formData.get('description') as string) || undefined,
            objective: (formData.get('objective') as string) || undefined,
            solution: (formData.get('solution') as string) || undefined,
            campaign_dates: (formData.get('campaign_dates') as string) || undefined,
            market: (formData.get('market') as string) || undefined,
            formats: (formData.get('formats') as string) || undefined,
            source: (formData.get('source') as string) || undefined,
            metrics_text: (formData.get('metrics_text') as string) || undefined,
            orderNo: formData.get('orderNo') ? parseInt(formData.get('orderNo') as string) || 0 : 0,
        }

        const validatedData = showcaseSchema.parse(showcaseData)

        // Check uniqueness excluding current
        const existing = await prisma.showcase.findFirst({
            where: {
                name: { equals: validatedData.name, mode: 'insensitive' },
                NOT: { id: params.id },
            },
        })

        if (existing) {
            return NextResponse.json(
                { error: 'Showcase name already exists' },
                { status: 400 }
            )
        }

        // Regenerate slug if name changed
        let slugUpdate: { slug?: string } = {}
        if (validatedData.name !== current.name) {
            let slug = generateSlug(validatedData.name)
            let slugSuffix = 2
            while (true) {
                const slugExists = await prisma.showcase.findFirst({
                    where: { slug, NOT: { id: params.id } },
                })
                if (!slugExists) break
                slug = `${generateSlug(validatedData.name)}-${slugSuffix}`
                slugSuffix++
            }
            slugUpdate = { slug }
        }

        // Handle samples
        const samplesJson = formData.get('samples') as string | null
        const samplesData = samplesJson ? JSON.parse(samplesJson) : []

        // Parse existing samples to update
        const existingSamplesJson = formData.get('existing_samples') as string | null
        const existingSamplesData: { id: string; name: string; description: string; audio: string; video_link: string; orderNo?: number; remove_audio?: boolean; remove_video?: boolean }[] = existingSamplesJson ? JSON.parse(existingSamplesJson) : []
        const keepSampleIds = existingSamplesData.map((s) => s.id)

        // Delete removed samples and their files
        for (const sample of current.samples) {
            if (!keepSampleIds.includes(sample.id)) {
                await deleteBlobIfExists(sample.image)
                await deleteBlobIfExists(sample.audio)
                await deleteBlobIfExists(sample.video_link)
                await prisma.sample.delete({ where: { id: sample.id } })
            }
        }

        // Update existing samples
        for (let i = 0; i < existingSamplesData.length; i++) {
            const s = existingSamplesData[i]
            const oldSample = current.samples.find((cs) => cs.id === s.id)
            const updateData: any = {
                name: s.name,
                description: s.description || null,
                audio: s.audio || null,
                video_link: s.video_link || null,
                orderNo: s.orderNo ?? 0,
            }

            // Check for pre-uploaded image URL or new file upload
            const existingImageUrl = formData.get(`existing_sample_image_url_${i}`) as string | null
            if (existingImageUrl) {
                if (oldSample) await deleteBlobIfExists(oldSample.image)
                updateData.image = existingImageUrl
            } else {
                const newImage = formData.get(`existing_sample_image_${i}`) as File | null
                if (newImage && newImage.size > 0) {
                    if (oldSample) await deleteBlobIfExists(oldSample.image)
                    updateData.image = await uploadFile(newImage)
                }
            }

            // Check if audio should be deleted
            if (s.remove_audio) {
                if (oldSample?.audio) await deleteBlobIfExists(oldSample.audio)
                updateData.audio = null
            } else {
                // Check for pre-uploaded audio URL or new file upload
                const existingAudioUrl = formData.get(`existing_sample_audio_url_${i}`) as string | null
                if (existingAudioUrl) {
                    if (oldSample) await deleteBlobIfExists(oldSample.audio)
                    updateData.audio = existingAudioUrl
                } else {
                    const newAudio = formData.get(`existing_sample_audio_${i}`) as File | null
                    if (newAudio && newAudio.size > 0) {
                        if (oldSample) await deleteBlobIfExists(oldSample.audio)
                        updateData.audio = await uploadFile(newAudio)
                    }
                }
            }

            // Check if video should be deleted
            if (s.remove_video) {
                if (oldSample?.video_link) await deleteBlobIfExists(oldSample.video_link)
                updateData.video_link = null
            } else {
                // Check for pre-uploaded video URL or new file upload
                const existingVideoUrl = formData.get(`existing_sample_video_url_${i}`) as string | null
                if (existingVideoUrl) {
                    if (oldSample) await deleteBlobIfExists(oldSample.video_link)
                    updateData.video_link = existingVideoUrl
                } else {
                    const newVideo = formData.get(`existing_sample_video_${i}`) as File | null
                    if (newVideo && newVideo.size > 0) {
                        if (oldSample) await deleteBlobIfExists(oldSample.video_link)
                        updateData.video_link = await uploadFile(newVideo)
                    }
                }
            }

            await prisma.sample.update({
                where: { id: s.id },
                data: updateData,
            })
        }

        // Create new samples
        for (let i = 0; i < samplesData.length; i++) {
            // Check for pre-uploaded image URL first
            const sampleImageUrl = formData.get(`sample_image_url_${i}`) as string | null
            let imageUrl: string

            if (sampleImageUrl) {
                imageUrl = sampleImageUrl
            } else {
                const sampleImage = formData.get(`sample_image_${i}`) as File | null
                if (!sampleImage || sampleImage.size === 0) {
                    return NextResponse.json(
                        { error: `New sample ${i + 1}: Image is required` },
                        { status: 400 }
                    )
                }
                imageUrl = await uploadFile(sampleImage)
            }

            // Handle audio: pre-uploaded URL or file upload
            const sampleAudioUrl = formData.get(`sample_audio_url_${i}`) as string | null
            let audioUrl = samplesData[i].audio || null
            if (sampleAudioUrl) {
                audioUrl = sampleAudioUrl
            } else {
                const sampleAudio = formData.get(`sample_audio_${i}`) as File | null
                if (sampleAudio && sampleAudio.size > 0) {
                    audioUrl = await uploadFile(sampleAudio)
                }
            }

            // Handle video: pre-uploaded URL or file upload
            const sampleVideoUrl = formData.get(`sample_video_url_${i}`) as string | null
            let videoUrl = samplesData[i].video_link || null
            if (sampleVideoUrl) {
                videoUrl = sampleVideoUrl
            } else {
                const sampleVideo = formData.get(`sample_video_${i}`) as File | null
                if (sampleVideo && sampleVideo.size > 0) {
                    videoUrl = await uploadFile(sampleVideo)
                }
            }

            await prisma.sample.create({
                data: {
                    name: samplesData[i].name,
                    description: samplesData[i].description || null,
                    image: imageUrl,
                    audio: audioUrl,
                    video_link: videoUrl,
                    orderNo: samplesData[i].orderNo ?? 0,
                    showcase_id: params.id,
                },
            })
        }

        // Handle metrics: delete all and recreate
        await prisma.metric.deleteMany({ where: { showcase_id: params.id } })

        const metricsJson = formData.get('metrics') as string | null
        const metricsData = metricsJson ? JSON.parse(metricsJson) : []

        for (const m of metricsData) {
            await prisma.metric.create({
                data: {
                    name: m.name,
                    short_description: m.short_description || null,
                    caption: m.caption || null,
                    prefix: m.prefix || null,
                    value: parseFloat(m.value),
                    suffix: m.suffix || null,
                    hide_name: m.hide_name || false,
                    orderNo: m.orderNo ?? 0,
                    showcase_id: params.id,
                },
            })
        }

        // Update showcase
        const showcase = await prisma.showcase.update({
            where: { id: params.id },
            data: { ...validatedData, ...slugUpdate },
            include: {
                classification: true,
                samples: { orderBy: { orderNo: 'asc' } },
                metrics: { orderBy: { orderNo: 'asc' } },
            },
        })

        return NextResponse.json(showcase)
    } catch (error) {
        console.error('Error updating showcase:', error)
        const message = error instanceof Error ? error.message : 'Failed to update showcase'
        return NextResponse.json(
            { error: message },
            { status: 500 }
        )
    }
}

// DELETE /api/showcases/[id]
export async function DELETE(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get showcase with samples to clean up files
        const showcase = await prisma.showcase.findUnique({
            where: { id: params.id },
            include: { samples: true },
        })

        if (showcase) {
            for (const sample of showcase.samples) {
                await deleteBlobIfExists(sample.image)
                await deleteBlobIfExists(sample.audio)
                await deleteBlobIfExists(sample.video_link)
            }
        }

        await prisma.showcase.delete({
            where: { id: params.id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting showcase:', error)
        return NextResponse.json(
            { error: 'Failed to delete showcase' },
            { status: 500 }
        )
    }
}
