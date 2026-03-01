'use client'

import { usePathname } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'

export function PublicShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isHome = pathname === '/'

    return (
        <>
            {!isHome && <Navigation />}
            {children}
            {!isHome && <Footer />}
        </>
    )
}
