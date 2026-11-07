/*!
 * 🏛️ 꿈바온 디지털 도서관 (꿈디도) & 🕊️ 새오름 온라인 예배당 모바일 자동전환 컨트롤러 v5.0
 * - 스마트폰/태블릿 접속 시: 100% 자동으로 모바일 최적화 모드(.mobile-mode) 즉시 전환
 * - 상단 헤더 및 푸터에 [📱 모바일 ↔ 🖥️ PC화면] 원터치 전환 스위치 제공
 * - 3D 예배당/묵상원: 모바일 입장 시 대화창 기본 접힘(1줄 캡슐) + 상단 1줄 초슬림 바 + 상태배너 자동 페이드아웃
 */
(function initKkumdidoMobileMode() {
  'use strict';

  const STORAGE_KEY = 'kkumdido_view_mode_session';

  function detectIsMobileDevice() {
    const ua = navigator.userAgent || navigator.vendor || window.opera || '';
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet|KAKAOTALK|NAVER|Instagram|FBAN|FBAV/i.test(ua);
    const isTouch = window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    const isSmallScreen = window.innerWidth <= 1024 || window.screen.width <= 1024;
    return isMobileUA || isTouch || isSmallScreen;
  }

  function applyMode(mode) {
    const docEl = document.documentElement;
    const bodyEl = document.body;

    if (mode === 'mobile') {
      docEl.classList.add('mobile-mode');
      docEl.classList.remove('pc-override');
      if (bodyEl) {
        bodyEl.classList.add('mobile-mode');
        bodyEl.classList.remove('pc-override');
      }
    } else {
      docEl.classList.remove('mobile-mode');
      if (detectIsMobileDevice()) {
        docEl.classList.add('pc-override');
        if (bodyEl) bodyEl.classList.add('pc-override');
      } else {
        docEl.classList.remove('pc-override');
        if (bodyEl) bodyEl.classList.remove('pc-override');
      }
    }
    updateSwitchButtons(mode);
  }

  function getCurrentMode() {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved === 'pc' || saved === 'mobile') {
      return saved;
    }
    return detectIsMobileDevice() ? 'mobile' : 'pc';
  }

  window.setKkumdidoViewMode = function (mode) {
    sessionStorage.setItem(STORAGE_KEY, mode);
    applyMode(mode);
  };

  window.toggleKkumdidoViewMode = function () {
    const current = getCurrentMode();
    const next = current === 'mobile' ? 'pc' : 'mobile';
    window.setKkumdidoViewMode(next);
  };

  function ensurePcOverrideBanner() {
    if (!document.body || document.getElementById('kkumdidoPcOverrideBanner')) return;
    const banner = document.createElement('div');
    banner.id = 'kkumdidoPcOverrideBanner';
    banner.className = 'kkumdido-pc-override-banner';
    banner.innerHTML =
      '<span>🖥️ 현재 PC 와이드 화면 모드로 보고 계십니다</span>' +
      '<button type="button" onclick="window.setKkumdidoViewMode(\'mobile\')">📱 모바일 최적화로 전환</button>';
    document.body.insertBefore(banner, document.body.firstChild);
  }

  function ensureHeaderQuickSwitch() {
    if (!detectIsMobileDevice()) return;
    if (document.getElementById('kkumdidoHeaderModeBtn')) return;

    // 1) 도서관 본관 (.entrance-nav)
    const entranceNav = document.querySelector('.entrance-nav');
    if (entranceNav) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'kkumdidoHeaderModeBtn';
      btn.className = 'kkumdido-header-mode-btn';
      btn.onclick = window.toggleKkumdidoViewMode;
      entranceNav.appendChild(btn);
      return;
    }

    // 2) 3D 온라인 예배당 / 꿈디도 묵상원 (.top-bar .top-right)
    const chapelTopRight = document.querySelector('#canvas-wrap ~ .top-bar .top-right') || document.querySelector('.is-3d-chapel-page .top-bar .top-right');
    if (chapelTopRight) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'kkumdidoHeaderModeBtn';
      btn.className = 'hud-pill';
      btn.onclick = window.toggleKkumdidoViewMode;
      chapelTopRight.appendChild(btn);
      return;
    }

    // 3) 서브페이지 상단 액션바 (.top-actions / .header-actions / .header-right)
    const subHeaderActions = document.querySelector('.top-actions, .header-actions, .header-right');
    if (subHeaderActions) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'kkumdidoHeaderModeBtn';
      btn.className = 'btn-top kkumdido-header-mode-btn';
      btn.onclick = window.toggleKkumdidoViewMode;
      subHeaderActions.appendChild(btn);
    }
  }

  function updateSwitchButtons(mode) {
    const pcBanner = document.getElementById('kkumdidoPcOverrideBanner');
    if (pcBanner) {
      pcBanner.style.display = (mode === 'pc' && detectIsMobileDevice()) ? 'flex' : 'none';
    }
    const modeBtn = document.getElementById('kkumdidoFooterModeBtn');
    if (modeBtn) {
      modeBtn.innerHTML = mode === 'mobile' ? '🖥️ PC 와이드 화면으로 보기' : '📱 모바일 최적화 모드로 전환';
    }
    const headerBtn = document.getElementById('kkumdidoHeaderModeBtn');
    if (headerBtn) {
      headerBtn.innerHTML = mode === 'mobile' ? '🖥️ PC버전' : '📱 모바일버전';
      headerBtn.title = mode === 'mobile' ? 'PC 와이드 화면으로 전환' : '모바일 최적화 화면으로 전환';
    }
  }

  function optimize3DChapelForMobile() {
    const canvasWrap = document.getElementById('canvas-wrap');
    if (!canvasWrap) return;

    document.documentElement.classList.add('is-3d-chapel-page');
    if (document.body) document.body.classList.add('is-3d-chapel-page');

    // 상단 좌측 바에 도서관 홈 복귀 미니 버튼 추가
    const topLeft = document.querySelector('.top-bar .top-left');
    if (topLeft && !document.getElementById('btn-chapel-home-mobile')) {
      const hasHomeLink = topLeft.querySelector('a[href*="index.html"]');
      if (!hasHomeLink) {
        const homeLink = document.createElement('a');
        homeLink.id = 'btn-chapel-home-mobile';
        homeLink.className = 'hud-pill';
        homeLink.href = './index.html';
        homeLink.innerHTML = '<span>🏛️ 꿈디도 홈</span>';
        topLeft.insertBefore(homeLink, topLeft.firstChild);
      }
    }

    // 실시간 교제·기도 나눔 대화창 접기/펴기 동기화 (is-collapsed & is-folded 통합 및 모바일 기본 접힘)
    const chatlogBox = document.getElementById('chapel-chatlog');
    const chatStack = document.getElementById('chapel-chat-stack');
    const btnChatToggle = document.getElementById('btn-chatlog-toggle');
    const chatToggleLabel = document.getElementById('chatlog-toggle-label');

    function syncChapelChatFoldState(isCollapsed) {
      if (!chatlogBox || !chatStack) return;
      chatlogBox.classList.toggle('is-collapsed', isCollapsed);
      chatlogBox.classList.toggle('is-folded', isCollapsed);
      chatStack.classList.toggle('is-collapsed', isCollapsed);
      chatStack.classList.toggle('chat-is-collapsed', isCollapsed);
      if (chatToggleLabel) {
        const baseTitle = chatToggleLabel.textContent.includes('말씀') ? '💬 실시간 말씀·기도 나눔 & 포즈' : '💬 실시간 교제·기도 나눔 & 포즈';
        chatToggleLabel.textContent = isCollapsed ? `${baseTitle} (열기 ▲)` : `${baseTitle} (접기 ▼)`;
      }
    }

    if (chatlogBox && chatStack) {
      syncChapelChatFoldState(true);
      if (btnChatToggle) {
        btnChatToggle.addEventListener('click', function () {
          setTimeout(function () {
            const nowCollapsed = chatlogBox.classList.contains('is-collapsed');
            syncChapelChatFoldState(nowCollapsed);
          }, 0);
        });
      }
    }

    // 상단 상태 배너(#status-banner) 초기 접힘 유지 및 상태 변경 시 2.8초 표시 후 자동 페이드아웃
    const statusBanner = document.getElementById('status-banner');
    if (statusBanner) {
      statusBanner.classList.add('is-faded');
      let bannerTimer = null;
      const obs = new MutationObserver(function () {
        statusBanner.classList.remove('is-faded');
        clearTimeout(bannerTimer);
        bannerTimer = setTimeout(function () {
          statusBanner.classList.add('is-faded');
        }, 2800);
      });
      obs.observe(statusBanner, { childList: true, characterData: true, subtree: true });
    }
  }

  function setupTabBar() {
    const tabs = document.querySelectorAll('.kkumdido-mobile-tab-item');
    if (!tabs || tabs.length === 0) return;

    tabs.forEach(tab => {
      tab.addEventListener('click', function (e) {
        const action = this.getAttribute('data-tab-action');
        tabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');

        switch (action) {
          case 'home':
            if (this.tagName === 'BUTTON') {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            break;
          case 'halls':
            e.preventDefault();
            const hallsSection = document.getElementById('libraryShelves') || document.querySelector('.kkumdido-12halls-bar');
            if (hallsSection) {
              const topPos = hallsSection.getBoundingClientRect().top + window.pageYOffset - 55;
              window.scrollTo({ top: topPos, behavior: 'smooth' });
            }
            break;
          case 'search':
            e.preventDefault();
            if (typeof window.openQuickSearchModal === 'function') {
              window.openQuickSearchModal();
            } else if (typeof window.openKkumdidoQuickSearch === 'function') {
              window.openKkumdidoQuickSearch();
            } else {
              const searchInput = document.getElementById('searchInput') || document.getElementById('placeSearch');
              if (searchInput) {
                searchInput.focus();
                searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }
            break;
        }
      });
    });
  }

  applyMode(getCurrentMode());

  document.addEventListener('DOMContentLoaded', function () {
    ensurePcOverrideBanner();
    optimize3DChapelForMobile();
    ensureHeaderQuickSwitch();
    applyMode(getCurrentMode());
    setupTabBar();

    let resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (!sessionStorage.getItem(STORAGE_KEY)) {
          applyMode(detectIsMobileDevice() ? 'mobile' : 'pc');
        }
      }, 150);
    });
  });
})();
