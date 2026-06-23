// ==UserScript==
// @name         FB 信息助手
// @namespace    https://github.com/Aqu399
// @version      5.0
// @description  Facebook 个人信息收集辅助工具 — 授权渗透测试专用 🎀
// @author       阿趣 🎀
// @match        https://www.facebook.com/*
// @match        https://facebook.com/*
// @match        https://mbasic.facebook.com/*
// @match        https://m.facebook.com/*
// @match        https://*.facebook.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=facebook.com
// @grant        GM_setClipboard
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// ==/UserScript==

(function () {
  'use strict';

  // ============================================================
  //  🎀 样式
  // ============================================================
  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;600;700&display=swap');

    #fb-osint-panel {
      position: fixed; bottom: 20px; right: 20px;
      width: 430px; max-height: 92vh;
      background: #F0F8FF;
      color: #3A5A7A;
      border: 2px solid #87CEEB;
      border-radius: 18px;
      box-shadow: 0 8px 32px rgba(135,206,235,0.3);
      z-index: 999999;
      font-family: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 13px;
      overflow: hidden;
      display: flex; flex-direction: column;
      transition: transform 0.25s ease;
    }
    #fb-osint-panel.collapsed { transform: translateY(calc(100% - 44px)); }
    #fb-osint-panel.collapsed .panel-body { display: none; }

    /* 头部 */
    #fb-osint-panel .panel-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 16px;
      background: linear-gradient(90deg, #87CEEB, #A8D8EA, #87CEEB);
      border-bottom: 2px solid #6BB5D9;
      border-radius: 16px 16px 0 0;
      cursor: pointer; user-select: none;
      flex-shrink: 0;
    }
    #fb-osint-panel .panel-header .panel-title {
      font-weight: 700; font-size: 14px; color: white;
      text-shadow: 0 1px 2px rgba(0,0,0,0.1);
      line-height: 1.3;
    }
    #fb-osint-panel .panel-header .panel-title .author {
      font-weight: 400; font-size: 10px; opacity: 0.85;
    }
    #fb-osint-panel .panel-header .panel-actions { display: flex; gap: 4px; }
    #fb-osint-panel .panel-header .panel-actions button {
      background: rgba(255,255,255,0.3); border: none; color: white;
      cursor: pointer; font-size: 15px; padding: 2px 8px;
      border-radius: 8px; transition: all 0.2s;
    }
    #fb-osint-panel .panel-header .panel-actions button:hover { background: rgba(255,255,255,0.55); }

    /* 主体 */
    #fb-osint-panel .panel-body { overflow-y: auto; padding: 10px 14px; flex: 1; }

    /* Tab 栏 */
    #fb-osint-panel .tab-bar {
      display: flex; gap: 3px; margin-bottom: 10px;
      border-bottom: 2px solid #D4EDFB; padding-bottom: 6px; flex-wrap: wrap;
      flex-shrink: 0;
    }
    #fb-osint-panel .tab-bar button {
      background: none; border: none; color: #8AB4D6; cursor: pointer;
      padding: 4px 9px; border-radius: 10px; font-size: 11px; font-weight: 600;
      transition: all 0.2s; font-family: inherit;
    }
    #fb-osint-panel .tab-bar button.active { background: #87CEEB; color: white; box-shadow: 0 2px 6px rgba(135,206,235,0.3); }
    #fb-osint-panel .tab-bar button:hover:not(.active) { background: #D4EDFB; }

    /* 卡片字段 */
    #fb-osint-panel .field-group { margin-bottom: 6px; }
    #fb-osint-panel .field-group .field-label {
      font-size: 10px; color: #8AB4D6;
      letter-spacing: 0.3px; margin-bottom: 2px; font-weight: 600;
    }
    #fb-osint-panel .field-group .field-value {
      display: flex; align-items: center; justify-content: space-between;
      background: white;
      border: 1px solid #D4EDFB;
      border-radius: 10px;
      padding: 5px 10px;
      word-break: break-word;
    }
    #fb-osint-panel .field-group .field-value .copy-btn {
      background: none; border: none; color: #87CEEB;
      cursor: pointer; font-size: 13px; flex-shrink: 0; margin-left: 6px;
      padding: 2px 6px; border-radius: 6px; transition: all 0.2s;
    }
    #fb-osint-panel .field-group .field-value .copy-btn:hover { background: #D4EDFB; color: #5BA3C9; }
    #fb-osint-panel .field-group .field-value .copy-btn.copied { color: #7BC99A; }

    /* 头像 */
    #fb-osint-panel .profile-avatar {
      width: 56px; height: 56px; border-radius: 50%;
      object-fit: cover; cursor: pointer;
      border: 3px solid #87CEEB; transition: all 0.2s;
      box-shadow: 0 2px 8px rgba(135,206,235,0.3);
    }
    #fb-osint-panel .profile-avatar:hover { border-color: #5BA3C9; transform: scale(1.05); }
    #fb-osint-panel .profile-name { font-size: 16px; font-weight: 700; margin-bottom: 8px; color: #3A5A7A; }
    #fb-osint-panel .avatar-actions { display: flex; gap: 4px; flex-wrap: wrap; }
    #fb-osint-panel .avatar-actions button {
      background: white; border: 1px solid #D4EDFB; border-radius: 8px;
      color: #5BA3C9; cursor: pointer; font-size: 10px; padding: 3px 8px;
      transition: all 0.2s; font-family: inherit;
    }
    #fb-osint-panel .avatar-actions button:hover { background: #87CEEB; color: white; border-color: #87CEEB; }

    /* 关键词 */
    #fb-osint-panel .keyword-chip {
      display: inline-block; background: #E8F4FD; border: 1px solid #C5E5F7;
      color: #5BA3C9; padding: 2px 9px; border-radius: 12px; font-size: 11px;
      margin: 2px 3px; cursor: pointer; transition: all 0.2s;
    }
    #fb-osint-panel .keyword-chip:hover { background: #87CEEB; color: white; }
    #fb-osint-panel .keyword-chip.changed { background: #FFF3CD; border-color: #FFC107; color: #856404; }

    /* 列表项 */
    #fb-osint-panel .list-item {
      display: flex; align-items: center; gap: 6px;
      padding: 5px 8px; background: white; border: 1px solid #D4EDFB;
      border-radius: 10px; margin-bottom: 4px;
    }
    #fb-osint-panel .list-item .li-name { font-size: 12px; flex: 1; color: #3A5A7A; }
    #fb-osint-panel .list-item .li-link { font-size: 10px; color: #87CEEB; text-decoration: none; }
    #fb-osint-panel .list-item img { width: 26px; height: 26px; border-radius: 50%; border: 2px solid #D4EDFB; }

    /* 网格按钮 */
    #fb-osint-panel .pivot-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-top: 6px;
    }
    #fb-osint-panel .pivot-grid button {
      background: white; border: 1px solid #D4EDFB; border-radius: 8px;
      color: #5BA3C9; cursor: pointer; font-size: 10px; padding: 5px 4px;
      text-align: center; transition: all 0.2s; font-family: inherit;
    }
    #fb-osint-panel .pivot-grid button:hover { background: #87CEEB; color: white; border-color: #87CEEB; }

    /* 时间线/照片/活动 */
    #fb-osint-panel .content-item {
      font-size: 11px; padding: 5px 8px; background: white;
      border: 1px solid #D4EDFB; border-radius: 10px; margin-bottom: 3px; word-break: break-word;
      color: #3A5A7A;
    }
    #fb-osint-panel .content-item .ci-muted { color: #8AB4D6; font-size: 10px; }
    #fb-osint-panel .content-item .ci-loc { color: #7BC99A; font-size: 10px; }
    #fb-osint-panel .content-item .ci-purple { color: #C592D6; font-size: 10px; }
    #fb-osint-panel .content-item .ci-orange { color: #F0A87A; font-size: 10px; }
    #fb-osint-panel .change-badge {
      display: inline-block; background: #FFF3CD; color: #856404;
      font-size: 9px; padding: 2px 8px; border-radius: 8px; margin-left: 4px;
    }

    /* 底部按钮行 */
    #fb-osint-panel .action-row {
      display: flex; gap: 5px; margin-top: 10px; flex-wrap: wrap; flex-shrink: 0;
    }
    #fb-osint-panel .action-row button {
      flex: 1; padding: 7px 4px;
      border: 1px solid #D4EDFB; border-radius: 10px;
      background: white; color: #5BA3C9; cursor: pointer;
      font-size: 11px; min-width: 52px; transition: all 0.2s; font-family: inherit;
      font-weight: 600;
    }
    #fb-osint-panel .action-row button:hover { background: #87CEEB; color: white; border-color: #87CEEB; }
    #fb-osint-panel .action-row button.danger:hover { background: #E88B8B; border-color: #E88B8B; }
    #fb-osint-panel .status-line {
      font-size: 11px; color: #8AB4D6; text-align: center;
      padding: 5px 0 0; border-top: 1px solid #D4EDFB; margin-top: 8px; flex-shrink: 0;
    }

    /* ==================== 表格 ==================== */
    #fb-osint-panel .data-table-wrap {
      max-height: 400px; overflow-y: auto; margin-top: 6px;
      border: 1px solid #D4EDFB; border-radius: 10px; background: white;
    }
    #fb-osint-panel .data-table {
      width: 100%; border-collapse: collapse; font-size: 11px; min-width: 700px;
    }
    #fb-osint-panel .data-table th {
      background: linear-gradient(90deg, #87CEEB, #A8D8EA);
      color: white; padding: 7px 8px; text-align: left; font-weight: 600;
      position: sticky; top: 0; z-index: 1; white-space: nowrap;
      cursor: pointer; user-select: none;
    }
    #fb-osint-panel .data-table th:first-child { border-radius: 10px 0 0 0; }
    #fb-osint-panel .data-table th:last-child { border-radius: 0 10px 0 0; }
    #fb-osint-panel .data-table th .sort-icon { font-size: 9px; margin-left: 3px; opacity: 0.6; }
    #fb-osint-panel .data-table td {
      padding: 6px 8px; border-bottom: 1px solid #E8F4FD; color: #3A5A7A;
      max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    #fb-osint-panel .data-table tr:hover td { background: #F0F8FF; }
    #fb-osint-panel .data-table .row-del {
      background: none; border: none; color: #E88B8B; cursor: pointer; font-size: 14px; padding: 0 4px;
    }
    #fb-osint-panel .data-table .row-del:hover { color: #D45A5A; }

    #fb-osint-panel .data-table-empty {
      text-align: center; padding: 30px 20px; color: #8AB4D6;
    }
    #fb-osint-panel .data-table-empty .big-icon { font-size: 40px; margin-bottom: 10px; }

    /* ==================== 记事板 ==================== */
    #fb-osint-notepad {
      position: fixed; top: 80px; right: 20px;
      width: 320px; max-height: 540px;
      background: #F0F8FF;
      color: #3A5A7A;
      border: 2px solid #87CEEB;
      border-radius: 18px;
      box-shadow: 0 8px 32px rgba(135,206,235,0.3);
      z-index: 999998;
      font-family: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 12px;
      display: none; flex-direction: column;
    }
    #fb-osint-notepad.visible { display: flex; }
    #fb-osint-notepad .note-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 10px 14px;
      background: linear-gradient(90deg, #87CEEB, #A8D8EA);
      border-bottom: 2px solid #6BB5D9;
      border-radius: 16px 16px 0 0;
      cursor: move; color: white; font-weight: 700; flex-shrink: 0;
    }
    #fb-osint-notepad .note-header .note-actions { display: flex; gap: 4px; }
    #fb-osint-notepad .note-header .note-actions button {
      background: rgba(255,255,255,0.3); border: none; color: white;
      cursor: pointer; font-size: 14px; padding: 2px 8px; border-radius: 6px;
    }
    #fb-osint-notepad .note-body { padding: 8px 12px; max-height: 280px; overflow-y: auto; flex: 1; }
    #fb-osint-notepad .note-entry {
      background: white; border: 1px solid #D4EDFB;
      padding: 5px 8px; margin-bottom: 4px; border-radius: 10px;
      font-size: 11px; display: flex; justify-content: space-between; align-items: center;
    }
    #fb-osint-notepad .note-entry .entry-label { color: #87CEEB; font-weight: 600; margin-right: 4px; }
    #fb-osint-notepad .note-entry .entry-del { background: none; border: none; color: #E88B8B; cursor: pointer; font-size: 14px; padding: 0 4px; }
    #fb-osint-notepad .note-input-area { padding: 6px 12px; border-top: 1px solid #D4EDFB; }
    #fb-osint-notepad .note-input-row { display: flex; gap: 4px; }
    #fb-osint-notepad .note-input-row select {
      background: white; border: 1px solid #D4EDFB; border-radius: 8px;
      color: #3A5A7A; padding: 4px; font-size: 11px; font-family: inherit;
    }
    #fb-osint-notepad .note-input-row input {
      flex: 1; background: white; border: 1px solid #D4EDFB; border-radius: 8px;
      color: #3A5A7A; padding: 4px 8px; font-size: 12px; font-family: inherit;
    }
    #fb-osint-notepad .note-input-row button {
      background: #87CEEB; border: none; color: white; border-radius: 8px;
      cursor: pointer; padding: 4px 14px; font-weight: 600;
    }
    #fb-osint-notepad .note-export-row { display: flex; gap: 4px; padding: 6px 12px 8px; border-top: 1px solid #D4EDFB; }
    #fb-osint-notepad .note-export-row button {
      flex: 1; background: white; border: 1px solid #D4EDFB; border-radius: 8px;
      color: #5BA3C9; cursor: pointer; font-size: 10px; padding: 4px; font-family: inherit;
    }
    #fb-osint-notepad .note-export-row button:hover { background: #87CEEB; color: white; }
    #fb-osint-notepad .keyword-highlight {
      background: #E8F4FD; margin: 4px 12px 0; padding: 5px 8px;
      border-radius: 10px; border: 1px solid #D4EDFB;
    }
    #fb-osint-notepad .keyword-highlight .kh-label { font-size: 10px; color: #8AB4D6; }
    #fb-osint-notepad .template-section { padding: 6px 12px; border-top: 1px solid #D4EDFB; }
    #fb-osint-notepad .template-section summary { font-size: 11px; color: #8AB4D6; cursor: pointer; font-weight: 600; }
    #fb-osint-notepad .template-item {
      font-size: 10px; padding: 4px 8px; background: white;
      border: 1px solid #D4EDFB; border-radius: 8px; margin: 4px 0; cursor: pointer;
      color: #5BA3C9; transition: all 0.2s;
    }
    #fb-osint-notepad .template-item:hover { background: #87CEEB; color: white; border-color: #87CEEB; }

    /* 浮动按钮 */
    .fb-osint-float-btn {
      position: fixed; bottom: 80px; right: 20px;
      width: 48px; height: 48px;
      background: linear-gradient(135deg, #87CEEB, #A8D8EA);
      color: white; border: none; border-radius: 50%;
      font-size: 22px; cursor: pointer; z-index: 999999;
      box-shadow: 0 4px 16px rgba(135,206,235,0.4);
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
    }
    .fb-osint-float-btn:hover { transform: scale(1.1); box-shadow: 0 6px 20px rgba(135,206,235,0.5); }

    .fb-osint-highlight { box-shadow: 0 0 0 3px #87CEEB !important; border-radius: 8px; }

    /* 群组扫描弹窗 */
    #fb-osint-scanner-progress {
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: #F0F8FF; color: #3A5A7A;
      border: 2px solid #87CEEB; border-radius: 18px;
      padding: 24px 36px; z-index: 9999999;
      text-align: center; min-width: 320px;
      box-shadow: 0 8px 32px rgba(135,206,235,0.3);
      font-family: 'Noto Sans SC', sans-serif;
    }
    #fb-osint-scanner-progress .sp-title { font-weight: 700; font-size: 15px; margin-bottom: 8px; }
    #fb-osint-scanner-progress .sp-count { font-size: 12px; color: #8AB4D6; margin-bottom: 8px; }
    #fb-osint-scanner-progress .sp-bar-bg { width: 100%; height: 8px; background: white; border-radius: 4px; overflow: hidden; }
    #fb-osint-scanner-progress .sp-bar-fill { height: 100%; background: linear-gradient(90deg, #87CEEB, #A8D8EA); border-radius: 4px; transition: width 0.3s; }
    #fb-osint-scanner-progress .sp-close {
      margin-top: 12px; background: white; border: 1px solid #D4EDFB;
      color: #5BA3C9; padding: 6px 20px; border-radius: 10px; cursor: pointer; font-family: inherit;
    }

    .fb-osint-popup-scanner {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.3); z-index: 9999998;
      display: flex; align-items: center; justify-content: center;
    }
    .fb-osint-popup-scanner .ps-box {
      background: #F0F8FF; color: #3A5A7A; border: 2px solid #87CEEB; border-radius: 18px;
      padding: 24px; max-width: 400px; width: 90%; max-height: 80vh; overflow-y: auto;
      font-family: 'Noto Sans SC', sans-serif;
    }
    .fb-osint-popup-scanner .ps-box .ps-title { font-weight: 700; margin-bottom: 12px; }
    .fb-osint-popup-scanner .ps-box .ps-item { font-size: 12px; padding: 4px 8px; background: white; border-radius: 8px; margin-bottom: 3px; }
    .fb-osint-popup-scanner .ps-box .ps-close { margin-top: 12px; background: #87CEEB; border: none; color: white; padding: 8px 24px; border-radius: 10px; cursor: pointer; font-family: inherit; }

    /* 滚动条 */
    #fb-osint-panel .panel-body::-webkit-scrollbar,
    #fb-osint-notepad .note-body::-webkit-scrollbar,
    #fb-osint-panel .data-table-wrap::-webkit-scrollbar { width: 5px; }
    #fb-osint-panel .panel-body::-webkit-scrollbar-track,
    #fb-osint-notepad .note-body::-webkit-scrollbar-track,
    #fb-osint-panel .data-table-wrap::-webkit-scrollbar-track { background: #E8F4FD; border-radius: 3px; }
    #fb-osint-panel .panel-body::-webkit-scrollbar-thumb,
    #fb-osint-notepad .note-body::-webkit-scrollbar-thumb,
    #fb-osint-panel .data-table-wrap::-webkit-scrollbar-thumb { background: #87CEEB; border-radius: 3px; }
  `;
  GM_addStyle(styles);

  // ============================================================
  //  状态
  // ============================================================
  let panelVisible = false, activeTab = 'profile';
  let boardEntries = GM_getValue('osint_board_entries', []);
  let tableSortCol = null, tableSortAsc = true;

  // ============================================================
  //  工具
  // ============================================================
  function safeText(el) { return el ? el.textContent.trim() : ''; }
  function copyText(t) {
    try { GM_setClipboard(t); return true; } catch(e) { try { navigator.clipboard.writeText(t); return true; } catch(e2) { return false; } }
  }
  function downloadFile(fn, c, m = 'text/plain') {
    const b = new Blob([c], {type:m}); const a = document.createElement('a'); a.href=URL.createObjectURL(b); a.download=fn; a.click(); URL.revokeObjectURL(a.href);
  }
  function showStatus(m) {
    const el = document.getElementById('osint-status');
    if (el) { el.textContent = '💬 '+m; setTimeout(()=>{if(el) el.textContent='🌸 就绪';},2500); }
  }
  function toCSV(data) {
    if (!data.length) return '';
    const keys = Object.keys(data[0]);
    const esc = v => { if (v===null||v===undefined) return ''; const s=String(v); return (s.includes(',')||s.includes('"')||s.includes('\n')) ? '"'+s.replace(/"/g,'""')+'"' : s; };
    return [keys.join(','), ...data.map(r=>keys.map(k=>esc(r[k])).join(','))].join('\n');
  }
  function persistBoard() { GM_setValue('osint_board_entries', boardEntries); }
  function openURL(u) { const a=document.createElement('a'); a.href=u; a.target='_blank'; a.rel='noopener'; a.click(); }

  // ============================================================
  //  数据提取
  // ============================================================
  function extractFBUID() {
    const m = document.querySelector('meta[property="al:android:url"],meta[property="al:ios:url"]');
    if (m) { const c=m.getAttribute('content')||'', mm=c.match(/id=(\d+)/)||c.match(/user_id=(\d+)/); if(mm) return mm[1]; }
    const a = document.querySelector('link[rel="alternate"][href*="fb://"]');
    if (a) { const h=a.getAttribute('href')||'', mm=h.match(/profile\/(\d+)/)||h.match(/id=(\d+)/); if(mm) return mm[1]; }
    for (const img of document.querySelectorAll('img[src*="scontent"],img[src*="fbcdn"]')) { const s=img.src||'', mm=s.match(/\/(\d+)_\d+_\d+_n\.jpg/)||s.match(/\/p(\d+)_/); if(mm) return mm[1]; }
    const avi = document.querySelector('img.x1b0d499,image[alt*="profile"]');
    if (avi) { const s=avi.getAttribute('xlink:href')||avi.src||'', mm=s.match(/\/p(\d+)_/)||s.match(/\/v\/[^/]+\/(\d+)_/); if(mm) return mm[1]; }
    for (const s of document.querySelectorAll('script[type="application/json"],script[data-content]')) { const t=s.textContent||'', mm=t.match(/"uid":(\d+)/)||t.match(/"userID":(\d+)/i)||t.match(/"profile_id":(\d+)/i); if(mm) return mm[1]; }
    const pid = window.location.pathname.split('/').filter(Boolean)[0];
    if (pid&&!['messages','groups','photos','videos','watch','marketplace','friends','events','settings','notifications','stories'].includes(pid)) return '用户名:'+pid;
    return '';
  }

  function scrapeProfile() {
    const data = {}, url = window.location.href;
    for (const s of ['h1 span','h1','[data-pagelet="Profile"] h1','span.xdj266r span.x1jchvi3','h2.x1heor9g']) {
      const el = document.querySelector(s); if (el&&el.textContent.trim().length>2) { data.name=el.textContent.trim(); break; }
    }
    for (const s of ['img.x1b0d499.x1dofw5p','image[alt*="profile"]','circle image','img.x1rg5ohu']) {
      const el = document.querySelector(s); if (el) { let src=el.getAttribute('xlink:href')||el.src||''; src=src.replace(/\/[ps]\d+x\d+\//,'/p960x960/'); data.avatarUrl=src; break; }
    }
    data.uid = extractFBUID();
    for (const el of document.querySelectorAll('span,div.x1n2onr6>div.x1n2onr6 span,div[dir="auto"] span')) {
      const t = el.textContent.trim();
      if (t.startsWith('Lives in')) data.location=t.replace('Lives in ','').trim();
      else if (t.startsWith('From')) data.hometown=t.replace('From ','').trim();
      else if (t.startsWith('Works at')) data.work=t.replace('Works at ','').trim();
      else if (t.startsWith('Studied at')||t.startsWith('Went to')) data.education=t.replace(/^(Studied at|Went to) /,'').trim();
      else if (['Single','In a relationship','Married','Engaged','Divorced','Widowed',"It's complicated"].includes(t)) data.relationship=t;
    }
    const fc = document.body.innerText.match(/([\d,]+)\s*(?:friends?|mutual friends?)/i);
    if (fc) data.friends=fc[1];
    const bd = document.body.innerText.match(/Birthday\s*:?\s*(\w+\s+\d{1,2}(?:,\s*\d{4})?)/i);
    if (bd) data.birthday=bd[1];
    const fol = document.body.innerText.match(/([\d,.KkMmbB]+)\s*(?:follower|followers)/i);
    if (fol) data.followers=fol[1];
    for (const el of document.querySelectorAll('[data-pagelet="Profile"] p,div.x1n2onr6>div>span>span>span')) {
      const t=el.textContent.trim(); if (t.length>15&&t.length<500&&!t.startsWith('Lives in')&&!t.startsWith('Works at')&&!t.startsWith('From')&&!t.startsWith('Studied')&&!t.startsWith('Went to')) { data.bio=t; break; }
    }
    data.url=url; data.profileId=url.match(/facebook\.com\/([^/?]+)/)?.[1]||'';
    data.keywords = extractKeywords(data);
    data.mutualFriends = extractMutualFriends();
    data.posts = extractTimelinePosts();
    data.linkedAccounts = extractLinkedAccounts();
    data.contactInfo = extractContactInfo();
    data.commonGroups = extractCommonGroups();
    data.events = extractEvents();
    data.photos = extractPhotos();
    data.friendSuggestions = extractFriendSuggestions();
    return data;
  }

  function extractKeywords(data) {
    const c = [data.name,data.location,data.hometown,data.work,data.education,data.bio].filter(Boolean).join(' ')+' '+document.body.innerText;
    const kws=[], seen=new Set();
    const add=(p,v)=>{const k=p+' '+v; if(!seen.has(k)&&v){seen.add(k);kws.push(k);}};
    (c.match(/(?:\+1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g)||[]).forEach(p=>add('📞',p));
    (c.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g)||[]).forEach(e=>add('✉️',e));
    (c.match(/https?:\/\/[^\s)]+/g)||[]).forEach(u=>add('🔗',u));
    const sr=/\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)\b/g;
    let m; while((m=sr.exec(c))!==null) add('📍',m[1]);
    (c.match(/\b(\d{2})\s*(?:years old|yo|yr|y\/o)\b/gi)||[]).forEach(a=>add('🎂',a));
    (c.match(/\b(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}(?:,?\s*\d{4})?\b/gi)||[]).forEach(b=>add('🎉',b));
    (c.match(/@[a-zA-Z0-9_.-]{3,30}/g)||[]).forEach(h=>add('🆔',h));
    (c.match(/\b\d{5}(?:-\d{4})?\b/g)||[]).forEach(z=>{const n=parseInt(z,10); if(n>=10000&&n<=99999) add('📮',z);});
    if (data.bio) {
      const sw=new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','from','is','am','are','was','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','shall','can','need','dare','ought','used','this','that','these','those','i','my','me','we','our','you','your','he','him','his','she','her','it','its','they','them','their','not','no','nor','so','if','as','up','out','about','who','what','when','where','why','how','all','each','every','both','few','more','most','some','any','none','just','also','very','too','really','here','there','now','then','only','own','same','like']);
      const wd=data.bio.toLowerCase().replace(/[^a-z\s-]/g,'').split(/\s+/).filter(w=>w.length>3&&!sw.has(w));
      const fq={}; wd.forEach(w=>{fq[w]=(fq[w]||0)+1;});
      Object.entries(fq).sort((a,b)=>b[1]-a[1]).slice(0,10).forEach(([w])=>add('🏷️',w));
    }
    return kws;
  }

  function extractMutualFriends() {
    const r=[];
    for (const el of document.querySelectorAll('span,div,a')) {
      const t=el.textContent.trim().toLowerCase();
      if (t.includes('mutual friend')||t.includes('mutual friends')) {
        const l=el.closest('a')||el.querySelector('a');
        if (l) {
          const h=l.getAttribute('href')||'', p=el.closest('div[class*="x"],div[data-pagelet]'), a=p?p.querySelectorAll('img.x1b0d499,img[decoding="async"]'):[];
          r.push({text:el.textContent.trim(), url:h.startsWith('/')?'https://www.facebook.com'+h:h, count:parseInt(t.match(/(\d+)/)?.[1]||0,10), avatars:Array.from(a).slice(0,4).map(x=>x.src||x.getAttribute('xlink:href')||'')});
        }
      }
    }
    const mt=document.body.innerText.match(/(?:Mutual|mutual friends?)\s*[:,]\s*([^.\n]+)/);
    if (mt) { mt[1].split(',').map(n=>n.trim()).filter(n=>n.length>0&&!n.match(/^\d+\s*more$/)).forEach(n=>{if(!r.find(x=>x.text.includes(n))) r.push({text:n,url:'',count:0,avatars:[]});}); }
    return r;
  }

  function tryExpandMutualFriends() {
    for (const el of document.querySelectorAll('a,span[role="button"]')) {
      const t=el.textContent.trim().toLowerCase();
      if (t.match(/^\d+/)&&t.includes('mutual friend')) { el.click(); setTimeout(scrapeMutualFriendsPopup,1500); return; }
    }
  }

  function scrapeMutualFriendsPopup() {
    setTimeout(() => {
      const ns=new Set();
      for (const el of document.querySelectorAll('div[role="dialog"] a[href*="/user/"],div[role="dialog"] a[href*="profile.php"],div[role="dialog"] span[dir="auto"] a')) {
        const n=el.textContent.trim(), h=el.getAttribute('href')||'';
        if (n&&h&&n.length>1&&!n.match(/^\d+$/)) ns.add(JSON.stringify({name:n,url:h.startsWith('/')?'https://www.facebook.com'+h:h}));
      }
      if (ns.size>0) {
        const d=Array.from(ns).map(n=>JSON.parse(n));
        downloadFile(`共同好友_${Date.now()}.csv`, toCSV(d),'text/csv');
        showStatus('✅ 采集到 '+d.length+' 个共同好友');
        showScrapePopup('🤝 共同好友', d.map(x=>x.name+' — '+x.url));
      } else showStatus('没找到名字');
      document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));
    },2000);
  }

  function extractTimelinePosts() {
    const p=[], seen=new Set();
    for (const el of document.querySelectorAll('[data-pagelet="ProfileTimeline"] div[dir="auto"],[data-pagelet="Profile"] div[dir="auto"]')) {
      const t=el.textContent.trim(); if (t.length<5||t.length>500||seen.has(t)) continue; seen.add(t);
      const skip=['Lives in','Works at','Studied at','Went to','From','Add Friend','Message','Following','Suggestions','More','See more','Story','Photo','Video'];
      let ok=true; for (const s of skip) if (t.startsWith(s)){ok=false;break;} if(!ok) continue;
      let loc=''; const lm=t.match(/(?:at|in)\s+([A-Z][A-Za-z\s,]+?)(?:\.|!|\?|$)/); if(lm&&lm[1].length<30) loc=lm[1].trim();
      const ts=el.closest('[data-pagelet]')?.querySelector('a[href*="story"],a[href*="posts"]')?.textContent?.trim()||'';
      p.push({text:t.slice(0,150),location:loc,timestamp:ts});
    }
    return p.slice(0,30);
  }

  function extractLinkedAccounts() {
    const pt=document.body.innerText, a=[];
    const ps=[{p:'Instagram',r:/instagram\.com\/([a-zA-Z0-9_.]+)/i,u:h=>`https://instagram.com/${h}`},{p:'Twitter/X',r:/(?:twitter|x)\.com\/([a-zA-Z0-9_]+)/i,u:h=>`https://x.com/${h}`},{p:'LinkedIn',r:/linkedin\.com\/in\/([a-zA-Z0-9-]+)/i,u:h=>`https://linkedin.com/in/${h}`},{p:'GitHub',r:/github\.com\/([a-zA-Z0-9-]+)/i,u:h=>`https://github.com/${h}`},{p:'YouTube',r:/youtube\.com\/@([a-zA-Z0-9_-]+)/i,u:h=>`https://youtube.com/@${h}`},{p:'TikTok',r:/tiktok\.com\/@([a-zA-Z0-9_.]+)/i,u:h=>`https://tiktok.com/@${h}`},{p:'Snapchat',r:/snapchat\.com\/add\/([a-zA-Z0-9_-]+)/i,u:h=>`https://snapchat.com/add/${h}`}];
    for (const {p,r,u} of ps) { const m=pt.match(r); if(m) a.push({platform:p,handle:m[1],url:u(m[1])}); }
    return a;
  }

  function extractContactInfo() {
    const c=[], pt=document.body.innerText, h=document.body.innerHTML;
    const wa=pt.match(/(?:whatsapp|wa\.me|wa\.link)\s*(?::|is)?\s*(?:\+?1?\d{10,})/i);
    if(wa) c.push({type:'WhatsApp',value:wa[0].replace(/^(?:whatsapp|wa\.me|wa\.link)\s*(?::|is)?\s*/i,'').trim()});
    const ph=h.match(/<span[^>]*>Phone[^<]*<\/span>[^<]*<[^>]*>([^<]+)/i); if(ph) c.push({type:'电话',value:ph[1].trim()});
    const si=h.match(/<span[^>]*>Website[^<]*<\/span>[^<]*<[^>]*>([^<]+)/i); if(si) c.push({type:'网站',value:si[1].trim()});
    const em=h.match(/<span[^>]*>Email[^<]*<\/span>[^<]*<[^>]*>([^<]+)/i); if(em) c.push({type:'邮箱',value:em[1].trim()});
    return c;
  }

  function extractCommonGroups() {
    const g=[];
    for (const el of document.querySelectorAll('span,div,a')) {
      const t=el.textContent.trim().toLowerCase();
      if (t.includes('groups in common')||(t.includes('common')&&t.includes('group'))) {
        const l=el.closest('a')||el.querySelector('a');
        g.push({text:el.textContent.trim(),url:l?(l.getAttribute('href')?.startsWith('/')?'https://www.facebook.com'+l.getAttribute('href'):l.getAttribute('href')||''):''});
      }
    }
    return g;
  }

  function extractEvents() {
    const e=[], seen=new Set();
    for (const el of document.querySelectorAll('[data-pagelet="ProfileEvents"] div[dir="auto"],div[data-pagelet] a[href*="/events/"]:not([href*="/events/create"])')) {
      const t=el.textContent.trim(); if(t.length<3||seen.has(t)) continue; seen.add(t);
      const d=t.match(/\b(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}(?:,?\s*\d{4})?\b/i);
      const l=t.match(/(?:at|in)\s+([A-Z][A-Za-z\s,]+?)(?:\.|!|\?|$)/);
      const h=el.closest('a')?.getAttribute('href')||'';
      e.push({name:t.slice(0,80),date:d?d[0]:'',location:l?l[1].trim():'',url:h.startsWith('/')?'https://www.facebook.com'+h:h});
    }
    return e.slice(0,20);
  }

  function extractPhotos() {
    const p=[], seen=new Set();
    for (const el of document.querySelectorAll('a[href*="/photos/"]:not([href*="/albums/"]):not([href*="/upload"]),div[data-pagelet="ProfilePhotos"] a,a[href*="photo.php"]')) {
      const h=el.getAttribute('href')||'', img=el.querySelector('img'), src=img?(img.src||''):'';
      const pt=el.closest('div[class*="x"],div[data-pagelet]')?.textContent?.trim()||'';
      const d=pt.match(/\b(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}(?:,?\s*\d{4})?\b/i);
      const key=h||src; if(key&&!seen.has(key)){seen.add(key);p.push({text:el.textContent.trim()||'(照片)',date:d?d[0]:'',url:h,imgSrc:src.slice(0,100)});}
    }
    return p.slice(0,30);
  }

  function extractFriendSuggestions() {
    const s=[], seen=new Set();
    for (const el of document.querySelectorAll('div[data-pagelet="Profile"] div[class*="x1n2onr6"] a[href*="facebook.com/"]:not([href*="groups/"]):not([href*="photos/"]):not([href*="messages/"]),a[aria-label*="Add Friend"],a[role="button"][href*="facebook.com/"]')) {
      const n=el.textContent.trim(), h=el.getAttribute('href')||'';
      if (n&&n.length>1&&n.length<40&&h.match(/facebook\.com\/(?!groups|photos|videos|watch|marketplace|messages|events|settings|notifications|stories|friends)/)) {
        const fu=h.startsWith('/')?'https://www.facebook.com'+h:h;
        if(!seen.has(fu)){seen.add(fu);s.push({name:n,url:fu});}
      }
    }
    return s.slice(0,20);
  }

  // ============================================================
  //  变更追踪
  // ============================================================
  function checkForChanges(data) {
    const ex = GM_getValue('fb_osint_data', []);
    const p = ex.find(e=>e.url===data.url);
    if (!p) return null;
    const c={};
    ['name','location','hometown','work','education','relationship','birthday','bio'].forEach(f=>{if(p[f]&&data[f]&&p[f]!==data[f]) c[f]={old:p[f],new:data[f]};});
    const ok=new Set(p.keywords||[]), nk=new Set(data.keywords||[]);
    const add=[...nk].filter(k=>!ok.has(k)), rem=[...ok].filter(k=>!nk.has(k));
    if(add.length||rem.length) c.keywords={added:add,removed:rem};
    return Object.keys(c).length>0?c:null;
  }

  // ============================================================
  //  Tab 定义
  // ============================================================
  const TABS = [
    {id:'profile', label:'👤 主页'}, {id:'keys', label:'🔑 关键词'},
    {id:'pivot', label:'🎯 搜索'}, {id:'mutual', label:'🤝 好友'},
    {id:'group', label:'👥 群组'}, {id:'posts', label:'📰 帖子'},
    {id:'photos', label:'📸 照片'}, {id:'contacts', label:'📞 联系'},
    {id:'events', label:'📅 活动'}, {id:'network', label:'🔗 社交'},
    {id:'table', label:'📋 数据表'}, {id:'changes', label:'⚠️ 变更'},
  ];

  // ============================================================
  //  面板渲染
  // ============================================================
  function renderPanel(data) {
    const existing = document.getElementById('fb-osint-panel');
    if (existing) existing.remove();
    const changes = checkForChanges(data);
    const cb = changes ? '<span class="change-badge">⚠️ 有变更</span>' : '';

    const panel = document.createElement('div');
    panel.id = 'fb-osint-panel';
    panel.innerHTML = `
      <div class="panel-header">
        <span class="panel-title">🌸 FB 信息助手 ${cb}<br><span class="author">By.阿趣 🎀</span></span>
        <span class="panel-actions">
          <button id="osint-refresh" title="刷新">🔄</button>
          <button id="osint-toggle" title="折叠">_</button>
          <button id="osint-close" title="关闭">✕</button>
        </span>
      </div>
      <div class="panel-body">
        <div class="tab-bar">
          ${TABS.map(t=>`<button data-tab="${t.id}"${t.id==='profile'?' class="active"':''}${t.id==='changes'&&!changes?' style="display:none;"':''}>${t.label}</button>`).join('')}
        </div>
        <div id="osint-tab-content">${renderProfileTab(data, changes)}</div>
        <div class="action-row">
          <button id="osint-copy-all">📋 复制</button>
          <button id="osint-save" class="primary">💾 保存</button>
          <button id="osint-export-json">📄 JSON</button>
          <button id="osint-export-csv">📊 CSV</button>
          <button id="osint-export-table">📋 表CSV</button>
        </div>
        <div class="status-line" id="osint-status">🌸 就绪</div>
      </div>`;
    document.body.appendChild(panel);
    panelVisible = true;

    // Tab switching
    for (const btn of panel.querySelectorAll('.tab-bar button')) {
      btn.onclick = () => {
        for (const b of panel.querySelectorAll('.tab-bar button')) b.classList.remove('active');
        btn.classList.add('active'); activeTab = btn.dataset.tab;
        const cnt = document.getElementById('osint-tab-content');
        const f = {
          profile: ()=>renderProfileTab(data,changes),
          keys: ()=>renderKeysTab(data),
          pivot: ()=>renderPivotTab(data),
          mutual: ()=>renderMutualTab(data),
          group: ()=>renderGroupTab(),
          posts: ()=>renderTimelineTab(data),
          photos: ()=>renderPhotosTab(data),
          contacts: ()=>renderContactsTab(data),
          events: ()=>renderEventsTab(data),
          network: ()=>renderNetworkTab(data),
          table: ()=>renderTableTab(),
          changes: ()=>changes?renderChangesTab(changes):'<div></div>'
        };
        cnt.innerHTML = (f[activeTab]||f.profile)();
      };
    }

    document.getElementById('osint-close').onclick = () => { panel.remove(); panelVisible=false; };
    document.getElementById('osint-toggle').onclick = () => panel.classList.toggle('collapsed');
    document.getElementById('osint-refresh').onclick = () => refresh();

    document.getElementById('osint-copy-all').onclick = () => {
      const l=[`姓名: ${data.name||''}`,`FB UID: ${data.uid||'无'}`,`主页: ${data.url||''}`];
      if(data.location) l.push(`所在地: ${data.location}`);
      if(data.hometown) l.push(`家乡: ${data.hometown}`);
      if(data.work) l.push(`工作: ${data.work}`);
      if(data.education) l.push(`教育: ${data.education}`);
      if(data.relationship) l.push(`感情: ${data.relationship}`);
      if(data.birthday) l.push(`生日: ${data.birthday}`);
      if(data.friends) l.push(`好友: ${data.friends}`);
      if(data.followers) l.push(`粉丝: ${data.followers}`);
      if(data.bio) l.push(`简介: ${data.bio}`);
      l.push(''); l.push('--- 关键词 ---'); (data.keywords||[]).forEach(k=>l.push(k));
      l.push(''); l.push('--- 关联账号 ---'); (data.linkedAccounts||[]).forEach(a=>l.push(`${a.platform}: ${a.handle}`));
      if(copyText(l.join('\n'))) showStatus('已复制 ✅');
    };

    document.getElementById('osint-save').onclick = () => { saveProfile(data); showStatus('已保存 💾'); };
    document.getElementById('osint-export-json').onclick = () => exportJSON();
    document.getElementById('osint-export-csv').onclick = () => exportCSV();
    document.getElementById('osint-export-table').onclick = () => exportTableCSV();

    for (const btn of panel.querySelectorAll('.copy-btn')) {
      btn.onclick = () => { const t=btn.getAttribute('data-copy'); if(copyText(t)){btn.textContent='✅';btn.classList.add('copied');setTimeout(()=>{btn.textContent='📋';btn.classList.remove('copied');},1500);}};
    }
  }

  // ==================== 主页 Tab ====================
  function renderProfileTab(data, changes) {
    const f = [
      {l:'主页链接',v:data.url},{l:'FB UID',v:data.uid},{l:'姓名',v:data.name},
      {l:'所在地',v:data.location},{l:'家乡',v:data.hometown},{l:'工作',v:data.work},
      {l:'教育',v:data.education},{l:'感情状态',v:data.relationship},{l:'生日',v:data.birthday},
      {l:'好友数',v:data.friends},{l:'粉丝',v:data.followers},{l:'简介',v:data.bio},
    ];
    let ah='';
    if(data.avatarUrl) ah=`<div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:10px;">
      <img class="profile-avatar" src="${data.avatarUrl}" id="osint-avatar-img" />
      <div><div style="font-size:12px;font-weight:700;margin-bottom:4px;color:#3A5A7A;">📸 头像</div>
      <div class="avatar-actions">
        <button id="osint-dl-avatar">⬇️ 下载</button>
        <button id="osint-ri-google">🔍 谷歌</button>
        <button id="osint-ri-tineye">🔍 TinEye</button>
        <button id="osint-ri-yandex">🔍 Yandex</button>
      </div></div></div>`;
    let ch='';
    if(changes) ch=`<div style="background:#FFF3CD;border:1px solid #FFC107;border-radius:10px;padding:8px;margin-bottom:8px;font-size:11px;color:#856404;">⚠️ 信息有变化！<a href="#" id="osint-goto-changes" style="color:#5BA3C9;text-decoration:underline;margin-left:4px;">查看 →</a></div>`;
    const fh = f.filter(x=>x.v).map(x => {
      const ic = changes && changes[x.l];
      return `<div class="field-group"${ic?' style="border-left:3px solid #FFC107;padding-left:5px;"':''}>
        <div class="field-label">${x.l}</div>
        <div class="field-value"><span>${x.v.length>80?x.v.slice(0,80)+'…':x.v}${ic?' ⚠️':''}</span><button class="copy-btn" data-copy="${x.v.replace(/"/g,'&quot;')}">📋</button></div>
      </div>`;
    }).join('');
    return ch + ah + (data.name?`<div class="profile-name">${data.name}</div>`:'') + fh;
  }

  // ==================== 关键词 Tab ====================
  function renderKeysTab(data) {
    const kws=data.keywords||[];
    if(!kws.length) return '<div style="text-align:center;padding:30px;color:#8AB4D6;"><div style="font-size:36px;margin-bottom:10px;">🔑</div>暂无关键词</div>';
    const chips=kws.map(k=>`<span class="keyword-chip" data-kw="${k.replace(/"/g,'&quot;')}">${k}</span>`).join('');
    const pt=document.body.innerText, ex=[];
    const ae=(p,v)=>{if(v&&!kws.some(k=>k.includes(v))) ex.push(`${p} ${v}`);};
    (pt.match(/(?:\+1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g)||[]).forEach(p=>ae('📞',p));
    (pt.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g)||[]).forEach(e=>ae('✉️',e));
    (pt.match(/@[a-zA-Z0-9_.-]{3,30}/g)||[]).forEach(h=>ae('🆔',h));
    let eh='';
    if(ex.length) eh=`<div class="field-group" style="margin-top:8px;"><div class="field-label">页面其他发现</div><div>${ex.map(k=>`<span class="keyword-chip">${k}</span>`).join('')}</div></div>`;
    return `<div class="field-group"><div class="field-label">关键词 (${kws.length}) <span style="font-weight:400;color:#8AB4D6;">点击复制</span></div><div>${chips}</div></div>${eh}`;
  }

  // ==================== 搜索 Tab ====================
  function renderPivotTab(data) {
    const p=getPivotURLs(data);
    if(!p.length) return '<div style="text-align:center;padding:30px;color:#8AB4D6;"><div style="font-size:36px;margin-bottom:10px;">🎯</div>无可搜索数据</div>';
    return `<div class="field-group"><div class="field-label">🎯 一键搜索</div><div class="pivot-grid">${p.map(x=>`<button class="pivot-btn" data-url="${x.url}">${x.label}</button>`).join('')}</div></div>`;
  }

  function getPivotURLs(data) {
    const n=encodeURIComponent(data.name||''), em=data.keywords?.find(k=>k.startsWith('✉️'))?.slice(2).trim()||'', ph=data.keywords?.find(k=>k.startsWith('📞'))?.slice(2).trim()||'', lc=encodeURIComponent(data.location||data.hometown||''), uid=data.uid||'';
    return [{label:'🔍 谷歌',url:`https://www.google.com/search?q=${n}`},{label:'👔 领英',url:`https://www.google.com/search?q=site:linkedin.com/in+${n}`},{label:'🍃 Pipl',url:`https://pipl.com/search/?q=${n}`},{label:'🛡️ Dehashed',url:`https://dehashed.com/search?q=${n}`},{label:'🔐 HIBP',url:em?`https://haveibeenpwned.com/account/${em}`:null},{label:'🐙 GitHub',url:`https://www.google.com/search?q=site:github.com+${n}`},{label:'📸 Instagram',url:`https://www.google.com/search?q=site:instagram.com+${n}`},{label:'🐦 X/Twitter',url:`https://x.com/search?q=${n}`},{label:'📞 电话',url:ph?`https://www.google.com/search?q=${encodeURIComponent(ph)}`:null},{label:'🏙️ 城市',url:lc?`https://www.google.com/search?q=${lc}+${n}`:null},{label:'📧 邮箱',url:em?`https://www.google.com/search?q=${encodeURIComponent(em)}`:null},{label:'🆔 Graph API',url:uid&&!uid.startsWith('用户名')?`https://graph.facebook.com/v19.0/${uid}?fields=id,name,first_name,last_name,email,location,gender,birthday,link,locale,timezone&access_token=填入TOKEN`:null}].filter(x=>x.url);
  }

  // ==================== 共同好友 Tab ====================
  function renderMutualTab(data) {
    const mfs=data.mutualFriends||[];
    let h='';
    if(!mfs.length) h='<div style="text-align:center;padding:30px;color:#8AB4D6;"><div style="font-size:36px;margin-bottom:10px;">🤝</div>无共同好友</div>';
    else {
      h=`<div class="field-label" style="margin-bottom:4px;">🤝 ${mfs.length} 个共同好友</div>`;
      mfs.forEach(m=>{
        const av=(m.avatars||[]).filter(Boolean).map(a=>`<img src="${a}">`).join('');
        const bg=m.count>0?` <span style="color:#87CEEB;font-size:10px;">(${m.count})</span>`:'';
        h+=`<div class="list-item">${av}<span class="li-name">${m.text}${bg}</span>${m.url?`<a class="li-link" href="${m.url}" target="_blank">→</a>`:''}</div>`;
      });
    }
    h+=`<div style="margin-top:6px;display:flex;gap:4px;flex-wrap:wrap;">
      <button id="osint-highlight-mutual" style="background:#87CEEB;border:none;color:white;padding:4px 12px;border-radius:8px;cursor:pointer;font-size:10px;">🔦 高亮</button>
      <button id="osint-expand-mutual" style="background:white;border:1px solid #D4EDFB;color:#5BA3C9;padding:4px 12px;border-radius:8px;cursor:pointer;font-size:10px;">🔽 展开采集</button>
    </div>`;
    return h;
  }

  // ==================== 群组 Tab ====================
  function renderGroupTab() {
    return `<div>
      <div style="font-size:14px;font-weight:700;margin-bottom:4px;color:#3A5A7A;">👥 群组成员扫描</div>
      <div style="font-size:11px;color:#8AB4D6;margin-bottom:10px;">自动滚动页面采集群组成员，导出 CSV</div>
      <button id="osint-scan-group" style="width:100%;padding:10px;background:#87CEEB;border:none;border-radius:10px;color:white;font-size:13px;font-weight:600;cursor:pointer;">🔍 扫描可见成员</button>
      <button id="osint-scan-group-history" style="width:100%;margin-top:6px;padding:8px;background:white;border:1px solid #D4EDFB;border-radius:10px;color:#5BA3C9;font-size:12px;cursor:pointer;">📄 查看历史</button>
      <div id="osint-scan-results" style="margin-top:8px;max-height:280px;overflow-y:auto;"></div>
    </div>`;
  }

  // ==================== 帖子 Tab ====================
  function renderTimelineTab(data) {
    const p=data.posts||[];
    if(!p.length) return '<div style="text-align:center;padding:30px;color:#8AB4D6;"><div style="font-size:36px;margin-bottom:10px;">📰</div>无可见帖子<br>往下翻加载更多后刷新</div>';
    return `<div class="field-label" style="margin-bottom:4px;">📰 帖子 (${p.length})</div>`+p.map(x=>`<div class="content-item"><div>${x.text}${x.location?` <span class="ci-loc">📍${x.location}</span>`:''}</div>${x.timestamp?`<div class="ci-muted">🕐 ${x.timestamp}</div>`:''}</div>`).join('');
  }

  // ==================== 照片 Tab ====================
  function renderPhotosTab(data) {
    const p=data.photos||[];
    if(!p.length) return '<div style="text-align:center;padding:30px;color:#8AB4D6;"><div style="font-size:36px;margin-bottom:10px;">📸</div>无照片信息</div>';
    return `<div class="field-label" style="margin-bottom:4px;">📸 照片 (${p.length})</div>`+p.map(x=>`<div class="content-item"><div>${x.text||'(照片)'}</div>${x.date?`<div class="ci-muted">📅 ${x.date}</div>`:''}</div>`).join('');
  }

  // ==================== 联系方式 Tab ====================
  function renderContactsTab(data) {
    const c=data.contactInfo||[], l=data.linkedAccounts||[];
    if(!c.length&&!l.length) return '<div style="text-align:center;padding:30px;color:#8AB4D6;"><div style="font-size:36px;margin-bottom:10px;">📞</div>无联系方式</div>';
    let h='';
    if(c.length){
      h+=`<div class="field-label" style="margin-bottom:4px;">📞 联系方式</div>`;
      c.forEach(x=>{h+=`<div class="list-item"><span class="li-name">${x.type}: <strong>${x.value}</strong></span><button class="copy-btn" data-copy="${x.value.replace(/"/g,'&quot;')}">📋</button></div>`;});
    }
    if(l.length){
      h+=`<div class="field-label" style="margin-bottom:4px;margin-top:8px;">🔗 关联账号</div>`;
      l.forEach(x=>{h+=`<div class="list-item"><span class="li-name">${x.platform}: <strong>${x.handle}</strong></span><a class="li-link" href="${x.url}" target="_blank">→</a></div>`;});
    }
    return h;
  }

  // ==================== 活动 Tab ====================
  function renderEventsTab(data) {
    const e=data.events||[];
    if(!e.length) return '<div style="text-align:center;padding:30px;color:#8AB4D6;"><div style="font-size:36px;margin-bottom:10px;">📅</div>无活动信息</div>';
    return `<div class="field-label" style="margin-bottom:4px;">📅 活动 (${e.length})</div>`+e.map(x=>`<div class="content-item"><div>${x.name}</div><div>${x.date?`📅 ${x.date}`:''}${x.location?` 📍${x.location}`:''}</div></div>`).join('');
  }

  // ==================== 社交圈 Tab ====================
  function renderNetworkTab(data) {
    const su=data.friendSuggestions||[], cg=data.commonGroups||[];
    let h='';
    if(cg.length){
      h+=`<div class="field-label" style="margin-bottom:4px;">👥 共同群组</div>`;
      cg.forEach(g=>h+=`<div class="list-item"><span class="li-name">${g.text}</span>${g.url?`<a class="li-link" href="${g.url}" target="_blank">→</a>`:''}</div>`);
    }
    if(su.length){
      h+=`<div class="field-label" style="margin-bottom:4px;margin-top:${cg.length?'8px':'0'};">💡 可能认识 (${su.length})</div>`;
      su.slice(0,15).forEach(s=>h+=`<div class="list-item"><span class="li-name">👤 ${s.name}</span><a class="li-link" href="${s.url}" target="_blank">→</a></div>`);
      h+=`<div style="font-size:10px;color:#8AB4D6;margin-top:4px;">来自页面推荐</div>`;
    }
    if(!h) h='<div style="text-align:center;padding:30px;color:#8AB4D6;"><div style="font-size:36px;margin-bottom:10px;">🔗</div>无社交圈数据</div>';
    return h;
  }

  // ==================== 📋 数据表 Tab（核心新功能）====================
  function renderTableTab() {
    const all = GM_getValue('fb_osint_data', []);
    if (!all.length) {
      return `<div class="data-table-empty"><div class="big-icon">📋</div><div>还没有保存数据</div><div style="font-size:11px;color:#8AB4D6;margin-top:6px;">打开一个 FB 主页 → 点「💾 保存」按钮</div></div>`;
    }

    const cols = [
      {id:'name', label:'姓名'}, {id:'location', label:'所在地'},
      {id:'work', label:'工作'}, {id:'education', label:'教育'},
      {id:'relationship', label:'感情'}, {id:'birthday', label:'生日'},
      {id:'friends', label:'好友'}, {id:'uid', label:'UID'},
      {id:'capturedAt', label:'采集时间'},
    ];

    // Sort
    const sorted = [...all];
    if (tableSortCol) {
      sorted.sort((a,b) => {
        const va = (a[tableSortCol]||'').toString().toLowerCase();
        const vb = (b[tableSortCol]||'').toString().toLowerCase();
        return tableSortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      });
    }

    const rows = sorted.map((row, idx) => {
      const realIdx = all.indexOf(row);
      const cells = cols.map(c => {
        let val = row[c.id] || '';
        if (c.id === 'capturedAt' && val) {
          try { val = new Date(val).toLocaleString('zh-CN', {month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}); } catch(e) {}
        }
        // Truncate for display
        if (val.length > 20) val = val.slice(0, 20) + '…';
        return `<td title="${(row[c.id]||'')}">${val}</td>`;
      }).join('');
      return `<tr><td style="font-size:10px;color:#8AB4D6;">${realIdx+1}</td>${cells}<td><button class="row-del" data-idx="${realIdx}">✕</button></td></tr>`;
    }).join('');

    const sortIcon = (col) => {
      if (tableSortCol !== col) return '';
      return tableSortAsc ? ' ▲' : ' ▼';
    };

    const headerCells = cols.map(c =>
      `<th data-col="${c.id}">${c.label}<span class="sort-icon">${sortIcon(c.id)}</span></th>`
    ).join('');

    return `<div style="display:flex;gap:6px;margin-bottom:6px;flex-wrap:wrap;align-items:center;">
      <span style="font-weight:700;font-size:13px;color:#3A5A7A;">📋 数据表</span>
      <span style="font-size:11px;color:#8AB4D6;">共 ${all.length} 条记录</span>
      <button id="table-clear-all" style="margin-left:auto;background:none;border:1px solid #E88B8B;color:#E88B8B;border-radius:8px;padding:3px 10px;cursor:pointer;font-size:10px;font-family:inherit;">🗑️ 清空</button>
    </div>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead><tr><th style="width:30px;">#</th>${headerCells}<th style="width:30px;"></th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
  }

  // ==================== 变更 Tab ====================
  function renderChangesTab(changes) {
    let h='<div class="field-label" style="margin-bottom:6px;">⚠️ 主页信息变更</div>';
    for (const [f, c] of Object.entries(changes)) {
      if (f==='keywords') {
        h+=`<div class="field-group"><div class="field-label">关键词</div>
          <div style="font-size:11px;background:white;border-radius:10px;border:1px solid #D4EDFB;padding:8px;">
            ${c.added.length?'<div style="color:#7BC99A;">➕ 新增: '+c.added.join(', ')+'</div>':''}
            ${c.removed.length?'<div style="color:#E88B8B;">➖ 消失: '+c.removed.join(', ')+'</div>':''}
          </div></div>`;
      } else {
        h+=`<div class="field-group"><div class="field-label">${f}</div>
          <div style="font-size:11px;background:white;border-radius:10px;border:1px solid #D4EDFB;padding:8px;">
            <div style="color:#E88B8B;">旧: ${c.old}</div>
            <div style="color:#7BC99A;">新: ${c.new}</div>
          </div></div>`;
      }
    }
    return h;
  }

  // ============================================================
  //  群组扫描
  // ============================================================
  function scanGroupMembers() {
    const ov=document.createElement('div'); ov.id='fb-osint-scanner-progress';
    ov.innerHTML=`<div class="sp-title">🔍 正在扫描群组成员</div><div class="sp-count" id="sp-count">已扫描: 0</div><div class="sp-bar-bg"><div class="sp-bar-fill" id="sp-bar-fill"></div></div><button class="sp-close" id="sp-close">取消</button>`;
    document.body.appendChild(ov);
    let cancelled=false; document.getElementById('sp-close').onclick=()=>{cancelled=true;ov.remove();};
    const ms=new Set(); let lh=0, st=0;
    const collect=()=>{
      if(cancelled) return;
      for (const el of document.querySelectorAll('a[href*="/user/"],a[href*="/profile.php"],a[role="link"][href*="facebook.com/"][href*="?"]')) {
        const h=el.getAttribute('href')||'', n=el.textContent.trim();
        if(n&&h&&(h.includes('/user/')||h.includes('profile.php')||h.match(/facebook\.com\/(?:profile\.php\?id=\d+|[^/?]+)/))) ms.add(JSON.stringify({name:n,url:h.startsWith('/')?'https://www.facebook.com'+h:h}));
      }
      const ce=document.getElementById('sp-count'), bar=document.getElementById('sp-bar-fill');
      if(ce) ce.textContent=`已扫描: ${ms.size}`;
      if(bar) bar.style.width=`${Math.min(ms.size*3,95)}%`;
      const sh=document.documentElement.scrollHeight;
      if(sh===lh) st++; else {st=0; lh=sh;}
      if(st>=5){
        const fd=Array.from(ms).map(m=>JSON.parse(m));
        if(ce) ce.textContent=`✅ 完成: ${fd.length} 个成员`;
        if(bar) bar.style.width='100%';
        document.querySelector('.sp-close').textContent='完成 ✓';
        saveGroupScan(fd);
        setTimeout(()=>{if(ov.parentNode)ov.remove();},2500);
        return;
      }
      window.scrollTo(0,sh);
      setTimeout(collect,1200);
    };
    setTimeout(collect,500);
  }

  function saveGroupScan(data) {
    const gn=document.querySelector('h1,h2')?.textContent?.trim()?.slice(0,40)||'未知群组';
    const sc=GM_getValue('osint_group_scans',[]);
    sc.push({group:gn,url:window.location.href,timestamp:new Date().toISOString(),count:data.length,members:data});
    GM_setValue('osint_group_scans',sc);
    downloadFile(`群组_${gn.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g,'_')}_${Date.now()}.csv`,toCSV(data.map(m=>({姓名:m.name,链接:m.url,群组:gn}))),'text/csv');
  }

  function showPreviousScans() {
    const sc=GM_getValue('osint_group_scans',[]);
    const c=document.getElementById('osint-scan-results');
    if(!c) return;
    if(!sc.length){c.innerHTML='<div style="text-align:center;padding:20px;color:#8AB4D6;">暂无历史记录</div>';return;}
    let h='<div class="field-label">📄 历史扫描</div>';
    [...sc].reverse().slice(0,10).forEach((s,i)=>{
      const ri=sc.length-1-i;
      h+=`<div class="list-item" style="font-size:11px;"><span class="li-name">👥 ${s.group}</span><span style="color:#8AB4D6;font-size:10px;">${s.count}人</span><button class="scan-dl-btn" data-idx="${ri}" style="background:none;border:none;color:#87CEEB;cursor:pointer;font-size:11px;">📥</button></div>`;
    });
    c.innerHTML=h;
    for(const b of c.querySelectorAll('.scan-dl-btn')) {
      b.onclick=()=>{
        const s=GM_getValue('osint_group_scans',[])[parseInt(b.dataset.idx,10)];
        if(s) downloadFile(`群组_${s.group.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g,'_')}_${Date.now()}.csv`,toCSV(s.members.map(m=>({姓名:m.name,链接:m.url,群组:s.group}))),'text/csv');
      };
    }
  }

  // ============================================================
  //  高亮 / 弹窗
  // ============================================================
  function highlightMutualFriends() {
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,null,false);
    let node;
    while((node=walker.nextNode())){
      const t=node.textContent.trim().toLowerCase();
      if(t.includes('mutual friend')&&/\d+/.test(t)){
        const p=node.parentElement;
        if(p){
          const c=p.closest('a,div[role="button"],span[role="button"]')||p;
          c.classList.add('fb-osint-highlight'); c.style.position='relative';
          if(!c.querySelector('.fb-osint-mf-badge')){
            const b=document.createElement('span'); b.className='fb-osint-mf-badge';
            b.style.cssText='position:absolute;top:-14px;right:0;background:#87CEEB;color:white;padding:1px 8px;border-radius:8px;font-size:10px;z-index:9999;pointer-events:none;';
            b.textContent='🤝 '+(t.match(/[\d,]+/)?.[0]||''); c.appendChild(b);
          }
        }
      }
    }
    showStatus('🔦 已高亮');
  }

  function showScrapePopup(title,items) {
    const ex=document.querySelector('.fb-osint-popup-scanner'); if(ex) ex.remove();
    const d=document.createElement('div'); d.className='fb-osint-popup-scanner';
    d.innerHTML=`<div class="ps-box"><div class="ps-title">${title} (${items.length})</div>${items.map(i=>`<div class="ps-item">${i}</div>`).join('')}<button class="ps-close">关闭</button></div>`;
    document.body.appendChild(d);
    d.querySelector('.ps-close').onclick=()=>d.remove();
    d.addEventListener('click',e=>{if(e.target===d) d.remove();});
  }

  // ============================================================
  //  保存 / 导出
  // ============================================================
  function saveProfile(data) {
    const ex=GM_getValue('fb_osint_data',[]);
    const idx=ex.findIndex(e=>e.url===data.url);
    const entry={name:data.name,url:data.url,profileId:data.profileId,uid:data.uid,location:data.location,hometown:data.hometown,work:data.work,education:data.education,relationship:data.relationship,birthday:data.birthday,friends:data.friends,followers:data.followers,bio:data.bio,keywords:data.keywords,linkedAccounts:data.linkedAccounts,contactInfo:data.contactInfo,capturedAt:new Date().toISOString()};
    if(idx>=0) ex[idx]=entry; else ex.push(entry);
    GM_setValue('fb_osint_data',ex);
    const hist=GM_getValue('fb_osint_history',{});
    if(data.url){if(!hist[data.url]) hist[data.url]=[]; hist[data.url].push({...entry,_snapshotAt:new Date().toISOString()}); if(hist[data.url].length>20) hist[data.url]=hist[data.url].slice(-20); GM_setValue('fb_osint_history',hist);}
    showStatus('已保存 💾');
  }

  function exportJSON() { downloadFile(`FB数据_${Date.now()}.json`, JSON.stringify(GM_getValue('fb_osint_data',[]),null,2),'application/json'); }

  function exportCSV() {
    const all=GM_getValue('fb_osint_data',[]);
    downloadFile(`FB数据_${Date.now()}.csv`,toCSV(all.map(d=>({姓名:d.name||'',UID:d.uid||'',所在地:d.location||'',工作:d.work||'',教育:d.education||'',感情:d.relationship||'',生日:d.birthday||'',好友:d.friends||'',简介:(d.bio||'').slice(0,200),账号:(d.linkedAccounts||[]).map(a=>`${a.platform}:${a.handle}`).join('; '),采集时间:d.capturedAt||''}))),'text/csv');
  }

  function exportTableCSV() {
    const all=GM_getValue('fb_osint_data',[]);
    if(!all.length){showStatus('⚠️ 没有数据可导出');return;}
    downloadFile(`FB数据表_${Date.now()}.csv`,toCSV(all.map(d=>({姓名:d.name||'',所在地:d.location||'',工作:d.work||'',教育:d.education||'',感情:d.relationship||'',生日:d.birthday||'',好友:d.friends||'',UID:d.uid||'',采集时间:d.capturedAt||''}))),'text/csv');
  }

  function refresh() { const d=scrapeProfile(); if(panelVisible) renderPanel(d); }

  // ============================================================
  //  记事板
  // ============================================================
  function createNotepad() {
    if(document.getElementById('fb-osint-notepad')) return;
    const tmpls=[
      {name:'🎯 温暖开场',text:'Hey! I know this is random, but I saw your comment on that post and I literally laughed out loud. Anyway — I\'m Olivia, what part of the world are you in? 😊'},
      {name:'🎯 直球搭讪',text:'Okay this is going to sound insane, but I\'m just gonna go for it. I saw your profile and something told me I\'d regret it if I didn\'t say hi. So... hi 🙃 I\'m Olivia.'},
      {name:'🎯 温柔神秘',text:'I know this is out of the blue, but I\'ve been having one of those weeks where you just feel like taking a chance. So... hi. I\'m Olivia. Tell me one good thing about your day? 😊'},
      {name:'❄️ 冷场挽救',text:'Okay I\'ll take the silence as a sign 😂 No pressure. Hope your day gets better ✌️'},
      {name:'🛡️ 被质疑机器人',text:'😂 I promise I\'m real! Just a regular human who took a shot at messaging a stranger. I can send a voice note if you need proof? 🤷‍♀️'},
      {name:'🛡️ "为什么找我"',text:'Honestly? I just liked your vibe. Your profile gave off normal-human-energy which is surprisingly rare 😂'},
    ];
    const d=document.createElement('div'); d.id='fb-osint-notepad';
    d.innerHTML=`<div class="note-header" id="note-header">
        <span>📝 聊天记事板</span>
        <span class="note-actions"><button id="note-clear-btn" title="清空">🗑️</button><button id="note-close-btn" title="关闭">✕</button></span>
      </div>
      <div class="note-body"><div class="note-entries-list" id="note-entries-list">${boardEntries.length===0?'<div style="text-align:center;padding:20px;color:#8AB4D6;">还没有记录</div>':''}${boardEntries.map((e,i)=>`<div class="note-entry"><span><span class="entry-label">[${e.label||'信息'}]</span> ${e.text}</span><button class="entry-del" data-idx="${i}">✕</button></div>`).join('')}</div></div>
      <div class="keyword-highlight" id="note-auto-kw"><div class="kh-label">🔑 聊天自动检测</div><div class="kh-chips" id="note-auto-chips"></div></div>
      <div class="note-input-area"><div class="note-input-row">
        <select id="note-label">${['信息','姓名','位置','工作','年龄','兴趣','家庭','联系方式','线索'].map(x=>`<option value="${x}">${x}</option>`).join('')}</select>
        <input type="text" id="note-input-field" placeholder="记录信息..."><button id="note-add-btn">+</button>
      </div></div>
      <details class="template-section"><summary>💬 话术模板 (点击复制)</summary>${tmpls.map(t=>`<div class="template-item" data-template="${t.text.replace(/"/g,'&quot;')}">${t.name}</div>`).join('')}</details>
      <div class="note-export-row">
        <button id="note-export-json">📄 JSON</button><button id="note-export-csv">📊 CSV</button><button id="note-export-clip">📋 复制全部</button>
      </div>`;
    document.body.appendChild(d);

    let dragging=false,sx,sy,ox,oy;
    d.querySelector('.note-header').onmousedown=e=>{dragging=true;sx=e.clientX;sy=e.clientY;ox=d.offsetLeft;oy=d.offsetTop;};
    document.onmousemove=e=>{if(!dragging)return;d.style.left=(ox+e.clientX-sx)+'px';d.style.top=(oy+e.clientY-sy)+'px';d.style.right='auto';};
    document.onmouseup=()=>{dragging=false;};

    document.getElementById('note-close-btn').onclick=()=>d.classList.remove('visible');
    document.getElementById('note-clear-btn').onclick=()=>{if(confirm('清空所有记录？')){boardEntries=[];persistBoard();renderNoteList();}};
    document.getElementById('note-add-btn').onclick=addNoteEntry;
    document.getElementById('note-input-field').onkeydown=e=>{if(e.key==='Enter')addNoteEntry();};
    document.getElementById('note-export-json').onclick=()=>downloadFile(`聊天记录_${Date.now()}.json`,JSON.stringify(boardEntries,null,2),'application/json');
    document.getElementById('note-export-csv').onclick=()=>downloadFile(`聊天记录_${Date.now()}.csv`,toCSV(boardEntries),'text/csv');
    document.getElementById('note-export-clip').onclick=()=>{const t=boardEntries.map(e=>`[${e.label}] ${e.text}`).join('\n');if(copyText(t)){const b=document.getElementById('note-export-clip');b.textContent='✅';setTimeout(()=>{b.textContent='📋 复制全部';},1500);}};
    for(const el of d.querySelectorAll('.template-item')){el.onclick=()=>{if(copyText(el.dataset.template)){el.style.background='#87CEEB';el.style.color='white';setTimeout(()=>{el.style.background='white';el.style.color='#5BA3C9';},1200);}};}
    d.addEventListener('click',e=>{if(e.target.classList.contains('entry-del')){const idx=parseInt(e.target.dataset.idx,10);boardEntries.splice(idx,1);persistBoard();renderNoteList();updateAutoKeywords();}});
  }

  function renderNoteList() {
    const list=document.getElementById('note-entries-list');
    if(!list) return;
    list.innerHTML=boardEntries.length?boardEntries.map((e,i)=>`<div class="note-entry"><span><span class="entry-label">[${e.label||'信息'}]</span> ${e.text}</span><button class="entry-del" data-idx="${i}">✕</button></div>`).join(''):'<div style="text-align:center;padding:20px;color:#8AB4D6;">还没有记录</div>';
  }

  function addNoteEntry() {
    const input=document.getElementById('note-input-field'), label=document.getElementById('note-label'), text=input.value.trim();
    if(!text) return;
    boardEntries.push({label:label.value,text,timestamp:new Date().toISOString()});
    persistBoard(); input.value=''; renderNoteList(); updateAutoKeywords();
  }

  function updateAutoKeywords() {
    const chips=document.getElementById('note-auto-chips');
    if(!chips) return;
    const at=boardEntries.map(e=>e.text).join(' '), found=[];
    const add=(p,v)=>{if(v) found.push(`${p} ${v}`);};
    (at.match(/(?:\+1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g)||[]).forEach(p=>add('📞',p));
    (at.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g)||[]).forEach(e=>add('✉️',e));
    (at.match(/\b(\d{2})\s*(?:years old|yo|yr|y\/o)\b/gi)||[]).forEach(a=>add('🎂',a));
    const sr=/\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)\b/g;
    let m; while((m=sr.exec(at))!==null) add('📍',m[1]);
    chips.innerHTML=found.length?found.map(k=>`<span class="keyword-chip">${k}</span>`).join(''):'<span style="color:#8AB4D6;font-size:11px;">暂无检测数据</span>';
  }

  // ============================================================
  //  聊天监控
  // ============================================================
  function startChatMonitor() {
    let lastText='';
    const pats=[{label:'📞 电话',r:/(?:\+1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g},{label:'✉️ 邮箱',r:/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g},{label:'🎂 年龄',r:/\b(\d{2})\s*(?:years old|yo|yr|y\/o)\b/gi},{label:'🏠 地址',r:/\b\d{1,5}\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+,\s*(?:[A-Z][a-z]+\s+)?[A-Z]{2}\s+\d{5}/g},{label:'🔗 链接',r:/https?:\/\/[^\s)]+/g}];
    setInterval(()=>{
      if(!location.href.includes('/messages/')&&!location.href.includes('/messenger/')) return;
      const ct=Array.from(document.querySelectorAll('[data-pagelet="Messaging"] div[dir="auto"],div.xjyslct div[dir="auto"]')).map(el=>el.textContent.trim()).filter(Boolean).join(' | ');
      if(ct!==lastText){lastText=ct;pats.forEach(({label,r})=>{let m;while((m=r.exec(ct))!==null){if(!boardEntries.some(e=>e.text===m[0])){boardEntries.push({label:'auto-'+label,text:m[0],timestamp:new Date().toISOString()});persistBoard();renderNoteList();updateAutoKeywords();}}});}
    },3000);
  }

  // ============================================================
  //  浮动按钮
  // ============================================================
  function createFloatBtn() {
    if(document.querySelector('.fb-osint-float-btn')) return;
    const b=document.createElement('button'); b.className='fb-osint-float-btn'; b.textContent='🌸';
    b.title='点击面板 | Ctrl+点击记事板';
    b.onclick=e=>{
      if(e.ctrlKey||e.metaKey){toggleNotepad();return;}
      const p=document.getElementById('fb-osint-panel');
      if(p){p.remove();panelVisible=false;return;}
      renderPanel(scrapeProfile());
    };
    document.body.appendChild(b);
  }

  function showNotepad(){const e=document.getElementById('fb-osint-notepad');if(!e){createNotepad();setTimeout(showNotepad,100);return;}e.classList.add('visible');updateAutoKeywords();}
  function hideNotepad(){const e=document.getElementById('fb-osint-notepad');if(e)e.classList.remove('visible');}
  function toggleNotepad(){const e=document.getElementById('fb-osint-notepad');if(!e){createNotepad();setTimeout(toggleNotepad,100);}else e.classList.toggle('visible');}

  // ============================================================
  //  快捷键
  // ============================================================
  document.addEventListener('keydown',e=>{
    if(e.ctrlKey&&e.shiftKey&&e.key==='P'){e.preventDefault();const p=document.getElementById('fb-osint-panel');if(p){p.remove();panelVisible=false;}else renderPanel(scrapeProfile());}
    if(e.ctrlKey&&e.shiftKey&&e.key==='N'){e.preventDefault();toggleNotepad();}
  });

  // ============================================================
  //  事件委托
  // ============================================================
  document.addEventListener('click',e=>{
    const t=e.target;
    if(t.classList.contains('pivot-btn')) openURL(t.dataset.url);
    if(t.id==='osint-scan-group') scanGroupMembers();
    if(t.id==='osint-scan-group-history') showPreviousScans();
    if(t.id==='osint-highlight-mutual') highlightMutualFriends();
    if(t.id==='osint-expand-mutual') tryExpandMutualFriends();
    if(t.id==='osint-goto-changes'){e.preventDefault();const b=document.querySelector('#fb-osint-panel button[data-tab="changes"]');if(b)b.click();}
    if(t.classList.contains('keyword-chip')){const tx=t.dataset.kw||t.textContent.trim();if(copyText(tx)){t.style.background='#87CEEB';t.style.color='white';setTimeout(()=>{t.style.background='#E8F4FD';t.style.color='#5BA3C9';},1000);}}
    if(t.id==='osint-dl-avatar'){const img=document.getElementById('osint-avatar-img');if(img){const n=document.querySelector('.profile-name')?.textContent?.trim()||'头像';downloadAvatar(img.src,n);}}
    if(t.id==='osint-ri-google'){const img=document.getElementById('osint-avatar-img');if(img) reverseImageSearch(img.src,'google');}
    if(t.id==='osint-ri-tineye'){const img=document.getElementById('osint-avatar-img');if(img) reverseImageSearch(img.src,'tineye');}
    if(t.id==='osint-ri-yandex'){const img=document.getElementById('osint-avatar-img');if(img) reverseImageSearch(img.src,'yandex');}

    // 表头排序
    if(t.closest('th')&&t.closest('th').dataset.col){
      const col=t.closest('th').dataset.col;
      if(tableSortCol===col) tableSortAsc=!tableSortAsc; else {tableSortCol=col; tableSortAsc=true;}
      if(document.getElementById('osint-tab-content')) document.getElementById('osint-tab-content').innerHTML=renderTableTab();
    }

    // 删除行
    if(t.classList.contains('row-del')){
      const idx=parseInt(t.dataset.idx,10);
      const all=GM_getValue('fb_osint_data',[]);
      if(idx>=0&&idx<all.length){all.splice(idx,1);GM_setValue('fb_osint_data',all);if(document.getElementById('osint-tab-content')) document.getElementById('osint-tab-content').innerHTML=renderTableTab();showStatus('已删除');}
    }

    // 清空表
    if(t.id==='table-clear-all'){
      if(confirm('清空所有保存的数据？')){GM_setValue('fb_osint_data',[]);if(document.getElementById('osint-tab-content')) document.getElementById('osint-tab-content').innerHTML=renderTableTab();showStatus('已清空');}
    }
  });

  function downloadAvatar(url,name) {
    const img=new Image(); img.crossOrigin='anonymous';
    img.onload=()=>{const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;c.getContext('2d').drawImage(img,0,0);const a=document.createElement('a');a.download=`${name}_${Date.now()}.jpg`;a.href=c.toDataURL('image/jpeg',0.92);a.click();};
    img.onerror=()=>{GM_xmlhttpRequest({method:'GET',url,responseType:'blob',onload:r=>{const a=document.createElement('a');a.href=URL.createObjectURL(r.response);a.download=`${name}_${Date.now()}.jpg`;a.click();},onerror:()=>showStatus('❌ 下载失败')});};
    img.src=url;
  }

  function reverseImageSearch(url,engine){const u={google:`https://lens.google.com/uploadbyurl?url=${encodeURIComponent(url)}`,tineye:`https://tineye.com/search?url=${encodeURIComponent(url)}`,yandex:`https://yandex.com/images/search?rpt=imageview&url=${encodeURIComponent(url)}`};openURL(u[engine]||u.google);}

  // ============================================================
  //  初始化
  // ============================================================
  function init() {
    setTimeout(createFloatBtn,1500);
    setTimeout(createNotepad,2000);
    setTimeout(startChatMonitor,3000);

    let lastUrl=location.href;
    const observer=new MutationObserver(()=>{
      const cur=location.href;
      if(cur!==lastUrl){lastUrl=cur;setTimeout(()=>{if(cur.match(/facebook\.com\/(?:[^/?]+\/?|profile\.php)/)&&!cur.includes('messages/')&&panelVisible)renderPanel(scrapeProfile());},2000);}
    });
    observer.observe(document.body,{childList:true,subtree:true});

    if(window.location.href.match(/facebook\.com\/(?:[^/?]+\/?|profile\.php)/)&&!window.location.href.includes('messages/')){
      setTimeout(()=>{const d=scrapeProfile();if(d.name||d.location)renderPanel(d);},2500);
    }
    console.log('🌸 FB 信息助手 v5.0 — By.阿趣 🎀');
    console.log('📌 Ctrl+Shift+P 面板 | Ctrl+Shift+N 记事板');
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();

})();
