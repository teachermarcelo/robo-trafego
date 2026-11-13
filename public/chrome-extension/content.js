// AutoViral AI Chrome Extension - Content Script V1.1.0
// Runs on Facebook, YouTube and AutoViral AI Web Platform

(function () {
  if (window.__AUTOVIRAL_CONTENT_SCRIPT_INITIALIZED__) {
    return;
  }
  window.__AUTOVIRAL_CONTENT_SCRIPT_INITIALIZED__ = true;

  const currentHost = window.location.hostname;
  const isFacebook = currentHost.includes('facebook.com');
  const isYouTube = currentHost.includes('youtube.com');
  const isAutoViral = currentHost.includes('localhost') ||
                      currentHost.includes('vercel.app') ||
                      currentHost.includes('run.app') ||
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
      const searchInput = document.querySelector('input[type="search"], input[aria-label*="Pesquisar"], input[placeholder*="Pesquisar"]');
      if (searchInput && searchInput.value) return searchInput.value.trim();
      return 'psicopedagogia';
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
              !/^(público|privado)(\s*·|$)/i.test(s) &&
              !/^\d[\d.,\s]*(mil|k|m)?\s*membros?/i.test(s) &&
              !/posts?\s*(por|ao)\s*dia/i.test(s)
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

          const memberMatch = rawCardText.match(/([0-9]+(?:[.,][0-9]+)?)\s*(mil|k|mi)?\s*membros?/i);
          if (memberMatch) {
            let numStr = memberMatch[1];
            const suffix = (memberMatch[2] || '').toLowerCase();
            if (suffix === 'mil' || suffix === 'k') {
              numStr = numStr.replace(',', '.');
              membersCount = Math.round(parseFloat(numStr) * 1000);
            } else if (suffix === 'mi') {
              numStr = numStr.replace(',', '.');
              membersCount = Math.round(parseFloat(numStr) * 1000000);
            } else {
              membersCount = Math.round(parseFloat(numStr.replace(/\./g, '').replace(',', '.')));
            }
          }

          const postsMatch = rawCardText.match(/([0-9]+(\+)?\s*(post|publicação|publicações)\s*(por|ao)\s*dia)/i);
          if (postsMatch) {
            postsPerDay = postsMatch[0];
          }

          if (/privado/i.test(rawCardText)) {
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

    // Auto-Scroll Listener: Scan whenever user scrolls down to see more groups
    let scrollTimeout = null;
    window.addEventListener('scroll', () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        scanVisibleGroups();
      }, 400);
    }, { passive: true });

    // MutationObserver to detect new DOM elements when Facebook injects more results
    const observer = new MutationObserver(() => {
      scanVisibleGroups();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial scan
    setTimeout(scanVisibleGroups, 1200);

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
    // 1B. REAL GROUP POST ASSISTANT & MEMBERSHIP CHECKER (/groups/...)
    // =====================================================================
    function isUserNotMemberOfCurrentGroup() {
      try {
        const btns = Array.from(document.querySelectorAll('div[role="button"], button, a[role="button"]'));
        for (const el of btns) {
          const txt = ((el.innerText || el.getAttribute('aria-label') || '') + '').trim().toLowerCase();
          if (txt === 'participar do grupo' || txt === 'join group' || txt === 'entrar no grupo') {
            return true;
          }
        }
      } catch (e) {}
      return false;
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

    function initGroupPostAssistant() {
      if (!window.location.pathname.includes('/groups/')) return;
      if (!chrome.storage || !chrome.storage.local) return;

      chrome.storage.local.get(['autoviral_pending_fb_post'], (res) => {
        const pending = res.autoviral_pending_fb_post;
        const notMember = isUserNotMemberOfCurrentGroup();
        createFloatingWidget();
        const badge = document.getElementById('autoviral-fb-body') || document.getElementById('autoviral-floating-badge');
        if (!badge || document.getElementById('autoviral-post-assistant')) return;

        const box = document.createElement('div');
        box.id = 'autoviral-post-assistant';
        box.style.cssText = 'border-top: 1px solid #334155; padding-top: 8px; margin-top: 4px; display: flex; flex-direction: column; gap: 6px;';

        if (notMember) {
          box.innerHTML = `
            <div style="background: rgba(225,29,72,0.18); border: 1px solid #fb7185; color: #fecdd3; padding: 6px 8px; border-radius: 8px; font-size: 10px; line-height: 1.35;">
              <strong>⚠️ Você ainda NÃO participa deste grupo!</strong><br/>
              Clique no botão azul <strong>"Participar do grupo"</strong> acima primeiro.
            </div>
            <button id="autoviral-btn-report-not-member" style="background: #be123c; color: #fff; border: none; border-radius: 7px; padding: 6px 8px; font-size: 10px; font-weight: 700; cursor: pointer;">
              Avisar Painel: Preciso Participar
            </button>
          `;
          badge.appendChild(box);
          if (pending) {
            sendRealPostResultToPlatform({
              logId: pending.logId,
              groupId: pending.groupId,
              groupUrl: window.location.href,
              approvalStatus: 'not_member'
            });
          }
          const btnNotMem = document.getElementById('autoviral-btn-report-not-member');
          if (btnNotMem) {
            btnNotMem.onclick = () => {
              sendRealPostResultToPlatform({
                logId: pending ? pending.logId : '',
                groupId: pending ? pending.groupId : '',
                groupUrl: window.location.href,
                approvalStatus: 'not_member'
              });
              btnNotMem.textContent = '✓ Status "Preciso Participar" enviado!';
            };
          }
          return;
        }

        if (pending && pending.fullText) {
          box.innerHTML = `
            <div style="font-size: 10px; color: #34d399; font-weight: 800;">
              📋 Post Pronto Para Este Grupo:
            </div>
            <button id="autoviral-btn-copy-fill" style="background: #2563eb; color: #fff; border: none; border-radius: 7px; padding: 7px 8px; font-size: 10px; font-weight: 700; cursor: pointer;">
              1. Copiar Texto &amp; Abrir Caixa de Post
            </button>
            <div style="display: flex; gap: 4px;">
              <button id="autoviral-btn-confirm-pub" style="flex: 1; background: #10b981; color: #022c22; border: none; border-radius: 7px; padding: 6px; font-size: 10px; font-weight: 800; cursor: pointer;">
                ✓ Postagem Feita
              </button>
              <button id="autoviral-btn-confirm-admin" style="flex: 1; background: #f59e0b; color: #1c1917; border: none; border-radius: 7px; padding: 6px; font-size: 10px; font-weight: 800; cursor: pointer;">
                ⏳ Aguard. Admin
              </button>
            </div>
            <div id="autoviral-post-assist-msg" style="font-size: 9px; color: #94a3b8;">
              Cole (Ctrl+V) na caixa do grupo, anexe a imagem e confirme o resultado real acima.
            </div>
          `;
          badge.appendChild(box);

          const msgEl = document.getElementById('autoviral-post-assist-msg');
          const btnFill = document.getElementById('autoviral-btn-copy-fill');
          if (btnFill) {
            btnFill.onclick = async () => {
              try {
                await navigator.clipboard.writeText(pending.fullText);
              } catch (e) {}
              // Try opening Facebook's "Escreva algo..." / "Write something..." composer
              const composerTriggers = Array.from(document.querySelectorAll('div[role="button"], span'));
              const trigger = composerTriggers.find((el) => {
                const t = (el.innerText || '').trim().toLowerCase();
                return t.includes('escreva algo') || t.includes('write something') || t.includes('criar publicação pública');
              });
              if (trigger) {
                trigger.click();
                setTimeout(() => {
                  const textbox = document.querySelector('div[role="dialog"] div[role="textbox"][contenteditable="true"], div[role="textbox"][contenteditable="true"]');
                  if (textbox) {
                    textbox.focus();
                    try {
                      document.execCommand('insertText', false, pending.fullText);
                    } catch (e) {}
                  }
                }, 900);
              }
              if (msgEl) {
                msgEl.textContent = '✅ Texto copiado! Se não colou sozinho, aperte Ctrl+V no campo do grupo e clique Publicar.';
                msgEl.style.color = '#34d399';
              }
            };
          }

          const btnPub = document.getElementById('autoviral-btn-confirm-pub');
          if (btnPub) {
            btnPub.onclick = () => {
              sendRealPostResultToPlatform({
                logId: pending.logId,
                groupId: pending.groupId,
                groupUrl: window.location.href,
                approvalStatus: 'published'
              });
              chrome.storage.local.remove(['autoviral_pending_fb_post']);
              if (msgEl) {
                msgEl.textContent = '✅ Confirmado como POSTAGEM FEITA no AutoViral!';
                msgEl.style.color = '#34d399';
              }
            };
          }

          const btnAdm = document.getElementById('autoviral-btn-confirm-admin');
          if (btnAdm) {
            btnAdm.onclick = () => {
              sendRealPostResultToPlatform({
                logId: pending.logId,
                groupId: pending.groupId,
                groupUrl: window.location.href,
                approvalStatus: 'awaiting_admin'
              });
              chrome.storage.local.remove(['autoviral_pending_fb_post']);
              if (msgEl) {
                msgEl.textContent = '⏳ Confirmado como AGUARDANDO ADMIN no AutoViral!';
                msgEl.style.color = '#fbbf24';
              }
            };
          }

          // Watch for Facebook admin approval toast automatically
          let approvalNotified = false;
          const approvalCheck = setInterval(() => {
            if (approvalNotified) return;
            const bodyTxt = (document.body ? document.body.innerText : '').toLowerCase();
            if (
              bodyTxt.includes('aguardando aprovação de um administrador') ||
              bodyTxt.includes('pendente de aprovação do administrador') ||
              bodyTxt.includes('pending admin approval') ||
              bodyTxt.includes('sent for admin approval')
            ) {
              approvalNotified = true;
              sendRealPostResultToPlatform({
                logId: pending.logId,
                groupId: pending.groupId,
                groupUrl: window.location.href,
                approvalStatus: 'awaiting_admin'
              });
              if (msgEl) {
                msgEl.textContent = '⏳ Facebook informou aprovação pendente do admin — status atualizado no painel!';
                msgEl.style.color = '#fbbf24';
              }
              clearInterval(approvalCheck);
            }
          }, 2500);
          setTimeout(() => clearInterval(approvalCheck), 180000);
        }
      });
    }

    setTimeout(initGroupPostAssistant, 1800);

    // Message listener for popup
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
            fullText: ev.data.fullText
          }, () => { void chrome.runtime.lastError; });
        }
      } else if (ev.data.type === 'AUTOVIRAL_REQUEST_INSTA_SYNC') {
        pullExtensionCacheIntoAutoViral();
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
        message.action === 'AUTOVIRAL_FB_POST_RESULT'
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
