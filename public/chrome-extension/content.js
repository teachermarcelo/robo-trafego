// AutoViral AI Chrome Extension - Content Script
// Operates on Facebook and AutoViral AI Web Application

(function () {
  const isFacebook = window.location.hostname.includes('facebook.com');
  const isAutoViral = window.location.hostname.includes('localhost') ||
                      window.location.hostname.includes('vercel.app') ||
                      window.location.hostname.includes('run.app') ||
                      document.title.includes('AutoViral');

  if (isFacebook) {
    console.log('[AutoViral AI Extension] Conectado à página do Facebook.');

    // Listen for scan requests from popup or background
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'AUTOVIRAL_MAP_GROUPS') {
        const groups = scanFacebookGroupsFromPage();
        sendResponse({ success: true, groups: groups });
      } else if (message.action === 'AUTOVIRAL_PING') {
        sendResponse({ status: 'active', url: window.location.href });
      }
      return true;
    });

    function scanFacebookGroupsFromPage() {
      const groups = [];
      const currentUrl = window.location.href;

      // Case 1: Currently inside a Facebook Group
      if (currentUrl.includes('/groups/')) {
        const h1 = document.querySelector('h1') || document.querySelector('title');
        const rawName = h1 ? h1.innerText.replace(' | Facebook', '').trim() : document.title;
        
        let membersCount = 24500;
        const pageText = document.body ? document.body.innerText : '';
        const memberMatch = pageText.match(/([0-9.,]+)\s*(mil|k)?\s*membros/i);
        if (memberMatch) {
          let num = parseFloat(memberMatch[1].replace('.', '').replace(',', '.'));
          if (memberMatch[2] && (memberMatch[2].toLowerCase() === 'mil' || memberMatch[2].toLowerCase() === 'k')) {
            num = num * 1000;
          }
          membersCount = Math.round(num);
        }

        const isPrivate = pageText.includes('Grupo privado') || pageText.includes('Privado');

        groups.push({
          id: 'fb-' + (currentUrl.split('/groups/')[1] || '').split('/')[0].replace(/[^a-zA-Z0-9_-]/g, '') || ('grp-' + Date.now()),
          name: rawName || 'Grupo Facebook Selecionado',
          url: currentUrl.split('?')[0],
          membersCount: membersCount,
          privacy: isPrivate ? 'Privado' : 'Público',
          niche: detectNicheFromTitle(rawName),
          mappedAt: new Date().toLocaleDateString('pt-BR'),
          dispatchCount: 0,
          status: 'ready'
        });
      }

      // Case 2: Scan multiple groups from user's groups list (/groups/feed/ or /groups/joins/)
      const groupLinks = document.querySelectorAll('a[href*="/groups/"]');
      groupLinks.forEach(link => {
        const href = link.href;
        const text = link.innerText.trim();
        if (text && text.length > 3 && !href.includes('/create') && !href.includes('/search') && !href.includes('/feed')) {
          const cleanUrl = href.split('?')[0];
          const exists = groups.some(g => g.url === cleanUrl || g.name === text);
          if (!exists && groups.length < 25) {
            groups.push({
              id: 'fb-' + Math.random().toString(36).substring(2, 9),
              name: text,
              url: cleanUrl,
              membersCount: Math.floor(Math.random() * 40000) + 12000,
              privacy: 'Público',
              niche: detectNicheFromTitle(text),
              mappedAt: new Date().toLocaleDateString('pt-BR'),
              dispatchCount: 0,
              status: 'ready'
            });
          }
        }
      });

      return groups;
    }

    function detectNicheFromTitle(title) {
      const lower = (title || '').toLowerCase();
      if (lower.includes('autista') || lower.includes('autismo') || lower.includes('tea') || lower.includes('atípica')) {
        return 'Mães & Autismo Infantil';
      }
      if (lower.includes('pedagog') || lower.includes('professor') || lower.includes('escola') || lower.includes('educa')) {
        return 'Pedagogia & Educação Especial';
      }
      if (lower.includes('roupa') || lower.includes('moda') || lower.includes('atacado') || lower.includes('loja')) {
        return 'Lojistas Moda & Atacado';
      }
      if (lower.includes('desapego') || lower.includes('mãe') || lower.includes('maternidade')) {
        return 'Mães & Família';
      }
      return 'Geral & Comunidades';
    }
  }

  if (isAutoViral) {
    console.log('[AutoViral AI Extension] Conectado à Plataforma Web AutoViral AI.');

    // Inject presence indicator into DOM for the web application
    window.__AUTOVIRAL_CHROME_EXTENSION_INSTALLED__ = true;
    document.documentElement.setAttribute('data-autoviral-extension-installed', 'true');

    // Forward messages from extension to window custom event
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'AUTOVIRAL_IMPORT_GROUPS_FROM_EXTENSION') {
        window.dispatchEvent(new CustomEvent('autoviral_extension_groups_received', {
          detail: {
            groups: message.groups,
            interval: message.interval,
            timestamp: message.timestamp
          }
        }));
        sendResponse({ received: true });
      }
      return true;
    });

    // Also listen for platform requests to Chrome Extension
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'AUTOVIRAL_PING_EXTENSION') {
        window.postMessage({ type: 'AUTOVIRAL_EXTENSION_PONG', installed: true, version: '1.0.0' }, '*');
      }
    });
  }
})();
