@echo off
setlocal enabledelayedexpansion
set ENV_FILE=.env

:: Verifica se o arquivo .env existe
if not exist %ENV_FILE% (
    echo Erro: Arquivo .env nao encontrado.
    exit /b 1
)

:: Verifica qual IA esta ativa (Gemini nao comecando com #)
findstr /b "GEMINI_API_KEY" %ENV_FILE% >nul
if %errorlevel% equ 0 (
    echo [INFO] Alternando para OpenRouter...
    powershell -Command "(gc %ENV_FILE%) -replace '^GEMINI_API_KEY', '# GEMINI_API_KEY' -replace '^# OPENAI_BASE_URL', 'OPENAI_BASE_URL' -replace '^# OPENAI_API_KEY', 'OPENAI_API_KEY' | Out-File -encoding ASCII %ENV_FILE%"
    echo [SUCESSO] OpenRouter ativado! Gemini comentado.
) else (
    echo [INFO] Alternando para Gemini...
    powershell -Command "(gc %ENV_FILE%) -replace '^# GEMINI_API_KEY', 'GEMINI_API_KEY' -replace '^OPENAI_BASE_URL', '# OPENAI_BASE_URL' -replace '^OPENAI_API_KEY', '# OPENAI_API_KEY' | Out-File -encoding ASCII %ENV_FILE%"
    echo [SUCESSO] Gemini ativado! OpenRouter comentado.
)
pause
