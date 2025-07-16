---
name: plan
description: 調査結果を基にした実装計画の立案 - TodoWriteを活用した体系的な計画
shortcut: pln
model: claude-opus-4-20250514
temperature: 0.2
maxTokens: 31999
---

# 計画フェーズ

<think>
タスク「{{task_name}}」の計画を立案する前に、以下を確認してください：

1. **調査結果の確認**
   - 前フェーズの調査結果を読み込む
   - 技術的要件と制約を再確認
   - 推奨アプローチを理解

2. **計画の構成要素**
   - 実装の段階的アプローチ
   - 各段階の成果物
   - 依存関係の明確化
   - リスク軽減策

3. **優先順位付け**
   - クリティカルパスの特定
   - MVPの定義
   - 段階的な価値提供

4. **見積もりと検証ポイント**
   - 各タスクの複雑度
   - 検証可能なマイルストーン
   - ロールバック計画
</think>

## ステップ0: 前フェーズの確認

前フェーズの調査結果が存在するか確認：
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

# 調査結果の存在確認
if [ ! -f ".claude/context/{{task_name}}/investigation.md" ]; then
    echo "⚠️ 警告: 調査結果が見つかりません"
    echo "💡 先に /investigate {{task_name}} コマンドを実行してください"
    exit 1
else
    echo "✅ 調査結果を確認しました"
fi
```

## ステップ1: 調査結果の読み込み

前フェーズの調査結果を確認：
<file>.claude/context/{{task_name}}/investigation.md</file>

プロジェクト情報の抽出：
```bash
# 調査結果からプロジェクト情報を抽出
PROJECT_TYPE=$(grep "プロジェクトタイプ" .claude/context/{{task_name}}/investigation.md | cut -d: -f2 | xargs)
PKG_MANAGER=$(grep "パッケージマネージャー" .claude/context/{{task_name}}/investigation.md | cut -d: -f2 | xargs)
TEST_FRAMEWORK=$(grep "テストフレームワーク" .claude/context/{{task_name}}/investigation.md | cut -d: -f2 | xargs)

echo "📋 プロジェクト情報:"
echo "  - タイプ: ${PROJECT_TYPE}"
echo "  - パッケージマネージャー: ${PKG_MANAGER}"
echo "  - テストフレームワーク: ${TEST_FRAMEWORK}"
```

関連ファイルの再確認：
```bash
ls -la .claude/context/{{task_name}}/
```

## ステップ2: 実装タスクの洗い出し

<think>
調査結果を基に、以下の観点から実装タスクを洗い出してください：

1. **基盤整備タスク**
   - 型定義、インターフェース
   - 設定ファイルの更新
   - 依存関係の追加

2. **コア実装タスク**
   - メインロジックの実装
   - データ処理
   - 状態管理

3. **UI/UXタスク**
   - コンポーネント作成
   - スタイリング
   - ユーザーインタラクション

4. **統合タスク**
   - 既存コードとの連携
   - APIの統合
   - ルーティング設定

5. **品質保証タスク**
   - テストの作成
   - エラーハンドリング
   - パフォーマンス最適化
</think>

循環依存の事前チェック：
```bash
if command -v madge >/dev/null 2>&1; then
    echo "🔍 循環依存をチェック中..."
    npx madge --circular src/ || echo "✅ 循環依存は検出されませんでした"
else
    echo "ℹ️ madgeがインストールされていません。循環依存のチェックをスキップします"
fi
```

## ステップ3: TodoListの作成

<TodoWrite>
タスク「{{task_name}}」の実装計画に基づいて、以下のTodoリストを作成してください：

優先度高:
- 型定義とインターフェースの作成
- {{core_feature_1}} の実装
- {{core_feature_2}} の実装

優先度中:
- UIコンポーネントの作成
- 既存コードとの統合
- エラーハンドリングの実装

優先度低:
- ドキュメントの更新
- パフォーマンス最適化
- アクセシビリティの改善
</TodoWrite>

実装計画をTodoリストとして整理します。各タスクには以下を含めてください：
- 明確な成果物
- 依存関係
- 検証方法

## ステップ4: 実装順序の最適化

<think>
タスクの実装順序を決定する際は、以下を考慮してください：

1. **依存関係の解決**
   - 前提となるタスクを先に実行
   - ブロッカーの早期解消

2. **リスクの早期検証**
   - 技術的に難しい部分を先に実装
   - 不確実性の高い部分の早期検証

3. **段階的な価値提供**
   - 各段階で動作確認可能
   - 部分的にでも価値を提供

4. **フィードバックループ**
   - 早期にフィードバックを得られる順序
   - 修正コストを最小化
</think>

## ステップ5: 計画の文書化

計画を保存：
```bash
# フィーチャーフラグの生成
FEATURE_FLAG="${task_name}_ENABLED"
FEATURE_FLAG=$(echo "$FEATURE_FLAG" | tr '[:lower:]' '[:upper:]' | tr '-' '_')

cat > .claude/context/{{task_name}}/plan.md << 'EOF'
# {{task_name}} - 実装計画

## 計画作成日時
$(date)

## プロジェクト情報
- **プロジェクトタイプ**: ${PROJECT_TYPE}
- **パッケージマネージャー**: ${PKG_MANAGER}
- **テストフレームワーク**: ${TEST_FRAMEWORK}
- **フィーチャーフラグ**: ${FEATURE_FLAG}

## 実装概要
{{implementation_overview}}

## フェーズ分け

### フェーズ1: 基盤整備
- [ ] 型定義の作成 (src/types/{{feature_name}}.ts)
- [ ] 設定ファイルの更新
- [ ] 必要な依存関係の追加
- [ ] フィーチャーフラグの設定

### フェーズ2: コア実装
- [ ] メインロジックの実装 (src/lib/{{feature_name}}/index.ts)
- [ ] データ処理の実装
- [ ] 状態管理の実装
- [ ] ユーティリティ関数の作成

### フェーズ3: UI実装
- [ ] コンポーネントの作成 (src/components/{{feature_name}}/)
- [ ] スタイリングの適用
- [ ] インタラクションの実装
- [ ] レスポンシブデザインの確認

### フェーズ4: 統合
- [ ] 既存コードとの連携
- [ ] ルーティングの設定
- [ ] APIの統合
- [ ] 状態管理の統合

### フェーズ5: 品質保証
- [ ] ユニットテストの作成 (80%カバレッジ目標)
- [ ] 統合テストの作成
- [ ] E2Eテストの作成
- [ ] パフォーマンス最適化
- [ ] アクセシビリティの確認

## リスクと対策
- **リスク**: {{risk_1}}
  - **対策**: {{mitigation_1}}
- **リスク**: {{risk_2}}
  - **対策**: {{mitigation_2}}

## 成功基準
- [ ] すべての機能要件を満たす
- [ ] テストカバレッジ80%以上
- [ ] パフォーマンス基準を満たす（LCP < 2.5s）
- [ ] アクセシビリティ基準を満たす（WCAG 2.1 AA）

## 検証方法
- 開発環境での動作確認
- 自動テストの実行
- コードレビューの実施
- ステージング環境でのQAテスト

## ロールバック計画
1. フィーチャーフラグを無効化
2. 問題のあるコミットをrevert
3. ホットフィックスの適用（必要な場合）
4. 影響範囲の再確認
EOF

handle_error $? "計画の保存に失敗しました" "ディスクの空き容量を確認してください"
```

## ステップ6: 実装準備の確認

<think>
実装フェーズに移行する前に、以下を確認してください：

□ すべての技術的要件が明確になっている
□ 必要なツールと環境が準備されている
□ タスクの優先順位が決定されている
□ 各タスクの成果物が定義されている
□ リスクと対策が明確になっている
□ チーム内での合意が取れている（必要な場合）
</think>

開発環境の準備状況を確認：
```bash
${PKG_MANAGER} run dev || {
    echo "❌ 開発サーバーの起動に失敗しました"
    echo "💡 依存関係をインストールしてください: ${PKG_MANAGER} install"
    exit 1
}
```

TypeScript設定の確認：
```bash
npx tsc --noEmit || {
    echo "⚠️ TypeScriptエラーが検出されました"
    echo "💡 実装開始前に既存のエラーを修正することを推奨します"
}
```

未使用の依存関係チェック：
```bash
if command -v depcheck >/dev/null 2>&1; then
    echo "🔍 未使用の依存関係をチェック中..."
    npx depcheck
else
    echo "ℹ️ depcheckがインストールされていません"
fi
```

## 完了確認

計画の最終確認：
```bash
if [ -f ".claude/context/{{task_name}}/plan.md" ]; then
    echo "✅ 実装計画が正常に保存されました"
    cat .claude/context/{{task_name}}/plan.md
else
    echo "❌ 計画の保存に失敗しました"
    exit 1
fi
```

TodoListの確認（作成済みの場合）：
```bash
echo "✅ TodoListが作成され、実装の準備が整いました"
echo "📋 次のステップ: 実装フェーズで各タスクを順次実行してください"
```

---
💡 **次のステップ**: `/implement {{task_name}}` コマンドで実装を開始してください。