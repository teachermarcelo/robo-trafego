// AutoViral AI Chrome Extension - Popup Controller V1.2.0
// Multi-Channel Mapper (Facebook, YouTube & Pinterest) + Zerar Mapeamento + Seletor de Canais

document.addEventListener('DOMContentLoaded', () => {
  const fbStatusEl = document.getElementById('fb-status');
  const ytStatusEl = document.getElementById('yt-status');
  const pinStatusEl = document.getElementById('pin-status');
  const instaStatusEl = document.getElementById('insta-status');

  const fbCountEl = document.getElementById('fb-count');
  const ytCountEl = document.getElementById('yt-count');
  const pinCountEl = document.getElementById('pin-count');
  const instaCountEl = document.getElementById('insta-count');
  const totalBadgeEl = document.getElementById('total-badge');

  const btnScan = document.getElementById('btn-scan');
  const btnScanInsta = document.getElementById('btn-scan-insta');
  const btnScanYt = document.getElementById('btn-scan-yt');
  const btnSync = document.getElementById('btn-sync');
  const btnResetMapped = document.getElementById('btn-reset-mapped');
  const btnOpenPlatform = document.getElementById('btn-open-platform');
  const statusBanner = document.getElementById('popup-status-banner');

  const groupsContainer = document.getElementById('groups-container');
  const groupsItems = document.getElementById('groups-items');
  const intervalBtns = document.querySelectorAll('.interval-btn');
  const filterTabs = document.querySelectorAll('.filter-tab');

  // Channel toggles
  const chkFb = document.getElementById('chk-fb');
  const chkYt = document.getElementById('chk-yt');
  const chkPin = document.getElementById('chk-pin');
  const chkInsta = document.getElementById('chk-insta');
  const toggleFb = document.getElementById('toggle-fb');
  const toggleYt = document.getElementById('toggle-yt');
  const togglePin = document.getElementById('toggle-pin');
  const toggleInsta = document.getElementById('toggle-insta');

  const btnQuickFb = document.getElementById('btn-quick-fb');
  const btnQuickYt = document.getElementById('btn-quick-yt');
  const btnQuickPin = document.getElementById('btn-quick-pin');
  const btnQuickInsta = document.getElementById('btn-quick-insta');

  let selectedInterval = 350;
  let currentMappedGroups = [];
  let currentYtVideos = [];
  let currentPinBoards = [];
  let currentInstaStories = [];
  let currentInstaAccounts = [];
  let connectedInstaHandle = '@conectado';
  let activeFilter = 'all';

  function showStatus(msg, isError) {
    if (!statusBanner) return;
    statusBanner.style.display = 'block';
    statusBanner.style.background = isError ? '#450a0a' : '#064e3b';
    statusBanner.style.borderColor = isError ? '#ef4444' : '#10b981';
    statusBanner.style.color = isError ? '#fecaca' : '#a7f3d0';
    statusBanner.textContent = msg;
  }

  // Toggle handlers for dispatch channels
  function updateToggleUI(label, chk) {
    if (chk.checked) {
      label.classList.add('active');
    } else {
      label.classList.remove('active');
    }
  }

  [
    { label: toggleFb, chk: chkFb },
    { label: toggleYt, chk: chkYt },
    { label: togglePin, chk: chkPin },
    { label: toggleInsta, chk: chkInsta }
  ].forEach(pair => {
    pair.label.addEventListener('click', (e) => {
      if (e.target !== pair.chk) {
        pair.chk.checked = !pair.chk.checked;
      }
      updateToggleUI(pair.label, pair.chk);
      saveDispatchChannels();
    });
  });

  // Quick single channel buttons (selects ONLY that channel)
  btnQuickFb.addEventListener('click', () => {
    chkFb.checked = true;
    chkYt.checked = false;
    chkPin.checked = false;
    chkInsta.checked = false;
    updateToggleUI(toggleFb, chkFb);
    updateToggleUI(toggleYt, chkYt);
    updateToggleUI(togglePin, chkPin);
    updateToggleUI(toggleInsta, chkInsta);
    saveDispatchChannels();
    showStatus('🎯 Modo selecionado: Disparo EXCLUSIVO no Facebook!');
  });

  btnQuickYt.addEventListener('click', () => {
    chkFb.checked = false;
    chkYt.checked = true;
    chkPin.checked = false;
    chkInsta.checked = false;
    updateToggleUI(toggleFb, chkFb);
    updateToggleUI(toggleYt, chkYt);
    updateToggleUI(togglePin, chkPin);
    updateToggleUI(toggleInsta, chkInsta);
    saveDispatchChannels();
    showStatus('🎯 Modo selecionado: Disparo EXCLUSIVO no YouTube!');
  });

  btnQuickPin.addEventListener('click', () => {
    chkFb.checked = false;
    chkYt.checked = false;
    chkPin.checked = true;
    chkInsta.checked = false;
    updateToggleUI(toggleFb, chkFb);
    updateToggleUI(toggleYt, chkYt);
    updateToggleUI(togglePin, chkPin);
    updateToggleUI(toggleInsta, chkInsta);
    saveDispatchChannels();
    showStatus('🎯 Modo selecionado: Disparo EXCLUSIVO no Pinterest!');
  });

  btnQuickInsta.addEventListener('click', () => {
    chkFb.checked = false;
    chkYt.checked = false;
    chkPin.checked = false;
    chkInsta.checked = true;
    updateToggleUI(toggleFb, chkFb);
    updateToggleUI(toggleYt, chkYt);
    updateToggleUI(togglePin, chkPin);
    updateToggleUI(toggleInsta, chkInsta);
    saveDispatchChannels();
    showStatus('🎯 Modo selecionado: Disparo EXCLUSIVO no Instagram Stories!');
  });

  function saveDispatchChannels() {
    const targets = {
      facebook: chkFb.checked,
      youtube: chkYt.checked,
      pinterest: chkPin.checked,
      instagram: chkInsta.checked
    };
    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ autoviral_target_channels: targets });
    }
  }

  // Interval selection
  intervalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      intervalBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedInterval = parseInt(btn.dataset.time || '350', 10);
      if (chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ autoviral_interval: selectedInterval });
      }
    });
  });

  // Filter tabs (all | fb | yt | pin | insta)
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeFilter = tab.dataset.filter || 'all';
      renderItems();
    });
  });

  // Load existing storage data
  if (chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(
      [
        'autoviral_mapped_groups',
        'autoviral_yt_videos',
        'autoviral_pin_boards',
        'autoviral_insta_stories',
        'autoviral_insta_accounts',
        'autoviral_insta_connected_handle',
        'autoviral_interval',
        'autoviral_target_channels'
      ],
      (res) => {
        if (Array.isArray(res.autoviral_mapped_groups)) {
          currentMappedGroups = res.autoviral_mapped_groups.map(g => ({
            ...g,
            name: sanitizeGroupName(g.name) || g.name
          }));
        }
        if (Array.isArray(res.autoviral_yt_videos)) {
          currentYtVideos = res.autoviral_yt_videos;
        }
        if (Array.isArray(res.autoviral_pin_boards)) {
          currentPinBoards = res.autoviral_pin_boards;
        }
        if (Array.isArray(res.autoviral_insta_stories)) {
          currentInstaStories = res.autoviral_insta_stories;
        }
        if (Array.isArray(res.autoviral_insta_accounts)) {
          currentInstaAccounts = res.autoviral_insta_accounts;
        }
        if (res.autoviral_insta_connected_handle) {
          connectedInstaHandle = res.autoviral_insta_connected_handle;
        }
        if (res.autoviral_interval) {
          selectedInterval = res.autoviral_interval;
          intervalBtns.forEach(b => {
            b.classList.toggle('active', parseInt(b.dataset.time, 10) === selectedInterval);
          });
        }
        if (res.autoviral_target_channels) {
          chkFb.checked = !!res.autoviral_target_channels.facebook;
          chkYt.checked = !!res.autoviral_target_channels.youtube;
          chkPin.checked = !!res.autoviral_target_channels.pinterest;
          chkInsta.checked = res.autoviral_target_channels.instagram !== false;
          updateToggleUI(toggleFb, chkFb);
          updateToggleUI(toggleYt, chkYt);
          updateToggleUI(togglePin, chkPin);
          updateToggleUI(toggleInsta, chkInsta);
        }
        updateCounts();
        renderItems();
      }
    );
  }

  function sendToTabWithAutoInject(tabId, message, callback) {
    chrome.tabs.sendMessage(tabId, message, (res) => {
      if (!chrome.runtime.lastError && res) {
        callback(res);
        return;
      }
      if (chrome.scripting && chrome.scripting.executeScript) {
        chrome.scripting.executeScript(
          { target: { tabId: tabId }, files: ['content.js'] },
          () => {
            if (chrome.runtime.lastError) {
              callback(null);
              return;
            }
            setTimeout(() => {
              chrome.tabs.sendMessage(tabId, message, (retryRes) => {
                void chrome.runtime.lastError;
                callback(retryRes || null);
              });
            }, 350);
          }
        );
      } else {
        callback(null);
      }
    });
  }

  function findPreferredTab(tabs, domain) {
    return (
      tabs.find(t => t.active && (t.url || '').includes(domain)) ||
      tabs.find(t => (t.url || '').includes(domain))
    );
  }

  // Detect open tabs (Facebook, YouTube, Pinterest, Instagram)
  chrome.tabs.query({}, (tabs) => {
    if (!tabs || tabs.length === 0) return;

    const fbTab = findPreferredTab(tabs, 'facebook.com');
    const ytTab = findPreferredTab(tabs, 'youtube.com');
    const pinTab = findPreferredTab(tabs, 'pinterest.com');
    const instaTab = findPreferredTab(tabs, 'instagram.com');

    if (fbTab) {
      const url = fbTab.url || '';
      if (url.includes('groups/search') || url.includes('search/groups') || url.includes('groups_home')) {
        fbStatusEl.textContent = 'Busca de Grupos Aberta!';
        fbStatusEl.style.color = '#10b981';
      } else if (url.includes('groups/')) {
        fbStatusEl.textContent = 'Grupo Aberto Detectado!';
        fbStatusEl.style.color = '#10b981';
      } else {
        fbStatusEl.textContent = 'Facebook Conectado';
        fbStatusEl.style.color = '#38bdf8';
      }

      sendToTabWithAutoInject(fbTab.id, { action: 'AUTOVIRAL_MAP_GROUPS' }, (res) => {
        if (res && Array.isArray(res.groups) && res.groups.length > 0) {
          saveAndRenderGroups(res.groups);
        }
      });
    } else {
      fbStatusEl.textContent = 'Abra o Facebook (ex: facebook.com/groups)';
      fbStatusEl.style.color = '#f59e0b';
    }

    if (ytTab) {
      ytStatusEl.textContent = 'Aba YouTube Detectada!';
      ytStatusEl.style.color = '#10b981';
      sendToTabWithAutoInject(ytTab.id, { action: 'AUTOVIRAL_YOUTUBE_GET_SEARCH_VIDEOS' }, (res) => {
        if (res && Array.isArray(res.videos) && res.videos.length > 0) {
          saveAndRenderYtVideos(res.videos);
        }
      });
    } else {
      ytStatusEl.textContent = 'Aguardando YouTube';
      ytStatusEl.style.color = '#94a3b8';
    }

    if (pinTab) {
      pinStatusEl.textContent = 'Aba Pinterest Aberta!';
      pinStatusEl.style.color = '#10b981';
    } else {
      pinStatusEl.textContent = 'Pins & Pastas Prontos';
      pinStatusEl.style.color = '#e11d48';
    }

    if (instaTab) {
      instaStatusEl.textContent = 'Instagram Conectado!';
      instaStatusEl.style.color = '#10b981';
      sendToTabWithAutoInject(instaTab.id, { action: 'AUTOVIRAL_MAP_INSTAGRAM_ACCOUNTS' }, (res) => {
        if (res && Array.isArray(res.accounts)) {
          if (res.connectedHandle) connectedInstaHandle = res.connectedHandle;
          saveAndRenderInstaAccounts(res.accounts);
        }
      });
    } else {
      instaStatusEl.textContent = 'Stories + Mapeador Ilimitado';
      instaStatusEl.style.color = '#c084fc';
    }
  });

  // Manual FB Scan button
  btnScan.addEventListener('click', () => {
    btnScan.textContent = '⏳ Escaneando Grupos...';
    btnScan.disabled = true;

    chrome.tabs.query({}, (tabs) => {
      const fbTab = findPreferredTab(tabs, 'facebook.com');

      if (!fbTab) {
        showStatus('Abra uma aba do Facebook com busca de grupos e role a página para mapear!', true);
        btnScan.textContent = '🔍 Mapear Grupos da Aba Aberta do FB';
        btnScan.disabled = false;
        return;
      }

      sendToTabWithAutoInject(fbTab.id, { action: 'AUTOVIRAL_MAP_GROUPS' }, (response) => {
        btnScan.textContent = '🔍 Mapear Grupos da Aba Aberta do FB';
        btnScan.disabled = false;

        if (response && Array.isArray(response.groups) && response.groups.length > 0) {
          saveAndRenderGroups(response.groups);
          showStatus(`✅ ${response.groups.length} grupos mapeados nesta busca do Facebook!`);
        } else {
          showStatus('Role um pouco a lista de grupos no Facebook (ou recarregue a aba com F5) e clique novamente.', true);
        }
      });
    });
  });

  // Manual Instagram Scan button (Unlimited)
  if (btnScanInsta) {
    btnScanInsta.addEventListener('click', () => {
      btnScanInsta.textContent = '⏳ Capturando Contas do Instagram...';
      btnScanInsta.disabled = true;

      chrome.tabs.query({}, (tabs) => {
        const instaTab = findPreferredTab(tabs, 'instagram.com');

        if (!instaTab) {
          showStatus('Abra uma aba do Instagram (busca, seguidores ou comentários) para mapear contas!', true);
          btnScanInsta.textContent = '🟣 Mapear Contas do Instagram (Ilimitado)';
          btnScanInsta.disabled = false;
          return;
        }

        sendToTabWithAutoInject(instaTab.id, { action: 'AUTOVIRAL_MAP_INSTAGRAM_ACCOUNTS' }, (response) => {
          btnScanInsta.textContent = '🟣 Mapear Contas do Instagram (Ilimitado)';
          btnScanInsta.disabled = false;

          if (response && Array.isArray(response.accounts) && response.accounts.length > 0) {
            if (response.connectedHandle) connectedInstaHandle = response.connectedHandle;
            saveAndRenderInstaAccounts(response.accounts);
            showStatus(`🟣 ${response.accounts.length} contas do Instagram mapeadas (Conta conectada: ${connectedInstaHandle})!`);
          } else {
            showStatus('Role a lista, pesquisa ou seguidores no Instagram (ou recarregue com F5) e tente novamente.', true);
          }
        });
      });
    });
  }

  // Manual YouTube URL Scan button
  if (btnScanYt) {
    btnScanYt.addEventListener('click', () => {
      btnScanYt.textContent = '⏳ Capturando URLs do YouTube...';
      btnScanYt.disabled = true;

      chrome.tabs.query({}, (tabs) => {
        const ytTab = findPreferredTab(tabs, 'youtube.com');

        if (!ytTab) {
          showStatus('Abra o YouTube (pesquisa de vídeos ou um vídeo aberto) para mapear as URLs!', true);
          btnScanYt.textContent = '▶️ Mapear Vídeos / URLs do YouTube';
          btnScanYt.disabled = false;
          return;
        }

        sendToTabWithAutoInject(ytTab.id, { action: 'AUTOVIRAL_YOUTUBE_GET_SEARCH_VIDEOS' }, (response) => {
          btnScanYt.textContent = '▶️ Mapear Vídeos / URLs do YouTube';
          btnScanYt.disabled = false;

          if (response && Array.isArray(response.videos) && response.videos.length > 0) {
            saveAndRenderYtVideos(response.videos);
            showStatus(`▶️ ${response.videos.length} URLs de vídeos do YouTube mapeadas! Clique em "Enviar Tudo" abaixo.`);
          } else {
            showStatus('Abra uma pesquisa no YouTube (ou um vídeo) e role um pouco antes de clicar novamente.', true);
          }
        });
      });
    });
  }

  // ZERAR MAPEAMENTO
  btnResetMapped.addEventListener('click', () => {
    currentMappedGroups = [];
    currentYtVideos = [];
    currentPinBoards = [];
    currentInstaStories = [];
    currentInstaAccounts = [];

    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.remove(
        [
          'autoviral_mapped_groups',
          'autoviral_yt_videos',
          'autoviral_pin_boards',
          'autoviral_insta_stories',
          'autoviral_insta_accounts'
        ],
        () => {
          updateCounts();
          renderItems();
          showStatus('✅ Mapeamento ZERADO! Pode iniciar uma nova captura limpa.');
        }
      );
    } else {
      updateCounts();
      renderItems();
    }

    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        const url = tab.url || '';
        if (url.includes('ais-') || url.includes('localhost') || url.includes('vercel.app') || url.includes('run.app')) {
          chrome.tabs.sendMessage(tab.id, { action: 'AUTOVIRAL_RESET_MAPPED_GROUPS' });
        }
      });
    });
  });

  // Sync with AutoViral AI Platform
  btnSync.addEventListener('click', () => {
    btnSync.textContent = '⏳ Sincronizando...';
    btnSync.disabled = true;

    const enrichedGroups = currentMappedGroups.map(g => ({
      ...g,
      searchFolder: g.searchFolder || 'geral',
      searchTerm: g.searchTerm || g.searchFolder || 'geral'
    }));
    currentMappedGroups = enrichedGroups;
    const primaryFolder = (enrichedGroups[0] && enrichedGroups[0].searchFolder) || 'geral';
    const primaryQuery = (enrichedGroups[0] && enrichedGroups[0].searchTerm) || primaryFolder;

    const commonPayload = {
      action: 'AUTOVIRAL_IMPORT_GROUPS_FROM_EXTENSION',
      groups: enrichedGroups,
      searchFolder: primaryFolder,
      searchQuery: primaryQuery,
      ytVideos: currentYtVideos,
      pinBoards: currentPinBoards,
      instaStories: currentInstaStories,
      instaAccounts: currentInstaAccounts,
      connectedHandle: connectedInstaHandle,
      interval: selectedInterval,
      targetChannels: {
        facebook: chkFb.checked,
        youtube: chkYt.checked,
        pinterest: chkPin.checked,
        instagram: chkInsta.checked
      },
      timestamp: new Date().toISOString()
    };

    try {
      const bc = new BroadcastChannel('autoviral_bridge_channel');
      bc.postMessage(commonPayload);
      if (currentInstaAccounts.length > 0) {
        bc.postMessage({
          action: 'AUTOVIRAL_IMPORT_INSTAGRAM_ACCOUNTS',
          accounts: currentInstaAccounts,
          connectedHandle: connectedInstaHandle,
          timestamp: new Date().toISOString()
        });
      }
      if (currentYtVideos.length > 0) {
        bc.postMessage({
          action: 'AUTOVIRAL_IMPORT_YOUTUBE_VIDEOS_FROM_EXTENSION',
          videos: currentYtVideos,
          timestamp: new Date().toISOString()
        });
      }
      setTimeout(() => bc.close(), 1000);
    } catch (err) {}

    chrome.tabs.query({}, (tabs) => {
      let platformTabFound = false;

      tabs.forEach(tab => {
        const url = tab.url || '';
        if (
          url.includes('ais-') ||
          url.includes('localhost') ||
          url.includes('vercel.app') ||
          url.includes('run.app') ||
          (tab.title && tab.title.includes('AutoViral'))
        ) {
          platformTabFound = true;
          sendToTabWithAutoInject(tab.id, commonPayload, () => {
            if (currentInstaAccounts.length > 0) {
              chrome.tabs.sendMessage(tab.id, {
                action: 'AUTOVIRAL_IMPORT_INSTAGRAM_ACCOUNTS',
                accounts: currentInstaAccounts,
                connectedHandle: connectedInstaHandle,
                timestamp: new Date().toISOString()
              }, () => { void chrome.runtime.lastError; });
            }
            if (currentYtVideos.length > 0) {
              chrome.tabs.sendMessage(tab.id, {
                action: 'AUTOVIRAL_IMPORT_YOUTUBE_VIDEOS_FROM_EXTENSION',
                videos: currentYtVideos,
                timestamp: new Date().toISOString()
              }, () => { void chrome.runtime.lastError; });
            }
          });
        }
      });

      setTimeout(() => {
        btnSync.textContent = '📡 Enviar Tudo (FB + Insta + YouTube) para o Painel';
        btnSync.disabled = false;
        showStatus(
          platformTabFound
            ? `✅ Sincronizado! FB: ${enrichedGroups.length} • YT: ${currentYtVideos.length} • Insta: ${currentInstaAccounts.length}.`
            : `✅ Salvo! FB: ${enrichedGroups.length} • YT: ${currentYtVideos.length} • Insta: ${currentInstaAccounts.length}. Abra o AutoViral AI!`
        );
      }, 600);
    });
  });

  function sanitizeGroupName(rawName) {
    return (rawName || '')
      .replace(/\u00a0/g, ' ')
      .replace(/^(foto\s+do\s+perfil\s+de|foto\s+da\s+capa\s+de|profile\s+picture\s+of|cover\s+photo\s+of)\s+/i, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Open or focus existing AutoViral AI platform tab
  if (btnOpenPlatform) {
    btnOpenPlatform.addEventListener('click', () => {
      chrome.tabs.query({}, (tabs) => {
        const existingTab =
          tabs.find(t => (t.url || '').includes('run.app') || (t.url || '').includes('localhost')) ||
          tabs.find(t => (t.title || '').includes('AutoViral'));

        if (existingTab) {
          chrome.windows.update(existingTab.windowId, { focused: true }, () => {
            chrome.tabs.update(existingTab.id, { active: true });
          });
        } else {
          chrome.tabs.create({ url: 'https://ais-dev-fdvdpr73jbu2hzpbbibxp5-395073471759.us-west2.run.app' });
        }
      });
    });
  }

  function saveAndRenderGroups(newGroups) {
    if (!newGroups || newGroups.length === 0) return;

    const merged = currentMappedGroups.map(g => ({
      ...g,
      name: sanitizeGroupName(g.name) || g.name
    }));
    newGroups.forEach(ng => {
      const cleanName = sanitizeGroupName(ng.name);
      if (!cleanName) return;
      const existingIdx = merged.findIndex(g => g.id === ng.id || g.url === ng.url);
      if (existingIdx === -1) {
        merged.unshift({ ...ng, name: cleanName, channel: 'facebook' });
      } else if ((merged[existingIdx].name || '').startsWith('Foto do') || cleanName.length > (merged[existingIdx].name || '').length) {
        merged[existingIdx] = { ...merged[existingIdx], ...ng, name: cleanName, channel: 'facebook' };
      }
    });

    currentMappedGroups = merged;
    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ autoviral_mapped_groups: currentMappedGroups });
    }
    updateCounts();
    renderItems();
  }

  function saveAndRenderInstaAccounts(newAccounts) {
    if (!newAccounts || newAccounts.length === 0) return;
    const map = new Map();
    [...newAccounts, ...currentInstaAccounts].forEach(acc => {
      if (acc && acc.username) {
        map.set(acc.username.toLowerCase(), acc);
      }
    });
    currentInstaAccounts = Array.from(map.values());
    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ autoviral_insta_accounts: currentInstaAccounts });
    }
    updateCounts();
    renderItems();
  }

  function saveAndRenderYtVideos(newVideos) {
    if (!newVideos || newVideos.length === 0) return;
    const map = new Map();
    [...newVideos, ...currentYtVideos].forEach(v => {
      if (v && v.url) {
        map.set(v.url, v);
      }
    });
    currentYtVideos = Array.from(map.values());
    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ autoviral_yt_videos: currentYtVideos });
    }
    updateCounts();
    renderItems();
  }

  function updateCounts() {
    fbCountEl.textContent = `${currentMappedGroups.length} grupos`;
    ytCountEl.textContent = `${currentYtVideos.length} vídeos`;
    pinCountEl.textContent = `${currentPinBoards.length} pastas`;
    const instaTotal = currentInstaAccounts.length + currentInstaStories.length;
    if (instaCountEl) instaCountEl.textContent = `${instaTotal} contas`;

    const total = currentMappedGroups.length + currentYtVideos.length + currentPinBoards.length + instaTotal;
    totalBadgeEl.textContent = total.toString();
  }

  function renderItems() {
    const allItems = [
      ...currentMappedGroups.map(g => ({ ...g, channel: 'facebook', channelTag: 'FB', tagClass: 'tag-fb' })),
      ...currentYtVideos.map(v => ({ ...v, channel: 'youtube', channelTag: 'YT', tagClass: 'tag-yt' })),
      ...currentPinBoards.map(p => ({ ...p, channel: 'pinterest', channelTag: 'PIN', tagClass: 'tag-pin' })),
      ...currentInstaAccounts.map(a => ({ ...a, name: `${a.handle} (${a.name})`, channel: 'instagram', channelTag: 'INSTA', tagClass: 'tag-insta' })),
      ...currentInstaStories.map(s => ({ ...s, channel: 'instagram', channelTag: 'STORY', tagClass: 'tag-insta' }))
    ];

    const filtered = allItems.filter(item => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'fb') return item.channel === 'facebook';
      if (activeFilter === 'yt') return item.channel === 'youtube';
      if (activeFilter === 'pin') return item.channel === 'pinterest';
      if (activeFilter === 'insta') return item.channel === 'instagram';
      return true;
    });

    if (filtered.length === 0) {
      groupsContainer.style.display = 'none';
      return;
    }

    groupsContainer.style.display = 'block';
    groupsItems.innerHTML = '';

    filtered.slice(0, 50).forEach(item => {
      const row = document.createElement('div');
      row.className = 'group-item';
      row.innerHTML = `
        <div>
          <div class="group-name" title="${item.name || item.title}">${item.name || item.title}</div>
          <div class="group-meta">${item.membersCount ? item.membersCount.toLocaleString('pt-BR') + ' membros' : (item.views || item.followers || 'Mapeado')}</div>
        </div>
        <span class="channel-tag ${item.tagClass}">${item.channelTag}</span>
      `;
      groupsItems.appendChild(row);
    });
  }
});
