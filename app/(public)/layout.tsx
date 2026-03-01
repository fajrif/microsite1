import type React from "react"
import { PublicShell } from "@/components/PublicShell"
import "@/styles/globals.css"

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <PublicShell>
            {children}
        </PublicShell>
    )
}
