import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import localFont from "next/font/local"
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' })

const spotifyMixWide = localFont({
    src: [
        { path: './fonts/SpotifyMixWide/SpotifyMixWide-Thin.otf', weight: '100', style: 'normal' },
        { path: './fonts/SpotifyMixWide/SpotifyMixWide-ThinItalic.otf', weight: '100', style: 'italic' },
        { path: './fonts/SpotifyMixWide/SpotifyMixWide-Light.otf', weight: '300', style: 'normal' },
        { path: './fonts/SpotifyMixWide/SpotifyMixWide-LightItalic.otf', weight: '300', style: 'italic' },
        { path: './fonts/SpotifyMixWide/SpotifyMixWide-Regular.otf', weight: '400', style: 'normal' },
        { path: './fonts/SpotifyMixWide/SpotifyMixWide-RegularItalic.otf', weight: '400', style: 'italic' },
        { path: './fonts/SpotifyMixWide/SpotifyMixWide-Medium.otf', weight: '500', style: 'normal' },
        { path: './fonts/SpotifyMixWide/SpotifyMixWide-MediumItalic.otf', weight: '500', style: 'italic' },
        { path: './fonts/SpotifyMixWide/SpotifyMixWide-Bold.otf', weight: '700', style: 'normal' },
        { path: './fonts/SpotifyMixWide/SpotifyMixWide-BoldItalic.otf', weight: '700', style: 'italic' },
        { path: './fonts/SpotifyMixWide/SpotifyMixWide-Extrabold.otf', weight: '800', style: 'normal' },
        { path: './fonts/SpotifyMixWide/SpotifyMixWide-ExtraboldItalic.otf', weight: '800', style: 'italic' },
        { path: './fonts/SpotifyMixWide/SpotifyMixWide-Black.otf', weight: '900', style: 'normal' },
        { path: './fonts/SpotifyMixWide/SpotifyMixWide-BlackItalic.otf', weight: '900', style: 'italic' },
        { path: './fonts/SpotifyMixWide/SpotifyMixWide-Ultra.otf', weight: '950', style: 'normal' },
        { path: './fonts/SpotifyMixWide/SpotifyMixWide-UltraItalic.otf', weight: '950', style: 'italic' },
    ],
    variable: '--font-spotify-mix-wide',
})

export const metadata: Metadata = {
    title: "Spotify Advertising - Turning Spotify Creativity into Success Stories: An Interactive Walk-Through",
    description: "Hear some of the best in-class audio and video campaigns created by global brands  and agencies that delivered impactful storytelling to reach the right audience, in the right way, at the right moment.",
    metadataBase: new URL("https://quantara.id"),
    openGraph: {
        title: "Spotify Advertising - Turning Spotify Creativity into Success Stories: An Interactive Walk-Through",
        description: "Hear some of the best in-class audio and video campaigns created by global brands  and agencies that delivered impactful storytelling to reach the right audience, in the right way, at the right moment.",
        url: "https://quantara.id",
        siteName: "Spotify Advertising",
        images: [
            {
                url: "https://quantara.id/images/og-image.png",
                width: 1200,
                height: 261,
                alt: "Spotify Advertising",
                type: "image/png",
            },
        ],
        locale: "id_ID",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Spotify Advertising - Turning Spotify Creativity into Success Stories: An Interactive Walk-Through",
        description: "Hear some of the best in-class audio and video campaigns created by global brands  and agencies that delivered impactful storytelling to reach the right audience, in the right way, at the right moment.",
        images: ["https://quantara.id/images/og-image.png"],
    },
    icons: {
        icon: [
            {
                url: "/icon.png",
            },
        ],
        apple: "/apple-icon.png",
    },
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" className={`${inter.variable} ${spotifyMixWide.variable}`}>
            <body className="antialiased">
                {children}
                <Analytics />
            </body>
        </html>
    )
}
