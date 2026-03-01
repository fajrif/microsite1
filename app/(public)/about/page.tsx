import { ImageHeroContent } from "@/components/ui/image-hero-content"

export default function AboutPage() {

  return (
    <div className="min-h-screen">
      <section id="banner-section" className="bg-primary">
        {/* Hero Section with Image Background */}
        <ImageHeroContent
          image="/images/banner2.png"
          text="About Spotify Advertising"
        />
      </section>

    </div>
  )
}

