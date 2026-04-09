'use client'

import { ArrowDown, Shield, Code, Search } from 'lucide-react'

export default function Hero() {
  const scrollToAbout = () => {
    const element = document.getElementById('about')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section
      id="home"
      className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 pt-16"
    >
      <div className="container-max section-padding">
        <div className="animate-fade-in text-center">
          {/* Main heading */}
          <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-6xl lg:text-7xl">
            <span className="block">Bhargava</span>
            <span className="text-gradient block">Shastry</span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-8 max-w-3xl text-xl text-gray-600 md:text-2xl">
            Security Engineer at the Ethereum Foundation & Independent Security Researcher
          </p>

          {/* Description */}
          <p className="mx-auto mb-12 max-w-2xl text-lg text-gray-500">
            Specializing in smart contract security, fuzzing, and blockchain technology.
            Contributing to the security and reliability of decentralized systems.
          </p>

          {/* Key highlights */}
          <div className="mx-auto mb-12 grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                <Shield className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Security Research</h3>
              <p className="text-center text-gray-600">
                Conducting security research for Ethereum protocol and smart contracts
              </p>
            </div>

            <div className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                <Code className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Core Contributor</h3>
              <p className="text-center text-gray-600">
                300+ commits to Solidity compiler and other critical projects
              </p>
            </div>

            <div className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                <Search className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Fuzzing Expert</h3>
              <p className="text-center text-gray-600">
                Developing advanced fuzzing tools and vulnerability discovery methods
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mb-16 flex flex-col justify-center gap-4 sm:flex-row">
            <button onClick={scrollToAbout} className="btn-primary px-8 py-3 text-lg">
              Learn More
            </button>
            <a href="#contact" className="btn-secondary px-8 py-3 text-lg">
              Get In Touch
            </a>
          </div>

          {/* Scroll indicator */}
          <button
            onClick={scrollToAbout}
            className="animate-bounce text-gray-400 transition-colors duration-200 hover:text-primary-600"
            aria-label="Scroll to about section"
          >
            <ArrowDown size={24} />
          </button>
        </div>
      </div>
    </section>
  )
}
