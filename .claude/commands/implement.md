---
name: implement
description: 計画に基づいた段階的な実装 - TodoListを追跡しながらコード作成
shortcut: imp
model: claude-opus-4-20250514
temperature: 0.3
maxTokens: 31999
---

# 実装フェーズ

<think>
タスク「{{task_name}}」の実装を開始する前に、以下を確認してください：

1. **計画の確認**
   - TodoListの現在の状態
   - 次に実装すべきタスク
   - 依存関係の解決状況

2. **実装方針**
   - コーディング規約の遵守
   - 既存パターンとの整合性
   - テスト駆動開発の考慮

3. **品質基準**
   - 型安全性の確保
   - エラーハンドリング
   - パフォーマンスの考慮

4. **段階的な実装**
   - 小さなコミット単位
   - 継続的な動作確認
   - リファクタリングの機会
</think>

## ステップ0: 前フェーズの確認と環境準備

<think>
実装を開始する前に、計画フェーズの成果物と開発環境を確認してください：
- 計画書の存在確認
- プロジェクト情報の読み込み
- 開発環境の正常性確認
</think>

前提条件の確認：
```bash
# エラーハンドラー関数の定義
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

# 計画の存在確認
if [ ! -f ".claude/context/{{task_name}}/plan.md" ]; then
    echo "⚠️ 警告: 実装計画が見つかりません"
    echo "💡 先に /plan {{task_name}} コマンドを実行してください"
    exit 1
else
    echo "✅ 実装計画を確認しました"
fi

# プロジェクト情報の読み込み
if [ -f ".claude/context/{{task_name}}/investigation.md" ]; then
    PROJECT_TYPE=$(grep "プロジェクトタイプ" .claude/context/{{task_name}}/investigation.md | cut -d: -f2 | xargs)
    PKG_MANAGER=$(grep "パッケージマネージャー" .claude/context/{{task_name}}/investigation.md | cut -d: -f2 | xargs)
    TEST_FRAMEWORK=$(grep "テストフレームワーク" .claude/context/{{task_name}}/investigation.md | cut -d: -f2 | xargs)
    
    echo "📋 プロジェクト情報:"
    echo "  - タイプ: ${PROJECT_TYPE}"
    echo "  - パッケージマネージャー: ${PKG_MANAGER}"
    echo "  - テストフレームワーク: ${TEST_FRAMEWORK}"
fi

# フィーチャーフラグの読み込み
if [ -f ".claude/context/{{task_name}}/plan.md" ]; then
    FEATURE_FLAG=$(grep "フィーチャーフラグ" .claude/context/{{task_name}}/plan.md | cut -d: -f2 | xargs)
    echo "  - フィーチャーフラグ: ${FEATURE_FLAG}"
fi
```

## ステップ1: 実装状況の確認

計画と現在のTodoListを確認：
<file>.claude/context/{{task_name}}/plan.md</file>

プロジェクトの現在の状態を確認：
```bash
# Gitの状態確認
git status --short

# ブランチの確認
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 現在のブランチ: ${CURRENT_BRANCH}"

# もしmainブランチで作業している場合は警告
if [ "${CURRENT_BRANCH}" = "main" ] || [ "${CURRENT_BRANCH}" = "master" ]; then
    echo "⚠️ 警告: メインブランチで作業しています"
    echo "💡 フィーチャーブランチの作成を推奨: git checkout -b feature/{{task_name}}"
fi
```

実装ログの初期化（初回のみ）：
```bash
if [ ! -f ".claude/context/{{task_name}}/implementation.md" ]; then
    cat > .claude/context/{{task_name}}/implementation.md << 'EOF'
# {{task_name}} - 実装ログ

## 実装開始日時
$(date)

## 実装記録
EOF
fi
```

## ステップ2: 次のタスクの選択

<think>
TodoListから次に実装すべきタスクを選択してください。選択の基準：

1. **依存関係**: 他のタスクの前提となるものを優先
2. **リスク**: 技術的に難しいものを早めに実装
3. **価値**: ユーザーに価値を提供できるものを優先
4. **サイズ**: 大きなタスクは分割して実装

選択したタスクを「in_progress」に更新してください。
</think>

## ステップ3: 実装の実行

### 基盤整備の実装例

型定義の作成：
```bash
mkdir -p src/types
```
<file>src/types/{{feature_name}}.ts</file>

環境変数の型定義（必要な場合）：
```bash
# .envファイルに追加
echo "${FEATURE_FLAG}=true" >> .env.local
```

### コア機能の実装例

ビジネスロジックの実装：
```bash
mkdir -p src/lib/{{feature_name}}
```
<file>src/lib/{{feature_name}}/index.ts</file>

ユーティリティ関数の実装：
<file>src/lib/{{feature_name}}/utils.ts</file>

定数定義の作成：
<file>src/lib/{{feature_name}}/constants.ts</file>

### UIコンポーネントの実装例

Reactコンポーネントの作成：
```bash
mkdir -p src/components/{{feature_name}}
```
<file>src/components/{{feature_name}}/{{ComponentName}}.tsx</file>

スタイルの実装（CSS Modules）：
<file>src/components/{{feature_name}}/{{ComponentName}}.module.css</file>

スタイルの実装（Tailwind CSS）：
```bash
# Tailwind CSSを使用している場合は、コンポーネント内で直接クラスを使用
```

コンポーネントのストーリー作成（Storybook使用時）：
<file>src/components/{{feature_name}}/{{ComponentName}}.stories.tsx</file>

### 統合の実装例

既存ファイルへの統合：
<file>{{integration_target_file}}</file>

ルーティングの追加（Next.jsの場合）：
```bash
mkdir -p src/app/{{feature_path}}
```
<file>src/app/{{feature_path}}/page.tsx</file>

## ステップ4: 実装の検証

<think>
各実装が完了したら、以下の観点から検証してください：

1. **動作確認**
   - 期待通りの動作をするか
   - エッジケースの処理
   - エラーハンドリング

2. **コード品質**
   - 型エラーがないか
   - Lintエラーがないか
   - 命名規則の遵守

3. **パフォーマンス**
   - 不要な再レンダリング
   - 大きなバンドルサイズ
   - 遅いAPI呼び出し
</think>

型チェック（エラー詳細付き）：
```bash
npx tsc --noEmit 2>&1 | tee typescript-errors.log
if [ ${PIPESTATUS[0]} -ne 0 ]; then
    echo "❌ TypeScriptエラーが検出されました"
    echo "詳細は typescript-errors.log を確認してください"
    # エラーの要約を表示
    grep "error TS" typescript-errors.log | head -5
else
    echo "✅ 型チェック成功"
    rm -f typescript-errors.log
fi
```

Lintチェック：
```bash
${PKG_MANAGER} run lint || {
    echo "❌ Lintエラーが検出されました"
    echo "💡 自動修正を試みます: ${PKG_MANAGER} run lint -- --fix"
    ${PKG_MANAGER} run lint -- --fix
}
```

開発サーバーでの動作確認：
```bash
${PKG_MANAGER} run dev || {
    echo "❌ 開発サーバーの起動に失敗しました"
    echo "💡 依存関係を確認してください: ${PKG_MANAGER} install"
    exit 1
}
```

循環依存のチェック：
```bash
if command -v madge >/dev/null 2>&1; then
    npx madge --circular src/{{feature_path}} || echo "✅ 循環依存なし"
fi
```

## ステップ5: 実装の記録

実装内容を文書化：
```bash
cat >> .claude/context/{{task_name}}/implementation.md << 'EOF'

---
## 実装日時: $(date)

### 実装したタスク
- {{implemented_task}}

### 実装の詳細
- **作成/更新ファイル**: 
  - {{implemented_files}}
- **変更内容**: {{change_summary}}

### 技術的決定事項
- {{technical_decisions}}

### 発生した問題と解決策
- **問題**: {{encountered_issue}}
- **解決策**: {{solution}}

### 次のタスク
- {{next_task}}
EOF

handle_error $? "実装ログの更新に失敗しました" "ディスクの空き容量を確認してください"
```

## ステップ6: コミットの作成

<think>
実装が一定のまとまりに達したら、コミットを作成してください：

1. 関連する変更をグループ化
2. 明確なコミットメッセージ
3. 部分的でも動作する状態を保つ
4. コミットタイプは以下を使用：
   - feat: 新機能
   - fix: バグ修正
   - refactor: リファクタリング
   - test: テスト追加/修正
   - docs: ドキュメント更新
   - style: コードスタイルの変更
   - perf: パフォーマンス改善
</think>

変更内容の確認：
```bash
git diff --stat
echo "---"
git diff --cached --stat
```

未追跡ファイルの確認：
```bash
git ls-files --others --exclude-standard
```

ステージングと確認：
```bash
# インタラクティブな追加（推奨）
git add -p {{files_to_commit}} || git add {{files_to_commit}}

# ステージング内容の最終確認
git status --short
```

プリコミットフックの実行（手動）：
```bash
# pre-commitがある場合は事前に実行
if [ -f ".git/hooks/pre-commit" ]; then
    .git/hooks/pre-commit || echo "⚠️ pre-commitフックでエラーが発生しました"
fi
```

コミットの作成：
```bash
git commit -m "{{commit_type}}: {{commit_message}}

- {{detail_1}}
- {{detail_2}}
- {{detail_3}}

Task: {{task_name}}"
```

## 進捗の確認

TodoListの更新と確認：
- 完了したタスクを「completed」に更新
- 次のタスクを確認
- 全体の進捗を把握

実装ログの確認：
```bash
echo "📊 実装の進捗状況:"
tail -20 .claude/context/{{task_name}}/implementation.md
```

カバレッジの簡易確認（テストがある場合）：
```bash
if [ "${TEST_FRAMEWORK}" != "none" ]; then
    echo "📈 テストカバレッジの確認:"
    ${PKG_MANAGER} test -- --coverage --collectCoverageFrom="src/{{feature_path}}/**/*.{ts,tsx}" || echo "ℹ️ テストはまだ作成されていません"
fi
```

## 継続的な実装

<think>
実装フェーズは反復的なプロセスです：

1. タスクの選択
2. 実装
3. 検証
4. 記録
5. コミット
6. 次のタスクへ

すべてのタスクが完了するまで、このサイクルを繰り返してください。
問題が発生した場合は、計画の見直しも検討してください。

定期的に以下を確認：
- TypeScriptエラーが蓄積していないか
- テストが壊れていないか
- パフォーマンスが劣化していないか
</think>

実装セッションの終了時：
```bash
# 最終的な状態確認
echo "🏁 実装セッションのサマリー:"
echo "- 現在のブランチ: $(git branch --show-current)"
echo "- コミット数: $(git rev-list --count HEAD ^main 2>/dev/null || echo '0')"
echo "- 変更ファイル数: $(git diff --name-only main... 2>/dev/null | wc -l || echo '0')"
echo ""
echo "📝 実装ログ: .claude/context/{{task_name}}/implementation.md"
```

---
💡 **次のステップ**: 
- 実装を継続する場合: 次のタスクを選択して実装
- テストフェーズへ: `/test {{task_name}}` コマンドを実行