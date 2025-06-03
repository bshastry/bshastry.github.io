# Portfolio Deployment Guide

This guide provides step-by-step instructions for deploying your Next.js portfolio to GitHub Pages, covering both initial deployment and subsequent updates.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Deployment Setup](#initial-deployment-setup)
3. [Subsequent Deployments](#subsequent-deployments)
4. [Troubleshooting](#troubleshooting)
5. [Rollback Procedures](#rollback-procedures)
6. [Automation Options](#automation-options)

---

## Prerequisites

### Required Tools
- **Git**: Version control system
- **Node.js**: Version 18.17 or later
- **npm**: Node package manager (comes with Node.js)
- **GitHub Account**: With access to your repository

### Verify Prerequisites
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check Git version
git --version
```

---

## Initial Deployment Setup

### Step 1: Repository Configuration

1. **Navigate to your repository on GitHub**
   - Go to `https://github.com/bshastry/bshastry.github.io`

2. **Enable GitHub Pages**
   - Click on **Settings** tab
   - Scroll down to **Pages** section in the left sidebar
   - Under **Source**, select **Deploy from a branch**
   - Choose **master** branch
   - Select **/ (root)** folder
   - Click **Save**

### Step 2: Configure GitHub Actions (Recommended)

1. **Create GitHub Actions workflow directory**
   ```bash
   mkdir -p .github/workflows
   ```

2. **Create deployment workflow file**
   ```bash
   touch .github/workflows/deploy.yml
   ```

3. **Add the following content to `.github/workflows/deploy.yml`**
   ```yaml
   name: Deploy Next.js to GitHub Pages

   on:
     push:
       branches: [ master ]
     pull_request:
       branches: [ master ]

   permissions:
     contents: read
     pages: write
     id-token: write

   concurrency:
     group: "pages"
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

### Step 3: Initial Push and Deployment

1. **Add the workflow file to git**
   ```bash
   git add .github/workflows/deploy.yml
   git commit -m "feat: Add GitHub Actions deployment workflow"
   ```

2. **Push all changes to GitHub**
   ```bash
   git push origin master
   ```

3. **Monitor the deployment**
   - Go to your repository on GitHub
   - Click on **Actions** tab
   - Watch the deployment workflow run
   - Once complete, your site will be available at `https://bshastry.github.io`

### Step 4: Verify Deployment

1. **Check the live site**
   - Visit `https://bshastry.github.io`
   - Verify all sections load correctly
   - Test responsive design on different screen sizes
   - Check all links and navigation

2. **Test functionality**
   - Verify contact form (if applicable)
   - Check project links
   - Ensure CV download works
   - Test all interactive elements

---

## Subsequent Deployments

### For Content Updates

When you need to update portfolio content, projects, or personal information:

1. **Update the data file**
   ```bash
   # Edit portfolio data
   nano data/portfolio.json
   ```

2. **Test locally (optional but recommended)**
   ```bash
   # Install dependencies (if not already done)
   npm install

   # Run development server
   npm run dev

   # Visit http://localhost:3000 to verify changes
   ```

3. **Commit and push changes**
   ```bash
   # Stage your changes
   git add data/portfolio.json

   # Commit with descriptive message
   git commit -m "content: Update portfolio projects and experience"

   # Push to trigger deployment
   git push origin master
   ```

### For Code/Design Updates

When you need to modify components, styling, or functionality:

1. **Make your changes**
   ```bash
   # Example: Edit a component
   nano components/Projects.tsx

   # Example: Update styling
   nano app/globals.css
   ```

2. **Test locally**
   ```bash
   # Run development server
   npm run dev

   # Test your changes thoroughly
   # Check responsive design
   # Verify functionality
   ```

3. **Build and test production version**
   ```bash
   # Create production build
   npm run build

   # Serve production build locally (optional)
   npx serve out
   ```

4. **Commit and deploy**
   ```bash
   # Stage all changes
   git add .

   # Commit with descriptive message
   git commit -m "feat: Improve project card design and responsiveness"

   # Push to trigger deployment
   git push origin master
   ```

### Deployment Timeline

- **Automatic deployment** triggers on every push to `master` branch
- **Build time**: Typically 2-5 minutes
- **Propagation time**: 5-10 minutes for changes to appear live
- **Total time**: Usually 10-15 minutes from push to live site

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Build Failures

**Problem**: GitHub Actions build fails
```bash
# Check the build locally
npm run build

# Common fixes:
# - Fix TypeScript errors
# - Resolve missing dependencies
# - Check for syntax errors
```

**Solution**:
- Review the error logs in GitHub Actions
- Fix issues locally and test with `npm run build`
- Commit and push the fixes

#### 2. Site Not Updating

**Problem**: Changes not appearing on live site

**Solutions**:
1. **Check GitHub Actions**
   - Verify the workflow completed successfully
   - Look for any error messages

2. **Clear browser cache**
   ```bash
   # Hard refresh in browser
   Ctrl+F5 (Windows/Linux)
   Cmd+Shift+R (Mac)
   ```

3. **Check GitHub Pages settings**
   - Ensure source is set to correct branch
   - Verify custom domain settings (if applicable)

#### 3. 404 Errors

**Problem**: Site shows 404 error

**Solutions**:
1. **Check repository name**
   - Must be exactly `bshastry.github.io`

2. **Verify GitHub Pages configuration**
   - Check Pages settings in repository
   - Ensure deployment source is correct

3. **Check build output**
   - Verify `out` directory is created during build
   - Ensure `index.html` exists in build output

#### 4. Styling Issues

**Problem**: CSS not loading or appearing broken

**Solutions**:
1. **Check asset paths**
   - Verify `next.config.js` has correct `basePath` and `assetPrefix`

2. **Clear cache and hard refresh**

3. **Check build output**
   ```bash
   npm run build
   # Verify CSS files are generated in out/_next/static/
   ```

### Getting Help

If you encounter issues not covered here:

1. **Check GitHub Actions logs**
   - Go to Actions tab in your repository
   - Click on the failed workflow
   - Review detailed error messages

2. **Local debugging**
   ```bash
   # Clean install
   rm -rf node_modules package-lock.json
   npm install

   # Test build
   npm run build
   ```

3. **Check documentation**
   - Review `ARCHITECTURE.md` for system details
   - Check `MAINTENANCE_GUIDE.md` for common tasks

---

## Rollback Procedures

### Quick Rollback

If you need to quickly revert to a previous version:

1. **Find the commit to rollback to**
   ```bash
   # View recent commits
   git log --oneline -10
   ```

2. **Revert to previous commit**
   ```bash
   # Revert to specific commit (replace COMMIT_HASH)
   git revert COMMIT_HASH

   # Or revert the last commit
   git revert HEAD
   ```

3. **Push the revert**
   ```bash
   git push origin master
   ```

### Emergency Rollback to Legacy System

If you need to restore the Jekyll system:

1. **Follow the restoration guide in `legacy-archive/README.md`**

2. **Quick restoration commands**
   ```bash
   # Move current system to backup
   mkdir -p backup-nextjs
   mv app components data *.json *.js *.ts backup-nextjs/

   # Restore Jekyll files
   cp -r legacy-archive/* .
   rm -rf legacy-archive

   # Commit restoration
   git add .
   git commit -m "emergency: Restore Jekyll system"
   git push origin master
   ```

---

## Automation Options

### Automated Content Updates

For frequent content updates, consider these automation options:

#### 1. Content Management Script

Create a script to update portfolio data:

```bash
# Create update script
touch scripts/update-portfolio.sh
chmod +x scripts/update-portfolio.sh
```

#### 2. Scheduled Deployments

Add scheduled builds to your GitHub Actions:

```yaml
# Add to .github/workflows/deploy.yml
on:
  schedule:
    # Run every Sunday at 2 AM UTC
    - cron: '0 2 * * 0'
```

#### 3. API Integration

For dynamic content updates, consider integrating with:
- GitHub API for repository data
- LinkedIn API for professional updates
- RSS feeds for blog posts

### Monitoring and Notifications

#### 1. Deployment Notifications

Add Slack or email notifications to your workflow:

```yaml
# Add to deploy.yml after deployment
- name: Notify deployment success
  if: success()
  run: |
    echo "Deployment successful! Site updated at https://bshastry.github.io"
```

#### 2. Uptime Monitoring

Consider using services like:
- **UptimeRobot**: Free website monitoring
- **Pingdom**: Professional monitoring service
- **GitHub Actions**: Custom health check workflows

---

## Best Practices

### Development Workflow

1. **Always test locally before pushing**
   ```bash
   npm run dev    # Development testing
   npm run build  # Production build testing
   ```

2. **Use descriptive commit messages**
   ```bash
   # Good examples:
   git commit -m "feat: Add new project to portfolio"
   git commit -m "fix: Resolve mobile navigation issue"
   git commit -m "content: Update work experience section"
   ```

3. **Regular backups**
   - Keep local backups of important content
   - Document any custom configurations

### Performance Optimization

1. **Image optimization**
   - Use Next.js Image component
   - Compress images before adding
   - Use appropriate formats (WebP, AVIF)

2. **Regular dependency updates**
   ```bash
   # Check for updates
   npm outdated

   # Update dependencies
   npm update
   ```

3. **Monitor build times**
   - Keep build times under 5 minutes
   - Optimize large assets
   - Remove unused dependencies

### Security Considerations

1. **Keep dependencies updated**
   ```bash
   # Check for security vulnerabilities
   npm audit

   # Fix vulnerabilities
   npm audit fix
   ```

2. **Review third-party integrations**
   - Regularly audit external services
   - Use HTTPS for all external resources
   - Validate any user inputs

---

## Summary

This deployment guide covers:
- ✅ Initial GitHub Pages setup
- ✅ Automated deployment with GitHub Actions
- ✅ Step-by-step deployment procedures
- ✅ Troubleshooting common issues
- ✅ Rollback and emergency procedures
- ✅ Automation and monitoring options
- ✅ Best practices for ongoing maintenance

Your portfolio is now ready for professional deployment with a robust, automated workflow that ensures reliable updates and easy maintenance.

For additional help, refer to:
- `ARCHITECTURE.md` - Technical system details
- `MAINTENANCE_GUIDE.md` - Day-to-day maintenance tasks
- `MIGRATION_GUIDE.md` - System migration procedures
- `memory-bank/` - Project context and decision history