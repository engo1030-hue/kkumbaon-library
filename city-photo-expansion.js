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
    "CC0": "https://creativecommons.org/publicdomain/zero/1.0/",
    "Public domain": "https://creativecommons.org/publicdomain/mark/1.0/"
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
    ],
    jerusalem: [
      media("assets/atrium/photos/jerusalem-panorama.webp", "예루살렘 구시가지와 주변 언덕 · 오늘의 도시 전경", "Ian Scott", "CC BY-SA 2.0", "https://commons.wikimedia.org/wiki/File:Old_Jerusalem_panorama_c_(6403881477).jpg"),
      media("assets/atrium/photos/jerusalem-mount-olives.webp", "감람산에서 바라본 예루살렘 · 오늘의 풍경", "Beko", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Jerusalem_panorama_from_Mount_of_Olives_07112018.jpg"),
      media("assets/atrium/photos/jerusalem-western-wall.webp", "서쪽 성벽과 성전산 일대 · 오늘의 풍경", "Gary Bembridge", "CC BY 2.0", "https://commons.wikimedia.org/wiki/File:Western_Wall_and_Dome_of_the_Rock_Jerusalem_-10_(33400391921).jpg")
    ],
    jericho: [
      media("assets/atrium/photos/jericho-tell-sultan.webp", "텔 에스술탄의 고대 여리고 유적 · 오늘의 풍경", "Diego Delso", "CC BY-SA 3.0", "https://commons.wikimedia.org/wiki/File:Tell_es-Sultan,_Jericho,_Palestine2.jpg"),
      media("assets/atrium/photos/jericho-tell-excavation.webp", "텔 에스술탄 발굴지와 요단 계곡 지형 · 오늘의 유적 풍경", "Deror avi", "CC BY-SA 3.0", "https://commons.wikimedia.org/wiki/File:Jericho_Tell_es_Sultan_P1190731.JPG"),
      media("assets/atrium/photos/jericho-hisham-palace.webp", "여리고 히샴 궁전 유적 · 성경 시대 이후의 지역 역사", "Bukvoed", "CC BY 4.0", "https://commons.wikimedia.org/wiki/File:Jericho-Hishams-Palace-Museum-208.jpg", "후대 역사 유적")
    ],
    nazareth: [
      media("assets/atrium/photos/nazareth-panorama.webp", "나사렛 도심과 갈릴리 언덕 · 오늘의 도시 전경", "Ronen Marcus", "CC BY 2.5", "https://commons.wikimedia.org/wiki/File:PikiWiki_Israel_51454_panorama_of_the_city_of_nazareth.jpg"),
      media("assets/atrium/photos/nazareth-old-city-street.webp", "나사렛 구시가지의 돌길과 골목 · 오늘의 생활 풍경", "Juandev", "CC BY-SA 3.0", "https://commons.wikimedia.org/wiki/File:Nazareth,_Old_City,_street.JPG"),
      media("assets/atrium/photos/nazareth-annunciation-basilica.webp", "나사렛 수태고지 대성당 외관 · 오늘의 풍경", "Larry Koester", "CC BY 2.0", "https://commons.wikimedia.org/wiki/File:Basilica_of_Annunciation_-_exterior_(5)_(37125827056).jpg")
    ],
    galilee: [
      media("assets/atrium/photos/galilee-panorama.webp", "갈릴리 호수와 주변 산지 · 오늘의 전경", "Zachi Evenor and MathKnight", "CC BY 2.0", "https://commons.wikimedia.org/wiki/File:Kinnereth-Panorama-01s.jpg"),
      media("assets/atrium/photos/galilee-shoreline.webp", "갈릴리 호숫가의 물가 지형 · 오늘의 풍경", "Adam Jones", "CC BY-SA 2.0", "https://commons.wikimedia.org/wiki/File:Shore_of_Lake_Kinnaret_(Sea_of_Galilee)_-_Israel_-_01_(5710144441).jpg"),
      media("assets/atrium/photos/galilee-net-fishing.webp", "갈릴리 호수의 현대 그물잡이 · 오늘의 생활 풍경", "James Emery", "CC BY 2.0", "https://commons.wikimedia.org/wiki/File:Net_fishing_on_Sea_of_Galilee_0865_(507838951).jpg")
    ],
    capernaum: [
      media("assets/atrium/photos/capernaum-synagogue.webp", "가버나움 후대 회당 유적 · 오늘의 풍경", "David Shankbone", "CC BY-SA 3.0", "https://commons.wikimedia.org/wiki/File:Capernaum_synagogue_by_David_Shankbone.jpg"),
      media("assets/atrium/photos/capernaum-peters-house.webp", "가버나움 베드로의 집 전승지 발굴 유적 · 오늘의 풍경", "Fallaner", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Holy_Land_2016_P0456_Capernaum_ruins_of_Saint_Peters_House_under_Saint_Peter_Church.jpg"),
      media("assets/atrium/photos/capernaum-north-shore.webp", "갈릴리 호수 북안, 가버나움 일대의 지형 · 오늘의 풍경", "Ian Scott", "CC BY-SA 2.0", "https://commons.wikimedia.org/wiki/File:Panorama_on_the_north_Shore_of_the_Sea_of_Galilee_(5796531006).jpg")
    ],
    caesarea: [
      media("assets/atrium/photos/caesarea-aqueduct.webp", "가이사랴 마리티마의 로마 수도교 · 오늘의 유적 풍경", "Lior Golgher", "CC BY-SA 3.0", "https://commons.wikimedia.org/wiki/File:Ancient_Roman_aqueduct_in_Caesarea_Maritima_DSC05186.JPG"),
      media("assets/atrium/photos/caesarea-theatre.webp", "가이사랴의 로마 극장 · 오늘의 유적 풍경", "Zairon", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Caesarea_maritima_R%C3%B6misches_Theater_1.JPG"),
      media("assets/atrium/photos/caesarea-harbor-aerial.webp", "가이사랴 항구와 수중에 남은 고대 방파제 · 오늘의 항공 풍경", "Ron Gafni - SkyPics", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Cesarea_harbor_from_above_%D7%A0%D7%9E%D7%9C_%D7%A7%D7%99%D7%A1%D7%A8%D7%99%D7%94_%D7%91%D7%9E%D7%91%D7%98_%D7%A2%D7%9C.jpg")
    ],
    ephesus: [
      media("assets/atrium/photos/ephesus-great-theatre.webp", "에베소 대극장 유적 · 오늘의 풍경", "Blcksprt", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Ephesus_theatre_1.jpg"),
      media("assets/atrium/photos/ephesus-curetes-street.webp", "에베소 쿠레테스 거리와 고대 도시 유적 · 오늘의 풍경", "José Luiz", "CC BY-SA 3.0", "https://commons.wikimedia.org/wiki/File:9.7_Curetes_Street_in_Ephesus.JPG"),
      media("assets/atrium/photos/ephesus-hadrian-temple.webp", "에베소 하드리아누스 신전 정면 · 오늘의 유적 풍경", "Dosseman", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Ephesus_Temple_of_Hadrian_Front_1.jpg")
    ],
    corinth: [
      media("assets/atrium/photos/corinth-panorama.webp", "고대 고린도 도심 유적 전경 · 오늘의 풍경", "Joyofmuseums", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Archaeological_Site_of_Ancient_Corinth_by_Joy_of_Museums.jpg"),
      media("assets/atrium/photos/corinth-apollo-acrocorinth.webp", "아폴론 신전과 아크로고린도 · 오늘의 유적 풍경", "burdykin", "CC BY 3.0", "https://commons.wikimedia.org/wiki/File:%D0%94%D1%80%D0%B5%D0%B2%D0%BD%D0%B8%D0%B9_%D0%9A%D0%BE%D1%80%D0%B8%D0%BD%D1%84,_%D1%85%D1%80%D0%B0%D0%BC_%D0%90%D0%BF%D0%BE%D0%BB%D0%BB%D0%BE%D0%BD%D0%B0,_%D0%B2%D0%B8%D0%B4_%D0%BD%D0%B0_%D0%90%D0%BA%D1%80%D0%BE%D0%BF%D0%BE%D0%BB%D1%8C._Ancient_Corinth,_temple_of_Apollon_-_panoramio.jpg"),
      media("assets/atrium/photos/corinth-acrocorinth-view.webp", "아크로고린도에서 내려다본 고린도 지협과 평야 · 오늘의 지형", "HerrAdams", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Akrokorinth,_Blick_nach_N_2015-09_(1).jpg")
    ],
    philippi: [
      media("assets/atrium/photos/philippi-forum-basilica.webp", "빌립보 포룸과 바실리카 B, 팡가이온 산지 · 오늘의 풍경", "Carole Raddato", "CC BY-SA 2.0", "https://commons.wikimedia.org/wiki/File:View_on_the_forum_and_the_basilica_B_with_Pangaion_Hills_in_the_background,_Philippi_(7272348092).jpg"),
      media("assets/atrium/photos/philippi-theatre-panorama.webp", "빌립보 고대 극장 전경 · 오늘의 유적 풍경", "Tomisti", "CC BY-SA 3.0", "https://commons.wikimedia.org/wiki/File:Philippi_theatre_panorama.jpg"),
      media("assets/atrium/photos/philippi-via-egnatia.webp", "빌립보를 지나는 에그나티아 도로의 포장 흔적 · 오늘의 풍경", "Carole Raddato", "CC BY-SA 2.0", "https://commons.wikimedia.org/wiki/File:Via_Egnatia,_Philippi_(7272446610).jpg")
    ],
    athens: [
      media("assets/atrium/photos/athens-ancient-agora.webp", "아덴 고대 아고라와 아크로폴리스 · 오늘의 풍경", "Mirjanamimi", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Ancient_Agora_in_Athens.jpg"),
      media("assets/atrium/photos/athens-areopagus-site.webp", "아레오바고 언덕 유적지 · 오늘의 풍경", "George E. Koronaios", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:The_archaeological_site_of_Areopagus_on_May_6,_2020.jpg"),
      media("assets/atrium/photos/athens-agora-areopagus-view.webp", "아크로폴리스에서 본 아레오바고와 고대 아고라 · 오늘의 지형", "George E. Koronaios", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:The_Hill_of_the_Nymphs,_the_Areopagus_and_the_Ancient_Agora_from_the_Acropolis_on_July_16,_2019.jpg")
    ],
    rome: [
      media("assets/atrium/photos/rome-roman-forum.webp", "팔라티노 언덕에서 본 로마 포룸 · 오늘의 유적 풍경", "Matt Brisher", "CC BY 2.0", "https://commons.wikimedia.org/wiki/File:Panorama_of_the_Roman_Forum_(Forum_Romanum)_from_Palantine_Hill_-_Rome,_Italy.jpg"),
      media("assets/atrium/photos/rome-colosseum-panorama.webp", "콜로세움 외관 · 바울 시대 이후에 세워진 로마 유산", "Nicholas Hartmann", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Rome_Colosseum_exterior_panorama.jpg", "후대 로마 유적"),
      media("assets/atrium/photos/rome-appian-way.webp", "로마로 이어지는 압비아 가도의 고대 포장길 · 오늘의 풍경", "Livioandronico2013", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Appian_Way.jpg")
    ],
    damascus: [
      media("assets/atrium/photos/damascus-straight-street.webp", "다메섹 직가와 동문 일대 · 오늘의 도시 풍경", "Dosseman", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Damascus_Straight_Street_and_East_Gate_8193.jpg"),
      media("assets/atrium/photos/damascus-bab-sharqi-street.webp", "바브 샤르키 인근 옛 다메섹 거리 · 오늘의 생활 풍경", "Bernard Gagnon", "CC BY-SA 3.0", "https://commons.wikimedia.org/wiki/File:Bab_Sharqi_Street,_Damascus.jpg"),
      media("assets/atrium/photos/damascus-umayyad-mosque.webp", "다메섹 우마이야 모스크 · 성경 시대 이후의 도시 역사", "Vyacheslav Argenberg", "CC BY 4.0", "https://commons.wikimedia.org/wiki/File:Damascus,_Syria,_The_Umayyad_Mosque,_The_Great_Mosque_of_Damascus.jpg", "후대 도시 유산")
    ],
    samaria: [
      media("assets/atrium/photos/samaria-sebastia-site.webp", "사마리아 세바스티아 고대 성읍 유적 · 오늘의 풍경", "Bukvoed", "CC BY 3.0", "https://commons.wikimedia.org/wiki/File:Sebastia-385.jpg"),
      media("assets/atrium/photos/samaria-sebastia-ruins.webp", "세바스티아 유적 언덕과 남아 있는 석조 구조 · 오늘의 풍경", "Bukvoed", "CC BY 3.0", "https://commons.wikimedia.org/wiki/File:Sebastia-384.jpg"),
      media("assets/atrium/photos/samaria-omri-palace-aerial.webp", "오므리 왕궁 터로 알려진 사마리아 성채 유적 · 오늘의 항공 풍경", "Yong Woo Park", "CC BY 4.0", "https://commons.wikimedia.org/wiki/File:Drone_Aerial_View_of_the_Acropolis_and_Palace_Site_of_King_Omri_in_Samaria_Sebastia.jpg")
    ],
    tarsus: [
      media("assets/atrium/photos/tarsus-roman-road.webp", "다소의 로마 시대 도로 유적 · 오늘의 풍경", "Nedim Ardoğa", "CC BY-SA 3.0", "https://commons.wikimedia.org/wiki/File:Roman_road_in_Tarsus,_Mersin_Province.jpg"),
      media("assets/atrium/photos/tarsus-pauls-well.webp", "다소의 성 바울 우물 전승지 · 오늘의 풍경", "Yaman1990", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Aziz_Pavlus_Su_Kuyusu_Mersin_02.jpg", "전승지"),
      media("assets/atrium/photos/tarsus-cleopatra-gate.webp", "다소 클레오파트라 문 · 성경 시대 이후에 다시 세워진 도시 유산", "Carole Raddato", "CC BY-SA 2.0", "https://commons.wikimedia.org/wiki/File:Cleopatra%27s_Gate,_a_city_gate_named_after_the_Egyptian_queen_Cleopatra_VII,_it_was_built_either_in_the_Byzantine_or_Abassid_period_on_the_site_of_an_earlier_one,_Tarsus_(23679870588).jpg", "후대 도시 유산")
    ],
    troas: [
      media("assets/atrium/photos/troas-panorama.webp", "알렉산드리아 드로아 유적과 에게해 방향의 넓은 전경 · 오늘의 풍경", "Horacio36", "CC BY-SA 3.0", "https://commons.wikimedia.org/wiki/File:Panorama_alexandriatroas.jpg"),
      media("assets/atrium/photos/troas-roman-harbour.webp", "아우구스투스 시대에 조성된 드로아 로마 항구의 흔적 · 오늘의 풍경", "Carole Raddato", "CC BY-SA 2.0", "https://commons.wikimedia.org/wiki/File:The_Roman_Harbour_of_Alexandria_Troas,_built_in_the_reign_of_Augustus_and_consisting_of_an_outer_basin_protected_by_two_breakwaters_and_an_inner_basin,_Troad,_Turkey_-_52985552010.jpg"),
      media("assets/atrium/photos/troas-ancient-road.webp", "알렉산드리아 드로아 유적지의 고대 도로 · 오늘의 풍경", "Raicem", "CC BY 4.0", "https://commons.wikimedia.org/wiki/File:A_Road_in_Alexandria_Troas.jpg")
    ],
    miletus: [
      media("assets/atrium/photos/miletus-downtown.webp", "밀레도 고대 도심 유적의 넓은 전경 · 오늘의 풍경", "Ken and Nyetta", "CC BY 2.0", "https://commons.wikimedia.org/wiki/File:Remains_of_downtown_ancient_Miletus.jpg"),
      media("assets/atrium/photos/miletus-faustina-baths.webp", "밀레도 파우스티나 목욕장 입구 유적 · 오늘의 풍경", "Ken and Nyetta", "CC BY 2.0", "https://commons.wikimedia.org/wiki/File:Entrance_to_Baths_of_Faustina.jpg"),
      media("assets/atrium/photos/miletus-church.webp", "밀레도 고대 교회 유적 · 오늘의 풍경", "Dosseman", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Miletus_Church_in_2007_4587.jpg", "후대 교회 유적")
    ],
    pergamum: [
      media("assets/atrium/photos/pergamum-theatre.webp", "가파른 산비탈을 따라 세워진 버가모 극장 · 오늘의 풍경", "Carlos Delgado", "CC BY-SA 3.0", "https://commons.wikimedia.org/wiki/File:Teatro_de_P%C3%A9rgamo_-_Pergamon_Theatre_-_02.jpg"),
      media("assets/atrium/photos/pergamum-trajan-temple.webp", "버가모 상부 아크로폴리스의 트라야누스 신전 유적 · 오늘의 풍경", "Carole Raddato", "CC BY-SA 2.0", "https://commons.wikimedia.org/wiki/File:The_Temple_of_Trajan_(Trajaneum),_Upper_Acropolis,_Pergamon,_Turkey_(12190441356).jpg"),
      media("assets/atrium/photos/pergamum-asklepion.webp", "버가모 아스클레피온 치유 성소 유적 · 오늘의 풍경", "Özge Kesgin", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Bergama_Asklepion.jpg")
    ],
    smyrna: [
      media("assets/atrium/photos/smyrna-agora.webp", "오늘날 이즈미르 도심에 남은 서머나 아고라 · 오늘의 풍경", "Carole Raddato", "CC BY-SA 2.0", "https://commons.wikimedia.org/wiki/File:Agora_of_Smyrna,_built_during_the_Hellenistic_era_at_the_base_of_Pagos_Hill_and_totally_rebuilt_under_Marcus_Aurelius_after_the_destructive_178_AD_earthquake,_Izmir,_Turkey_(18511982670).jpg"),
      media("assets/atrium/photos/smyrna-agora-basement.webp", "서머나 아고라 지하 회랑의 석조 아치 · 오늘의 유적 풍경", "Georges Jansoone JoJan", "Public domain", "https://commons.wikimedia.org/wiki/File:Izmir024.jpg"),
      media("assets/atrium/photos/smyrna-kadifekale-view.webp", "카디페칼레 언덕에서 바라본 오늘날 이즈미르 · 서머나의 현대 지형", "Haluxjason", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Izmir_2012.jpg")
    ],
    sardis: [
      media("assets/atrium/photos/sardis-synagogue.webp", "3세기 후반에 조성된 사데 회당 유적 · 성경 시대 이후의 신앙 유산", "Carole Raddato", "CC BY-SA 2.0", "https://commons.wikimedia.org/wiki/File:Sardis_Synagogue,_late_3rd_century_AD,_Sardis,_Lydia,_Turkey_(18897218314).jpg", "후대 회당 유적"),
      media("assets/atrium/photos/sardis-artemis-temple.webp", "사데 아르테미스 신전의 거대한 기둥 유적 · 오늘의 풍경", "Ferit BAYCUMAN", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Artemis_Tap%C4%B1na%C4%9F%C4%B1_-_Sardes_Antik_Kenti.jpg"),
      media("assets/atrium/photos/sardis-citadel.webp", "사데 성채가 자리한 높은 산지와 유적 · 오늘의 지형", "Ken Mayer", "CC BY 2.0", "https://commons.wikimedia.org/wiki/File:Sardis_citadel.jpg")
    ],
    laodicea: [
      media("assets/atrium/photos/laodicea-temple-a.webp", "라오디게아 A 신전과 고대 도시 유적 · 오늘의 풍경", "Carole Raddato", "CC BY-SA 2.0", "https://commons.wikimedia.org/wiki/File:Temple_A,_built_in_the_Antonine_period_(2nd_century_AD),_Laodicea_on_the_Lycus,_Phrygia,_Turkey_(21625586525).jpg"),
      media("assets/atrium/photos/laodicea-stadium-street.webp", "라오디게아 경기장 거리와 복원된 열주 · 오늘의 풍경", "Carole Raddato", "CC BY-SA 2.0", "https://commons.wikimedia.org/wiki/File:Stadium_Street,_The_North-South_Street_extending_south_from_the_western_end_of_the_Syria_Street,_Laodicea_on_the_Lycus,_Phrygia,_Turkey_(31957861892).jpg"),
      media("assets/atrium/photos/laodicea-stadium.webp", "라오디게아 경기장 유적과 주변 평야 · 오늘의 풍경", "Blcksprt", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Laodicea_Stadium.jpg")
    ],
    patmos: [
      media("assets/atrium/photos/patmos-panorama.webp", "에게해의 밧모섬과 해안선 · 오늘의 섬 전경", "Tomisti", "CC BY-SA 3.0", "https://commons.wikimedia.org/wiki/File:Patmos_panorama_3.jpg"),
      media("assets/atrium/photos/patmos-skala.webp", "밧모섬 스칼라 항구와 흰 마을 · 오늘의 생활 풍경", "Chris Vlachos", "CC BY 3.0", "https://commons.wikimedia.org/wiki/File:Skala-of-patmos.JPG"),
      media("assets/atrium/photos/patmos-monastery.webp", "밧모섬 성 요한 수도원 전경 · 성경 시대 이후의 신앙 유산", "Glorious 93", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Vue_du_Monast%C3%A8re_Saint-Jean-le-Th%C3%A9ologien_de_Patmos.JPG", "후대 신앙 유산")
    ],
    hebron: [
      media("assets/atrium/photos/hebron-patriarchs.webp", "헤브론 막벨라 굴 전승지와 족장들의 무덤 건축 · 오늘의 풍경", "Djampa", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Hebron_Cave_of_the_Patriarchs.jpg", "전승지"),
      media("assets/atrium/photos/hebron-downtown.webp", "헤브론 도심의 밀집한 건물과 언덕 · 오늘의 도시 전경", "CarlSerafino", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Downtown_H1_Hebron_with_Arab_Palestine_Shopping_Center.jpg"),
      media("assets/atrium/photos/hebron-old-city.webp", "헤브론 구시가지의 석조 골목과 전통 건축 · 오늘의 생활 풍경", "بلال الدويك", "CC BY-SA 3.0", "https://commons.wikimedia.org/wiki/File:Old_Hebron_3.jpg")
    ],
    emmaus: [
      media("assets/atrium/photos/emmaus-baptistry.webp", "엠마오 니코폴리스의 세례 시설 유적 · 엠마오 후보지 참고", "Avishai Teicher", "Public domain", "https://commons.wikimedia.org/wiki/File:Baptistry_in_Emmaus_Nicopolis,_Israel.jpg", "후보지 유적"),
      media("assets/atrium/photos/emmaus-nicopolis.webp", "엠마오 니코폴리스의 교회 유적과 석조 구조 · 후보지의 오늘", "Avishai Teicher", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Emmaus_Nicopolis_(1).jpg", "후보지 유적"),
      media("assets/atrium/photos/emmaus-old-church.webp", "엠마오 니코폴리스의 옛 교회 유적 · 여러 엠마오 후보지 가운데 한 곳", "Avishai Teicher", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Emmaus_Nicopolis.jpg", "후보지 유적")
    ],
    shechem: [
      media("assets/atrium/photos/shechem-gate.webp", "텔 발라타의 성벽과 성문 유적 · 고대 세겜 터의 오늘", "TrickyH", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Tell_Balata.jpg"),
      media("assets/atrium/photos/shechem-gerizim-view.webp", "그리심산에서 내려다본 텔 발라타와 세겜 권역 · 오늘의 지형", "עדירל", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:TelShchem5595.JPG"),
      media("assets/atrium/photos/shechem-ruins.webp", "텔 발라타에 남은 고대 세겜의 석조 유적 · 오늘의 풍경", "Daniel Ventura", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Tel_Shchem_-_the_remains_of_the_old_city_04.jpg")
    ],
    bethel: [
      media("assets/atrium/photos/bethel-beitin.webp", "베이틴의 언덕과 마을 전경 · 전통적 벧엘 후보지의 오늘", "Bukvoed", "CC BY 4.0", "https://commons.wikimedia.org/wiki/File:Beitin-2246.jpg", "후보지 풍경"),
      media("assets/atrium/photos/bethel-landscape.webp", "베이틴 인근의 돌밭과 구릉 지형 · 벧엘 후보 권역 참고", "Bukvoed", "CC BY 4.0", "https://commons.wikimedia.org/wiki/File:Beitin-3824.jpg", "후보지 풍경"),
      media("assets/atrium/photos/bethel-walls.webp", "베이틴에 남은 고대 석벽 유적 · 전통적 벧엘 후보지", "Pessimist2006", "CC BY-SA 3.0", "https://commons.wikimedia.org/wiki/File:Bethel1.jpg", "후보지 유적")
    ],
    joppa: [
      media("assets/atrium/photos/joppa-port-aerial.webp", "지중해에서 바라본 오늘날 욥바 항구 · 항공 풍경", "Godot13", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:ISR-2013-Aerial-Jaffa-Port_of_Jaffa.jpg"),
      media("assets/atrium/photos/joppa-coast.webp", "텔아비브 해변에서 바라본 욥바 구시가지와 해안선 · 오늘의 풍경", "Godot13", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Israel-2013-Jaffa_01.jpg"),
      media("assets/atrium/photos/joppa-st-peter.webp", "욥바 성 베드로 교회 외관 · 성경 시대 이후의 도시 신앙 유산", "Godot13", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Israel-2013-Jaffa_25-St._Peter%27s_Church.JPG", "후대 신앙 유산")
    ],
    cana: [
      media("assets/atrium/photos/cana-kafr-kanna.webp", "카프르 칸나의 올리브 정원 · 전통적 가나 후보지의 생활 풍경", "Britchi Mirela", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:ISRAEL,_Cana_Galilei_(Kafr_Kanna)_(Olive_garden).JPG", "후보지 풍경"),
      media("assets/atrium/photos/cana-wedding-church.webp", "카프르 칸나 정교회 혼인 교회 · 가나 전승지의 오늘", "Chris06", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Wedding_Church_(Orthodox)_Kafr_Kanna_(1).jpg", "전승지"),
      media("assets/atrium/photos/cana-stone-jar.webp", "카프르 칸나 혼인 교회에 전시된 고대 석항아리 · 전승 자료", "Avishai Teicher", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:The_Orthodox_church_(Kafr_Kanna)_(8).JPG", "전승 자료")
    ],
    bethany: [
      media("assets/atrium/photos/bethany-lazarus-tomb.webp", "알에이자리야의 나사로 무덤 전승지 입구 · 오늘의 풍경", "Thomasccnawiki", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Lazarus_Tomb.jpg", "전승지"),
      media("assets/atrium/photos/bethany-orthodox-church.webp", "나사로 무덤 인근 그리스 정교회 · 오늘날 베다니 권역", "See The Holy Land", "CC BY-SA 2.0", "https://commons.wikimedia.org/wiki/File:Greek_Orthodox_Church_al-Eizariya.jpg", "후대 신앙 유산"),
      media("assets/atrium/photos/bethany-procession.webp", "알에이자리야 골목의 나사로 토요일 행렬 · 오늘의 생활 풍경", "Bahnfrend", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Lazarus_Saturday_procession,_Bethany,_2019_(08).jpg")
    ],
    shiloh: [
      media("assets/atrium/photos/shiloh-overview.webp", "고대 실로 유적 언덕의 넓은 전경 · 오늘의 풍경", "Zeev Stein", "CC BY 2.5", "https://commons.wikimedia.org/wiki/File:116921_ancient_shiloh_site_shiloh_PikiWiki_Israel.jpg"),
      media("assets/atrium/photos/shiloh-ruins.webp", "실로 유적지의 석조 건물 터와 발굴 구역 · 오늘의 풍경", "Zeev Stein", "CC BY 2.5", "https://commons.wikimedia.org/wiki/File:116934_ancient_shiloh_site_shiloh_PikiWiki_Israel.jpg"),
      media("assets/atrium/photos/shiloh-stonework.webp", "실로 유적지에 남은 석벽과 건물 기초 · 오늘의 풍경", "Zeev Stein", "CC BY 2.5", "https://commons.wikimedia.org/wiki/File:116929_ancient_shiloh_site_shiloh_PikiWiki_Israel.jpg")
    ],
    beersheba: [
      media("assets/atrium/photos/beersheba-overview.webp", "텔 브엘세바 발굴지와 네게브 지형 · 오늘의 전경", "gugganij", "CC BY-SA 3.0", "https://commons.wikimedia.org/wiki/File:Tel_Be%27er_Sheva_Overview_2007041.JPG"),
      media("assets/atrium/photos/beersheba-gate.webp", "텔 브엘세바의 삼중 성문 유적 · 오늘의 풍경", "Oren Rozen", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Tel_Be%27er_Sheva_181225_03_Triple_Gate.jpg"),
      media("assets/atrium/photos/beersheba-water-system.webp", "텔 브엘세바 지하 수로 시설 입구 · 오늘의 유적 풍경", "Oren Rozen", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Tel_Be%27er_Sheva_181225_10_Water_System.jpg")
    ],
    "pisidian-antioch": [
      media("assets/atrium/photos/pisidian-antioch-overview.webp", "얄바츠 인근 비시디아 안디옥 고대 도시 터 · 오늘의 전경", "Maderibeyza", "CC BY-SA 3.0", "https://commons.wikimedia.org/wiki/File:Antiocheia_in_Psidia.jpg"),
      media("assets/atrium/photos/pisidian-antioch-decumanus.webp", "비시디아 안디옥의 동서 대로 데쿠마누스 막시무스 · 오늘의 풍경", "Dosseman", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Antioch_in_Pisida_Decumanus_Maximus_047.jpg"),
      media("assets/atrium/photos/pisidian-antioch-basilica.webp", "비시디아 안디옥 성 바울 대성당의 후대 유적 · 오늘의 풍경", "Dosseman", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Antioch_of_Pisidia_2870.jpg", "후대 교회 유적")
    ],
    lystra: [
      media("assets/atrium/photos/lystra-galatia-map.webp", "루스드라와 갈라디아·루가오니아 권역을 보여 주는 1903년 지도", "Encyclopaedia Biblica", "Public domain", "https://commons.wikimedia.org/wiki/File:C%2BB-Galatia-Map.JPG", "역사 지리 자료"),
      media("assets/atrium/photos/lystra-titus-coin.webp", "루스드라 조폐소에서 발행된 티투스 시대 청동 주화 앞면 · 실물 자료", "Bibliothèque nationale de France", "Public domain", "https://commons.wikimedia.org/wiki/File:Monnaie_-_Bronze,_Lystra,_Lycaonie,_Titus_-_btv1b85166275_(1_of_2).jpg", "유물"),
      media("assets/atrium/photos/lystra-augustus-coin.webp", "루스드라 조폐소의 아우구스투스 시대 청동 주화 뒷면 · 실물 자료", "Bibliothèque nationale de France", "Public domain", "https://commons.wikimedia.org/wiki/File:Monnaie_-_Bronze,_Lystra,_Lycaonie,_Auguste_-_btv1b8516625b_(2_of_2).jpg", "유물")
    ],
    thyatira: [
      media("assets/atrium/photos/thyatira-columns.webp", "오늘날 아키사르 도심에 남은 두아디라 기둥 유적 · 오늘의 풍경", "Pragdon", "CC0", "https://commons.wikimedia.org/wiki/File:Columns_of_Thiatira.jpg"),
      media("assets/atrium/photos/thyatira-portico.webp", "두아디라 아고라의 후대 주랑과 기둥 기초 · 오늘의 유적 풍경", "Ian Scott", "CC BY-SA 2.0", "https://commons.wikimedia.org/wiki/File:Thyatira_portico.jpg", "후대 도시 유적"),
      media("assets/atrium/photos/thyatira-basilica.webp", "아키사르의 두아디라 바실리카 유적 · 오늘의 풍경", "Klaus-Peter Simon", "CC BY-SA 3.0", "https://commons.wikimedia.org/wiki/File:ThyatiraBasilika.jpg", "후대 교회 유적")
    ],
    philadelphia: [
      media("assets/atrium/photos/philadelphia-st-jean.webp", "알라셰히르 성 요한 교회의 거대한 기둥 유적 · 오늘의 풍경", "Sharon Hahn Darlin", "CC BY 2.0", "https://commons.wikimedia.org/wiki/File:Biblical_Philadelphia,_Ala%C5%9Fehir,_Turkey_(%E2%80%9CSeven_Churches_of_Revelation%E2%80%9D)_(51967355823).jpg", "후대 교회 유적"),
      media("assets/atrium/photos/philadelphia-church-angle.webp", "빌라델비아의 오늘, 알라셰히르 성 요한 교회 유적의 다른 시선", "Sharon Hahn Darlin", "CC BY 2.0", "https://commons.wikimedia.org/wiki/File:Biblical_Philadelphia,_Ala%C5%9Fehir,_Turkey_(%E2%80%9CSeven_Churches_of_Revelation%E2%80%9D)_(51966166907).jpg", "후대 교회 유적"),
      media("assets/atrium/photos/philadelphia-fruit-market.webp", "오늘날 알라셰히르의 과일 시장 · 농업 도시의 생활 풍경", "Quintucket", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Alasehir_fruit_market.jpg")
    ],
    berea: [
      media("assets/atrium/photos/berea-city.webp", "베뢰아의 오늘, 겨울의 베리아 도심 전경", "Sergiogr", "Public domain", "https://commons.wikimedia.org/wiki/File:Veria2006.JPG"),
      media("assets/atrium/photos/berea-old-streets.webp", "베리아 구시가지의 좁은 돌길과 전통 건축 · 오늘의 생활 풍경", "Rufus210", "CC BY-SA 3.0", "https://commons.wikimedia.org/wiki/File:Veria-Old_Streats.jpg"),
      media("assets/atrium/photos/berea-pauls-altar.webp", "바울이 말씀을 전한 곳으로 기념되는 베리아의 강단 · 전승지", "Pjposullivan", "CC BY-SA 3.0", "https://commons.wikimedia.org/wiki/File:Beroia_St_Paul%27s_Altar.jpg", "전승지")
    ],
    malta: [
      media("assets/atrium/photos/malta-st-paul-islands.webp", "세인트폴스베이에서 바라본 바울 섬 전승지 · 오늘의 해안 풍경", "Frank Vincentz", "CC BY-SA 3.0", "https://commons.wikimedia.org/wiki/File:Malta_-_Mellieha_-_St._Paul_Islands_(Dawret_il-Gzejjer)_01_ies.jpg", "전승지 풍경"),
      media("assets/atrium/photos/malta-islands-tower.webp", "세인트폴스베이 탑에서 바라본 바울 섬과 지중해 · 오늘의 풍경", "Frank Vincentz", "CC BY-SA 3.0", "https://commons.wikimedia.org/wiki/File:Malta_-_Mellieha_-_St._Paul%27s_Islands_(St._Paul%27s_Bay_Tower)_02_ies.jpg", "전승지 풍경"),
      media("assets/atrium/photos/malta-bay-panorama.webp", "멜리데 섬 북부 세인트폴스베이의 넓은 해안 전경 · 오늘의 풍경", "Txllxt", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Malta_-_St._Paul%27s_Bay_-_Dawret_Il-Gzejjer_-_360%C2%B0_Panorama_01.jpg")
    ],
    alexandria: [
      media("assets/atrium/photos/alexandria-harbor-view.webp", "카이트베이 성채에서 바라본 알렉산드리아 항구와 도심 · 오늘의 풍경", "Slyronit", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:A_view_of_Alexandria_from_the_Citadel_of_Qaitbay.jpg"),
      media("assets/atrium/photos/alexandria-serapeum-ruins.webp", "폼페이우스 기둥에서 본 세라페움 유적 · 오늘의 풍경", "Daniel Mayer", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Alexandria_-_Pompey%27s_Pillar_-_view_of_ruins.JPG"),
      media("assets/atrium/photos/alexandria-mediterranean-coast.webp", "지중해에서 바라본 알렉산드리아 해안 도시 · 오늘의 전경", "Vyacheslav Argenberg", "CC BY 4.0", "https://commons.wikimedia.org/wiki/File:Egypt,_Alexandria_on_the_Mediterranean_Sea.jpg")
    ],
    babylon: [
      media("assets/atrium/photos/babylon-processional-way.webp", "바벨론 행렬의 길 복원 구간 · 2016년 유적 풍경", "MohammadHuzam", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Processional_Way_in_2016,_Babylon_3.jpg", "복원 유적"),
      media("assets/atrium/photos/babylon-lion.webp", "바벨론의 사자 석상 · 2022년 유적 풍경", "Safa Daneshvar", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:001125-Babylon-IMG_8090-2.jpg"),
      media("assets/atrium/photos/babylon-old-city.webp", "고대 바벨론 터에 복원된 도시 구역 · 2022년 풍경", "Safa Daneshvar", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:001125-Babylon-IMG_8063-2.jpg", "복원 유적")
    ],
    ur: [
      media("assets/atrium/photos/ur-ziggurat-site.webp", "우르 지구라트와 주변 유적지 · 오늘의 전경", "Alli Khalil", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Ziggurat_of_Ur_Site_in_Nasiriyah_17.jpg"),
      media("assets/atrium/photos/ur-ziggurat-stairs.webp", "우르 지구라트의 복원된 계단 · 오늘의 유적 풍경", "Aziz1005", "CC BY 3.0", "https://commons.wikimedia.org/wiki/File:Ur-Ziggurat_Stairs.JPG", "복원 유적"),
      media("assets/atrium/photos/ur-city-ruins.webp", "우르 성읍 터의 건물 기초와 지구라트 · 오늘의 풍경", "David Stanley", "CC BY-SA 3.0", "https://commons.wikimedia.org/wiki/File:Ur_City_in_Nasiriyah.jpg")
    ],
    nineveh: [
      media("assets/atrium/photos/nineveh-nergal-gate.webp", "니느웨 네르갈 성문의 복원 유적 · 2008년 기록", "JoAnn S. Makinano, U.S. Air Force", "Public domain", "https://commons.wikimedia.org/wiki/File:Nergal_gate_in_Nineveh.JPG", "기록 사진"),
      media("assets/atrium/photos/nineveh-adad-gate.webp", "니느웨 아다드 성문과 성벽 기초 · 1990년 기록", "Fredarch", "CC BY-SA 3.0", "https://commons.wikimedia.org/wiki/File:Adad_gate_exterior_entrance_north3.JPG", "기록 사진"),
      media("assets/atrium/photos/nineveh-lachish-relief.webp", "니느웨 남서궁에서 나온 라기스 전투 부조 · 대영박물관 실물", "Osama Shukir Muhammed Amin", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:The_fall_of_Lachish,_King_Sennacherib_reviews_Judaean_prisoners..JPG", "유물")
    ],
    haran: [
      media("assets/atrium/photos/haran-ancient-ruins.webp", "하란 고대 성읍 터의 석조 유적 · 오늘의 풍경", "Theugursevinc", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Ancient_city_of_Harran_Ruins_-_Sanliurfa.jpg"),
      media("assets/atrium/photos/haran-beehive-houses.webp", "하란 마을의 벌집형 흙집과 메소포타미아 평야 · 오늘의 생활 풍경", "Zorka Sojka", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Turecko_Harran_(06).jpg"),
      media("assets/atrium/photos/haran-grand-mosque.webp", "하란 대모스크 유적과 낙타 · 오늘의 역사 풍경", "Zorka Sojka", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Turecko_Harran_(13)_me%C5%A1ita.jpg", "후대 도시 유산")
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
