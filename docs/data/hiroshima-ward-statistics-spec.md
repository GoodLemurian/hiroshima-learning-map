# 広島市行政区統計データ

- ファイル: `public/data/hiroshima-ward-statistics.csv`
- 対象: 広島市8区
- 形式・文字コード: CSV、UTF-8（BOM付き）
- 1行の単位: 1行政区（8行）
- 結合キー: CSVの`ward_code`とGeoJSONの`N03_007`
- 基準日: 2026年5月31日
- 出典: [広島市 年齢別人口（区役所別）](https://www.city.hiroshima.lg.jp/shisei/toukei/1027844/1027845/1027846/1038153/index.html)
- ライセンス: CC BY 2.1 JP

## 列

| 列 | 内容 | 値・単位 |
| --- | --- | --- |
| `ward_code` | 地域コード（必須結合キー） | 5桁の文字列、重複なし |
| `ward_name` | 区名（必須表示名） | 文字列 |
| `population` | 人口 | 人、整数 |
| `children_population` | 子どもの人口 | 人、整数 |
| `working_age_population` | 生産年齢人口 | 人、整数 |
| `elderly_population` | 高齢者人口 | 人、整数 |
| `children_rate` | 子どもの割合 | %、小数値 |
| `working_age_rate` | 生産年齢人口の割合 | %、小数値 |
| `elderly_rate` | 高齢者の割合 | %、小数値 |
| `reference_date` | 基準日 | `YYYY-MM-DD` |
| `source_dataset` | 出典名 | 文字列 |
| `source_url` | 出典URL | URL |
| `license` | 利用条件 | 文字列 |

画面では`population`、`children_rate`、`elderly_rate`を使用します。空文字、`null`、`-`、`N/A`（大文字小文字を区別しない）は欠損として扱い、数値の0とは区別します。数値列に単位文字は含めません。

## 検証と結合

読み込み時に必須列、5桁コード、コード重複、行数、利用可能な数値を検証します。GeoJSONとCSVのコード差分は警告し、不一致のGeoJSON Featureはデータなしとして表示します。元ファイルは変更せず、ブラウザ内で各Featureの`properties`直下へ`stat_`接頭辞の数値プロパティを付けた新しいFeatureCollectionを作ります。この方式によりMapLibreの式から直接参照でき、同一区コードの複数Featureにも同じ値が付きます。

確認済みコードは`34101`〜`34108`で、GeoJSONとCSVに不一致はありません。
