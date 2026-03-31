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
4. **属性判定 → 広告セット選択** — 記事内容から属性を自動判定し、広告配置を決定。**FaceSwitchは全記事に必ず最低2箇所、最大3箇所配置する（必須）**

   **【属性A：エロ系】** `modal_ad: "faceswitch"` を設定
   - 判定基準: アダルト動画・5ch・ディープフェイク・AI顔入れ替え・エロ保存系など
   - 例: 5ch-domain-stop, faceswitch-ai-review, x-video-save-ranking
   - FaceSwitch×3（ad-middle + ad-bottom + affiliate1箇所）+ 導線リンク

   **【属性B：一般】** modal_ad未指定（デフォルト=ポイ活A8）
   - 判定基準: ニュース速報・生活・スポーツ・IT障害・防災など
   - 例: gasoline-price-surge, instagram-dm-bug, line-anpi-kakunin, murakami-gum
   - FaceSwitch×2（ad-middle + ad-bottom）+ 導線リンク

   **【属性C：アフィ記事】** `clean_ads: true` を設定
   - 判定基準: 特定商材のLP・レビュー記事（回線アフィなど）
   - 例: wifi-lag-fiber-solution
   - 広告なし（記事自体がアフィリエイト）
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

### 広告枠一覧（2026-03-11現在）

| 枠名 | ファイル | 表示条件 | 内容 |
|------|----------|----------|------|
| **モーダル広告** | `modal-ad.html` | 全記事（clean_ads除外）、ページ読み込み時 | `modal_ad: "faceswitch"` → FaceSwitchバナー / 未指定 → ポイ活A8バナー。×ボタン3秒遅延＋極小半透明 |
| **スマートバナー** | `smart-banner.html` | 全ページ（clean_ads除外）、上部固定 | Freecashアプリ風バナー |
| **ad-middle** | `ad-middle.html` | `{{</* ad-middle */>}}`挿入箇所 | FACESWITCH記事へのテキストリンク |
| **ad-bottom** | `ad-bottom.html` | single.htmlテンプレート自動挿入 | FaceSwitch バナー風CTA |
| **affiliate** | `affiliate.html` ショートコード | 記事内手動配置 | FaceSwitch バナー風CTA |
| **サイドバー常設1** | `ad-sidebar.html` | PC右側固定 | mttag バナー（IwnrBJS4f5E） |
| **サイドバー常設2** | `ad-sidebar.html` | PC右側固定 | A8 フレッツ光 600x500バナー |
| **サイドバー常設3** | `ad-sidebar.html` | PC右側固定 | クイック現金サービス mttag |
| **サイドバー常設4** | `ad-sidebar.html` | PC右側固定 | FaceSwitch バナー風CTA |
| **サイドバー縦長ランダム** | `ad-sidebar.html` | PC右側、50%ランダム | A8 160x600縦長バナー |
| **人気記事下FaceSwitch** | `sidebar.html` | 人気記事セクションの下 | FaceSwitch バナー風CTA |
| **スマホインタースティシャル** | `ad-interstitial-mobile.html` | スマホ限定、50%ランダム、8秒後表示 | A8バナー2種ランダム出し分け（728x90 / 468x60） |

### モーダル広告の出し分けルール
- `modal_ad: "faceswitch"` → FaceSwitchバナー（保存ランキング・FaceSwitch・5ch記事に設定）
- 未指定（デフォルト） → ポイ活A8バナー（それ以外の全記事）
- `clean_ads: true` → モーダル広告自体を非表示（エポスカード記事等）

### 除外ルール
- `clean_ads: true` → モーダル広告・スマートバナー・サイドバー広告を非表示
- `no_ad_bottom: true` → ad-bottomを非表示
- スマホインタースティシャルは `university-student-first-credit-card` と `faceswitch-ai-review` を除外

### 広告配置ルール
- **FaceSwitch（必須）**: 全記事に最低2箇所、最大3箇所。ad-bottom + 記事内affiliate。エロ・恋愛・ゴシップ系は+1箇所追加
- **導線リンク（PICKUP）**: 全記事に設置

### 記事内affiliateショートコードの使い方
感情が動くポイントの直後にFaceSwitchバナー風CTAを挿入:
```
{{</* affiliate */>}}
<a href='https://mttag.com/s/i946xt1euvg' rel='nofollow' target='_blank' class='fs-banner-link'><span class='fs-banner'>顔写真1枚でAI動画生成<br><small>FACESWITCH 無料お試し →</small></span></a><img src='https://mttag.com/banner/i946xt1euvg' width='1' height='1' border='0' style='display:none;' />
{{</* /affiliate */>}}
```

### FaceSwitch広告の形式ルール
- **テキストリンク禁止** — 「無料で顔写真からAVを作ってみる」等のプレーンテキストリンクは使わない
- **バナー風CTA必須** — `.fs-banner-link` + `.fs-banner` クラスを使ったスタイル付きバナーで統一
- mttagの1x1トラッキングピクセルは `style='display:none;'` で非表示にする（放置するとmttagが勝手にクリックできないバナー画像に差し替える）

### FACESWITCH記事への導線リンク
各記事のまとめ後・ad-bottom前に設置:
```html
<a class="pickup-link" href="/posts/2026/03/faceswitch-ai-review/">
<span class="pickup-link-label">PICK UP</span>
<span class="pickup-link-title">手持ちの顔写真がAVに！？話題のFACESWITCHを徹底解説</span>
</a>
```

## 広告の禁止表現（絶対ルール）
- **不信感を煽る訴求文は一切使わない**
- 具体的な禁止例:
  - 「招待リンク限定」「登録だけで○○もらえる」「残りわずか」「まもなく終了」
  - 金額を前面に出したポイ活訴求
  - 緊急性・希少性を煽るフェイクカウントダウン
- 広告は控えめに、サイトの信頼性を損なわない表現のみ使用する

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
