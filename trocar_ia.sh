#!/bin/bash
ENV_FILE=".env"

if [ ! -f "$ENV_FILE" ]; then
    echo "Erro: Arquivo .env não encontrado."
    exit 1
fi

if grep -q "^GEMINI_API_KEY" "$ENV_FILE"; then
    echo "[INFO] Alternando para OpenRouter..."
    # No Mac, o sed -i precisa de um sufixo vazio ''
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' 's/^GEMINI_API_KEY/# GEMINI_API_KEY/' "$ENV_FILE"
        sed -i '' 's/^# OPENAI_BASE_URL/OPENAI_BASE_URL/' "$ENV_FILE"
        sed -i '' 's/^# OPENAI_API_KEY/OPENAI_API_KEY/' "$ENV_FILE"
    else
        sed -i 's/^GEMINI_API_KEY/# GEMINI_API_KEY/' "$ENV_FILE"
        sed -i 's/^# OPENAI_BASE_URL/OPENAI_BASE_URL/' "$ENV_FILE"
        sed -i 's/^# OPENAI_API_KEY/OPENAI_API_KEY/' "$ENV_FILE"
    fi
    echo "[SUCESSO] OpenRouter ativado! Gemini comentado."
else
    echo "[INFO] Alternando para Gemini..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' 's/^# GEMINI_API_KEY/GEMINI_API_KEY/' "$ENV_FILE"
        sed -i '' 's/^OPENAI_BASE_URL/# OPENAI_BASE_URL/' "$ENV_FILE"
        sed -i '' 's/^OPENAI_API_KEY/# OPENAI_API_KEY/' "$ENV_FILE"
    else
        sed -i 's/^# GEMINI_API_KEY/GEMINI_API_KEY/' "$ENV_FILE"
        sed -i 's/^OPENAI_BASE_URL/# OPENAI_BASE_URL/' "$ENV_FILE"
        sed -i 's/^OPENAI_API_KEY/# OPENAI_API_KEY/' "$ENV_FILE"
    fi
    echo "[SUCESSO] Gemini ativado! OpenRouter comentado."
fi
