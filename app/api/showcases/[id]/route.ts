import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { showcaseSchema } from '@/lib/validations/showcase'
import { put, del } from '@vercel/blob'

async function deleteBlobIfExists(url: string | null | undefined) {
    if (url && url.includes('blob.vercel-storage.com')) {
        try {
            await del(url)
        } catch (error) {
            console.error('Error deleting blob:', error)
        }
    }
}

async function uploadFile(file: File): Promise<string> {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
        const blob = await put(file.name, file, {
            access: 'public',
            addRandomSuffix: true,
        })
        return blob.url
    } else {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const fileName = `${Date.now()}-${file.name}`
        const fs = await import('fs/promises')
        const path = await import('path')

        const uploadDir = path.join(process.cwd(), 'public', 'uploads')
        await fs.mkdir(uploadDir, { recursive: true })
        await fs.writeFile(path.join(uploadDir, fileName), buffer)
        return `/uploads/${fileName}`
    }
}

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
                samples: true,
                metrics: true,
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
            description: (formData.get('description') as string) || null,
            objective: (formData.get('objective') as string) || null,
            solution: (formData.get('solution') as string) || null,
            campaign_dates: (formData.get('campaign_dates') as string) || null,
            market: (formData.get('market') as string) || null,
            formats: (formData.get('formats') as string) || null,
            source: (formData.get('source') as string) || null,
            metrics_text: (formData.get('metrics_text') as string) || null,
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

        // Handle samples: delete old, create new
        const samplesJson = formData.get('samples') as string | null
        const samplesData = samplesJson ? JSON.parse(samplesJson) : []

        // Parse existing sample IDs to keep
        const existingSampleIds = formData.get('existing_sample_ids') as string | null
        const keepSampleIds: string[] = existingSampleIds ? JSON.parse(existingSampleIds) : []

        // Delete removed samples and their files
        for (const sample of current.samples) {
            if (!keepSampleIds.includes(sample.id)) {
                await deleteBlobIfExists(sample.image)
                await deleteBlobIfExists(sample.audio)
                await prisma.sample.delete({ where: { id: sample.id } })
            }
        }

        // Create new samples
        for (let i = 0; i < samplesData.length; i++) {
            const sampleImage = formData.get(`sample_image_${i}`) as File | null
            const sampleAudio = formData.get(`sample_audio_${i}`) as File | null

            if (!sampleImage || sampleImage.size === 0 || !sampleAudio || sampleAudio.size === 0) {
                return NextResponse.json(
                    { error: `New sample ${i + 1}: Image and audio are required` },
                    { status: 400 }
                )
            }

            const imageUrl = await uploadFile(sampleImage)
            const audioUrl = await uploadFile(sampleAudio)

            await prisma.sample.create({
                data: {
                    name: samplesData[i].name,
                    description: samplesData[i].description || null,
                    image: imageUrl,
                    audio: audioUrl,
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
                    showcase_id: params.id,
                },
            })
        }

        // Update showcase
        const showcase = await prisma.showcase.update({
            where: { id: params.id },
            data: validatedData,
            include: {
                classification: true,
                samples: true,
                metrics: true,
            },
        })

        return NextResponse.json(showcase)
    } catch (error) {
        console.error('Error updating showcase:', error)
        return NextResponse.json(
            { error: 'Failed to update showcase' },
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
