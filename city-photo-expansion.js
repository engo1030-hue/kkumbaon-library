(function () {
  const atlas = window.DREAMBAON_ATLAS;
  if (!atlas || !atlas.images) return;

  const licenseUrls = {
    "CC BY-SA 4.0": "https://creativecommons.org/licenses/by-sa/4.0/",
    "CC BY-SA 3.0": "https://creativecommons.org/licenses/by-sa/3.0/",
    "CC BY-SA 2.5": "https://creativecommons.org/licenses/by-sa/2.5/",
    "CC BY-SA 2.0": "https://creativecommons.org/licenses/by-sa/2.0/",
    "CC BY 4.0": "https://creativecommons.org/licenses/by/4.0/",
    "CC BY 3.0": "https://creativecommons.org/licenses/by/3.0/",
    "CC BY 2.5": "https://creativecommons.org/licenses/by/2.5/",
    "CC BY 2.0": "https://creativecommons.org/licenses/by/2.0/",
    "CC0": "https://creativecommons.org/publicdomain/zero/1.0/"
  };

  const media = (src, caption, credit, license, sourceUrl, kind = "오늘의 풍경") => ({
    src,
    caption,
    kind,
    credit,
    license,
    licenseUrl: licenseUrls[license] || "",
    sourceUrl
  });

  const additions = {
    bethlehem: [
      media("assets/atrium/photos/bethlehem-city-panorama-2024.webp", "베들레헴 도심과 언덕 위 교회들 · 2024년 오늘의 도시 전경", "Tamerhm", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:%D8%A8%D9%8A%D8%AA_%D9%84%D8%AD%D9%85_%D9%88%D8%A7%D8%AF_%D9%85%D8%B9%D8%A7%D9%84%D9%8A.jpg"),
      media("assets/atrium/photos/bethlehem-manger-square-2016.webp", "구유광장과 오마르 모스크 · 베들레헴 중심부의 오늘", "Konrad Summers", "CC BY-SA 2.0", "https://commons.wikimedia.org/wiki/File:Manger_Square,_Bethlehem_(25894141005).jpg"),
      media("assets/atrium/photos/bethlehem-old-street-2018.webp", "베들레헴 구시가지의 돌계단과 골목 · 오늘의 생활 풍경", "Aya A. Ismail", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Bethlehem_city.jpg")
    ],
    engedi: [
      media("assets/atrium/photos/engedi-oasis.webp", "엔게디 오아시스와 유대 광야 절벽 · 오늘의 풍경", "Ludvig14", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Ein-Gedi_D08v2.jpg"),
      media("assets/atrium/photos/engedi-david-waterfall.webp", "엔게디 나할 다윗의 폭포 · 오늘의 풍경", "The Turtle Ninja", "CC BY-SA 3.0", "https://commons.wikimedia.org/wiki/File:Waterfall_at_Ein_Gedi-1.jpg"),
      media("assets/atrium/photos/engedi-synagogue.webp", "엔게디 고대 회당 유적 · 오늘의 유적 풍경", "Bukvoed", "CC BY 4.0", "https://commons.wikimedia.org/wiki/File:Ein-Gedi-synagogue-732.jpg"),
      media("assets/atrium/photos/engedi-dead-sea.webp", "엔게디 동쪽으로 이어지는 사해 풍경 · 오늘의 지역 풍경", "רחלי רז", "CC BY 2.5", "https://commons.wikimedia.org/wiki/File:PikiWiki_Israel_14814_Dead_Sea.JPG")
    ],
    antioch: [
      media("assets/atrium/photos/antioch-panorama.webp", "수리아 안디옥의 오늘, 안타키아 전경 · 오늘의 풍경", "Volkan Hatem", "CC BY-SA 2.5", "https://commons.wikimedia.org/wiki/File:Antioch_Panorama_Saint_Pierre_Church.jpg"),
      media("assets/atrium/photos/antioch-st-peter.webp", "안타키아 성 베드로 동굴교회 외관 · 오늘의 유적 풍경", "Dosseman", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Antakya_Church_of_St._Peter_exterior_%C4%B1n_2025_05.jpg"),
      media("assets/atrium/photos/antioch-orontes.webp", "안타키아를 흐르는 오론테스강 · 오늘의 풍경", "Alen Ištoković", "CC BY 3.0", "https://commons.wikimedia.org/wiki/File:Orontes_river_in_Antakya_-_panoramio.jpg"),
      media("assets/atrium/photos/antioch-temple-podium.webp", "고대 안디옥의 로마 시대 신전 기단 유적 · 오늘의 유적 풍경", "Carole Raddato", "CC BY-SA 2.0", "https://commons.wikimedia.org/wiki/File:The_remains_of_the_massive_Temple%27s_podium,_probably_dating_to_the_end_of_the_2nd_century_AD,_Antioch_on_the_Orontes,_Antakya,_Turkey_(36242427836).jpg")
    ],
    thessalonica: [
      media("assets/atrium/photos/thessalonica-panorama.webp", "데살로니가의 오늘, 테살로니키 해안 도시 전경 · 오늘의 풍경", "Aroche", "CC BY-SA 3.0", "https://commons.wikimedia.org/wiki/File:Thessaloniki_panorama.jpg"),
      media("assets/atrium/photos/thessalonica-roman-forum.webp", "테살로니키 로마 광장 유적 · 오늘의 유적 풍경", "Magda Mortisia", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:%CE%A1%CF%89%CE%BC%CE%B1%CF%8A%CE%BA%CE%AE_%CE%91%CE%B3%CE%BF%CF%81%CE%AC_%CF%84%CE%B7%CF%82_%CE%98%CE%B5%CF%83%CF%83%CE%B1%CE%BB%CE%BF%CE%BD%CE%AF%CE%BA%CE%B7%CF%82,_Roman_Forum_ThessalonikI,_Greece.jpg"),
      media("assets/atrium/photos/thessalonica-rotunda.webp", "테살로니키 로툰다와 현대 거리 · 오늘의 풍경", "Annatsach", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Saint_George_Rotunda_(Thessaloniki)_-_3.jpg"),
      media("assets/atrium/photos/thessalonica-walls.webp", "테살로니키 옛 성벽 · 오늘의 유적 풍경", "Julian Nyča", "CC BY-SA 3.0", "https://commons.wikimedia.org/wiki/File:Saloniki_City_Walls_2.jpg")
    ],
    goshen: [
      media("assets/atrium/photos/goshen-zagazig.webp", "고센 후보 권역인 동부 나일 삼각주의 자가지그 · 오늘의 지역 풍경", "Miklog", "Public domain", "https://commons.wikimedia.org/wiki/File:Egypt_Zagazig_Aug-2007.jpg"),
      media("assets/atrium/photos/goshen-faqous.webp", "동부 나일 삼각주 파쿠스 일대의 마을 풍경 · 고센 후보 권역 참고", "FOUAD ELYAAGOUBY", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:%D9%82%D8%B1%D9%8A%D8%A9_%D9%81%D9%82%D9%88%D8%B3.jpg"),
      media("assets/atrium/photos/goshen-delta-satellite.webp", "나일강 삼각주의 현대 위성 풍경 · 고센의 대략적 지역 이해", "NASA MODIS", "Public domain", "https://commons.wikimedia.org/wiki/File:Nile_River_Delta_(MODIS_2020-06-19).jpg"),
      media("assets/atrium/photos/goshen-egyptian-fields.webp", "오늘날 이집트 농촌의 밀밭 · 고센의 농경 환경을 이해하는 지역 참고", "Zahra2123", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:%D8%A7%D9%84%D8%B1%D9%8A%D9%81_%D8%A7%D9%84%D9%85%D8%B5%D8%B1%D9%8A%D8%8C_%D8%AD%D9%82%D9%88%D9%84_%D8%A7%D9%84%D9%82%D9%85%D8%AD.jpg")
    ],
    rameses: [
      media("assets/atrium/photos/rameses-qantir-statue.webp", "칸티르에서 확인되는 파라오 거상 조각 · 라암셋 후보지의 오늘", "Iri-en-achti", "Public domain", "https://commons.wikimedia.org/wiki/File:Kolossalstatue_Qantir.JPG"),
      media("assets/atrium/photos/rameses-site-plan.webp", "아바리스와 피라메세스 후보 권역의 유적 분포도 · 역사 지리 자료", "Hervé Tronchère 외", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Plan_Avaris_Pi_Ramses.png", "역사 지리 자료"),
      media("assets/atrium/photos/rameses-qantir-tile.webp", "칸티르 출토 채색 타일 · 라암셋 후보지 관련 유물", "Google Art Project", "Public domain", "https://commons.wikimedia.org/wiki/File:Tile_with_Winged_Crowned_Female_Sphinx_-_Google_Art_Project.jpg", "유적·유물"),
      media("assets/atrium/photos/rameses-delta-space.webp", "나일 삼각주와 동부 지중해의 현대 위성 풍경 · 라암셋 후보 권역 참고", "NASA", "Public domain", "https://commons.wikimedia.org/wiki/File:ISS-30_Mediterranean_Sea,_Nile_River_Delta_and_Levante.jpg")
    ],
    sinai: [
      media("assets/atrium/photos/sinai-panorama.webp", "제벨 무사 정상부에서 본 시내 산악 지대 · 전통적 후보지", "Florian Prischl", "CC BY-SA 3.0", "https://commons.wikimedia.org/wiki/File:Panorama_Mount_Sinai_south.jpg"),
      media("assets/atrium/photos/sinai-sunrise.webp", "제벨 무사에서 맞는 일출 · 전통적 시내산 후보지의 오늘", "Grand Parc", "CC BY 2.0", "https://commons.wikimedia.org/wiki/File:Lever_de_soleil_Mont_Sina%C3%AF_Egypte_-_Sunrise_Mount_Sinai_Egypt_-_Photo_image_picture_(12859772904).jpg"),
      media("assets/atrium/photos/sinai-monastery-panorama.webp", "성 카타리나 수도원과 산악 지형 · 전통적 시내산 후보 권역", "Egghead06", "CC0", "https://commons.wikimedia.org/wiki/File:St_CatherinesPanorama.JPG"),
      media("assets/atrium/photos/sinai-monastery-mountains.webp", "시내 산악 지대에 자리한 성 카타리나 수도원 · 오늘의 지역 풍경", "Berthold Werner", "CC BY-SA 3.0", "https://commons.wikimedia.org/wiki/File:Katharinenkloster_Sinai_BW_4.jpg")
    ],
    susa: [
      media("assets/atrium/photos/susa-apadana.webp", "수산 아파다나 궁전 유적 · 오늘의 풍경", "Sadeq rashidi fard", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Apadana_palace_-_Susa_-_Iran.jpg"),
      media("assets/atrium/photos/susa-darius-foundations.webp", "수산 다리오 왕궁의 기초 유적 · 오늘의 풍경", "Carole Raddato", "CC BY-SA 2.0", "https://commons.wikimedia.org/wiki/File:The_foundations_of_the_Palace_of_Darius_the_Great,_Susa,_capital_of_Elam_and_of_the_Achaemenid_Empire,_Iran_(33862549598).jpg"),
      media("assets/atrium/photos/susa-hypostyle.webp", "수산 왕궁의 기둥홀 아파다나 유적 · 오늘의 풍경", "Carole Raddato", "CC BY-SA 2.0", "https://commons.wikimedia.org/wiki/File:The_Apadana,_a_large_hypostyle_room_of_36_columns_in_the_Palace_of_Darius,_Susa,_capital_of_Elam_and_of_the_Achaemenid_Empire,_Iran_(33862548298).jpg"),
      media("assets/atrium/photos/susa-shush-castle.webp", "수산 유적 언덕 위의 슈슈 성 · 오늘의 풍경", "فلورانس", "CC BY-SA 3.0", "https://commons.wikimedia.org/wiki/File:Shush_Castle.JPG")
    ]
  };

  Object.entries(additions).forEach(([placeId, items]) => {
    if (!Array.isArray(atlas.images[placeId])) atlas.images[placeId] = [];
    const known = new Set(atlas.images[placeId].map((item) => item.src));
    items.forEach((item) => {
      if (!known.has(item.src)) atlas.images[placeId].push(item);
    });
  });
})();
