# GitHub Pages Deployment Guide for Next.js Portfolio

This comprehensive guide addresses the specific requirements and configurations needed to deploy a Next.js application to GitHub Pages, including the critical configuration corrections needed for proper deployment.

## Table of Contents

1. [Understanding GitHub Pages Limitations](#understanding-github-pages-limitations)
2. [Critical Configuration Issues](#critical-configuration-issues)
3. [Deployment Methods](#deployment-methods)
4. [Step-by-Step Deployment](#step-by-step-deployment)
5. [Troubleshooting Common Issues](#troubleshooting-common-issues)
6. [Alternative Deployment Options](#alternative-deployment-options)

---

## Understanding GitHub Pages Limitations

### What GitHub Pages Supports

GitHub Pages is designed primarily for **static websites** and has the following characteristics:

1. **Static File Hosting**: Serves pre-built HTML, CSS, JavaScript, and assets
2. **Jekyll Native Support**: Built-in Jekyll processing for `.md` files
3. **Custom Domain Support**: Can use custom domains with HTTPS
4. **Free Hosting**: No cost for public repositories

### What GitHub Pages Does NOT Support

1. **Server-Side Rendering (SSR)**: No Node.js runtime
2. **API Routes**: No backend processing capabilities
3. **Dynamic Content Generation**: No real-time data processing
4. **Database Connections**: No persistent storage beyond static files

### Next.js Compatibility

Next.js can work with GitHub Pages **only** when configured for **Static Site Generation (SSG)**:

- Uses `output: 'export'` in [`next.config.js`](next.config.js:3)
- Generates static HTML files during build
- No server-side features available

---

## Critical Configuration Issues

### Current Configuration Problem

The current [`next.config.js`](next.config.js:8-9) has incorrect path settings:

```javascript
// ❌ INCORRECT - This is wrong for username.github.io repositories
assetPrefix: process.env.NODE_ENV === 'production' ? '/bshastry.github.io' : '',
basePath: process.env.NODE_ENV === 'production' ? '/bshastry.github.io' : '',
```

### Why This Is Wrong

For **username.github.io** repositories (like `bshastry.github.io`):

- The site is served from the **root domain**: `https://bshastry.github.io`
- **No subdirectory** is used in the URL
- Adding `/bshastry.github.io` creates incorrect paths like: `https://bshastry.github.io/bshastry.github.io/`

### Correct Configuration

<apply_diff>
<path>next.config.js</path>
<diff>
<<<<<<< SEARCH
:start_line:8

---

assetPrefix: process.env.NODE_ENV === 'production' ? '/bshastry.github.io' : '',
basePath: process.env.NODE_ENV === 'production' ? '/bshastry.github.io' : '',
=======
// For username.github.io repositories, no basePath or assetPrefix needed
// The site is served from the root domain

> > > > > > > REPLACE
> > > > > > > </diff>
> > > > > > > </apply_diff>

---

## Deployment Methods

### Method 1: GitHub Actions (Recommended)

**Advantages**:

- Automated deployment on every push
- Consistent build environment
- No manual build steps required
- Proper error handling and logging

**Disadvantages**:

- Requires GitHub Actions setup
- Slightly more complex initial configuration

### Method 2: Manual Build and Push

**Advantages**:

- Simple and direct
- Full control over deployment timing
- No additional configuration needed

**Disadvantages**:

- Manual process for every update
- Risk of forgetting build steps
- No automated testing

### Method 3: GitHub Pages Source Branch

**Advantages**:

- Uses GitHub's built-in deployment
- Simple repository settings

**Disadvantages**:

- Requires separate branch management
- Manual build process still needed

---

## Step-by-Step Deployment

### Option A: GitHub Actions Deployment (Recommended)

#### Step 1: Fix Next.js Configuration

The configuration has already been corrected above. Verify your [`next.config.js`](next.config.js) looks like this:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // For username.github.io repositories, no basePath or assetPrefix needed
  // The site is served from the root domain
}

module.exports = nextConfig
```

#### Step 2: Create GitHub Actions Workflow

Create the workflow directory and file:

```bash
mkdir -p .github/workflows
```

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Next.js to GitHub Pages

on:
  push:
    branches: [main, master]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./out

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

#### Step 3: Configure Repository Settings

1. Go to your repository on GitHub: `https://github.com/bshastry/bshastry.github.io`
2. Click **Settings** tab
3. Scroll to **Pages** in the left sidebar
4. Under **Source**, select **GitHub Actions**
5. Save the settings

#### Step 4: Deploy

```bash
# Add the workflow file
git add .github/workflows/deploy.yml
git add next.config.js
git commit -m "fix: Correct GitHub Pages configuration and add deployment workflow"

# Push to trigger deployment
git push origin main
```

#### Step 5: Monitor Deployment

1. Go to the **Actions** tab in your repository
2. Watch the workflow execution
3. Once complete, visit `https://bshastry.github.io`

### Option B: Manual Deployment

#### Step 1: Build the Application

```bash
# Install dependencies
npm install

# Create production build
npm run build
```

This creates an `out/` directory with static files.

#### Step 2: Deploy to GitHub Pages

**Method 2A: Push `out` directory to root**

```bash
# Remove existing files (be careful!)
git rm -rf . --cached
git clean -fxd

# Copy build files to root
cp -r out/* .
cp out/.nojekyll . 2>/dev/null || true

# Add and commit
git add .
git commit -m "deploy: Update GitHub Pages site"
git push origin main
```

**Method 2B: Use `gh-pages` branch**

```bash
# Install gh-pages utility
npm install -g gh-pages

# Deploy to gh-pages branch
gh-pages -d out

# Configure GitHub Pages to use gh-pages branch
# (Do this in repository settings)
```

---

## Troubleshooting Common Issues

### Issue 1: 404 Error on GitHub Pages

**Symptoms**: Site shows "404 - File not found"

**Causes & Solutions**:

1. **Wrong repository name**
   - Must be exactly `bshastry.github.io`
   - Check repository settings

2. **Incorrect basePath configuration**
   - Remove basePath for username.github.io repos
   - See corrected configuration above

3. **Missing index.html**
   - Verify `out/index.html` exists after build
   - Check build logs for errors

### Issue 2: Assets Not Loading (CSS/JS)

**Symptoms**: Site loads but styling/functionality broken

**Causes & Solutions**:

1. **Incorrect asset paths**
   - Remove assetPrefix for username.github.io repos
   - Verify paths in generated HTML

2. **Jekyll processing interference**
   - Add `.nojekyll` file to disable Jekyll
   - This is automatically created by Next.js export

3. **MIME type issues**
   - Ensure proper file extensions
   - Check browser developer tools for errors

### Issue 3: Build Failures

**Symptoms**: GitHub Actions or local build fails

**Common Solutions**:

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run build

# Fix common issues:
# - Update dependencies
# - Fix TypeScript compilation errors
# - Resolve import/export issues
```

### Issue 4: Slow or Failed Deployments

**Symptoms**: Deployment takes too long or fails

**Solutions**:

1. **Optimize build size**

   ```bash
   # Analyze bundle size
   npm run build

   # Remove unused dependencies
   npm prune
   ```

2. **Check GitHub Actions limits**
   - Free accounts have usage limits
   - Monitor Actions usage in settings

3. **Simplify workflow**
   - Remove unnecessary steps
   - Use caching effectively

---

## Alternative Deployment Options

If GitHub Pages limitations are too restrictive, consider these alternatives:

### 1. Vercel (Recommended for Next.js)

**Advantages**:

- Native Next.js support
- Automatic deployments
- Edge functions support
- Custom domains

**Setup**:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 2. Netlify

**Advantages**:

- Static site optimization
- Form handling
- Edge functions
- Custom domains

**Setup**:

- Connect GitHub repository
- Set build command: `npm run build`
- Set publish directory: `out`

### 3. AWS S3 + CloudFront

**Advantages**:

- Highly scalable
- Custom configurations
- Cost-effective for high traffic

**Setup**:

```bash
# Install AWS CLI
aws configure

# Sync build files
aws s3 sync out/ s3://your-bucket-name
```

### 4. Firebase Hosting

**Advantages**:

- Google infrastructure
- Easy SSL setup
- Good performance

**Setup**:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize and deploy
firebase init hosting
firebase deploy
```

---

## Best Practices for GitHub Pages

### 1. Repository Structure

```
bshastry.github.io/
├── .github/workflows/    # GitHub Actions
├── app/                  # Next.js app directory
├── components/           # React components
├── data/                 # Portfolio data
├── legacy-archive/       # Archived Jekyll files
├── memory-bank/          # Project documentation
├── next.config.js        # Next.js configuration
├── package.json          # Dependencies
└── README.md            # Project documentation
```

### 2. Content Management

- Keep all content in [`data/portfolio.json`](data/portfolio.json)
- Use the portfolio updater scripts for automation
- Test changes locally before deploying

### 3. Performance Optimization

```javascript
// next.config.js optimizations
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
    // Consider using external image optimization service
  },
  // Enable compression
  compress: true,
  // Optimize for static export
  experimental: {
    optimizeCss: true,
  },
}
```

### 4. SEO Considerations

- Ensure proper meta tags in components
- Use semantic HTML structure
- Optimize images and assets
- Test with Google PageSpeed Insights

---

## Summary

### Key Points for GitHub Pages Deployment

1. **Configuration is Critical**: Username.github.io repositories must NOT use basePath or assetPrefix
2. **Static Export Only**: Next.js must be configured with `output: 'export'`
3. **GitHub Actions Recommended**: Automates the build and deployment process
4. **Test Locally First**: Always verify builds work locally before deploying

### Quick Deployment Checklist

- [ ] Fix [`next.config.js`](next.config.js) configuration (remove basePath/assetPrefix)
- [ ] Create GitHub Actions workflow
- [ ] Configure repository Pages settings
- [ ] Test local build with `npm run build`
- [ ] Push changes to trigger deployment
- [ ] Verify site at `https://bshastry.github.io`

### When to Consider Alternatives

Consider other hosting platforms if you need:

- Server-side rendering
- API routes
- Database connections
- Advanced caching strategies
- Custom server configurations

GitHub Pages is excellent for static portfolios but has limitations for dynamic applications.
