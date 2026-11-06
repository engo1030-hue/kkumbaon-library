/*!
 * 🏛️ 꿈바온 디지털 도서관 (꿈디도) 모바일 특화 모드 컨트롤러 v3.0 (Compact Edition)
 * - PC 접속 시: 기존 1440px 와이드 디자인 100% 온전 유지
 * - 모바일 접속 시: 100% 자동으로 모바일 전용 컴팩트 버전으로 즉시 전환
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

  function updateSwitchButtons(mode) {
    const pcBanner = document.getElementById('kkumdidoPcOverrideBanner');
    if (pcBanner) {
      pcBanner.style.display = (mode === 'pc' && detectIsMobileDevice()) ? 'flex' : 'none';
    }
    const modeBtn = document.getElementById('kkumdidoFooterModeBtn');
    if (modeBtn) {
      modeBtn.innerHTML = mode === 'mobile' ? '🖥️ PC 와이드 화면으로 보기' : '📱 모바일 최적화 모드로 전환';
    }
  }

  function optimize3DChapelForMobile() {
    const canvasWrap = document.getElementById('canvas-wrap');
    if (!canvasWrap) return;

    document.documentElement.classList.add('is-3d-chapel-page');
    if (document.body) document.body.classList.add('is-3d-chapel-page');

    // 상단 좌측 바에 도서관 홈 복귀 미니 버튼 추가 (모바일에서 탭바 대신 활용)
    const topLeft = document.querySelector('.top-bar .top-left');
    if (topLeft && !document.getElementById('btn-chapel-home-mobile')) {
      const homeLink = document.createElement('a');
      homeLink.id = 'btn-chapel-home-mobile';
      homeLink.className = 'hud-pill';
      homeLink.href = './index.html';
      homeLink.innerHTML = '<span>🏛️ 홈</span>';
      topLeft.insertBefore(homeLink, topLeft.firstChild);
    }

    // 모바일에서 상태 배너 문구를 한 줄로 간결하게 다듬기
    if (getCurrentMode() === 'mobile') {
      const statusBanner = document.getElementById('status-banner');
      if (statusBanner && statusBanner.textContent.length > 28) {
        statusBanner.dataset.fullText = statusBanner.textContent.trim();
        statusBanner.textContent = '바닥 터치로 이동 · 빈 의자 착석 · 강단 앞 무릎기도';
      }
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
    applyMode(getCurrentMode());
    optimize3DChapelForMobile();
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
