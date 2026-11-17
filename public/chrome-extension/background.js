// AutoViral AI Chrome Extension - Background Service Worker (Manifest V3)

chrome.runtime.onInstalled.addListener(() => {
  console.log('[AutoViral AI] Extensão v1.4.4 instalada com sucesso!');
  chrome.storage.local.get(['autoviral_interval', 'autoviral_mapped_groups'], (res) => {
    chrome.storage.local.set({
      autoviral_interval: res.autoviral_interval || 350,
      autoviral_mapped_groups: Array.isArray(res.autoviral_mapped_groups) ? res.autoviral_mapped_groups : []
    });
  });
});

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

  // Pull cached Instagram/FB/YouTube data from chrome.storage.local (and live Instagram tab if open)
  if (request.action === 'AUTOVIRAL_PULL_EXTENSION_CACHE') {
    chrome.tabs.query({ url: '*://*.instagram.com/*' }, (instaTabs) => {
      const finalize = (liveAccounts, liveHandle) => {
        chrome.storage.local.get(
          [
            'autoviral_insta_accounts',
            'autoviral_insta_connected_handle',
            'autoviral_mapped_groups',
            'autoviral_yt_videos'
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
            sendResponse({
              success: true,
              accounts,
              connectedHandle,
              groups: res.autoviral_mapped_groups || [],
              ytVideos: res.autoviral_yt_videos || []
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
              document.querySelectorAll('[data-pagelet="GroupInlineComposer"] div[role="button"], div[role="button"], span')
            );
            const matched = candidates.find((el) => {
              const rect = el.getBoundingClientRect();
              if (rect.width < 60 || rect.height < 16) return false;
              if (el.closest('div[role="dialog"]')) return false;
              if (el.closest('[aria-busy="true"]')) return false;
              const t = (el.innerText || el.getAttribute('aria-label') || '').trim().toLowerCase();
              return (
                t === 'escreva algo...' ||
                t.includes('escreva algo') ||
                t.includes('no que você está pensando') ||
                t === 'write something...' ||
                t.includes('write something') ||
                t.includes("what's on your mind") ||
                t.includes('criar publicação pública') ||
                t.includes('create a public post')
              );
            });
            const trigger = matched ? (matched.closest('div[role="button"]') || matched) : null;
            if (!trigger) return { found: false };
            trigger.scrollIntoView({ behavior: 'instant', block: 'center' });
            const r = trigger.getBoundingClientRect();
            const cx = Math.round(r.left + r.width / 2);
            const cy = Math.round(r.top + r.height / 2);

            if (clickMode === 'simple') {
              trigger.focus();
              trigger.click();
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
