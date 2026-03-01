'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react'
import { cn } from '@/lib/utils'

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

interface ShowcaseShowClientProps {
    showcase: Showcase
    nextShowcase: { id: string; name: string } | null
}

export function ShowcaseShowClient({ showcase, nextShowcase }: ShowcaseShowClientProps) {
    const [activeSampleIndex, setActiveSampleIndex] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [progress, setProgress] = useState(0)
    const audioRef = useRef<HTMLAudioElement>(null)
    const activeSample = showcase.samples[activeSampleIndex]

    useEffect(() => {
        // Reset when sample changes
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
        // Format number: if it has decimals, show them
        const num = metric.value % 1 === 0 ? metric.value.toString() : metric.value.toFixed(1)
        return `${prefix}${num}${suffix}`
    }

    return (
        <section className="min-h-screen bg-primary text-white">
            {/* Spacer for fixed nav */}
            <div className="h-20" />

            <div className="container mx-auto px-4 py-8 md:py-16">
                {/* Top Navigation */}
                <div className="flex items-center justify-between mb-10">
                    <Link
                        href="/showcases"
                        className="flex items-center gap-1 text-white/70 hover:text-white transition-colors text-sm"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Back
                    </Link>
                    {nextShowcase && (
                        <Link
                            href={`/showcases/${nextShowcase.id}`}
                            className="flex items-center gap-2 border border-[hsl(var(--ptr-primary))] text-[hsl(var(--ptr-primary))] rounded-full px-4 py-2 text-sm font-medium hover:bg-[hsl(var(--ptr-primary))]/10 transition-colors"
                        >
                            Next: {nextShowcase.name}
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    )}
                </div>

                {/* Classification Label */}
                <p className="text-sm font-semibold uppercase tracking-wider mb-3"
                    style={{ color: 'hsl(var(--ptr-primary))' }}
                >
                    {showcase.classification.name}
                </p>

                {/* Tagline */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight max-w-3xl"
                    style={{ color: 'hsl(var(--ptr-primary))' }}
                >
                    {showcase.tagline}
                </h1>

                {/* Content Grid */}
                <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                    {/* Left Column: Objective & Solution */}
                    <div className="space-y-8">
                        {showcase.objective && (
                            <div>
                                <h2 className="text-lg font-bold italic text-white mb-3">
                                    The Objective
                                </h2>
                                <p className="text-sm md:text-base text-white/70 leading-relaxed">
                                    {showcase.objective}
                                </p>
                            </div>
                        )}

                        {showcase.solution && (
                            <div>
                                <h2 className="text-lg font-bold italic text-white mb-3">
                                    The Solution
                                </h2>
                                <p className="text-sm md:text-base text-white/70 leading-relaxed">
                                    {showcase.solution}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Samples + Audio Player */}
                    <div>
                        {/* Sample Tabs */}
                        {showcase.samples.length > 0 && (
                            <div className="space-y-3 mb-6">
                                {showcase.samples.map((sample, index) => (
                                    <button
                                        key={sample.id}
                                        onClick={() => setActiveSampleIndex(index)}
                                        className={cn(
                                            'flex items-center justify-between w-full md:w-64 px-5 py-3 rounded-lg text-sm font-medium transition-all duration-300',
                                            index === activeSampleIndex
                                                ? 'bg-[hsl(var(--ptr-primary))] text-primary'
                                                : 'bg-white/10 text-white hover:bg-white/20'
                                        )}
                                    >
                                        <span>{sample.name}</span>
                                        <Volume2 className="h-4 w-4" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Phone Mockup / Audio Player */}
                        {activeSample && (
                            <div className="bg-black/40 rounded-2xl overflow-hidden max-w-xs mx-auto lg:mx-0">
                                {/* Sample Image */}
                                <div className="relative aspect-[3/4] w-full">
                                    <p className="absolute top-4 left-4 text-[10px] text-white/50 uppercase tracking-widest">
                                        Advertisement
                                    </p>
                                    <Image
                                        src={activeSample.image}
                                        alt={activeSample.name}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>

                                {/* Audio Controls */}
                                <div className="p-4">
                                    {/* Progress Bar */}
                                    <div className="w-full h-1 bg-white/20 rounded-full mb-4">
                                        <div
                                            className="h-full rounded-full transition-all duration-100"
                                            style={{
                                                width: `${progress}%`,
                                                backgroundColor: 'hsl(var(--ptr-primary))',
                                            }}
                                        />
                                    </div>

                                    {/* Controls */}
                                    <div className="flex items-center justify-center gap-6">
                                        <button
                                            onClick={prevSample}
                                            className="text-white/60 hover:text-white transition-colors"
                                        >
                                            <SkipBack className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={togglePlay}
                                            className="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform"
                                        >
                                            {isPlaying ? (
                                                <Pause className="h-5 w-5 text-black" />
                                            ) : (
                                                <Play className="h-5 w-5 text-black ml-0.5" />
                                            )}
                                        </button>
                                        <button
                                            onClick={nextSampleFn}
                                            className="text-white/60 hover:text-white transition-colors"
                                        >
                                            <SkipForward className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Hidden audio element */}
                                <audio
                                    ref={audioRef}
                                    src={activeSample.audio}
                                    onTimeUpdate={handleTimeUpdate}
                                    onEnded={handleEnded}
                                />
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
                                        <p className="text-xs md:text-sm font-semibold uppercase tracking-wider text-white/60 mb-1">
                                            {metric.name}
                                        </p>
                                    )}
                                    <p className="text-4xl md:text-6xl font-bold"
                                        style={{ color: 'hsl(var(--ptr-primary))' }}
                                    >
                                        {formatValue(metric)}
                                    </p>
                                    {metric.short_description && (
                                        <p className="mt-1 text-sm text-white/50">
                                            {metric.short_description}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}
