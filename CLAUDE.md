# トレンドニュースブログ - 記事生成ルール

## サイト概要
知恵袋ランキングやSNSトレンドから話題のネタを拾い、ニュースメディア風の記事にまとめるブログ。
Hugo静的サイト。GitHub Pagesでホスティング。

## プロジェクト構造
- `content/posts/YYYY/MM/slug.md` - 記事ファイル
- `layouts/` - テンプレート（baseof, single, list, partials, shortcodes）
- `static/css/style.css` - スタイルシート
- `scripts/new-post.sh` - 記事スケルトン生成
- `scripts/deploy.sh` - デプロイ（git add/commit/push）

## 全自動記事生成フロー
ユーザーがURLを貼ったら、確認なしで以下を全自動で実行する:

1. **URLからネタ取得** — WebFetch/WebSearchでページ内容・関連情報を収集
2. **ジャンル判定** — 内容からカテゴリを自動判定
3. **サムネイル画像選定** — 記事内容に合ったUnsplashフリー素材のURLを設定（`image: ""` は禁止）
4. **広告セット選択** — ジャンルに応じて配置を決定。**FaceSwitchは全記事に必ず最低2箇所、最大3箇所配置する（必須）**
   - エロ・恋愛・芸能人ゴシップ系 → FaceSwitch×3（ad-middle + ad-bottom + affiliate1箇所）+ 導線リンク
   - 一般ニュース・IT系 → FaceSwitch×2（ad-middle + ad-bottom）+ 導線リンク
5. **記事生成** — 下記テンプレートに従い記事作成、広告挿入
6. **目次自動生成** — H2/H3見出しから目次が自動表示される（テンプレート側で対応済み、記事内の作業不要）
7. **ビルド確認** — `hugo` でエラーなしを確認
8. **デプロイ** — `./scripts/deploy.sh` で公開
9. **URL報告** — 公開URLをユーザーに伝える

### 知恵袋URLの場合
- 質問タイトル・本文・ベストアンサーからトレンドネタを抽出
- 「みんなが気になっている話題」としてニュース記事化

### ツイート/XのURLの場合
- ツイート内容を元にトレンドネタを抽出
- `{{</* tweet "ID" */>}}` で埋め込み、その直下にFaceSwitchバナー配置

### その他URLの場合
- ページ内容を読み取り、関連するトレンド記事を生成

## 記事構成テンプレート
1. **タイトル**: 32文字以内、キーワードを前寄せ、【】で注目ワードを囲む
2. **メタディスクリプション**: 120文字以内、検索意図に応える要約
3. **本文構成**:
   - 導入（何が話題になっているかを3行で説明）
   - H2: 話題の経緯・詳細
   - H2: ネット上の反応（賛成意見・反対意見を両方紹介）
   - H2: 専門家や関係者の見解（あれば）
   - H2: 今後の展開・予想
   - H2: まとめ
4. **文字数**: 2000〜3000文字
5. **カテゴリ**: 芸能・エンタメ / スポーツ / 社会・政治 / IT・テクノロジー / 生活・雑学 から1つ
6. **タグ**: 関連キーワードを3〜5個

## Front Matter形式
```yaml
---
title: "【注目ワード】キーワード前寄せのタイトル32文字以内"
date: YYYY-MM-DDTHH:MM:SS+09:00
draft: false
description: "120文字以内のメタディスクリプション"
categories: ["カテゴリ名"]
tags: ["タグ1", "タグ2", "タグ3"]
image: "https://images.unsplash.com/photo-XXXXX?w=1200&h=630&fit=crop"
---
```

## サムネイル画像（必須）
- **全記事にサムネイル画像を必ず設定する**
- Unsplashのフリー素材を使用（`https://images.unsplash.com/photo-XXXXX?w=1200&h=630&fit=crop`）
- 記事の内容に合った無難な画像を選ぶ（頭に残らない系でOK）
- OGP・一覧カード・記事アイキャッチに自動表示される
- `image: ""` のまま公開しない

## 広告ショートコード挿入位置
- **ad-bottom（FaceSwitch）**: single.htmlテンプレートで自動挿入（記事内に書かない）
- 本文中間（H2が3つ目の前あたり）: `{{</* ad-middle */>}}`（記事内に書く）
- 記事内affiliate: `{{</* affiliate */>}}...{{</* /affiliate */>}}`（記事内に書く）

**重要: ad-bottomはテンプレートで自動挿入されるため、記事md内には書かないこと（二重表示になる）**

## 広告バナー管理（2026-03現在）

### 登録バナー一覧
| 名前 | 配置 | リンク |
|------|------|--------|
| FaceSwitch | ad-bottom, 記事内affiliate（全ページに散りばめる） | mttag: `i946xt1euvg` |
| QuickS | ad-sidebar（PC右側固定） | `https://quick-s.jp/?afid=ma7pyy&merchant_name=Quicks&token=ff0RZDk&visitor_id=69aecab92c6c7f551b306fcb` |
| mttag新規 | ad-sidebar（PC右側固定） | `https://mttag.com/s/IwnrBJS4f5E` |

### 広告配置ルール
- **FaceSwitch（必須）**: 全記事に最低2箇所、最大3箇所。ad-bottom + 記事内affiliate。エロ・恋愛・ゴシップ系は+1箇所追加
- **導線リンク（PICKUP）**: 全記事に設置

### 記事内affiliateショートコードの使い方
エロ・恋愛系の話題、または感情が動くポイントの直後にFaceSwitchを挿入:
```
{{</* affiliate */>}}
<a href='https://mttag.com/s/i946xt1euvg' rel='nofollow'><strong>無料で顔写真からAVを作ってみる</strong></a><img src='https://mttag.com/banner/i946xt1euvg' width='1' height='1' border='0' />
{{</* /affiliate */>}}
```

### FACESWITCH記事への導線リンク
各記事のまとめ後・ad-bottom前に設置:
```html
<a class="pickup-link" href="/posts/2026/03/faceswitch-ai-review/">
<span class="pickup-link-label">PICK UP</span>
<span class="pickup-link-title">手持ちの顔写真がAVに！？話題のFACESWITCHを徹底解説</span>
</a>
```

## トーンと文体
- ニュースメディア調（「〜とのことです」「〜が話題となっています」）
- 中立的な立場を保つ（個人の意見は「〜という声も」で紹介）
- 読みやすい文体（一文を短く、改行多め）
- 煽りすぎない（炎上商法にならないバランス）

## ファイル配置ルール
- 記事ファイル: `content/posts/YYYY/MM/slug-name.md`
- slug名: 英語のケバブケース（例: `trending-topic-name`）

## デプロイ手順
1. `hugo` でビルドエラーなしを確認




2. draft を false に変更
3. `./scripts/deploy.sh` でデプロイ
