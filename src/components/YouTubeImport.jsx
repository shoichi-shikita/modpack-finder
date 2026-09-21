import { useEffect, useRef, useState } from 'react';

const reliability = { high: '高', medium: '中', low: '低' };
const relation = { direct: '動画・概要欄', supplemental: '追加した参考資料', search: '検索で見つかった参考資料', mention: '字幕での言及' };
const compatibility = { compatible: '対応ファイルあり', incompatible: '対応ファイルなし', unknown: '条件未確定', error: '照合失敗' };
const uniqueValue = values => [...new Set(values.map(v => v.value))].length === 1 ? values[0]?.value : '';

async function request(body, signal) {
  let response;
  try {
    response = await fetch('/api/youtube', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.any([signal, AbortSignal.timeout(60_000)]) });
  } catch (error) {
    if (signal.aborted) throw error;
    throw new Error('通信を完了できませんでした。接続を確認して、もう一度お試しください。');
  }
  if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('動画解析APIに接続できません。開発時は npm run dev、本番はPages Functionsを有効にしてください。');
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || '取得に失敗しました。時間をおいて再試行してください。');
  return data;
}

function Source({ item }) {
  return <div className="youtube-source"><a href={item.url} target="_blank" rel="noreferrer">{item.title || '出典を開く'}</a><span> · {relation[item.relationship]}</span><blockquote>{item.quote}</blockquote></div>;
}

export default function YouTubeImport({ onUse, building, versions }) {
  const [url, setUrl] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [result, setResult] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [version, setVersion] = useState('');
  const [loader, setLoader] = useState('');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const controller = useRef(null);
  useEffect(() => () => controller.current?.abort(), []);

  async function resolve(mods, mc, ld, signal) {
    let output = [...mods];
    for (let offset = 0; offset < mods.length; offset += 8) {
      setProgress(`配布情報を照合中 ${Math.min(offset + 8, mods.length)} / ${mods.length}`);
      const data = await request({ action: 'resolve', mods: mods.slice(offset, offset + 8).map(m => ({ id: m.id, name: m.name })), version: mc, loader: ld }, signal);
      const updates = new Map(data.mods.map(m => [m.id, m]));
      output = output.map(m => updates.has(m.id) ? { ...m, ...updates.get(m.id) } : m);
      setResult(previous => previous ? { ...previous, mods: output, curseforgeEnabled: data.curseforgeEnabled } : previous);
    }
    return output;
  }

  async function analyze(event) {
    event.preventDefault(); controller.current?.abort();
    const ctrl = new AbortController(); controller.current = ctrl;
    setBusy(true); setError(''); setNote(''); setResult(null); setSelected(new Set()); setProgress('概要欄・字幕・出典を確認中');
    try {
      const data = await request({ url, sourceUrl: sourceUrl.trim() || undefined }, ctrl.signal);
      setResult(data);
      const mc = uniqueValue(data.minecraftVersions) || ''; const ld = uniqueValue(data.loaders) || '';
      setVersion(mc); setLoader(ld);
      const mods = await resolve(data.mods, mc, ld, ctrl.signal);
      setSelected(new Set(mods.filter(m => m.classification === 'confirmed' && m.resolution?.provider === 'modrinth' && m.resolution.compatibility === 'compatible').map(m => m.id)));
    } catch (e) { if (!ctrl.signal.aborted) setError(e.message); }
    finally { if (controller.current === ctrl) { setBusy(false); setProgress(''); } }
  }

  async function recheck() {
    const ctrl = new AbortController(); controller.current = ctrl;
    setBusy(true); setError(''); setNote('');
    try { await resolve(result.mods, version, loader, ctrl.signal); }
    catch (e) { if (!ctrl.signal.aborted) setError(e.message); }
    finally { if (controller.current === ctrl) { setBusy(false); setProgress(''); } }
  }

  const matchesCondition = m => m.resolution?.checkedVersion === version && m.resolution?.checkedLoader === loader;
  const importable = result?.mods.filter(m => selected.has(m.id) && m.resolution?.provider === 'modrinth' && m.resolution.compatibility === 'compatible' && matchesCondition(m)) || [];
  const selectedCount = result?.mods.filter(m => selected.has(m.id)).length || 0;
  function toggle(id) { setSelected(s => { const next = new Set(s); if (next.has(id)) next.delete(id); else next.add(id); return next; }); setNote(''); }
  async function useResult() {
    if (!importable.length || !version || !loader) return;
    setNote(`${importable.length}件を構成に渡しました。${selectedCount > importable.length ? ` 未解決・非対応・CurseForgeのみの${selectedCount - importable.length}件は含まれません。` : ''}`);
    await onUse({ slugs: importable.map(m => m.resolution.slug), version, loader });
  }

  return <section className="youtube-panel" aria-labelledby="youtube-heading">
    <div className="youtube-heading"><h2 id="youtube-heading">YouTubeの動画から探す</h2><p>概要欄や公開されたMOD一覧を確認して、構成に取り込めます。</p></div>
    <form onSubmit={analyze}>
      <label htmlFor="youtube-url">動画URL</label>
      <div className="youtube-input-row"><input id="youtube-url" type="text" inputMode="url" required maxLength={2048} placeholder="https://www.youtube.com/watch?v=…" value={url} onChange={e => setUrl(e.target.value)} disabled={busy} aria-describedby="youtube-help" /><button type="submit" disabled={busy || building || !url.trim()}>動画を調べる</button></div>
      <p id="youtube-help" className="youtube-muted">youtu.be・ショート動画にも対応。動画の映像そのものは解析しません。</p>
      <details><summary>追加の出典（任意）</summary><label htmlFor="youtube-source">作者のMOD一覧・配布ページのURL</label><input id="youtube-source" type="url" maxLength={2048} value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} disabled={busy} placeholder="https://note.com/…" /><p className="youtube-muted">note / Modrinth / CurseForge / GitHub / Pastebin。動画との一致が未確認の資料は候補に分類します。</p></details>
    </form>
    <div role="status" aria-live="polite">{busy && <p className="youtube-progress">{progress} <button type="button" onClick={() => { controller.current?.abort(); setBusy(false); setProgress(''); }}>中止</button></p>}{note && <p className="youtube-progress">{note}</p>}</div>
    {error && <p role="alert" className="youtube-error">{error}</p>}
    {result && <div className="youtube-results">
      <h3><a href={result.video.url} target="_blank" rel="noreferrer">{result.video.title}</a></h3><p className="youtube-muted">{result.video.author} · 字幕: {result.transcriptStatus === 'available' ? '取得済み' : '取得不可'}</p>
      {result.warnings.length > 0 && <ul className="youtube-warnings">{result.warnings.map(w => <li key={w}>{w}</li>)}</ul>}
      {result.status === 'no_mods' && <p className="youtube-empty">MODを特定できる記載が見つかりませんでした。追加の出典を指定して再試行できます。</p>}
      {result.status !== 'not_minecraft' && <>
        <div className="youtube-environment">
          <div><h4>Minecraftバージョン</h4>{result.minecraftVersions.length ? result.minecraftVersions.map((v, i) => <details key={i}><summary>{v.value} · 信頼度 {reliability[v.confidence]}</summary><Source item={v.evidence} /></details>) : <p className="youtube-muted">不明</p>}</div>
          <div><h4>MODローダー</h4>{result.loaders.length ? result.loaders.map((v, i) => <details key={i}><summary>{v.value} {v.version} · 信頼度 {reliability[v.confidence]}</summary><Source item={v.evidence} /></details>) : <p className="youtube-muted">不明</p>}</div>
        </div>
        <details className="youtube-links"><summary>MODパック・配布リンク / 参照した資料 ({result.links.length})</summary>{result.links.length ? <ul>{result.links.map(l => <li key={l.url}><a href={l.url} target="_blank" rel="noreferrer">{l.title}</a> · {l.kind === 'download' ? '配布先' : '資料'} · {relation[l.relationship]}</li>)}</ul> : <p>配布リンクは見つかりませんでした。</p>}</details>
        {result.mods.length > 0 && <>
          <div className="youtube-conditions"><label>照合するMinecraft<select value={version} disabled={busy || building} onChange={e => { setVersion(e.target.value); setNote(''); }}><option value="">選択してください</option>{[...new Set([...result.minecraftVersions.map(v => v.value), ...versions])].map(v => <option key={v}>{v}</option>)}</select></label><label>照合するローダー<select value={loader} disabled={busy || building} onChange={e => { setLoader(e.target.value); setNote(''); }}><option value="">選択してください</option>{['forge', 'neoforge', 'fabric', 'quilt'].map(v => <option key={v}>{v}</option>)}</select></label><button type="button" disabled={busy || building || !version || !loader} onClick={recheck}>対応ファイルを再確認</button></div>
          <p className="youtube-muted">「確定」は動画の概要欄やそこからリンクされた一覧で確認できたもの。「候補」は言及・参考資料からの抽出です。信頼度は証拠の強さで、確率ではありません。</p>
          {['confirmed', 'inferred'].map(group => <section key={group} className="youtube-group" aria-label={group === 'confirmed' ? '確定したMOD' : '候補・推定MOD'}><h4>{group === 'confirmed' ? '確定したMOD' : '候補・推定MOD'} <span>{result.mods.filter(m => m.classification === group).length}</span></h4>
            {result.mods.filter(m => m.classification === group).length === 0 && <p className="youtube-muted">該当なし</p>}
            <ul>{result.mods.filter(m => m.classification === group).map(m => <li className="youtube-mod" key={m.id}>
              <div className="youtube-mod-top"><label><input type="checkbox" checked={selected.has(m.id)} onChange={() => toggle(m.id)} disabled={busy || building} />{m.name}</label><span className="youtube-muted">信頼度 {reliability[m.confidence]}</span></div>
              <p className="youtube-mod-meta">{m.resolution ? <><a href={m.resolution.url} target="_blank" rel="noreferrer">{m.resolution.provider === 'modrinth' ? 'Modrinth' : 'CurseForge'}</a> · {matchesCondition(m) ? compatibility[m.resolution.compatibility] : '条件変更・再確認が必要'}{m.resolution.release && ` · ${m.resolution.release.name}`}{m.resolution.provider === 'curseforge' && '（自動取り込み対象外）'}</> : m.resolutionStatus === 'error' ? '配布情報の取得失敗 · 再確認できます' : m.resolutionStatus === 'unmatched' ? '配布先未確定 · 自動取り込み対象外' : '配布情報を未照合'}</p>
              <details><summary>出典・対応情報</summary>{m.evidence.map((e, i) => <Source key={i} item={e} />)}{m.resolution && <p className="youtube-muted">掲載バージョン: {m.resolution.gameVersions.join(', ') || '不明'}<br />ローダー: {m.resolution.loaders.join(', ') || '配布ページを確認'}</p>}</details>
            </li>)}</ul>
          </section>)}
          <div className="youtube-import-actions"><button type="button" disabled={busy || building} onClick={() => setSelected(new Set(result.mods.filter(m => m.resolution?.provider === 'modrinth' && m.resolution.compatibility === 'compatible' && matchesCondition(m)).map(m => m.id)))}>対応するMODを選択</button><button type="button" disabled={busy || building} onClick={() => setSelected(new Set())}>選択を解除</button><span>{selectedCount}件選択 / 取り込み可能 {importable.length}件</span><button type="button" className="youtube-use" disabled={busy || building || !importable.length || !version || !loader} onClick={useResult}>選択したMODで構成を作る</button></div>
          <p className="youtube-muted">不要な候補はチェックを外してください。Modrinthで対応ファイルを確認できたMODを取り込み、必須依存MODを確認します。設定・スクリプト・ワールドは再現しません。</p>
        </>}
      </>}
    </div>}
  </section>;
}
