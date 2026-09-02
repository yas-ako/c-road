# C\*-road 開発方針

> この文書はソースコードの設計、主要アルゴリズム、今後の実装順序を記録する。正式なゲームルールは [rules.md](rules.md) を参照する。対戦形式の表示名は未確定であり、本文中の識別子はコード上の仮称である。

## 基本方針

- ゲームルールを Vue と Pinia から分離する。
- 局面は TypeScript のデータで表現し、ルールは純粋関数として実装する。
- 元の局面を変更せず、手を適用した結果として新しい局面を返す。
- UI、CPU、調査用コードは同じゲームエンジンを利用する。
- 道路配置、取り壊し、接続判定など、両対戦形式で共通すると確定している処理だけを共通化する。
- 街をつなぐ形式と周回路を作る形式を具体的に実装してから、両者に現れた同じ進行処理を抽出する。
- クラス継承や推測に基づく汎用化を先に作らず、型、データ、関数の合成を用いる。
- 対戦形式の表示名とコード上の識別子を分離する。

## 「手」と対局操作

盤上へ作用する「手」と、投了などの対局全体に対する操作を区別する。

```ts
type GameMove = PlaceRoadMove | ExtendTownMove;
```

合法手生成には投了を含めない。これにより、合法手が存在しない局面の判定や、CPUによる手の選択に投了が混ざることを防ぐ。投了はゲームエンジンの別操作として扱う。

## データモデル

### 盤面

```ts
type PlayerColor = "blue" | "red";

type Coordinate = Readonly<{
  x: number;
  y: number;
}>;

type Cell =
  | Readonly<{ kind: "empty" }>
  | Readonly<{ kind: "road"; color: PlayerColor; level: number }>
  | Readonly<{ kind: "town"; townId: TownId }>;
```

街はどちらの色にも属さないため、`town` のセルには色や所有者を持たせない。

### 局面

対戦形式ごとの局面は `mode` を判別子に持つ。

```ts
type TownConnectionGameState = Readonly<{
  mode: "town-connection";
  board: Board;
  phase:
    | "placing-north-west-town"
    | "placing-south-east-town"
    | "placing-roads";
  currentPlayer: PlayerColor;
  turn: number;
  result: GameResult | null;
}>;

type WindingCycleGameState = Readonly<{
  mode: "winding-cycle";
  board: Board;
  phase: "placing-roads";
  currentPlayer: PlayerColor;
  turn: number;
  result: GameResult | null;
}>;

type GameState = TownConnectionGameState | WindingCycleGameState;
```

`town-connection` と `winding-cycle` は内部識別子であり、画面上の対戦形式名ではない。

実際の初期状態は各ゲームエンジンが生成する。任意の盤面を持つ局面が必要なテストでは、実際には存在しない「初期状態」を本番APIに追加せず、テスト用ビルダーを使用する。

### 対局結果

勝利、投了、引き分けを同じ `result` で表現する。結果の種類と勝利条件を判別可能にする。

```ts
type TownConnectionWin = Readonly<{
  type: "win";
  condition: "town-connection";
  winner: PlayerColor;
  roadPath: readonly Coordinate[];
  townConnections: readonly [TownRoadConnection, TownRoadConnection];
}>;

type WindingCycleWin = Readonly<{
  type: "win";
  condition: "winding-cycle";
  winner: PlayerColor;
  roadCycle: readonly Coordinate[];
  winding: Coordinate;
}>;

type ResignationResult = Readonly<{
  type: "win";
  condition: "resignation";
  winner: PlayerColor;
  resignedPlayer: PlayerColor;
}>;

type DrawResult = Readonly<{
  type: "draw";
  reason: "no-legal-moves";
}>;

type GameResult =
  | TownConnectionWin
  | WindingCycleWin
  | ResignationResult
  | DrawResult;
```

`WindingCycleWin.roadCycle` は閉じた経路であることを明示するため、先頭の論理座標を末尾にも含める。`winding` は盤面サイズで割った左右・上下の巻き数を表す。

## ゲームエンジン

UI、CPU、解析が利用する境界として `GameEngine` を定義する。

```ts
type GameEngine<State extends GameState> = Readonly<{
  id: State["mode"];
  createInitialState(): State;
  getLegalMoves(state: State): readonly GameMove[];
  validateMove(state: State, move: GameMove): MoveValidation;
  applyMove(state: State, move: GameMove): TransitionResult<State>;
  resign(state: State, player: PlayerColor): TransitionResult<State>;
}>;
```

`TransitionResult` は成功時の次の局面とイベント、失敗時の元の局面と理由を返す。投了も終了済みの対局や手番外のプレイヤーからは拒否できる形にする。

最初に次の2つを具体的に実装する。

```ts
const townConnectionGame: GameEngine<TownConnectionGameState>;
const windingCycleGame: GameEngine<WindingCycleGameState>;
```

この段階では、細かなモード用フックを受け取る `createGameEngine` のようなファクトリーを先に設計しない。2つの具体的なエンジンを比較し、同じになった進行処理だけを後から抽出する。

画面上の対戦セッションは `GameState.mode` を唯一の判別情報とし、純粋な振り分け関数を通して対応するエンジンを呼び出す。エンジンオブジェクトはPiniaへ保存しない。モードの分岐は網羅的な `switch` とし、対戦形式を追加した際は未対応箇所を型検査で検出する。新しい対局の開始と再開始はセッションAPIだけが担当し、盤面と同時に選択、投了確認、通知、演出タイマーを破棄する。

## 道路配置の共通処理

道路を置いてから取り壊し後の盤面を確定するまでを、対戦形式に依存しない処理として分離する。

```ts
type RoadPlacement = Readonly<{
  coordinate: Coordinate;
  color: PlayerColor;
  level: number;
}>;

type RoadPlacementResolution = Readonly<{
  boardBeforeDemolition: Board;
  board: Board;
  removedCells: readonly Coordinate[];
}>;

function resolveRoadPlacement(
  board: Board,
  placement: RoadPlacement,
): RoadPlacementResolution;
```

この関数は次の処理だけを担当する。

1. 道を配置する。
2. 配置直後の同じ盤面から取り壊し対象をすべて収集する。
3. 対象の重複を除いて同時に取り壊す。
4. 取り壊し前と取り壊し後の盤面、および対象座標を返す。

勝利判定、引き分け、手番交代、ターン更新、演出は担当しない。道路配置の合法性は、現在の配置上限計算を利用する共通の検証処理で判定する。

## 対戦形式

### 街をつなぐ形式

次を1つの具体的なゲームエンジンとしてまとめる。

- 街の固定マスを含む初期盤面
- 左上側と右下側の街の配置
- 街配置中の合法手、検証、適用
- 道路配置後の街接続判定
- 勝利経路と街への接続箇所の記録

UIは当面このエンジンだけを使用する。

### 周回路を作る形式

UIを接続する前に、次を備えたヘッドレスなゲームエンジンとして実装する。

- 街を含まない空の13×13盤から開始する。
- 青の道路配置から開始する。
- 道路配置、上限、取り壊しは共通処理を使用する。
- 取り壊し後の盤面で有効な周回路を判定する。
- 勝利に使用した周回路と巻き数を記録する。

対戦形式の表示名、選択画面、周回路の強調デザインはこの段階では実装しない。

## 1手の解決順序

道路を置く手は次の順序で解決する。

1. 手と手番の合法性を検証する。
2. 道を配置する。
3. 取り壊し対象をすべて決定する。
4. 対象を同時に取り壊す。
5. 取り壊し後の盤面で、その対戦形式の勝利条件を判定する。
6. 勝者がいなければ、次の手番となるプレイヤーに盤上の合法手が残っているかを判定する。
7. 合法手がなければ引き分けとする。
8. 対局が続く場合は手番を交代する。

ゲームエンジンは演出待ちを行わず、確定局面と演出に必要なイベントを即座に返す。投了は盤上の合法手とは別に処理し、相手の勝利として結果を確定する。

## 主要アルゴリズム

### 取り壊し

道を配置した直後の盤面を読み取り専用の入力として、盤面全体を8方向に探索する。探索中に盤面を書き換えず、見つけた対象座標を集合へ入れる。探索終了後にすべての対象を同時に空きマスへ変更する。

盤面は169マスと小さいため、最初は盤面全体を再探索する。差分更新は数手先の探索で実測上必要になってから検討する。

### 街をつなぐ経路

青と赤の道路網を別々に DFS または BFS で探索する。同じ色で道路番号の差が1以下の辺だけをたどり、1つの連結成分が2つの街の両方に隣り合うかを調べる。

勝利経路を表示できるように探索時の親を記録し、勝利結果に経路と街への接続箇所を保存する。

### 有効な周回路

同じ色でつながった道路網を DFS または BFS で探索する。各論理マスには、トーラスの折り返しを行わない仮想座標を記録する。

現在のマスから方向 `direction` へ移動したとき、隣接マスに期待する仮想座標を次で求める。

```ts
expected = lifted[current] + direction;
```

- 隣接マスが未探索なら、`expected` と親を記録する。
- 探索済みで記録済み座標と `expected` が一致するなら、通常の接続または収縮可能な閉路である。
- 一致しないなら、トーラスを周回する閉路が存在する。

差分は盤面サイズ13の倍数になることを検証し、13で割って巻き数を得る。

```ts
const displacement = expected - recorded;
const winding = displacement / BOARD_SIZE;
```

矛盾を見つけた辺の両端から探索木の親をたどり、共通祖先を介して結合する。最後に矛盾を見つけた辺を加えて、勝利に使用した閉じた経路を復元する。

座標と方向を一定の順序で探索し、複数の有効な周回路がある場合は最初に見つかったものを返す。この選択順は勝敗のルールではなく、表示とテストを安定させるための実装上の取り決めである。

周回路判定は `O(盤面のマス数 + 接続辺数)` で行い、すべての経路は列挙しない。

## 周回路判定の主なテスト

勝利しない例として次を確認する。

- 空盤面と一本道
- 境界を越えるが閉じていない道
- 盤面中央の小さな閉路
- 境界をまたぐが巻き数が0の小さな閉路
- 道路番号差が2以上で切れている一周
- 異なる色が混ざって切れている一周

勝利する例として次を確認する。

- 左右、上下、斜め方向の一周
- 分岐した道路網の一部に含まれる有効な周回路
- 複数の連結成分のうち1つだけに含まれる有効な周回路
- 左右と上下の両方に非ゼロの巻き数を持つ周回路

1手の処理との組み合わせとして次を確認する。

- 最後の道を置いて周回路が完成する。
- 配置直後には完成するが、置いた道が取り壊されて勝利しない。
- 既存の道が取り壊されて周回路が切れる。
- 勝利後は手、投了ともに受け付けない。

返された周回路については、座標列そのものへ過度に依存せず、閉じていること、各辺が実際につながること、同じ色であること、巻き数が0でないことを検証する。

## 合法手生成と解析

合法手生成はゲームエンジンの公開APIを使用する。CPUや解析コードは、対戦形式固有の候補生成を直接呼び出さない。

解析はエンジンから得た各道路配置を、同じエンジンで実際に適用して結果を観察する。

```ts
type ImmediateRoadMoveAnalysis<State extends GameState> = Readonly<{
  move: PlaceRoadMove;
  nextState: State;
  events: readonly GameEvent[];
  removedCells: readonly Coordinate[];
  placedRoadRemains: boolean;
  boardChanged: boolean;
}>;
```

解析コードは合法性、取り壊し、勝利条件を再実装しない。また、手を「好手」「悪手」などに分類せず、まず確定した事実だけを返す。

盤面全体の1手先解析は調査用途で都度実行する。Vue のリアクティブ計算や描画のたびには実行しない。数手先探索、差分取り壊し、局面キャッシュは CPU 実装時に改めて計測して導入する。

## Pinia と UI の責務

### Pinia

- 使用するゲームエンジンと現在の確定局面を保持する。
- UIから受け取った手と投了をゲームエンジンへ渡す。
- ゲーム開始、リセット、ページ離脱時の破棄を行う。
- 取り壊し演出などの解決中は操作を受け付けない。

### UI

- 選択中のマスと入力中の道路番号を保持する。
- 上限と取り壊しの通知を表示する。
- 取り壊しまでの待機と表示演出を担当する。
- 取り壊し演出中は、`boardBeforeDemolition` を表示して対象マスを強調する。
- 投了前の確認と、対局結果の表示を担当する。
- 対局結果の `type` と `condition` に応じて勝利経路を描画する。
- 13×13の論理座標を15×15の表示盤面へ写像する。

タイマーはゲームルールの一部にしない。ページを離れたときは局面、通知、表示用スナップショット、演出タイマーを破棄し、戻った場合は新しい対局を開始する。

## CPU 対戦への備え

CPU は Pinia や UI を操作せず、選択された `GameEngine` の合法手生成と局面適用を利用する。

```ts
type ChooseMove<State extends GameState> = (
  engine: GameEngine<State>,
  state: Readonly<State>,
) => Promise<GameMove>;
```

最初は合法手からランダムに選べる境界まで整える。投了は合法手へ含めない。評価関数、数手先探索、枝刈り、局面キャッシュは別の実装段階とする。

## 想定するファイル構成

```text
src/game/
  moveTypes.ts
  board.ts
  engine.ts
  gameModes.ts
  state.ts
  roadResolution.ts
  rules/
    placement.ts
    demolition.ts
    connectivity.ts
    townPlacement.ts
    townConnectivity.ts
    windingCycle.ts
  modes/
    townConnection/
      game.ts
    windingCycle/
      game.ts
  analysis/
    immediateRoadMoves.ts
```

既存ファイルを構成に合わせるためだけに一度に移動せず、責務を分離する変更に伴って段階的に整理する。

## 実装状況

上記の共通基盤、2つのヘッドレスなゲームエンジン、複数モードを扱う対戦セッション、投了と引き分け、合法手生成、1手先解析まで実装済みである。現在のUIは街接続形式から開始するが、セッションAPIから周回形式を開始して共通の道路入力、取り壊し演出、投了、リスタートを利用できる。

盤面全体の1手先解析は、街をつなぐ形式の0手・40手・100手時点の代表局面で数十ミリ秒以内だった。現段階では盤面差分、局面キャッシュ、並列化を導入せず、CPUの数手先探索へ進む際に改めて計測する。

投了ボタンと確認UIは実装済みである。対戦形式の選択画面と周回路の強調表示は未実装であり、これらは表示名と画面仕様が決まってから進める。

## 完了条件

- 街をつなぐ形式と周回路を作る形式の2つのヘッドレスなエンジンが存在する。
- 道路配置と取り壊しは一か所に実装されている。
- 各対戦形式の初期化と勝利判定は互いを参照しない。
- UIと解析が `GameEngine` の公開APIを利用し、将来のCPUも同じAPIを利用できる。
- 投了は合法手生成へ混ざらない。
- 引き分けを勝利結果の特殊形として扱わない。
- 周回路の勝利経路と巻き数を取得できる。
- 元の局面を変更しない。
- 現在の街をつなぐ形式の動作と表示が維持される。
- 全テスト、型検査、Lint、整形、ビルドが通る。
- 盤面全体の1手先解析が調査用途として実用的な時間で完了する。
