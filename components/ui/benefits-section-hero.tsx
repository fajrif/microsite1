'use client'

import React, { useEffect, useState } from 'react';
import { cn } from "@/lib/utils";
import { motion, Variants } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import Image from 'next/image';

interface Feature {
    icon: LucideIcon;
    title: string;
    description: string;
}

interface BenefitsSectionHeroProps {
    title: React.ReactNode;
    subtitle?: string;
    features: Feature[];
    backgroundImage: string;
    ctaButton?: {
        text: string;
        href: string;
    };
    imagePosition?: 'left' | 'right';
    className?: string;
    variant?: 'dark' | 'light';
}

const BenefitsSectionHero: React.FC<BenefitsSectionHeroProps> = ({
    className,
    title,
    subtitle,
    features,
    backgroundImage,
    ctaButton,
    imagePosition = 'right',
    variant = 'dark'
}) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger animation after mount
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Color classes based on variant
    const colors = {
        dark: {
            title: 'text-white',
            subtitle: 'text-white/70',
            featureTitle: 'text-white',
            featureDesc: 'text-white/60',
            iconBg: 'bg-white/10',
            iconColor: 'text-white',
            hoverBg: 'hover:bg-white/5',
            ctaBg: 'bg-gray-900 hover:bg-gray-800',
            ctaText: 'text-white',
            accentBar: 'bg-white/40',
        },
        light: {
            title: '',
            subtitle: '',
            featureTitle: '',
            featureDesc: 'text-gray-600',
            iconBg: 'bg-[#dedede]',
            iconColor: 'text-gray-900',
            hoverBg: 'hover:bg-gray-900/5',
            ctaBg: 'bg-[#dedede] hover:bg-gray-900',
            ctaText: 'text-white',
            accentBar: 'bg-gray-900/30',
        }
    };

    const c = colors[variant];

    // Animation variants for the container
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1,
            },
        },
    };

    // Animation variants for individual elements
    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
            },
        },
    };

    const ContentSection = (
        <div className="flex w-full flex-col justify-center p-8 md:w-1/2 md:p-12 lg:p-16 items-center md:items-start text-center md:text-left">
            <motion.div
                initial="hidden"
                animate={isVisible ? "visible" : "hidden"}
                variants={containerVariants}
                className="md:pl-14 lg:pl-20"
            >

                <motion.div variants={itemVariants} className="flex justify-center md:justify-start">
                    <Image
                        src="/images/logo.png"
                        alt="Spotify Advertising"
                        width={150}
                        height={40}
                        className="mb-8 h-12 w-auto"
                        unoptimized
                    />
                </motion.div>

                <motion.h2
                    className={`text-2xl font-regular uppercase leading-tight md:text-3xl lg:text-4xl ${c.title} mb-6 md:mb-10`}
                    variants={itemVariants}
                >
                    {title}
                </motion.h2>

                {subtitle && (
                    <motion.p
                        className={`mb-8 max-w-md text-base ${c.subtitle} mx-auto md:mx-0`}
                        variants={itemVariants}
                    >
                        {subtitle}
                    </motion.p>
                )}

                {/* Features Grid */}
                <motion.div
                    className="grid gap-4 grid-cols-2 sm:grid-cols-2"
                    variants={containerVariants}
                >
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={index}
                                className={`flex flex-col md:flex-row items-center md:items-start gap-3 rounded-lg p-3 transition-colors ${c.hoverBg}`}
                                variants={itemVariants}
                            >
                                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${c.iconBg}`}>
                                    <Icon className={`h-5 w-5 ${c.iconColor}`} />
                                </div>
                                <div>
                                    <h3 className={`text-sm md:text-base font-medium ${c.featureTitle}`}>{feature.title}</h3>
                                    <p className={`text-sm ${c.featureDesc}`}>{feature.description}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {ctaButton && (
                    <motion.div className="mt-8 flex justify-center md:justify-start" variants={itemVariants}>
                        <a
                            href={ctaButton.href}
                            className="inline-flex items-center gap-2 rounded-2xl bg-[#dedede] px-6 py-3 text-sm font-medium transition-colors hover:bg-gray-900/20"
                        >
                            {ctaButton.text}
                        </a>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );

    const ImageSection = (
        <motion.div
            className="hidden md:block relative min-h-[300px] w-full overflow-hidden md:min-h-[400px] md:w-1/2"
            initial={{
                clipPath: imagePosition === 'right'
                    ? 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)'
                    : 'polygon(0 0, 0 0, 0 100%, 0 100%)'
            }}
            animate={isVisible ? {
                clipPath: imagePosition === 'right'
                    ? 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)'
                    : 'polygon(0 0, 85% 0, 100% 100%, 0 100%)'
            } : {
                clipPath: imagePosition === 'right'
                    ? 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)'
                    : 'polygon(0 0, 0 0, 0 100%, 0 100%)'
            }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: `url(${backgroundImage})`,
                }}
            />
            {/* Diagonal overlay for visual interest */}
            <div
                className={`absolute inset-0 ${variant === 'light' ? 'bg-gradient-to-r from-sk-gold/60 to-transparent' : 'bg-gradient-to-r from-black/40 to-transparent'}`}
                style={{
                    clipPath: imagePosition === 'right'
                        ? 'polygon(0 0, 40% 0, 0 100%, 0 100%)'
                        : 'polygon(60% 0, 100% 0, 100% 100%, 100% 100%)'
                }}
            />
        </motion.div>
    );

    return (
        <section
            className={cn(
                "relative flex min-h-[400px] w-full flex-col overflow-hidden md:flex-row",
                className
            )}
        >
            {imagePosition === 'left' ? (
                <>
                    {ImageSection}
                    {ContentSection}
                </>
            ) : (
                <>
                    {ContentSection}
                    {ImageSection}
                </>
            )}
        </section>
    );
};

BenefitsSectionHero.displayName = "BenefitsSectionHero";

export { BenefitsSectionHero };
