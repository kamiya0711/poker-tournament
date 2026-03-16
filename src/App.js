import { useState, useEffect, useCallback, useRef } from "react";
import { db } from "./firebase";
import logo from "./logo.jpg";
import { ref, set, onValue } from "firebase/database";

/* eslint-disable no-unused-vars */
const TABLES = [1,2,3,4,5];
const GAS_URL = "https://script.google.com/macros/s/AKfycbxYn1HTomcKw5KNgHz-dY6XzJGv06UOYm_01liAgTZzYvcYuvuDswtly7uZD6RqZh0GXA/exec";
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
.nav{background:#fff;border-bottom:3px solid var(--pink);padding:0 12px;
  display:flex;align-items:center;gap:8px;
  height:52px;position:sticky;top:0;z-index:200;
  box-shadow:0 2px 12px rgba(245,184,0,.12);overflow-x:auto;overflow-y:hidden;}
.nav::-webkit-scrollbar{display:none;}
.logo{font-family:'Fredoka One',cursive;font-size:15px;color:var(--pink);
  display:flex;align-items:center;gap:6px;letter-spacing:.5px;flex-shrink:0;}
.logo-sub{display:none;}
.nav-tabs{display:flex;gap:4px;flex-shrink:0;}
.ntab{padding:6px 10px;border:2px solid transparent;border-radius:20px;background:transparent;
  color:var(--muted);font-family:'Nunito',sans-serif;font-size:11px;font-weight:700;
  cursor:pointer;transition:all .2s;white-space:nowrap;flex-shrink:0;}
.ntab:hover{color:var(--pink);border-color:var(--border);}
.ntab.on{background:linear-gradient(135deg,#F5B800,#FFD32A);color:#333;border-color:transparent;
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

/* ADD-ON */
.addon-input-row{display:flex;flex-direction:column;gap:12px;}
.addon-field{display:flex;flex-direction:column;gap:8px;}
.addon-field-sm{flex:1;}
.addon-sub-row{display:flex;gap:12px;}
.addon-label{font-size:10px;color:var(--pink);font-weight:800;letter-spacing:.5px;text-transform:uppercase;margin-bottom:4px;display:flex;align-items:center;gap:6px;}
.payment-row{display:flex;gap:8px;}
.pbtn{flex:1;padding:13px 6px;border:2px solid var(--border);border-radius:12px;background:#fff;
  color:var(--muted);font-size:13px;font-weight:800;cursor:pointer;transition:all .15s;text-align:center;}
.pbtn:active{transform:scale(.95);}
.pbtn.on{background:linear-gradient(135deg,#F5B800,#FFD32A);border-color:transparent;color:#333;
  box-shadow:0 2px 8px rgba(245,184,0,.3);}
.add-row-btn{width:100%;padding:13px;background:#fff;border:2px dashed var(--border);
  border-radius:12px;color:var(--pink);font-family:'Nunito',sans-serif;font-size:14px;font-weight:800;
  cursor:pointer;transition:all .15s;}
.add-row-btn:hover{border-color:var(--pink);background:#fffdf0;}
.add-row-btn:active{transform:scale(.98);}
.addon-list{display:flex;flex-direction:column;gap:6px;margin-bottom:4px;}
.addon-list-row{display:flex;align-items:center;gap:8px;background:#fffdf0;border:1px solid var(--border);
  border-radius:10px;padding:9px 12px;}
.addon-list-name{font-weight:800;font-size:14px;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.addon-list-meta{font-size:12px;color:var(--muted);font-weight:700;white-space:nowrap;}
.addon-list-pay{font-size:11px;font-weight:800;color:var(--green-dark);background:#e8faf2;
  padding:2px 8px;border-radius:10px;white-space:nowrap;}
.rep-btn:hover{transform:translateY(-2px);box-shadow:0 6px 24px rgba(245,184,0,.5);}
.rep-btn:active{transform:translateY(0);}
.rep-btn:disabled{opacity:.35;cursor:not-allowed;transform:none;box-shadow:none;}

/* RING */
.ring-wrap{max-width:480px;margin:0 auto;padding:12px;}
.ring-header{background:linear-gradient(135deg,#26de81,#20bf6b);border-radius:16px;
  padding:12px 16px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;}
.ring-header h2{font-family:'Fredoka One',cursive;font-size:16px;color:#fff;}
.ring-header p{font-size:11px;color:rgba(255,255,255,.8);}
.rate-row{display:flex;gap:8px;}
.rbtn{flex:1;padding:14px 6px;border:2px solid var(--border);border-radius:12px;background:#fff;
  color:var(--muted);font-size:14px;font-weight:800;cursor:pointer;transition:all .15s;text-align:center;}
.rbtn:active{transform:scale(.95);}
.rbtn.on{background:linear-gradient(135deg,#26de81,#20bf6b);border-color:transparent;color:#fff;
  box-shadow:0 3px 10px rgba(32,191,107,.3);}
.time-row{display:flex;gap:10px;}
.time-box{flex:1;background:#f9f9f9;border:2px solid var(--border);border-radius:12px;
  padding:12px;text-align:center;}
.time-box-label{font-size:10px;color:var(--muted);font-weight:800;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;}
.time-box-val{font-family:'Fredoka One',cursive;font-size:20px;color:var(--text);margin-bottom:8px;min-height:28px;}
.time-btn{width:100%;padding:10px;border:none;border-radius:10px;font-family:'Fredoka One',cursive;
  font-size:14px;cursor:pointer;transition:all .2s;}
.time-btn:active{transform:scale(.97);}
.time-btn-start{background:linear-gradient(135deg,#26de81,#20bf6b);color:#fff;
  box-shadow:0 3px 10px rgba(32,191,107,.3);}
.time-btn-end{background:linear-gradient(135deg,#ff6b9d,#ff9f43);color:#fff;
  box-shadow:0 3px 10px rgba(255,107,157,.3);}
.time-btn-reset{background:#f0f0f0;color:#aaa;}
.ring-rep-btn{width:100%;padding:18px;background:linear-gradient(135deg,#26de81,#20bf6b);
  border:none;border-radius:14px;color:#fff;font-family:'Fredoka One',cursive;font-size:20px;
  cursor:pointer;transition:all .2s;box-shadow:0 4px 18px rgba(32,191,107,.35);margin-top:6px;}
.ring-rep-btn:active{transform:scale(.98);}
.ring-rep-btn:disabled{opacity:.35;cursor:not-allowed;}
.ring-log-box{background:#fff;border:2px solid var(--border);border-radius:16px;padding:16px;
  margin-top:16px;box-shadow:0 2px 12px rgba(245,184,0,.06);}
.ring-log-row{border-bottom:1px solid #f5f5f5;padding:10px 0;display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
.ring-log-row:last-child{border-bottom:none;}
.ring-rate-tag{font-size:12px;font-weight:800;color:#20bf6b;background:#e8faf2;
  padding:2px 10px;border-radius:10px;white-space:nowrap;}
.ring-time{font-size:12px;color:var(--muted);font-weight:700;}
.ring-rake{font-family:'Fredoka One',cursive;font-size:18px;color:var(--text);margin-left:auto;}
.ring-dealer{font-size:11px;color:var(--muted);}

/* FLOOR PASSWORD */
.pw-wrap{min-height:60vh;display:flex;align-items:center;justify-content:center;padding:20px;}
.pw-card{background:#fff;border-radius:20px;padding:32px;width:100%;max-width:320px;
  text-align:center;box-shadow:0 8px 32px rgba(245,184,0,.15);}
.pw-title{font-family:'Fredoka One',cursive;font-size:22px;color:var(--pink);margin-bottom:6px;}
.pw-sub{color:var(--muted);font-size:13px;margin-bottom:20px;}
.pw-error{color:#ff4757;font-size:12px;font-weight:700;margin-top:8px;}


/* FLOOR PASSWORD */
.pw-wrap{min-height:60vh;display:flex;align-items:center;justify-content:center;padding:20px;}
.pw-card{background:#fff;border-radius:20px;padding:32px;width:100%;max-width:320px;
  text-align:center;box-shadow:0 8px 32px rgba(245,184,0,.15);}
.pw-title{font-family:'Fredoka One',cursive;font-size:22px;color:var(--pink);margin-bottom:6px;}
.pw-sub{color:var(--muted);font-size:13px;margin-bottom:20px;}
.pw-error{color:#ff4757;font-size:12px;font-weight:700;margin-top:8px;}

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
.bc{background:#f0f0f0;color:#aaa;border:1px solid #ddd;}
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
.note-inp{resize:none;line-height:1.5;}

/* VISIT */
.visit-wrap{padding:16px;max-width:900px;margin:0 auto;}
.visit-form{background:#fff;border:2px solid var(--border);border-radius:16px;padding:16px;
  margin-bottom:16px;box-shadow:0 2px 12px rgba(245,184,0,.06);}
.visit-form-title{font-family:'Fredoka One',cursive;font-size:16px;color:var(--pink);margin-bottom:12px;}
.visit-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;}
.visit-label{font-size:10px;color:var(--muted);font-weight:800;letter-spacing:.5px;text-transform:uppercase;margin-bottom:5px;}
.player-card{background:#fff;border:2px solid var(--border);border-radius:14px;
  margin-bottom:8px;overflow:hidden;box-shadow:0 2px 8px rgba(245,184,0,.06);}
.player-card.checked-out>.player-header{opacity:.55;}
.player-header{display:flex;align-items:center;padding:12px 14px;cursor:pointer;gap:10px;}
.player-header:hover{background:#fffdf0;}
.player-name{font-weight:800;font-size:15px;flex:1;}
.player-badges{display:flex;gap:5px;flex-wrap:wrap;align-items:center;}
.player-body{padding:12px 14px;border-top:2px solid var(--border);background:#fffdf0;}
.action-row{display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap;}
.action-btn{padding:8px 12px;border:2px solid var(--border);border-radius:10px;background:#fff;
  color:var(--muted);font-size:12px;font-weight:800;cursor:pointer;transition:all .15s;}
.action-btn:hover{border-color:var(--pink);color:var(--pink);}
.action-btn:active{transform:scale(.95);}
.entry-list{display:flex;flex-direction:column;gap:4px;margin-bottom:8px;}
.entry-item{display:flex;align-items:center;gap:8px;padding:6px 10px;
  background:#fff;border-radius:8px;border:1px solid var(--border);font-size:12px;}
.entry-item-type{font-weight:800;}
.entry-item-pay{color:var(--muted);}
.entry-item-time{color:var(--muted);margin-left:auto;font-size:11px;}
.checkout-btn{padding:6px 14px;border:2px solid var(--green-dark);border-radius:8px;
  background:#fff;color:var(--green-dark);font-size:12px;font-weight:800;cursor:pointer;transition:all .15s;}
.checkout-btn:hover{background:var(--green-dark);color:#fff;}
.ring-tag{font-size:11px;font-weight:800;color:var(--blue);background:#e3f2fd;
  padding:2px 8px;border-radius:10px;}
.pay-modal{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:500;
  display:flex;align-items:flex-end;justify-content:center;padding:20px;}
.pay-modal-card{background:#fff;border-radius:20px 20px 16px 16px;padding:24px;width:100%;max-width:420px;}
.pay-modal-title{font-family:'Fredoka One',cursive;font-size:18px;color:var(--pink);margin-bottom:16px;}
.pay4{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;}
.p4btn{padding:14px;border:2px solid var(--border);border-radius:12px;background:#fff;
  color:var(--muted);font-size:14px;font-weight:800;cursor:pointer;transition:all .15s;text-align:center;}
.p4btn:active{transform:scale(.95);}
.p4btn.on{background:linear-gradient(135deg,#F5B800,#FFD32A);border-color:transparent;color:#333;}

/* SHIFT */
.shift-wrap{padding:16px;max-width:900px;margin:0 auto;}
.shift-card{background:#fff;border:2px solid var(--border);border-radius:14px;
  padding:14px 16px;margin-bottom:8px;box-shadow:0 2px 8px rgba(245,184,0,.06);}
.shift-card.working{border-color:var(--green-dark);}
.shift-card.break{border-color:var(--orange);}
.shift-card.off{opacity:.5;}
.shift-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
.shift-name{font-weight:800;font-size:15px;min-width:80px;}
.shift-status{padding:3px 10px;border-radius:20px;font-size:11px;font-weight:800;}
.shift-status.working{background:#e8faf2;color:var(--green-dark);}
.shift-status.break{background:#fff3e0;color:var(--orange);}
.shift-status.off{background:#f5f5f5;color:#aaa;}
.shift-time{font-size:12px;color:var(--muted);font-weight:600;}
.shift-inp{border:2px solid var(--border);border-radius:8px;padding:4px 8px;
  font-size:13px;font-weight:700;width:80px;outline:none;text-align:center;}
.shift-inp:focus{border-color:var(--pink);}
.shift-btn{padding:5px 12px;border-radius:8px;border:2px solid;font-size:11px;font-weight:800;cursor:pointer;transition:all .15s;}
.shift-btn.break{border-color:var(--orange);color:var(--orange);background:#fff;}
.shift-btn.break:hover{background:var(--orange);color:#fff;}
.shift-btn.resume{border-color:var(--green-dark);color:var(--green-dark);background:#fff;}
.shift-btn.resume:hover{background:var(--green-dark);color:#fff;}
.shift-btn.out{border-color:#ddd;color:#aaa;background:#fff;}
.shift-btn.out:hover{border-color:#ff4757;color:#ff4757;}
.next-break{background:linear-gradient(135deg,#fff3e0,#fff8f0);border:2px solid var(--orange);
  border-radius:12px;padding:10px 14px;margin-bottom:12px;font-size:13px;font-weight:700;color:var(--orange);}

/* CARD */
.card-wrap{padding:20px;max-width:900px;margin:0 auto;}
.card-total{background:linear-gradient(135deg,#F5B800,#FFD32A);border-radius:16px;
  padding:16px 20px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;}
.card-total-label{font-size:13px;font-weight:800;color:#333;}
.card-total-amount{font-family:'Fredoka One',cursive;font-size:28px;color:#333;}
.card-table{width:100%;border-collapse:collapse;}
.card-table th{text-align:left;padding:9px 13px;font-size:10px;color:var(--muted);
  font-weight:800;letter-spacing:.5px;text-transform:uppercase;border-bottom:2px solid var(--border);}
.card-table td{padding:10px 13px;border-bottom:1px solid #fff5f8;font-size:13px;vertical-align:middle;}
.card-table tr:hover td{background:#fff8fb;}
.card-table tr.settled td{opacity:.4;}
.amount-inp{width:100px;padding:6px 10px;border:2px solid var(--border);border-radius:8px;
  font-family:'Nunito',sans-serif;font-size:14px;font-weight:700;outline:none;text-align:right;}
.amount-inp:focus{border-color:var(--pink);}
.settle-btn{padding:5px 12px;border:2px solid var(--green-dark);border-radius:8px;
  background:#fff;color:var(--green-dark);font-size:11px;font-weight:800;cursor:pointer;transition:all .15s;}
.settle-btn:hover{background:var(--green-dark);color:#fff;}
.settle-btn.done{background:#e8faf2;color:var(--green-dark);border-color:#e8faf2;cursor:default;}
.unsettle-btn{padding:5px 12px;border:2px solid #ddd;border-radius:8px;
  background:#fff;color:#aaa;font-size:11px;font-weight:800;cursor:pointer;}
.unsettle-btn:hover{border-color:#ff4757;color:#ff4757;}
.addon-list-note{font-size:11px;color:var(--muted);font-style:italic;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.note-cell{font-size:11px;color:var(--muted);font-style:italic;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.pay-tag{font-size:11px;font-weight:800;color:var(--green-dark);background:#e8faf2;
  padding:2px 8px;border-radius:10px;white-space:nowrap;}

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
.dealer-list{display:flex;flex-direction:column;gap:8px;margin:12px 0;width:100%;}
.dealer-select-btn{width:100%;padding:13px;background:#fff;border:2px solid var(--border);
  border-radius:12px;font-family:'Nunito',sans-serif;font-size:16px;font-weight:800;
  color:var(--text);cursor:pointer;transition:all .15s;text-align:center;}
.dealer-select-btn:hover{border-color:var(--pink);color:var(--pink);}
.dealer-select-btn:active{transform:scale(.97);}
.add-dealer-link{background:none;border:none;color:var(--muted);font-size:13px;font-weight:700;
  cursor:pointer;margin-top:8px;font-family:'Nunito',sans-serif;text-decoration:underline;}
.add-dealer-link:hover{color:var(--pink);}
.add-dealer-form{width:100%;margin-top:8px;display:flex;flex-direction:column;gap:8px;}
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
  const [floorAuthed, setFloorAuthed] = useState(() => sessionStorage.getItem("floorAuthed") === "1");
  const [floorPwInput, setFloorPwInput] = useState("");
  const [floorPwError, setFloorPwError] = useState(false);
  const loginRef = useRef(null);
  const dealerInputRef = useRef(null);

  const [table, setTable]           = useState(null);
  const [seat, setSeat]             = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [entryType, setEntryType]   = useState("reentry");

  const [note, setNote] = useState("");
  const [payment, setPayment] = useState("現金");

  // Visit form state
  const [selectedDate, setSelectedDate] = useState(null); // null = today
  const [visitName, setVisitName]           = useState("");
  const [visitMemberIdSearch, setVisitMemberIdSearch] = useState("");
  const [visitSelectedMemberId, setVisitSelectedMemberId] = useState(null);
  const [showVisitSugg, setShowVisitSugg]   = useState(false);
  const [visitMemberId, setVisitMemberId]   = useState("");
  const [visitFeePayment, setVisitFeePayment] = useState("現金");
  const [visitRingPoints, setVisitRingPoints] = useState("");
  const [visitHasRing, setVisitHasRing]     = useState(false);
  const [visitRingPayment, setVisitRingPayment] = useState("現金");
  const [visitRingAmount, setVisitRingAmount]   = useState("");
  const [expandedVisit, setExpandedVisit]   = useState(null);
  const [payModal, setPayModal]             = useState(null); // {visitId, actionType}
  const [payModalPayment, setPayModalPayment] = useState("現金");
  const [payModalAmount, setPayModalAmount]   = useState("");
  const [payModalNote, setPayModalNote]       = useState("");
  const [showAddDealer, setShowAddDealer] = useState(false);
  const [newDealerInput, setNewDealerInput] = useState("");
  const [floorRingView, setFloorRingView]   = useState(false);
  const [floorShiftView, setFloorShiftView] = useState(false);
  const [tick, setTick] = useState(0);
  const [shiftModal, setShiftModal]           = useState(null);
  const [shiftModalClockIn, setShiftModalClockIn] = useState("");
  const [shiftModalBreaks, setShiftModalBreaks]   = useState([""]);
  const [shiftModalPreset, setShiftModalPreset]     = useState("");
  const [shiftModalClockOut, setShiftModalClockOut] = useState("");
  const SHIFT_PRESETS = {
    "A": { clockIn:"17:30", clockOut:"23:00", breaks:["20:30","22:00"] },
    "B": { clockIn:"19:00", clockOut:"23:40", breaks:["21:00","22:30"] },
    "C": { clockIn:"20:00", clockOut:"23:40", breaks:["21:30","23:00"] },
    "D": { clockIn:"19:00", clockOut:"23:00", breaks:["21:00","22:00"] },
    "E": { clockIn:"20:00", clockOut:"23:40", breaks:["21:30","23:00"] },
  };

  // RING state - restore from localStorage
  const [ringRate, setRingRate]       = useState(()=>localStorage.getItem("ringRate")||null);
  const [ringStart, setRingStart]     = useState(()=>localStorage.getItem("ringStart")||null);
  const [ringEnd, setRingEnd]         = useState(()=>localStorage.getItem("ringEnd")||null);
  const [ringRake, setRingRake]       = useState("");
  const [ringNote, setRingNote]       = useState("");
  const [ringPauses, setRingPauses]   = useState(()=>{ try{ return JSON.parse(localStorage.getItem("ringPauses")||"[]"); }catch(e){ return []; } });
  const [ringPauseStart, setRingPauseStart] = useState(()=>localStorage.getItem("ringPauseStart")||null);
  const [ringEditStart, setRingEditStart] = useState(false);
  const [ringEditEnd, setRingEditEnd]     = useState(false);
  const [ringEditStartVal, setRingEditStartVal] = useState("");
  const [ringEditEndVal, setRingEditEndVal]     = useState("");

  // ADD-ON list state
  const [addonList, setAddonList]   = useState([]);
  const [addonRow, setAddonRow]     = useState({player:"",table:null,seat:null,payment:"現金",note:""});

  const [fType, setFType]     = useState("all");
  const [fTable, setFTable]   = useState("all");
  const [fSynced, setFSynced] = useState("all");
  const [newPlayer, setNewPlayer] = useState("");

  // Tick every 30 seconds for shift elapsed time
  useEffect(() => {
    const timer = setInterval(() => setTick(t=>t+1), 30000);
    return () => clearInterval(timer);
  }, []);

  // Firebase
  useEffect(() => {
    const dataRef = ref(db, "tournament_data");
    const unsub = onValue(dataRef, (snap) => {
      const val = snap.val();
      // valがnullの場合は初回のみ空データをセット、既存データは絶対に上書きしない
      if (val !== null) {
        setData(val);
      } else {
        setData(prev => prev || { tournaments:[], players:[], log:[] });
      }
    });
    return () => unsub();
  }, []);

  const persist = useCallback(async (next) => {
    if (!next) return;
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

  // Report - REENTRY / REBUY
  const handleReport = async () => {
    if (!dealerTid || !data) return;
    const entry = { id:Date.now(), tid:dealerTid, table, seat,
      player: playerName.trim() || null,
      dealer: dealerName, note: note.trim()||null,
      payment: payment,
      type:entryType, time:nowTime(), ts:Date.now(), synced:false };
    let next = { ...data, tournaments:[...(data.tournaments||[])], players:[...(data.players||[])], log:[entry,...(data.log||[])] };
    if (entry.player && !next.players.find(p=>p.name===entry.player))
      next.players = [...next.players, {name:entry.player, id:Date.now()}];
    next.tournaments = next.tournaments.map(t=>t.id===dealerTid?{...t,entryCount:(t.entryCount||0)+1}:t);
    if (payment === "カード") {
      const cardEntry = { id:Date.now()+1, logId:entry.id, player:entry.player, type:entryType, amount:null, settled:false, ts:Date.now() };
      next.cardLog = [cardEntry, ...(data.cardLog||[])];
    }
    await persist(next);
    setToast(true); setTimeout(()=>setToast(false),2500);
    setTable(null); setSeat(null); setPlayerName(""); setNote(""); setPayment("現金");
  };

  // ADD-ON row management
  const addAddonRow = () => {
    if (!addonRow.player.trim() && !addonRow.table) return;
    setAddonList(prev=>[...prev,{...addonRow,id:Date.now()}]);
    setAddonRow({player:"",table:null,seat:null,payment:"現金",note:""});
  };
  const removeAddonRow = (id) => setAddonList(prev=>prev.filter(r=>r.id!==id));

  // Report - ADD-ON bulk
  const handleAddonReport = async () => {
    if (!dealerTid || !data || addonList.length===0) return;
    const now = nowTime();
    const newEntries = addonList.map((r,i)=>({
      id: Date.now()+i, tid:dealerTid,
      table:r.table, seat:r.seat,
      player:r.player.trim()||null,
      payment:r.payment,
      note:r.note||null,
      dealer:dealerName,
      type:"addon", time:now, ts:Date.now()+i, synced:false
    }));
    let next = { ...data, tournaments:[...(data.tournaments||[])], players:[...(data.players||[])], log:[...newEntries,...(data.log||[])] };
    newEntries.forEach(e=>{
      if(e.player && !next.players.find(p=>p.name===e.player))
        next.players=[...next.players,{name:e.player,id:Date.now()+Math.random()}];
    });
    next.tournaments = next.tournaments.map(t=>t.id===dealerTid?{...t,entryCount:(t.entryCount||0)+newEntries.length}:t);
    const newCardEntries = newEntries.filter(e=>e.payment==="カード").map(e=>({
      id:Date.now()+Math.random(), logId:e.id, player:e.player, type:"addon", amount:null, settled:false, ts:Date.now()
    }));
    if (newCardEntries.length>0) next.cardLog = [...newCardEntries, ...(data.cardLog||[])];
    await persist(next);
    setAddonList([]);
    setAddonRow({player:"",table:null,seat:null,payment:"現金",note:""});
    setToast(true); setTimeout(()=>setToast(false),2500);
  };

  // RING report
  const calcWorkMin = () => {
    if (!ringStart || !ringEnd) return 0;
    const toMin = t => { const p=t.split(":").map(Number); return p[0]*60+p[1]; };
    let start = toMin(ringStart), end = toMin(ringEnd);
    if (end < start) end += 24*60;
    let pauseMin = ringPauses.reduce((s,p) => {
      let ps = toMin(p.start), pe = toMin(p.end);
      if (pe < ps) pe += 24*60;
      return s + (pe - ps);
    }, 0);
    return Math.max(0, end - start - pauseMin);
  };

  const handleRingReport = async () => {
    if (!ringRate || !ringStart || !ringEnd || !ringRake) return;
    const workMin = calcWorkMin();
    const entry = {
      id: Date.now(), type:"ring",
      dealer: dealerName,
      rate: ringRate,
      start: ringStart,
      end: ringEnd,
      workMin,
      rake: Number(ringRake),
      note: ringNote.trim()||null,
      time: nowTime(), ts: Date.now()
    };
    const next = { ...data, ringLog: [entry, ...(data.ringLog||[])] };
    await persist(next);
    setToast(true); setTimeout(()=>setToast(false), 2500);
    setRingRate(null); setRingStart(null); setRingEnd(null);
    setRingRake(""); setRingNote("");
    localStorage.removeItem("ringRate"); localStorage.removeItem("ringStart"); localStorage.removeItem("ringEnd");
    localStorage.removeItem("ringPauses"); localStorage.removeItem("ringPauseStart");
    setRingPauses([]); setRingPauseStart(null);

    // スプレッドシートに自動転記
    try {
      await fetch(GAS_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealer:  entry.dealer,
          start:   entry.start,
          end:     entry.end,
          rake:    entry.rake,
          rate:    entry.rate,
          workMin: entry.workMin,
          note:    entry.note || ""
        })
      });
    } catch(e) {
      console.error("スプレッドシート転記エラー:", e);
    }
  };

  const toggleCancel = async (id) => {
    await persist({ ...data, log:(data.log||[]).map(e=>e.id===id?{...e,cancelled:!e.cancelled}:e) });
  };

  const toggleConfirmed = async (id) => {
    await persist({ ...data, log:(data.log||[]).map(e=>e.id===id?{...e,confirmed:!e.confirmed}:e) });
  };

  const toggleSynced = async (id) => {
    await persist({ ...data, log:(data.log||[]).map(e=>e.id===id?{...e,synced:!e.synced}:e) });
  };

  // Shift management
  const setShiftStatus = async (dealerName, newStatus) => {
    const today = todayKey();
    const shift = (data.shiftLog||[]).find(s=>s.dealer===dealerName&&s.date===today&&s.status!=="off");
    if (!shift) return;
    const t = nowTime();
    let updates = { status: newStatus };
    if (newStatus === "working") {
      // 稼働開始時刻を記録
      updates.workingStart = t;
      if (shift.status === "break") {
        const breaks = [...(shift.breaks||[])];
        if (breaks.length>0) breaks[breaks.length-1] = {...breaks[breaks.length-1], end:t, endTs:Date.now()};
        updates.breaks = breaks;
      }
    }
    if (newStatus === "break") {
      const breaks = [...(shift.breaks||[]), { start:t, startTs:Date.now() }];
      updates = { ...updates, breaks };
    }
    await persist({ ...data, shiftLog:(data.shiftLog||[]).map(s=>
      s.dealer===dealerName&&s.date===today&&s.status!=="off" ? {...s,...updates} : s
    )});
  };

  const resetShift = async (id) => {
    await persist({ ...data, shiftLog:(data.shiftLog||[]).filter(s=>s.id!==id) });
  };

  const clockIn = async (dealerName, clockInTime, scheduledBreaks, scheduledClockOut) => {
    const today = todayKey();
    const existing = (data.shiftLog||[]).find(s=>s.dealer===dealerName&&s.date===today);
    if (existing) return;
    const entry = {
      id: Date.now(),
      date: today,
      dealer: dealerName,
      clockIn: clockInTime || nowTime(),
      clockInTs: Date.now(),
      scheduledBreaks: (scheduledBreaks||[]).filter(t=>t),
      scheduledClockOut: scheduledClockOut || "",
      breaks: [],
      status: "waiting"
    };
    await persist({ ...data, shiftLog:[...(data.shiftLog||[]),entry] });
  };

  // Get elapsed time string (tick dependency forces re-render)
  const elapsed = (fromTime) => {
    void tick; // tick依存で再レンダリング
    if (!fromTime) return "";
    const [h,m] = fromTime.split(":").map(Number);
    const now = new Date();
    const jst = new Date(now.getTime()+9*60*60*1000);
    const [nh,nm] = [jst.getUTCHours(),jst.getUTCMinutes()];
    let diff = (nh*60+nm)-(h*60+m);
    if(diff<0) diff+=24*60;
    return `${Math.floor(diff/60)}:${String(diff%60).padStart(2,"0")}`;
  };

  // Get next scheduled break
  const nextScheduledBreak = (shift) => {
    if(!shift.scheduledBreaks?.length) return null;
    const now = new Date();
    const jst = new Date(now.getTime()+9*60*60*1000);
    const nowStr = `${String(jst.getUTCHours()).padStart(2,"0")}:${String(jst.getUTCMinutes()).padStart(2,"0")}`;
    return shift.scheduledBreaks.find(t=>t>nowStr) || null;
  };
  const clockOut = async (id) => {
    const t = nowTime();
    await persist({ ...data, shiftLog:(data.shiftLog||[]).map(s=>s.id===id?{...s,clockOut:t,clockOutTs:Date.now(),status:"off"}:s) });
  };
  const startBreak = async (dealerName) => { await setShiftStatus(dealerName, "break"); };
  const endBreak   = async (dealerName) => { await setShiftStatus(dealerName, "working"); };
  const setWorking = async (dealerName) => { await setShiftStatus(dealerName, "working"); };
  const updateSchedule = async (id, field, value) => {
    await persist({ ...data, shiftLog:(data.shiftLog||[]).map(s=>s.id===id?{...s,[field]:value}:s) });
  };

  const updateCardAmount = async (id, amount) => {
    await persist({ ...data, cardLog:(data.cardLog||[]).map(c=>c.id===id?{...c,amount:amount?Number(amount):null}:c) });
  };
  const toggleCardSettled = async (id) => {
    await persist({ ...data, cardLog:(data.cardLog||[]).map(c=>c.id===id?{...c,settled:!c.settled}:c) });
  };
  const updateCardPayment = async (logId, newPayment) => {
    // Update payment in log and add/remove from cardLog
    const updatedLog = (data.log||[]).map(e=>e.id===logId?{...e,payment:newPayment}:e);
    let updatedCardLog = [...(data.cardLog||[])];
    const existsInCard = updatedCardLog.find(c=>c.logId===logId);
    if (newPayment==="カード" && !existsInCard) {
      const logEntry = (data.log||[]).find(e=>e.id===logId);
      updatedCardLog = [{id:Date.now(),logId,player:logEntry?.player,type:logEntry?.type,amount:null,settled:false,ts:Date.now()},...updatedCardLog];
    } else if (newPayment!=="カード" && existsInCard) {
      updatedCardLog = updatedCardLog.filter(c=>c.logId!==logId);
    }
    await persist({ ...data, log:updatedLog, cardLog:updatedCardLog });
  };

  const viewDate = () => selectedDate || todayKey();

  const todayKey = () => {
    const resetHour = Number((data?.settings?.resetHour) ?? 0);
    const now = new Date();
    // JST = UTC+9
    const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    // リセット時刻より前なら前日扱い
    if (jst.getUTCHours() < resetHour) {
      jst.setUTCDate(jst.getUTCDate() - 1);
    }
    return jst.toISOString().split("T")[0];
  };

  const addVisit = async () => {
    if (!visitName.trim() && !visitSelectedMemberId) return;
    const player = visitSelectedMemberId ? getPlayer(visitSelectedMemberId) : null;
    const entry = {
      id: Date.now(),
      date: todayKey(),
      name: player?.name || visitName.trim(),
      memberId: visitSelectedMemberId || visitMemberId.trim() || null,
      feePayment: visitFeePayment,
      fee: 1100,
      ringPoints: visitHasRing ? (Number(visitRingPoints)||null) : null,
      ringPayment: visitHasRing ? visitRingPayment : null,
      hasRing: visitHasRing,
      checkedOut: false,
      outChips: null,
      entries: [],
      time: nowTime(),
      ts: Date.now()
    };
    let next = { ...data, visitLog:[entry,...(data.visitLog||[])] };
    // PLAYERSに未登録なら自動追加
    if (entry.name && !(next.players||[]).find(p=>p.name===entry.name)) {
      next.players = [...(next.players||[]), {name:entry.name, id:Date.now()+3}];
    }
    if (visitFeePayment === "カード") {
      const cardEntry = { id:Date.now()+1, logId:entry.id, player:entry.name, memberId:entry.memberId, type:"施設利用料", amount:1100, settled:false, ts:Date.now() };
      next.cardLog = [cardEntry,...(data.cardLog||[])];
    }
    if (visitHasRing && visitRingPayment === "カード") {
      const ringCardEntry = { id:Date.now()+2, logId:entry.id, player:entry.name, memberId:entry.memberId, type:"リング参加", amount:visitRingAmount?Number(visitRingAmount):null, settled:false, ts:Date.now() };
      next.cardLog = [ringCardEntry,...(next.cardLog||[])];
    }
    await persist(next);
    setVisitName(""); setVisitMemberId(""); setVisitFeePayment("現金");
    setVisitRingPoints(""); setVisitHasRing(false); setVisitRingPayment("現金"); setVisitRingAmount("");
    setVisitSelectedMemberId(null); setVisitMemberIdSearch(""); setShowVisitSugg(false);
    setExpandedVisit(entry.id);
    setToast(true); setTimeout(()=>setToast(false),2500);
  };

  const addVisitEntry = async (visitId, type, payment, amount, note) => {
    const entryItem = { id:Date.now(), type, payment, amount:amount?Number(amount):null, note:note||null, time:nowTime() };
    let next = { ...data, visitLog:(data.visitLog||[]).map(v=>
      v.id===visitId ? {...v, entries:[...(v.entries||[]),entryItem]} : v
    )};
    if (payment === "カード") {
      const visit = (data.visitLog||[]).find(v=>v.id===visitId);
      const cardEntry = { id:Date.now()+1, logId:entryItem.id, player:visit?.name, memberId:visit?.memberId, type, amount:amount?Number(amount):null, settled:false, ts:Date.now() };
      next.cardLog = [cardEntry,...(data.cardLog||[])];
    }
    await persist(next);
    setPayModal(null); setPayModalPayment("現金"); setPayModalAmount(""); setPayModalNote("");
  };

  const checkoutVisit = async (id) => {
    await persist({ ...data, visitLog:(data.visitLog||[]).map(v=>v.id===id?{...v,checkedOut:true,outTime:nowTime()}:v) });
  };

  const addDealer = async (name) => {
    const n = name.trim();
    if (!n || (data.dealers||[]).find(d=>d.name===n)) return;
    await persist({ ...data, dealers:[...(data.dealers||[]),{name:n,id:Date.now()}] });
  };
  const deleteDealer = async (id) => {
    await persist({ ...data, dealers:(data.dealers||[]).filter(d=>d.id!==id) });
  };

  const importPlayersFromCSV = async (file) => {
    const text = await file.text();
    const lines = text.split("\n").slice(1);
    let added = 0, updated = 0;
    let updatedPlayers = [...(data.players||[])];
    lines.forEach(line => {
      if (!line.trim()) return;
      const cols = line.split(",");
      const nickname = cols[1]?.trim().replace(/^"|"$/g,'');
      const id = cols[2]?.trim().replace(/^"|"$/g,'');
      if (!nickname || !id) return;
      const existing = updatedPlayers.find(p=>p.memberId===id);
      if (existing) {
        // 名前が変わっていたら更新
        if (existing.name !== nickname) {
          updatedPlayers = updatedPlayers.map(p=>p.memberId===id?{...p,name:nickname}:p);
          updated++;
        }
      } else {
        updatedPlayers.push({ id:Date.now()+Math.random(), name:nickname, memberId:id });
        added++;
      }
    });
    await persist({ ...data, players:updatedPlayers });
    alert(`登録: ${added}人 / 名前更新: ${updated}人`);
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
  const getPlayer = (memberId) => (data.players||[]).find(p=>p.memberId===memberId) || null;
  const getPlayerName = (memberId) => getPlayer(memberId)?.name || memberId || "—";
  const dealerTournament = tournaments.find(t=>t.id===dealerTid) || null;
  const floorLog         = activeTournament ? log.filter(e=>e.tid===activeTid) : log.filter(e=>{
    // 日付フィルター
    const eDate = e.ts ? (() => {
      const d = new Date(e.ts + 9*60*60*1000);
      return d.toISOString().split("T")[0];
    })() : null;
    return !eDate || eDate === viewDate();
  });
  const activeLog        = floorLog.filter(e=>!e.cancelled);
  const filteredLog      = floorLog.filter(e => {
    if (fType!=="all" && e.type!==fType) return false;
    if (fTable!=="all" && String(e.table)!==fTable) return false;
    if (fSynced==="done" && !e.synced) return false;
    if (fSynced==="pending" && e.synced) return false;
    return true;
  });
  const pendingCount = activeLog.filter(e=>!e.synced).length;
  const usedTables   = [...new Set(floorLog.map(e=>e.table).filter(Boolean))].sort((a,b)=>a-b);

  const DateBar = () => {
    const today = todayKey();
    const yesterday = (() => {
      const resetHour = Number((data?.settings?.resetHour) ?? 0);
      const now = new Date();
      const jst = new Date(now.getTime() + 9*60*60*1000);
      if (jst.getUTCHours() < resetHour) jst.setUTCDate(jst.getUTCDate()-1);
      jst.setUTCDate(jst.getUTCDate()-1);
      return jst.toISOString().split("T")[0];
    })();
    return (
      <div style={{background:"#fff",borderBottom:"2px solid var(--border)",padding:"8px 16px",
        display:"flex",gap:8,alignItems:"center",overflowX:"auto"}}>
        <button className={`fc ${!selectedDate?"on":""}`} onClick={()=>setSelectedDate(null)}>今日</button>
        <button className={`fc ${selectedDate===yesterday?"on":""}`} onClick={()=>setSelectedDate(yesterday)}>昨日</button>
        <input type="date" value={selectedDate||today}
          onChange={e=>setSelectedDate(e.target.value===today?null:e.target.value)}
          style={{border:"2px solid var(--border)",borderRadius:20,padding:"3px 10px",
            fontSize:12,fontWeight:700,color:"var(--text)",outline:"none",cursor:"pointer"}} />
        <span style={{fontSize:11,color:"var(--muted)",fontWeight:700,whiteSpace:"nowrap"}}>
          {viewDate()}
        </span>
      </div>
    );
  };

  const TBar = ({selectedId, onSelect, showAll=false, showRing=false, todayOnly=false}) => (
    <div className="t-bar">
      {showAll && <button className={`ttab ${!selectedId&&!floorRingView&&!floorShiftView?"on":""}`} onClick={()=>{onSelect(null);setFloorRingView(false);setFloorShiftView(false);}}>🏠 ALL</button>}
      {showRing && <button className={`ttab ${floorRingView?"on":""}`} onClick={()=>{setFloorRingView(true);onSelect(null);setFloorShiftView(false);}}>💰 RING</button>}
      {showRing && <button className={`ttab ${floorShiftView?"on":""}`} onClick={()=>{setFloorShiftView(true);setFloorRingView(false);onSelect(null);}}>👥 シフト</button>}
      {(todayOnly ? tournaments.filter(t=>t.date===todayKey()) : tournaments).map(t=>(
        <button key={t.id} className={`ttab ${selectedId===t.id&&!floorRingView&&!floorShiftView?"on":""}`} onClick={()=>{onSelect(t.id);setFloorRingView(false);setFloorShiftView(false);}}>
          <span className={t.status==="live"?"dot-live":"dot-end"}></span>{t.name}
        </button>
      ))}
      {tournaments.length===0 && !showRing && <span className="no-t">TOURNタブでトナメを作成してください</span>}
      <button className="add-t-btn" onClick={()=>setModal("new")}>＋ 新規</button>
    </div>
  );

  // Dealer login screen
  const DealerLogin = () => {
    const dealers = data?.dealers || [];
    return (
      <div className="login-wrap">
        <div className="login-card">
          <img src={logo} alt="フルーツ" style={{width:"100px",borderRadius:"12px",marginBottom:"12px"}} />
          <div className="login-title">Fruits 越谷</div>
          <div className="login-sub">名前を選択してください</div>
          {dealers.length === 0
            ? <p style={{color:"var(--muted)",fontSize:13,margin:"16px 0"}}>ディーラーが登録されていません</p>
            : <div className="dealer-list">
                {dealers.map(d => (
                  <button key={d.id} className="dealer-select-btn" onClick={() => {
                    sessionStorage.setItem("dealerName", d.name);
                    setDealerName(d.name);
                  }}>{d.name}</button>
                ))}
              </div>
          }
          {!showAddDealer
            ? <button className="add-dealer-link" onClick={() => setShowAddDealer(true)}>＋ 新しいディーラーを追加</button>
            : <div className="add-dealer-form">
                <input className="login-input" placeholder="ディーラー名..."
                  ref={dealerInputRef}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                      addDealer(dealerInputRef.current?.value||"");
                      setShowAddDealer(false);
                    }
                  }} autoFocus />
                <button className="login-btn" onClick={() => {
                  addDealer(dealerInputRef.current?.value||"");
                  setShowAddDealer(false);
                }}>追加 ✓</button>
                <button className="add-dealer-link" onClick={() => setShowAddDealer(false)}>キャンセル</button>
              </div>
          }
        </div>
      </div>
    );
  };

  if (!dealerName) return (
    <>
      <style>{css}</style>
      <DealerLogin />
    </>
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
            {[["dealer","🎴 トナメ"],["ring","💰 リング"],["floor","📊 フロア"],["visit","🏠 来店"],["card","💳 カード"],["tournaments","🏆 TOURN."],["dealers","👥 DEALER"],["players","👤 PLAYERS"],["settings","⚙️ 設定"]].map(([v,l])=>(
              <button key={v} className={`ntab ${view===v?"on":""}`} onClick={()=>setView(v)}>{l}</button>
            ))}
          </div>
          {dealerName && (
            <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
              <span style={{fontSize:12,fontWeight:800,color:"var(--text)"}}>👤 {dealerName}</span>
              <button className="logout-btn" style={{color:"var(--muted)",border:"1px solid var(--border)",borderRadius:8,padding:"4px 10px"}} onClick={handleLogout}>ログアウト</button>
            </div>
          )}
        </nav>

        {view==="dealer" && <TBar selectedId={dealerTid} onSelect={setDealerTid} todayOnly />}
        {view==="floor"  && <TBar selectedId={activeTid} onSelect={setActiveTid} showAll showRing />}
        {(view==="visit"||view==="floor"||view==="card") && <DateBar />}

        {/* DEALER */}
        {view==="dealer" && (
          <div className="dealer-wrap">
                <div className="dealer-header">
                  <div className="dealer-header-left">
                    <h2>🎴 DEALER REPORT</h2>
                    <p>{dealerTournament ? `▶ ${dealerTournament.name}` : "上のタブでトナメを選択してください"}</p>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end"}}>
                    <div className="dealer-badge">👤 {dealerName}</div>
                    {(()=>{
                      const myShift = (data.shiftLog||[]).find(s=>s.dealer===dealerName&&s.date===todayKey());
                      if(!myShift||myShift.status==="off") return null;
                      return myShift.status==="working"
                        ? <button style={{background:"#fff3e0",border:"2px solid var(--orange)",borderRadius:8,
                            padding:"4px 10px",fontSize:11,fontWeight:800,color:"var(--orange)",cursor:"pointer"}}
                            onClick={()=>startBreak(dealerName)}>⏸ 休憩</button>
                        : myShift.status==="break"
                        ? <button style={{background:"#e8faf2",border:"2px solid var(--green-dark)",borderRadius:8,
                            padding:"4px 10px",fontSize:11,fontWeight:800,color:"var(--green-dark)",cursor:"pointer"}}
                            onClick={()=>endBreak(dealerName)}>▶ 復帰</button>
                        : myShift.status==="waiting"
                        ? <button style={{background:"#e3f2fd",border:"2px solid var(--blue)",borderRadius:8,
                            padding:"4px 10px",fontSize:11,fontWeight:800,color:"var(--blue)",cursor:"pointer"}}
                            onClick={()=>setWorking(dealerName)}>▶ 稼働開始</button>
                        : null;
                    })()}
                  </div>
                </div>

                {!dealerTid
                  ? <div className="empty"><div className="ico">🏆</div><p>トナメを選択してください</p></div>
                  : <>
                      {/* 種別選択 - 一番上 */}
                      <div className="fsec">
                        <div className="ftitle">🎯 種別</div>
                        <div className="type-row">
                          <button className={`tbtn ${entryType==="reentry"?"r":""}`} onClick={()=>setEntryType("reentry")}>🔄 REENTRY</button>
                          <button className={`tbtn ${entryType==="rebuy"?"b":""}`}   onClick={()=>setEntryType("rebuy")}>💰 REBUY</button>
                          <button className={`tbtn ${entryType==="addon"?"a":""}`}   onClick={()=>setEntryType("addon")}>➕ ADD-ON</button>
                        </div>
                      </div>

                      {/* REENTRY / REBUY 画面 */}
                      {entryType !== "addon" && <>
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
                          {/* 来店中のプレイヤーを優先表示 */}
                          <div className="sugg" style={{marginTop:8}}>
                            {(data.visitLog||[])
                              .filter(v=>v.date===new Date().toISOString().split("T")[0]&&!v.checkedOut)
                              .filter(v=>!playerName||v.name.toLowerCase().includes(playerName.toLowerCase()))
                              
                              .map(v=>(
                                <button key={v.id} className="chip" style={{background:"#fffdf0",borderColor:"var(--pink)",color:"var(--pink)"}}
                                  onClick={()=>setPlayerName(v.name)}>{v.name}</button>
                              ))
                            }
                            {playerName.length>0 && (data.players||[])
                              .filter(p=>p.name?.toLowerCase().includes(playerName.toLowerCase()))
                              .filter(p=>!(data.visitLog||[]).find(v=>v.name===p.name&&!v.checkedOut))
                              
                              .map(p=>(
                                <button key={p.id} className="chip" onClick={()=>setPlayerName(p.name)}>{p.name}</button>
                              ))
                            }
                          </div>
                        </div>
                        <div className="fsec">
                          <div className="ftitle">💳 支払い方法</div>
                          <div className="payment-row">
                            {["現金","カード","ポイント"].map(p=>(
                              <button key={p} className={`pbtn ${payment===p?"on":""}`}
                                onClick={()=>setPayment(p)}>{p}</button>
                            ))}
                          </div>
                        </div>
                        <div className="fsec">
                          <div className="ftitle">📝 備考<span className="opt">任意</span></div>
                          <textarea className="inp note-inp" placeholder="備考を入力（任意）..."
                            value={note} onChange={e=>setNote(e.target.value)} rows={2}/>
                        </div>
                        <button className="rep-btn" onClick={handleReport}>REPORT 🚀</button>
                      </>}

                      {/* ADD-ON 画面 */}
                      {entryType === "addon" && <>
                        {/* 入力行 */}
                        <div className="fsec">
                          <div className="ftitle">➕ ADD-ONを追加</div>
                          <div className="addon-input-row">
                            <div className="addon-field">
                              <div className="addon-label">👤 プレイヤー名<span className="opt">任意</span></div>
                              <input className="inp" placeholder="名前（任意）..."
                                value={addonRow.player}
                                onChange={e=>setAddonRow(r=>({...r,player:e.target.value}))} />
                              {addonRow.player.length>0 && (
                                <div className="sugg">
                                  {players.filter(p=>p.name.toLowerCase().includes(addonRow.player.toLowerCase())).map(p=>(
                                    <button key={p.id} className="chip" onClick={()=>setAddonRow(r=>({...r,player:p.name}))}>{p.name}</button>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="addon-sub-row">
                              <div className="addon-field-sm">
                                <div className="addon-label">🪑 テーブル<span className="opt">任意</span></div>
                                <div className="g5">{TABLES.map(t=>(
                                  <button key={t} className={`sbtn ${addonRow.table===t?"on":""}`}
                                    onClick={()=>setAddonRow(r=>({...r,table:r.table===t?null:t}))}>{t}</button>
                                ))}</div>
                              </div>
                              <div className="addon-field-sm">
                                <div className="addon-label">💺 シート<span className="opt">任意</span></div>
                                <div className="g3">{SEATS.map(s=>(
                                  <button key={s} className={`sbtn ${addonRow.seat===s?"on":""}`}
                                    onClick={()=>setAddonRow(r=>({...r,seat:r.seat===s?null:s}))}>{s}</button>
                                ))}</div>
                              </div>
                            </div>
                            <div className="addon-field">
                              <div className="addon-label">💳 支払い方法</div>
                              <div className="payment-row">
                                {["現金","カード","ポイント"].map(p=>(
                                  <button key={p} className={`pbtn ${addonRow.payment===p?"on":""}`}
                                    onClick={()=>setAddonRow(r=>({...r,payment:p}))}>{p}</button>
                                ))}
                              </div>
                            </div>
                            <div className="addon-field">
                              <div className="addon-label">📝 備考<span className="opt">任意</span></div>
                              <textarea className="inp note-inp" placeholder="備考を入力（任意）..."
                                value={addonRow.note} onChange={e=>setAddonRow(r=>({...r,note:e.target.value}))} rows={2}/>
                            </div>
                            <button className="add-row-btn" onClick={addAddonRow}>＋ リストに追加</button>
                          </div>
                        </div>

                        {/* ADD-ONリスト */}
                        {addonList.length>0 && (
                          <div className="fsec">
                            <div className="ftitle">📋 ADD-ONリスト <span style={{color:"var(--green-dark)",marginLeft:4}}>{addonList.length}人</span></div>
                            <div className="addon-list">
                              {addonList.map(r=>(
                                <div key={r.id} className="addon-list-row">
                                  <span className="addon-list-name">{r.player||"—"}</span>
                                  <span className="addon-list-meta">{r.table?`T${r.table}`:""}{r.seat?`-${r.seat}`:""}</span>
                                  <span className="addon-list-pay">{r.payment}</span>
                                  {r.note&&<span className="addon-list-note">{r.note}</span>}
                                  <button className="del" onClick={()=>removeAddonRow(r.id)}>✕</button>
                                </div>
                              ))}
                            </div>
                            <button className="rep-btn" style={{marginTop:12}} onClick={handleAddonReport}>
                              {addonList.length}人分をREPORT 🚀
                            </button>
                          </div>
                        )}
                        {addonList.length===0 && (
                          <div className="empty" style={{padding:"24px"}}><p>上で追加してリストに入れてください</p></div>
                        )}
                      </>}
                    </>
                }
              </div>
        )}

        {/* FLOOR PASSWORD */}
        {view==="floor" && !floorAuthed && (
          <div className="pw-wrap">
            <div className="pw-card">
              <div style={{fontSize:40,marginBottom:8}}>🔐</div>
              <div className="pw-title">FLOOR</div>
              <div className="pw-sub">パスワードを入力してください</div>
              <input className="login-input" type="password" placeholder="••••"
                value={floorPwInput}
                onChange={e=>{setFloorPwInput(e.target.value);setFloorPwError(false);}}
                onKeyDown={e=>{
                  if(e.key==="Enter"){
                    if(floorPwInput==="0116"){sessionStorage.setItem("floorAuthed","1");setFloorAuthed(true);setFloorPwInput("");}
                    else{setFloorPwError(true);setFloorPwInput("");}
                  }
                }} autoFocus />
              {floorPwError && <div className="pw-error">パスワードが違います ❌</div>}
              <button className="login-btn" style={{marginTop:14}} onClick={()=>{
                if(floorPwInput==="0116"){sessionStorage.setItem("floorAuthed","1");setFloorAuthed(true);setFloorPwInput("");}
                else{setFloorPwError(true);setFloorPwInput("");}
              }}>入力 🔓</button>
            </div>
          </div>
        )}
        {view==="floor" && floorAuthed && (
          <div className="floor-wrap">
            {!floorRingView && !floorShiftView && <>
              <div className="fhead">
                <h2>{activeTournament ? `🏆 ${activeTournament.name}` : "🏠 ALL TOURNAMENTS"}</h2>
                <div className="live-ind"><span className="pulse"></span>LIVE</div>
              </div>
              <div className="stats">
                <div className="sc g"><div className="sn">{activeLog.length}</div><div className="sl">Total</div></div>
                <div className="sc"><div className="sn" style={{color:"var(--pink)"}}>{activeLog.filter(e=>e.type==="reentry").length}</div><div className="sl">Reentry</div></div>
                <div className="sc"><div className="sn" style={{color:"var(--blue)"}}>{activeLog.filter(e=>e.type==="rebuy").length}</div><div className="sl">Rebuy</div></div>
                <div className="sc"><div className="sn" style={{color:"var(--green-dark)"}}>{activeLog.filter(e=>e.type==="addon").length}</div><div className="sl">Add-on</div></div>
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
                          <th>種別</th><th>支払い</th><th>備考</th><th>報告者</th>
                          <th style={{textAlign:"center"}}>システム反映</th>
                          <th style={{textAlign:"center"}}>確認</th>
                          <th style={{textAlign:'center'}}>取り消し</th>
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
                                <td>
                                <select style={{border:"2px solid var(--border)",borderRadius:8,padding:"3px 6px",
                                  fontSize:12,fontWeight:700,background:"#fff",cursor:"pointer"}}
                                  defaultValue={e.payment||"現金"}
                                  onChange={ev=>updateCardPayment(e.id, ev.target.value)}>
                                  <option>現金</option>
                                  <option>カード</option>
                                  <option>ポイント</option>
                                </select>
                              </td>
                                <td>{e.note?<span className="note-cell" title={e.note}>{e.note}</span>:<span style={{color:"#ccc"}}>—</span>}</td>
                                <td><span className="reporter">👤 {e.dealer||"—"}</span></td>
                                <td><div className="sc-cell">
                                  <div className={`cbox ${e.synced?"ck":""}`} onClick={()=>!e.cancelled&&toggleSynced(e.id)}/>
                                </div></td>
                                <td><div className="sc-cell">
                                  <div className={`cbox ${e.confirmed?"ck":""}`} onClick={()=>!e.cancelled&&toggleConfirmed(e.id)}/>
                                </div></td>
                                <td style={{textAlign:"center"}}>
                                  {e.cancelled
                                    ? <button className="cancel-btn cancelled" onClick={()=>toggleCancel(e.id)}>取り消し解除</button>
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
            </>}

            {/* SHIFT VIEW in floor */}
            {floorShiftView && (
              <div className="shift-wrap">
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                  <div style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:"var(--pink)"}}>👥 シフト管理</div>
                  <div style={{fontSize:11,color:"var(--muted)",fontWeight:700}}>{todayKey()}</div>
                </div>

                {/* カードグリッド */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
                  {/* 未出勤ディーラー */}
                  {(data.dealers||[]).filter(d=>!(data.shiftLog||[]).find(s=>s.dealer===d.name&&s.date===todayKey()))
                    .map(d=>(
                    <div key={d.id} className="shift-card" style={{opacity:.6}}>
                      <div style={{fontWeight:800,fontSize:15,marginBottom:6}}>⚫ {d.name}</div>
                      <div style={{fontSize:12,color:"var(--muted)",marginBottom:10}}>未出勤</div>
                      <button className="shift-btn resume" style={{width:"100%",padding:"8px"}}
                        onClick={()=>{setShiftModal({dealerName:d.name});setShiftModalClockIn(nowTime());setShiftModalClockOut("");setShiftModalBreaks([""]);setShiftModalPreset("");}}>
                        出勤登録
                      </button>
                    </div>
                  ))}

                  {/* 出勤済みディーラー */}
                  {[...(data.shiftLog||[])].filter(s=>s.date===todayKey())
                    .sort((a,b)=>a.clockIn.localeCompare(b.clockIn))
                    .map(s=>(
                    <div key={s.id} className={`shift-card ${s.status}`}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                        <div style={{fontWeight:800,fontSize:15}}>
                          {s.status==="working"?"🟢":s.status==="break"?"🟡":s.status==="waiting"?"🔵":"⚫"} {s.dealer}
                        </div>
                        <span className={`shift-status ${s.status}`} style={{
                          background:s.status==="waiting"?"#e3f2fd":"",
                          color:s.status==="waiting"?"var(--blue)":""}}>
                          {s.status==="working"?"稼働中":s.status==="break"?"休憩中":s.status==="waiting"?"出勤中":"退勤済み"}
                        </span>
                      </div>

                      {/* 経過時間 */}
                      {s.status==="working"&&(
                        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:"var(--green-dark)",marginBottom:4}}>
                          {elapsed(s.workingStart||s.clockIn)} 経過
                        </div>
                      )}
                      {s.status==="waiting"&&(
                        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:"var(--blue)",marginBottom:4}}>
                          待機中
                        </div>
                      )}
                      {s.status==="break"&&s.breaks?.length>0&&(
                        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:"var(--orange)",marginBottom:4}}>
                          {elapsed(s.breaks[s.breaks.length-1].start)} 休憩中
                        </div>
                      )}

                      <div style={{fontSize:11,color:"var(--muted)",marginBottom:6}}>
                        出勤 {s.clockIn}
                        {s.scheduledClockOut&&<span style={{color:"var(--muted)"}}> 〜 {s.scheduledClockOut}</span>}
                        {s.clockOut&&<span style={{color:"var(--green-dark)",fontWeight:700}}> | 退勤 {s.clockOut}</span>}
                        {s.status==="break"&&s.breaks?.length>0&&<span> | 休憩 {s.breaks[s.breaks.length-1].start}〜</span>}
                      </div>

                      {/* 予定休憩 */}
                      {(s.scheduledBreaks||[]).filter(t=>t).length>0&&(
                        <div style={{marginBottom:8,display:"flex",gap:4,flexWrap:"wrap"}}>
                          {(s.scheduledBreaks||[]).filter(t=>t).map((t,i)=>(
                            <span key={i} style={{fontSize:11,fontWeight:700,
                              background:nextScheduledBreak(s)===t?"#fff3e0":"#f5f5f5",
                              color:nextScheduledBreak(s)===t?"var(--orange)":"var(--muted)",
                              padding:"2px 8px",borderRadius:8}}>
                              ☕{t}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* 休憩履歴 */}
                      {(s.breaks||[]).filter(b=>b.end).length>0&&(
                        <div style={{marginBottom:8,display:"flex",gap:4,flexWrap:"wrap"}}>
                          {(s.breaks||[]).filter(b=>b.end).map((b,i)=>(
                            <span key={i} style={{fontSize:10,color:"var(--muted)",background:"#f5f5f5",padding:"2px 6px",borderRadius:6}}>
                              {b.start}〜{b.end}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* ボタン */}
                      <div style={{display:"flex",gap:6,marginTop:4,flexWrap:"wrap"}}>
                        {s.status==="waiting"&&<button className="shift-btn resume" style={{flex:1,padding:"7px"}} onClick={()=>setWorking(s.dealer)}>▶ 稼働開始</button>}
                        {s.status==="working"&&<button className="shift-btn break" style={{flex:1,padding:"7px"}} onClick={()=>startBreak(s.dealer)}>⏸ 休憩</button>}
                        {s.status==="break"&&<button className="shift-btn resume" style={{flex:1,padding:"7px"}} onClick={()=>endBreak(s.dealer)}>▶ 復帰</button>}
                        {(s.status==="waiting"||s.status==="working"||s.status==="break")&&
                          <button className="shift-btn out" style={{padding:"7px 10px"}} onClick={()=>clockOut(s.id)}>退勤</button>}
                        {s.status==="off"&&<button className="shift-btn break" style={{flex:1,padding:"7px"}} onClick={()=>resetShift(s.id)}>🔄 リセット</button>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RING LOG in floor */}
            {floorRingView && (
              <div className="log-box">
                <div className="sec-head">
                  <div className="sec-title">💰 RINGログ</div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    {["20-50","50-100","MIX"].map(rate=>{
                      const total = (data.ringLog||[]).filter(e=>e.rate===rate).reduce((s,e)=>s+(e.rake||0),0);
                      return total>0 ? (
                        <span key={rate} style={{fontSize:12,fontWeight:800,color:"var(--green-dark)",background:"#e8faf2",padding:"3px 10px",borderRadius:10}}>
                          {rate}: {total.toLocaleString()}
                        </span>
                      ) : null;
                    })}
                    <span style={{fontSize:12,fontWeight:800,color:"var(--pink)",background:"#fffdf0",padding:"3px 10px",borderRadius:10}}>
                      合計: {(data.ringLog||[]).reduce((s,e)=>s+(e.rake||0),0).toLocaleString()}
                    </span>
                  </div>
                </div>
                {(data.ringLog||[]).length===0
                  ? <div className="empty"><div className="ico">💰</div><p>まだ報告がありません</p></div>
                  : <div style={{overflowX:"auto"}}>
                      <table className="log-table">
                        <thead><tr>
                          <th>時刻</th><th>ディーラー</th><th>レート</th>
                          <th>開始</th><th>終了</th><th>レーキ</th><th>備考</th>
                        </tr></thead>
                        <tbody>
                          {(data.ringLog||[]).map(e=>(
                            <tr key={e.id}>
                              <td><span className="tmuted">{e.time}</span></td>
                              <td><span className="reporter">👤 {e.dealer}</span></td>
                              <td><span className="ring-rate-tag">{e.rate}</span></td>
                              <td><span className="tmuted">{e.start}</span></td>
                              <td><span className="tmuted">{e.end}</span></td>
                              <td style={{fontFamily:"'Fredoka One',cursive",fontSize:16}}>{(e.rake||0).toLocaleString()}</td>
                              <td>{e.note?<span className="note-cell" title={e.note}>{e.note}</span>:<span style={{color:"#ccc"}}>—</span>}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                }
              </div>
            )}
          </div>
        )}
        {/* RING */}
        {view==="ring" && (
          <div className="ring-wrap">
                <div className="ring-header">
                  <div><h2>💰 RING REPORT</h2><p>👤 {dealerName}</p></div>
                </div>

                {/* レート */}
                <div className="fsec">
                  <div className="ftitle">💴 レート</div>
                  <div className="rate-row">
                    {["20-50","50-100","MIX"].map(r=>(
                      <button key={r} className={`rbtn ${ringRate===r?"on":""}`}
                        onClick={()=>{setRingRate(r);localStorage.setItem("ringRate",r);}}>{r}</button>
                    ))}
                  </div>
                </div>

                {/* 時間 */}
                <div className="fsec">
                  <div className="ftitle">⏱ 時間</div>
                  <div className="time-row">
                    <div className="time-box">
                      <div className="time-box-label">START</div>
                      {ringEditStart
                        ? <div style={{display:"flex",gap:4,margin:"4px 0"}}>
                            <input className="inp" style={{fontSize:16,padding:"6px 8px",textAlign:"center"}}
                              value={ringEditStartVal} onChange={e=>setRingEditStartVal(e.target.value)} placeholder="HH:MM" />
                            <button className="time-btn time-btn-start" style={{padding:"6px 10px",fontSize:12}} onClick={()=>{
                              setRingStart(ringEditStartVal); localStorage.setItem("ringStart",ringEditStartVal);
                              setRingEditStart(false);
                            }}>✓</button>
                          </div>
                        : <div className="time-box-val" onClick={()=>{setRingEditStartVal(ringStart||"");setRingEditStart(true);}}
                            style={{cursor:"pointer",textDecoration:"underline dotted"}}>{ringStart||"--:--"}</div>
                      }
                      {!ringEditStart && <>
                        {ringStart
                          ? <button className="time-btn time-btn-reset" onClick={()=>{setRingStart(null);localStorage.removeItem("ringStart");}}>リセット</button>
                          : <button className="time-btn time-btn-start" onClick={()=>{const t=nowTime();setRingStart(t);localStorage.setItem("ringStart",t);setWorking(dealerName);}}>▶ START</button>
                        }
                      </>}
                    </div>
                    <div className="time-box">
                      <div className="time-box-label">END</div>
                      {ringEditEnd
                        ? <div style={{display:"flex",gap:4,margin:"4px 0"}}>
                            <input className="inp" style={{fontSize:16,padding:"6px 8px",textAlign:"center"}}
                              value={ringEditEndVal} onChange={e=>setRingEditEndVal(e.target.value)} placeholder="HH:MM" />
                            <button className="time-btn time-btn-end" style={{padding:"6px 10px",fontSize:12}} onClick={()=>{
                              setRingEnd(ringEditEndVal); localStorage.setItem("ringEnd",ringEditEndVal);
                              setRingEditEnd(false);
                            }}>✓</button>
                          </div>
                        : <div className="time-box-val" onClick={()=>{setRingEditEndVal(ringEnd||"");setRingEditEnd(true);}}
                            style={{cursor:"pointer",textDecoration:"underline dotted"}}>{ringEnd||"--:--"}</div>
                      }
                      {!ringEditEnd && <>
                        {ringEnd
                          ? <button className="time-btn time-btn-reset" onClick={()=>{setRingEnd(null);localStorage.removeItem("ringEnd");}}>リセット</button>
                          : <button className="time-btn time-btn-end" disabled={!ringStart} onClick={()=>{const t=nowTime();setRingEnd(t);localStorage.setItem("ringEnd",t);startBreak(dealerName);}}>■ END</button>
                        }
                      </>}
                    </div>
                  </div>

                  {/* 一時停止ボタン */}
                  {ringStart && !ringEnd && (
                    <div style={{marginTop:10}}>
                      {!ringPauseStart
                        ? <button className="time-btn" style={{background:"linear-gradient(135deg,#feca57,#ff9f43)",color:"#333",width:"100%",padding:14,fontSize:15,fontWeight:800,borderRadius:12}}
                            onClick={()=>{const t=nowTime();setRingPauseStart(t);localStorage.setItem("ringPauseStart",t);}}>
                            ⏸ 一時停止
                          </button>
                        : <button className="time-btn time-btn-start" style={{width:"100%",padding:14,fontSize:15,fontWeight:800,borderRadius:12}}
                            onClick={()=>{
                              const t=nowTime();
                              const newPauses=[...ringPauses,{start:ringPauseStart,end:t}];
                              setRingPauses(newPauses); localStorage.setItem("ringPauses",JSON.stringify(newPauses));
                              setRingPauseStart(null); localStorage.removeItem("ringPauseStart");
                            }}>
                            ▶ 再開（{ringPauseStart}〜）
                          </button>
                      }
                      {ringPauses.length>0 && (
                        <div style={{marginTop:6,fontSize:11,color:"var(--muted)"}}>
                          停止: {ringPauses.map((p,i)=><span key={i} style={{marginRight:6}}>{p.start}〜{p.end}</span>)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 稼働時間プレビュー */}
                  {ringStart && ringEnd && (
                    <div style={{marginTop:8,textAlign:"center",fontSize:13,color:"var(--green-dark)",fontWeight:800}}>
                      稼働時間: {calcWorkMin()}分
                      {ringPauses.length>0 && <span style={{color:"var(--muted)",fontWeight:600}}> （停止{ringPauses.reduce((s,p)=>{
                        const toMin=t=>{const q=t.split(":").map(Number);return q[0]*60+q[1];};
                        let ps=toMin(p.start),pe=toMin(p.end);if(pe<ps)pe+=1440;return s+(pe-ps);
                      },0)}分除く）</span>}
                    </div>
                  )}
                </div>

                {/* レーキ */}
                <div className="fsec">
                  <div className="ftitle">💰 回収レーキ</div>
                  <input className="inp" type="number" placeholder="例: 5000"
                    value={ringRake} onChange={e=>setRingRake(e.target.value)} />
                </div>

                {/* 備考 */}
                <div className="fsec">
                  <div className="ftitle">📝 備考<span className="opt">任意</span></div>
                  <textarea className="inp note-inp" placeholder="備考を入力（任意）..."
                    value={ringNote} onChange={e=>setRingNote(e.target.value)} rows={2}/>
                </div>

                <button className="ring-rep-btn"
                  disabled={!ringRate||!ringStart||!ringEnd||!ringRake}
                  onClick={handleRingReport}>REPORT 💰</button>

                {/* ログ */}
                {(data.ringLog||[]).length>0 && (
                  <div className="ring-log-box">
                    <div className="sec-title" style={{marginBottom:12}}>📋 本日のRINGログ</div>
                    {(data.ringLog||[]).map(e=>(
                      <div key={e.id} className="ring-log-row">
                        <span className="ring-rate-tag">{e.rate}</span>
                        <span className="ring-time">{e.start} → {e.end}</span>
                        <span className="ring-dealer">👤 {e.dealer}</span>
                        <span className="ring-rake">{e.rake.toLocaleString()}</span>
                        {e.note&&<span style={{width:"100%",fontSize:11,color:"var(--muted)",fontStyle:"italic"}}>📝 {e.note}</span>}
                      </div>
                    ))}
                  </div>
                )}
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

        {/* VISIT */}
        {view==="visit" && (
          <div className="visit-wrap">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
              <div style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:"var(--pink)"}}>🏠 来店管理</div>
              <div style={{fontSize:11,color:"var(--muted)",fontWeight:700}}>{todayKey()}</div>
            </div>

            {/* 来店登録フォーム */}
            <div className="visit-form">
              <div className="visit-form-title">＋ 来店登録</div>
              <div style={{marginBottom:12,position:"relative"}}>
                <div className="visit-label">👤 プレイヤー名</div>
                {visitSelectedMemberId
                  ? <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",
                      background:"#fffdf0",border:"2px solid var(--pink)",borderRadius:12}}>
                      <span style={{fontWeight:800,flex:1}}>{getPlayerName(visitSelectedMemberId)}</span>
                      <span style={{fontSize:11,color:"var(--muted)"}}>#{visitSelectedMemberId}</span>
                      <button style={{background:"none",border:"none",color:"var(--muted)",cursor:"pointer",fontSize:16}}
                        onClick={()=>{setVisitSelectedMemberId(null);setVisitMemberIdSearch("");setVisitName("");}}>✕</button>
                    </div>
                  : <div style={{position:"relative"}}>
                      <input className="inp" placeholder="名前または会員番号で検索..."
                        value={visitMemberIdSearch}
                        onChange={e=>{setVisitMemberIdSearch(e.target.value);setVisitName(e.target.value);setShowVisitSugg(true);}}
                        onFocus={()=>setShowVisitSugg(true)}
                        onBlur={()=>setTimeout(()=>setShowVisitSugg(false),200)} />
                      {showVisitSugg && visitMemberIdSearch.length>0 && (
                        <div style={{position:"absolute",top:"100%",left:0,right:0,background:"#fff",
                          border:"2px solid var(--border)",borderRadius:12,zIndex:300,maxHeight:220,overflowY:"auto",
                          boxShadow:"0 4px 20px rgba(0,0,0,.1)"}}>
                          {(data.players||[])
                            .filter(p=>p.name?.toLowerCase().includes(visitMemberIdSearch.toLowerCase())||
                              p.memberId?.includes(visitMemberIdSearch))
                            
                            .map(p=>(
                              <div key={p.id} style={{padding:"10px 14px",cursor:"pointer",display:"flex",
                                alignItems:"center",gap:8,borderBottom:"1px solid var(--border)"}}
                                onMouseDown={()=>{setVisitSelectedMemberId(p.memberId);setVisitMemberIdSearch(p.name);setVisitName(p.name);setShowVisitSugg(false);}}>
                                <span style={{fontWeight:800,flex:1}}>{p.name}</span>
                                {p.memberId&&<span style={{fontSize:11,color:"var(--muted)"}}>#{p.memberId}</span>}
                              </div>
                            ))
                          }
                          {(data.players||[]).filter(p=>p.name?.toLowerCase().includes(visitMemberIdSearch.toLowerCase())||p.memberId?.includes(visitMemberIdSearch)).length===0 && (
                            <div style={{padding:"10px 14px",fontSize:13,color:"var(--muted)"}}>
                              該当なし → 下の会員番号欄に入力して登録できます
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                }
              </div>
              {/* 会員番号欄 - 常時表示 */}
              <div style={{marginBottom:12}}>
                <div className="visit-label">🔢 会員番号
                  {visitSelectedMemberId && <span style={{color:"var(--pink)",marginLeft:6,fontWeight:800}}>#{visitSelectedMemberId}</span>}
                  {!visitSelectedMemberId && <span className="opt" style={{marginLeft:4}}>任意</span>}
                </div>
                {visitSelectedMemberId
                  ? <div style={{padding:"10px 14px",background:"#f5f5f5",borderRadius:12,fontSize:13,color:"var(--muted)",fontWeight:700}}>
                      登録済み会員
                    </div>
                  : <input className="inp" placeholder="会員番号を入力..."
                      value={visitMemberId}
                      onChange={e=>setVisitMemberId(e.target.value)} />
                }
              </div>
              <div style={{marginBottom:12}}>
                <div className="visit-label">💰 施設利用料 <span style={{color:"var(--pink)",fontWeight:800}}>¥1,100</span></div>
                <div className="payment-row">
                  {["現金","カード"].map(p=>(
                    <button key={p} className={`pbtn ${visitFeePayment===p?"on":""}`}
                      onClick={()=>setVisitFeePayment(p)}>{p}</button>
                  ))}
                </div>
              </div>
              <div style={{marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                  <div className="visit-label" style={{margin:0}}>🎯 リング参加</div>
                  <button className={`p4btn ${visitHasRing?"on":""}`} style={{padding:"4px 14px",fontSize:12}}
                    onClick={()=>setVisitHasRing(v=>!v)}>{visitHasRing?"あり":"なし"}</button>
                </div>
                {visitHasRing && (
                  <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:4}}>
                    <input className="inp" type="number" placeholder="参加ポイント数..."
                      value={visitRingPoints} onChange={e=>setVisitRingPoints(e.target.value)} />
                    <div className="visit-label" style={{marginBottom:4}}>💳 リング参加費の支払い</div>
                    <div className="pay4">
                      {["現金","カード","ポイント","コイン"].map(p=>(
                        <button key={p} className={`p4btn ${visitRingPayment===p?"on":""}`}
                          onClick={()=>setVisitRingPayment(p)}>{p}</button>
                      ))}
                    </div>
                    {visitRingPayment==="カード" && (
                      <input className="inp" type="number" placeholder="カード金額..."
                        value={visitRingAmount} onChange={e=>setVisitRingAmount(e.target.value)} />
                    )}
                  </div>
                )}
              </div>
              <button className="rep-btn" disabled={!visitName.trim()} onClick={addVisit}>
                来店登録 🏠
              </button>
            </div>

            {/* 統計 */}
            {(data.visitLog||[]).filter(v=>v.date===viewDate()).length>0 && (
              <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
                <span style={{fontSize:12,fontWeight:800,color:"var(--pink)",background:"#fffdf0",padding:"4px 12px",borderRadius:10}}>
                  来店 {(data.visitLog||[]).filter(v=>v.date===viewDate()).length}人
                </span>
                <span style={{fontSize:12,fontWeight:800,color:"var(--green-dark)",background:"#e8faf2",padding:"4px 12px",borderRadius:10}}>
                  退店 {(data.visitLog||[]).filter(v=>v.date===todayKey()&&v.checkedOut).length}人
                </span>
                <span style={{fontSize:12,fontWeight:800,color:"var(--blue)",background:"#e3f2fd",padding:"4px 12px",borderRadius:10}}>
                  リング {(data.visitLog||[]).filter(v=>v.date===todayKey()&&v.hasRing).length}人
                </span>
              </div>
            )}

            {/* プレイヤーアコーディオン */}
            {(data.visitLog||[]).filter(v=>v.date===viewDate()).length===0
              ? <div className="empty"><div className="ico">🏠</div><p>本日の来店はまだありません</p></div>
              : (data.visitLog||[]).filter(v=>v.date===viewDate()).map(v=>(
                  <div key={v.id} className={`player-card ${v.checkedOut?"checked-out":""}`}>
                    {/* ヘッダー */}
                    <div className="player-header" onClick={()=>setExpandedVisit(expandedVisit===v.id?null:v.id)}>
                      <div style={{fontSize:16}}>{expandedVisit===v.id?"▼":"▶"}</div>
                      <div className="player-name">{v.name}</div>
                      <div className="player-badges">
                        {v.memberId&&<span style={{fontSize:10,color:"var(--muted)",fontWeight:700}}>#{v.memberId}</span>}
                        <span style={{fontSize:11,fontWeight:800,
                          color:v.feePayment==="カード"?"var(--blue)":v.feePayment==="コイン"?"var(--purple)":"var(--muted)",
                          background:v.feePayment==="カード"?"#e3f2fd":v.feePayment==="コイン"?"#f3e8ff":"#f5f5f5",
                          padding:"2px 8px",borderRadius:10}}>
                          {v.feePayment}
                        </span>
                        {v.hasRing&&<span className="ring-tag">{v.ringPoints?`${v.ringPoints}pt`:"RING"}{v.ringPayment?` ${v.ringPayment}`:""}</span>}
                        {(v.entries||[]).length>0&&<span style={{fontSize:11,fontWeight:800,color:"var(--pink)"}}>×{(v.entries||[]).length}</span>}
                        {v.checkedOut&&<span style={{fontSize:11,fontWeight:700,color:"var(--green-dark)"}}>退店</span>}
                      </div>
                      <span style={{fontSize:11,color:"var(--muted)"}}>{v.time}</span>
                    </div>

                    {/* 展開エリア */}
                    {expandedVisit===v.id && (
                      <div className="player-body">
                        {/* エントリー履歴 */}
                        {(v.entries||[]).length>0 && (
                          <div className="entry-list">
                            {(v.entries||[]).map(e=>(
                              <div key={e.id} className="entry-item" style={{opacity:1,textDecoration:"none"}}>
                                <span className={`bdg ${e.type==="reentry"?"br":e.type==="rebuy"?"bb":e.type==="purchase"?"bc":"ba"}`}>
                                  {e.type==="purchase"?"🛒 購入":e.type.toUpperCase()}
                                </span>
                                <span className="entry-item-pay">{e.payment}{e.amount?` ¥${e.amount.toLocaleString()}`:""}</span>
                                {e.note&&<span style={{fontSize:11,color:"var(--muted)",fontStyle:"italic"}}>{e.note}</span>}
                                <span className="entry-item-time">{e.time}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* アクションボタン */}
                        {!v.checkedOut && (
                          <div className="action-row">
                            <button className="action-btn" style={{borderColor:"var(--pink)",color:"var(--pink)"}}
                              onClick={()=>{setPayModal({visitId:v.id,actionType:"reentry"});setPayModalPayment("現金");setPayModalAmount("");setPayModalNote("");}}>
                              🔄 REENTRY
                            </button>
                            <button className="action-btn" style={{borderColor:"var(--blue)",color:"var(--blue)"}}
                              onClick={()=>{setPayModal({visitId:v.id,actionType:"rebuy"});setPayModalPayment("現金");setPayModalAmount("");setPayModalNote("");}}>
                              💰 REBUY
                            </button>
                            <button className="action-btn" style={{borderColor:"var(--green-dark)",color:"var(--green-dark)"}}
                              onClick={()=>{setPayModal({visitId:v.id,actionType:"addon"});setPayModalPayment("現金");setPayModalAmount("");setPayModalNote("");}}>
                              ➕ ADD-ON
                            </button>
                            <button className="action-btn" style={{borderColor:"var(--purple)",color:"var(--purple)"}}
                              onClick={()=>{setPayModal({visitId:v.id,actionType:"purchase"});setPayModalPayment("現金");setPayModalAmount("");setPayModalNote("");}}>
                              🛒 購入
                            </button>
                            <button className="checkout-btn" style={{marginLeft:"auto"}}
                              onClick={()=>checkoutVisit(v.id)}>
                              退店 →
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
            }
          </div>
        )}

        {/* 支払いモーダル */}
        {payModal && (
          <div className="pay-modal" onClick={()=>setPayModal(null)}>
            <div className="pay-modal-card" onClick={e=>e.stopPropagation()}>
              <div className="pay-modal-title">
                {payModal.actionType==="reentry"?"🔄 REENTRY":payModal.actionType==="rebuy"?"💰 REBUY":payModal.actionType==="addon"?"➕ ADD-ON":"🛒 購入"}
              </div>
              <div className="visit-label" style={{marginBottom:8}}>💳 支払い方法</div>
              <div className="pay4" style={{marginBottom:14}}>
                {["現金","カード","ポイント","コイン"].map(p=>(
                  <button key={p} className={`p4btn ${payModalPayment===p?"on":""}`}
                    onClick={()=>setPayModalPayment(p)}>{p}</button>
                ))}
              </div>
              <div className="visit-label" style={{marginBottom:8}}>💰 金額<span className="opt" style={{marginLeft:4}}>任意</span></div>
              <input className="inp" type="number" placeholder="金額を入力..."
                value={payModalAmount} onChange={e=>setPayModalAmount(e.target.value)}
                style={{marginBottom:12}} />
              {payModal.actionType==="purchase" && <>
                <div className="visit-label" style={{marginBottom:8}}>📝 備考<span className="opt" style={{marginLeft:4}}>任意</span></div>
                <textarea className="inp note-inp" placeholder="備考を入力..."
                  value={payModalNote} onChange={e=>setPayModalNote(e.target.value)}
                  rows={2} style={{marginBottom:12}} />
              </>}
              <button className="rep-btn" onClick={()=>addVisitEntry(payModal.visitId,payModal.actionType,payModalPayment,payModalAmount,payModalNote)}>
                追加 ✓
              </button>
            </div>
          </div>
        )}
        {/* SHIFT */}

        {/* DEALERS */}
        {view==="dealers" && (
          <div className="pw">
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:"var(--pink)",marginBottom:14}}>👥 Dealers</div>
            <div className="pform">
              <input className="inp" placeholder="ディーラー名を追加..." value={newDealerInput}
                onChange={e=>setNewDealerInput(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&!e.nativeEvent.isComposing&&(addDealer(newDealerInput),setNewDealerInput(""))} />
              <button className="add-btn" onClick={()=>{addDealer(newDealerInput);setNewDealerInput("");}}>追加</button>
            </div>
            {(data.dealers||[]).length===0
              ? <div className="empty"><div className="ico">👥</div><p>ディーラーが登録されていません</p></div>
              : <div className="pgrid">
                  {(data.dealers||[]).map(d=>(
                    <div key={d.id} className="pcard">
                      <div>
                        <div className="pname">{d.name}</div>
                        <div className="pcnt">{(data.ringLog||[]).filter(e=>e.dealer===d.name).length} rings</div>
                      </div>
                      <button className="del" onClick={()=>deleteDealer(d.id)}>✕</button>
                    </div>
                  ))}
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
            <div style={{marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
              <label style={{display:"flex",alignItems:"center",gap:8,padding:"10px 16px",
                background:"#fff",border:"2px dashed var(--border)",borderRadius:12,
                cursor:"pointer",fontSize:13,fontWeight:700,color:"var(--muted)"}}>
                📂 CSVから一括登録（ファンズ）
                <input type="file" accept=".csv" style={{display:"none"}}
                  onChange={e=>{ if(e.target.files[0]) importPlayersFromCSV(e.target.files[0]); e.target.value=""; }} />
              </label>
              <span style={{fontSize:11,color:"var(--muted)"}}>Nickname・IDを自動取得</span>
            </div>
            {players.length===0
              ? <div className="empty"><div className="ico">👤</div><p>プレイヤーが登録されていません</p></div>
              : <div className="pgrid">
                  {players.map(p=>(
                    <div key={p.id} className="pcard">
                      <div><div className="pname">{p.name}</div>
                        <div className="pcnt">{p.memberId?`#${p.memberId} · `:""}{log.filter(e=>e.player===p.name).length} entries</div>
                      </div>
                      <button className="del" onClick={()=>deletePlayer(p.id)}>✕</button>
                    </div>
                  ))}
                </div>
            }
          </div>
        )}

        {view==="settings" && (
          <div className="pw" style={{maxWidth:500}}>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:"var(--pink)",marginBottom:20}}>⚙️ 設定</div>
            <div className="fsec">
              <div className="ftitle">🕐 日付変更時刻</div>
              <div style={{color:"var(--muted)",fontSize:12,marginBottom:12}}>
                この時刻より前は前日の来店として扱います（日本時間）
              </div>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <select className="inp" style={{width:"auto",padding:"10px 14px"}}
                  value={data?.settings?.resetHour ?? 0}
                  onChange={async e=>{
                    await persist({...data, settings:{...(data.settings||{}), resetHour:Number(e.target.value)}});
                  }}>
                  {Array.from({length:12},(_,i)=>i).map(h=>(
                    <option key={h} value={h}>{String(h).padStart(2,"0")}:00</option>
                  ))}
                </select>
                <span style={{fontSize:13,color:"var(--muted)",fontWeight:600}}>
                  現在の設定: {String(data?.settings?.resetHour ?? 0).padStart(2,"0")}:00 に日付変更
                </span>
              </div>
            </div>
            <div className="fsec" style={{marginTop:12}}>
              <div className="ftitle">📅 本日の日付</div>
              <div style={{fontFamily:"'Fredoka One',cursive",fontSize:24,color:"var(--pink)"}}>
                {todayKey()}
              </div>
              <div style={{fontSize:12,color:"var(--muted)",marginTop:4}}>
                ※ 日付変更時刻の設定が反映されています
              </div>
            </div>
          </div>
        )}

        {/* 出勤登録モーダル */}
        {shiftModal && (
          <div className="pay-modal" onClick={()=>setShiftModal(null)}>
            <div className="pay-modal-card" onClick={e=>e.stopPropagation()}>
              <div className="pay-modal-title">👤 {shiftModal.dealerName} 出勤登録</div>
              <div className="visit-label" style={{marginBottom:8}}>📋 シフト種別</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
                {["A","B","C","D","E"].map(p=>(
                  <button key={p} className={`p4btn ${shiftModalPreset===p?"on":""}`}
                    style={{padding:"8px 14px"}}
                    onClick={()=>{
                      setShiftModalPreset(p);
                      setShiftModalClockIn(SHIFT_PRESETS[p].clockIn);
                      setShiftModalClockOut(SHIFT_PRESETS[p].clockOut);
                      setShiftModalBreaks(SHIFT_PRESETS[p].breaks);
                    }}>{p}</button>
                ))}
                <button className={`p4btn ${shiftModalPreset==="other"?"on":""}`}
                  style={{padding:"8px 14px"}}
                  onClick={()=>{setShiftModalPreset("other");setShiftModalClockIn("");setShiftModalClockOut("");setShiftModalBreaks([""]);}}>
                  その他
                </button>
              </div>
              <div className="visit-label" style={{marginBottom:8}}>🕐 出勤時間</div>
              <input className="inp" type="time" value={shiftModalClockIn}
                onChange={e=>setShiftModalClockIn(e.target.value)}
                style={{marginBottom:14}} />
              <div className="visit-label" style={{marginBottom:8}}>🕐 退勤予定時間</div>
              <input className="inp" type="time" value={shiftModalClockOut}
                onChange={e=>setShiftModalClockOut(e.target.value)}
                style={{marginBottom:14}} />
              <div className="visit-label" style={{marginBottom:8}}>☕ 休憩予定時刻<span className="opt" style={{marginLeft:4}}>任意・複数設定可</span></div>
              {shiftModalBreaks.map((b,i)=>(
                <div key={i} style={{display:"flex",gap:6,marginBottom:8,alignItems:"center"}}>
                  <input className="inp" type="time" value={b}
                    onChange={e=>{const nb=[...shiftModalBreaks];nb[i]=e.target.value;setShiftModalBreaks(nb);}}
                    style={{flex:1}} />
                  {shiftModalBreaks.length>1&&(
                    <button onClick={()=>setShiftModalBreaks(shiftModalBreaks.filter((_,j)=>j!==i))}
                      style={{background:"none",border:"none",color:"#ccc",cursor:"pointer",fontSize:18}}>✕</button>
                  )}
                </div>
              ))}
              <button onClick={()=>setShiftModalBreaks([...shiftModalBreaks,""])}
                style={{background:"none",border:"2px dashed var(--border)",borderRadius:10,padding:"6px 14px",
                  color:"var(--muted)",fontSize:12,fontWeight:700,cursor:"pointer",width:"100%",marginBottom:14}}>
                ＋ 休憩時刻を追加
              </button>
              <button className="rep-btn" onClick={async()=>{
                await clockIn(shiftModal.dealerName, shiftModalClockIn, shiftModalBreaks, shiftModalClockOut);
                setShiftModal(null);
              }}>出勤登録 ✓</button>
            </div>
          </div>
        )}

        <div className={`toast ${toast?"show":""}`}>✅ 報告を送信しました！</div>

        {modal==="new"          && <TournamentModal onSave={createTournament} onClose={()=>setModal(null)} />}
        {modal && modal!=="new" && <TournamentModal existing={modal} onSave={editTournament} onClose={()=>setModal(null)} />}
      </div>
    </>
  );
}
