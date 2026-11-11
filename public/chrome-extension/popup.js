// AutoViral AI Chrome Extension - Popup Controller V1.1.0

document.addEventListener('DOMContentLoaded', () => {
  const fbStatusEl = document.getElementById('fb-status');
  const ytStatusEl = document.getElementById('yt-status');
  const groupsCountEl = document.getElementById('groups-count');
  const btnScan = document.getElementById('btn-scan');
  const btnSync = document.getElementById('btn-sync');
  const btnOpenPlatform = document.getElementById('btn-open-platform');
  const groupsContainer = document.getElementById('groups-container');
  const groupsItems = document.getElementById('groups-items');
  const intervalBtns = document.querySelectorAll('.interval-btn');

  let selectedInterval = 350;
  let currentMappedGroups = [];
  let detectedFbTab = null;

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

  // Load existing mapped groups
  if (chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['autoviral_mapped_groups', 'autoviral_interval'], (res) => {
      if (res.autoviral_mapped_groups && Array.isArray(res.autoviral_mapped_groups)) {
        currentMappedGroups = res.autoviral_mapped_groups;
        renderGroups(currentMappedGroups);
      }
      if (res.autoviral_interval) {
        selectedInterval = res.autoviral_interval;
        intervalBtns.forEach(b => {
          b.classList.toggle('active', parseInt(b.dataset.time, 10) === selectedInterval);
        });
      }
    });
  }

  // Search across ALL open tabs for Facebook and YouTube
  chrome.tabs.query({}, (tabs) => {
    if (!tabs || tabs.length === 0) return;

    const fbTab = tabs.find(t => (t.url || '').includes('facebook.com'));
    const ytTab = tabs.find(t => (t.url || '').includes('youtube.com'));

    if (fbTab) {
      detectedFbTab = fbTab;
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

      // Automatically query groups from that Facebook tab
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
  });

  // Manual Scan button
  btnScan.addEventListener('click', () => {
    btnScan.textContent = '⏳ Escaneando Rolagem do FB...';
    btnScan.disabled = true;

    chrome.tabs.query({}, (tabs) => {
      const fbTab = tabs.find(t => (t.url || '').includes('facebook.com'));

      if (!fbTab) {
        alert('Abra uma aba do Facebook com grupos ou a busca de grupos (como você abriu em facebook.com/groups/search/groups_home/?q=pedagogia) e role a página para mapear!');
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
          // Fallback script injection if content script was dormant
          chrome.scripting.executeScript({
            target: { tabId: fbTab.id },
            func: extractGroupsFromDOM
          }, (results) => {
            if (results && results[0] && results[0].result && results[0].result.length > 0) {
              saveAndRenderGroups(results[0].result);
              alert(`✅ ${results[0].result.length} grupos foram mapeados com sucesso!`);
            } else {
              alert('Role um pouco a página de busca do Facebook para que os grupos apareçam na tela, depois clique em mapear novamente.');
            }
          });
        }
      });
    });
  });

  // Sync with AutoViral AI Platform
  btnSync.addEventListener('click', () => {
    btnSync.textContent = '⏳ Sincronizando com Plataforma...';
    btnSync.disabled = true;

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
            interval: selectedInterval,
            timestamp: new Date().toISOString()
          });
        }
      });

      setTimeout(() => {
        btnSync.textContent = '📡 Enviar Todos os Grupos para o Painel AutoViral';
        btnSync.disabled = false;
        if (platformTabFound) {
          alert(`✅ Sucesso! ${currentMappedGroups.length} grupos mapeados foram sincronizados com a aba aberta da plataforma AutoViral AI.`);
        } else {
          alert('ℹ️ Abra ou atualize a aba da plataforma AutoViral AI no seu navegador para ver os grupos no painel.');
        }
      }, 500);
    });
  });

  // Open platform button
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
        merged.unshift(ng);
      }
    });

    currentMappedGroups = merged;
    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ autoviral_mapped_groups: currentMappedGroups });
    }
    renderGroups(currentMappedGroups);
  }

  function renderGroups(groups) {
    groupsCountEl.textContent = `${groups.length} grupos`;
    if (groups.length === 0) {
      groupsContainer.style.display = 'none';
      return;
    }

    groupsContainer.style.display = 'block';
    groupsItems.innerHTML = '';
    groups.slice(0, 15).forEach(g => {
      const item = document.createElement('div');
      item.className = 'group-item';
      item.innerHTML = `
        <div>
          <div class="group-name" title="${g.name}">${g.name}</div>
          <div class="group-meta">${g.membersCount ? g.membersCount.toLocaleString('pt-BR') + ' membros' : 'Membros detectados'} • ${g.postsPerDay || '10+ posts/dia'}</div>
        </div>
        <span style="color: #10b981; font-size: 10px; font-weight: 800;">MAPEADO</span>
      `;
      groupsItems.appendChild(item);
    });
  }
});

function extractGroupsFromDOM() {
  const detected = [];
  const links = document.querySelectorAll('a[href*="/groups/"]');
  links.forEach(link => {
    const href = link.href || '';
    if (href.includes('/create') || href.includes('/feed') || href.includes('/joins')) return;
    const cleanUrl = href.split('?')[0];
    const text = (link.innerText || '').trim();
    if (text.length >= 3 && !text.includes('Participar') && !text.includes('Ver mais')) {
      const exists = detected.some(d => d.url === cleanUrl || d.name === text);
      if (!exists) {
        detected.push({
          id: 'fb-grp-' + Math.random().toString(36).substring(2, 9),
          name: text,
          url: cleanUrl,
          membersCount: 25000,
          postsPerDay: '10+ posts/dia',
          privacy: 'Público',
          mappedAt: new Date().toLocaleDateString('pt-BR'),
          dispatchCount: 0,
          status: 'ready'
        });
      }
    }
  });
  return detected;
}
