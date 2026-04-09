# Portfolio Maintenance Guide

## Introduction

This guide is designed for developers who need to maintain, update, or enhance Bhargava Shastry's portfolio website. Whether you're new to web development or experienced with different technologies, this guide will help you understand and work with the Next.js-based portfolio system.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Understanding the System](#understanding-the-system)
3. [Common Maintenance Tasks](#common-maintenance-tasks)
4. [Content Updates](#content-updates)
5. [Code Changes](#code-changes)
6. [Deployment Process](#deployment-process)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)
9. [Resources and Learning](#resources-and-learning)

## Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **Code Editor** - VS Code recommended ([Download here](https://code.visualstudio.com/))
- **GitHub Account** - For accessing the repository

### Initial Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/bshastry/bshastry.github.io.git
   cd bshastry.github.io
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Start development server**:

   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Visit `http://localhost:3000` to see the site running locally.

### Development Environment

- **Hot Reload**: Changes to code automatically refresh the browser
- **Error Display**: Errors show directly in the browser during development
- **Console Logs**: Check browser developer tools for debugging information

## Understanding the System

### What is Next.js?

Next.js is a React framework that makes building websites easier. Think of it as:

- **React**: A library for building user interfaces with components
- **Next.js**: Adds features like automatic optimization and easy deployment
- **Static Site**: The final website is just HTML, CSS, and JavaScript files

### Key Concepts

#### Components

Components are reusable pieces of the website. Each section (Header, About, Projects, etc.) is a separate component:

```
Header.tsx    → Navigation bar at the top
Hero.tsx      → Main banner with name and highlights
About.tsx     → Professional summary section
Projects.tsx  → Project showcase with filtering
CV.tsx        → Resume/experience section
Contact.tsx   → Contact information and form
Footer.tsx    → Bottom section with links
```

#### Data-Driven Content

All content comes from one file: `data/portfolio.json`. This means:

- ✅ Easy to update content without touching code
- ✅ Consistent data structure
- ✅ Can be automated with scripts

#### TypeScript

TypeScript adds type checking to JavaScript:

- Catches errors before they reach users
- Provides better code completion in editors
- Makes code more reliable and maintainable

## Common Maintenance Tasks

### 1. Updating Personal Information

**File**: `data/portfolio.json`
**Section**: `personal`

```json
{
  "personal": {
    "name": "Bhargava Shastry",
    "title": "Senior Security Researcher",
    "location": "Berlin, Germany",
    "email": "bhargava.shastry@gmail.com"
  }
}
```

**Steps**:

1. Open `data/portfolio.json`
2. Find the `personal` section
3. Update the relevant fields
4. Save the file
5. The website will automatically update

### 2. Adding New Projects

**File**: `data/portfolio.json`
**Section**: `projects`

```json
{
  "projects": [
    {
      "name": "New Project Name",
      "language": "Python",
      "description": "Brief description of what this project does",
      "commits": 150,
      "github": "https://github.com/bshastry/project-name",
      "website": "https://project-demo.com",
      "featured": true,
      "tags": ["security", "automation", "testing"]
    }
  ]
}
```

**Steps**:

1. Open `data/portfolio.json`
2. Find the `projects` array
3. Add a new project object with all required fields
4. Set `featured: true` for important projects
5. Save and test

### 3. Updating Work Experience

**File**: `data/portfolio.json`
**Section**: `experience`

```json
{
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "location": "City, Country",
      "startDate": "2023-01",
      "endDate": "Present",
      "description": "Brief description of role and responsibilities",
      "achievements": ["Key achievement 1", "Key achievement 2"]
    }
  ]
}
```

**Steps**:

1. Open `data/portfolio.json`
2. Find the `experience` array
3. Add new experience at the beginning (most recent first)
4. Use "Present" for current positions
5. Include 2-4 key achievements

### 4. Updating Skills and Technologies

**File**: `data/portfolio.json`
**Section**: `skills`

```json
{
  "skills": {
    "languages": ["Python", "C++", "JavaScript", "TypeScript"],
    "frameworks": ["React", "Next.js", "Django", "Flask"],
    "tools": ["Git", "Docker", "VS Code", "Linux"],
    "specializations": ["Security Research", "Fuzzing", "Static Analysis"]
  }
}
```

### 5. Updating Statistics

**File**: `data/portfolio.json`
**Section**: `about.stats`

```json
{
  "about": {
    "stats": [
      {
        "label": "Years Experience",
        "value": "8+",
        "icon": "👨‍💻"
      },
      {
        "label": "Projects Completed",
        "value": "50+",
        "icon": "🚀"
      }
    ]
  }
}
```

## Content Updates

### Adding New Sections

If you need to add entirely new sections:

1. **Create the component** (e.g., `components/NewSection.tsx`):

```tsx
interface NewSectionProps {
  data: any // Define proper type based on your data
}

export default function NewSection({ data }: NewSectionProps) {
  return (
    <section className="px-8 py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-8 text-3xl font-bold">{data.title}</h2>
        {/* Your content here */}
      </div>
    </section>
  )
}
```

2. **Add data to portfolio.json**:

```json
{
  "newSection": {
    "title": "New Section Title",
    "content": "Your content here"
  }
}
```

3. **Import and use in page.tsx**:

```tsx
import NewSection from '../components/NewSection'

// In the component:
;<NewSection data={portfolioData.newSection} />
```

### Modifying Existing Sections

To change how sections look or behave:

1. **Find the component file** (e.g., `components/About.tsx`)
2. **Modify the JSX structure** for layout changes
3. **Update CSS classes** for styling changes
4. **Test your changes** with `npm run dev`

### Content Guidelines

- **Keep descriptions concise**: 1-2 sentences for project descriptions
- **Use action words**: "Developed", "Implemented", "Designed"
- **Include metrics**: Numbers make achievements more impactful
- **Stay current**: Remove outdated projects and technologies
- **Maintain consistency**: Use similar formatting across sections

## Code Changes

### Understanding the File Structure

```
bshastry.github.io/
├── app/                    # Next.js app structure
│   ├── layout.tsx         # Overall page layout
│   ├── page.tsx           # Main homepage
│   └── globals.css        # Global styles
├── components/            # Individual section components
├── data/                  # Content data (JSON)
├── out/                   # Built website (don't edit)
└── package.json           # Dependencies and scripts
```

### Making Style Changes

The website uses **Tailwind CSS** for styling. Common classes:

```css
/* Layout */
flex, grid, container, mx-auto

/* Spacing */
p-4 (padding), m-4 (margin), gap-4 (grid gap)

/* Colors */
bg-blue-600 (background), text-white (text color)

/* Typography */
text-xl (size), font-bold (weight), text-center (alignment)

/* Responsive */
md:text-2xl (medium screens and up)
lg:grid-cols-3 (large screens and up)
```

**Example**: Making text larger on mobile

```tsx
// Before
<h1 className="text-2xl font-bold">Title</h1>

// After (larger on mobile, even larger on desktop)
<h1 className="text-3xl md:text-4xl font-bold">Title</h1>
```

### Adding Interactive Features

For simple interactions, use React state:

```tsx
import { useState } from 'react'

export default function InteractiveComponent() {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="rounded bg-blue-600 px-4 py-2 text-white"
      >
        Toggle Content
      </button>
      {isVisible && (
        <div className="mt-4">
          <p>This content can be toggled!</p>
        </div>
      )}
    </div>
  )
}
```

### Common Code Patterns

#### Mapping Over Data

```tsx
{
  projects.map((project, index) => (
    <div key={index} className="project-card">
      <h3>{project.name}</h3>
      <p>{project.description}</p>
    </div>
  ))
}
```

#### Conditional Rendering

```tsx
{
  project.website && (
    <a href={project.website} className="btn">
      View Website
    </a>
  )
}
```

#### Responsive Design

```tsx
<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
  {/* Content adapts to screen size */}
</div>
```

## Deployment Process

### Building for Production

1. **Test locally**:

   ```bash
   npm run dev
   # Check everything works at http://localhost:3000
   ```

2. **Build the site**:

   ```bash
   npm run build
   ```

3. **Test the build**:
   ```bash
   npm run start
   # Check the production build works
   ```

### Deploying to GitHub Pages

The site is hosted on GitHub Pages. To deploy:

1. **Commit your changes**:

   ```bash
   git add .
   git commit -m "Update portfolio content"
   ```

2. **Push to GitHub**:

   ```bash
   git push origin main
   ```

3. **Deploy** (if not automated):
   ```bash
   npm run build
   # Upload contents of 'out/' folder to GitHub Pages
   ```

### Automated Deployment

If GitHub Actions is set up, deployment happens automatically when you push to the main branch.

## Troubleshooting

### Common Issues and Solutions

#### 1. "npm install" fails

**Problem**: Dependencies won't install
**Solutions**:

- Delete `node_modules` folder and `package-lock.json`
- Run `npm install` again
- Check Node.js version (should be 18+)

#### 2. TypeScript errors

**Problem**: Red squiggly lines in code editor
**Solutions**:

- Check the error message carefully
- Ensure data types match what's expected
- Look for typos in property names

#### 3. Build fails

**Problem**: `npm run build` shows errors
**Solutions**:

- Fix any TypeScript errors first
- Check that all imported files exist
- Ensure JSON syntax is valid

#### 4. Styles not applying

**Problem**: CSS changes don't show up
**Solutions**:

- Check Tailwind class names are correct
- Clear browser cache (Ctrl+F5)
- Restart development server

#### 5. Data not showing

**Problem**: Content from JSON doesn't appear
**Solutions**:

- Check JSON syntax with a validator
- Ensure property names match component expectations
- Check browser console for errors

### Debugging Tips

1. **Use browser developer tools**: F12 to open, check Console tab for errors
2. **Check the terminal**: Look for error messages when running `npm run dev`
3. **Validate JSON**: Use [jsonlint.com](https://jsonlint.com/) to check JSON syntax
4. **Test incrementally**: Make small changes and test frequently

## Best Practices

### Code Organization

- **One component per file**: Keep components focused and manageable
- **Consistent naming**: Use PascalCase for components, camelCase for variables
- **Comment complex logic**: Help future maintainers understand your code
- **Keep components small**: Break large components into smaller ones

### Content Management

- **Regular updates**: Keep content current and relevant
- **Backup before changes**: Commit to Git before major updates
- **Test thoroughly**: Check all sections after content updates
- **Optimize images**: Compress images before adding them

### Performance

- **Minimize bundle size**: Only import what you need
- **Optimize images**: Use appropriate formats and sizes
- **Test on mobile**: Ensure good performance on slower devices
- **Monitor build size**: Keep an eye on the `out/` folder size

### Security

- **Keep dependencies updated**: Run `npm audit` regularly
- **Don't commit secrets**: Never put API keys in the code
- **Validate external links**: Ensure links are safe and working
- **Review changes**: Double-check before deploying

## Resources and Learning

### Essential Documentation

- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)
- **React**: [react.dev](https://react.dev/)
- **Tailwind CSS**: [tailwindcss.com/docs](https://tailwindcss.com/docs)
- **TypeScript**: [typescriptlang.org/docs](https://www.typescriptlang.org/docs/)

### Learning Resources

- **React Tutorial**: [react.dev/learn](https://react.dev/learn)
- **Next.js Tutorial**: [nextjs.org/learn](https://nextjs.org/learn)
- **Tailwind CSS Tutorial**: [tailwindcss.com/docs/utility-first](https://tailwindcss.com/docs/utility-first)
- **TypeScript Handbook**: [typescriptlang.org/docs/handbook](https://www.typescriptlang.org/docs/handbook/)

### Tools and Extensions (VS Code)

- **ES7+ React/Redux/React-Native snippets**: Quick component templates
- **Tailwind CSS IntelliSense**: Auto-completion for CSS classes
- **TypeScript Importer**: Automatic import statements
- **Prettier**: Code formatting
- **GitLens**: Enhanced Git integration

### Community and Support

- **Stack Overflow**: [stackoverflow.com](https://stackoverflow.com/) - For specific coding questions
- **GitHub Discussions**: Check the Next.js and React repositories
- **Discord Communities**: React and Next.js have active Discord servers
- **YouTube**: Many tutorials available for visual learners

## Quick Reference

### Common Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Preview production build
npm run lint         # Check code quality

# Git
git status           # Check what files changed
git add .            # Stage all changes
git commit -m "msg"  # Commit with message
git push             # Push to GitHub

# Troubleshooting
npm install          # Install dependencies
rm -rf node_modules  # Delete dependencies (then reinstall)
npm audit            # Check for security issues
```

### File Quick Access

- **Content**: `data/portfolio.json`
- **Styles**: `app/globals.css`
- **Components**: `components/[SectionName].tsx`
- **Main Page**: `app/page.tsx`
- **Configuration**: `next.config.js`, `tailwind.config.js`

### Emergency Contacts

If you're stuck and need help:

1. **Check this guide first**
2. **Search the error message online**
3. **Ask on Stack Overflow** with specific error details
4. **Contact the original developer** if available

## Conclusion

This portfolio system is designed to be maintainable and extensible. The key principles to remember:

1. **Content lives in JSON** - Most updates only require editing `portfolio.json`
2. **Components are modular** - Each section is independent and reusable
3. **Styles use Tailwind** - Utility classes make styling predictable
4. **TypeScript helps catch errors** - Pay attention to type warnings
5. **Test frequently** - Use the development server to verify changes

With these fundamentals, you should be able to maintain and enhance the portfolio effectively. Remember: start small, test often, and don't hesitate to refer back to this guide when needed.

---

**Guide Version**: 1.0
**Last Updated**: June 3, 2025
**For Questions**: Refer to the Resources section above
