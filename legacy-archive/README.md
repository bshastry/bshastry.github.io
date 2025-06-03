# Legacy Jekyll Portfolio Archive

This directory contains the archived files from the original Jekyll-based portfolio website. These files were moved here during the migration to the new Next.js-based system on June 3, 2025.

## Migration Context

The portfolio was migrated from Jekyll (Ruby-based static site generator) to Next.js (React-based framework) for the following reasons:
- Modern development experience with React and TypeScript
- Better performance with static site generation
- Improved maintainability with component-based architecture
- Enhanced styling capabilities with Tailwind CSS
- Simplified content management with JSON data structure

## Archived Files

### Jekyll Configuration and Dependencies
- `_config.yml` - Jekyll site configuration
- `Gemfile` - Ruby dependencies
- `Gemfile.lock` - Locked dependency versions

### Content Pages (Markdown)
- `index.md` - Homepage content
- `about.md` - About page
- `cv.md` - CV/Resume page
- `portfolio.md` - Portfolio showcase
- `blog.md` - Blog page
- `bugs.md` - Bug reports/security research
- `pubs.md` - Publications page
- `tools.md` - Tools and utilities page

### Jekyll Structure
- `_layouts/` - Jekyll layout templates
- `_includes/` - Reusable Jekyll components
- `_posts/` - Blog posts
- `_site/` - Generated Jekyll site (build output)

### Assets and Media
- `assets/` - Stylesheets, images, and other assets
- `media/` - Media files and documents
- `code/` - Code samples and examples

### Backup Files
- `cv.md.backup.*` - Backup copies of CV made during migration
- Various temporary files and crash dumps

### Security and Verification Files
- `D8386407.asc` - GPG public key
- `keybase.txt` - Keybase verification
- `hackerone.txt` - HackerOne verification
- `doc.gpg` - Encrypted document
- Various security research files

## New System

The new Next.js-based portfolio is located in the root directory with the following structure:
- `app/` - Next.js application files
- `components/` - React components
- `data/` - JSON data files
- `memory-bank/` - Documentation and project context

## Restoration

If you need to restore the Jekyll system:
1. Move files back from this archive to the root directory
2. Install Ruby and Jekyll dependencies: `bundle install`
3. Run Jekyll: `bundle exec jekyll serve`
4. Remove or rename the Next.js files to avoid conflicts

## Important Notes

- The Jekyll system is fully functional and can be restored if needed
- All content has been migrated to the new system's JSON format
- The new system provides the same functionality with improved performance
- This archive serves as a complete backup of the original system

## Migration Documentation

For detailed migration information, see:
- `../MIGRATION_GUIDE.md` - Complete migration documentation
- `../ARCHITECTURE.md` - New system architecture
- `../MAINTENANCE_GUIDE.md` - Maintenance instructions
- `../memory-bank/` - Project context and decisions

---

**Archive Created**: June 3, 2025
**Migration Completed**: June 3, 2025
**Original System**: Jekyll 4.x with Ruby
**New System**: Next.js 14.x with TypeScript and Tailwind CSS