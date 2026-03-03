'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ShowcaseSidebar } from '@/components/ShowcaseSidebar'

interface Sample {
    id: string
    name: string
    description: string | null
    image: string
    audio: string
}

interface Metric {
    id: string
    name: string
    short_description: string | null
    caption: string | null
    prefix: string | null
    value: number
    suffix: string | null
    hide_name: boolean
}

interface Showcase {
    id: string
    name: string
    tagline: string
    objective: string | null
    solution: string | null
    classification: {
        id: string
        name: string
    }
    samples: Sample[]
    metrics: Metric[]
}

interface ClassificationWithShowcases {
    id: string
    name: string
    showcases: { id: string; name: string }[]
}

interface ShowcaseShowClientProps {
    showcase: Showcase
    allClassifications: ClassificationWithShowcases[]
}

export function ShowcaseShowClient({ showcase, allClassifications }: ShowcaseShowClientProps) {
    const [activeSampleIndex, setActiveSampleIndex] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [progress, setProgress] = useState(0)
    const audioRef = useRef<HTMLAudioElement>(null)
    const activeSample = showcase.samples[activeSampleIndex]

    useEffect(() => {
        setIsPlaying(false)
        setProgress(0)
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current.currentTime = 0
        }
    }, [activeSampleIndex])

    const togglePlay = () => {
        if (!audioRef.current) return
        if (isPlaying) {
            audioRef.current.pause()
        } else {
            audioRef.current.play()
        }
        setIsPlaying(!isPlaying)
    }

    const handleTimeUpdate = () => {
        if (!audioRef.current) return
        const pct = (audioRef.current.currentTime / audioRef.current.duration) * 100
        setProgress(pct || 0)
    }

    const handleEnded = () => {
        setIsPlaying(false)
        setProgress(0)
    }

    const prevSample = () => {
        setActiveSampleIndex((i) => (i === 0 ? showcase.samples.length - 1 : i - 1))
    }

    const nextSampleFn = () => {
        setActiveSampleIndex((i) => (i === showcase.samples.length - 1 ? 0 : i + 1))
    }

    const formatValue = (metric: Metric) => {
        const prefix = metric.prefix || ''
        const suffix = metric.suffix || ''
        const num = metric.value % 1 === 0 ? metric.value.toString() : metric.value.toFixed(1)
        return `${prefix}${num}${suffix}`
    }

    return (
        <>
            <div className="absolute top-0 z-[0] h-screen w-screen pointer-events-none bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(16,48,39,0.8),rgba(255,255,255,0))]" />
            <section className="min-h-screen bg-primary text-white">
                {/* Spacer for fixed nav */}
                <div className="h-20" />

                <div className="container mx-auto px-4 py-8 md:py-16">
                    <div className="flex gap-10 lg:gap-16">
                        {/* Left: Tree navigation (desktop only) */}
                        <ShowcaseSidebar
                            classifications={allClassifications}
                            currentShowcaseId={showcase.id}
                        />

                        {/* Right: Main content */}
                        <div className="flex-1 min-w-0">
                            {/* Classification Label */}
                            <p className="text-sm font-semibold uppercase text-white tracking-wider mb-3">
                                {showcase.classification.name}
                            </p>

                            {/* Tagline */}
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-none max-w-3xl"
                                style={{ color: 'hsl(var(--ptr-primary))' }}
                            >
                                {showcase.tagline}
                            </h1>

                            {/* Content Grid */}
                            <div className="mt-10 md:mt-16">
                                {/* Samples + Audio Player */}
                                <div className="flex flex-col sm:flex-row items-center md:items-start justify-center md:justify-start gap-8 md:pl-[100px]">
                                    {/* Left: Samples */}
                                    {showcase.samples.length > 0 && (
                                        <div className="flex flex-col space-y-2 w-44 shrink-0">
                                            {showcase.samples.map((sample, index) => (
                                                <button
                                                    key={sample.id}
                                                    onClick={() => setActiveSampleIndex(index)}
                                                    className={cn(
                                                        'flex items-center justify-between w-full px-4 py-2.5 rounded-lg text-xs font-medium transition-all duration-300',
                                                        index === activeSampleIndex
                                                            ? 'bg-[hsl(var(--ptr-primary))] text-primary'
                                                            : 'bg-white/10 text-white hover:bg-white/20'
                                                    )}
                                                >
                                                    <span>{sample.name}</span>
                                                    <Volume2 className="h-3.5 w-3.5 shrink-0 ml-2" />
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Right: Audio Player */}
                                    {activeSample && (
                                        <div className="bg-black/40 rounded-2xl overflow-hidden w-[220px] shrink-0">
                                            <div className="relative w-full" style={{ aspectRatio: '9/14' }}>
                                                <Image
                                                    src={activeSample.image}
                                                    alt={activeSample.name}
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                            </div>

                                            <div className="p-3">
                                                <div className="w-full h-1 bg-white/20 rounded-full mb-3">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-100"
                                                        style={{
                                                            width: `${progress}%`,
                                                            backgroundColor: 'hsl(var(--ptr-primary))',
                                                        }}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-center gap-5">
                                                    <button
                                                        onClick={prevSample}
                                                        className="text-white/60 hover:text-white transition-colors"
                                                    >
                                                        <SkipBack className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={togglePlay}
                                                        className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform shadow-md"
                                                    >
                                                        {isPlaying ? (
                                                            <Pause className="h-4 w-4 text-black" />
                                                        ) : (
                                                            <Play className="h-4 w-4 text-black ml-0.5" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={nextSampleFn}
                                                        className="text-white/60 hover:text-white transition-colors"
                                                    >
                                                        <SkipForward className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <audio
                                                ref={audioRef}
                                                src={activeSample.audio}
                                                onTimeUpdate={handleTimeUpdate}
                                                onEnded={handleEnded}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Objective & Solution */}
                                <div className="space-y-8 max-w-4xl mt-16">
                                    {showcase.objective && (
                                        <div>
                                            <h2 className="text-lg font-bold text-white mb-2">
                                                The Objective
                                            </h2>
                                            <p className="text-sm md:text-base font-light text-white leading-relaxed">
                                                {showcase.objective}
                                            </p>
                                        </div>
                                    )}

                                    {showcase.solution && (
                                        <div>
                                            <h2 className="text-lg font-bold text-white mb-2">
                                                The Solution
                                            </h2>
                                            <p className="text-sm md:text-base font-light text-white leading-relaxed">
                                                {showcase.solution}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Metrics Section */}
                            {showcase.metrics.length > 0 && (
                                <div className="mt-16 pt-10 border-t border-white/10">
                                    <div className="flex flex-wrap gap-12 md:gap-20">
                                        {showcase.metrics.map((metric) => (
                                            <div key={metric.id}>
                                                {!metric.hide_name && (
                                                    <p className="text-xs md:text-sm font-bold uppercase tracking-wider mb-1">
                                                        {metric.name}
                                                    </p>
                                                )}
                                                <p className="text-4xl md:text-6xl font-bold"
                                                    style={{ color: 'hsl(var(--ptr-primary))' }}
                                                >
                                                    {formatValue(metric)}
                                                </p>
                                                {metric.short_description && (
                                                    <p className="mt-1 text-sm">
                                                        {metric.short_description}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
