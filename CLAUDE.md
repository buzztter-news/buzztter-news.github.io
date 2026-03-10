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
3. **広告セット選択** — ジャンルに応じて配置を決定。**FaceSwitchは全記事に必ず最低2箇所、最大3箇所配置する（必須）**
   - エロ・恋愛・芸能人ゴシップ系 → FaceSwitch×3（ad-middle + ad-bottom + affiliate1箇所）+ 導線リンク
   - 一般ニュース・IT系 → FaceSwitch×2（ad-middle + ad-bottom）+ 導線リンク
4. **記事生成** — 下記テンプレートに従い記事作成、広告挿入
5. **ビルド確認** — `hugo` でエラーなしを確認
6. **デプロイ** — `./scripts/deploy.sh` で公開
7. **URL報告** — 公開URLをユーザーに伝える

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
image: ""
---
```

## 広告ショートコード挿入位置
- 導入の前: `{{</* ad-top */>}}`
- 本文中間（H2が3つ目の前あたり）: `{{</* ad-middle */>}}`
- まとめの後: `{{</* ad-bottom */>}}`

## 広告バナー管理（2026-03現在）

### 登録バナー一覧
| 名前 | 配置 | リンク |
|------|------|--------|
| freecash | ad-top（モバイルのみ） | `https://freecash.com/r/2ENQLF` |
| FaceSwitch | ad-bottom, 記事内affiliate（全ページに散りばめる） | mttag: `i946xt1euvg` |
| コールドクター(マンジャロ) | 記事内affiliate（生活・美容・健康・主婦向け記事） | afi-b: `R160568-c518449J` / 250x250バナー |
| QuickS | ad-sidebar（PC右側固定） | `https://quick-s.jp/?afid=ma7pyy&merchant_name=Quicks&token=ff0RZDk&visitor_id=69aecab92c6c7f551b306fcb` |
| mttag新規 | ad-sidebar（PC右側固定） | `https://mttag.com/s/IwnrBJS4f5E` |

### 広告配置ルール
- **FaceSwitch（必須）**: 全記事に最低2箇所、最大3箇所。ad-bottom + 記事内affiliate。エロ・恋愛・ゴシップ系は+1箇所追加
- **コールドクター/マンジャロ**: 生活・美容・健康・主婦向け記事に配置。FaceSwitchと併用OK
- **導線リンク（PICKUP）**: 全記事に設置
- **ジャンル別の使い分け**:
  - エロ・恋愛・ゴシップ系 → FaceSwitch多め
  - 生活・健康・主婦向け → コールドクター + FaceSwitch
  - IT・ニュース系 → FaceSwitchのみ

### コールドクター(マンジャロ)の配置
- **タイトル上**: single.htmlテンプレートで全記事に自動表示（468x60バナー）
- **記事内affiliate**: 主婦・生活・健康系の記事に追加で配置
```
{{</* affiliate */>}}
<a href="https://t.afi-b.com/visit.php?a=R160568-k518453u&p=e970957w" rel="nofollow"><img src="https://www.afi-b.com/upload_image/16056-1752914626-3.png" width="468" height="60" style="border:none;" alt="コールドクター" /></a><img src="https://t.afi-b.com/lead/R160568/e970957w/k518453u" width="1" height="1" style="border:none;" />
{{</* /affiliate */>}}
```

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
