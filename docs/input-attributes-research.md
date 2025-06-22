# Input Type属性とInputmode属性の詳細調査

## 1. HTML input type属性の全種類

### テキスト入力系
- `text`: 汎用テキスト入力（デフォルト）
- `password`: パスワード入力（マスク表示）
- `email`: メールアドレス入力
- `url`: URL入力
- `tel`: 電話番号入力
- `search`: 検索テキスト入力

### 数値・日付系
- `number`: 数値入力
- `range`: スライダー形式の数値入力
- `date`: 日付選択
- `datetime-local`: 日時選択
- `month`: 年月選択
- `week`: 週選択
- `time`: 時刻選択

### その他
- `color`: カラーピッカー
- `file`: ファイル選択
- `hidden`: 非表示フィールド
- `checkbox`: チェックボックス
- `radio`: ラジオボタン
- `button`: ボタン
- `submit`: 送信ボタン
- `reset`: リセットボタン
- `image`: 画像ボタン

## 2. inputmode属性の全種類

- `none`: 仮想キーボードを表示しない
- `text`: 標準的なテキスト入力（デフォルト）
- `decimal`: 小数点を含む数値入力
- `numeric`: 整数の数値入力
- `tel`: 電話番号入力
- `search`: 検索用入力（検索ボタン付き）
- `email`: メールアドレス入力
- `url`: URL入力

## 3. 実用的な組み合わせと推奨設定

### 日本語入力が必要なケース（IME ON推奨）
| type | inputmode | 用途 | 絵文字 |
|------|-----------|------|--------|
| text | text | 氏名、住所、コメント | 📝 |
| text | search | 日本語検索 | 🔍 |
| search | search | 日本語検索フィールド | 🔎 |

### 半角英数字のみ（IME OFF推奨）
| type | inputmode | 用途 | 絵文字 |
|------|-----------|------|--------|
| email | email | メールアドレス | 📧 |
| url | url | URL入力 | 🔗 |
| tel | tel | 電話番号 | 📞 |
| number | numeric | 整数（郵便番号、年齢） | 🔢 |
| number | decimal | 小数点付き数値 | 💹 |
| password | none/text | パスワード | 🔒 |
| text | numeric | クレジットカード番号 | 💳 |
| date | none | 日付選択 | 📅 |
| time | none | 時刻選択 | 🕐 |

### 特殊なケース
| type | inputmode | 用途 | 絵文字 |
|------|-----------|------|--------|
| text | none | 外部入力デバイス使用時 | ⌨️ |
| text | tel | 数字中心だが記号も含む | 📱 |

## 4. 推測ロジックのキーワード

### 日本語入力（IME ON）
- 名前、氏名、姓、名、なまえ、ナマエ
- 住所、番地、都道府県、市区町村
- 会社名、組織名、部署
- コメント、備考、メモ、内容、説明
- タイトル、件名、題名

### メールアドレス（IME OFF）
- email, mail, メール, e-mail
- address, アドレス

### 電話番号（IME OFF）
- tel, phone, 電話, TEL
- mobile, 携帯, ケータイ
- fax, FAX, ファックス

### 数値（IME OFF）
- 郵便番号, 〒, zip, postal
- 年齢, age
- 金額, 価格, price, amount
- 個数, 数量, quantity

### URL（IME OFF）
- url, URL, ホームページ
- website, サイト, link

### パスワード（IME OFF）
- password, pass, パスワード
- pin, PIN, 暗証番号

## 5. 属性の優先順位

1. **既存のtype属性を尊重**
   - passwordなど重要な属性は変更しない
   - hiddenやbutton系は対象外

2. **inputmode属性を優先的に設定**
   - type属性よりもIME制御への影響が大きい
   - より細かい制御が可能

3. **ユーザビリティを重視**
   - モバイルでの入力体験を最適化
   - 不適切な変更は避ける

## 6. 実装時の注意点

- type="number"は日本語入力を完全にブロックするため、郵便番号などでは`type="text" inputmode="numeric"`の組み合わせを推奨
- 一部のブラウザではinputmode属性がサポートされていない場合がある
- passwordフィールドのtype属性は絶対に変更しない（セキュリティ上の理由）