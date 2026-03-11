"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ShinyButton } from '@/components/ui/shiny-button';

interface Banner {
    id: string
    order_no: number
    image: string | null
    title: string | null
    caption: string | null
    short_description: string | null
    cta_button_text: string | null
    cta_button_href: string | null
}

interface HomePageClientProps {
    banner: Banner | null
}

export default function HomePageClient({ banner }: HomePageClientProps) {
    const bgImage = banner?.image ?? '/images/bg-home.png'
    const title = banner?.title ?? '巧用 Spotify 平台创作成功故事：'
    const caption = banner?.caption ?? '您的互动营销指南'
    const description = banner?.short_description ?? '赶快戴上耳机，灵感即刻涌现'
    const ctaText = banner?.cta_button_text ?? '马上开始！'
    const ctaHref = banner?.cta_button_href ?? '/showcases'

    return (
        <div
            className="relative min-h-screen flex items-center justify-center overflow-hidden bg-primary bg-cover bg-center"
            style={{ backgroundImage: `url(${bgImage})` }}
        >
            {/* Primary color overlay */}
            <div className="absolute inset-0 bg-primary/90" />
            <motion.div
                initial={{ opacity: 0.0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                    delay: 0.3,
                    duration: 0.8,
                    ease: "easeInOut",
                }}
                className="relative flex flex-col gap-4 items-center justify-center px-4"
            >
                <Image
                    src="/images/logo.png"
                    alt="Spotify Advertising"
                    width={280}
                    height={80}
                    className="mb-10 w-48 md:w-60 lg:w-72 h-auto"
                    unoptimized
                />
                <div className="text-center max-w-5xl mb-10">
                    <div className="drop-shadow-sm font-display text-3xl md:text-6xl lg:text-6xl font-bold leading-none --tracking-widest text-[hsl(var(--ptr-primary))] mb-6">
                        {title}
                    </div>
                    {caption && (
                        <div className="drop-shadow-sm font-display text-3xl md:text-5xl lg:text-5xl font-light leading-none --tracking-widest text-[hsl(var(--ptr-primary))] mb-6 md:mb-10">
                            {caption}
                        </div>
                    )}
                    {description && (
                        <p className="text-xl md:text-2xl text-white leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>
                <ShinyButton
                    href={ctaHref}
                    className={`text-white rounded-4xl text-base py-3 mb-6 md:mb-10`}
                >
                    {ctaText}
                </ShinyButton>
            </motion.div>
        </div>
    )
}
