/*!
 * 🏛️ 꿈바온 디지털도서관 (꿈디도) 통합 보안·저작권 보호 및
 *    전 스튜디오(설교 프로그램 · 곳간 · 모세의 지팡이 · 교회학교 · 가정예배 · 주석 · 번역기)
 *    「도서관 이용증 (Google·카카오 간편 로그인)」 통합 관문(SSO) & 인쇄 제어 시스템 v2.0
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'kkumdido_library_card_v1';
  var MEMBER_LOG_KEY = 'kkumdido_member_registry_v1';
  var pendingAction = null;
  var isMandatoryGate = false;

  // 스튜디오 페이지 판별 (이 페이지들은 반드시 도서관 이용증 간편 로그인 후에만 열림)
  var STUDIO_PATTERNS = [
    'kkumdido_sermon_studio',
    'kkumdido_gotgan',
    'kkumdido_jipangi',
    'kkumbaon-moses',
    'kkumdido_sunday_school',
    'kkumdido_13dept',
    'kkumdido_family_worship',
    'kkumdido_commentary',
    'kkumdido_translation'
  ];

  function isStudioPage() {
    var path = (window.location.pathname || '').toLowerCase();
    for (var i = 0; i < STUDIO_PATTERNS.length; i++) {
      if (path.indexOf(STUDIO_PATTERNS[i]) !== -1) return true;
    }
    if (document.body && document.body.getAttribute('data-kkd-studio') === 'true') return true;
    return false;
  }

  function getRootPrefix() {
    var path = window.location.pathname || '';
    if (path.indexOf('/kkumbaon-moses/') !== -1) return '../';
    return '';
  }

  // ── 1. 회원(도서관 이용증) 상태 관리 ──
  function getCard() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (data && data.cardNo && data.name && data.provider) return data;
    } catch (e) {}
    return null;
  }

  function saveCard(card) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(card));
      var reg = [];
      try {
        reg = JSON.parse(localStorage.getItem(MEMBER_LOG_KEY) || '[]');
      } catch (e2) { reg = []; }
      reg.push(card);
      localStorage.setItem(MEMBER_LOG_KEY, JSON.stringify(reg.slice(-300)));
    } catch (e) {}
    syncAuthState();
  }

  function clearCard() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    syncAuthState();
    if (isStudioPage()) {
      enforceStudioGateIfNeeded();
    }
  }

  function isVerified() {
    return !!getCard();
  }

  function generateCardNo(seedStr) {
    var hash = 0;
    var s = String(seedStr || Date.now());
    for (var i = 0; i < s.length; i++) {
      hash = ((hash << 5) - hash) + s.charCodeAt(i);
      hash |= 0;
    }
    var num = Math.abs(hash % 9000) + 1000;
    var yr = new Date().getFullYear();
    return 'KKD-' + yr + '-' + num;
  }

  // ── 2. 스타일 주입 (복사/드래그 방지 + 스튜디오 게이트 잠금 + 비로그인 인쇄 차단 + 모달/런처 UI) ──
  var styleEl = document.createElement('style');
  styleEl.id = 'kkumdido-shield-styles';
  styleEl.textContent = [
    '/* 1) 무단 드래그·복사·선택 방지 (입력창 제외) */',
    'html, body, body *:not(input):not(textarea):not(select):not([contenteditable="true"]) {',
    '  -webkit-user-select: none !important;',
    '  -moz-user-select: none !important;',
    '  -ms-user-select: none !important;',
    '  user-select: none !important;',
    '  -webkit-touch-callout: none !important;',
    '}',
    'img, svg, video, canvas {',
    '  -webkit-user-drag: none !important;',
    '  user-drag: none !important;',
    '}',
    '',
    '/* 2) 스튜디오 페이지 비로그인 잠금 시 배경 블러 및 조작 차단 */',
    'body.kkumdido-studio-locked {',
    '  overflow: hidden !important;',
    '}',
    'body.kkumdido-studio-locked > *:not(#kkumdido-card-modal-bg):not(#kkumdido-shield-toast):not(#kkumdido-print-lock-sheet) {',
    '  filter: blur(12px) brightness(0.45) !important;',
    '  pointer-events: none !important;',
    '  user-select: none !important;',
    '}',
    '',
    '/* 3) 인쇄 제어 (@media print) — 도서관 이용증 미발급 시 백지화 및 안내문 출력 */',
    '#kkumdido-print-lock-sheet, #kkumdido-print-cert-header { display: none; }',
    '@media print {',
    '  #kkumdido-pass-fab, #kkumdido-studio-Switcher, #kkumdido-card-modal-bg, #kkumdido-shield-toast { display: none !important; }',
    '  body:not(.kkumdido-member-verified) > *:not(#kkumdido-print-lock-sheet) {',
    '    display: none !important;',
    '  }',
    '  body:not(.kkumdido-member-verified) #kkumdido-print-lock-sheet {',
    '    display: block !important;',
    '    padding: 80px 40px !important;',
    '    margin: 40px auto !important;',
    '    max-width: 680px !important;',
    '    border: 2px solid #8a6d3b !important;',
    '    border-radius: 16px !important;',
    '    text-align: center !important;',
    '    font-family: "KoPubWorldBatang", "Noto Serif KR", serif !important;',
    '    color: #1a1815 !important;',
    '    background: #fff !important;',
    '  }',
    '  body.kkumdido-member-verified #kkumdido-print-cert-header {',
    '    display: flex !important;',
    '    justify-content: space-between !important;',
    '    align-items: center !important;',
    '    padding: 8px 14px !important;',
    '    margin-bottom: 16px !important;',
    '    border-bottom: 1.5px solid #bfa15f !important;',
    '    font-size: 11px !important;',
    '    color: #4a4336 !important;',
    '    font-family: "Pretendard", "Noto Sans KR", sans-serif !important;',
    '  }',
    '}',
    '',
    '/* 4) 우측 하단 도서관 이용증 & 스튜디오 통합 플로팅 바 */',
    '#kkumdido-pass-fab {',
    '  position: fixed;',
    '  right: 18px;',
    '  bottom: 18px;',
    '  z-index: 99990;',
    '  display: inline-flex;',
    '  align-items: center;',
    '  gap: 8px;',
    '  background: linear-gradient(135deg, #131824 0%, #1f273b 100%);',
    '  color: #f5e6c8;',
    '  border: 1.5px solid rgba(212, 175, 55, 0.68);',
    '  border-radius: 999px;',
    '  padding: 9px 16px;',
    '  font-family: "Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif;',
    '  font-size: 13px;',
    '  font-weight: 700;',
    '  letter-spacing: -0.01em;',
    '  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.5), 0 0 15px rgba(212, 175, 55, 0.16);',
    '  cursor: pointer;',
    '  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;',
    '}',
    '#kkumdido-pass-fab:hover {',
    '  transform: translateY(-2px);',
    '  border-color: #f3c969;',
    '  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.6), 0 0 22px rgba(212, 175, 55, 0.3);',
    '}',
    '#kkumdido-pass-fab .kkd-badge-dot {',
    '  width: 8px; height: 8px; border-radius: 50%; background: #f3c969; box-shadow: 0 0 8px #f3c969;',
    '}',
    '#kkumdido-pass-fab.verified .kkd-badge-dot {',
    '  background: #34d399; box-shadow: 0 0 8px #34d399;',
    '}',
    '#kkumdido-pass-fab .kkd-sep {',
    '  padding-left: 9px;',
    '  margin-left: 3px;',
    '  border-left: 1px solid rgba(245, 230, 200, 0.25);',
    '  color: #ffd97d;',
    '}',
    '',
    '/* 5) 보안 안내 토스트 */',
    '#kkumdido-shield-toast {',
    '  position: fixed;',
    '  left: 50%;',
    '  bottom: 76px;',
    '  transform: translateX(-50%) translateY(20px);',
    '  z-index: 100005;',
    '  background: rgba(18, 22, 34, 0.96);',
    '  color: #f5e6c8;',
    '  border: 1px solid rgba(212, 175, 55, 0.6);',
    '  border-radius: 12px;',
    '  padding: 12px 20px;',
    '  font-family: "Pretendard", "Noto Sans KR", sans-serif;',
    '  font-size: 14px;',
    '  font-weight: 600;',
    '  box-shadow: 0 14px 36px rgba(0,0,0,0.5);',
    '  opacity: 0;',
    '  pointer-events: none;',
    '  transition: opacity 0.25s ease, transform 0.25s ease;',
    '  text-align: center;',
    '  max-width: 90vw;',
    '}',
    '#kkumdido-shield-toast.on {',
    '  opacity: 1;',
    '  transform: translateX(-50%) translateY(0);',
    '}',
    '',
    '/* 6) 도서관 이용증 발급·로그인 & 스튜디오 런처 모달 */',
    '#kkumdido-card-modal-bg {',
    '  position: fixed;',
    '  inset: 0;',
    '  z-index: 100000;',
    '  background: rgba(8, 10, 16, 0.85);',
    '  backdrop-filter: blur(10px);',
    '  display: none;',
    '  align-items: center;',
    '  justify-content: center;',
    '  padding: 18px;',
    '  font-family: "Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif;',
    '}',
    '#kkumdido-card-modal-bg.on { display: flex; }',
    '.kkd-modal {',
    '  width: 100%;',
    '  max-width: 510px;',
    '  max-height: 92vh;',
    '  overflow-y: auto;',
    '  background: linear-gradient(165deg, #161b29 0%, #0f131d 100%);',
    '  color: #f4f1ea;',
    '  border: 1.5px solid rgba(212, 175, 55, 0.52);',
    '  border-radius: 22px;',
    '  padding: 26px 24px 22px;',
    '  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.75);',
    '  position: relative;',
    '}',
    '.kkd-close {',
    '  position: absolute; top: 16px; right: 16px;',
    '  height: 34px; padding: 0 12px; border-radius: 999px;',
    '  border: 1px solid rgba(255,255,255,0.18);',
    '  background: rgba(255,255,255,0.06);',
    '  color: #d8d3c8; font-size: 13px; font-weight: 700; cursor: pointer;',
    '}',
    '.kkd-eyebrow {',
    '  display: inline-block;',
    '  font-size: 11px; font-weight: 800; letter-spacing: 0.12em;',
    '  color: #f3c969; background: rgba(243, 201, 105, 0.12);',
    '  border: 1px solid rgba(243, 201, 105, 0.35);',
    '  border-radius: 999px; padding: 4px 12px; margin-bottom: 10px;',
    '}',
    '.kkd-modal h3 {',
    '  margin: 0 0 6px; font-size: 21px; font-weight: 800; color: #fff; letter-spacing: -0.02em;',
    '}',
    '.kkd-sub {',
    '  margin: 0 0 16px; font-size: 13.8px; line-height: 1.55; color: #b7b2a6;',
    '}',
    '.kkd-vip-card {',
    '  background: linear-gradient(135deg, #2b2313 0%, #19150d 55%, #332814 100%);',
    '  border: 1.5px solid rgba(243, 201, 105, 0.65);',
    '  border-radius: 16px;',
    '  padding: 16px 18px;',
    '  margin-bottom: 16px;',
    '  position: relative;',
    '  overflow: hidden;',
    '  box-shadow: inset 0 1px 0 rgba(255,255,255,0.2), 0 12px 28px rgba(0,0,0,0.45);',
    '}',
    '.kkd-vip-top {',
    '  display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;',
    '}',
    '.kkd-vip-top strong { font-size: 13.5px; color: #f3c969; letter-spacing: 0.04em; }',
    '.kkd-vip-top span { font-size: 11px; color: #d8c390; background: rgba(0,0,0,0.35); padding: 3px 9px; border-radius: 999px; border: 1px solid rgba(243,201,105,0.3); }',
    '.kkd-vip-no { font-family: monospace; font-size: 17.5px; font-weight: 800; color: #fff; letter-spacing: 0.08em; margin-bottom: 10px; }',
    '.kkd-vip-meta { display: flex; justify-content: space-between; font-size: 12.5px; color: #e2dac9; }',
    '.kkd-vip-meta small { display: block; font-size: 10px; color: #a89a78; margin-bottom: 2px; }',
    '.kkd-oauth-btns { display: grid; gap: 9px; margin: 12px 0; }',
    '.kkd-btn-google, .kkd-btn-kakao {',
    '  width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;',
    '  padding: 12px 16px; border-radius: 12px; font-size: 14.5px; font-weight: 800;',
    '  cursor: pointer; border: none; transition: transform 0.15s ease, opacity 0.15s ease;',
    '}',
    '.kkd-btn-google:hover, .kkd-btn-kakao:hover { transform: translateY(-1px); opacity: 0.96; }',
    '.kkd-btn-google { background: #ffffff; color: #1f1f1f; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }',
    '.kkd-btn-kakao { background: #FEE500; color: #191600; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }',
    '.kkd-form-box {',
    '  display: none; background: rgba(255,255,255,0.04); border: 1px solid rgba(243,201,105,0.3);',
    '  border-radius: 14px; padding: 15px; margin-top: 10px;',
    '}',
    '.kkd-form-box.on { display: block; }',
    '.kkd-form-box label { display: block; font-size: 12px; font-weight: 700; color: #dfd7c6; margin: 7px 0 4px; }',
    '.kkd-form-box input {',
    '  width: 100%; padding: 9px 11px; border-radius: 9px;',
    '  border: 1px solid rgba(255,255,255,0.2); background: #0d1018; color: #fff;',
    '  font-size: 14px; box-sizing: border-box;',
    '}',
    '.kkd-form-box input:focus { outline: none; border-color: #f3c969; }',
    '.kkd-submit {',
    '  width: 100%; margin-top: 12px; padding: 11px; border-radius: 10px;',
    '  border: none; background: linear-gradient(135deg, #d4af37, #aa8010);',
    '  color: #111; font-size: 14.5px; font-weight: 800; cursor: pointer;',
    '}',
    '.kkd-member-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; margin-top: 12px; }',
    '.kkd-action-btn {',
    '  padding: 11px 12px; border-radius: 11px; font-size: 13.5px; font-weight: 800; cursor: pointer;',
    '  border: 1px solid rgba(243,201,105,0.45); background: rgba(243,201,105,0.12); color: #f3c969;',
    '}',
    '.kkd-action-btn.pri { background: linear-gradient(135deg, #f3c969, #c89628); color: #161209; border: none; }',
    '.kkd-studio-grid {',
    '  display: grid; grid-template-columns: 1fr 1fr; gap: 7px; margin-top: 14px; padding-top: 14px;',
    '  border-top: 1px solid rgba(255,255,255,0.1);',
    '}',
    '.kkd-studio-grid a {',
    '  display: flex; align-items: center; gap: 7px; padding: 8px 10px; border-radius: 9px;',
    '  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);',
    '  color: #e9e2d2; text-decoration: none; font-size: 12.5px; font-weight: 700;',
    '  transition: border-color 0.15s ease, background 0.15s ease;',
    '}',
    '.kkd-studio-grid a:hover { border-color: #f3c969; background: rgba(243,201,105,0.1); color: #fff; }',
    '.kkd-foot-note { margin-top: 12px; font-size: 11.5px; color: #8c867a; text-align: center; line-height: 1.45; }'
  ].join('\n');
  document.head.appendChild(styleEl);

  // ── 3. 토스트 알림 함수 ──
  var toastTimer = null;
  function showToast(msg) {
    var t = document.getElementById('kkumdido-shield-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'kkumdido-shield-toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      t.classList.remove('on');
    }, 2600);
  }

  // ── 4. 입력창 여부 판별 ──
  function isEditableTarget(el) {
    if (!el) return false;
    var tag = (el.tagName || '').toUpperCase();
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (el.isContentEditable) return true;
    if (el.closest && el.closest('#kkumdido-card-modal-bg')) return true;
    return false;
  }

  // ── 5. 우클릭 · 드래그 · 복사 · 단축키 원천 방어 ──
  document.addEventListener('contextmenu', function (e) {
    if (isEditableTarget(e.target)) return;
    e.preventDefault();
    showToast('🔒 꿈바온 디지털도서관의 모든 문헌·프로그램·성화는 저작권 보호를 받습니다.');
  }, true);

  document.addEventListener('dragstart', function (e) {
    if (isEditableTarget(e.target)) return;
    e.preventDefault();
  }, true);

  document.addEventListener('selectstart', function (e) {
    if (isEditableTarget(e.target)) return;
    e.preventDefault();
  }, true);

  document.addEventListener('copy', function (e) {
    if (isEditableTarget(e.target)) return;
    e.preventDefault();
    if (e.clipboardData) {
      e.clipboardData.setData('text/plain', '🏛️ [꿈바온 디지털도서관] 저작권 보호를 위해 무단 복사가 제한되어 있습니다. 도서관 이용증 발급 후 유인물 인쇄 기능을 이용해 주세요.');
    }
    showToast('🔒 무단 복사가 제한되어 있습니다. 「도서관 이용증」 발급 후 인쇄 기능을 이용해 주세요.');
  }, true);

  document.addEventListener('cut', function (e) {
    if (isEditableTarget(e.target)) return;
    e.preventDefault();
  }, true);

  document.addEventListener('keydown', function (e) {
    var key = (e.key || '').toLowerCase();
    var ctrlOrCmd = e.ctrlKey || e.metaKey;

    if (ctrlOrCmd && key === 'p') {
      if (!isVerified()) {
        e.preventDefault();
        e.stopPropagation();
        openCardModal(function () {
          executeAuthorizedPrint();
        }, '🖨️ 자료 인쇄는 「꿈디도 도서관 이용증」 간편 로그인(구글·카카오) 후 이용하실 수 있습니다.');
        return false;
      }
      return;
    }

    if (
      e.key === 'F12' ||
      (ctrlOrCmd && e.shiftKey && (key === 'i' || key === 'j' || key === 'c')) ||
      (e.metaKey && e.altKey && (key === 'i' || key === 'j' || key === 'c' || key === 'u'))
    ) {
      e.preventDefault();
      e.stopPropagation();
      showToast('🔒 꿈바온 디지털도서관 보안 정책에 의해 소스 및 개발자 도구가 제한됩니다.');
      return false;
    }

    if (ctrlOrCmd && (key === 'u' || key === 's')) {
      e.preventDefault();
      e.stopPropagation();
      showToast('🔒 페이지 원본 저장이 제한되어 있습니다. 도서관 이용증 발급 후 웹에서 바로 이용해 주세요.');
      return false;
    }

    if (ctrlOrCmd && (key === 'c' || key === 'x' || key === 'a')) {
      if (!isEditableTarget(e.target)) {
        e.preventDefault();
        e.stopPropagation();
        showToast('🔒 본문 무단 복사가 제한되어 있습니다. 도서관 이용증 발급 후 인쇄 기능을 이용해 주세요.');
        return false;
      }
    }
  }, true);

  // ── 6. 인쇄 함수(window.print) 및 스튜디오 입장 제어 ──
  var origPrint = window.print ? window.print.bind(window) : function () {};

  function executeAuthorizedPrint() {
    syncAuthState();
    setTimeout(function () {
      origPrint();
    }, 120);
  }

  window.print = function () {
    if (!isVerified()) {
      openCardModal(function () {
        executeAuthorizedPrint();
      }, '🖨️ A4 유인물 인쇄 및 PDF 출력은 「도서관 이용증」 간편 로그인(구글·카카오) 후 가능합니다.');
      return;
    }
    executeAuthorizedPrint();
  };

  // ── 7. UI 요소 생성 ──
  var selectedProvider = '';

  function buildDOM() {
    if (document.getElementById('kkumdido-card-modal-bg')) return;
    var pfx = getRootPrefix();

    var lockSheet = document.createElement('div');
    lockSheet.id = 'kkumdido-print-lock-sheet';
    lockSheet.innerHTML = [
      '<div style="font-size:38px; margin-bottom:12px;">🏛️</div>',
      '<h2 style="margin:0 0 10px; font-size:22px;">꿈바온 디지털도서관 (꿈디도)</h2>',
      '<p style="margin:0 0 16px; font-size:15px; line-height:1.6;">이 문헌과 사역 스튜디오 자료를 인쇄하시려면<br>화면 우측 하단 <b>[🪪 도서관 이용증 발급]</b>에서 <b>구글(Google) 또는 카카오(Kakao) 계정</b>으로<br>간편 로그인(이용증 발급)을 먼저 완료해 주세요.</p>',
      '<div style="font-size:12.5px; color:#666;">© 꿈바온 디지털도서관 · 무단 복제 및 상업적 전재 금지</div>'
    ].join('');
    document.body.appendChild(lockSheet);

    var certHeader = document.createElement('div');
    certHeader.id = 'kkumdido-print-cert-header';
    document.body.insertBefore(certHeader, document.body.firstChild);

    var fab = document.createElement('button');
    fab.type = 'button';
    fab.id = 'kkumdido-pass-fab';
    fab.setAttribute('aria-label', '꿈디도 도서관 이용증 및 스튜디오 메뉴');
    fab.addEventListener('click', function (e) {
      if (e.target && e.target.classList && e.target.classList.contains('kkd-print-quick')) {
        e.stopPropagation();
        window.print();
        return;
      }
      openCardModal(null);
    });
    document.body.appendChild(fab);

    var modalBg = document.createElement('div');
    modalBg.id = 'kkumdido-card-modal-bg';
    modalBg.setAttribute('role', 'dialog');
    modalBg.setAttribute('aria-modal', 'true');
    modalBg.innerHTML = [
      '<div class="kkd-modal">',
      '  <button type="button" class="kkd-close" id="kkd-modal-close" aria-label="닫기">✕ 닫기</button>',
      '  <span class="kkd-eyebrow">KKUMBAON DIGITAL LIBRARY & STUDIO PASS</span>',
      '  <h3 id="kkd-modal-title">🏛️ 꿈디도 도서관 이용증 · 간편 로그인</h3>',
      '  <p class="kkd-sub" id="kkd-modal-desc">구글(Google) 또는 카카오(Kakao) 계정으로 간편 로그인하시면 <b>도서관 이용증</b>이 즉시 발급되며, <b>설교 프로그램 · 설교 곳간 · 모세의 지팡이 · 교회학교 · 가정예배 · 번역 스튜디오</b>와 자료 인쇄 기능을 다운로드 없이 웹에서 바로 쓰실 수 있습니다.</p>',
      '  <div class="kkd-vip-card" id="kkd-vip-card">',
      '    <div class="kkd-vip-top">',
      '      <strong>🏛️ 꿈바온 디지털도서관 & 스튜디오 이용증</strong>',
      '      <span id="kkd-card-provider">미발급 (로그인 대기)</span>',
      '    </div>',
      '    <div class="kkd-vip-no" id="kkd-card-no">KKD-2026-••••</div>',
      '    <div class="kkd-vip-meta">',
      '      <div><small>열람자 성함 / 직분</small><b id="kkd-card-name">로그인 후 표시됩니다</b></div>',
      '      <div><small>소속 교회 / 기관</small><b id="kkd-card-church">꿈바온 가족</b></div>',
      '      <div style="text-align:right;"><small>발급일</small><b id="kkd-card-date">-</b></div>',
      '    </div>',
      '  </div>',
      '  <div id="kkd-unverified-zone">',
      '    <div class="kkd-oauth-btns">',
      '      <button type="button" class="kkd-btn-google" id="kkd-start-google">',
      '        <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>',
      '        <span>Google 계정으로 간편 가입 · 로그인</span>',
      '      </button>',
      '      <button type="button" class="kkd-btn-kakao" id="kkd-start-kakao">',
      '        <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#191600" d="M12 3C6.48 3 2 6.58 2 11c0 2.83 1.82 5.32 4.59 6.75-.2.74-.73 2.68-.84 3.1-.13.52.19.51.4.37.17-.11 2.69-1.82 3.77-2.56.67.1 1.36.15 2.08.15 5.52 0 10-3.58 10-8s-4.48-8-10-8z"/></svg>',
      '        <span>카카오 계정으로 간편 가입 · 로그인</span>',
      '      </button>',
      '    </div>',
      '    <form class="kkd-form-box" id="kkd-issue-form" autocomplete="on">',
      '      <div style="font-size:13px; font-weight:800; color:#f3c969; margin-bottom:6px;" id="kkd-form-provider-label">Google 계정 연동 확인</div>',
      '      <label for="kkd-in-email">연동할 계정 이메일 (또는 카톡 ID/연락처)</label>',
      '      <input type="text" id="kkd-in-email" required placeholder="예: pastor@gmail.com">',
      '      <label for="kkd-in-name">이용증 및 서재에 새길 성함·직분 (필수)</label>',
      '      <input type="text" id="kkd-in-name" required placeholder="예: 홍길동 목사 / 김은혜 교사">',
      '      <label for="kkd-in-church">소속 교회 또는 사역지 (선택)</label>',
      '      <input type="text" id="kkd-in-church" placeholder="예: 새오름교회">',
      '      <button type="submit" class="kkd-submit">🪪 도서관 이용증 발급 및 스튜디오 입장</button>',
      '    </form>',
      '  </div>',
      '  <div id="kkd-verified-zone" style="display:none;">',
      '    <div class="kkd-member-actions">',
      '      <button type="button" class="kkd-action-btn pri" id="kkd-do-print-btn">🖨️ 현재 화면 유인물 인쇄</button>',
      '      <button type="button" class="kkd-action-btn" id="kkd-logout-btn">계정 변경 / 로그아웃</button>',
      '    </div>',
      '  </div>',
      '  <div class="kkd-studio-grid" aria-label="꿈디도 통합 스튜디오 바로가기">',
      '    <a href="' + pfx + 'index.html">🏛️ 꿈디도 도서관 본관</a>',
      '    <a href="' + pfx + 'kkumdido_sermon_studio.html" data-kkd-studio-link="1">👑 설교 프로그램 (원어·설교)</a>',
      '    <a href="' + pfx + 'kkumdido_gotgan_studio.html" data-kkd-studio-link="1">🏺 내 설교 곳간 (웹 서재)</a>',
      '    <a href="' + pfx + 'kkumdido_gotgan_sample88.html" data-kkd-studio-link="1">📚 한범수 목사 설교 88편 곳간</a>',
      '    <a href="' + pfx + 'kkumdido_jipangi_studio.html" data-kkd-studio-link="1">🪄 모세의 지팡이 스튜디오</a>',
      '    <a href="' + pfx + 'kkumdido_sunday_school_studio.html" data-kkd-studio-link="1">🌱 교회학교 교사 스튜디오</a>',
      '    <a href="' + pfx + 'kkumdido_family_worship_studio.html" data-kkd-studio-link="1">🕯️ 52주 가정예배 스튜디오</a>',
      '    <a href="' + pfx + 'kkumdido_translation_studio.html" data-kkd-studio-link="1">🌐 기독교 번역 스튜디오</a>',
      '  </div>',
      '  <p class="kkd-foot-note">※ 한 번 로그인하시면 모든 꿈바온 프로그램·스튜디오와 인쇄 기능이 다운로드 없이 웹에서 바로 열립니다.</p>',
      '</div>'
    ].join('\n');
    document.body.appendChild(modalBg);

    document.getElementById('kkd-modal-close').addEventListener('click', function () {
      if (isMandatoryGate && !isVerified()) {
        window.location.href = getRootPrefix() + 'index.html';
        return;
      }
      closeCardModal();
    });
    modalBg.addEventListener('click', function (e) {
      if (e.target === modalBg) {
        if (isMandatoryGate && !isVerified()) return;
        closeCardModal();
      }
    });

    document.getElementById('kkd-start-google').addEventListener('click', function () {
      startProviderFlow('Google');
    });
    document.getElementById('kkd-start-kakao').addEventListener('click', function () {
      startProviderFlow('카카오');
    });

    document.getElementById('kkd-issue-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var email = (document.getElementById('kkd-in-email').value || '').trim();
      var name = (document.getElementById('kkd-in-name').value || '').trim();
      var church = (document.getElementById('kkd-in-church').value || '').trim() || '꿈바온 가족';
      if (!email || !name) return;

      var today = new Date();
      var dateStr = today.getFullYear() + '.' + String(today.getMonth() + 1).padStart(2, '0') + '.' + String(today.getDate()).padStart(2, '0');
      var card = {
        cardNo: generateCardNo(selectedProvider + ':' + email + ':' + name),
        provider: selectedProvider || 'Google',
        account: email,
        name: name,
        church: church,
        issuedAt: dateStr
      };
      saveCard(card);
      isMandatoryGate = false;
      document.body.classList.remove('kkumdido-studio-locked');
      unlockGotganIfPresent(card);
      showToast('🎉 「꿈디도 도서관 이용증(' + card.cardNo + ')」 로그인이 완료되었습니다!');

      if (typeof pendingAction === 'function') {
        var act = pendingAction;
        pendingAction = null;
        closeCardModal();
        setTimeout(act, 150);
      } else {
        closeCardModal();
      }
    });

    document.getElementById('kkd-do-print-btn').addEventListener('click', function () {
      closeCardModal();
      executeAuthorizedPrint();
    });

    document.getElementById('kkd-logout-btn').addEventListener('click', function () {
      clearCard();
      showToast('도서관 이용증 로그아웃이 완료되었습니다.');
    });

    patchPageButtons();
    syncAuthState();
    enforceStudioGateIfNeeded();
  }

  function startProviderFlow(providerName) {
    selectedProvider = providerName;
    var form = document.getElementById('kkd-issue-form');
    var label = document.getElementById('kkd-form-provider-label');
    var emailInput = document.getElementById('kkd-in-email');
    label.textContent = (providerName === 'Google' ? '🌐 Google 계정' : '💬 카카오 계정') + ' 간편 가입 · 이용증 발급';
    emailInput.placeholder = providerName === 'Google' ? 'Google 이메일 주소 (예: pastor@gmail.com)' : '카카오계정 이메일 또는 전화번호';
    form.classList.add('on');
    setTimeout(function () { emailInput.focus(); }, 60);
  }

  function openCardModal(afterAction, customMessage, mandatory) {
    buildDOM();
    pendingAction = afterAction || null;
    isMandatoryGate = !!mandatory;
    var closeBtn = document.getElementById('kkd-modal-close');
    if (closeBtn) {
      closeBtn.textContent = (isMandatoryGate && !isVerified()) ? '← 도서관 본관으로' : '✕ 닫기';
    }
    var descEl = document.getElementById('kkd-modal-desc');
    if (customMessage && !isVerified()) {
      descEl.innerHTML = '<strong style="color:#f3c969;">' + customMessage + '</strong><br>Google 또는 카카오 계정으로 10초 만에 무료 도서관 이용증을 발급받으시면 모든 스튜디오와 인쇄 기능이 즉시 열립니다.';
    } else if (!isVerified()) {
      descEl.innerHTML = '구글(Google) 또는 카카오(Kakao) 계정으로 간편 로그인하시면 <b>도서관 이용증</b>이 즉시 발급되며, <b>설교 프로그램 · 설교 곳간 · 모세의 지팡이 · 교회학교 · 가정예배 · 번역 스튜디오</b>와 자료 인쇄 기능을 다운로드 없이 웹에서 바로 쓰실 수 있습니다.';
    }
    syncAuthState();
    document.getElementById('kkumdido-card-modal-bg').classList.add('on');
  }

  function closeCardModal() {
    if (isMandatoryGate && !isVerified()) return;
    var bg = document.getElementById('kkumdido-card-modal-bg');
    if (bg) bg.classList.remove('on');
  }

  function enforceStudioGateIfNeeded() {
    var card = getCard();
    if (card) {
      document.body.classList.remove('kkumdido-studio-locked');
      unlockGotganIfPresent(card);
      return;
    }
    if (isStudioPage()) {
      document.body.classList.add('kkumdido-studio-locked');
      openCardModal(
        function () {
          document.body.classList.remove('kkumdido-studio-locked');
          unlockGotganIfPresent(getCard());
        },
        '🔐 이 사역 프로그램(스튜디오)은 「꿈디도 도서관 이용증」 간편 로그인 후 바로 사용하실 수 있습니다.',
        true
      );
    }
  }

  // 설교 곳간(Gotgan) 페이지에 들어왔을 때 도서관 이용증 회원 정보로 자동 잠금 해제
  function unlockGotganIfPresent(card) {
    if (!card) return;
    var gate = document.getElementById('licenseGate');
    if (gate) {
      gate.classList.remove('active');
      gate.style.display = 'none';
    }
    try {
      if (typeof window.LICENSE_LOCKED !== 'undefined') {
        window.LICENSE_LOCKED = false;
      }
      var path = (window.location.pathname || '').toLowerCase();
      // 빈 서재(내 설교 곳간)일 경우 로그인한 목회자/성도님의 이름으로 서재 타이틀 자동 설정
      if (path.indexOf('sample88') === -1 && typeof window.SERMONS !== 'undefined' && window.SERMONS.length === 0) {
        window.LICENSED_OWNER = card.name;
        if (!localStorage.getItem('gotgan_custom_title_set')) {
          window.LIBRARY_CUSTOM_TITLE = card.name + '의 설교 곳간';
        }
        if (typeof window.syncHeaderAndGateNames === 'function') {
          window.syncHeaderAndGateNames();
        }
      }
    } catch (e) {}
  }

  function syncAuthState() {
    var card = getCard();
    var fab = document.getElementById('kkumdido-pass-fab');
    var certHeader = document.getElementById('kkumdido-print-cert-header');
    var copyBtn = document.getElementById('copyDocBtn');

    if (card) {
      document.body.classList.add('kkumdido-member-verified');
      document.body.classList.remove('kkumdido-studio-locked');
      unlockGotganIfPresent(card);
      if (fab) {
        fab.classList.add('verified');
        fab.innerHTML = '<span class="kkd-badge-dot"></span><span>🪪 ' + card.name + ' (' + card.cardNo + ')</span><span class="kkd-sep">🧰 스튜디오</span><span class="kkd-sep kkd-print-quick" title="이 페이지 인쇄">🖨️ 인쇄</span>';
      }
      if (certHeader) {
        certHeader.innerHTML = '<span>🏛️ <b>꿈바온 디지털도서관(꿈디도) 공식 열람본</b> · 무단 복제 및 상업적 재배포 금지</span><span>도서관 이용증: <b>' + card.cardNo + '</b> · 열람자: <b>' + card.name + ' (' + card.church + ')</b></span>';
      }
      if (copyBtn) {
        copyBtn.textContent = '🪪 이용증 #' + card.cardNo;
      }
    } else {
      document.body.classList.remove('kkumdido-member-verified');
      if (fab) {
        fab.classList.remove('verified');
        fab.innerHTML = '<span class="kkd-badge-dot"></span><span>🪪 도서관 이용증 로그인 · 🧰 스튜디오 · 🖨️ 인쇄</span>';
      }
      if (certHeader) {
        certHeader.innerHTML = '';
      }
      if (copyBtn) {
        copyBtn.textContent = '🪪 도서관 이용증 발급';
      }
    }

    var titleEl = document.getElementById('kkd-modal-title');
    var provEl = document.getElementById('kkd-card-provider');
    var noEl = document.getElementById('kkd-card-no');
    var nameEl = document.getElementById('kkd-card-name');
    var churchEl = document.getElementById('kkd-card-church');
    var dateEl = document.getElementById('kkd-card-date');
    var unvZone = document.getElementById('kkd-unverified-zone');
    var verZone = document.getElementById('kkd-verified-zone');

    if (noEl) {
      if (card) {
        titleEl.textContent = '🏛️ 내 꿈디도 도서관 이용증 & 스튜디오 런처';
        provEl.textContent = card.provider + ' 인증 회원';
        noEl.textContent = card.cardNo;
        nameEl.textContent = card.name;
        churchEl.textContent = card.church;
        dateEl.textContent = card.issuedAt;
        unvZone.style.display = 'none';
        verZone.style.display = 'block';
      } else {
        titleEl.textContent = '🏛️ 꿈디도 도서관 이용증 · 간편 로그인';
        provEl.textContent = '미발급 (로그인 대기)';
        noEl.textContent = 'KKD-2026-••••';
        nameEl.textContent = '로그인 후 표시됩니다';
        churchEl.textContent = '꿈바온 가족';
        dateEl.textContent = '-';
        unvZone.style.display = 'block';
        verZone.style.display = 'none';
      }
    }
  }

  function isStudioHref(href) {
    if (!href) return false;
    var h = href.toLowerCase();
    for (var i = 0; i < STUDIO_PATTERNS.length; i++) {
      if (h.indexOf(STUDIO_PATTERNS[i]) !== -1) return true;
    }
    return false;
  }

  function patchPageButtons() {
    window.copyCurrentManuscript = function () {
      openCardModal(null, '🔒 저작권 보호를 위해 원고 전문 복사는 제한되어 있습니다. 도서관 이용증 발급 후 [🖨️ A4 유인물 인쇄]를 이용해 주세요.');
    };
    var copyBtn = document.getElementById('copyDocBtn');
    if (copyBtn) {
      copyBtn.onclick = function (e) {
        e.preventDefault();
        openCardModal(null);
      };
    }

    // index.html 의 enterMosesSanctuary 도 간편 로그인 확인 후 로컬/웹 지팡이 스튜디오로 연결
    if (typeof window.enterMosesSanctuary === 'function' && !window.__kkdPatchedMoses) {
      window.__kkdPatchedMoses = true;
      window.enterMosesSanctuary = function () {
        var goMoses = function () {
          window.location.href = getRootPrefix() + 'kkumdido_jipangi_studio.html';
        };
        if (!isVerified()) {
          openCardModal(goMoses, '🪄 「모세의 지팡이 웹스튜디오」는 도서관 이용증 간편 로그인(구글·카카오) 후 바로 열립니다.');
          return;
        }
        goMoses();
      };
    }

    if (typeof window.openPrintPdfModal === 'function' && !window.__kkdPatchedStudioPrint) {
      var origOpenPrintModal = window.openPrintPdfModal;
      window.__kkdPatchedStudioPrint = true;
      window.openPrintPdfModal = function () {
        if (!isVerified()) {
          openCardModal(function () {
            origOpenPrintModal();
          }, '🖨️ 강단 설교 노트 인쇄 및 PDF 저장은 「도서관 이용증」 간편 로그인 후 이용하실 수 있습니다.');
          return;
        }
        origOpenPrintModal();
      };
    }

    // 스튜디오 링크 및 PDF 직통 링크 클릭 시 간편 로그인 선행 체크
    document.addEventListener('click', function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!a) return;
      var href = a.getAttribute('href') || '';
      if (href.toLowerCase().endsWith('.pdf')) {
        if (!isVerified()) {
          e.preventDefault();
          e.stopPropagation();
          var pdfUrl = a.href;
          openCardModal(function () {
            window.open(pdfUrl, '_blank', 'noopener');
          }, '📕 전자책(PDF) 원본 열람 및 인쇄는 「도서관 이용증」 간편 로그인(구글·카카오) 후 이용하실 수 있습니다.');
        }
        return;
      }
      if (a.hasAttribute('data-kkd-studio-link') || isStudioHref(href)) {
        if (!isVerified()) {
          e.preventDefault();
          e.stopPropagation();
          var targetHref = a.href;
          openCardModal(function () {
            window.location.href = targetHref;
          }, '🔐 꿈바온 사역 프로그램·스튜디오는 「도서관 이용증」 간편 로그인(구글·카카오) 후 다운로드 없이 바로 이용하실 수 있습니다.');
        }
      }
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildDOM);
  } else {
    buildDOM();
  }

  window.kkumdidoPass = {
    open: openCardModal,
    isVerified: isVerified,
    getCard: getCard,
    logout: clearCard
  };
})();
