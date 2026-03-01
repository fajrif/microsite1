import { ImageHeroContent } from "@/components/ui/image-hero-content"
import { MagicText } from "@/components/ui/magic-text"
import { BenefitsSectionHero } from "@/components/ui/benefits-section-hero"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function HomePage() {

  return (
    <div className="min-h-screen bg-primary text-white py-4">
      {/* Benefits Section */}
      <BenefitsSectionHero
        title="Turning Spotify Creativity into Success Stories:"
        caption="An Interactive Walk-Through"
        subtitle="Grab your headphones & get inspired today."
        backgroundImage="/images/banner-advertising.png"
        ctaButton={{
          text: "LET’S START!",
          href: "/showcases"
        }}
        className="bg-primary"
        variant="light"
      />
    </div>
  )
}
