// ==UserScript==
// @name         FB 信息助手 v6
// @namespace    https://github.com/Aqu399
// @version      6.0
// @description  Facebook 个人主页信息采集 — 自动提取个人详情、好友、帖子，归纳目标画像 🎀
// @author       阿趣 🎀
// @updateURL    https://github.com/Aqu399/fb-osint-companion/raw/main/fb-osint-helper.user.js
// @downloadURL  https://github.com/Aqu399/fb-osint-companion/raw/main/fb-osint-helper.user.js
// @match        https://www.facebook.com/*
// @match        https://mbasic.facebook.com/*
// @match        https://m.facebook.com/*
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

(function() {
'use strict';

// ============================================================
//  🎯 配置
// ============================================================
const CONFIG = {
  panelWidth: 460,
  animationMs: 250,
  storageKey: 'fb_v6_data',
  saveKey: 'fb_v6_saved',
  debounceMs: 1500,
};

// ============================================================
//  🎨 样式 — 简洁深色面板
// ============================================================
GM_addStyle(`
#fb-v6-panel {
  position: fixed; bottom: 16px; right: 16px;
  width: ${CONFIG.panelWidth}px; max-height: 88vh;
  background: #0d1117; color: #c9d1d9;
  border: 1px solid #30363d; border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  z-index: 999999; font: 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans SC', sans-serif;
  display: flex; flex-direction: column; overflow: hidden;
  transition: transform 0.2s ease, opacity 0.2s ease;
}
#fb-v6-panel.hidden { opacity: 0; pointer-events: none; }
#fb-v6-panel .hdr {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px;
  background: #161b22; border-bottom: 1px solid #30363d;
  cursor: move; user-select: none; flex-shrink: 0;
}
#fb-v6-panel .hdr .ttl { font-weight: 700; font-size: 14px; color: #58a6ff; }
#fb-v6-panel .hdr .ttl small { font-weight: 400; font-size: 10px; color: #8b949e; }
#fb-v6-panel .hdr .btns button {
  background: #21262d; border: 1px solid #30363d; color: #8b949e;
  cursor: pointer; font-size: 13px; padding: 2px 8px; border-radius: 6px; margin-left: 4px;
}
#fb-v6-panel .hdr .btns button:hover { background: #30363d; color: #c9d1d9; }
#fb-v6-panel .body { overflow-y: auto; padding: 10px 14px; flex: 1; }
#fb-v6-panel .tabs {
  display: flex; gap: 2px; margin-bottom: 10px;
  border-bottom: 1px solid #21262d; padding-bottom: 6px; flex-wrap: wrap; flex-shrink: 0;
}
#fb-v6-panel .tabs button {
  background: none; border: none; color: #8b949e; cursor: pointer;
  padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 600;
  transition: all 0.15s; font-family: inherit;
}
#fb-v6-panel .tabs button.act { background: #1f6feb33; color: #58a6ff; }
#fb-v6-panel .tabs button:hover:not(.act) { background: #21262d; }
#fb-v6-panel .card {
  background: #161b22; border: 1px solid #30363d;
  border-radius: 10px; padding: 12px; margin-bottom: 8px;
}
#fb-v6-panel .card h3 {
  font-size: 12px; color: #8b949e; font-weight: 600;
  margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;
}
#fb-v6-panel .row {
  display: flex; padding: 5px 0; border-bottom: 1px solid #21262d;
  font-size: 12px; align-items: flex-start;
}
#fb-v6-panel .row:last-child { border-bottom: none; }
#fb-v6-panel .row .lbl { color: #8b949e; min-width: 75px; flex-shrink: 0; }
#fb-v6-panel .row .val { color: #c9d1d9; word-break: break-word; }
#fb-v6-panel .row .val.ph { color: #3fb950; font-family: monospace; font-size: 13px; }
#fb-v6-panel .row .val.uid { color: #58a6ff; font-family: monospace; }
#fb-v6-panel .row .cpy {
  background: none; border: none; color: #484f58; cursor: pointer;
  font-size: 11px; padding: 0 4px; flex-shrink: 0; margin-left: auto;
}
#fb-v6-panel .row .cpy:hover { color: #58a6ff; }
#fb-v6-panel .avatar {
  width: 56px; height: 56px; border-radius: 50%; object-fit: cover;
  border: 2px solid #30363d; cursor: pointer; flex-shrink: 0;
}
#fb-v6-panel .avatar:hover { border-color: #58a6ff; }
#fb-v6-panel .profile-top {
  display: flex; gap: 12px; align-items: center; margin-bottom: 10px;
}
#fb-v6-panel .profile-top .info { flex: 1; }
#fb-v6-panel .profile-top .info .name { font-size: 16px; font-weight: 700; color: #f0f6fc; }
#fb-v6-panel .profile-top .info .sub { font-size: 11px; color: #8b949e; margin-top: 2px; }
#fb-v6-panel .tag {
  display: inline-block; background: #1f6feb22; color: #58a6ff;
  padding: 1px 8px; border-radius: 8px; font-size: 11px;
  border: 1px solid #1f6feb33; margin: 1px;
}
#fb-v6-panel .tag.grn { background: #23863622; color: #3fb950; border-color: #23863644; }
#fb-v6-panel .tag.ylw { background: #d2992222; color: #d29922; border-color: #d2992244; }
#fb-v6-panel .tag.red { background: #da363322; color: #f85149; border-color: #da363344; }
#fb-v6-panel .friend-item, #fb-v6-panel .post-item {
  padding: 6px 8px; border-bottom: 1px solid #21262d; font-size: 12px;
}
#fb-v6-panel .friend-item:last-child, #fb-v6-panel .post-item:last-child { border-bottom: none; }
#fb-v6-panel .friend-item .fn { color: #c9d1d9; }
#fb-v6-panel .friend-item .fl { color: #8b949e; font-size: 10px; }
#fb-v6-panel .post-item .pt { color: #c9d1d9; }
#fb-v6-panel .post-item .pm { color: #8b949e; font-size: 10px; margin-top: 2px; }
#fb-v6-panel .bot-bar {
  display: flex; gap: 4px; padding: 8px 14px;
  border-top: 1px solid #21262d; flex-shrink: 0;
}
#fb-v6-panel .bot-bar button {
  flex: 1; padding: 6px 8px; border-radius: 8px; border: 1px solid #30363d;
  background: #21262d; color: #c9d1d9; cursor: pointer; font-size: 11px;
  font-family: inherit; font-weight: 600; transition: all 0.15s;
}
#fb-v6-panel .bot-bar button:hover { background: #30363d; }
#fb-v6-panel .bot-bar button.pri { background: #1f6feb33; border-color: #58a6ff; color: #58a6ff; }
#fb-v6-panel .bot-bar button.pri:hover { background: #1f6feb55; }
#fb-v6-panel .bot-bar button.del { border-color: #da3633; color: #f85149; }
#fb-v6-panel .bot-bar button.del:hover { background: #da363322; }
#fb-v6-panel .st { font-size: 11px; color: #484f58; text-align: center; padding: 4px 0 0; flex-shrink: 0; }
#fb-v6-panel .emp { color: #484f58; text-align: center; padding: 30px 20px; font-size: 12px; }
#fb-v6-panel .emp span { font-size: 32px; display: block; margin-bottom: 8px; }
#fb-v6-panel .badge { font-size: 10px; color: #8b949e; }
#fb-v6-panel .pill {
  display: inline-block; background: #21262d; padding: 2px 10px;
  border-radius: 10px; font-size: 11px; color: #8b949e; margin: 2px;
}
#fb-v6-panel .pill.act { background: #1f6feb33; color: #58a6ff; border: 1px solid #1f6feb44; }
#fb-v6-panel .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
#fb-v6-panel .grid-2 button {
  background: #21262d; border: 1px solid #30363d; border-radius: 8px;
  color: #8b949e; cursor: pointer; padding: 6px; font-size: 11px;
  text-align: center; transition: all 0.15s; font-family: inherit;
}
#fb-v6-panel .grid-2 button:hover { background: #30363d; color: #c9d1d9; }
#fb-v6-panel .ll { color: #58a6ff; text-decoration: none; }
#fb-v6-panel .ll:hover { text-decoration: underline; }
#fb-v6-panel .sc { overflow-x: auto; white-space: nowrap; padding: 4px 0; }
#fb-v6-panel .sc::-webkit-scrollbar { height: 4px; }
#fb-v6-panel .sc::-webkit-scrollbar-thumb { background: #30363d; border-radius: 4px; }
#fb-v6-global-btn {
  position: fixed; bottom: 72px; right: 16px;
  width: 44px; height: 44px; border-radius: 50%;
  background: #161b22; border: 1px solid #30363d; color: #58a6ff;
  font-size: 20px; cursor: pointer; z-index: 999998;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3); transition: all 0.15s;
  display: flex; align-items: center; justify-content: center;
}
#fb-v6-global-btn:hover { background: #1f6feb22; border-color: #58a6ff; transform: scale(1.05); }
`);

// ============================================================
//  📦 存储器
// ============================================================
const Store = {
  load() { try { return JSON.parse(GM_getValue(CONFIG.saveKey, '[]')); } catch(e) { return []; } },
  save(data) {
    const all = this.load();
    const idx = all.findIndex(x => x.uid === data.uid);
    if (idx >= 0) all[idx] = {...all[idx], ...data, savedAt: Date.now()};
    else all.unshift({...data, savedAt: Date.now()});
    GM_setValue(CONFIG.saveKey, JSON.stringify(all.slice(0, 200)));
  },
  getAll() { return this.load(); },
  delete(uid) {
    const all = this.load().filter(x => x.uid !== uid);
    GM_setValue(CONFIG.saveKey, JSON.stringify(all));
  },
  get(uid) { return this.load().find(x => x.uid === uid) || null; },
};

// ============================================================
//  🔍 核心提取器
// ============================================================
const Extractor = {

  // === 主入口 ===
  run() {
    const data = { url: window.location.href, capturedAt: Date.now() };
    this._fromJSON(data);
    this._fromDOM(data);
    this._friends(data);
    this._posts(data);
    this._linkAccounts(data);
    data.portrait = this._buildPortrait(data);
    return data;
  },

  // === 策略1: FB 内嵌 JSON ===
  _fromJSON(data) {
    const scripts = document.querySelectorAll('script[type="application/json"]');
    const pid = window.location.pathname.split('/').filter(Boolean)[0] || '';
    if (!pid || ['messages','groups','photos','videos','watch','marketplace','friends','events','settings','notifications','stories','me'].includes(pid)) return;

    for (const s of scripts) {
      try {
        const raw = s.textContent || '';
        if (raw.length < 500 || !raw.includes('"name"')) continue;
        let parsed; try { parsed = JSON.parse(raw); } catch(e) { continue; }
        const found = this._findProfile(parsed, pid);
        if (found && found.name) {
          if (found.name) data.name = found.name;
          if (found.id) data.uid = String(found.id);
          if (found.username) data.username = found.username;
          if (found.location) data.location = typeof found.location === 'string' ? found.location : (found.location.name || '');
          if (found.hometown) data.hometown = typeof found.hometown === 'string' ? found.hometown : (found.hometown.name || '');
          if (found.work || found.workplaces) {
            const ws = found.work || found.workplaces || [];
            data.work = (Array.isArray(ws) ? ws : [ws]).filter(Boolean).map(w => (w.employer?.name) || w.name || '').filter(Boolean).join('; ');
          }
          if (found.education || found.education_history) {
            const es = found.education || found.education_history || [];
            data.education = (Array.isArray(es) ? es : [es]).filter(Boolean).map(e => (e.school?.name) || e.name || '').filter(Boolean).join('; ');
          }
          if (found.relationship_status || found.relationship) {
            const r = found.relationship_status || found.relationship;
            data.relationship = typeof r === 'string' ? r : (r.name || '');
          }
          if (found.birthday) data.birthday = typeof found.birthday === 'string' ? found.birthday : (found.birthday.text || '');
          if (found.gender) data.gender = typeof found.gender === 'string' ? found.gender : (found.gender.name || '');
          if (found.email) data.email = found.email;
          if (found.mobile_phone || found.phone) data.phone = found.mobile_phone || found.phone;
          if (found.bio || found.about) data.bio = (found.bio || found.about).slice(0, 400);
          if (found.friends_count || found.friend_count) {
            const f = found.friends_count || found.friend_count;
            data.friendsCount = typeof f === 'object' ? (f.count || 0) : f;
          }
          if (found.followers_count) data.followersCount = found.followers_count;
          break;
        }
      } catch(e) {}
    }
  },

  _findProfile(obj, pid) {
    if (!obj || typeof obj !== 'object') return null;
    if (!Array.isArray(obj) && obj.name && (obj.id || obj.user_id)) {
      const uid = String(obj.id || obj.user_id);
      if (uid.includes(pid) || pid.includes(uid) || (obj.username === pid)) return obj;
    }
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (val && typeof val === 'object') {
        if (Array.isArray(val) && val.length > 100) continue;
        const found = this._findProfile(val, pid);
        if (found && found.name) return found;
      }
    }
    return null;
  },

  // === 策略2: DOM 提取 ===
  _fromDOM(data) {
    // 名字
    if (!data.name) {
      for (const sel of ['h1 span','h1','[data-pagelet="Profile"] h1','span.xdj266r span.x1jchvi3','h2.x1heor9g','strong']) {
        const el = document.querySelector(sel);
        if (el && el.textContent.trim().length > 2) { data.name = el.textContent.trim(); break; }
      }
    }
    // 头像
    for (const sel of ['img.x1b0d499.x1dofw5p','image[alt*="profile"]','circle image','img.x1rg5ohu']) {
      const el = document.querySelector(sel);
      if (el) {
        let src = el.getAttribute('xlink:href') || el.src || '';
        src = src.replace(/\/[ps]\d+x\d+\//, '/p960x960/');
        data.avatarUrl = src; break;
      }
    }
    // UID
    if (!data.uid) data.uid = this._extractUID();
    // Profile ID from URL
    data.profileId = data.profileId || window.location.pathname.match(/([^/?]+)/)?.[1] || '';

    // ====== 定向提取 ProfileTilesFeed (个人详情区块) ======
    // Facebook 新版个人页用 ProfileTilesFeed 渲染个人信息
    if (!data.location || !data.gender) {
      this._fromTiles(data);
    }

    // 后面的字段只在 JSON 没给够时才扫 DOM 文本
    if (!data.location || !data.work || !data.education || !data.hometown) {
      const pt = this._profileText();
      if (pt) {
        // 英文
        const m1 = pt.match(/Lives in\s+([^\n,]+)/i);  if (m1 && !data.location) data.location = m1[1].trim();
        const m2 = pt.match(/(?:^|\n)From\s+([^\n,]+)/i); if (m2 && !data.hometown) data.hometown = m2[1].trim();
        const m3 = pt.match(/Works at\s+([^\n,]+)/i); if (m3 && !data.work) data.work = m3[1].trim();
        const m4 = pt.match(/(?:Studied at|Went to)\s+([^\n,]+)/i); if (m4 && !data.education) data.education = m4[1].trim();
        // 中文
        const c1 = pt.match(/住在\s*([^\n,]+)/); if (c1 && !data.location) data.location = c1[1].trim();
        const c2 = pt.match(/来自\s*([^\n,]+)/); if (c2 && !data.hometown) data.hometown = c2[1].trim();
        const c3 = pt.match(/工作\s*(?:于|在)\s*([^\n,]+)/i); if (c3 && !data.work) data.work = c3[1].trim();
        const c4 = pt.match(/(?:就读于|曾在)\s*([^\n,]+)/); if (c4 && !data.education) data.education = c4[1].trim();
      }
    }
    // 关系状态 (中英文)
    if (!data.relationship) {
      const statuses = ['Single','In a relationship','Married','Engaged','Divorced','Widowed','单身','恋爱中','已婚','订婚','离异','丧偶'];
      const profileArea = document.querySelector('[data-pagelet="Profile"],[data-pagelet="ProfileAbout"]');
      if (profileArea) {
        const t = profileArea.textContent;
        for (const s of statuses) { if (t.includes(s)) { data.relationship = s; break; } }
      }
    }
    // 性别 (中文)
    if (!data.gender) {
      const profileArea = document.querySelector('[data-pagelet="Profile"],[data-pagelet="ProfileAbout"]');
      if (profileArea) {
        const t = profileArea.textContent;
        if (t.includes('女性') || t.includes('女')) data.gender = '女性';
        else if (t.includes('男性') || t.includes('男')) data.gender = '男性';
      }
    }
    // 生日 (中英文)
    if (!data.birthday) {
      const bd1 = document.body.innerText.match(/Birthday\s*:?\s*(\w+\s+\d{1,2}(?:,\s*\d{4})?)/i);
      if (bd1) data.birthday = bd1[1];
      const bd2 = document.body.innerText.match(/生日\s*:?\s*(\d{1,2}\s*月\s*\d{1,2}\s*日(?:\s*\d{4})?)/);
      if (bd2 && !data.birthday) data.birthday = bd2[1];
    }
    // 简介
    if (!data.bio) {
      const about = document.querySelector('[data-pagelet="Profile"] [role="article"],[data-pagelet="ProfileAbout"]');
      if (about) {
        const t = about.textContent.trim();
        if (t.length > 10 && t.length < 1000) data.bio = t.slice(0, 400);
      }
    }
    // 好友/粉丝数 (中英文)
    if (!data.friendsCount) {
      const fc1 = document.body.innerText.match(/([\d,]+)\s*(?:friends?|mutual friends?)/i);
      if (fc1) data.friendsCount = fc1[1];
      const fc2 = document.body.innerText.match(/([\d,]+)\s*(?:位好友|个好友)/);
      if (fc2 && !data.friendsCount) data.friendsCount = fc2[1];
    }
  },

  /**
   * 定向提取 ProfileTilesFeed 区块 (新版 FB 个人详情卡片)
   * Facebook 用 data-pagelet="ProfileTilesFeed_*" 渲染: 所在地、家乡、性别、工作等
   */
  _fromTiles(data) {
    // 找所有 ProfileTilesFeed
    const tilesFeeds = document.querySelectorAll('[data-pagelet^="ProfileTilesFeed"]');
    if (!tilesFeeds.length) return;

    for (const feed of tilesFeeds) {
      const text = feed.textContent;

      // 找标题: 每个 tiles feed 有个 h2
      const h2 = feed.querySelector('h2');
      if (!h2) continue;
      const sectionTitle = h2.textContent.trim();

      if (sectionTitle.includes('个人详情') || sectionTitle.includes('Details') || sectionTitle.includes('About')) {
        // 这个 feed 包含 所在地/家乡/性别 等
        const items = feed.querySelectorAll('[role="listitem"] span span, [role="listitem"] [dir="auto"]');
        for (const item of items) {
          const t = item.textContent.trim();
          if (!t || t.length < 2) continue;

          if (t.startsWith('住在') || t.startsWith('Lives in')) {
            const val = t.replace(/^住在\s*|^Lives in\s*/i, '').trim();
            if (val && !data.location) data.location = val;
          } else if (t.startsWith('来自') || t.startsWith('From')) {
            const val = t.replace(/^来自\s*|^From\s*/i, '').trim();
            if (val && !data.hometown) data.hometown = val;
          } else if (t === '女性' || t === '女') {
            if (!data.gender) data.gender = '女性';
          } else if (t === '男性' || t === '男') {
            if (!data.gender) data.gender = '男性';
          } else if (t === 'Female') {
            if (!data.gender) data.gender = 'Female';
          } else if (t === 'Male') {
            if (!data.gender) data.gender = 'Male';
          }
        }
      } else if (sectionTitle.includes('工作') || sectionTitle.includes('Work') || sectionTitle.includes('Employment')) {
        // 工作经历
        const items = feed.querySelectorAll('[role="listitem"]');
        for (const item of items) {
          const spans = item.querySelectorAll('span[dir="auto"]');
          for (const span of spans) {
            const t = span.textContent.trim();
            if (t && t.length > 2 && t.length < 100 && !t.match(/^\d/) && !t.includes('·') && !t.includes('月') && !t.includes('年')) {
              if (!data.work) data.work = t;
              break;
            }
          }
          if (data.work) break;
        }
      } else if (sectionTitle.includes('教育') || sectionTitle.includes('Education') || sectionTitle.includes('School')) {
        const items = feed.querySelectorAll('[role="listitem"]');
        for (const item of items) {
          const spans = item.querySelectorAll('span[dir="auto"]');
          for (const span of spans) {
            const t = span.textContent.trim();
            if (t && t.length > 2 && t.length < 100 && !t.match(/^\d/)) {
              if (!data.education) data.education = t;
              break;
            }
          }
          if (data.education) break;
        }
      }
    }

    // Fallback: 直接扫 ProfileTilesFeed 文本
    if (!data.location || !data.hometown || !data.gender) {
      for (const feed of tilesFeeds) {
        const text = feed.textContent;
        // 中英文混合匹配
        if (!data.location) {
          const lm = text.match(/(?:住在|Lives in)\s*([^\n,]+)/i);
          if (lm) data.location = lm[1].trim();
        }
        if (!data.hometown) {
          const hm = text.match(/(?:来自|From)\s*([^\n,]+)/i);
          if (hm) data.hometown = hm[1].trim();
        }
        if (!data.gender) {
          if (/女性|Female/i.test(text)) data.gender = '女性';
          else if (/男性|Male/i.test(text)) data.gender = '男性';
        }
      }
    }
  },

  _extractUID() {
    const meta = document.querySelector('meta[property="al:android:url"],meta[property="al:ios:url"]');
    if (meta) { const c = meta.getContent()||'', m = c.match(/id=(\d+)/)||c.match(/user_id=(\d+)/); if(m) return m[1]; }
    const alt = document.querySelector('link[rel="alternate"][href*="fb://"]');
    if (alt) { const h = alt.getAttribute('href')||'', m = h.match(/profile\/(\d+)/)||h.match(/id=(\d+)/); if(m) return m[1]; }
    for (const img of document.querySelectorAll('img[src*="scontent"],img[src*="fbcdn"]')) {
      const s = img.src||'', m = s.match(/\/(\d+)_\d+_\d+_n\.jpg/)||s.match(/\/p(\d+)_/);
      if(m) return m[1];
    }
    for (const s of document.querySelectorAll('script[type="application/json"]')) {
      const m = s.textContent.match(/"uid":(\d+)/)||s.textContent.match(/"userID":(\d+)/i)||s.textContent.match(/"profile_id":(\d+)/i);
      if(m) return m[1];
    }
    const pid = window.location.pathname.split('/').filter(Boolean)[0];
    if (pid && !['messages','groups','photos','videos'].includes(pid)) return '用户:'+pid;
    return '';
  },

  _profileText() {
    const container = document.querySelector(
      '[data-pagelet="Profile"],[data-pagelet="ProfileAbout"],div[role="main"],#pagelet_timeline_main_column'
    );
    if (container) return container.textContent;
    // mbasic fallback
    return document.body.innerText.slice(0, 5000);
  },

  // === 好友列表 ===
  _friends(data) {
    const friends = [];
    const seen = new Set();
    // Try friends page if available
    const allLinks = document.querySelectorAll('a[href*="/friends/"],a[href*="/friends"],a[href*="friends_list"],a[href*="mutual_friends"],a[href*="friends_tab"]');
    for (const a of allLinks) {
      const name = a.textContent.trim();
      const href = a.getAttribute('href') || '';
      if (name && name.length > 1 && name.length < 40 && !seen.has(href)) {
        const fullUrl = href.startsWith('/') ? 'https://www.facebook.com' + href : href;
        if (fullUrl.includes('facebook.com/') && !fullUrl.includes('/groups/')) {
          seen.add(fullUrl);
          friends.push({ name, url: fullUrl });
        }
      }
    }
    // Also check friend suggestions / mutual friends in profile
    document.querySelectorAll('div[data-pagelet] a[href*="facebook.com/"][role="link"]').forEach(a => {
      const name = a.textContent.trim();
      const href = a.getAttribute('href') || '';
      if (name && name.length > 1 && name.length < 40 && !seen.has(href) && !href.includes('/groups/') && !href.includes('/photos/')) {
        const fullUrl = href.startsWith('/') ? 'https://www.facebook.com' + href : href;
        if (fullUrl.match(/facebook\.com\/[^/?]+$/) && !fullUrl.match(/facebook\.com\/(?:messages|groups|photos|marketplace|watch|events|friends|me)/)) {
          seen.add(href);
          friends.push({ name, url: fullUrl });
        }
      }
    });
    data.friends = friends.slice(0, 100);
  },

  // === 帖子 ===
  _posts(data) {
    const posts = [];
    const seen = new Set();
    const timeline = document.querySelector('[data-pagelet="ProfileTimeline"]');
    if (!timeline) { data.posts = []; return; }

    for (const el of timeline.querySelectorAll('[data-ad-preview="message"],div[dir="auto"]')) {
      const t = el.textContent.trim();
      if (t.length < 10 || t.length > 800 || seen.has(t)) continue;
      // Filter out profile metadata
      const skip = ['Lives in','Works at','Studied at','Went to','From','Add Friend','Message','Following','Suggestions','See more','Story','Photo','Video'];
      if (skip.some(s => t.startsWith(s))) continue;
      seen.add(t);
      posts.push({
        text: t.slice(0, 300),
        location: (t.match(/(?:at|in)\s+([A-Z][A-Za-z\s,]+?)(?:\.|!|\?|$)/)?.[1] || '').trim().slice(0, 40),
      });
    }
    data.posts = posts.slice(0, 50);
  },

  // === 关联账号 ===
  _linkAccounts(data) {
    const pt = this._profileText();
    const patterns = [
      { p: 'Instagram', r: /instagram\.com\/([a-zA-Z0-9_.]+)/i },
      { p: 'X/Twitter', r: /(?:twitter|x)\.com\/([a-zA-Z0-9_]+)/i },
      { p: 'LinkedIn', r: /linkedin\.com\/in\/([a-zA-Z0-9-]+)/i },
      { p: 'GitHub', r: /github\.com\/([a-zA-Z0-9-]+)/i },
      { p: 'YouTube', r: /youtube\.com\/@([a-zA-Z0-9_-]+)/i },
      { p: 'TikTok', r: /tiktok\.com\/@([a-zA-Z0-9_.]+)/i },
    ];
    const linked = [];
    const seen = new Set();
    for (const {p, r} of patterns) {
      const m = pt.match(r);
      if (m && !seen.has(p)) { seen.add(p); linked.push({ platform: p, handle: m[1] }); }
    }
    data.linkedAccounts = linked;
  },

  // === 画像生成 ===
  _buildPortrait(data) {
    const tags = [];
    const lines = [];

    // 个人信息标签
    if (data.gender) {
        const g = data.gender.toLowerCase();
        if (g === 'male' || g === '男性' || g === '男') tags.push('👨 男');
        else if (g === 'female' || g === '女性' || g === '女') tags.push('👩 女');
        else tags.push('👤 ' + data.gender);
      }
    if (data.relationship) tags.push({ 'Single':'💔 单身','In a relationship':'💑 恋爱中','Married':'💍 已婚','Engaged':'💍 订婚','Divorced':'💔 离异','Widowed':'🕊️ 丧偶' }[data.relationship] || `💕 ${data.relationship}`);
    if (data.birthday) {
      const age = data.birthday.match(/\d{4}/);
      if (age) {
        const a = new Date().getFullYear() - parseInt(age[0]);
        tags.push(`🎂 ${a}岁`);
        lines.push(`推测年龄: ${a}岁 (生日: ${data.birthday})`);
      } else tags.push(`🎂 ${data.birthday}`);
    }
    if (data.location) {
      tags.push(`📍 ${data.location.split(',')[0]}`);
      lines.push(`所在地: ${data.location}`);
    }
    if (data.hometown) lines.push(`家乡: ${data.hometown}`);
    if (data.work) lines.push(`工作: ${data.work}`);
    if (data.education) lines.push(`教育: ${data.education}`);
    if (data.phone) lines.push(`📞 手机: ${data.phone}`);
    if (data.email) lines.push(`✉️ 邮箱: ${data.email}`);
    if (data.username) lines.push(`@用户名: ${data.username}`);
    if (data.friendsCount) lines.push(`好友数: ${data.friendsCount}`);
    if (data.followersCount) lines.push(`粉丝数: ${data.followersCount}`);
    if (data.friends) lines.push(`采集到好友: ${data.friends.length} 人`);
    if (data.posts) lines.push(`采集到帖子: ${data.posts.length} 条`);

    // Bio 摘要
    if (data.bio) {
      const bioShort = data.bio.length > 80 ? data.bio.slice(0, 80) + '…' : data.bio;
      lines.push(`简介: ${bioShort}`);
      // Extract keywords from bio
      const stopWords = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','from','is','am','are','was','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','shall','can','need','dare','ought','used','this','that','these','those','i','my','me','we','our','you','your','he','him','his','she','her','it','its','they','them','their','not','no','nor','so','if','as','up','out','about','who','what','when','where','why','how','all','each','every','both','few','more','most','some','any','none','just','also','very','too','really','here','there','now','then','only','own','same','like','是','的','了','在','有','和','就','不','人','都','一','一个','上','也','很','到','说','要','去','你','会','着','没有','看','好','自己']);
      const words = data.bio.toLowerCase().replace(/[^a-z\u4e00-\u9fff\s-]/g, '').split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
      const freq = {};
      words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
      const topKeywords = Object.entries(freq).sort((a,b) => b[1]-a[1]).slice(0, 5).map(x => x[0]);
      if (topKeywords.length > 0) lines.push(`兴趣词: ${topKeywords.join(', ')}`);
    }

    // Linked accounts
    if (data.linkedAccounts && data.linkedAccounts.length > 0) {
      lines.push(`关联账号: ${data.linkedAccounts.map(a => `${a.platform}: ${a.handle}`).join(' | ')}`);
    }

    data.portrait = { tags, lines };
    return data.portrait;
  },
};

// ============================================================
//  🖼️ UI 渲染
// ============================================================
let panel = null;
let activeTab = 'portrait';
let panelVisible = false;

function render(data) {
  if (panel) { panel.remove(); panel = null; }
  panel = document.createElement('div');
  panel.id = 'fb-v6-panel';
  panel.innerHTML = htmlPanel(data);
  document.body.appendChild(panel);
  panelVisible = true;
  bindEvents(data);
}

function htmlPanel(data) {
  const p = data.portrait || { tags: [], lines: [] };
  const hasData = data.name || data.uid;

  return `
<div class="hdr">
  <span class="ttl">🎯 目标画像 <small>v6 · ${data.name || '未识别'}</small></span>
  <span class="btns">
    <button id="v6-refresh">🔄</button>
    <button id="v6-close">✕</button>
  </span>
</div>
<div class="body">
  <div class="tabs">
    <button class="act" data-tab="portrait">🎯 画像</button>
    <button data-tab="info">📋 详情</button>
    <button data-tab="friends">👥 好友${data.friends ? ` (${data.friends.length})` : ''}</button>
    <button data-tab="posts">📰 帖子${data.posts ? ` (${data.posts.length})` : ''}</button>
    <button data-tab="links">🔗 关联</button>
    <button data-tab="saved">💾 已存</button>
  </div>
  <div id="v6-content">${tabContent('portrait', data)}</div>
</div>
<div class="bot-bar">
  <button class="pri" id="v6-save">💾 保存</button>
  <button id="v6-copy">📋 复制画像</button>
  <button id="v6-export">📄 JSON导出</button>
  <button class="del" id="v6-del">🗑️</button>
</div>
<div class="st" id="v6-status">${hasData ? '✅ 已采集 ' + new Date().toLocaleTimeString() : '⏳ 未识别到数据'}</div>`;
}

function tabContent(tab, data) {
  const p = data.portrait || { tags: [], lines: [] };
  switch (tab) {
    case 'portrait': return tabPortrait(data, p);
    case 'info': return tabInfo(data);
    case 'friends': return tabFriends(data);
    case 'posts': return tabPosts(data);
    case 'links': return tabLinks(data);
    case 'saved': return tabSaved(data);
    default: return '';
  }
}

function tabPortrait(data, p) {
  if (!data.name && !data.uid) return `<div class="emp"><span>📭</span>未识别到目标数据<br><small style="color:#484f58">请确保在 Facebook 个人主页上</small></div>`;

  let h = '';

  // 头像 + 名称
  h += `<div class="profile-top">`;
  if (data.avatarUrl) h += `<img class="avatar" id="v6-avatar" src="${data.avatarUrl}" />`;
  h += `<div class="info"><div class="name">${data.name || '未知'}</div>`;
  h += `<div class="sub">`;
  if (data.uid) h += `<span class="tag">🆔 ${data.uid}</span> `;
  if (data.profileId) h += `<span class="tag grn">${data.profileId}</span> `;
  if (data.friendsCount) h += `<span class="tag ylw">👥 ${data.friendsCount}</span> `;
  if (data.followersCount) h += `<span class="tag">⭐ ${data.followersCount}</span>`;
  h += `</div></div></div>`;

  // 标签条
  if (p.tags && p.tags.length > 0) {
    h += `<div class="card"><div class="sc">${p.tags.map(t => `<span class="pill act">${t}</span>`).join(' ')}</div></div>`;
  }

  // 画像详情
  if (p.lines && p.lines.length > 0) {
    h += `<div class="card"><h3>📋 目标画像</h3>`;
    h += p.lines.map(l => `<div class="row"><span class="val">${l}</span></div>`).join('');
    h += `</div>`;
  }

  // 简介
  if (data.bio) {
    h += `<div class="card"><h3>📝 简介</h3><div class="val" style="line-height:1.5">${data.bio}</div></div>`;
  }

  return h;
}

function tabInfo(data) {
  if (!data.name) return `<div class="emp"><span>📭</span>无数据</div>`;

  const fields = [
    ['👤 姓名', data.name, ''],
    ['🆔 UID', data.uid, 'uid'],
    ['🔗 主页', data.url, ''],
    ['@ 用户名', data.username, ''],
    ['📍 所在地', data.location, ''],
    ['🏠 家乡', data.hometown, ''],
    ['💼 工作', data.work, ''],
    ['🎓 教育', data.education, ''],
    ['💕 感情', data.relationship, ''],
    ['🎂 生日', data.birthday, ''],
    ['👤 性别', data.gender, ''],
    ['📞 电话', data.phone, 'ph'],
    ['✉️ 邮箱', data.email, ''],
    ['👥 好友数', data.friendsCount, ''],
    ['⭐ 粉丝数', data.followersCount, ''],
  ].filter(f => f[1]);

  let h = `<div class="card"><h3>📋 个人详情</h3>`;
  fields.forEach(([label, val, cls]) => {
    h += `<div class="row">
      <span class="lbl">${label}</span>
      <span class="val ${cls}">${escHtml(String(val))}</span>
      <button class="cpy" data-copy="${escHtml(String(val))}">📋</button>
    </div>`;
  });
  h += `</div>`;
  return h;
}

function tabFriends(data) {
  if (!data.friends || data.friends.length === 0) return `<div class="emp"><span>👥</span>未找到好友列表<br><small style="color:#484f58">需要访问好友页面或滚动加载</small></div>`;

  let h = `<div class="card"><h3>👥 好友 (${data.friends.length})</h3>`;
  data.friends.slice(0, 80).forEach(f => {
    h += `<div class="friend-item">
      <span class="fn">${escHtml(f.name)}</span>
      <span class="fl"><a class="ll" href="${f.url}" target="_blank">↗</a></span>
    </div>`;
  });
  if (data.friends.length > 80) h += `<div class="emp">...还有 ${data.friends.length - 80} 个</div>`;
  h += `</div>`;
  return h;
}

function tabPosts(data) {
  if (!data.posts || data.posts.length === 0) return `<div class="emp"><span>📰</span>未找到帖子<br><small style="color:#484f58">需要滚动 timeline 加载更多</small></div>`;

  let h = `<div class="card"><h3>📰 帖子 (${data.posts.length})</h3>`;
  data.posts.forEach(p => {
    h += `<div class="post-item">
      <div class="pt">${escHtml(p.text)}</div>
      ${p.location ? `<div class="pm">📍 ${escHtml(p.location)}</div>` : ''}
    </div>`;
  });
  h += `</div>`;
  return h;
}

function tabLinks(data) {
  let h = '';
  if (data.linkedAccounts && data.linkedAccounts.length > 0) {
    h += `<div class="card"><h3>🔗 关联账号</h3>`;
    data.linkedAccounts.forEach(a => {
      const urls = {
        'Instagram': `https://instagram.com/${a.handle}`,
        'X/Twitter': `https://x.com/${a.handle}`,
        'LinkedIn': `https://linkedin.com/in/${a.handle}`,
        'GitHub': `https://github.com/${a.handle}`,
        'YouTube': `https://youtube.com/@${a.handle}`,
        'TikTok': `https://tiktok.com/@${a.handle}`,
      };
      const url = urls[a.platform] || '';
      h += `<div class="row"><span class="lbl">${a.platform}</span><span class="val">@${a.handle} ${url ? `<a class="ll" href="${url}" target="_blank">↗</a>` : ''}</span></div>`;
    });
    h += `</div>`;
  }

  // 全局搜索快捷按钮
  h += `<div class="card"><h3>🔍 搜索工具</h3>
  <div class="grid-2">
    <button onclick="window.open('https://www.google.com/search?q=${encodeURIComponent(data.name||'')}')">🔍 Google</button>
    <button onclick="window.open('https://www.google.com/search?q=${encodeURIComponent(data.name||'')}+${encodeURIComponent(data.location||'')}+linkedin')">💼 LinkedIn</button>
    <button onclick="window.open('https://pipl.com/search/?q=${encodeURIComponent(data.name||'')}&l=${encodeURIComponent(data.location||'')}')">🔎 Pipl</button>
    <button onclick="window.open('https://dehashed.com/search?query=${encodeURIComponent(data.email||data.phone||data.name||'')}')">🗝️ Dehashed</button>
    <button onclick="window.open('https://haveibeenpwned.com/account/${encodeURIComponent(data.email||'')}')">🛡️ HIBP</button>
    <button onclick="window.open('https://github.com/search?q=${encodeURIComponent(data.name||'')}')">🐙 GitHub</button>
  </div></div>`;
  return h || `<div class="emp"><span>🔗</span>暂未发现</div>`;
}

function tabSaved() {
  const all = Store.getAll();
  if (!all.length) return `<div class="emp"><span>💾</span>还没有保存的记录</div>`;

  let h = `<div class="card"><h3>💾 已保存 (${all.length})</h3>`;
  all.forEach(d => {
    const time = d.savedAt ? new Date(d.savedAt).toLocaleString() : '';
    h += `<div class="row" style="cursor:pointer" data-load="${d.uid}">
      <span class="val" style="flex:1"><strong>${escHtml(d.name || '未知')}</strong> ${d.uid ? `<span class="badge">${d.uid}</span>` : ''}</span>
      <span class="badge">${time}</span>
    </div>`;
  });
  h += `<div class="row"><button id="v6-clear-all" style="background:none;border:none;color:#f85149;cursor:pointer;font-size:11px;padding:4px 0;">🗑️ 清空全部</button></div>`;
  h += `</div>`;
  return h;
}

// ============================================================
//  🎮 事件绑定
// ============================================================
function bindEvents(data) {
  // Tab switching
  document.querySelectorAll('#v6-content').onclick = (e) => {
    const btn = e.target.closest('[data-tab]');
    if (btn) {
      document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('act'));
      btn.classList.add('act');
      activeTab = btn.dataset.tab;
      document.getElementById('v6-content').innerHTML = tabContent(activeTab, data);
    }
  };
  // Use event delegation instead
  const tabs = document.querySelector('.tabs');
  if (tabs) tabs.onclick = (e) => {
    const btn = e.target.closest('button');
    if (btn && btn.dataset.tab) {
      document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('act'));
      btn.classList.add('act');
      activeTab = btn.dataset.tab;
      document.getElementById('v6-content').innerHTML = tabContent(activeTab, data);
    }
  };

  document.getElementById('v6-refresh').onclick = () => {
    const newData = Extractor.run();
    document.getElementById('v6-content').innerHTML = tabContent(activeTab, newData);
    document.getElementById('v6-status').textContent = '🔄 已刷新 ' + new Date().toLocaleTimeString();
    // Update header title
    document.querySelector('.hdr .ttl small').textContent = '· ' + (newData.name || '未识别');
    data = newData;
  };

  document.getElementById('v6-close').onclick = () => {
    panel.remove(); panel = null; panelVisible = false;
  };

  document.getElementById('v6-save').onclick = () => {
    Store.save(data);
    setStatus('💾 已保存!');
  };

  document.getElementById('v6-copy').onclick = () => {
    if (data.portrait) {
      const lines = [ `🎯 目标: ${data.name || '未知'} (${data.uid || ''})`, `🔗 ${data.url}`, '', ...data.portrait.lines ];
      const text = lines.join('\n');
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => setStatus('📋 已复制!')).catch(() => fallbackCopy(text));
      } else fallbackCopy(text);
    }
  };

  document.getElementById('v6-export').onclick = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `FB_${data.profileId || data.uid || 'target'}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    setStatus('📄 已导出 JSON');
  };

  document.getElementById('v6-del').onclick = () => {
    if (data.uid && confirm('删除已保存的这条记录？')) {
      Store.delete(data.uid);
      setStatus('🗑️ 已删除');
      if (activeTab === 'saved') document.getElementById('v6-content').innerHTML = tabSaved();
    }
  };

  // Copy buttons
  document.querySelectorAll('.cpy').forEach(btn => {
    btn.onclick = () => {
      const text = btn.getAttribute('data-copy') || btn.previousElementSibling.textContent;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => { btn.textContent = '✅'; setTimeout(() => btn.textContent = '📋', 1000); });
      } else fallbackCopy(text);
    };
  });

  // Load saved record
  document.querySelectorAll('[data-load]').forEach(el => {
    el.onclick = () => {
      const saved = Store.get(el.dataset.load);
      if (saved) {
        data = saved;
        document.getElementById('v6-content').innerHTML = tabContent(activeTab, saved);
        document.querySelector('.hdr .ttl small').textContent = '· ' + (saved.name || '');
        setStatus('📂 已加载保存的记录');
      }
    };
  });

  // Clear all saved
  const clearBtn = document.getElementById('v6-clear-all');
  if (clearBtn) clearBtn.onclick = () => {
    if (confirm('清空所有保存的数据？')) {
      GM_setValue(CONFIG.saveKey, '[]');
      document.getElementById('v6-content').innerHTML = tabSaved();
      setStatus('🗑️ 已清空');
    }
  };

  // Drag header
  const hdr = document.querySelector('.hdr');
  if (hdr) {
    let dragging = false, sx, sy, ox, oy;
    hdr.onmousedown = (e) => {
      if (e.target.closest('.btns')) return;
      dragging = true; sx = e.clientX; sy = e.clientY;
      ox = panel.offsetLeft; oy = panel.offsetTop;
    };
    document.onmousemove = (e) => {
      if (!dragging) return;
      panel.style.left = (ox + e.clientX - sx) + 'px';
      panel.style.top = (oy + e.clientY - sy) + 'px';
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
    };
    document.onmouseup = () => { dragging = false; };
  }
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); setStatus('📋 已复制!'); } catch(e) { setStatus('❌ 复制失败'); }
  document.body.removeChild(ta);
}

function escHtml(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function setStatus(msg) {
  const el = document.getElementById('v6-status');
  if (el) { el.textContent = msg; setTimeout(() => { el.textContent = '✅ 就绪'; }, 2000); }
}

// ============================================================
//  🚀 全局按钮 + 自动触发
// ============================================================
function createFloatBtn() {
  if (document.getElementById('fb-v6-global-btn')) return;
  const btn = document.createElement('button');
  btn.id = 'fb-v6-global-btn';
  btn.textContent = '🎯';
  btn.title = 'Ctrl+Shift+P 打开面板';
  btn.onclick = () => {
    if (panel) { panel.remove(); panel = null; panelVisible = false; return; }
    const data = Extractor.run();
    render(data);
  };
  document.body.appendChild(btn);
}

// Hotkey
document.addEventListener('keydown', e => {
  if (e.ctrlKey && e.shiftKey && e.key === 'P') {
    e.preventDefault();
    if (panel) { panel.remove(); panel = null; panelVisible = false; return; }
    const data = Extractor.run();
    render(data);
  }
});

// Auto-trigger on profile pages
function autoTrigger() {
  const url = window.location.href;
  const pid = window.location.pathname.split('/').filter(Boolean)[0] || '';
  if (!pid || ['messages','groups','photos','videos','watch','marketplace','friends','events','settings','notifications','stories'].includes(pid)) return;

  setTimeout(() => {
    const data = Extractor.run();
    if (data.name) {
      // Check if we already have this saved — show notification
      const existing = Store.get(data.uid);
      render(data);
      if (existing) setStatus('💾 已有保存记录 (' + new Date(existing.savedAt).toLocaleString() + ')');
    }
  }, 3000);
}

// ============================================================
//  🏁 Init
// ============================================================
function init() {
  setTimeout(createFloatBtn, 1500);
  setTimeout(autoTrigger, 2500);

  // Re-trigger on navigation
  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      if (panel) { panel.remove(); panel = null; panelVisible = false; }
      setTimeout(autoTrigger, 2000);
    }
  }).observe(document.body, { childList: true, subtree: true });

  console.log('🎯 FB 信息助手 v6 — By.阿趣 🎀');
  console.log('Ctrl+Shift+P 打开面板');
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

})();
