@echo off
REM Launch Site Script for Claude Code Remote (Windows)
REM Site ID: 68aa1b51000a9c3a9c36

echo 🚀 Launching Claude Code Remote Site...
echo Site ID: 68aa1b51000a9c3a9c36
echo =======================================

cd /d "%~dp0"

REM Check if git is available
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Git is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if we're in a git repository
git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Not in a git repository
    pause
    exit /b 1
)

REM Check for required deployment files
echo 📋 Checking deployment files...
if exist "appwrite-deployment" (
    echo ✅ appwrite-deployment directory found
) else (
    echo ❌ appwrite-deployment directory not found
    echo Creating appwrite-deployment directory...
    mkdir appwrite-deployment
)

if exist ".github\workflows\deploy-claude-remote.yml" (
    echo ✅ GitHub Actions workflow found
) else (
    echo ❌ GitHub Actions workflow not found
    pause
    exit /b 1
)

REM Check git status
echo.
echo 📊 Git Status:
git status --porcelain

REM Check if there are changes to commit
git diff-index --quiet HEAD --
if errorlevel 1 (
    echo.
    echo 💾 Committing changes...
    git add .
    git commit -m "🚀 Launch site deployment for ID: 68aa1b51000a9c3a9c36

🎯 Updated site configuration:
- Site ID: 68aa1b51000a9c3a9c36
- Updated GitHub Actions workflows  
- Ready for deployment

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
    
    if errorlevel 1 (
        echo ❌ Failed to commit changes
        pause
        exit /b 1
    ) else (
        echo ✅ Changes committed successfully
    )
) else (
    echo ✅ No uncommitted changes
)

REM Push to trigger GitHub Actions
echo.
echo 🔄 Pushing to trigger deployment...
git push origin master

if errorlevel 1 (
    echo ❌ Failed to push to remote repository
    pause
    exit /b 1
) else (
    echo.
    echo 🎉 Push successful! GitHub Actions deployment triggered.
    echo.
    echo 🌐 Monitor deployment at:
    for /f "tokens=*" %%i in ('git config remote.origin.url') do (
        echo    https://github.com/%%i/actions
    )
    echo.
    echo 📱 Site will be available at:
    echo    https://68aa1b51000a9c3a9c36.appwrite.network
    echo.
    echo ⏱️  Deployment typically takes 2-3 minutes to complete.
)

echo.
echo ✅ Launch process completed!
pause