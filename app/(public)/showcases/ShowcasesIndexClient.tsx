'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { GradualSpacing } from '@/components/ui/gradual-spacing'
import { AnimatedDiv } from "@/components/ui/animated-div"
import { PhotoGallery, PhotoGalleryItem } from '@/components/ui/photo-gallery'

interface Classification {
    id: string
    name: string
    description: string | null
    image: string | null
    showcases: Array<{
        id: string
        slug: string
        name: string
        tagline: string
    }>
}

interface ShowcasesIndexClientProps {
    classifications: Classification[]
}

export function ShowcasesIndexClient({ classifications }: ShowcasesIndexClientProps) {
    const router = useRouter()

    const galleryItems: PhotoGalleryItem[] = classifications.map((classification) => ({
        id: classification.id,
        src: classification.image || '',
        alt: classification.name,
        label: classification.name,
        disabled: classification.showcases.length === 0,
        onClick: classification.showcases.length > 0
            ? () => router.push(`/showcases/${classification.showcases[0].slug}`)
            : undefined,
    }))

    return (
    <>
        <div className="absolute top-0 z-[0] h-screen w-screen bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(16,48,39,0.8),rgba(255,255,255,0))]" />
        <section className="min-h-screen bg-primary text-white">
            {/* Spacer for fixed nav */}
            <div className="h-20" />

            <div className="container mx-auto py-16 md:py-24 px-4">
                {/* Headline */}
                <GradualSpacing
                    text="五大创意核心，为您的品牌先声夺人"
                    className="drop-shadow-sm font-display text-3xl md:text-5xl lg:text-6xl font-bold leading-none -tracking-widest text-[hsl(var(--ptr-primary))] text-center"
                />

                {/* Subtitle */}
                <AnimatedDiv id="showcases-short-description" delay={0.1}>
                  <p className="mt-6 text-base md:text-lg text-white max-w-3xl leading-relaxed">
                      汲取全球顶尖创意灵感，探索标杆音视频活动如何玩转“故事力”。 在最合适的时机，用最对的内容，与您的受众产生深度共鸣。
                  </p>
                </AnimatedDiv>

                {/* Classification Cards - Mobile Grid */}
                <AnimatedDiv id="showcases-grid-mobile" className="mt-12 grid grid-cols-2 gap-4 md:hidden" delay={0.3}>
                    {classifications.map((classification) => (
                        <button
                            key={classification.id}
                            disabled={classification.showcases.length === 0}
                            onClick={() => classification.showcases.length > 0 && router.push(`/showcases/${classification.showcases[0].slug}`)}
                            className={cn(
                                "group text-left transition-all duration-300 w-full",
                                classification.showcases.length === 0 ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                            )}
                        >
                            <div className={cn(
                                'w-full aspect-square rounded-2xl overflow-hidden border-4 transition-all duration-300 relative',
                                classification.showcases.length === 0
                                    ? 'border-transparent'
                                    : 'border-transparent group-hover:border-[hsl(var(--ptr-primary))] group-hover:shadow-lg group-hover:shadow-[hsl(var(--ptr-primary))]/20'
                            )}>
                                {classification.image ? (
                                    <Image
                                        src={classification.image}
                                        alt={classification.name}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full bg-white/10 flex items-center justify-center text-white/40 text-sm">
                                        无图像
                                    </div>
                                )}
                            </div>
                            <p className={cn(
                                'mt-3 text-base font-spotify font-[900] transition-colors duration-300',
                                classification.showcases.length === 0
                                    ? 'text-white'
                                    : 'text-white group-hover:text-[hsl(var(--ptr-primary))]'
                            )}>
                                {classification.name}
                            </p>
                        </button>
                    ))}
                </AnimatedDiv>

                {/* Classification Cards - Animated Gallery (desktop) */}
                <div className="mt-12 hidden md:block">
                    <PhotoGallery items={galleryItems} animationDelay={0.6} />
                </div>
            </div>
        </section>
    </>
    )
}
