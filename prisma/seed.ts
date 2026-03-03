import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'
import * as fs from 'fs'
import * as path from 'path'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

function copyAsset(srcRelative: string, destFileName: string): string {
    const srcPath = path.join(process.cwd(), srcRelative)
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
    }

    const destPath = path.join(uploadDir, destFileName)

    if (!fs.existsSync(destPath) && fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath)
    }

    return `/uploads/${destFileName}`
}

async function main() {
    console.log('🌱 Starting database seed...')

    // Create initial admin user
    const hashedPassword = await bcrypt.hash('Secret1234!', 10)

    const admin = await prisma.admin.upsert({
        where: { email: 'admin@spotify-adv.com' },
        update: {},
        create: {
            email: 'admin@spotify-adv.com',
            full_name: 'Administrator',
            password_hash: hashedPassword,
        },
    })

    console.log('✅ Created admin user:', { email: admin.email, full_name: admin.full_name })

    // Create some sample categories
    const categories = await Promise.all([
        prisma.category.upsert({
            where: { id: 'category-1' },
            update: {},
            create: {
                id: 'category-1',
                name: 'Technology',
            },
        }),
        prisma.category.upsert({
            where: { id: 'category-2' },
            update: {},
            create: {
                id: 'category-2',
                name: 'Business',
            },
        }),
        prisma.category.upsert({
            where: { id: 'category-3' },
            update: {},
            create: {
                id: 'category-3',
                name: 'News',
            },
        }),
    ])

    console.log('✅ Created categories:', categories.map(c => c.name).join(', '))

    // ============================================
    // Seed Classifications
    // ============================================
    const classificationData = [
        { id: 'classification-1', name: '3D Audio', image: '3d-audio.png' },
        { id: 'classification-2', name: 'ASMR Audio', image: 'asmr-audio.png' },
        { id: 'classification-3', name: 'Jingle', image: 'jingle.png' },
        { id: 'classification-4', name: 'Talent', image: 'talents.png' },
        { id: 'classification-5', name: 'Gen AI Audio Creator', image: 'gen-ai.png' },
    ]

    const classifications = await Promise.all(
        classificationData.map((c) => {
            const imageUrl = copyAsset(
                `public/images/classifications/${c.image}`,
                `classification-${c.image}`
            )
            return prisma.classification.upsert({
                where: { id: c.id },
                update: { image: imageUrl },
                create: {
                    id: c.id,
                    name: c.name,
                    image: imageUrl,
                },
            })
        })
    )

    console.log('✅ Created classifications:', classifications.map(c => c.name).join(', '))

    // ============================================
    // Seed Showcase: Porsche Audio
    // ============================================
    const showcaseId = 'showcase-porsche-audio'

    // Copy sample assets
    const sampleImage = copyAsset('public/images/showcases/sample.png', 'showcase-sample.png')
    const sampleAudio = copyAsset('public/audio/sample-blackbird.wav', 'showcase-sample-blackbird.wav')

    const showcase = await prisma.showcase.upsert({
        where: { id: showcaseId },
        update: {
            tagline: 'Porsche takes listeners on a 3D Audio test drive',
            objective: 'Porsche wanted to raise awareness and drive consideration for the relaunch of their Panamera model, reaching the right high-value audiences at scale.',
            solution: 'Porsche partnered with Spotify to create a virtual test drive through an immersive 3D audio experience, targeting car buyers, high-income earners, and highly educated audiences, with interested listeners prompted to book a real in person test drive.',
        },
        create: {
            id: showcaseId,
            name: 'Porsche Audio',
            classification_id: 'classification-1', // 3D Audio
            tagline: 'Porsche takes listeners on a 3D Audio test drive',
            objective: 'Porsche wanted to raise awareness and drive consideration for the relaunch of their Panamera model, reaching the right high-value audiences at scale.',
            solution: 'Porsche partnered with Spotify to create a virtual test drive through an immersive 3D audio experience, targeting car buyers, high-income earners, and highly educated audiences, with interested listeners prompted to book a real in person test drive.',
        },
    })

    console.log('✅ Created showcase:', showcase.name)

    // Delete existing samples and metrics for idempotency
    await prisma.sample.deleteMany({ where: { showcase_id: showcaseId } })
    await prisma.metric.deleteMany({ where: { showcase_id: showcaseId } })

    // Create samples
    const sampleNames = ['Horsepower', 'Interior', 'Technology']
    const samples = await Promise.all(
        sampleNames.map((name, i) =>
            prisma.sample.create({
                data: {
                    id: `sample-${i + 1}`,
                    name,
                    showcase_id: showcaseId,
                    image: sampleImage,
                    audio: sampleAudio,
                },
            })
        )
    )

    console.log('✅ Created samples:', samples.map(s => s.name).join(', '))

    // Create metrics
    const metricsData = [
        {
            id: 'metric-1',
            name: 'impressions',
            short_description: 'Total Campaign',
            value: 1.7,
            suffix: 'M',
        },
        {
            id: 'metric-2',
            name: 'clicks to site',
            short_description: 'To set up an in-person test drive',
            value: 85,
            suffix: 'K',
        },
    ]

    const metrics = await Promise.all(
        metricsData.map((m) =>
            prisma.metric.create({
                data: {
                    id: m.id,
                    name: m.name,
                    short_description: m.short_description,
                    value: m.value,
                    suffix: m.suffix,
                    showcase_id: showcaseId,
                },
            })
        )
    )

    console.log('✅ Created metrics:', metrics.map(m => m.name).join(', '))
    console.log('🎉 Seed completed successfully!')
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
