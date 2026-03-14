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


