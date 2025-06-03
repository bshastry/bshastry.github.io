# Portfolio Migration Guide: Jekyll to Next.js

## Overview
This guide documents the complete migration from a Jekyll-based portfolio website to a modern Next.js application with Tailwind CSS. The migration preserves all existing content while providing enhanced functionality, better performance, and improved maintainability.

## Table of Contents
1. [Migration Summary](#migration-summary)
2. [System Comparison](#system-comparison)
3. [Prerequisites](#prerequisites)
4. [Migration Steps](#migration-steps)
5. [Content Transformation](#content-transformation)
6. [File Structure Changes](#file-structure-changes)
7. [Deployment Changes](#deployment-changes)
8. [Testing and Verification](#testing-and-verification)
9. [Rollback Procedures](#rollback-procedures)
10. [Post-Migration Tasks](#post-migration-tasks)

## Migration Summary

### What Changed
- **Framework**: Jekyll → Next.js 14 with App Router
- **Language**: Liquid templates → TypeScript + React
- **Styling**: Custom CSS → Tailwind CSS
- **Content**: Multiple markdown files → Centralized JSON data
- **Build Process**: Jekyll build → Next.js static export
- **Deployment**: Direct Jekyll → Static file deployment

### What Stayed the Same
- **Hosting**: GitHub Pages (static files)
- **Domain**: Same GitHub Pages URL
- **Content**: All portfolio information preserved
- **SEO**: Meta tags and optimization maintained
- **Functionality**: All features preserved and enhanced

## System Comparison

### Legacy System (Jekyll)
```
Portfolio Structure:
├── _config.yml          # Jekyll configuration
├── _layouts/            # Page templates
├── _includes/           # Reusable components
├── _posts/              # Blog posts
├── assets/              # CSS, images, JS
├── index.md             # Homepage content
├── about.md             # About page content
├── cv.md                # CV page content
├── portfolio.md         # Portfolio page content
└── _site/               # Generated site (ignored)
```

**Characteristics**:
- File-based content management
- Liquid templating engine
- YAML front matter for metadata
- Limited interactivity
- GitHub Pages native support

### New System (Next.js)
```
Portfolio Structure:
├── package.json         # Node.js dependencies
├── next.config.js       # Next.js configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
├── app/                 # Next.js App Router
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Homepage
│   └── globals.css      # Global styles
├── components/          # React components
│   ├── Header.tsx       # Navigation header
│   ├── Hero.tsx         # Hero section
│   ├── About.tsx        # About section
│   ├── Projects.tsx     # Projects showcase
│   ├── CV.tsx           # CV section
│   ├── Contact.tsx      # Contact form
│   └── Footer.tsx       # Site footer
├── data/                # Content data
│   └── portfolio.json   # Centralized portfolio data
├── memory-bank/         # Documentation
└── out/                 # Static export (generated)
```

**Characteristics**:
- Component-based architecture
- TypeScript for type safety
- Centralized JSON data management
- Rich interactivity capabilities
- Static site generation

## Prerequisites

### Development Environment
- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (comes with Node.js)
- **Git**: For version control
- **Code Editor**: VS Code recommended with extensions:
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets

### Knowledge Requirements
- Basic understanding of React components
- Familiarity with JSON data structures
- Basic command line usage
- Understanding of Git workflows

## Migration Steps

### Step 1: Environment Setup
```bash
# Navigate to your portfolio directory
cd path/to/bshastry.github.io

# Verify Node.js installation
node --version  # Should be 18.0+
npm --version   # Should be 8.0+

# Install dependencies (already done if following this guide)
npm install
```

### Step 2: Content Analysis and Backup
```bash
# Create backup of legacy system
mkdir -p legacy-backup
cp -r _layouts _includes _posts assets *.md _config.yml legacy-backup/

# Analyze existing content structure
ls -la *.md  # List all markdown files
cat _config.yml  # Review Jekyll configuration
```

### Step 3: Content Transformation
The migration involves transforming content from multiple markdown files into a centralized JSON structure:

#### Original Content Sources:
- `index.md` → Hero section data
- `about.md` → About section data
- `cv.md` → Professional experience data
- `portfolio.md` → Projects data
- `_config.yml` → Site metadata

#### Target JSON Structure:
```json
{
  "personal": {
    "name": "Bhargava Shastry",
    "title": "Security Engineer & Researcher",
    "location": "Remote",
    "email": "contact@bhargavashastry.com"
  },
  "experience": [...],
  "education": [...],
  "skills": [...],
  "projects": [...],
  "social": {...}
}
```

### Step 4: Component Development
Each section of the portfolio is implemented as a React component:

1. **Header.tsx**: Navigation with smooth scrolling
2. **Hero.tsx**: Landing section with key highlights
3. **About.tsx**: Professional summary and statistics
4. **Projects.tsx**: Interactive project showcase with filtering
5. **CV.tsx**: Professional experience and education
6. **Contact.tsx**: Contact form and social media links
7. **Footer.tsx**: Site footer with additional links

### Step 5: Styling Migration
Transform custom CSS to Tailwind CSS utility classes:

#### Legacy CSS Pattern:
```css
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 4rem 2rem;
  text-align: center;
}
```

#### New Tailwind Pattern:
```tsx
<section className="bg-gradient-to-br from-blue-600 to-purple-600 py-16 px-8 text-center">
```

### Step 6: Build Configuration
Configure Next.js for static site generation:

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
```

### Step 7: Development Testing
```bash
# Start development server
npm run dev

# Open browser to http://localhost:3000
# Test all sections and functionality
# Verify responsive design on different screen sizes
```

### Step 8: Production Build
```bash
# Build for production
npm run build

# Verify build output
ls -la out/  # Should contain index.html and assets
```

## Content Transformation

### Markdown to JSON Conversion

#### Example: About Section
**Legacy (about.md)**:
```markdown
---
layout: page
title: About
---

# About Me

I'm a security engineer at the Ethereum Foundation...

## Skills
- Smart Contract Security
- Fuzzing & Testing
- Protocol Security
```

**New (portfolio.json)**:
```json
{
  "about": {
    "title": "About Me",
    "description": "I'm a security engineer at the Ethereum Foundation...",
    "skills": [
      "Smart Contract Security",
      "Fuzzing & Testing",
      "Protocol Security"
    ]
  }
}
```

### Project Data Transformation
**Legacy**: Scattered across multiple files and manual updates
**New**: Centralized with automated commit counting

```json
{
  "projects": [
    {
      "name": "solidity",
      "language": "C++",
      "description": "The Solidity Contract-Oriented Programming Language",
      "commits": 303,
      "github": "https://github.com/ethereum/solidity",
      "featured": true
    }
  ]
}
```

## File Structure Changes

### Files to Archive
Move these legacy Jekyll files to `legacy-archive/`:
- `_config.yml`
- `_layouts/`
- `_includes/`
- `_posts/`
- `assets/`
- `*.md` files (index.md, about.md, cv.md, etc.)
- `Gemfile` and `Gemfile.lock`

### New Files Added
- `package.json` - Node.js dependencies
- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `app/` - Next.js application code
- `components/` - React components
- `data/portfolio.json` - Centralized content data
- `memory-bank/` - Documentation and context

### Files to Keep
- `README.md` - Update with new instructions
- `.gitignore` - Update for Node.js/Next.js
- Domain-specific files (CNAME, etc.)
- Static assets (PDFs, images) that are still referenced

## Deployment Changes

### Legacy Deployment (Jekyll)
1. Push markdown files to GitHub
2. GitHub Pages automatically builds with Jekyll
3. Site available at username.github.io

### New Deployment (Next.js)
1. Build static files locally: `npm run build`
2. Static files generated in `out/` directory
3. Deploy `out/` contents to GitHub Pages
4. Site available at same URL

### Deployment Script
```bash
#!/bin/bash
# deploy.sh - Automated deployment script

echo "Building Next.js application..."
npm run build

echo "Preparing deployment..."
# Copy static files to root or deploy to gh-pages branch
# (Implementation depends on your preferred deployment method)

echo "Deployment complete!"
```

## Testing and Verification

### Pre-Migration Checklist
- [ ] All content identified and catalogued
- [ ] Development environment set up
- [ ] Dependencies installed successfully
- [ ] Legacy system backed up

### Post-Migration Verification
- [ ] All pages load correctly
- [ ] Navigation works smoothly
- [ ] Interactive features function (project filtering)
- [ ] Contact form works (mailto links)
- [ ] Responsive design on mobile devices
- [ ] All external links work
- [ ] SEO meta tags present
- [ ] Performance is acceptable

### Testing Commands
```bash
# Development testing
npm run dev
# Visit http://localhost:3000

# Production build testing
npm run build
# Open out/index.html in browser

# Lint and type checking
npm run lint
npx tsc --noEmit
```

## Rollback Procedures

### If Migration Fails
1. **Immediate Rollback**:
   ```bash
   # Restore legacy files from backup
   cp -r legacy-backup/* .

   # Remove Next.js files
   rm -rf node_modules package*.json next.config.js
   rm -rf app components data out

   # Commit rollback
   git add .
   git commit -m "Rollback to Jekyll system"
   git push
   ```

2. **Partial Rollback**:
   - Keep Next.js system for development
   - Deploy legacy system temporarily
   - Fix issues and re-attempt migration

### Rollback Verification
- [ ] Legacy site loads correctly
- [ ] All content is accessible
- [ ] GitHub Pages deployment works
- [ ] No broken links or missing content

## Post-Migration Tasks

### Immediate Tasks
1. **Update Documentation**:
   - Update README.md with new build instructions
   - Document new development workflow
   - Create maintenance guide

2. **Set Up Monitoring**:
   - Monitor site performance
   - Check for broken links
   - Verify SEO rankings maintained

3. **Team Communication**:
   - Notify team of new development process
   - Provide training on new system
   - Update deployment procedures

### Long-term Tasks
1. **Automation**:
   - Set up GitHub Actions for automated deployment
   - Integrate portfolio updater with new JSON format
   - Implement automated testing

2. **Enhancements**:
   - Add analytics tracking
   - Implement advanced SEO features
   - Consider CMS integration for easier content management

3. **Maintenance**:
   - Regular dependency updates
   - Performance monitoring and optimization
   - Content updates and improvements

## Troubleshooting

### Common Issues

#### Build Failures
**Problem**: TypeScript compilation errors
**Solution**: Check type definitions and fix type mismatches

**Problem**: Tailwind CSS not working
**Solution**: Verify PostCSS configuration and Tailwind imports

#### Deployment Issues
**Problem**: Static files not loading correctly
**Solution**: Check asset paths and Next.js configuration

**Problem**: GitHub Pages not updating
**Solution**: Verify deployment process and file permissions

#### Content Issues
**Problem**: Missing content after migration
**Solution**: Compare with legacy backup and update JSON data

**Problem**: Broken links or images
**Solution**: Update asset paths for new file structure

### Getting Help
- Check Next.js documentation: https://nextjs.org/docs
- Tailwind CSS documentation: https://tailwindcss.com/docs
- GitHub Pages documentation: https://docs.github.com/pages
- React documentation: https://react.dev

## Conclusion

This migration transforms a static Jekyll portfolio into a modern, interactive Next.js application while preserving all existing content and functionality. The new system provides:

- **Better Developer Experience**: Modern tooling and development workflow
- **Enhanced User Experience**: Interactive features and improved performance
- **Easier Maintenance**: Centralized content management and component architecture
- **Future-Proof Technology**: Modern React ecosystem with active community support

The migration process, while comprehensive, results in a significantly improved portfolio website that will be easier to maintain and extend in the future.

---

**Migration completed**: June 3, 2025
**System version**: Next.js 14.2.3, React 18, Tailwind CSS 3.4.1
**Compatibility**: Modern browsers, GitHub Pages static hosting