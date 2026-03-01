"use client"

import type React from "react"
import Image from "next/image"
import { ImageHeroContent } from "@/components/ui/image-hero-content"
import { AnimatedDiv } from "@/components/ui/animated-div"
import { useState } from "react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  })
  const [honeypot, setHoneypot] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    setErrorMsg("")

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, honeypot }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error ?? "Something went wrong. Please try again.")
        setStatus("error")
        return
      }

      setStatus("success")
      setFormData({ name: "", email: "", company: "", message: "" })
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.")
      setStatus("error")
    }
  }

  return (
    <div className="min-h-screen">
      <section id="banner-section" className="bg-primary">
        {/* Hero Section with Image Background */}
        <ImageHeroContent
          image="/images/banner3.png"
          text="Lets Get in Touch"
        />
      </section>

      {/* Contact Section */}
      <section className="relative pt-4 pb-20 md:py-20 md:px-4 overflow-hidden bg-white">
        <AnimatedDiv id="contact-section" className="container mx-auto max-w-6xl relative z-20">
          <div className="w-full relative overflow-hidden flex flex-col md:flex-row shadow-xl">

            <div className="w-full h-full z-2 absolute bg-linear-to-t from-transparent to-black"></div>
            <div className="flex absolute z-2 overflow-hidden backdrop-blur-2xl">
              <div className="h-[40rem] z-2 w-[4rem] bg-linear-90 from-[#ffffff00] via-[#000000] via-[69%] to-[#ffffff30] opacity-30 overflow-hidden"></div>
              <div className="h-[40rem] z-2 w-[4rem] bg-linear-90 from-[#ffffff00] via-[#000000] via-[69%] to-[#ffffff30] opacity-30 overflow-hidden"></div>
              <div className="h-[40rem] z-2 w-[4rem] bg-linear-90 from-[#ffffff00] via-[#000000] via-[69%] to-[#ffffff30] opacity-30 overflow-hidden"></div>
              <div className="h-[40rem] z-2 w-[4rem] bg-linear-90 from-[#ffffff00] via-[#000000] via-[69%] to-[#ffffff30] opacity-30 overflow-hidden"></div>
              <div className="h-[40rem] z-2 w-[4rem] bg-linear-90 from-[#ffffff00] via-[#000000] via-[69%] to-[#ffffff30] opacity-30 overflow-hidden"></div>
              <div className="h-[40rem] z-2 w-[4rem] bg-linear-90 from-[#ffffff00] via-[#000000] via-[69%] to-[#ffffff30] opacity-30 overflow-hidden"></div>
            </div>
            <div className="w-[15rem] h-[15rem] bg-yellow-500 absolute z-1 rounded-full bottom-0"></div>
            <div className="w-[8rem] h-[5rem] bg-white absolute z-1 rounded-full bottom-0"></div>
            <div className="w-[8rem] h-[5rem] bg-white absolute z-1 rounded-full bottom-0"></div>

            {/* Left Panel — tagline */}
            <div className="bg-black text-white p-8 md:p-12 md:w-1/2 relative rounded-bl-3xl overflow-hidden">
              <h1 className="text-2xl md:text-3xl font-medium leading-tight z-10 tracking-tight relative">
                Where Strategy Meets Financial Excellence
              </h1>
            </div>

            {/* Right Panel — form */}
            <div className="p-8 md:p-12 md:w-1/2 flex flex-col bg-primary z-[10]">
              <div className="flex flex-col mb-8">
                <div className="mb-4">
                  <Image
                    src="/images/logo.png"
                    alt="Spotify Advertising"
                    width={130}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <h2 className="text-2xl font-medium text-white mb-1 tracking-tight uppercase">
                  Send Us A Message
                </h2>
                <p className="text-white/60 text-sm font-light">
                  Let&apos;s talk about how we can help you grow.
                </p>
              </div>

              {status === "success" ? (
                <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
                  <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-white">Message Received!</h3>
                  <p className="text-white/60 text-sm font-light">Thank you for reaching out. We&apos;ll get back to you shortly.</p>
                  <button
                    onClick={() => setStatus("idle")}
                    className="mt-2 text-white/60 text-xs underline hover:text-white transition-colors"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {/* Honeypot — hidden from real users, filled by bots */}
                  <input
                    type="text"
                    name="website"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="hidden"
                  />

                  <input
                    id="name"
                    type="text"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={status === "loading"}
                    className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-white text-primary placeholder:text-primary/40 font-light focus:outline-none focus:border-primary/50 hover:border-primary/40 transition-colors text-sm disabled:opacity-60"
                  />

                  <input
                    id="email"
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={status === "loading"}
                    className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-white text-primary placeholder:text-primary/40 font-light focus:outline-none focus:border-primary/50 hover:border-primary/40 transition-colors text-sm disabled:opacity-60"
                  />

                  <input
                    id="company"
                    type="text"
                    placeholder="Company Name"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    disabled={status === "loading"}
                    className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-white text-primary placeholder:text-primary/40 font-light focus:outline-none focus:border-primary/50 hover:border-primary/40 transition-colors text-sm disabled:opacity-60"
                  />

                  <textarea
                    id="message"
                    placeholder="Tell us or discuss your needs"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    disabled={status === "loading"}
                    className="w-full px-4 py-3 rounded-xl border border-primary/20 bg-white text-primary placeholder:text-primary/40 font-light focus:outline-none focus:border-primary/50 hover:border-primary/40 transition-colors resize-none text-sm disabled:opacity-60"
                  />

                  {status === "error" && (
                    <p className="text-red-300 text-xs">{errorMsg}</p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full hover:opacity-90 bg-yellow-600 text-white font-medium py-2.5 px-4 rounded-lg transition-opacity text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {status === "loading" ? "Submitting…" : "Submit"}
                  </button>
                </form>
              )}
            </div>

          </div>
        </AnimatedDiv>
      </section>

    </div>
  )
}
