// AutoViral AI Chrome Extension - Content Script V1.1.0
// Runs on Facebook, YouTube and AutoViral AI Web Platform

(function () {
  const currentHost = window.location.hostname;
  const isFacebook = currentHost.includes('facebook.com');
  const isYouTube = currentHost.includes('youtube.com');
  const isAutoViral = currentHost.includes('localhost') ||
                      currentHost.includes('vercel.app') ||
                      currentHost.includes('run.app') ||
                      document.title.includes('AutoViral');

  // =========================================================================
  // 1. FACEBOOK AUTO-SCROLL MAPPER & FLOATING WIDGET
  // =========================================================================
  if (isFacebook) {
    console.log('[AutoViral AI] Conectado ao Facebook. Auto-Scroll Mapeador ATIVO.');

    let localMappedGroups = [];
    let isWidgetVisible = true;

    // Load previously stored groups from chrome.storage
    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['autoviral_mapped_groups'], (res) => {
        if (res.autoviral_mapped_groups && Array.isArray(res.autoviral_mapped_groups)) {
          localMappedGroups = res.autoviral_mapped_groups;
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

    // Function to parse all group cards currently visible in the DOM
    function scanVisibleGroups() {
      const detected = [];
      const currentQuery = getFbCurrentSearchQuery();
      const currentFolder = (currentQuery.toLowerCase().includes('pedagog') || currentQuery.toLowerCase().includes('psico'))
        ? 'psicopedagogia'
        : (currentQuery.toLowerCase().includes('renda') ? 'renda_extra' : (currentQuery.toLowerCase().includes('curitiba') ? 'curitiba' : 'psicopedagogia'));

      // 1. Check all anchor links that lead to groups
      const links = document.querySelectorAll('a[href*="/groups/"]');
      links.forEach(link => {
        const href = link.href || '';
        // Skip navigation and create links
        if (
          href.includes('/create') ||
          href.includes('/feed') ||
          href.includes('/discover') ||
          href.includes('/joins') ||
          href.includes('/categories')
        ) return;

        // Clean URL to base group path (e.g. facebook.com/groups/pedagogiabrasil)
        const cleanUrl = href.split('?')[0].replace(/\/$/, '');
        const groupSlug = cleanUrl.split('/groups/')[1];
        if (!groupSlug || groupSlug.length < 2) return;

        // Traverse up to find container card
        const cardContainer = link.closest('div[role="article"]') ||
                              link.closest('div[role="feed"] > div') ||
                              link.closest('.x1yztbdb') ||
                              link.parentElement?.parentElement?.parentElement;

        const cardText = cardContainer ? cardContainer.innerText : (link.innerText || '');
        const nameCandidate = (link.innerText || '').trim();

        // Must look like a real group name
        if (nameCandidate.length >= 3 && !nameCandidate.includes('Participar') && !nameCandidate.includes('Ver mais')) {
          // Extract member count
          let membersCount = 15000;
          let postsPerDay = '10+ posts/dia';
          let isPublic = true;

          const memberMatch = cardText.match(/([0-9.,]+)\s*(mil|k)?\s*membros/i);
          if (memberMatch) {
            let num = parseFloat(memberMatch[1].replace(/\./g, '').replace(',', '.'));
            if (memberMatch[2] && (memberMatch[2].toLowerCase() === 'mil' || memberMatch[2].toLowerCase() === 'k')) {
              num = num * 1000;
            }
            membersCount = Math.round(num);
          }

          const postsMatch = cardText.match(/([0-9]+(\+)?\s*(post|publicação|publicações)\s*(por|ao)\s*dia)/i);
          if (postsMatch) {
            postsPerDay = postsMatch[0];
          }

          if (cardText.includes('Privado') || cardText.includes('Grupo privado')) {
            isPublic = false;
          }

          const alreadyAdded = detected.some(g => g.url === cleanUrl || g.name === nameCandidate);
          if (!alreadyAdded) {
            detected.push({
              id: 'fb-grp-' + groupSlug.replace(/[^a-zA-Z0-9_-]/g, ''),
              name: nameCandidate,
              url: cleanUrl,
              membersCount: membersCount,
              postsPerDay: postsPerDay,
              privacy: isPublic ? 'Público' : 'Privado',
              niche: categorizeNiche(nameCandidate),
              searchTerm: currentQuery || 'psicopedagogia',
              searchFolder: currentFolder,
              mappedAt: new Date().toLocaleDateString('pt-BR'),
              dispatchCount: 0,
              status: 'ready'
            });
          }
        }
      });

      // Merge with stored groups
      let hasNew = false;
      detected.forEach(g => {
        const exists = localMappedGroups.some(eg => eg.name === g.name || eg.url === g.url);
        if (!exists) {
          localMappedGroups.unshift(g);
          hasNew = true;
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
        padding: 12px 16px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.8), 0 0 15px rgba(16, 185, 129, 0.3);
        color: #f8fafc;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        min-width: 250px;
        transition: transform 0.2s ease;
      `;

      badge.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 6px;">
          <div style="display: flex; align-items: center; gap: 6px; font-weight: 800; color: #10b981;">
            <span>🚀 AutoViral AI</span>
            <span style="background: #064e3b; color: #34d399; font-size: 10px; padding: 1px 6px; border-radius: 999px; font-weight: 600;">Mapeador Ativo</span>
          </div>
          <button id="autoviral-badge-close" style="background: transparent; border: none; color: #94a3b8; cursor: pointer; font-size: 12px;">✕</button>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span style="color: #cbd5e1;">Grupos Mapeados nesta tela:</span>
          <strong id="autoviral-badge-count" style="color: #fbbf24; font-size: 14px; font-weight: 900;">0</strong>
        </div>
        <div style="font-size: 10px; color: #94a3b8; line-height: 1.3;">
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
      `;

      document.body.appendChild(badge);

      document.getElementById('autoviral-badge-close').onclick = () => {
        badge.style.display = 'none';
        isWidgetVisible = false;
      };

      document.getElementById('autoviral-badge-sync').onclick = () => {
        const count = localMappedGroups.length;
        const currentQuery = getFbCurrentSearchQuery();
        const currentFolder = (currentQuery.toLowerCase().includes('pedagog') || currentQuery.toLowerCase().includes('psico'))
          ? 'psicopedagogia'
          : (currentQuery.toLowerCase().includes('renda') ? 'renda_extra' : (currentQuery.toLowerCase().includes('curitiba') ? 'curitiba' : 'psicopedagogia'));

        // 1. Send via BroadcastChannel (works between tabs in same browser immediately!)
        try {
          const bc = new BroadcastChannel('autoviral_bridge_channel');
          bc.postMessage({
            action: 'AUTOVIRAL_IMPORT_GROUPS_FROM_EXTENSION',
            groups: localMappedGroups,
            searchFolder: currentFolder,
            searchQuery: currentQuery,
            timestamp: new Date().toISOString()
          });
        } catch (e) {
          console.warn('[AutoViral AI] BroadcastChannel não suportado:', e);
        }

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
          }, (res) => {
            alert(`✅ Sucesso! ${count} grupos mapeados da pasta "${currentQuery || 'Psicopedagogia'}" foram sincronizados com o Painel AutoViral AI.`);
          });
        } else {
          alert(`✅ ${count} grupos mapeados da pasta "${currentQuery || 'Psicopedagogia'}" foram enviados para sincronização via Broadcast!`);
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

    // Message listener for popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'AUTOVIRAL_MAP_GROUPS' || request.action === 'AUTOVIRAL_GET_GROUPS') {
        scanVisibleGroups();
        sendResponse({ success: true, groups: localMappedGroups, currentUrl: window.location.href });
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

    function scanYouTubeSearchResults() {
      if (!window.location.href.includes('/results')) return;

      const detected = [];
      const videoElements = document.querySelectorAll('ytd-video-renderer, ytd-rich-item-renderer');

      videoElements.forEach((el, index) => {
        const titleLink = el.querySelector('a#video-title') || el.querySelector('a#thumbnail');
        if (!titleLink) return;

        const href = titleLink.getAttribute('href') || titleLink.href || '';
        if (!href.includes('/watch?v=')) return;

        const fullUrl = href.startsWith('http') ? href : `https://www.youtube.com${href}`;
        const cleanUrl = fullUrl.split('&')[0]; // strip time and list params

        const titleEl = el.querySelector('#video-title') || el.querySelector('yt-formatted-string');
        const title = (titleEl ? titleEl.innerText : '').trim();

        const channelEl = el.querySelector('#channel-name, ytd-channel-name');
        const channelName = (channelEl ? channelEl.innerText : 'Canal do YouTube').trim();

        const metadataEl = el.querySelector('#metadata-line, .ytd-video-meta-block');
        const viewsCount = metadataEl ? metadataEl.innerText.split('\n')[0] : 'Visualizações ativas';

        const imgEl = el.querySelector('yt-image img, img');
        const thumbnailUrl = imgEl ? (imgEl.src || imgEl.getAttribute('src') || '') : '';

        if (title.length > 3 && cleanUrl.includes('/watch?v=')) {
          const alreadyAdded = detected.some(v => v.url === cleanUrl);
          if (!alreadyAdded) {
            detected.push({
              id: `yt-${Date.now()}-${index}`,
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
            localMappedVideos.push(d);
            hasNew = true;
          }
        });

        if (hasNew) {
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
        padding: 12px 16px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.8), 0 0 15px rgba(239, 68, 68, 0.3);
        color: #f8fafc;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        min-width: 250px;
      `;

      badge.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #334155; padding-bottom: 6px;">
          <div style="display: flex; align-items: center; gap: 6px; font-weight: 800; color: #ef4444;">
            <span>▶️ AutoViral AI</span>
            <span style="background: #450a0a; color: #fca5a5; font-size: 10px; padding: 1px 6px; border-radius: 999px; font-weight: 600;">YouTube Mapeador</span>
          </div>
          <button id="autoviral-yt-badge-close" style="background: transparent; border: none; color: #94a3b8; cursor: pointer; font-size: 12px;">✕</button>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span style="color: #cbd5e1;">Vídeos da Busca Mapeados:</span>
          <strong id="autoviral-yt-badge-count" style="color: #f59e0b; font-size: 14px; font-weight: 900;">0</strong>
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
      `;

      document.body.appendChild(badge);

      document.getElementById('autoviral-yt-badge-close').onclick = () => {
        badge.style.display = 'none';
        isYtWidgetVisible = false;
      };

      document.getElementById('autoviral-yt-badge-sync').onclick = () => {
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

        alert(`✅ ${count} vídeos reais do YouTube foram sincronizados com o Painel AutoViral AI!`);
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
        const anchors = document.querySelectorAll('a[href^="/"]');
        anchors.forEach((a) => {
          const href = a.getAttribute('href') || '';
          if (!href || href === '/' || href.includes('?')) return;

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
        chrome.runtime.sendMessage(payload);
        chrome.runtime.sendMessage({
          action: 'AUTOVIRAL_INSTA_ACCOUNT_SYNC',
          handle: connectedHandle
        });
      }
      setInstaWidgetStatus(`✅ ${list.length} contas enviadas para AutoViral!`, '#34d399');
    }

    // Inject Floating Instagram Defense & Unlimited Mapper Widget
    const badge = document.createElement('div');
    badge.id = 'autoviral-insta-defense-badge';
    badge.innerHTML = `
      <div style="position: fixed; bottom: 20px; left: 20px; z-index: 999999; background: #090d16; color: #fff; padding: 12px 16px; border-radius: 16px; font-family: system-ui, -apple-system, sans-serif; font-size: 11px; font-weight: 700; border: 1px solid #a855f7; box-shadow: 0 10px 25px rgba(0,0,0,0.7), 0 0 15px rgba(168, 85, 247, 0.3); display: flex; flex-direction: column; gap: 7px; width: 280px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 8px #10b981;"></span>
            <span style="color: #c084fc; font-weight: 900;">AutoViral AI • Instagram</span>
          </div>
          <span style="font-size: 9px; background: rgba(16, 185, 129, 0.15); color: #34d399; padding: 2px 6px; border-radius: 6px; border: 1px solid rgba(16, 185, 129, 0.4);">
            ILIMITADO
          </span>
        </div>
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
            📡 Enviar p/ Grupo
          </button>
        </div>
        <button id="btn-sync-only-handle" style="background: linear-gradient(135deg, #9333ea, #c026d3); color: #fff; border: none; padding: 6px 10px; border-radius: 8px; font-size: 10px; font-weight: 800; cursor: pointer;">
          🛡️ Confirmar Conta Conectada para Stories
        </button>
        <div id="autoviral-insta-widget-status" style="font-size: 9px; color: #94a3b8; line-height: 1.3;">
          Role a busca, seguidores ou comentários para capturar contas sem limite.
        </div>
      </div>
    `;
    if (document.body) {
      document.body.appendChild(badge);
    } else {
      window.addEventListener('DOMContentLoaded', () => document.body.appendChild(badge));
    }

    setTimeout(() => {
      scanVisibleInstagramAccounts();

      const btnScanInsta = document.getElementById('btn-scan-insta-accounts');
      if (btnScanInsta) {
        btnScanInsta.onclick = () => {
          const { list, newFound } = scanVisibleInstagramAccounts();
          setInstaWidgetStatus(`🔍 Capturadas +${newFound} novas (${list.length} total no grupo)!`, '#38bdf8');
        };
      }

      const btnSendGroup = document.getElementById('btn-sync-insta-to-platform');
      if (btnSendGroup) {
        btnSendGroup.onclick = () => {
          sendInstagramAccountsToAutoViral();
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
            });
          }
          setInstaWidgetStatus(`✅ Conta ${connectedHandle} confirmada nos Stories & Direct!`, '#34d399');
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

    const forwardExtensionEvent = (data) => {
      if (!data || !data.action) return;
      if (data.action === 'AUTOVIRAL_IMPORT_GROUPS_FROM_EXTENSION') {
        window.dispatchEvent(new CustomEvent('autoviral_extension_groups_received', {
          detail: {
            groups: data.groups,
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
      } else if (data.action === 'AUTOVIRAL_IMPORT_INSTAGRAM_ACCOUNTS') {
        window.dispatchEvent(new CustomEvent('autoviral_extension_instagram_accounts_received', {
          detail: {
            accounts: data.accounts || [],
            connectedHandle: data.connectedHandle,
            sourceUrl: data.sourceUrl,
            timestamp: data.timestamp
          }
        }));
      } else if (data.action === 'AUTOVIRAL_INSTA_ACCOUNT_SYNC') {
        window.dispatchEvent(new CustomEvent('autoviral_extension_insta_account_synced', {
          detail: {
            handle: data.handle,
            url: data.url,
            timestamp: data.timestamp
          }
        }));
      }
    };

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
        message.action === 'AUTOVIRAL_IMPORT_INSTAGRAM_ACCOUNTS' ||
        message.action === 'AUTOVIRAL_INSTA_ACCOUNT_SYNC'
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
