@echo off
rem Ensure the script runs relative to the batch file's directory
pushd "%~dp0"
echo Testing Python installation...
python --version
if %errorlevel% neq 0 (
    echo Python not found, trying python3...
    python3 --version
)

echo.
echo Testing PIL/Pillow installation...
python -c "from PIL import Image; print('PIL/Pillow is installed')"
if %errorlevel% neq 0 (
    echo Pillow is not installed. Installing now...
    python -m pip install Pillow
)

echo.
echo Testing analyze.py script...
cd ml_models
python analyze.py
echo.
echo Exit code: %errorlevel%
popd
