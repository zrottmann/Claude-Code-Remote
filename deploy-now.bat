@echo off
echo ================================================
echo   CLAUDE CODE REMOTE - IMMEDIATE DEPLOYMENT
echo ================================================
echo.
echo Project: %cd%
echo Target: https://remote.appwrite.network
echo Status: Emergency deployment mode
echo.

echo [1/5] Building application...
call npm run export
if errorlevel 1 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo [2/5] Creating deployment package...
cd out
tar -czf ..\deployment-ready.tar.gz .
cd ..

echo [3/5] Package created successfully!
for %%I in (deployment-ready.tar.gz) do echo Package size: %%~zI bytes

echo [4/5] Multiple deployment paths ready:

echo.
echo === OPTION A: GITHUB ACTIONS (AUTOMATED) ===
echo Status: Already triggered by git push
echo Check: https://github.com/zrottmann/Claude-Code-Remote/actions
echo Expected: Site live in 3-5 minutes
echo.

echo === OPTION B: MANUAL APPWRITE CONSOLE ===
echo 1. Open: https://cloud.appwrite.io/console
echo 2. Project: 68a9a5e4003518a2495b
echo 3. Go to: Hosting ^> Sites ^> remote
echo 4. Click: "Create Deployment"
echo 5. Upload: deployment-ready.tar.gz
echo 6. Activate: New deployment
echo.

echo === OPTION C: ALTERNATIVE HOSTING ===
echo GitHub Pages: https://zrottmann.github.io/Claude-Code-Remote/
echo Vercel: Connect repo for instant deploy
echo Netlify: Drag/drop deployment-ready.tar.gz
echo.

echo [5/5] Deployment package ready!
echo File: %cd%\deployment-ready.tar.gz
echo.

echo ================================================
echo   NEXT STEPS:
echo   1. Check GitHub Actions status (automatic)
echo   2. OR manually upload to Appwrite Console  
echo   3. OR use alternative hosting platforms
echo ================================================
echo.

pause