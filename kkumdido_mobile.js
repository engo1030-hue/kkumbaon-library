/*!
 * 🏛️ 꿈바온 디지털 도서관 (꿈디도) 모바일 특화 모드 컨트롤러 v1.0
 * - PC 접속 시: 기존 1440px 와이드 디자인 100% 온전 유지
 * - 모바일 접속 시: 모바일 전용 앱(PWA) 스타일 레이아웃 & 하단 엄지 탭바 자동 활성화
 * - PC ↔ 모바일 수동 스위처 지원
 */
(function initKkumdidoMobileMode() {
  'use strict';

  const STORAGE_KEY = 'kkumdido_view_mode'; // 'mobile' | 'pc' | null

  // 1. 디바이스 판별 함수
  function detectIsMobileDevice() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i.test(ua);
    const isSmallScreen = window.innerWidth <= 1024;
    return isMobileUA || isSmallScreen;
  }

  // 2. 모드 적용 함수
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
      docEl.classList.add('pc-override');
      if (bodyEl) {
        bodyEl.classList.remove('mobile-mode');
        bodyEl.classList.add('pc-override');
      }
    }
    updateSwitchButtons(mode);
  }

  // 3. 현재 모드 결정
  function getCurrentMode() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'pc' || saved === 'mobile') {
      return saved;
    }
    return detectIsMobileDevice() ? 'mobile' : 'pc';
  }

  // 4. 모드 전환 (사용자 명시적 토글)
  window.setKkumdidoViewMode = function (mode) {
    localStorage.setItem(STORAGE_KEY, mode);
    applyMode(mode);
  };

  window.toggleKkumdidoViewMode = function () {
    const current = getCurrentMode();
    const next = current === 'mobile' ? 'pc' : 'mobile';
    window.setKkumdidoViewMode(next);
  };

  // 5. 스위처 버튼 상태 갱신
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

  // 6. 하단 엄지 탭바 탭 전환 리스너
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
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            break;
          case 'halls':
            e.preventDefault();
            const hallsSection = document.getElementById('libraryShelves') || document.querySelector('.kkumdido-12halls-bar');
            if (hallsSection) {
              const topPos = hallsSection.getBoundingClientRect().top + window.pageYOffset - 65;
              window.scrollTo({ top: topPos, behavior: 'smooth' });
            }
            break;
          case 'sermon':
            // 설교스튜디오 새 창 또는 이동
            break;
          case 'chapel':
            // 채플 링크 정상 이동
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

  // 7. 초기 실행 (DOM Ready 전 즉시 클래스 적용으로 화면 깜빡임 방지)
  const initialMode = getCurrentMode();
  applyMode(initialMode);

  // 8. DOM 완료 후 UI 및 이벤트 바인딩
  document.addEventListener('DOMContentLoaded', function () {
    applyMode(getCurrentMode());
    setupTabBar();

    // 화면 리사이즈 시 (수동 저장이 없을 때 자동 반응)
    let resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (!localStorage.getItem(STORAGE_KEY)) {
          applyMode(detectIsMobileDevice() ? 'mobile' : 'pc');
        }
      }, 200);
    });
  });
})();
