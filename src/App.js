import { useState, useEffect, useCallback, useRef } from "react";
import { db } from "./firebase";
import logo from "./logo.jpg";
import { ref, set, onValue } from "firebase/database";

const TABLES = [1,2,3,4,5];
const SEATS  = [1,2,3,4,5,6,7,8,9];

const todayStr = () => new Date().toISOString().split("T")[0];
const nowTime  = () => new Date().toLocaleTimeString("ja-JP",{hour:"2-digit",minute:"2-digit",second:"2-digit"});

const css = `
@import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
:root{
  --pink:#F5B800;--pink-dark:#d4a000;
  --orange:#FFD32A;--yellow:#FECA57;
  --green:#26de81;--green-dark:#20bf6b;
  --blue:#45aaf2;--purple:#a55eea;
  --bg:#FFFDF0;--card:#fff;
  --text:#2d2d2d;--muted:#999;
  --border:#FFE980;
  --shadow:0 4px 20px rgba(245,184,0,.15);
}
body{background:var(--bg);color:var(--text);font-family:'Nunito',sans-serif;}
.app{min-height:100vh;}

/* NAV */
.nav{background:#fff;border-bottom:3px solid var(--pink);padding:0 20px;
  display:flex;align-items:center;justify-content:space-between;
  height:58px;position:sticky;top:0;z-index:200;
  box-shadow:0 2px 12px rgba(245,184,0,.12);}
.logo{font-family:'Fredoka One',cursive;font-size:18px;color:var(--pink);
  display:flex;align-items:center;gap:8px;letter-spacing:.5px;}
.logo-sub{font-size:11px;color:var(--muted);font-family:'Nunito',sans-serif;font-weight:600;margin-left:2px;}
.nav-tabs{display:flex;gap:4px;}
.ntab{padding:7px 14px;border:2px solid transparent;border-radius:20px;background:transparent;
  color:var(--muted);font-family:'Nunito',sans-serif;font-size:12px;font-weight:700;
  cursor:pointer;transition:all .2s;text-transform:uppercase;letter-spacing:.5px;}
.ntab:hover{color:var(--pink);border-color:var(--border);}
.ntab.on{background:linear-gradient(135deg,#F5B800,#FFD32A);color:#fff;border-color:transparent;
  box-shadow:0 3px 12px rgba(245,184,0,.35);}

/* LOGIN SCREEN */
.login-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;
  background:linear-gradient(135deg,#fffdf0,#fffbe0);padding:20px;}
.login-card{background:#fff;border-radius:24px;padding:40px 32px;width:100%;max-width:360px;
  box-shadow:0 8px 40px rgba(245,184,0,.18);text-align:center;}
.login-emoji{font-size:56px;margin-bottom:12px;}
.login-title{font-family:'Fredoka One',cursive;font-size:28px;color:var(--pink);margin-bottom:4px;}
.login-sub{color:var(--muted);font-size:14px;margin-bottom:28px;}
.login-input{width:100%;padding:14px 16px;border:2px solid var(--border);border-radius:14px;
  font-family:'Nunito',sans-serif;font-size:16px;font-weight:700;color:var(--text);
  outline:none;transition:border-color .2s;text-align:center;background:#fff;}
.login-input:focus{border-color:var(--pink);}
.login-input::placeholder{color:#ddd;font-weight:400;}
.login-btn{width:100%;padding:14px;margin-top:16px;
  background:linear-gradient(135deg,#F5B800,#FFD32A);border:none;border-radius:14px;
  color:#fff;font-family:'Fredoka One',cursive;font-size:18px;letter-spacing:.5px;
  cursor:pointer;transition:all .2s;color:#333;box-shadow:0 4px 16px rgba(245,184,0,.35);}
.login-btn:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(245,184,0,.45);}
.login-btn:disabled{opacity:.4;cursor:not-allowed;transform:none;}

/* TOURNAMENT TAB BAR */
.t-bar{background:#fff;border-bottom:2px solid var(--border);padding:0 16px;
  display:flex;align-items:center;gap:8px;overflow-x:auto;min-height:46px;flex-wrap:nowrap;}
.t-bar::-webkit-scrollbar{height:3px;}
.t-bar::-webkit-scrollbar-thumb{background:var(--pink);border-radius:2px;}
.ttab{padding:6px 14px;border:2px solid var(--border);border-radius:20px;background:#fff;
  color:var(--muted);font-size:12px;font-weight:700;white-space:nowrap;cursor:pointer;
  transition:all .15s;display:flex;align-items:center;gap:6px;flex-shrink:0;}
.ttab:hover{border-color:var(--pink);color:var(--pink);}
.ttab.on{background:linear-gradient(135deg,#F5B800,#FFD32A);border-color:transparent;color:#fff;
  box-shadow:0 3px 10px rgba(245,184,0,.3);}
.dot-live{width:7px;height:7px;background:var(--green);border-radius:50%;animation:blink 2s infinite;flex-shrink:0;}
.dot-end{width:7px;height:7px;background:#ddd;border-radius:50%;flex-shrink:0;}
@keyframes blink{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(38,222,129,.4);}50%{box-shadow:0 0 0 5px rgba(38,222,129,0);}}
.add-t-btn{padding:6px 12px;border:2px dashed var(--border);border-radius:20px;background:transparent;
  color:var(--muted);font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;transition:all .15s;flex-shrink:0;}
.add-t-btn:hover{border-color:var(--pink);color:var(--pink);}
.no-t{color:var(--muted);font-size:12px;font-weight:600;}

/* MODAL */
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:400;
  display:flex;align-items:center;justify-content:center;padding:20px;}
.modal{background:#fff;border-radius:20px;padding:28px;width:100%;max-width:380px;
  box-shadow:0 12px 48px rgba(245,184,0,.15);}
.modal h3{font-family:'Fredoka One',cursive;font-size:20px;color:var(--pink);margin-bottom:18px;}
.mrow{margin-bottom:13px;}
.mlabel{font-size:11px;color:var(--muted);font-weight:700;letter-spacing:.5px;text-transform:uppercase;margin-bottom:6px;}
.mactions{display:flex;gap:8px;margin-top:20px;}
.btn-p{flex:1;padding:12px;background:linear-gradient(135deg,#F5B800,#FFD32A);border:none;
  border-radius:12px;color:#fff;font-family:'Fredoka One',cursive;font-size:15px;
  cursor:pointer;transition:all .2s;box-shadow:0 3px 12px rgba(245,184,0,.3);}
.btn-p:hover{transform:translateY(-1px);}
.btn-p:disabled{opacity:.35;cursor:not-allowed;transform:none;}
.btn-g{padding:12px 16px;background:#f5f5f5;border:none;border-radius:12px;
  color:var(--muted);font-family:'Nunito',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all .15s;}
.btn-g:hover{background:#eee;}

/* INPUTS */
.inp{width:100%;padding:11px 14px;background:#fff;border:2px solid var(--border);
  border-radius:12px;color:var(--text);font-family:'Nunito',sans-serif;font-size:15px;
  font-weight:600;outline:none;transition:border-color .2s;}
.inp:focus{border-color:var(--pink);}
.inp::placeholder{color:#ccc;font-weight:400;}

/* DEALER VIEW */
.dealer-wrap{max-width:480px;margin:0 auto;padding:12px;}
.dealer-header{background:linear-gradient(135deg,#F5B800,#FFD32A);border-radius:16px;
  padding:12px 16px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;}
.dealer-header-left h2{font-family:'Fredoka One',cursive;font-size:16px;color:#333;margin-bottom:1px;}
.dealer-header-left p{font-size:11px;color:rgba(0,0,0,.5);}
.dealer-badge{background:rgba(255,255,255,.5);border-radius:20px;padding:5px 12px;
  font-size:12px;font-weight:700;color:#333;display:flex;align-items:center;gap:5px;}
.logout-btn{background:none;border:none;color:rgba(0,0,0,.4);font-size:11px;
  cursor:pointer;font-family:'Nunito',sans-serif;font-weight:700;padding:0;margin-top:3px;}
.logout-btn:hover{color:#333;}

.fsec{background:#fff;border:2px solid var(--border);border-radius:14px;padding:12px 14px;margin-bottom:10px;
  box-shadow:0 2px 8px rgba(245,184,0,.06);}
.ftitle{font-size:10px;color:var(--pink);font-weight:800;letter-spacing:.5px;
  text-transform:uppercase;margin-bottom:10px;display:flex;align-items:center;gap:7px;}
.opt{font-size:10px;color:#ccc;font-weight:600;}
.clr{margin-left:auto;background:none;border:none;color:#ccc;font-size:11px;cursor:pointer;
  font-family:'Nunito',sans-serif;font-weight:700;}
.clr:hover{color:var(--pink);}
.g5{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;}
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}
.sbtn{padding:14px 4px;border:2px solid var(--border);border-radius:12px;background:#fff;
  color:var(--muted);font-family:'Nunito',sans-serif;font-size:20px;font-weight:800;
  cursor:pointer;transition:all .15s;text-align:center;min-height:54px;}
.sbtn:active{transform:scale(.95);}
.sbtn:hover{border-color:var(--pink);color:var(--pink);}
.sbtn.on{background:linear-gradient(135deg,#F5B800,#FFD32A);border-color:transparent;color:#fff;
  box-shadow:0 2px 8px rgba(245,184,0,.3);}
.type-row{display:flex;gap:8px;}
.tbtn{flex:1;padding:16px 6px;border:2px solid var(--border);border-radius:12px;background:#fff;
  color:var(--muted);font-family:'Nunito',sans-serif;font-size:14px;font-weight:800;
  cursor:pointer;transition:all .15s;text-align:center;text-transform:uppercase;min-height:56px;}
.tbtn:active{transform:scale(.95);}
.tbtn.r{background:#fff0f5;border-color:var(--pink);color:var(--pink);}
.tbtn.b{background:#f0f8ff;border-color:var(--blue);color:var(--blue);}
.tbtn.a{background:#f0fff6;border-color:var(--green-dark);color:var(--green-dark);}
.sugg{margin-top:8px;display:flex;flex-wrap:wrap;gap:5px;}
.chip{padding:7px 16px;background:var(--bg);border:2px solid var(--border);border-radius:20px;
  color:var(--muted);font-size:14px;font-weight:700;cursor:pointer;transition:all .15s;}
.chip:active{transform:scale(.95);}
.chip:hover{border-color:var(--pink);color:var(--pink);}
.rep-btn{width:100%;padding:20px;background:linear-gradient(135deg,#F5B800,#FFD32A);
  border:none;border-radius:14px;color:#333;font-family:'Fredoka One',cursive;font-size:22px;
  letter-spacing:.5px;cursor:pointer;transition:all .2s;
  box-shadow:0 4px 18px rgba(245,184,0,.4);margin-top:8px;}
.rep-btn:active{transform:scale(.98);}
.rep-btn:hover{transform:translateY(-2px);box-shadow:0 6px 24px rgba(245,184,0,.5);}
.rep-btn:active{transform:translateY(0);}
.rep-btn:disabled{opacity:.35;cursor:not-allowed;transform:none;box-shadow:none;}

/* FLOOR */
.floor-wrap{padding:20px;max-width:1200px;margin:0 auto;}
.fhead{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;}
.fhead h2{font-family:'Fredoka One',cursive;font-size:22px;color:var(--pink);}
.live-ind{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:var(--green-dark);
  background:#e8faf2;border-radius:20px;padding:5px 12px;}
.pulse{width:7px;height:7px;background:var(--green);border-radius:50%;animation:blink 2s infinite;}
.stats{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:20px;}
.sc{background:#fff;border:2px solid var(--border);border-radius:14px;padding:14px;text-align:center;
  box-shadow:0 2px 12px rgba(245,184,0,.06);}
.sc.g{border-color:var(--pink);}
.sn{font-family:'Fredoka One',cursive;font-size:28px;line-height:1;margin-bottom:3px;color:var(--pink);}
.sl{font-size:10px;color:var(--muted);font-weight:700;letter-spacing:.5px;text-transform:uppercase;}
.progress-bar{margin-bottom:16px;background:#fff;border:2px solid var(--border);border-radius:14px;
  padding:12px 16px;display:flex;align-items:center;gap:12px;box-shadow:0 2px 12px rgba(245,184,0,.06);}
.log-box{background:#fff;border:2px solid var(--border);border-radius:16px;padding:18px;
  box-shadow:0 2px 12px rgba(245,184,0,.06);}
.sec-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px;}
.sec-title{font-family:'Fredoka One',cursive;font-size:16px;color:var(--pink);}
.filters{display:flex;gap:5px;flex-wrap:wrap;align-items:center;}
.fc{padding:4px 12px;border:2px solid var(--border);border-radius:20px;background:#fff;
  color:var(--muted);font-size:11px;font-weight:700;cursor:pointer;transition:all .15s;}
.fc:hover{border-color:var(--pink);color:var(--pink);}
.fc.on{background:linear-gradient(135deg,#F5B800,#FFD32A);border-color:transparent;color:#fff;}
.sep{color:var(--border);}
.log-table{width:100%;border-collapse:collapse;}
.log-table th{text-align:left;padding:9px 13px;font-size:10px;color:var(--muted);
  font-weight:800;letter-spacing:.5px;text-transform:uppercase;border-bottom:2px solid var(--border);}
.log-table td{padding:11px 13px;border-bottom:1px solid #fff5f8;font-size:13px;vertical-align:middle;}
.log-table tr:hover td{background:#fff8fb;}
.bdg{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;}
.br{background:#fff9cc;color:var(--pink);}
.bc{background:#f0f0f0;color:#aaa;border:1px solid #ddd;text-decoration:line-through;}
.bb{background:#e3f2fd;color:var(--blue);}
.ba{background:#e8faf2;color:var(--green-dark);}
.tpink{color:var(--pink);font-weight:700;}
.tmuted{color:var(--muted);font-size:11px;}
.sc-cell{display:flex;align-items:center;justify-content:center;}
.cbox{width:22px;height:22px;border-radius:6px;border:2px solid var(--border);background:#fff;
  cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;}
.cbox:hover{border-color:var(--green-dark);}
.cbox.ck{background:var(--green);border-color:var(--green-dark);}
.cbox.ck::after{content:'✓';color:#fff;font-size:12px;font-weight:800;}
.reporter{font-size:11px;color:var(--muted);}

/* TOURNAMENTS */
.t-manage{padding:20px;max-width:800px;margin:0 auto;}
.t-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;margin-top:16px;}
.tcard{background:#fff;border:2px solid var(--border);border-radius:16px;padding:16px;
  box-shadow:0 2px 12px rgba(245,184,0,.06);}
.tcard.live{border-color:var(--pink);}
.tc-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px;}
.tc-name{font-family:'Fredoka One',cursive;font-size:15px;color:var(--text);}
.tc-date{font-size:11px;color:var(--muted);font-weight:600;margin-top:2px;}
.sp{padding:3px 10px;border-radius:20px;font-size:11px;font-weight:800;}
.sp-l{background:#e8faf2;color:var(--green-dark);}
.sp-e{background:#f5f5f5;color:#bbb;}
.tc-meta{font-size:12px;color:var(--muted);font-weight:600;margin:6px 0 10px;}
.tc-meta span{color:var(--text);font-weight:800;}
.tc-actions{display:flex;gap:6px;}
.ta{padding:6px 12px;border-radius:8px;border:2px solid var(--border);background:#fff;
  color:var(--muted);font-size:11px;font-weight:700;cursor:pointer;transition:all .15s;}
.ta:hover{border-color:var(--pink);color:var(--pink);}
.ta.danger:hover{border-color:#ff4757;color:#ff4757;}

/* PLAYERS */
.pw{padding:20px;max-width:800px;margin:0 auto;}
.pform{background:#fff;border:2px solid var(--border);border-radius:16px;
  padding:16px;margin-bottom:20px;display:flex;gap:10px;align-items:flex-end;
  box-shadow:0 2px 12px rgba(245,184,0,.06);}
.pform .inp{flex:1;}
.add-btn{padding:11px 18px;background:linear-gradient(135deg,#F5B800,#FFD32A);border:none;
  border-radius:12px;color:#fff;font-family:'Fredoka One',cursive;font-size:14px;
  cursor:pointer;white-space:nowrap;transition:all .2s;box-shadow:0 3px 10px rgba(245,184,0,.3);}
.add-btn:hover{transform:translateY(-1px);}
.pgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:9px;}
.pcard{background:#fff;border:2px solid var(--border);border-radius:12px;
  padding:13px 15px;display:flex;align-items:center;justify-content:space-between;
  box-shadow:0 2px 8px rgba(255,107,157,.05);}
.pname{font-size:14px;font-weight:800;}
.pcnt{font-size:11px;color:var(--muted);font-weight:600;margin-top:2px;}
.del{background:none;border:none;color:#ddd;cursor:pointer;font-size:14px;padding:3px;transition:color .15s;}
.del:hover{color:#ff4757;}

.empty{text-align:center;padding:48px 20px;color:var(--muted);}
.empty .ico{font-size:44px;opacity:.4;margin-bottom:10px;}
.empty p{font-weight:600;}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(80px);
  background:linear-gradient(135deg,#26de81,#20bf6b);color:#fff;padding:12px 28px;
  border-radius:20px;font-size:14px;font-weight:800;
  transition:transform .3s cubic-bezier(.34,1.56,.64,1);z-index:999;white-space:nowrap;
  box-shadow:0 4px 20px rgba(32,191,107,.4);}
.toast.show{transform:translateX(-50%) translateY(0);}
.connecting{display:flex;align-items:center;justify-content:center;height:100vh;
  font-family:'Fredoka One',cursive;color:var(--pink);font-size:20px;letter-spacing:1px;}
@media(max-width:600px){
  .stats{grid-template-columns:repeat(2,1fr);}
  .floor-wrap,.t-manage,.pw{padding:14px;}
  .nav .logo{font-size:15px;}
}
`;

function TournamentModal({ existing, onSave, onClose }) {
  const [name, setName]         = useState(existing?.name || "");
  const [date, setDate]         = useState(existing?.date || todayStr());
  const [maxEntry, setMaxEntry] = useState(existing?.maxEntry || "");
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <h3>{existing ? "✏️ トナメ編集" : "🏆 新規トナメ"}</h3>
        <div className="mrow">
          <div className="mlabel">トーナメント名</div>
          <input className="inp" placeholder="例: Daily Deepstack" value={name} onChange={e=>setName(e.target.value)} />
        </div>
        <div className="mrow">
          <div className="mlabel">日付</div>
          <input className="inp" type="date" value={date} onChange={e=>setDate(e.target.value)} />
        </div>
        <div className="mrow">
          <div className="mlabel">エントリー上限 <span style={{color:"#ccc"}}>（任意）</span></div>
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
  const [data, setData]           = useState(null);
  const [view, setView]           = useState("dealer");
  const [activeTid, setActiveTid] = useState(null);
  const [dealerTid, setDealerTid] = useState(null);
  const [toast, setToast]         = useState(false);
  const [modal, setModal]         = useState(null);

  // Dealer login
  const [dealerName, setDealerName]   = useState(() => sessionStorage.getItem("dealerName") || "");
  const loginRef = useRef(null);

  const [table, setTable]           = useState(null);
  const [seat, setSeat]             = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [entryType, setEntryType]   = useState("reentry");

  const [fType, setFType]     = useState("all");
  const [fTable, setFTable]   = useState("all");
  const [fSynced, setFSynced] = useState("all");
  const [newPlayer, setNewPlayer] = useState("");

  // Firebase
  useEffect(() => {
    const dataRef = ref(db, "tournament_data");
    const unsub = onValue(dataRef, (snap) => {
      const val = snap.val();
      setData(val || { tournaments:[], players:[], log:[] });
    });
    return () => unsub();
  }, []);

  const persist = useCallback(async (next) => {
    setData(next);
    await set(ref(db, "tournament_data"), next);
  }, []);

  const handleLogin = () => {
    const val = loginRef.current?.value?.trim();
    if (!val) return;
    sessionStorage.setItem("dealerName", val);
    setDealerName(val);
  };
  const handleLogout = () => {
    sessionStorage.removeItem("dealerName");
    setDealerName("");
  };

  // Tournament CRUD
  const createTournament = async ({name,date,maxEntry}) => {
    const t = { id:Date.now(), name, date, maxEntry, status:"live", entryCount:0 };
    await persist({ tournaments:[...(data.tournaments||[]),t], players:(data.players||[]), log:(data.log||[]) });
    setActiveTid(t.id); setDealerTid(t.id); setModal(null);
  };
  const editTournament = async ({name,date,maxEntry}) => {
    await persist({ ...data, tournaments:(data.tournaments||[]).map(t=>t.id===modal.id?{...t,name,date,maxEntry}:t) });
    setModal(null);
  };
  const endTournament   = async (id) => {
    await persist({ ...data, tournaments:(data.tournaments||[]).map(t=>t.id===id?{...t,status:"ended"}:t) });
  };
  const deleteTournament = async (id) => {
    await persist({ ...data, tournaments:(data.tournaments||[]).filter(t=>t.id!==id), log:(data.log||[]).filter(e=>e.tid!==id) });
    if (activeTid===id) setActiveTid(null);
    if (dealerTid===id) setDealerTid(null);
  };

  // Report
  const handleReport = async () => {
    if (!dealerTid || !data) return;
    const entry = { id:Date.now(), tid:dealerTid, table, seat,
      player: playerName.trim() || null,
      dealer: dealerName,
      type:entryType, time:nowTime(), ts:Date.now(), synced:false };
    let next = { tournaments:(data.tournaments||[]), players:(data.players||[]), log:[entry,...(data.log||[])] };
    if (entry.player && !next.players.find(p=>p.name===entry.player))
      next.players = [...next.players, {name:entry.player, id:Date.now()}];
    next.tournaments = next.tournaments.map(t=>t.id===dealerTid?{...t,entryCount:(t.entryCount||0)+1}:t);
    await persist(next);
    setToast(true); setTimeout(()=>setToast(false),2500);
    setTable(null); setSeat(null); setPlayerName(""); setEntryType("reentry");
  };

  const toggleCancel = async (id) => {
    await persist({ ...data, log:(data.log||[]).map(e=>e.id===id?{...e,cancelled:!e.cancelled}:e) });
  };

  const toggleSynced = async (id) => {
    await persist({ ...data, log:(data.log||[]).map(e=>e.id===id?{...e,synced:!e.synced}:e) });
  };

  const addPlayer = async () => {
    if (!newPlayer.trim() || !data || (data.players||[]).find(p=>p.name===newPlayer.trim())) return;
    await persist({ ...data, players:[...(data.players||[]),{name:newPlayer.trim(),id:Date.now()}] });
    setNewPlayer("");
  };
  const deletePlayer = async (id) => {
    await persist({ ...data, players:(data.players||[]).filter(p=>p.id!==id) });
  };

  if (!data) return (
    <>
      <style>{css}</style>
      <div className="connecting">🎴 接続中...</div>
    </>
  );

  const tournaments      = data.tournaments || [];
  const players          = data.players || [];
  const log              = data.log || [];
  const activeTournament = tournaments.find(t=>t.id===activeTid) || null;
  const dealerTournament = tournaments.find(t=>t.id===dealerTid) || null;
  const floorLog         = activeTournament ? log.filter(e=>e.tid===activeTid) : log;
  const filteredLog      = floorLog.filter(e => {
    if (fType!=="all" && e.type!==fType) return false;
    if (fTable!=="all" && String(e.table)!==fTable) return false;
    if (fSynced==="done" && !e.synced) return false;
    if (fSynced==="pending" && e.synced) return false;
    return true;
  });
  const pendingCount = floorLog.filter(e=>!e.synced).length;
  const usedTables   = [...new Set(floorLog.map(e=>e.table).filter(Boolean))].sort((a,b)=>a-b);

  const TBar = ({selectedId, onSelect, showAll=false}) => (
    <div className="t-bar">
      {showAll && <button className={`ttab ${!selectedId?"on":""}`} onClick={()=>onSelect(null)}>🏠 ALL</button>}
      {tournaments.map(t=>(
        <button key={t.id} className={`ttab ${selectedId===t.id?"on":""}`} onClick={()=>onSelect(t.id)}>
          <span className={t.status==="live"?"dot-live":"dot-end"}></span>{t.name}
        </button>
      ))}
      {tournaments.length===0 && <span className="no-t">TOURNタブでトナメを作成してください</span>}
      <button className="add-t-btn" onClick={()=>setModal("new")}>＋ 新規</button>
    </div>
  );

  // Dealer login screen
  const DealerLogin = () => (
    <div className="login-wrap">
      <div className="login-card">
        <img src={logo} alt="フルーツ" style={{width:"100px",borderRadius:"12px",marginBottom:"12px"}} />
        <div className="login-title">Fruits 越谷</div>
        <div className="login-sub">ディーラー名を入力してください</div>
        <input className="login-input" placeholder="例：田中"
          ref={loginRef}
          onKeyDown={e=>{if(e.key==="Enter"&&!e.nativeEvent.isComposing) handleLogin();}} autoFocus />
        <button className="login-btn" onClick={handleLogin}>
          START 🎴
        </button>
      </div>
    </div>
  );

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <nav className="nav">
          <div className="logo">
            <img src={logo} alt="フルーツ" style={{height:"36px",borderRadius:"6px",marginRight:"6px"}} />
            <span className="logo-sub">TOURNAMENT MGR</span>
          </div>
          <div className="nav-tabs">
            {[["dealer","🎴 DEALER"],["floor","📊 FLOOR"],["tournaments","🏆 TOURN."],["players","👤 PLAYERS"]].map(([v,l])=>(
              <button key={v} className={`ntab ${view===v?"on":""}`} onClick={()=>setView(v)}>{l}</button>
            ))}
          </div>
        </nav>

        {view==="dealer" && <TBar selectedId={dealerTid} onSelect={setDealerTid} />}
        {view==="floor"  && <TBar selectedId={activeTid} onSelect={setActiveTid} showAll />}

        {/* DEALER */}
        {view==="dealer" && (
          !dealerName
            ? <DealerLogin />
            : <div className="dealer-wrap">
                <div className="dealer-header">
                  <div className="dealer-header-left">
                    <h2>🎴 DEALER REPORT</h2>
                    <p>{dealerTournament ? `▶ ${dealerTournament.name}` : "上のタブでトナメを選択してください"}</p>
                  </div>
                  <div>
                    <div className="dealer-badge">👤 {dealerName}</div>
                    <button className="logout-btn" onClick={handleLogout}>ログアウト</button>
                  </div>
                </div>

                {!dealerTid
                  ? <div className="empty"><div className="ico">🏆</div><p>トナメを選択してください</p></div>
                  : <>
                      <div className="fsec">
                        <div className="ftitle">🪑 テーブル番号<span className="opt">任意</span>
                          {table&&<button className="clr" onClick={()=>setTable(null)}>クリア</button>}
                        </div>
                        <div className="g5">{TABLES.map(t=>(
                          <button key={t} className={`sbtn ${table===t?"on":""}`} onClick={()=>setTable(t===table?null:t)}>{t}</button>
                        ))}</div>
                      </div>
                      <div className="fsec">
                        <div className="ftitle">💺 シート番号<span className="opt">任意</span>
                          {seat&&<button className="clr" onClick={()=>setSeat(null)}>クリア</button>}
                        </div>
                        <div className="g3">{SEATS.map(s=>(
                          <button key={s} className={`sbtn ${seat===s?"on":""}`} onClick={()=>setSeat(s===seat?null:s)}>{s}</button>
                        ))}</div>
                      </div>
                      <div className="fsec">
                        <div className="ftitle">👤 プレイヤー名<span className="opt">任意</span></div>
                        <input className="inp" placeholder="名前を入力（任意）..." value={playerName}
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
                        <div className="ftitle">🎯 種別</div>
                        <div className="type-row">
                          <button className={`tbtn ${entryType==="reentry"?"r":""}`} onClick={()=>setEntryType("reentry")}>🔄 REENTRY</button>
                          <button className={`tbtn ${entryType==="rebuy"?"b":""}`}   onClick={()=>setEntryType("rebuy")}>💰 REBUY</button>
                          <button className={`tbtn ${entryType==="addon"?"a":""}`}   onClick={()=>setEntryType("addon")}>➕ ADD-ON</button>
                        </div>
                      </div>
                      <button className="rep-btn" onClick={handleReport}>REPORT 🚀</button>
                    </>
                }
              </div>
        )}

        {/* FLOOR */}
        {view==="floor" && (
          <div className="floor-wrap">
            <div className="fhead">
              <h2>{activeTournament ? `🏆 ${activeTournament.name}` : "🏠 ALL TOURNAMENTS"}</h2>
              <div className="live-ind"><span className="pulse"></span>LIVE</div>
            </div>
            <div className="stats">
              <div className="sc g"><div className="sn">{floorLog.length}</div><div className="sl">Total</div></div>
              <div className="sc"><div className="sn" style={{color:"var(--pink)"}}>{floorLog.filter(e=>e.type==="reentry").length}</div><div className="sl">Reentry</div></div>
              <div className="sc"><div className="sn" style={{color:"var(--blue)"}}>{floorLog.filter(e=>e.type==="rebuy").length}</div><div className="sl">Rebuy</div></div>
              <div className="sc"><div className="sn" style={{color:"var(--green-dark)"}}>{floorLog.filter(e=>e.type==="addon").length}</div><div className="sl">Add-on</div></div>
              <div className="sc" style={{borderColor:pendingCount>0?"var(--pink)":"var(--border)"}}>
                <div className="sn" style={{color:pendingCount>0?"var(--pink)":"#ccc"}}>{pendingCount}</div>
                <div className="sl">未反映</div>
              </div>
            </div>
            {activeTournament?.maxEntry && (
              <div className="progress-bar">
                <span style={{fontSize:11,color:"var(--muted)",fontWeight:700,textTransform:"uppercase",whiteSpace:"nowrap"}}>上限</span>
                <span style={{color:"var(--pink)",fontFamily:"'Fredoka One',cursive",fontSize:18,whiteSpace:"nowrap"}}>
                  {activeTournament.entryCount||0} / {activeTournament.maxEntry}
                </span>
                <div style={{flex:1,background:"var(--border)",borderRadius:4,height:8,overflow:"hidden"}}>
                  <div style={{width:`${Math.min(100,((activeTournament.entryCount||0)/activeTournament.maxEntry)*100)}%`,
                    height:"100%",background:"linear-gradient(90deg,#F5B800,#FFD32A)",borderRadius:4,transition:"width .3s"}}/>
                </div>
              </div>
            )}
            <div className="log-box">
              <div className="sec-head">
                <div className="sec-title">📋 Entry Log</div>
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
                  {usedTables.length>0&&(<>
                    <span className="sep">|</span>
                    {usedTables.map(t=>(
                      <button key={t} className={`fc ${fTable===String(t)?"on":""}`}
                        onClick={()=>setFTable(fTable===String(t)?"all":String(t))}>T{t}</button>
                    ))}
                  </>)}
                </div>
              </div>
              {filteredLog.length===0
                ? <div className="empty"><div className="ico">🎴</div><p>まだ報告がありません</p></div>
                : <div style={{overflowX:"auto"}}>
                    <table className="log-table">
                      <thead><tr>
                        <th>時刻</th>
                        {!activeTournament&&<th>トナメ</th>}
                        <th>プレイヤー</th><th>テーブル</th><th>シート</th>
                        <th>種別</th><th>報告者</th><th style={{textAlign:'center'}}>取り消し</th>
                        <th style={{textAlign:"center"}}>システム反映</th>
                      </tr></thead>
                      <tbody>
                        {filteredLog.map(e=>{
                          const tname = tournaments.find(t=>t.id===e.tid)?.name||"—";
                          return (
                            <tr key={e.id} style={{opacity:e.cancelled?0.4:e.synced?0.55:1}}>
                              <td><span className="tmuted">{e.time}</span></td>
                              {!activeTournament&&<td style={{fontSize:11,color:"var(--muted)",fontWeight:600}}>{tname}</td>}
                              <td style={{fontWeight:800,textDecoration:e.cancelled?"line-through":"none"}}>{e.player||<span style={{color:"#ccc"}}>—</span>}</td>
                              <td><span className="tpink">{e.table?`T${e.table}`:"—"}</span></td>
                              <td>{e.seat||"—"}</td>
                              <td><span className={`bdg ${e.cancelled?"bc":e.type==="reentry"?"br":e.type==="rebuy"?"bb":"ba"}`}>{e.cancelled?"CANCEL":e.type.toUpperCase()}</span></td>
                              <td><span className="reporter">👤 {e.dealer||"—"}</span></td>
                              <td><div className="sc-cell">
                                <div className={`cbox ${e.synced?"ck":""}`} onClick={()=>!e.cancelled&&toggleSynced(e.id)}/>
                              </div></td>
                              <td style={{textAlign:"center"}}>
                                {e.cancelled
                                  ? <button className="cancel-btn cancelled">キャンセル済</button>
                                  : <button className="cancel-btn" onClick={()=>toggleCancel(e.id)}>取り消し</button>
                                }
                              </td>
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
              <div style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:"var(--pink)"}}>🏆 Tournaments</div>
              <button className="add-btn" onClick={()=>setModal("new")}>＋ 新規作成</button>
            </div>
            {tournaments.length===0
              ? <div className="empty" style={{marginTop:40}}><div className="ico">🏆</div><p>トーナメントがありません</p></div>
              : <div className="t-cards">
                  {tournaments.map(t=>{
                    const cnt = log.filter(e=>e.tid===t.id).length;
                    return (
                      <div key={t.id} className={`tcard ${t.status==="live"?"live":""}`}>
                        <div className="tc-head">
                          <div><div className="tc-name">{t.name}</div><div className="tc-date">{t.date}</div></div>
                          <span className={`sp ${t.status==="live"?"sp-l":"sp-e"}`}>{t.status==="live"?"🟢 LIVE":"⚫ END"}</span>
                        </div>
                        <div className="tc-meta">エントリー: <span>{cnt}</span>{t.maxEntry?` / ${t.maxEntry}`:""}</div>
                        <div className="tc-actions">
                          <button className="ta" onClick={()=>setModal(t)}>✏️ 編集</button>
                          {t.status==="live"&&<button className="ta danger" onClick={()=>endTournament(t.id)}>終了</button>}
                          <button className="ta danger" style={{marginLeft:"auto"}} onClick={()=>deleteTournament(t.id)}>🗑️ 削除</button>
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
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:"var(--pink)",marginBottom:14}}>👤 Players</div>
            <div className="pform">
              <input className="inp" placeholder="プレイヤー名を追加..." value={newPlayer}
                onChange={e=>setNewPlayer(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addPlayer()} />
              <button className="add-btn" onClick={addPlayer}>追加</button>
            </div>
            {players.length===0
              ? <div className="empty"><div className="ico">👤</div><p>プレイヤーが登録されていません</p></div>
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

        <div className={`toast ${toast?"show":""}`}>✅ 報告を送信しました！</div>

        {modal==="new"          && <TournamentModal onSave={createTournament} onClose={()=>setModal(null)} />}
        {modal && modal!=="new" && <TournamentModal existing={modal} onSave={editTournament} onClose={()=>setModal(null)} />}
      </div>
    </>
  );
}
