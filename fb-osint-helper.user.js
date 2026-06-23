// ==UserScript==
// @name         FB 信息助手
// @namespace    https://github.com/Aqu399
// @version      4.1
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
  //  🌸 天蓝色可爱风格样式
  // ============================================================
  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;600;700&display=swap');

    #fb-osint-panel {
      position: fixed; bottom: 20px; right: 20px;
      width: 390px; max-height: 90vh;
      background: linear-gradient(135deg, #E8F4FD 0%, #B8E0F7 100%);
      color: #4A6B8A;
      border: 2px solid #87CEEB;
      border-radius: 20px;
      box-shadow: 0 8px 32px rgba(135,206,235,0.3), 0 2px 8px rgba(135,206,235,0.2);
      z-index: 999999;
      font-family: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 13px;
      overflow: hidden;
      display: flex; flex-direction: column;
      transition: transform 0.25s ease, opacity 0.25s ease;
    }
    #fb-osint-panel.collapsed { transform: translateY(calc(100% - 42px)); }
    #fb-osint-panel.collapsed .panel-body { display: none; }
    #fb-osint-panel .panel-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 14px;
      background: linear-gradient(90deg, #87CEEB, #B0E0E6, #87CEEB);
      border-bottom: 1px solid #6BB5D9;
      border-radius: 18px 18px 0 0;
      cursor: pointer; user-select: none;
    }
    #fb-osint-panel .panel-header .panel-title {
      font-weight: 700; font-size: 14px; color: white;
      text-shadow: 0 1px 2px rgba(0,0,0,0.1);
      letter-spacing: 0.5px;
    }
    #fb-osint-panel .panel-header .panel-title .author {
      font-weight: 400; font-size: 10px; opacity: 0.8;
    }
    #fb-osint-panel .panel-header .panel-actions button {
      background: rgba(255,255,255,0.3); border: none; color: white;
      cursor: pointer; font-size: 16px; margin-left: 4px; padding: 2px 8px;
      border-radius: 10px; transition: all 0.2s;
    }
    #fb-osint-panel .panel-header .panel-actions button:hover { background: rgba(255,255,255,0.5); }
    #fb-osint-panel .panel-body {
      overflow-y: auto; padding: 12px 14px; flex: 1;
    }
    #fb-osint-panel .field-group { margin-bottom: 8px; }
    #fb-osint-panel .field-group .field-label {
      font-size: 11px; color: #7FB5D6; text-transform: uppercase;
      letter-spacing: 0.5px; margin-bottom: 3px; font-weight: 600;
    }
    #fb-osint-panel .field-group .field-value {
      display: flex; align-items: center; justify-content: space-between;
      background: rgba(255,255,255,0.7);
      border: 1px solid #C5E5F7;
      border-radius: 12px;
      padding: 6px 10px;
      word-break: break-word;
      backdrop-filter: blur(4px);
    }
    #fb-osint-panel .field-group .field-value .copy-btn {
      background: none; border: none; color: #87CEEB;
      cursor: pointer; font-size: 14px; flex-shrink: 0; margin-left: 6px;
      padding: 2px 6px; border-radius: 8px; transition: all 0.2s;
    }
    #fb-osint-panel .field-group .field-value .copy-btn:hover { background: #D4EDFB; color: #5BA3C9; }
    #fb-osint-panel .field-group .field-value .copy-btn.copied { color: #7BC99A; }
    #fb-osint-panel .profile-avatar {
      width: 56px; height: 56px; border-radius: 50%;
      object-fit: cover; margin-bottom: 6px; cursor: pointer;
      border: 3px solid #87CEEB; transition: all 0.2s;
      box-shadow: 0 2px 8px rgba(135,206,235,0.3);
    }
    #fb-osint-panel .profile-avatar:hover { border-color: #5BA3C9; transform: scale(1.05); }
    #fb-osint-panel .profile-name {
      font-size: 16px; font-weight: 700; margin-bottom: 6px;
      color: #4A6B8A;
    }
    #fb-osint-panel .avatar-actions {
      display: flex; gap: 4px; margin-bottom: 8px; flex-wrap: wrap;
    }
    #fb-osint-panel .avatar-actions button {
      background: rgba(255,255,255,0.7); border: 1px solid #C5E5F7; border-radius: 10px;
      color: #5BA3C9; cursor: pointer; font-size: 10px; padding: 4px 10px;
      transition: all 0.2s; font-family: inherit;
    }
    #fb-osint-panel .avatar-actions button:hover { background: #87CEEB; color: white; border-color: #87CEEB; }
    #fb-osint-panel .tab-bar {
      display: flex; gap: 4px; margin-bottom: 10px;
      border-bottom: 2px solid #C5E5F7; padding-bottom: 6px; flex-wrap: wrap;
    }
    #fb-osint-panel .tab-bar button {
      background: none; border: none; color: #8AB4D6; cursor: pointer;
      padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600;
      transition: all 0.2s; font-family: inherit;
    }
    #fb-osint-panel .tab-bar button.active { background: #87CEEB; color: white; box-shadow: 0 2px 8px rgba(135,206,235,0.3); }
    #fb-osint-panel .tab-bar button:hover:not(.active) { background: #D4EDFB; }
    #fb-osint-panel .keyword-chip {
      display: inline-block; background: rgba(135,206,235,0.15); border: 1px solid rgba(135,206,235,0.3);
      color: #5BA3C9; padding: 3px 10px; border-radius: 14px; font-size: 11px;
      margin: 2px 4px; cursor: pointer; transition: all 0.2s;
    }
    #fb-osint-panel .keyword-chip:hover { background: rgba(135,206,235,0.3); }
    #fb-osint-panel .keyword-chip.changed { background: #FFF3CD; border-color: #FFC107; color: #856404; }
    #fb-osint-panel .mutual-friend-item {
      display: flex; align-items: center; gap: 6px;
      padding: 5px 8px; background: rgba(255,255,255,0.6); border: 1px solid #C5E5F7;
      border-radius: 12px; margin-bottom: 4px;
    }
    #fb-osint-panel .mutual-friend-item img {
      width: 28px; height: 28px; border-radius: 50%; object-fit: cover;
      border: 2px solid #C5E5F7;
    }
    #fb-osint-panel .mutual-friend-item .mf-name { font-size: 12px; flex: 1; color: #4A6B8A; }
    #fb-osint-panel .mutual-friend-item .mf-link { font-size: 10px; color: #87CEEB; text-decoration: none; }
    #fb-osint-panel .osint-pivot-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-top: 6px;
    }
    #fb-osint-panel .osint-pivot-grid button {
      background: rgba(255,255,255,0.6); border: 1px solid #C5E5F7; border-radius: 10px;
      color: #5BA3C9; cursor: pointer; font-size: 10px; padding: 5px 4px;
      text-align: center; word-break: break-word; transition: all 0.2s; font-family: inherit;
    }
    #fb-osint-panel .osint-pivot-grid button:hover { background: #87CEEB; color: white; border-color: #87CEEB; }
    #fb-osint-panel .timeline-item {
      font-size: 11px; padding: 5px 8px; background: rgba(255,255,255,0.6);
      border: 1px solid #C5E5F7; border-radius: 10px; margin-bottom: 3px; word-break: break-word;
      color: #4A6B8A;
    }
    #fb-osint-panel .timeline-item .tl-time { color: #8AB4D6; font-size: 10px; }
    #fb-osint-panel .timeline-item .tl-loc { color: #7BC99A; font-size: 10px; }
    #fb-osint-panel .change-badge {
      display: inline-block; background: #FFF3CD; color: #856404;
      font-size: 9px; padding: 2px 8px; border-radius: 10px; margin-left: 4px;
    }
    #fb-osint-panel .photo-item {
      font-size: 11px; padding: 5px 8px; background: rgba(255,255,255,0.6);
      border: 1px solid #C5E5F7; border-radius: 10px; margin-bottom: 3px; word-break: break-word;
      color: #4A6B8A;
    }
    #fb-osint-panel .photo-item .ph-date { color: #8AB4D6; font-size: 10px; }
    #fb-osint-panel .photo-item .ph-loc { color: #C592D6; font-size: 10px; }
    #fb-osint-panel .contact-item {
      display: flex; align-items: center; gap: 6px;
      padding: 5px 8px; background: rgba(255,255,255,0.6); border: 1px solid #C5E5F7;
      border-radius: 12px; margin-bottom: 4px; color: #4A6B8A;
    }
    #fb-osint-panel .event-item {
      font-size: 11px; padding: 5px 8px; background: rgba(255,255,255,0.6);
      border: 1px solid #C5E5F7; border-radius: 10px; margin-bottom: 3px; word-break: break-word;
      color: #4A6B8A;
    }
    #fb-osint-panel .event-item .ev-date { color: #8AB4D6; font-size: 10px; }
    #fb-osint-panel .event-item .ev-loc { color: #F0A87A; font-size: 10px; }
    #fb-osint-panel .export-row {
      display: flex; gap: 6px; margin-top: 10px; flex-wrap: wrap;
    }
    #fb-osint-panel .export-row button {
      flex: 1; padding: 7px 4px; border: 1px solid #C5E5F7; border-radius: 12px;
      background: rgba(255,255,255,0.6); color: #5BA3C9; cursor: pointer;
      font-size: 11px; min-width: 50px; transition: all 0.2s; font-family: inherit;
      font-weight: 600;
    }
    #fb-osint-panel .export-row button:hover { background: #87CEEB; color: white; border-color: #87CEEB; }
    #fb-osint-panel .status-line {
      font-size: 11px; color: #8AB4D6; text-align: center;
      padding: 6px 0 0; border-top: 1px solid #C5E5F7; margin-top: 8px;
    }

    /* 🌸 Messenger 记事板 */
    #fb-osint-notepad {
      position: fixed; top: 80px; right: 20px;
      width: 320px; max-height: 520px;
      background: linear-gradient(135deg, #E8F4FD 0%, #C5E5F7 100%);
      color: #4A6B8A;
      border: 2px solid #87CEEB;
      border-radius: 20px;
      box-shadow: 0 8px 32px rgba(135,206,235,0.3);
      z-index: 999998;
      font-family: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 12px;
      display: none; flex-direction: column;
    }
    #fb-osint-notepad.visible { display: flex; }
    #fb-osint-notepad .note-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 10px 14px;
      background: linear-gradient(90deg, #87CEEB, #B0E0E6);
      border-bottom: 1px solid #6BB5D9;
      border-radius: 18px 18px 0 0;
      cursor: move; color: white; font-weight: 700;
    }
    #fb-osint-notepad .note-header .note-actions { display: flex; gap: 4px; }
    #fb-osint-notepad .note-header .note-actions button {
      background: rgba(255,255,255,0.3); border: none; color: white;
      cursor: pointer; font-size: 14px; padding: 2px 8px; border-radius: 8px;
    }
    #fb-osint-notepad .note-header .note-actions button:hover { background: rgba(255,255,255,0.5); }
    #fb-osint-notepad .note-body {
      padding: 8px 12px; max-height: 280px; overflow-y: auto; flex: 1;
    }
    #fb-osint-notepad .note-entry {
      background: rgba(255,255,255,0.7); border: 1px solid #C5E5F7;
      padding: 6px 10px; margin-bottom: 4px; border-radius: 12px;
      font-size: 11px; word-break: break-word;
      display: flex; justify-content: space-between; align-items: flex-start;
    }
    #fb-osint-notepad .note-entry .entry-label { color: #87CEEB; font-weight: 600; margin-right: 4px; }
    #fb-osint-notepad .note-entry .entry-del {
      background: none; border: none; color: #E88B8B; cursor: pointer; font-size: 14px; padding: 0 4px;
    }
    #fb-osint-notepad .note-input-area {
      display: flex; flex-direction: column; gap: 4px;
      padding: 8px 12px; border-top: 1px solid #C5E5F7;
    }
    #fb-osint-notepad .note-input-row { display: flex; gap: 4px; }
    #fb-osint-notepad .note-input-row select {
      background: rgba(255,255,255,0.7); border: 1px solid #C5E5F7; border-radius: 10px;
      color: #4A6B8A; padding: 4px 6px; font-size: 11px; font-family: inherit;
    }
    #fb-osint-notepad .note-input-row input[type="text"] {
      flex: 1; background: rgba(255,255,255,0.7); border: 1px solid #C5E5F7; border-radius: 10px;
      color: #4A6B8A; padding: 4px 8px; font-size: 12px; font-family: inherit;
    }
    #fb-osint-notepad .note-input-row input::placeholder { color: #B0D4EA; }
    #fb-osint-notepad .note-input-row button {
      background: #87CEEB; border: none; color: white; border-radius: 10px;
      cursor: pointer; padding: 4px 14px; font-size: 12px; font-weight: 600;
    }
    #fb-osint-notepad .note-input-row button:hover { background: #6BB5D9; }
    #fb-osint-notepad .note-export-row {
      display: flex; gap: 4px; padding: 6px 12px 8px; border-top: 1px solid #C5E5F7;
    }
    #fb-osint-notepad .note-export-row button {
      flex: 1; background: rgba(255,255,255,0.6); border: 1px solid #C5E5F7; border-radius: 10px;
      color: #5BA3C9; cursor: pointer; font-size: 10px; padding: 4px; font-family: inherit;
      transition: all 0.2s;
    }
    #fb-osint-notepad .note-export-row button:hover { background: #87CEEB; color: white; }
    #fb-osint-notepad .keyword-highlight {
      background: rgba(135,206,235,0.1); margin: 4px 12px 0; padding: 6px 8px;
      border-radius: 12px; border: 1px solid rgba(135,206,235,0.2);
    }
    #fb-osint-notepad .keyword-highlight .kh-label { font-size: 10px; color: #8AB4D6; margin-bottom: 2px; }
    #fb-osint-notepad .keyword-highlight .kh-chips { display: flex; flex-wrap: wrap; gap: 2px; }
    #fb-osint-notepad .template-section {
      padding: 6px 12px; border-top: 1px solid #C5E5F7;
    }
    #fb-osint-notepad .template-section summary {
      font-size: 11px; color: #8AB4D6; cursor: pointer; font-weight: 600;
    }
    #fb-osint-notepad .template-item {
      font-size: 10px; padding: 5px 8px; background: rgba(255,255,255,0.6);
      border: 1px solid #C5E5F7; border-radius: 10px; margin: 4px 0; cursor: pointer;
      color: #5BA3C9; word-break: break-word; transition: all 0.2s;
    }
    #fb-osint-notepad .template-item:hover { background: #87CEEB; color: white; border-color: #87CEEB; }

    /* 🌸 浮动按钮 */
    .fb-osint-float-btn {
      position: fixed; bottom: 80px; right: 20px;
      width: 48px; height: 48px;
      background: linear-gradient(135deg, #87CEEB, #B0E0E6);
      color: white;
      border: none; border-radius: 50%;
      font-size: 22px; cursor: pointer; z-index: 999999;
      box-shadow: 0 4px 16px rgba(135,206,235,0.4);
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
    }
    .fb-osint-float-btn:hover { transform: scale(1.1); box-shadow: 0 6px 20px rgba(135,206,235,0.5); }
    .fb-osint-float-btn.has-changes::after {
      content: ''; position: absolute; top: -2px; right: -2px;
      width: 12px; height: 12px; background: #FFC107;
      border-radius: 50%; border: 2px solid white;
    }

    .fb-osint-highlight { box-shadow: 0 0 0 3px #87CEEB, 0 0 16px rgba(135,206,235,0.3) !important; border-radius: 8px; }

    #fb-osint-scanner-progress {
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #E8F4FD 0%, #C5E5F7 100%);
      color: #4A6B8A;
      border: 2px solid #87CEEB; border-radius: 20px;
      padding: 24px 36px; z-index: 9999999;
      text-align: center; min-width: 320px;
      box-shadow: 0 8px 32px rgba(135,206,235,0.3);
      font-family: 'Noto Sans SC', sans-serif;
    }
    #fb-osint-scanner-progress .sp-title { font-weight: 700; font-size: 15px; margin-bottom: 8px; }
    #fb-osint-scanner-progress .sp-count { font-size: 12px; color: #8AB4D6; margin-bottom: 8px; }
    #fb-osint-scanner-progress .sp-bar-bg {
      width: 100%; height: 8px; background: rgba(255,255,255,0.5);
      border-radius: 4px; overflow: hidden;
    }
    #fb-osint-scanner-progress .sp-bar-fill {
      height: 100%; background: linear-gradient(90deg, #87CEEB, #B0E0E6);
      border-radius: 4px; transition: width 0.3s;
    }
    #fb-osint-scanner-progress .sp-close {
      margin-top: 12px; background: rgba(255,255,255,0.6); border: 1px solid #C5E5F7;
      color: #5BA3C9; padding: 6px 20px; border-radius: 12px; cursor: pointer;
      font-size: 12px; font-family: inherit; transition: all 0.2s;
    }
    #fb-osint-scanner-progress .sp-close:hover { background: #87CEEB; color: white; }

    .fb-osint-popup-scanner {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.3); z-index: 9999998;
      display: flex; align-items: center; justify-content: center;
    }
    .fb-osint-popup-scanner .ps-box {
      background: linear-gradient(135deg, #E8F4FD, #C5E5F7);
      color: #4A6B8A; border: 2px solid #87CEEB; border-radius: 20px;
      padding: 24px; max-width: 400px; width: 90%; max-height: 80vh; overflow-y: auto;
      font-family: 'Noto Sans SC', sans-serif;
    }
    .fb-osint-popup-scanner .ps-box .ps-title { font-weight: 700; margin-bottom: 12px; font-size: 14px; }
    .fb-osint-popup-scanner .ps-box .ps-item {
      font-size: 12px; padding: 5px 8px; border-radius: 10px;
      background: rgba(255,255,255,0.6); margin-bottom: 3px;
    }
    .fb-osint-popup-scanner .ps-box .ps-close {
      margin-top: 12px; background: #87CEEB; border: none; color: white;
      padding: 8px 24px; border-radius: 12px; cursor: pointer; font-family: inherit;
    }

    /* 滚动条美化 */
    #fb-osint-panel .panel-body::-webkit-scrollbar,
    #fb-osint-notepad .note-body::-webkit-scrollbar {
      width: 6px;
    }
    #fb-osint-panel .panel-body::-webkit-scrollbar-track,
    #fb-osint-notepad .note-body::-webkit-scrollbar-track {
      background: rgba(255,255,255,0.3); border-radius: 3px;
    }
    #fb-osint-panel .panel-body::-webkit-scrollbar-thumb,
    #fb-osint-notepad .note-body::-webkit-scrollbar-thumb {
      background: #87CEEB; border-radius: 3px;
    }
    #fb-osint-panel .panel-body::-webkit-scrollbar-thumb:hover,
    #fb-osint-notepad .note-body::-webkit-scrollbar-thumb:hover {
      background: #6BB5D9;
    }
  `;
  GM_addStyle(styles);

  // ============================================================
  //  🎀 状态
  // ============================================================
  let panelVisible = false;
  let activeTab = 'profile';
  let boardEntries = GM_getValue('osint_board_entries', []);

  // ============================================================
  //  工具函数
  // ============================================================
  function safeText(el) { return el ? el.textContent.trim() : ''; }
  function safeAttr(el, attr) { return el ? (el.getAttribute(attr) || el[attr] || '') : ''; }

  function copyText(text) {
    try { GM_setClipboard(text); return true; } catch(e) {
      try { navigator.clipboard.writeText(text); return true; } catch(e2) { return false; }
    }
  }

  function downloadFile(filename, content, mime = 'text/plain') {
    const blob = new Blob([content], { type: mime });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function showStatus(msg) {
    const el = document.getElementById('osint-status');
    if (el) { el.textContent = '💬 ' + msg; setTimeout(() => { if (el) el.textContent = '🌸 就绪'; }, 2500); }
  }

  function toCSV(data) {
    if (!data.length) return '';
    const keys = Object.keys(data[0]);
    const escaped = v => {
      if (v === null || v === undefined) return '';
      const s = String(v);
      if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"';
      return s;
    };
    return [keys.join(','), ...data.map(r => keys.map(k => escaped(r[k])).join(','))].join('\n');
  }

  function persistBoard() { GM_setValue('osint_board_entries', boardEntries); }
  function openURL(url) { const a = document.createElement('a'); a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.click(); }

  // ============================================================
  //  FB UID 提取
  // ============================================================
  function extractFBUID() {
    const metaEl = document.querySelector('meta[property="al:android:url"], meta[property="al:ios:url"]');
    if (metaEl) { const c = metaEl.getAttribute('content') || ''; const m = c.match(/id=(\d+)/) || c.match(/user_id=(\d+)/); if (m) return m[1]; }
    const appLink = document.querySelector('link[rel="alternate"][href*="fb://"]');
    if (appLink) { const h = appLink.getAttribute('href') || ''; const m = h.match(/profile\/(\d+)/) || h.match(/id=(\d+)/); if (m) return m[1]; }
    const imgs = document.querySelectorAll('img[src*="scontent"], img[src*="fbcdn"]');
    for (const img of imgs) { const s = img.src || ''; const m = s.match(/\/(\d+)_\d+_\d+_n\.jpg/) || s.match(/\/p(\d+)_/); if (m) return m[1]; }
    const avi = document.querySelector('img.x1b0d499, image[alt*="profile"]');
    if (avi) { const s = avi.getAttribute('xlink:href') || avi.src || ''; const m = s.match(/\/p(\d+)_/) || s.match(/\/v\/[^/]+\/(\d+)_/); if (m) return m[1]; }
    const scripts = document.querySelectorAll('script[type="application/json"], script[data-content]');
    for (const s of scripts) { const t = s.textContent || ''; const m = t.match(/"uid":(\d+)/) || t.match(/"userID":(\d+)/i) || t.match(/"profile_id":(\d+)/i); if (m) return m[1]; }
    const pid = window.location.pathname.split('/').filter(Boolean)[0];
    if (pid && !['messages','groups','photos','videos','watch','marketplace','friends','events','settings','notifications','stories'].includes(pid)) return `用户名:${pid}`;
    return '';
  }

  // ============================================================
  //  提取主页数据
  // ============================================================
  function scrapeProfile() {
    const data = {};
    const url = window.location.href;

    const nameSel = ['h1 span','h1','[data-pagelet="Profile"] h1','span.xdj266r span.x1jchvi3','h2.x1heor9g'];
    for (const sel of nameSel) { const el = document.querySelector(sel); if (el && el.textContent.trim().length > 2) { data.name = el.textContent.trim(); break; }}

    const avSel = ['img.x1b0d499.x1dofw5p','image[alt*="profile"]','circle image','img.x1rg5ohu'];
    for (const sel of avSel) { const el = document.querySelector(sel); if (el) { let src = el.getAttribute('xlink:href') || el.src || ''; src = src.replace(/\/[ps]\d+x\d+\//, '/p960x960/'); data.avatarUrl = src; break; }}

    data.uid = extractFBUID();

    const allSpans = document.querySelectorAll('span, div.x1n2onr6 > div.x1n2onr6 span, div[dir="auto"] span');
    for (const el of allSpans) {
      const t = el.textContent.trim();
      if (t.startsWith('Lives in')) data.location = t.replace('Lives in ','').trim();
      else if (t.startsWith('From')) data.hometown = t.replace('From ','').trim();
      else if (t.startsWith('Works at')) data.work = t.replace('Works at ','').trim();
      else if (t.startsWith('Studied at')) data.education = t.replace('Studied at ','').trim();
      else if (t.startsWith('Went to')) data.education = t.replace('Went to ','').trim();
      else if (['Single','In a relationship','Married','Engaged','Divorced','Widowed',"It's complicated"].includes(t)) data.relationship = t;
    }

    const fc = document.body.innerText.match(/([\d,]+)\s*(?:friends?|mutual friends?)/i);
    if (fc) data.friends = fc[1];
    const bd = document.body.innerText.match(/Birthday\s*:?\s*(\w+\s+\d{1,2}(?:,\s*\d{4})?)/i);
    if (bd) data.birthday = bd[1];
    const fol = document.body.innerText.match(/([\d,.KkMmbB]+)\s*(?:follower|followers)/i);
    if (fol) data.followers = fol[1];

    const bioCandidates = document.querySelectorAll('[data-pagelet="Profile"] p, div.x1n2onr6 > div > span > span > span');
    for (const el of bioCandidates) { const t = el.textContent.trim(); if (t.length > 15 && t.length < 500 && !t.startsWith('Lives in') && !t.startsWith('Works at') && !t.startsWith('From') && !t.startsWith('Studied') && !t.startsWith('Went to')) { data.bio = t; break; }}

    data.url = url;
    data.profileId = url.match(/facebook\.com\/([^/?]+)/)?.[1] || '';
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
    const combined = [data.name, data.location, data.hometown, data.work, data.education, data.bio].filter(Boolean).join(' ') + ' ' + document.body.innerText;
    const keywords = [], seen = new Set();
    const add = (p, v) => { const k = `${p} ${v}`; if (!seen.has(k) && v) { seen.add(k); keywords.push(k); }};
    (combined.match(/(?:\+1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g) || []).forEach(p => add('📞', p));
    (combined.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []).forEach(e => add('✉️', e));
    (combined.match(/https?:\/\/[^\s)]+/g) || []).forEach(u => add('🔗', u));
    const stateRE = /\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)\b/g;
    let m; while ((m = stateRE.exec(combined)) !== null) add('📍', m[1]);
    (combined.match(/\b(\d{2})\s*(?:years old|yo|yr|y\/o)\b/gi) || []).forEach(a => add('🎂', a));
    (combined.match(/\b(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}(?:,?\s*\d{4})?\b/gi) || []).forEach(b => add('🎉', b));
    (combined.match(/@[a-zA-Z0-9_.-]{3,30}/g) || []).forEach(h => add('🆔', h));
    (combined.match(/\b\d{5}(?:-\d{4})?\b/g) || []).forEach(z => { const n = parseInt(z,10); if (n>=10000 && n<=99999) add('📮', z); });
    if (data.bio) {
      const sw = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','from','is','am','are','was','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','shall','can','need','dare','ought','used','this','that','these','those','i','my','me','we','our','you','your','he','him','his','she','her','it','its','they','them','their','not','no','nor','so','if','as','up','out','about','who','what','when','where','why','how','all','each','every','both','few','more','most','some','any','none','just','also','very','too','really','here','there','now','then','only','own','same','like']);
      const words = data.bio.toLowerCase().replace(/[^a-z\s-]/g,'').split(/\s+/).filter(w => w.length>3 && !sw.has(w));
      const freq = {}; words.forEach(w => { freq[w] = (freq[w]||0)+1; });
      Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,10).forEach(([word]) => add('🏷️', word));
    }
    return keywords;
  }

  function extractMutualFriends() {
    const results = [];
    document.querySelectorAll('span, div, a').forEach(el => {
      const t = el.textContent.trim().toLowerCase();
      if (t.includes('mutual friend') || t.includes('mutual friends')) {
        const link = el.closest('a') || el.querySelector('a');
        if (link) {
          const href = link.getAttribute('href') || '';
          const parent = el.closest('div[class*="x"], div[data-pagelet]');
          const avatars = parent ? parent.querySelectorAll('img.x1b0d499, img[decoding="async"]') : [];
          results.push({ text: el.textContent.trim(), url: href.startsWith('/') ? 'https://www.facebook.com'+href : href, count: parseInt(t.match(/(\d+)/)?.[1]||0,10), avatars: Array.from(avatars).slice(0,4).map(a => a.src || a.getAttribute('xlink:href') || '') });
        }
      }
    });
    const mt = document.body.innerText.match(/(?:Mutual|mutual friends?)\s*[:,]\s*([^.\n]+)/);
    if (mt) { mt[1].split(',').map(n=>n.trim()).filter(n=>n.length>0&&!n.match(/^\d+\s*more$/)).forEach(name => { if (!results.find(r=>r.text.includes(name))) results.push({text:name,url:'',count:0,avatars:[]}); }); }
    return results;
  }

  function tryExpandMutualFriends() {
    document.querySelectorAll('a, span[role="button"]').forEach(el => {
      const t = el.textContent.trim().toLowerCase();
      if (t.match(/^\d+/) && t.includes('mutual friend')) { el.click(); setTimeout(scrapeMutualFriendsPopup, 1500); }
    });
  }

  function scrapeMutualFriendsPopup() {
    setTimeout(() => {
      const names = new Set();
      document.querySelectorAll('div[role="dialog"] a[href*="/user/"], div[role="dialog"] a[href*="profile.php"], div[role="dialog"] span[dir="auto"] a').forEach(el => {
        const name = el.textContent.trim(); const href = el.getAttribute('href')||'';
        if (name && href && name.length>1 && !name.match(/^\d+$/)) names.add(JSON.stringify({name, url: href.startsWith('/') ? 'https://www.facebook.com'+href : href}));
      });
      if (names.size>0) {
        const data = Array.from(names).map(n=>JSON.parse(n));
        downloadFile(`共同好友_${Date.now()}.csv`, toCSV(data), 'text/csv');
        showStatus(`✅ 采集到 ${data.length} 个共同好友`);
        showScrapePopup('🤝 共同好友', data.map(d => `${d.name} — ${d.url}`));
      } else showStatus('弹窗中没找到名字');
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    }, 2000);
  }

  function extractTimelinePosts() {
    const posts = [], seen = new Set();
    document.querySelectorAll('[data-pagelet="ProfileTimeline"] div[dir="auto"], [data-pagelet="Profile"] div[dir="auto"]').forEach(el => {
      const text = el.textContent.trim();
      if (text.length<5||text.length>500||seen.has(text)) return; seen.add(text);
      const skip = ['Lives in','Works at','Studied at','Went to','From','Add Friend','Message','Following','Suggestions','More','See more','Story','Photo','Video'];
      for (const s of skip) { if (text.startsWith(s)) return; }
      let location = ''; const locM = text.match(/(?:at|in)\s+([A-Z][A-Za-z\s,]+?)(?:\.|!|\?|$)/); if (locM&&locM[1].length<30) location = locM[1].trim();
      const ts = el.closest('[data-pagelet]')?.querySelector('a[href*="story"], a[href*="posts"]')?.textContent?.trim()||'';
      posts.push({text: text.slice(0,150), location, timestamp: ts});
    });
    return posts.slice(0,30);
  }

  function extractLinkedAccounts() {
    const pt = document.body.innerText, accs = [];
    const pats = [
      {p:'Instagram',r:/instagram\.com\/([a-zA-Z0-9_.]+)/i, u:h=>`https://instagram.com/${h}`},
      {p:'Twitter/X',r:/(?:twitter|x)\.com\/([a-zA-Z0-9_]+)/i, u:h=>`https://x.com/${h}`},
      {p:'LinkedIn',r:/linkedin\.com\/in\/([a-zA-Z0-9-]+)/i, u:h=>`https://linkedin.com/in/${h}`},
      {p:'GitHub',r:/github\.com\/([a-zA-Z0-9-]+)/i, u:h=>`https://github.com/${h}`},
      {p:'YouTube',r:/youtube\.com\/@([a-zA-Z0-9_-]+)/i, u:h=>`https://youtube.com/@${h}`},
      {p:'TikTok',r:/tiktok\.com\/@([a-zA-Z0-9_.]+)/i, u:h=>`https://tiktok.com/@${h}`},
      {p:'Snapchat',r:/snapchat\.com\/add\/([a-zA-Z0-9_-]+)/i, u:h=>`https://snapchat.com/add/${h}`},
    ];
    pats.forEach(({p,r,u}) => { const m = pt.match(r); if (m) accs.push({platform:p, handle:m[1], url:u(m[1])}); });
    return accs;
  }

  function extractContactInfo() {
    const c = [], pt = document.body.innerText, h = document.body.innerHTML;
    const wa = pt.match(/(?:whatsapp|wa\.me|wa\.link)\s*(?::|is)?\s*(?:\+?1?\d{10,})/i);
    if (wa) c.push({type:'WhatsApp', value:wa[0].replace(/^(?:whatsapp|wa\.me|wa\.link)\s*(?::|is)?\s*/i,'').trim()});
    const ph = h.match(/<span[^>]*>Phone[^<]*<\/span>[^<]*<[^>]*>([^<]+)/i);
    if (ph) c.push({type:'电话', value:ph[1].trim()});
    const si = h.match(/<span[^>]*>Website[^<]*<\/span>[^<]*<[^>]*>([^<]+)/i);
    if (si) c.push({type:'网站', value:si[1].trim()});
    const em = h.match(/<span[^>]*>Email[^<]*<\/span>[^<]*<[^>]*>([^<]+)/i);
    if (em) c.push({type:'邮箱', value:em[1].trim()});
    return c;
  }

  function extractCommonGroups() {
    const g = [];
    document.querySelectorAll('span, div, a').forEach(el => {
      const t = el.textContent.trim().toLowerCase();
      if (t.includes('groups in common') || (t.includes('common')&&t.includes('group'))) {
        const l = el.closest('a')||el.querySelector('a');
        g.push({text:el.textContent.trim(), url:l?(l.getAttribute('href')?.startsWith('/')?'https://www.facebook.com'+l.getAttribute('href'):l.getAttribute('href')||''):''});
      }
    });
    return g;
  }

  function extractEvents() {
    const ev = [], seen = new Set();
    document.querySelectorAll('[data-pagelet="ProfileEvents"] div[dir="auto"], div[data-pagelet] a[href*="/events/"]:not([href*="/events/create"])').forEach(el => {
      const text = el.textContent.trim(); if (text.length<3||seen.has(text)) return; seen.add(text);
      const d = text.match(/\b(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}(?:,?\s*\d{4})?\b/i);
      const l = text.match(/(?:at|in)\s+([A-Z][A-Za-z\s,]+?)(?:\.|!|\?|$)/);
      const h = el.closest('a')?.getAttribute('href')||'';
      ev.push({name:text.slice(0,80), date:d?d[0]:'', location:l?l[1].trim():'', url:h.startsWith('/')?'https://www.facebook.com'+h:h});
    });
    return ev.slice(0,20);
  }

  function extractPhotos() {
    const ph = [], seen = new Set();
    document.querySelectorAll('a[href*="/photos/"]:not([href*="/albums/"]):not([href*="/upload"]), div[data-pagelet="ProfilePhotos"] a, a[href*="photo.php"]').forEach(el => {
      const href = el.getAttribute('href')||''; const img = el.querySelector('img'); const src = img?(img.src||''):'';
      const pt = el.closest('div[class*="x"], div[data-pagelet]')?.textContent?.trim()||'';
      const d = pt.match(/\b(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}(?:,?\s*\d{4})?\b/i);
      const key = href||src; if (key&&!seen.has(key)) { seen.add(key); ph.push({text:el.textContent.trim()||'(照片)', date:d?d[0]:'', url:href, imgSrc:src.slice(0,100)}); }
    });
    return ph.slice(0,30);
  }

  function extractFriendSuggestions() {
    const su = [], seen = new Set();
    document.querySelectorAll('div[data-pagelet="Profile"] div[class*="x1n2onr6"] a[href*="facebook.com/"]:not([href*="groups/"]):not([href*="photos/"]):not([href*="messages/"]), a[aria-label*="Add Friend"], a[role="button"][href*="facebook.com/"]').forEach(el => {
      const name = el.textContent.trim(); const href = el.getAttribute('href')||'';
      if (name&&name.length>1&&name.length<40&&href.match(/facebook\.com\/(?!groups|photos|videos|watch|marketplace|messages|events|settings|notifications|stories|friends)/)) {
        const fu = href.startsWith('/')?'https://www.facebook.com'+href:href;
        if (!seen.has(fu)) { seen.add(fu); su.push({name, url:fu}); }
      }
    });
    return su.slice(0,20);
  }

  // ============================================================
  //  变更追踪
  // ============================================================
  function checkForChanges(data) {
    const existing = GM_getValue('fb_osint_data', []);
    const prev = existing.find(e => e.url === data.url);
    if (!prev) return null;
    const changes = {};
    ['name','location','hometown','work','education','relationship','birthday','bio'].forEach(f => { if (prev[f] && data[f] && prev[f] !== data[f]) changes[f] = { old: prev[f], new: data[f] }; });
    const oldKws = new Set(prev.keywords||[]), newKws = new Set(data.keywords||[]);
    const added = [...newKws].filter(k=>!oldKws.has(k)), removed = [...oldKws].filter(k=>!newKws.has(k));
    if (added.length||removed.length) changes.keywords = { added, removed };
    return Object.keys(changes).length>0 ? changes : null;
  }

  // ============================================================
  //  🎀 面板渲染（全部中文）
  // ============================================================
  const CHINESE_TABS = {
    'profile': '👤 主页',
    'keys': '🔑 关键词',
    'pivot': '🎯 搜索',
    'mutual': '🤝 共同好友',
    'group': '👥 群组',
    'posts': '📰 帖子',
    'photos': '📸 照片',
    'contacts': '📞 联系方式',
    'events': '📅 活动',
    'network': '🔗 社交圈',
    'changes': '⚠️ 变更'
  };

  function renderPanel(data) {
    const existing = document.getElementById('fb-osint-panel');
    if (existing) existing.remove();
    const changes = checkForChanges(data);
    const changeBadge = changes ? '<span class="change-badge">⚠️ 有变更</span>' : '';

    const panel = document.createElement('div');
    panel.id = 'fb-osint-panel';
    panel.innerHTML = `
      <div class="panel-header">
        <span class="panel-title">🌸 FB 信息助手 ${changeBadge}<br><span class="author">By.阿趣 🎀</span></span>
        <span class="panel-actions">
          <button id="osint-refresh" title="刷新">🔄</button>
          <button id="osint-toggle" title="折叠">_</button>
          <button id="osint-close" title="关闭">✕</button>
        </span>
      </div>
      <div class="panel-body">
        <div class="tab-bar">
          ${Object.entries(CHINESE_TABS).map(([k,v]) => `<button data-tab="${k}"${k==='profile'?' class="active"':''}${k==='changes'&&!changes?' style="display:none;"':''}>${v}</button>`).join('')}
        </div>
        <div id="osint-tab-content">${renderProfileTab(data, changes)}</div>
        <div class="export-row">
          <button id="osint-copy-all">📋 复制全部</button>
          <button id="osint-save">💾 保存</button>
          <button id="osint-export-json">📄 JSON</button>
          <button id="osint-export-csv">📊 CSV</button>
          <button id="osint-screenshot">📸 页面快照</button>
        </div>
        <div class="status-line" id="osint-status">🌸 就绪</div>
      </div>`;
    document.body.appendChild(panel);
    panelVisible = true;

    document.querySelectorAll('#fb-osint-panel .tab-bar button').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('#fb-osint-panel .tab-bar button').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active'); activeTab = btn.dataset.tab;
        const content = document.getElementById('osint-tab-content');
        const tabs = {
          'profile': renderProfileTab(data, changes),
          'keys': renderKeysTab(data),
          'pivot': renderPivotTab(data),
          'mutual': renderMutualTab(data),
          'group': renderGroupTab(),
          'posts': renderTimelineTab(data),
          'photos': renderPhotosTab(data),
          'contacts': renderContactsTab(data),
          'events': renderEventsTab(data),
          'network': renderNetworkTab(data),
          'changes': changes ? renderChangesTab(changes) : '<div></div>'
        };
        content.innerHTML = tabs[activeTab] || renderProfileTab(data, changes);
      };
    });

    document.getElementById('osint-close').onclick = () => { panel.remove(); panelVisible = false; };
    document.getElementById('osint-toggle').onclick = () => panel.classList.toggle('collapsed');
    document.getElementById('osint-refresh').onclick = () => refresh();

    document.getElementById('osint-copy-all').onclick = () => {
      const lines = [`姓名: ${data.name||''}`, `FB UID: ${data.uid||'无'}`, `主页: ${data.url||''}`, '', '--- 基本资料 ---'];
      if (data.location) lines.push(`所在地: ${data.location}`);
      if (data.hometown) lines.push(`家乡: ${data.hometown}`);
      if (data.work) lines.push(`工作: ${data.work}`);
      if (data.education) lines.push(`教育: ${data.education}`);
      if (data.relationship) lines.push(`感情状态: ${data.relationship}`);
      if (data.birthday) lines.push(`生日: ${data.birthday}`);
      if (data.friends) lines.push(`好友数: ${data.friends}`);
      if (data.followers) lines.push(`粉丝: ${data.followers}`);
      if (data.bio) lines.push(`简介: ${data.bio}`);
      lines.push(''); lines.push('--- 关键词 ---');
      (data.keywords||[]).forEach(k=>lines.push(k));
      lines.push(''); lines.push('--- 关联账号 ---');
      (data.linkedAccounts||[]).forEach(a=>lines.push(`${a.platform}: ${a.handle}`));
      lines.push(''); lines.push('--- 联系方式 ---');
      (data.contactInfo||[]).forEach(c=>lines.push(`${c.type}: ${c.value}`));
      lines.push(''); lines.push('--- 共同群组 ---');
      (data.commonGroups||[]).forEach(g=>lines.push(g.text));
      lines.push(''); lines.push('--- 活动 ---');
      (data.events||[]).forEach(e=>lines.push(`${e.name} | ${e.date} | ${e.location}`));
      lines.push(''); lines.push('--- 共同好友 ---');
      (data.mutualFriends||[]).forEach(m=>lines.push(m.text));
      if (copyText(lines.join('\n'))) showStatus('已复制全部 ✅');
    };

    document.getElementById('osint-save').onclick = () => { saveProfile(data); showStatus('已保存 💾'); };
    document.getElementById('osint-export-json').onclick = () => exportJSON();
    document.getElementById('osint-export-csv').onclick = () => exportCSV();
    document.getElementById('osint-screenshot').onclick = () => { downloadFile(`fb_${data.profileId||'page'}_${Date.now()}.html`, document.documentElement.outerHTML, 'text/html'); showStatus('页面已保存'); };

    document.querySelectorAll('#fb-osint-panel .copy-btn').forEach(btn => {
      btn.onclick = () => { const text = btn.getAttribute('data-copy'); if (copyText(text)) { btn.textContent = '✅'; btn.classList.add('copied'); setTimeout(()=>{btn.textContent='📋';btn.classList.remove('copied');},1500); }};
    });
  }

  function renderProfileTab(data, changes) {
    const fields = [
      {label:'主页链接', value:data.url}, {label:'FB UID', value:data.uid},
      {label:'姓名', value:data.name}, {label:'所在地', value:data.location},
      {label:'家乡', value:data.hometown}, {label:'工作', value:data.work},
      {label:'教育', value:data.education}, {label:'感情状态', value:data.relationship},
      {label:'生日', value:data.birthday}, {label:'好友数', value:data.friends},
      {label:'粉丝数', value:data.followers}, {label:'简介', value:data.bio},
    ];
    let avatarHtml = '';
    if (data.avatarUrl) {
      avatarHtml = `<div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:8px;">
        <img class="profile-avatar" src="${data.avatarUrl}" id="osint-avatar-img" />
        <div class="avatar-actions" style="flex:1;">
          <div style="font-size:11px;font-weight:600;margin-bottom:4px;color:#4A6B8A;">📸 头像</div>
          <button id="osint-dl-avatar">⬇️ 下载</button>
          <button id="osint-ri-google">🔍 谷歌搜图</button>
          <button id="osint-ri-tineye">🔍 TinEye</button>
          <button id="osint-ri-yandex">🔍 Yandex</button>
        </div>
      </div>`;
    }
    let changeHtml = '';
    if (changes) {
      changeHtml = `<div style="background:#FFF3CD;border:1px solid #FFC107;border-radius:12px;padding:8px;margin-bottom:8px;font-size:11px;color:#856404;">
        ⚠️ 主页信息有变化！ <a href="#" id="osint-goto-changes" style="color:#87CEEB;text-decoration:underline;">查看变更 →</a>
      </div>`;
    }
    const fieldHtml = fields.filter(f=>f.value).map(f => {
      const isChanged = changes && changes[f.label];
      return `<div class="field-group"${isChanged?' style="border-left:3px solid #FFC107;padding-left:5px;"':''}>
        <div class="field-label">${f.label}</div>
        <div class="field-value">
          <span>${f.value.length>80 ? f.value.slice(0,80)+'…' : f.value}${isChanged?' ⚠️':''}</span>
          <button class="copy-btn" data-copy="${f.value.replace(/"/g,'&quot;')}">📋</button>
        </div>
      </div>`;
    }).join('');
    return changeHtml + avatarHtml + (data.name?`<div class="profile-name">${data.name}</div>`:'') + fieldHtml;
  }

  function renderKeysTab(data) {
    const kws = data.keywords||[];
    if (!kws.length) return '<div style="color:#8AB4D6;text-align:center;padding:20px;">暂无提取到关键词<br>试试刷新页面</div>';
    const chips = kws.map(k=>`<span class="keyword-chip" data-kw="${k.replace(/"/g,'&quot;')}">${k}</span>`).join('');
    const pt = document.body.innerText, extras = [];
    const addE = (p,v)=>{if(v&&!kws.some(k=>k.includes(v))) extras.push(`${p} ${v}`);};
    (pt.match(/(?:\+1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g)||[]).forEach(p=>addE('📞',p));
    (pt.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g)||[]).forEach(e=>addE('✉️',e));
    (pt.match(/@[a-zA-Z0-9_.-]{3,30}/g)||[]).forEach(h=>addE('🆔',h));
    let extraHtml = '';
    if (extras.length) extraHtml = `<div class="field-group" style="margin-top:8px;"><div class="field-label">页面其他发现</div><div>${extras.map(k=>`<span class="keyword-chip">${k}</span>`).join('')}</div></div>`;
    return `<div class="field-group"><div class="field-label">提取关键词 (${kws.length})<br><span style="font-weight:400;font-size:10px;color:#8AB4D6;">点击可复制</span></div><div>${chips}</div></div>${extraHtml}`;
  }

  function renderPivotTab(data) {
    const pivots = getPivotURLs(data);
    if (!pivots.length) return '<div style="color:#8AB4D6;text-align:center;padding:20px;">没有可搜索的数据</div>';
    const btns = pivots.map(p=>`<button class="pivot-btn" data-url="${p.url}">${p.label}</button>`).join('');
    return `<div class="field-group"><div class="field-label">🎯 一键搜索</div><div class="osint-pivot-grid">${btns}</div></div>`;
  }

  function getPivotURLs(data) {
    const name = encodeURIComponent(data.name||'');
    const email = data.keywords?.find(k=>k.startsWith('✉️'))?.slice(2).trim()||'';
    const phone = data.keywords?.find(k=>k.startsWith('📞'))?.slice(2).trim()||'';
    const loc = encodeURIComponent(data.location||data.hometown||'');
    const uid = data.uid||'';
    const gq = uid&&!uid.startsWith('用户名') ? `https://graph.facebook.com/v19.0/${uid}?fields=id,name,first_name,last_name,email,location,gender,birthday,link,locale,timezone&access_token=需要填入TOKEN` : null;
    return [
      {label:'🔍 谷歌', url:`https://www.google.com/search?q=${name}`},
      {label:'👔 领英', url:`https://www.google.com/search?q=site:linkedin.com/in+${name}`},
      {label:'🍃 Pipl', url:`https://pipl.com/search/?q=${name}`},
      {label:'🛡️ Dehashed', url:`https://dehashed.com/search?q=${name}`},
      {label:'🔐 HIBP', url:email?`https://haveibeenpwned.com/account/${email}`:null},
      {label:'🐙 GitHub', url:`https://www.google.com/search?q=site:github.com+${name}`},
      {label:'📸 Instagram', url:`https://www.google.com/search?q=site:instagram.com+${name}`},
      {label:'🐦 X/Twitter', url:`https://x.com/search?q=${name}`},
      {label:'📞 电话', url:phone?`https://www.google.com/search?q=${encodeURIComponent(phone)}`:null},
      {label:'🏙️ 城市', url:loc?`https://www.google.com/search?q=${loc}+${name}`:null},
      {label:'📧 邮箱', url:email?`https://www.google.com/search?q=${encodeURIComponent(email)}`:null},
      {label:'🆔 Graph API', url:gq},
    ].filter(l=>l.url);
  }

  function renderMutualTab(data) {
    const mfs = data.mutualFriends||[];
    let html = '';
    if (!mfs.length) html = '<div style="color:#8AB4D6;text-align:center;padding:16px;">没发现共同好友</div>';
    else {
      html = `<div class="field-group"><div class="field-label">🤝 ${mfs.length} 个共同好友</div></div>`;
      mfs.forEach(mf => {
        const avHtml = (mf.avatars||[]).filter(Boolean).map(a=>`<img src="${a}" />`).join('');
        const badge = mf.count>0 ? ` <span style="color:#87CEEB;font-size:10px;">(${mf.count}个)</span>` : '';
        html += `<div class="mutual-friend-item">${avHtml}<span class="mf-name">${mf.text}${badge}</span>${mf.url?`<a class="mf-link" href="${mf.url}" target="_blank">→</a>`:''}</div>`;
      });
    }
    html += `<div style="margin-top:6px;display:flex;gap:4px;flex-wrap:wrap;">
      <button id="osint-highlight-mutual" style="background:#87CEEB;border:none;color:white;padding:4px 10px;border-radius:10px;cursor:pointer;font-size:10px;">🔦 高亮显示</button>
      <button id="osint-expand-mutual" style="background:rgba(255,255,255,0.6);border:1px solid #C5E5F7;color:#5BA3C9;padding:4px 10px;border-radius:10px;cursor:pointer;font-size:10px;">🔽 展开并采集</button>
    </div>`;
    return html;
  }

  function renderGroupTab() {
    return `<div>
      <div style="font-size:13px;font-weight:700;margin-bottom:6px;color:#4A6B8A;">👥 群组成员扫描</div>
      <div style="font-size:11px;color:#8AB4D6;margin-bottom:10px;">自动滚动页面采集群组成员，导出 CSV</div>
      <button id="osint-scan-group" style="width:100%;padding:10px;background:#87CEEB;border:none;border-radius:12px;color:white;font-size:13px;font-weight:600;cursor:pointer;">🔍 扫描可见成员</button>
      <button id="osint-scan-group-history" style="width:100%;margin-top:6px;padding:8px;background:rgba(255,255,255,0.6);border:1px solid #C5E5F7;border-radius:12px;color:#5BA3C9;font-size:12px;cursor:pointer;">📄 查看历史记录</button>
      <div id="osint-scan-results" style="margin-top:8px;max-height:280px;overflow-y:auto;"></div>
    </div>`;
  }

  function renderTimelineTab(data) {
    const posts = data.posts||[];
    if (!posts.length) return '<div style="color:#8AB4D6;text-align:center;padding:20px;">没发现帖子，往下翻加载更多后刷新面板</div>';
    const items = posts.map(p => {
      const loc = p.location ? ` <span class="tl-loc">📍 ${p.location}</span>` : '';
      const time = p.timestamp ? `<span class="tl-time">🕐 ${p.timestamp}</span>` : '';
      return `<div class="timeline-item"><div>${p.text}${loc}</div><div style="display:flex;gap:6px;margin-top:2px;">${time}</div></div>`;
    }).join('');
    return `<div class="field-group"><div class="field-label">📰 最近帖子 (${posts.length})</div>${items}</div>`;
  }

  function renderPhotosTab(data) {
    const ph = data.photos||[];
    if (!ph.length) return '<div style="color:#8AB4D6;text-align:center;padding:20px;">没发现照片信息</div>';
    const items = ph.map(p => {
      const date = p.date ? `<span class="ph-date">📅 ${p.date}</span>` : '';
      return `<div class="photo-item"><div>${p.text||'(照片)'}</div><div>${date}</div></div>`;
    }).join('');
    return `<div class="field-group"><div class="field-label">📸 照片 (${ph.length})</div>${items}</div>`;
  }

  function renderContactsTab(data) {
    const c = data.contactInfo||[], l = data.linkedAccounts||[];
    if (!c.length&&!l.length) return '<div style="color:#8AB4D6;text-align:center;padding:20px;">没找到联系方式和关联账号</div>';
    let html = '';
    if (c.length) {
      html += `<div class="field-group"><div class="field-label">📞 联系方式</div>`;
      c.forEach(c => { html += `<div class="contact-item"><span>${c.type}: <strong>${c.value}</strong></span><button class="copy-btn" data-copy="${c.value.replace(/"/g,'&quot;')}">📋</button></div>`; });
      html += `</div>`;
    }
    if (l.length) {
      html += `<div class="field-group"><div class="field-label">🔗 关联账号</div>`;
      l.forEach(a => { html += `<div class="mutual-friend-item"><span class="mf-name">${a.platform}: <strong>${a.handle}</strong></span><a class="mf-link" href="${a.url}" target="_blank">→</a></div>`; });
      html += `</div>`;
    }
    return html;
  }

  function renderEventsTab(data) {
    const ev = data.events||[];
    if (!ev.length) return '<div style="color:#8AB4D6;text-align:center;padding:20px;">没发现活动信息，打开活动页面后刷新</div>';
    const items = ev.map(e => {
      const date = e.date ? `<span class="ev-date">📅 ${e.date}</span>` : '';
      const loc = e.location ? ` <span class="ev-loc">📍 ${e.location}</span>` : '';
      return `<div class="event-item"><div>${e.name}</div><div>${date}${loc}</div></div>`;
    }).join('');
    return `<div class="field-group"><div class="field-label">📅 活动 (${ev.length})</div>${items}</div>`;
  }

  function renderNetworkTab(data) {
    const su = data.friendSuggestions||[], cg = data.commonGroups||[];
    let html = '';
    if (cg.length) {
      html += `<div class="field-group"><div class="field-label">👥 共同群组</div>`;
      cg.forEach(g => { html += `<div class="mutual-friend-item"><span class="mf-name">${g.text}</span>${g.url?`<a class="mf-link" href="${g.url}" target="_blank">→</a>`:''}</div>`; });
      html += `</div>`;
    }
    if (su.length) {
      html += `<div class="field-group"><div class="field-label">💡 可能认识的人</div>`;
      su.slice(0,15).forEach(s => { html += `<div class="mutual-friend-item"><span class="mf-name">👤 ${s.name}</span><a class="mf-link" href="${s.url}" target="_blank">→</a></div>`; });
      html += `<div style="font-size:10px;color:#8AB4D6;margin-top:4px;">来自页面上的「可能认识的人」推荐</div>`;
      html += `</div>`;
    }
    if (!html) html = '<div style="color:#8AB4D6;text-align:center;padding:20px;">没发现社交圈数据</div>';
    return html;
  }

  function renderChangesTab(changes) {
    let html = '<div class="field-group"><div class="field-label">⚠️ 主页信息变更</div></div>';
    for (const [field, change] of Object.entries(changes)) {
      if (field === 'keywords') {
        html += `<div class="field-group"><div class="field-label">关键词</div>
          <div style="font-size:11px;background:rgba(255,255,255,0.6);border-radius:12px;padding:8px;">
            ${change.added.length?'<div style="color:#7BC99A;">➕ 新增: '+change.added.join(', ')+'</div>':''}
            ${change.removed.length?'<div style="color:#E88B8B;">➖ 消失: '+change.removed.join(', ')+'</div>':''}
          </div></div>`;
      } else {
        html += `<div class="field-group"><div class="field-label">${field}</div>
          <div style="font-size:11px;background:rgba(255,255,255,0.6);border-radius:12px;padding:8px;">
            <div style="color:#E88B8B;">旧: ${change.old}</div>
            <div style="color:#7BC99A;">新: ${change.new}</div>
          </div></div>`;
      }
    }
    return html;
  }

  // ============================================================
  //  群组扫描
  // ============================================================
  function scanGroupMembers() {
    const ov = document.createElement('div'); ov.id = 'fb-osint-scanner-progress';
    ov.innerHTML = `<div class="sp-title">🔍 正在扫描群组成员</div><div class="sp-count" id="sp-count">已扫描: 0</div><div class="sp-bar-bg"><div class="sp-bar-fill" id="sp-bar-fill"></div></div><button class="sp-close" id="sp-close">取消</button>`;
    document.body.appendChild(ov);
    let cancelled = false; document.getElementById('sp-close').onclick = () => { cancelled=true; ov.remove(); };
    const members = new Set(); let lastH = 0, stalled = 0;
    const collect = () => {
      if (cancelled) return;
      document.querySelectorAll('a[href*="/user/"], a[href*="/profile.php"], a[role="link"][href*="facebook.com/"][href*="?"]').forEach(el => {
        const href = el.getAttribute('href')||''; const name = el.textContent.trim();
        if (name&&href&&(href.includes('/user/')||href.includes('profile.php')||href.match(/facebook\.com\/(?:profile\.php\?id=\d+|[^/?]+)/))) members.add(JSON.stringify({name,url:href.startsWith('/')?'https://www.facebook.com'+href:href}));
      });
      const cEl = document.getElementById('sp-count'), bar = document.getElementById('sp-bar-fill');
      if (cEl) cEl.textContent = `已扫描: ${members.size}`;
      if (bar) bar.style.width = `${Math.min(members.size*3,95)}%`;
      const sh = document.documentElement.scrollHeight;
      if (sh===lastH) stalled++; else { stalled=0; lastH=sh; }
      if (stalled>=5) {
        const fd = Array.from(members).map(m=>JSON.parse(m));
        if (cEl) cEl.textContent = `✅ 完成: ${fd.length} 个成员`;
        if (bar) bar.style.width = '100%';
        document.querySelector('.sp-close').textContent = '完成 ✓';
        saveGroupScan(fd);
        setTimeout(()=>{if(ov.parentNode)ov.remove();},2500);
        return;
      }
      window.scrollTo(0, sh);
      setTimeout(collect, 1200);
    };
    setTimeout(collect, 500);
  }

  function saveGroupScan(data) {
    const gn = document.querySelector('h1, h2')?.textContent?.trim()?.slice(0,40)||'未知群组';
    const scans = GM_getValue('osint_group_scans', []);
    scans.push({group:gn, url:window.location.href, timestamp:new Date().toISOString(), count:data.length, members:data});
    GM_setValue('osint_group_scans', scans);
    downloadFile(`群组_${gn.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g,'_')}_${Date.now()}.csv`, toCSV(data.map(m=>({name:m.name, url:m.url, group:gn}))), 'text/csv');
  }

  function showPreviousScans() {
    const scans = GM_getValue('osint_group_scans', []);
    const container = document.getElementById('osint-scan-results');
    if (!container) return;
    if (!scans.length) { container.innerHTML = '<div style="color:#8AB4D6;text-align:center;padding:12px;">暂无历史记录</div>'; return; }
    let html = '<div class="field-label" style="margin-bottom:4px;">历史扫描</div>';
    [...scans].reverse().slice(0,10).forEach((s, idx) => {
      const ri = scans.length-1-idx;
      html += `<div class="mutual-friend-item" style="font-size:11px;">
        <span class="mf-name">👥 ${s.group}</span>
        <span style="color:#8AB4D6;font-size:10px;">${s.count} 人 • ${new Date(s.timestamp).toLocaleDateString('zh-CN')}</span>
        <button class="scan-dl-btn" data-idx="${ri}" style="background:none;border:none;color:#87CEEB;cursor:pointer;font-size:11px;">📥</button>
      </div>`;
    });
    container.innerHTML = html;
    container.querySelectorAll('.scan-dl-btn').forEach(btn => {
      btn.onclick = () => {
        const scan = GM_getValue('osint_group_scans', [])[parseInt(btn.dataset.idx,10)];
        if (scan) downloadFile(`群组_${scan.group.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g,'_')}_${Date.now()}.csv`, toCSV(scan.members.map(m=>({name:m.name, url:m.url, group:scan.group}))), 'text/csv');
      };
    });
  }

  // ============================================================
  //  高亮 / 弹窗
  // ============================================================
  function highlightMutualFriends() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while ((node = walker.nextNode())) {
      const t = node.textContent.trim().toLowerCase();
      if (t.includes('mutual friend') && /\d+/.test(t)) {
        const parent = node.parentElement;
        if (parent) {
          const clickable = parent.closest('a, div[role="button"], span[role="button"]') || parent;
          clickable.classList.add('fb-osint-highlight');
          clickable.style.position = 'relative';
          if (!clickable.querySelector('.fb-osint-mf-badge')) {
            const badge = document.createElement('span');
            badge.className = 'fb-osint-mf-badge';
            badge.style.cssText = 'position:absolute;top:-14px;right:0;background:#87CEEB;color:white;padding:1px 8px;border-radius:8px;font-size:10px;z-index:9999;pointer-events:none;';
            badge.textContent = `🤝 ${t.match(/[\d,]+/)?.[0]||''}`;
            clickable.appendChild(badge);
          }
        }
      }
    }
    showStatus('🔦 已高亮显示');
  }

  function showScrapePopup(title, items) {
    const existing = document.querySelector('.fb-osint-popup-scanner');
    if (existing) existing.remove();
    const div = document.createElement('div'); div.className = 'fb-osint-popup-scanner';
    div.innerHTML = `<div class="ps-box"><div class="ps-title">${title} (${items.length})</div>${items.map(i=>`<div class="ps-item">${i}</div>`).join('')}<button class="ps-close">关闭</button></div>`;
    document.body.appendChild(div);
    div.querySelector('.ps-close').onclick = () => div.remove();
    div.addEventListener('click', (e) => { if (e.target===div) div.remove(); });
  }

  // ============================================================
  //  保存 / 导出
  // ============================================================
  function saveProfile(data) {
    const existing = GM_getValue('fb_osint_data', []);
    const idx = existing.findIndex(e=>e.url===data.url);
    const entry = { name:data.name, url:data.url, profileId:data.profileId, uid:data.uid, location:data.location, hometown:data.hometown, work:data.work, education:data.education, relationship:data.relationship, birthday:data.birthday, friends:data.friends, followers:data.followers, bio:data.bio, keywords:data.keywords, mutualFriends:data.mutualFriends, linkedAccounts:data.linkedAccounts, contactInfo:data.contactInfo, commonGroups:data.commonGroups, eventsCount:(data.events||[]).length, photosCount:(data.photos||[]).length, friendSuggestionsCount:(data.friendSuggestions||[]).length, capturedAt:new Date().toISOString() };
    if (idx>=0) existing[idx] = entry; else existing.push(entry);
    GM_setValue('fb_osint_data', existing);
    const history = GM_getValue('fb_osint_history', {});
    if (data.url) { if (!history[data.url]) history[data.url] = []; history[data.url].push({...entry, _snapshotAt:new Date().toISOString()}); if (history[data.url].length>20) history[data.url]=history[data.url].slice(-20); GM_setValue('fb_osint_history', history); }
  }

  function exportJSON() { downloadFile(`FB数据_${Date.now()}.json`, JSON.stringify(GM_getValue('fb_osint_data', []), null, 2), 'application/json'); }
  function exportCSV() {
    const all = GM_getValue('fb_osint_data', []);
    downloadFile(`FB数据_${Date.now()}.csv`, toCSV(all.map(d=>({姓名:d.name||'',UID:d.uid||'',主页:d.url||'',所在地:d.location||'',工作:d.work||'',教育:d.education||'',感情:d.relationship||'',生日:d.birthday||'',好友:d.friends||'',简介:(d.bio||'').slice(0,200),账号:(d.linkedAccounts||[]).map(a=>`${a.platform}:${a.handle}`).join('; '),联系方式:(d.contactInfo||[]).map(c=>`${c.type}:${c.value}`).join('; '),采集时间:d.capturedAt||''}))), 'text/csv');
  }
  function refresh() { const d = scrapeProfile(); if (panelVisible) renderPanel(d); }

  // ============================================================
  //  🌸 记事板
  // ============================================================
  function createNotepad() {
    if (document.getElementById('fb-osint-notepad')) return;
    const tmpls = [
      {name:'🎯 温暖开场', text:'Hey! I know this is random, but I saw your comment on that post and I literally laughed out loud. Anyway — I\'m Olivia, what part of the world are you in? 😊'},
      {name:'🎯 直球搭讪', text:'Okay this is going to sound insane, but I\'m just gonna go for it. I saw your profile and something told me I\'d regret it if I didn\'t say hi. So... hi 🙃 I\'m Olivia.'},
      {name:'🎯 温柔神秘', text:'I know this is out of the blue, but I\'ve been having one of those weeks where you just feel like taking a chance. So... hi. I\'m Olivia. Tell me one good thing about your day? 😊'},
      {name:'❄️ 冷场挽救', text:'Okay I\'ll take the silence as a sign 😂 No pressure. Hope your day gets better ✌️'},
      {name:'🛡️ 被质疑是机器人', text:'😂 I promise I\'m real! Just a regular human who took a shot at messaging a stranger. I can send a voice note if you need proof? 🤷‍♀️'},
      {name:'🛡️ "为什么找我"', text:'Honestly? I just liked your vibe. Your profile gave off normal-human-energy which is surprisingly rare 😂'},
    ];
    const div = document.createElement('div'); div.id = 'fb-osint-notepad';
    div.innerHTML = `
      <div class="note-header" id="note-header">
        <span>📝 聊天记事板</span>
        <span class="note-actions">
          <button id="note-clear-btn" title="清空">🗑️</button>
          <button id="note-close-btn" title="关闭">✕</button>
        </span>
      </div>
      <div class="note-body">
        <div class="note-entries-list" id="note-entries-list">
          ${boardEntries.length===0?'<div style="color:#8AB4D6;text-align:center;padding:16px;">还没有记录<br>在聊天中输入信息后记录在这里</div>':''}
          ${boardEntries.map((e,i)=>`<div class="note-entry"><span><span class="entry-label">[${e.label||'信息'}]</span> ${e.text}</span><button class="entry-del" data-idx="${i}">✕</button></div>`).join('')}
        </div>
      </div>
      <div class="keyword-highlight" id="note-auto-kw">
        <div class="kh-label">🔑 聊天自动检测</div>
        <div class="kh-chips" id="note-auto-chips"></div>
      </div>
      <div class="note-input-area">
        <div class="note-input-row">
          <select id="note-label">
            <option value="信息">信息</option><option value="姓名">姓名</option><option value="位置">位置</option>
            <option value="工作">工作</option><option value="年龄">年龄</option><option value="兴趣">兴趣</option>
            <option value="家庭">家庭</option><option value="联系方式">联系方式</option><option value="线索">⏳ 线索</option>
          </select>
          <input type="text" id="note-input-field" placeholder="记录目标透露的信息...">
          <button id="note-add-btn">+</button>
        </div>
      </div>
      <details class="template-section">
        <summary>💬 话术模板 (点击复制)</summary>
        ${tmpls.map(t=>`<div class="template-item" data-template="${t.text.replace(/"/g,'&quot;')}">${t.name}</div>`).join('')}
      </details>
      <div class="note-export-row">
        <button id="note-export-json">📄 JSON</button>
        <button id="note-export-csv">📊 CSV</button>
        <button id="note-export-clip">📋 复制全部</button>
      </div>`;
    document.body.appendChild(div);

    let dragging = false, sx, sy, ox, oy;
    div.querySelector('.note-header').onmousedown = (e) => { dragging=true; sx=e.clientX; sy=e.clientY; ox=div.offsetLeft; oy=div.offsetTop; };
    document.onmousemove = (e) => { if (!dragging) return; div.style.left=(ox+e.clientX-sx)+'px'; div.style.top=(oy+e.clientY-sy)+'px'; div.style.right='auto'; };
    document.onmouseup = () => { dragging=false; };

    document.getElementById('note-close-btn').onclick = () => div.classList.remove('visible');
    document.getElementById('note-clear-btn').onclick = () => { if (confirm('清空所有记录？')) { boardEntries=[]; persistBoard(); renderNoteList(); }};
    document.getElementById('note-add-btn').onclick = addNoteEntry;
    document.getElementById('note-input-field').onkeydown = (e) => { if (e.key==='Enter') addNoteEntry(); };
    document.getElementById('note-export-json').onclick = () => downloadFile(`聊天记录_${Date.now()}.json`, JSON.stringify(boardEntries,null,2), 'application/json');
    document.getElementById('note-export-csv').onclick = () => downloadFile(`聊天记录_${Date.now()}.csv`, toCSV(boardEntries), 'text/csv');
    document.getElementById('note-export-clip').onclick = () => { const t = boardEntries.map(e=>`[${e.label}] ${e.text}`).join('\n'); if (copyText(t)) { const b=document.getElementById('note-export-clip'); b.textContent='✅'; setTimeout(()=>{b.textContent='📋 复制全部';},1500); }};
    div.querySelectorAll('.template-item').forEach(el => { el.onclick = () => { if (copyText(el.dataset.template)) { el.style.background='#87CEEB'; el.style.color='white'; setTimeout(()=>{el.style.background='rgba(255,255,255,0.6)'; el.style.color='#5BA3C9';},1200); }}; });
    div.addEventListener('click', (e) => { if (e.target.classList.contains('entry-del')) { const idx=parseInt(e.target.dataset.idx,10); boardEntries.splice(idx,1); persistBoard(); renderNoteList(); updateAutoKeywords(); }});
  }

  function renderNoteList() {
    const list = document.getElementById('note-entries-list');
    if (!list) return;
    if (!boardEntries.length) list.innerHTML = '<div style="color:#8AB4D6;text-align:center;padding:16px;">还没有记录</div>';
    else list.innerHTML = boardEntries.map((e,i)=>`<div class="note-entry"><span><span class="entry-label">[${e.label||'信息'}]</span> ${e.text}</span><button class="entry-del" data-idx="${i}">✕</button></div>`).join('');
  }

  function addNoteEntry() {
    const input = document.getElementById('note-input-field');
    const label = document.getElementById('note-label');
    const text = input.value.trim(); if (!text) return;
    boardEntries.push({label:label.value, text, timestamp:new Date().toISOString()});
    persistBoard(); input.value=''; renderNoteList(); updateAutoKeywords();
  }

  function updateAutoKeywords() {
    const chips = document.getElementById('note-auto-chips');
    if (!chips) return;
    const allText = boardEntries.map(e=>e.text).join(' ');
    const found = [];
    const add = (p,v) => { if (v) found.push(`${p} ${v}`); };
    (allText.match(/(?:\+1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g)||[]).forEach(p=>add('📞',p));
    (allText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g)||[]).forEach(e=>add('✉️',e));
    (allText.match(/\b(\d{2})\s*(?:years old|yo|yr|y\/o)\b/gi)||[]).forEach(a=>add('🎂',a));
    const sr = /\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)\b/g;
    let m; while ((m = sr.exec(allText)) !== null) add('📍', m[1]);
    chips.innerHTML = found.length ? found.map(k=>`<span class="keyword-chip">${k}</span>`).join('') : '<span style="color:#8AB4D6;font-size:11px;">暂无检测数据</span>';
  }

  // ============================================================
  //  聊天监控
  // ============================================================
  function startChatMonitor() {
    let lastText = '';
    const pats = [
      {label:'📞 电话', r:/(?:\+1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g},
      {label:'✉️ 邮箱', r:/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g},
      {label:'🎂 年龄', r:/\b(\d{2})\s*(?:years old|yo|yr|y\/o)\b/gi},
      {label:'🏠 地址', r:/\b\d{1,5}\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+,\s*(?:[A-Z][a-z]+\s+)?[A-Z]{2}\s+\d{5}/g},
      {label:'🔗 链接', r:/https?:\/\/[^\s)]+/g},
    ];
    setInterval(() => {
      if (!location.href.includes('/messages/')&&!location.href.includes('/messenger/')) return;
      const msgEls = document.querySelectorAll('[data-pagelet="Messaging"] div[dir="auto"], div.xjyslct div[dir="auto"]');
      const ct = Array.from(msgEls).map(el=>el.textContent.trim()).filter(Boolean).join(' | ');
      if (ct !== lastText) {
        lastText = ct;
        pats.forEach(({label,r}) => {
          let m; while ((m = r.exec(ct)) !== null) {
            if (!boardEntries.some(e=>e.text===m[0])) { boardEntries.push({label:'auto-'+label, text:m[0], timestamp:new Date().toISOString()}); persistBoard(); renderNoteList(); updateAutoKeywords(); }
          }
        });
      }
    }, 3000);
  }

  // ============================================================
  //  浮动按钮
  // ============================================================
  function createFloatBtn() {
    if (document.querySelector('.fb-osint-float-btn')) return;
    const btn = document.createElement('button'); btn.className = 'fb-osint-float-btn'; btn.textContent = '🌸';
    btn.title = '点击打开面板 | Ctrl+点击打开记事板';
    btn.onclick = (e) => {
      if (e.ctrlKey||e.metaKey) { toggleNotepad(); return; }
      const p = document.getElementById('fb-osint-panel');
      if (p) { p.remove(); panelVisible=false; return; }
      renderPanel(scrapeProfile());
    };
    document.body.appendChild(btn);
  }

  function showNotepad() { const el = document.getElementById('fb-osint-notepad'); if (!el) { createNotepad(); setTimeout(showNotepad,100); return; } el.classList.add('visible'); updateAutoKeywords(); }
  function hideNotepad() { const el = document.getElementById('fb-osint-notepad'); if (el) el.classList.remove('visible'); }
  function toggleNotepad() { const el = document.getElementById('fb-osint-notepad'); if (!el) { createNotepad(); setTimeout(toggleNotepad,100); } else el.classList.toggle('visible'); }

  // ============================================================
  //  快捷键
  // ============================================================
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey&&e.shiftKey&&e.key==='P') { e.preventDefault(); const p=document.getElementById('fb-osint-panel'); if (p) { p.remove(); panelVisible=false; } else renderPanel(scrapeProfile()); }
    if (e.ctrlKey&&e.shiftKey&&e.key==='N') { e.preventDefault(); toggleNotepad(); }
  });

  // ============================================================
  //  事件委托
  // ============================================================
  document.addEventListener('click', (e) => {
    const t = e.target;
    if (t.classList.contains('pivot-btn')) openURL(t.dataset.url);
    if (t.id==='osint-scan-group') scanGroupMembers();
    if (t.id==='osint-scan-group-history') showPreviousScans();
    if (t.id==='osint-highlight-mutual') highlightMutualFriends();
    if (t.id==='osint-expand-mutual') tryExpandMutualFriends();
    if (t.id==='osint-goto-changes') { e.preventDefault(); const btn = document.querySelector('#fb-osint-panel button[data-tab="changes"]'); if (btn) btn.click(); }
    if (t.classList.contains('keyword-chip')) { const text = t.dataset.kw||t.textContent.trim(); if (copyText(text)) { t.style.background='#87CEEB'; t.style.color='white'; setTimeout(()=>{t.style.background='rgba(135,206,235,0.15)'; t.style.color='#5BA3C9';},1000); }}
    if (t.id==='osint-dl-avatar') { const img = document.getElementById('osint-avatar-img'); if (img) { const name = document.querySelector('.profile-name')?.textContent?.trim()||'头像'; downloadAvatar(img.src, name); }}
    if (t.id==='osint-ri-google') { const img = document.getElementById('osint-avatar-img'); if (img) reverseImageSearch(img.src, 'google'); }
    if (t.id==='osint-ri-tineye') { const img = document.getElementById('osint-avatar-img'); if (img) reverseImageSearch(img.src, 'tineye'); }
    if (t.id==='osint-ri-yandex') { const img = document.getElementById('osint-avatar-img'); if (img) reverseImageSearch(img.src, 'yandex'); }
  });

  function downloadAvatar(url, name) {
    const img = new Image(); img.crossOrigin = 'anonymous';
    img.onload = () => { const c = document.createElement('canvas'); c.width=img.naturalWidth; c.height=img.naturalHeight; c.getContext('2d').drawImage(img,0,0); const a = document.createElement('a'); a.download = `${name}_${Date.now()}.jpg`; a.href=c.toDataURL('image/jpeg',0.92); a.click(); };
    img.onerror = () => { GM_xmlhttpRequest({method:'GET', url, responseType:'blob', onload:(resp)=>{const a=document.createElement('a'); a.href=URL.createObjectURL(resp.response); a.download=`${name}_${Date.now()}.jpg`; a.click();}, onerror:()=>showStatus('❌ 下载失败')}); };
    img.src = url;
  }

  function reverseImageSearch(url, engine) {
    const u = {google:`https://lens.google.com/uploadbyurl?url=${encodeURIComponent(url)}`, tineye:`https://tineye.com/search?url=${encodeURIComponent(url)}`, yandex:`https://yandex.com/images/search?rpt=imageview&url=${encodeURIComponent(url)}`};
    openURL(u[engine]||u.google);
  }

  // ============================================================
  //  初始化
  // ============================================================
  function init() {
    setTimeout(createFloatBtn, 1500);
    setTimeout(createNotepad, 2000);
    setTimeout(startChatMonitor, 3000);

    let lastUrl = location.href;
    const observer = new MutationObserver(() => {
      const cur = location.href;
      if (cur !== lastUrl) {
        lastUrl = cur;
        setTimeout(() => {
          if (cur.match(/facebook\.com\/(?:[^/?]+\/?|profile\.php)/) && !cur.includes('messages/') && panelVisible) renderPanel(scrapeProfile());
        }, 2000);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    if (window.location.href.match(/facebook\.com\/(?:[^/?]+\/?|profile\.php)/) && !window.location.href.includes('messages/')) {
      setTimeout(() => { const d = scrapeProfile(); if (d.name || d.location) renderPanel(d); }, 2500);
    }

    console.log('🌸 FB 信息助手 v4.1 — By.阿趣 🎀');
    console.log('📌 Ctrl+Shift+P → 打开面板 | Ctrl+Shift+N → 打开记事板');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
