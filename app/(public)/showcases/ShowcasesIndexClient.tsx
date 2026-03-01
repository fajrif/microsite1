'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { GradualSpacing } from '@/components/ui/gradual-spacing'
import { AnimatedDiv } from "@/components/ui/animated-div"

interface Classification {
    id: string
    name: string
    description: string | null
    image: string | null
    showcases: Array<{
        id: string
        name: string
        tagline: string
    }>
}

interface ShowcasesIndexClientProps {
    classifications: Classification[]
}

export function ShowcasesIndexClient({ classifications }: ShowcasesIndexClientProps) {
    const router = useRouter()

    return (
    <>
        <div className="absolute top-0 z-[0] h-screen w-screen bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(16,48,39,0.8),rgba(255,255,255,0))]" />
        <section className="min-h-screen bg-primary text-white">
            {/* Spacer for fixed nav */}
            <div className="h-20" />

            <div className="container mx-auto py-16 md:py-24 px-4">
                {/* Headline */}
                <GradualSpacing
                    text="Set the stage with our five core"
                    className="drop-shadow-sm font-display text-3xl md:text-5xl lg:text-6xl font-bold leading-none -tracking-widest text-[hsl(var(--ptr-primary))]"
                />
                <GradualSpacing
                    text="creative best practices"
                    className="drop-shadow-sm font-display text-3xl md:text-5xl lg:text-6xl font-bold leading-none -tracking-widest text-[hsl(var(--ptr-primary))]"
                />

                {/* Subtitle */}
                <AnimatedDiv id="showcases-short-description" delay={0.1}>
                  <p className="mt-6 text-base md:text-lg text-white max-w-3xl leading-relaxed">
                      Hear some of the best in-class audio and video campaigns created by global
                      brands and agencies that delivered impactful storytelling to reach the right
                      audience, in the right way, at the right moment.
                  </p>
                </AnimatedDiv>

                {/* Classification Cards */}
                <AnimatedDiv id="showcases-grid" className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8 w-full" delay={0.3}>
                    {classifications.map((classification) => (
                        <button
                            key={classification.id}
                            disabled={classification.showcases.length === 0}
                            onClick={() => router.push(`/showcases/${classification.showcases[0].id}`)}
                            className={cn(
                                "group text-left transition-all duration-300 w-full",
                                classification.showcases.length === 0 ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                            )}
                        >
                            <div
                                className={cn(
                                    'w-full aspect-square rounded-2xl overflow-hidden border-4 transition-all duration-300 relative',
                                    classification.showcases.length === 0
                                        ? 'border-transparent opacity-70'
                                        : 'border-transparent opacity-70 group-hover:opacity-100 group-hover:border-[hsl(var(--ptr-primary))] group-hover:shadow-lg group-hover:shadow-[hsl(var(--ptr-primary))]/20'
                                )}
                            >
                                {classification.image ? (
                                    <Image
                                        src={classification.image}
                                        alt={classification.name}
                                        width={600}
                                        height={600}
                                        className="w-full h-full object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full bg-white/10 flex items-center justify-center text-white/40 text-sm">
                                        No Image
                                    </div>
                                )}
                            </div>
                            <p
                                className={cn(
                                    'mt-3 text-lg md:text-xl font-bold transition-colors duration-300',
                                    classification.showcases.length === 0
                                        ? 'text-white'
                                        : 'text-white group-hover:text-[hsl(var(--ptr-primary))]'
                                )}
                            >
                                {classification.name}
                            </p>
                        </button>
                    ))}
                </AnimatedDiv>
            </div>
        </section>
    </>
    )
}
