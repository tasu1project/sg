# 情報セキュリティマネジメント試験 頻出200問ツール

HTML / CSS / JavaScript だけで動く、GitHub Pages 向けの静的Webアプリです。

## 機能

- 分野別問題
- 正誤判定
- 解説表示
- 間違えた問題だけ復習
- 正答率表示
- 選択肢シャッフル
- 学習履歴をブラウザに保存（localStorage）

## 問題データ

`data/questions.js` に、シラバスVer.4.1を意識した頻出用語ベースのオリジナル200問を入れています。
IPA公式問題の転載ではありません。

## GitHub Pagesで公開する手順

1. このフォルダをGitHubリポジトリにアップロード
2. Settings → Pages を開く
3. Branch を `main`、フォルダを `/root` にする
4. Save
5. 表示されたURLにアクセス

## ファイル構成

```text
sg-security-study-tool/
├─ index.html
├─ style.css
├─ script.js
├─ data/
│  └─ questions.js
├─ assets/
└─ README.md
```

## 注意

試験対策用の自作教材です。公式情報はIPAの最新シラバス・試験要綱で確認してください。
