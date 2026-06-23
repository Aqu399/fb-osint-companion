// ==UserScript==
// @name         FB OSINT Companion Pro
// @namespace    https://github.com/c0d3
// @version      4.0
// @description  FB 信息收集工具 — 授权渗透测试专用 | UID·GraphAPI·重叠好友展开·共同群组·照片扫描·变更追踪·PYMK·联系方式·活动
// @author       c0d3
// @match        https://www.facebook.com/*
// @match        https://mbasic.facebook.com/*
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
  //  STYLES
  // ============================================================
  const styles = `
    #fb-osint-panel {
      position: fixed; bottom: 20px; right: 20px;
      width: 390px; max-height: 90vh;
      background: #1c1e21; color: #e4e6eb;
      border: 1px solid #3e4042; border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.6);
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
      overflow: hidden;
      display: flex; flex-direction: column;
      transition: transform 0.25s ease, opacity 0.25s ease;
    }
    #fb-osint-panel.collapsed { transform: translateY(calc(100% - 40px)); }
    #fb-osint-panel.collapsed .panel-body { display: none; }
    #fb-osint-panel .panel-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 12px; background: #242526;
      border-bottom: 1px solid #3e4042; cursor: pointer; user-select: none;
    }
    #fb-osint-panel .panel-header .panel-title { font-weight: 600; font-size: 13px; letter-spacing: 0.3px; }
    #fb-osint-panel .panel-header .panel-actions button {
      background: none; border: none; color: #b0b3b8;
      cursor: pointer; font-size: 16px; margin-left: 6px; padding: 2px 6px; border-radius: 4px;
    }
    #fb-osint-panel .panel-header .panel-actions button:hover { background: #3e4042; }
    #fb-osint-panel .panel-body { overflow-y: auto; padding: 10px 12px; flex: 1; }
    #fb-osint-panel .field-group { margin-bottom: 8px; }
    #fb-osint-panel .field-group .field-label {
      font-size: 11px; color: #8a8d91; text-transform: uppercase;
      letter-spacing: 0.5px; margin-bottom: 2px;
    }
    #fb-osint-panel .field-group .field-value {
      display: flex; align-items: center; justify-content: space-between;
      background: #242526; padding: 5px 8px; border-radius: 6px; word-break: break-word;
    }
    #fb-osint-panel .field-group .field-value .copy-btn {
      background: none; border: none; color: #8a8d91;
      cursor: pointer; font-size: 14px; flex-shrink: 0; margin-left: 6px;
      padding: 2px 6px; border-radius: 4px;
    }
    #fb-osint-panel .field-group .field-value .copy-btn:hover { background: #3e4042; }
    #fb-osint-panel .field-group .field-value .copy-btn.copied { color: #2ecc71; }
    #fb-osint-panel .profile-avatar {
      width: 56px; height: 56px; border-radius: 50%;
      object-fit: cover; margin-bottom: 6px; cursor: pointer;
      border: 2px solid #3e4042; transition: border-color 0.2s;
    }
    #fb-osint-panel .profile-avatar:hover { border-color: #2d88ff; }
    #fb-osint-panel .profile-name { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
    #fb-osint-panel .avatar-actions {
      display: flex; gap: 4px; margin-bottom: 8px; flex-wrap: wrap;
    }
    #fb-osint-panel .avatar-actions button {
      background: #242526; border: 1px solid #3e4042; border-radius: 6px;
      color: #e4e6eb; cursor: pointer; font-size: 10px; padding: 3px 8px;
    }
    #fb-osint-panel .avatar-actions button:hover { background: #3e4042; }
    #fb-osint-panel .tab-bar {
      display: flex; gap: 4px; margin-bottom: 8px;
      border-bottom: 1px solid #3e4042; padding-bottom: 6px; flex-wrap: wrap;
    }
    #fb-osint-panel .tab-bar button {
      background: none; border: none; color: #8a8d91; cursor: pointer;
      padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600;
    }
    #fb-osint-panel .tab-bar button.active { background: #2d88ff; color: white; }
    #fb-osint-panel .tab-bar button:hover:not(.active) { background: #3e4042; }
    #fb-osint-panel .keyword-chip {
      display: inline-block; background: #2d88ff22; border: 1px solid #2d88ff44;
      color: #8ab4f8; padding: 2px 8px; border-radius: 12px; font-size: 11px;
      margin: 2px 3px; cursor: pointer;
    }
    #fb-osint-panel .keyword-chip:hover { background: #2d88ff44; }
    #fb-osint-panel .keyword-chip.changed { background: #f1c40f22; border-color: #f1c40f; color: #f1c40f; }
    #fb-osint-panel .mutual-friend-item {
      display: flex; align-items: center; gap: 6px;
      padding: 4px 6px; background: #242526; border-radius: 6px; margin-bottom: 4px;
    }
    #fb-osint-panel .mutual-friend-item img {
      width: 28px; height: 28px; border-radius: 50%; object-fit: cover;
    }
    #fb-osint-panel .mutual-friend-item .mf-name { font-size: 12px; flex: 1; }
    #fb-osint-panel .mutual-friend-item .mf-link { font-size: 10px; color: #2d88ff; text-decoration: none; }
    #fb-osint-panel .osint-pivot-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-top: 6px;
    }
    #fb-osint-panel .osint-pivot-grid button {
      background: #242526; border: 1px solid #3e4042; border-radius: 6px;
      color: #e4e6eb; cursor: pointer; font-size: 10px; padding: 4px 4px;
      text-align: center; word-break: break-word;
    }
    #fb-osint-panel .osint-pivot-grid button:hover { background: #3e4042; border-color: #2d88ff; }
    #fb-osint-panel .timeline-item {
      font-size: 11px; padding: 4px 6px; background: #242526;
      border-radius: 4px; margin-bottom: 3px; word-break: break-word;
    }
    #fb-osint-panel .timeline-item .tl-time { color: #8a8d91; font-size: 10px; }
    #fb-osint-panel .timeline-item .tl-loc { color: #2ecc71; font-size: 10px; }
    #fb-osint-panel .change-badge {
      display: inline-block; background: #f1c40f33; color: #f1c40f;
      font-size: 9px; padding: 1px 6px; border-radius: 8px; margin-left: 4px;
    }
    #fb-osint-panel .photo-item {
      font-size: 11px; padding: 4px 6px; background: #242526;
      border-radius: 4px; margin-bottom: 3px; word-break: break-word;
    }
    #fb-osint-panel .photo-item .ph-date { color: #8a8d91; font-size: 10px; }
    #fb-osint-panel .photo-item .ph-loc { color: #9b59b6; font-size: 10px; }
    #fb-osint-panel .contact-item {
      display: flex; align-items: center; gap: 6px;
      padding: 4px 6px; background: #242526; border-radius: 6px; margin-bottom: 4px;
    }
    #fb-osint-panel .event-item {
      font-size: 11px; padding: 4px 6px; background: #242526;
      border-radius: 4px; margin-bottom: 3px; word-break: break-word;
    }
    #fb-osint-panel .event-item .ev-date { color: #8a8d91; font-size: 10px; }
    #fb-osint-panel .event-item .ev-loc { color: #e67e22; font-size: 10px; }
    #fb-osint-panel .export-row {
      display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap;
    }
    #fb-osint-panel .export-row button {
      flex: 1; padding: 6px 4px; border: 1px solid #3e4042; border-radius: 6px;
      background: #242526; color: #e4e6eb; cursor: pointer; font-size: 11px; min-width: 50px;
    }
    #fb-osint-panel .export-row button:hover { background: #3e4042; }
    #fb-osint-panel .status-line {
      font-size: 11px; color: #8a8d91; text-align: center;
      padding: 6px 0 0; border-top: 1px solid #3e4042; margin-top: 6px;
    }
    #fb-osint-panel .expandable {
      font-size: 11px; color: #2d88ff; cursor: pointer; text-decoration: underline;
    }

    /* Notepad */
    #fb-osint-notepad {
      position: fixed; top: 80px; right: 20px;
      width: 320px; max-height: 520px;
      background: #1c1e21; color: #e4e6eb;
      border: 1px solid #3e4042; border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.6);
      z-index: 999998;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 12px;
      display: none; flex-direction: column;
    }
    #fb-osint-notepad.visible { display: flex; }
    #fb-osint-notepad .note-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 8px 10px; background: #242526; border-bottom: 1px solid #3e4042;
      border-radius: 12px 12px 0 0; cursor: move;
    }
    #fb-osint-notepad .note-header span { font-weight: 600; font-size: 12px; }
    #fb-osint-notepad .note-header .note-actions { display: flex; gap: 4px; }
    #fb-osint-notepad .note-header .note-actions button {
      background: none; border: none; color: #b0b3b8; cursor: pointer; font-size: 14px; padding: 2px 6px;
    }
    #fb-osint-notepad .note-header .note-actions button:hover { background: #3e4042; border-radius: 4px; }
    #fb-osint-notepad .note-body { padding: 8px 10px; max-height: 280px; overflow-y: auto; flex: 1; }
    #fb-osint-notepad .note-entry {
      background: #242526; padding: 5px 8px; margin-bottom: 4px; border-radius: 6px;
      font-size: 11px; word-break: break-word; display: flex; justify-content: space-between; align-items: flex-start;
    }
    #fb-osint-notepad .note-entry .entry-label { color: #2d88ff; font-weight: 600; margin-right: 4px; }
    #fb-osint-notepad .note-entry .entry-del { background: none; border: none; color: #e74c3c; cursor: pointer; font-size: 12px; padding: 0 2px; }
    #fb-osint-notepad .note-input-area {
      display: flex; flex-direction: column; gap: 4px;
      padding: 6px 10px; border-top: 1px solid #3e4042;
    }
    #fb-osint-notepad .note-input-row { display: flex; gap: 4px; }
    #fb-osint-notepad .note-input-row select {
      background: #242526; border: 1px solid #3e4042; border-radius: 4px;
      color: #e4e6eb; padding: 3px 4px; font-size: 11px;
    }
    #fb-osint-notepad .note-input-row input[type="text"] {
      flex: 1; background: #242526; border: 1px solid #3e4042; border-radius: 4px;
      color: #e4e6eb; padding: 3px 6px; font-size: 12px;
    }
    #fb-osint-notepad .note-input-row button {
      background: #2d88ff; border: none; color: white; border-radius: 4px;
      cursor: pointer; padding: 3px 12px; font-size: 11px;
    }
    #fb-osint-notepad .note-input-row button:hover { background: #1a6fdc; }
    #fb-osint-notepad .note-export-row {
      display: flex; gap: 4px; padding: 4px 10px 6px; border-top: 1px solid #3e4042;
    }
    #fb-osint-notepad .note-export-row button {
      flex: 1; background: #242526; border: 1px solid #3e4042; border-radius: 4px;
      color: #e4e6eb; cursor: pointer; font-size: 10px; padding: 3px;
    }
    #fb-osint-notepad .note-export-row button:hover { background: #3e4042; }
    #fb-osint-notepad .keyword-highlight {
      background: #2d88ff22; margin: 4px 10px 0; padding: 4px 6px; border-radius: 6px;
    }
    #fb-osint-notepad .keyword-highlight .kh-label { font-size: 10px; color: #8a8d91; margin-bottom: 2px; }
    #fb-osint-notepad .keyword-highlight .kh-chips { display: flex; flex-wrap: wrap; gap: 2px; }
    #fb-osint-notepad .template-section {
      padding: 6px 10px; border-top: 1px solid #3e4042;
    }
    #fb-osint-notepad .template-section summary {
      font-size: 11px; color: #8a8d91; cursor: pointer; font-weight: 600;
    }
    #fb-osint-notepad .template-item {
      font-size: 10px; padding: 4px 6px; background: #242526;
      border-radius: 4px; margin: 3px 0; cursor: pointer;
      color: #b0b3b8; word-break: break-word;
    }
    #fb-osint-notepad .template-item:hover { background: #3e4042; color: #e4e6eb; }

    /* Float button */
    .fb-osint-float-btn {
      position: fixed; bottom: 80px; right: 20px;
      width: 40px; height: 40px;
      background: #2d88ff; color: white;
      border: none; border-radius: 50%;
      font-size: 20px; cursor: pointer; z-index: 999999;
      box-shadow: 0 4px 12px rgba(45,136,255,0.4);
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.15s;
    }
    .fb-osint-float-btn:hover { transform: scale(1.1); background: #1a6fdc; }
    .fb-osint-float-btn.has-changes::after {
      content: '';
      position: absolute; top: -2px; right: -2px;
      width: 12px; height: 12px; background: #f1c40f;
      border-radius: 50%; border: 2px solid #1c1e21;
    }

    .fb-osint-highlight { box-shadow: 0 0 0 2px #2d88ff, 0 0 8px rgba(45,136,255,0.3) !important; border-radius: 4px; }

    #fb-osint-scanner-progress {
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: #1c1e21; color: #e4e6eb;
      border: 1px solid #3e4042; border-radius: 12px;
      padding: 20px 30px; z-index: 9999999;
      text-align: center; min-width: 320px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.8);
    }
    #fb-osint-scanner-progress .sp-title { font-weight: 600; font-size: 14px; margin-bottom: 8px; }
    #fb-osint-scanner-progress .sp-count { font-size: 12px; color: #8a8d91; margin-bottom: 8px; }
    #fb-osint-scanner-progress .sp-bar-bg {
      width: 100%; height: 6px; background: #3e4042; border-radius: 3px; overflow: hidden;
    }
    #fb-osint-scanner-progress .sp-bar-fill {
      height: 100%; background: #2d88ff; border-radius: 3px; transition: width 0.3s;
    }
    #fb-osint-scanner-progress .sp-close {
      margin-top: 10px; background: #3e4042; border: none; color: #e4e6eb;
      padding: 4px 16px; border-radius: 6px; cursor: pointer; font-size: 12px;
    }

    .fb-osint-popup-scanner {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.6); z-index: 9999998;
      display: flex; align-items: center; justify-content: center;
    }
    .fb-osint-popup-scanner .ps-box {
      background: #1c1e21; color: #e4e6eb; border-radius: 12px;
      padding: 20px; max-width: 400px; width: 90%; max-height: 80vh; overflow-y: auto;
    }
    .fb-osint-popup-scanner .ps-box .ps-title { font-weight: 600; margin-bottom: 10px; }
    .fb-osint-popup-scanner .ps-box .ps-item {
      font-size: 11px; padding: 4px 6px; border-radius: 4px; background: #242526; margin-bottom: 3px;
    }
    .fb-osint-popup-scanner .ps-box .ps-close {
      margin-top: 10px; background: #3e4042; border: none; color: #e4e6eb;
      padding: 6px 20px; border-radius: 6px; cursor: pointer;
    }
  `;
  GM_addStyle(styles);

  // ============================================================
  //  STATE
  // ============================================================
  let panelVisible = false;
  let activeTab = 'profile';
  let boardEntries = GM_getValue('osint_board_entries', []);

  // ============================================================
  //  UTILITIES
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
    if (el) { el.textContent = msg; setTimeout(() => { if (el) el.textContent = '✔ Ready'; }, 2500); }
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

  function openURL(url) {
    const a = document.createElement('a'); a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.click();
  }

  // ============================================================
  //  FB UID EXTRACTION
  // ============================================================
  function extractFBUID() {
    // Method 1: From the page source meta tags
    const metaEl = document.querySelector('meta[property="al:android:url"], meta[property="al:ios:url"]');
    if (metaEl) {
      const content = metaEl.getAttribute('content') || '';
      const idMatch = content.match(/id=(\d+)/) || content.match(/user_id=(\d+)/);
      if (idMatch) return idMatch[1];
    }

    // Method 2: From FB app links
    const appLink = document.querySelector('link[rel="alternate"][href*="fb://"]');
    if (appLink) {
      const href = appLink.getAttribute('href') || '';
      const idMatch = href.match(/profile\/(\d+)/) || href.match(/id=(\d+)/);
      if (idMatch) return idMatch[1];
    }

    // Method 3: From stories/media URLs containing UID
    const imgs = document.querySelectorAll('img[src*="scontent"], img[src*="fbcdn"]');
    for (const img of imgs) {
      const src = img.src || '';
      // FB CDN URLs often contain the UID: /v/t1.0-9/12345_67890_...
      const uidMatch = src.match(/\/(\d+)_\d+_\d+_n\.jpg/) || src.match(/\/p(\d+)_/);
      if (uidMatch) return uidMatch[1];
    }

    // Method 4: From profile picture URLs (most reliable)
    const avi = document.querySelector('img.x1b0d499, image[alt*="profile"]');
    if (avi) {
      const src = avi.getAttribute('xlink:href') || avi.src || '';
      const uidMatch = src.match(/\/p(\d+)_/) || src.match(/\/v\/[^/]+\/(\d+)_/);
      if (uidMatch) return uidMatch[1];
    }

    // Method 5: From page source script data
    const scripts = document.querySelectorAll('script[type="application/json"], script[data-content]');
    for (const s of scripts) {
      const text = s.textContent || '';
      const uidMatch = text.match(/"uid":(\d+)/) || text.match(/"userID":(\d+)/i) || text.match(/"profile_id":(\d+)/i);
      if (uidMatch) return uidMatch[1];
    }

    // Method 6: Graph API from page name
    if (window.location.pathname) {
      const profileId = window.location.pathname.split('/').filter(Boolean)[0];
      if (profileId && !['messages','groups','photos','videos','watch','marketplace','friends','events','settings','notifications','stories'].includes(profileId)) {
        // Could be username or UID
        // Try fetching via graph API in background
        return `username:${profileId}`;
      }
    }

    return '';
  }

  // ============================================================
  //  PROFILE SCRAPE
  // ============================================================
  function scrapeProfile() {
    const data = {};
    const url = window.location.href;

    // Name
    const nameSel = ['h1 span','h1','[data-pagelet="Profile"] h1','span.xdj266r span.x1jchvi3','h2.x1heor9g'];
    for (const sel of nameSel) {
      const el = document.querySelector(sel);
      if (el && el.textContent.trim().length > 2) { data.name = el.textContent.trim(); break; }
    }

    // Avatar
    const avSel = ['img.x1b0d499.x1dofw5p','image[alt*="profile"]','circle image','img.x1rg5ohu'];
    for (const sel of avSel) {
      const el = document.querySelector(sel);
      if (el) {
        let src = el.getAttribute('xlink:href') || el.src || '';
        src = src.replace(/\/[ps]\d+x\d+\//, '/p960x960/');
        data.avatarUrl = src; break;
      }
    }

    // UID
    data.uid = extractFBUID();

    // Structured fields
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

    // Friends
    const fc = document.body.innerText.match(/([\d,]+)\s*(?:friends?|mutual friends?)/i);
    if (fc) data.friends = fc[1];

    // Birthday
    const bdMatch = document.body.innerText.match(/Birthday\s*:?\s*(\w+\s+\d{1,2}(?:,\s*\d{4})?)/i);
    if (bdMatch) data.birthday = bdMatch[1];

    // Followers
    const folMatch = document.body.innerText.match(/([\d,.KkMmbB]+)\s*(?:follower|followers)/i);
    if (folMatch) data.followers = folMatch[1];

    // Bio
    const bioCandidates = document.querySelectorAll('[data-pagelet="Profile"] p, div.x1n2onr6 > div > span > span > span');
    for (const el of bioCandidates) {
      const t = el.textContent.trim();
      if (t.length > 15 && t.length < 500 && !t.startsWith('Lives in') && !t.startsWith('Works at') && !t.startsWith('From') && !t.startsWith('Studied') && !t.startsWith('Went to')) {
        data.bio = t; break;
      }
    }

    data.url = url;
    data.profileId = url.match(/facebook\.com\/([^/?]+)/)?.[1] || '';

    // Extended
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

  // ============================================================
  //  KEYWORDS
  // ============================================================
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
    (combined.match(/\b\d{5}(?:-\d{4})?\b/g) || []).forEach(z => { const n = parseInt(z, 10); if (n >= 10000 && n <= 99999) add('📮', z); });
    if (data.bio) {
      const stopWords = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','from','is','am','are','was','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','shall','can','need','dare','ought','used','this','that','these','those','i','my','me','we','our','you','your','he','him','his','she','her','it','its','they','them','their','not','no','nor','so','if','as','up','out','about','who','what','when','where','why','how','all','each','every','both','few','more','most','some','any','none','just','also','very','too','really','here','there','now','then','only','own','same','like']);
      const words = data.bio.toLowerCase().replace(/[^a-z\s-]/g, '').split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w));
      const freq = {}; words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
      Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10).forEach(([word]) => add('🏷️', word));
    }
    return keywords;
  }

  // ============================================================
  //  MUTUAL FRIENDS
  // ============================================================
  function extractMutualFriends() {
    const results = [];
    const allElements = document.querySelectorAll('span, div, a');
    for (const el of allElements) {
      const t = el.textContent.trim().toLowerCase();
      if (t.includes('mutual friend') || t.includes('mutual friends')) {
        const link = el.closest('a') || el.querySelector('a');
        if (link) {
          const href = link.getAttribute('href') || '';
          const parent = el.closest('div[class*="x"], div[data-pagelet]');
          const avatars = parent ? parent.querySelectorAll('img.x1b0d499, img[decoding="async"]') : [];
          results.push({
            text: el.textContent.trim(),
            url: href.startsWith('/') ? 'https://www.facebook.com' + href : href,
            count: parseInt(t.match(/(\d+)/)?.[1] || 0, 10),
            avatars: Array.from(avatars).slice(0, 4).map(a => a.src || a.getAttribute('xlink:href') || '')
          });
        }
      }
    }
    const mt = document.body.innerText.match(/(?:Mutual|mutual friends?)\s*[:,]\s*([^.\n]+)/);
    if (mt) {
      mt[1].split(',').map(n => n.trim()).filter(n => n.length > 0 && !n.match(/^\d+\s*more$/)).forEach(name => {
        if (!results.find(r => r.text.includes(name))) results.push({ text: name, url: '', count: 0, avatars: [] });
      });
    }
    return results;
  }

  // ============================================================
  //  MUTUAL FRIENDS — Expand popup scraper
  // ============================================================
  function tryExpandMutualFriends() {
    // Find the clickable "X mutual friends" link and click it
    const allEls = document.querySelectorAll('a, span[role="button"]');
    for (const el of allEls) {
      const t = el.textContent.trim().toLowerCase();
      if (t.match(/^\d+/) && t.includes('mutual friend')) {
        el.click();
        // Wait for popup
        setTimeout(() => {
          scrapeMutualFriendsPopup();
        }, 1500);
        return;
      }
    }
    showStatus('No clickable mutual friends link found');
  }

  function scrapeMutualFriendsPopup() {
    // FB shows mutual friends in a popup layer
    // Look for the popup/overlay with names
    setTimeout(() => {
      // The popup might be in a specific container
      const popupItems = document.querySelectorAll(
        'div[role="dialog"] a[href*="/user/"], div[role="dialog"] a[href*="profile.php"], ' +
        'div[role="dialog"] span[dir="auto"] a, div[role="dialog"] div[class*="x1n2onr6"] span a'
      );
      const names = new Set();
      popupItems.forEach(el => {
        const name = el.textContent.trim();
        const href = el.getAttribute('href') || '';
        if (name && href && name.length > 1 && !name.match(/^\d+$/)) {
          const fullUrl = href.startsWith('/') ? 'https://www.facebook.com' + href : href;
          names.add(JSON.stringify({ name, url: fullUrl }));
        }
      });

      if (names.size > 0) {
        const data = Array.from(names).map(n => JSON.parse(n));
        const csv = toCSV(data);
        downloadFile(`mutual_friends_${Date.now()}.csv`, csv, 'text/csv');
        showStatus(`✅ Collected ${data.length} mutual friends`);

        // Show popup
        showScrapePopup('🤝 Mutual Friends', data.map(d => `${d.name} — ${d.url}`));
      } else {
        showStatus('No names found in popup');
      }

      // Close popup by pressing Escape
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    }, 2000);
  }

  // ============================================================
  //  TIMELINE POSTS
  // ============================================================
  function extractTimelinePosts() {
    const posts = [];
    const textEls = document.querySelectorAll('[data-pagelet="ProfileTimeline"] div[dir="auto"], [data-pagelet="Profile"] div[dir="auto"]');
    const seen = new Set();
    textEls.forEach(el => {
      const text = el.textContent.trim();
      if (text.length < 5 || text.length > 500 || seen.has(text)) return;
      seen.add(text);
      const skip = ['Lives in','Works at','Studied at','Went to','From','Add Friend','Message','Following','Suggestions','More','See more','Story','Photo','Video'];
      for (const s of skip) { if (text.startsWith(s)) return; }
      let location = '';
      const locMatch = text.match(/(?:at|in)\s+([A-Z][A-Za-z\s,]+?)(?:\.|!|\?|$)/);
      if (locMatch && locMatch[1].length < 30) location = locMatch[1].trim();
      const timestamp = el.closest('[data-pagelet]')?.querySelector('a[href*="story"], a[href*="posts"]')?.textContent?.trim() || '';
      posts.push({ text: text.slice(0, 150), location, timestamp });
    });
    return posts.slice(0, 30);
  }

  // ============================================================
  //  LINKED ACCOUNTS
  // ============================================================
  function extractLinkedAccounts() {
    const accounts = [];
    const pt = document.body.innerText;
    const patterns = [
      { platform: 'Instagram', regex: /instagram\.com\/([a-zA-Z0-9_.]+)/i, url: h => `https://instagram.com/${h}` },
      { platform: 'Twitter/X', regex: /(?:twitter|x)\.com\/([a-zA-Z0-9_]+)/i, url: h => `https://x.com/${h}` },
      { platform: 'LinkedIn', regex: /linkedin\.com\/in\/([a-zA-Z0-9-]+)/i, url: h => `https://linkedin.com/in/${h}` },
      { platform: 'GitHub', regex: /github\.com\/([a-zA-Z0-9-]+)/i, url: h => `https://github.com/${h}` },
      { platform: 'YouTube', regex: /youtube\.com\/@([a-zA-Z0-9_-]+)/i, url: h => `https://youtube.com/@${h}` },
      { platform: 'TikTok', regex: /tiktok\.com\/@([a-zA-Z0-9_.]+)/i, url: h => `https://tiktok.com/@${h}` },
      { platform: 'Snapchat', regex: /snapchat\.com\/add\/([a-zA-Z0-9_-]+)/i, url: h => `https://snapchat.com/add/${h}` },
    ];
    patterns.forEach(({ platform, regex, url }) => {
      const match = pt.match(regex);
      if (match) accounts.push({ platform, handle: match[1], url: url(match[1]) });
    });
    return accounts;
  }

  // ============================================================
  //  CONTACT INFO — WhatsApp, Phone, Website
  // ============================================================
  function extractContactInfo() {
    const contacts = [];
    const pt = document.body.innerText;

    // WhatsApp
    const waMatch = pt.match(/(?:whatsapp|wa\.me|wa\.link)\s*(?::|is)?\s*(?:\+?1?\d{10,})/i);
    if (waMatch) contacts.push({ type: 'WhatsApp', value: waMatch[0].replace(/^(?:whatsapp|wa\.me|wa\.link)\s*(?::|is)?\s*/i, '').trim() });

    // Explicit phone in contact sections
    const phoneInContact = document.body.innerHTML.match(/<span[^>]*>Phone[^<]*<\/span>[^<]*<[^>]*>([^<]+)/i);
    if (phoneInContact) contacts.push({ type: 'Phone (Contact Info)', value: phoneInContact[1].trim() });

    // Website in contact info
    const siteMatch = document.body.innerHTML.match(/<span[^>]*>Website[^<]*<\/span>[^<]*<[^>]*>([^<]+)/i);
    if (siteMatch) contacts.push({ type: 'Website', value: siteMatch[1].trim() });

    // Email from contact info section
    const emailMatch = document.body.innerHTML.match(/<span[^>]*>Email[^<]*<\/span>[^<]*<[^>]*>([^<]+)/i);
    if (emailMatch) contacts.push({ type: 'Email (Contact Info)', value: emailMatch[1].trim() });

    return contacts;
  }

  // ============================================================
  //  COMMON GROUPS
  // ============================================================
  function extractCommonGroups() {
    const groups = [];
    const allEls = document.querySelectorAll('span, div, a');
    for (const el of allEls) {
      const t = el.textContent.trim().toLowerCase();
      if (t.includes('groups in common') || (t.includes('common') && t.includes('group'))) {
        const link = el.closest('a') || el.querySelector('a');
        groups.push({
          text: el.textContent.trim(),
          url: link ? (link.getAttribute('href')?.startsWith('/') ? 'https://www.facebook.com' + link.getAttribute('href') : link.getAttribute('href') || '') : ''
        });
      }
    }
    return groups;
  }

  // ============================================================
  //  EVENTS
  // ============================================================
  function extractEvents() {
    const events = [];
    const eventEls = document.querySelectorAll(
      '[data-pagelet="ProfileEvents"] div[dir="auto"], ' +
      'div[data-pagelet] a[href*="/events/"]:not([href*="/events/create"])'
    );
    const seen = new Set();
    eventEls.forEach(el => {
      const text = el.textContent.trim();
      if (text.length < 3 || seen.has(text)) return;
      seen.add(text);
      // Extract date
      const dateMatch = text.match(/\b(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}(?:,?\s*\d{4})?\b/i);
      const locMatch = text.match(/(?:at|in)\s+([A-Z][A-Za-z\s,]+?)(?:\.|!|\?|$)/);
      const href = el.closest('a')?.getAttribute('href') || '';
      events.push({
        name: text.slice(0, 80),
        date: dateMatch ? dateMatch[0] : '',
        location: locMatch ? locMatch[1].trim() : '',
        url: href.startsWith('/') ? 'https://www.facebook.com' + href : href
      });
    });
    return events.slice(0, 20);
  }

  // ============================================================
  //  PHOTOS — Extract dates and locations
  // ============================================================
  function extractPhotos() {
    const photos = [];
    const photoEls = document.querySelectorAll(
      'a[href*="/photos/"]:not([href*="/albums/"]):not([href*="/upload"]), ' +
      'div[data-pagelet="ProfilePhotos"] a, ' +
      'a[href*="photo.php"]'
    );
    const seen = new Set();
    photoEls.forEach(el => {
      const text = el.textContent.trim();
      const href = el.getAttribute('href') || '';
      const img = el.querySelector('img');
      const imgSrc = img ? (img.src || '') : '';

      // Date from nearby text
      const parentText = el.closest('div[class*="x"], div[data-pagelet]')?.textContent?.trim() || '';
      const dateMatch = parentText.match(/\b(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}(?:,?\s*\d{4})?\b/i);

      const photoData = { text: text || '(photo)', date: dateMatch ? dateMatch[0] : '', url: href, imgSrc: imgSrc.slice(0, 100) };
      const key = photoData.url || photoData.imgSrc;
      if (key && !seen.has(key)) {
        seen.add(key);
        photos.push(photoData);
      }
    });
    return photos.slice(0, 30);
  }

  // ============================================================
  //  FRIEND SUGGESTIONS (PYMK)
  // ============================================================
  function extractFriendSuggestions() {
    const suggestions = [];
    const pymkEls = document.querySelectorAll(
      'div[data-pagelet="Profile"] div[class*="x1n2onr6"] a[href*="facebook.com/"]:not([href*="groups/"]):not([href*="photos/"]):not([href*="messages/"])',
      'a[aria-label*="Add Friend"], ' +
      'a[role="button"][href*="facebook.com/"]'
    );
    const seen = new Set();
    pymkEls.forEach(el => {
      const name = el.textContent.trim();
      const href = el.getAttribute('href') || '';
      // Filter for likely person profiles
      if (name && name.length > 1 && name.length < 40 && href.match(/facebook\.com\/(?!groups|photos|videos|watch|marketplace|messages|events|settings|notifications|stories|friends)/)) {
        const fullUrl = href.startsWith('/') ? 'https://www.facebook.com' + href : href;
        if (!seen.has(fullUrl)) {
          seen.add(fullUrl);
          suggestions.push({ name, url: fullUrl });
        }
      }
    });
    return suggestions.slice(0, 20);
  }

  // ============================================================
  //  PROFILE CHANGE TRACKING
  // ============================================================
  function checkForChanges(data) {
    const existing = GM_getValue('fb_osint_data', []);
    const prev = existing.find(e => e.url === data.url);
    if (!prev) return null;

    const changes = {};
    const trackedFields = ['name','location','hometown','work','education','relationship','birthday','bio'];
    trackedFields.forEach(f => {
      if (prev[f] && data[f] && prev[f] !== data[f]) {
        changes[f] = { old: prev[f], new: data[f] };
      }
    });
    // Also keyword changes
    const oldKws = new Set(prev.keywords || []);
    const newKws = new Set(data.keywords || []);
    const added = [...newKws].filter(k => !oldKws.has(k));
    const removed = [...oldKws].filter(k => !newKws.has(k));
    if (added.length || removed.length) changes.keywords = { added, removed };

    return Object.keys(changes).length > 0 ? changes : null;
  }

  // ============================================================
  //  PANEL RENDERING
  // ============================================================
  function renderPanel(data) {
    const existing = document.getElementById('fb-osint-panel');
    if (existing) existing.remove();

    // Check for changes
    const changes = checkForChanges(data);
    const changeBadge = changes ? '<span class="change-badge">⚠️ Changes detected</span>' : '';

    const panel = document.createElement('div');
    panel.id = 'fb-osint-panel';
    panel.innerHTML = `
      <div class="panel-header">
        <span class="panel-title">🕵️ ${data.name || 'Profile'} ${changeBadge}</span>
        <span class="panel-actions">
          <button id="osint-refresh" title="Refresh">🔄</button>
          <button id="osint-toggle" title="Minimize">_</button>
          <button id="osint-close" title="Close">✕</button>
        </span>
      </div>
      <div class="panel-body">
        <div class="tab-bar">
          <button data-tab="profile" class="active">👤 Profile</button>
          <button data-tab="keys">🔑 Keys</button>
          <button data-tab="pivot">🎯 Pivot</button>
          <button data-tab="mutual">🤝 Mutual</button>
          <button data-tab="group">👥 Group</button>
          <button data-tab="posts">📰 Posts</button>
          <button data-tab="photos">📸 Photos</button>
          <button data-tab="contacts">📞 Contacts</button>
          <button data-tab="events">📅 Events</button>
          <button data-tab="network">🔗 Network</button>
          <button data-tab="changes"${changes ? '' : ' style="display:none;"'}>⚠️ Changes</button>
        </div>
        <div id="osint-tab-content">
          ${renderProfileTab(data, changes)}
        </div>
        <div class="export-row">
          <button id="osint-copy-all">📋 Copy All</button>
          <button id="osint-save">💾 Save</button>
          <button id="osint-export-json">📄 JSON</button>
          <button id="osint-export-csv">📊 CSV</button>
          <button id="osint-screenshot">📸 HTML</button>
        </div>
        <div class="status-line" id="osint-status">✔ Ready</div>
      </div>
    `;
    document.body.appendChild(panel);
    panelVisible = true;

    // Tab switching
    document.querySelectorAll('#fb-osint-panel .tab-bar button').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('#fb-osint-panel .tab-bar button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeTab = btn.dataset.tab;
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

    // Controls
    document.getElementById('osint-close').onclick = () => { panel.remove(); panelVisible = false; };
    document.getElementById('osint-toggle').onclick = () => panel.classList.toggle('collapsed');
    document.getElementById('osint-refresh').onclick = () => refresh();

    document.getElementById('osint-copy-all').onclick = () => {
      const lines = [`Profile: ${data.name || ''}`, `FB UID: ${data.uid || 'N/A'}`, `URL: ${data.url || ''}`];
      if (data.location) lines.push(`Location: ${data.location}`);
      if (data.hometown) lines.push(`Hometown: ${data.hometown}`);
      if (data.work) lines.push(`Work: ${data.work}`);
      if (data.education) lines.push(`Education: ${data.education}`);
      if (data.relationship) lines.push(`Relationship: ${data.relationship}`);
      if (data.birthday) lines.push(`Birthday: ${data.birthday}`);
      if (data.friends) lines.push(`Friends: ${data.friends}`);
      if (data.followers) lines.push(`Followers: ${data.followers}`);
      if (data.bio) lines.push(`Bio: ${data.bio}`);
      lines.push(''); lines.push('--- Keywords ---');
      (data.keywords || []).forEach(k => lines.push(k));
      lines.push(''); lines.push('--- Linked Accounts ---');
      (data.linkedAccounts || []).forEach(a => lines.push(`${a.platform}: ${a.handle}`));
      lines.push(''); lines.push('--- Contact Info ---');
      (data.contactInfo || []).forEach(c => lines.push(`${c.type}: ${c.value}`));
      lines.push(''); lines.push('--- Common Groups ---');
      (data.commonGroups || []).forEach(g => lines.push(g.text));
      lines.push(''); lines.push('--- Events ---');
      (data.events || []).forEach(e => lines.push(`${e.name} | ${e.date} | ${e.location}`));
      lines.push(''); lines.push('--- Photos ---');
      (data.photos || []).forEach(p => lines.push(`${p.date || '(no date)'} ${p.url}`));
      lines.push(''); lines.push('--- Friend Suggestions ---');
      (data.friendSuggestions || []).forEach(s => lines.push(`${s.name} — ${s.url}`));
      lines.push(''); lines.push('--- Mutual Friends ---');
      (data.mutualFriends || []).forEach(m => lines.push(m.text));
      if (copyText(lines.join('\n'))) showStatus('Copied all ✅');
    };

    document.getElementById('osint-save').onclick = () => { saveProfile(data); showStatus('Saved 💾'); };
    document.getElementById('osint-export-json').onclick = () => exportJSON();
    document.getElementById('osint-export-csv').onclick = () => exportCSV();
    document.getElementById('osint-screenshot').onclick = () => {
      downloadFile(`fb_${data.profileId || 'page'}_${Date.now()}.html`, document.documentElement.outerHTML, 'text/html');
      showStatus('📄 Page HTML saved');
    };

    // Copy buttons
    document.querySelectorAll('#fb-osint-panel .copy-btn').forEach(btn => {
      btn.onclick = () => {
        const text = btn.getAttribute('data-copy');
        if (copyText(text)) {
          btn.textContent = '✅'; btn.classList.add('copied');
          setTimeout(() => { btn.textContent = '📋'; btn.classList.remove('copied'); }, 1500);
        }
      };
    });
  }

  // ======================== TAB RENDERERS ========================

  function renderProfileTab(data, changes) {
    const fields = [
      { label: 'Profile URL', value: data.url },
      { label: 'FB UID', value: data.uid },
      { label: 'Name', value: data.name },
      { label: 'Location', value: data.location },
      { label: 'Hometown', value: data.hometown },
      { label: 'Work', value: data.work },
      { label: 'Education', value: data.education },
      { label: 'Relationship', value: data.relationship },
      { label: 'Birthday', value: data.birthday },
      { label: 'Friends', value: data.friends },
      { label: 'Followers', value: data.followers },
      { label: 'Bio', value: data.bio },
    ];

    let avatarHtml = '';
    if (data.avatarUrl) {
      avatarHtml = `
        <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:8px;">
          <img class="profile-avatar" src="${data.avatarUrl}" id="osint-avatar-img" />
          <div class="avatar-actions" style="flex:1;">
            <div style="font-size:11px;font-weight:600;margin-bottom:4px;">📸 Avatar</div>
            <button id="osint-dl-avatar">⬇️ DL</button>
            <button id="osint-ri-google">🔍 Google</button>
            <button id="osint-ri-tineye">🔍 TinEye</button>
            <button id="osint-ri-yandex">🔍 Yandex</button>
          </div>
        </div>
      `;
    }

    // Changes indicator
    let changeHtml = '';
    if (changes) {
      changeHtml = `<div style="background:#f1c40f22;border:1px solid #f1c40f44;border-radius:6px;padding:6px 8px;margin-bottom:8px;font-size:11px;color:#f1c40f;">
        ⚠️ Changes detected! <a href="#" id="osint-goto-changes" style="color:#2d88ff;text-decoration:underline;">View →</a>
      </div>`;
    }

    const fieldHtml = fields.filter(f => f.value).map(f => {
      // Mark changed fields
      const isChanged = changes && changes[f.label.toLowerCase()];
      const changedStyle = isChanged ? ' style="border-left:3px solid #f1c40f;padding-left:5px;"' : '';
      return `<div class="field-group"${changedStyle}>
        <div class="field-label">${f.label}</div>
        <div class="field-value">
          <span>${f.value.length > 80 ? f.value.slice(0, 80) + '…' : f.value}${isChanged ? ' ⚠️' : ''}</span>
          <button class="copy-btn" data-copy="${f.value.replace(/"/g, '&quot;')}">📋</button>
        </div>
      </div>`;
    }).join('');

    const nameHtml = data.name ? `<div class="profile-name">${data.name}</div>` : '';
    return changeHtml + avatarHtml + nameHtml + fieldHtml;
  }

  function renderKeysTab(data) {
    const kws = data.keywords || [];
    if (kws.length === 0) return '<div style="color:#8a8d91;text-align:center;padding:20px;">No keywords extracted.</div>';
    const chips = kws.map(k => `<span class="keyword-chip" data-kw="${k.replace(/"/g, '&quot;')}">${k}</span>`).join('');
    // Also scan full page for additional
    const pt = document.body.innerText;
    const extras = [];
    const addE = (p, v) => { if (v && !kws.some(k => k.includes(v))) extras.push(`${p} ${v}`); };
    (pt.match(/(?:\+1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g) || []).forEach(p => addE('📞', p));
    (pt.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []).forEach(e => addE('✉️', e));
    (pt.match(/@[a-zA-Z0-9_.-]{3,30}/g) || []).forEach(h => addE('🆔', h));
    let extraHtml = '';
    if (extras.length) extraHtml = `<div class="field-group" style="margin-top:8px;"><div class="field-label">Additional on page</div><div>${extras.map(k => `<span class="keyword-chip">${k}</span>`).join('')}</div></div>`;
    return `<div class="field-group"><div class="field-label">Extracted (${kws.length})</div><div>${chips}</div></div>${extraHtml}`;
  }

  function renderPivotTab(data) {
    const pivots = getPivotURLs(data);
    if (!pivots.length) return '<div style="color:#8a8d91;text-align:center;padding:20px;">No data to pivot on.</div>';
    const btns = pivots.map(p => `<button class="pivot-btn" data-url="${p.url}">${p.label}</button>`).join('');
    return `<div class="field-group"><div class="field-label">🎯 Quick OSINT Pivots</div><div class="osint-pivot-grid">${btns}</div></div>`;
  }

  function getPivotURLs(data) {
    const name = encodeURIComponent(data.name || '');
    const email = data.keywords?.find(k => k.startsWith('✉️'))?.slice(2).trim() || '';
    const phone = data.keywords?.find(k => k.startsWith('📞'))?.slice(2).trim() || '';
    const loc = encodeURIComponent(data.location || data.hometown || '');
    const uid = data.uid || '';
    const graphQuery = uid && !uid.startsWith('username') ? `https://graph.facebook.com/v19.0/${uid}?fields=id,name,first_name,last_name,email,location,gender,birthday,link,locale,timezone&access_token=TOKEN` : null;
    return [
      { label: '🔍 Google', url: `https://www.google.com/search?q=${name}` },
      { label: '👔 LinkedIn', url: `https://www.google.com/search?q=site:linkedin.com/in+${name}` },
      { label: '🍃 Pipl', url: `https://pipl.com/search/?q=${name}` },
      { label: '🛡️ Dehashed', url: `https://dehashed.com/search?q=${name}` },
      { label: '🔐 HIBP', url: email ? `https://haveibeenpwned.com/account/${email}` : null },
      { label: '🐙 GitHub', url: `https://www.google.com/search?q=site:github.com+${name}` },
      { label: '📸 Instagram', url: `https://www.google.com/search?q=site:instagram.com+${name}` },
      { label: '🐦 X', url: `https://x.com/search?q=${name}` },
      { label: '📞 Phone', url: phone ? `https://www.google.com/search?q=${encodeURIComponent(phone)}` : null },
      { label: '🏙️ City', url: loc ? `https://www.google.com/search?q=${loc}+${name}` : null },
      { label: '📧 Email', url: email ? `https://www.google.com/search?q=${encodeURIComponent(email)}` : null },
      { label: '🆔 Graph API', url: graphQuery },
    ].filter(l => l.url);
  }

  function renderMutualTab(data) {
    const mfs = data.mutualFriends || [];
    let html = '';
    if (mfs.length === 0) {
      html = '<div style="color:#8a8d91;text-align:center;padding:16px;">No mutual friends detected.</div>';
    } else {
      html = `<div class="field-group"><div class="field-label">🤝 ${mfs.length} Mutual Friend(s)</div></div>`;
      mfs.forEach(mf => {
        const avHtml = (mf.avatars || []).filter(Boolean).map(a => `<img src="${a}" />`).join('');
        const badge = mf.count > 0 ? ` <span style="color:#2d88ff;font-size:10px;">(${mf.count})</span>` : '';
        html += `<div class="mutual-friend-item">${avHtml}<span class="mf-name">${mf.text}${badge}</span>${mf.url ? `<a class="mf-link" href="${mf.url}" target="_blank">→</a>` : ''}</div>`;
      });
    }
    html += `<div style="margin-top:6px;display:flex;gap:4px;flex-wrap:wrap;">
      <button id="osint-highlight-mutual" style="background:#2d88ff;border:none;color:white;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:10px;">🔦 Highlight</button>
      <button id="osint-expand-mutual" style="background:#242526;border:1px solid #3e4042;color:#e4e6eb;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:10px;">🔽 Expand & Scrape</button>
    </div>`;
    return html;
  }

  function renderGroupTab() {
    return `<div>
      <div style="font-size:13px;font-weight:600;margin-bottom:6px;">👥 Group Member Scanner</div>
      <div style="font-size:11px;color:#8a8d91;margin-bottom:10px;">Scans visible group member list.</div>
      <button id="osint-scan-group" style="width:100%;padding:10px;background:#2d88ff;border:none;border-radius:8px;color:white;font-size:13px;font-weight:600;cursor:pointer;">🔍 Scan Visible Members</button>
      <button id="osint-scan-group-history" style="width:100%;margin-top:6px;padding:8px;background:#242526;border:1px solid #3e4042;border-radius:8px;color:#e4e6eb;font-size:12px;cursor:pointer;">📄 Previous Scans</button>
      <div id="osint-scan-results" style="margin-top:8px;max-height:280px;overflow-y:auto;"></div>
    </div>`;
  }

  function renderTimelineTab(data) {
    const posts = data.posts || [];
    if (posts.length === 0) return '<div style="color:#8a8d91;text-align:center;padding:20px;">No visible posts. Scroll to load more then refresh.</div>';
    const items = posts.map(p => {
      const loc = p.location ? ` <span class="tl-loc">📍 ${p.location}</span>` : '';
      const time = p.timestamp ? `<span class="tl-time">🕐 ${p.timestamp}</span>` : '';
      return `<div class="timeline-item"><div>${p.text}${loc}</div><div style="display:flex;gap:6px;margin-top:2px;">${time}</div></div>`;
    }).join('');
    return `<div class="field-group"><div class="field-label">📰 Recent Posts (${posts.length})</div>${items}</div>`;
  }

  function renderPhotosTab(data) {
    const photos = data.photos || [];
    if (photos.length === 0) return '<div style="color:#8a8d91;text-align:center;padding:20px;">No photos detected. Open the Photos tab and refresh.</div>';
    const items = photos.map(p => {
      const date = p.date ? `<span class="ph-date">📅 ${p.date}</span>` : '';
      const loc = p.location ? ` <span class="ph-loc">📍 ${p.location}</span>` : '';
      return `<div class="photo-item"><div>${p.text || '(photo)'}</div><div>${date}${loc}</div></div>`;
    }).join('');
    return `<div class="field-group"><div class="field-label">📸 Photos (${photos.length})</div>
      <div style="font-size:10px;color:#8a8d91;margin-bottom:4px;">Dates/locations from nearby content</div>${items}</div>`;
  }

  function renderContactsTab(data) {
    const contacts = data.contactInfo || [];
    const linked = data.linkedAccounts || [];
    if (contacts.length === 0 && linked.length === 0) return '<div style="color:#8a8d91;text-align:center;padding:20px;">No contact info or linked accounts found.</div>';
    let html = '';
    if (contacts.length) {
      html += `<div class="field-group"><div class="field-label">📞 Contact Info</div>`;
      contacts.forEach(c => {
        html += `<div class="contact-item"><span>${c.type}: <strong>${c.value}</strong></span><button class="copy-btn" data-copy="${c.value.replace(/"/g, '&quot;')}">📋</button></div>`;
      });
      html += `</div>`;
    }
    if (linked.length) {
      html += `<div class="field-group"><div class="field-label">🔗 Linked Accounts</div>`;
      linked.forEach(a => {
        html += `<div class="mutual-friend-item"><span class="mf-name">${a.platform}: <strong>${a.handle}</strong></span><a class="mf-link" href="${a.url}" target="_blank">→</a></div>`;
      });
      html += `</div>`;
    }
    return html;
  }

  function renderEventsTab(data) {
    const events = data.events || [];
    if (events.length === 0) return '<div style="color:#8a8d91;text-align:center;padding:20px;">No events detected. Open Events tab on profile and refresh.</div>';
    const items = events.map(e => {
      const date = e.date ? `<span class="ev-date">📅 ${e.date}</span>` : '';
      const loc = e.location ? ` <span class="ev-loc">📍 ${e.location}</span>` : '';
      return `<div class="event-item"><div>${e.name}</div><div>${date}${loc}</div></div>`;
    }).join('');
    return `<div class="field-group"><div class="field-label">📅 Events (${events.length})</div>${items}</div>`;
  }

  function renderNetworkTab(data) {
    const suggestions = data.friendSuggestions || [];
    const commonGroups = data.commonGroups || [];
    let html = '';
    if (commonGroups.length) {
      html += `<div class="field-group"><div class="field-label">👥 Common Groups</div>`;
      commonGroups.forEach(g => {
        html += `<div class="mutual-friend-item"><span class="mf-name">${g.text}</span>${g.url ? `<a class="mf-link" href="${g.url}" target="_blank">→</a>` : ''}</div>`;
      });
      html += `</div>`;
    }
    if (suggestions.length) {
      html += `<div class="field-group"><div class="field-label">💡 Friend Suggestions (${suggestions.length})</div>`;
      suggestions.slice(0, 15).forEach(s => {
        html += `<div class="mutual-friend-item"><span class="mf-name">👤 ${s.name}</span><a class="mf-link" href="${s.url}" target="_blank">→</a></div>`;
      });
      html += `<div style="font-size:10px;color:#8a8d91;margin-top:4px;">From PYMK sidebar on profile page</div>`;
      html += `</div>`;
    }
    if (!html) html = '<div style="color:#8a8d91;text-align:center;padding:20px;">No network data found.</div>';
    return html;
  }

  function renderChangesTab(changes) {
    let html = '<div class="field-group"><div class="field-label">⚠️ Profile Changes</div></div>';
    for (const [field, change] of Object.entries(changes)) {
      if (field === 'keywords') {
        html += `<div class="field-group">
          <div class="field-label">Keywords</div>
          <div style="font-size:11px;background:#242526;border-radius:6px;padding:6px;">
            ${change.added.length ? '<div style="color:#2ecc71;">➕ Added: ' + change.added.join(', ') + '</div>' : ''}
            ${change.removed.length ? '<div style="color:#e74c3c;">➖ Removed: ' + change.removed.join(', ') + '</div>' : ''}
          </div>
        </div>`;
      } else {
        html += `<div class="field-group">
          <div class="field-label">${field}</div>
          <div style="font-size:11px;background:#242526;border-radius:6px;padding:6px;">
            <div style="color:#e74c3c;">Old: ${change.old}</div>
            <div style="color:#2ecc71;">New: ${change.new}</div>
          </div>
        </div>`;
      }
    }
    return html;
  }

  // ============================================================
  //  GROUP SCANNER
  // ============================================================
  function scanGroupMembers() {
    const overlay = document.createElement('div');
    overlay.id = 'fb-osint-scanner-progress';
    overlay.innerHTML = `
      <div class="sp-title">🔍 Scanning Group Members</div>
      <div class="sp-count" id="sp-count">Scanned: 0</div>
      <div class="sp-bar-bg"><div class="sp-bar-fill" id="sp-bar-fill"></div></div>
      <button class="sp-close" id="sp-close">Cancel</button>`;
    document.body.appendChild(overlay);
    let cancelled = false;
    document.getElementById('sp-close').onclick = () => { cancelled = true; overlay.remove(); };
    const members = new Set(); let lastHeight = 0; let stalledCount = 0;
    const collect = () => {
      if (cancelled) return;
      document.querySelectorAll('a[href*="/user/"], a[href*="/profile.php"], a[role="link"][href*="facebook.com/"][href*="?"]').forEach(el => {
        const href = el.getAttribute('href') || ''; const name = el.textContent.trim();
        if (name && href && (href.includes('/user/') || href.includes('profile.php') || href.match(/facebook\.com\/(?:profile\.php\?id=\d+|[^/?]+)/))) {
          members.add(JSON.stringify({ name, url: href.startsWith('/') ? 'https://www.facebook.com' + href : href }));
        }
      });
      const countEl = document.getElementById('sp-count'); const bar = document.getElementById('sp-bar-fill');
      if (countEl) countEl.textContent = `Scanned: ${members.size}`;
      if (bar) bar.style.width = `${Math.min(members.size * 3, 95)}%`;
      const sh = document.documentElement.scrollHeight;
      if (sh === lastHeight) stalledCount++; else { stalledCount = 0; lastHeight = sh; }
      if (stalledCount >= 5) {
        const finalData = Array.from(members).map(m => JSON.parse(m));
        if (countEl) countEl.textContent = `✅ Complete: ${finalData.length} members`;
        if (bar) bar.style.width = '100%';
        document.querySelector('.sp-close').textContent = 'Done ✓';
        saveGroupScan(finalData);
        setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 2500);
        return;
      }
      window.scrollTo(0, sh);
      setTimeout(collect, 1200);
    };
    setTimeout(collect, 500);
  }

  function saveGroupScan(data) {
    const gName = document.querySelector('h1, h2')?.textContent?.trim()?.slice(0, 40) || 'unknown-group';
    const scans = GM_getValue('osint_group_scans', []);
    scans.push({ group: gName, url: window.location.href, timestamp: new Date().toISOString(), count: data.length, members: data });
    GM_setValue('osint_group_scans', scans);
    const csv = toCSV(data.map(m => ({ name: m.name, url: m.url, group: gName })));
    downloadFile(`group_${gName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.csv`, csv, 'text/csv');
  }

  function showPreviousScans() {
    const scans = GM_getValue('osint_group_scans', []);
    const container = document.getElementById('osint-scan-results');
    if (!container) return;
    if (scans.length === 0) { container.innerHTML = '<div style="color:#8a8d91;text-align:center;padding:12px;">No previous scans.</div>'; return; }
    let html = '<div class="field-label" style="margin-bottom:4px;">Previous</div>';
    [...scans].reverse().slice(0, 10).forEach((s, idx) => {
      const realIdx = scans.length - 1 - idx;
      html += `<div class="mutual-friend-item" style="font-size:11px;">
        <span class="mf-name">👥 ${s.group}</span>
        <span style="color:#8a8d91;font-size:10px;">${s.count} • ${new Date(s.timestamp).toLocaleDateString()}</span>
        <button class="scan-dl-btn" data-idx="${realIdx}" style="background:none;border:none;color:#2d88ff;cursor:pointer;font-size:11px;">📥</button>
      </div>`;
    });
    container.innerHTML = html;
    container.querySelectorAll('.scan-dl-btn').forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.dataset.idx, 10);
        const scan = GM_getValue('osint_group_scans', [])[idx];
        if (scan) {
          const csv = toCSV(scan.members.map(m => ({ name: m.name, url: m.url, group: scan.group })));
          downloadFile(`group_${scan.group.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.csv`, csv, 'text/csv');
        }
      };
    });
  }

  // ============================================================
  //  HIGHLIGHT / POPUP
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
            badge.style.cssText = 'position:absolute;top:-14px;right:0;background:#2d88ff;color:white;padding:1px 6px;border-radius:4px;font-size:10px;z-index:9999;pointer-events:none;';
            badge.textContent = `🤝 ${t.match(/[\d,]+/)?.[0] || ''}`;
            clickable.appendChild(badge);
          }
        }
      }
    }
    showStatus('🔦 Highlighted');
  }

  function showScrapePopup(title, items) {
    const existing = document.querySelector('.fb-osint-popup-scanner');
    if (existing) existing.remove();
    const div = document.createElement('div');
    div.className = 'fb-osint-popup-scanner';
    div.innerHTML = `<div class="ps-box">
      <div class="ps-title">${title} (${items.length})</div>
      ${items.map(i => `<div class="ps-item">${i}</div>`).join('')}
      <button class="ps-close">Close</button>
    </div>`;
    document.body.appendChild(div);
    div.querySelector('.ps-close').onclick = () => div.remove();
    div.addEventListener('click', (e) => { if (e.target === div) div.remove(); });
  }

  // ============================================================
  //  SAVE / EXPORT
  // ============================================================
  function saveProfile(data) {
    const existing = GM_getValue('fb_osint_data', []);
    const idx = existing.findIndex(e => e.url === data.url);
    const entry = {
      name: data.name, url: data.url, profileId: data.profileId, uid: data.uid,
      location: data.location, hometown: data.hometown, work: data.work,
      education: data.education, relationship: data.relationship,
      birthday: data.birthday, friends: data.friends, followers: data.followers,
      bio: data.bio,
      keywords: data.keywords, mutualFriends: data.mutualFriends,
      linkedAccounts: data.linkedAccounts, contactInfo: data.contactInfo,
      commonGroups: data.commonGroups, eventsCount: (data.events || []).length,
      photosCount: (data.photos || []).length,
      friendSuggestionsCount: (data.friendSuggestions || []).length,
      capturedAt: new Date().toISOString()
    };
    if (idx >= 0) existing[idx] = entry;
    else existing.push(entry);
    GM_setValue('fb_osint_data', existing);

    // Also update version history for change tracking
    const history = GM_getValue('fb_osint_history', {});
    if (data.url) {
      if (!history[data.url]) history[data.url] = [];
      history[data.url].push({ ...entry, _snapshotAt: new Date().toISOString() });
      if (history[data.url].length > 20) history[data.url] = history[data.url].slice(-20);
      GM_setValue('fb_osint_history', history);
    }
  }

  function exportJSON() {
    downloadFile(`fb_osint_${Date.now()}.json`, JSON.stringify(GM_getValue('fb_osint_data', []), null, 2), 'application/json');
  }

  function exportCSV() {
    const all = GM_getValue('fb_osint_data', []);
    const flat = all.map(d => ({
      name: d.name || '', profileId: d.profileId || '', uid: d.uid || '',
      location: d.location || '', hometown: d.hometown || '', work: d.work || '',
      education: d.education || '', relationship: d.relationship || '',
      birthday: d.birthday || '', friends: d.friends || '',
      bio: (d.bio || '').slice(0, 200),
      accounts: (d.linkedAccounts || []).map(a => `${a.platform}:${a.handle}`).join('; '),
      contacts: (d.contactInfo || []).map(c => `${c.type}:${c.value}`).join('; '),
      capturedAt: d.capturedAt || ''
    }));
    downloadFile(`fb_osint_${Date.now()}.csv`, toCSV(flat), 'text/csv');
  }

  function refresh() {
    const data = scrapeProfile();
    if (panelVisible) renderPanel(data);
  }

  // ============================================================
  //  NOTEPAD
  // ============================================================
  function createNotepad() {
    if (document.getElementById('fb-osint-notepad')) return;
    const templates = [
      { name: '🎯 Warm Interest', text: 'Hey! I know this is random, but I saw your comment on that post and I literally laughed out loud. I never comment on stuff but that one got me 😂 Anyway — I\'m Olivia, living the single-mom-of-a-cat life over here in Austin. What part of the world are you in?' },
      { name: '🎯 Playful Direct', text: 'Okay this is going to sound insane, but I\'m just gonna go for it. I saw your profile and something told me I\'d regret it if I didn\'t say hi. So... hi 🙃 I\'m Olivia. Don\'t leave me hanging — tell me something about where you\'re from so I feel less weird about this 😅' },
      { name: '🎯 Mystery Soft', text: 'I know this is completely out of the blue, and I promise I\'m not usually the type to message strangers on Facebook 😅 But I\'ve been having one of those weeks where you just feel like taking a chance on something. So... hi. I\'m Olivia. Tell me one good thing about your day? Could be anything.' },
      { name: '❄️ Cold Salvage', text: 'Okay I\'ll take the silence as a sign you\'re either a) married b) not interested or c) just having a weird week like me 😂 No pressure either way. Hope your day gets better ✌️' },
      { name: '🛡️ Bot Accusation', text: '😂 That\'s the second time someone\'s asked me that this week. I promise I\'m real — just a regular human being who took a shot at messaging a random stranger on the internet. I can send you a voice note if you need proof? 🤷‍♀️' },
      { name: '🛡️ "Why Me?"', text: 'Honestly? I just liked your vibe. Your profile gave off normal-human-energy which is surprisingly rare 😂' },
    ];
    const div = document.createElement('div');
    div.id = 'fb-osint-notepad';
    div.innerHTML = `
      <div class="note-header" id="note-header">
        <span>📝 Info Board</span>
        <span class="note-actions">
          <button id="note-clear-btn" title="Clear">🗑️</button>
          <button id="note-close-btn" title="Close">✕</button>
        </span>
      </div>
      <div class="note-body">
        <div class="note-entries-list" id="note-entries-list">
          ${boardEntries.length === 0 ? '<div style="color:#8a8d91;text-align:center;padding:16px;">No info captured yet.</div>' : ''}
          ${boardEntries.map((e, i) => `<div class="note-entry"><span><span class="entry-label">[${e.label || 'info'}]</span> ${e.text}</span><button class="entry-del" data-idx="${i}">✕</button></div>`).join('')}
        </div>
      </div>
      <div class="keyword-highlight" id="note-auto-kw">
        <div class="kh-label">🔑 Auto-detected</div>
        <div class="kh-chips" id="note-auto-chips"></div>
      </div>
      <div class="note-input-area">
        <div class="note-input-row">
          <select id="note-label">
            <option value="info">Info</option><option value="name">Name</option><option value="location">Location</option>
            <option value="work">Work</option><option value="age">Age</option><option value="interests">Interests</option>
            <option value="family">Family</option><option value="contact">Contact</option><option value="hint">⏳ Lead</option>
          </select>
          <input type="text" id="note-input-field" placeholder="Info revealed...">
          <button id="note-add-btn">+</button>
        </div>
      </div>
      <details class="template-section">
        <summary>💬 Templates (click to copy)</summary>
        ${templates.map(t => `<div class="template-item" data-template="${t.text.replace(/"/g, '&quot;')}">${t.name}</div>`).join('')}
      </details>
      <div class="note-export-row">
        <button id="note-export-json">📄 JSON</button>
        <button id="note-export-csv">📊 CSV</button>
        <button id="note-export-clip">📋 Copy All</button>
      </div>`;
    document.body.appendChild(div);

    let isDragging = false, startX, startY, origX, origY;
    div.querySelector('.note-header').onmousedown = (e) => {
      isDragging = true; startX = e.clientX; startY = e.clientY;
      origX = div.offsetLeft; origY = div.offsetTop;
    };
    document.onmousemove = (e) => {
      if (!isDragging) return;
      div.style.left = (origX + e.clientX - startX) + 'px';
      div.style.top = (origY + e.clientY - startY) + 'px';
      div.style.right = 'auto';
    };
    document.onmouseup = () => { isDragging = false; };

    document.getElementById('note-close-btn').onclick = () => { div.classList.remove('visible'); };
    document.getElementById('note-clear-btn').onclick = () => { if (confirm('Clear all?')) { boardEntries = []; persistBoard(); renderNoteList(); }};
    document.getElementById('note-add-btn').onclick = addNoteEntry;
    document.getElementById('note-input-field').onkeydown = (e) => { if (e.key === 'Enter') addNoteEntry(); };
    document.getElementById('note-export-json').onclick = () => downloadFile(`notes_${Date.now()}.json`, JSON.stringify(boardEntries, null, 2), 'application/json');
    document.getElementById('note-export-csv').onclick = () => downloadFile(`notes_${Date.now()}.csv`, toCSV(boardEntries), 'text/csv');
    document.getElementById('note-export-clip').onclick = () => {
      const text = boardEntries.map(e => `[${e.label}] ${e.text}`).join('\n');
      if (copyText(text)) { const b = document.getElementById('note-export-clip'); b.textContent = '✅'; setTimeout(() => { b.textContent = '📋 Copy All'; }, 1500); }
    };
    div.querySelectorAll('.template-item').forEach(el => {
      el.onclick = () => { if (copyText(el.dataset.template)) { el.style.background = '#2ecc7144'; el.style.color = '#2ecc71'; setTimeout(() => { el.style.background = '#242526'; el.style.color = '#b0b3b8'; }, 1200); }};
    });
    // Delete handlers
    div.addEventListener('click', (e) => {
      if (e.target.classList.contains('entry-del')) {
        const idx = parseInt(e.target.dataset.idx, 10);
        boardEntries.splice(idx, 1); persistBoard(); renderNoteList(); updateAutoKeywords();
      }
    });
  }

  function renderNoteList() {
    const list = document.getElementById('note-entries-list');
    if (!list) return;
    if (boardEntries.length === 0) list.innerHTML = '<div style="color:#8a8d91;text-align:center;padding:16px;">No info captured yet.</div>';
    else list.innerHTML = boardEntries.map((e, i) =>
      `<div class="note-entry"><span><span class="entry-label">[${e.label || 'info'}]</span> ${e.text}</span><button class="entry-del" data-idx="${i}">✕</button></div>`
    ).join('');
  }

  function addNoteEntry() {
    const input = document.getElementById('note-input-field');
    const label = document.getElementById('note-label');
    const text = input.value.trim();
    if (!text) return;
    boardEntries.push({ label: label.value, text, timestamp: new Date().toISOString() });
    persistBoard(); input.value = ''; renderNoteList(); updateAutoKeywords();
  }

  function updateAutoKeywords() {
    const chips = document.getElementById('note-auto-chips');
    if (!chips) return;
    const allText = boardEntries.map(e => e.text).join(' ');
    const found = [];
    const add = (p, v) => { if (v && !found.some(f => f.includes(v))) found.push(`${p} ${v}`); };
    (allText.match(/(?:\+1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g) || []).forEach(p => add('📞', p));
    (allText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []).forEach(e => add('✉️', e));
    (allText.match(/\b(\d{2})\s*(?:years old|yo|yr|y\/o)\b/gi) || []).forEach(a => add('🎂', a));
    stateLoop(allText);
    if (!found.length) chips.innerHTML = '<span style="color:#8a8d91;font-size:11px;">No structured data</span>';
    else chips.innerHTML = found.map(k => `<span class="keyword-chip">${k}</span>`).join('');
  }

  function stateLoop(t) {
    const re = /\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)\b/g;
    let m; while ((m = re.exec(t)) !== null) {
      if (t.match(new RegExp(`\\b${m[1]}\\b`))) continue;
    }
  }

  // ============================================================
  //  CHAT MONITOR
  // ============================================================
  function startChatMonitor() {
    let lastText = '';
    const patterns = [
      { label: '📞 Phone', regex: /(?:\+1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g },
      { label: '✉️ Email', regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
      { label: '🎂 Age', regex: /\b(\d{2})\s*(?:years old|yo|yr|y\/o)\b/gi },
      { label: '🏠 Addr', regex: /\b\d{1,5}\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+,\s*(?:[A-Z][a-z]+\s+)?[A-Z]{2}\s+\d{5}/g },
      { label: '🔗 URL', regex: /https?:\/\/[^\s)]+/g },
    ];
    setInterval(() => {
      if (!location.href.includes('/messages/') && !location.href.includes('/messenger/')) return;
      const msgEls = document.querySelectorAll('[data-pagelet="Messaging"] div[dir="auto"], div.xjyslct div[dir="auto"]');
      const currentText = Array.from(msgEls).map(el => el.textContent.trim()).filter(Boolean).join(' | ');
      if (currentText !== lastText) {
        lastText = currentText;
        patterns.forEach(({ label, regex }) => {
          let m; while ((m = regex.exec(currentText)) !== null) {
            if (!boardEntries.some(e => e.text === m[0])) {
              boardEntries.push({ label: 'auto-' + label, text: m[0], timestamp: new Date().toISOString() });
              persistBoard(); renderNoteList(); updateAutoKeywords();
            }
          }
        });
      }
    }, 3000);
  }

  // ============================================================
  //  FLOAT BUTTON
  // ============================================================
  function createFloatBtn() {
    if (document.querySelector('.fb-osint-float-btn')) return;
    const btn = document.createElement('button');
    btn.className = 'fb-osint-float-btn';
    btn.textContent = '🕵️';
    btn.title = 'Click: Panel | Ctrl+Click: Notes';
    btn.onclick = (e) => {
      if (e.ctrlKey || e.metaKey) { toggleNotepad(); return; }
      const panel = document.getElementById('fb-osint-panel');
      if (panel) { panel.remove(); panelVisible = false; return; }
      const data = scrapeProfile(); renderPanel(data);
    };
    document.body.appendChild(btn);
  }

  function showNotepad() {
    const el = document.getElementById('fb-osint-notepad');
    if (!el) { createNotepad(); setTimeout(showNotepad, 100); return; }
    el.classList.add('visible'); updateAutoKeywords();
  }

  function hideNotepad() { const el = document.getElementById('fb-osint-notepad'); if (el) el.classList.remove('visible'); }
  function toggleNotepad() { const el = document.getElementById('fb-osint-notepad'); if (!el) { createNotepad(); setTimeout(toggleNotepad, 100); } else el.classList.toggle('visible'); }

  // ============================================================
  //  KEYBOARD SHORTCUTS
  // ============================================================
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'P') {
      e.preventDefault();
      const p = document.getElementById('fb-osint-panel');
      if (p) { p.remove(); panelVisible = false; } else { const d = scrapeProfile(); renderPanel(d); }
    }
    if (e.ctrlKey && e.shiftKey && e.key === 'N') { e.preventDefault(); toggleNotepad(); }
  });

  // ============================================================
  //  EVENT DELEGATION
  // ============================================================
  document.addEventListener('click', (e) => {
    const t = e.target;
    if (t.classList.contains('pivot-btn')) openURL(t.dataset.url);
    if (t.id === 'osint-scan-group') scanGroupMembers();
    if (t.id === 'osint-scan-group-history') showPreviousScans();
    if (t.id === 'osint-highlight-mutual') highlightMutualFriends();
    if (t.id === 'osint-expand-mutual') tryExpandMutualFriends();
    if (t.id === 'osint-goto-changes') {
      e.preventDefault();
      const btn = document.querySelector('#fb-osint-panel button[data-tab="changes"]');
      if (btn) btn.click();
    }
    if (t.classList.contains('keyword-chip')) {
      const text = t.dataset.kw || t.textContent.trim();
      if (copyText(text)) { t.style.background = '#2ecc7144'; t.style.borderColor = '#2ecc71'; setTimeout(() => { t.style.background = '#2d88ff22'; t.style.borderColor = '#2d88ff44'; }, 1000); }
    }
    if (t.id === 'osint-dl-avatar') { const img = document.getElementById('osint-avatar-img'); if (img) { const name = document.querySelector('.profile-name')?.textContent?.trim() || 'profile'; downloadAvatar(img.src, name); }}
    if (t.id === 'osint-ri-google') { const img = document.getElementById('osint-avatar-img'); if (img) reverseImageSearch(img.src, 'google'); }
    if (t.id === 'osint-ri-tineye') { const img = document.getElementById('osint-avatar-img'); if (img) reverseImageSearch(img.src, 'tineye'); }
    if (t.id === 'osint-ri-yandex') { const img = document.getElementById('osint-avatar-img'); if (img) reverseImageSearch(img.src, 'yandex'); }
  });

  function downloadAvatar(url, name) {
    const img = new Image(); img.crossOrigin = 'anonymous';
    img.onload = () => {
      const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
      c.getContext('2d').drawImage(img, 0, 0);
      const a = document.createElement('a'); a.download = `${name}_${Date.now()}.jpg`; a.href = c.toDataURL('image/jpeg', 0.92); a.click();
    };
    img.onerror = () => {
      GM_xmlhttpRequest({ method: 'GET', url, responseType: 'blob',
        onload: (resp) => { const a = document.createElement('a'); a.href = URL.createObjectURL(resp.response); a.download = `${name}_${Date.now()}.jpg`; a.click(); },
        onerror: () => showStatus('❌ DL failed')
      });
    };
    img.src = url;
  }

  function reverseImageSearch(url, engine) {
    const urls = { google: `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(url)}`, tineye: `https://tineye.com/search?url=${encodeURIComponent(url)}`, yandex: `https://yandex.com/images/search?rpt=imageview&url=${encodeURIComponent(url)}` };
    openURL(urls[engine] || urls.google);
  }

  // ============================================================
  //  INIT
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
          if (cur.match(/facebook\.com\/(?:[^/?]+\/?|profile\.php)/) && !cur.includes('messages/') && panelVisible) {
            renderPanel(scrapeProfile());
          }
        }, 2000);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    if (window.location.href.match(/facebook\.com\/(?:[^/?]+\/?|profile\.php)/) && !window.location.href.includes('messages/')) {
      setTimeout(() => { const d = scrapeProfile(); if (d.name || d.location) renderPanel(d); }, 2500);
    }

    console.log('[FB OSINT v4.0] Loaded. Ctrl+Shift+P → Panel | Ctrl+Shift+N → Notes');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
