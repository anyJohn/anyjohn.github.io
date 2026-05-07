#!/bin/bash

echo "🚀 开始发布流程..."

rsync -av --exclude='.git' ~/文档/Obsidian\ Vault/blog/published/ content/

git add .
git commit -m "update: content sync $(date +'%Y-%m-%d %H:%M')"
git push origin main

echo "✅ 推送完成！请等待 GitHub Actions 构建。"