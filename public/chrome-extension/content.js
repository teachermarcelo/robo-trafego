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

    // Function to parse all group cards currently visible in the DOM
    function scanVisibleGroups() {
      const detected = [];

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

        // 1. Send via BroadcastChannel (works between tabs in same browser immediately!)
        try {
          const bc = new BroadcastChannel('autoviral_bridge_channel');
          bc.postMessage({
            action: 'AUTOVIRAL_IMPORT_GROUPS_FROM_EXTENSION',
            groups: localMappedGroups,
            timestamp: new Date().toISOString()
          });
        } catch (e) {
          console.warn('[AutoViral AI] BroadcastChannel não suportado:', e);
        }

        // 2. Window postMessage fallback
        window.postMessage({
          type: 'AUTOVIRAL_IMPORT_GROUPS_FROM_EXTENSION',
          groups: localMappedGroups,
          timestamp: new Date().toISOString()
        }, '*');

        // 3. Extension message to background relay
        if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
          chrome.runtime.sendMessage({
            action: 'AUTOVIRAL_SYNC_WITH_PLATFORM',
            groups: localMappedGroups
          }, (res) => {
            alert(`✅ Sucesso! ${count} grupos mapeados foram sincronizados com o Painel AutoViral AI.`);
          });
        } else {
          alert(`✅ ${count} grupos mapeados foram enviados para sincronização via Broadcast!`);
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
  // 2. YOUTUBE AUTOMATION (COMMENTS & LIKES IN SELECTED URLS)
  // =========================================================================
  if (isYouTube) {
    console.log('[AutoViral AI] Conectado ao YouTube. Robô de Comentários & Likes Ativo.');

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'AUTOVIRAL_YOUTUBE_AUTO_ENGAGE') {
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
  if (currentHost.includes('instagram.com')) {
    console.log('[AutoViral AI] Conectado ao Instagram Web. Automação de Stories & Feed ATIVA.');

    // Inject small badge showing connected account
    const badge = document.createElement('div');
    badge.id = 'autoviral-insta-badge';
    badge.innerHTML = `
      <div style="position: fixed; bottom: 20px; left: 20px; z-index: 999999; background: #0f172a; color: #fff; padding: 8px 14px; border-radius: 9999px; font-family: sans-serif; font-size: 11px; font-weight: 700; border: 1px solid #c084fc; box-shadow: 0 4px 15px rgba(192, 132, 252, 0.4); display: flex; align-items: center; gap: 6px;">
        <span style="display: inline-block; width: 8px; height: 8px; background: #10b981; border-radius: 50%;"></span>
        <span>AutoViral AI • Stories com Link Clicável Conectado</span>
      </div>
    `;
    if (document.body) {
      document.body.appendChild(badge);
    } else {
      window.addEventListener('DOMContentLoaded', () => document.body.appendChild(badge));
    }

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'AUTOVIRAL_INSTA_PING') {
        sendResponse({ status: 'active', url: window.location.href, title: document.title });
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

    // Listen via BroadcastChannel for real-time inter-tab sync
    try {
      const bc = new BroadcastChannel('autoviral_bridge_channel');
      bc.onmessage = (ev) => {
        if (ev.data && ev.data.action === 'AUTOVIRAL_IMPORT_GROUPS_FROM_EXTENSION') {
          window.dispatchEvent(new CustomEvent('autoviral_extension_groups_received', {
            detail: {
              groups: ev.data.groups,
              ytVideos: ev.data.ytVideos,
              pinBoards: ev.data.pinBoards,
              instaStories: ev.data.instaStories,
              targetChannels: ev.data.targetChannels,
              interval: ev.data.interval,
              timestamp: ev.data.timestamp
            }
          }));
        }
      };
    } catch (e) {}

    // Forward messages from extension background
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'AUTOVIRAL_IMPORT_GROUPS_FROM_EXTENSION') {
        window.dispatchEvent(new CustomEvent('autoviral_extension_groups_received', {
          detail: {
            groups: message.groups,
            ytVideos: message.ytVideos,
            pinBoards: message.pinBoards,
            instaStories: message.instaStories,
            targetChannels: message.targetChannels,
            interval: message.interval,
            timestamp: message.timestamp
          }
        }));
        sendResponse({ received: true });
      } else if (message.action === 'AUTOVIRAL_RESET_MAPPED_GROUPS') {
        window.dispatchEvent(new CustomEvent('autoviral_extension_groups_reset'));
        sendResponse({ received: true });
      }
      return true;
    });
  }
})();
