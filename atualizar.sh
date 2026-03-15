#!/bin/bash

echo "🚀 Iniciando atualização para o GitHub..."

# Adiciona todas as mudanças
git add .

# Cria a mensagem com a data atual
DATA=$(date +'%d/%m/%Y %H:%M')
git commit -m "Update automático: $DATA"

# Envia para o GitHub (estamos usando a branch main)
git push origin main

echo "------------------------------------------"
echo "✅ Site atualizado com sucesso!"
echo "------------------------------------------"
#!/bin/bash

# Adiciona todas as mudanças
git add .

# Pede para você digitar a mensagem do commit
echo "O que você mudou nesta atualização?"
read mensagem

# Faz o commit com a sua mensagem
git commit -m "$mensagem"

# Envia para o GitHub
git push

echo "------------------------------"
echo "Atualização concluída com sucesso!"
echo "------------------------------"


