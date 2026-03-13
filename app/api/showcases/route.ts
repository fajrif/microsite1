import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { showcaseSchema } from '@/lib/validations/showcase'
import { generateSlug } from '@/lib/slug'
import { uploadFile } from '@/lib/storage'

// Allow up to 5 minutes for large file uploads
export const maxDuration = 300

// GET /api/showcases - List showcases with optional classification filter
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search') || ''
        const page = Number.parseInt(searchParams.get('page') || '1')
        const limit = Number.parseInt(searchParams.get('limit') || '10')
        const classificationId = searchParams.get('classification_id')

        const where: any = {}

        if (classificationId) {
            where.classification_id = classificationId
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { tagline: { contains: search, mode: 'insensitive' } },
            ]
        }

        const total = await prisma.showcase.count({ where })

        const showcases = await prisma.showcase.findMany({
            where,
            include: {
                classification: {
                    select: { id: true, name: true },
                },
                _count: {
                    select: { samples: true, metrics: true },
                },
            },
            orderBy: { orderNo: 'asc' },
            skip: (page - 1) * limit,
            take: limit,
        })

        return NextResponse.json({
            showcases,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        console.error('Error fetching showcases:', error)
        return NextResponse.json(
            { error: 'Failed to fetch showcases' },
            { status: 500 }
        )
    }
}

// POST /api/showcases - Create showcase with samples and metrics
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()

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

        // Check uniqueness
        const existing = await prisma.showcase.findFirst({
            where: {
                name: { equals: validatedData.name, mode: 'insensitive' },
            },
        })

        if (existing) {
            return NextResponse.json(
                { error: 'Showcase name already exists' },
                { status: 400 }
            )
        }

        // Generate unique slug
        let slug = generateSlug(validatedData.name)
        let slugSuffix = 2
        while (await prisma.showcase.findUnique({ where: { slug } })) {
            slug = `${generateSlug(validatedData.name)}-${slugSuffix}`
            slugSuffix++
        }

        // Parse samples from form data
        const samplesJson = formData.get('samples') as string | null
        const samplesData = samplesJson ? JSON.parse(samplesJson) : []

        // Upload sample files
        const sampleCreates = []
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
                        { error: `Sample ${i + 1}: Image is required` },
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

            sampleCreates.push({
                name: samplesData[i].name,
                description: samplesData[i].description || null,
                image: imageUrl,
                audio: audioUrl,
                video_link: videoUrl,
                orderNo: samplesData[i].orderNo ?? 0,
            })
        }

        // Parse metrics from form data
        const metricsJson = formData.get('metrics') as string | null
        const metricsData = metricsJson ? JSON.parse(metricsJson) : []

        const metricCreates = metricsData.map((m: any) => ({
            name: m.name,
            short_description: m.short_description || null,
            caption: m.caption || null,
            prefix: m.prefix || null,
            value: parseFloat(m.value),
            suffix: m.suffix || null,
            hide_name: m.hide_name || false,
            orderNo: m.orderNo ?? 0,
        }))

        // Create showcase with relations in transaction
        const showcase = await prisma.showcase.create({
            data: {
                ...validatedData,
                slug,
                samples: {
                    create: sampleCreates,
                },
                metrics: {
                    create: metricCreates,
                },
            },
            include: {
                classification: true,
                samples: true,
                metrics: true,
            },
        })

        return NextResponse.json(showcase, { status: 201 })
    } catch (error) {
        console.error('Error creating showcase:', error)
        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Invalid data', details: error },
                { status: 400 }
            )
        }
        return NextResponse.json(
            { error: 'Failed to create showcase' },
            { status: 500 }
        )
    }
}
