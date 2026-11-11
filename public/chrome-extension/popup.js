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
  const btnSync = document.getElementById('btn-sync');
  const btnResetMapped = document.getElementById('btn-reset-mapped');
  const btnOpenPlatform = document.getElementById('btn-open-platform');

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
  let activeFilter = 'all';

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
      // Toggle checkbox
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
    alert('🎯 Modo selecionado: Disparo EXCLUSIVO no Facebook!');
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
    alert('🎯 Modo selecionado: Disparo EXCLUSIVO no YouTube!');
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
    alert('🎯 Modo selecionado: Disparo EXCLUSIVO no Pinterest!');
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
    alert('🎯 Modo selecionado: Disparo EXCLUSIVO no Instagram Stories!');
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

  // Filter tabs (all | fb | yt | pin)
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
      ['autoviral_mapped_groups', 'autoviral_yt_videos', 'autoviral_pin_boards', 'autoviral_insta_stories', 'autoviral_interval', 'autoviral_target_channels'],
      (res) => {
        if (res.autoviral_mapped_groups && Array.isArray(res.autoviral_mapped_groups)) {
          currentMappedGroups = res.autoviral_mapped_groups;
        }
        if (res.autoviral_yt_videos && Array.isArray(res.autoviral_yt_videos)) {
          currentYtVideos = res.autoviral_yt_videos;
        }
        if (res.autoviral_pin_boards && Array.isArray(res.autoviral_pin_boards)) {
          currentPinBoards = res.autoviral_pin_boards;
        }
        if (res.autoviral_insta_stories && Array.isArray(res.autoviral_insta_stories)) {
          currentInstaStories = res.autoviral_insta_stories;
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

  // Detect open tabs (Facebook, YouTube, Pinterest, Instagram)
  chrome.tabs.query({}, (tabs) => {
    if (!tabs || tabs.length === 0) return;

    const fbTab = tabs.find(t => (t.url || '').includes('facebook.com'));
    const ytTab = tabs.find(t => (t.url || '').includes('youtube.com'));
    const pinTab = tabs.find(t => (t.url || '').includes('pinterest.com'));
    const instaTab = tabs.find(t => (t.url || '').includes('instagram.com'));

    if (fbTab) {
      const url = fbTab.url || '';
      if (url.includes('groups/search') || url.includes('groups_home')) {
        fbStatusEl.textContent = 'Busca de Grupos Aberta!';
        fbStatusEl.style.color = '#10b981';
      } else if (url.includes('groups/')) {
        fbStatusEl.textContent = 'Grupo Aberto Detectado!';
        fbStatusEl.style.color = '#10b981';
      } else {
        fbStatusEl.textContent = 'Facebook Conectado';
        fbStatusEl.style.color = '#38bdf8';
      }

      // Query groups from that tab
      chrome.tabs.sendMessage(fbTab.id, { action: 'AUTOVIRAL_MAP_GROUPS' }, (res) => {
        if (res && res.groups && Array.isArray(res.groups)) {
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
    } else {
      instaStatusEl.textContent = 'Stories com Link Clicável';
      instaStatusEl.style.color = '#c084fc';
    }
  });

  // Manual Scan button
  btnScan.addEventListener('click', () => {
    btnScan.textContent = '⏳ Escaneando Rolagem...';
    btnScan.disabled = true;

    chrome.tabs.query({}, (tabs) => {
      const fbTab = tabs.find(t => (t.url || '').includes('facebook.com'));

      if (!fbTab) {
        alert('Abra uma aba do Facebook com busca de grupos ou grupos abertos e role a página para mapear!');
        btnScan.textContent = '🔍 Mapear Grupos da Aba Aberta do FB';
        btnScan.disabled = false;
        return;
      }

      chrome.tabs.sendMessage(fbTab.id, { action: 'AUTOVIRAL_MAP_GROUPS' }, (response) => {
        btnScan.textContent = '🔍 Mapear Grupos da Aba Aberta do FB';
        btnScan.disabled = false;

        if (response && response.groups && Array.isArray(response.groups) && response.groups.length > 0) {
          saveAndRenderGroups(response.groups);
          alert(`✅ ${response.groups.length} grupos foram capturados na sua rolagem do Facebook!`);
        } else {
          alert('Role a página do Facebook para que novos grupos carreguem e tente novamente.');
        }
      });
    });
  });

  // ZERAR MAPEAMENTO (Requested by user: "função zrar mapear")
  btnResetMapped.addEventListener('click', () => {
    const total = currentMappedGroups.length + currentYtVideos.length + currentPinBoards.length + currentInstaStories.length;
    const confirmReset = confirm(
      `⚠️ Deseja realmente ZERAR todos os dados mapeados (${currentMappedGroups.length} grupos FB, ${currentYtVideos.length} vídeos YT, ${currentPinBoards.length} pastas PIN, ${currentInstaStories.length} stories INSTA)?\n\nEssa ação limpará os registros mapeados para que você possa recomeçar do zero.`
    );

    if (!confirmReset) return;

    currentMappedGroups = [];
    currentYtVideos = [];
    currentPinBoards = [];
    currentInstaStories = [];

    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.remove(
        ['autoviral_mapped_groups', 'autoviral_yt_videos', 'autoviral_pin_boards', 'autoviral_insta_stories'],
        () => {
          updateCounts();
          renderItems();
          alert('✅ Mapeamento ZERADO com sucesso! Você pode iniciar uma nova rolagem limpa.');
        }
      );
    } else {
      updateCounts();
      renderItems();
    }

    // Notify open AutoViral AI platforms that mapping was reset
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

    // Send via BroadcastChannel (direct inter-tab sync)
    try {
      const bc = new BroadcastChannel('autoviral_bridge_channel');
      bc.postMessage({
        action: 'AUTOVIRAL_IMPORT_GROUPS_FROM_EXTENSION',
        groups: currentMappedGroups,
        ytVideos: currentYtVideos,
        pinBoards: currentPinBoards,
        instaStories: currentInstaStories,
        interval: selectedInterval,
        targetChannels: {
          facebook: chkFb.checked,
          youtube: chkYt.checked,
          pinterest: chkPin.checked,
          instagram: chkInsta.checked
        },
        timestamp: new Date().toISOString()
      });
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
          chrome.tabs.sendMessage(tab.id, {
            action: 'AUTOVIRAL_IMPORT_GROUPS_FROM_EXTENSION',
            groups: currentMappedGroups,
            ytVideos: currentYtVideos,
            pinBoards: currentPinBoards,
            instaStories: currentInstaStories,
            interval: selectedInterval,
            targetChannels: {
              facebook: chkFb.checked,
              youtube: chkYt.checked,
              pinterest: chkPin.checked,
              instagram: chkInsta.checked
            },
            timestamp: new Date().toISOString()
          });
        }
      });

      setTimeout(() => {
        btnSync.textContent = '📡 Enviar Grupos Mapeados para o Painel AutoViral';
        btnSync.disabled = false;
        if (platformTabFound) {
          alert(`✅ Sucesso! Dados mapeados separados (FB: ${currentMappedGroups.length}, YT: ${currentYtVideos.length}, PIN: ${currentPinBoards.length}, INSTA: ${currentInstaStories.length}) foram sincronizados com a plataforma AutoViral AI.`);
        } else {
          alert('ℹ️ Abra a aba da plataforma AutoViral AI no seu navegador para ver os dados sincronizados.');
        }
      }, 500);
    });
  });

  // Open platform
  if (btnOpenPlatform) {
    btnOpenPlatform.addEventListener('click', () => {
      chrome.tabs.create({ url: 'https://ais-dev-fdvdpr73jbu2hzpbbibxp5-395073471759.us-west2.run.app' });
    });
  }

  function saveAndRenderGroups(newGroups) {
    if (!newGroups || newGroups.length === 0) return;

    const merged = [...currentMappedGroups];
    newGroups.forEach(ng => {
      const exists = merged.some(g => g.id === ng.id || g.url === ng.url || g.name === ng.name);
      if (!exists && ng.name) {
        merged.unshift({ ...ng, channel: 'facebook' });
      }
    });

    currentMappedGroups = merged;
    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ autoviral_mapped_groups: currentMappedGroups });
    }
    updateCounts();
    renderItems();
  }

  function updateCounts() {
    fbCountEl.textContent = `${currentMappedGroups.length} grupos`;
    ytCountEl.textContent = `${currentYtVideos.length} vídeos`;
    pinCountEl.textContent = `${currentPinBoards.length} pastas`;
    if (instaCountEl) instaCountEl.textContent = `${currentInstaStories.length} stories`;

    const total = currentMappedGroups.length + currentYtVideos.length + currentPinBoards.length + currentInstaStories.length;
    totalBadgeEl.textContent = total.toString();
  }

  function renderItems() {
    const allItems = [
      ...currentMappedGroups.map(g => ({ ...g, channel: 'facebook', channelTag: 'FB', tagClass: 'tag-fb' })),
      ...currentYtVideos.map(v => ({ ...v, channel: 'youtube', channelTag: 'YT', tagClass: 'tag-yt' })),
      ...currentPinBoards.map(p => ({ ...p, channel: 'pinterest', channelTag: 'PIN', tagClass: 'tag-pin' })),
      ...currentInstaStories.map(s => ({ ...s, channel: 'instagram', channelTag: 'INSTA', tagClass: 'tag-insta' }))
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

    filtered.slice(0, 20).forEach(item => {
      const row = document.createElement('div');
      row.className = 'group-item';
      row.innerHTML = `
        <div>
          <div class="group-name" title="${item.name || item.title}">${item.name || item.title}</div>
          <div class="group-meta">${item.membersCount ? item.membersCount.toLocaleString('pt-BR') + ' membros' : (item.views || item.followers || 'Detectado')}</div>
        </div>
        <span class="channel-tag ${item.tagClass}">${item.channelTag}</span>
      `;
      groupsItems.appendChild(row);
    });
  }
});
