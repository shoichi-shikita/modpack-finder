// Japanese one-line summaries for well-known mods, keyed by Modrinth slug.
//
// Why: the Modrinth API only returns English descriptions, so a Japanese user
// reading the generated pack cannot tell what any of it does. This is the
// single piece of data the tool owns that a "call the API and sort" clone does
// not have — keep adding to it.
//
// A slug that is wrong or renamed simply falls back to the English description,
// so stale entries are harmless.
export const MOD_NOTES = {
  // --- 前提ライブラリ ---
  "fabric-api": "Fabric系MODの大半が必要とする基盤ライブラリ。単体では何も起きません。",
  "balm": "BlayTheNinth氏のMOD群が共通で使う互換レイヤー。",
  "architectury-api": "1つのMODをFabric/Forge双方で動かすための共通ライブラリ。",
  "cloth-config": "MODの設定画面を提供するライブラリ。多くのMODが依存します。",
  "terrablender": "複数のバイオーム追加MODを喧嘩させずに共存させるためのライブラリ。",
  "yungs-api": "YUNG氏の構造物MOD群が共通で使うライブラリ。",
  "geckolib": "MODの3Dアニメーションを描画するライブラリ。Mob追加MODでよく必要になります。",
  "collective": "Serilum氏の小規模MOD群が共有するライブラリ。",
  "puzzles-lib": "Fuzs氏のMOD群が使う共通ライブラリ。",
  "kotlin-for-forge": "Kotlinで書かれたMODをForgeで動かすための言語ローダー。",
  "fabric-language-kotlin": "Kotlinで書かれたMODをFabricで動かすための言語ローダー。",
  "resourceful-lib": "ThatGravyBoat氏のMOD群が使う共通ライブラリ。",
  "moonlight": "MehVahdJukaar氏のMOD群（Supplementaries等）が使うライブラリ。",
  "creativecore": "CreativeMD氏のMOD群が使うライブラリ。",
  "supermartijn642s-config-lib": "SuperMartijn642氏のMOD群の設定ライブラリ。",

  // --- 冒険・探索 ---
  "waystones": "ワープ地点（ウェイストーン）を設置して長距離移動を短縮します。探索の往復が激減します。",
  "xaeros-minimap": "画面隅にミニマップを表示。ウェイポイントを打って拠点や洞窟の位置を記録できます。",
  "xaeros-world-map": "探索済みの範囲を全画面マップで確認できます。Xaero's Minimapと併用が定番。",
  "journeymap": "ミニマップ＋全画面マップの定番MOD。Xaero系とは役割が重なるのでどちらか一方で十分です。",
  "explorers-compass": "指定した構造物（村・要塞など）の座標を探し出せるコンパス。",
  "natures-compass": "指定したバイオームの位置を探し出せるコンパス。",
  "travelers-backpack": "装備できるバックパックを追加。持ち物を大幅に増やせます。",
  "comforts": "寝袋とハンモックを追加。拠点に戻らず夜を越せます。",
  "simple-voice-chat": "ゲーム内に距離減衰つきのボイスチャットを追加します（サーバー側にも導入が必要）。",
  "3dskinlayers": "スキンの外側レイヤーを立体的に描画する見た目MOD。",
  "not-enough-animations": "一人称の動作を三人称視点にも反映させる見た目MOD。",

  // --- ワールド生成 ---
  "terralith": "バニラの生成をベースに、100種類以上の地形・バイオームを追加します。導入は新規ワールド推奨。",
  "tectonic": "山や谷を大きく起伏させ、地形をダイナミックにします。新規ワールド推奨。",
  "biomes-o-plenty": "50種類以上のバイオームと固有の木・花を追加する老舗MOD。新規ワールド推奨。",
  "when-dungeons-arise": "探索しがいのある大型ダンジョン・遺跡を各バイオームに追加します。",
  "repurposed-structures": "バニラの構造物のバリエーション（ネザー要塞版の村など）を大量に追加します。",
  "structory": "雰囲気重視の小〜中規模の構造物を追加。戦利品は控えめでバランスを崩しません。",
  "dungeons-and-taverns": "村や地下に酒場・ダンジョンを追加。バニラの雰囲気に馴染むデザインです。",
  "yungs-better-strongholds": "バニラの要塞を、探索の面白い大規模構造に置き換えます。",
  "yungs-better-mineshafts": "廃坑を、より広く危険で見応えのある構造に置き換えます。",
  "yungs-better-dungeons": "地下ダンジョンを大幅に拡張し、探索の目的地に変えます。",
  "integrated-dungeons-and-structures": "多数のダンジョン・構造物をまとめて追加する大型MOD。",

  // --- Mob・ボス ---
  "alexs-mobs": "個性的な動物・モンスターを80種類以上追加する大型Mob MOD。",
  "friends-and-foes": "Minecraft Liveで落選したMob（コッパーゴーレム等）を実装します。",
  "naturalist": "バニラの世界に馴染む野生動物と、その生態を追加します。",
  "born-in-chaos": "闇属性の強敵とボスを追加。夜の危険度が大きく上がります。",
  "mutant-monsters": "バニラMobの強化版（ミュータント）を追加。中盤以降の手応えが出ます。",
  "cataclysm": "高難度のボスと専用ダンジョンを追加する終盤向けMOD。",
  "guard-villagers": "村を守る衛兵を追加。村人の生存率が上がります。",

  // --- 戦闘・装備 ---
  "bettercombat": "攻撃モーションと当たり判定を刷新し、近接戦闘を手応えのあるものにします。",
  "simply-swords": "個性的な武器種（大剣・薙刀など）と特殊効果を追加します。",
  "mythicmetals": "新しい鉱石・金属と、それらで作る装備を追加します。",
  "artifacts": "ダンジョンの宝箱から出る、特殊効果つきのアクセサリを追加します。",
  "apotheosis": "エンチャント・付呪・敵の強化を全面的に拡張する大型MOD。",
  "spartan-weaponry": "槍・戦鎚・ダガーなど多数の武器種を追加します。",

  // --- 魔法 ---
  "ars-nouveau": "自分で呪文を組み立てられる魔法MOD。魔法系の入門としても定番です。",
  "irons-spells-n-spellbooks": "呪文書とマナで戦うアクション寄りの魔法MOD。",
  "botania": "花と自然の力を使う魔法MOD。工業に近い自動化要素も持ちます。",
  "occultism": "悪魔召喚と儀式をテーマにした魔法MOD。使い魔による自動化もできます。",
  "malum": "闇と錬金術をテーマにした魔法MOD。独特の雰囲気があります。",
  "spell-engine": "呪文の詠唱・効果を扱う魔法フレームワーク。対応MODと組み合わせて使います。",

  // --- 技術・自動化 ---
  "create": "歯車とベルトで動く機械を組む工業MOD。見た目の面白さと自由度が高く、工業系の入門に最適です。",
  "mekanism": "発電から鉱石5倍化までを扱う大規模工業MOD。終盤には核融合まであります。",
  "applied-energistics-2": "アイテムをデジタル化して一元管理する収納・自動化MOD。中〜上級者向け。",
  "immersive-engineering": "現実的な見た目の重厚な機械と送電網を追加する工業MOD。",
  "industrial-foregoing": "農業・畜産・鉱石処理を自動化する機械を一通り揃えたMOD。",
  "modern-industrialization": "現代的な工場ラインを組む工業MOD。加工の多段化が特徴です。",
  "refined-storage": "ネットワーク型の大容量ストレージと自動クラフト。AE2より導入が簡単です。",
  "veinminer": "鉱脈をまとめて掘れるようにします。採掘の作業感を減らす定番MOD。",
  "quark": "バニラに馴染む小さな追加要素を大量に詰め込んだMOD。機能ごとに個別オン・オフできます。",

  // --- ストレージ・整理 ---
  "sophisticated-backpacks": "アップグレード可能なバックパック。自動回収やフィルタも付けられます。",
  "sophisticated-storage": "アップグレードできるチェスト。自動仕分けや圧縮に対応します。",
  "storage-drawers": "同じアイテムを大量に保管する専用の引き出し。整理の定番。",
  "functional-storage": "Storage Drawers 系の後継。大量アイテムの保管に向きます。",
  "toms-storage": "低コストで組める無線ストレージ。序盤から使える収納自動化です。",
  "iron-chests": "鉄・金・ダイヤなど、容量の大きいチェストを追加します。",

  // --- QoL・快適 ---
  "jei": "レシピと用途を検索できるアイテム事典。MOD環境ではほぼ必須です。",
  "emi": "JEIの後継的なレシピ表示MOD。動作が軽く、作成ツリー表示が便利です。",
  "roughly-enough-items": "レシピ表示MOD（REI）。JEI / EMI とは役割が重なるのでどれか1つで十分です。",
  "jade": "見ているブロックやMobの情報を画面上に表示します。",
  "appleskin": "満腹度と隠し数値（隠し満腹度）を可視化します。",
  "mouse-tweaks": "インベントリ操作をドラッグやスクロールで高速化します。",
  "inventory-profiles-next": "インベントリの自動仕分け・整列を行います。",
  "carry-on": "チェストやMobを中身ごと持ち運べるようにします。",
  "clumps": "経験値オーブをまとめて処理負荷を下げます。",
  "controlling": "キーコンフィグ画面を検索可能にします。MODが増えるほど効きます。",
  "fastload": "ワールド読み込みを高速化します。",

  // --- 食料・農業 ---
  "farmers-delight": "料理と農業を大幅に拡張。調理器具と多彩な料理が追加されます。",
  "croptopia": "作物と料理を大量に追加する農業MOD。",
  "brewin-and-chewin": "発酵食品と飲み物を追加。Farmer's Delight と相性が良いです。",
  "nethers-delight": "ネザーの素材を使った料理を追加。Farmer's Delight の拡張です。",
  "aquaculture": "釣りを拡張し、魚の種類と釣り具を大幅に増やします。",

  // --- 装飾・建築 ---
  "supplementaries": "看板・ランタン・樽など、バニラに馴染む装飾ブロックを多数追加します。",
  "chipped": "既存ブロックの見た目バリエーションを大量に追加。建築の表現力が上がります。",
  "handcrafted": "椅子・テーブル・食器など、家具を追加する建築向けMOD。",
  "macaws-doors": "多彩なデザインのドアを追加します。",
  "macaws-roofs": "屋根専用ブロックを追加し、建築の屋根表現を楽にします。",
  "macaws-bridges": "橋のブロックを追加します。",
  "decorative-blocks": "梁・支柱・日よけなど、建築のディテール用ブロックを追加します。",
  "framed-blocks": "任意のブロックの見た目をまとって形を変えられる建築ブロック。",

  // --- 軽量化 ---
  "sodium": "描画エンジンを置き換え、FPSを大幅に改善します。軽量化の第一候補。",
  "lithium": "サーバー側（ゲームロジック）の処理を最適化します。見た目は変わりません。",
  "ferritecore": "メモリ使用量を削減します。MODを大量に入れるほど効きます。",
  "entityculling": "見えていないブロック・エンティティの描画を省いて軽量化します。",
  "modernfix": "起動時間・メモリ・各種処理をまとめて改善する総合最適化MOD。",
  "immediatelyfast": "GUIやパーティクルなど即時描画まわりを高速化します。",
  "memoryleakfix": "既知のメモリリークを修正し、長時間プレイを安定させます。",
  "embeddium": "Forge/NeoForge向けのSodium移植。Forge環境の軽量化の定番です。",
  "krypton": "ネットワーク処理を最適化します。マルチプレイで効きます。",
  "starlight": "光源計算を書き換えて、チャンク読み込みを高速化します。",
};

export function noteFor(slug, fallback) {
  return MOD_NOTES[(slug || "").toLowerCase()] || fallback || "";
}
