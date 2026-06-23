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
  background: #F0F8FF; color: #3A5A7A;
  border: 2px solid #87CEEB; border-radius: 18px;
  box-shadow: 0 8px 32px rgba(135,206,235,0.3);
  z-index: 999999; font: 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans SC', sans-serif;
  display: flex; flex-direction: column; overflow: hidden;
  transition: transform 0.25s ease, opacity 0.25s ease;
}
#fb-v6-panel.hidden { opacity: 0; pointer-events: none; }
#fb-v6-panel .hdr {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 16px;
  background: linear-gradient(90deg, #87CEEB, #A8D8EA, #87CEEB);
  border-bottom: 2px solid #6BB5D9;
  border-radius: 16px 16px 0 0;
  cursor: move; user-select: none; flex-shrink: 0;
}
#fb-v6-panel .hdr .ttl { font-weight: 700; font-size: 14px; color: white; text-shadow: 0 1px 2px rgba(0,0,0,0.1); }
#fb-v6-panel .hdr .ttl small { font-weight: 400; font-size: 10px; color: rgba(255,255,255,0.85); }
#fb-v6-panel .hdr .author {
  font-weight: 400; font-size: 10px; color: rgba(255,255,255,0.85);
  display: block; margin-top: 1px;
}
#fb-v6-panel .hdr .btns button {
  background: rgba(255,255,255,0.3); border: none; color: white;
  cursor: pointer; font-size: 14px; padding: 2px 8px; border-radius: 8px; margin-left: 4px;
  transition: all 0.2s;
}
#fb-v6-panel .hdr .btns button:hover { background: rgba(255,255,255,0.55); }
#fb-v6-panel .body { overflow-y: auto; padding: 10px 14px; flex: 1; }
#fb-v6-panel .tabs {
  display: flex; gap: 3px; margin-bottom: 10px;
  border-bottom: 2px solid #D4EDFB; padding-bottom: 6px; flex-wrap: wrap; flex-shrink: 0;
}
#fb-v6-panel .tabs button {
  background: none; border: none; color: #8AB4D6; cursor: pointer;
  padding: 4px 9px; border-radius: 10px; font-size: 11px; font-weight: 600;
  transition: all 0.2s; font-family: inherit;
}
#fb-v6-panel .tabs button.act { background: #87CEEB; color: white; box-shadow: 0 2px 6px rgba(135,206,235,0.3); }
#fb-v6-panel .tabs button:hover:not(.act) { background: #D4EDFB; }
#fb-v6-panel .card {
  background: white; border: 1px solid #D4EDFB;
  border-radius: 14px; padding: 12px; margin-bottom: 8px;
}
#fb-v6-panel .card h3 {
  font-size: 11px; color: #8AB4D6; font-weight: 600;
  margin-bottom: 8px; letter-spacing: 0.3px;
}
#fb-v6-panel .row {
  display: flex; padding: 5px 0; border-bottom: 1px solid #F0F8FF;
  font-size: 12px; align-items: flex-start;
}
#fb-v6-panel .row:last-child { border-bottom: none; }
#fb-v6-panel .row .lbl { color: #8AB4D6; min-width: 70px; flex-shrink: 0; font-size: 11px; }
#fb-v6-panel .row .val { color: #3A5A7A; word-break: break-word; }
#fb-v6-panel .row .val.ph { color: #7BC99A; font-family: monospace; font-size: 13px; }
#fb-v6-panel .row .val.uid { color: #5BA3C9; font-family: monospace; }
#fb-v6-panel .row .cpy {
  background: none; border: none; color: #D4EDFB; cursor: pointer;
  font-size: 12px; padding: 0 4px; flex-shrink: 0; margin-left: auto; transition: all 0.2s;
}
#fb-v6-panel .row .cpy:hover { color: #87CEEB; }
#fb-v6-panel .avatar {
  width: 56px; height: 56px; border-radius: 50%; object-fit: cover;
  border: 3px solid #87CEEB; cursor: pointer; flex-shrink: 0; transition: all 0.2s;
}
#fb-v6-panel .avatar:hover { border-color: #5BA3C9; transform: scale(1.05); }
#fb-v6-panel .profile-top {
  display: flex; gap: 12px; align-items: center; margin-bottom: 10px;
}
#fb-v6-panel .profile-top .info { flex: 1; }
#fb-v6-panel .profile-top .info .name { font-size: 16px; font-weight: 700; color: #3A5A7A; }
#fb-v6-panel .profile-top .info .sub { font-size: 11px; color: #8AB4D6; margin-top: 2px; }
#fb-v6-panel .tag {
  display: inline-block; background: #E8F4FD; color: #5BA3C9;
  padding: 1px 8px; border-radius: 8px; font-size: 11px;
  border: 1px solid #C5E5F7; margin: 1px;
}
#fb-v6-panel .tag.grn { background: #E6F9ED; color: #3FB950; border-color: #B8E6C8; }
#fb-v6-panel .tag.ylw { background: #FFF8E1; color: #D29922; border-color: #FFE082; }
#fb-v6-panel .tag.red { background: #FFEBEE; color: #F85149; border-color: #FFCDD2; }
#fb-v6-panel .friend-item, #fb-v6-panel .post-item {
  padding: 6px 8px; border-bottom: 1px solid #F0F8FF; font-size: 12px;
}
#fb-v6-panel .friend-item:last-child, #fb-v6-panel .post-item:last-child { border-bottom: none; }
#fb-v6-panel .friend-item .fn { color: #3A5A7A; }
#fb-v6-panel .friend-item .fl { color: #8AB4D6; font-size: 10px; }
#fb-v6-panel .post-item .pt { color: #3A5A7A; }
#fb-v6-panel .post-item .pm { color: #8AB4D6; font-size: 10px; margin-top: 2px; }
#fb-v6-panel .bot-bar {
  display: flex; gap: 4px; padding: 8px 14px;
  border-top: 2px solid #D4EDFB; flex-shrink: 0;
}
#fb-v6-panel .bot-bar button {
  flex: 1; padding: 6px 8px; border-radius: 10px; border: 1px solid #D4EDFB;
  background: white; color: #5BA3C9; cursor: pointer; font-size: 11px;
  font-family: inherit; font-weight: 600; transition: all 0.2s;
}
#fb-v6-panel .bot-bar button:hover { background: #87CEEB; color: white; border-color: #87CEEB; }
#fb-v6-panel .bot-bar button.pri { background: #87CEEB; border-color: #87CEEB; color: white; }
#fb-v6-panel .bot-bar button.pri:hover { background: #6BB5D9; }
#fb-v6-panel .bot-bar button.del { border-color: #E88B8B; color: #E88B8B; }
#fb-v6-panel .bot-bar button.del:hover { background: #E88B8B; color: white; }
#fb-v6-panel .st { font-size: 11px; color: #8AB4D6; text-align: center; padding: 4px 0 0; flex-shrink: 0; }
#fb-v6-panel .emp { color: #8AB4D6; text-align: center; padding: 30px 20px; font-size: 12px; }
#fb-v6-panel .emp span { font-size: 32px; display: block; margin-bottom: 8px; }
#fb-v6-panel .badge { font-size: 10px; color: #8AB4D6; }
#fb-v6-panel .pill {
  display: inline-block; background: white; padding: 2px 10px;
  border-radius: 10px; font-size: 11px; color: #8AB4D6; margin: 2px;
  border: 1px solid #D4EDFB;
}
#fb-v6-panel .pill.act { background: #E8F4FD; color: #5BA3C9; border: 1px solid #87CEEB; }
#fb-v6-panel .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
#fb-v6-panel .grid-2 button {
  background: white; border: 1px solid #D4EDFB; border-radius: 8px;
  color: #5BA3C9; cursor: pointer; padding: 6px; font-size: 11px;
  text-align: center; transition: all 0.2s; font-family: inherit;
}
#fb-v6-panel .grid-2 button:hover { background: #87CEEB; color: white; border-color: #87CEEB; }
#fb-v6-panel .ll { color: #5BA3C9; text-decoration: none; }
#fb-v6-panel .ll:hover { text-decoration: underline; }
#fb-v6-panel .sc { overflow-x: auto; white-space: nowrap; padding: 4px 0; }
#fb-v6-panel .sc::-webkit-scrollbar { height: 4px; }
#fb-v6-panel .sc::-webkit-scrollbar-thumb { background: #D4EDFB; border-radius: 4px; }
#fb-v6-global-btn {
  position: fixed; bottom: 72px; right: 16px;
  width: 48px; height: 48px; border-radius: 50%;
  background: linear-gradient(135deg, #87CEEB, #A8D8EA);
  border: 2px solid white; color: white;
  font-size: 20px; cursor: pointer; z-index: 999998;
  box-shadow: 0 4px 16px rgba(135,206,235,0.4);
  transition: all 0.2s;
  display: flex; align-items: center; justify-content: center;
}
#fb-v6-global-btn:hover { transform: scale(1.1); box-shadow: 0 6px 20px rgba(135,206,235,0.5); }
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

  // === 画像生成 (增强版) ===
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
    if (data.relationship) {
      const relMap = {
        'Single':'💔 单身','In a relationship':'💑 恋爱中','Married':'💍 已婚',
        'Engaged':'💍 订婚','Divorced':'💔 离异','Widowed':'🕊️ 丧偶',
        '单身':'💔 单身','恋爱中':'💑 恋爱中','已婚':'💍 已婚',
        '订婚':'💍 订婚','离异':'💔 离异','丧偶':'🕊️ 丧偶',
      };
      tags.push(relMap[data.relationship] || `💕 ${data.relationship}`);
    }
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

    // Bio + 兴趣词提取
    data.interestWords = [];
    if (data.bio) {
      const bioShort = data.bio.length > 80 ? data.bio.slice(0, 80) + '…' : data.bio;
      lines.push(`简介: ${bioShort}`);
      const stopWords = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','from','is','am','are','was','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','shall','can','need','dare','ought','used','this','that','these','those','i','my','me','we','our','you','your','he','him','his','she','her','it','its','they','them','their','not','no','nor','so','if','as','up','out','about','who','what','when','where','why','how','all','each','every','both','few','more','most','some','any','none','just','also','very','too','really','here','there','now','then','only','own','same','like','是','的','了','在','有','和','就','不','人','都','一','一个','上','也','很','到','说','要','去','你','会','着','没有','看','好','自己']);
      const words = data.bio.toLowerCase().replace(/[^a-z\u4e00-\u9fff\s-]/g, '').split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
      const freq = {};
      words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
      data.interestWords = Object.entries(freq).sort((a,b) => b[1]-a[1]).slice(0, 10).map(x => x[0]);
      if (data.interestWords.length > 0) {
        tags.push(...data.interestWords.slice(0, 3).map(w => `🏷️ ${w}`));
        lines.push(`兴趣词: ${data.interestWords.join(', ')}`);
      }
    }

    // 从帖子中提取兴趣词
    if (data.posts && data.posts.length >= 3) {
      const postText = data.posts.map(p => p.text).join(' ');
      const stopWords = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','from','is','it','its','this','that','was','were','be','been','have','has','had','do','does','did','will','would','could','should','may','might','i','my','me','we','our','you','your','he','him','his','she','her','they','them','their','not','no','nor','so','if','as','up','out','about','just','also','very','too','really','here','there','now','then','only','own','same','like','是','的','了','在','有','和','就','不','人','都','一','一个','上','也','很','到','说','要','去','你','会','着','没有','看','好','自己','这','那','什么','因为','所以','但是','可以','知道']);
      const words = postText.toLowerCase().replace(/[^a-z\u4e00-\u9fff\s]/g, '').split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
      const freq = {};
      words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
      const postKeywords = Object.entries(freq).sort((a,b) => b[1]-a[1]).slice(0, 10).map(x => x[0]);
      // Merge with existing interest words
      const combined = new Set([...data.interestWords, ...postKeywords]);
      data.interestWords = Array.from(combined).slice(0, 15);
    }

    // Linked accounts
    if (data.linkedAccounts && data.linkedAccounts.length > 0) {
      lines.push(`关联账号: ${data.linkedAccounts.map(a => `${a.platform}: ${a.handle}`).join(' | ')}`);
    }

    // ===== 活跃时间分析 =====
    data.activityInsight = '';
    if (data.posts && data.posts.length >= 2) {
      // We don't have real timestamps reliably from DOM, estimate based on what we have
      const postCount = data.posts.length;
      if (postCount >= 5) data.activityInsight = `📊 采集到 ${postCount} 条帖子，近期活跃度较高`;
      else if (postCount >= 2) data.activityInsight = `📊 采集到 ${postCount} 条帖子`;
    }

    // ===== 智能破冰话术生成 =====
    data.icebreakers = generateIcebreakers(data);

    data.portrait = { tags, lines };
    return data.portrait;
  },
};

// ============================================================
//  🎯 智能破冰话术引擎
// ============================================================
function generateIcebreakers(data) {
  // 生成多组不同风格的话术
  const styles = {
    casual: [],   // 随性自然
    direct: [],   // 直球
    playful: [],  // 俏皮
    subtle: [],   // 含蓄（不暴露信息源）
  };

  const loc = data.location ? data.location.split(',')[0].trim() : null;
  const work = data.work ? data.work.split(';')[0].trim() : null;
  const edu = data.education ? data.education.split(';')[0].trim() : null;
  const interest = data.interestWords && data.interestWords.length > 0 ? data.interestWords[0] : null;
  const isFemale = data.gender && (data.gender.toLowerCase().includes('女性') || data.gender.toLowerCase().includes('female') || data.gender === '女');

  // ===== 随性自然风 =====
  if (loc) {
    styles.casual.push(`Hey, 我也在${loc}附近，感觉这边圈子不大，指不定哪天能碰上 😄`);
    styles.casual.push(`刷到你主页，${loc}的小伙伴～hi 一下 🙋‍♂️`);
  }
  if (work) {
    styles.casual.push(`刷到你在${work}，冒昧问一句，那地方工作氛围怎么样？最近在考虑动一动 🤔`);
  }
  if (interest) {
    styles.casual.push(`刷到你也喜欢${interest}，最近有入手什么新的吗？👀`);
  }
  if (edu) {
    styles.casual.push(`${edu}出来的？校友你好 🙌`);
  }

  // ===== 直球风 =====
  if (loc && isFemale) {
    styles.direct.push(`Okay我承认有点突然，但看到你是${loc}的，想认识一下。不行当我没说 😂`);
  }
  if (work) {
    styles.direct.push(`${work}！这工作有意思，你是做什么岗位的？`);
  }
  if (interest) {
    styles.direct.push(`你玩${interest}的吗？有机会交流一下！`);
  }
  if (loc && work) {
    styles.direct.push(`${loc} + ${work}，你这配置有意思，交个朋友？`);
  }

  // ===== 俏皮风 =====
  if (loc) {
    styles.playful.push(`哈囉${loc}的朋友，我是隔壁路过的，进来打个卡 🙃`);
  }
  if (work) {
    styles.playful.push(`我掐指一算，你在${work}上班对不对？不准的话我请你喝咖啡 😂`);
  }
  styles.playful.push(`我发誓我不是机器人！只是刚好刷到你，觉得应该打个招呼而已 🤖‍♂️`);

  // ===== 含蓄风（不露信息） =====
  styles.subtle.push(`Hi! 觉得你的页面很有趣，冒昧打个招呼～`);
  if (interest) {
    styles.subtle.push(`无意中刷到你，发现我们有共同的爱好，来say hi 😊`);
  }
  styles.subtle.push(`其实我平时不太在FB上主动找人聊天的，但你给我的感觉挺特别的，所以…hi🙂`);
  if (loc) {
    styles.subtle.push(`世界真小，居然刷到同在${loc}的人！`);
  }

  // 每组选1-2条
  const result = [];
  for (const style of ['casual', 'direct', 'playful', 'subtle']) {
    const pool = styles[style];
    if (pool.length > 0) {
      // 随机选一条
      result.push(pool[Math.floor(Math.random() * pool.length)]);
      if (pool.length > 1 && result.length < 8) {
        result.push(pool[Math.floor(Math.random() * pool.length)]);
      }
    }
    if (result.length >= 6) break;
  }

  // 去重 + 保证至少有一条通用保底
  const unique = [...new Set(result)];
  if (unique.length === 0) {
    unique.push("Hi! 看到你的主页感觉你很有趣，想认识一下 🙃");
    unique.push("我平时一般不随便加人的，但你的主页看起来很有意思 😄");
  }

  return unique.slice(0, 6).map(msg => {
    //给每条话术标注风格标签
    const tagMap = { casual: '随性', direct: '直球', playful: '俏皮', subtle: '含蓄' };
    let tag = '';
    for (const [k, v] of Object.entries(tagMap)) {
      if (styles[k].includes(msg)) { tag = v; break; }
    }
    return { text: msg, style: tag };
  });
}


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
  const iceCount = (data.icebreakers || []).length;

  return `
<div class="hdr">
  <span class="ttl">🎯 目标画像 <small>v6 · ${data.name || '未识别'}</small><span class="author">✨ By.阿趣 🎀</span></span>
  <span class="btns">
    <button id="v6-refresh">🔄</button>
    <button id="v6-close">✕</button>
  </span>
</div>
<div class="body">
  <div class="tabs">
    <button class="act" data-tab="portrait">🎯 画像</button>
    <button data-tab="ice">🎯 破冰${iceCount ? ` (${iceCount})` : ''}</button>
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
    case 'ice': return tabIce(data);
    case 'saved': return tabSaved(data);
    default: return '';
  }
}

function tabIce(data) {
  const ice = data.icebreakers || [];
  if (!ice.length) return `<div class="emp"><span>🎯</span>暂无破冰话术<br><small style="color:#8AB4D6">需要先采集目标资料</small></div>`;

  const styleLabels = { casual: '💬 随性', direct: '⚡ 直球', playful: '😏 俏皮', subtle: '🎐 含蓄' };

  let h = `<div class="card" style="background:#E8F4FD;border-color:#87CEEB;">
    <h3 style="color:#5BA3C9">🎯 破冰话术</h3>
    <div style="font-size:11px;color:#8AB4D6;margin-bottom:10px;">多种风格，点击复制</div>
    <button id="v6-regen-ice" style="background:#87CEEB;border:none;border-radius:8px;color:white;padding:6px 12px;font-size:11px;cursor:pointer;font-family:inherit;margin-bottom:10px;">🔄 换一批</button>`;
  ice.forEach((item, i) => {
    const msg = item.text || item;
    const style = item.style || '';
    const styleLabel = styleLabels[style] || '';
    h += `<div style="background:white;border:1px solid #D4EDFB;border-radius:12px;padding:10px 12px;margin-bottom:8px;cursor:pointer;" class="v6-copy-ice" data-ice="${escHtml(msg)}">
      <div style="display:flex;align-items:flex-start;gap:8px;">
        <span style="color:#87CEEB;font-weight:700;font-size:12px;">${styleLabel}</span>
        <span style="flex:1;color:#3A5A7A;font-size:12px;line-height:1.5;">${escHtml(msg)}</span>
        <span style="color:#D4EDFB;font-size:11px;flex-shrink:0;">📋</span>
      </div>
    </div>`;
  });
  h += `</div>`;
  return h;
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

  // 兴趣词云
  if (data.interestWords && data.interestWords.length > 0) {
    h += `<div class="card"><h3>🏷️ 兴趣标签</h3><div>`;
    data.interestWords.forEach(w => {
      h += `<span class="pill act">${escHtml(w)}</span> `;
    });
    h += `</div></div>`;
  }

  // 活跃度
  if (data.activityInsight) {
    h += `<div class="card"><h3>⏰ 活跃分析</h3><div class="val">${data.activityInsight}</div></div>`;
  }

  // 破冰快捷入口
  if (data.icebreakers && data.icebreakers.length > 0) {
    h += `<div class="card" style="background:#E8F4FD;border-color:#87CEEB;cursor:pointer;" id="v6-goto-ice">
      <h3 style="color:#5BA3C9">🎯 智能破冰话术</h3>
      <div style="font-size:11px;color:#8AB4D6;">点击查看 ${data.icebreakers.length} 条定制开场白 →</div>
    </div>`;
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
    const portrait = d.portrait || {};
    const tags = (portrait.tags || []).slice(0, 3).join(' ');
    const lines = (portrait.lines || []).slice(0, 2).map(l => escHtml(l)).join('<br>');
    h += `<div style="background:#161b22;border:1px solid #30363d;border-radius:8px;padding:10px;margin-bottom:8px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
        <span style="font-weight:700;color:#58a6ff;cursor:pointer;font-size:13px;" class="v6-open-url" data-url="${escHtml(d.url || '')}">${escHtml(d.name || '未知')} ↗</span>
        <span style="color:#484f58;font-size:10px;">${time}</span>
      </div>
      ${tags ? `<div style="margin-bottom:4px;">${tags}</div>` : ''}
      ${lines ? `<div style="font-size:11px;color:#8b949e;line-height:1.4;margin-bottom:6px;">${lines}</div>` : ''}
      <div style="display:flex;gap:4px;">
        <button class="v6-load-saved" data-uid="${escHtml(d.uid)}" style="flex:1;background:#21262d;border:1px solid #30363d;border-radius:6px;color:#8b949e;cursor:pointer;font-size:10px;padding:4px;font-family:inherit;">📂 加载到面板</button>
        <button class="v6-del-saved" data-uid="${escHtml(d.uid)}" style="background:none;border:none;color:#f85149;cursor:pointer;font-size:14px;padding:2px 8px;">✕</button>
      </div>
    </div>`;
  });
  h += `<div style="text-align:center;padding:8px 0;"><button id="v6-clear-all" style="background:none;border:none;color:#f85149;cursor:pointer;font-size:11px;">🗑️ 清空全部</button></div>`;
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



  // Clear all saved
  const clearBtn = document.getElementById('v6-clear-all');
  if (clearBtn) clearBtn.onclick = () => {
    if (confirm('清空所有保存的数据？')) {
      GM_setValue(CONFIG.saveKey, '[]');
      document.getElementById('v6-content').innerHTML = tabSaved();
      setStatus('🗑️ 已清空');
    }
  };

  // 已存 Tab 事件委托：打开URL / 加载记录 / 删除
  document.getElementById('v6-content').onclick = (e) => {
    const openBtn = e.target.closest('.v6-open-url');
    if (openBtn) {
      const url = openBtn.dataset.url;
      if (url) window.open(url, '_blank');
      return;
    }
    const loadBtn = e.target.closest('.v6-load-saved');
    if (loadBtn) {
      const saved = Store.get(loadBtn.dataset.uid);
      if (saved) {
        data = saved;
        document.getElementById('v6-content').innerHTML = tabContent(activeTab, saved);
        document.querySelector('.hdr .ttl small').textContent = '· ' + (saved.name || '');
        setStatus('📂 已加载保存的记录');
        e.stopPropagation();
      }
      return;
    }
    const delBtn = e.target.closest('.v6-del-saved');
    if (delBtn) {
      const uid = delBtn.dataset.uid;
      if (uid && confirm('删除这条记录？')) {
        Store.delete(uid);
        document.getElementById('v6-content').innerHTML = tabSaved();
        setStatus('🗑️ 已删除');
      }
      return;
    }
    // Icebreaker: regenerate
    if (e.target.id === 'v6-regen-ice' || e.target.closest('#v6-regen-ice')) {
      data.icebreakers = generateIcebreakers(data);
      document.getElementById('v6-content').innerHTML = tabIce(data);
      return;
    }
    // Icebreaker: copy text
    const iceEl = e.target.closest('.v6-copy-ice');
    if (iceEl) {
      const text = iceEl.dataset.ice;
      if (text) {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text).then(() => {
            const label = iceEl.querySelector('span:last-child');
            if (label) { label.textContent = '✅ 已复制!'; setTimeout(() => { label.textContent = '📋 复制'; }, 1500); }
            setStatus('📋 已复制到剪贴板');
          });
        } else fallbackCopy(text);
      }
      return;
    }
  };

  // Click on icebreaker card in portrait -> switch tab
  const gotoIce = document.getElementById('v6-goto-ice');
  if (gotoIce) {
    gotoIce.onclick = () => {
      document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('act'));
      const tabBtn = document.querySelector('.tabs button[data-tab="ice"]');
      if (tabBtn) { tabBtn.classList.add('act'); activeTab = 'ice'; }
      document.getElementById('v6-content').innerHTML = tabIce(data);
    };
  }

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
