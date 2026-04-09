'use client'

import { Download, MapPin, Mail, Calendar } from 'lucide-react'
import portfolioData from '@/data/portfolio.json'

export default function CV() {
  const { personal, experience, education, skills } = portfolioData

  const handleDownloadPDF = () => {
    // Create a new window with just the CV content for printing
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const cvContent = document.getElementById('cv-content')
    if (!cvContent) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${personal.name} - CV</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 25px; }
            .section h3 { color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; }
            .job, .edu { margin-bottom: 15px; padding-left: 15px; border-left: 3px solid #ddd; }
            .skills { display: flex; flex-wrap: wrap; gap: 8px; }
            .skill { background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          ${cvContent.innerHTML}
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.focus()

    // Wait for content to load then trigger print dialog
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  return (
    <section id="cv" className="bg-white py-20">
      <div className="container-max section-padding">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Curriculum Vitae</h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Professional experience and qualifications in security engineering and research
          </p>
        </div>

        <div className="mx-auto max-w-4xl" id="cv-content">
          {/* Header */}
          <div className="card mb-8 p-8">
            <div className="mb-6 text-center">
              <h1 className="mb-2 text-3xl font-bold text-gray-900">{personal.name}</h1>
              <p className="mb-4 text-xl text-primary-600">{personal.title}</p>
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
              <button
                onClick={handleDownloadPDF}
                className="btn-primary inline-flex items-center space-x-2"
              >
                <Download size={16} />
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          {/* Professional Summary */}
          <div className="card mb-8 p-8">
            <h3 className="mb-4 text-2xl font-semibold text-gray-900">Professional Summary</h3>
            <p className="leading-relaxed text-gray-600">{personal.description}</p>
          </div>

          {/* Experience */}
          <div className="card mb-8 p-8">
            <h3 className="mb-6 text-2xl font-semibold text-gray-900">Professional Experience</h3>
            <div className="space-y-6">
              {experience.map((job, index) => (
                <div key={index} className="border-l-4 border-primary-200 pl-6">
                  <div className="mb-2 flex flex-col md:flex-row md:items-center md:justify-between">
                    <h4 className="text-xl font-semibold text-gray-900">{job.title}</h4>
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Calendar size={16} />
                      <span>{job.period}</span>
                    </div>
                  </div>
                  <p className="mb-3 font-medium text-primary-600">{job.company}</p>
                  <p className="leading-relaxed text-gray-600">{job.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="card mb-8 p-8">
            <h3 className="mb-6 text-2xl font-semibold text-gray-900">Education</h3>
            <div className="space-y-4">
              {education.map((edu, index) => (
                <div key={index} className="border-l-4 border-primary-200 pl-6">
                  <div className="mb-2 flex flex-col md:flex-row md:items-center md:justify-between">
                    <h4 className="text-xl font-semibold text-gray-900">{edu.degree}</h4>
                    <span className="text-gray-500">{edu.year}</span>
                  </div>
                  <p className="mb-2 font-medium text-primary-600">{edu.institution}</p>
                  <p className="text-gray-600">Focus: {edu.focus}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="card p-8">
            <h3 className="mb-6 text-2xl font-semibold text-gray-900">Technical Skills</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h4 className="mb-3 text-lg font-semibold text-gray-900">Programming Languages</h4>
                <div className="flex flex-wrap gap-2">
                  {skills.languages.map((lang) => (
                    <span
                      key={lang}
                      className="rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-lg font-semibold text-gray-900">Security Expertise</h4>
                <div className="flex flex-wrap gap-2">
                  {skills.security.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-lg font-semibold text-gray-900">Blockchain & DeFi</h4>
                <div className="flex flex-wrap gap-2">
                  {skills.blockchain.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-lg font-semibold text-gray-900">Tools & Frameworks</h4>
                <div className="flex flex-wrap gap-2">
                  {skills.tools.map((tool) => (
                    <span
                      key={tool}
                      className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700"
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
