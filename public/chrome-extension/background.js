// AutoViral AI Chrome Extension - Background Service Worker (Manifest V3)

chrome.runtime.onInstalled.addListener(() => {
  console.log('[AutoViral AI] Extensão v1.5.8 instalada com sucesso!');
  chrome.storage.local.get(['autoviral_interval', 'autoviral_mapped_groups', 'autoviral_waiting_approval_map'], (res) => {
    chrome.storage.local.set({
      autoviral_interval: res.autoviral_interval || 350,
      autoviral_mapped_groups: Array.isArray(res.autoviral_mapped_groups) ? res.autoviral_mapped_groups : [],
      autoviral_waiting_approval_map: (res && res.autoviral_waiting_approval_map && typeof res.autoviral_waiting_approval_map === 'object')
        ? res.autoviral_waiting_approval_map
        : {}
    });
  });
  ensureApprovalWatchdogAlarm();
});

if (chrome.runtime.onStartup) {
  chrome.runtime.onStartup.addListener(() => {
    ensureApprovalWatchdogAlarm();
  });
}

function ensureApprovalWatchdogAlarm() {
  try {
    if (chrome.alarms && chrome.alarms.create) {
      chrome.alarms.create('autoviral_approval_watchdog', { periodInMinutes: 3 });
    }
  } catch (e) {}
}

ensureApprovalWatchdogAlarm();

const sleepMs = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const silentTabIds = new Set();
const activeBgPostWatches = new Map();
const finalizedPostWatchKeys = new Set();
const cancelledBgCloseTabs = new Set();
let bgPostWatchIntervalId = null;

function getPostWatchDedupeKey(tabId, logId, slug) {
  if (logId) return `log:${String(logId)}`;
  return `tab:${tabId}:slug:${String(slug || '')}`;
}

function isPostWatchFinalized(tabId, logId, slug) {
  return finalizedPostWatchKeys.has(getPostWatchDedupeKey(tabId, logId, slug));
}

function markBgPostFinalized(tabId, logId, slug) {
  finalizedPostWatchKeys.add(getPostWatchDedupeKey(tabId, logId, slug));
  if (finalizedPostWatchKeys.size > 400) {
    const oldest = finalizedPostWatchKeys.values().next().value;
    if (oldest) finalizedPostWatchKeys.delete(oldest);
  }
  if (typeof tabId === 'number') {
    activeBgPostWatches.delete(tabId);
  }
}

function clearPendingPostFromStorage(slug) {
  const cleanSlug = String(slug || '').toLowerCase();
  try {
    chrome.storage.local.get(['autoviral_pending_fb_post', 'autoviral_pending_fb_posts_map'], (res) => {
      const postsMap = (res && res.autoviral_pending_fb_posts_map && typeof res.autoviral_pending_fb_posts_map === 'object')
        ? { ...res.autoviral_pending_fb_posts_map }
        : {};
      if (cleanSlug && postsMap[cleanSlug]) {
        delete postsMap[cleanSlug];
      }
      chrome.storage.local.set({ autoviral_pending_fb_posts_map: postsMap });
      const active = res && res.autoviral_pending_fb_post;
      if (!active || !cleanSlug || (active.groupSlug || '').toLowerCase() === cleanSlug || (active.groupUrl || '').toLowerCase().includes(`/groups/${cleanSlug}`)) {
        chrome.storage.local.remove(['autoviral_pending_fb_post']);
      }
    });
  } catch (e) {}
}

function closeGroupTabSafely(tabId, delayMs) {
  if (typeof tabId !== 'number') return;
  const waitMs = Math.max(0, Number(delayMs) || 0);
  setTimeout(() => {
    if (cancelledBgCloseTabs.has(tabId)) {
      cancelledBgCloseTabs.delete(tabId);
      return;
    }
    silentTabIds.delete(tabId);
    activeBgPostWatches.delete(tabId);
    chrome.storage.local.get(['autoviral_silent_tabs'], (r) => {
      const m = r && r.autoviral_silent_tabs && typeof r.autoviral_silent_tabs === 'object'
        ? { ...r.autoviral_silent_tabs }
        : null;
      if (m && m[String(tabId)]) {
        delete m[String(tabId)];
        chrome.storage.local.set({ autoviral_silent_tabs: m });
      }
    });
    chrome.tabs.remove(tabId, () => {
      void chrome.runtime.lastError;
    });
  }, waitMs);
}

if (chrome.tabs && chrome.tabs.onRemoved) {
  chrome.tabs.onRemoved.addListener((closedTabId) => {
    activeBgPostWatches.delete(closedTabId);
    cancelledBgCloseTabs.delete(closedTabId);
    silentTabIds.delete(closedTabId);
  });
}

async function withTabDebugger(tabId, fn) {
  if (!chrome.debugger || typeof tabId !== 'number') {
    return { usedDebugger: false, error: 'debugger_unavailable' };
  }
  const target = { tabId };
  let attached = false;
  try {
    await new Promise((resolve, reject) => {
      chrome.debugger.attach(target, '1.3', () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message || 'attach_failed'));
        } else {
          attached = true;
          resolve();
        }
      });
    });
    const sendCmd = (method, params) =>
      new Promise((resolve, reject) => {
        chrome.debugger.sendCommand(target, method, params || {}, (res) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message || method + '_failed'));
          } else {
            resolve(res);
          }
        });
      });
    const value = await fn(sendCmd);
    return { usedDebugger: true, value };
  } catch (err) {
    return { usedDebugger: false, error: String(err && err.message ? err.message : err) };
  } finally {
    if (attached) {
      try {
        await new Promise((resolve) => {
          chrome.debugger.detach(target, () => {
            void chrome.runtime.lastError;
            resolve();
          });
        });
      } catch (e) {}
    }
  }
}

async function dispatchRealTrustedClick(sendCmd, x, y, hoverDelayMs) {
  const cx = Math.round(x);
  const cy = Math.round(y);
  await sendCmd('Input.dispatchMouseEvent', {
    type: 'mouseMoved',
    x: cx,
    y: cy,
    pointerType: 'mouse'
  });
  await sleepMs(hoverDelayMs || 140);
  await sendCmd('Input.dispatchMouseEvent', {
    type: 'mousePressed',
    x: cx,
    y: cy,
    button: 'left',
    buttons: 1,
    clickCount: 1,
    pointerType: 'mouse'
  });
  await sleepMs(65);
  await sendCmd('Input.dispatchMouseEvent', {
    type: 'mouseReleased',
    x: cx,
    y: cy,
    button: 'left',
    buttons: 0,
    clickCount: 1,
    pointerType: 'mouse'
  });
}

function isAutoViralTab(tab) {
  const url = tab.url || '';
  const title = tab.title || '';
  return (
    url.includes('ais-') ||
    url.includes('localhost') ||
    url.includes('run.app') ||
    url.includes('robo-trafego.vercel.app') ||
    url.includes('aistudio.google.com') ||
    title.includes('AutoViral')
  );
}

function sendMessageToTabAllFrames(tabId, message, onDone) {
  chrome.tabs.sendMessage(tabId, message, (res) => {
    if (!chrome.runtime.lastError) {
      if (onDone) onDone(true, res);
      return;
    }
    if (chrome.scripting && chrome.scripting.executeScript) {
      chrome.scripting.executeScript(
        { target: { tabId: tabId, allFrames: true }, files: ['content.js'] },
        () => {
          if (chrome.runtime.lastError) {
            if (onDone) onDone(false, null);
            return;
          }
          setTimeout(() => {
            chrome.tabs.sendMessage(tabId, message, (retryRes) => {
              const ok = !chrome.runtime.lastError;
              if (onDone) onDone(ok, retryRes || null);
            });
          }, 300);
        }
      );
    } else if (onDone) {
      onDone(false, null);
    }
  });
}

function relayToAutoViralTabs(message, callback) {
  chrome.tabs.query({}, (tabs) => {
    const matchedTabs = (tabs || []).filter(isAutoViralTab);
    if (matchedTabs.length === 0) {
      if (callback) callback(0);
      return;
    }
    let remaining = matchedTabs.length;
    let forwardedCount = 0;
    matchedTabs.forEach((tab) => {
      sendMessageToTabAllFrames(tab.id, message, (ok) => {
        if (ok) forwardedCount++;
        remaining--;
        if (remaining === 0 && callback) {
          callback(forwardedCount);
        }
      });
    });
  });
}

// Relay messages between tabs
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'AUTOVIRAL_QUERY_FB_TABS') {
    chrome.tabs.query({ url: '*://*.facebook.com/*' }, (tabs) => {
      sendResponse({ count: tabs.length, tabs: tabs.map(t => ({ id: t.id, title: t.title, url: t.url })) });
    });
    return true;
  }

  // Open or focus existing AutoViral platform tab
  if (request.action === 'AUTOVIRAL_FOCUS_OR_OPEN_PLATFORM') {
    chrome.tabs.query({}, (tabs) => {
      const existingTab =
        tabs.find(t => (t.url || '').includes('run.app') || (t.url || '').includes('robo-trafego.vercel.app') || (t.url || '').includes('localhost')) ||
        tabs.find(t => (t.title || '').includes('AutoViral'));
      if (existingTab) {
        chrome.windows.update(existingTab.windowId, { focused: true }, () => {
          chrome.tabs.update(existingTab.id, { active: true });
        });
        sendResponse({ opened: true, existing: true });
      } else {
        chrome.tabs.create({ url: 'https://ais-dev-fdvdpr73jbu2hzpbbibxp5-395073471759.us-west2.run.app' }, () => {
          sendResponse({ opened: true, existing: false });
        });
      }
    });
    return true;
  }

  // Pull cached Instagram/FB/YouTube/Waiting data from chrome.storage.local (and live Instagram tab if open)
  if (request.action === 'AUTOVIRAL_PULL_EXTENSION_CACHE') {
    chrome.tabs.query({ url: '*://*.instagram.com/*' }, (instaTabs) => {
      const finalize = (liveAccounts, liveHandle) => {
        chrome.storage.local.get(
          [
            'autoviral_insta_accounts',
            'autoviral_insta_connected_handle',
            'autoviral_mapped_groups',
            'autoviral_yt_videos',
            'autoviral_waiting_approval_map'
          ],
          (res) => {
            const accounts = (Array.isArray(liveAccounts) && liveAccounts.length > 0)
              ? liveAccounts
              : (res.autoviral_insta_accounts || []);
            const connectedHandle = liveHandle && liveHandle !== '@conectado'
              ? liveHandle
              : (res.autoviral_insta_connected_handle || '');
            if (Array.isArray(accounts) && accounts.length > 0) {
              chrome.storage.local.set({ autoviral_insta_accounts: accounts });
            }
            if (connectedHandle) {
              chrome.storage.local.set({ autoviral_insta_connected_handle: connectedHandle });
            }
            const waitingMap = (res.autoviral_waiting_approval_map && typeof res.autoviral_waiting_approval_map === 'object')
              ? res.autoviral_waiting_approval_map
              : {};
            sendResponse({
              success: true,
              accounts,
              connectedHandle,
              groups: res.autoviral_mapped_groups || [],
              ytVideos: res.autoviral_yt_videos || [],
              waitingApprovals: Object.values(waitingMap)
            });
          }
        );
      };

      const activeInstaTab = instaTabs && instaTabs[0];
      if (activeInstaTab) {
        sendMessageToTabAllFrames(activeInstaTab.id, { action: 'AUTOVIRAL_MAP_INSTAGRAM_ACCOUNTS' }, (ok, res) => {
          if (ok && res && Array.isArray(res.accounts)) {
            finalize(res.accounts, res.connectedHandle);
          } else {
            finalize(null, null);
          }
        });
      } else {
        finalize(null, null);
      }
    });
    return true;
  }

  if (request.action === 'AUTOVIRAL_SAVE_WAITING_APPROVAL') {
    const item = request.item;
    if (!item || !item.groupSlug) {
      sendResponse({ ok: false });
      return false;
    }
    const slug = String(item.groupSlug).toLowerCase();
    chrome.storage.local.get(['autoviral_waiting_approval_map'], (res) => {
      const map = (res && res.autoviral_waiting_approval_map && typeof res.autoviral_waiting_approval_map === 'object')
        ? { ...res.autoviral_waiting_approval_map }
        : {};
      map[slug] = {
        ...item,
        groupSlug: slug,
        requestedAt: item.requestedAt || new Date().toISOString(),
        lastCheckedAt: item.lastCheckedAt || new Date().toISOString()
      };
      chrome.storage.local.set({ autoviral_waiting_approval_map: map }, () => {
        ensureApprovalWatchdogAlarm();
        relayToAutoViralTabs({
          action: 'AUTOVIRAL_WAITING_APPROVALS_SYNC',
          waitingApprovals: Object.values(map),
          timestamp: new Date().toISOString()
        });
        sendResponse({ ok: true, count: Object.keys(map).length });
      });
    });
    return true;
  }

  if (request.action === 'AUTOVIRAL_REMOVE_WAITING_APPROVAL') {
    const slug = String(request.groupSlug || '').toLowerCase();
    chrome.storage.local.get(['autoviral_waiting_approval_map'], (res) => {
      const map = (res && res.autoviral_waiting_approval_map && typeof res.autoviral_waiting_approval_map === 'object')
        ? { ...res.autoviral_waiting_approval_map }
        : {};
      if (slug && map[slug]) delete map[slug];
      chrome.storage.local.set({ autoviral_waiting_approval_map: map }, () => {
        relayToAutoViralTabs({
          action: 'AUTOVIRAL_WAITING_APPROVALS_SYNC',
          waitingApprovals: Object.values(map),
          timestamp: new Date().toISOString()
        });
        sendResponse({ ok: true, count: Object.keys(map).length });
      });
    });
    return true;
  }

  if (request.action === 'AUTOVIRAL_TRIGGER_APPROVED_GROUP_POST') {
    const slug = String(request.groupSlug || '').toLowerCase();
    if (!slug) {
      sendResponse({ ok: false });
      return false;
    }
    triggerApprovedGroupPostBySlug(slug, Boolean(request.alreadyInTab), sender && sender.tab ? sender.tab.id : null)
      .then((result) => sendResponse(result))
      .catch(() => sendResponse({ ok: false }));
    return true;
  }

  if (request.action === 'AUTOVIRAL_CHECK_WAITING_APPROVALS') {
    checkWaitingApprovalsNow(request.maxCount || 4)
      .then((result) => sendResponse(result))
      .catch(() => sendResponse({ ok: false, checked: 0, approvedCount: 0 }));
    return true;
  }

  if (request.action === 'AUTOVIRAL_VERIFY_MEMBERSHIPS_BATCH') {
    verifyMembershipsBatchNow(request.groups || [], request.batchId || `batch-${Date.now()}`)
      .then((result) => sendResponse(result))
      .catch(() => sendResponse({ ok: false, checked: 0, total: 0 }));
    return true;
  }

  // Relay mapped groups to AutoViral platform tabs
  if (request.action === 'AUTOVIRAL_SYNC_WITH_PLATFORM') {
    const groups = request.groups || [];
    chrome.storage.local.set({ autoviral_mapped_groups: groups });

    relayToAutoViralTabs(
      {
        action: 'AUTOVIRAL_IMPORT_GROUPS_FROM_EXTENSION',
        groups: groups,
        searchFolder: request.searchFolder,
        searchQuery: request.searchQuery,
        timestamp: new Date().toISOString()
      },
      (forwardedCount) => {
        sendResponse({ success: true, forwardedCount, totalGroups: groups.length });
      }
    );
    return true;
  }

  // Open a specific Facebook Group tab for automated Join + Post flow
  if (request.action === 'AUTOVIRAL_OPEN_GROUP_FOR_POST') {
    const groupUrl = request.groupUrl || '';
    const slugMatch = groupUrl.match(/\/groups\/([^\/?#]+)/i);
    const groupSlug = slugMatch ? slugMatch[1].toLowerCase() : '';
    const silentMode = Boolean(request.silentMode);
    const pendingPost = {
      logId: request.logId || '',
      groupId: request.groupId || '',
      groupUrl: groupUrl,
      groupSlug: groupSlug,
      groupName: request.groupName || '',
      fullText: request.fullText || '',
      imageDataUrl: request.imageDataUrl || '',
      autoJoinAndPost: request.autoJoinAndPost !== false,
      joinOnly: Boolean(request.joinOnly),
      silentMode: silentMode,
      createdAt: new Date().toISOString()
    };

    chrome.storage.local.get(['autoviral_pending_fb_posts_map', 'autoviral_silent_tabs'], (res) => {
      const postsMap = (res && res.autoviral_pending_fb_posts_map && typeof res.autoviral_pending_fb_posts_map === 'object')
        ? res.autoviral_pending_fb_posts_map
        : {};
      const silentTabsMap = (res && res.autoviral_silent_tabs && typeof res.autoviral_silent_tabs === 'object')
        ? { ...res.autoviral_silent_tabs }
        : {};
      if (groupSlug) {
        postsMap[groupSlug] = pendingPost;
      }
      chrome.storage.local.set(
        {
          autoviral_pending_fb_post: pendingPost,
          autoviral_pending_fb_posts_map: postsMap,
          autoviral_silent_mode: silentMode
        },
        () => {
          if (pendingPost.groupUrl) {
            const createOpts = {
              url: pendingPost.groupUrl,
              active: !silentMode
            };
            if (silentMode && sender && sender.tab && typeof sender.tab.windowId === 'number') {
              createOpts.windowId = sender.tab.windowId;
            }
            chrome.tabs.create(createOpts, (tab) => {
              void chrome.runtime.lastError;
              if (tab && typeof tab.id === 'number' && silentMode) {
                silentTabIds.add(tab.id);
                silentTabsMap[String(tab.id)] = true;
                chrome.storage.local.set({ autoviral_silent_tabs: silentTabsMap });
              }
              sendResponse({ success: true, tabId: tab ? tab.id : null, silentMode });
            });
          } else {
            sendResponse({ success: false });
          }
        }
      );
    });
    return true;
  }

  // Relay Instagram mapped accounts, connected handle, YouTube videos, or real FB post results to AutoViral platform tabs
  if (
    request.action === 'AUTOVIRAL_IMPORT_INSTAGRAM_ACCOUNTS' ||
    request.action === 'AUTOVIRAL_INSTA_ACCOUNT_SYNC' ||
    request.action === 'AUTOVIRAL_IMPORT_YOUTUBE_VIDEOS_FROM_EXTENSION' ||
    request.action === 'AUTOVIRAL_FB_POST_RESULT' ||
    request.action === 'AUTOVIRAL_GROUP_MEMBERSHIP_RESULT'
  ) {
    if (request.action === 'AUTOVIRAL_FB_POST_RESULT') {
      const senderTabId = sender && sender.tab && typeof sender.tab.id === 'number' ? sender.tab.id : null;
      const slugMatch = String(request.groupUrl || '').match(/\/groups\/([^\/?#]+)/i);
      const slug = slugMatch ? slugMatch[1].toLowerCase() : '';
      if (
        request.approvalStatus === 'published' ||
        request.approvalStatus === 'awaiting_admin' ||
        request.approvalStatus === 'rate_limited' ||
        request.approvalStatus === 'unavailable'
      ) {
        markBgPostFinalized(senderTabId, request.logId, slug);
      }
    }
    if (request.action === 'AUTOVIRAL_IMPORT_INSTAGRAM_ACCOUNTS' && Array.isArray(request.accounts)) {
      chrome.storage.local.set({ autoviral_insta_accounts: request.accounts });
    }
    if (request.action === 'AUTOVIRAL_IMPORT_YOUTUBE_VIDEOS_FROM_EXTENSION' && Array.isArray(request.videos)) {
      chrome.storage.local.set({ autoviral_yt_videos: request.videos });
    }
    if (request.handle || request.connectedHandle) {
      const h = request.handle || request.connectedHandle;
      if (h && h !== '@conectado') {
        chrome.storage.local.set({ autoviral_insta_connected_handle: h });
      }
    }
    relayToAutoViralTabs(request, (forwardedCount) => {
      sendResponse({ success: true, forwardedCount });
    });
    return true;
  }

  if (request.action === 'AUTOVIRAL_MAIN_OPEN_COMPOSER') {
    const tabId = sender && sender.tab && sender.tab.id;
    const mode = request.mode === 'simple' ? 'simple' : 'full';
    if (!tabId || !chrome.scripting || !chrome.scripting.executeScript) {
      sendResponse({ ok: false });
      return false;
    }
    chrome.scripting.executeScript(
      {
        target: { tabId },
        world: 'MAIN',
        args: [mode],
        func: (clickMode) => {
          try {
            // If composer dialog or inline Lexical textbox is already open, do not click trigger again
            const existingDialog = Array.from(document.querySelectorAll('div[role="dialog"]')).find((d) => {
              const r = d.getBoundingClientRect();
              if (r.width < 200 || r.height < 150) return false;
              if (d.getAttribute('aria-hidden') === 'true') return false;
              try {
                const st = window.getComputedStyle(d);
                if (st.display === 'none' || st.visibility === 'hidden' || st.pointerEvents === 'none') return false;
                const op = parseFloat(st.opacity || '1');
                if (!isNaN(op) && op < 0.35) return false;
              } catch (e) {}
              const tb = d.querySelector('div[role="textbox"][contenteditable="true"], div[contenteditable="true"][data-lexical-editor="true"]');
              if (tb) return true;
              const txt = (d.innerText || '').toLowerCase();
              return (
                txt.includes('criar post') ||
                txt.includes('create post') ||
                txt.includes('criar publicação') ||
                txt.includes('crear publicación') ||
                txt.includes('crear publicacion') ||
                txt.includes('create a public post') ||
                txt.includes('crie um post público') ||
                txt.includes('publicação anônima') ||
                txt.includes('publicación anónima') ||
                txt.includes('anonymous post')
              );
            });
            if (existingDialog) {
              return { found: true, alreadyOpen: true, mode: 'already_open' };
            }
            const inlineTb = document.querySelector('[data-pagelet="GroupInlineComposer"] div[role="textbox"][contenteditable="true"], [data-pagelet="GroupInlineComposer"] div[contenteditable="true"][data-lexical-editor="true"]');
            if (inlineTb && inlineTb.getBoundingClientRect().height >= 20) {
              return { found: true, alreadyOpen: true, mode: 'inline_open' };
            }

            if (window.scrollY > 380) {
              try { window.scrollTo({ top: 0, behavior: 'instant' }); } catch (e) {}
            }

            const FORBIDDEN = ['anônim', 'anonim', 'anónim', 'anonym', 'enquete', 'poll', 'encuesta', 'sentimento', 'feeling', 'sentimiento', 'foto', 'photo', 'vídeo', 'video', 'ao vivo', 'live', 'en vivo', 'comentar', 'comment', 'responder', 'reply'];
            const hasForbidden = (s) => FORBIDDEN.some((w) => s.includes(w));

            const candidates = Array.from(
              document.querySelectorAll('[data-pagelet="GroupInlineComposer"] div[role="button"], [data-pagelet="GroupInlineComposer"] span, [role="main"] div[role="button"], [role="main"] span, div[role="button"], span')
            );
            const scored = [];
            for (const el of candidates) {
              const rect = el.getBoundingClientRect();
              if (rect.width < 55 || rect.height < 14 || rect.height > 78) continue;
              if (el.closest('div[role="dialog"]') || el.closest('div[role="article"]') || el.closest('[role="complementary"]') || el.closest('[aria-busy="true"]')) continue;
              const t = (el.innerText || el.getAttribute('aria-label') || '').trim().toLowerCase();
              if (!t || t.length > 95 || hasForbidden(t)) continue;
              const btnAncestor = el.closest('div[role="button"]');
              if (btnAncestor) {
                const br = btnAncestor.getBoundingClientRect();
                const bt = (btnAncestor.innerText || btnAncestor.getAttribute('aria-label') || '').trim().toLowerCase();
                if (br.height > 90 || hasForbidden(bt)) continue;
              }
              const isExact =
                t === 'escreva algo...' ||
                t === 'escribe algo...' ||
                t === 'write something...' ||
                t === 'no que você está pensando?' ||
                t === '¿qué estás pensando?' ||
                t === 'qué estás pensando?' ||
                t === "what's on your mind?" ||
                t === 'escreva uma publicação pública...' ||
                t === 'escribe una publicación pública...' ||
                t === 'write a public post...';
              const isMatch =
                isExact ||
                t.includes('escreva algo') ||
                t.includes('escribe algo') ||
                t.includes('no que você está pensando') ||
                t.includes('qué estás pensando') ||
                t.includes('que estas pensando') ||
                t.includes('write something') ||
                t.includes("what's on your mind") ||
                t.includes('criar publicação pública') ||
                t.includes('crear publicación pública') ||
                t.includes('crear publicacion publica') ||
                t.includes('create a public post') ||
                t.includes('write a public post') ||
                t.includes('escreva uma publicação') ||
                t.includes('escribe una publicación') ||
                t.includes('escribe una publicacion') ||
                t.includes('haz una publicación');
              if (!isMatch) continue;
              const inInline = el.closest('[data-pagelet="GroupInlineComposer"]') ? -50000 : 0;
              const exactRank = isExact ? 0 : 100000;
              scored.push({ el, score: exactRank + inInline + rect.width * rect.height });
            }
            scored.sort((a, b) => a.score - b.score);
            const hit = scored[0] ? scored[0].el : null;
            const ancestorBtn = hit ? hit.closest('div[role="button"]') : null;
            const trigger = ancestorBtn && ancestorBtn.getBoundingClientRect().height <= 85 ? ancestorBtn : hit;
            if (!trigger || !hit) return { found: false };

            hit.scrollIntoView({ behavior: 'instant', block: 'center' });
            const r = hit.getBoundingClientRect();
            const cx = Math.round(r.left + Math.min(r.width * 0.45, 140));
            const cy = Math.round(r.top + r.height / 2);

            const fireClickSequence = () => {
              const downOpts = {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: cx,
                clientY: cy,
                button: 0,
                buttons: 1,
                pointerId: 1,
                pointerType: 'mouse',
                isPrimary: true
              };
              const upOpts = { ...downOpts, buttons: 0 };
              try { trigger.focus(); } catch (e) {}
              try { trigger.dispatchEvent(new PointerEvent('pointerdown', downOpts)); } catch (e) {}
              try { trigger.dispatchEvent(new MouseEvent('mousedown', downOpts)); } catch (e) {}
              try { trigger.dispatchEvent(new PointerEvent('pointerup', upOpts)); } catch (e) {}
              try { trigger.dispatchEvent(new MouseEvent('mouseup', upOpts)); } catch (e) {}
              try { hit.click(); } catch (e) {}
              if (trigger !== hit) {
                try { trigger.click(); } catch (e) {}
              }
            };

            if (clickMode === 'simple') {
              fireClickSequence();
              return { found: true, mode: 'simple', cx, cy };
            }

            const hoverOpts = {
              bubbles: true,
              cancelable: true,
              view: window,
              clientX: cx,
              clientY: cy,
              pointerId: 1,
              pointerType: 'mouse',
              isPrimary: true
            };
            try { trigger.dispatchEvent(new PointerEvent('pointerover', hoverOpts)); } catch (e) {}
            try { trigger.dispatchEvent(new MouseEvent('mouseover', hoverOpts)); } catch (e) {}
            setTimeout(fireClickSequence, 320);

            return { found: true, mode: 'full', cx, cy };
          } catch (err) {
            return { found: false, error: String(err) };
          }
        }
      },
      (results) => {
        void chrome.runtime.lastError;
        sendResponse({ ok: true, result: results && results[0] ? results[0].result : null });
      }
    );
    return true;
  }

  if (request.action === 'AUTOVIRAL_MAIN_DISMISS_STUCK_DIALOG') {
    const tabId = sender && sender.tab && sender.tab.id;
    if (!tabId || !chrome.scripting || !chrome.scripting.executeScript) {
      sendResponse({ ok: false });
      return false;
    }
    chrome.scripting.executeScript(
      {
        target: { tabId },
        world: 'MAIN',
        func: () => {
          try {
            const dialogs = Array.from(document.querySelectorAll('div[role="dialog"]'));
            for (const dlg of dialogs) {
              const scope = dlg.parentElement || dlg;
              const closeBtn = scope.querySelector(
                'div[role="button"][aria-label="Fechar"], div[role="button"][aria-label="Close"], button[aria-label="Fechar"], button[aria-label="Close"]'
              );
              if (closeBtn) {
                closeBtn.click();
                return true;
              }
              dlg.focus && dlg.focus();
              dlg.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, bubbles: true }));
            }
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, bubbles: true }));
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, bubbles: true }));
            const sideBackdrop = document.elementFromPoint(24, Math.round(window.innerHeight / 2));
            if (sideBackdrop && !dialogs.some((d) => d.contains(sideBackdrop))) {
              sideBackdrop.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window, clientX: 24, clientY: Math.round(window.innerHeight / 2) }));
              sideBackdrop.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window, clientX: 24, clientY: Math.round(window.innerHeight / 2) }));
              sideBackdrop.click();
            }
            return true;
          } catch (e) {
            return false;
          }
        }
      },
      () => {
        void chrome.runtime.lastError;
        sendResponse({ ok: true });
      }
    );
    return true;
  }

  if (request.action === 'AUTOVIRAL_MAIN_INSERT_TEXT') {
    const tabId = sender && sender.tab && sender.tab.id;
    const textToInsert = String(request.text || '');
    if (!tabId || !textToInsert || !chrome.scripting || !chrome.scripting.executeScript) {
      sendResponse({ ok: false });
      return false;
    }
    chrome.scripting.executeScript(
      {
        target: { tabId },
        world: 'MAIN',
        args: [textToInsert],
        func: (text) => {
          try {
            const pickActiveComposerDialog = () => {
              const allDialogs = Array.from(document.querySelectorAll('div[role="dialog"]'));
              const scored = [];
              allDialogs.forEach((d, idx) => {
                const r = d.getBoundingClientRect();
                if (r.width < 200 || r.height < 150) return;
                if (d.getAttribute('aria-hidden') === 'true') return;
                try {
                  const st = window.getComputedStyle(d);
                  if (st.display === 'none' || st.visibility === 'hidden' || st.pointerEvents === 'none') return;
                  const op = parseFloat(st.opacity || '1');
                  if (!isNaN(op) && op < 0.35) return;
                } catch (e) {}
                const tb = d.querySelector('div[role="textbox"][contenteditable="true"], div[contenteditable="true"][data-lexical-editor="true"]');
                const txt = (d.innerText || '').toLowerCase();
                const aria = (d.getAttribute('aria-label') || '').toLowerCase();
                const isComposer =
                  Boolean(tb) ||
                  txt.includes('criar post') ||
                  txt.includes('create post') ||
                  txt.includes('criar publicação') ||
                  txt.includes('crear publicación') ||
                  txt.includes('crear publicacion') ||
                  txt.includes('create a public post') ||
                  txt.includes('crie um post público') ||
                  txt.includes('publicação anônima') ||
                  txt.includes('publicación anónima') ||
                  txt.includes('anonymous post') ||
                  aria.includes('criar post') ||
                  aria.includes('create post') ||
                  aria.includes('crear publicación');
                if (!isComposer) return;
                let score = idx * 100 + (tb ? 500 : 0);
                let cur = d;
                for (let depth = 0; depth < 6 && cur && cur !== document.body; depth++) {
                  try {
                    const z = parseInt(window.getComputedStyle(cur).zIndex, 10);
                    if (!isNaN(z) && z > 0) score += Math.min(z, 50000);
                  } catch (e) {}
                  cur = cur.parentElement;
                }
                const testPts = [];
                if (tb) {
                  const tr = tb.getBoundingClientRect();
                  if (tr.width > 20 && tr.height > 15) {
                    testPts.push([tr.left + Math.min(tr.width * 0.4, 100), tr.top + Math.min(tr.height * 0.5, 24)]);
                  }
                }
                testPts.push([r.left + r.width * 0.5, r.top + Math.min(r.height * 0.25, 90)]);
                testPts.push([r.left + r.width * 0.5, r.top + r.height * 0.5]);
                for (const [px, py] of testPts) {
                  if (px >= 0 && py >= 0 && px <= window.innerWidth && py <= window.innerHeight) {
                    const topEl = document.elementFromPoint(px, py);
                    if (topEl && d.contains(topEl)) {
                      score += 1000000;
                      break;
                    }
                  }
                }
                scored.push({ d, score });
              });
              scored.sort((a, b) => b.score - a.score);
              return scored[0] ? scored[0].d : null;
            };
            const dlg = pickActiveComposerDialog();
            const scope = dlg || document.querySelector('[data-pagelet="GroupInlineComposer"]') || document.querySelector('[role="main"]');
            if (!scope) return { ok: false, reason: 'no_dialog' };

            const boxes = Array.from(
              scope.querySelectorAll(
                'div[role="textbox"][contenteditable="true"], div[contenteditable="true"][data-lexical-editor="true"], div[contenteditable="true"][aria-placeholder], div[contenteditable="true"][aria-label]'
              )
            );
            const tb = boxes.find((el) => {
              if (!dlg && (el.closest('div[role="article"]') || el.closest('[role="complementary"]'))) return false;
              const rect = el.getBoundingClientRect();
              if (rect.width < 40 || rect.height < 20) return false;
              const lbl = ((el.getAttribute('aria-label') || el.getAttribute('aria-placeholder') || el.getAttribute('placeholder') || '') + '').toLowerCase();
              return !lbl.includes('coment') && !lbl.includes('comment') && !lbl.includes('responder') && !lbl.includes('reply') && !lbl.includes('pesquis') && !lbl.includes('search') && !lbl.includes('buscar');
            });
            if (!tb) return { ok: false, reason: 'no_textbox' };

            tb.focus();
            tb.click();
            try {
              const sel = window.getSelection();
              if (sel) {
                const range = document.createRange();
                range.selectNodeContents(tb);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);
              }
            } catch (e) {}

            try {
              const dt = new DataTransfer();
              dt.setData('text/plain', text);
              tb.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
            } catch (e) {}

            setTimeout(() => {
              const cur = (tb.innerText || tb.textContent || '').trim();
              if (cur.length < Math.min(5, text.trim().length)) {
                tb.focus();
                try {
                  document.execCommand('insertText', false, text);
                } catch (e) {}
                try {
                  tb.dispatchEvent(new InputEvent('input', { bubbles: true, data: text, inputType: 'insertText' }));
                } catch (e) {}
              }
            }, 250);

            return { ok: true };
          } catch (err) {
            return { ok: false, error: String(err) };
          }
        }
      },
      (results) => {
        void chrome.runtime.lastError;
        sendResponse({ ok: true, result: results && results[0] ? results[0].result : null });
      }
    );
    return true;
  }

  if (request.action === 'AUTOVIRAL_MAIN_CLICK_PUBLISH') {
    const tabId = sender && sender.tab && sender.tab.id;
    if (!tabId || !chrome.scripting || !chrome.scripting.executeScript) {
      sendResponse({ ok: false });
      return false;
    }
    chrome.scripting.executeScript(
      {
        target: { tabId },
        world: 'MAIN',
        func: () => {
          try {
            const pickActiveComposerDialog = () => {
              const allDialogs = Array.from(document.querySelectorAll('div[role="dialog"]'));
              const scored = [];
              allDialogs.forEach((d, idx) => {
                const r = d.getBoundingClientRect();
                if (r.width < 200 || r.height < 150) return;
                if (d.getAttribute('aria-hidden') === 'true') return;
                try {
                  const st = window.getComputedStyle(d);
                  if (st.display === 'none' || st.visibility === 'hidden' || st.pointerEvents === 'none') return;
                  const op = parseFloat(st.opacity || '1');
                  if (!isNaN(op) && op < 0.35) return;
                } catch (e) {}
                const tb = d.querySelector('div[role="textbox"][contenteditable="true"], div[contenteditable="true"][data-lexical-editor="true"]');
                const txt = (d.innerText || '').toLowerCase();
                const aria = (d.getAttribute('aria-label') || '').toLowerCase();
                const isComposer =
                  Boolean(tb) ||
                  txt.includes('criar post') ||
                  txt.includes('create post') ||
                  txt.includes('criar publicação') ||
                  txt.includes('crear publicación') ||
                  txt.includes('crear publicacion') ||
                  txt.includes('create a public post') ||
                  txt.includes('crie um post público') ||
                  txt.includes('publicação anônima') ||
                  txt.includes('publicación anónima') ||
                  txt.includes('anonymous post') ||
                  aria.includes('criar post') ||
                  aria.includes('create post') ||
                  aria.includes('crear publicación');
                if (!isComposer) return;
                let score = idx * 100 + (tb ? 500 : 0);
                let cur = d;
                for (let depth = 0; depth < 6 && cur && cur !== document.body; depth++) {
                  try {
                    const z = parseInt(window.getComputedStyle(cur).zIndex, 10);
                    if (!isNaN(z) && z > 0) score += Math.min(z, 50000);
                  } catch (e) {}
                  cur = cur.parentElement;
                }
                const testPts = [
                  [r.left + r.width * 0.5, r.top + Math.min(r.height * 0.25, 90)],
                  [r.left + r.width * 0.5, r.top + r.height * 0.5]
                ];
                for (const [px, py] of testPts) {
                  if (px >= 0 && py >= 0 && px <= window.innerWidth && py <= window.innerHeight) {
                    const topEl = document.elementFromPoint(px, py);
                    if (topEl && d.contains(topEl)) {
                      score += 1000000;
                      break;
                    }
                  }
                }
                scored.push({ d, score });
              });
              scored.sort((a, b) => b.score - a.score);
              return scored[0] ? scored[0].d : null;
            };
            const dlg = pickActiveComposerDialog();
            const scope = dlg || document.querySelector('[data-pagelet="GroupInlineComposer"]') || document.querySelector('[role="main"]');
            if (!scope) return { clicked: false, reason: 'no_dialog' };

            const candidates = Array.from(scope.querySelectorAll('div[role="button"], button'));
            const pubBtn = candidates.find((el) => {
              const rect = el.getBoundingClientRect();
              if (rect.width === 0 || rect.height === 0) return false;
              const txt = ((el.innerText || el.getAttribute('aria-label') || '') + '').trim().toLowerCase();
              if (txt !== 'postar' && txt !== 'publicar' && txt !== 'post' && txt !== 'enviar' && txt !== 'submit') return false;
              const disabled = el.getAttribute('aria-disabled') === 'true' || el.disabled || el.getAttribute('tabindex') === '-1';
              return !disabled;
            });
            if (!pubBtn) return { clicked: false, reason: 'no_enabled_btn' };

            pubBtn.scrollIntoView({ behavior: 'instant', block: 'nearest' });
            const r = pubBtn.getBoundingClientRect();
            const cx = Math.round(r.left + r.width / 2);
            const cy = Math.round(r.top + r.height / 2);
            pubBtn.focus();
            try { pubBtn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, view: window, clientX: cx, clientY: cy, pointerType: 'mouse', isPrimary: true })); } catch (e) {}
            try { pubBtn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window, clientX: cx, clientY: cy })); } catch (e) {}
            try { pubBtn.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true, view: window, clientX: cx, clientY: cy, pointerType: 'mouse', isPrimary: true })); } catch (e) {}
            try { pubBtn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window, clientX: cx, clientY: cy })); } catch (e) {}
            pubBtn.click();
            return { clicked: true };
          } catch (err) {
            return { clicked: false, error: String(err) };
          }
        }
      },
      (results) => {
        void chrome.runtime.lastError;
        sendResponse({ ok: true, result: results && results[0] ? results[0].result : null });
      }
    );
    return true;
  }

  if (request.action === 'AUTOVIRAL_REAL_CLICK_COMPOSER') {
    const tabId = sender && sender.tab && sender.tab.id;
    if (!tabId || !chrome.scripting || !chrome.scripting.executeScript) {
      sendResponse({ ok: false });
      return false;
    }
    (async () => {
      try {
        const isSilentTab = await new Promise((resolve) => {
          if (silentTabIds.has(tabId)) {
            resolve(true);
            return;
          }
          chrome.storage.local.get(['autoviral_silent_tabs'], (r) => {
            const m = r && r.autoviral_silent_tabs;
            resolve(Boolean(m && m[String(tabId)]));
          });
        });
        if (!isSilentTab) {
          try {
            await new Promise((resolve) => {
              chrome.tabs.update(tabId, { active: true }, () => {
                void chrome.runtime.lastError;
                resolve();
              });
            });
          } catch (e) {}
        }

        const measureComposerCoords = () =>
          new Promise((resolve) => {
            chrome.scripting.executeScript(
              {
                target: { tabId },
                world: 'MAIN',
                func: () => {
                  const existingDialog = Array.from(document.querySelectorAll('div[role="dialog"]')).find((d) => {
                    const r = d.getBoundingClientRect();
                    if (r.width < 200 || r.height < 150) return false;
                    if (d.getAttribute('aria-hidden') === 'true') return false;
                    try {
                      const st = window.getComputedStyle(d);
                      if (st.display === 'none' || st.visibility === 'hidden' || st.pointerEvents === 'none') return false;
                      const op = parseFloat(st.opacity || '1');
                      if (!isNaN(op) && op < 0.35) return false;
                    } catch (e) {}
                    return Boolean(d.querySelector('div[role="textbox"][contenteditable="true"], div[contenteditable="true"][data-lexical-editor="true"]'));
                  });
                  if (existingDialog) return { found: true, alreadyOpen: true };
                  const inlineTb = document.querySelector('[data-pagelet="GroupInlineComposer"] div[role="textbox"][contenteditable="true"], [data-pagelet="GroupInlineComposer"] div[contenteditable="true"][data-lexical-editor="true"]');
                  if (inlineTb && inlineTb.getBoundingClientRect().height >= 20) return { found: true, alreadyOpen: true };

                  if (window.scrollY > 380) {
                    try { window.scrollTo({ top: 0, behavior: 'instant' }); } catch (e) {}
                  }

                  const FORBIDDEN = ['anônim', 'anonim', 'anónim', 'anonym', 'enquete', 'poll', 'encuesta', 'sentimento', 'feeling', 'sentimiento', 'foto', 'photo', 'vídeo', 'video', 'ao vivo', 'live', 'en vivo', 'comentar', 'comment', 'responder', 'reply'];
                  const hasForbidden = (s) => FORBIDDEN.some((w) => s.includes(w));

                  const candidates = Array.from(
                    document.querySelectorAll('[data-pagelet="GroupInlineComposer"] div[role="button"], [data-pagelet="GroupInlineComposer"] span, [role="main"] div[role="button"], [role="main"] span, div[role="button"], span')
                  );
                  const scored = [];
                  for (const el of candidates) {
                    const rect = el.getBoundingClientRect();
                    if (rect.width < 55 || rect.height < 14 || rect.height > 78) continue;
                    if (el.closest('div[role="dialog"]') || el.closest('div[role="article"]') || el.closest('[role="complementary"]') || el.closest('[aria-busy="true"]')) continue;
                    const t = (el.innerText || el.getAttribute('aria-label') || '').trim().toLowerCase();
                    if (!t || t.length > 95 || hasForbidden(t)) continue;
                    const btnAncestor = el.closest('div[role="button"]');
                    if (btnAncestor) {
                      const br = btnAncestor.getBoundingClientRect();
                      const bt = (btnAncestor.innerText || btnAncestor.getAttribute('aria-label') || '').trim().toLowerCase();
                      if (br.height > 90 || hasForbidden(bt)) continue;
                    }
                    const isExact =
                      t === 'escreva algo...' ||
                      t === 'escribe algo...' ||
                      t === 'write something...' ||
                      t === 'no que você está pensando?' ||
                      t === '¿qué estás pensando?' ||
                      t === 'qué estás pensando?' ||
                      t === "what's on your mind?" ||
                      t === 'escreva uma publicação pública...' ||
                      t === 'escribe una publicación pública...' ||
                      t === 'write a public post...';
                    const isMatch =
                      isExact ||
                      t.includes('escreva algo') ||
                      t.includes('escribe algo') ||
                      t.includes('no que você está pensando') ||
                      t.includes('qué estás pensando') ||
                      t.includes('que estas pensando') ||
                      t.includes('write something') ||
                      t.includes("what's on your mind") ||
                      t.includes('criar publicação pública') ||
                      t.includes('crear publicación pública') ||
                      t.includes('crear publicacion publica') ||
                      t.includes('create a public post') ||
                      t.includes('write a public post') ||
                      t.includes('escreva uma publicação') ||
                      t.includes('escribe una publicación') ||
                      t.includes('escribe una publicacion') ||
                      t.includes('haz una publicación');
                    if (!isMatch) continue;
                    const inInline = el.closest('[data-pagelet="GroupInlineComposer"]') ? -50000 : 0;
                    const exactRank = isExact ? 0 : 100000;
                    scored.push({ el, score: exactRank + inInline + rect.width * rect.height });
                  }
                  scored.sort((a, b) => a.score - b.score);
                  const hit = scored[0] ? scored[0].el : null;
                  if (!hit) return { found: false };
                  hit.scrollIntoView({ behavior: 'instant', block: 'center' });
                  const r = hit.getBoundingClientRect();
                  const cx = Math.round(r.left + Math.min(r.width * 0.45, 140));
                  const cy = Math.round(r.top + r.height / 2);
                  const topEl = document.elementFromPoint(cx, cy);
                  const topText = ((topEl && (topEl.innerText || topEl.getAttribute('aria-label'))) || '').trim().toLowerCase();
                  if (topText && hasForbidden(topText)) {
                    return { found: false, blockedBy: topText };
                  }
                  return { found: true, cx, cy };
                }
              },
              (results) => {
                void chrome.runtime.lastError;
                resolve(results && results[0] ? results[0].result : null);
              }
            );
          });

        // Attach debugger FIRST so Chrome's top debugging infobar shift happens BEFORE measuring (cx, cy)!
        const dbg = await withTabDebugger(tabId, async (sendCmd) => {
          await sleepMs(380);
          const pos = await measureComposerCoords();
          if (!pos || !pos.found) return { clicked: false, reason: 'trigger_not_found' };
          if (pos.alreadyOpen) return { clicked: true, alreadyOpen: true };
          await sleepMs(120);
          const freshPos = await measureComposerCoords();
          const cx = (freshPos && freshPos.found && freshPos.cx) || pos.cx;
          const cy = (freshPos && freshPos.found && freshPos.cy) || pos.cy;
          if (typeof cx !== 'number' || typeof cy !== 'number') return { clicked: false };
          await dispatchRealTrustedClick(sendCmd, cx, cy, 200);
          return { clicked: true, trusted: true, cx, cy };
        });

        if (dbg.usedDebugger && dbg.value && dbg.value.clicked) {
          sendResponse({ ok: true, result: { found: true, mode: 'debugger_trusted', cx: dbg.value.cx, cy: dbg.value.cy } });
          return;
        }

        // Fallback if debugger wasn't available or couldn't hit safely
        const fallbackOk = await new Promise((resolve) => {
          chrome.scripting.executeScript(
            {
              target: { tabId },
              world: 'MAIN',
              func: () => {
                const FORBIDDEN = ['anônim', 'anonim', 'anónim', 'anonym', 'enquete', 'poll', 'encuesta', 'sentimento', 'feeling', 'sentimiento', 'foto', 'photo', 'vídeo', 'video', 'ao vivo', 'live', 'en vivo', 'comentar', 'comment', 'responder', 'reply'];
                const hasForbidden = (s) => FORBIDDEN.some((w) => s.includes(w));
                const candidates = Array.from(
                  document.querySelectorAll('[data-pagelet="GroupInlineComposer"] div[role="button"], [data-pagelet="GroupInlineComposer"] span, [role="main"] div[role="button"], [role="main"] span, div[role="button"], span')
                );
                const scored = [];
                for (const el of candidates) {
                  const rect = el.getBoundingClientRect();
                  if (rect.width < 55 || rect.height < 14 || rect.height > 78) continue;
                  if (el.closest('div[role="dialog"]') || el.closest('div[role="article"]') || el.closest('[role="complementary"]') || el.closest('[aria-busy="true"]')) continue;
                  const t = (el.innerText || el.getAttribute('aria-label') || '').trim().toLowerCase();
                  if (!t || t.length > 95 || hasForbidden(t)) continue;
                  const isExact = t === 'escreva algo...' || t === 'escribe algo...' || t === 'write something...' || t === '¿qué estás pensando?';
                  const isMatch =
                    isExact ||
                    t.includes('escreva algo') ||
                    t.includes('escribe algo') ||
                    t.includes('no que você está pensando') ||
                    t.includes('qué estás pensando') ||
                    t.includes('que estas pensando') ||
                    t.includes('write something') ||
                    t.includes("what's on your mind") ||
                    t.includes('criar publicação pública') ||
                    t.includes('crear publicación pública') ||
                    t.includes('escribe una publicación') ||
                    t.includes('haz una publicación') ||
                    t.includes('create a public post');
                  if (!isMatch) continue;
                  scored.push({ el, score: (isExact ? 0 : 100000) + rect.width * rect.height });
                }
                scored.sort((a, b) => a.score - b.score);
                const hit = scored[0] ? scored[0].el : null;
                const ancestorBtn = hit ? hit.closest('div[role="button"]') : null;
                const trigger = ancestorBtn && ancestorBtn.getBoundingClientRect().height <= 85 ? ancestorBtn : hit;
                if (trigger && hit) {
                  hit.scrollIntoView({ behavior: 'instant', block: 'center' });
                  try { trigger.focus(); } catch (e) {}
                  try { hit.click(); } catch (e) {}
                  if (trigger !== hit) { try { trigger.click(); } catch (e) {} }
                  return true;
                }
                return false;
              }
            },
            (results) => {
              void chrome.runtime.lastError;
              resolve(Boolean(results && results[0] && results[0].result));
            }
          );
        });
        sendResponse({ ok: fallbackOk, result: { found: fallbackOk, mode: 'main_fallback' } });
      } catch (err) {
        sendResponse({ ok: false, error: String(err) });
      }
    })();
    return true;
  }

  if (request.action === 'AUTOVIRAL_REAL_INSERT_TEXT') {
    const tabId = sender && sender.tab && sender.tab.id;
    const textToInsert = String(request.text || '');
    if (!tabId || !textToInsert || !chrome.scripting || !chrome.scripting.executeScript) {
      sendResponse({ ok: false });
      return false;
    }
    (async () => {
      try {
        const measureBox = () =>
          new Promise((resolve) => {
            chrome.scripting.executeScript(
              {
                target: { tabId },
                world: 'MAIN',
                func: () => {
                  const pickActiveComposerDialog = () => {
                    const allDialogs = Array.from(document.querySelectorAll('div[role="dialog"]'));
                    const scored = [];
                    allDialogs.forEach((d, idx) => {
                      const r = d.getBoundingClientRect();
                      if (r.width < 200 || r.height < 150) return;
                      if (d.getAttribute('aria-hidden') === 'true') return;
                      try {
                        const st = window.getComputedStyle(d);
                        if (st.display === 'none' || st.visibility === 'hidden' || st.pointerEvents === 'none') return;
                        const op = parseFloat(st.opacity || '1');
                        if (!isNaN(op) && op < 0.35) return;
                      } catch (e) {}
                      const tb = d.querySelector('div[role="textbox"][contenteditable="true"], div[contenteditable="true"][data-lexical-editor="true"]');
                      const txt = (d.innerText || '').toLowerCase();
                      const aria = (d.getAttribute('aria-label') || '').toLowerCase();
                      const isComposer =
                        Boolean(tb) ||
                        txt.includes('criar post') ||
                        txt.includes('create post') ||
                        txt.includes('criar publicação') ||
                        txt.includes('crear publicación') ||
                        txt.includes('crear publicacion') ||
                        txt.includes('create a public post') ||
                        txt.includes('crie um post público') ||
                        txt.includes('publicação anônima') ||
                        txt.includes('publicación anónima') ||
                        txt.includes('anonymous post') ||
                        aria.includes('criar post') ||
                        aria.includes('create post') ||
                        aria.includes('crear publicación');
                      if (!isComposer) return;
                      let score = idx * 100 + (tb ? 500 : 0);
                      let cur = d;
                      for (let depth = 0; depth < 6 && cur && cur !== document.body; depth++) {
                        try {
                          const z = parseInt(window.getComputedStyle(cur).zIndex, 10);
                          if (!isNaN(z) && z > 0) score += Math.min(z, 50000);
                        } catch (e) {}
                        cur = cur.parentElement;
                      }
                      const testPts = [];
                      if (tb) {
                        const tr = tb.getBoundingClientRect();
                        if (tr.width > 20 && tr.height > 15) {
                          testPts.push([tr.left + Math.min(tr.width * 0.4, 100), tr.top + Math.min(tr.height * 0.5, 24)]);
                        }
                      }
                      testPts.push([r.left + r.width * 0.5, r.top + Math.min(r.height * 0.25, 90)]);
                      testPts.push([r.left + r.width * 0.5, r.top + r.height * 0.5]);
                      for (const [px, py] of testPts) {
                        if (px >= 0 && py >= 0 && px <= window.innerWidth && py <= window.innerHeight) {
                          const topEl = document.elementFromPoint(px, py);
                          if (topEl && d.contains(topEl)) {
                            score += 1000000;
                            break;
                          }
                        }
                      }
                      scored.push({ d, score });
                    });
                    scored.sort((a, b) => b.score - a.score);
                    return scored[0] ? scored[0].d : null;
                  };
                  const dlg = pickActiveComposerDialog();
                  const scope = dlg || document.querySelector('[data-pagelet="GroupInlineComposer"]') || document.querySelector('[role="main"]');
                  if (!scope) return { ok: false };
                  const boxes = Array.from(
                    scope.querySelectorAll(
                      'div[role="textbox"][contenteditable="true"], div[contenteditable="true"][data-lexical-editor="true"], div[contenteditable="true"][aria-placeholder], div[contenteditable="true"][aria-label]'
                    )
                  );
                  const tb = boxes.find((el) => {
                    if (!dlg && (el.closest('div[role="article"]') || el.closest('[role="complementary"]'))) return false;
                    const rect = el.getBoundingClientRect();
                    if (rect.width < 40 || rect.height < 20) return false;
                    const lbl = ((el.getAttribute('aria-label') || el.getAttribute('aria-placeholder') || el.getAttribute('placeholder') || '') + '').toLowerCase();
                    return !lbl.includes('coment') && !lbl.includes('comment') && !lbl.includes('responder') && !lbl.includes('reply') && !lbl.includes('pesquis') && !lbl.includes('search') && !lbl.includes('buscar');
                  });
                  if (!tb) return { ok: false };
                  const existing = (tb.innerText || tb.textContent || '').trim();
                  tb.focus();
                  const r = tb.getBoundingClientRect();
                  return {
                    ok: true,
                    alreadyHasText: existing.length >= 10,
                    textLen: existing.length,
                    cx: Math.round(r.left + Math.min(r.width * 0.4, 120)),
                    cy: Math.round(r.top + Math.min(r.height * 0.4, 30))
                  };
                }
              },
              (results) => {
                void chrome.runtime.lastError;
                resolve(results && results[0] ? results[0].result : null);
              }
            );
          });

        // Attach debugger FIRST, wait for infobar shift, THEN measure textbox coordinates!
        const dbg = await withTabDebugger(tabId, async (sendCmd) => {
          await sleepMs(320);
          const boxInfo = await measureBox();
          if (!boxInfo || !boxInfo.ok) return { inserted: false, reason: 'no_textbox' };
          if (boxInfo.alreadyHasText) return { inserted: true, skipped: 'already_filled' };

          await dispatchRealTrustedClick(sendCmd, boxInfo.cx, boxInfo.cy, 80);
          await sleepMs(120);

          // Split text on URLs so each URL gets a real Space/Return keystroke triggering Facebook's clickable AutoLink!
          const tokens = textToInsert.split(/(https?:\/\/[^\s<>"']+)/gi);
          for (let i = 0; i < tokens.length; i++) {
            const part = tokens[i];
            if (!part) continue;
            if (/^https?:\/\//i.test(part)) {
              await sendCmd('Input.insertText', { text: part });
              await sendCmd('Input.dispatchKeyEvent', {
                type: 'keyDown',
                key: ' ',
                code: 'Space',
                text: ' ',
                windowsVirtualKeyCode: 32,
                nativeVirtualKeyCode: 32
              });
              await sendCmd('Input.dispatchKeyEvent', {
                type: 'keyUp',
                key: ' ',
                code: 'Space',
                windowsVirtualKeyCode: 32,
                nativeVirtualKeyCode: 32
              });
              await sleepMs(380);
            } else {
              let cleaned = part;
              if (i > 0 && /^https?:\/\//i.test(tokens[i - 1]) && cleaned.startsWith(' ')) {
                cleaned = cleaned.slice(1);
              }
              const lines = cleaned.split('\n');
              for (let li = 0; li < lines.length; li++) {
                if (lines[li]) {
                  await sendCmd('Input.insertText', { text: lines[li] });
                }
                if (li < lines.length - 1) {
                  await sendCmd('Input.dispatchKeyEvent', {
                    type: 'keyDown',
                    key: 'Enter',
                    code: 'Enter',
                    text: '\r',
                    windowsVirtualKeyCode: 13,
                    nativeVirtualKeyCode: 13
                  });
                  await sendCmd('Input.dispatchKeyEvent', {
                    type: 'keyUp',
                    key: 'Enter',
                    code: 'Enter',
                    windowsVirtualKeyCode: 13,
                    nativeVirtualKeyCode: 13
                  });
                  await sleepMs(45);
                }
              }
            }
          }
          await sleepMs(180);
          const verifyBox = await measureBox();
          const finalLen = verifyBox && typeof verifyBox.textLen === 'number' ? verifyBox.textLen : 0;
          if (finalLen < Math.min(5, textToInsert.trim().length)) {
            return { inserted: false, reason: 'text_did_not_stick' };
          }
          return { inserted: true };
        });

        if (dbg.usedDebugger && dbg.value && dbg.value.inserted) {
          sendResponse({ ok: true, result: { ok: true, mode: 'debugger_insertText_autolink' } });
          return;
        }
        sendResponse({ ok: false, reason: (dbg.value && dbg.value.reason) || 'debugger_insert_failed' });
      } catch (err) {
        sendResponse({ ok: false, error: String(err) });
      }
    })();
    return true;
  }

  if (request.action === 'AUTOVIRAL_FETCH_IMAGE_DATAURL') {
    const rawUrl = String(request.imageUrl || '').trim();
    if (!rawUrl) {
      sendResponse({ ok: false, reason: 'empty_url' });
      return false;
    }
    if (rawUrl.startsWith('data:image/')) {
      sendResponse({ ok: true, dataUrl: rawUrl });
      return false;
    }
    (async () => {
      try {
        const resp = await fetch(rawUrl);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const blob = await resp.blob();
        const mimeType = blob.type && blob.type.startsWith('image/') ? blob.type : 'image/jpeg';
        const ab = await blob.arrayBuffer();
        const bytes = new Uint8Array(ab);
        let binary = '';
        const chunk = 8192;
        for (let i = 0; i < bytes.length; i += chunk) {
          binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)));
        }
        const dataUrl = `data:${mimeType};base64,${btoa(binary)}`;
        sendResponse({ ok: true, dataUrl });
      } catch (err) {
        sendResponse({ ok: false, error: String(err) });
      }
    })();
    return true;
  }

  if (request.action === 'AUTOVIRAL_MAIN_ATTACH_IMAGE') {
    const tabId = sender && sender.tab && sender.tab.id;
    const dataUrl = String(request.dataUrl || '');
    if (!tabId || !dataUrl.startsWith('data:image/') || !chrome.scripting || !chrome.scripting.executeScript) {
      sendResponse({ ok: false });
      return false;
    }
    chrome.scripting.executeScript(
      {
        target: { tabId },
        world: 'MAIN',
        args: [dataUrl],
        func: async (imgDataUrl) => {
          try {
            const wait = (ms) => new Promise((r) => setTimeout(r, ms));
            const parts = imgDataUrl.split(',');
            const mimeMatch = parts[0].match(/data:([^;]+);/i);
            const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
            const byteStr = atob(parts[1] || '');
            const ab = new ArrayBuffer(byteStr.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteStr.length; i++) ia[i] = byteStr.charCodeAt(i);
            const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg';
            const file = new File([ab], `product-photo.${ext}`, { type: mime });
            const dt = new DataTransfer();
            dt.items.add(file);

            const pickActiveComposerDialog = () => {
              const allDialogs = Array.from(document.querySelectorAll('div[role="dialog"]'));
              const scored = [];
              allDialogs.forEach((d, idx) => {
                const r = d.getBoundingClientRect();
                if (r.width < 200 || r.height < 150) return;
                if (d.getAttribute('aria-hidden') === 'true') return;
                try {
                  const st = window.getComputedStyle(d);
                  if (st.display === 'none' || st.visibility === 'hidden' || st.pointerEvents === 'none') return;
                  const op = parseFloat(st.opacity || '1');
                  if (!isNaN(op) && op < 0.35) return;
                } catch (e) {}
                const tb = d.querySelector('div[role="textbox"][contenteditable="true"], div[contenteditable="true"][data-lexical-editor="true"]');
                const txt = (d.innerText || '').toLowerCase();
                const aria = (d.getAttribute('aria-label') || '').toLowerCase();
                const isComposer =
                  Boolean(tb) ||
                  txt.includes('criar post') ||
                  txt.includes('create post') ||
                  txt.includes('criar publicação') ||
                  txt.includes('crear publicación') ||
                  txt.includes('crear publicacion') ||
                  txt.includes('create a public post') ||
                  txt.includes('crie um post público') ||
                  txt.includes('publicação anônima') ||
                  txt.includes('publicación anónima') ||
                  txt.includes('anonymous post') ||
                  aria.includes('criar post') ||
                  aria.includes('create post') ||
                  aria.includes('crear publicación');
                if (!isComposer) return;
                let score = idx * 100 + (tb ? 500 : 0);
                let cur = d;
                for (let depth = 0; depth < 6 && cur && cur !== document.body; depth++) {
                  try {
                    const z = parseInt(window.getComputedStyle(cur).zIndex, 10);
                    if (!isNaN(z) && z > 0) score += Math.min(z, 50000);
                  } catch (e) {}
                  cur = cur.parentElement;
                }
                const testPts = [];
                if (tb) {
                  const tr = tb.getBoundingClientRect();
                  if (tr.width > 20 && tr.height > 15) {
                    testPts.push([tr.left + Math.min(tr.width * 0.4, 100), tr.top + Math.min(tr.height * 0.5, 24)]);
                  }
                }
                testPts.push([r.left + r.width * 0.5, r.top + Math.min(r.height * 0.25, 90)]);
                testPts.push([r.left + r.width * 0.5, r.top + r.height * 0.5]);
                for (const [px, py] of testPts) {
                  if (px >= 0 && py >= 0 && px <= window.innerWidth && py <= window.innerHeight) {
                    const topEl = document.elementFromPoint(px, py);
                    if (topEl && d.contains(topEl)) {
                      score += 1000000;
                      break;
                    }
                  }
                }
                scored.push({ d, score });
              });
              scored.sort((a, b) => b.score - a.score);
              return scored[0] ? scored[0].d : null;
            };
            const dlg = pickActiveComposerDialog();
            if (!dlg) return { attached: false, reason: 'no_dialog' };

            const hasPhotoPreviewNow = () => {
              const imgs = Array.from(dlg.querySelectorAll('img')).some((img) => {
                const r = img.getBoundingClientRect();
                const src = img.getAttribute('src') || '';
                return (
                  (src.startsWith('blob:') || src.startsWith('data:image/') || src.includes('scontent') || src.includes('fbcdn')) &&
                  r.width > 72 &&
                  r.height > 72
                );
              });
              const editBtn = Boolean(
                dlg.querySelector(
                  '[aria-label="Editar"], [aria-label="Edit"], [aria-label*="Editar tudo" i], [aria-label*="Edit all" i], [aria-label*="Editar foto" i], [aria-label*="Edit photo" i]'
                )
              );
              return imgs || editBtn;
            };

            const findComposerFileInputs = () => {
              const roots = [dlg];
              let ancestor = dlg.parentElement;
              for (let depth = 0; depth < 5 && ancestor && ancestor !== document.body; depth++) {
                roots.push(ancestor);
                ancestor = ancestor.parentElement;
              }
              const collected = [];
              for (const root of roots) {
                const inps = Array.from(root.querySelectorAll('input[type="file"]')).filter(
                  (inp) => !inp.closest('div[role="article"]')
                );
                for (const inp of inps) {
                  if (!collected.includes(inp)) collected.push(inp);
                }
              }
              // Document-wide fallback outside feed articles
              const docInputs = Array.from(document.querySelectorAll('input[type="file"]')).filter(
                (inp) => !inp.closest('div[role="article"]')
              );
              for (const inp of docInputs) {
                if (!collected.includes(inp)) collected.push(inp);
              }
              return collected.sort((a, b) => {
                const aScore = ((a.accept || '').includes('image') ? 3 : 0) + (a.multiple ? 2 : 0) + (dlg.contains(a) ? 5 : 0);
                const bScore = ((b.accept || '').includes('image') ? 3 : 0) + (b.multiple ? 2 : 0) + (dlg.contains(b) ? 5 : 0);
                return bScore - aScore;
              });
            };

            const setFilesNatively = (inp) => {
              try {
                const desc = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'files');
                if (desc && desc.set) {
                  desc.set.call(inp, dt.files);
                } else {
                  inp.files = dt.files;
                }
              } catch (e) {
                try { inp.files = dt.files; } catch (err) {}
              }
              try {
                inp.dispatchEvent(new Event('input', { bubbles: true }));
                inp.dispatchEvent(new Event('change', { bubbles: true }));
              } catch (e) {}
            };

            const triggerReactPropsFallback = (inp) => {
              try {
                const syntheticEvt = {
                  target: inp,
                  currentTarget: inp,
                  nativeEvent: new Event('change', { bubbles: true }),
                  preventDefault: () => {},
                  stopPropagation: () => {}
                };
                const propsKey = Object.keys(inp).find((k) => k.startsWith('__reactProps$'));
                if (propsKey && inp[propsKey] && typeof inp[propsKey].onChange === 'function') {
                  inp[propsKey].onChange(syntheticEvt);
                }
                const fiberKey = Object.keys(inp).find((k) => k.startsWith('__reactFiber$') || k.startsWith('__reactInternalInstance$'));
                if (fiberKey) {
                  let node = inp[fiberKey];
                  for (let i = 0; i < 4 && node; i++) {
                    if (node.memoizedProps && typeof node.memoizedProps.onChange === 'function') {
                      node.memoizedProps.onChange(syntheticEvt);
                      break;
                    }
                    node = node.return;
                  }
                }
              } catch (e) {}
            };

            let inputs = findComposerFileInputs();

            // Try existing inputs inside active foreground dialog first
            for (const inp of inputs.slice(0, 3)) {
              setFilesNatively(inp);
              triggerReactPropsFallback(inp);
              await wait(700);
              if (hasPhotoPreviewNow()) {
                return { attached: true, method: 'file_input_verified', previewDetected: true };
              }
            }

            // If no preview yet, click "Foto/vídeo" inside dlg while trapping both createElement('input') and HTMLInputElement.prototype.click
            // so Facebook mounts/reveals its exact <input type="file"> WITHOUT ever opening the OS file picker!
            const photoBtn = Array.from(
              dlg.querySelectorAll('div[role="button"], button')
            ).find((el) => {
              const r = el.getBoundingClientRect();
              if (r.width === 0 || r.height === 0) return false;
              const lbl = ((el.getAttribute('aria-label') || el.innerText || '') + '').trim().toLowerCase();
              return (
                lbl.includes('foto/vídeo') ||
                lbl.includes('foto/video') ||
                lbl.includes('photo/video') ||
                lbl.includes('fotos/vídeos') ||
                lbl.includes('photos/videos') ||
                lbl.includes('adicionar fotos') ||
                lbl.includes('add photos')
              );
            });

            if (photoBtn) {
              let capturedInp = null;
              const origClick = HTMLInputElement.prototype.click;
              const origCreate = Document.prototype.createElement;
              HTMLInputElement.prototype.click = function () {
                if (this && this.type === 'file') {
                  capturedInp = this;
                  return;
                }
                return origClick.apply(this, arguments);
              };
              Document.prototype.createElement = function (tagName) {
                const el = origCreate.apply(this, arguments);
                if (typeof tagName === 'string' && tagName.toLowerCase() === 'input') {
                  setTimeout(() => {
                    if (el && el.type === 'file') capturedInp = el;
                  }, 0);
                }
                return el;
              };
              try {
                const pr = photoBtn.getBoundingClientRect();
                const cx = Math.round(pr.left + pr.width / 2);
                const cy = Math.round(pr.top + pr.height / 2);
                try { photoBtn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, clientX: cx, clientY: cy, pointerType: 'mouse' })); } catch (e) {}
                try { photoBtn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, clientX: cx, clientY: cy })); } catch (e) {}
                try { photoBtn.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true, clientX: cx, clientY: cy, pointerType: 'mouse' })); } catch (e) {}
                try { photoBtn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, clientX: cx, clientY: cy })); } catch (e) {}
                try { photoBtn.click(); } catch (e) {}
                await wait(700);
              } finally {
                HTMLInputElement.prototype.click = origClick;
                Document.prototype.createElement = origCreate;
              }

              if (capturedInp && !inputs.includes(capturedInp)) {
                inputs = [capturedInp, ...inputs];
              } else {
                inputs = findComposerFileInputs();
              }

              for (const inp of inputs.slice(0, 3)) {
                setFilesNatively(inp);
                await wait(750);
                if (hasPhotoPreviewNow()) {
                  return { attached: true, method: 'trapped_photo_btn_verified', previewDetected: true };
                }
                triggerReactPropsFallback(inp);
                await wait(500);
                if (hasPhotoPreviewNow()) {
                  return { attached: true, method: 'react_props_verified', previewDetected: true };
                }
              }
            }

            // Dispatch paste + drop directly onto dropzone and foreground Lexical textbox
            const tb = dlg.querySelector('div[role="textbox"][contenteditable="true"], div[contenteditable="true"][data-lexical-editor="true"]');
            const dropTargets = [
              dlg.querySelector('[aria-label*="arraste" i], [aria-label*="drag" i], [aria-label*="Adicionar fotos" i], [aria-label*="Add photos" i]'),
              tb,
              dlg
            ].filter(Boolean);

            for (const target of dropTargets) {
              try {
                if (target.focus) target.focus();
                target.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
                target.dispatchEvent(new DragEvent('dragenter', { dataTransfer: dt, bubbles: true, cancelable: true }));
                target.dispatchEvent(new DragEvent('dragover', { dataTransfer: dt, bubbles: true, cancelable: true }));
                target.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true }));
              } catch (e) {}
              await wait(550);
              if (hasPhotoPreviewNow()) {
                return { attached: true, method: 'clipboard_drop_verified', previewDetected: true };
              }
            }

            return {
              attached: hasPhotoPreviewNow(),
              method: inputs.length > 0 ? 'file_input_no_preview' : 'no_input_no_preview',
              previewDetected: hasPhotoPreviewNow()
            };
          } catch (err) {
            return { attached: false, error: String(err) };
          }
        }
      },
      (results) => {
        void chrome.runtime.lastError;
        sendResponse({ ok: true, result: results && results[0] ? results[0].result : null });
      }
    );
    return true;
  }

  if (request.action === 'AUTOVIRAL_DISMISS_LINK_PREVIEW') {
    const tabId = sender && sender.tab && sender.tab.id;
    if (!tabId || !chrome.scripting || !chrome.scripting.executeScript) {
      sendResponse({ ok: false });
      return false;
    }
    chrome.scripting.executeScript(
      {
        target: { tabId },
        world: 'MAIN',
        func: () => {
          try {
            const pickActiveComposerDialog = () => {
              const allDialogs = Array.from(document.querySelectorAll('div[role="dialog"]'));
              const scored = [];
              allDialogs.forEach((d, idx) => {
                const r = d.getBoundingClientRect();
                if (r.width < 200 || r.height < 150) return;
                if (d.getAttribute('aria-hidden') === 'true') return;
                try {
                  const st = window.getComputedStyle(d);
                  if (st.display === 'none' || st.visibility === 'hidden' || st.pointerEvents === 'none') return;
                  const op = parseFloat(st.opacity || '1');
                  if (!isNaN(op) && op < 0.35) return;
                } catch (e) {}
                const tb = d.querySelector('div[role="textbox"][contenteditable="true"], div[contenteditable="true"][data-lexical-editor="true"]');
                const txt = (d.innerText || '').toLowerCase();
                const isComposer = Boolean(tb) || txt.includes('criar post') || txt.includes('create post') || txt.includes('criar publicação');
                if (!isComposer) return;
                let score = idx * 100 + (tb ? 500 : 0);
                const topEl = document.elementFromPoint(r.left + r.width * 0.5, r.top + Math.min(r.height * 0.25, 90));
                if (topEl && d.contains(topEl)) score += 1000000;
                scored.push({ d, score });
              });
              scored.sort((a, b) => b.score - a.score);
              return scored[0] ? scored[0].d : null;
            };
            const dlg = pickActiveComposerDialog();
            if (!dlg) return { dismissed: false, reason: 'no_dialog' };

            const isRealAttachedPhotoImg = (img) => {
              const r = img.getBoundingClientRect();
              const src = img.getAttribute('src') || '';
              return (
                (src.startsWith('blob:') || src.startsWith('data:image/') || src.includes('scontent') || src.includes('fbcdn')) &&
                r.width > 72 &&
                r.height > 72
              );
            };

            const hasPhotoAttached =
              Array.from(dlg.querySelectorAll('img')).some(isRealAttachedPhotoImg) ||
              Boolean(dlg.querySelector('[aria-label="Editar"], [aria-label="Edit"], [aria-label*="Editar tudo" i], [aria-label*="Edit all" i]'));
            if (!hasPhotoAttached) return { dismissed: false, reason: 'no_photo_attached' };

            const boxContainsAttachedPhoto = (el) => {
              if (!el) return false;
              if (Array.from(el.querySelectorAll('img')).some(isRealAttachedPhotoImg)) return true;
              return Boolean(el.querySelector('[aria-label="Editar"], [aria-label="Edit"], [aria-label*="Editar tudo" i], [aria-label*="Edit all" i]'));
            };

            // 1. Explicit Link Preview close/remove buttons in PT, EN, ES Facebook
            const explicitBtns = Array.from(
              dlg.querySelectorAll(
                '[aria-label*="Remover prévia" i], [aria-label*="Remove link" i], [aria-label*="Fechar prévia" i], [aria-label*="Close preview" i], [aria-label*="Remove attachment" i], [aria-label*="Remover anexo" i], [aria-label*="Eliminar vista previa" i], [aria-label*="Quitar vista previa" i]'
              )
            );
            for (const btn of explicitBtns) {
              const r = btn.getBoundingClientRect();
              if (r.width === 0 || r.height === 0) continue;
              const parentBox = btn.closest('div');
              if (boxContainsAttachedPhoto(parentBox)) continue;
              btn.click();
              return { dismissed: true, method: 'explicit_aria' };
            }

            // 2. Fallback: find an external link preview card (contains domain like .com / .app / .br, ZERO blob/data photo inside)
            const genericCloseBtns = Array.from(dlg.querySelectorAll('div[role="button"], button')).filter((btn) => {
              const r = btn.getBoundingClientRect();
              if (r.width === 0 || r.height === 0 || r.width > 48 || r.height > 48) return false;
              const lbl = ((btn.getAttribute('aria-label') || '') + '').trim().toLowerCase();
              return /^(remover|fechar|remove|close|dismiss|quitar|cerrar|excluir|delete)$/i.test(lbl);
            });
            for (const btn of genericCloseBtns) {
              let card = btn.parentElement;
              for (let depth = 0; depth < 5 && card && dlg.contains(card); depth++) {
                if (boxContainsAttachedPhoto(card)) {
                  card = null;
                  break;
                }
                const cardText = (card.innerText || '').trim();
                if (/\b[a-z0-9-]+\.(com|app|net|org|br|io|co|shop|store|site|online)\b/i.test(cardText) && cardText.length < 320) {
                  btn.click();
                  return { dismissed: true, method: 'link_card_domain_guard' };
                }
                card = card.parentElement;
              }
            }
            return { dismissed: false, reason: 'no_preview_card' };
          } catch (err) {
            return { dismissed: false, error: String(err) };
          }
        }
      },
      (results) => {
        void chrome.runtime.lastError;
        sendResponse({ ok: true, result: results && results[0] ? results[0].result : null });
      }
    );
    return true;
  }

  if (request.action === 'AUTOVIRAL_REAL_CLICK_PUBLISH') {
    const tabId = sender && sender.tab && sender.tab.id;
    if (!tabId || !chrome.scripting || !chrome.scripting.executeScript) {
      sendResponse({ ok: false });
      return false;
    }
    (async () => {
      try {
        const measureBtn = () =>
          new Promise((resolve) => {
            chrome.scripting.executeScript(
              {
                target: { tabId },
                world: 'MAIN',
                func: () => {
                  const pickActiveComposerDialog = () => {
                    const allDialogs = Array.from(document.querySelectorAll('div[role="dialog"]'));
                    const scored = [];
                    allDialogs.forEach((d, idx) => {
                      const r = d.getBoundingClientRect();
                      if (r.width < 200 || r.height < 150) return;
                      if (d.getAttribute('aria-hidden') === 'true') return;
                      try {
                        const st = window.getComputedStyle(d);
                        if (st.display === 'none' || st.visibility === 'hidden' || st.pointerEvents === 'none') return;
                        const op = parseFloat(st.opacity || '1');
                        if (!isNaN(op) && op < 0.35) return;
                      } catch (e) {}
                      const tb = d.querySelector('div[role="textbox"][contenteditable="true"], div[contenteditable="true"][data-lexical-editor="true"]');
                      const txt = (d.innerText || '').toLowerCase();
                      const aria = (d.getAttribute('aria-label') || '').toLowerCase();
                      const isComposer =
                        Boolean(tb) ||
                        txt.includes('criar post') ||
                        txt.includes('create post') ||
                        txt.includes('criar publicação') ||
                        txt.includes('crear publicación') ||
                        txt.includes('crear publicacion') ||
                        txt.includes('create a public post') ||
                        txt.includes('crie um post público') ||
                        txt.includes('publicação anônima') ||
                        txt.includes('publicación anónima') ||
                        txt.includes('anonymous post') ||
                        aria.includes('criar post') ||
                        aria.includes('create post') ||
                        aria.includes('crear publicación');
                      if (!isComposer) return;
                      let score = idx * 100 + (tb ? 500 : 0);
                      let cur = d;
                      for (let depth = 0; depth < 6 && cur && cur !== document.body; depth++) {
                        try {
                          const z = parseInt(window.getComputedStyle(cur).zIndex, 10);
                          if (!isNaN(z) && z > 0) score += Math.min(z, 50000);
                        } catch (e) {}
                        cur = cur.parentElement;
                      }
                      const topEl = document.elementFromPoint(r.left + r.width * 0.5, r.top + Math.min(r.height * 0.25, 90));
                      if (topEl && d.contains(topEl)) score += 1000000;
                      scored.push({ d, score });
                    });
                    scored.sort((a, b) => b.score - a.score);
                    return scored[0] ? scored[0].d : null;
                  };
                  const dlg = pickActiveComposerDialog();
                  const scope = dlg || document.querySelector('[data-pagelet="GroupInlineComposer"]') || document.querySelector('[role="main"]');
                  if (!scope) return { ok: false };
                  const candidates = Array.from(scope.querySelectorAll('div[role="button"], button'));
                  const pubBtn = candidates.find((el) => {
                    const rect = el.getBoundingClientRect();
                    if (rect.width === 0 || rect.height === 0) return false;
                    const txt = ((el.innerText || el.getAttribute('aria-label') || '') + '').trim().toLowerCase();
                    if (txt !== 'postar' && txt !== 'publicar' && txt !== 'post' && txt !== 'enviar' && txt !== 'submit') return false;
                    const disabled = el.getAttribute('aria-disabled') === 'true' || el.disabled || el.getAttribute('tabindex') === '-1';
                    return !disabled;
                  });
                  if (!pubBtn) return { ok: false };
                  pubBtn.scrollIntoView({ behavior: 'instant', block: 'nearest' });
                  const r = pubBtn.getBoundingClientRect();
                  return {
                    ok: true,
                    cx: Math.round(r.left + r.width / 2),
                    cy: Math.round(r.top + r.height / 2)
                  };
                }
              },
              (results) => {
                void chrome.runtime.lastError;
                resolve(results && results[0] ? results[0].result : null);
              }
            );
          });

        // Attach debugger FIRST so infobar shift completes BEFORE reading Publish button coordinates!
        const dbg = await withTabDebugger(tabId, async (sendCmd) => {
          await sleepMs(300);
          const btnInfo = await measureBtn();
          if (!btnInfo || !btnInfo.ok) return { clicked: false, reason: 'no_enabled_btn' };
          await dispatchRealTrustedClick(sendCmd, btnInfo.cx, btnInfo.cy, 90);
          return { clicked: true };
        });

        if (dbg.usedDebugger && dbg.value && dbg.value.clicked) {
          sendResponse({ ok: true, result: { clicked: true, mode: 'debugger_trusted' } });
          return;
        }
        sendResponse({ ok: false, reason: (dbg.value && dbg.value.reason) || 'debugger_click_failed' });
      } catch (err) {
        sendResponse({ ok: false, error: String(err) });
      }
    })();
    return true;
  }

  if (request.action === 'AUTOVIRAL_REAL_PASTE_IMAGE') {
    const tabId = sender && sender.tab && sender.tab.id;
    const imgDataUrl = String(request.dataUrl || '');
    if (!tabId || !imgDataUrl.startsWith('data:image/') || !chrome.scripting || !chrome.scripting.executeScript) {
      sendResponse({ ok: false });
      return false;
    }
    (async () => {
      try {
        const isSilentTab = await new Promise((resolve) => {
          if (silentTabIds.has(tabId)) {
            resolve(true);
            return;
          }
          chrome.storage.local.get(['autoviral_silent_tabs'], (r) => {
            const m = r && r.autoviral_silent_tabs;
            resolve(Boolean(m && m[String(tabId)]));
          });
        });
        if (!isSilentTab) {
          try {
            await new Promise((resolve) => {
              chrome.tabs.update(tabId, { active: true }, () => {
                void chrome.runtime.lastError;
                resolve();
              });
            });
          } catch (e) {}
        }

        const prepClipboardAndCoords = () =>
          new Promise((resolve) => {
            chrome.scripting.executeScript(
              {
                target: { tabId },
                world: 'MAIN',
                args: [imgDataUrl],
                func: async (dataUrl) => {
                  try {
                    const pickActiveComposerDialog = () => {
                      const allDialogs = Array.from(document.querySelectorAll('div[role="dialog"]'));
                      const scored = [];
                      allDialogs.forEach((d, idx) => {
                        const r = d.getBoundingClientRect();
                        if (r.width < 200 || r.height < 150) return;
                        if (d.getAttribute('aria-hidden') === 'true') return;
                        try {
                          const st = window.getComputedStyle(d);
                          if (st.display === 'none' || st.visibility === 'hidden' || st.pointerEvents === 'none') return;
                          const op = parseFloat(st.opacity || '1');
                          if (!isNaN(op) && op < 0.35) return;
                        } catch (e) {}
                        const tb = d.querySelector('div[role="textbox"][contenteditable="true"], div[contenteditable="true"][data-lexical-editor="true"]');
                        const txt = (d.innerText || '').toLowerCase();
                        const isComposer = Boolean(tb) || txt.includes('criar post') || txt.includes('create post') || txt.includes('criar publicação');
                        if (!isComposer) return;
                        let score = idx * 100 + (tb ? 500 : 0);
                        const testPts = [];
                        if (tb) {
                          const tr = tb.getBoundingClientRect();
                          if (tr.width > 20 && tr.height > 15) {
                            testPts.push([tr.left + Math.min(tr.width * 0.4, 100), tr.top + Math.min(tr.height * 0.5, 24)]);
                          }
                        }
                        testPts.push([r.left + r.width * 0.5, r.top + Math.min(r.height * 0.25, 90)]);
                        for (const [px, py] of testPts) {
                          if (px >= 0 && py >= 0 && px <= window.innerWidth && py <= window.innerHeight) {
                            const topEl = document.elementFromPoint(px, py);
                            if (topEl && d.contains(topEl)) {
                              score += 1000000;
                              break;
                            }
                          }
                        }
                        scored.push({ d, score });
                      });
                      scored.sort((a, b) => b.score - a.score);
                      return scored[0] ? scored[0].d : null;
                    };

                    const dlg = pickActiveComposerDialog();
                    if (!dlg) return { ok: false, reason: 'no_dialog' };

                    const hasPhoto = Array.from(dlg.querySelectorAll('img')).some((img) => {
                      const r = img.getBoundingClientRect();
                      const src = img.getAttribute('src') || '';
                      return (src.startsWith('blob:') || src.startsWith('data:image/') || src.includes('scontent') || src.includes('fbcdn')) && r.width > 72 && r.height > 72;
                    });
                    if (hasPhoto) return { ok: true, alreadyAttached: true };

                    const tb = Array.from(
                      dlg.querySelectorAll('div[role="textbox"][contenteditable="true"], div[contenteditable="true"][data-lexical-editor="true"], div[contenteditable="true"][aria-placeholder], div[contenteditable="true"][aria-label]')
                    ).find((el) => {
                      const rect = el.getBoundingClientRect();
                      if (rect.width < 40 || rect.height < 20) return false;
                      const lbl = ((el.getAttribute('aria-label') || el.getAttribute('aria-placeholder') || '') + '').toLowerCase();
                      return !lbl.includes('coment') && !lbl.includes('comment') && !lbl.includes('pesquis') && !lbl.includes('search');
                    });
                    if (!tb) return { ok: false, reason: 'no_textbox' };

                    const pngBlob = await new Promise((resBlob) => {
                      const img = new Image();
                      img.onload = () => {
                        try {
                          const canvas = document.createElement('canvas');
                          canvas.width = img.naturalWidth || img.width || 600;
                          canvas.height = img.naturalHeight || img.height || 600;
                          const ctx = canvas.getContext('2d');
                          ctx.drawImage(img, 0, 0);
                          canvas.toBlob((b) => resBlob(b), 'image/png');
                        } catch (e) {
                          resBlob(null);
                        }
                      };
                      img.onerror = () => resBlob(null);
                      img.src = dataUrl;
                    });
                    if (!pngBlob) return { ok: false, reason: 'png_encode_failed' };

                    window.__avClipWriteStatus = 'waiting';
                    const armHandler = () => {
                      try {
                        if (navigator.clipboard && navigator.clipboard.write && typeof ClipboardItem !== 'undefined') {
                          navigator.clipboard.write([new ClipboardItem({ 'image/png': pngBlob })])
                            .then(() => { window.__avClipWriteStatus = 'ok'; })
                            .catch((e) => { window.__avClipWriteStatus = 'err:' + String(e); });
                        } else {
                          window.__avClipWriteStatus = 'no_clipboard_api';
                        }
                      } catch (err) {
                        window.__avClipWriteStatus = 'err:' + String(err);
                      }
                    };
                    document.addEventListener('click', armHandler, { capture: true, once: true });

                    const r = tb.getBoundingClientRect();
                    return {
                      ok: true,
                      cx: Math.round(r.left + Math.min(r.width * 0.4, 120)),
                      cy: Math.round(r.top + Math.min(r.height * 0.4, 30))
                    };
                  } catch (e) {
                    return { ok: false, error: String(e) };
                  }
                }
              },
              (results) => {
                void chrome.runtime.lastError;
                resolve(results && results[0] ? results[0].result : null);
              }
            );
          });

        const checkClipAndPreview = () =>
          new Promise((resolve) => {
            chrome.scripting.executeScript(
              {
                target: { tabId },
                world: 'MAIN',
                func: () => {
                  const hasPhoto = Array.from(document.querySelectorAll('div[role="dialog"]')).some((d) => {
                    if (d.getAttribute('aria-hidden') === 'true') return false;
                    return Array.from(d.querySelectorAll('img')).some((img) => {
                      const r = img.getBoundingClientRect();
                      const src = img.getAttribute('src') || '';
                      return (src.startsWith('blob:') || src.startsWith('data:image/') || src.includes('scontent') || src.includes('fbcdn')) && r.width > 72 && r.height > 72;
                    });
                  });
                  return { clipStatus: window.__avClipWriteStatus || 'unknown', hasPhoto };
                }
              },
              (results) => {
                void chrome.runtime.lastError;
                resolve(results && results[0] ? results[0].result : { clipStatus: 'unknown', hasPhoto: false });
              }
            );
          });

        const dbg = await withTabDebugger(tabId, async (sendCmd) => {
          await sleepMs(260);
          const prep = await prepClipboardAndCoords();
          if (!prep || !prep.ok) return { pasted: false, reason: (prep && prep.reason) || 'prep_failed' };
          if (prep.alreadyAttached) return { pasted: true, previewDetected: true };

          await dispatchRealTrustedClick(sendCmd, prep.cx, prep.cy, 90);
          for (let i = 0; i < 6; i++) {
            await sleepMs(100);
            const st = await checkClipAndPreview();
            if (st.clipStatus === 'ok' || (st.clipStatus && st.clipStatus.startsWith('err:'))) break;
          }

          await sendCmd('Input.dispatchKeyEvent', {
            type: 'rawKeyDown',
            modifiers: 2,
            windowsVirtualKeyCode: 86,
            nativeVirtualKeyCode: 86,
            key: 'v',
            code: 'KeyV',
            commands: ['paste']
          });
          await sleepMs(45);
          await sendCmd('Input.dispatchKeyEvent', {
            type: 'keyUp',
            modifiers: 2,
            windowsVirtualKeyCode: 86,
            nativeVirtualKeyCode: 86,
            key: 'v',
            code: 'KeyV'
          });

          for (let t = 0; t < 7; t++) {
            await sleepMs(350);
            const st = await checkClipAndPreview();
            if (st.hasPhoto) {
              return { pasted: true, previewDetected: true };
            }
          }
          const finalSt = await checkClipAndPreview();
          return { pasted: finalSt.hasPhoto, previewDetected: finalSt.hasPhoto, clipStatus: finalSt.clipStatus };
        });

        sendResponse({
          ok: Boolean(dbg.usedDebugger && dbg.value && dbg.value.pasted),
          result: dbg.value || null
        });
      } catch (err) {
        sendResponse({ ok: false, error: String(err) });
      }
    })();
    return true;
  }

  if (request.action === 'AUTOVIRAL_REGISTER_BG_POST_WATCH') {
    const watchTabId = sender && sender.tab && typeof sender.tab.id === 'number' ? sender.tab.id : null;
    const p = request.pending || {};
    if (watchTabId !== null && p.groupSlug) {
      cancelledBgCloseTabs.delete(watchTabId);
      activeBgPostWatches.set(watchTabId, {
        tabId: watchTabId,
        logId: p.logId || '',
        groupId: p.groupId || '',
        groupUrl: p.groupUrl || '',
        groupSlug: String(p.groupSlug || '').toLowerCase(),
        groupName: p.groupName || '',
        postSnippet: String(request.postSnippet || '').toLowerCase().trim(),
        didAutoClickPublish: Boolean(request.didAutoClickPublish),
        userClickedPublish: Boolean(request.userClickedPublish),
        sawFilledComposer: Boolean(request.sawFilledComposer || request.didAutoClickPublish),
        autoCloseOnFinish: request.autoCloseOnFinish !== false,
        sawDialogOpen: true,
        closedStreak: 0,
        clearedStreak: 0,
        retriedClick: false,
        inFlight: false,
        startedAt: Date.now()
      });
      ensureBgPostWatchLoop();
      sendResponse({ ok: true });
      return false;
    }
    sendResponse({ ok: false });
    return false;
  }

  if (request.action === 'AUTOVIRAL_UNREGISTER_BG_POST_WATCH') {
    const watchTabId = sender && sender.tab && typeof sender.tab.id === 'number' ? sender.tab.id : null;
    if (watchTabId !== null) {
      activeBgPostWatches.delete(watchTabId);
      if (request.cancelAutoClose) {
        cancelledBgCloseTabs.add(watchTabId);
      }
    }
    sendResponse({ ok: true });
    return false;
  }

  if (request.action === 'AUTOVIRAL_SCHEDULE_BG_CLOSE_TAB') {
    const targetTabId = sender && sender.tab && typeof sender.tab.id === 'number' ? sender.tab.id : null;
    if (targetTabId !== null) {
      cancelledBgCloseTabs.delete(targetTabId);
      closeGroupTabSafely(targetTabId, Math.max(800, Number(request.delayMs) || 3500));
      sendResponse({ ok: true });
      return false;
    }
    sendResponse({ ok: false });
    return false;
  }

  if (request.action === 'AUTOVIRAL_CANCEL_BG_CLOSE_TAB') {
    const targetTabId = sender && sender.tab && typeof sender.tab.id === 'number' ? sender.tab.id : null;
    if (targetTabId !== null) {
      cancelledBgCloseTabs.add(targetTabId);
      activeBgPostWatches.delete(targetTabId);
    }
    sendResponse({ ok: true });
    return false;
  }

  if (request.action === 'AUTOVIRAL_CLOSE_CURRENT_TAB') {
    if (sender && sender.tab && typeof sender.tab.id === 'number') {
      const closingId = sender.tab.id;
      activeBgPostWatches.delete(closingId);
      cancelledBgCloseTabs.delete(closingId);
      silentTabIds.delete(closingId);
      chrome.storage.local.get(['autoviral_silent_tabs'], (r) => {
        const m = r && r.autoviral_silent_tabs && typeof r.autoviral_silent_tabs === 'object'
          ? { ...r.autoviral_silent_tabs }
          : null;
        if (m && m[String(closingId)]) {
          delete m[String(closingId)];
          chrome.storage.local.set({ autoviral_silent_tabs: m });
        }
      });
      chrome.tabs.remove(closingId, () => {
        void chrome.runtime.lastError;
        sendResponse({ closed: true });
      });
      return true;
    }
    sendResponse({ closed: false });
    return false;
  }
});

// =========================================================================
// BACKGROUND POST SUBMISSION WATCHDOG (IMMUNE TO TAB THROTTLING)
// =========================================================================
function ensureBgPostWatchLoop() {
  if (bgPostWatchIntervalId) return;
  bgPostWatchIntervalId = setInterval(() => {
    if (activeBgPostWatches.size === 0) {
      clearInterval(bgPostWatchIntervalId);
      bgPostWatchIntervalId = null;
      return;
    }
    for (const [tabId, job] of activeBgPostWatches.entries()) {
      pollSingleBgPostWatch(tabId, job).catch(() => {});
    }
  }, 1600);
}

async function pollSingleBgPostWatch(tabId, job) {
  if (!job || job.inFlight) return;
  if (Date.now() - job.startedAt > 120000) {
    activeBgPostWatches.delete(tabId);
    return;
  }
  if (isPostWatchFinalized(tabId, job.logId, job.groupSlug)) {
    activeBgPostWatches.delete(tabId);
    return;
  }

  job.inFlight = true;
  try {
    const tabExists = await new Promise((resolve) => {
      chrome.tabs.get(tabId, (tab) => {
        if (chrome.runtime.lastError || !tab) resolve(null);
        else resolve(tab);
      });
    });
    if (!tabExists) {
      activeBgPostWatches.delete(tabId);
      return;
    }

    const probe = await new Promise((resolve) => {
      chrome.scripting.executeScript(
        {
          target: { tabId },
          world: 'MAIN',
          args: [job.postSnippet || ''],
          func: (snippet) => {
            try {
              const allDialogs = Array.from(document.querySelectorAll('div[role="dialog"]'));
              const dialogTxt = allDialogs.map((d) => (d.innerText || '')).join(' ').toLowerCase();
              const bodyTxt = (document.body ? document.body.innerText : '').toLowerCase();
              const hay = dialogTxt + ' ' + bodyTxt;

              const isRateLimited =
                hay.includes('você não pode usar este recurso no momento') ||
                hay.includes('voce nao pode usar este recurso no momento') ||
                hay.includes('você está temporariamente bloqueado') ||
                hay.includes('limitamos a frequência') ||
                hay.includes("you can't use this feature right now") ||
                hay.includes('temporarily blocked') ||
                hay.includes('tente novamente mais tarde') ||
                hay.includes('try again later');

              const isAwaitingAdmin =
                hay.includes('aguardando aprovação de um administrador') ||
                hay.includes('pendente de aprovação do administrador') ||
                hay.includes('enviada para aprovação do administrador') ||
                hay.includes('sua publicação foi enviada') ||
                hay.includes('pendiente de aprobación del administrador') ||
                hay.includes('tu publicación fue enviada') ||
                hay.includes('pending admin approval') ||
                hay.includes('sent for admin approval') ||
                hay.includes('waiting for admin approval') ||
                hay.includes('submitted for approval') ||
                hay.includes('your post is pending') ||
                hay.includes('thanks for your post') ||
                hay.includes('your post has been submitted');

              const isComposerTextbox = (tb) => {
                if (!tb) return false;
                const lbl = ((tb.getAttribute('aria-label') || tb.getAttribute('aria-placeholder') || tb.getAttribute('placeholder') || '') + '').toLowerCase();
                return !lbl.includes('coment') && !lbl.includes('comment') && !lbl.includes('responder') && !lbl.includes('reply') && !lbl.includes('pesquis') && !lbl.includes('search') && !lbl.includes('buscar');
              };

              const activeDialog = allDialogs.find((d) => {
                const r = d.getBoundingClientRect();
                if (r.width < 200 || r.height < 150) return false;
                if (d.getAttribute('aria-hidden') === 'true') return false;
                try {
                  const st = window.getComputedStyle(d);
                  if (st.display === 'none' || st.visibility === 'hidden' || st.pointerEvents === 'none') return false;
                  const op = parseFloat(st.opacity || '1');
                  if (!isNaN(op) && op < 0.35) return false;
                } catch (e) {}
                const txt = (d.innerText || '').toLowerCase();
                const aria = (d.getAttribute('aria-label') || '').toLowerCase();
                const hasComposerTitle =
                  txt.includes('criar post') ||
                  txt.includes('create post') ||
                  txt.includes('criar publicação') ||
                  txt.includes('crear publicación') ||
                  txt.includes('crear publicacion') ||
                  txt.includes('create a public post') ||
                  txt.includes('crie um post público') ||
                  txt.includes('publicação anônima') ||
                  txt.includes('publicación anónima') ||
                  txt.includes('anonymous post') ||
                  aria.includes('criar post') ||
                  aria.includes('create post');
                const hasPubBtn = Array.from(d.querySelectorAll('div[role="button"], button')).some((b) => {
                  const bt = ((b.innerText || b.getAttribute('aria-label') || '') + '').trim().toLowerCase();
                  return bt === 'postar' || bt === 'publicar' || bt === 'post';
                });
                const isPostViewer =
                  !hasComposerTitle &&
                  !hasPubBtn &&
                  (/^(post de |publicação de |publicación de |post by )/i.test(txt.trim()) ||
                    /^(post de |publicação de |publicación de |post by )/i.test(aria.trim()));
                if (isPostViewer) return false;
                const tbs = Array.from(d.querySelectorAll('div[role="textbox"][contenteditable="true"], div[contenteditable="true"][data-lexical-editor="true"]'));
                return tbs.some(isComposerTextbox) || hasComposerTitle || hasPubBtn;
              });

              let hasEnabledPubBtn = false;
              let tbTextLen = 0;
              let hasPhotoInDialog = false;
              let hasDialogError = false;
              if (activeDialog) {
                const dlgTxt = (activeDialog.innerText || '').toLowerCase();
                hasDialogError =
                  dlgTxt.includes('ocorreu um erro') ||
                  dlgTxt.includes('não foi possível publicar') ||
                  dlgTxt.includes('erro ao publicar') ||
                  dlgTxt.includes("couldn't share") ||
                  dlgTxt.includes('could not share') ||
                  dlgTxt.includes('error posting') ||
                  dlgTxt.includes('something went wrong') ||
                  dlgTxt.includes('algo deu errado');
                const composerTb = Array.from(
                  activeDialog.querySelectorAll('div[role="textbox"][contenteditable="true"], div[contenteditable="true"][data-lexical-editor="true"]')
                ).find(isComposerTextbox);
                if (composerTb) {
                  tbTextLen = (composerTb.innerText || composerTb.textContent || '').replace(/[\u200B-\u200D\uFEFF]/g, '').trim().length;
                }
                hasPhotoInDialog =
                  Array.from(activeDialog.querySelectorAll('img')).some((img) => {
                    const ir = img.getBoundingClientRect();
                    const src = img.getAttribute('src') || '';
                    return (src.startsWith('blob:') || src.startsWith('data:image/') || src.includes('scontent') || src.includes('fbcdn')) && ir.width > 72 && ir.height > 72;
                  }) ||
                  Boolean(activeDialog.querySelector('[aria-label="Editar"], [aria-label="Edit"], [aria-label*="Editar tudo" i], [aria-label*="Edit all" i]'));
                const btns = Array.from(activeDialog.querySelectorAll('div[role="button"], button'));
                hasEnabledPubBtn = btns.some((el) => {
                  const br = el.getBoundingClientRect();
                  if (br.width === 0 || br.height === 0) return false;
                  const bt = ((el.innerText || el.getAttribute('aria-label') || '') + '').trim().toLowerCase();
                  if (bt !== 'postar' && bt !== 'publicar' && bt !== 'post' && bt !== 'enviar' && bt !== 'submit') return false;
                  return el.getAttribute('aria-disabled') !== 'true' && !el.disabled && el.getAttribute('tabindex') !== '-1';
                });
              }

              const isComposerNowEmpty = Boolean(activeDialog) && !hasDialogError && tbTextLen <= 2 && !hasPhotoInDialog && !hasEnabledPubBtn;

              const hasToastPublished =
                hay.includes('sua publicação foi compartilhada') ||
                hay.includes('sua publicação foi publicada') ||
                hay.includes('seu post foi publicado') ||
                hay.includes('publicação compartilhada') ||
                hay.includes('your post has been shared') ||
                hay.includes('your post was shared') ||
                hay.includes('your post is now published') ||
                hay.includes('tu publicación se compartió') ||
                hay.includes('se compartió tu publicación');

              let hasFeedOrPostModalMatch = false;
              if (snippet && snippet.length >= 14) {
                const normSnippet = snippet.replace(/\s+/g, ' ').trim();
                const postViewerMatch = allDialogs.some((d) => {
                  if (d === activeDialog) return false;
                  const txt = (d.innerText || '').toLowerCase().replace(/\s+/g, ' ');
                  return txt.includes(normSnippet);
                });
                const feedMatch = Array.from(document.querySelectorAll('div[role="article"]')).some((art) => {
                  if (activeDialog && activeDialog.contains(art)) return false;
                  const txt = (art.innerText || '').toLowerCase().replace(/\s+/g, ' ');
                  return txt.includes(normSnippet);
                });
                hasFeedOrPostModalMatch = postViewerMatch || feedMatch;
              }

              return {
                ok: true,
                isRateLimited,
                isAwaitingAdmin,
                hasDialog: Boolean(activeDialog),
                hasEnabledPubBtn,
                tbTextLen,
                hasPhotoInDialog,
                hasDialogError,
                isComposerNowEmpty,
                hasPublishedToastOrFeed: hasToastPublished || hasFeedOrPostModalMatch,
                userClickedFlag: Boolean(window.__avUserClickedPublish),
                url: window.location.href
              };
            } catch (e) {
              return { ok: false };
            }
          }
        },
        (results) => {
          void chrome.runtime.lastError;
          resolve(results && results[0] ? results[0].result : null);
        }
      );
    });

    if (!probe || !probe.ok) return;

    if (probe.isRateLimited) {
      markBgPostFinalized(tabId, job.logId, job.groupSlug);
      relayToAutoViralTabs({
        action: 'AUTOVIRAL_FB_POST_RESULT',
        logId: job.logId,
        groupId: job.groupId,
        groupUrl: probe.url || job.groupUrl,
        groupName: job.groupName,
        approvalStatus: 'rate_limited',
        note: 'Facebook exibiu: Tente novamente mais tarde / Limite temporário',
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (probe.isAwaitingAdmin) {
      markBgPostFinalized(tabId, job.logId, job.groupSlug);
      clearPendingPostFromStorage(job.groupSlug);
      relayToAutoViralTabs({
        action: 'AUTOVIRAL_FB_POST_RESULT',
        logId: job.logId,
        groupId: job.groupId,
        groupUrl: probe.url || job.groupUrl,
        groupName: job.groupName,
        approvalStatus: 'awaiting_admin',
        timestamp: new Date().toISOString()
      });
      if (job.autoCloseOnFinish !== false && !cancelledBgCloseTabs.has(tabId)) {
        closeGroupTabSafely(tabId, 2000);
      }
      return;
    }

    const didInitiatePublish = Boolean(job.didAutoClickPublish || job.userClickedPublish || probe.userClickedFlag);
    const finalizePublishedAndClose = (dismissDialog) => {
      markBgPostFinalized(tabId, job.logId, job.groupSlug);
      clearPendingPostFromStorage(job.groupSlug);
      if (dismissDialog) {
        try {
          chrome.scripting.executeScript(
            {
              target: { tabId },
              world: 'MAIN',
              func: () => {
                try {
                  const dlgs = Array.from(document.querySelectorAll('div[role="dialog"]'));
                  for (const dlg of dlgs) {
                    const scope = dlg.parentElement || dlg;
                    const closeBtn = scope.querySelector('div[role="button"][aria-label="Fechar"], div[role="button"][aria-label="Close"], button[aria-label="Fechar"], button[aria-label="Close"]');
                    if (closeBtn) { closeBtn.click(); break; }
                  }
                } catch (e) {}
              }
            },
            () => { void chrome.runtime.lastError; }
          );
        } catch (e) {}
      }
      relayToAutoViralTabs({
        action: 'AUTOVIRAL_FB_POST_RESULT',
        logId: job.logId,
        groupId: job.groupId,
        groupUrl: probe.url || job.groupUrl,
        groupName: job.groupName,
        approvalStatus: 'published',
        timestamp: new Date().toISOString()
      });
      if (job.autoCloseOnFinish !== false && !cancelledBgCloseTabs.has(tabId)) {
        closeGroupTabSafely(tabId, 1600);
      }
    };

    if (probe.hasPublishedToastOrFeed && didInitiatePublish && Date.now() - job.startedAt >= 1200) {
      finalizePublishedAndClose(probe.hasDialog);
      return;
    }

    if (probe.hasDialog) {
      job.sawDialogOpen = true;
      job.closedStreak = 0;
      if (probe.tbTextLen >= 8 || probe.hasPhotoInDialog || probe.hasEnabledPubBtn) {
        job.sawFilledComposer = true;
        job.clearedStreak = 0;
      } else if (
        probe.isComposerNowEmpty &&
        job.sawFilledComposer &&
        didInitiatePublish &&
        Date.now() - job.startedAt >= 1800
      ) {
        job.clearedStreak = (job.clearedStreak || 0) + 1;
        if (job.clearedStreak >= 2) {
          finalizePublishedAndClose(true);
          return;
        }
      }

      if (job.didAutoClickPublish && probe.hasEnabledPubBtn && !job.retriedClick && Date.now() - job.startedAt > 3500) {
        job.retriedClick = true;
        // Retry click using trusted Chrome Debugger mouse event
        const isSilent = silentTabIds.has(tabId);
        if (!isSilent) {
          await withTabDebugger(tabId, async (sendCmd) => {
            await sleepMs(260);
            const btnCoords = await new Promise((resBtn) => {
              chrome.scripting.executeScript(
                {
                  target: { tabId },
                  world: 'MAIN',
                  func: () => {
                    const dlgs = Array.from(document.querySelectorAll('div[role="dialog"]')).filter((d) => {
                      const r = d.getBoundingClientRect();
                      return r.width > 200 && r.height > 150 && d.getAttribute('aria-hidden') !== 'true';
                    });
                    const dlg = dlgs[dlgs.length - 1];
                    if (!dlg) return null;
                    const pubBtn = Array.from(dlg.querySelectorAll('div[role="button"], button')).find((el) => {
                      const r = el.getBoundingClientRect();
                      if (r.width === 0 || r.height === 0) return false;
                      const bt = ((el.innerText || el.getAttribute('aria-label') || '') + '').trim().toLowerCase();
                      if (bt !== 'postar' && bt !== 'publicar' && bt !== 'post' && bt !== 'enviar' && bt !== 'submit') return false;
                      return el.getAttribute('aria-disabled') !== 'true' && !el.disabled && el.getAttribute('tabindex') !== '-1';
                    });
                    if (!pubBtn) return null;
                    pubBtn.scrollIntoView({ behavior: 'instant', block: 'nearest' });
                    const pr = pubBtn.getBoundingClientRect();
                    return { cx: Math.round(pr.left + pr.width / 2), cy: Math.round(pr.top + pr.height / 2) };
                  }
                },
                (r) => {
                  void chrome.runtime.lastError;
                  resBtn(r && r[0] ? r[0].result : null);
                }
              );
            });
            if (btnCoords) {
              await dispatchRealTrustedClick(sendCmd, btnCoords.cx, btnCoords.cy, 80);
            }
          });
        }
      }
      return;
    }

    job.clearedStreak = 0;
    if (job.sawDialogOpen && didInitiatePublish) {
      job.closedStreak = (job.closedStreak || 0) + 1;
      if (job.closedStreak >= 2) {
        finalizePublishedAndClose(false);
      }
    }
  } finally {
    job.inFlight = false;
  }
}

// =========================================================================
// BACKGROUND APPROVAL WATCHDOG (MONITORS EVEN WHEN GROUP TAB IS CLOSED)
// =========================================================================
async function triggerApprovedGroupPostBySlug(slug, alreadyInTab, existingTabId) {
  const cleanSlug = String(slug || '').toLowerCase();
  if (!cleanSlug) return { ok: false };

  const storeRes = await new Promise((resolve) => {
    chrome.storage.local.get(['autoviral_waiting_approval_map', 'autoviral_pending_fb_posts_map'], (r) => resolve(r || {}));
  });

  const waitingMap = (storeRes.autoviral_waiting_approval_map && typeof storeRes.autoviral_waiting_approval_map === 'object')
    ? { ...storeRes.autoviral_waiting_approval_map }
    : {};
  const item = waitingMap[cleanSlug];
  if (!item) return { ok: false, reason: 'not_in_waiting_map' };

  delete waitingMap[cleanSlug];
  const pendingMap = (storeRes.autoviral_pending_fb_posts_map && typeof storeRes.autoviral_pending_fb_posts_map === 'object')
    ? { ...storeRes.autoviral_pending_fb_posts_map }
    : {};

  const pendingPost = {
    logId: item.logId || `glog-apv-${Date.now()}`,
    groupId: item.groupId || '',
    groupUrl: item.groupUrl,
    groupSlug: cleanSlug,
    groupName: item.groupName || '',
    fullText: item.fullText || '',
    imageDataUrl: item.imageDataUrl || '',
    autoJoinAndPost: true,
    createdAt: new Date().toISOString()
  };
  pendingMap[cleanSlug] = pendingPost;

  await new Promise((resolve) => {
    chrome.storage.local.set(
      {
        autoviral_waiting_approval_map: waitingMap,
        autoviral_pending_fb_post: pendingPost,
        autoviral_pending_fb_posts_map: pendingMap
      },
      resolve
    );
  });

  relayToAutoViralTabs({
    action: 'AUTOVIRAL_WAITING_APPROVALS_SYNC',
    waitingApprovals: Object.values(waitingMap),
    timestamp: new Date().toISOString()
  });

  relayToAutoViralTabs({
    action: 'AUTOVIRAL_FB_POST_RESULT',
    logId: pendingPost.logId,
    groupId: pendingPost.groupId,
    groupUrl: pendingPost.groupUrl,
    groupName: pendingPost.groupName,
    approvalStatus: 'approved_posting',
    note: 'Admin aceitou sua entrada! Gatilho disparado automaticamente para postar agora.',
    timestamp: new Date().toISOString()
  });

  if (!alreadyInTab && pendingPost.groupUrl) {
    chrome.storage.local.get(['autoviral_silent_mode', 'autoviral_silent_tabs'], (r) => {
      const useSilent = pendingPost.silentMode !== undefined ? Boolean(pendingPost.silentMode) : Boolean(r && r.autoviral_silent_mode);
      const silentTabsMap = (r && r.autoviral_silent_tabs && typeof r.autoviral_silent_tabs === 'object')
        ? { ...r.autoviral_silent_tabs }
        : {};
      chrome.tabs.create({ url: pendingPost.groupUrl, active: !useSilent }, (tab) => {
        void chrome.runtime.lastError;
        if (tab && typeof tab.id === 'number' && useSilent) {
          silentTabIds.add(tab.id);
          silentTabsMap[String(tab.id)] = true;
          chrome.storage.local.set({ autoviral_silent_tabs: silentTabsMap });
        }
      });
    });
  } else if (alreadyInTab && typeof existingTabId === 'number') {
    sendMessageToTabAllFrames(existingTabId, { action: 'AUTOVIRAL_RUN_PENDING_NOW', groupSlug: cleanSlug });
  }

  return { ok: true, triggeredSlug: cleanSlug, groupName: pendingPost.groupName };
}

async function checkWaitingApprovalsNow(maxCount) {
  const storeRes = await new Promise((resolve) => {
    chrome.storage.local.get(['autoviral_waiting_approval_map'], (r) => resolve(r || {}));
  });
  const waitingMap = (storeRes.autoviral_waiting_approval_map && typeof storeRes.autoviral_waiting_approval_map === 'object')
    ? { ...storeRes.autoviral_waiting_approval_map }
    : {};
  const entries = Object.values(waitingMap).sort((a, b) => {
    const ta = new Date(a.lastCheckedAt || a.requestedAt || 0).getTime();
    const tb = new Date(b.lastCheckedAt || b.requestedAt || 0).getTime();
    return ta - tb;
  });

  if (entries.length === 0) {
    return { ok: true, checked: 0, approvedCount: 0, waitingCount: 0 };
  }

  const slice = entries.slice(0, Math.max(1, Math.min(Number(maxCount) || 2, 5)));
  let checked = 0;
  let approvedCount = 0;

  for (const entry of slice) {
    if (!entry || !entry.groupUrl || !entry.groupSlug) continue;
    checked++;
    try {
      const resp = await fetch(entry.groupUrl, { credentials: 'include', redirect: 'follow' });
      const html = await resp.text();
      const stillPending =
        /"viewer_forum_join_state":"REQUESTED"/i.test(html) ||
        /"viewer_join_state":"REQUESTED"/i.test(html) ||
        /"Cancel request"/i.test(html) ||
        /"Cancelar solicitação"/i.test(html);
      const isApproved =
        !stillPending &&
        (
          /"viewer_forum_join_state":"MEMBER"/i.test(html) ||
          /"viewer_join_state":"MEMBER"/i.test(html) ||
          /"is_viewer_member":true/i.test(html) ||
          /"GroupInlineComposer"/i.test(html)
        );

      if (waitingMap[entry.groupSlug]) {
        waitingMap[entry.groupSlug].lastCheckedAt = new Date().toISOString();
      }

      if (isApproved) {
        approvedCount++;
        await triggerApprovedGroupPostBySlug(entry.groupSlug, false, null);
        delete waitingMap[entry.groupSlug];
      }
    } catch (e) {
      if (waitingMap[entry.groupSlug]) {
        waitingMap[entry.groupSlug].lastCheckedAt = new Date().toISOString();
      }
    }
    await sleepMs(1800);
  }

  await new Promise((resolve) => {
    chrome.storage.local.get(['autoviral_waiting_approval_map'], (latest) => {
      const merged = (latest && latest.autoviral_waiting_approval_map && typeof latest.autoviral_waiting_approval_map === 'object')
        ? { ...latest.autoviral_waiting_approval_map }
        : {};
      for (const item of slice) {
        if (item && item.groupSlug && merged[item.groupSlug] && waitingMap[item.groupSlug]) {
          merged[item.groupSlug].lastCheckedAt = waitingMap[item.groupSlug].lastCheckedAt;
        }
      }
      chrome.storage.local.set({ autoviral_waiting_approval_map: merged }, () => {
        relayToAutoViralTabs({
          action: 'AUTOVIRAL_WAITING_APPROVALS_SYNC',
          waitingApprovals: Object.values(merged),
          timestamp: new Date().toISOString()
        });
        resolve();
      });
    });
  });

  return { ok: true, checked, approvedCount, waitingCount: Object.keys(waitingMap).length };
}

async function verifyMembershipsBatchNow(groups, batchId) {
  const list = Array.isArray(groups)
    ? groups.filter((g) => g && g.url && String(g.url).includes('/groups/'))
    : [];
  const total = list.length;
  if (total === 0) {
    relayToAutoViralTabs({
      action: 'AUTOVIRAL_MEMBERSHIP_BATCH_PROGRESS',
      batchId,
      checked: 0,
      total: 0,
      done: true,
      authorizedCount: 0,
      awaitingCount: 0,
      rejectedCount: 0,
      otherCount: 0
    });
    return { ok: true, checked: 0, total: 0 };
  }

  let checked = 0;
  let authorizedCount = 0;
  let awaitingCount = 0;
  let rejectedCount = 0;
  let otherCount = 0;
  let rateLimited = false;

  for (const entry of list) {
    checked++;
    let membershipStatus = 'awaiting_admin';
    let note = '';

    try {
      const resp = await fetch(entry.url, { credentials: 'include', redirect: 'follow' });
      const html = await resp.text();

      const isRateLimited =
        /Você não pode usar este recurso no momento/i.test(html) ||
        /You can't use this feature right now/i.test(html) ||
        /Temporarily Blocked/i.test(html);

      const isUnavailable =
        /Este conteúdo não está disponível no momento/i.test(html) ||
        /This content isn't available right now/i.test(html) ||
        /Page Not Found/i.test(html);

      const isPending =
        /"viewer_forum_join_state":"REQUESTED"/i.test(html) ||
        /"viewer_join_state":"REQUESTED"/i.test(html) ||
        /"Cancel request"/i.test(html) ||
        /"Cancelar solicitação"/i.test(html);

      const isMember =
        !isPending &&
        (
          /"viewer_forum_join_state":"MEMBER"/i.test(html) ||
          /"viewer_join_state":"MEMBER"/i.test(html) ||
          /"is_viewer_member":true/i.test(html) ||
          /"GroupInlineComposer"/i.test(html) ||
          />Escreva algo\.\.\.</i.test(html) ||
          />Write something\.\.\.</i.test(html)
        );

      const canRequestJoin =
        !isMember &&
        !isPending &&
        (
          /"viewer_forum_join_state":"CAN_REQUEST"/i.test(html) ||
          /"viewer_join_state":"CAN_REQUEST"/i.test(html) ||
          />Participar do grupo</i.test(html) ||
          />Join group</i.test(html)
        );

      if (isRateLimited) {
        membershipStatus = 'rate_limited';
        note = 'Facebook limitou verificações temporariamente';
        rateLimited = true;
      } else if (isUnavailable) {
        membershipStatus = 'unavailable';
        note = 'Grupo indisponível no Facebook';
      } else if (isMember) {
        membershipStatus = 'authorized';
        note = 'Autorizado (Membro confirmado)';
      } else if (isPending) {
        membershipStatus = 'awaiting_admin';
        note = 'Solicitação ainda aguardando admin';
      } else if (canRequestJoin) {
        membershipStatus = 'rejected';
        note = 'Não autorizado / Solicitação recusada ou expirada';
      } else {
        membershipStatus = 'awaiting_admin';
        note = 'Sem confirmação direta de membro — mantido em verificação';
      }
    } catch (err) {
      membershipStatus = 'awaiting_admin';
      note = 'Erro de rede ao consultar grupo';
    }

    if (membershipStatus === 'authorized') authorizedCount++;
    else if (membershipStatus === 'awaiting_admin') awaitingCount++;
    else if (membershipStatus === 'rejected') rejectedCount++;
    else otherCount++;

    const isLast = checked >= total || rateLimited;
    relayToAutoViralTabs({
      action: 'AUTOVIRAL_MEMBERSHIP_BATCH_PROGRESS',
      batchId,
      checked,
      total,
      groupId: entry.id,
      groupUrl: entry.url,
      groupName: entry.name || '',
      membershipStatus,
      note,
      authorizedCount,
      awaitingCount,
      rejectedCount,
      otherCount,
      rateLimited,
      done: isLast
    });

    if (rateLimited) break;
    if (!isLast) {
      await sleepMs(900);
    }
  }

  return {
    ok: true,
    checked,
    total,
    authorizedCount,
    awaitingCount,
    rejectedCount,
    otherCount,
    rateLimited
  };
}

if (chrome.alarms && chrome.alarms.onAlarm) {
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm && alarm.name === 'autoviral_approval_watchdog') {
      checkWaitingApprovalsNow(2).catch(() => {});
    }
  });
}
