// AutoViral AI Chrome Extension - Background Service Worker (Manifest V3)

chrome.runtime.onInstalled.addListener(() => {
  console.log('[AutoViral AI] Extensão instalada com sucesso!');
  chrome.storage.local.set({
    autoviral_interval: 350,
    autoviral_mapped_groups: []
  });
});

// Relay messages between tabs
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'AUTOVIRAL_QUERY_FB_TABS') {
    chrome.tabs.query({ url: '*://*.facebook.com/*' }, (tabs) => {
      sendResponse({ count: tabs.length, tabs: tabs.map(t => ({ id: t.id, title: t.title, url: t.url })) });
    });
    return true;
  }

  // Relay mapped groups to AutoViral platform tabs
  if (request.action === 'AUTOVIRAL_SYNC_WITH_PLATFORM') {
    const groups = request.groups || [];
    // Store in extension storage
    chrome.storage.local.set({ autoviral_mapped_groups: groups });

    // Send to all open tabs that might be the AutoViral platform
    chrome.tabs.query({}, (tabs) => {
      let forwardedCount = 0;
      tabs.forEach(tab => {
        const url = tab.url || '';
        const title = tab.title || '';
        if (
          url.includes('ais-') ||
          url.includes('localhost') ||
          url.includes('run.app') ||
          url.includes('vercel.app') ||
          title.includes('AutoViral')
        ) {
          chrome.tabs.sendMessage(tab.id, {
            action: 'AUTOVIRAL_IMPORT_GROUPS_FROM_EXTENSION',
            groups: groups,
            timestamp: new Date().toISOString()
          }, () => {
            if (!chrome.runtime.lastError) {
              forwardedCount++;
            }
          });
        }
      });
      sendResponse({ success: true, forwardedCount, totalGroups: groups.length });
    });
    return true;
  }

  // Open a specific Facebook Group tab for assisted real posting
  if (request.action === 'AUTOVIRAL_OPEN_GROUP_FOR_POST') {
    const pendingPost = {
      logId: request.logId || '',
      groupId: request.groupId || '',
      groupUrl: request.groupUrl || '',
      groupName: request.groupName || '',
      fullText: request.fullText || '',
      createdAt: new Date().toISOString()
    };
    chrome.storage.local.set({ autoviral_pending_fb_post: pendingPost }, () => {
      if (pendingPost.groupUrl) {
        chrome.tabs.create({ url: pendingPost.groupUrl, active: true }, (tab) => {
          void chrome.runtime.lastError;
          sendResponse({ success: true, tabId: tab ? tab.id : null });
        });
      } else {
        sendResponse({ success: false });
      }
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
    if (request.handle) {
      chrome.storage.local.set({ autoviral_insta_connected_handle: request.handle });
    }
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        const url = tab.url || '';
        const title = tab.title || '';
        if (
          url.includes('ais-') ||
          url.includes('localhost') ||
          url.includes('run.app') ||
          url.includes('vercel.app') ||
          title.includes('AutoViral')
        ) {
          chrome.tabs.sendMessage(tab.id, request, () => {
            void chrome.runtime.lastError;
          });
        }
      });
      sendResponse({ success: true });
    });
    return true;
  }
});
