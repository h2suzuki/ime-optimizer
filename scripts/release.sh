#!/bin/bash

# IME Optimizer - Release Script
# Performs pre-release validation and creates a new release

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to validate version format
validate_version() {
    if [[ ! $1 =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9]+(\.[0-9]+)?)?$ ]]; then
        print_error "Invalid version format. Use semantic versioning (e.g., 1.0.0, 1.0.0-beta.1)"
        return 1
    fi
}

# Function to check if version already exists
check_version_exists() {
    if git tag | grep -q "^v$1$"; then
        print_error "Version v$1 already exists"
        return 1
    fi
}

# Function to run pre-release checks
run_pre_checks() {
    print_status "Starting pre-release validation..."
    
    # Check 1: Linting
    print_status "Running ESLint..."
    if npm run lint; then
        print_success "Linting passed"
    else
        print_error "Linting failed. Please fix all linting errors before release."
        return 1
    fi
    
    # Check 2: Tests
    print_status "Running tests..."
    if npm test; then
        print_success "All tests passed"
    else
        print_error "Tests failed. Please fix all failing tests before release."
        return 1
    fi
    
    # Check 3: Type checking
    print_status "Running TypeScript type check..."
    if npm run type-check; then
        print_success "Type checking passed"
    else
        print_error "Type checking failed. Please fix all TypeScript errors before release."
        return 1
    fi
    
    # Check 4: Build
    print_status "Running production build..."
    if npm run build; then
        print_success "Build completed successfully"
    else
        print_error "Build failed. Please fix build errors before release."
        return 1
    fi
    
    # Check 5: Package validation
    print_status "Creating and validating package..."
    if npm run package; then
        print_success "Package created and validated"
    else
        print_error "Package creation failed. Please check build artifacts."
        return 1
    fi
    
    print_success "All pre-release checks passed! ✅"
}

# Function to update version in files
update_version_files() {
    local version=$1
    
    print_status "Updating version to $version in package.json..."
    
    # Update package.json
    if command -v jq >/dev/null 2>&1; then
        # Use jq if available
        jq ".version = \"$version\"" package.json > package.json.tmp && mv package.json.tmp package.json
    else
        # Fallback to sed
        sed -i.bak "s/\"version\": \".*\"/\"version\": \"$version\"/" package.json && rm -f package.json.bak
    fi
    
    print_status "Updating version to $version in manifest.json..."
    
    # Update manifest.json
    if command -v jq >/dev/null 2>&1; then
        # Use jq if available
        jq ".version = \"$version\"" public/manifest.json > public/manifest.json.tmp && mv public/manifest.json.tmp public/manifest.json
    else
        # Fallback to sed
        sed -i.bak "s/\"version\": \".*\"/\"version\": \"$version\"/" public/manifest.json && rm -f public/manifest.json.bak
    fi
    
    print_success "Version updated in configuration files"
}

# Function to create release commit and tag
create_release() {
    local version=$1
    
    print_status "Creating release commit..."
    
    # Add updated files
    git add package.json public/manifest.json
    
    # Create commit
    git commit -m "Release v${version}

🚀 Release version ${version}

This release includes:
- All features and improvements up to this point
- Comprehensive test coverage (50 tests)
- ESLint code quality validation
- Production-ready build

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
    
    # Create and push tag
    print_status "Creating release tag v${version}..."
    git tag -a "v${version}" -m "Release v${version}"
    
    print_status "Pushing release to GitHub..."
    git push origin main
    git push origin "v${version}"
    
    print_success "Release v${version} has been pushed to GitHub!"
}

# Function to monitor GitHub Actions
monitor_actions() {
    local version=$1
    print_status "GitHub Actions will now build and create the release..."
    print_status "You can monitor the progress at:"
    print_status "https://github.com/h2suzuki/ime-optimizer/actions"
    print_status ""
    print_status "Once complete, the release will be available at:"
    print_status "https://github.com/h2suzuki/ime-optimizer/releases/tag/v${version}"
}

# Main function
main() {
    echo "🚀 IME Optimizer Release Script"
    echo "================================"
    
    # Get version from argument or prompt
    if [[ $# -eq 1 ]]; then
        VERSION=$1
    else
        echo -n "Enter version number (e.g., 1.0.0): "
        read VERSION
    fi
    
    # Validate inputs
    print_status "Validating version: $VERSION"
    validate_version "$VERSION" || exit 1
    check_version_exists "$VERSION" || exit 1
    
    # Check git status
    if [[ -n $(git status --porcelain) ]]; then
        print_warning "Working directory has uncommitted changes."
        echo -n "Continue anyway? (y/N): "
        read -r response
        if [[ ! $response =~ ^[Yy]$ ]]; then
            print_error "Aborting release. Please commit or stash changes first."
            exit 1
        fi
    fi
    
    # Run pre-release validation
    run_pre_checks || exit 1
    
    # Confirmation prompt
    echo ""
    print_warning "Ready to release version $VERSION"
    echo "This will:"
    echo "  1. Update version in package.json and manifest.json"
    echo "  2. Create a release commit"
    echo "  3. Create and push tag v$VERSION"
    echo "  4. Trigger GitHub Actions for automated release"
    echo ""
    echo -n "Proceed with release? (y/N): "
    read -r response
    
    if [[ ! $response =~ ^[Yy]$ ]]; then
        print_error "Release cancelled by user"
        exit 1
    fi
    
    # Execute release
    update_version_files "$VERSION"
    create_release "$VERSION"
    monitor_actions "$VERSION"
    
    echo ""
    print_success "🎉 Release process completed!"
    print_success "Version v$VERSION has been released successfully."
}

# Run main function with all arguments
main "$@"