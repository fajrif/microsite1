import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="relative bg-primary text-white overflow-hidden">

      {/* Content */}
      <div className="relative container mx-auto px-4">
        {/* Logo row */}
        <div className="flex justify-center md:justify-start py-10 md:py-12">
          <Image
            src="/images/logo.png"
            alt="Spotify Advertising"
            width={240}
            height={120}
            className="h-14 w-auto"
          />
        </div>

        {/* Main grid */}
        <div className="flex flex-col gap-10 pb-6 md:pb-12 md:flex-row md:justify-between md:items-start md:gap-18 text-center md:text-left">
          {/* Left column */}
          <div className="max-w-[550px]">
          </div>

          {/* Right columns */}
          <div className="flex flex-col gap-8 md:flex-row md:gap-10">
          </div>
        </div>

        {/* Copyright */}
        <div className="flex justify-between border-t border-white/20 py-6 text-xs md:text-sm text-white">
          <p className="text-center md:text-left">&copy; 2026 Spotify Advertising. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
