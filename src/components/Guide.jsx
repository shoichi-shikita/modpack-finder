import {
  ArrowLeft,
  Package,
  FolderInput,
  Rocket,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import Footer from "./Footer";
import { bevelOut } from "../utils/styles";

function Panel({ children }) {
  return (
    <div className="p-4 sm:p-5 mb-5" style={{ ...bevelOut, background: "#33333a" }}>
      {children}
    </div>
  );
}

function SectionTitle({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-5 h-5 text-lime-400" />
      <h2 className="text-base sm:text-lg font-bold tracking-wide">{children}</h2>
    </div>
  );
}

function Step({ n, title, children }) {
  return (
    <div className="flex gap-3 mb-3">
      <div
        className="shrink-0 w-8 h-8 grid place-items-center bg-lime-700 text-white font-bold"
        style={bevelOut}
      >
        {n}
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="font-bold text-sm mb-0.5">{title}</div>
        <div className="text-[14px] text-stone-300 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

function Faq({ q, children }) {
  return (
    <div className="mb-4">
      <div className="text-sm font-bold text-lime-300 mb-1">Q. {q}</div>
      <div className="text-[14px] text-stone-300 leading-relaxed">{children}</div>
    </div>
  );
}

function Ext({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-lime-400 underline inline-flex items-center gap-0.5"
    >
      {children}
      <ExternalLink className="w-3 h-3" />
    </a>
  );
}

export default function Guide({ onBack, navigate }) {
  return (
    <div
      className="min-h-screen w-full font-mono text-stone-100 p-4 sm:p-6"
      style={{ background: "linear-gradient(160deg,#2b2b31 0%,#1c1c20 100%)" }}
    >
      <div className="mx-auto max-w-3xl">
        {/* header */}
        <div className="flex items-center gap-3 mb-5">
          <button
            type="button"
            onClick={onBack}
            className="px-3 min-h-11 bg-stone-800 text-stone-200 text-xs flex items-center gap-1"
            style={bevelOut}
          >
            <ArrowLeft className="w-4 h-4" />
            戻る
          </button>
          <h1 className="text-xl sm:text-2xl font-bold tracking-widest uppercase leading-none">
            .mrpackの使い方ガイド
          </h1>
        </div>

        {/* intro */}
        <Panel>
          <SectionTitle icon={Package}>作った「.mrpack」って何？</SectionTitle>
          <p className="text-[14px] text-stone-300 leading-relaxed mb-2">
            このツールが作る <b>.mrpack</b> は、MOD一式（依存MODも込み）の「設計図」ファイルです。
            中身にMOD本体は入っておらず、「どのMODを・どこから入れるか」だけが書かれています。
            これを <b>MOD対応のランチャー</b> に読み込ませると、ランチャーが必要なMODとローダーを
            まとめて自動でそろえてくれます。
          </p>
          <p className="text-[14px] text-stone-300 leading-relaxed">
            なので、ファイルをダブルクリックしても基本は何も起きません。下の手順でランチャーに渡すのが正解です。
          </p>
        </Panel>

        {/* prerequisites */}
        <Panel>
          <SectionTitle icon={HelpCircle}>始める前に必要なもの</SectionTitle>
          <ul className="text-[14px] text-stone-300 leading-relaxed space-y-1 list-disc pl-5">
            <li>
              <b>Minecraft: Java Edition</b>（Java版）を持っていること。統合版（スマホ/Switch/Win10版）ではMODは使えません。
            </li>
            <li>
              <b>Microsoftアカウント</b>（マイクラのログイン用）。
            </li>
            <li>このツールで書き出した <b>.mrpackファイル</b>。</li>
          </ul>
        </Panel>

        {/* recommended: Modrinth App */}
        <Panel>
          <SectionTitle icon={Rocket}>おすすめ：Modrinth App で入れる</SectionTitle>
          <p className="text-[14px] text-stone-300 leading-relaxed mb-4">
            一番かんたんなルートです。ランチャー自体が無料で、ドラッグ＆ドロップだけで完結します。
          </p>

          <Step n={1} title="Modrinth App をインストール">
            <Ext href="https://modrinth.com/app">modrinth.com/app</Ext> から自分のOS用（Windowsなど）をダウンロードして、
            普通のアプリと同じようにインストールします。初回起動時にMicrosoftアカウントでログインしておきます。
          </Step>
          <Step n={2} title=".mrpack を放り込む">
            Modrinth App のウィンドウに、書き出した <b>.mrpackファイルをドラッグ＆ドロップ</b> します。
            新しいインスタンス（そのMOD構成専用の遊び場）が作られ、MODとローダーが自動でダウンロードされます。
          </Step>
          <Step n={3} title="Play を押して遊ぶ">
            できたインスタンスを開いて <b>Play</b> を押すと、その構成のマイクラが起動します。以上です。
          </Step>
        </Panel>

        {/* alternative: Prism */}
        <Panel>
          <SectionTitle icon={FolderInput}>別の方法：Prism Launcher で入れる</SectionTitle>
          <p className="text-[14px] text-stone-300 leading-relaxed mb-4">
            すでに Prism Launcher を使っている人向け。手順もほぼ同じです。
          </p>
          <Step n={1} title="Prism を用意">
            <Ext href="https://prismlauncher.org">prismlauncher.org</Ext> から入手してインストール（すでにあればそのまま）。
          </Step>
          <Step n={2} title="mrpack からインポート">
            「インスタンスを追加」→ <b>Import</b> タブ →「Local file」で <b>.mrpackファイルを選択</b> します。
          </Step>
          <Step n={3} title="起動">
            作られたインスタンスを選んで <b>Launch</b>。依存MODも込みでそろった状態で起動します。
          </Step>
          <p className="text-[13px] text-stone-300 leading-relaxed mt-3">
            ※ ATLauncher など他の主要ランチャーも「Modrinth / mrpack からのインポート」に対応しています。
            メニューに「Import」や「mrpackから追加」があれば同じ流れで使えます。
          </p>
        </Panel>

        {/* FAQ */}
        <Panel>
          <SectionTitle icon={HelpCircle}>よくある質問・つまずき</SectionTitle>

          <Faq q="ファイルをダブルクリックしても開かない">
            それが正常です。.mrpack は上のランチャーに読み込ませて使うもので、単体では起動しません。
          </Faq>
          <Faq q="インポート時にローダーのバージョンを聞かれた">
            書き出し時に自動取得できなかった場合に起きます。表示された候補から、そのマイクラバージョン向けの
            最新のものを選べばOKです（Fabric / NeoForge など、パックで選んだローダーの列を選択）。
          </Faq>
          <Faq q="一部のMODが入らなかった / 起動時にクラッシュする">
            まれに、特定のバージョンで配布が止まっているMODがあります。書き出し後のメモに「除外しました」と出た分が原因のことが多いです。
            テーマやバージョンを少し変えて作り直すと安定しやすいです。
          </Faq>
          <Faq q="今遊んでいるワールドにそのまま入れて大丈夫？">
            ワールド生成を変えるMOD（構造物・バイオーム追加系）を含む場合、既存ワールドへの途中導入は非推奨です。
            パック画面に⚠が出ていたら、新しいワールドで始めるのが安全です。
          </Faq>
          <Faq q="統合版（スマホ/Switch版）でも使える？">
            使えません。MODはJava版専用です。Java版を持っているか確認してください。
          </Faq>
          <Faq q="友達とサーバーで遊びたい">
            サーバー側にも同じMOD構成を入れる必要があります。サーバー向けの導入は少し手順が増えるので、
            まずはシングルプレイで動作を確認してからにすると安心です。
          </Faq>
        </Panel>

        <Panel>
          <SectionTitle icon={HelpCircle}>あわせて読みたい</SectionTitle>
          <div className="flex flex-col sm:flex-row gap-2 text-[13px]">
            <a href="/articles/loader-guide/" className="px-3 min-h-11 bg-stone-800 text-lime-300 underline inline-flex items-center" style={bevelOut}>
              Forge・Fabric・NeoForge・Quiltの違い
            </a>
            <a href="/articles/modpack-not-starting/" className="px-3 min-h-11 bg-stone-800 text-lime-300 underline inline-flex items-center" style={bevelOut}>
              MODパックが起動しないとき
            </a>
          </div>
        </Panel>

        <div className="text-center mb-6">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-3 bg-lime-600 text-white font-bold uppercase tracking-widest text-sm inline-flex items-center gap-2"
            style={bevelOut}
          >
            <ArrowLeft className="w-4 h-4" />
            ツールに戻る
          </button>
        </div>

        {navigate && <Footer navigate={navigate} />}
      </div>
    </div>
  );
}
