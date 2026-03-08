#!/bin/bash
# 記事生成スクリプト
# 使い方: ./scripts/new-post.sh <slug名>
# 例: ./scripts/new-post.sh murakami-gum-tenran

set -e

if [ -z "$1" ]; then
  echo "使い方: $0 <slug名>"
  echo "例: $0 trending-topic-name"
  exit 1
fi

SLUG="$1"
YEAR=$(date +%Y)
MONTH=$(date +%m)
DIR="content/posts/${YEAR}/${MONTH}"
FILE="${DIR}/${SLUG}.md"

mkdir -p "$DIR"

if [ -f "$FILE" ]; then
  echo "エラー: ${FILE} は既に存在します"
  exit 1
fi

cat > "$FILE" << EOF
---
title: ""
date: $(date +%Y-%m-%dT%H:%M:%S%z)
draft: true
description: ""
categories: []
tags: []
image: ""
---

{{< ad-top >}}

## 見出し1



{{< ad-middle >}}

## ネット上の反応



## まとめ



{{< ad-bottom >}}
EOF

echo "記事を作成しました: ${FILE}"
echo "エディタで開いて内容を編集してください。"
