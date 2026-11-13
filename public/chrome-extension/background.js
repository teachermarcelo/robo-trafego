// AutoViral AI Chrome Extension - Background Service Worker (Manifest V3)

chrome.runtime.onInstalled.addListener(() => {
  console.log('[AutoViral AI] Extensão v1.3.6 instalada com sucesso!');
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
    url.includes('vercel.app') ||
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
        tabs.find(t => (t.url || '').includes('run.app') || (t.url || '').includes('localhost')) ||
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
});
