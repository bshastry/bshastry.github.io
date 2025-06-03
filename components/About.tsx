'use client'

import { Award, BookOpen, Users, Target } from 'lucide-react'

export default function About() {
  const stats = [
    { label: 'Years of Experience', value: '8+', icon: Target },
    { label: 'Open Source Projects', value: '20+', icon: BookOpen },
    { label: 'Security Vulnerabilities Found', value: '50+', icon: Award },
    { label: 'Community Contributions', value: '1000+', icon: Users },
  ]

  return (
    <section id="about" className="py-20 bg-white">
      <div className="container-max section-padding">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            About Me
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Passionate about securing the future of decentralized systems through rigorous research and development
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Content */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Security Engineer & Researcher
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                I'm a security engineer at the Ethereum Foundation and an independent security researcher
                with a deep passion for blockchain technology and smart contract security. My work focuses
                on identifying vulnerabilities, developing security tools, and contributing to the overall
                security posture of decentralized systems.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                With over 300 commits to the Solidity compiler and contributions to numerous critical
                projects, I've been at the forefront of blockchain security research. My expertise spans
                fuzzing, static analysis, protocol security, and vulnerability discovery.
              </p>
              <p className="text-gray-600 leading-relaxed">
                I believe in the power of open-source collaboration and have contributed to projects
                like Google's OSS-Fuzz, various Ethereum clients, and developed specialized security
                tools that are used by the broader blockchain community.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Core Expertise</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  <span className="text-gray-700">Smart Contract Security</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  <span className="text-gray-700">Fuzzing & Testing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  <span className="text-gray-700">Protocol Security</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  <span className="text-gray-700">Static Analysis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  <span className="text-gray-700">Vulnerability Research</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  <span className="text-gray-700">Open Source Development</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-6">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <div
                  key={index}
                  className="card p-6 text-center hover:scale-105 transition-transform duration-200"
                >
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">
                    {stat.label}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Technologies */}
        <div className="text-center">
          <h3 className="text-2xl font-semibold text-gray-900 mb-8">
            Technologies & Tools
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              'Solidity', 'Rust', 'C++', 'Python', 'Go', 'JavaScript',
              'LLVM', 'AFL', 'Foundry', 'Hardhat', 'Docker', 'Git',
              'Ethereum', 'EVM', 'DeFi', 'Smart Contracts'
            ].map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-primary-100 hover:text-primary-700 transition-colors duration-200"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}