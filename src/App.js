import { useState, useEffect, useCallback } from "react";
import { db } from "./firebase";
import { ref, set, onValue } from "firebase/database";

const TABLES = [1,2,3,4,5,6,7,8,9,10];
const SEATS  = [1,2,3,4,5,6,7,8,9];

const css = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Rajdhani:wght@300;400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
:root{
  --gold:#C9A84C;--gold-dark:#8B6914;
  --bg:#0A0A0A;--bg3:#1A1A1A;--card:#161616;
  --border:#2A2A2A;--red:#C0392B;--text:#E8E0CC;--muted:#777;
}
body{background:var(--bg);color:var(--text);font-family:'Rajdhani',sans-serif;}
.app{min-height:100vh;}

.nav{background:linear-gradient(180deg,#0d0d0d,#111);border-bottom:1px solid var(--gold-dark);
  padding:0 20px;display:flex;align-items:center;justify-content:space-between;
  height:54px;position:sticky;top:0;z-index:200;}
.logo{font-family:'Cinzel',serif;font-size:14px;color:var(--gold);letter-spacing:2px;display:flex;align-items:center;gap:8px;}
.nav-tabs{display:flex;gap:3px;}
.ntab{padding:6px 13px;border:1px solid transparent;border-radius:4px;background:transparent;
  color:var(--muted);font-family:'Rajdhani',sans-serif;font-size:12px;font-weight:600;
  letter-spacing:1px;cursor:pointer;transition:all .2s;text-transform:uppercase;}
.ntab:hover{color:var(--gold);border-color:var(--gold-dark);}
.ntab.on{background:linear-gradient(135deg,#1a1200,#2a1f00);color:var(--gold);border-color:var(--gold-dark);}

.t-bar{background:#0e0e0e;border-bottom:1px solid #1a1a1a;padding:0 16px;
  display:flex;align-items:center;gap:6px;overflow-x:auto;min-height:42px;flex-wrap:nowrap;}
.t-bar::-webkit-scrollbar{height:3px;}
.t-bar::-webkit-scrollbar-thumb{background:var(--gold-dark);}
.ttab{padding:5px 13px;border:1px solid #252525;border-radius:20px;background:var(--bg3);
  color:var(--muted);font-size:12px;font-weight:600;white-space:nowrap;cursor:pointer;
  transition:all .15s;display:flex;align-items:center;gap:6px;flex-shrink:0;}
.ttab:hover{border-color:var(--gold-dark);color:var(--text);}
.ttab.on{background:linear-gradient(135deg,#1f1500,#2e1e00);border-color:var(--gold);color:var(--gold);}
.dot-live{width:7px;height:7px;background:#2ECC71;border-radius:50%;animation:blink 2s infinite;flex-shrink:0;}
.dot-end{width:7px;height:7px;background:#444;border-radius:50%;flex-shrink:0;}
@keyframes blink{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(46,204,113,.4);}50%{box-shadow:0 0 0 5px rgba(46,204,113,0);}}
.add-t-btn{padding:5px 11px;border:1px dashed #2a2a2a;border-radius:20px;background:transparent;
  color:#444;font-size:12px;cursor:pointer;white-space:nowrap;transition:all .15s;flex-shrink:0;}
.add-t-btn:hover{border-color:var(--gold-dark);color:var(--gold);}
.no-t{color:var(--muted);font-size:12px;}

.overlay{position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:400;
  display:flex;align-items:center;justify-content:center;padding:20px;}
.modal{background:#141414;border:1px solid #2a2a2a;border-radius:10px;padding:24px;width:100%;max-width:380px;}
.modal h3{font-family:'Cinzel',serif;font-size:15px;color:var(--gold);letter-spacing:2px;margin-bottom:18px;}
.mrow{margin-bottom:13px;}
.mlabel{font-size:10px;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-bottom:5px;}
.mactions{display:flex;gap:8px;margin-top:18px;}
.btn-p{flex:1;padding:11px;background:linear-gradient(135deg,#8B6914,#C9A84C);border:none;
  border-radius:6px;color:#0a0a0a;font-family:'Cinzel',serif;font-size:12px;font-weight:700;
  letter-spacing:1px;cursor:pointer;transition:filter .2s;}
.btn-p:hover{filter:brightness(1.15);}
.btn-p:disabled{opacity:.35;cursor:not-allowed;}
.btn-g{padding:11px 14px;background:transparent;border:1px solid #2a2a2a;border-radius:6px;
  color:var(--muted);font-family:'Rajdhani',sans-serif;font-size:12px;cursor:pointer;transition:all .15s;}
.btn-g:hover{border-color:#444;color:var(--text);}

.inp{width:100%;padding:10px 12px;background:var(--bg3);border:1px solid var(--border);
  border-radius:6px;color:var(--text);font-family:'Rajdhani',sans-serif;font-size:15px;outline:none;transition:border-color .2s;}
.inp:focus{border-color:var(--gold-dark);}
.inp::placeholder{color:#3a3a3a;}

.dealer-wrap{max-width:420px;margin:0 auto;padding:16px;}
.d-head{text-align:center;margin-bottom:18px;}
.d-head h2{font-family:'Cinzel',serif;font-size:17px;color:var(--gold);letter-spacing:2px;margin-bottom:3px;}
.d-head p{color:var(--muted);font-size:12px;}
.fsec{background:var(--card);border:1px solid var(--border);border-radius:8px;padding:16px;margin-bottom:12px;}
.ftitle{font-family:'Cinzel',serif;font-size:10px;color:var(--gold-dark);letter-spacing:2px;
  text-transform:uppercase;margin-bottom:11px;display:flex;align-items:center;gap:7px;}
.opt{font-family:'Rajdhani',sans-serif;font-size:10px;color:#3a3a3a;letter-spacing:1px;}
.clr{margin-left:auto;background:none;border:none;color:#3a3a3a;font-size:10px;cursor:pointer;
  font-family:'Rajdhani',sans-serif;letter-spacing:1px;text-transform:uppercase;}
.clr:hover{color:#666;}
.g5{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;}
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;}
.sbtn{padding:9px 4px;border:1px solid var(--border);border-radius:6px;background:var(--bg3);
  color:var(--muted);font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:600;
  cursor:pointer;transition:all .15s;text-align:center;}
.sbtn:hover{border-color:var(--gold-dark);color:var(--text);}
.sbtn.on{background:linear-gradient(135deg,#1f1500,#2e1e00);border-color:var(--gold);color:var(--gold);}
.type-row{display:flex;gap:7px;}
.tbtn{flex:1;padding:10px;border:1px solid var(--border);border-radius:6px;background:var(--bg3);
  color:var(--muted);font-family:'Rajdhani',sans-serif;font-size:12px;font-weight:600;
  letter-spacing:1px;cursor:pointer;transition:all .15s;text-align:center;text-transform:uppercase;}
.tbtn.r{background:linear-gradient(135deg,#1a0000,#2a0000);border-color:#C0392B;color:#E74C3C;}
.tbtn.b{background:linear-gradient(135deg,#00101a,#001a2a);border-color:#2980B9;color:#3498DB;}
.tbtn.a{background:linear-gradient(135deg,#001a0d,#002a15);border-color:#27AE60;color:#2ECC71;}
.sugg{margin-top:7px;display:flex;flex-wrap:wrap;gap:5px;}
.chip{padding:3px 10px;background:var(--bg3);border:1px solid var(--border);border-radius:20px;
  color:var(--muted);font-size:12px;cursor:pointer;transition:all .15s;}
.chip:hover{border-color:var(--gold-dark);color:var(--gold);}
.rep-btn{width:100%;padding:14px;background:linear-gradient(135deg,#8B6914,#C9A84C,#8B6914);
  border:none;border-radius:8px;color:#0a0a0a;font-family:'Cinzel',serif;font-size:14px;
  font-weight:700;letter-spacing:2px;cursor:pointer;transition:all .2s;text-transform:uppercase;margin-top:4px;}
.rep-btn:hover{filter:brightness(1.15);transform:translateY(-1px);}
.rep-btn:active{transform:translateY(0);}
.rep-btn:disabled{opacity:.3;cursor:not-allowed;transform:none;}

.floor-wrap{padding:20px;max-width:1200px;margin:0 auto;}
.fhead{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;}
.fhead h2{font-family:'Cinzel',serif;font-size:19px;color:var(--gold);letter-spacing:2px;}
.live-ind{display:flex;align-items:center;gap:5px;font-size:12px;color:var(--muted);}
.pulse{width:7px;height:7px;background:#2ECC71;border-radius:50%;animation:blink 2s infinite;}
.stats{display:grid;grid-template-columns:repeat(5,1fr);gap:9px;margin-bottom:20px;}
.sc{background:var(--card);border:1px solid var(--border);border-radius:8px;padding:13px;text-align:center;}
.sc.g{border-color:var(--gold-dark);}
.sn{font-family:'Cinzel',serif;font-size:26px;line-height:1;margin-bottom:3px;color:var(--gold);}
.sl{font-size:10px;color:var(--muted);letter-spacing:1px;text-transform:uppercase;}
.progress-bar{margin-bottom:18px;background:var(--card);border:1px solid var(--border);border-radius:8px;padding:12px 16px;display:flex;align-items:center;gap:12px;}
.log-box{background:var(--card);border:1px solid var(--border);border-radius:8px;padding:16px;}
.sec-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px;}
.sec-title{font-family:'Cinzel',serif;font-size:10px;color:var(--gold-dark);letter-spacing:2px;text-transform:uppercase;}
.filters{display:flex;gap:5px;flex-wrap:wrap;align-items:center;}
.fc{padding:3px 10px;border:1px solid var(--border);border-radius:20px;background:var(--bg3);
  color:var(--muted);font-size:11px;cursor:pointer;transition:all .15s;}
.fc:hover{border-color:var(--gold-dark);color:var(--text);}
.fc.on{border-color:var(--gold-dark);color:var(--gold);background:#1a1200;}
.sep{color:#222;font-size:12px;}
.log-table{width:100%;border-collapse:collapse;}
.log-table th{text-align:left;padding:8px 12px;font-size:10px;color:var(--muted);
  letter-spacing:1px;text-transform:uppercase;border-bottom:1px solid var(--border);font-weight:500;}
.log-table td{padding:10px 12px;border-bottom:1px solid #111;font-size:13px;vertical-align:middle;}
.log-table tr:hover td{background:#0f0f0f;}
.bdg{display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;letter-spacing:1px;text-transform:uppercase;}
.br{background:#2a0000;color:#E74C3C;border:1px solid #C0392B;}
.bb{background:#001a2a;color:#3498DB;border:1px solid #2980B9;}
.ba{background:#002a15;color:#2ECC71;border:1px solid #27AE60;}
.tgold{color:var(--gold);font-weight:600;}
.tmuted{color:var(--muted);font-size:11px;}
.sc-cell{display:flex;align-items:center;justify-content:center;}
.cbox{width:20px;height:20px;border-radius:4px;border:2px solid #2a2a2a;background:var(--bg3);
  cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;}
.cbox:hover{border-color:#27AE60;}
.cbox.ck{background:#1a3d28;border-color:#27AE60;}
.cbox.ck::after{content:'✓';color:#2ECC71;font-size:11px;font-weight:700;}

.t-manage{padding:20px;max-width:800px;margin:0 auto;}
.t-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px;margin-top:14px;}
.tcard{background:var(--card);border:1px solid var(--border);border-radius:8px;padding:15px;}
.tcard.live{border-color:var(--gold-dark);}
.tc-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:9px;}
.tc-name{font-family:'Cinzel',serif;font-size:13px;color:var(--text);letter-spacing:1px;}
.tc-date{font-size:11px;color:var(--muted);margin-top:2px;}
.sp{padding:2px 9px;border-radius:20px;font-size:10px;font-weight:600;letter-spacing:1px;}
.sp-l{background:#1a3d28;color:#2ECC71;border:1px solid #27AE60;}
.sp-e{background:#1a1a1a;color:#444;border:1px solid #222;}
.tc-meta{font-size:12px;color:var(--muted);margin:6px 0 10px;}
.tc-meta span{color:var(--text);font-weight:600;}
.tc-actions{display:flex;gap:6px;}
.ta{padding:5px 10px;border-radius:5px;border:1px solid #222;background:var(--bg3);
  color:var(--muted);font-size:11px;cursor:pointer;transition:all .15s;}
.ta:hover{border-color:var(--gold-dark);color:var(--gold);}
.ta.danger:hover{border-color:#C0392B;color:#E74C3C;}

.pw{padding:20px;max-width:800px;margin:0 auto;}
.pform{background:var(--card);border:1px solid var(--border);border-radius:8px;
  padding:16px;margin-bottom:20px;display:flex;gap:9px;align-items:flex-end;}
.pform .inp{flex:1;}
.add-btn{padding:10px 16px;background:linear-gradient(135deg,#8B6914,#C9A84C);border:none;
  border-radius:6px;color:#0a0a0a;font-family:'Cinzel',serif;font-size:11px;font-weight:700;
  letter-spacing:1px;cursor:pointer;white-space:nowrap;transition:filter .2s;}
.add-btn:hover{filter:brightness(1.15);}
.pgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px;}
.pcard{background:var(--card);border:1px solid var(--border);border-radius:7px;
  padding:12px 14px;display:flex;align-items:center;justify-content:space-between;}
.pname{font-size:14px;font-weight:600;}
.pcnt{font-size:11px;color:var(--muted);margin-top:1px;}
.del{background:none;border:none;color:#2a2a2a;cursor:pointer;font-size:13px;padding:3px;transition:color .15s;}
.del:hover{color:var(--red);}

.empty{text-align:center;padding:44px 20px;color:var(--muted);}
.empty .ico{font-size:36px;opacity:.2;margin-bottom:8px;}
.toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%) translateY(80px);
  background:linear-gradient(135deg,#1B4332,#27AE60);color:#fff;padding:11px 24px;
  border-radius:8px;font-size:13px;font-weight:600;letter-spacing:1px;
  transition:transform .3s cubic-bezier(.34,1.56,.64,1);z-index:999;white-space:nowrap;}
.toast.show{transform:translateX(-50%) translateY(0);}
.connecting{display:flex;align-items:center;justify-content:center;height:100vh;
  font-family:'Cinzel',serif;color:var(--muted);font-size:14px;letter-spacing:2px;}
@media(max-width:600px){
  .stats{grid-template-columns:repeat(2,1fr);}
  .floor-wrap,.t-manage,.pw{padding:13px;}
}
`;

const todayStr = () => new Date().toISOString().split("T")[0];
const nowTime  = () => new Date().toLocaleTimeString("ja-JP",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
const EMPTY    = { tournaments:[], players:[], log:[] };

function TournamentModal({ existing, onSave, onClose }) {
  const [name, setName]         = useState(existing?.name || "");
  const [date, setDate]         = useState(existing?.date || todayStr());
  const [maxEntry, setMaxEntry] = useState(existing?.maxEntry || "");
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <h3>{existing ? "EDIT TOURNAMENT" : "NEW TOURNAMENT"}</h3>
        <div className="mrow">
          <div className="mlabel">トーナメント名</div>
          <input className="inp" placeholder="例: Daily Deepstack" value={name} onChange={e=>setName(e.target.value)} />
        </div>
        <div className="mrow">
          <div className="mlabel">日付</div>
          <input className="inp" type="date" value={date} onChange={e=>setDate(e.target.value)} />
        </div>
        <div className="mrow">
          <div className="mlabel">エントリー上限 <span style={{color:"#333"}}>（任意）</span></div>
          <input className="inp" type="number" placeholder="例: 100" value={maxEntry} onChange={e=>setMaxEntry(e.target.value)} />
        </div>
        <div className="mactions">
          <button className="btn-g" onClick={onClose}>キャンセル</button>
          <button className="btn-p" disabled={!name.trim()}
            onClick={()=>onSave({name:name.trim(),date,maxEntry:maxEntry?Number(maxEntry):null})}>
            {existing ? "保存" : "作成"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [data, setData]           = useState(null); // null = まだ読み込み中
  const [view, setView]           = useState("dealer");
  const [activeTid, setActiveTid] = useState(null);
  const [dealerTid, setDealerTid] = useState(null);
  const [toast, setToast]         = useState(false);
  const [modal, setModal]         = useState(null);

  const [table, setTable]           = useState(null);
  const [seat, setSeat]             = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [entryType, setEntryType]   = useState("reentry");

  const [fType, setFType]     = useState("all");
  const [fTable, setFTable]   = useState("all");
  const [fSynced, setFSynced] = useState("all");
  const [newPlayer, setNewPlayer] = useState("");

  // Firebase リアルタイム購読
  useEffect(() => {
    const dataRef = ref(db, "tournament_data");
    const unsubscribe = onValue(dataRef, (snapshot) => {
      const val = snapshot.val();
      setData(val || EMPTY);
    });
    return () => unsubscribe();
  }, []);

  // データ保存
  const persist = useCallback(async (next) => {
    setData(next);
    await set(ref(db, "tournament_data"), next);
  }, []);

  // ─ Tournament CRUD ─
  const createTournament = async ({name,date,maxEntry}) => {
    const t = { id:Date.now(), name, date, maxEntry, status:"live", entryCount:0 };
    await persist({ tournaments:[...(data.tournaments||[]), t], players:(data.players||[]), log:(data.log||[]) });
    setActiveTid(t.id); setDealerTid(t.id); setModal(null);
  };
  const editTournament = async ({name,date,maxEntry}) => {
    await persist({ ...data, tournaments: (data.tournaments||[]).map(t => t.id===modal.id ? {...t,name,date,maxEntry} : t) });
    setModal(null);
  };
  const endTournament = async (id) => {
    await persist({ ...data, tournaments: (data.tournaments||[]).map(t => t.id===id ? {...t,status:"ended"} : t) });
  };
  const deleteTournament = async (id) => {
    await persist({ ...data, tournaments:(data.tournaments||[]).filter(t=>t.id!==id), log:(data.log||[]).filter(e=>e.tid!==id) });
    if (activeTid===id) setActiveTid(null);
    if (dealerTid===id) setDealerTid(null);
  };

  // ─ Report ─
  const handleReport = async () => {
    if (!playerName.trim() || !dealerTid || !data) return;
    const entry = { id:Date.now(), tid:dealerTid, table, seat, player:playerName.trim(),
      type:entryType, time:nowTime(), ts:Date.now(), synced:false };
    let next = { tournaments:(data.tournaments||[]), players:(data.players||[]), log:[entry, ...(data.log||[])] };
    if (!next.players.find(p=>p.name===entry.player))
      next.players = [...next.players, {name:entry.player, id:Date.now()}];
    next.tournaments = next.tournaments.map(t => t.id===dealerTid ? {...t, entryCount:(t.entryCount||0)+1} : t);
    await persist(next);
    setToast(true); setTimeout(()=>setToast(false), 2500);
    setTable(null); setSeat(null); setPlayerName(""); setEntryType("reentry");
  };

  const toggleSynced = async (id) => {
    await persist({ ...data, log:(data.log||[]).map(e => e.id===id ? {...e,synced:!e.synced} : e) });
  };

  // ─ Players ─
  const addPlayer = async () => {
    if (!newPlayer.trim() || !data || data.players.find(p=>p.name===newPlayer.trim())) return;
    await persist({ ...data, players:[...(data.players||[]), {name:newPlayer.trim(), id:Date.now()}] });
    setNewPlayer("");
  };
  const deletePlayer = async (id) => {
    await persist({ ...data, players:players.filter(p=>p.id!==id) });
  };

  // ─ 読み込み中 ─
  if (!data) return (
    <>
      <style>{css}</style>
      <div className="connecting">CONNECTING...</div>
    </>
  );

  // ─ derived ─ (fallback for undefined)
  const tournaments = data.tournaments || [];
  const players     = data.players || [];
  const log         = data.log || [];
  const activeTournament = tournaments.find(t=>t.id===activeTid) || null;
  const dealerTournament = tournaments.find(t=>t.id===dealerTid) || null;
  const floorLog = activeTournament ? log.filter(e=>e.tid===activeTid) : log;
  const filteredLog = floorLog.filter(e => {
    if (fType!=="all" && e.type!==fType) return false;
    if (fTable!=="all" && String(e.table)!==fTable) return false;
    if (fSynced==="done" && !e.synced) return false;
    if (fSynced==="pending" && e.synced) return false;
    return true;
  });
  const pendingCount = floorLog.filter(e=>!e.synced).length;
  const usedTables = [...new Set(floorLog.map(e=>e.table).filter(Boolean))].sort((a,b)=>a-b);

  const TBar = ({selectedId, onSelect, showAll=false}) => (
    <div className="t-bar">
      {showAll && <button className={`ttab ${!selectedId?"on":""}`} onClick={()=>onSelect(null)}>ALL</button>}
      {tournaments.map(t=>(
        <button key={t.id} className={`ttab ${selectedId===t.id?"on":""}`} onClick={()=>onSelect(t.id)}>
          <span className={t.status==="live"?"dot-live":"dot-end"}></span>{t.name}
        </button>
      ))}
      {tournaments.length===0 && <span className="no-t">TOURNタブでトナメを作成してください</span>}
      <button className="add-t-btn" onClick={()=>setModal("new")}>＋ 新規</button>
    </div>
  );

  return (
    <>
      <style>{css}</style>
      <div className="app">

        <nav className="nav">
          <div className="logo">♠ TOURNAMENT MGR</div>
          <div className="nav-tabs">
            {[["dealer","DEALER"],["floor","FLOOR"],["tournaments","TOURN."],["players","PLAYERS"]].map(([v,l])=>(
              <button key={v} className={`ntab ${view===v?"on":""}`} onClick={()=>setView(v)}>{l}</button>
            ))}
          </div>
        </nav>

        {view==="dealer" && <TBar selectedId={dealerTid} onSelect={setDealerTid} />}
        {view==="floor"  && <TBar selectedId={activeTid} onSelect={setActiveTid} showAll />}

        {/* DEALER */}
        {view==="dealer" && (
          <div className="dealer-wrap">
            <div className="d-head">
              <h2>DEALER REPORT</h2>
              <p>{dealerTournament ? `▶ ${dealerTournament.name}` : "上のタブでトナメを選択してください"}</p>
            </div>
            {!dealerTid
              ? <div className="empty"><div className="ico">♠</div><p>トナメを選択してください</p></div>
              : <>
                  <div className="fsec">
                    <div className="ftitle">テーブル番号<span className="opt">任意</span>
                      {table && <button className="clr" onClick={()=>setTable(null)}>クリア</button>}
                    </div>
                    <div className="g5">{TABLES.map(t=>(
                      <button key={t} className={`sbtn ${table===t?"on":""}`} onClick={()=>setTable(t===table?null:t)}>{t}</button>
                    ))}</div>
                  </div>
                  <div className="fsec">
                    <div className="ftitle">シート番号<span className="opt">任意</span>
                      {seat && <button className="clr" onClick={()=>setSeat(null)}>クリア</button>}
                    </div>
                    <div className="g3">{SEATS.map(s=>(
                      <button key={s} className={`sbtn ${seat===s?"on":""}`} onClick={()=>setSeat(s===seat?null:s)}>{s}</button>
                    ))}</div>
                  </div>
                  <div className="fsec">
                    <div className="ftitle">プレイヤー名</div>
                    <input className="inp" placeholder="名前を入力..." value={playerName}
                      onChange={e=>setPlayerName(e.target.value)} />
                    {playerName.length>0 && (
                      <div className="sugg">
                        {players.filter(p=>p.name.toLowerCase().includes(playerName.toLowerCase())).slice(0,6).map(p=>(
                          <button key={p.id} className="chip" onClick={()=>setPlayerName(p.name)}>{p.name}</button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="fsec">
                    <div className="ftitle">種別</div>
                    <div className="type-row">
                      <button className={`tbtn ${entryType==="reentry"?"r":""}`} onClick={()=>setEntryType("reentry")}>REENTRY</button>
                      <button className={`tbtn ${entryType==="rebuy"?"b":""}`}   onClick={()=>setEntryType("rebuy")}>REBUY</button>
                      <button className={`tbtn ${entryType==="addon"?"a":""}`}   onClick={()=>setEntryType("addon")}>ADD-ON</button>
                    </div>
                  </div>
                  <button className="rep-btn" onClick={handleReport} disabled={!playerName.trim()}>REPORT</button>
                </>
            }
          </div>
        )}

        {/* FLOOR */}
        {view==="floor" && (
          <div className="floor-wrap">
            <div className="fhead">
              <h2>{activeTournament ? activeTournament.name : "ALL TOURNAMENTS"}</h2>
              <div className="live-ind"><span className="pulse"></span>LIVE</div>
            </div>
            <div className="stats">
              <div className="sc g"><div className="sn">{floorLog.length}</div><div className="sl">Total</div></div>
              <div className="sc"><div className="sn" style={{color:"#E74C3C"}}>{floorLog.filter(e=>e.type==="reentry").length}</div><div className="sl">Reentry</div></div>
              <div className="sc"><div className="sn" style={{color:"#3498DB"}}>{floorLog.filter(e=>e.type==="rebuy").length}</div><div className="sl">Rebuy</div></div>
              <div className="sc"><div className="sn" style={{color:"#2ECC71"}}>{floorLog.filter(e=>e.type==="addon").length}</div><div className="sl">Add-on</div></div>
              <div className="sc" style={{borderColor:pendingCount>0?"#C0392B":"var(--border)"}}>
                <div className="sn" style={{color:pendingCount>0?"#E74C3C":"#444"}}>{pendingCount}</div>
                <div className="sl">未反映</div>
              </div>
            </div>
            {activeTournament?.maxEntry && (
              <div className="progress-bar">
                <span style={{fontSize:11,color:"var(--muted)",letterSpacing:1,textTransform:"uppercase",whiteSpace:"nowrap"}}>上限</span>
                <span style={{color:"var(--gold)",fontFamily:"'Cinzel',serif",fontSize:16,whiteSpace:"nowrap"}}>
                  {activeTournament.entryCount||0} / {activeTournament.maxEntry}
                </span>
                <div style={{flex:1,background:"#1a1a1a",borderRadius:4,height:5,overflow:"hidden"}}>
                  <div style={{width:`${Math.min(100,((activeTournament.entryCount||0)/activeTournament.maxEntry)*100)}%`,
                    height:"100%",background:"var(--gold)",borderRadius:4,transition:"width .3s"}}/>
                </div>
              </div>
            )}
            <div className="log-box">
              <div className="sec-head">
                <div className="sec-title">ENTRY LOG</div>
                <div className="filters">
                  {["all","reentry","rebuy","addon"].map(t=>(
                    <button key={t} className={`fc ${fType===t?"on":""}`} onClick={()=>setFType(t)}>
                      {t==="all"?"ALL":t.toUpperCase()}
                    </button>
                  ))}
                  <span className="sep">|</span>
                  <button className={`fc ${fSynced==="all"?"on":""}`}     onClick={()=>setFSynced("all")}>すべて</button>
                  <button className={`fc ${fSynced==="pending"?"on":""}`} onClick={()=>setFSynced("pending")}>未反映</button>
                  <button className={`fc ${fSynced==="done"?"on":""}`}    onClick={()=>setFSynced("done")}>反映済</button>
                  {usedTables.length>0 && (<>
                    <span className="sep">|</span>
                    {usedTables.map(t=>(
                      <button key={t} className={`fc ${fTable===String(t)?"on":""}`}
                        onClick={()=>setFTable(fTable===String(t)?"all":String(t))}>T{t}</button>
                    ))}
                  </>)}
                </div>
              </div>
              {filteredLog.length===0
                ? <div className="empty"><div className="ico">♣</div><p>まだ報告がありません</p></div>
                : <div style={{overflowX:"auto"}}>
                    <table className="log-table">
                      <thead><tr>
                        <th>時刻</th>
                        {!activeTournament && <th>トナメ</th>}
                        <th>プレイヤー</th><th>テーブル</th><th>シート</th><th>種別</th>
                        <th style={{textAlign:"center"}}>システム反映</th>
                      </tr></thead>
                      <tbody>
                        {filteredLog.map(e=>{
                          const tname = tournaments.find(t=>t.id===e.tid)?.name||"—";
                          return (
                            <tr key={e.id} style={{opacity:e.synced?0.55:1}}>
                              <td><span className="tmuted">{e.time}</span></td>
                              {!activeTournament && <td style={{fontSize:11,color:"var(--muted)"}}>{tname}</td>}
                              <td style={{fontWeight:600}}>{e.player}</td>
                              <td><span className="tgold">{e.table?`T${e.table}`:"—"}</span></td>
                              <td>{e.seat||"—"}</td>
                              <td><span className={`bdg ${e.type==="reentry"?"br":e.type==="rebuy"?"bb":"ba"}`}>{e.type.toUpperCase()}</span></td>
                              <td><div className="sc-cell">
                                <div className={`cbox ${e.synced?"ck":""}`} onClick={()=>toggleSynced(e.id)}/>
                              </div></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
              }
            </div>
          </div>
        )}

        {/* TOURNAMENTS */}
        {view==="tournaments" && (
          <div className="t-manage">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div className="sec-title">TOURNAMENTS</div>
              <button className="add-btn" onClick={()=>setModal("new")}>＋ 新規作成</button>
            </div>
            {tournaments.length===0
              ? <div className="empty" style={{marginTop:40}}><div className="ico">♦</div><p>トーナメントがありません</p></div>
              : <div className="t-cards">
                  {tournaments.map(t=>{
                    const cnt = log.filter(e=>e.tid===t.id).length;
                    return (
                      <div key={t.id} className={`tcard ${t.status==="live"?"live":""}`}>
                        <div className="tc-head">
                          <div>
                            <div className="tc-name">{t.name}</div>
                            <div className="tc-date">{t.date}</div>
                          </div>
                          <span className={`sp ${t.status==="live"?"sp-l":"sp-e"}`}>{t.status==="live"?"LIVE":"END"}</span>
                        </div>
                        <div className="tc-meta">エントリー: <span>{cnt}</span>{t.maxEntry?` / ${t.maxEntry}`:""}</div>
                        <div className="tc-actions">
                          <button className="ta" onClick={()=>setModal(t)}>編集</button>
                          {t.status==="live" && <button className="ta danger" onClick={()=>endTournament(t.id)}>終了</button>}
                          <button className="ta danger" style={{marginLeft:"auto"}} onClick={()=>deleteTournament(t.id)}>削除</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
            }
          </div>
        )}

        {/* PLAYERS */}
        {view==="players" && (
          <div className="pw">
            <div className="sec-title" style={{marginBottom:13}}>PLAYER REGISTRATION</div>
            <div className="pform">
              <input className="inp" placeholder="プレイヤー名を追加..." value={newPlayer}
                onChange={e=>setNewPlayer(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addPlayer()} />
              <button className="add-btn" onClick={addPlayer}>追加</button>
            </div>
            {players.length===0
              ? <div className="empty"><div className="ico">♦</div><p>プレイヤーが登録されていません</p></div>
              : <div className="pgrid">
                  {players.map(p=>(
                    <div key={p.id} className="pcard">
                      <div><div className="pname">{p.name}</div>
                        <div className="pcnt">{log.filter(e=>e.player===p.name).length} entries</div>
                      </div>
                      <button className="del" onClick={()=>deletePlayer(p.id)}>✕</button>
                    </div>
                  ))}
                </div>
            }
          </div>
        )}

        <div className={`toast ${toast?"show":""}`}>✓ 報告を送信しました</div>

        {modal==="new"          && <TournamentModal onSave={createTournament} onClose={()=>setModal(null)} />}
        {modal && modal!=="new" && <TournamentModal existing={modal} onSave={editTournament} onClose={()=>setModal(null)} />}
      </div>
    </>
  );
}
