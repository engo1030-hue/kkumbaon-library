/*!
 * 🏛️ 꿈바온 디지털도서관 (꿈디도) 통합 보안·저작권 보호 및
 *    전 스튜디오(설교 프로그램 · 곳간 · 모세의 지팡이 · 교회학교 · 가정예배 · 주석 · 번역기)
 *    「이 기기 도서관 이용증」 안내, 인쇄 제어 및 기기 내 사용 기록
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'kkumdido_library_card_v1';
  var MEMBER_LOG_KEY = 'kkumdido_member_registry_v1';
  var VISITOR_ID_KEY = 'kkumdido_visitor_id_v1';
  var VAULT_STORAGE_KEY = 'kkumdido_admin_vault_v2';
  var SESSION_VISIT_KEY = 'kkumdido_session_visited_pages_v2';

  // 관리자 PIN 평문 저장 금지 (클간사 보안 점검 반영: 단방향 솔트 해시 검증만 수행)
  var ADMIN_PIN_HASH = 'KKD-PIN-0E32D8A9-92033640';
  var ANNEX_WELL_KEY = 'kkumdido_annex_well_v1';

  function verifyAdminPin(pinInput) {
    var s = 'KKD-ADMIN-SALT-2026::' + String(pinInput == null ? '' : pinInput).trim();
    var h1 = 0xdeadbeef ^ s.length;
    var h2 = 0x41c6ce57 ^ s.length;
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      h1 = Math.imul(h1 ^ c, 2654435761);
      h2 = Math.imul(h2 ^ c, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    var hex1 = ((h1 >>> 0).toString(16).toUpperCase()).padStart(8, '0');
    var hex2 = ((h2 >>> 0).toString(16).toUpperCase()).padStart(8, '0');
    return ('KKD-PIN-' + hex1 + '-' + hex2) === ADMIN_PIN_HASH;
  }

  // 공개 브로커 전송 시 개인정보(이메일·전화번호·성함) 마스킹 및 난독화 봉투
  var pendingAction = null;
  var isMandatoryGate = false;
  var adminModalOpen = false;
  var currentAdminTab = 'members';

  // 스튜디오 페이지 판별 (이 페이지들은 반드시 이 기기 이용증 발급 후에만 열림)
  var STUDIO_PATTERNS = [
    'kkumdido_pastoral_secretary',
    'kkumdido_sermon_ai',
    'kkumdido_finance',
    'kkumdido_sermon_studio',
    'kkumdido_gotgan',
    'kkumdido_gyojeok',
    'kkumdido_jipangi',
    'kkumbaon-moses',
    'kkumdido_sunday_school',
    'kkumdido_13dept',
    'kkumdido_family_worship',
    'kkumdido_commentary',
    'kkumdido_translation',
    'kkumdido_12archives',
    'kkumdido_encyclopedia',
    '원어풀어읽기',
    '00_꿈바온',
    '12대아카이브',
    '말씀설교스튜디오',
    '설교스튜디오',
    '13대부서별_52주',
    '꿈바온_설교ai',
    '꿈바온_목회비서',
    '꿈바온_무료교적',
    '꿈바온_무료헌금재정'
  ];

  function getDecodedPathLower() {
    var raw = (window.location && window.location.pathname) ? window.location.pathname : '';
    try {
      return decodeURIComponent(raw).toLowerCase();
    } catch (e) {
      return raw.toLowerCase();
    }
  }

  function isStudioPage() {
    if (window.__KKD_TEST_BYPASS === true) return false;
    var path = getDecodedPathLower();
    if (path.indexOf('kkumdido_church_support_annex') !== -1 || path.indexOf('kkumdido_annex') !== -1 || path.indexOf('annex_proposal') !== -1 || path.indexOf('00_목사님전용') !== -1) return false;
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

  function formatNowTs() {
    var d = new Date();
    var yyyy = d.getFullYear();
    var mm = String(d.getMonth() + 1).padStart(2, '0');
    var dd = String(d.getDate()).padStart(2, '0');
    var hh = String(d.getHours()).padStart(2, '0');
    var mi = String(d.getMinutes()).padStart(2, '0');
    var ss = String(d.getSeconds()).padStart(2, '0');
    return yyyy + '-' + mm + '-' + dd + ' ' + hh + ':' + mi + ':' + ss;
  }

  function formatDateDot() {
    var d = new Date();
    return d.getFullYear() + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + String(d.getDate()).padStart(2, '0');
  }

  function getDeviceLabel() {
    var ua = navigator.userAgent || '';
    if (/iPad/i.test(ua)) return '태블릿 (iPad)';
    if (/iPhone/i.test(ua)) return '모바일 (iPhone)';
    if (/Android/i.test(ua)) return '모바일 (Android)';
    if (/Macintosh|Mac OS X/i.test(ua)) return 'PC (Mac)';
    if (/Windows/i.test(ua)) return 'PC (Windows)';
    return '웹 브라우저';
  }

  function normalizeLegacyLabel(str) {
    var s = String(str || '').trim();
    if (!s) return s;
    s = s.replace(/꿈디도 제1관\s*·\s*성경 인물대백과 350인\s*&\s*구속(사\s*관계망)?/g, '👑 제1관 · 성경 인물대백과 350인');
    s = s.replace(/꿈바온 설교 쇼츠 공방\s*—\s*영상이나 원고를 넣으면\s*/g, '🎬 꿈바온 설교 쇼츠 공방');
    s = s.replace(/꿈바온 디지털 도서관 \(꿈디도\)\s*—\s*12대 아카이브/g, '🏛️ 꿈디도 도서관 본관');
    if (s === '👑 제1관 · 성경 인물대백과 350인 유인물·자료 인쇄 실행' || s === '👑 제1관 · 성경 인물대백과 350인 · 👑 제1관 · 성경 인물대백과 350인 유인물·자료 인쇄 실행') {
      s = '👑 제1관 · 성경 인물대백과 350인 · [인물가계도 · 언약의 계보] 유인물·자료 인쇄 실행';
    }
    return s;
  }

  function getCurrentPageLabel() {
    var path = getDecodedPathLower();
    if (path.indexOf('figures_encyclopedia') !== -1) return '👑 제1관 · 성경 인물대백과 350인';
    if (path.indexOf('events_encyclopedia') !== -1) return '📜 제2관 · 성경 사건대백과';
    if (path.indexOf('behinds_encyclopedia') !== -1) return '💡 제3관 · 성경 비하인드 300선';
    if (path.indexOf('kkumdido_encyclopedia') !== -1) return '🏛️ 성경 3대 대백과 통합 허브';
    if (path.indexOf('shorts.html') !== -1 || path.indexOf('kkumdido_shorts') !== -1 || path.indexOf('설교쇼츠') !== -1) return '🎬 꿈바온 설교 쇼츠 공방';
    if (path.indexOf('통계서기') !== -1 || path.indexOf('statistics') !== -1) return '📊 감리교 통계서기 자동취합실';
    if (path.indexOf('kkumdido_annex') !== -1 || path.indexOf('kkumdido_church_support_annex') !== -1) return '🏛️ 꿈디도 별관 (교회지원·말씀등불)';
    if (path.indexOf('kkumdido_pastoral_secretary') !== -1 || path.indexOf('꿈바온_목회비서') !== -1) return '🌿 아론의 지팡이 (목양·심방·주보)';
    if (path.indexOf('kkumdido_sermon_ai') !== -1 || path.indexOf('꿈바온_설교ai') !== -1) return '🪄 모세의 지팡이 (본문카드대령·7종변환)';
    if (path.indexOf('kkumdido_finance') !== -1 || path.indexOf('꿈바온_무료헌금재정') !== -1) return '💰 무료 헌금·재정 (청지기장부)';
    if (path.indexOf('kkumdido_sermon_studio') !== -1 || path.indexOf('말씀설교스튜디오') !== -1) return '👑 모세의 지팡이 · 66권 원어 설교준비실';
    if (path.indexOf('원어풀어읽기') !== -1 || path.indexOf('00_꿈바온') !== -1) return '📖 66권 원어·풀어읽기 주석 서고';
    if (path.indexOf('kkumdido_12archives') !== -1 || path.indexOf('12대아카이브') !== -1) return '🏛️ 12대 아카이브 3,650모듈 서고';
    if (path.indexOf('kkumdido_gotgan') !== -1) return '🏺 내 설교 곳간 (개인 서재)';
    if (path.indexOf('kkumdido_gyojeok') !== -1 || path.indexOf('꿈바온_무료교적') !== -1) return '🐑 무료 교적 스튜디오 (양떼 수첩)';
    if (path.indexOf('kkumdido_jipangi') !== -1 || path.indexOf('kkumbaon-moses') !== -1) return '🎬 모세의 지팡이 미디어 스튜디오';
    if (path.indexOf('kkumdido_sunday_school') !== -1) return '🌱 교회학교 교사 스튜디오';
    if (path.indexOf('kkumdido_13dept') !== -1 || path.indexOf('13대부서별_52주') !== -1) return '📋 13부서 52주 커리큘럼';
    if (path.indexOf('kkumdido_family_worship') !== -1) return '🕯️ 52주 가정예배 스튜디오';
    if (path.indexOf('kkumdido_translation') !== -1) return '🌐 기독교 번역 스튜디오';
    if (path.indexOf('kkumdido_commentary') !== -1) return '📚 성경 주석·강해 연구실';
    if (path.indexOf('online_chapel_church') !== -1) return '🕊️ 새오름 3D 온라인 예배당';
    if (path.indexOf('online_chapel_kkumdido') !== -1) return '🏛️ 꿈디도 3D 말씀 묵상원';
    if (path.indexOf('hall1') !== -1) return '🗺️ 제1관 성경 지리·고고학';
    if (path.indexOf('hall2') !== -1) return '👑 제2관 성경 인물 열전';
    if (path.indexOf('hall3') !== -1) return '🏺 제3관 등잔 밑 사물·문화';
    if (path.indexOf('00_목사님전용') !== -1) return '🔑 목사님 전용 발급·관제실';
    if (path.endsWith('/') || path.indexOf('index.html') !== -1 || path.indexOf('kkumdido.html') !== -1 || path.indexOf('compact.html') !== -1) return '🏛️ 꿈디도 도서관 본관';
    var t = (document.title || '').replace(/\s+/g, ' ').trim();
    t = t.split('—')[0].split('|')[0].trim();
    return normalizeLegacyLabel(t ? t.slice(0, 36) : '🏛️ 꿈디도 도서관');
  }

  // 현재 화면에 열려 있는 세부 인물·사건·비하인드·아카이브 모듈·문헌·성경 본문 제목을 정밀 추출
  function getActiveContentContext() {
    try {
      // 1) 제1관 성경 인물대백과 (figures_encyclopedia_preview.html)
      var figDrw = document.getElementById('figureDrawer');
      if (figDrw && figDrw.classList.contains('open')) {
        var figName = ((document.getElementById('drwName') || {}).textContent || '').trim();
        var activeDTab = figDrw.querySelector('.d-tab.active');
        var dTabLabel = activeDTab ? (activeDTab.textContent || '').trim() : '';
        if (figName) {
          return '[' + figName + (dTabLabel ? ' · ' + dTabLabel : '') + ']';
        }
      }

      // 2) 제2관 성경 사건대백과 (events_encyclopedia_preview.html)
      var evModal = document.getElementById('eventModal');
      if (evModal && (evModal.classList.contains('open') || evModal.style.display === 'flex' || evModal.style.display === 'block')) {
        var evTitle = ((document.getElementById('modalTitle') || {}).textContent || '').trim();
        if (evTitle && evTitle !== '사건 제목') return '[성경 사건: ' + evTitle + ']';
      }
      var compModal = document.getElementById('compModal');
      if (compModal && (compModal.classList.contains('open') || compModal.style.display === 'flex' || compModal.style.display === 'block')) {
        var compTitle = ((document.getElementById('compModalTitle') || {}).textContent || '').trim();
        if (compTitle) return '[사건 비교표: ' + compTitle + ']';
      }

      // 3) 제3관 성경 비하인드 (behinds_encyclopedia_preview.html)
      var bhModal = document.getElementById('behindModal');
      if (bhModal && (bhModal.classList.contains('open') || bhModal.style.display === 'flex' || bhModal.style.display === 'block')) {
        var bhTitle = ((document.getElementById('modalTitle') || {}).textContent || '').trim();
        if (bhTitle && bhTitle !== '비하인드 제목') return '[성경 비하인드: ' + bhTitle + ']';
      }

      // 4) 12대 아카이브 3,650모듈 서고 (꿈디도_12대아카이브_3650모듈_통합웹뷰어.html / kkumdido_12archives_viewer.html)
      var mb = document.getElementById('modalBackdrop');
      if (mb && mb.classList.contains('open')) {
        var mc = document.getElementById('modalContent');
        if (mc) {
          var badge = mc.querySelector('.badge-id');
          var h2 = mc.querySelector('h2');
          var bTxt = badge ? (badge.textContent || '').trim() : '';
          var hTxt = h2 ? (h2.textContent || '').trim() : '';
          if (hTxt) return '[' + (bTxt ? bTxt + ' · ' : '') + hTxt + ']';
        }
      }

      // 5) 도서관 본관 리더 모달 (index.html)
      var rModal = document.getElementById('readerModal');
      if (rModal && rModal.classList.contains('open')) {
        var rTitle = ((document.getElementById('readerTitle') || {}).textContent || '').trim();
        var rBread = ((document.getElementById('readerBreadcrumb') || {}).textContent || '').trim();
        if (rTitle) return '[' + rTitle + (rBread ? ' (' + rBread + ')' : '') + ']';
      }

      // 6) 66권 원어·풀어읽기 주석 서고 (00_꿈바온_원어풀어읽기_성경주석66권_통합웹뷰어.html)
      var chCont = document.getElementById('chapterCommentaryContainer');
      if (chCont) {
        var chBan = chCont.querySelector('.ch-banner');
        if (chBan) {
          var subDiv = chBan.querySelector('div > div');
          var h2El = chBan.querySelector('h2');
          var sTxt = subDiv ? (subDiv.textContent || '').trim() : '';
          var tTxt = h2El ? (h2El.textContent || '').trim() : '';
          if (sTxt || tTxt) return '[' + sTxt + (tTxt ? ' — ' + tTxt : '') + ']';
        }
      }

      // 7) 사역 스튜디오 본문·제목 입력칸 감지 (설교준비실·모세의지팡이·아론의지팡이·곳간·교회학교 등)
      var refIds = ['sermonScriptureInput', 'inScripture', 'sermPassage', 'jbSermonScripture', 'editScriptureInput', 'inputBibleVerse', 'pubRef', 'mosesQueryInput'];
      var titleIds = ['sermonTitleInput', 'inTitle', 'sermTheme', 'jbSermonTitle', 'editTitleInput', 'step3TitleLine1Input', 'pubTitle'];
      var foundRef = '';
      var foundTitle = '';
      for (var i = 0; i < refIds.length; i++) {
        var rEl = document.getElementById(refIds[i]);
        if (rEl && rEl.value && rEl.value.trim()) {
          foundRef = rEl.value.trim();
          break;
        }
      }
      for (var j = 0; j < titleIds.length; j++) {
        var tEl = document.getElementById(titleIds[j]);
        if (tEl && tEl.value && tEl.value.trim()) {
          foundTitle = tEl.value.trim();
          break;
        }
      }
      if (foundRef || foundTitle) {
        return '[' + [foundRef, foundTitle].filter(Boolean).join(' · ') + ']';
      }

      // 8) 대백과/스튜디오 내 현재 활성 탭(.axis-tab.active 등) 감지
      var axisTab = document.querySelector('.axis-tab.active');
      if (axisTab) {
        var clone = axisTab.cloneNode(true);
        var badges = clone.querySelectorAll('.axis-badge');
        for (var b = 0; b < badges.length; b++) {
          if (badges[b].parentNode) badges[b].parentNode.removeChild(badges[b]);
        }
        var axTxt = (clone.textContent || '').replace(/\s+/g, ' ').trim();
        if (axTxt) return '[' + axTxt.slice(0, 38) + ']';
      }
    } catch (e) {}
    return '';
  }

  function getActivePrintTargetLabel(isShortcut) {
    var page = getCurrentPageLabel();
    var ctx = getActiveContentContext();
    var suffix = isShortcut ? ' 인쇄 단축키(Ctrl/Cmd+P) 실행' : ' 유인물·자료 인쇄 실행';
    if (ctx) {
      return page + ' · ' + ctx + suffix;
    }
    return page + suffix;
  }

  function getVisitorId() {
    try {
      var vid = localStorage.getItem(VISITOR_ID_KEY);
      if (vid && vid.indexOf('VIS-') === 0) return vid;
      var rand = Math.random().toString(36).substring(2, 6).toUpperCase() + Math.floor(100 + Math.random() * 900);
      vid = 'VIS-' + new Date().getFullYear() + '-' + rand;
      localStorage.setItem(VISITOR_ID_KEY, vid);
      return vid;
    } catch (e) {
      return 'VIS-2026-GUEST';
    }
  }

  // ── 1. 회원(도서관 이용증) 상태 관리 ──
  function getCard() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (data && data.cardNo && data.name && data.provider) {
        if (data.provider !== '이 기기') data.provider = '이 기기 (기존 기록)';
        return data;
      }
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
    recordTelemetryEvent('signup', '이 기기 이용증 발급 (' + (card.provider || '이 기기') + ')', card);
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

  function isPastorCardHint() {
    var c = getCard();
    if (c && (c.cardNo === 'KKD-2026-6903' || c.cardNo === 'KKD-2026-1640' || (c.name && (c.name.indexOf('꿈바온') !== -1 || c.name.indexOf('한범수') !== -1)))) {
      return true;
    }
    return isPastorAdmin();
  }

  function isPastorAdmin() {
    try {
      if (sessionStorage.getItem('kkumdido_admin_unlocked') === '1') {
        localStorage.setItem('kkumdido_is_pastor_device', '1');
        return true;
      }
    } catch (e) {}
    return false;
  }

  // ── 1-1b. 우리들(목사님·안간사 자동점검 봇·로컬 테스트) 영구 제외 필터 ──
  var INTERNAL_CARD_NOS = {
    'KKD-2026-6903': 1,
    'KKD-2026-1640': 1,
    'KKD-2026-7777': 1,
    'KKD-2026-0000': 1,
    'KKD-2026-9999': 1,
    'KKD-2026-8888': 1,
    'KKD-2026-1234': 1
  };

  var INTERNAL_BOT_VIDS = {
    'VIS-2026-VXV2555': 1, 'VIS-2026-ZV6R603': 1, 'VIS-2026-19VG676': 1, 'VIS-2026-5UFG766': 1,
    'VIS-2026-ZQS9879': 1, 'VIS-2026-2LDT756': 1, 'VIS-2026-JKUA478': 1, 'VIS-2026-BNCO955': 1,
    'VIS-2026-SQ11121': 1, 'VIS-2026-RFY8231': 1, 'VIS-2026-HNT1586': 1, 'VIS-2026-7ZC1584': 1,
    'VIS-2026-0WMU448': 1, 'VIS-2026-AK08231': 1, 'VIS-2026-EEWG405': 1, 'VIS-2026-P7NQ434': 1,
    'VIS-2026-2RHU516': 1, 'VIS-2026-0JGV271': 1, 'VIS-2026-M0LP589': 1, 'VIS-2026-BNM3829': 1,
    'VIS-2026-IPAS734': 1, 'VIS-2026-73KV343': 1, 'VIS-2026-OE9C596': 1, 'VIS-2026-7SR4422': 1,
    'VIS-2026-QDGG296': 1, 'VIS-2026-5DIR242': 1, 'VIS-2026-80OX354': 1, 'VIS-2026-CAUI672': 1,
    'VIS-2026-TIY6439': 1, 'VIS-2026-QPV9663': 1, 'VIS-2026-NKKY379': 1, 'VIS-2026-ACPS769': 1,
    'VIS-2026-2ISL677': 1, 'VIS-2026-53JT977': 1, 'VIS-2026-7Z2R832': 1, 'VIS-2026-TXSY869': 1,
    'VIS-2026-SULQ580': 1, 'VIS-2026-15SJ631': 1, 'VIS-2026-E1DN249': 1, 'VIS-2026-7RO8523': 1,
    'VIS-2026-6YQF673': 1, 'VIS-2026-71WZ186': 1, 'VIS-2026-HGHI995': 1, 'VIS-2026-P72T453': 1,
    'VIS-2026-GUEST': 1
  };

  function getExcludedIdsMap() {
    try {
      var raw = localStorage.getItem('kkumdido_excluded_ids_v1');
      if (raw) return JSON.parse(raw) || {};
    } catch (e) {}
    return {};
  }

  function addExcludedId(id) {
    if (!id) return;
    try {
      var map = getExcludedIdsMap();
      map[id] = 1;
      localStorage.setItem('kkumdido_excluded_ids_v1', JSON.stringify(map));
    } catch (e) {}
  }

  function parseTsSeconds(tsStr) {
    if (!tsStr || typeof tsStr !== 'string') return NaN;
    var iso = tsStr.trim().slice(0, 19).replace(' ', 'T');
    var ms = Date.parse(iso);
    return isNaN(ms) ? NaN : (ms / 1000);
  }

  function isInternalOrBotRecord(item) {
    if (!item || typeof item !== 'object') return false;
    var excluded = getExcludedIdsMap();
    var vid = String(item.visitorId || '').trim();
    var cno = String(item.cardNo || '').trim();
    if ((vid && excluded[vid]) || (cno && excluded[cno])) return true;
    if (cno && INTERNAL_CARD_NOS[cno]) return true;
    if (vid && INTERNAL_BOT_VIDS[vid]) return true;

    // 현재 기기가 목사님 관리자 기기인 경우 본인 visitorId 도 자동 제외
    try {
      if (localStorage.getItem('kkumdido_is_pastor_device') === '1' || sessionStorage.getItem('kkumdido_admin_unlocked') === '1') {
        var myVid = localStorage.getItem(VISITOR_ID_KEY);
        if (myVid && vid === myVid) return true;
      }
    } catch (e0) {}

    var name = String(item.name || '').trim();
    if (name && /한범수|한\*수|꿈바온|꿈\*온|안간사|클간사|제간사|워크간사|지간사|테스트|점검|관리자/i.test(name)) return true;

    var acc = String(item.account || '').trim().toLowerCase();
    if (acc && /en\*\*\*@naver\.com|en\*\*\*@nvar\.com|engo1030|kkumbaon\.org|pa\*\*\*@|test@|example\.com|admin@/i.test(acc)) return true;

    var church = String(item.church || '').trim();
    if (church && /^(꿈바온교회|꿈바온 은혜교회|테스트교회)$/.test(church)) return true;

    var pages = Array.isArray(item.pagesVisited) ? item.pagesVisited : [];
    var pageTitle = String(item.pageTitle || '');
    if (pageTitle.indexOf('목사님 전용 발급') !== -1) return true;
    for (var p = 0; p < pages.length; p++) {
      if (String(pages[p] || '').indexOf('목사님 전용 발급') !== -1) return true;
    }

    var dev = String(item.device || '');
    var tFirst = String(item.firstSeenAt || item.ts || '');
    var tLast = String(item.lastSeenAt || item.ts || '');

    // 2026-11-08 22:00 이전까지 작업실 맥(PC Mac)에서 발생한 목사님·안간사 테스트 기록 일괄 제거
    if (dev === 'PC (Mac)' && ((tFirst && tFirst <= '2026-11-08 22:00:00') || (tLast && tLast <= '2026-11-08 22:00:00'))) {
      return true;
    }

    // 초고속 다중 페이지 스캔 봇 (35초 이내에 4회/4페이지 이상 연속 스캔)
    var s1 = parseTsSeconds(tFirst);
    var s2 = parseTsSeconds(tLast);
    if (!isNaN(s1) && !isNaN(s2)) {
      var dur = Math.abs(s2 - s1);
      if (dur <= 35 && ((item.visitCount || 1) >= 4 || pages.length >= 4)) {
        return true;
      }
    }

    return false;
  }

  function shouldSkipSelfTelemetry(explicitCard) {
    try {
      if (window.location && (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        return true;
      }
      if (navigator && (navigator.webdriver === true || /HeadlessChrome|Playwright|Puppeteer|PhantomJS/i.test(navigator.userAgent || ''))) {
        return true;
      }
      if (isPastorAdmin() || localStorage.getItem('kkumdido_is_pastor_device') === '1') {
        return true;
      }
      var card = explicitCard || getCard();
      if (card && isInternalOrBotRecord(card)) {
        return true;
      }
    } catch (e) {}
    return false;
  }

  function pruneInternalRecordsFromVault(vault) {
    if (!vault || typeof vault !== 'object') return false;
    var changed = false;
    if (vault.members && typeof vault.members === 'object') {
      Object.keys(vault.members).forEach(function (k) {
        if (isInternalOrBotRecord(vault.members[k])) {
          delete vault.members[k];
          changed = true;
        }
      });
    }
    if (vault.visitors && typeof vault.visitors === 'object') {
      Object.keys(vault.visitors).forEach(function (k) {
        if (isInternalOrBotRecord(vault.visitors[k])) {
          delete vault.visitors[k];
          changed = true;
        }
      });
    }
    if (Array.isArray(vault.logs)) {
      var beforeLen = vault.logs.length;
      vault.logs = vault.logs.filter(function (l) {
        return !isInternalOrBotRecord(l);
      });
      if (vault.logs.length !== beforeLen) changed = true;
    }
    return changed;
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

  // 1:1 정식판 인증번호(KB-XXXX-XXXX) 계산 함수 (00_목사님전용_사용권발급기.html 과 100% 동일 알고리즘)
  function computeLicenseCode(ownerName) {
    var clean = String(ownerName || '').replace(/\s+/g, '').trim();
    if (!clean) return '';
    var salt = 'KKUMBAON-PASTOR-STUDY-2026-SECRET';
    var str = clean + '::' + salt;
    var h1 = 0xdeadbeef ^ str.length;
    var h2 = 0x41c6ce57 ^ str.length;
    for (var i = 0; i < str.length; i++) {
      var ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    var hex1 = ((h1 >>> 0).toString(16).toUpperCase()).padStart(8, '0').slice(0, 4);
    var hex2 = ((h2 >>> 0).toString(16).toUpperCase()).padStart(8, '0').slice(0, 4);
    return 'KB-' + hex1 + '-' + hex2;
  }

  // ── 1-2. 이 기기에만 남는 이용증 · 방문 기록 ──
  function extractCleanItemLabel(detail, pageTitle) {
    var d = normalizeLegacyLabel(detail || '');
    var p = normalizeLegacyLabel(pageTitle || '');
    if (!d) return p || '-';
    // [ ... ] 대괄호 안의 핵심 자료명이 있으면 우선 추출
    var mBracket = d.match(/\[([^\]]+)\]/);
    if (mBracket && mBracket[1]) {
      var shortPage = p.replace(/^([^\s]+)\s*(제\d관\s*·\s*)?/, '$1 $2').split('(')[0].trim();
      if (shortPage.length > 18) shortPage = shortPage.slice(0, 18);
      return (shortPage ? shortPage + ' · ' : '') + mBracket[1].trim();
    }
    var mParen = d.match(/\(([^)]+)\)/);
    if (mParen && mParen[1] && (d.indexOf('PDF') !== -1 || d.indexOf('내려받기') !== -1)) {
      return mParen[1].trim();
    }
    return d.replace(/\s*(유인물·자료 인쇄 실행|인쇄 단축키\(Ctrl\/Cmd\+P\) 실행|방문·열람|입장 및 사역도구 실행)\s*$/g, '').trim() || p;
  }

  function reconcileVaultWithLogs(vault) {
    if (!vault || typeof vault !== 'object') return false;
    var changed = false;
    vault.members = vault.members || {};
    vault.visitors = vault.visitors || {};
    vault.logs = Array.isArray(vault.logs) ? vault.logs : [];

    // 1) 로그 중복 제거 및 구버전 잘린 라벨 정규화
    var seenIds = {};
    var seenSigs = {};
    var cleanLogs = [];
    // 오래된 순으로 정렬 후 중복 제거하여 최신순으로 다시 배치
    var sortedAsc = vault.logs.slice().sort(function (a, b) {
      return String(a.ts || '').localeCompare(String(b.ts || ''));
    });
    var vidToCard = {};
    for (var i = 0; i < sortedAsc.length; i++) {
      var lg = sortedAsc[i];
      if (!lg || typeof lg !== 'object' || isInternalOrBotRecord(lg)) {
        changed = true;
        continue;
      }
      var normPage = normalizeLegacyLabel(lg.pageTitle || '🏛️ 꿈디도 도서관');
      var normDetail = normalizeLegacyLabel(lg.detail || '');
      if (normPage !== lg.pageTitle || normDetail !== lg.detail) {
        lg.pageTitle = normPage;
        lg.detail = normDetail;
        changed = true;
      }
      var sig = [lg.visitorId || '', lg.cardNo || '', lg.ts || '', lg.type || '', lg.pageTitle || '', lg.detail || ''].join('|');
      if ((lg.id && seenIds[lg.id]) || seenSigs[sig]) {
        changed = true;
        continue;
      }
      if (lg.id) seenIds[lg.id] = true;
      seenSigs[sig] = true;
      if (lg.visitorId && lg.cardNo) {
        vidToCard[lg.visitorId] = lg.cardNo;
      }
      cleanLogs.push(lg);
    }

    // 2) 회원(cardNo) 및 방문자(visitorId)별 실제 로그 기반 집계 재산출 (3배 중복 합산 버그 완벽 교정)
    var logsByCard = {};
    var logsByVid = {};
    for (var j = 0; j < cleanLogs.length; j++) {
      var item = cleanLogs[j];
      var cno = item.cardNo || (item.visitorId ? vidToCard[item.visitorId] : '') || '';
      var vid = item.visitorId || '';
      if (cno) {
        if (!logsByCard[cno]) logsByCard[cno] = [];
        logsByCard[cno].push(item);
      }
      if (vid) {
        if (!logsByVid[vid]) logsByVid[vid] = [];
        logsByVid[vid].push(item);
      }
    }

    Object.keys(vault.members).forEach(function (cno) {
      var m = vault.members[cno];
      if (!m) return;
      m.pagesVisited = (m.pagesVisited || []).map(normalizeLegacyLabel);
      m.itemsViewed = Array.isArray(m.itemsViewed) ? m.itemsViewed.map(normalizeLegacyLabel) : [];
      m.itemsPrinted = Array.isArray(m.itemsPrinted) ? m.itemsPrinted.map(normalizeLegacyLabel) : [];
      if (m.lastAction) m.lastAction = normalizeLegacyLabel(m.lastAction);

      var mLogs = logsByCard[cno];
      if (mLogs && mLogs.length > 0) {
        var vCnt = 0;
        var cCnt = 0;
        var pCnt = 0;
        var pages = [];
        var viewed = [];
        var printed = [];
        var lastAct = m.lastAction || '';
        for (var k = 0; k < mLogs.length; k++) {
          var l = mLogs[k];
          pages = addUniqueItem(pages, l.pageTitle, 20);
          if (l.type === 'print' || l.type === 'pdf') {
            pCnt++;
            printed = addUniqueItem(printed, extractCleanItemLabel(l.detail, l.pageTitle), 25);
          } else if (l.type === 'content') {
            cCnt++;
            viewed = addUniqueItem(viewed, extractCleanItemLabel(l.detail, l.pageTitle), 30);
          } else {
            vCnt++;
          }
          if (l.detail) lastAct = l.detail;
        }
        var trueVisit = Math.max(1, vCnt);
        if (m.visitCount !== trueVisit || m.printCount !== pCnt || m.contentCount !== cCnt) {
          changed = true;
        }
        m.visitCount = trueVisit;
        m.contentCount = cCnt;
        m.printCount = pCnt;
        m.pagesVisited = pages;
        m.itemsViewed = viewed;
        m.itemsPrinted = printed;
        m.lastAction = lastAct;
      }
    });

    Object.keys(vault.visitors).forEach(function (vid) {
      var v = vault.visitors[vid];
      if (!v) return;
      if (!v.cardNo && vidToCard[vid] && vault.members[vidToCard[vid]]) {
        var linkedM = vault.members[vidToCard[vid]];
        v.cardNo = linkedM.cardNo;
        v.name = linkedM.name;
        v.account = linkedM.account;
        v.church = linkedM.church;
        v.provider = linkedM.provider;
      }
      v.pagesVisited = (v.pagesVisited || []).map(normalizeLegacyLabel);
      v.itemsViewed = Array.isArray(v.itemsViewed) ? v.itemsViewed.map(normalizeLegacyLabel) : [];
      v.itemsPrinted = Array.isArray(v.itemsPrinted) ? v.itemsPrinted.map(normalizeLegacyLabel) : [];
      if (v.lastAction) v.lastAction = normalizeLegacyLabel(v.lastAction);

      var vLogs = logsByVid[vid];
      if (vLogs && vLogs.length > 0) {
        var vCnt = 0;
        var cCnt = 0;
        var pCnt = 0;
        var pages = [];
        var viewed = [];
        var printed = [];
        var lastAct = v.lastAction || '';
        for (var k = 0; k < vLogs.length; k++) {
          var l = vLogs[k];
          pages = addUniqueItem(pages, l.pageTitle, 20);
          if (l.type === 'print' || l.type === 'pdf') {
            pCnt++;
            printed = addUniqueItem(printed, extractCleanItemLabel(l.detail, l.pageTitle), 25);
          } else if (l.type === 'content') {
            cCnt++;
            viewed = addUniqueItem(viewed, extractCleanItemLabel(l.detail, l.pageTitle), 30);
          } else {
            vCnt++;
          }
          if (l.detail) lastAct = l.detail;
        }
        var trueVisit = Math.max(1, vCnt);
        if (v.visitCount !== trueVisit || v.printCount !== pCnt || v.contentCount !== cCnt) {
          changed = true;
        }
        v.visitCount = trueVisit;
        v.contentCount = cCnt;
        v.printCount = pCnt;
        v.pagesVisited = pages;
        v.itemsViewed = viewed;
        v.itemsPrinted = printed;
        v.lastAction = lastAct;
      }
    });

    // 최신순 정렬
    cleanLogs.sort(function (a, b) {
      return String(b.ts || '').localeCompare(String(a.ts || ''));
    });
    vault.logs = cleanLogs.slice(0, 450);
    return changed;
  }

  function getLocalVault() {
    var empty = { members: {}, visitors: {}, logs: [], updatedAt: '' };
    try {
      var raw = localStorage.getItem(VAULT_STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          parsed.members = parsed.members || {};
          parsed.visitors = parsed.visitors || {};
          parsed.logs = Array.isArray(parsed.logs) ? parsed.logs : [];
          var pruned = pruneInternalRecordsFromVault(parsed);
          var reconciled = reconcileVaultWithLogs(parsed);
          if (pruned || reconciled) {
            try {
              parsed.updatedAt = formatNowTs();
              localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(parsed));
            } catch (eSave) {}
          }
          return parsed;
        }
      }
    } catch (e) {}
    return empty;
  }

  function saveLocalVault(vault) {
    try {
      pruneInternalRecordsFromVault(vault);
      reconcileVaultWithLogs(vault);
      vault.updatedAt = formatNowTs();
      localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(vault));
    } catch (e) {}
  }

  function addUniqueItem(arr, item, maxLen) {
    var list = Array.isArray(arr) ? arr.slice() : [];
    if (item && list.indexOf(item) === -1) {
      list.push(item);
    }
    if (maxLen && list.length > maxLen) {
      list = list.slice(list.length - maxLen);
    }
    return list;
  }

  function mergeMemberEntry(vault, m) {
    if (!m || !m.cardNo || isInternalOrBotRecord(m)) return;
    var key = m.cardNo;
    var cur = vault.members[key] || {
      cardNo: m.cardNo,
      name: m.name || '',
      account: m.account || '',
      church: m.church || '꿈바온 가족',
      provider: m.provider || '이 기기',
      issuedAt: m.issuedAt || formatDateDot(),
      firstSeenAt: m.firstSeenAt || m.ts || formatNowTs(),
      lastSeenAt: m.lastSeenAt || m.ts || formatNowTs(),
      visitCount: 0,
      contentCount: 0,
      printCount: 0,
      pagesVisited: [],
      itemsViewed: [],
      itemsPrinted: [],
      lastAction: '',
      device: m.device || ''
    };
    if (m.name) cur.name = m.name;
    if (m.account) cur.account = m.account;
    if (m.church) cur.church = m.church;
    if (m.provider) cur.provider = m.provider;
    if (m.issuedAt) cur.issuedAt = m.issuedAt;
    if (m.device) cur.device = m.device;
    if (m.firstSeenAt && (!cur.firstSeenAt || m.firstSeenAt < cur.firstSeenAt)) cur.firstSeenAt = m.firstSeenAt;
    if (m.lastSeenAt && (!cur.lastSeenAt || m.lastSeenAt > cur.lastSeenAt)) cur.lastSeenAt = m.lastSeenAt;
    if (typeof m.visitCount === 'number' && m.visitCount > (cur.visitCount || 0)) cur.visitCount = m.visitCount;
    if (typeof m.contentCount === 'number' && m.contentCount > (cur.contentCount || 0)) cur.contentCount = m.contentCount;
    if (typeof m.printCount === 'number' && m.printCount > (cur.printCount || 0)) cur.printCount = m.printCount;
    if (Array.isArray(m.pagesVisited)) {
      for (var i = 0; i < m.pagesVisited.length; i++) {
        cur.pagesVisited = addUniqueItem(cur.pagesVisited, normalizeLegacyLabel(m.pagesVisited[i]), 20);
      }
    }
    if (Array.isArray(m.itemsViewed)) {
      for (var iv = 0; iv < m.itemsViewed.length; iv++) {
        cur.itemsViewed = addUniqueItem(cur.itemsViewed, normalizeLegacyLabel(m.itemsViewed[iv]), 30);
      }
    }
    if (Array.isArray(m.itemsPrinted)) {
      for (var ip = 0; ip < m.itemsPrinted.length; ip++) {
        cur.itemsPrinted = addUniqueItem(cur.itemsPrinted, normalizeLegacyLabel(m.itemsPrinted[ip]), 25);
      }
    }
    if (m.lastAction) cur.lastAction = normalizeLegacyLabel(m.lastAction);
    if (isInternalOrBotRecord(cur)) {
      delete vault.members[key];
      return;
    }
    vault.members[key] = cur;
  }

  function mergeVisitorEntry(vault, v) {
    if (!v || !v.visitorId || isInternalOrBotRecord(v)) return;
    var key = v.visitorId;
    var cur = vault.visitors[key] || {
      visitorId: v.visitorId,
      cardNo: v.cardNo || '',
      name: v.name || '비로그인 방문자',
      account: v.account || '-',
      church: v.church || '-',
      provider: v.provider || '-',
      firstSeenAt: v.firstSeenAt || v.ts || formatNowTs(),
      lastSeenAt: v.lastSeenAt || v.ts || formatNowTs(),
      visitCount: 0,
      contentCount: 0,
      printCount: 0,
      pagesVisited: [],
      itemsViewed: [],
      itemsPrinted: [],
      lastAction: '',
      device: v.device || ''
    };
    if (v.cardNo) cur.cardNo = v.cardNo;
    if (v.name && v.name !== '비로그인 방문자') cur.name = v.name;
    if (v.account && v.account !== '-') cur.account = v.account;
    if (v.church && v.church !== '-') cur.church = v.church;
    if (v.provider && v.provider !== '-') cur.provider = v.provider;
    if (v.device) cur.device = v.device;
    if (v.firstSeenAt && (!cur.firstSeenAt || v.firstSeenAt < cur.firstSeenAt)) cur.firstSeenAt = v.firstSeenAt;
    if (v.lastSeenAt && (!cur.lastSeenAt || v.lastSeenAt > cur.lastSeenAt)) cur.lastSeenAt = v.lastSeenAt;
    if (typeof v.visitCount === 'number' && v.visitCount > (cur.visitCount || 0)) cur.visitCount = v.visitCount;
    if (typeof v.contentCount === 'number' && v.contentCount > (cur.contentCount || 0)) cur.contentCount = v.contentCount;
    if (typeof v.printCount === 'number' && v.printCount > (cur.printCount || 0)) cur.printCount = v.printCount;
    if (Array.isArray(v.pagesVisited)) {
      for (var i = 0; i < v.pagesVisited.length; i++) {
        cur.pagesVisited = addUniqueItem(cur.pagesVisited, normalizeLegacyLabel(v.pagesVisited[i]), 20);
      }
    }
    if (Array.isArray(v.itemsViewed)) {
      for (var iv = 0; iv < v.itemsViewed.length; iv++) {
        cur.itemsViewed = addUniqueItem(cur.itemsViewed, normalizeLegacyLabel(v.itemsViewed[iv]), 30);
      }
    }
    if (Array.isArray(v.itemsPrinted)) {
      for (var ip = 0; ip < v.itemsPrinted.length; ip++) {
        cur.itemsPrinted = addUniqueItem(cur.itemsPrinted, normalizeLegacyLabel(v.itemsPrinted[ip]), 25);
      }
    }
    if (v.lastAction) cur.lastAction = normalizeLegacyLabel(v.lastAction);
    if (isInternalOrBotRecord(cur)) {
      delete vault.visitors[key];
      return;
    }
    vault.visitors[key] = cur;
  }

  function applyEventToVault(vault, ev) {
    if (!ev || typeof ev !== 'object') return false;
    var changed = false;

    // 1) 전체 스냅샷 병합인 경우
    if (ev.kind === 'vault_snapshot') {
      if (ev.members && typeof ev.members === 'object') {
        Object.keys(ev.members).forEach(function (k) {
          if (!isInternalOrBotRecord(ev.members[k])) {
            mergeMemberEntry(vault, ev.members[k]);
            changed = true;
          }
        });
      }
      if (ev.visitors && typeof ev.visitors === 'object') {
        Object.keys(ev.visitors).forEach(function (k) {
          if (!isInternalOrBotRecord(ev.visitors[k])) {
            mergeVisitorEntry(vault, ev.visitors[k]);
            changed = true;
          }
        });
      }
      if (Array.isArray(ev.logs)) {
        var existingIds = {};
        for (var i = 0; i < vault.logs.length; i++) {
          if (vault.logs[i] && vault.logs[i].id) existingIds[vault.logs[i].id] = true;
        }
        for (var j = 0; j < ev.logs.length; j++) {
          var l = ev.logs[j];
          if (l && l.id && !existingIds[l.id] && !isInternalOrBotRecord(l)) {
            vault.logs.push(l);
            existingIds[l.id] = true;
            changed = true;
          }
        }
      }
      if (pruneInternalRecordsFromVault(vault)) changed = true;
      if (reconcileVaultWithLogs(vault)) changed = true;
      return changed;
    }

    // 2) 단일 이벤트인 경우 — 우리들(목사님·안간사 봇·내부 테스트) 이벤트는 즉시 차단
    if (isInternalOrBotRecord(ev)) {
      if (pruneInternalRecordsFromVault(vault)) return true;
      return false;
    }

    // 이미 반영된 이벤트 ID 이면 중복 카운트하지 않고 즉시 반환 (새로고침 시 3배 중복 합산 원천 차단!)
    if (ev.id && Array.isArray(vault.logs)) {
      for (var dupIdx = 0; dupIdx < vault.logs.length; dupIdx++) {
        if (vault.logs[dupIdx] && vault.logs[dupIdx].id === ev.id) {
          return false;
        }
      }
    }

    var ts = ev.ts || formatNowTs();
    var page = normalizeLegacyLabel(ev.pageTitle || '🏛️ 꿈디도 도서관');
    var detail = normalizeLegacyLabel(ev.detail || '');
    var vid = ev.visitorId || 'VIS-2026-GUEST';
    var cleanItem = extractCleanItemLabel(detail, page);

    if (ev.cardNo && ev.name) {
      var mem = vault.members[ev.cardNo] || {
        cardNo: ev.cardNo,
        name: ev.name,
        account: ev.account || '-',
        church: ev.church || '꿈바온 가족',
        provider: ev.provider || '이 기기',
        issuedAt: ev.issuedAt || ts.slice(0, 10).replace(/-/g, '.'),
        firstSeenAt: ts,
        lastSeenAt: ts,
        visitCount: 0,
        contentCount: 0,
        printCount: 0,
        pagesVisited: [],
        itemsViewed: [],
        itemsPrinted: [],
        lastAction: detail,
        device: ev.device || ''
      };
      if (ev.name) mem.name = ev.name;
      if (ev.account) mem.account = ev.account;
      if (ev.church) mem.church = ev.church;
      if (ev.provider) mem.provider = ev.provider;
      if (ev.issuedAt) mem.issuedAt = ev.issuedAt;
      if (ev.device) mem.device = ev.device;
      if (ts > (mem.lastSeenAt || '')) mem.lastSeenAt = ts;
      if (ts < (mem.firstSeenAt || ts)) mem.firstSeenAt = ts;
      mem.pagesVisited = addUniqueItem(mem.pagesVisited, page, 20);
      if (detail) mem.lastAction = detail;
      if (ev.type === 'print' || ev.type === 'pdf') {
        mem.printCount = (mem.printCount || 0) + 1;
        mem.itemsPrinted = addUniqueItem(mem.itemsPrinted || [], cleanItem, 25);
      } else if (ev.type === 'content') {
        mem.contentCount = (mem.contentCount || 0) + 1;
        mem.itemsViewed = addUniqueItem(mem.itemsViewed || [], cleanItem, 30);
      } else if (ev.type === 'visit' || ev.type === 'studio' || ev.type === 'signup') {
        mem.visitCount = (mem.visitCount || 0) + 1;
      }
      if (!isInternalOrBotRecord(mem)) {
        vault.members[ev.cardNo] = mem;
        changed = true;
      }
    }

    if (vid) {
      var vis = vault.visitors[vid] || {
        visitorId: vid,
        cardNo: ev.cardNo || '',
        name: ev.name || '비로그인 방문자',
        account: ev.account || '-',
        church: ev.church || '-',
        provider: ev.provider || '-',
        firstSeenAt: ts,
        lastSeenAt: ts,
        visitCount: 0,
        contentCount: 0,
        printCount: 0,
        pagesVisited: [],
        itemsViewed: [],
        itemsPrinted: [],
        lastAction: detail,
        device: ev.device || ''
      };
      if (ev.cardNo) vis.cardNo = ev.cardNo;
      if (ev.name) vis.name = ev.name;
      if (ev.account) vis.account = ev.account;
      if (ev.church) vis.church = ev.church;
      if (ev.provider) vis.provider = ev.provider;
      if (ev.device) vis.device = ev.device;
      if (ts > (vis.lastSeenAt || '')) vis.lastSeenAt = ts;
      if (ts < (vis.firstSeenAt || ts)) vis.firstSeenAt = ts;
      vis.pagesVisited = addUniqueItem(vis.pagesVisited, page, 20);
      if (detail) vis.lastAction = detail;
      if (ev.type === 'print' || ev.type === 'pdf') {
        vis.printCount = (vis.printCount || 0) + 1;
        vis.itemsPrinted = addUniqueItem(vis.itemsPrinted || [], cleanItem, 25);
      } else if (ev.type === 'content') {
        vis.contentCount = (vis.contentCount || 0) + 1;
        vis.itemsViewed = addUniqueItem(vis.itemsViewed || [], cleanItem, 30);
      } else if (ev.type === 'visit' || ev.type === 'studio' || ev.type === 'signup') {
        vis.visitCount = (vis.visitCount || 0) + 1;
      }
      if (!isInternalOrBotRecord(vis)) {
        vault.visitors[vid] = vis;
        changed = true;
      } else {
        delete vault.visitors[vid];
      }
    }

    if (ev.id && !isInternalOrBotRecord(ev)) {
      vault.logs.unshift({
        id: ev.id,
        ts: ts,
        type: ev.type || 'visit',
        visitorId: vid,
        cardNo: ev.cardNo || '',
        name: ev.name || '비로그인 방문자',
        account: ev.account || '-',
        church: ev.church || '-',
        provider: ev.provider || '-',
        pageTitle: page,
        detail: detail,
        device: ev.device || ''
      });
      changed = true;
    }

    reconcileVaultWithLogs(vault);
    return changed;
  }

  // 기존 localStorage 에 저장되어 있던 이용증/로그도 볼트에 자동 편입 (단, 우리들/테스트 기록은 제외)
  function migrateLocalRegistryToVault() {
    var vault = getLocalVault();
    var changed = pruneInternalRecordsFromVault(vault);
    if (shouldSkipSelfTelemetry(getCard())) {
      if (changed) saveLocalVault(vault);
      return;
    }
    var currentCard = getCard();
    if (currentCard && currentCard.cardNo && !isInternalOrBotRecord(currentCard)) {
      if (!vault.members[currentCard.cardNo]) {
        mergeMemberEntry(vault, {
          cardNo: currentCard.cardNo,
          name: currentCard.name,
          account: currentCard.account,
          church: currentCard.church,
          provider: currentCard.provider,
          issuedAt: currentCard.issuedAt,
          firstSeenAt: formatNowTs(),
          lastSeenAt: formatNowTs(),
          visitCount: 1,
          pagesVisited: [getCurrentPageLabel()],
          lastAction: getCurrentPageLabel() + ' 접속',
          device: getDeviceLabel()
        });
        changed = true;
      }
    }
    try {
      var oldReg = JSON.parse(localStorage.getItem(MEMBER_LOG_KEY) || '[]');
      if (Array.isArray(oldReg)) {
        for (var i = 0; i < oldReg.length; i++) {
          var item = oldReg[i];
          if (item && item.cardNo && !isInternalOrBotRecord(item) && !vault.members[item.cardNo]) {
            mergeMemberEntry(vault, {
              cardNo: item.cardNo,
              name: item.name,
              account: item.account,
              church: item.church,
              provider: item.provider,
              issuedAt: item.issuedAt,
              firstSeenAt: formatNowTs(),
              lastSeenAt: formatNowTs(),
              visitCount: 1,
              pagesVisited: [getCurrentPageLabel()],
              lastAction: '도서관 이용증 발급',
              device: getDeviceLabel()
            });
            changed = true;
          }
        }
      }
    } catch (e) {}
    if (changed) saveLocalVault(vault);
  }

  // 이용 기록은 이 브라우저에만 보관합니다. 외부 중계기로 전송하지 않습니다.
  function pushEventToCloud() {}
  function ensureMqttClient(callback) { if (typeof callback === 'function') callback(null); }
  function syncFromCloudAll(onComplete) {
    migrateLocalRegistryToVault();
    if (typeof onComplete === 'function') onComplete(getLocalVault());
  }

  function recordTelemetryEvent(eventType, detailText, explicitCard) {
    try {
      migrateLocalRegistryToVault();
      if (shouldSkipSelfTelemetry(explicitCard)) {
        if (adminModalOpen) renderAdminDashboard();
        return;
      }
      var card = explicitCard || getCard();
      var vid = getVisitorId();
      var ts = formatNowTs();
      var page = getCurrentPageLabel();
      var ev = {
        id: 'EV-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
        ts: ts,
        type: eventType || 'visit',
        visitorId: vid,
        cardNo: card ? card.cardNo : '',
        name: card ? card.name : '비로그인 방문자',
        account: card ? card.account : '-',
        church: card ? card.church : '-',
        provider: card ? card.provider : '-',
        issuedAt: card ? card.issuedAt : '',
        pageTitle: page,
        detail: detailText || (page + ' 열람'),
        device: getDeviceLabel()
      };
      var vault = getLocalVault();
      applyEventToVault(vault, ev);
      saveLocalVault(vault);
      pushEventToCloud(ev, vault);
      if (adminModalOpen) renderAdminDashboard();
      if (typeof window.__kkdOnVaultUpdate === 'function') {
        window.__kkdOnVaultUpdate(vault);
      }
    } catch (e) {}
  }

  function recordAutoPageVisit() {
    try {
      if (shouldSkipSelfTelemetry(getCard())) {
        migrateLocalRegistryToVault();
        ensureMqttClient();
        return;
      }
      var page = getCurrentPageLabel();
      var card = getCard();
      var sessionKey = page + '::' + (card ? card.cardNo : 'GUEST');
      var visitedMap = {};
      try {
        visitedMap = JSON.parse(sessionStorage.getItem(SESSION_VISIT_KEY) || '{}');
      } catch (e2) { visitedMap = {}; }

      if (visitedMap[sessionKey]) {
        // 같은 세션 내 동일 페이지 재로드 시에는 기기 내 기록만 갱신
        migrateLocalRegistryToVault();
        ensureMqttClient();
        return;
      }
      visitedMap[sessionKey] = Date.now();
      try {
        sessionStorage.setItem(SESSION_VISIT_KEY, JSON.stringify(visitedMap));
      } catch (e3) {}

      var isStu = isStudioPage();
      var evType = isStu ? 'studio' : 'visit';
      var detail = isStu ? (page + ' 입장 및 사역도구 실행') : (page + ' 방문·열람');
      recordTelemetryEvent(evType, detail, card);
    } catch (e) {}
  }

  // ── 2. 스타일 주입 (복사/드래그 방지 + 스튜디오 게이트 잠금 + 비로그인 인쇄 차단 + 모달/런처/관리자 UI) ──
  var styleEl = document.createElement('style');
  styleEl.id = 'kkumdido-shield-styles';
  styleEl.textContent = [
    '/* 1) 무단 드래그·복사·선택 방지 (입력창 및 관리자 모달 제외) */',
    'html, body, body *:not(input):not(textarea):not(select):not([contenteditable="true"]):not(.kkd-selectable):not(.kkd-selectable *) {',
    '  -webkit-user-select: none !important;',
    '  -moz-user-select: none !important;',
    '  -ms-user-select: none !important;',
    '  user-select: none !important;',
    '  -webkit-touch-callout: none !important;',
    '}',
    '.kkd-selectable, .kkd-selectable * {',
    '  -webkit-user-select: text !important;',
    '  user-select: text !important;',
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
    'body.kkumdido-studio-locked > *:not(#kkumdido-card-modal-bg):not(#kkumdido-admin-modal-bg):not(#kkumdido-shield-toast):not(#kkumdido-print-lock-sheet) {',
    '  filter: blur(12px) brightness(0.45) !important;',
    '  pointer-events: none !important;',
    '  user-select: none !important;',
    '}',
    '',
    '/* 3) 인쇄 제어 (@media print) — 도서관 이용증 미발급 시 백지화 및 안내문 출력 */',
    '#kkumdido-print-lock-sheet, #kkumdido-print-cert-header { display: none; }',
    '@media print {',
    '  #kkumdido-pass-fab, #kkumdido-studio-Switcher, #kkumdido-card-modal-bg, #kkumdido-admin-modal-bg, #kkumdido-shield-toast { display: none !important; }',
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
    '/* 4) 우측 하단 도서관 이용증 & 스튜디오 통합 플로팅 바 (모달/라이트박스보다 아래 z-index 로 설정하여 모달 닫기 버튼 가림 원천 방지) */',
    '#kkumdido-pass-fab {',
    '  position: fixed;',
    '  right: 18px;',
    '  bottom: 18px;',
    '  z-index: 850;',
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
    '  z-index: 100015;',
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
    '#kkumdido-card-modal-bg, #kkumdido-admin-modal-bg {',
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
    '#kkumdido-admin-modal-bg { z-index: 100008; }',
    '#kkumdido-card-modal-bg.on, #kkumdido-admin-modal-bg.on { display: flex; }',
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
    '  max-width: calc(100% - 140px);',
    '  font-size: 11px; font-weight: 800; letter-spacing: 0.08em; line-height: 1.35;',
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
    '.kkd-vip-meta { display: flex; justify-content: space-between; font-size: 12.5px; color: #e2dac9; gap: 8px; flex-wrap: wrap; }',
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
    '.kkd-foot-note { margin-top: 12px; font-size: 11.5px; color: #8c867a; text-align: center; line-height: 1.45; }',
    '.kkd-admin-open-btn {',
    '  margin-top: 10px; width: 100%; padding: 8px 12px; border-radius: 9px;',
    '  border: 1px dashed rgba(243,201,105,0.35); background: rgba(243,201,105,0.06);',
    '  color: #d8c390; font-size: 12px; font-weight: 700; cursor: pointer;',
    '  transition: background 0.15s ease, color 0.15s ease;',
    '}',
    '.kkd-admin-open-btn:hover { background: rgba(243,201,105,0.16); color: #fff; }',
    '',
    '/* 7) 👑 목사님 전용 가입자·방문자·사용기록 관제 모달 */',
    '.kkd-admin-modal {',
    '  width: 100%; max-width: 1140px; max-height: 92vh; overflow-y: auto;',
    '  background: linear-gradient(165deg, #171512 0%, #0e0c0a 100%);',
    '  color: #f4eee1; border: 1.5px solid #d8b26e; border-radius: 22px;',
    '  padding: 26px 26px 24px; box-shadow: 0 28px 80px rgba(0,0,0,0.85); position: relative;',
    '}',
    '.kkd-adm-stats {',
    '  display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 14px 0 16px;',
    '}',
    '@media (max-width: 760px) { .kkd-adm-stats { grid-template-columns: repeat(2, 1fr); } }',
    '.kkd-adm-stat {',
    '  background: rgba(216,178,110,0.08); border: 1px solid rgba(216,178,110,0.3);',
    '  border-radius: 13px; padding: 12px 14px;',
    '}',
    '.kkd-adm-stat small { display: block; font-size: 11.5px; color: #b8ab96; margin-bottom: 4px; }',
    '.kkd-adm-stat strong { font-size: 22px; font-weight: 900; color: #f3c969; }',
    '.kkd-adm-toolbar {',
    '  display: flex; flex-wrap: wrap; gap: 8px; justify-content: space-between; align-items: center; margin-bottom: 12px;',
    '}',
    '.kkd-adm-tabs { display: flex; gap: 6px; flex-wrap: wrap; }',
    '.kkd-adm-tab {',
    '  padding: 8px 14px; border-radius: 999px; font-size: 13px; font-weight: 800; cursor: pointer;',
    '  border: 1px solid rgba(216,178,110,0.35); background: rgba(255,255,255,0.04); color: #cfc4b0;',
    '}',
    '.kkd-adm-tab.on {',
    '  background: linear-gradient(135deg, #d8b26e, #b58d46); color: #19130c; border-color: #f3c969;',
    '}',
    '.kkd-adm-actions { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }',
    '.kkd-adm-search {',
    '  padding: 8px 12px; border-radius: 9px; border: 1px solid rgba(216,178,110,0.4);',
    '  background: #100e0b; color: #f4eee1; font-size: 13px; min-width: 210px;',
    '}',
    '.kkd-adm-btn {',
    '  padding: 8px 12px; border-radius: 9px; border: 1px solid rgba(216,178,110,0.45);',
    '  background: rgba(216,178,110,0.12); color: #f0d290; font-size: 12.5px; font-weight: 700; cursor: pointer;',
    '}',
    '.kkd-adm-btn:hover { background: rgba(216,178,110,0.24); color: #fff; }',
    '.kkd-adm-table-wrap {',
    '  overflow-x: auto; border: 1px solid rgba(216,178,110,0.25); border-radius: 14px; background: rgba(0,0,0,0.3);',
    '  max-height: 52vh; overflow-y: auto;',
    '}',
    '.kkd-adm-table {',
    '  width: 100%; border-collapse: collapse; font-size: 12.8px; text-align: left;',
    '}',
    '.kkd-adm-table th {',
    '  position: sticky; top: 0; background: #211b14; color: #f3c969; font-weight: 800;',
    '  padding: 10px 12px; border-bottom: 1px solid rgba(216,178,110,0.35); white-space: nowrap; z-index: 2;',
    '  font-size: 12.5px; letter-spacing: -0.01em;',
    '}',
    '.kkd-adm-table td {',
    '  padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.07); color: #e8e0d0; vertical-align: middle;',
    '  line-height: 1.45;',
    '}',
    '.kkd-adm-table tr:hover td { background: rgba(216,178,110,0.06); }',
    '.kkd-pill {',
    '  display: inline-flex; align-items: center; padding: 2.5px 8px; border-radius: 999px; font-size: 11px; font-weight: 700;',
    '  margin: 1px 2px; border: 1px solid rgba(243,201,105,0.35); background: rgba(243,201,105,0.1); color: #f3c969;',
    '  white-space: nowrap; line-height: 1.35;',
    '}',
    '.kkd-pill.green { border-color: rgba(52,211,153,0.45); background: rgba(52,211,153,0.12); color: #6ee7b7; white-space: nowrap; }',
    '.kkd-pill.blue { border-color: rgba(96,165,250,0.45); background: rgba(96,165,250,0.12); color: #93c5fd; white-space: nowrap; }',
    '.kkd-pill.gray { border-color: rgba(255,255,255,0.18); background: rgba(255,255,255,0.06); color: #e2dac9; white-space: nowrap; }',
    '.kkd-kb-btn {',
    '  padding: 5px 9px; border-radius: 7px; border: 1px solid rgba(243,201,105,0.5);',
    '  background: rgba(243,201,105,0.14); color: #ffd97d; font-size: 11.5px; font-weight: 800; cursor: pointer; white-space: nowrap;',
    '}',
    '.kkd-kb-btn:hover { background: #f3c969; color: #161209; }'
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
    }, 2800);
  }

  // ── 4. 입력창 및 관리자 영역 판별 ──
  function isEditableTarget(el) {
    if (!el) return false;
    var tag = (el.tagName || '').toUpperCase();
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (el.isContentEditable) return true;
    if (el.closest && (el.closest('#kkumdido-card-modal-bg') || el.closest('#kkumdido-admin-modal-bg') || el.closest('.kkd-selectable'))) return true;
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
        }, '🖨️ 자료 인쇄는 「이 기기 도서관 이용증」 발급 후 이용하실 수 있습니다.');
        return false;
      }
      recordTelemetryEvent('print', getActivePrintTargetLabel(true));
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
    recordTelemetryEvent('print', getActivePrintTargetLabel(false));
    setTimeout(function () {
      origPrint();
    }, 120);
  }

  window.print = function () {
    if (!isVerified()) {
      openCardModal(function () {
        executeAuthorizedPrint();
      }, '🖨️ A4 유인물 인쇄 및 PDF 출력은 「이 기기 도서관 이용증」 발급 후 가능합니다.');
      return;
    }
    executeAuthorizedPrint();
  };

  // ── 7. UI 요소 생성 ──

  function buildDOM() {
    if (document.getElementById('kkumdido-card-modal-bg')) return;
    var pfx = getRootPrefix();

    var lockSheet = document.createElement('div');
    lockSheet.id = 'kkumdido-print-lock-sheet';
    lockSheet.innerHTML = [
      '<div style="font-size:38px; margin-bottom:12px;">🏛️</div>',
      '<h2 style="margin:0 0 10px; font-size:22px;">꿈바온 디지털도서관 (꿈디도)</h2>',
      '<p style="margin:0 0 16px; font-size:15px; line-height:1.6;">이 문헌과 사역 스튜디오 자료를 인쇄하시려면<br>화면 우측 하단 <b>[🪪 도서관 이용증 발급]</b>에서 <b>이 기기 이용증</b>으로<br>사용자 이름 등록을 먼저 완료해 주세요.</p>',
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
    if ((window.location.pathname || '').indexOf('online_chapel_') !== -1) {
      fab.style.setProperty('display', 'none', 'important');
    }
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
      '  <span class="kkd-eyebrow">이사야 55:1 — 목마른 자들아 물로 나아오라 돈 없는 자도 오라</span>',
      '  <h3 id="kkd-modal-title">🏛️ 꿈디도 도서관 · 이 기기 이용증</h3>',
      '  <p class="kkd-sub" id="kkd-modal-desc">성함을 이 기기에 적어 무료 이용증을 만드세요. 계정 인증이나 다른 기기 연동 기능은 없으며, 입력 내용과 이용 기록은 이 브라우저에만 저장됩니다.</p>',
      '  <div class="kkd-vip-card" id="kkd-vip-card">',
      '    <div class="kkd-vip-top">',
      '      <strong>🏛️ 꿈바온 디지털도서관 & 스튜디오 이용증</strong>',
      '      <span id="kkd-card-provider">미발급</span>',
      '    </div>',
      '    <div class="kkd-vip-no" id="kkd-card-no">KKD-2026-••••</div>',
      '    <div class="kkd-vip-meta">',
      '      <div><small>열람자 성함 / 직분</small><b id="kkd-card-name">발급 후 표시됩니다</b></div>',
      '      <div><small>소속 교회 / 기관</small><b id="kkd-card-church">꿈바온 가족</b></div>',
      '      <div style="text-align:right;"><small>발급일</small><b id="kkd-card-date">-</b></div>',
      '    </div>',
      '  </div>',
      '  <div id="kkd-unverified-zone">',
      '    <form class="kkd-form-box on" id="kkd-issue-form" autocomplete="off">',
      '      <div style="font-size:13px; font-weight:800; color:#f3c969; margin-bottom:6px;">이 기기에서만 쓰는 이용증 · 이메일과 전화번호는 받지 않습니다</div>',
      '      <label for="kkd-in-name">이용증 및 서재에 새길 성함·직분 (필수)</label>',
      '      <input type="text" id="kkd-in-name" required placeholder="예: 홍길동 목사 / 김은혜 교사">',
      '      <label for="kkd-in-church">소속 교회 또는 사역지 (선택)</label>',
      '      <input type="text" id="kkd-in-church" placeholder="예: 새오름교회">',
      '      <button type="submit" class="kkd-submit">🪪 이 기기 이용증 만들고 입장</button>',
      '    </form>',
      '  </div>',
      '  <div id="kkd-verified-zone" style="display:none;">',
      '    <div class="kkd-member-actions">',
      '      <button type="button" class="kkd-action-btn pri" id="kkd-do-print-btn">🖨️ 현재 화면 유인물 인쇄</button>',
      '      <button type="button" class="kkd-action-btn" id="kkd-logout-btn">이 기기 이용증 지우기</button>',
      '    </div>',
      '  </div>',
      '  <div class="kkd-studio-grid" aria-label="꿈디도 통합 스튜디오 바로가기">',
      '    <a href="' + pfx + 'index.html">🏛️ 꿈디도 도서관 본관</a>',
      '    <a href="' + pfx + 'kkumdido_church_support_annex.html" data-kkd-studio-link="1">🏛️ 꿈디도 교회지원 별관 (말씀 등불)</a>',
      '    <a href="' + pfx + 'kkumdido_sermon_ai_studio.html" data-kkd-studio-link="1">🪄 모세의 지팡이 (본문카드대령·7종변환)</a>',
      '    <a href="' + pfx + 'kkumdido_sermon_studio.html" data-kkd-studio-link="1">👑 모세의 지팡이 · 66권 원어 설교준비실</a>',
      '    <a href="' + pfx + '00_꿈바온_원어풀어읽기_성경주석66권_통합웹뷰어.html" data-kkd-studio-link="1">📖 66권 원어·풀어읽기 주석 서고</a>',
      '    <a href="' + pfx + 'kkumdido_gotgan_studio.html" data-kkd-studio-link="1">🏺 내 설교 곳간 (개인 웹서재)</a>',
      '    <a href="' + pfx + 'kkumdido_pastoral_secretary_studio.html" data-kkd-studio-link="1">🌿 아론의 지팡이 (목양·심방·주보)</a>',
      '    <a href="' + pfx + 'kkumdido_gyojeok_studio.html" data-kkd-studio-link="1">🐑 무료 교적 (양떼 수첩·내PC보관)</a>',
      '    <a href="' + pfx + 'kkumdido_finance_studio.html" data-kkd-studio-link="1">💰 무료 헌금·재정 (청지기장부·내PC보관)</a>',
      '    <a href="' + pfx + 'kkumdido_print_workshop.html" data-kkd-studio-link="1">🎨 주보·전도지 공방</a>',
      '    <a href="' + pfx + 'kkumdido_sunday_school_studio.html" data-kkd-studio-link="1">🌱 교회학교 교사 스튜디오</a>',
      '    <a href="' + pfx + 'kkumdido_13dept_52weeks_studio.html" data-kkd-studio-link="1">📋 13부서 52주 커리큘럼</a>',
      '    <a href="' + pfx + 'kkumdido_family_worship_studio.html" data-kkd-studio-link="1">🕯️ 52주 가정예배 스튜디오</a>',
      '    <a href="' + pfx + 'kkumdido_translation_studio.html" data-kkd-studio-link="1">🌐 8개국어 기독교 번역 스튜디오</a>',
      '  </div>',
      '  <p class="kkd-foot-note">※ 값없이 받은 말씀을 값없이 나눕니다 (마태복음 10:8). 성도 명부(양떼 수첩)와 헌금·재정 장부(청지기 장부), 내 설교 곳간에 적으시는 기록은 이 서재 서버로 오지 않고 목사님 컴퓨터에만 남습니다.<br><span style="display:inline-block; margin-top:6px;"><a href="https://www.youtube.com/@dreaming_ondal" target="_blank" rel="noopener noreferrer" style="color:#f3c969; font-weight:800; text-decoration:underline; text-underline-offset:3px;">📺 꿈바온 유튜브 채널</a> · 매일말씀과 성경이야기도 유튜브 채널에서 나누고 있습니다.</span></p>',
      '  <button type="button" class="kkd-admin-open-btn" id="kkd-open-admin-btn" style="display:none;">👑 이 기기의 이용증 · 방문 · 사용 기록 열람</button>',
      '</div>'
    ].join('\n');
    document.body.appendChild(modalBg);

    buildAdminModalDOM();

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

    document.getElementById('kkd-issue-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var name = (document.getElementById('kkd-in-name').value || '').trim();
      var church = (document.getElementById('kkd-in-church').value || '').trim() || '꿈바온 가족';
      if (!name) return;

      var dateStr = formatDateDot();
      var card = {
        cardNo: generateCardNo('local:' + Date.now() + ':' + Math.random()),
        provider: '이 기기',
        account: '',
        name: name,
        church: church,
        issuedAt: dateStr
      };
      saveCard(card);
      isMandatoryGate = false;
      document.body.classList.remove('kkumdido-studio-locked');
      unlockGotganIfPresent(card);
      showToast('🎉 이 기기 이용증을 만들었습니다.');

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
      showToast('이 기기 이용증을 지웠습니다.');
    });

    document.getElementById('kkd-open-admin-btn').addEventListener('click', function () {
      requestOpenAdminModal();
    });

    patchPageButtons();
    syncAuthState();
    enforceStudioGateIfNeeded();
    setTimeout(recordAutoPageVisit, 350);
  }

  // ── 7-2. 👑 목사님 전용 가입자·방문자·사용기록 관제 모달 생성 및 렌더링 ──
  function buildAdminModalDOM() {
    if (document.getElementById('kkumdido-admin-modal-bg')) return;
    var admBg = document.createElement('div');
    admBg.id = 'kkumdido-admin-modal-bg';
    admBg.className = 'kkd-selectable';
    admBg.setAttribute('role', 'dialog');
    admBg.setAttribute('aria-modal', 'true');
    admBg.innerHTML = [
      '<div class="kkd-admin-modal">',
      '  <button type="button" class="kkd-close" id="kkd-adm-close">✕ 닫기</button>',
      '  <span class="kkd-eyebrow">👑 이 기기 이용 기록</span>',
      '  <h3 style="margin:0 0 6px; font-size:22px; color:#f4eee1;">🏛️ 이 기기 도서관 이용증 · 방문 · 사용 기록</h3>',
      '  <p style="margin:0; font-size:13.2px; color:#b8ab96; line-height:1.5;">이 브라우저에만 남은 이용증·방문·인쇄 기록을 확인하고, 우측 버튼으로 <b>[🔑 1:1 정식판 인증번호(KB)]</b>도 즉시 발급·복사하실 수 있습니다.</p>',
      '  <div class="kkd-adm-stats">',
      '    <div class="kkd-adm-stat"><small>🪪 이 기기 이용증</small><strong id="kkd-stat-members">0명</strong></div>',
      '    <div class="kkd-adm-stat"><small>👣 이 기기의 방문자</small><strong id="kkd-stat-visitors">0명</strong></div>',
      '    <div class="kkd-adm-stat"><small>🧰 스튜디오·예배당 누적 열람</small><strong id="kkd-stat-visits">0회</strong></div>',
      '    <div class="kkd-adm-stat"><small>🖨️ 유인물 인쇄 · PDF 열람</small><strong id="kkd-stat-prints">0회</strong></div>',
      '  </div>',
      '  <div class="kkd-adm-toolbar">',
      '    <div class="kkd-adm-tabs">',
      '      <button type="button" class="kkd-adm-tab on" data-tab="members">🪪 이 기기 이용증 (성함·교회)</button>',
      '      <button type="button" class="kkd-adm-tab" data-tab="visitors">👣 다녀간 방문자 현황</button>',
      '      <button type="button" class="kkd-adm-tab" data-tab="popular">🔥 인기 자료 · 인쇄 순위</button>',
      '      <button type="button" class="kkd-adm-tab" data-tab="logs">📜 상세 사용 기록 (시간순)</button>',
      '    </div>',
      '    <div class="kkd-adm-actions">',
      '      <input type="text" class="kkd-adm-search" id="kkd-adm-search" placeholder="🔍 성함, 교회, 스튜디오 검색...">',
      '      <button type="button" class="kkd-adm-btn" id="kkd-adm-sync-btn">🔄 이 기기 기록 새로고침</button>',
      '      <button type="button" class="kkd-adm-btn" id="kkd-adm-csv-btn">📥 엑셀(CSV) 저장</button>',
      '    </div>',
      '  </div>',
      '  <div class="kkd-adm-table-wrap" id="kkd-adm-table-wrap"></div>',
      '  <div style="margin-top:10px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; font-size:12px; color:#9a8f7c;">',
      '    <span id="kkd-adm-sync-status">🟢 이 기기 기록만 표시합니다</span>',
      '    <span>※ 성도·목회자의 개인 설교 원고 본문([내 설교 곳간])은 프라이버시 보호를 위해 수집하지 않으며, 이 기기의 이용증 정보와 스튜디오 이용 내역만 기록됩니다.</span>',
      '  </div>',
      '</div>'
    ].join('\n');
    document.body.appendChild(admBg);

    document.getElementById('kkd-adm-close').addEventListener('click', function () {
      adminModalOpen = false;
      admBg.classList.remove('on');
    });
    admBg.addEventListener('click', function (e) {
      if (e.target === admBg) {
        adminModalOpen = false;
        admBg.classList.remove('on');
      }
    });

    var tabs = admBg.querySelectorAll('.kkd-adm-tab');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].addEventListener('click', function () {
        for (var j = 0; j < tabs.length; j++) tabs[j].classList.remove('on');
        this.classList.add('on');
        currentAdminTab = this.getAttribute('data-tab') || 'members';
        renderAdminDashboard();
      });
    }

    document.getElementById('kkd-adm-search').addEventListener('input', function () {
      renderAdminDashboard();
    });

    document.getElementById('kkd-adm-sync-btn').addEventListener('click', function () {
      var st = document.getElementById('kkd-adm-sync-status');
      if (st) st.textContent = '🔄 이 기기 기록을 불러오는 중입니다...';
      syncFromCloudAll(function () {
        renderAdminDashboard();
        if (st) st.textContent = '🟢 이 기기 기록 새로고침 완료 (' + formatNowTs() + ')';
        showToast('✅ 이 기기 기록을 새로고침했습니다.');
      });
    });

    document.getElementById('kkd-adm-csv-btn').addEventListener('click', function () {
      exportVaultToCSV();
    });
  }

  function requestOpenAdminModal() {
    if (!isPastorAdmin()) {
      var pin = window.prompt('👑 [꿈바온 목사님 전용 관제실]\n목사님 전용 4자리 비밀번호(PIN)를 입력해 주세요:', '');
      if (pin === null) return;
      if (!verifyAdminPin(pin)) {
        showToast('🔒 비밀번호가 일치하지 않습니다.');
        return;
      }
      try {
        sessionStorage.setItem('kkumdido_admin_unlocked', '1');
      } catch (e) {}
    }
    closeCardModal();
    openAdminModal();
  }

  function openAdminModal() {
    if (!isPastorAdmin()) return;
    try { localStorage.setItem('kkumdido_is_pastor_device', '1'); } catch (e0) {}
    buildDOM();
    adminModalOpen = true;
    var admBg = document.getElementById('kkumdido-admin-modal-bg');
    if (admBg) admBg.classList.add('on');
    var vInit = getLocalVault();
    saveLocalVault(vInit);
    renderAdminDashboard();
    var st = document.getElementById('kkd-adm-sync-status');
    if (st) st.textContent = '🔄 이 기기 기록을 불러오는 중...';
    syncFromCloudAll(function () {
      renderAdminDashboard();
      if (st) st.textContent = '🟢 이 기기 기록 확인 완료 (' + formatNowTs() + ')';
    });
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderAdminDashboard() {
    if (!isPastorAdmin()) return;
    var wrap = document.getElementById('kkd-adm-table-wrap');
    if (!wrap) return;
    var vault = getLocalVault();
    var q = ((document.getElementById('kkd-adm-search') || {}).value || '').trim().toLowerCase();

    var membersArr = Object.keys(vault.members || {}).map(function (k) { return vault.members[k]; });
    membersArr.sort(function (a, b) { return String(b.lastSeenAt || '').localeCompare(String(a.lastSeenAt || '')); });

    var visitorsArr = Object.keys(vault.visitors || {}).map(function (k) { return vault.visitors[k]; });
    visitorsArr.sort(function (a, b) { return String(b.lastSeenAt || '').localeCompare(String(a.lastSeenAt || '')); });

    var logsArr = (vault.logs || []).slice();
    logsArr.sort(function (a, b) { return String(b.ts || '').localeCompare(String(a.ts || '')); });

    // 상단 통계 갱신
    var totalVisits = 0;
    var totalPrints = 0;
    for (var vIdx = 0; vIdx < visitorsArr.length; vIdx++) {
      totalVisits += (visitorsArr[vIdx].visitCount || 1);
      totalPrints += (visitorsArr[vIdx].printCount || 0);
    }
    if (totalVisits < membersArr.length) totalVisits = membersArr.length;

    var elM = document.getElementById('kkd-stat-members');
    var elV = document.getElementById('kkd-stat-visitors');
    var elS = document.getElementById('kkd-stat-visits');
    var elP = document.getElementById('kkd-stat-prints');
    if (elM) elM.textContent = membersArr.length + '명';
    if (elV) elV.textContent = Math.max(visitorsArr.length, membersArr.length) + '명';
    if (elS) elS.textContent = totalVisits + '회';
    if (elP) elP.textContent = totalPrints + '회';

    if (currentAdminTab === 'members') {
      var filteredM = membersArr.filter(function (m) {
        if (!q) return true;
        var hay = [m.cardNo, m.name, m.account, m.church, m.provider, (m.pagesVisited || []).join(' '), (m.itemsViewed || []).join(' '), (m.itemsPrinted || []).join(' '), m.lastAction].join(' ').toLowerCase();
        return hay.indexOf(q) !== -1;
      });
      if (filteredM.length === 0) {
        wrap.innerHTML = '<div style="padding:38px 20px; text-align:center; color:#9a8f7c;">등록된 도서관 이용증 가입자가 없거나 검색 조건과 일치하는 분이 없습니다.</div>';
        return;
      }
      var rowsM = filteredM.map(function (m) {
        var pagesHtml = (m.pagesVisited || []).map(function (p) {
          return '<span class="kkd-pill">' + escapeHtml(p) + '</span>';
        }).join(' ');
        var printedHtml = (m.itemsPrinted || []).map(function (ip) {
          return '<span class="kkd-pill green">🖨️ ' + escapeHtml(ip) + '</span>';
        }).join(' ');
        var viewedHtml = (m.itemsViewed || []).map(function (iv) {
          return '<span class="kkd-pill blue">📖 ' + escapeHtml(iv) + '</span>';
        }).join(' ');
        var kbCode = computeLicenseCode(m.name);
        return [
          '<tr>',
          '  <td style="white-space:nowrap; width:135px;"><div><b>' + escapeHtml(m.issuedAt || '-') + '</b></div><div style="font-size:11px; color:#9a8f7c;">최근: ' + escapeHtml((m.lastSeenAt || '').slice(5, 16)) + '</div></td>',
          '  <td style="font-family:monospace; font-weight:800; color:#f3c969; white-space:nowrap; width:125px;">' + escapeHtml(m.cardNo) + '</td>',
          '  <td style="font-weight:800; color:#fff; white-space:nowrap; font-size:13.5px;">' + escapeHtml(m.name) + '</td>',
          '  <td style="white-space:nowrap; color:#e0d8ca;">' + escapeHtml(m.church || '꿈바온 가족') + '</td>',
          '  <td style="white-space:nowrap;"><span class="kkd-pill ' + (m.provider === '카카오' ? '' : 'blue') + '">' + escapeHtml(m.provider || '이 기기') + '</span> <b style="color:#ffd97d;">' + escapeHtml(m.account || '-') + '</b></td>',
          '  <td style="white-space:nowrap; width:110px; text-align:center;"><span style="color:#f3c969; font-weight:800;">방문 ' + (m.visitCount || 1) + '회</span>' + (m.contentCount ? '<div style="font-size:11px; color:#93c5fd;">열람 ' + m.contentCount + '건</div>' : '') + '<div style="font-size:11px; color:' + (m.printCount ? '#6ee7b7; font-weight:700;' : '#a89a78;') + '">인쇄 ' + (m.printCount || 0) + '회</div></td>',
          '  <td><div style="display:flex; flex-wrap:wrap; gap:3px;">' + (pagesHtml || '<span style="color:#888;">-</span>') + '</div>' +
            (printedHtml ? '<div style="margin-top:4px; display:flex; flex-wrap:wrap; gap:3px; align-items:center;"><span style="font-size:11px; color:#6ee7b7; font-weight:800; margin-right:2px;">인쇄한 자료:</span>' + printedHtml + '</div>' : '') +
            (viewedHtml ? '<div style="margin-top:4px; display:flex; flex-wrap:wrap; gap:3px; align-items:center;"><span style="font-size:11px; color:#93c5fd; font-weight:800; margin-right:2px;">찾아본 자료:</span>' + viewedHtml + '</div>' : '') +
            (m.lastAction ? '<div style="font-size:11.5px; color:#a89a78; margin-top:4px;">최근활동: ' + escapeHtml(m.lastAction) + '</div>' : '') + '</td>',
          '  <td style="white-space:nowrap; width:110px; text-align:center;"><button type="button" class="kkd-kb-btn" data-kb-name="' + escapeHtml(m.name) + '" data-kb-code="' + escapeHtml(kbCode) + '">🔑 ' + escapeHtml(kbCode) + ' 복사</button></td>',
          '</tr>'
        ].join('');
      }).join('');
      wrap.innerHTML = [
        '<table class="kkd-adm-table">',
        '  <thead><tr>',
        '    <th style="white-space:nowrap; width:135px;">가입일 / 최근방문</th><th style="white-space:nowrap; width:125px;">이용증 번호</th><th style="white-space:nowrap;">성함 · 직분</th><th style="white-space:nowrap;">소속 교회</th><th style="white-space:nowrap;">이메일 / 계정</th><th style="white-space:nowrap; width:110px; text-align:center;">이용 횟수</th><th>다녀간 스튜디오 · 찾아본/인쇄한 자료 기록</th><th style="white-space:nowrap; width:110px; text-align:center;">1:1 정식판 코드</th>',
        '  </tr></thead>',
        '  <tbody>' + rowsM + '</tbody>',
        '</table>'
      ].join('');

      var kbBtns = wrap.querySelectorAll('.kkd-kb-btn');
      for (var b = 0; b < kbBtns.length; b++) {
        kbBtns[b].addEventListener('click', function () {
          var owner = this.getAttribute('data-kb-name');
          var code = this.getAttribute('data-kb-code');
          var msg = '[꿈바온 설교 프로그램(66권) & 설교 곳간 & 모세의 지팡이 통합 사용권]\n\n' +
            '• 등록 성함: ' + owner + '\n' +
            '• 1:1 전용 인증번호: ' + code + '\n\n' +
            '위 성함과 전용 인증번호 하나로 [👑 꿈바온 설교 프로그램(66권 전체 정식판)], [🏺 내 설교 곳간], [🪄 모세의 지팡이]를 모두 여실 수 있습니다.';
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(msg);
          }
          showToast('📋 [' + owner + '] 님의 전용 인증번호(' + code + ') 안내 문구가 복사되었습니다!');
        });
      }
      return;
    }

    if (currentAdminTab === 'visitors') {
      var filteredV = visitorsArr.filter(function (v) {
        if (!q) return true;
        var hay = [v.visitorId, v.cardNo, v.name, v.account, v.church, v.device, (v.pagesVisited || []).join(' '), (v.itemsViewed || []).join(' '), (v.itemsPrinted || []).join(' '), v.lastAction].join(' ').toLowerCase();
        return hay.indexOf(q) !== -1;
      });
      if (filteredV.length === 0) {
        wrap.innerHTML = '<div style="padding:38px 20px; text-align:center; color:#9a8f7c;">기록된 방문자 내역이 없습니다.</div>';
        return;
      }
      var rowsV = filteredV.map(function (v) {
        var isMem = !!(v.cardNo && v.name && v.name !== '비로그인 방문자');
        var pagesHtml = (v.pagesVisited || []).map(function (p) {
          return '<span class="kkd-pill">' + escapeHtml(p) + '</span>';
        }).join(' ');
        var printedHtml = (v.itemsPrinted || []).map(function (ip) {
          return '<span class="kkd-pill green">🖨️ ' + escapeHtml(ip) + '</span>';
        }).join(' ');
        var viewedHtml = (v.itemsViewed || []).map(function (iv) {
          return '<span class="kkd-pill blue">📖 ' + escapeHtml(iv) + '</span>';
        }).join(' ');

        // Clean lastAction if it duplicates page name
        var cleanLastAction = v.lastAction || '';
        if (cleanLastAction) {
          cleanLastAction = cleanLastAction.replace(/^([^·]+)·\s*\1\s*/, '$1 ');
        }

        // Device Icon & Badge
        var dev = v.device || '웹 브라우저';
        var devIcon = '💻';
        if (/Android/i.test(dev)) devIcon = '📱';
        else if (/iPhone/i.test(dev)) devIcon = '🍎';
        else if (/iPad|태블릿/i.test(dev)) devIcon = '📟';
        else if (/Mac/i.test(dev)) devIcon = '🍏';
        else if (/Windows/i.test(dev)) devIcon = '🪟';

        // Visitor column: Member gets Name + Church/Account, Visitor gets Badge + ID
        var identityHtml = '';
        if (isMem) {
          identityHtml = '<div style="font-weight:800; color:#fff; font-size:13.5px; white-space:nowrap;">' + escapeHtml(v.name) + '</div>' +
            '<div style="font-size:11.5px; color:#ffd97d; margin-top:2px; white-space:nowrap;">' + escapeHtml(v.church || '소속 미지정') + ' · ' + escapeHtml(v.account || '-') + '</div>' +
            '<div style="font-size:10.5px; color:#9a8f7c; font-family:monospace; margin-top:1px; white-space:nowrap;">' + escapeHtml(v.cardNo) + '</div>';
        } else {
          identityHtml = '<div style="font-weight:700; color:#e0d8ca; font-size:13px; white-space:nowrap;">비로그인 방문자</div>' +
            '<div style="font-size:11px; color:#a89a78; font-family:monospace; margin-top:2px; white-space:nowrap;">' + escapeHtml(v.visitorId || '-') + '</div>';
        }

        return [
          '<tr>',
          '  <td style="white-space:nowrap; width:135px;"><div><b>' + escapeHtml((v.lastSeenAt || '').slice(0, 16)) + '</b></div><div style="font-size:11px; color:#9a8f7c;">최초: ' + escapeHtml((v.firstSeenAt || '').slice(0, 16)) + '</div></td>',
          '  <td style="white-space:nowrap; width:95px; text-align:center;">' + (isMem ? '<span class="kkd-pill green">🪪 이용증 회원</span>' : '<span class="kkd-pill gray">👣 일반 방문</span>') + '</td>',
          '  <td style="white-space:nowrap;">' + identityHtml + '</td>',
          '  <td style="white-space:nowrap; width:130px;"><span class="kkd-pill gray">' + devIcon + ' ' + escapeHtml(dev) + '</span></td>',
          '  <td style="white-space:nowrap; width:110px; text-align:center;"><span style="color:#f3c969; font-weight:800;">방문 ' + (v.visitCount || 1) + '회</span>' + (v.contentCount ? '<div style="font-size:11px; color:#93c5fd;">열람 ' + v.contentCount + '건</div>' : '') + (v.printCount ? '<div style="font-size:11px; color:#6ee7b7; font-weight:700;">인쇄 ' + v.printCount + '회</div>' : '<div style="font-size:11px; color:#888;">인쇄 0회</div>') + '</td>',
          '  <td><div style="display:flex; flex-wrap:wrap; gap:3px;">' + (pagesHtml || '-') + '</div>' +
            (printedHtml ? '<div style="margin-top:4px; display:flex; flex-wrap:wrap; gap:3px; align-items:center;"><span style="font-size:11px; color:#6ee7b7; font-weight:800; margin-right:2px;">인쇄한 자료:</span>' + printedHtml + '</div>' : '') +
            (viewedHtml ? '<div style="margin-top:4px; display:flex; flex-wrap:wrap; gap:3px; align-items:center;"><span style="font-size:11px; color:#93c5fd; font-weight:800; margin-right:2px;">찾아본 자료:</span>' + viewedHtml + '</div>' : '') +
            (cleanLastAction ? '<div style="font-size:11.5px; color:#a89a78; margin-top:4px;">최근: ' + escapeHtml(cleanLastAction) + '</div>' : '') + '</td>',
          '</tr>'
        ].join('');
      }).join('');
      wrap.innerHTML = [
        '<table class="kkd-adm-table">',
        '  <thead><tr>',
        '    <th style="white-space:nowrap; width:135px;">최근 방문 / 최초</th><th style="white-space:nowrap; width:95px; text-align:center;">구분</th><th style="white-space:nowrap;">방문자 정보 (성함·ID / 소속)</th><th style="white-space:nowrap; width:130px;">접속 기기</th><th style="white-space:nowrap; width:110px; text-align:center;">누적 활동</th><th>다녀간 페이지 · 찾아본/인쇄한 자료 여정</th>',
        '  </tr></thead>',
        '  <tbody>' + rowsV + '</tbody>',
        '</table>'
      ].join('');
      return;
    }

    if (currentAdminTab === 'popular') {
      var printStats = {};
      var contentStats = {};
      var pageStats = {};

      for (var pIdx = 0; pIdx < logsArr.length; pIdx++) {
        var lg = logsArr[pIdx];
        if (!lg) continue;
        if (q) {
          var h = [lg.pageTitle, lg.detail, lg.name, lg.church].join(' ').toLowerCase();
          if (h.indexOf(q) === -1) continue;
        }
        var pg = lg.pageTitle || '🏛️ 꿈디도 도서관';
        if (!pageStats[pg]) pageStats[pg] = { title: pg, visits: 0, contents: 0, prints: 0, lastTs: lg.ts || '' };
        if ((lg.ts || '') > pageStats[pg].lastTs) pageStats[pg].lastTs = lg.ts || '';

        if (lg.type === 'print' || lg.type === 'pdf') {
          pageStats[pg].prints++;
          var pKey = extractCleanItemLabel(lg.detail, pg);
          if (!printStats[pKey]) {
            printStats[pKey] = { item: pKey, page: pg, count: 0, lastUser: lg.name || '방문자', lastTs: lg.ts || '' };
          }
          printStats[pKey].count++;
          if ((lg.ts || '') >= printStats[pKey].lastTs) {
            printStats[pKey].lastTs = lg.ts || '';
            printStats[pKey].lastUser = (lg.name && lg.name !== '비로그인 방문자') ? (lg.name + (lg.church && lg.church !== '-' ? ' (' + lg.church + ')' : '')) : '방문자';
          }
        } else if (lg.type === 'content') {
          pageStats[pg].contents++;
          var cKey = extractCleanItemLabel(lg.detail, pg);
          if (!contentStats[cKey]) {
            contentStats[cKey] = { item: cKey, page: pg, count: 0, lastUser: lg.name || '방문자', lastTs: lg.ts || '' };
          }
          contentStats[cKey].count++;
          if ((lg.ts || '') >= contentStats[cKey].lastTs) {
            contentStats[cKey].lastTs = lg.ts || '';
            contentStats[cKey].lastUser = (lg.name && lg.name !== '비로그인 방문자') ? (lg.name + (lg.church && lg.church !== '-' ? ' (' + lg.church + ')' : '')) : '방문자';
          }
        } else {
          pageStats[pg].visits++;
        }
      }

      var printList = Object.keys(printStats).map(function (k) { return printStats[k]; }).sort(function (a, b) {
        return (b.count - a.count) || String(b.lastTs).localeCompare(String(a.lastTs));
      });
      var contentList = Object.keys(contentStats).map(function (k) { return contentStats[k]; }).sort(function (a, b) {
        return (b.count - a.count) || String(b.lastTs).localeCompare(String(a.lastTs));
      });
      var pageList = Object.keys(pageStats).map(function (k) { return pageStats[k]; }).sort(function (a, b) {
        return ((b.visits + b.contents + b.prints) - (a.visits + a.contents + a.prints)) || String(b.lastTs).localeCompare(String(a.lastTs));
      });

      var printRowsHtml = printList.length === 0
        ? '<tr><td colspan="5" style="text-align:center; color:#9a8f7c; padding:18px;">아직 인쇄·PDF 출력된 세부 자료 기록이 없습니다.</td></tr>'
        : printList.map(function (it, idx) {
            return '<tr>' +
              '<td style="width:60px; text-align:center; font-weight:800; color:#f3c969;">' + (idx + 1) + '위</td>' +
              '<td><span class="kkd-pill green">🖨️ ' + escapeHtml(it.item) + '</span></td>' +
              '<td><span class="kkd-pill">' + escapeHtml(it.page) + '</span></td>' +
              '<td style="width:95px; text-align:center; font-weight:800; color:#6ee7b7;">' + it.count + '회 인쇄</td>' +
              '<td style="width:210px; font-size:12px; color:#d8c390;">' + escapeHtml(it.lastUser) + ' <span style="color:#9a8f7c;">(' + escapeHtml((it.lastTs || '').slice(5, 16)) + ')</span></td>' +
              '</tr>';
          }).join('');

      var contentRowsHtml = contentList.length === 0
        ? '<tr><td colspan="5" style="text-align:center; color:#9a8f7c; padding:18px;">세부 자료(인물·사건·문헌·주석 본문) 열람 기록이 이곳에 실시간 집계됩니다.</td></tr>'
        : contentList.map(function (it, idx) {
            return '<tr>' +
              '<td style="width:60px; text-align:center; font-weight:800; color:#f3c969;">' + (idx + 1) + '위</td>' +
              '<td><span class="kkd-pill blue">📖 ' + escapeHtml(it.item) + '</span></td>' +
              '<td><span class="kkd-pill">' + escapeHtml(it.page) + '</span></td>' +
              '<td style="width:95px; text-align:center; font-weight:800; color:#93c5fd;">' + it.count + '회 열람</td>' +
              '<td style="width:210px; font-size:12px; color:#d8c390;">' + escapeHtml(it.lastUser) + ' <span style="color:#9a8f7c;">(' + escapeHtml((it.lastTs || '').slice(5, 16)) + ')</span></td>' +
              '</tr>';
          }).join('');

      var pageRowsHtml = pageList.map(function (pg, idx) {
        return '<tr>' +
          '<td style="width:60px; text-align:center; font-weight:800; color:#f3c969;">' + (idx + 1) + '위</td>' +
          '<td><span class="kkd-pill">' + escapeHtml(pg.title) + '</span></td>' +
          '<td style="width:110px; text-align:center; font-weight:800; color:#f3c969;">방문 ' + pg.visits + '회</td>' +
          '<td style="width:110px; text-align:center; color:#93c5fd;">열람 ' + pg.contents + '건</td>' +
          '<td style="width:110px; text-align:center; color:' + (pg.prints ? '#6ee7b7; font-weight:800;' : '#888;') + '">인쇄 ' + pg.prints + '회</td>' +
          '<td style="width:150px; font-size:12px; color:#9a8f7c;">최근: ' + escapeHtml((pg.lastTs || '').slice(5, 16)) + '</td>' +
          '</tr>';
      }).join('');

      wrap.innerHTML = [
        '<div style="padding:14px 16px;">',
        '  <div style="font-size:14px; font-weight:800; color:#6ee7b7; margin-bottom:8px;">🖨️ 1. 방문자들이 실제 인쇄 · PDF 출력해 간 자료 순위</div>',
        '  <table class="kkd-adm-table" style="margin-bottom:20px;">',
        '    <thead><tr><th style="width:60px; text-align:center;">순위</th><th>인쇄 · 출력한 세부 자료명</th><th>소속 스튜디오 / 전시관</th><th style="width:95px; text-align:center;">인쇄 횟수</th><th style="width:210px;">최근 인쇄한 분</th></tr></thead>',
        '    <tbody>' + printRowsHtml + '</tbody>',
        '  </table>',
        '  <div style="font-size:14px; font-weight:800; color:#93c5fd; margin-bottom:8px;">📖 2. 방문자들이 클릭해서 가장 많이 찾아본 세부 자료 (인물·사건·문헌·성경본문)</div>',
        '  <table class="kkd-adm-table" style="margin-bottom:20px;">',
        '    <thead><tr><th style="width:60px; text-align:center;">순위</th><th>클릭하여 열람한 세부 자료명</th><th>소속 스튜디오 / 전시관</th><th style="width:95px; text-align:center;">열람 횟수</th><th style="width:210px;">최근 열람자</th></tr></thead>',
        '    <tbody>' + contentRowsHtml + '</tbody>',
        '  </table>',
        '  <div style="font-size:14px; font-weight:800; color:#f3c969; margin-bottom:8px;">🏛️ 3. 가장 많이 찾은 스튜디오 · 전시관 순위</div>',
        '  <table class="kkd-adm-table">',
        '    <thead><tr><th style="width:60px; text-align:center;">순위</th><th>스튜디오 · 전시관 이름</th><th style="width:110px; text-align:center;">방문 횟수</th><th style="width:110px; text-align:center;">세부자료 열람</th><th style="width:110px; text-align:center;">유인물 인쇄</th><th style="width:150px;">최근 활동 시각</th></tr></thead>',
        '    <tbody>' + pageRowsHtml + '</tbody>',
        '  </table>',
        '</div>'
      ].join('');
      return;
    }

    // 상세 사용 기록 (logs)
    var filteredL = logsArr.filter(function (l) {
      if (!q) return true;
      var hay = [l.ts, l.name, l.account, l.church, l.pageTitle, l.detail, l.cardNo, l.visitorId].join(' ').toLowerCase();
      return hay.indexOf(q) !== -1;
    });
    if (filteredL.length === 0) {
      wrap.innerHTML = '<div style="padding:38px 20px; text-align:center; color:#9a8f7c;">상세 사용 기록이 없습니다.</div>';
      return;
    }
    var rowsL = filteredL.map(function (l) {
      var badge = '<span class="kkd-pill gray">👣 일반 방문</span>';
      if (l.type === 'signup') badge = '<span class="kkd-pill green">🪪 이용증 발급</span>';
      else if (l.type === 'studio') badge = '<span class="kkd-pill blue">🧰 스튜디오 사용</span>';
      else if (l.type === 'content') badge = '<span class="kkd-pill blue">📖 자료 열람</span>';
      else if (l.type === 'print') badge = '<span class="kkd-pill green">🖨️ 인쇄 실행</span>';
      else if (l.type === 'pdf') badge = '<span class="kkd-pill green">📕 PDF 열람</span>';
      return [
        '<tr>',
        '  <td style="white-space:nowrap; font-family:monospace; color:#d8c390; width:135px;">' + escapeHtml(l.ts || '-') + '</td>',
        '  <td style="white-space:nowrap; width:95px; text-align:center;">' + badge + '</td>',
        '  <td style="font-weight:800; color:#fff; white-space:nowrap;">' + escapeHtml(l.name || '비로그인 방문자') + (l.church && l.church !== '-' ? '<div style="font-size:11px; color:#a89a78; font-weight:normal;">' + escapeHtml(l.church) + '</div>' : '') + '</td>',
        '  <td style="white-space:nowrap; color:#ffd97d;">' + escapeHtml(l.account || '-') + '</td>',
        '  <td style="white-space:nowrap;"><span class="kkd-pill">' + escapeHtml(l.pageTitle || '-') + '</span></td>',
        '  <td>' + escapeHtml(l.detail || '-') + (l.device ? ' <span style="font-size:11px; color:#8c867a; white-space:nowrap;">(' + escapeHtml(l.device) + ')</span>' : '') + '</td>',
        '</tr>'
      ].join('');
    }).join('');
    wrap.innerHTML = [
      '<table class="kkd-adm-table">',
      '  <thead><tr>',
      '    <th style="white-space:nowrap; width:135px;">일시</th><th style="white-space:nowrap; width:95px; text-align:center;">구분</th><th style="white-space:nowrap;">성함 · 직분 / 소속</th><th style="white-space:nowrap;">이메일 / 계정</th><th style="white-space:nowrap;">머문 공간 (스튜디오)</th><th>상세 사용 · 열람 · 인쇄 내용</th>',
      '  </tr></thead>',
      '  <tbody>' + rowsL + '</tbody>',
      '</table>'
    ].join('');
  }

  function exportVaultToCSV() {
    if (!isPastorAdmin()) return;
    var vault = getLocalVault();
    var lines = ['\uFEFF구분,발급일/최근방문,이용증번호/ID,성함_직분,소속교회,이메일_계정,인증방식,방문횟수,자료열람수,인쇄횟수,사용한_스튜디오_목록,인쇄한_자료_목록,찾아본_자료_목록,최근활동,1대1_정식판코드'];
    var esc = function (v) {
      var s = String(v == null ? '' : v).replace(/"/g, '""');
      return '"' + s + '"';
    };
    Object.keys(vault.members || {}).forEach(function (k) {
      var m = vault.members[k];
      lines.push([
        esc('가입회원'),
        esc((m.issuedAt || '') + ' / ' + (m.lastSeenAt || '')),
        esc(m.cardNo),
        esc(m.name),
        esc(m.church),
        esc(m.account),
        esc(m.provider),
        esc(m.visitCount || 1),
        esc(m.contentCount || 0),
        esc(m.printCount || 0),
        esc((m.pagesVisited || []).join(' | ')),
        esc((m.itemsPrinted || []).join(' | ')),
        esc((m.itemsViewed || []).join(' | ')),
        esc(m.lastAction || ''),
        esc(computeLicenseCode(m.name))
      ].join(','));
    });
    Object.keys(vault.visitors || {}).forEach(function (k) {
      var v = vault.visitors[k];
      if (v.cardNo && vault.members[v.cardNo]) return;
      lines.push([
        esc('일반방문자'),
        esc((v.firstSeenAt || '') + ' / ' + (v.lastSeenAt || '')),
        esc(v.visitorId),
        esc(v.name || '비로그인 방문자'),
        esc(v.church || '-'),
        esc(v.account || '-'),
        esc(v.device || '-'),
        esc(v.visitCount || 1),
        esc(v.contentCount || 0),
        esc(v.printCount || 0),
        esc((v.pagesVisited || []).join(' | ')),
        esc((v.itemsPrinted || []).join(' | ')),
        esc((v.itemsViewed || []).join(' | ')),
        esc(v.lastAction || ''),
        esc('')
      ].join(','));
    });
    var blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = '꿈디도_이기기_이용기록_' + formatDateDot().replace(/\./g, '') + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('📥 꿈디도 이 기기 이용 기록 엑셀(CSV) 파일이 저장되었습니다.');
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
      descEl.innerHTML = '<strong style="color:#f3c969;">' + escapeHtml(customMessage) + '</strong><br>성함을 이 기기에 적으면 무료 이용증이 열립니다. 계정 인증이나 외부 기록 전송은 하지 않습니다.';
    } else if (!isVerified()) {
      descEl.innerHTML = '성함을 이 브라우저에 적으면 <b>이 기기 이용증</b>이 열립니다. 계정 인증이나 다른 기기 연동 기능은 없으며, 이용 기록은 이 브라우저에만 남습니다.';
    }
    syncAuthState();
    var modalBg = document.getElementById('kkumdido-card-modal-bg');
    if (modalBg) modalBg.classList.add('on');
    if (!isVerified()) setTimeout(function () { document.getElementById('kkd-in-name').focus(); }, 60);
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
        '🔐 이 사역 프로그램(스튜디오)은 「이 기기 도서관 이용증」을 만드신 뒤 사용하실 수 있습니다.',
        true
      );
    }
  }

  function requireStudioLogin(afterAction, customMessage) {
    if (isVerified() || window.__KKD_TEST_BYPASS === true) {
      if (typeof afterAction === 'function') afterAction();
      return true;
    }
    if (isStudioPage()) {
      document.body.classList.add('kkumdido-studio-locked');
    }
    openCardModal(
      afterAction || null,
      customMessage || '🔐 이 기기 이용증 발급을 완료하신 분만 이 사역 도구를 사용하실 수 있습니다.',
      isStudioPage()
    );
    return false;
  }

  // 전 스튜디오에 들어왔을 때 도서관 이용증 회원 정보로 자동 잠금 해제 및 교회·목회자명 연동
  function unlockGotganIfPresent(card) {
    if (!card) return;
    var gate = document.getElementById('licenseGate');
    if (gate) {
      gate.classList.remove('active');
      gate.style.display = 'none';
    }
    try {
      if (typeof window.applyMemberGotganProfile === 'function') {
        window.applyMemberGotganProfile(card.name, card.church);
      } else {
        var libTitle = document.getElementById('libraryTitle');
        if (libTitle && (!libTitle.textContent || libTitle.textContent === '목회자의 설교 곳간')) {
          libTitle.textContent = card.name + '의 설교 곳간';
        }
      }
      if (typeof window.applyMemberGyojeokProfile === 'function') {
        window.applyMemberGyojeokProfile(card.name, card.church, card.cardNo);
      }
      if (typeof window.applyMemberSecretaryProfile === 'function') {
        window.applyMemberSecretaryProfile(card.name, card.church);
      }
      // 모세의 지팡이 (설교 AI 스튜디오) 설교자·교회명 자동 연동
      var inPreacher = document.getElementById('inPreacher');
      if (inPreacher && (!inPreacher.value || inPreacher.value === '담임목사')) {
        inPreacher.value = card.name;
      }
      var inChurch = document.getElementById('inChurch');
      if (inChurch && card.church && card.church !== '꿈바온 가족' && (!inChurch.value || inChurch.value === '꿈바온교회' || inChurch.value === '꿈바온 은혜교회')) {
        inChurch.value = card.church;
        if (typeof window.generateAll7Materials === 'function') {
          try { window.generateAll7Materials(false); } catch (e0) {}
        }
      }
      // 아론의 지팡이 (목회비서 6석) 목회자·교회명 자동 연동
      var sermPreacher = document.getElementById('sermPreacher');
      if (sermPreacher && (!sermPreacher.value || sermPreacher.value === '담임목사')) {
        sermPreacher.value = card.name;
      }
      var jbPastor = document.getElementById('jbPastorName');
      if (jbPastor && (!jbPastor.value || jbPastor.value === '담임목사')) {
        jbPastor.value = card.name;
      }
      if (card.church && card.church !== '꿈바온 가족') {
        var bulCh = document.getElementById('bulChurchName');
        if (bulCh && (!bulCh.value || bulCh.value === '꿈바온교회')) bulCh.value = card.church;
        var jbCh = document.getElementById('jbChurchName');
        if (jbCh && (!jbCh.value || jbCh.value === '꿈바온교회')) jbCh.value = card.church;
      }
      // 66권 원어 설교준비실 (kkumdido_sermon_studio) 목회자 프로필 연동
      var sermonPreacher = document.getElementById('sermonPreacherInput');
      if (sermonPreacher && (!sermonPreacher.value || sermonPreacher.value === '꿈바온 사역팀')) {
        sermonPreacher.value = card.name;
      }
      var mBadge = document.getElementById('headerModeBadge');
      if (mBadge && mBadge.textContent.indexOf(card.name) === -1) {
        mBadge.textContent = '[🪪 도서관 이용증 인증됨 · ' + card.name + ' (' + card.cardNo + ' · 66권 전체 열림)]';
      }
    } catch (e) {}
  }

  function syncAuthState() {
    var card = getCard();
    var fab = document.getElementById('kkumdido-pass-fab');
    var certHeader = document.getElementById('kkumdido-print-cert-header');

    if (card) {
      document.body.classList.add('kkumdido-member-verified');
      document.body.classList.remove('kkumdido-studio-locked');
      unlockGotganIfPresent(card);
      if (fab) {
        fab.classList.add('verified');
        fab.innerHTML = '<span class="kkd-badge-dot"></span><span>🪪 ' + escapeHtml(card.name) + ' (' + escapeHtml(card.cardNo) + ')</span><span class="kkd-sep kkd-print-quick" title="이 페이지 인쇄">🖨️ 인쇄</span>';
      }
      if (certHeader) {
        certHeader.innerHTML = '<span>🏛️ <b>꿈바온 디지털도서관(꿈디도) 공식 열람본</b> · 무단 복제 및 상업적 재배포 금지</span><span>이 기기 이용증: <b>' + escapeHtml(card.cardNo) + '</b> · 열람자: <b>' + escapeHtml(card.name) + ' (' + escapeHtml(card.church) + ')</b></span>';
      }
    } else {
      document.body.classList.remove('kkumdido-member-verified');
      if (fab) {
        fab.classList.remove('verified');
        fab.innerHTML = '<span class="kkd-badge-dot"></span><span>🪪 이 기기 이용증 만들기 · 🖨️ 인쇄</span>';
      }
      if (certHeader) {
        certHeader.innerHTML = '';
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
    var admBtn = document.getElementById('kkd-open-admin-btn');
    if (admBtn) {
      admBtn.style.display = isPastorCardHint() ? 'flex' : 'none';
    }

    if (noEl) {
      if (card) {
        titleEl.textContent = '🏛️ 내 꿈디도 도서관 이용증 & 스튜디오 런처';
        provEl.textContent = card.provider + ' 이용증';
        noEl.textContent = card.cardNo;
        nameEl.textContent = card.name;
        churchEl.textContent = card.church;
        dateEl.textContent = card.issuedAt;
        unvZone.style.display = 'none';
        verZone.style.display = 'block';
      } else {
        titleEl.textContent = '🏛️ 꿈디도 도서관 · 이 기기 이용증';
        provEl.textContent = '미발급';
        noEl.textContent = 'KKD-2026-••••';
        nameEl.textContent = '발급 후 표시됩니다';
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

  var lastLoggedContentSig = '';
  var lastLoggedContentAt = 0;
  var initialPageReadyForHooks = false;
  setTimeout(function () { initialPageReadyForHooks = true; }, 1400);

  function logContentViewDebounced(labelText) {
    if (!labelText) return;
    var now = Date.now();
    if (labelText === lastLoggedContentSig && (now - lastLoggedContentAt) < 3500) return;
    lastLoggedContentSig = labelText;
    lastLoggedContentAt = now;
    recordTelemetryEvent('content', labelText);
  }

  function installContentViewHooks() {
    // 1) 본관(index.html) 및 성경지도(atrium.js)의 trackKkumbaonAction 연동
    if (typeof window.trackKkumbaonAction === 'function' && !window.__kkdPatchedTrackAction) {
      var origTrack = window.trackKkumbaonAction;
      window.__kkdPatchedTrackAction = true;
      window.trackKkumbaonAction = function (actionType, id, title) {
        try { origTrack.apply(this, arguments); } catch (e0) {}
        var t = String(title || id || '').trim();
        if (!t) return;
        if (actionType === 'read') logContentViewDebounced('📜 본관 문헌 열람: [' + t + ']');
        else if (actionType === 'city') logContentViewDebounced('🗺️ 성경지도 도시 열람: [' + t + ']');
        else if (actionType === 'video') logContentViewDebounced('🎬 성경 영상 시청: [' + t + ']');
        else if (actionType === 'ebook') recordTelemetryEvent('pdf', '📕 화보·전자책 열람: [' + t + ']');
        else logContentViewDebounced('📖 자료 열람: [' + t + ']');
      };
    }

    // 2) 제1관 성경 인물대백과 350인 (figures_encyclopedia_preview.html)
    if (typeof window.openFigure === 'function' && !window.__kkdPatchedOpenFigure) {
      var origOpenFigure = window.openFigure;
      window.__kkdPatchedOpenFigure = true;
      window.openFigure = function (pid) {
        var res = origOpenFigure.apply(this, arguments);
        if (initialPageReadyForHooks) {
          setTimeout(function () {
            var n = ((document.getElementById('drwName') || {}).textContent || '').trim();
            if (n) logContentViewDebounced('👑 인물 열전 열람: [' + n + ']');
          }, 60);
        }
        return res;
      };
    }
    if (typeof window.openOverviewModal === 'function' && !window.__kkdPatchedOpenOverview) {
      var origOpenOverview = window.openOverviewModal;
      window.__kkdPatchedOpenOverview = true;
      window.openOverviewModal = function (kind) {
        var res = origOpenOverview.apply(this, arguments);
        setTimeout(function () {
          var n = ((document.getElementById('drwName') || {}).textContent || '').trim();
          if (n) logContentViewDebounced('👑 왕조 대조표 열람: [' + n + ']');
        }, 60);
        return res;
      };
    }

    // 3) 제2관 성경 사건대백과 (events_encyclopedia_preview.html)
    if (typeof window.openEventModal === 'function' && !window.__kkdPatchedOpenEvent) {
      var origOpenEvent = window.openEventModal;
      window.__kkdPatchedOpenEvent = true;
      window.openEventModal = function (eventId) {
        var res = origOpenEvent.apply(this, arguments);
        if (initialPageReadyForHooks) {
          setTimeout(function () {
            var n = ((document.getElementById('modalTitle') || {}).textContent || '').trim();
            if (n) logContentViewDebounced('📜 구속사 사건 열람: [' + n + ']');
          }, 60);
        }
        return res;
      };
    }
    if (typeof window.openComparison === 'function' && !window.__kkdPatchedOpenComp) {
      var origOpenComp = window.openComparison;
      window.__kkdPatchedOpenComp = true;
      window.openComparison = function (key) {
        var res = origOpenComp.apply(this, arguments);
        setTimeout(function () {
          var n = ((document.getElementById('compModalTitle') || {}).textContent || '').trim();
          if (n) logContentViewDebounced('📜 사건 비교표 열람: [' + n + ']');
        }, 60);
        return res;
      };
    }

    // 4) 제3관 성경 비하인드 300선 (behinds_encyclopedia_preview.html)
    if (typeof window.openBehindModal === 'function' && !window.__kkdPatchedOpenBehind) {
      var origOpenBehind = window.openBehindModal;
      window.__kkdPatchedOpenBehind = true;
      window.openBehindModal = function (behindId) {
        var res = origOpenBehind.apply(this, arguments);
        if (initialPageReadyForHooks) {
          setTimeout(function () {
            var n = ((document.getElementById('modalTitle') || {}).textContent || '').trim();
            if (n) logContentViewDebounced('💡 성경 비하인드 열람: [' + n + ']');
          }, 60);
        }
        return res;
      };
    }

    // 5) 12대 아카이브 3,650모듈 서고 (꿈디도_12대아카이브_3650모듈_통합웹뷰어.html)
    if (typeof window.openModal === 'function' && !window.__kkdPatchedOpen12Modal) {
      var origOpen12Modal = window.openModal;
      window.__kkdPatchedOpen12Modal = true;
      window.openModal = function (id, fromBack) {
        var res = origOpen12Modal.apply(this, arguments);
        var recordAfter = function () {
          var ctx = getActiveContentContext();
          if (ctx) logContentViewDebounced('🏛️ 12대 아카이브 열람: ' + ctx);
        };
        if (res && typeof res.then === 'function') {
          res.then(function () { setTimeout(recordAfter, 60); }).catch(function () {});
        } else {
          setTimeout(recordAfter, 120);
        }
        return res;
      };
    }

    // 6) 66권 원어·풀어읽기 주석 서고 (00_꿈바온_원어풀어읽기_성경주석66권_통합웹뷰어.html)
    if (typeof window.selectBook === 'function' && !window.__kkdPatchedSelectBook66) {
      var origSelectBook = window.selectBook;
      window.__kkdPatchedSelectBook66 = true;
      window.selectBook = function (bookNo, chNo) {
        var res = origSelectBook.apply(this, arguments);
        if (initialPageReadyForHooks) {
          setTimeout(function () {
            var ctx = getActiveContentContext();
            if (ctx) logContentViewDebounced('📖 원어주석 장 열람: ' + ctx);
          }, 80);
        }
        return res;
      };
    }
    if (typeof window.selectChapter === 'function' && !window.__kkdPatchedSelectChap66) {
      var origSelectChap = window.selectChapter;
      window.__kkdPatchedSelectChap66 = true;
      window.selectChapter = function (chNo) {
        var res = origSelectChap.apply(this, arguments);
        if (initialPageReadyForHooks) {
          setTimeout(function () {
            var ctx = getActiveContentContext();
            if (ctx) logContentViewDebounced('📖 원어주석 장 열람: ' + ctx);
          }, 80);
        }
        return res;
      };
    }

    // 7) 모세의 지팡이(설교 AI) 및 66권 원어 설교준비실 본문 열람·소환
    if (typeof window.summonKkumdidoCards === 'function' && !window.__kkdPatchedSummonCards) {
      var origSummon = window.summonKkumdidoCards;
      window.__kkdPatchedSummonCards = true;
      window.summonKkumdidoCards = function (query, showAlert) {
        var res = origSummon.apply(this, arguments);
        if (initialPageReadyForHooks) {
          var qStr = String(query || ((document.getElementById('mosesQueryInput') || {}).value) || '').trim();
          if (qStr) logContentViewDebounced('🪄 모세의 지팡이 본문 소환: [' + qStr + ']');
        }
        return res;
      };
    }
    if (typeof window.selectBookChapter === 'function' && !window.__kkdPatchedSelectBookChapStudio) {
      var origSelBC = window.selectBookChapter;
      window.__kkdPatchedSelectBookChapStudio = true;
      window.selectBookChapter = function (book, chapter) {
        var res = origSelBC.apply(this, arguments);
        if (initialPageReadyForHooks && book) {
          logContentViewDebounced('👑 설교준비실 본문 연구: [' + book + ' ' + (chapter || 1) + '장]');
        }
        return res;
      };
    }
  }

  function patchPageButtons() {
    installContentViewHooks();
    setTimeout(installContentViewHooks, 900);

    // index.html 의 enterMosesSanctuary 도 간편 로그인 확인 후 로컬/웹 지팡이 스튜디오로 연결
    if (typeof window.enterMosesSanctuary === 'function' && !window.__kkdPatchedMoses) {
      window.__kkdPatchedMoses = true;
      window.enterMosesSanctuary = function () {
        var goMoses = function () {
          recordTelemetryEvent('studio', '🪄 모세의 지팡이 스튜디오 입장 클릭');
          window.location.href = getRootPrefix() + 'kkumdido_jipangi_studio.html';
        };
        if (!isVerified()) {
          openCardModal(goMoses, '🪄 「모세의 지팡이 웹스튜디오」는 이 기기 도서관 이용증 발급 후 바로 열립니다.');
          return;
        }
        goMoses();
      };
    }

    if (typeof window.openPrintPdfModal === 'function' && !window.__kkdPatchedStudioPrint) {
      var origOpenPrintModal = window.openPrintPdfModal;
      window.__kkdPatchedStudioPrint = true;
      window.openPrintPdfModal = function () {
        var ctx = getActiveContentContext();
        var printLabel = getCurrentPageLabel() + (ctx ? ' · ' + ctx : '') + ' 강단 설교노트·유인물 인쇄창 열기';
        if (!isVerified()) {
          openCardModal(function () {
            recordTelemetryEvent('print', printLabel);
            origOpenPrintModal();
          }, '🖨️ 강단 설교 노트 인쇄 및 PDF 저장은 「이 기기 이용증」 발급 후 이용하실 수 있습니다.');
          return;
        }
        recordTelemetryEvent('print', printLabel);
        origOpenPrintModal();
      };
    }

    // 스튜디오 링크 및 PDF 직통 링크 클릭 시 간편 로그인 선행 체크 및 사용 기록 저장
    document.addEventListener('click', function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!a) return;
      var href = a.getAttribute('href') || '';
      if (href.toLowerCase().endsWith('.pdf')) {
        var pdfName = (a.textContent || href.split('/').pop() || 'PDF').trim().slice(0, 40);
        if (!isVerified()) {
          e.preventDefault();
          e.stopPropagation();
          var pdfUrl = a.href;
          openCardModal(function () {
            recordTelemetryEvent('pdf', '전자책 PDF 열람 (' + pdfName + ')');
            window.open(pdfUrl, '_blank', 'noopener');
          }, '📕 전자책(PDF) 원본 열람 및 인쇄는 「이 기기 도서관 이용증」 발급 후 이용하실 수 있습니다.');
        } else {
          recordTelemetryEvent('pdf', '전자책 PDF 열람 (' + pdfName + ')');
        }
        return;
      }
      if (a.hasAttribute('download') || href.indexOf('downloads/') !== -1) {
        var dlLabel = (a.textContent || href).replace(/\s+/g, ' ').trim().slice(0, 32);
        if (!isVerified()) {
          e.preventDefault();
          e.stopPropagation();
          var dlHref = a.href;
          var dlAttr = a.getAttribute('download') || '';
          openCardModal(function () {
            recordTelemetryEvent('studio', '단일파일 내려받기 (' + dlLabel + ')');
            var tempA = document.createElement('a');
            tempA.href = dlHref;
            tempA.setAttribute('download', dlAttr);
            document.body.appendChild(tempA);
            tempA.click();
            setTimeout(function () { document.body.removeChild(tempA); }, 200);
          }, '🔐 꿈디도 서재의 모든 프로그램과 내 컴퓨터 보관용 단일파일은 「이 기기 도서관 이용증」을 만드신 뒤 값없이 내려받으실 수 있습니다.');
        } else {
          recordTelemetryEvent('studio', '단일파일 내려받기 (' + dlLabel + ')');
        }
        return;
      }
      if (a.hasAttribute('data-kkd-studio-link') || isStudioHref(href)) {
        var studioLabel = (a.textContent || href).replace(/\s+/g, ' ').trim().slice(0, 32);
        if (!isVerified()) {
          e.preventDefault();
          e.stopPropagation();
          var targetHref = a.href;
          openCardModal(function () {
            recordTelemetryEvent('studio', '스튜디오 이동 (' + studioLabel + ')');
            window.location.href = targetHref;
          }, '🔐 꿈디도의 모든 방은 「이 기기 도서관 이용증」을 만드시면 값없이 바로 열립니다.');
        }
      }
    }, true);
  }

  // ── 8. 🕯️ 별관 「말씀 등불 (한 말씀 한 주)」 전 스튜디오 자동 연동 브릿지 ──
  function isStudioRoomForLamp() {
    var path = '';
    try { path = decodeURIComponent(window.location.pathname || '').toLowerCase(); } catch (e) { path = (window.location.pathname || '').toLowerCase(); }
    if (path.indexOf('kkumdido_annex') !== -1 || path.indexOf('kkumdido_church_support_annex') !== -1 || path.indexOf('annex_proposal') !== -1) {
      return false;
    }
    for (var i = 0; i < STUDIO_PATTERNS.length; i++) {
      if (path.indexOf(STUDIO_PATTERNS[i]) !== -1) return true;
    }
    if (path.indexOf('원어풀어읽기') !== -1 || path.indexOf('00_꿈바온') !== -1) return true;
    if (document.body && document.body.getAttribute('data-kkd-studio') === 'true') return true;
    return false;
  }

  function getAnnexWell() {
    var w = null;
    try {
      var raw = localStorage.getItem(ANNEX_WELL_KEY);
      if (raw) w = JSON.parse(raw);
    } catch (e) {}
    try {
      var params = new URLSearchParams(window.location.search || '');
      var urlRef = (params.get('kkd_ref') || '').trim();
      var urlGist = (params.get('kkd_gist') || '').trim();
      var urlSun = (params.get('kkd_sunday') || '').trim();
      if (urlRef) {
        if (!w || typeof w !== 'object') {
          w = { ref: urlRef, gist: urlGist || '', sunday: urlSun || '', savedAt: new Date().toISOString() };
        } else {
          w.ref = urlRef;
          if (urlGist) w.gist = urlGist;
          if (urlSun) w.sunday = urlSun;
        }
        try { localStorage.setItem(ANNEX_WELL_KEY, JSON.stringify(w)); } catch (e2) {}
      }
    } catch (e3) {}
    if (w && w.ref) return w;
    return null;
  }

  function setInputValIfEmptyOrForce(el, val, force) {
    if (!el || !val) return false;
    var cur = String(el.value || '').trim();
    if (force || !cur) {
      el.value = val;
      try {
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      } catch (e) {}
      return true;
    }
    return false;
  }

  function fillStudioFieldsFromWell(forceOverwrite) {
    var w = getAnnexWell();
    if (!w || !w.ref) return false;
    if (!isStudioRoomForLamp()) return false;

    var filledCount = 0;
    // 각 스튜디오별 본문(ref), 제목/한줄(gist), 주일날짜(sunday) 입력칸 매핑
    var refIds = [
      'sermonScriptureInput', // kkumdido_sermon_studio.html
      'inScripture',          // kkumdido_sermon_ai_studio.html
      'sermPassage',          // kkumdido_pastoral_secretary_studio.html
      'bulSermonPassage',     // kkumdido_pastoral_secretary_studio.html (주보 구버전)
      'jbSermonScripture',    // kkumdido_pastoral_secretary_studio.html (A4 주보)
      'editScriptureInput',   // kkumdido_gotgan_studio.html
      'inputBibleVerse',      // kkumdido_jipangi_studio.html
      'pubRef'                // kkumdido_sunday_school_studio.html
    ];
    var gistIds = [
      'sermonTitleInput',     // kkumdido_sermon_studio.html
      'inTitle',              // kkumdido_sermon_ai_studio.html
      'sermTheme',            // kkumdido_pastoral_secretary_studio.html
      'bulSermonTitle',       // kkumdido_pastoral_secretary_studio.html
      'jbSermonTitle',        // kkumdido_pastoral_secretary_studio.html (A4 주보)
      'editTitleInput',       // kkumdido_gotgan_studio.html
      'step3TitleLine1Input', // kkumdido_jipangi_studio.html
      'pubTitle'              // kkumdido_sunday_school_studio.html
    ];
    var dateIds = [
      'sermonDateInput',
      'inDate',
      'editDateInput',
      'pubDate',
      'bulDate',
      'jbDate'
    ];

    var hasUrlRef = false;
    try {
      hasUrlRef = !!(new URLSearchParams(window.location.search || '').get('kkd_ref'));
    } catch (e) {}
    var shouldForce = !!(forceOverwrite || hasUrlRef);

    for (var i = 0; i < refIds.length; i++) {
      var rEl = document.getElementById(refIds[i]);
      if (setInputValIfEmptyOrForce(rEl, w.ref, shouldForce)) filledCount++;
    }
    if (w.gist) {
      for (var j = 0; j < gistIds.length; j++) {
        var gEl = document.getElementById(gistIds[j]);
        if (setInputValIfEmptyOrForce(gEl, w.gist, shouldForce)) filledCount++;
      }
    }
    if (w.sunday) {
      for (var k = 0; k < dateIds.length; k++) {
        var dEl = document.getElementById(dateIds[k]);
        if (setInputValIfEmptyOrForce(dEl, w.sunday, shouldForce)) filledCount++;
      }
    }

    // 설교 AI 스튜디오 (모세의 지팡이 & 주간 사역 7종) 연동
    if (shouldForce && typeof window.summonKkumdidoCards === 'function' && typeof window.applyAllSummonedCardsToSermon === 'function') {
      var mqEl = document.getElementById('mosesQueryInput');
      if (mqEl) mqEl.value = w.ref;
      window.summonKkumdidoCards(w.ref, false);
      window.applyAllSummonedCardsToSermon(false);
      if (w.gist) {
        var inTitleEl = document.getElementById('inTitle');
        if (inTitleEl) inTitleEl.value = w.gist;
      }
      if (typeof window.generateAll7Materials === 'function') {
        window.generateAll7Materials(false);
      }
      filledCount++;
    }

    // 아론의 지팡이 (목회비서 6석) 연동
    if (shouldForce && typeof window.generateSermonOutline === 'function') {
      try { window.generateSermonOutline(); } catch (e) {}
      if (typeof window.renderJuboPreview === 'function') {
        try { window.renderJuboPreview(); } catch (e) {}
      }
      filledCount++;
    }

    // 설교 연구 스튜디오 (12대 아카이브 서랍) 연동
    if (shouldForce && typeof window.parseScriptureRef === 'function' && typeof window.selectBookChapter === 'function') {
      try {
        var parsedRef = window.parseScriptureRef(w.ref);
        if (parsedRef && parsedRef.book && parsedRef.chapter) {
          window.selectBookChapter(parsedRef.book, parsedRef.chapter);
          filledCount++;
        }
      } catch (e) {}
    }

    // 번역 스튜디오인 경우
    var transIn = document.getElementById('writeInput');
    if (transIn && (forceOverwrite || (!transIn.value.trim() && hasUrlRef))) {
      var line = w.ref + (w.gist ? ' — ' + w.gist : '');
      setInputValIfEmptyOrForce(transIn, line, true);
      filledCount++;
    }

    return filledCount > 0;
  }

  function renderStudioWellCarryBanner() {
    var w = getAnnexWell();
    if (!w || !w.ref) return;
    if (!isStudioRoomForLamp()) return;
    if (document.getElementById('kkd-well-carry-bar')) return;

    var bar = document.createElement('div');
    bar.id = 'kkd-well-carry-bar';
    bar.style.cssText = [
      'background:linear-gradient(90deg, #1E3A5F 0%, #14294A 100%);',
      'color:#F3EFE4;',
      'border-bottom:1.5px solid rgba(197,155,56,0.65);',
      'padding:8px 20px;',
      'font-family:"Pretendard","Noto Sans KR",sans-serif;',
      'font-size:14.5px;',
      'display:flex;',
      'align-items:center;',
      'justify-content:space-between;',
      'gap:10px;',
      'flex-wrap:wrap;',
      'z-index:880;',
      'position:relative;'
    ].join('');
    var pfx = getRootPrefix();
    bar.innerHTML = [
      '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">',
      '  <span style="background:rgba(197,155,56,0.22);border:1px solid rgba(197,155,56,0.65);color:#F7E29E;padding:3px 10px;border-radius:999px;font-weight:800;font-size:12.5px;">🕯️ 이번 주의 말씀 등불</span>',
      '  <span>별관에서 밝혀 둔 본문 <b style="color:#FFD97D;font-family:serif;font-size:15.5px;">' + escapeHtml(w.ref) + '</b>' + (w.gist ? ' <span style="opacity:0.92;">(' + escapeHtml(w.gist) + ')</span>' : '') + '을 들고 열었습니다.</span>',
      '</div>',
      '<div style="display:flex;align-items:center;gap:6px;">',
      '  <button type="button" id="kkd-well-fill-btn" style="background:#C59B38;color:#161209;border:0;border-radius:6px;padding:5px 11px;font-size:12.5px;font-weight:800;cursor:pointer;">본문 칸에 채우기</button>',
      '  <a href="' + pfx + 'kkumdido_annex.html#well" style="color:#F3EFE4;text-decoration:none;border:1px solid rgba(243,239,228,0.45);border-radius:6px;padding:4px 10px;font-size:12.5px;font-weight:700;">별관 말씀 등불로 ↗</a>',
      '</div>'
    ].join('');

    if (document.body.firstChild) {
      document.body.insertBefore(bar, document.body.firstChild);
    } else {
      document.body.appendChild(bar);
    }

    var fillBtn = document.getElementById('kkd-well-fill-btn');
    if (fillBtn) {
      fillBtn.addEventListener('click', function () {
        var ok = fillStudioFieldsFromWell(true);
        if (ok) {
          showToast('🕯️ 이번 주 말씀 등불 「' + w.ref + '」을 이 방의 입력칸에 채웠습니다.');
        } else {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(w.ref + (w.gist ? ' ' + w.gist : ''));
          }
          showToast('📋 이번 주 말씀 「' + w.ref + '」이 클립보드에 복사되었습니다. 원하는 칸에 붙여넣으실 수 있습니다.');
        }
      });
    }
  }

  function applyAnnexWellToStudio() {
    var didFill = fillStudioFieldsFromWell(false);
    renderStudioWellCarryBanner();
    if (didFill) {
      var w = getAnnexWell();
      if (w && w.ref) {
        setTimeout(function () {
          showToast('🕯️ 별관 말씀 등불에서 밝혀 둔 「' + w.ref + '」 본문을 입력칸에 담았습니다.');
        }, 450);
      }
    }
  }

  // ── 9. 스튜디오 비로그인 조작 원천 차단 가드 (캡처 단계 + 잠금 워치독) ──
  function isInsideAuthModal(target) {
    if (!target || !target.closest) return false;
    return !!(
      target.closest('#kkumdido-card-modal-bg') ||
      target.closest('#kkumdido-admin-modal-bg') ||
      target.closest('#kkumdido-pass-fab')
    );
  }

  ['click', 'mousedown', 'touchstart', 'submit'].forEach(function (evtName) {
    document.addEventListener(evtName, function (e) {
      if (isStudioPage() && !isVerified()) {
        if (!isInsideAuthModal(e.target)) {
          e.preventDefault();
          e.stopPropagation();
          enforceStudioGateIfNeeded();
          return false;
        }
      }
    }, true);
  });

  setInterval(function () {
    if (!document.body) return;
    if (isStudioPage() && !isVerified()) {
      if (!document.body.classList.contains('kkumdido-studio-locked')) {
        document.body.classList.add('kkumdido-studio-locked');
      }
      var modalBg = document.getElementById('kkumdido-card-modal-bg');
      var admBg = document.getElementById('kkumdido-admin-modal-bg');
      if (modalBg && !modalBg.classList.contains('on') && (!admBg || !admBg.classList.contains('on'))) {
        enforceStudioGateIfNeeded();
      }
    }
  }, 800);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      buildDOM();
      setTimeout(applyAnnexWellToStudio, 220);
    });
  } else {
    buildDOM();
    setTimeout(applyAnnexWellToStudio, 220);
  }

  window.kkumdidoPass = Object.freeze({
    open: openCardModal,
    openAdmin: requestOpenAdminModal,
    isVerified: isVerified,
    requireLogin: requireStudioLogin,
    getCard: getCard,
    logout: clearCard,
    getWell: getAnnexWell,
    applyWellToPage: function () { return fillStudioFieldsFromWell(true); },
    logAction: function (detailText, type) {
      recordTelemetryEvent(type || 'studio', detailText);
    }
  });
})();
