// AutoViral AI Chrome Extension - Content Script V1.5.6
// Runs on Facebook, YouTube, Instagram, Pinterest and AutoViral AI Web Platform

(function () {
  if (window.__AUTOVIRAL_CONTENT_SCRIPT_INITIALIZED__) {
    return;
  }
  window.__AUTOVIRAL_CONTENT_SCRIPT_INITIALIZED__ = true;

  const currentHost = window.location.hostname;
  const isFacebook = currentHost.includes('facebook.com');
  const isYouTube = currentHost.includes('youtube.com');
  const isAutoViral = currentHost.includes('localhost') ||
                      currentHost.includes('ais-') ||
                      currentHost.includes('run.app') ||
                      currentHost.includes('robo-trafego.vercel.app') ||
                      document.title.includes('AutoViral');

  // Shared helper to make any floating AutoViral popup draggable, minimizable, and closable
  function makeWidgetInteractive(badge, opts) {
    const {
      headerEl,
      bodyEl,
      minBtn,
      closeBtn,
      storageKey,
      defaultRight = '24px',
      defaultBottom = '24px',
      expandedWidth = '276px'
    } = opts;

    badge.style.position = 'fixed';
    badge.style.zIndex = '9999999';

    try {
      const savedPos = localStorage.getItem(storageKey);
      if (savedPos) {
        const parsed = JSON.parse(savedPos);
        if (typeof parsed.left === 'number' && typeof parsed.top === 'number') {
          const maxLeft = Math.max(8, window.innerWidth - 290);
          const maxTop = Math.max(8, window.innerHeight - 60);
          badge.style.left = Math.min(Math.max(8, parsed.left), maxLeft) + 'px';
          badge.style.top = Math.min(Math.max(8, parsed.top), maxTop) + 'px';
          badge.style.right = 'auto';
          badge.style.bottom = 'auto';
        } else {
          badge.style.right = defaultRight;
          badge.style.bottom = defaultBottom;
        }
      } else {
        badge.style.right = defaultRight;
        badge.style.bottom = defaultBottom;
      }
    } catch (e) {
      badge.style.right = defaultRight;
      badge.style.bottom = defaultBottom;
    }

    if (headerEl) {
      headerEl.style.cursor = 'move';
      headerEl.style.userSelect = 'none';
      let isDragging = false;
      let startX = 0;
      let startY = 0;
      let originLeft = 0;
      let originTop = 0;

      const onMouseDown = (e) => {
        if (e.target && e.target.closest('button')) return;
        isDragging = true;
        const rect = badge.getBoundingClientRect();
        originLeft = rect.left;
        originTop = rect.top;
        startX = e.clientX;
        startY = e.clientY;
        badge.style.left = originLeft + 'px';
        badge.style.top = originTop + 'px';
        badge.style.right = 'auto';
        badge.style.bottom = 'auto';
        e.preventDefault();
      };

      const onMouseMove = (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const nextLeft = Math.min(Math.max(8, originLeft + dx), Math.max(8, window.innerWidth - badge.offsetWidth - 8));
        const nextTop = Math.min(Math.max(8, originTop + dy), Math.max(8, window.innerHeight - 44));
        badge.style.left = nextLeft + 'px';
        badge.style.top = nextTop + 'px';
      };

      const onMouseUp = () => {
        if (!isDragging) return;
        isDragging = false;
        try {
          const rect = badge.getBoundingClientRect();
          localStorage.setItem(storageKey, JSON.stringify({ left: rect.left, top: rect.top }));
        } catch (e) {}
      };

      headerEl.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }

    if (minBtn && bodyEl) {
      let minimized = false;
      minBtn.onclick = (e) => {
        e.stopPropagation();
        minimized = !minimized;
        if (minimized) {
          bodyEl.style.display = 'none';
          badge.style.width = 'auto';
          badge.style.minWidth = '185px';
          minBtn.textContent = '▢';
          minBtn.title = 'Restaurar janela';
        } else {
          bodyEl.style.display = 'flex';
          badge.style.width = expandedWidth;
          badge.style.minWidth = expandedWidth;
          minBtn.textContent = '–';
          minBtn.title = 'Minimizar janela';
        }
      };
    }

    if (closeBtn) {
      closeBtn.onclick = (e) => {
        e.stopPropagation();
        badge.style.display = 'none';
      };
    }
  }

  // =========================================================================
  // 1. FACEBOOK AUTO-SCROLL MAPPER & FLOATING WIDGET
  // =========================================================================
  if (isFacebook) {
    console.log('[AutoViral AI] Conectado ao Facebook. Auto-Scroll Mapeador ATIVO.');

    let localMappedGroups = [];
    let isWidgetVisible = true;

    function sanitizeGroupName(rawName) {
      return (rawName || '')
        .replace(/\u00a0/g, ' ')
        .replace(/^(não\s+lida\s*|unread\s*)+(aproveite\s+sua\s+participação\s+no\s+grupo\s*|enjoy\s+your\s+membership\s+in\s*)?/i, '')
        .replace(/^(foto\s+do\s+perfil\s+de|foto\s+da\s+capa\s+de|profile\s+picture\s+of|cover\s+photo\s+of)\s+/i, '')
        .replace(/\s+/g, ' ')
        .trim();
    }

    // Load previously stored groups from chrome.storage
    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['autoviral_mapped_groups'], (res) => {
        if (res.autoviral_mapped_groups && Array.isArray(res.autoviral_mapped_groups)) {
          localMappedGroups = res.autoviral_mapped_groups.map(g => ({
            ...g,
            name: sanitizeGroupName(g.name) || g.name
          }));
          chrome.storage.local.set({ autoviral_mapped_groups: localMappedGroups });
          updateFloatingBadge();
        }
      });
    }

    // Extract current Facebook search query from URL or input
    function getFbCurrentSearchQuery() {
      try {
        const url = new URL(window.location.href);
        const q = url.searchParams.get('q');
        if (q) return decodeURIComponent(q).trim();
      } catch (e) {}
      const searchInput = document.querySelector('input[type="search"], input[aria-label*="Pesquisar"], input[aria-label*="Search"], input[placeholder*="Pesquisar"], input[placeholder*="Search"]');
      if (searchInput && searchInput.value) return searchInput.value.trim();
      return 'grupos';
    }

    // Derive clean folder slug from search query
    function deriveFolderFromQuery(q) {
      const lower = (q || '').toLowerCase();
      if (!lower) return 'geral';
      if (lower.includes('pedagog') || lower.includes('psico') || lower.includes('autis') || lower.includes('tea') || lower.includes('tdah')) return 'psicopedagogia';
      if (lower.includes('renda') || lower.includes('dinheiro') || lower.includes('milha') || lower.includes('afiliad') || lower.includes('ecom')) return 'renda_extra';
      if (lower.includes('curitiba')) return 'curitiba';
      return lower.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 32) || 'geral';
    }

    // Function to parse all group cards currently visible in the DOM
    function scanVisibleGroups() {
      const detected = [];
      const currentQuery = getFbCurrentSearchQuery();
      const currentFolder = deriveFolderFromQuery(currentQuery);

      const BAD_LABELS = new Set([
        'participar', 'participar do grupo', 'entrar', 'entrar no grupo',
        'visitar', 'ver grupo', 'ver mais', 'grupos', 'seu feed', 'descobrir',
        'criar novo grupo', 'join', 'join group', 'visit'
      ]);

      // Check all anchor links that lead to groups
      const links = document.querySelectorAll('a[href*="/groups/"]');
      links.forEach(link => {
        const href = link.getAttribute('href') || link.href || '';
        // Skip navigation, create, and generic group directory links
        if (
          href.includes('/groups/create') ||
          href.includes('/groups/feed') ||
          href.includes('/groups/discover') ||
          href.includes('/groups/joins') ||
          href.includes('/groups/categories') ||
          href.includes('/groups/?') ||
          /\/groups\/?$/.test(href.split('?')[0])
        ) return;

        // Normalize canonical URL: https://www.facebook.com/groups/<slug>
        const rawPath = href.split('?')[0].split('#')[0];
        const afterGroups = rawPath.split('/groups/')[1];
        if (!afterGroups) return;
        const groupSlug = afterGroups.split('/')[0].trim();
        if (!groupSlug || groupSlug.length < 2) return;
        if (['feed', 'discover', 'joins', 'create', 'categories', 'search', 'notifications'].includes(groupSlug.toLowerCase())) return;

        const cleanUrl = `https://www.facebook.com/groups/${groupSlug}`;

        // Traverse up to find container card
        const cardContainer = link.closest('div[role="article"]') ||
                              link.closest('div[role="listitem"]') ||
                              link.closest('div[role="feed"] > div') ||
                              link.closest('.x1yztbdb') ||
                              link.parentElement?.parentElement?.parentElement?.parentElement;

        const rawCardText = (cardContainer ? cardContainer.innerText : (link.innerText || '')).replace(/\u00a0/g, ' ');
        const linkAria = sanitizeGroupName(link.getAttribute('aria-label') || '');
        const rawLinkLines = (link.innerText || '')
          .replace(/\u00a0/g, ' ')
          .split('\n')
          .map(s => sanitizeGroupName(s))
          .filter(s => s.length >= 3 && !BAD_LABELS.has(s.toLowerCase()) && !/^(público|privado)\s*·/i.test(s));

        // Prefer explicit text anchor or heading in cardContainer over thumbnail aria-label
        let nameCandidate = rawLinkLines[0] || '';
        if (!nameCandidate && cardContainer) {
          const cardTextAnchors = Array.from(cardContainer.querySelectorAll(`a[href*="/groups/${groupSlug}"]`));
          for (const aEl of cardTextAnchors) {
            const txt = sanitizeGroupName((aEl.innerText || '').split('\n')[0]);
            if (txt && txt.length >= 3 && !BAD_LABELS.has(txt.toLowerCase())) {
              nameCandidate = txt;
              break;
            }
          }
        }
        if (!nameCandidate && linkAria && !BAD_LABELS.has(linkAria.toLowerCase())) {
          nameCandidate = linkAria;
        }
        if (!nameCandidate && cardContainer) {
          const cardLines = rawCardText
            .split('\n')
            .map(s => sanitizeGroupName(s))
            .filter(s =>
              s.length >= 3 &&
              !BAD_LABELS.has(s.toLowerCase()) &&
              !/^(público|public|privado|private)(\s*·|$)/i.test(s) &&
              !/^\d[\d.,\s]*(mil|k|mi|m)?\s*(membros?|members?)/i.test(s) &&
              !/posts?\s*(por|ao|a|per)\s*(dia|day)/i.test(s)
            );
          if (cardLines.length > 0) {
            nameCandidate = cardLines[0];
          }
        }

        // Clean trailing ellipsis or metadata
        nameCandidate = sanitizeGroupName(nameCandidate);

        if (nameCandidate.length >= 3 && !BAD_LABELS.has(nameCandidate.toLowerCase())) {
          let membersCount = 15000;
          let postsPerDay = '10+ posts/dia';
          let isPublic = true;

          const memberMatch = rawCardText.match(/([0-9]+(?:[.,][0-9]+)*)\s*(mil|k|mi|m)?\s*(membros?|members?)/i);
          if (memberMatch) {
            let numStr = memberMatch[1];
            const suffix = (memberMatch[2] || '').toLowerCase();
            if (suffix === 'mil' || suffix === 'k') {
              numStr = numStr.replace(',', '.');
              membersCount = Math.round(parseFloat(numStr) * 1000);
            } else if (suffix === 'mi' || suffix === 'm') {
              numStr = numStr.replace(',', '.');
              membersCount = Math.round(parseFloat(numStr) * 1000000);
            } else {
              membersCount = Math.round(parseFloat(numStr.replace(/[.,](?=\d{3}(?:[^\d]|$))/g, '').replace(',', '.')));
            }
          }

          const postsMatch = rawCardText.match(/([0-9]+(\+)?\s*(post|posts|publicação|publicações)\s*(por|ao|a|per)\s*(dia|day|semana|week))/i);
          if (postsMatch) {
            postsPerDay = postsMatch[0];
          }

          if (/\b(privado|private)\b/i.test(rawCardText)) {
            isPublic = false;
          }

          const alreadyAdded = detected.some(g => g.url === cleanUrl);
          if (!alreadyAdded) {
            detected.push({
              id: 'fb-grp-' + groupSlug.replace(/[^a-zA-Z0-9_-]/g, ''),
              name: nameCandidate,
              url: cleanUrl,
              membersCount: membersCount || 15000,
              postsPerDay: postsPerDay,
              privacy: isPublic ? 'Público' : 'Privado',
              niche: categorizeNiche(nameCandidate),
              searchTerm: currentQuery || currentFolder,
              searchFolder: currentFolder,
              mappedAt: new Date().toLocaleDateString('pt-BR'),
              dispatchCount: 0,
              status: 'ready'
            });
          }
        }
      });

      // Merge with stored groups (and replace dirty "Foto do perfil de ..." names if clean name is found)
      let hasNew = false;
      detected.forEach(g => {
        const existingIdx = localMappedGroups.findIndex(eg => eg.url === g.url || eg.id === g.id);
        if (existingIdx === -1) {
          localMappedGroups.unshift(g);
          hasNew = true;
        } else {
          const oldName = localMappedGroups[existingIdx].name || '';
          const cleanedOld = sanitizeGroupName(oldName);
          if (oldName !== cleanedOld || (g.name.length > cleanedOld.length && !g.name.endsWith('...'))) {
            localMappedGroups[existingIdx] = {
              ...localMappedGroups[existingIdx],
              name: g.name.endsWith('...') ? cleanedOld : g.name,
              searchFolder: g.searchFolder || localMappedGroups[existingIdx].searchFolder,
              searchTerm: g.searchTerm || localMappedGroups[existingIdx].searchTerm
            };
            hasNew = true;
          }
        }
      });

      if (hasNew && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ autoviral_mapped_groups: localMappedGroups });
        updateFloatingBadge();
      }

      return detected;
    }

    function categorizeNiche(title) {
      const lower = title.toLowerCase();
      if (
        lower.includes('renda') ||
        lower.includes('dinheiro') ||
        lower.includes('ganhar') ||
        lower.includes('trabalho') ||
        lower.includes('afiliad') ||
        lower.includes('marketing') ||
        lower.includes('celular') ||
        lower.includes('home office') ||
        lower.includes('loja') ||
        lower.includes('oportunidade') ||
        lower.includes('venda')
      ) {
        return 'Renda Extra & Oportunidades';
      }
      if (lower.includes('pedagog') || lower.includes('professor') || lower.includes('estágio') || lower.includes('escola')) {
        return 'Pedagogia & Educação';
      }
      if (lower.includes('autista') || lower.includes('autismo') || lower.includes('tea') || lower.includes('atípica')) {
        return 'Autismo & Mães Atípicas';
      }
      if (lower.includes('desapego') || lower.includes('mãe') || lower.includes('maternidade')) {
        return 'Mães & Família';
      }
      if (lower.includes('roupa') || lower.includes('moda') || lower.includes('atacado')) {
        return 'Moda & Atacado';
      }
      return 'Geral & Comunidades';
    }

    function isGroupDirectoryOrSearchPage() {
      const p = (window.location.pathname || '').toLowerCase();
      return (
        p.includes('/search') ||
        p.includes('/groups/discover') ||
        p.includes('/groups/joins') ||
        p.includes('/groups/feed') ||
        p === '/groups/' ||
        p === '/groups'
      );
    }

    // Auto-Scroll Listener: Scan whenever user scrolls down on search/directory pages
    let scrollTimeout = null;
    window.addEventListener('scroll', () => {
      if (!isGroupDirectoryOrSearchPage()) return;
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        scanVisibleGroups();
      }, 500);
    }, { passive: true });

    // Debounced MutationObserver ONLY on search/directory pages (never hog main thread during group posting)
    let mutScanTimeout = null;
    const observer = new MutationObserver(() => {
      if (!isGroupDirectoryOrSearchPage()) return;
      if (mutScanTimeout) clearTimeout(mutScanTimeout);
      mutScanTimeout = setTimeout(() => {
        scanVisibleGroups();
      }, 750);
    });
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    }

    // Initial scan (only on search/directory pages)
    if (isGroupDirectoryOrSearchPage()) {
      setTimeout(scanVisibleGroups, 1200);
    }

    // Create Floating AutoViral Widget on Facebook screen
    function createFloatingWidget() {
      if (document.getElementById('autoviral-floating-badge')) return;

      const badge = document.createElement('div');
      badge.id = 'autoviral-floating-badge';
      badge.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9999999;
        background: linear-gradient(135deg, #090d16 0%, #0f172a 100%);
        border: 2px solid #10b981;
        border-radius: 16px;
        padding: 10px 14px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.8), 0 0 15px rgba(16, 185, 129, 0.3);
        color: #f8fafc;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 276px;
      `;

      badge.innerHTML = `
        <div id="autoviral-fb-header" style="display: flex; align-items: center; justify-content: space-between; gap: 6px; padding-bottom: 4px; border-bottom: 1px solid #1e293b;">
          <div style="display: flex; align-items: center; gap: 6px; font-weight: 800; color: #10b981; font-size: 11px;">
            <span style="color: #64748b; font-size: 11px;">⋮⋮</span>
            <span>🚀 AutoViral AI</span>
            <span style="background: #064e3b; color: #34d399; font-size: 9px; padding: 1px 6px; border-radius: 999px; font-weight: 600;">FB</span>
          </div>
          <div style="display: flex; align-items: center; gap: 4px;">
            <button id="autoviral-badge-min" title="Minimizar" style="background: #1e293b; border: 1px solid #334155; color: #cbd5e1; border-radius: 6px; width: 22px; height: 22px; cursor: pointer; font-size: 12px; font-weight: 800; line-height: 1;">–</button>
            <button id="autoviral-badge-close" title="Fechar" style="background: #1e293b; border: 1px solid #334155; color: #f87171; border-radius: 6px; width: 22px; height: 22px; cursor: pointer; font-size: 11px; font-weight: 800; line-height: 1;">✕</button>
          </div>
        </div>
        <div id="autoviral-fb-body" style="display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="color: #cbd5e1;">Grupos Mapeados nesta tela:</span>
            <strong id="autoviral-badge-count" style="color: #fbbf24; font-size: 13px; font-weight: 900;">0</strong>
          </div>
          <div id="autoviral-badge-hint" style="font-size: 10px; color: #94a3b8; line-height: 1.3;">
            Role a página para baixo para mapear mais grupos automaticamente!
          </div>
          <button id="autoviral-badge-sync" style="
            background: #10b981;
            color: #022c22;
            border: none;
            border-radius: 8px;
            padding: 8px 10px;
            font-weight: 700;
            font-size: 11px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            transition: background 0.2s;
          ">
            📡 Sincronizar com Painel AutoViral
          </button>
        </div>
      `;

      document.body.appendChild(badge);

      makeWidgetInteractive(badge, {
        headerEl: document.getElementById('autoviral-fb-header'),
        bodyEl: document.getElementById('autoviral-fb-body'),
        minBtn: document.getElementById('autoviral-badge-min'),
        closeBtn: document.getElementById('autoviral-badge-close'),
        storageKey: 'autoviral_fb_widget_pos',
        expandedWidth: '276px'
      });

      document.getElementById('autoviral-badge-close').onclick = () => {
        badge.style.display = 'none';
        isWidgetVisible = false;
      };

      document.getElementById('autoviral-badge-sync').onclick = () => {
        scanVisibleGroups();
        const count = localMappedGroups.length;
        const currentQuery = getFbCurrentSearchQuery();
        const currentFolder = deriveFolderFromQuery(currentQuery);
        const hintEl = document.getElementById('autoviral-badge-hint');

        // 1. Send via BroadcastChannel
        try {
          const bc = new BroadcastChannel('autoviral_bridge_channel');
          bc.postMessage({
            action: 'AUTOVIRAL_IMPORT_GROUPS_FROM_EXTENSION',
            groups: localMappedGroups,
            searchFolder: currentFolder,
            searchQuery: currentQuery,
            timestamp: new Date().toISOString()
          });
          setTimeout(() => bc.close(), 1000);
        } catch (e) {}

        // 2. Window postMessage fallback
        window.postMessage({
          type: 'AUTOVIRAL_IMPORT_GROUPS_FROM_EXTENSION',
          groups: localMappedGroups,
          searchFolder: currentFolder,
          searchQuery: currentQuery,
          timestamp: new Date().toISOString()
        }, '*');

        // 3. Extension message to background relay
        if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
          chrome.runtime.sendMessage({
            action: 'AUTOVIRAL_SYNC_WITH_PLATFORM',
            groups: localMappedGroups,
            searchFolder: currentFolder,
            searchQuery: currentQuery
          }, () => {
            void chrome.runtime.lastError;
            if (hintEl) {
              hintEl.textContent = `✅ ${count} grupos enviados da pasta "${currentQuery || currentFolder}"!`;
              hintEl.style.color = '#34d399';
            }
          });
        } else if (hintEl) {
          hintEl.textContent = `✅ ${count} grupos sincronizados!`;
          hintEl.style.color = '#34d399';
        }
      };
    }

    function updateFloatingBadge() {
      if (!isWidgetVisible) return;
      createFloatingWidget();
      const countEl = document.getElementById('autoviral-badge-count');
      if (countEl) {
        countEl.textContent = `${localMappedGroups.length} grupos`;
      }
    }

    // =====================================================================
    // 1B. REAL GROUP AUTO-JOIN + AUTO-POST ASSISTANT (/groups/...)
    // =====================================================================
    function getCurrentGroupSlug() {
      const m = window.location.pathname.match(/\/groups\/([^\/?#]+)/i);
      return m ? m[1].toLowerCase() : '';
    }

    function isAlreadyGroupMember() {
      try {
        if (findComposerTrigger()) return true;
        const btns = Array.from(document.querySelectorAll('div[role="button"], button, a[role="button"]'));
        for (const el of btns) {
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0 || rect.top > 720) continue;
          const txt = ((el.innerText || el.getAttribute('aria-label') || '') + '').trim().toLowerCase();
          if (
            txt === 'entrou' ||
            txt === 'joined' ||
            txt === 'unido' ||
            txt === 'participando' ||
            txt.startsWith('entrou ') ||
            txt.startsWith('joined ') ||
            txt.startsWith('unido ')
          ) {
            return true;
          }
        }
      } catch (e) {}
      return false;
    }

    function findJoinGroupButton() {
      try {
        if (isAlreadyGroupMember()) return null;
        const btns = Array.from(document.querySelectorAll('div[role="button"], button, a[role="button"]'));
        for (const el of btns) {
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0 || rect.top > 760) continue;
          const txt = ((el.innerText || el.getAttribute('aria-label') || '') + '').trim().toLowerCase();
          if (
            txt === 'participar do grupo' ||
            txt === 'join group' ||
            txt === 'entrar no grupo' ||
            txt === 'unirse al grupo' ||
            txt === 'solicitar unirse'
          ) {
            return el;
          }
        }
      } catch (e) {}
      return null;
    }

    function isMembershipPendingApproval() {
      try {
        if (isAlreadyGroupMember()) return false;
        const btns = Array.from(document.querySelectorAll('div[role="button"], button, a[role="button"]'));
        for (const el of btns) {
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0 || rect.top > 760) continue;
          const txt = ((el.innerText || el.getAttribute('aria-label') || '') + '').trim().toLowerCase();
          if (
            txt === 'cancelar solicitação' ||
            txt === 'cancelar solicitacao' ||
            txt === 'participação pendente' ||
            txt === 'cancelar solicitud' ||
            txt === 'solicitud enviada' ||
            txt === 'pendiente' ||
            txt === 'cancel request' ||
            txt === 'pending' ||
            txt === 'solicitação enviada'
          ) {
            return true;
          }
        }
      } catch (e) {}
      return false;
    }

    function findMembershipQuestionsDialog() {
      try {
        const dialogs = Array.from(document.querySelectorAll('div[role="dialog"]'));
        for (const dlg of dialogs) {
          const txt = (dlg.innerText || '').toLowerCase();
          if (
            txt.includes('responder às perguntas') ||
            txt.includes('perguntas de participação') ||
            txt.includes('regras do grupo') ||
            txt.includes('responder preguntas') ||
            txt.includes('preguntas de membresía') ||
            txt.includes('preguntas de ingreso') ||
            txt.includes('reglas del grupo') ||
            txt.includes('answer questions') ||
            txt.includes('membership questions') ||
            txt.includes('group rules')
          ) {
            return dlg;
          }
        }
      } catch (e) {}
      return null;
    }

    function hasMembershipQuestionsModalOpen() {
      return Boolean(findMembershipQuestionsDialog());
    }

    function detectGroupLanguageFromContext(dlg) {
      const text = `${document.title || ''} ${(dlg && dlg.innerText) || ''}`.toLowerCase();
      if (/\b(oración|oraciones|petición|preguntas|reglas|enviar|estoy de acuerdo|acepto|biblia|fe|bendiciones|ayuda|dios|gracias)\b/i.test(text)) {
        return 'es';
      }
      if (/\b(perguntas|regras|participar|concordo|aceito|oração|orações|ajuda|grupo|obrigado|brasil)\b/i.test(text) || /[ãõç]/i.test(text)) {
        return 'pt';
      }
      return 'en';
    }

    function setNativeInputValue(el, val) {
      try {
        const proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
        const descriptor = Object.getOwnPropertyDescriptor(proto, 'value');
        if (descriptor && descriptor.set) {
          descriptor.set.call(el, val);
        } else {
          el.value = val;
        }
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      } catch (e) {
        try {
          el.value = val;
          el.dispatchEvent(new Event('input', { bubbles: true }));
        } catch (err) {}
      }
    }

    function tryAutoAnswerMembershipQuestionsAndSubmit(msgEl, onFinished) {
      const dlg = findMembershipQuestionsDialog();
      if (!dlg) {
        if (onFinished) onFinished(false);
        return;
      }
      if (msgEl) {
        msgEl.textContent = '📝 Perguntas/Regras do grupo detectadas — respondendo automaticamente como humano...';
        msgEl.style.color = '#38bdf8';
      }

      const lang = detectGroupLanguageFromContext(dlg);
      const groupTitleClean = (document.title || '').replace(/\s*\|\s*Facebook.*$/i, '').trim() || 'este grupo';

      // 1. Check agreement / group rules checkboxes
      const checkboxes = Array.from(dlg.querySelectorAll('input[type="checkbox"], [role="checkbox"]'));
      checkboxes.forEach((cb) => {
        try {
          const isChecked = cb.tagName === 'INPUT' ? Boolean(cb.checked) : cb.getAttribute('aria-checked') === 'true';
          if (!isChecked) {
            cb.scrollIntoView({ behavior: 'instant', block: 'center' });
            cb.click();
          }
        } catch (e) {}
      });

      // 2. Pick affirmative options in any radio groups
      const radioGroups = Array.from(dlg.querySelectorAll('[role="radiogroup"]'));
      radioGroups.forEach((rg) => {
        try {
          const radios = Array.from(rg.querySelectorAll('input[type="radio"], [role="radio"]'));
          if (radios.length === 0) return;
          const alreadyChecked = radios.some((r) => (r.tagName === 'INPUT' ? r.checked : r.getAttribute('aria-checked') === 'true'));
          if (alreadyChecked) return;
          const preferred =
            radios.find((r) => {
              const lbl = ((r.closest('label') && r.closest('label').innerText) || r.getAttribute('aria-label') || '').toLowerCase();
              return /\b(sim|sí|si|yes|aceito|acepto|concordo|de acuerdo|agree|claro)\b/i.test(lbl);
            }) || radios[0];
          preferred.click();
        } catch (e) {}
      });

      // 3. Fill textareas and text inputs with contextual human responses
      const textFields = Array.from(dlg.querySelectorAll('textarea, input[type="text"]')).filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 40 && r.height > 15 && !el.disabled && !el.readOnly;
      });

      textFields.forEach((field, idx) => {
        try {
          if ((field.value || '').trim().length > 2) return;
          const containerText = ((field.closest('div') && field.closest('div').parentElement && field.closest('div').parentElement.innerText) || '').toLowerCase();
          let answer = '';
          if (lang === 'es') {
            if (/regla|norma|respet|acuerdo|acepta/i.test(containerText)) {
              answer = 'Sí, acepto y me comprometo a respetar todas las reglas de la comunidad.';
            } else if (/por qu[eé]|motivo|raz[oó]n|inter[eé]s|unirte|orar|oraci[oó]n|fe/i.test(containerText)) {
              answer = `Quiero participar para compartir apoyo, aprendizaje y aportar contenido útil con respeto en ${groupTitleClean}.`;
            } else if (/de d[oó]nde|pa[ií]s|ciudad/i.test(containerText)) {
              answer = 'América Latina / España, con muchas ganas de participar.';
            } else {
              answer = idx === 0
                ? 'Con mucho respeto deseo unirme para aprender y compartir recursos útiles con la comunidad.'
                : 'Sí, acepto las normas del grupo y agradezco la oportunidad de participar.';
            }
          } else if (lang === 'pt') {
            if (/regra|norma|respeit|acordo|aceita|concordo/i.test(containerText)) {
              answer = 'Sim, concordo com todas as regras do grupo e vou respeitar a comunidade.';
            } else if (/por que|motivo|objetivo|interesse|entrar/i.test(containerText)) {
              answer = `Quero participar para trocar experiências, aprender e compartilhar conteúdos úteis em ${groupTitleClean}.`;
            } else {
              answer = idx === 0
                ? 'Tenho muito interesse no tema do grupo e quero contribuir com respeito.'
                : 'Sim, aceito as regras da comunidade e agradeço pela aprovação!';
            }
          } else {
            if (/rule|agree|respect/i.test(containerText)) {
              answer = 'Yes, I agree to follow all group rules and contribute respectfully.';
            } else {
              answer = idx === 0
                ? `Looking forward to learning, connecting, and sharing helpful resources in ${groupTitleClean}.`
                : 'Yes, I understand and accept the community guidelines. Thank you!';
            }
          }
          field.focus();
          setNativeInputValue(field, answer);
        } catch (e) {}
      });

      // 4. Wait briefly for React validation and click Enviar / Submit
      setTimeout(() => {
        const freshDlg = findMembershipQuestionsDialog();
        if (!freshDlg) {
          if (onFinished) onFinished(true);
          return;
        }
        const btns = Array.from(freshDlg.querySelectorAll('div[role="button"], button'));
        const submitBtn = btns.find((b) => {
          const r = b.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) return false;
          const disabled = b.getAttribute('aria-disabled') === 'true' || b.disabled;
          if (disabled) return false;
          const t = ((b.innerText || b.getAttribute('aria-label') || '') + '').trim().toLowerCase();
          return (
            t === 'enviar' ||
            t === 'enviar respuestas' ||
            t === 'enviar respostas' ||
            t === 'submit' ||
            t === 'continuar' ||
            t === 'continue'
          );
        });
        if (submitBtn) {
          submitBtn.scrollIntoView({ behavior: 'instant', block: 'center' });
          try { submitBtn.focus(); } catch (e) {}
          try { submitBtn.click(); } catch (e) {}
        }
        setTimeout(() => {
          const stillOpen = Boolean(findMembershipQuestionsDialog());
          if (onFinished) onFinished(!stillOpen || isMembershipPendingApproval() || isAlreadyGroupMember());
        }, 1800);
      }, 950);
    }

    function isFacebookRateLimited() {
      try {
        const dialogs = Array.from(document.querySelectorAll('div[role="dialog"]'));
        const dialogText = dialogs.map((d) => (d.innerText || '')).join(' ').toLowerCase();
        const bodyText = (document.body ? document.body.innerText : '').toLowerCase();
        const haystack = dialogText + ' ' + bodyText;
        return (
          haystack.includes('você não pode usar este recurso no momento') ||
          haystack.includes('voce nao pode usar este recurso no momento') ||
          haystack.includes('você está temporariamente bloqueado') ||
          haystack.includes('voce esta temporariamente bloqueado') ||
          haystack.includes('você foi bloqueado') ||
          haystack.includes('limitamos a frequência') ||
          haystack.includes('limitamos a frequencia') ||
          haystack.includes('no puedes usar esta función') ||
          haystack.includes('no puedes usar esta funcion') ||
          haystack.includes('bloqueado temporalmente') ||
          haystack.includes("you can't use this feature right now") ||
          haystack.includes("you're temporarily blocked") ||
          haystack.includes('you are temporarily blocked') ||
          haystack.includes('we limit how often you can post') ||
          haystack.includes('ação bloqueada') ||
          haystack.includes('action blocked') ||
          haystack.includes('temporarily blocked') ||
          haystack.includes('tente novamente mais tarde') ||
          haystack.includes('try again later')
        );
      } catch (e) {}
      return false;
    }

    function isFacebookGroupUnavailable() {
      try {
        if (findComposerTrigger() || findJoinGroupButton()) return false;
        const bodyText = (document.body ? document.body.innerText : '').toLowerCase();
        return (
          bodyText.includes('este conteúdo não está disponível no momento') ||
          bodyText.includes('este conteudo nao esta disponivel no momento') ||
          bodyText.includes('esta página não está disponível') ||
          bodyText.includes('esta pagina nao esta disponivel') ||
          bodyText.includes('conteúdo indisponível') ||
          bodyText.includes("this content isn't available right now") ||
          bodyText.includes("this page isn't available") ||
          bodyText.includes('the link you followed may be broken')
        );
      } catch (e) {}
      return false;
    }

    function findComposerTrigger() {
      const FORBIDDEN = ['anônim', 'anonim', 'anónim', 'anonym', 'enquete', 'poll', 'encuesta', 'sentimento', 'feeling', 'sentimiento', 'foto', 'photo', 'vídeo', 'video', 'ao vivo', 'live', 'en vivo', 'comentar', 'comment', 'responder', 'reply'];
      const hasForbidden = (s) => FORBIDDEN.some((w) => s.includes(w));

      const composerTriggers = Array.from(
        document.querySelectorAll('[data-pagelet="GroupInlineComposer"] div[role="button"], [data-pagelet="GroupInlineComposer"] span, [role="main"] div[role="button"], [role="main"] span, div[role="button"], span')
      );
      let best = null;
      let bestScore = -Infinity;
      for (const el of composerTriggers) {
        const rect = el.getBoundingClientRect();
        if (rect.width < 55 || rect.height < 14 || rect.height > 78) continue;
        if (rect.top < 0 || rect.top > window.innerHeight * 1.4) continue;
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
        const inInline = el.closest('[data-pagelet="GroupInlineComposer"]') ? 25000 : 0;
        const isSpanBoost = el.tagName === 'SPAN' ? 8000 : 0;
        const exactBoost = isExact ? 100000 : 40000;
        const area = Math.max(1, rect.width * rect.height);
        const score = exactBoost + inInline + isSpanBoost - area * 0.05;
        if (score > bestScore) {
          bestScore = score;
          best = el;
        }
      }
      if (!best) return null;
      const btn = best.closest('div[role="button"]');
      if (btn) {
        const br = btn.getBoundingClientRect();
        if (br.height <= 85 && br.width >= 55) return btn;
      }
      return best;
    }

    function copyTextReliably(text) {
      if (!text) return;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).catch(() => {});
        }
      } catch (e) {}
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      } catch (e) {}
    }

    function openComposerWithPreload(trigger, mode) {
      if (!trigger) return;
      if (findCreatePostTextbox()) return;
      const clickMode = mode === 'simple' ? 'simple' : 'full';
      try {
        trigger.scrollIntoView({ behavior: 'instant', block: 'center' });
      } catch (e) {}

      if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
        if (clickMode === 'simple') {
          // Primary attempt: clean MAIN-world click without chrome.debugger infobar shift
          chrome.runtime.sendMessage({ action: 'AUTOVIRAL_MAIN_OPEN_COMPOSER', mode: 'full' }, (res) => {
            if (chrome.runtime.lastError || !res || !res.ok || !res.result || !res.result.found) {
              try {
                trigger.focus();
                trigger.click();
              } catch (e) {}
            }
          });
          return;
        }

        // Escalated attempt: real hardware click via debugger with post-attach coordinate measurement
        chrome.runtime.sendMessage({ action: 'AUTOVIRAL_REAL_CLICK_COMPOSER' }, (realRes) => {
          if (!chrome.runtime.lastError && realRes && realRes.ok && realRes.result && realRes.result.found) {
            return;
          }
          chrome.runtime.sendMessage({ action: 'AUTOVIRAL_MAIN_OPEN_COMPOSER', mode: 'full' }, (res) => {
            if (chrome.runtime.lastError || !res || !res.ok || !res.result || !res.result.found) {
              try {
                trigger.focus();
                trigger.click();
              } catch (e) {}
            }
          });
        });
        return;
      }

      try {
        trigger.focus();
        trigger.click();
      } catch (e) {}
    }

    function clearStoredPendingGroupPost(slug) {
      try {
        chrome.storage.local.get(['autoviral_pending_fb_post', 'autoviral_pending_fb_posts_map'], (res) => {
          const postsMap = (res && res.autoviral_pending_fb_posts_map && typeof res.autoviral_pending_fb_posts_map === 'object')
            ? { ...res.autoviral_pending_fb_posts_map }
            : {};
          if (slug && postsMap[slug]) {
            delete postsMap[slug];
          }
          const updates = { autoviral_pending_fb_posts_map: postsMap };
          chrome.storage.local.set(updates);
          const active = res && res.autoviral_pending_fb_post;
          if (!active || !slug || (active.groupSlug || '').toLowerCase() === slug || (active.groupUrl || '').toLowerCase().includes(`/groups/${slug}`)) {
            chrome.storage.local.remove(['autoviral_pending_fb_post']);
          }
        });
      } catch (e) {}
    }

    function normalizePostTextForClickableLinks(rawText) {
      if (!rawText) return '';
      return String(rawText)
        .replace(/(https?:\/\/[^\s<>"']+)(\r?\n)/gi, '$1 $2')
        .replace(/(https?:\/\/[^\s<>"']+)$/i, '$1 ');
    }

    function insertTextIntoFacebookComposer(textbox, rawText) {
      if (!textbox || !rawText) return;
      const text = normalizePostTextForClickableLinks(rawText);

      const localFallbackInsert = () => {
        const target = findCreatePostTextbox(findCreatePostDialog()) || textbox;
        if (!target) return;
        const alreadyTxt = (target.innerText || target.textContent || '').trim();
        if (alreadyTxt.length >= Math.min(10, text.trim().length)) return;
        target.focus();
        try {
          const sel = window.getSelection();
          if (sel) {
            const range = document.createRange();
            range.selectNodeContents(target);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
          }
        } catch (e) {}
        try {
          const dt = new DataTransfer();
          dt.setData('text/plain', text);
          target.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
        } catch (e) {}
        setTimeout(() => {
          const fresh = findCreatePostTextbox(findCreatePostDialog()) || target;
          const current = (fresh.innerText || fresh.textContent || '').trim();
          if (!current || current.length < Math.min(5, text.trim().length)) {
            fresh.focus();
            try {
              document.execCommand('insertText', false, text);
            } catch (e) {}
            try {
              fresh.dispatchEvent(new InputEvent('input', { bubbles: true, data: text, inputType: 'insertText' }));
            } catch (e) {}
          }
        }, 280);
      };

      if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ action: 'AUTOVIRAL_REAL_INSERT_TEXT', text }, (realRes) => {
          const checkAfterReal = () => {
            const tbNow = findCreatePostTextbox(findCreatePostDialog()) || textbox;
            const txtNow = tbNow ? (tbNow.innerText || tbNow.textContent || '').trim() : '';
            if (txtNow.length >= Math.min(5, text.trim().length)) return;
            chrome.runtime.sendMessage({ action: 'AUTOVIRAL_MAIN_INSERT_TEXT', text }, (res) => {
              if (chrome.runtime.lastError || !res || !res.ok || !res.result || !res.result.ok) {
                localFallbackInsert();
              } else {
                setTimeout(() => {
                  const tbAfterMain = findCreatePostTextbox(findCreatePostDialog()) || textbox;
                  const txtAfterMain = tbAfterMain ? (tbAfterMain.innerText || tbAfterMain.textContent || '').trim() : '';
                  if (txtAfterMain.length < Math.min(5, text.trim().length)) {
                    localFallbackInsert();
                  }
                }, 360);
              }
            });
          };
          if (!chrome.runtime.lastError && realRes && realRes.ok && realRes.result && realRes.result.ok) {
            setTimeout(checkAfterReal, 220);
            return;
          }
          checkAfterReal();
        });
        return;
      }

      localFallbackInsert();
    }

    function hasAttachedPhotoInComposerDialog(dlg) {
      if (!dlg) return false;
      const hasAttachedImg = Array.from(dlg.querySelectorAll('img')).some((img) => {
        const r = img.getBoundingClientRect();
        const src = img.getAttribute('src') || '';
        return (
          (src.startsWith('blob:') || src.startsWith('data:image/') || src.includes('scontent') || src.includes('fbcdn')) &&
          r.width > 72 &&
          r.height > 72
        );
      });
      if (hasAttachedImg) return true;
      return Boolean(
        dlg.querySelector(
          '[aria-label="Editar"], [aria-label="Edit"], [aria-label*="Editar tudo" i], [aria-label*="Edit all" i], [aria-label*="Editar foto" i], [aria-label*="Edit photo" i]'
        )
      );
    }

    function attachImageToFacebookComposer(imageUrl, msgEl, onDone) {
      if (!imageUrl || !chrome || !chrome.runtime || !chrome.runtime.sendMessage) {
        if (onDone) onDone(false);
        return;
      }
      if (msgEl) {
        msgEl.textContent = '🖼️ Anexando imagem do produto em "Criar post"...';
        msgEl.style.color = '#38bdf8';
      }
      chrome.runtime.sendMessage({ action: 'AUTOVIRAL_FETCH_IMAGE_DATAURL', imageUrl }, (fetchRes) => {
        if (chrome.runtime.lastError || !fetchRes || !fetchRes.ok || !fetchRes.dataUrl) {
          if (onDone) onDone(false);
          return;
        }
        const tryRealClipboardPaste = () => {
          if (msgEl) {
            msgEl.textContent = '📋 Aplicando colagem automática (Ctrl+V) da foto em "Criar post"...';
            msgEl.style.color = '#38bdf8';
          }
          chrome.runtime.sendMessage({ action: 'AUTOVIRAL_REAL_PASTE_IMAGE', dataUrl: fetchRes.dataUrl }, (pasteRes) => {
            void chrome.runtime.lastError;
            if (pasteRes && pasteRes.ok && pasteRes.result && pasteRes.result.previewDetected) {
              if (onDone) onDone(true);
              return;
            }
            let pasteTries = 0;
            const waitPaste = setInterval(() => {
              pasteTries++;
              const dlg = findCreatePostDialog();
              if (hasAttachedPhotoInComposerDialog(dlg)) {
                clearInterval(waitPaste);
                if (onDone) onDone(true);
                return;
              }
              if (pasteTries >= 8) {
                clearInterval(waitPaste);
                if (onDone) onDone(Boolean(pasteRes && pasteRes.ok));
              }
            }, 350);
          });
        };

        const attemptAttach = (attemptNo) => {
          chrome.runtime.sendMessage({ action: 'AUTOVIRAL_MAIN_ATTACH_IMAGE', dataUrl: fetchRes.dataUrl }, (attRes) => {
            void chrome.runtime.lastError;
            let tries = 0;
            const waitPreview = setInterval(() => {
              tries++;
              const dlg = findCreatePostDialog();
              const hasAttachedPreview = hasAttachedPhotoInComposerDialog(dlg);
              if (hasAttachedPreview) {
                clearInterval(waitPreview);
                if (onDone) onDone(true);
                return;
              }
              if (tries >= 8) {
                clearInterval(waitPreview);
                if (attemptNo < 2) {
                  attemptAttach(attemptNo + 1);
                } else {
                  tryRealClipboardPaste();
                }
              }
            }, 350);
          });
        };
        attemptAttach(1);
      });
    }

    function dismissFacebookLinkPreviewCardIfPhotoPresent(onDone) {
      if (!chrome || !chrome.runtime || !chrome.runtime.sendMessage) {
        if (onDone) onDone();
        return;
      }
      chrome.runtime.sendMessage({ action: 'AUTOVIRAL_DISMISS_LINK_PREVIEW' }, () => {
        void chrome.runtime.lastError;
        if (onDone) onDone();
      });
    }

    function findCreatePostDialog() {
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
        const isComposerTitle =
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
        const hasPublishBtn = Array.from(d.querySelectorAll('div[role="button"], button')).some((b) => {
          const bt = ((b.innerText || b.getAttribute('aria-label') || '') + '').trim().toLowerCase();
          return bt === 'postar' || bt === 'publicar' || bt === 'post';
        });
        if (!tb && !isComposerTitle && !hasPublishBtn) return;

        let score = idx * 100 + (tb ? 500 : 0) + (hasPublishBtn ? 200 : 0);
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
    }

    function findCreatePostTextbox(dlg) {
      const scope = dlg || findCreatePostDialog() || document.querySelector('[data-pagelet="GroupInlineComposer"]');
      if (!scope) return null;
      const isDialog = Boolean(dlg || findCreatePostDialog());
      const boxes = Array.from(
        scope.querySelectorAll(
          'div[role="textbox"][contenteditable="true"], div[contenteditable="true"][data-lexical-editor="true"], div[contenteditable="true"][aria-placeholder], div[contenteditable="true"][aria-label]'
        )
      );
      return boxes.find((tb) => {
        if (!isDialog && (tb.closest('div[role="article"]') || tb.closest('[role="complementary"]'))) return false;
        const rect = tb.getBoundingClientRect();
        if (rect.width < 40 || rect.height < 20) return false;
        const label = ((tb.getAttribute('aria-label') || tb.getAttribute('aria-placeholder') || tb.getAttribute('placeholder') || '') + '').toLowerCase();
        if (label.includes('coment') || label.includes('comment') || label.includes('responder') || label.includes('reply') || label.includes('pesquis') || label.includes('search') || label.includes('buscar')) {
          return false;
        }
        return true;
      }) || null;
    }

    function setWaitingApprovalCookie(slug) {
      if (!slug) return;
      try {
        document.cookie = `autoviral_wait_${slug}=1; max-age=2592000; path=/; domain=.facebook.com; SameSite=Lax`;
      } catch (e) {}
    }

    function clearWaitingApprovalCookie(slug) {
      if (!slug) return;
      try {
        document.cookie = `autoviral_wait_${slug}=; max-age=0; path=/; domain=.facebook.com; SameSite=Lax`;
      } catch (e) {}
    }

    function saveWaitingApprovalEntry(pending, currentSlug) {
      if (!currentSlug) return;
      setWaitingApprovalCookie(currentSlug);
      try {
        if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
          chrome.runtime.sendMessage({
            action: 'AUTOVIRAL_SAVE_WAITING_APPROVAL',
            item: {
              logId: pending && pending.logId ? pending.logId : `glog-wait-${Date.now()}`,
              groupId: pending && pending.groupId ? pending.groupId : '',
              groupUrl: (pending && pending.groupUrl) || window.location.href,
              groupSlug: currentSlug,
              groupName: (pending && pending.groupName) || document.title || currentSlug,
              fullText: (pending && pending.fullText) || '',
              imageDataUrl: (pending && pending.imageDataUrl) || '',
              requestedAt: new Date().toISOString(),
              lastCheckedAt: new Date().toISOString()
            }
          }, () => { void chrome.runtime.lastError; });
        }
      } catch (e) {}
    }

    function findAnonymousPostDialog() {
      const dialogs = Array.from(document.querySelectorAll('div[role="dialog"]')).filter((d) => {
        const r = d.getBoundingClientRect();
        return r.width > 200 && r.height > 120;
      });
      return dialogs.find((d) => {
        const txt = (d.innerText || '').toLowerCase();
        return (
          txt.includes('post anônimo') ||
          txt.includes('post anonimo') ||
          txt.includes('publicação anônima') ||
          txt.includes('publicación anónima') ||
          txt.includes('publicacion anonima') ||
          txt.includes('anonymous post') ||
          txt.includes('criar post anônimo') ||
          txt.includes('criar post anonimo') ||
          txt.includes('crear publicación anónima') ||
          txt.includes('create anonymous post')
        );
      }) || null;
    }

    function clickButtonInDialogByTexts(dlg, labels) {
      if (!dlg || !Array.isArray(labels)) return false;
      const normLabels = labels.map((l) => l.toLowerCase());
      const btns = Array.from(dlg.querySelectorAll('div[role="button"], button, span[role="button"]'));
      for (const b of btns) {
        const r = b.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        const txt = ((b.innerText || b.getAttribute('aria-label') || '') + '').trim().toLowerCase();
        if (normLabels.includes(txt)) {
          try {
            b.focus();
            b.click();
            return true;
          } catch (e) {}
        }
      }
      return false;
    }

    function closeStuckCreatePostDialog(dlg) {
      try {
        if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
          chrome.runtime.sendMessage({ action: 'AUTOVIRAL_MAIN_DISMISS_STUCK_DIALOG' }, () => {
            void chrome.runtime.lastError;
          });
        }
        if (dlg) {
          const searchScope = dlg.parentElement || dlg;
          const closeBtn = searchScope.querySelector(
            'div[role="button"][aria-label="Fechar"], div[role="button"][aria-label="Close"], button[aria-label="Fechar"], button[aria-label="Close"]'
          );
          if (closeBtn) {
            closeBtn.click();
            return;
          }
          try {
            dlg.focus && dlg.focus();
            dlg.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, bubbles: true }));
          } catch (e) {}
        }
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, bubbles: true }));
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, bubbles: true }));
        setTimeout(() => {
          const stillOpen = findCreatePostDialog();
          if (stillOpen) {
            const sideEl = document.elementFromPoint(24, Math.round(window.innerHeight / 2));
            if (sideEl && !stillOpen.contains(sideEl)) {
              sideEl.click();
            }
          }
        }, 180);
      } catch (e) {}
    }

    function scheduleAutoCloseTab(msgEl, cancelAutoBtn, baseMsg, delaySeconds) {
      let keepOpen = false;
      let secsLeft = delaySeconds || 4;
      if (cancelAutoBtn) {
        cancelAutoBtn.style.display = 'block';
        cancelAutoBtn.textContent = '✋ Manter esta aba aberta';
        cancelAutoBtn.onclick = () => {
          keepOpen = true;
          cancelAutoBtn.style.display = 'none';
          if (msgEl) {
            msgEl.textContent = baseMsg + ' (Você já pode fechar esta aba quando quiser.)';
          }
        };
      }
      const tickClose = () => {
        if (keepOpen) return;
        if (secsLeft <= 0) {
          if (cancelAutoBtn) cancelAutoBtn.style.display = 'none';
          if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage({ action: 'AUTOVIRAL_CLOSE_CURRENT_TAB' }, () => { void chrome.runtime.lastError; });
          }
          return;
        }
        if (msgEl) {
          msgEl.textContent = `${baseMsg} Fechando aba em ${secsLeft}s...`;
        }
        secsLeft--;
        setTimeout(tickClose, 1000);
      };
      tickClose();
    }

    function findPublishButtonInDialog(dlg) {
      const scope = dlg || findCreatePostDialog() || document.querySelector('[data-pagelet="GroupInlineComposer"]');
      if (!scope) return null;
      const candidates = Array.from(scope.querySelectorAll('div[role="button"], button'));
      return candidates.find((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return false;
        const txt = ((el.innerText || el.getAttribute('aria-label') || '') + '').trim().toLowerCase();
        if (txt !== 'postar' && txt !== 'publicar' && txt !== 'post' && txt !== 'enviar' && txt !== 'submit') return false;
        const disabled = el.getAttribute('aria-disabled') === 'true' || el.disabled || el.getAttribute('tabindex') === '-1';
        return !disabled;
      });
    }

    function sendRealPostResultToPlatform(payload) {
      try {
        const bc = new BroadcastChannel('autoviral_bridge_channel');
        bc.postMessage({
          action: 'AUTOVIRAL_FB_POST_RESULT',
          ...payload,
          timestamp: new Date().toISOString()
        });
        setTimeout(() => bc.close(), 1000);
      } catch (e) {}

      if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({
          action: 'AUTOVIRAL_FB_POST_RESULT',
          ...payload,
          timestamp: new Date().toISOString()
        }, () => { void chrome.runtime.lastError; });
      }
    }

    function sendGroupMembershipResultToPlatform(payload) {
      try {
        const bc = new BroadcastChannel('autoviral_bridge_channel');
        bc.postMessage({
          action: 'AUTOVIRAL_GROUP_MEMBERSHIP_RESULT',
          ...payload,
          timestamp: new Date().toISOString()
        });
        setTimeout(() => bc.close(), 1000);
      } catch (e) {}

      if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({
          action: 'AUTOVIRAL_GROUP_MEMBERSHIP_RESULT',
          ...payload,
          timestamp: new Date().toISOString()
        }, () => { void chrome.runtime.lastError; });
      }
    }

    function startSubmissionMonitor(pending, currentSlug, msgEl, didAutoClickPublish, cancelAutoBtn) {
      let finished = false;
      let ticks = 0;
      let userClickedPublish = !!didAutoClickPublish;
      let sawDialogOpen = !!didAutoClickPublish || !!findCreatePostDialog();
      let dialogClosedStreak = 0;

      const attachPublishClickListener = () => {
        if (userClickedPublish) return;
        const dlg = findCreatePostDialog();
        if (!dlg) return;
        sawDialogOpen = true;
        const candidates = Array.from(dlg.querySelectorAll('div[role="button"], button'));
        candidates.forEach((btn) => {
          const bt = ((btn.innerText || btn.getAttribute('aria-label') || '') + '').trim().toLowerCase();
          if ((bt === 'postar' || bt === 'publicar' || bt === 'post' || bt === 'enviar' || bt === 'submit') && !btn.dataset.avHooked) {
            btn.dataset.avHooked = '1';
            btn.addEventListener('click', () => {
              userClickedPublish = true;
              if (msgEl) {
                msgEl.textContent = '🚀 Publicando no grupo... aguarde confirmação antes de fechar!';
                msgEl.style.color = '#34d399';
              }
            }, { once: true });
          }
        });
      };

      const checkInterval = setInterval(() => {
        if (finished) return;
        ticks++;
        attachPublishClickListener();
        const bodyTxt = (document.body ? document.body.innerText : '').toLowerCase();

        if (isFacebookRateLimited()) {
          finished = true;
          clearInterval(checkInterval);
          sendRealPostResultToPlatform({
            logId: pending.logId,
            groupId: pending.groupId,
            groupUrl: window.location.href,
            groupName: pending.groupName,
            approvalStatus: 'rate_limited',
            note: 'Facebook exibiu: Você não pode usar este recurso no momento'
          });
          if (msgEl) {
            msgEl.textContent = '🛡️ FREIO ANTI-BLOQUEIO: Facebook limitou ações agora! Robô pausado — aguarde 15–30 min antes de continuar.';
            msgEl.style.color = '#fb7185';
          }
          return;
        }

        if (
          bodyTxt.includes('aguardando aprovação de um administrador') ||
          bodyTxt.includes('pendente de aprovação do administrador') ||
          bodyTxt.includes('enviada para aprovação do administrador') ||
          bodyTxt.includes('sua publicação foi enviada') ||
          bodyTxt.includes('pendiente de aprobación del administrador') ||
          bodyTxt.includes('tu publicación fue enviada') ||
          bodyTxt.includes('en espera de aprobación') ||
          bodyTxt.includes('pending admin approval') ||
          bodyTxt.includes('sent for admin approval') ||
          bodyTxt.includes('waiting for admin approval') ||
          bodyTxt.includes('submitted for approval') ||
          bodyTxt.includes('your post is pending') ||
          bodyTxt.includes('thanks for your post') ||
          bodyTxt.includes('your post has been submitted')
        ) {
          finished = true;
          clearInterval(checkInterval);
          sendRealPostResultToPlatform({
            logId: pending.logId,
            groupId: pending.groupId,
            groupUrl: window.location.href,
            groupName: pending.groupName,
            approvalStatus: 'awaiting_admin'
          });
          clearStoredPendingGroupPost(currentSlug);
          if (msgEl) {
            msgEl.style.color = '#fbbf24';
          }
          if (pending.autoJoinAndPost !== false) {
            scheduleAutoCloseTab(msgEl, cancelAutoBtn, '⏳ Enviada p/ Aprovação do Admin e registrada!', 4);
          } else if (msgEl) {
            msgEl.textContent = '⏳ Aprovação Pendente do Admin registrada! Já pode fechar esta aba.';
          }
          return;
        }

        const activeDialog = findCreatePostDialog();
        if (activeDialog) {
          sawDialogOpen = true;
          dialogClosedStreak = 0;
          if (didAutoClickPublish && ticks === 4) {
            const stillEnabledPub = findPublishButtonInDialog(activeDialog);
            if (stillEnabledPub && chrome && chrome.runtime && chrome.runtime.sendMessage) {
              chrome.runtime.sendMessage({ action: 'AUTOVIRAL_REAL_CLICK_PUBLISH' }, () => {
                void chrome.runtime.lastError;
              });
            }
          }
        } else if (sawDialogOpen || userClickedPublish) {
          dialogClosedStreak++;
        }

        if (dialogClosedStreak >= 3) {
          if (userClickedPublish) {
            finished = true;
            clearInterval(checkInterval);
            sendRealPostResultToPlatform({
              logId: pending.logId,
              groupId: pending.groupId,
              groupUrl: window.location.href,
              groupName: pending.groupName,
              approvalStatus: 'published'
            });
            clearStoredPendingGroupPost(currentSlug);
            if (msgEl) {
              msgEl.style.color = '#34d399';
            }
            if (pending.autoJoinAndPost !== false) {
              scheduleAutoCloseTab(msgEl, cancelAutoBtn, '✅ POSTAGEM FEITA confirmada no Painel!', 4);
            } else if (msgEl) {
              msgEl.textContent = '✅ Publicação enviada e confirmada como POSTAGEM FEITA! Já pode fechar esta aba.';
            }
            return;
          } else if (sawDialogOpen && ticks >= 4) {
            finished = true;
            clearInterval(checkInterval);
            if (msgEl) {
              msgEl.textContent = '⚠️ Janela "Criar post" fechou sem clicar em Publicar. Clique em "Solicitar Entrada / Preencher Post Agora" para tentar de novo.';
              msgEl.style.color = '#fbbf24';
            }
            return;
          }
        }

        if (ticks >= 50) {
          finished = true;
          clearInterval(checkInterval);
        }
      }, 1000);
    }

    function executeAutoPostFlow(pending, currentSlug, msgEl, cancelAutoBtn, autoSubmit) {
      if (!pending || !pending.fullText) return;
      if (isFacebookRateLimited()) {
        sendRealPostResultToPlatform({
          logId: pending.logId,
          groupId: pending.groupId,
          groupUrl: window.location.href,
          groupName: pending.groupName,
          approvalStatus: 'rate_limited',
          note: 'Facebook exibiu: Você não pode usar este recurso no momento'
        });
        if (msgEl) {
          msgEl.textContent = '🛡️ FREIO ANTI-BLOQUEIO: Limite temporário detectado no Facebook! Aguarde 15–30 min antes de postar.';
          msgEl.style.color = '#fb7185';
        }
        return;
      }
      if (isFacebookGroupUnavailable()) {
        sendRealPostResultToPlatform({
          logId: pending.logId,
          groupId: pending.groupId,
          groupUrl: window.location.href,
          groupName: pending.groupName,
          approvalStatus: 'unavailable',
          note: 'Facebook exibiu: Este conteúdo não está disponível no momento'
        });
        clearStoredPendingGroupPost(currentSlug);
        if (msgEl) {
          msgEl.style.color = '#fb7185';
        }
        scheduleAutoCloseTab(msgEl, cancelAutoBtn, '🚫 Grupo indisponível/excluído (removido da fila)!', 3);
        return;
      }
      copyTextReliably(pending.fullText);

      let cancelled = false;
      if (cancelAutoBtn) {
        cancelAutoBtn.style.display = autoSubmit ? 'block' : 'none';
        cancelAutoBtn.textContent = '⏸️ Pausar Auto-Envio (Revisar antes de publicar)';
        cancelAutoBtn.onclick = () => {
          cancelled = true;
          cancelAutoBtn.style.display = 'none';
          if (msgEl) {
            msgEl.textContent = '⏸️ Auto-envio pausado! Revise o texto dentro de "Criar post" e clique em Publicar.';
            msgEl.style.color = '#38bdf8';
          }
        };
      }

      if (msgEl) {
        msgEl.textContent = '🤖 Abrindo janela "Criar post"... NÃO feche esta aba ainda!';
        msgEl.style.color = '#38bdf8';
      }

      try {
        if (window.scrollY > 250) window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (e) {}

      let triggerTries = 0;
      const waitTrigger = setInterval(() => {
        triggerTries++;
        if (triggerTries === 3) {
          try { window.scrollTo({ top: 140, behavior: 'smooth' }); } catch (e) {}
        } else if (triggerTries === 6) {
          try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) {}
        }
        if (isFacebookGroupUnavailable()) {
          clearInterval(waitTrigger);
          sendRealPostResultToPlatform({
            logId: pending.logId,
            groupId: pending.groupId,
            groupUrl: window.location.href,
            groupName: pending.groupName,
            approvalStatus: 'unavailable',
            note: 'Facebook exibiu: Este conteúdo não está disponível no momento'
          });
          clearStoredPendingGroupPost(currentSlug);
          clearWaitingApprovalCookie(currentSlug);
          if (msgEl) {
            msgEl.style.color = '#fb7185';
          }
          scheduleAutoCloseTab(msgEl, cancelAutoBtn, '🚫 Grupo indisponível/excluído (removido da fila)!', 3);
          return;
        }
        const trigger = findComposerTrigger();
        if (trigger || triggerTries >= 18) {
          clearInterval(waitTrigger);
          if (!trigger) {
            if (isFacebookGroupUnavailable()) {
              sendRealPostResultToPlatform({
                logId: pending.logId,
                groupId: pending.groupId,
                groupUrl: window.location.href,
                groupName: pending.groupName,
                approvalStatus: 'unavailable',
                note: 'Facebook exibiu: Este conteúdo não está disponível no momento'
              });
              clearStoredPendingGroupPost(currentSlug);
              if (msgEl) {
                msgEl.style.color = '#fb7185';
              }
              scheduleAutoCloseTab(msgEl, cancelAutoBtn, '🚫 Grupo indisponível/excluído (removido da fila)!', 3);
              return;
            }
            if (msgEl) {
              msgEl.style.color = '#fbbf24';
            }
            scheduleAutoCloseTab(msgEl, cancelAutoBtn, '⚠️ Caixa "Escreva algo..." não apareceu a tempo (texto copiado).', 4);
            return;
          }

          if (msgEl) {
            msgEl.textContent = '⏳ Aguardando Facebook estabilizar antes de abrir "Criar post"...';
            msgEl.style.color = '#38bdf8';
          }

          setTimeout(() => {
            const reloadKey = `av_skel_reload_${currentSlug}`;
            const targetTag = String(pending.logId || '1');
            let prevReloadTag = '';
            try {
              prevReloadTag = sessionStorage.getItem(reloadKey) || '';
            } catch (e) {}
            const initialMode = prevReloadTag === targetTag ? 'full' : 'simple';
            openComposerWithPreload(trigger, initialMode);
            if (msgEl) {
              msgEl.textContent = '⏳ Etapa 1/4: Abrindo janela "Criar post"... NÃO feche esta aba!';
              msgEl.style.color = '#38bdf8';
            }

            let boxTries = 0;
            let retriedDebuggerClick = false;
            let retriedSkeleton = false;
            let anonDialogCount = 0;
            let reopenPauseUntil = Date.now() + 900;
            const waitTextbox = setInterval(() => {
              if (Date.now() < reopenPauseUntil) return;
              boxTries++;

              // Intercept "Post anônimo" modal immediately!
              const anonDlg = findAnonymousPostDialog();
              if (anonDlg) {
                if (anonDialogCount === 0) {
                  anonDialogCount = 1;
                  if (msgEl) {
                    msgEl.textContent = '🛡️ Modal "Post anônimo" detectado — cancelando e clicando em "Escreva algo..."';
                    msgEl.style.color = '#fbbf24';
                  }
                  clickButtonInDialogByTexts(anonDlg, ['cancelar', 'cancel']);
                  reopenPauseUntil = Date.now() + 900;
                  setTimeout(() => {
                    const freshTrigger = findComposerTrigger();
                    if (freshTrigger) openComposerWithPreload(freshTrigger, 'simple');
                  }, 480);
                  return;
                } else if (anonDialogCount === 1) {
                  // Alternative flow if Facebook insists on Anonymous Post: proceed cleanly so tab NEVER gets stuck!
                  anonDialogCount = 2;
                  if (msgEl) {
                    msgEl.textContent = '🕶️ Fluxo alternativo: entrando por "Criar post anônimo" para postar e fechar aba!';
                    msgEl.style.color = '#38bdf8';
                  }
                  const clickedAnonCreate = clickButtonInDialogByTexts(anonDlg, [
                    'criar post anônimo',
                    'criar post anonimo',
                    'crear publicación anónima',
                    'crear publicacion anonima',
                    'hacer publicación anónima',
                    'create anonymous post'
                  ]);
                  if (!clickedAnonCreate) {
                    closeStuckCreatePostDialog(anonDlg);
                  }
                  reopenPauseUntil = Date.now() + 1000;
                  return;
                }
              }

              const dlg = findCreatePostDialog();
              const textbox = findCreatePostTextbox(dlg);
              if (textbox) {
                try {
                  sessionStorage.removeItem(reloadKey);
                  sessionStorage.removeItem(`av_skip_auto_modal_${currentSlug}`);
                } catch (e) {}
                clearInterval(waitTextbox);
                clearWaitingApprovalCookie(currentSlug);
                if (msgEl) {
                  msgEl.textContent = pending.imageDataUrl
                    ? '🖼️ Etapa 2/4: Anexando imagem da oferta antes do texto/link...'
                    : '🔗 Etapa 2/4: Caixa carregada! Inserindo copy e gerando Card com Imagem Clicável...';
                  msgEl.style.color = '#38bdf8';
                }
                setTimeout(() => {
                  const runTextAndPublish = (photoAttachedOk) => {
                    const currentDlg = findCreatePostDialog() || dlg;
                    const freshBox = findCreatePostTextbox(currentDlg) || textbox;
                    try {
                      freshBox.click();
                      freshBox.focus();
                    } catch (e) {}
                    if (msgEl) {
                      msgEl.textContent = pending.imageDataUrl
                        ? photoAttachedOk
                          ? '✍️ Etapa 2/4: Foto confirmada! Inserindo texto + link clicável...'
                          : '⚠️ Foto não entrou automático — inserindo texto + link e pausando p/ Ctrl+V...'
                        : '✍️ Etapa 2/4: Inserindo copy + link da Landing (gerando card clicável)...';
                      msgEl.style.color = pending.imageDataUrl && !photoAttachedOk ? '#fbbf24' : '#38bdf8';
                    }
                    insertTextIntoFacebookComposer(freshBox, pending.fullText);

                    const proceedToPublish = () => {
                      if (pending.imageDataUrl && !photoAttachedOk && !hasAttachedPhotoInComposerDialog(findCreatePostDialog() || dlg)) {
                        if (cancelAutoBtn) cancelAutoBtn.style.display = 'none';
                        if (msgEl) {
                          msgEl.textContent = '⚠️ A foto não anexou sozinha nesta janela — cole a foto (Ctrl+V) aqui antes de clicar em Postar!';
                          msgEl.style.color = '#fbbf24';
                        }
                        startSubmissionMonitor(pending, currentSlug, msgEl, false, cancelAutoBtn);
                        return;
                      }

                      if (!autoSubmit) {
                        if (msgEl) {
                          msgEl.textContent = pending.imageDataUrl
                            ? '✅ Imagem + Texto & link inseridos! Revise e clique em Publicar.'
                            : '✅ Texto + Card com Imagem Clicável carregados! Revise e clique em Publicar.';
                          msgEl.style.color = '#34d399';
                        }
                        startSubmissionMonitor(pending, currentSlug, msgEl, false, cancelAutoBtn);
                        return;
                      }

                      if (msgEl) {
                        msgEl.textContent = pending.imageDataUrl
                          ? '⏳ Etapa 3/4: Confirmando imagem, link clicável & botão Postar...'
                          : '⏳ Etapa 3/4: Confirmando Card Clicável da Landing & botão Publicar...';
                        msgEl.style.color = '#34d399';
                      }

                      const waitMsBeforePublish = pending.imageDataUrl ? 1900 : 3200;
                      setTimeout(() => {
                        if (cancelled) {
                          startSubmissionMonitor(pending, currentSlug, msgEl, false, cancelAutoBtn);
                          return;
                        }
                        if (pending.imageDataUrl) {
                          dismissFacebookLinkPreviewCardIfPhotoPresent();
                        }
                        let pubTries = 0;
                        let latePasteWaitUntil = 0;
                        let didLatePaste = false;
                        const waitPubBtn = setInterval(() => {
                          if (Date.now() < latePasteWaitUntil) return;
                          pubTries++;
                          if (cancelled) {
                            clearInterval(waitPubBtn);
                            return;
                          }
                          const activeDlg = findCreatePostDialog() || freshBox.closest('div[role="dialog"]');
                          const freshTb = (activeDlg && findCreatePostTextbox(activeDlg)) || freshBox;
                          const currentContent = (freshTb.innerText || freshTb.textContent || '').trim();
                          if (currentContent.length < 5) {
                            if (pubTries === 1 || pubTries === 3 || pubTries === 6) {
                              insertTextIntoFacebookComposer(freshTb, pending.fullText);
                            }
                            if (pubTries < 10) return;
                            clearInterval(waitPubBtn);
                            if (cancelAutoBtn) cancelAutoBtn.style.display = 'none';
                            copyTextReliably(pending.fullText);
                            if (msgEl) {
                              msgEl.textContent = '📋 Caixa não aceitou auto-colagem! Texto já copiado: aperte Ctrl+V acima e clique em Postar.';
                              msgEl.style.color = '#fbbf24';
                            }
                            startSubmissionMonitor(pending, currentSlug, msgEl, false, cancelAutoBtn);
                            return;
                          }
                          if (pending.imageDataUrl && !hasAttachedPhotoInComposerDialog(activeDlg)) {
                            if (!didLatePaste) {
                              didLatePaste = true;
                              latePasteWaitUntil = Date.now() + 3600;
                              attachImageToFacebookComposer(pending.imageDataUrl, msgEl, () => {
                                latePasteWaitUntil = 0;
                              });
                              return;
                            }
                            clearInterval(waitPubBtn);
                            if (cancelAutoBtn) cancelAutoBtn.style.display = 'none';
                            if (msgEl) {
                              msgEl.textContent = '⚠️ Foto não detectada na janela — cole a imagem (Ctrl+V) antes de clicar em Postar para não enviar sem foto!';
                              msgEl.style.color = '#fbbf24';
                            }
                            startSubmissionMonitor(pending, currentSlug, msgEl, false, cancelAutoBtn);
                            return;
                          }
                          const pubBtn = findPublishButtonInDialog(activeDlg);
                          if (pubBtn) {
                            clearInterval(waitPubBtn);
                            if (cancelAutoBtn) cancelAutoBtn.style.display = 'none';
                            if (msgEl) {
                              msgEl.textContent = '🚀 Etapa 4/4: Clicando em Publicar e confirmando no Facebook...';
                              msgEl.style.color = '#34d399';
                            }
                            if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
                              chrome.runtime.sendMessage({ action: 'AUTOVIRAL_MAIN_CLICK_PUBLISH' }, (pubRes) => {
                                if (!chrome.runtime.lastError && pubRes && pubRes.ok && pubRes.result && pubRes.result.clicked) {
                                  startSubmissionMonitor(pending, currentSlug, msgEl, true, cancelAutoBtn);
                                  return;
                                }
                                chrome.runtime.sendMessage({ action: 'AUTOVIRAL_REAL_CLICK_PUBLISH' }, (realPubRes) => {
                                  if (chrome.runtime.lastError || !realPubRes || !realPubRes.ok || !realPubRes.result || !realPubRes.result.clicked) {
                                    try {
                                      pubBtn.focus();
                                      pubBtn.click();
                                    } catch (e) {}
                                  }
                                  startSubmissionMonitor(pending, currentSlug, msgEl, true, cancelAutoBtn);
                                });
                              });
                            } else {
                              try {
                                pubBtn.focus();
                                pubBtn.click();
                              } catch (e) {}
                              startSubmissionMonitor(pending, currentSlug, msgEl, true, cancelAutoBtn);
                            }
                          } else if (pubTries >= 24) {
                            clearInterval(waitPubBtn);
                            if (cancelAutoBtn) cancelAutoBtn.style.display = 'none';
                            if (msgEl) {
                              msgEl.textContent = '✅ Conteúdo pronto! Clique no botão azul "Postar / Publicar" acima para finalizar.';
                              msgEl.style.color = '#38bdf8';
                            }
                            startSubmissionMonitor(pending, currentSlug, msgEl, false, cancelAutoBtn);
                          }
                        }, 450);
                      }, waitMsBeforePublish);
                    };

                    const continueAfterInsert = () => {
                      if (pending.imageDataUrl) {
                        dismissFacebookLinkPreviewCardIfPhotoPresent(() => {
                          setTimeout(() => dismissFacebookLinkPreviewCardIfPhotoPresent(proceedToPublish), 850);
                        });
                      } else {
                        // Clickable Image Card mode: DO NOT dismiss OG preview; let Facebook fetch the Landing Page og:image card!
                        proceedToPublish();
                      }
                    };

                    setTimeout(continueAfterInsert, 700);
                  };

                  if (pending.imageDataUrl) {
                    attachImageToFacebookComposer(pending.imageDataUrl, msgEl, (attachedOk) => {
                      setTimeout(() => runTextAndPublish(Boolean(attachedOk)), 450);
                    });
                  } else {
                    runTextAndPublish(true);
                  }
                }, 480);
              } else if (boxTries === 11 && !retriedDebuggerClick) {
                retriedDebuggerClick = true;
                if (!dlg) {
                  if (msgEl) {
                    msgEl.textContent = '🎯 Reforçando clique real em "Escreva algo..." para abrir "Criar post"...';
                    msgEl.style.color = '#38bdf8';
                  }
                  const retryTrigger = findComposerTrigger();
                  if (retryTrigger) openComposerWithPreload(retryTrigger, 'full');
                  reopenPauseUntil = Date.now() + 1100;
                }
              } else if (boxTries === 26 && !retriedSkeleton) {
                retriedSkeleton = true;
                if (msgEl) {
                  msgEl.textContent = '🔄 Facebook demorou em "Criar post". Fechando e tentando clique com pré-carregamento...';
                  msgEl.style.color = '#fbbf24';
                }
                closeStuckCreatePostDialog(dlg);
                reopenPauseUntil = Date.now() + 1800;
                setTimeout(() => {
                  const retryTrigger = findComposerTrigger();
                  if (retryTrigger) openComposerWithPreload(retryTrigger, 'full');
                }, 1100);
              } else if (boxTries === 42) {
                if (prevReloadTag !== targetTag) {
                  clearInterval(waitTextbox);
                  try {
                    sessionStorage.setItem(reloadKey, targetTag);
                  } catch (e) {}
                  if (msgEl) {
                    msgEl.textContent = '🔄 Recarregando grupo 1x para destravar janela "Criar post" do Facebook...';
                    msgEl.style.color = '#fbbf24';
                  }
                  setTimeout(() => window.location.reload(), 800);
                }
              } else if (boxTries >= 62) {
                clearInterval(waitTextbox);
                if (cancelAutoBtn) cancelAutoBtn.style.display = 'none';
                copyTextReliably(pending.fullText);
                closeStuckCreatePostDialog(dlg);
                clearStoredPendingGroupPost(currentSlug);
                sendRealPostResultToPlatform({
                  logId: pending.logId,
                  groupId: pending.groupId,
                  groupUrl: window.location.href,
                  groupName: pending.groupName,
                  approvalStatus: 'composer_stuck',
                  note: 'Facebook travou o modal automático (Atualize p/ Extensão v1.5.6 ou pause AdBlock). Texto copiado.'
                });
                if (msgEl) {
                  msgEl.style.color = '#fbbf24';
                }
                scheduleAutoCloseTab(msgEl, cancelAutoBtn, '⚠️ Janela travada no Facebook — fechando aba p/ não travar a fila.', 4);
              }
            }, 420);
          }, 900);
        }
      }, 420);
    }

    function initGroupPostAssistant() {
      if (!window.location.pathname.includes('/groups/')) return;
      if (!chrome.storage || !chrome.storage.local) return;

      const currentSlug = getCurrentGroupSlug();
      if (!currentSlug) return;

      chrome.storage.local.get(['autoviral_pending_fb_post', 'autoviral_pending_fb_posts_map'], (res) => {
        const postsMap = (res && res.autoviral_pending_fb_posts_map && typeof res.autoviral_pending_fb_posts_map === 'object')
          ? res.autoviral_pending_fb_posts_map
          : {};
        const activePending = res && res.autoviral_pending_fb_post;
        const pending = postsMap[currentSlug] ||
          (activePending && ((activePending.groupSlug || '').toLowerCase() === currentSlug || (activePending.groupUrl || '').toLowerCase().includes(`/groups/${currentSlug}`))
            ? activePending
            : null);

        const joinBtn = findJoinGroupButton();
        const isPendingJoin = isMembershipPendingApproval();
        createFloatingWidget();
        const badge = document.getElementById('autoviral-fb-body') || document.getElementById('autoviral-floating-badge');
        if (!badge || document.getElementById('autoviral-post-assistant')) return;

        const box = document.createElement('div');
        box.id = 'autoviral-post-assistant';
        box.style.cssText = 'border-top: 1px solid #334155; padding-top: 8px; margin-top: 4px; display: flex; flex-direction: column; gap: 6px;';

        const hasTask = Boolean(pending && (pending.fullText || pending.joinOnly));
        const buildPostReadyControls = () => {
          box.innerHTML = `
            <div style="font-size: 10px; color: #34d399; font-weight: 800;">
              ${pending && pending.joinOnly ? '🚪 Etapa 1: Solicitar Entrada no Grupo' : '📋 Automação Entrada + Postagem:'}
            </div>
            <div id="autoviral-post-assist-msg" style="font-size: 10px; color: #cbd5e1; line-height: 1.35;">
              ${hasTask ? (pending && pending.joinOnly ? 'Verificando status e solicitando entrada (sem postar agora)...' : 'Preparando ação neste grupo...') : 'Grupo monitorado! Dispare uma campanha no painel para preencher e postar aqui.'}
            </div>
            <button id="autoviral-btn-cancel-auto" style="display: none; background: #1e293b; color: #fbbf24; border: 1px solid #f59e0b; border-radius: 7px; padding: 5px 8px; font-size: 10px; font-weight: 700; cursor: pointer;">
              ⏸️ Pausar Auto-Envio (Revisar antes de publicar)
            </button>
            ${hasTask ? `
              <button id="autoviral-btn-copy-fill" style="background: #2563eb; color: #fff; border: none; border-radius: 7px; padding: 7px 8px; font-size: 10px; font-weight: 700; cursor: pointer;">
                🔄 ${pending && pending.joinOnly ? 'Solicitar Entrada Agora' : 'Solicitar Entrada / Preencher Post Agora'}
              </button>
              ${pending && pending.joinOnly ? '' : `
                <div style="display: flex; gap: 4px;">
                  <button id="autoviral-btn-confirm-pub" style="flex: 1; background: #10b981; color: #022c22; border: none; border-radius: 7px; padding: 6px; font-size: 10px; font-weight: 800; cursor: pointer;">
                    ✓ Postagem Feita
                  </button>
                  <button id="autoviral-btn-confirm-admin" style="flex: 1; background: #f59e0b; color: #1c1917; border: none; border-radius: 7px; padding: 6px; font-size: 10px; font-weight: 800; cursor: pointer;">
                    ⏳ Aguard. Admin
                  </button>
                </div>
              `}
            ` : ''}
          `;
        };

        buildPostReadyControls();
        badge.appendChild(box);

        const msgEl = document.getElementById('autoviral-post-assist-msg');
        const cancelAutoBtn = document.getElementById('autoviral-btn-cancel-auto');
        const btnFill = document.getElementById('autoviral-btn-copy-fill');
        const btnPub = document.getElementById('autoviral-btn-confirm-pub');
        const btnAdm = document.getElementById('autoviral-btn-confirm-admin');

        const triggerJoinThenPost = (autoSubmitPost) => {
          const isJoinOnly = Boolean(pending && pending.joinOnly);
          if (isFacebookGroupUnavailable()) {
            if (pending) {
              if (isJoinOnly) {
                sendGroupMembershipResultToPlatform({
                  groupId: pending.groupId,
                  groupUrl: window.location.href,
                  groupName: pending.groupName,
                  membershipStatus: 'unavailable',
                  note: 'Grupo indisponível no Facebook'
                });
              } else {
                sendRealPostResultToPlatform({
                  logId: pending.logId,
                  groupId: pending.groupId,
                  groupUrl: window.location.href,
                  groupName: pending.groupName,
                  approvalStatus: 'unavailable',
                  note: 'Facebook exibiu: Este conteúdo não está disponível no momento'
                });
              }
            }
            clearStoredPendingGroupPost(currentSlug);
            if (msgEl) {
              msgEl.textContent = '🚫 Este grupo não está disponível no Facebook ("Este conteúdo não está disponível no momento"). Removido da fila!';
              msgEl.style.color = '#fb7185';
            }
            if (isJoinOnly) {
              scheduleAutoCloseTab(msgEl, cancelAutoBtn, '🚫 Grupo indisponível.', 2);
            }
            return;
          }

          if (isFacebookRateLimited()) {
            if (pending) {
              if (isJoinOnly) {
                sendGroupMembershipResultToPlatform({
                  groupId: pending.groupId,
                  groupUrl: window.location.href,
                  groupName: pending.groupName,
                  membershipStatus: 'rate_limited',
                  note: 'Facebook limitou entradas temporariamente'
                });
              } else {
                sendRealPostResultToPlatform({
                  logId: pending.logId,
                  groupId: pending.groupId,
                  groupUrl: window.location.href,
                  groupName: pending.groupName,
                  approvalStatus: 'rate_limited',
                  note: 'Facebook exibiu: Você não pode usar este recurso no momento'
                });
              }
            }
            if (msgEl) {
              msgEl.textContent = '🛡️ FREIO ANTI-BLOQUEIO: Facebook limitou temporariamente ("Você não pode usar este recurso no momento"). Painel pausado — aguarde 15–30 min!';
              msgEl.style.color = '#fb7185';
            }
            return;
          }

          if (isMembershipPendingApproval()) {
            if (pending) {
              if (isJoinOnly) {
                sendGroupMembershipResultToPlatform({
                  groupId: pending.groupId,
                  groupUrl: window.location.href,
                  groupName: pending.groupName,
                  membershipStatus: 'awaiting_admin',
                  note: 'Solicitação já pendente — aguardando aceite do admin'
                });
              } else {
                saveWaitingApprovalEntry(pending, currentSlug);
                sendRealPostResultToPlatform({
                  logId: pending.logId,
                  groupId: pending.groupId,
                  groupUrl: window.location.href,
                  groupName: pending.groupName,
                  approvalStatus: 'join_requested'
                });
              }
              clearStoredPendingGroupPost(currentSlug);
            }
            if (msgEl) {
              msgEl.style.color = '#38bdf8';
            }
            scheduleAutoCloseTab(
              msgEl,
              cancelAutoBtn,
              isJoinOnly
                ? '⏳ Solicitação já enviada! Aguardando admin.'
                : '⏳ Entrada pendente! Cookie & gatilho salvos — postará ao admin aceitar.',
              3
            );
            return;
          }

          const currentJoinBtn = findJoinGroupButton();
          if (currentJoinBtn) {
            if (msgEl) {
              msgEl.textContent = '🚪 Solicitando entrada automática no grupo ("Participar do grupo")...';
              msgEl.style.color = '#38bdf8';
            }
            currentJoinBtn.click();

            setTimeout(() => {
              if (isFacebookRateLimited()) {
                if (pending) {
                  if (isJoinOnly) {
                    sendGroupMembershipResultToPlatform({
                      groupId: pending.groupId,
                      groupUrl: window.location.href,
                      groupName: pending.groupName,
                      membershipStatus: 'rate_limited',
                      note: 'Facebook limitou entradas temporariamente'
                    });
                  } else {
                    sendRealPostResultToPlatform({
                      logId: pending.logId,
                      groupId: pending.groupId,
                      groupUrl: window.location.href,
                      groupName: pending.groupName,
                      approvalStatus: 'rate_limited',
                      note: 'Facebook limitou entradas/ações temporariamente'
                    });
                  }
                }
                if (msgEl) {
                  msgEl.textContent = '🛡️ FREIO ANTI-BLOQUEIO: Facebook exibiu "Você não pode usar este recurso no momento". Robô pausado para proteger sua conta — aguarde 15–30 min!';
                  msgEl.style.color = '#fb7185';
                }
                return;
              }

              if (hasMembershipQuestionsModalOpen()) {
                tryAutoAnswerMembershipQuestionsAndSubmit(msgEl, (answeredOk) => {
                  if (answeredOk && !hasMembershipQuestionsModalOpen()) {
                    if (isAlreadyGroupMember()) {
                      if (isJoinOnly) {
                        if (pending) {
                          sendGroupMembershipResultToPlatform({
                            groupId: pending.groupId,
                            groupUrl: window.location.href,
                            groupName: pending.groupName,
                            membershipStatus: 'authorized',
                            note: 'Perguntas respondidas automaticamente → Já aceito no grupo!'
                          });
                          clearStoredPendingGroupPost(currentSlug);
                        }
                        scheduleAutoCloseTab(msgEl, cancelAutoBtn, '✅ Perguntas enviadas & aceito no grupo!', 2);
                      } else {
                        executeAutoPostFlow(pending, currentSlug, msgEl, cancelAutoBtn, autoSubmitPost);
                      }
                      return;
                    }
                    if (pending) {
                      if (isJoinOnly) {
                        sendGroupMembershipResultToPlatform({
                          groupId: pending.groupId,
                          groupUrl: window.location.href,
                          groupName: pending.groupName,
                          membershipStatus: 'awaiting_admin',
                          note: 'Perguntas & regras respondidas automaticamente — aguardando admin!'
                        });
                      } else {
                        saveWaitingApprovalEntry(pending, currentSlug);
                        sendRealPostResultToPlatform({
                          logId: pending.logId,
                          groupId: pending.groupId,
                          groupUrl: window.location.href,
                          groupName: pending.groupName,
                          approvalStatus: 'join_requested'
                        });
                      }
                      clearStoredPendingGroupPost(currentSlug);
                    }
                    scheduleAutoCloseTab(
                      msgEl,
                      cancelAutoBtn,
                      '✅ Perguntas & regras enviadas automaticamente! Aguardando aprovação do admin.',
                      3
                    );
                    return;
                  }

                  if (pending) {
                    if (isJoinOnly) {
                      sendGroupMembershipResultToPlatform({
                        groupId: pending.groupId,
                        groupUrl: window.location.href,
                        groupName: pending.groupName,
                        membershipStatus: 'questions_pending',
                        note: 'Grupo exige resposta manual complementar nas perguntas de entrada'
                      });
                    } else {
                      saveWaitingApprovalEntry(pending, currentSlug);
                      sendRealPostResultToPlatform({
                        logId: pending.logId,
                        groupId: pending.groupId,
                        groupUrl: window.location.href,
                        groupName: pending.groupName,
                        approvalStatus: 'join_requested'
                      });
                    }
                    clearStoredPendingGroupPost(currentSlug);
                  }
                  if (msgEl) {
                    msgEl.textContent = isJoinOnly
                      ? '📝 Respostas preenchidas — finalize o clique em Enviar acima se houver campo extra.'
                      : '📝 Respostas preenchidas — finalize acima se necessário; gatilho ativo p/ postar ao aceitar.';
                    msgEl.style.color = '#fbbf24';
                  }
                });
                return;
              }

              if (isMembershipPendingApproval()) {
                if (pending) {
                  if (isJoinOnly) {
                    sendGroupMembershipResultToPlatform({
                      groupId: pending.groupId,
                      groupUrl: window.location.href,
                      groupName: pending.groupName,
                      membershipStatus: 'awaiting_admin',
                      note: 'Pendente: solicitação confirmada no Facebook — aguardando admin'
                    });
                  } else {
                    saveWaitingApprovalEntry(pending, currentSlug);
                    sendRealPostResultToPlatform({
                      logId: pending.logId,
                      groupId: pending.groupId,
                      groupUrl: window.location.href,
                      groupName: pending.groupName,
                      approvalStatus: 'join_requested'
                    });
                  }
                  clearStoredPendingGroupPost(currentSlug);
                }
                if (msgEl) {
                  msgEl.style.color = '#38bdf8';
                }
                scheduleAutoCloseTab(
                  msgEl,
                  cancelAutoBtn,
                  isJoinOnly
                    ? '⏳ Entrada confirmada como PENDENTE no Facebook!'
                    : '⏳ Entrada solicitada! Cookie & gatilho ativados (fechando aba e postará quando aceitar).',
                  3
                );
                return;
              }

              // If "Join group" button is STILL present after clicking, Facebook ignored/blocked it!
              if (findJoinGroupButton()) {
                if (pending) {
                  if (isJoinOnly) {
                    sendGroupMembershipResultToPlatform({
                      groupId: pending.groupId,
                      groupUrl: window.location.href,
                      groupName: pending.groupName,
                      membershipStatus: 'rejected',
                      note: 'Botão Participar não aceitou clique (tente novamente ou verifique limite)'
                    });
                  } else {
                    sendRealPostResultToPlatform({
                      logId: pending.logId,
                      groupId: pending.groupId,
                      groupUrl: window.location.href,
                      groupName: pending.groupName,
                      approvalStatus: 'not_member',
                      note: 'Botão Participar não respondeu no Facebook'
                    });
                  }
                  clearStoredPendingGroupPost(currentSlug);
                }
                if (msgEl) {
                  msgEl.style.color = '#fb7185';
                }
                scheduleAutoCloseTab(msgEl, cancelAutoBtn, '❌ Entrada não confirmada pelo Facebook.', 3);
                return;
              }

              // Joined public group — verify real member signal!
              const confirmedMemberNow = isAlreadyGroupMember();
              if (isJoinOnly && pending) {
                sendGroupMembershipResultToPlatform({
                  groupId: pending.groupId,
                  groupUrl: window.location.href,
                  groupName: pending.groupName,
                  membershipStatus: confirmedMemberNow ? 'authorized' : 'rejected',
                  note: confirmedMemberNow
                    ? 'Aceito na hora! Você já é membro autorizado.'
                    : 'Sem confirmação clara de entrada no Facebook — verifique o grupo.'
                });
                clearStoredPendingGroupPost(currentSlug);
                if (msgEl) {
                  msgEl.style.color = confirmedMemberNow ? '#34d399' : '#fbbf24';
                }
                scheduleAutoCloseTab(
                  msgEl,
                  cancelAutoBtn,
                  confirmedMemberNow ? '✅ ACEITO na hora! Enviado p/ aba Autorizados.' : '⚠️ Sem confirmação direta de membro.',
                  2
                );
                return;
              }

              // Wait 3.5s humanized delay before posting!
              if (msgEl) {
                msgEl.textContent = '✅ Entrada confirmada! Aguardando 3.5s (proteção anti-spam) antes de postar...';
                msgEl.style.color = '#34d399';
              }
              if (pending && pending.fullText) {
                setTimeout(() => executeAutoPostFlow(pending, currentSlug, msgEl, cancelAutoBtn, autoSubmitPost), 3500);
              }
            }, 3000);
            return;
          }

          // Verify real member signal when neither Join nor Pending button is present!
          if (pending && isJoinOnly) {
            const verifiedMember = isAlreadyGroupMember();
            sendGroupMembershipResultToPlatform({
              groupId: pending.groupId,
              groupUrl: window.location.href,
              groupName: pending.groupName,
              membershipStatus: verifiedMember ? 'authorized' : 'rejected',
              note: verifiedMember
                ? 'Aceito! Já é membro autorizado deste grupo.'
                : 'Grupo não exibiu botão de membro nem de entrar (verifique acesso/login).'
            });
            clearStoredPendingGroupPost(currentSlug);
            if (msgEl) {
              msgEl.style.color = verifiedMember ? '#34d399' : '#fbbf24';
            }
            scheduleAutoCloseTab(
              msgEl,
              cancelAutoBtn,
              verifiedMember ? '✅ ACEITO (Já é membro)! Enviado p/ aba Autorizados.' : '⚠️ Status incerto no grupo.',
              2
            );
            return;
          }

          // Already a member -> proceed straight to post!
          if (pending && pending.fullText) {
            executeAutoPostFlow(pending, currentSlug, msgEl, cancelAutoBtn, autoSubmitPost);
          }
        };

        if (btnFill && hasTask) {
          btnFill.onclick = () => {
            try {
              sessionStorage.removeItem(`av_skel_reload_${currentSlug}`);
              sessionStorage.removeItem(`av_skip_auto_modal_${currentSlug}`);
            } catch (e) {}
            triggerJoinThenPost(true);
          };
        }

        if (btnPub && pending) {
          btnPub.onclick = () => {
            sendRealPostResultToPlatform({
              logId: pending.logId,
              groupId: pending.groupId,
              groupUrl: window.location.href,
              groupName: pending.groupName,
              approvalStatus: 'published'
            });
            clearStoredPendingGroupPost(currentSlug);
            if (msgEl) {
              msgEl.textContent = '✅ Confirmado como POSTAGEM FEITA no AutoViral!';
              msgEl.style.color = '#34d399';
            }
          };
        }

        if (btnAdm && pending) {
          btnAdm.onclick = () => {
            sendRealPostResultToPlatform({
              logId: pending.logId,
              groupId: pending.groupId,
              groupUrl: window.location.href,
              groupName: pending.groupName,
              approvalStatus: 'awaiting_admin'
            });
            clearStoredPendingGroupPost(currentSlug);
            if (msgEl) {
              msgEl.textContent = '⏳ Confirmado como AGUARDANDO ADMIN no AutoViral!';
              msgEl.style.color = '#fbbf24';
            }
          };
        }

        // Check unavailable/deleted/private page immediately before taking any action
        if (isFacebookGroupUnavailable()) {
          if (pending) {
            sendRealPostResultToPlatform({
              logId: pending.logId,
              groupId: pending.groupId,
              groupUrl: window.location.href,
              groupName: pending.groupName,
              approvalStatus: 'unavailable',
              note: 'Facebook exibiu: Este conteúdo não está disponível no momento'
            });
            clearStoredPendingGroupPost(currentSlug);
          }
          if (btnFill) btnFill.style.display = 'none';
          if (cancelAutoBtn) cancelAutoBtn.style.display = 'none';
          if (msgEl) {
            msgEl.textContent = '🚫 Este grupo/link está indisponível ou foi excluído no Facebook ("Este conteúdo não está disponível no momento"). Removido da fila do AutoViral!';
            msgEl.style.color = '#fb7185';
          }
          return;
        }

        // If previous run cleared a stuck grey modal, leave screen clean and guide user with copied text
        let skipAutoModal = false;
        if (pending && pending.fullText) {
          const skipKey = `av_skip_auto_modal_${currentSlug}`;
          const targetTag = String(pending.logId || '1');
          try {
            if (sessionStorage.getItem(skipKey) === targetTag) {
              skipAutoModal = true;
              sessionStorage.removeItem(skipKey);
            }
          } catch (e) {}
        }

        if (skipAutoModal && pending && pending.fullText) {
          copyTextReliably(pending.fullText);
          if (msgEl) {
            msgEl.textContent = '📋 Tela limpa! Texto copiado: clique manualmente em "Escreva algo..." e aperte Ctrl+V (se abrir normal, o robô confirma sozinho).';
            msgEl.style.color = '#fbbf24';
          }
          startSubmissionMonitor(pending, currentSlug, msgEl, false, cancelAutoBtn);
          return;
        }

        // Automatically run Stage 1 (Join) -> Stage 2 (Post) when opened from AutoViral!
        if (hasTask && pending.autoJoinAndPost !== false) {
          triggerJoinThenPost(true);
        } else if (joinBtn && !pending) {
          if (msgEl) {
            msgEl.textContent = 'ℹ️ Você ainda não participa deste grupo. Ao disparar pelo painel, a extensão solicita entrada e posta automaticamente.';
            msgEl.style.color = '#fbbf24';
          }
        } else if (isPendingJoin) {
          if (msgEl) {
            msgEl.textContent = '⏳ Participação pendente de aprovação do administrador neste grupo.';
            msgEl.style.color = '#fbbf24';
          }
        }
      });
    }

    function checkWaitingApprovalsAndNotifications() {
      if (!chrome.storage || !chrome.storage.local || !chrome.runtime || !chrome.runtime.sendMessage) return;
      chrome.storage.local.get(['autoviral_waiting_approval_map', 'autoviral_pending_fb_posts_map'], (res) => {
        const waitingMap = (res && res.autoviral_waiting_approval_map && typeof res.autoviral_waiting_approval_map === 'object')
          ? res.autoviral_waiting_approval_map
          : {};
        const pendingMap = (res && res.autoviral_pending_fb_posts_map && typeof res.autoviral_pending_fb_posts_map === 'object')
          ? res.autoviral_pending_fb_posts_map
          : {};
        const waitingSlugs = Object.keys(waitingMap);
        if (waitingSlugs.length === 0) return;

        const currentSlug = getCurrentGroupSlug();
        if (currentSlug && waitingMap[currentSlug] && !pendingMap[currentSlug] && isAlreadyGroupMember()) {
          clearWaitingApprovalCookie(currentSlug);
          chrome.runtime.sendMessage({
            action: 'AUTOVIRAL_TRIGGER_APPROVED_GROUP_POST',
            groupSlug: currentSlug,
            alreadyInTab: true
          }, () => { void chrome.runtime.lastError; });
          return;
        }

        // Also scan visible Facebook approval notifications in DOM
        const groupLinks = Array.from(document.querySelectorAll('a[href*="/groups/"]'));
        for (const a of groupLinks) {
          const href = a.getAttribute('href') || '';
          const m = href.match(/\/groups\/([^\/?#]+)/i);
          if (!m) continue;
          const linkSlug = m[1].toLowerCase();
          if (!waitingMap[linkSlug] || pendingMap[linkSlug]) continue;
          const containerText = ((a.closest('div[role="listitem"], div[role="row"], div[role="button"], li, div') || a).innerText || '').toLowerCase();
          if (
            containerText.includes('aprovou sua solicitação') ||
            containerText.includes('aproveite sua participação') ||
            containerText.includes('agora é membro') ||
            containerText.includes('approved your request') ||
            containerText.includes('enjoy your membership') ||
            containerText.includes('now a member')
          ) {
            clearWaitingApprovalCookie(linkSlug);
            chrome.runtime.sendMessage({
              action: 'AUTOVIRAL_TRIGGER_APPROVED_GROUP_POST',
              groupSlug: linkSlug,
              alreadyInTab: false
            }, () => { void chrome.runtime.lastError; });
            break;
          }
        }
      });
    }

    const scheduleGroupPostAssistant = () => {
      let didInit = false;
      const runOnce = () => {
        if (didInit) return;
        didInit = true;
        initGroupPostAssistant();
      };
      if (document.readyState === 'complete') {
        setTimeout(runOnce, 2200);
      } else {
        window.addEventListener('load', () => setTimeout(runOnce, 2200), { once: true });
        setTimeout(runOnce, 5200);
      }
      setTimeout(checkWaitingApprovalsAndNotifications, 4200);
      setInterval(checkWaitingApprovalsAndNotifications, 25000);
    };
    scheduleGroupPostAssistant();

    // Message listener for popup & background watchdog
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'AUTOVIRAL_MAP_GROUPS' || request.action === 'AUTOVIRAL_GET_GROUPS') {
        const justFound = scanVisibleGroups();
        sendResponse({
          success: true,
          groups: localMappedGroups,
          justFoundCount: justFound.length,
          currentUrl: window.location.href
        });
      } else if (request.action === 'AUTOVIRAL_RESET_MAPPED_GROUPS') {
        localMappedGroups = [];
        updateFloatingBadge();
        sendResponse({ success: true });
      } else if (request.action === 'AUTOVIRAL_RUN_PENDING_NOW') {
        const oldAssist = document.getElementById('autoviral-post-assistant');
        if (oldAssist) oldAssist.remove();
        setTimeout(initGroupPostAssistant, 200);
        sendResponse({ ok: true });
      }
      return true;
    });
  }

  // =========================================================================
  // 2. YOUTUBE AUTOMATION (SEARCH MAPPER, COMMENTS & LIKES)
  // (User requested: "mapear url com youtube aberto 'apos fazer procura', imagem 2")
  // =========================================================================
  if (isYouTube) {
    console.log('[AutoViral AI] Conectado ao YouTube. Mapeador de Vídeos da Busca & Robô Ativos.');

    let localMappedVideos = [];
    let isYtWidgetVisible = true;

    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['autoviral_yt_videos'], (res) => {
        if (Array.isArray(res.autoviral_yt_videos)) {
          localMappedVideos = res.autoviral_yt_videos;
          updateYouTubeFloatingBadge();
        }
      });
    }

    function scanYouTubeSearchResults() {
      const hrefNow = window.location.href;
      const isSupportedYtPage =
        hrefNow.includes('/results') ||
        hrefNow.includes('/watch?v=') ||
        hrefNow.includes('/@') ||
        hrefNow.includes('/channel/') ||
        hrefNow.includes('/c/');
      if (!isSupportedYtPage) return;

      const detected = [];

      // If watching a specific video directly, capture it immediately
      if (hrefNow.includes('/watch?v=')) {
        const cleanCurrentUrl = hrefNow.split('&')[0];
        const titleEl = document.querySelector('h1.ytd-watch-metadata yt-formatted-string, h1.ytd-video-primary-info-renderer');
        const currentTitle = ((titleEl && titleEl.innerText) || document.title || '')
          .replace(/\s*-\s*YouTube$/i, '')
          .trim();
        const chEl = document.querySelector('ytd-video-owner-renderer #channel-name a, #owner #channel-name');
        const currentChannel = ((chEl && chEl.innerText) || 'Canal do YouTube').trim();
        const videoIdMatch = cleanCurrentUrl.match(/[?&]v=([^&]+)/);
        const thumb = videoIdMatch ? `https://i.ytimg.com/vi/${videoIdMatch[1]}/hqdefault.jpg` : '';
        if (currentTitle.length > 2) {
          detected.push({
            id: `yt-${videoIdMatch ? videoIdMatch[1] : Date.now()}`,
            url: cleanCurrentUrl,
            title: currentTitle,
            channelName: currentChannel,
            viewsCount: 'Vídeo Aberto',
            thumbnailUrl: thumb,
            actionLike: true,
            actionComment: true,
            commentText: 'Excelente vídeo! Como profissional/mãe recomendo muito. Para quem também busca materiais práticos de alfabetização e coordenação motora para imprimir por R$ 9,90 no Pix: https://pay.kiwify.com.br/HE5xbnp ❤️ Parabéns pelo conteúdo!',
            status: 'ready'
          });
        }
      }

      const videoElements = document.querySelectorAll('ytd-video-renderer, ytd-rich-item-renderer, ytd-grid-video-renderer, ytd-compact-video-renderer');

      videoElements.forEach((el, index) => {
        const titleLink = el.querySelector('a#video-title, a#video-title-link') || el.querySelector('a#thumbnail, a[href*="/watch?v="]');
        if (!titleLink) return;

        const href = titleLink.getAttribute('href') || titleLink.href || '';
        if (!href.includes('/watch?v=')) return;

        const fullUrl = href.startsWith('http') ? href : `https://www.youtube.com${href}`;
        const cleanUrl = fullUrl.split('&')[0]; // strip time and list params

        const titleEl = el.querySelector('#video-title, #video-title-link, span#video-title') || el.querySelector('yt-formatted-string');
        const title = (titleEl ? titleEl.innerText : (titleLink.getAttribute('title') || '')).trim();

        const channelEl = el.querySelector('#channel-name, ytd-channel-name');
        const channelName = (channelEl ? channelEl.innerText : 'Canal do YouTube').trim();

        const metadataEl = el.querySelector('#metadata-line, .ytd-video-meta-block');
        const viewsCount = metadataEl ? metadataEl.innerText.split('\n')[0] : 'Visualizações ativas';

        const videoIdMatch = cleanUrl.match(/[?&]v=([^&]+)/);
        const imgEl = el.querySelector('yt-image img, img');
        const thumbnailUrl = (imgEl && (imgEl.src || imgEl.getAttribute('src'))) || (videoIdMatch ? `https://i.ytimg.com/vi/${videoIdMatch[1]}/hqdefault.jpg` : '');

        if (title.length > 3 && cleanUrl.includes('/watch?v=')) {
          const alreadyAdded = detected.some(v => v.url === cleanUrl);
          if (!alreadyAdded) {
            detected.push({
              id: `yt-${videoIdMatch ? videoIdMatch[1] : Date.now()}-${index}`,
              url: cleanUrl,
              title: title,
              channelName: channelName,
              viewsCount: viewsCount,
              thumbnailUrl: thumbnailUrl,
              actionLike: true,
              actionComment: true,
              commentText: 'Excelente vídeo! Como profissional/mãe recomendo muito. Para quem também busca materiais práticos de alfabetização e coordenação motora para imprimir por R$ 9,90 no Pix: https://pay.kiwify.com.br/HE5xbnp ❤️ Parabéns pelo conteúdo!',
              status: 'ready'
            });
          }
        }
      });

      if (detected.length > 0) {
        let hasNew = false;
        detected.forEach(d => {
          if (!localMappedVideos.some(v => v.url === d.url)) {
            localMappedVideos.unshift(d);
            hasNew = true;
          }
        });

        if (hasNew) {
          if (chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({ autoviral_yt_videos: localMappedVideos });
          }
          updateYouTubeFloatingBadge();
        }
      }
    }

    function createYouTubeFloatingBadge() {
      if (document.getElementById('autoviral-yt-floating-badge')) return;

      const badge = document.createElement('div');
      badge.id = 'autoviral-yt-floating-badge';
      badge.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9999999;
        background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
        border: 2px solid #ef4444;
        border-radius: 16px;
        padding: 10px 14px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.8), 0 0 15px rgba(239, 68, 68, 0.3);
        color: #f8fafc;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 276px;
      `;

      badge.innerHTML = `
        <div id="autoviral-yt-header" style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #334155; padding-bottom: 4px; gap: 6px;">
          <div style="display: flex; align-items: center; gap: 6px; font-weight: 800; color: #ef4444; font-size: 11px;">
            <span style="color: #64748b;">⋮⋮</span>
            <span>▶️ AutoViral AI</span>
            <span style="background: #450a0a; color: #fca5a5; font-size: 9px; padding: 1px 6px; border-radius: 999px; font-weight: 600;">YouTube</span>
          </div>
          <div style="display: flex; align-items: center; gap: 4px;">
            <button id="autoviral-yt-badge-min" title="Minimizar" style="background: #1e293b; border: 1px solid #334155; color: #cbd5e1; border-radius: 6px; width: 22px; height: 22px; cursor: pointer; font-size: 12px; font-weight: 800; line-height: 1;">–</button>
            <button id="autoviral-yt-badge-close" title="Fechar" style="background: #1e293b; border: 1px solid #334155; color: #f87171; border-radius: 6px; width: 22px; height: 22px; cursor: pointer; font-size: 11px; font-weight: 800; line-height: 1;">✕</button>
          </div>
        </div>
        <div id="autoviral-yt-body" style="display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="color: #cbd5e1;">Vídeos da Busca Mapeados:</span>
            <strong id="autoviral-yt-badge-count" style="color: #f59e0b; font-size: 13px; font-weight: 900;">0</strong>
          </div>
          <div style="font-size: 10px; color: #94a3b8; line-height: 1.3;">
            Os vídeos desta pesquisa no YouTube foram lidos e preparados para divulgação!
          </div>
          <button id="autoviral-yt-badge-sync" style="
            background: #ef4444;
            color: #ffffff;
            border: none;
            border-radius: 8px;
            padding: 8px 10px;
            font-weight: 700;
            font-size: 11px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
          ">
            📡 Sincronizar Vídeos com Painel AutoViral
          </button>
        </div>
      `;

      document.body.appendChild(badge);

      makeWidgetInteractive(badge, {
        headerEl: document.getElementById('autoviral-yt-header'),
        bodyEl: document.getElementById('autoviral-yt-body'),
        minBtn: document.getElementById('autoviral-yt-badge-min'),
        closeBtn: document.getElementById('autoviral-yt-badge-close'),
        storageKey: 'autoviral_yt_widget_pos',
        expandedWidth: '276px'
      });

      document.getElementById('autoviral-yt-badge-close').onclick = () => {
        badge.style.display = 'none';
        isYtWidgetVisible = false;
      };

      document.getElementById('autoviral-yt-badge-sync').onclick = () => {
        scanYouTubeSearchResults();
        const count = localMappedVideos.length;
        try {
          const bc = new BroadcastChannel('autoviral_bridge_channel');
          bc.postMessage({
            action: 'AUTOVIRAL_IMPORT_YOUTUBE_VIDEOS_FROM_EXTENSION',
            videos: localMappedVideos,
            timestamp: new Date().toISOString()
          });
          setTimeout(() => bc.close(), 1000);
        } catch (e) {}

        window.postMessage({
          type: 'AUTOVIRAL_IMPORT_YOUTUBE_VIDEOS_FROM_EXTENSION',
          videos: localMappedVideos,
          timestamp: new Date().toISOString()
        }, '*');

        if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
          chrome.runtime.sendMessage({
            action: 'AUTOVIRAL_IMPORT_YOUTUBE_VIDEOS_FROM_EXTENSION',
            videos: localMappedVideos,
            timestamp: new Date().toISOString()
          }, () => { void chrome.runtime.lastError; });
        }

        const ytBtn = document.getElementById('autoviral-yt-badge-sync');
        if (ytBtn) {
          ytBtn.textContent = `✅ ${count} vídeos enviados para o Painel!`;
          ytBtn.style.background = '#10b981';
          setTimeout(() => {
            ytBtn.textContent = '📡 Sincronizar Vídeos com Painel AutoViral';
            ytBtn.style.background = '#ef4444';
          }, 3000);
        }
      };
    }

    function updateYouTubeFloatingBadge() {
      if (!isYtWidgetVisible) return;
      createYouTubeFloatingBadge();
      const countEl = document.getElementById('autoviral-yt-badge-count');
      if (countEl) {
        countEl.textContent = `${localMappedVideos.length} vídeos`;
      }
    }

    // Auto-scan on search page load and scroll
    window.addEventListener('scroll', () => {
      scanYouTubeSearchResults();
    }, { passive: true });

    setTimeout(scanYouTubeSearchResults, 1500);

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'AUTOVIRAL_YOUTUBE_GET_SEARCH_VIDEOS') {
        scanYouTubeSearchResults();
        sendResponse({ success: true, videos: localMappedVideos });
      } else if (request.action === 'AUTOVIRAL_YOUTUBE_AUTO_ENGAGE') {
        const { commentText, doLike, videoUrl } = request;

        let liked = false;
        let commented = false;

        // Auto-Like Video
        if (doLike) {
          const likeButton = document.querySelector('like-button-view-model button') ||
                             document.querySelector('button[aria-label*="Gostei"]') ||
                             document.querySelector('button[aria-label*="like"]');
          if (likeButton) {
            likeButton.click();
            liked = true;
          }
        }

        // Auto-Comment on Video
        if (commentText) {
          const commentBox = document.querySelector('#simplebox-placeholder') ||
                             document.querySelector('ytd-comment-simplebox-renderer');
          if (commentBox) {
            commentBox.click();
            setTimeout(() => {
              const inputField = document.querySelector('#contenteditable-root');
              if (inputField) {
                inputField.focus();
                inputField.innerText = commentText;
                inputField.dispatchEvent(new Event('input', { bubbles: true }));

                setTimeout(() => {
                  const submitBtn = document.querySelector('#submit-button button');
                  if (submitBtn) {
                    submitBtn.click();
                    commented = true;
                  }
                }, 500);
              }
            }, 600);
          }
        }

        sendResponse({ success: true, liked, commented, title: document.title, url: window.location.href });
      }
      return true;
    });
  }

  // =========================================================================
  // 3. PINTEREST AUTOMATION & PIN DETECTOR
  // =========================================================================
  if (currentHost.includes('pinterest.com')) {
    console.log('[AutoViral AI] Conectado ao Pinterest. Robô de Pins & Pastas Ativo.');

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'AUTOVIRAL_PINTEREST_PING') {
        sendResponse({ status: 'active', url: window.location.href, title: document.title });
      } else if (request.action === 'AUTOVIRAL_PINTEREST_GET_BOARDS') {
        // Collect visible board titles if on profile / boards page
        const boardEls = document.querySelectorAll('div[data-test-id*="board-card"] h2, a[href*="/boards/"]');
        const boards = [];
        boardEls.forEach(b => {
          const name = b.innerText.trim();
          if (name && !boards.includes(name)) boards.push(name);
        });
        sendResponse({ success: true, boards: boards });
      }
      return true;
    });
  }

  // =========================================================================
  // 4. INSTAGRAM LOGGED-IN BRIDGE & STORIES DETECTOR
  // =========================================================================
  // 4. INSTAGRAM LOGGED BROWSER BRIDGE & ANTI-BAN DEFENSE DEVICE
  // (User requested: "dispositivo de defesa que o Instagram conectado no navegador seja por onde vai fazer as postagens")
  // =========================================================================
  if (currentHost.includes('instagram.com')) {
    console.log('[AutoViral AI] Conectado ao Instagram Web logado no navegador. Dispositivo de Defesa Anti-Ban & Mapeador Ilimitado ATIVO.');

    const RESERVED_INSTA_PATHS = new Set([
      'p', 'reel', 'reels', 'tv', 'stories', 'direct', 'explore', 'accounts',
      'notifications', 'create', 'about', 'legal', 'developer', 'directory',
      'nametag', 'session', 'emails', 'challenge', 'privacy', 'terms', 'help',
      'api', 'static', 'graphql', 'oauth', 'your_activity', 'archive'
    ]);

    let connectedHandle = '@conectado';
    const detectConnectedInstagramHandle = () => {
      try {
        const imgs = document.querySelectorAll('img[alt*="Foto do perfil de"], img[alt*="profile picture"]');
        for (const img of imgs) {
          const alt = img.getAttribute('alt') || '';
          const matchPt = alt.match(/Foto do perfil de\s+([a-zA-Z0-9._]+)/i);
          const matchEn = alt.match(/([a-zA-Z0-9._]+)'s profile picture/i);
          const candidate = (matchPt && matchPt[1]) || (matchEn && matchEn[1]);
          if (candidate && !RESERVED_INSTA_PATHS.has(candidate.toLowerCase())) {
            connectedHandle = '@' + candidate.toLowerCase();
            return connectedHandle;
          }
        }
        const navLinks = document.querySelectorAll('nav a[href^="/"], a[role="link"][href^="/"]');
        for (const pl of navLinks) {
          const href = pl.getAttribute('href') || '';
          const clean = href.replace(/^\/+|\/+$/g, '').split('/')[0];
          if (
            clean &&
            clean.length >= 2 &&
            clean.length <= 30 &&
            /^[a-zA-Z0-9._]+$/.test(clean) &&
            !RESERVED_INSTA_PATHS.has(clean.toLowerCase()) &&
            pl.querySelector('img')
          ) {
            connectedHandle = '@' + clean.toLowerCase();
            return connectedHandle;
          }
        }
      } catch (e) {}
      return connectedHandle;
    };

    detectConnectedInstagramHandle();

    // Unlimited Instagram Account Mapper (Feed, Busca, Seguidores & Explore)
    const mappedInstaMap = new Map();

    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['autoviral_insta_accounts', 'autoviral_insta_connected_handle'], (res) => {
        if (res.autoviral_insta_connected_handle && connectedHandle === '@conectado') {
          connectedHandle = res.autoviral_insta_connected_handle;
        }
        if (Array.isArray(res.autoviral_insta_accounts)) {
          res.autoviral_insta_accounts.forEach((acc) => {
            if (acc && acc.username) {
              mappedInstaMap.set(acc.username.toLowerCase(), acc);
            }
          });
        }
        updateInstaBadgeCounts();
      });
    }

    function updateInstaBadgeCounts() {
      const countEl = document.getElementById('autoviral-insta-mapped-count');
      if (countEl) {
        countEl.textContent = `${mappedInstaMap.size} contas mapeadas (Ilimitado)`;
      }
      const handleEl = document.getElementById('autoviral-insta-connected-handle');
      if (handleEl) {
        handleEl.textContent = connectedHandle;
      }
    }

    function setInstaWidgetStatus(msg, color) {
      const st = document.getElementById('autoviral-insta-widget-status');
      if (st) {
        st.textContent = msg;
        st.style.color = color || '#34d399';
      }
    }

    function scanVisibleInstagramAccounts() {
      detectConnectedInstagramHandle();
      let newFound = 0;

      try {
        const anchors = document.querySelectorAll('a[href]');
        anchors.forEach((a) => {
          const rawHref = a.getAttribute('href') || '';
          const href = rawHref.replace(/^https?:\/\/(www\.)?instagram\.com/i, '').split('?')[0].split('#')[0];
          if (!href || href === '/') return;

          // Match exact single-segment profile URLs like /username/ or /username
          const match = href.match(/^\/([a-zA-Z0-9._]{2,30})\/?$/);
          if (!match) return;

          const username = match[1].toLowerCase();
          if (RESERVED_INSTA_PATHS.has(username)) return;
          if ('@' + username === connectedHandle.toLowerCase()) return;

          // Extract display name from card or link text
          let displayName = '';
          const container = a.closest('div[role="button"], li, div');
          if (a.textContent && a.textContent.trim().length >= 2 && a.textContent.trim().length <= 50) {
            const txt = a.textContent.trim().split('\n')[0].trim();
            if (txt && !txt.startsWith('http') && txt.toLowerCase() !== username) {
              displayName = txt;
            }
          }
          if (!displayName && container) {
            const spans = container.querySelectorAll('span');
            for (const sp of spans) {
              const t = (sp.textContent || '').trim();
              if (t && t.length >= 2 && t.length <= 45 && t.toLowerCase() !== username && !t.includes('Seguir') && !t.includes('Follow')) {
                displayName = t;
                break;
              }
            }
          }

          const handle = '@' + username;
          if (!mappedInstaMap.has(username)) {
            newFound++;
            mappedInstaMap.set(username, {
              handle,
              username,
              name: displayName || username,
              url: `https://www.instagram.com/${username}/`,
              sourceUrl: window.location.href,
              mappedAt: new Date().toISOString()
            });
          }
        });
      } catch (e) {}

      const list = Array.from(mappedInstaMap.values());
      if (chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({
          autoviral_insta_accounts: list,
          autoviral_insta_connected_handle: connectedHandle
        });
      }
      updateInstaBadgeCounts();
      return { list, newFound };
    }

    function sendInstagramAccountsToAutoViral() {
      const { list } = scanVisibleInstagramAccounts();
      const payload = {
        action: 'AUTOVIRAL_IMPORT_INSTAGRAM_ACCOUNTS',
        accounts: list,
        connectedHandle,
        sourceUrl: window.location.href,
        timestamp: new Date().toISOString()
      };

      try {
        const bc = new BroadcastChannel('autoviral_bridge_channel');
        bc.postMessage(payload);
        bc.postMessage({
          action: 'AUTOVIRAL_INSTA_ACCOUNT_SYNC',
          handle: connectedHandle,
          url: window.location.href,
          timestamp: new Date().toISOString()
        });
        setTimeout(() => bc.close(), 1000);
      } catch (e) {}

      if (chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage(payload, (res) => {
          void chrome.runtime.lastError;
          if (res && res.forwardedCount > 0) {
            setInstaWidgetStatus(`✅ ${list.length} contas enviadas direto ao AutoViral!`, '#34d399');
          } else {
            setInstaWidgetStatus(`💾 ${list.length} contas salvas! Clique em "Abrir Painel" para ver.`, '#38bdf8');
          }
        });
        chrome.runtime.sendMessage({
          action: 'AUTOVIRAL_INSTA_ACCOUNT_SYNC',
          handle: connectedHandle
        }, () => { void chrome.runtime.lastError; });
      } else {
        setInstaWidgetStatus(`✅ ${list.length} contas salvas!`, '#34d399');
      }
    }

    // Inject Movable, Minimizable, Closable Instagram Defense & Unlimited Mapper Widget
    const badge = document.createElement('div');
    badge.id = 'autoviral-insta-defense-badge';
    badge.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 9999999; background: #090d16; color: #fff; padding: 10px 14px; border-radius: 16px; font-family: system-ui, -apple-system, sans-serif; font-size: 11px; font-weight: 700; border: 1.5px solid #a855f7; box-shadow: 0 10px 25px rgba(0,0,0,0.75), 0 0 15px rgba(168, 85, 247, 0.3); display: flex; flex-direction: column; gap: 7px; width: 280px;';
    badge.innerHTML = `
      <div id="autoviral-insta-header" style="display: flex; align-items: center; justify-content: space-between; gap: 6px; padding-bottom: 5px; border-bottom: 1px solid #1e293b;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="color: #64748b; font-size: 11px;">⋮⋮</span>
          <span style="display: inline-block; width: 7px; height: 7px; background: #10b981; border-radius: 50%; box-shadow: 0 0 8px #10b981;"></span>
          <span style="color: #c084fc; font-weight: 900; font-size: 11px;">AutoViral • Instagram</span>
        </div>
        <div style="display: flex; align-items: center; gap: 4px;">
          <span style="font-size: 8px; background: rgba(16, 185, 129, 0.15); color: #34d399; padding: 1px 5px; border-radius: 5px; border: 1px solid rgba(16, 185, 129, 0.4);">MOVER</span>
          <button id="autoviral-insta-min" title="Minimizar" style="background: #1e293b; border: 1px solid #334155; color: #cbd5e1; border-radius: 6px; width: 22px; height: 22px; cursor: pointer; font-size: 12px; font-weight: 800; line-height: 1;">–</button>
          <button id="autoviral-insta-close" title="Fechar" style="background: #1e293b; border: 1px solid #334155; color: #f87171; border-radius: 6px; width: 22px; height: 22px; cursor: pointer; font-size: 11px; font-weight: 800; line-height: 1;">✕</button>
        </div>
      </div>
      <div id="autoviral-insta-body" style="display: flex; flex-direction: column; gap: 7px;">
        <div style="font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between;">
          <span>Conta Stories: <strong id="autoviral-insta-connected-handle" style="color: #f1f5f9;">${connectedHandle}</strong></span>
        </div>
        <div style="font-size: 11px; color: #e9d5ff; background: rgba(147,51,234,0.18); border: 1px solid rgba(168,85,247,0.35); border-radius: 8px; padding: 5px 8px;">
          📡 <strong id="autoviral-insta-mapped-count">0 contas mapeadas (Ilimitado)</strong>
        </div>
        <div style="display: flex; gap: 6px;">
          <button id="btn-scan-insta-accounts" style="flex: 1; background: #1e293b; color: #e2e8f0; border: 1px solid #475569; padding: 6px 8px; border-radius: 8px; font-size: 10px; font-weight: 800; cursor: pointer;">
            🔍 Mapear Visíveis
          </button>
          <button id="btn-sync-insta-to-platform" style="flex: 1; background: linear-gradient(135deg, #10b981, #059669); color: #022c22; border: none; padding: 6px 8px; border-radius: 8px; font-size: 10px; font-weight: 900; cursor: pointer;">
            📡 Enviar p/ Painel
          </button>
        </div>
        <div style="display: flex; gap: 6px;">
          <button id="btn-sync-only-handle" style="flex: 1; background: linear-gradient(135deg, #9333ea, #c026d3); color: #fff; border: none; padding: 6px 8px; border-radius: 8px; font-size: 10px; font-weight: 800; cursor: pointer;">
            🛡️ Confirmar Conta
          </button>
          <button id="btn-open-autoviral-from-insta" style="background: #1e1b4b; color: #c7d2fe; border: 1px solid #4338ca; padding: 6px 8px; border-radius: 8px; font-size: 10px; font-weight: 800; cursor: pointer;">
            💻 Abrir Painel
          </button>
        </div>
        <div id="autoviral-insta-widget-status" style="font-size: 9px; color: #94a3b8; line-height: 1.3;">
          Arraste pelo topo para mover • Role busca ou seguidores para capturar contas.
        </div>
      </div>
    `;
    const mountInstaBadge = () => {
      if (document.getElementById('autoviral-insta-defense-badge')) return;
      document.body.appendChild(badge);
      makeWidgetInteractive(badge, {
        headerEl: document.getElementById('autoviral-insta-header'),
        bodyEl: document.getElementById('autoviral-insta-body'),
        minBtn: document.getElementById('autoviral-insta-min'),
        closeBtn: document.getElementById('autoviral-insta-close'),
        storageKey: 'autoviral_insta_widget_pos',
        defaultRight: '20px',
        defaultBottom: '20px',
        expandedWidth: '280px'
      });
    };
    if (document.body) {
      mountInstaBadge();
    } else {
      window.addEventListener('DOMContentLoaded', mountInstaBadge);
    }

    setTimeout(() => {
      scanVisibleInstagramAccounts();

      const btnScanInsta = document.getElementById('btn-scan-insta-accounts');
      if (btnScanInsta) {
        btnScanInsta.onclick = () => {
          const { list, newFound } = scanVisibleInstagramAccounts();
          setInstaWidgetStatus(`🔍 Capturadas +${newFound} novas (${list.length} total)!`, '#38bdf8');
        };
      }

      const btnSendGroup = document.getElementById('btn-sync-insta-to-platform');
      if (btnSendGroup) {
        btnSendGroup.onclick = () => {
          sendInstagramAccountsToAutoViral();
        };
      }

      const btnOpenFromInsta = document.getElementById('btn-open-autoviral-from-insta');
      if (btnOpenFromInsta) {
        btnOpenFromInsta.onclick = () => {
          sendInstagramAccountsToAutoViral();
          if (chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage({ action: 'AUTOVIRAL_FOCUS_OR_OPEN_PLATFORM' }, () => {
              void chrome.runtime.lastError;
            });
          }
        };
      }

      const btnSyncHandle = document.getElementById('btn-sync-only-handle');
      if (btnSyncHandle) {
        btnSyncHandle.onclick = () => {
          detectConnectedInstagramHandle();
          updateInstaBadgeCounts();
          try {
            const bc = new BroadcastChannel('autoviral_bridge_channel');
            bc.postMessage({
              action: 'AUTOVIRAL_INSTA_ACCOUNT_SYNC',
              handle: connectedHandle,
              url: window.location.href,
              timestamp: new Date().toISOString()
            });
            setTimeout(() => bc.close(), 1000);
          } catch (e) {}
          if (chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage({
              action: 'AUTOVIRAL_INSTA_ACCOUNT_SYNC',
              handle: connectedHandle
            }, (res) => {
              void chrome.runtime.lastError;
              if (res && res.forwardedCount > 0) {
                setInstaWidgetStatus(`✅ Conta ${connectedHandle} sincronizada no Painel!`, '#34d399');
              } else {
                setInstaWidgetStatus(`💾 Conta ${connectedHandle} salva! Abra o Painel para usar.`, '#38bdf8');
              }
            });
          } else {
            setInstaWidgetStatus(`✅ Conta ${connectedHandle} confirmada!`, '#34d399');
          }
        };
      }
    }, 1000);

    // Auto-capture on scroll (throttled)
    let scrollInstaTimeout = null;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollInstaTimeout);
      scrollInstaTimeout = setTimeout(() => {
        scanVisibleInstagramAccounts();
      }, 900);
    }, true);

    // Observe modal dialogs (followers / search dropdown)
    try {
      let mutTimeout = null;
      const instaObserver = new MutationObserver(() => {
        clearTimeout(mutTimeout);
        mutTimeout = setTimeout(() => scanVisibleInstagramAccounts(), 1500);
      });
      if (document.body) {
        instaObserver.observe(document.body, { childList: true, subtree: true });
      }
    } catch (e) {}

    // Defense Monitor: check for Meta restrictions or popups
    setInterval(() => {
      const pageText = document.body ? document.body.innerText : '';
      if (
        pageText.includes('Tente novamente mais tarde') ||
        pageText.includes('Ação bloqueada') ||
        pageText.includes('Action blocked') ||
        pageText.includes('restringimos determinadas atividades')
      ) {
        console.warn('[AutoViral AI] 🛡️ ALERTA DE SEGURANÇA: Aviso de restrição temporária detectado no Instagram!');
        try {
          const bc = new BroadcastChannel('autoviral_bridge_channel');
          bc.postMessage({
            action: 'AUTOVIRAL_TRIGGER_DEFENSE_PAUSE',
            platform: 'Instagram',
            cooldownMinutes: 60,
            timestamp: new Date().toISOString()
          });
          setTimeout(() => bc.close(), 1000);
        } catch (e) {}
      }
    }, 5000);

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'AUTOVIRAL_INSTA_PING') {
        detectConnectedInstagramHandle();
        sendResponse({
          status: 'active',
          handle: connectedHandle,
          mappedCount: mappedInstaMap.size,
          url: window.location.href,
          title: document.title
        });
      } else if (request.action === 'AUTOVIRAL_MAP_INSTAGRAM_ACCOUNTS') {
        const { list, newFound } = scanVisibleInstagramAccounts();
        sendResponse({
          success: true,
          accounts: list,
          newFound,
          connectedHandle,
          url: window.location.href
        });
      }
      return true;
    });
  }

  // =========================================================================
  // 5. AUTOVIRAL PLATFORM RECEIVER
  // =========================================================================
  if (isAutoViral) {
    console.log('[AutoViral AI] Conectado à Plataforma AutoViral.');
    window.__AUTOVIRAL_CHROME_EXTENSION_INSTALLED__ = true;
    document.documentElement.setAttribute('data-autoviral-extension-installed', 'true');

    // Persist Instagram handle + accounts directly into AutoViral's localStorage so data arrives even if tab isn't open yet
    const persistInstagramDataToLocalStorage = (accounts, connectedHandle) => {
      try {
        if (connectedHandle && connectedHandle !== '@conectado') {
          const cleanHandle = '@' + String(connectedHandle).trim().replace(/^@+/, '').toLowerCase();
          localStorage.setItem('autoviral_insta_handle', cleanHandle);
        }
        if (Array.isArray(accounts) && accounts.length > 0) {
          let existing = [];
          try {
            const raw = localStorage.getItem('autoviral_insta_mapped_targets_v2');
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) existing = parsed;
            }
          } catch (e) {}
          const existingSet = new Set(existing.map((t) => (t.handle || '').toLowerCase()));
          const freshItems = accounts
            .filter((a) => a && (a.handle || a.username))
            .map((a, idx) => {
              const h = '@' + String(a.handle || a.username).replace(/^@+/, '').toLowerCase();
              return {
                id: `tgt-ext-${Date.now()}-${idx}-${h.slice(1, 8)}`,
                handle: h,
                name: a.name || h,
                followers: 'Mapeado Chrome',
                bio: 'Perfil real capturado via rolagem da Extensão Chrome AutoViral AI (ilimitado).',
                category: 'profile_follower',
                sourceQuery: 'chrome_extension_instagram',
                score: 95,
                selected: true,
                status: 'pending'
              };
            })
            .filter((item) => !existingSet.has(item.handle.toLowerCase()));
          if (freshItems.length > 0) {
            localStorage.setItem(
              'autoviral_insta_mapped_targets_v2',
              JSON.stringify([...freshItems, ...existing])
            );
          }
        }
      } catch (e) {}
    };

    const forwardExtensionEvent = (data) => {
      if (!data || !data.action) return;
      if (data.action === 'AUTOVIRAL_IMPORT_GROUPS_FROM_EXTENSION') {
        persistInstagramDataToLocalStorage(data.instaAccounts, data.connectedHandle);
        window.dispatchEvent(new CustomEvent('autoviral_extension_groups_received', {
          detail: {
            groups: data.groups,
            searchFolder: data.searchFolder,
            searchQuery: data.searchQuery,
            ytVideos: data.ytVideos,
            pinBoards: data.pinBoards,
            instaStories: data.instaStories,
            instaAccounts: data.instaAccounts,
            targetChannels: data.targetChannels,
            interval: data.interval,
            timestamp: data.timestamp
          }
        }));
        if (Array.isArray(data.instaAccounts) && data.instaAccounts.length > 0) {
          window.dispatchEvent(new CustomEvent('autoviral_extension_instagram_accounts_received', {
            detail: {
              accounts: data.instaAccounts,
              connectedHandle: data.connectedHandle,
              sourceUrl: data.sourceUrl,
              timestamp: data.timestamp
            }
          }));
        }
        if (Array.isArray(data.ytVideos) && data.ytVideos.length > 0) {
          window.dispatchEvent(new CustomEvent('autoviral_extension_youtube_videos_received', {
            detail: {
              videos: data.ytVideos,
              timestamp: data.timestamp
            }
          }));
        }
      } else if (data.action === 'AUTOVIRAL_IMPORT_YOUTUBE_VIDEOS_FROM_EXTENSION') {
        window.dispatchEvent(new CustomEvent('autoviral_extension_youtube_videos_received', {
          detail: {
            videos: data.videos || [],
            timestamp: data.timestamp
          }
        }));
      } else if (data.action === 'AUTOVIRAL_IMPORT_INSTAGRAM_ACCOUNTS') {
        persistInstagramDataToLocalStorage(data.accounts, data.connectedHandle);
        window.dispatchEvent(new CustomEvent('autoviral_extension_instagram_accounts_received', {
          detail: {
            accounts: data.accounts || [],
            connectedHandle: data.connectedHandle,
            sourceUrl: data.sourceUrl,
            timestamp: data.timestamp
          }
        }));
      } else if (data.action === 'AUTOVIRAL_INSTA_ACCOUNT_SYNC') {
        persistInstagramDataToLocalStorage(null, data.handle);
        window.dispatchEvent(new CustomEvent('autoviral_extension_insta_account_synced', {
          detail: {
            handle: data.handle,
            url: data.url,
            timestamp: data.timestamp
          }
        }));
      } else if (data.action === 'AUTOVIRAL_FB_POST_RESULT') {
        window.dispatchEvent(new CustomEvent('autoviral_fb_post_result', {
          detail: data
        }));
      } else if (data.action === 'AUTOVIRAL_GROUP_MEMBERSHIP_RESULT') {
        window.dispatchEvent(new CustomEvent('autoviral_group_membership_result', {
          detail: data
        }));
      } else if (data.action === 'AUTOVIRAL_MEMBERSHIP_BATCH_PROGRESS') {
        window.dispatchEvent(new CustomEvent('autoviral_membership_batch_progress', {
          detail: data
        }));
      } else if (data.action === 'AUTOVIRAL_WAITING_APPROVALS_SYNC') {
        window.dispatchEvent(new CustomEvent('autoviral_waiting_approvals_synced', {
          detail: data.waitingApprovals || []
        }));
      }
    };

    const pullExtensionCacheIntoAutoViral = () => {
      if (!chrome || !chrome.runtime || !chrome.runtime.sendMessage) return;
      chrome.runtime.sendMessage({ action: 'AUTOVIRAL_PULL_EXTENSION_CACHE' }, (res) => {
        void chrome.runtime.lastError;
        if (res && res.success) {
          persistInstagramDataToLocalStorage(res.accounts, res.connectedHandle);
          if (res.connectedHandle) {
            window.dispatchEvent(new CustomEvent('autoviral_extension_insta_account_synced', {
              detail: { handle: res.connectedHandle, timestamp: new Date().toISOString() }
            }));
          }
          if (Array.isArray(res.accounts) && res.accounts.length > 0) {
            window.dispatchEvent(new CustomEvent('autoviral_extension_instagram_accounts_received', {
              detail: {
                accounts: res.accounts,
                connectedHandle: res.connectedHandle,
                timestamp: new Date().toISOString()
              }
            }));
          }
          if (Array.isArray(res.groups) && res.groups.length > 0) {
            window.dispatchEvent(new CustomEvent('autoviral_extension_cached_groups_received', {
              detail: {
                groups: res.groups,
                timestamp: new Date().toISOString()
              }
            }));
          }
          window.dispatchEvent(new CustomEvent('autoviral_waiting_approvals_synced', {
            detail: Array.isArray(res.waitingApprovals) ? res.waitingApprovals : []
          }));
          window.dispatchEvent(new CustomEvent('autoviral_insta_sync_complete', {
            detail: {
              count: Array.isArray(res.accounts) ? res.accounts.length : 0,
              connectedHandle: res.connectedHandle || ''
            }
          }));
        }
      });
    };

    // Pull cached extension data on load
    setTimeout(pullExtensionCacheIntoAutoViral, 800);

    // Listen for outgoing commands from the AutoViral web app to the Chrome Extension
    window.addEventListener('message', (ev) => {
      if (ev.source !== window || !ev.data) return;
      if (ev.data.type === 'AUTOVIRAL_OPEN_GROUP_FOR_POST') {
        if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
          chrome.runtime.sendMessage({
            action: 'AUTOVIRAL_OPEN_GROUP_FOR_POST',
            logId: ev.data.logId,
            groupId: ev.data.groupId,
            groupUrl: ev.data.groupUrl,
            groupName: ev.data.groupName,
            fullText: ev.data.fullText || '',
            imageDataUrl: ev.data.imageDataUrl || '',
            autoJoinAndPost: ev.data.autoJoinAndPost !== false,
            joinOnly: Boolean(ev.data.joinOnly),
            silentMode: Boolean(ev.data.silentMode)
          }, () => { void chrome.runtime.lastError; });
        }
      } else if (ev.data.type === 'AUTOVIRAL_VERIFY_MEMBERSHIPS_BATCH') {
        if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
          chrome.runtime.sendMessage({
            action: 'AUTOVIRAL_VERIFY_MEMBERSHIPS_BATCH',
            groups: Array.isArray(ev.data.groups) ? ev.data.groups : [],
            batchId: ev.data.batchId || `batch-${Date.now()}`
          }, (res) => {
            void chrome.runtime.lastError;
            window.dispatchEvent(new CustomEvent('autoviral_membership_batch_done', {
              detail: res || { ok: false }
            }));
          });
        }
      } else if (ev.data.type === 'AUTOVIRAL_REQUEST_INSTA_SYNC' || ev.data.type === 'AUTOVIRAL_REQUEST_EXTENSION_GROUPS') {
        pullExtensionCacheIntoAutoViral();
      } else if (ev.data.type === 'AUTOVIRAL_CHECK_WAITING_APPROVALS') {
        if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
          chrome.runtime.sendMessage({
            action: 'AUTOVIRAL_CHECK_WAITING_APPROVALS',
            maxCount: ev.data.maxCount || 4
          }, (res) => {
            void chrome.runtime.lastError;
            window.dispatchEvent(new CustomEvent('autoviral_waiting_check_done', {
              detail: res || { ok: false }
            }));
          });
        }
      } else if (ev.data.type === 'AUTOVIRAL_REMOVE_WAITING_APPROVAL' && ev.data.groupSlug) {
        if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
          chrome.runtime.sendMessage({
            action: 'AUTOVIRAL_REMOVE_WAITING_APPROVAL',
            groupSlug: ev.data.groupSlug
          }, () => { void chrome.runtime.lastError; });
        }
      }
    });

    // Listen via BroadcastChannel for real-time inter-tab sync
    try {
      const bc = new BroadcastChannel('autoviral_bridge_channel');
      bc.onmessage = (ev) => {
        forwardExtensionEvent(ev.data);
      };
    } catch (e) {}

    // Forward messages from extension background
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (
        message.action === 'AUTOVIRAL_IMPORT_GROUPS_FROM_EXTENSION' ||
        message.action === 'AUTOVIRAL_IMPORT_YOUTUBE_VIDEOS_FROM_EXTENSION' ||
        message.action === 'AUTOVIRAL_IMPORT_INSTAGRAM_ACCOUNTS' ||
        message.action === 'AUTOVIRAL_INSTA_ACCOUNT_SYNC' ||
        message.action === 'AUTOVIRAL_FB_POST_RESULT' ||
        message.action === 'AUTOVIRAL_GROUP_MEMBERSHIP_RESULT' ||
        message.action === 'AUTOVIRAL_MEMBERSHIP_BATCH_PROGRESS' ||
        message.action === 'AUTOVIRAL_WAITING_APPROVALS_SYNC'
      ) {
        forwardExtensionEvent(message);
        sendResponse({ received: true });
      } else if (message.action === 'AUTOVIRAL_RESET_MAPPED_GROUPS') {
        window.dispatchEvent(new CustomEvent('autoviral_extension_groups_reset'));
        sendResponse({ received: true });
      }
      return true;
    });
  }
})();
