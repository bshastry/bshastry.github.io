# Product Context - Bhargava Shastry Portfolio

## Project Overview
A modern, professional portfolio website for Bhargava Shastry, a security engineer at the Ethereum Foundation and independent security researcher. The portfolio showcases his contributions to blockchain security, smart contract auditing, fuzzing tools, and open-source projects.

## Goals
- **Primary**: Create a modern, responsive portfolio website to replace the legacy Jekyll-based site
- **Secondary**: Maintain automated portfolio generation capabilities from GitHub repositories
- **Tertiary**: Ensure easy maintenance and updates for future content changes

## Target Audience
- **Primary**: Potential employers, collaborators, and clients in blockchain/security space
- **Secondary**: Open-source community members and security researchers
- **Tertiary**: Academic institutions and conference organizers

## Key Features
### Current Implementation (Next.js)
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Interactive Components**: Project filtering, smooth scrolling navigation
- **Professional Sections**: Hero, About, Projects, CV, Contact
- **Modern Tech Stack**: Next.js, TypeScript, Tailwind CSS
- **GitHub Pages Ready**: Static site generation for deployment
- **SEO Optimized**: Meta tags, Open Graph, Twitter cards

### Legacy System (Jekyll)
- **Static Generation**: Jekyll-based markdown processing
- **GitHub Pages**: Native Jekyll support
- **Simple Structure**: Markdown files with YAML front matter
- **Basic Styling**: Custom CSS with minimal interactivity

## Technical Architecture
### New System (Next.js)
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS with custom theme
- **Data**: Centralized JSON structure in `data/portfolio.json`
- **Components**: Modular React components in `components/`
- **Deployment**: Static export to `out/` directory for GitHub Pages

### Legacy System (Jekyll)
- **Framework**: Jekyll static site generator
- **Language**: Liquid templating with Markdown
- **Styling**: Custom CSS in `assets/`
- **Data**: Scattered across multiple markdown files
- **Deployment**: Direct GitHub Pages Jekyll processing

## Success Metrics
- **Performance**: Fast loading times, responsive design
- **Maintainability**: Easy content updates via JSON data file
- **Professional Appearance**: Modern design reflecting technical expertise
- **Functionality**: Working contact forms, project filtering, smooth navigation

## Constraints
- **Deployment**: Must work with GitHub Pages static hosting
- **Maintenance**: Should be maintainable by someone with basic web development knowledge
- **Content**: Must preserve all existing portfolio content and structure
- **SEO**: Must maintain or improve search engine optimization

[2025-06-03 14:57:41] - Initial product context created during Next.js migration