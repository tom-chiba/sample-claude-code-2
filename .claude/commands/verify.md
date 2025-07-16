---
name: verify
description: 品質確認と最終チェック - リリース前の総合的な検証
shortcut: vfy
model: claude-opus-4-20250514
temperature: 0.2
maxTokens: 31999
---

# 検証フェーズ

<think>
タスク「{{task_name}}」の最終検証を行います。以下の観点から総合的に品質を確認してください：

1. **機能の完全性**
   - すべての要件が満たされているか
   - 期待される動作をするか
   - エッジケースが処理されているか

2. **コード品質**
   - コーディング規約の遵守
   - 可読性と保守性
   - 技術的負債の最小化

3. **パフォーマンス**
   - 応答時間の妥当性
   - リソース使用量
   - スケーラビリティ

4. **セキュリティ**
   - 脆弱性の有無
   - 適切な入力検証
   - 認証・認可の実装

5. **ドキュメント**
   - コードコメントの充実
   - APIドキュメント
   - 使用方法の説明
</think>

## ステップ0: 前提条件と環境情報の確認

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

# 前フェーズの成果物確認
MISSING_FILES=""
[ ! -f ".claude/context/{{task_name}}/investigation.md" ] && MISSING_FILES="${MISSING_FILES}investigation.md "
[ ! -f ".claude/context/{{task_name}}/plan.md" ] && MISSING_FILES="${MISSING_FILES}plan.md "
[ ! -f ".claude/context/{{task_name}}/implementation.md" ] && MISSING_FILES="${MISSING_FILES}implementation.md "
[ ! -f ".claude/context/{{task_name}}/test-results.md" ] && MISSING_FILES="${MISSING_FILES}test-results.md "

if [ -n "${MISSING_FILES}" ]; then
    echo "⚠️ 警告: 以下の成果物が見つかりません: ${MISSING_FILES}"
    echo "💡 不足しているフェーズを先に実行してください"
    exit 1
else
    echo "✅ すべての前フェーズの成果物を確認しました"
fi

# プロジェクト情報の読み込み
if [ -f ".claude/context/{{task_name}}/investigation.md" ]; then
    PROJECT_TYPE=$(grep "プロジェクトタイプ" .claude/context/{{task_name}}/investigation.md | cut -d: -f2 | xargs)
    PKG_MANAGER=$(grep "パッケージマネージャー" .claude/context/{{task_name}}/investigation.md | cut -d: -f2 | xargs)
    TEST_FRAMEWORK=$(grep "テストフレームワーク" .claude/context/{{task_name}}/investigation.md | cut -d: -f2 | xargs)
fi

if [ -f ".claude/context/{{task_name}}/plan.md" ]; then
    FEATURE_FLAG=$(grep "フィーチャーフラグ" .claude/context/{{task_name}}/plan.md | cut -d: -f2 | xargs)
fi

echo "📋 プロジェクト情報:"
echo "  - タイプ: ${PROJECT_TYPE}"
echo "  - パッケージマネージャー: ${PKG_MANAGER}"
echo "  - テストフレームワーク: ${TEST_FRAMEWORK}"
echo "  - フィーチャーフラグ: ${FEATURE_FLAG}"
```

## ステップ1: 実装完了状況の確認

これまでのフェーズの成果物を確認：
```bash
echo "📁 成果物一覧:"
ls -la .claude/context/{{task_name}}/
```

<file>.claude/context/{{task_name}}/investigation.md</file>
<file>.claude/context/{{task_name}}/plan.md</file>
<file>.claude/context/{{task_name}}/implementation.md</file>
<file>.claude/context/{{task_name}}/test-results.md</file>

TodoListの最終確認（すべて完了しているか）：
```bash
echo "📋 TodoListのステータスを確認してください"
echo "  - すべてのタスクが completed になっているか"
echo "  - 未完了のタスクがある場合は、実装を完了させてください"
```

## ステップ2: 静的解析の実行

### TypeScript型チェック
```bash
echo "🔍 TypeScript型チェック:"
npx tsc --noEmit --strict 2>&1 | tee typescript-check.log
TS_ERRORS=$(grep -c "error TS" typescript-check.log 2>/dev/null || echo "0")
if [ "${TS_ERRORS}" -gt 0 ]; then
    echo "❌ TypeScriptエラー: ${TS_ERRORS}件"
    head -20 typescript-check.log
else
    echo "✅ TypeScriptエラーなし"
    rm -f typescript-check.log
fi
```

### ESLint実行
```bash
echo "🔍 ESLint:"
${PKG_MANAGER} run lint 2>&1 | tee eslint-check.log
LINT_ERRORS=$(grep -c "error" eslint-check.log 2>/dev/null || echo "0")
if [ "${LINT_ERRORS}" -gt 0 ]; then
    echo "❌ Lintエラー: ${LINT_ERRORS}件"
else
    echo "✅ Lintエラーなし"
    rm -f eslint-check.log
fi
```

### Prettierフォーマットチェック
```bash
echo "🔍 コードフォーマット:"
npx prettier --check "src/**/*.{ts,tsx,js,jsx}" || {
    echo "💡 フォーマットを修正: npx prettier --write \"src/**/*.{ts,tsx,js,jsx}\""
}
```

### 未使用のコードの検出
```bash
echo "🔍 未使用コードの検出:"
if command -v knip >/dev/null 2>&1; then
    npx knip || echo "⚠️ 未使用のエクスポートが検出されました"
else
    echo "ℹ️ knipがインストールされていません"
    # 代替手段として簡易チェック
    echo "未使用の可能性があるexport:"
    rg "export (const|function|class|interface|type)" src/{{feature_path}} -A 1 | head -20
fi
```

## ステップ3: ビルドとバンドル分析

### プロダクションビルド
```bash
echo "🏗️ プロダクションビルド:"
${PKG_MANAGER} run build || handle_error $? "ビルドが失敗しました" "エラーログを確認してください"
```

### ビルドサイズの確認
```bash
echo "📦 ビルドサイズ:"
if [ -d ".next" ]; then
    du -sh .next/
    echo "主要なチャンク:"
    ls -lh .next/static/chunks/*.js 2>/dev/null | head -10
elif [ -d "dist" ]; then
    du -sh dist/
    echo "主要なファイル:"
    ls -lh dist/*.js 2>/dev/null | head -10
fi
```

### バンドル分析（可能な場合）
```bash
if [ -f "package.json" ] && grep -q "\"analyze\"" package.json; then
    echo "📊 バンドル分析を実行..."
    ${PKG_MANAGER} run analyze || echo "ℹ️ バンドル分析をスキップ"
else
    echo "ℹ️ バンドル分析スクリプトが設定されていません"
fi
```

### Core Web Vitalsの推奨値
```bash
echo "🎯 Core Web Vitals目標値:"
echo "  - LCP (Largest Contentful Paint): < 2.5s"
echo "  - FID (First Input Delay): < 100ms"  
echo "  - CLS (Cumulative Layout Shift): < 0.1"
echo "  - INP (Interaction to Next Paint): < 200ms"
```

## ステップ4: セキュリティチェック

### 依存関係の脆弱性チェック
```bash
echo "🔒 セキュリティ監査:"
${PKG_MANAGER} audit 2>&1 | tee security-audit.log
CRITICAL_VULNS=$(grep -c "critical" security-audit.log 2>/dev/null || echo "0")
HIGH_VULNS=$(grep -c "high" security-audit.log 2>/dev/null || echo "0")

if [ "${CRITICAL_VULNS}" -gt 0 ] || [ "${HIGH_VULNS}" -gt 0 ]; then
    echo "⚠️ セキュリティ脆弱性が検出されました:"
    echo "  - Critical: ${CRITICAL_VULNS}"
    echo "  - High: ${HIGH_VULNS}"
    echo "💡 修正: ${PKG_MANAGER} audit fix"
else
    echo "✅ 重大な脆弱性なし"
fi
```

### 機密情報の漏洩チェック
```bash
echo "🔍 機密情報の検出:"
SECRETS=$(rg -i "(api_key|secret|password|token|private_key)" --type-add 'web:*.{ts,tsx,js,jsx,json}' -t web -g '!*.test.*' -g '!*.spec.*' | grep -v "// " | grep -v "process.env" | wc -l)
if [ "${SECRETS}" -gt 0 ]; then
    echo "⚠️ 潜在的な機密情報が検出されました: ${SECRETS}件"
    rg -i "(api_key|secret|password|token)" --type-add 'web:*.{ts,tsx,js,jsx}' -t web -g '!*.test.*' | head -10
else
    echo "✅ ハードコードされた機密情報なし"
fi
```

### 環境変数の確認
```bash
echo "📋 環境変数の設定:"
if [ -f ".env.example" ]; then
    echo "✅ .env.exampleが存在します"
    grep -c "=" .env.example | xargs echo "  - 環境変数数:"
else
    echo "⚠️ .env.exampleが見つかりません"
    echo "💡 環境変数のドキュメント化を推奨します"
fi
```

### ブランチ保護ルールの確認
```bash
if command -v gh >/dev/null 2>&1; then
    echo "🔒 ブランチ保護ルール:"
    gh repo view --json defaultBranchRef -q '.defaultBranchRef.branchProtectionRule' || echo "ℹ️ ブランチ保護ルールが設定されていません"
fi
```

## ステップ5: アクセシビリティ確認

<think>
アクセシビリティは重要な品質指標です。以下を確認してください：

1. **キーボードナビゲーション**: すべての機能がキーボードで操作可能
2. **スクリーンリーダー対応**: 適切なARIA属性
3. **カラーコントラスト**: WCAG基準の遵守
4. **フォーカス管理**: 明確なフォーカスインジケーター
</think>

アクセシビリティ関連の属性を確認：
```bash
echo "♿ アクセシビリティチェック:"
ARIA_COUNT=$(rg "aria-|role=" --type-add 'web:*.{tsx,jsx}' -t web | wc -l)
ALT_COUNT=$(rg "alt=" --type-add 'web:*.{tsx,jsx}' -t web | wc -l)
echo "  - ARIA属性: ${ARIA_COUNT}件"
echo "  - alt属性: ${ALT_COUNT}件"

# フォーカス管理の確認
TABINDEX=$(rg "tabIndex" --type-add 'web:*.{tsx,jsx}' -t web | wc -l)
echo "  - tabIndex使用: ${TABINDEX}件"
```

アクセシビリティ自動テストツールの推奨：
```bash
echo "🔧 推奨ツール:"
echo "  - axe DevTools (ブラウザ拡張)"
echo "  - @axe-core/react (開発時の自動チェック)"
echo "  - pa11y (CI/CDでの自動テスト)"
```

## ステップ6: ドキュメントの確認

### コードコメントの密度確認
```bash
echo "📝 コードコメントの統計:"
TOTAL_LINES=$(find src/{{feature_path}} -name "*.ts" -o -name "*.tsx" 2>/dev/null | xargs wc -l | tail -1 | awk '{print $1}')
COMMENT_LINES=$(rg "//|/\*|\*/" --type-add 'web:*.{ts,tsx}' -t web src/{{feature_path}} 2>/dev/null | wc -l)
if [ "${TOTAL_LINES}" -gt 0 ]; then
    COMMENT_RATIO=$((COMMENT_LINES * 100 / TOTAL_LINES))
    echo "  - 総行数: ${TOTAL_LINES}"
    echo "  - コメント行数: ${COMMENT_LINES}"
    echo "  - コメント率: ${COMMENT_RATIO}%"
else
    echo "  - ファイルが見つかりません"
fi
```

### README更新の確認
```bash
echo "📚 ドキュメントの更新状況:"
if grep -qi "{{feature_name}}" README.md 2>/dev/null; then
    echo "✅ READMEに{{feature_name}}の記載あり"
else
    echo "⚠️ READMEに{{feature_name}}の記載なし"
    echo "💡 新機能のドキュメント追加を推奨します"
fi
```

### 型定義のエクスポート確認
```bash
echo "📦 公開API（型定義）:"
rg "export (type|interface)" src/{{feature_path}} -A 1 | head -20
```

### JSDocコメントの確認
```bash
echo "📖 JSDocコメント:"
JSDoc_COUNT=$(rg "/\*\*" --type-add 'web:*.{ts,tsx}' -t web src/{{feature_path}} | wc -l)
echo "  - JSDocコメント数: ${JSDoc_COUNT}"
```

## ステップ7: 統合テスト（手動確認）

<think>
自動テストでカバーしきれない部分を手動で確認してください：

1. **ユーザーフロー全体の動作**
2. **異なるブラウザでの動作**
3. **異なる画面サイズでの表示**
4. **実際のユーザー体験**
</think>

手動テストチェックリスト：
```bash
echo "🧪 手動テストチェックリスト:"
echo "□ Chrome/Edge での動作確認"
echo "□ Firefox での動作確認"
echo "□ Safari での動作確認（Mac環境）"
echo "□ モバイルビューでの表示確認"
echo "□ タブレットビューでの表示確認"
echo "□ キーボードのみでの操作確認"
echo "□ スクリーンリーダーでの確認（可能な場合）"
echo "□ ネットワーク遅延時の動作確認"
echo "□ オフライン時の動作確認"
```

開発サーバーの起動（手動テスト用）：
```bash
echo "🚀 手動テストのため開発サーバーを起動してください:"
echo "${PKG_MANAGER} run dev"
```

## ステップ8: パフォーマンス最終確認

### ビルド時間の記録
```bash
echo "⏱️ ビルド時間の測定:"
BUILD_START=$(date +%s)
${PKG_MANAGER} run build > /dev/null 2>&1
BUILD_END=$(date +%s)
BUILD_TIME=$((BUILD_END - BUILD_START))
echo "  - ビルド時間: ${BUILD_TIME}秒"
```

### メモリ使用量の確認
```bash
echo "💾 プロセスのメモリ使用量:"
ps aux | grep -E "node|next" | grep -v grep | head -5
```

## ステップ9: 検証結果のまとめ

検証結果を文書化：
```bash
# 各種チェック結果の集計
TOTAL_ISSUES=0
CRITICAL_ISSUES=0

# TypeScriptエラー
[ "${TS_ERRORS:-0}" -gt 0 ] && TOTAL_ISSUES=$((TOTAL_ISSUES + TS_ERRORS)) && CRITICAL_ISSUES=$((CRITICAL_ISSUES + 1))

# Lintエラー
[ "${LINT_ERRORS:-0}" -gt 0 ] && TOTAL_ISSUES=$((TOTAL_ISSUES + LINT_ERRORS))

# セキュリティ脆弱性
[ "${CRITICAL_VULNS:-0}" -gt 0 ] && CRITICAL_ISSUES=$((CRITICAL_ISSUES + CRITICAL_VULNS))
[ "${HIGH_VULNS:-0}" -gt 0 ] && CRITICAL_ISSUES=$((CRITICAL_ISSUES + HIGH_VULNS))

# リリース判定
if [ "${CRITICAL_ISSUES}" -gt 0 ]; then
    RELEASE_DECISION="❌ リリース不可"
    RELEASE_REASON="重大な問題が${CRITICAL_ISSUES}件見つかりました"
elif [ "${TOTAL_ISSUES}" -gt 5 ]; then
    RELEASE_DECISION="⚠️ 条件付きリリース"
    RELEASE_REASON="軽微な問題が${TOTAL_ISSUES}件あります"
else
    RELEASE_DECISION="✅ リリース可能"
    RELEASE_REASON="品質基準を満たしています"
fi

cat > .claude/context/{{task_name}}/verification.md << EOF
# {{task_name}} - 検証結果

## 検証実施日時
$(date)

## プロジェクト情報
- **プロジェクトタイプ**: ${PROJECT_TYPE}
- **パッケージマネージャー**: ${PKG_MANAGER}
- **テストフレームワーク**: ${TEST_FRAMEWORK}
- **フィーチャーフラグ**: ${FEATURE_FLAG}

## 機能要件の充足
- [x] 基本機能の実装完了
- [x] テストの作成完了
- [ ] ドキュメントの更新（要確認）

## 品質チェック結果
### コード品質
- TypeScriptエラー: ${TS_ERRORS:-0}件
- Lintエラー: ${LINT_ERRORS:-0}件
- フォーマット: $([ -z "${FORMAT_ISSUES}" ] && echo "✅ OK" || echo "要修正")

### パフォーマンス
- ビルド時間: ${BUILD_TIME:-未測定}秒
- ビルドサイズ: $(du -sh .next 2>/dev/null | cut -f1 || du -sh dist 2>/dev/null | cut -f1 || echo "未測定")
- Core Web Vitals: 手動確認が必要

### セキュリティ
- Critical脆弱性: ${CRITICAL_VULNS:-0}件
- High脆弱性: ${HIGH_VULNS:-0}件
- 機密情報の検出: ${SECRETS:-0}件

### アクセシビリティ
- ARIA属性: ${ARIA_COUNT:-0}件
- alt属性: ${ALT_COUNT:-0}件
- キーボード操作: 手動確認が必要

## 残課題
$([ "${TOTAL_ISSUES}" -gt 0 ] && echo "- 検出された問題の修正（${TOTAL_ISSUES}件）" || echo "- なし")

## リリース判定
${RELEASE_DECISION}
理由: ${RELEASE_REASON}

## 推奨事項
- 定期的なセキュリティ監査の実施
- パフォーマンスモニタリングの設定
- ユーザーフィードバックの収集体制構築
EOF

handle_error $? "検証結果の保存に失敗しました" "ディスクの空き容量を確認してください"
```

## ステップ10: 最終判定

<think>
すべての検証が完了しました。以下の基準でリリース可否を判定してください：

**リリース可能な条件:**
- すべての機能要件が満たされている
- クリティカルなバグがない
- パフォーマンス基準を満たしている
- セキュリティ上の問題がない
- テストカバレッジが十分

**条件付きリリースの場合:**
- 軽微な問題は残っているが、後で修正可能
- ドキュメントの改善余地がある
- パフォーマンスの最適化余地がある

**リリース不可の場合:**
- クリティカルなバグが存在
- セキュリティ脆弱性が存在
- 主要機能が動作しない
</think>

## ステップ11: フィーチャーフラグの確認

フィーチャーフラグの状態確認：
```bash
echo "🚦 フィーチャーフラグ設定:"
if [ -n "${FEATURE_FLAG}" ]; then
    echo "  - フラグ名: ${FEATURE_FLAG}"
    echo "  - 推奨リリース戦略:"
    echo "    1. 開発環境: 100%有効"
    echo "    2. ステージング: 100%有効"
    echo "    3. 本番環境: 10% → 50% → 100%"
    
    # 環境変数での設定確認
    if grep -q "${FEATURE_FLAG}" .env* 2>/dev/null; then
        echo "  ✅ フィーチャーフラグが設定されています"
    else
        echo "  ⚠️ フィーチャーフラグが.envに設定されていません"
    fi
fi
```

## 完了確認

最終チェックリスト：
```bash
echo "✅ 最終チェックリスト:"
echo "□ すべての要件が実装されている"
echo "□ すべてのテストがパスしている"
echo "□ ビルドが成功する"
echo "□ コード品質基準を満たしている"
echo "□ ドキュメントが適切に更新されている"
echo "□ セキュリティチェックをパスしている"
echo "□ パフォーマンス基準を満たしている"
echo "□ アクセシビリティ要件を満たしている"
```

検証完了の確認：
```bash
echo ""
echo "🎉 検証フェーズ完了！"
echo ""
echo "📊 検証サマリー:"
echo "  - 総合判定: ${RELEASE_DECISION}"
echo "  - 検出された問題: ${TOTAL_ISSUES}件"
echo "  - 重大な問題: ${CRITICAL_ISSUES}件"
echo ""
echo "📄 詳細な検証結果:"
echo "  .claude/context/{{task_name}}/verification.md"
echo ""
echo "🚀 次のアクション:"
if [ "${CRITICAL_ISSUES}" -eq 0 ]; then
    echo "  1. プルリクエストの作成"
    echo "  2. コードレビューの依頼"
    echo "  3. ステージング環境でのテスト"
    echo "  4. 本番環境へのデプロイ"
else
    echo "  1. 検出された問題の修正"
    echo "  2. 再度検証フェーズの実行"
fi
```

---
🎉 **タスク完了**: {{task_name}}の開発サイクルが完了しました。
📋 **成果物**: `.claude/context/{{task_name}}/` ディレクトリに全フェーズの記録が保存されています。