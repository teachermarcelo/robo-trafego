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

  // Relay Instagram mapped accounts or connected handle to AutoViral platform tabs
  if (
    request.action === 'AUTOVIRAL_IMPORT_INSTAGRAM_ACCOUNTS' ||
    request.action === 'AUTOVIRAL_INSTA_ACCOUNT_SYNC'
  ) {
    if (request.action === 'AUTOVIRAL_IMPORT_INSTAGRAM_ACCOUNTS' && Array.isArray(request.accounts)) {
      chrome.storage.local.set({ autoviral_insta_accounts: request.accounts });
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
