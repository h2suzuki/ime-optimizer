# IME Optimizer Chrome Extension

日本語入力フィールドのIME制御を最適化するChrome拡張機能です。

## 概要

多くのWebサイトで`type`属性や`inputmode`属性が適切に設定されていないため、IME（日本語入力）の制御が正しく行われない問題を解決します。

## 主な機能

### 🤖 AI推測機能
- フィールド名、プレースホルダー、ラベルから適切な属性を推測
- 絵文字アイコンで視覚的にフィールドタイプを表示

### 🎌 日本語サイト自動検出
- HTML lang属性とテキスト内容を分析して日本語サイトを検出
- 日本語サイトのみで自動的に拡張機能を有効化

### ⚙️ 柔軟な設定
- サイト別の有効/無効設定
- フィールド別のカスタム設定
- デフォルトIMEモード（ON/OFF/自動）の選択

### 📱 ユーザーフレンドリーなUI
- 入力フィールド横の絵文字アイコン
- クリックで設定変更可能
- ツールチップで現在の設定を表示

## 対応フィールドタイプ

| タイプ | 絵文字 | 推測キーワード例 |
|--------|--------|------------------|
| 日本語入力 | 📝 | 氏名、住所、コメント |
| メールアドレス | 📧 | email, mail, メール |
| 電話番号 | 📞 | tel, phone, 電話 |
| 数値 | 🔢 | age, price, 年齢 |
| URL | 🔗 | url, website, ホームページ |
| パスワード | 🔒 | password, パスワード |
| 検索 | 🔍 | search, 検索 |
| 日付 | 📅 | date, 日付 |
| クレジットカード | 💳 | card_number, カード番号 |

## 技術仕様

### 開発環境
- TypeScript
- Jest (テスト)
- Webpack (ビルド)
- Chrome Extension Manifest V3

### アーキテクチャ
- **Content Script**: 入力フィールドの検出と属性適用
- **Background Service Worker**: ストレージ管理とメッセージハンドリング
- **Popup**: サイト別設定UI
- **Options Page**: 全体設定とサイト管理

### テスト
- 50個のテストケース（100%通過）
- TDD（テスト駆動開発）で実装
- 単体テスト、統合テスト完備

## 開発コマンド

```bash
# 依存関係のインストール
npm install

# テスト実行
npm test

# 型チェック
npm run type-check

# 開発ビルド
npm run build:dev

# 本番ビルド
npm run build

# 監視モード
npm run watch
```

## インストール方法

1. プロジェクトをビルド: `npm run build`
2. Chrome拡張機能の管理画面を開く
3. 「デベロッパーモード」を有効にする
4. 「パッケージ化されていない拡張機能を読み込む」で`dist`フォルダを選択

## ファイル構成

```
src/
├── core/                 # コアロジック
│   ├── attribute-predictor.ts    # 属性推測エンジン
│   ├── japanese-detector.ts      # 日本語サイト検出
│   └── storage-manager.ts        # ストレージ管理
├── content/              # コンテンツスクリプト
├── background/           # バックグラウンドスクリプト
├── popup/               # ポップアップUI
├── options/             # 設定ページ
└── types/               # TypeScript型定義

public/
├── manifest.json        # 拡張機能設定
├── popup.html          # ポップアップHTML
├── options.html        # 設定ページHTML
└── icons/              # アイコンファイル

docs/
├── input-attributes-research.md  # 属性調査
└── japanese-detection-logic.md   # 日本語検出ロジック
```

## 貢献

このプロジェクトはTest-Driven Development（TDD）で開発されています。新機能の追加や修正を行う際は、まずテストを作成してから実装を行ってください。

## ライセンス

Apache License 2.0