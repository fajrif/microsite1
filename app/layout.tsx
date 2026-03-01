import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' })

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
        <html lang="en" className={inter.variable}>
            <body className={`${inter.className} antialiased`}>
                {children}
                <Analytics />
            </body>
        </html>
    )
}
