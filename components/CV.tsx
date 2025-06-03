'use client'

import { Download, MapPin, Mail, Calendar } from 'lucide-react'
import portfolioData from '@/data/portfolio.json'

export default function CV() {
  const { personal, experience, education, skills } = portfolioData

  return (
    <section id="cv" className="py-20 bg-white">
      <div className="container-max section-padding">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Curriculum Vitae
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Professional experience and qualifications in security engineering and research
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="card p-8 mb-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {personal.name}
              </h1>
              <p className="text-xl text-primary-600 mb-4">
                {personal.title}
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-gray-600">
                <div className="flex items-center space-x-1">
                  <MapPin size={16} />
                  <span>{personal.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Mail size={16} />
                  <span>{personal.email}</span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button className="btn-primary inline-flex items-center space-x-2">
                <Download size={16} />
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          {/* Professional Summary */}
          <div className="card p-8 mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Professional Summary
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {personal.description}
            </p>
          </div>

          {/* Experience */}
          <div className="card p-8 mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">
              Professional Experience
            </h3>
            <div className="space-y-6">
              {experience.map((job, index) => (
                <div key={index} className="border-l-4 border-primary-200 pl-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                    <h4 className="text-xl font-semibold text-gray-900">
                      {job.title}
                    </h4>
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Calendar size={16} />
                      <span>{job.period}</span>
                    </div>
                  </div>
                  <p className="text-primary-600 font-medium mb-3">
                    {job.company}
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    {job.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="card p-8 mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">
              Education
            </h3>
            <div className="space-y-4">
              {education.map((edu, index) => (
                <div key={index} className="border-l-4 border-primary-200 pl-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                    <h4 className="text-xl font-semibold text-gray-900">
                      {edu.degree}
                    </h4>
                    <span className="text-gray-500">{edu.year}</span>
                  </div>
                  <p className="text-primary-600 font-medium mb-2">
                    {edu.institution}
                  </p>
                  <p className="text-gray-600">
                    Focus: {edu.focus}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="card p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">
              Technical Skills
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  Programming Languages
                </h4>
                <div className="flex flex-wrap gap-2">
                  {skills.languages.map((lang) => (
                    <span
                      key={lang}
                      className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  Security Expertise
                </h4>
                <div className="flex flex-wrap gap-2">
                  {skills.security.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  Blockchain & DeFi
                </h4>
                <div className="flex flex-wrap gap-2">
                  {skills.blockchain.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  Tools & Frameworks
                </h4>
                <div className="flex flex-wrap gap-2">
                  {skills.tools.map((tool) => (
                    <span
                      key={tool}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}