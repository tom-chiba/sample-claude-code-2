---
name: test
description: 包括的なテスト戦略の実行 - ユニットテストから統合テストまで
shortcut: tst
model: claude-opus-4-20250514
temperature: 0.2
maxTokens: 31999
---

# テストフェーズ

<think>
タスク「{{task_name}}」のテストを開始する前に、以下を確認してください：

1. **テスト戦略の決定**
   - テストピラミッドの考慮（ユニット > 統合 > E2E）
   - テストカバレッジの目標
   - 重要な機能の優先順位

2. **テストの種類**
   - ユニットテスト：個別の関数やコンポーネント
   - 統合テスト：複数のコンポーネントの連携
   - E2Eテスト：ユーザーシナリオ全体
   - パフォーマンステスト：応答時間やリソース使用

3. **テストケースの設計**
   - 正常系のテスト
   - 異常系のテスト
   - エッジケースのテスト
   - リグレッションテスト

4. **品質基準**
   - カバレッジ目標（80%以上推奨）
   - パフォーマンス基準
   - アクセシビリティ基準
</think>

## ステップ0: 前フェーズの確認とテスト環境準備

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

# 実装内容の存在確認
if [ ! -f ".claude/context/{{task_name}}/implementation.md" ]; then
    echo "⚠️ 警告: 実装ログが見つかりません"
    echo "💡 先に /implement {{task_name}} コマンドを実行してください"
    exit 1
else
    echo "✅ 実装内容を確認しました"
fi

# プロジェクト情報の読み込み
if [ -f ".claude/context/{{task_name}}/investigation.md" ]; then
    PROJECT_TYPE=$(grep "プロジェクトタイプ" .claude/context/{{task_name}}/investigation.md | cut -d: -f2 | xargs)
    PKG_MANAGER=$(grep "パッケージマネージャー" .claude/context/{{task_name}}/investigation.md | cut -d: -f2 | xargs)
    TEST_FRAMEWORK=$(grep "テストフレームワーク" .claude/context/{{task_name}}/investigation.md | cut -d: -f2 | xargs)
    
    echo "📋 プロジェクト情報:"
    echo "  - テストフレームワーク: ${TEST_FRAMEWORK}"
    echo "  - パッケージマネージャー: ${PKG_MANAGER}"
fi
```

## ステップ1: 実装内容の確認

実装済みの機能を確認：
<file>.claude/context/{{task_name}}/implementation.md</file>

テスト対象のファイルを特定：
```bash
# 最適化されたfindコマンド
find . -path "./node_modules" -prune -o -path "./.next" -prune -o -path "./coverage" -prune -o -type f \( -name "*.ts" -o -name "*.tsx" \) -print | grep -E "{{feature_pattern}}" | grep -v test
```

実装ファイルの統計：
```bash
echo "📊 実装ファイルの統計:"
find src -name "*.ts" -o -name "*.tsx" | grep -E "{{feature_pattern}}" | grep -v test | wc -l | xargs echo "- ファイル数:"
find src -name "*.ts" -o -name "*.tsx" | grep -E "{{feature_pattern}}" | grep -v test | xargs wc -l | tail -1
```

## ステップ2: テスト環境の準備

既存のテスト構造を確認：
```bash
find src -name "*.test.*" -o -name "*.spec.*" | head -10
```

テスト設定の確認：
```bash
# Jest設定の確認
if [ -f "jest.config.js" ] || [ -f "jest.config.ts" ]; then
    echo "✅ Jestが設定されています"
    cat jest.config.* | head -20
elif [ -f "vitest.config.ts" ] || [ -f "vitest.config.js" ]; then
    echo "✅ Vitestが設定されています"
    cat vitest.config.* | head -20
else
    echo "⚠️ テスト設定ファイルが見つかりません"
fi
```

テストヘルパーの確認：
```bash
# テストユーティリティの確認
if [ -d "src/test-utils" ] || [ -d "src/__tests__/utils" ]; then
    echo "✅ テストユーティリティが存在します"
    ls -la src/test-utils 2>/dev/null || ls -la src/__tests__/utils 2>/dev/null
fi
```

## ステップ2.5: テストデータの準備

テストフィクスチャの作成：
```bash
mkdir -p src/__fixtures__/{{feature_name}}
cat > src/__fixtures__/{{feature_name}}/testData.ts << 'EOF'
// {{feature_name}}のテストデータ
export const mockData = {
  // テストデータをここに定義
  valid: {
    // 正常系のデータ
  },
  invalid: {
    // 異常系のデータ
  },
  edge: {
    // エッジケースのデータ
  }
};

export const testIds = {
  // data-testidの定数
  container: '{{feature_name}}-container',
  submitButton: '{{feature_name}}-submit',
  errorMessage: '{{feature_name}}-error',
};
EOF
```

## ステップ3: ユニットテストの作成

<think>
ユニットテストを作成する際は、以下の観点を考慮してください：

1. **テストの独立性**: 他のテストに依存しない
2. **明確な名前**: 何をテストしているか一目でわかる
3. **AAA原則**: Arrange（準備）, Act（実行）, Assert（検証）
4. **単一責任**: 1つのテストで1つのことだけを検証
</think>

### ユーティリティ関数のテスト

テストファイルの作成：
```bash
mkdir -p src/lib/{{feature_name}}/__tests__
touch src/lib/{{feature_name}}/__tests__/utils.test.ts
```
<file>src/lib/{{feature_name}}/__tests__/utils.test.ts</file>

### Reactコンポーネントのテスト

コンポーネントテストの作成：
```bash
mkdir -p src/components/{{feature_name}}/__tests__
touch src/components/{{feature_name}}/__tests__/{{ComponentName}}.test.tsx
```
<file>src/components/{{feature_name}}/__tests__/{{ComponentName}}.test.tsx</file>

### フックのテスト

カスタムフックのテスト：
```bash
mkdir -p src/hooks/__tests__
touch src/hooks/__tests__/{{hookName}}.test.ts
```
<file>src/hooks/__tests__/{{hookName}}.test.ts</file>

## ステップ4: 統合テストの作成

<think>
統合テストでは、複数のコンポーネントやモジュールが正しく連携することを確認します：

1. **データフロー**: コンポーネント間のデータの流れ
2. **状態管理**: グローバル状態の更新と反映
3. **副作用**: API呼び出しやルーティング
4. **ユーザーインタラクション**: クリックや入力の結果
</think>

統合テストの作成：
```bash
mkdir -p src/__tests__/integration
touch src/__tests__/integration/{{feature_name}}.test.tsx
```
<file>src/__tests__/integration/{{feature_name}}.test.tsx</file>

## ステップ5: テストの実行と分析

すべてのテストを実行：
```bash
${PKG_MANAGER} test || handle_error $? "テストが失敗しました" "失敗したテストを確認してください"
```

特定の機能のテストのみ実行：
```bash
${PKG_MANAGER} test -- {{feature_name}} || echo "⚠️ 一部のテストが失敗しました"
```

カバレッジレポートの生成：
```bash
${PKG_MANAGER} test -- --coverage --collectCoverageFrom="src/{{feature_path}}/**/*.{ts,tsx}" --coveragePathIgnorePatterns="<rootDir>/src/{{feature_path}}/.*(stories|test|spec)\\.(ts|tsx)$"
```

カバレッジ結果の解析：
```bash
# カバレッジサマリーの表示
if [ -f "coverage/coverage-summary.json" ]; then
    echo "📊 カバレッジサマリー:"
    cat coverage/coverage-summary.json | jq '.total' || cat coverage/coverage-summary.json
fi
```

ウォッチモードでテスト（開発時）：
```bash
# インタラクティブな開発時のみ使用
# ${PKG_MANAGER} test -- --watch
```

## ステップ6: E2Eテストの考慮

<think>
E2Eテストが必要な場合は、以下を検討してください：

1. **重要なユーザーフロー**: 最も重要な機能の全体的な動作
2. **クリティカルパス**: ビジネス上重要な処理
3. **統合ポイント**: 外部サービスとの連携
</think>

E2Eテストファイルの作成（Playwright/Cypressなど）：
```bash
# Playwrightの場合
if [ -d "tests" ] || [ -d "e2e" ]; then
    E2E_DIR=$([ -d "tests" ] && echo "tests" || echo "e2e")
    mkdir -p ${E2E_DIR}/{{feature_name}}
    touch ${E2E_DIR}/{{feature_name}}/{{scenario}}.spec.ts
    echo "✅ E2Eテストファイルを作成: ${E2E_DIR}/{{feature_name}}/{{scenario}}.spec.ts"
fi
```

## ステップ7: パフォーマンステスト

<think>
パフォーマンスが重要な機能の場合、以下のテストを実施してください：

1. **レンダリングパフォーマンス**: 不要な再レンダリング
2. **バンドルサイズ**: コード分割の効果
3. **実行時間**: 処理の速度
4. **メモリ使用量**: メモリリークの確認
</think>

パフォーマンステストの実施：
```bash
# React DevToolsプロファイラーの使用を推奨
echo "🔍 パフォーマンステストのチェックリスト:"
echo "□ React DevToolsでレンダリングプロファイリング"
echo "□ Chrome DevToolsでメモリプロファイリング"
echo "□ Lighthouseでパフォーマンス監査"
```

バンドルサイズの確認：
```bash
if [ -f "package.json" ] && grep -q "\"analyze\"" package.json; then
    echo "📦 バンドル分析を実行中..."
    ${PKG_MANAGER} run build && ${PKG_MANAGER} run analyze
else
    echo "ℹ️ バンドル分析スクリプトが設定されていません"
fi
```

ベンチマークテストの作成（必要な場合）：
```bash
mkdir -p src/__benchmarks__
cat > src/__benchmarks__/{{feature_name}}.bench.ts << 'EOF'
// {{feature_name}}のベンチマークテスト
import { bench, describe } from 'vitest';

describe('{{feature_name}} performance', () => {
  bench('{{operation_name}}', () => {
    // パフォーマンスを測定したい処理
  });
});
EOF
```

## ステップ8: テスト結果の記録

テスト結果を文書化：
```bash
# テスト実行結果の収集
TEST_OUTPUT=$(${PKG_MANAGER} test -- --coverage 2>&1 || true)
COVERAGE_SUMMARY=$(echo "$TEST_OUTPUT" | grep -A 5 "Coverage summary" || echo "カバレッジ情報なし")

cat > .claude/context/{{task_name}}/test-results.md << EOF
# {{task_name}} - テスト結果

## テスト実施日時
$(date)

## プロジェクト情報
- **テストフレームワーク**: ${TEST_FRAMEWORK}
- **パッケージマネージャー**: ${PKG_MANAGER}

## テストカバレッジ
${COVERAGE_SUMMARY}

## テスト結果サマリー
- ユニットテスト: 実装済み
- 統合テスト: 実装済み
- E2Eテスト: $([ -d "tests" ] || [ -d "e2e" ] && echo "実装済み" || echo "未実装")

## 発見された問題
- 

## パフォーマンス測定
- バンドルサイズ: $(du -sh .next 2>/dev/null | cut -f1 || echo "未測定")
- テスト実行時間: $(echo "$TEST_OUTPUT" | grep "Time:" || echo "未測定")

## 改善提案
- 

## 次のアクション
- 
EOF

handle_error $? "テスト結果の保存に失敗しました" "ディスクの空き容量を確認してください"
```

## ステップ9: 問題の修正

<think>
テストで発見された問題を修正する場合：

1. 失敗したテストの詳細を分析
2. 根本原因を特定
3. 最小限の修正を実施
4. テストを再実行して確認
</think>

失敗したテストの詳細確認：
```bash
# 失敗したテストのみ再実行
${PKG_MANAGER} test -- --testNamePattern="{{failing_test_pattern}}" --verbose
```

デバッグモードでテスト実行：
```bash
# Jestの場合
if [ "${TEST_FRAMEWORK}" = "jest" ]; then
    echo "🐛 デバッグモード: node --inspect-brk node_modules/.bin/jest --runInBand {{test_file}}"
# Vitestの場合
elif [ "${TEST_FRAMEWORK}" = "vitest" ]; then
    echo "🐛 デバッグモード: node --inspect-brk node_modules/.bin/vitest run {{test_file}}"
fi
```

テストのスナップショット更新（必要な場合）：
```bash
# スナップショットテストの更新
${PKG_MANAGER} test -- -u {{feature_name}}
```

## 完了確認

<think>
テストフェーズの完了基準：
□ すべての機能にテストが作成されている
□ テストカバレッジが目標を達成している（80%以上）
□ すべてのテストがパスしている
□ パフォーマンス基準を満たしている
□ 発見された問題が修正されている
□ テスト結果が文書化されている
□ CIでテストが自動実行される設定になっている
</think>

最終的なテスト実行：
```bash
${PKG_MANAGER} test || {
    echo "❌ テストが失敗しています"
    echo "💡 失敗したテストを修正してから次のフェーズに進んでください"
    exit 1
}

echo "✅ すべてのテストがパスしました！"
```

CI設定の確認：
```bash
# GitHub Actionsの確認
if [ -f ".github/workflows/test.yml" ] || [ -f ".github/workflows/ci.yml" ]; then
    echo "✅ CI設定が存在します"
else
    echo "⚠️ CI設定が見つかりません。自動テストの設定を推奨します"
fi
```

テストフェーズのサマリー：
```bash
echo "🏁 テストフェーズのサマリー:"
echo "- テスト結果: .claude/context/{{task_name}}/test-results.md"
echo "- カバレッジレポート: coverage/lcov-report/index.html"
echo ""
echo "📊 品質指標:"
echo "- テストカバレッジ: 目標80%以上"
echo "- パフォーマンス: LCP < 2.5s"
echo "- アクセシビリティ: WCAG 2.1 AA準拠"
```

---
💡 **次のステップ**: `/verify {{task_name}}` コマンドで最終検証を実行してください。