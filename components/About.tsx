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
    <section id="about" className="bg-white py-20">
      <div className="container-max section-padding">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">About Me</h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Passionate about securing the future of decentralized systems through rigorous research
            and development
          </p>
        </div>

        <div className="mb-16 grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Content */}
          <div className="space-y-6">
            <div>
              <h3 className="mb-4 text-2xl font-semibold text-gray-900">
                Security Engineer & Researcher
              </h3>
              <p className="mb-4 leading-relaxed text-gray-600">
                I'm a security engineer at the Ethereum Foundation and an independent security
                researcher with a deep passion for blockchain technology and smart contract
                security. My work focuses on identifying vulnerabilities, developing security tools,
                and contributing to the overall security posture of decentralized systems.
              </p>
              <p className="mb-4 leading-relaxed text-gray-600">
                With over 300 commits to the Solidity compiler and contributions to numerous
                critical projects, I've been at the forefront of blockchain security research. My
                expertise spans fuzzing, static analysis, protocol security, and vulnerability
                discovery.
              </p>
              <p className="leading-relaxed text-gray-600">
                I believe in the power of open-source collaboration and have contributed to projects
                like Google's OSS-Fuzz, various Ethereum clients, and developed specialized security
                tools that are used by the broader blockchain community.
              </p>
            </div>

            <div>
              <h4 className="mb-3 text-lg font-semibold text-gray-900">Core Expertise</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-primary-600"></div>
                  <span className="text-gray-700">Smart Contract Security</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-primary-600"></div>
                  <span className="text-gray-700">Fuzzing & Testing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-primary-600"></div>
                  <span className="text-gray-700">Protocol Security</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-primary-600"></div>
                  <span className="text-gray-700">Static Analysis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-primary-600"></div>
                  <span className="text-gray-700">Vulnerability Research</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-primary-600"></div>
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
                  className="card p-6 text-center transition-transform duration-200 hover:scale-105"
                >
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                    <IconComponent className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="mb-2 text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Technologies */}
        <div className="text-center">
          <h3 className="mb-8 text-2xl font-semibold text-gray-900">Technologies & Tools</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              'Solidity',
              'Rust',
              'C++',
              'Python',
              'Go',
              'JavaScript',
              'LLVM',
              'AFL',
              'Foundry',
              'Hardhat',
              'Docker',
              'Git',
              'Ethereum',
              'EVM',
              'DeFi',
              'Smart Contracts',
            ].map((tech) => (
              <span
                key={tech}
                className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-primary-100 hover:text-primary-700"
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
