'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Play, Pause, SkipBack, SkipForward, Video, Volume2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ShowcaseSidebar } from '@/components/ShowcaseSidebar'

interface Sample {
    id: string
    name: string
    description: string | null
    image: string
    audio: string | null
    video_link: string | null
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
    campaign_dates: string | null
    market: string | null
    formats: string | null
    source: string | null
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
    const videoRef = useRef<HTMLVideoElement>(null)
    const audioRef = useRef<HTMLAudioElement>(null)
    const activeSample = showcase.samples[activeSampleIndex]

    const hasVideo = !!activeSample?.video_link
    const hasAudio = !hasVideo && !!activeSample?.audio
    const hasMedia = hasVideo || hasAudio

    useEffect(() => {
        setIsPlaying(false)
        setProgress(0)
        if (videoRef.current) {
            videoRef.current.pause()
            videoRef.current.currentTime = 0
        }
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current.currentTime = 0
        }
    }, [activeSampleIndex])

    const togglePlay = () => {
        if (hasVideo && videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause()
            } else {
                videoRef.current.play()
            }
            setIsPlaying(!isPlaying)
        } else if (hasAudio && audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause()
            } else {
                audioRef.current.play()
            }
            setIsPlaying(!isPlaying)
        }
    }

    const handleTimeUpdate = () => {
        const el = hasVideo ? videoRef.current : audioRef.current
        if (!el) return
        const pct = (el.currentTime / el.duration) * 100
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
                                {/* Samples + iPhone Player */}
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
                                                    {sample.video_link ? (
                                                        <Play className="h-3.5 w-3.5 shrink-0 ml-2" />
                                                    ) : (
                                                        <Volume2 className="h-3.5 w-3.5 shrink-0 ml-2" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Right: Player */}
                                    {activeSample && (
                                        <div className="w-[220px] h-[440px] shrink-0 rounded-2xl border-2 bg-black overflow-hidden flex flex-col" style={{ borderColor: 'hsl(var(--ptr-primary))' }}>
                                            {/* Image / Video area */}
                                            {hasVideo ? (
                                                <div className="flex-1 relative overflow-hidden">
                                                    <video
                                                        ref={videoRef}
                                                        src={activeSample.video_link!}
                                                        poster={activeSample.image}
                                                        onTimeUpdate={handleTimeUpdate}
                                                        onEnded={handleEnded}
                                                        playsInline
                                                        className="absolute inset-0 w-full h-full object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex-1 flex items-center justify-center overflow-hidden p-3 pt-4">
                                                    <div className="relative w-full" style={{ aspectRatio: '4/5' }}>
                                                        <Image
                                                            src={activeSample.image}
                                                            alt={activeSample.name}
                                                            fill
                                                            className="object-contain rounded-sm"
                                                            unoptimized
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Audio element (hidden) */}
                                            {hasAudio && (
                                                <audio
                                                    ref={audioRef}
                                                    src={activeSample.audio!}
                                                    onTimeUpdate={handleTimeUpdate}
                                                    onEnded={handleEnded}
                                                />
                                            )}

                                            {/* Player controls area */}
                                            {hasMedia && (
                                                <div className="shrink-0 px-4 pb-4 pt-3">
                                                    {/* Progress bar */}
                                                    <div className="w-full h-[3px] bg-white/20 rounded-full mb-4">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-100"
                                                            style={{ width: `${progress}%`, backgroundColor: 'hsl(var(--ptr-primary))' }}
                                                        />
                                                    </div>

                                                    {/* Controls */}
                                                    <div className="flex items-center justify-center gap-6">
                                                        <button
                                                            onClick={prevSample}
                                                            className="text-white/40 hover:text-white transition-colors"
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
                                                            className="text-white/40 hover:text-white transition-colors"
                                                        >
                                                            <SkipForward className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
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

                            {/* Campaign Details */}
                            {(showcase.campaign_dates || showcase.market || showcase.formats || showcase.source) && (
                                <div className="mt-10 pt-6 border-t border-white/10">
                                    <p className="text-sm font-light text-white/80 leading-relaxed">
                                        {[
                                            showcase.campaign_dates ? `Campaign dates: ${showcase.campaign_dates}` : null,
                                            showcase.formats ? `Formats: ${showcase.formats}` : null,
                                            showcase.market ? `Market: ${showcase.market}` : null,
                                        ]
                                            .filter(Boolean)
                                            .map((item, i, arr) => (
                                                <span key={i}>
                                                    <strong className="font-bold">{item!.split(': ')[0]}: </strong>
                                                    {item!.split(': ').slice(1).join(': ')}
                                                    {i < arr.length - 1 && <span className="mx-2 text-white/30">|</span>}
                                                </span>
                                            ))
                                        }
                                    </p>
                                    {showcase.source && (
                                        <p className="text-sm font-light text-white/80 mt-1">
                                            <strong className="font-bold">Source: </strong>{showcase.source}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
