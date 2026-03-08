#!/bin/bash
# デプロイスクリプト
# git add → commit → push を一発で実行

set -e

# 下書き記事をチェック
DRAFT_COUNT=$(grep -rl "draft: true" content/posts/ 2>/dev/null | wc -l | tr -d ' ')
if [ "$DRAFT_COUNT" -gt 0 ]; then
  echo "注意: ${DRAFT_COUNT}件の下書き記事があります（デプロイには含まれません）"
fi

# 変更がなければ終了
if git diff --quiet && git diff --cached --quiet && [ -z "$(git ls-files --others --exclude-standard)" ]; then
  echo "変更がありません。デプロイするものがありません。"
  exit 0
fi

# ステージング
git add .

# コミットメッセージ生成
TIMESTAMP=$(date +"%Y-%m-%d %H:%M")
NEW_POSTS=$(git diff --cached --name-only | grep "content/posts/" | head -5)

if [ -n "$NEW_POSTS" ]; then
  MSG="記事更新: ${TIMESTAMP}"
else
  MSG="サイト更新: ${TIMESTAMP}"
fi

echo "コミットメッセージ: ${MSG}"
git commit -m "$MSG"
git push

echo ""
echo "デプロイ完了！"
