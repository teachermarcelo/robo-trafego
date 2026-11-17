// AutoViral AI Chrome Extension - Background Service Worker (Manifest V3)

chrome.runtime.onInstalled.addListener(() => {
  console.log('[AutoViral AI] Extensão v1.5.1 instalada com sucesso!');
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
    const pendingPost = {
      logId: request.logId || '',
      groupId: request.groupId || '',
      groupUrl: groupUrl,
      groupSlug: groupSlug,
      groupName: request.groupName || '',
      fullText: request.fullText || '',
      imageDataUrl: request.imageDataUrl || '',
      autoJoinAndPost: request.autoJoinAndPost !== false,
      createdAt: new Date().toISOString()
    };

    chrome.storage.local.get(['autoviral_pending_fb_posts_map'], (res) => {
      const postsMap = (res && res.autoviral_pending_fb_posts_map && typeof res.autoviral_pending_fb_posts_map === 'object')
        ? res.autoviral_pending_fb_posts_map
        : {};
      if (groupSlug) {
        postsMap[groupSlug] = pendingPost;
      }
      chrome.storage.local.set(
        {
          autoviral_pending_fb_post: pendingPost,
          autoviral_pending_fb_posts_map: postsMap
        },
        () => {
          if (pendingPost.groupUrl) {
            chrome.tabs.create({ url: pendingPost.groupUrl, active: true }, (tab) => {
              void chrome.runtime.lastError;
              sendResponse({ success: true, tabId: tab ? tab.id : null });
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
    request.action === 'AUTOVIRAL_FB_POST_RESULT'
  ) {
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
            const candidates = Array.from(
              document.querySelectorAll('[data-pagelet="GroupInlineComposer"] div[role="button"], [data-pagelet="GroupInlineComposer"] span, div[role="button"], span')
            );
            const scored = [];
            for (const el of candidates) {
              const rect = el.getBoundingClientRect();
              if (rect.width < 55 || rect.height < 14 || rect.height > 78) continue;
              if (el.closest('div[role="dialog"]') || el.closest('div[role="article"]') || el.closest('[aria-busy="true"]')) continue;
              const t = (el.innerText || el.getAttribute('aria-label') || '').trim().toLowerCase();
              if (!t || t.includes('anônim') || t.includes('anonym') || t.includes('enquete') || t.includes('poll') || t.includes('sentimento') || t.includes('feeling')) continue;
              const isMatch =
                t === 'escreva algo...' ||
                t === 'write something...' ||
                t.includes('escreva algo') ||
                t.includes('no que você está pensando') ||
                t.includes('write something') ||
                t.includes("what's on your mind") ||
                t.includes('criar publicação pública') ||
                t.includes('create a public post');
              if (!isMatch) continue;
              const exact = t === 'escreva algo...' || t === 'write something...' ? 0 : 1;
              scored.push({ el, score: exact * 100000 + rect.width * rect.height });
            }
            scored.sort((a, b) => a.score - b.score);
            const hit = scored[0] ? scored[0].el : null;
            const trigger = hit ? (hit.closest('div[role="button"]') || hit) : null;
            if (!trigger || !hit) return { found: false };
            hit.scrollIntoView({ behavior: 'instant', block: 'center' });
            const r = hit.getBoundingClientRect();
            const cx = Math.round(r.left + Math.min(r.width * 0.45, 140));
            const cy = Math.round(r.top + r.height / 2);

            if (clickMode === 'simple') {
              trigger.focus();
              hit.click();
              return { found: true, mode: 'simple' };
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
            trigger.dispatchEvent(new PointerEvent('pointerover', hoverOpts));
            trigger.dispatchEvent(new MouseEvent('mouseover', hoverOpts));

            setTimeout(() => {
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
              trigger.focus();
              trigger.dispatchEvent(new PointerEvent('pointerdown', downOpts));
              trigger.dispatchEvent(new MouseEvent('mousedown', downOpts));
              trigger.dispatchEvent(new PointerEvent('pointerup', upOpts));
              trigger.dispatchEvent(new MouseEvent('mouseup', upOpts));
              trigger.click();
            }, 350);

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
            const dialogs = Array.from(document.querySelectorAll('div[role="dialog"]')).filter((d) => {
              const r = d.getBoundingClientRect();
              return r.width > 200 && r.height > 150;
            });
            const dlg = dialogs.find((d) => {
              const txt = (d.innerText || '').toLowerCase();
              const aria = (d.getAttribute('aria-label') || '').toLowerCase();
              return (
                txt.includes('criar post') ||
                txt.includes('create post') ||
                txt.includes('criar publicação') ||
                txt.includes('create a public post') ||
                aria.includes('criar post') ||
                aria.includes('create post')
              );
            }) || dialogs[dialogs.length - 1];
            if (!dlg) return { ok: false, reason: 'no_dialog' };

            const boxes = Array.from(
              dlg.querySelectorAll(
                'div[role="textbox"][contenteditable="true"], div[contenteditable="true"][data-lexical-editor="true"], div[contenteditable="true"][aria-label]'
              )
            );
            const tb = boxes.find((el) => {
              const rect = el.getBoundingClientRect();
              if (rect.width < 40 || rect.height < 20) return false;
              const lbl = ((el.getAttribute('aria-label') || el.getAttribute('placeholder') || '') + '').toLowerCase();
              return !lbl.includes('coment') && !lbl.includes('comment') && !lbl.includes('responder') && !lbl.includes('reply');
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
            const dialogs = Array.from(document.querySelectorAll('div[role="dialog"]')).filter((d) => {
              const r = d.getBoundingClientRect();
              return r.width > 200 && r.height > 150;
            });
            const dlg = dialogs.find((d) => {
              const txt = (d.innerText || '').toLowerCase();
              const aria = (d.getAttribute('aria-label') || '').toLowerCase();
              return (
                txt.includes('criar post') ||
                txt.includes('create post') ||
                txt.includes('criar publicação') ||
                txt.includes('create a public post') ||
                aria.includes('criar post') ||
                aria.includes('create post')
              );
            }) || dialogs[dialogs.length - 1];
            if (!dlg) return { clicked: false, reason: 'no_dialog' };

            const candidates = Array.from(dlg.querySelectorAll('div[role="button"], button'));
            const pubBtn = candidates.find((el) => {
              const rect = el.getBoundingClientRect();
              if (rect.width === 0 || rect.height === 0) return false;
              const txt = ((el.innerText || el.getAttribute('aria-label') || '') + '').trim().toLowerCase();
              if (txt !== 'postar' && txt !== 'publicar' && txt !== 'post') return false;
              const disabled = el.getAttribute('aria-disabled') === 'true' || el.disabled || el.getAttribute('tabindex') === '-1';
              return !disabled;
            });
            if (!pubBtn) return { clicked: false, reason: 'no_enabled_btn' };

            const r = pubBtn.getBoundingClientRect();
            const cx = Math.round(r.left + r.width / 2);
            const cy = Math.round(r.top + r.height / 2);
            pubBtn.focus();
            pubBtn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window, clientX: cx, clientY: cy }));
            pubBtn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window, clientX: cx, clientY: cy }));
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
        try {
          await new Promise((resolve) => {
            chrome.tabs.update(tabId, { active: true }, () => {
              void chrome.runtime.lastError;
              resolve();
            });
          });
        } catch (e) {}

        const prepResults = await new Promise((resolve) => {
          chrome.scripting.executeScript(
            {
              target: { tabId },
              world: 'MAIN',
              func: () => {
                const candidates = Array.from(
                  document.querySelectorAll('[data-pagelet="GroupInlineComposer"] div[role="button"], [data-pagelet="GroupInlineComposer"] span, div[role="button"], span')
                );
                const scored = [];
                for (const el of candidates) {
                  const rect = el.getBoundingClientRect();
                  if (rect.width < 55 || rect.height < 14 || rect.height > 78) continue;
                  if (el.closest('div[role="dialog"]') || el.closest('div[role="article"]') || el.closest('[aria-busy="true"]')) continue;
                  const t = (el.innerText || el.getAttribute('aria-label') || '').trim().toLowerCase();
                  if (!t || t.includes('anônim') || t.includes('anonym') || t.includes('enquete') || t.includes('poll') || t.includes('sentimento') || t.includes('feeling')) continue;
                  const isMatch =
                    t === 'escreva algo...' ||
                    t === 'write something...' ||
                    t.includes('escreva algo') ||
                    t.includes('no que você está pensando') ||
                    t.includes('write something') ||
                    t.includes("what's on your mind") ||
                    t.includes('criar publicação pública') ||
                    t.includes('create a public post');
                  if (!isMatch) continue;
                  const exact = t === 'escreva algo...' || t === 'write something...' ? 0 : 1;
                  scored.push({ el, score: exact * 100000 + rect.width * rect.height });
                }
                scored.sort((a, b) => a.score - b.score);
                const hit = scored[0] ? scored[0].el : null;
                if (!hit) return { found: false };
                hit.scrollIntoView({ behavior: 'instant', block: 'center' });
                const r = hit.getBoundingClientRect();
                return {
                  found: true,
                  cx: Math.round(r.left + Math.min(r.width * 0.45, 140)),
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

        if (!prepResults || !prepResults.found) {
          sendResponse({ ok: false, reason: 'trigger_not_found' });
          return;
        }

        await sleepMs(220);

        const freshCoords = await new Promise((resolve) => {
          chrome.scripting.executeScript(
            {
              target: { tabId },
              world: 'MAIN',
              func: () => {
                const candidates = Array.from(
                  document.querySelectorAll('[data-pagelet="GroupInlineComposer"] div[role="button"], [data-pagelet="GroupInlineComposer"] span, div[role="button"], span')
                );
                const scored = [];
                for (const el of candidates) {
                  const rect = el.getBoundingClientRect();
                  if (rect.width < 55 || rect.height < 14 || rect.height > 78) continue;
                  if (el.closest('div[role="dialog"]') || el.closest('div[role="article"]') || el.closest('[aria-busy="true"]')) continue;
                  const t = (el.innerText || el.getAttribute('aria-label') || '').trim().toLowerCase();
                  if (!t || t.includes('anônim') || t.includes('anonym') || t.includes('enquete') || t.includes('poll') || t.includes('sentimento') || t.includes('feeling')) continue;
                  const isMatch =
                    t === 'escreva algo...' ||
                    t === 'write something...' ||
                    t.includes('escreva algo') ||
                    t.includes('no que você está pensando') ||
                    t.includes('write something') ||
                    t.includes("what's on your mind") ||
                    t.includes('criar publicação pública') ||
                    t.includes('create a public post');
                  if (!isMatch) continue;
                  const exact = t === 'escreva algo...' || t === 'write something...' ? 0 : 1;
                  scored.push({ el, score: exact * 100000 + rect.width * rect.height });
                }
                scored.sort((a, b) => a.score - b.score);
                const hit = scored[0] ? scored[0].el : null;
                if (!hit) return null;
                const r = hit.getBoundingClientRect();
                return {
                  cx: Math.round(r.left + Math.min(r.width * 0.45, 140)),
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

        const cx = (freshCoords && freshCoords.cx) || prepResults.cx;
        const cy = (freshCoords && freshCoords.cy) || prepResults.cy;

        const dbg = await withTabDebugger(tabId, async (sendCmd) => {
          await dispatchRealTrustedClick(sendCmd, cx, cy, 240);
          return { clicked: true, trusted: true };
        });

        if (dbg.usedDebugger && dbg.value && dbg.value.clicked) {
          sendResponse({ ok: true, result: { found: true, mode: 'debugger_trusted', cx, cy } });
          return;
        }

        // Fallback if debugger wasn't available
        await new Promise((resolve) => {
          chrome.scripting.executeScript(
            {
              target: { tabId },
              world: 'MAIN',
              func: () => {
                const candidates = Array.from(
                  document.querySelectorAll('[data-pagelet="GroupInlineComposer"] div[role="button"], [data-pagelet="GroupInlineComposer"] span, div[role="button"], span')
                );
                const scored = [];
                for (const el of candidates) {
                  const rect = el.getBoundingClientRect();
                  if (rect.width < 55 || rect.height < 14 || rect.height > 78) continue;
                  if (el.closest('div[role="dialog"]') || el.closest('div[role="article"]') || el.closest('[aria-busy="true"]')) continue;
                  const t = (el.innerText || el.getAttribute('aria-label') || '').trim().toLowerCase();
                  if (!t || t.includes('anônim') || t.includes('anonym') || t.includes('enquete') || t.includes('poll') || t.includes('sentimento') || t.includes('feeling')) continue;
                  const isMatch =
                    t === 'escreva algo...' ||
                    t === 'write something...' ||
                    t.includes('escreva algo') ||
                    t.includes('no que você está pensando') ||
                    t.includes('write something') ||
                    t.includes("what's on your mind") ||
                    t.includes('criar publicação pública') ||
                    t.includes('create a public post');
                  if (!isMatch) continue;
                  const exact = t === 'escreva algo...' || t === 'write something...' ? 0 : 1;
                  scored.push({ el, score: exact * 100000 + rect.width * rect.height });
                }
                scored.sort((a, b) => a.score - b.score);
                const hit = scored[0] ? scored[0].el : null;
                const trigger = hit ? (hit.closest('div[role="button"]') || hit) : null;
                if (trigger) {
                  trigger.focus();
                  hit.click();
                }
              }
            },
            () => {
              void chrome.runtime.lastError;
              resolve();
            }
          );
        });
        sendResponse({ ok: true, result: { found: true, mode: 'main_fallback' } });
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
        const boxInfo = await new Promise((resolve) => {
          chrome.scripting.executeScript(
            {
              target: { tabId },
              world: 'MAIN',
              func: () => {
                const dialogs = Array.from(document.querySelectorAll('div[role="dialog"]')).filter((d) => {
                  const r = d.getBoundingClientRect();
                  return r.width > 200 && r.height > 150;
                });
                const dlg = dialogs.find((d) => {
                  const txt = (d.innerText || '').toLowerCase();
                  const aria = (d.getAttribute('aria-label') || '').toLowerCase();
                  return (
                    txt.includes('criar post') ||
                    txt.includes('create post') ||
                    txt.includes('criar publicação') ||
                    txt.includes('create a public post') ||
                    aria.includes('criar post') ||
                    aria.includes('create post')
                  );
                }) || dialogs[dialogs.length - 1];
                if (!dlg) return { ok: false };
                const boxes = Array.from(
                  dlg.querySelectorAll(
                    'div[role="textbox"][contenteditable="true"], div[contenteditable="true"][data-lexical-editor="true"], div[contenteditable="true"][aria-label]'
                  )
                );
                const tb = boxes.find((el) => {
                  const rect = el.getBoundingClientRect();
                  if (rect.width < 40 || rect.height < 20) return false;
                  const lbl = ((el.getAttribute('aria-label') || el.getAttribute('placeholder') || '') + '').toLowerCase();
                  return !lbl.includes('coment') && !lbl.includes('comment') && !lbl.includes('responder') && !lbl.includes('reply');
                });
                if (!tb) return { ok: false };
                const existing = (tb.innerText || tb.textContent || '').trim();
                tb.focus();
                const r = tb.getBoundingClientRect();
                return {
                  ok: true,
                  alreadyHasText: existing.length >= 10,
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

        if (!boxInfo || !boxInfo.ok) {
          sendResponse({ ok: false, reason: 'no_textbox' });
          return;
        }
        if (boxInfo.alreadyHasText) {
          sendResponse({ ok: true, result: { ok: true, skipped: 'already_filled' } });
          return;
        }

        const dbg = await withTabDebugger(tabId, async (sendCmd) => {
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
          return { inserted: true };
        });

        if (dbg.usedDebugger && dbg.value && dbg.value.inserted) {
          sendResponse({ ok: true, result: { ok: true, mode: 'debugger_insertText_autolink' } });
          return;
        }
        sendResponse({ ok: false, reason: 'debugger_insert_failed' });
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
        func: (imgDataUrl) => {
          try {
            const parts = imgDataUrl.split(',');
            const mimeMatch = parts[0].match(/data:([^;]+);/i);
            const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
            const byteStr = atob(parts[1] || '');
            const ab = new ArrayBuffer(byteStr.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteStr.length; i++) ia[i] = byteStr.charCodeAt(i);
            const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg';
            const file = new File([ab], `autoviral-post.${ext}`, { type: mime });
            const dt = new DataTransfer();
            dt.items.add(file);

            const dialogs = Array.from(document.querySelectorAll('div[role="dialog"]')).filter((d) => {
              const r = d.getBoundingClientRect();
              return r.width > 200 && r.height > 150;
            });
            const dlg = dialogs.find((d) => {
              const txt = (d.innerText || '').toLowerCase();
              return txt.includes('criar post') || txt.includes('create post') || txt.includes('criar publicação');
            }) || dialogs[dialogs.length - 1];
            if (!dlg) return { attached: false, reason: 'no_dialog' };

            const findImgFileInput = () => {
              const inputs = Array.from(dlg.querySelectorAll('input[type="file"]'));
              return inputs.find((inp) => (inp.accept || '').includes('image')) || inputs[0] || null;
            };

            let fileInput = findImgFileInput();
            if (!fileInput) {
              const photoBtns = Array.from(dlg.querySelectorAll('div[role="button"], button')).filter((el) => {
                const lbl = ((el.getAttribute('aria-label') || el.innerText || '') + '').toLowerCase();
                return lbl.includes('foto') || lbl.includes('photo') || lbl.includes('imagem') || lbl.includes('image');
              });
              if (photoBtns[0]) {
                try { photoBtns[0].click(); } catch (e) {}
                fileInput = findImgFileInput();
              }
            }

            if (fileInput) {
              fileInput.files = dt.files;
              fileInput.dispatchEvent(new Event('change', { bubbles: true }));
              fileInput.dispatchEvent(new Event('input', { bubbles: true }));
              return { attached: true, method: 'file_input' };
            }

            const tb = dlg.querySelector('div[role="textbox"][contenteditable="true"], div[contenteditable="true"][data-lexical-editor="true"]');
            if (tb) {
              tb.focus();
              tb.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
              return { attached: true, method: 'clipboard_paste' };
            }

            return { attached: false, reason: 'no_target' };
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

  if (request.action === 'AUTOVIRAL_REAL_CLICK_PUBLISH') {
    const tabId = sender && sender.tab && sender.tab.id;
    if (!tabId || !chrome.scripting || !chrome.scripting.executeScript) {
      sendResponse({ ok: false });
      return false;
    }
    (async () => {
      try {
        const btnInfo = await new Promise((resolve) => {
          chrome.scripting.executeScript(
            {
              target: { tabId },
              world: 'MAIN',
              func: () => {
                const dialogs = Array.from(document.querySelectorAll('div[role="dialog"]')).filter((d) => {
                  const r = d.getBoundingClientRect();
                  return r.width > 200 && r.height > 150;
                });
                const dlg = dialogs.find((d) => {
                  const txt = (d.innerText || '').toLowerCase();
                  const aria = (d.getAttribute('aria-label') || '').toLowerCase();
                  return (
                    txt.includes('criar post') ||
                    txt.includes('create post') ||
                    txt.includes('criar publicação') ||
                    txt.includes('create a public post') ||
                    aria.includes('criar post') ||
                    aria.includes('create post')
                  );
                }) || dialogs[dialogs.length - 1];
                if (!dlg) return { ok: false };
                const candidates = Array.from(dlg.querySelectorAll('div[role="button"], button'));
                const pubBtn = candidates.find((el) => {
                  const rect = el.getBoundingClientRect();
                  if (rect.width === 0 || rect.height === 0) return false;
                  const txt = ((el.innerText || el.getAttribute('aria-label') || '') + '').trim().toLowerCase();
                  if (txt !== 'postar' && txt !== 'publicar' && txt !== 'post') return false;
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

        if (!btnInfo || !btnInfo.ok) {
          sendResponse({ ok: false, reason: 'no_enabled_btn' });
          return;
        }

        const dbg = await withTabDebugger(tabId, async (sendCmd) => {
          await dispatchRealTrustedClick(sendCmd, btnInfo.cx, btnInfo.cy, 90);
          return { clicked: true };
        });

        if (dbg.usedDebugger && dbg.value && dbg.value.clicked) {
          sendResponse({ ok: true, result: { clicked: true, mode: 'debugger_trusted' } });
          return;
        }
        sendResponse({ ok: false, reason: 'debugger_click_failed' });
      } catch (err) {
        sendResponse({ ok: false, error: String(err) });
      }
    })();
    return true;
  }

  if (request.action === 'AUTOVIRAL_CLOSE_CURRENT_TAB') {
    if (sender && sender.tab && typeof sender.tab.id === 'number') {
      chrome.tabs.remove(sender.tab.id, () => {
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
    chrome.tabs.create({ url: pendingPost.groupUrl, active: true }, () => {
      void chrome.runtime.lastError;
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

if (chrome.alarms && chrome.alarms.onAlarm) {
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm && alarm.name === 'autoviral_approval_watchdog') {
      checkWaitingApprovalsNow(2).catch(() => {});
    }
  });
}
