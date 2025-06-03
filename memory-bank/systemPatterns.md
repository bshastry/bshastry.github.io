# System Patterns - Portfolio Architecture

## Architectural Patterns

### Component-Based Architecture (Next.js)
**Pattern**: Modular React components with single responsibility
**Implementation**:
- Each section (Hero, About, Projects, CV, Contact) as separate component
- Shared styling patterns through Tailwind CSS classes
- Props-based data flow from centralized JSON source

**Benefits**:
- Easy maintenance and updates
- Reusable component patterns
- Clear separation of concerns
- Type safety with TypeScript

### Data-Driven Content Management
**Pattern**: Centralized JSON data structure driving all content
**Implementation**:
- `data/portfolio.json` contains all portfolio information
- Components consume data through props
- Easy content updates without code changes

**Benefits**:
- Non-technical content updates
- Consistent data structure
- Single source of truth
- Automated portfolio generation compatibility

### Static Site Generation (SSG)
**Pattern**: Pre-rendered static files for optimal performance
**Implementation**:
- Next.js static export to `out/` directory
- No server-side rendering requirements
- GitHub Pages compatible deployment

**Benefits**:
- Fast loading times
- CDN-friendly
- High availability
- Cost-effective hosting

### Responsive Design Pattern
**Pattern**: Mobile-first responsive design with Tailwind CSS
**Implementation**:
- Utility-first CSS approach
- Breakpoint-based responsive classes
- Consistent spacing and typography scales

**Benefits**:
- Consistent cross-device experience
- Maintainable styling system
- Rapid development workflow

## Legacy System Patterns (Jekyll)

### File-Based Content Management
**Pattern**: Individual markdown files for each page/post
**Implementation**:
- `index.md`, `about.md`, `cv.md`, etc.
- YAML front matter for metadata
- Liquid templating for dynamic content

**Limitations**:
- Scattered content across multiple files
- Manual content synchronization required
- Limited interactivity options

### Template-Based Rendering
**Pattern**: Liquid templates with layout inheritance
**Implementation**:
- `_layouts/` directory for page templates
- `_includes/` for reusable components
- YAML configuration in `_config.yml`

**Limitations**:
- Limited component reusability
- Complex template logic for dynamic features
- Difficult to maintain consistent styling

## Migration Patterns

### Gradual Migration Strategy
**Pattern**: Incremental replacement of legacy components
**Implementation**:
1. Set up new Next.js structure alongside legacy files
2. Migrate content to centralized JSON format
3. Build and test new components
4. Archive legacy files after verification

### Content Transformation Pattern
**Pattern**: Automated conversion from markdown to JSON
**Implementation**:
- Extract structured data from markdown files
- Transform to consistent JSON schema
- Preserve all original content and metadata

### Deployment Transition Pattern
**Pattern**: Blue-green deployment approach
**Implementation**:
1. Build new system in parallel
2. Test thoroughly in development
3. Generate static files for production
4. Switch deployment source atomically

## Future Enhancement Patterns

### Automated Content Updates
**Pattern**: GitHub Actions for portfolio regeneration
**Implementation**:
- Trigger on repository changes
- Run portfolio updater script
- Commit updated JSON data
- Rebuild and deploy automatically

### Progressive Enhancement
**Pattern**: Layer interactive features on solid foundation
**Implementation**:
- Core content accessible without JavaScript
- Enhanced UX with client-side interactions
- Graceful degradation for older browsers

### Modular Extension System
**Pattern**: Plugin-like architecture for new features
**Implementation**:
- Component-based feature additions
- Configuration-driven feature toggles
- Minimal impact on core system

[2025-06-03 14:58:42] - System patterns documented during Next.js migration