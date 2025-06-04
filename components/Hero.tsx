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
    <section id="home" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 pt-16">
      <div className="container-max section-padding">
        <div className="text-center animate-fade-in">
          {/* Main heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
            <span className="block">Bhargava</span>
            <span className="block text-gradient">Shastry</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Security Engineer at the Ethereum Foundation & Independent Security Researcher
          </p>

          {/* Description */}
          <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
            Specializing in smart contract security, fuzzing, and blockchain technology.
            Contributing to the security and reliability of decentralized systems.
          </p>

          {/* Key highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto">
            <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Security Research</h3>
              <p className="text-gray-600 text-center">
                Conducting security research for Ethereum protocol and smart contracts
              </p>
            </div>

            <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <Code className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Core Contributor</h3>
              <p className="text-gray-600 text-center">
                300+ commits to Solidity compiler and other critical projects
              </p>
            </div>

            <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Fuzzing Expert</h3>
              <p className="text-gray-600 text-center">
                Developing advanced fuzzing tools and vulnerability discovery methods
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={scrollToAbout}
              className="btn-primary px-8 py-3 text-lg"
            >
              Learn More
            </button>
            <a
              href="#contact"
              className="btn-secondary px-8 py-3 text-lg"
            >
              Get In Touch
            </a>
          </div>

          {/* Scroll indicator */}
          <button
            onClick={scrollToAbout}
            className="animate-bounce text-gray-400 hover:text-primary-600 transition-colors duration-200"
            aria-label="Scroll to about section"
          >
            <ArrowDown size={24} />
          </button>
        </div>
      </div>
    </section>
  )
}