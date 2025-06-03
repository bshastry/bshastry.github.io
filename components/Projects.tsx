'use client'

import { useState } from 'react'
import { ExternalLink, Github, Star, GitCommit } from 'lucide-react'
import portfolioData from '@/data/portfolio.json'

export default function Projects() {
  const [filter, setFilter] = useState('all')
  const [showAll, setShowAll] = useState(false)

  const projects = portfolioData.projects
  const featuredProjects = projects.filter(project => project.featured)
  const displayProjects = showAll ? projects : featuredProjects

  const languages = ['all', ...Array.from(new Set(projects.map(project => project.language)))]

  const filteredProjects = filter === 'all'
    ? displayProjects
    : displayProjects.filter(project => project.language === filter)

  const getLanguageColor = (language: string) => {
    const colors: { [key: string]: string } = {
      'C++': 'bg-blue-500',
      'Python': 'bg-yellow-500',
      'Go': 'bg-cyan-500',
      'Rust': 'bg-orange-500',
      'Solidity': 'bg-purple-500',
      'JavaScript': 'bg-yellow-400',
    }
    return colors[language] || 'bg-gray-500'
  }

  return (
    <section id="projects" className="py-20 bg-gray-50">
      <div className="container-max section-padding">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Projects
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A selection of my contributions to open-source projects and security research
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => setFilter(lang)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                filter === lang
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-primary-50 hover:text-primary-600'
              }`}
            >
              {lang === 'all' ? 'All' : lang}
            </button>
          ))}
        </div>

        {/* Show all toggle */}
        <div className="text-center mb-8">
          <button
            onClick={() => setShowAll(!showAll)}
            className="btn-secondary"
          >
            {showAll ? 'Show Featured Only' : 'Show All Projects'}
          </button>
        </div>

        {/* Projects grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <div
              key={project.name}
              className="card p-6 hover:scale-105 transition-transform duration-200 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Project header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {project.name}
                  </h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <span
                      className={`w-3 h-3 rounded-full ${getLanguageColor(project.language)}`}
                    ></span>
                    <span className="text-sm text-gray-600">{project.language}</span>
                  </div>
                </div>
                {project.featured && (
                  <div className="flex items-center space-x-1 text-yellow-500">
                    <Star size={16} fill="currentColor" />
                  </div>
                )}
              </div>

              {/* Project description */}
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {project.description}
              </p>

              {/* Project stats */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-1 text-gray-500">
                  <GitCommit size={16} />
                  <span className="text-sm">{project.commits} commits</span>
                </div>
              </div>

              {/* Project links */}
              <div className="flex items-center space-x-3">
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition-colors duration-200"
                >
                  <Github size={16} />
                  <span className="text-sm">View Code</span>
                </a>
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition-colors duration-200"
                >
                  <ExternalLink size={16} />
                  <span className="text-sm">Live Project</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* No projects message */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No projects found for the selected filter.</p>
          </div>
        )}

        {/* Summary stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {projects.length}
            </div>
            <div className="text-gray-600">Total Projects</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {projects.reduce((sum, project) => sum + project.commits, 0)}
            </div>
            <div className="text-gray-600">Total Commits</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {languages.length - 1}
            </div>
            <div className="text-gray-600">Languages Used</div>
          </div>
        </div>
      </div>
    </section>
  )
}