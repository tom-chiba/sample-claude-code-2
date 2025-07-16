---
name: investigate
description: タスクの詳細調査と現状分析 - 情報収集と知見のまとめ
shortcut: inv
model: claude-opus-4-20250514
temperature: 0.3
maxTokens: 31999
---

# 調査フェーズ

**重要**: このフェーズではコードの修正を行いません。コードの修正は後続の `/implement` コマンドで実行されます。

<think>
タスク「{{task_name}}」について、以下の観点から徹底的に調査してください：

1. **背景と目的の理解**
   - なぜこのタスクが必要なのか
   - 期待される成果は何か
   - 成功の定義は何か

2. **現状分析**
   - 既存のコードベースの構造
   - 関連する技術スタック
   - 既存の実装パターン

3. **技術的考慮事項**
   - 必要な技術やライブラリ
   - パフォーマンス要件
   - セキュリティ考慮事項

4. **制約とリスク**
   - 技術的制約
   - 時間的制約
   - 潜在的なリスク

5. **関連情報の収集**
   - 類似実装の参考例
   - ベストプラクティス
   - ドキュメントやリソース
</think>

## ステップ0: 前提条件の確認

<think>
調査を開始する前に、以下を確認してください：
- プロジェクトのタイプ（Next.js、React、Vue など）
- パッケージマネージャー（npm、yarn、pnpm）
- テストフレームワーク（Jest、Vitest など）
</think>

プロジェクトタイプの自動検出：
```bash
# プロジェクトタイプの検出
if [ -f "next.config.js" ] || [ -f "next.config.ts" ]; then
    echo "✅ Next.jsプロジェクトとして検出"
    PROJECT_TYPE="nextjs"
elif [ -f "vite.config.js" ] || [ -f "vite.config.ts" ]; then
    echo "✅ Viteプロジェクトとして検出"
    PROJECT_TYPE="vite"
elif [ -f "gatsby-config.js" ]; then
    echo "✅ Gatsbyプロジェクトとして検出"
    PROJECT_TYPE="gatsby"
else
    echo "⚠️ プロジェクトタイプを自動検出できませんでした"
    PROJECT_TYPE="unknown"
fi

# パッケージマネージャーの検出
if [ -f "pnpm-lock.yaml" ]; then
    echo "📦 pnpmを使用"
    PKG_MANAGER="pnpm"
elif [ -f "yarn.lock" ]; then
    echo "📦 yarnを使用"
    PKG_MANAGER="yarn"
else
    echo "📦 npmを使用"
    PKG_MANAGER="npm"
fi

# テストフレームワークの検出
if [ -f "vitest.config.ts" ] || [ -f "vitest.config.js" ]; then
    echo "🧪 Vitestを使用"
    TEST_FRAMEWORK="vitest"
elif [ -f "jest.config.js" ] || [ -f "jest.config.ts" ]; then
    echo "🧪 Jestを使用"
    TEST_FRAMEWORK="jest"
else
    echo "⚠️ テストフレームワークが見つかりません"
    TEST_FRAMEWORK="none"
fi
```

## ステップ1: プロジェクト構造の把握

現在のプロジェクト構造を確認：
```bash
# 最適化されたfindコマンド
find . -path "./node_modules" -prune -o -path "./.next" -prune -o -path "./dist" -prune -o -type f \( -name "*.tsx" -o -name "*.ts" \) -print | head -30
```

関連するキーワードでコードベースを検索：
```bash
rg "{{keyword}}" --type-add 'web:*.{ts,tsx,js,jsx}' -t web -C 3 || echo "⚠️ キーワード '{{keyword}}' が見つかりませんでした"
```

## ステップ2: 技術スタックの確認

package.jsonから依存関係を確認：
```bash
# jqがない場合も考慮
if command -v jq >/dev/null 2>&1; then
    cat package.json | jq '.dependencies, .devDependencies'
else
    echo "📋 Dependencies:"
    grep -A 50 '"dependencies"' package.json | grep -B 50 '}'
    echo -e "\n📋 DevDependencies:"
    grep -A 50 '"devDependencies"' package.json | grep -B 50 '}'
fi
```

TypeScript設定の確認：
```bash
if [ -f "tsconfig.json" ]; then
    cat tsconfig.json
else
    echo "⚠️ tsconfig.jsonが見つかりません"
fi
```

## ステップ3: 既存の実装パターン分析

<file>{{relevant_file_1}}</file>
<file>{{relevant_file_2}}</file>

類似機能の実装を調査：
```bash
rg "{{similar_feature}}" --type-add 'web:*.{ts,tsx,js,jsx}' -t web -l || echo "ℹ️ 類似機能が見つかりませんでした"
```

## ステップ4: 外部リソースの調査

<think>
必要に応じて、以下の外部リソースを調査してください：
- 公式ドキュメント
- 類似実装の例
- ベストプラクティスガイド
- パフォーマンス最適化のヒント
</think>

関連するドキュメントやREADMEを確認：
```bash
find . -name "*.md" -not -path "./node_modules/*" | grep -E "(README|GUIDE|DOC)" | head -10
```

依存関係の互換性確認：
```bash
${PKG_MANAGER} ls --depth=0 2>&1 | grep "UNMET PEER DEPENDENCY" || echo "✅ 依存関係の問題はありません"
```

## ステップ5: 調査結果の整理と保存

**注意**: この段階ではコードの修正は行わず、調査結果の文書化のみを行います。

<think>
調査結果を整理し、以下の形式でまとめてください：

### 調査サマリー
- **タスクの概要**: 
- **技術的要件**: 
- **推奨アプローチ**: 
- **注意事項**: 

### 詳細な発見事項
1. 
2. 
3. 

### 推奨される次のステップ
- 
</think>

エラーハンドラー関数の定義：
```bash
handle_error() {
    local exit_code=$1
    local error_message=$2
    local recovery_suggestion=$3
    
    if [ $exit_code -ne 0 ]; then
        echo "❌ エラー: $error_message"
        echo "💡 対処法: $recovery_suggestion"
        mkdir -p .claude/logs/{{task_name}}
        echo "[$(date)] エラー: $error_message" >> .claude/logs/{{task_name}}/error.log
        return $exit_code
    fi
}
```

調査結果を保存：
```bash
mkdir -p .claude/context/{{task_name}}
cat > .claude/context/{{task_name}}/investigation.md << 'EOF'
# {{task_name}} - 調査結果

## 調査日時
$(date)

## プロジェクト情報
- **プロジェクトタイプ**: ${PROJECT_TYPE}
- **パッケージマネージャー**: ${PKG_MANAGER}
- **テストフレームワーク**: ${TEST_FRAMEWORK}

## タスク概要
{{task_description}}

## 技術的発見事項
- 

## 既存コードの分析
- 

## 推奨アプローチ
- 

## リスクと考慮事項
- 

## 参考リソース
- 

## 次のフェーズへの推奨事項
- 
EOF

handle_error $? "調査結果の保存に失敗しました" "ディスクの空き容量を確認してください"
```

## 完了確認

<think>
調査が完了したことを確認してください：
□ プロジェクトの環境を自動検出した
□ タスクの目的と背景を理解した
□ 既存コードベースを分析した（読み取りのみ）
□ 技術的要件を特定した
□ リスクと制約を識別した
□ 調査結果を文書化した
□ 次のフェーズ（計画）への推奨事項をまとめた
□ **コードの修正は一切行っていない**
</think>

調査結果の確認：
```bash
if [ -f ".claude/context/{{task_name}}/investigation.md" ]; then
    echo "✅ 調査結果が正常に保存されました"
    cat .claude/context/{{task_name}}/investigation.md
else
    echo "❌ 調査結果の保存に失敗しました"
    exit 1
fi
```

---
💡 **次のステップ**: `/plan {{task_name}}` コマンドで実装計画を立案してください。