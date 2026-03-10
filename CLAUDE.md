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

## 記事生成コマンド
「○○について記事書いて」と言われたら、以下のルールに従って記事を生成する。

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
| freecash | ad-top（全ページ上部固定） | `https://freecash.com/r/2ENQLF` |
| FaceSwitch | ad-middle, ad-bottom, 記事内affiliate（全ページに散りばめる） | `https://www.face-switch-ai.com/?afid=ma7pyy&merchant_name=nanyotera&token=mp4coWY&visitor_id=69adb74dfac345275e282e06` |
| QuickS | ad-sidebar（PC右側固定） | `https://quick-s.jp/?afid=ma7pyy&merchant_name=Quicks&token=ff0RZDk&visitor_id=69aecab92c6c7f551b306fcb` |
| mttag新規 | ad-sidebar（PC右側固定） | `https://mttag.com/s/IwnrBJS4f5E` |

### 記事内affiliateショートコードの使い方
エロ・恋愛系の話題、または感情が動くポイントの直後にFaceSwitchバナーを挿入:
```
{{</* affiliate */>}}
<a href='FaceSwitchリンク' rel='nofollow' target='_blank'><img src='https://mttag.com/banner/lVM3LgiRzrQ' alt='FaceSwitch' style='max-width:100%;height:auto;' border='0' /></a>
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
1. 記事作成後 `hugo server -D` でプレビュー確認








2. draft を false に変更
3. `./scripts/deploy.sh` でデプロイ
