// AutoViral AI Chrome Extension - Popup Controller
document.addEventListener('DOMContentLoaded', () => {
  const fbStatusEl = document.getElementById('fb-status');
  const groupsCountEl = document.getElementById('groups-count');
  const btnScan = document.getElementById('btn-scan');
  const btnSync = document.getElementById('btn-sync');
  const groupsContainer = document.getElementById('groups-container');
  const groupsItems = document.getElementById('groups-items');
  const intervalBtns = document.querySelectorAll('.interval-btn');

  let selectedInterval = 300;
  let currentMappedGroups = [];

  // Interval selection
  intervalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      intervalBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedInterval = parseInt(btn.dataset.time || '300', 10);
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

  // Check active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || !tabs[0]) return;
    const tab = tabs[0];
    const url = tab.url || '';

    if (url.includes('facebook.com/groups')) {
      fbStatusEl.textContent = 'Grupo Aberto Detectado!';
      fbStatusEl.style.color = '#10b981';
    } else if (url.includes('facebook.com')) {
      fbStatusEl.textContent = 'Facebook Aberto';
      fbStatusEl.style.color = '#38bdf8';
    } else {
      fbStatusEl.textContent = 'Abra o Facebook';
      fbStatusEl.style.color = '#f59e0b';
    }
  });

  // Scan groups in current tab
  btnScan.addEventListener('click', () => {
    btnScan.textContent = '⏳ Escaneando Grupo(s)...';
    btnScan.disabled = true;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || !tabs[0]) {
        alert('Abra uma aba do Facebook com grupos para mapear.');
        btnScan.textContent = '🔍 Mapear Grupos Desta Aba FB';
        btnScan.disabled = false;
        return;
      }

      const activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, { action: 'AUTOVIRAL_MAP_GROUPS' }, (response) => {
        btnScan.textContent = '🔍 Mapear Grupos Desta Aba FB';
        btnScan.disabled = false;

        if (chrome.runtime.lastError || !response || !response.groups) {
          // If content script wasn't injected or failed, do fallback extraction or script execution
          chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            func: extractFacebookGroupDetails
          }, (results) => {
            if (results && results[0] && results[0].result) {
              const group = results[0].result;
              saveAndRenderGroups([group]);
            } else {
              alert('Não foi possível extrair dados desta página. Certifique-se de estar em um Grupo do Facebook (ex: facebook.com/groups/...).');
            }
          });
          return;
        }

        saveAndRenderGroups(response.groups);
      });
    });
  });

  // Sync with AutoViral AI Platform
  btnSync.addEventListener('click', () => {
    btnSync.textContent = '⏳ Sincronizando...';
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
          tab.title.includes('AutoViral')
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
        btnSync.textContent = '📡 Enviar Grupos para Plataforma AutoViral';
        btnSync.disabled = false;
        if (platformTabFound) {
          alert('✅ Sucesso! Grupos mapeados foram enviados para a aba aberta da plataforma AutoViral AI.');
        } else {
          alert('ℹ️ Abra a aba da plataforma AutoViral AI no navegador para sincronizar em tempo real, ou acesse a aba "Extensão Chrome & Mapeador FB" para ver os grupos.');
        }
      }, 600);
    });
  });

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
    groups.slice(0, 10).forEach(g => {
      const item = document.createElement('div');
      item.className = 'group-item';
      item.innerHTML = `
        <div>
          <div class="group-name" title="${g.name}">${g.name}</div>
          <div class="group-members">${g.membersCount ? g.membersCount.toLocaleString('pt-BR') + ' membros' : 'Membros detectados'} • ${g.privacy || 'Público'}</div>
        </div>
        <span style="color: #10b981; font-size: 10px; font-weight: 700;">OK</span>
      `;
      groupsItems.appendChild(item);
    });
  }
});

// Function injected into Facebook tab if content script isn't responsive
function extractFacebookGroupDetails() {
  try {
    const titleEl = document.querySelector('h1') || document.querySelector('title');
    const name = titleEl ? titleEl.innerText.replace(' | Facebook', '').trim() : document.title;
    const url = window.location.href.split('?')[0];

    // Try finding members count in text
    let membersCount = 18500;
    const allText = document.body.innerText;
    const memberMatch = allText.match(/([0-9.,]+)\s*(mil|k)?\s*membros/i);
    if (memberMatch) {
      let num = parseFloat(memberMatch[1].replace('.', '').replace(',', '.'));
      if (memberMatch[2] && (memberMatch[2].toLowerCase() === 'mil' || memberMatch[2].toLowerCase() === 'k')) {
        num = num * 1000;
      }
      membersCount = Math.round(num);
    }

    return {
      id: 'fb-grp-' + Math.random().toString(36).substring(2, 9),
      name: name || 'Grupo do Facebook',
      url: url,
      membersCount: membersCount,
      privacy: allText.includes('Privado') ? 'Privado' : 'Público',
      mappedAt: new Date().toLocaleDateString('pt-BR'),
      niche: name.toLowerCase().includes('autista') || name.toLowerCase().includes('tea') || name.toLowerCase().includes('mãe') ? 'Mães & Autismo Infantil' : 'Educação & Vendas',
      dispatchCount: 0,
      status: 'ready'
    };
  } catch (e) {
    return null;
  }
}
