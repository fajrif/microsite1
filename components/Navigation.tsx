"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"

interface ClassificationWithShowcases {
  id: string
  name: string
  showcases: { id: string; name: string }[]
}

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [treeData, setTreeData] = useState<ClassificationWithShowcases[]>([])
  const pathname = usePathname()

  const isShowcaseDetail = pathname.startsWith('/showcases/') && pathname !== '/showcases'
  const currentShowcaseId = isShowcaseDetail ? pathname.split('/').pop() ?? '' : ''

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll()

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (isShowcaseDetail && isOpen && treeData.length === 0) {
      fetch('/api/classifications?withShowcases=true')
        .then((r) => r.json())
        .then((data) => setTreeData(data.classifications || []))
        .catch(() => { })
    }
  }, [isShowcaseDetail, isOpen, treeData.length])

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled
        ? "bg-primary/80 backdrop-blur-lg shadow-sm"
        : "bg-transparent"
        }`}
    >
      <div className="container mx-auto">
        <div className={cn(
          "flex items-center justify-between transition-all duration-300",
          isScrolled ? "h-16" : "h-20"
        )}>
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="Spotify Advertising"
              width={180}
              height={50}
              className={cn(
                "w-auto transition-all duration-300",
                isScrolled ? "h-8 md:h-10" : "h-10 md:h-12"
              )}
              unoptimized
              priority
            />
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-white"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <>
            <div className="md:hidden pb-4 space-y-3 bg-black text-sm text-white shadow-lg rounded-b-lg p-4 mb-4">
              {isShowcaseDetail && treeData.length > 0 && (
                <div className="space-y-3">
                  {treeData.map((classification) => (
                    <div key={classification.id}>
                      <p className="text-[10px] uppercase tracking-widest text-white/50 mb-1">
                        {classification.name}
                      </p>
                      <ul className="space-y-0.5 pl-2">
                        {classification.showcases.map((showcase) => (
                          <li key={showcase.id}>
                            <Link
                              href={`/showcases/${showcase.id}`}
                              className={cn(
                                'block px-2 py-1.5 rounded text-sm transition-colors',
                                showcase.id === currentShowcaseId
                                  ? 'bg-[hsl(var(--ptr-primary))] text-primary font-medium'
                                  : 'text-white/80 hover:text-white'
                              )}
                              onClick={() => setIsOpen(false)}
                            >
                              {showcase.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  )
}
