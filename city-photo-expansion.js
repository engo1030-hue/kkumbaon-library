(function () {
  const atlas = window.DREAMBAON_ATLAS;
  if (!atlas || !atlas.images || !Array.isArray(atlas.images.bethlehem)) return;

  const additions = [
    {
      src: "assets/atrium/photos/bethlehem-city-panorama-2024.webp",
      caption: "베들레헴 도심과 언덕 위 교회들 · 2024년 오늘의 도시 전경",
      kind: "오늘의 풍경",
      credit: "Tamerhm",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:%D8%A8%D9%8A%D8%AA_%D9%84%D8%AD%D9%85_%D9%88%D8%A7%D8%AF_%D9%85%D8%B9%D8%A7%D9%84%D9%8A.jpg",
      file: "بيت لحم واد معالي.jpg",
      width: 1600,
      height: 1205
    },
    {
      src: "assets/atrium/photos/bethlehem-manger-square-2016.webp",
      caption: "구유광장과 오마르 모스크 · 베들레헴 중심부의 오늘",
      kind: "오늘의 풍경",
      credit: "Konrad Summers",
      license: "CC BY-SA 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Manger_Square,_Bethlehem_(25894141005).jpg",
      file: "Manger Square, Bethlehem (25894141005).jpg",
      width: 1600,
      height: 900
    },
    {
      src: "assets/atrium/photos/bethlehem-old-street-2018.webp",
      caption: "베들레헴 구시가지의 돌계단과 골목 · 오늘의 생활 풍경",
      kind: "오늘의 풍경",
      credit: "Aya A. Ismail",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Bethlehem_city.jpg",
      file: "Bethlehem city.jpg",
      width: 1280,
      height: 1600
    }
  ];

  const known = new Set(atlas.images.bethlehem.map((item) => item.src));
  additions.forEach((item) => {
    if (!known.has(item.src)) atlas.images.bethlehem.push(item);
  });
})();
