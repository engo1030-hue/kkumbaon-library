/* Apostle Paul's journeys, visualized from the representative routes in Acts 13–28. */
(() => {
'use strict';
const svgNS='http://www.w3.org/2000/svg';
const xy=({lon,lat})=>({x:(lon-8)/43*1800,y:(45-lat)/22*1100});
const stop=(name,lon,lat,id='')=>({name,lon,lat,id});
const known={
 antioch:stop('안디옥',36.161,36.202,'antioch'),tarsus:stop('다소',34.895,36.917,'tarsus'),pisidian:stop('비시디아 안디옥',31.187,38.306,'pisidian-antioch'),lystra:stop('루스드라',32.363,37.581,'lystra'),ephesus:stop('에베소',27.342,37.94,'ephesus'),troas:stop('드로아',26.158,39.752,'troas'),philippi:stop('빌립보',24.285,41.015,'philippi'),thessalonica:stop('데살로니가',22.947,40.636,'thessalonica'),berea:stop('베뢰아',22.203,40.521,'berea'),athens:stop('아테네',23.724,37.972,'athens'),corinth:stop('고린도',22.878,37.906,'corinth'),miletus:stop('밀레도',27.277,37.531,'miletus'),caesarea:stop('가이사랴',34.899,32.501,'caesarea'),jerusalem:stop('예루살렘',35.235,31.778,'jerusalem'),malta:stop('몰타',14.407,35.951,'malta'),rome:stop('로마',12.485,41.893,'rome')
};
const p={
 seleucia:stop('실루기아',35.90,36.12),salamis:stop('살라미',33.63,35.17),paphos:stop('바보',32.42,34.77),perga:stop('버가',30.85,36.96),iconium:stop('이고니온',32.49,37.87),derbe:stop('더베',33.35,37.35),attalia:stop('앗달리아',30.70,36.89),samothrace:stop('사모드라게',25.53,40.46),neapolis:stop('네압볼리',24.41,40.93),amphipolis:stop('암비볼리',23.83,40.82),apollonia:stop('아볼로니아',23.35,40.64),cenchreae:stop('겐그레아',23.00,37.88),assos:stop('앗소',26.34,39.49),mitylene:stop('미둘레네',26.55,39.10),chios:stop('기오',26.13,38.37),samos:stop('사모',26.84,37.76),cos:stop('고스',27.20,36.89),rhodes:stop('로도',28.22,36.44),patara:stop('바다라',29.32,36.27),tyre:stop('두로',35.20,33.27),ptolemais:stop('돌레마이',35.08,32.93),sidon:stop('시돈',35.37,33.56),myra:stop('무라',29.96,36.26),cnidus:stop('니도',27.37,36.69),fairHavens:stop('미항',24.93,34.93),syracuse:stop('수라구사',15.29,37.07),rhegium:stop('레기온',15.65,38.11),puteoli:stop('보디올',14.12,40.82)
};
const routes={
 journey1:{label:'1차 전도여행',ref:'사도행전 13:1–14:28',text:'안디옥에서 구브로를 지나 비시디아와 루가오니아로 이어진 첫 여정입니다.',points:[known.antioch,p.seleucia,p.salamis,p.paphos,p.perga,known.pisidian,p.iconium,known.lystra,p.derbe,known.lystra,p.iconium,known.pisidian,p.perga,p.attalia,known.antioch]},
 journey2:{label:'2차 전도여행',ref:'사도행전 15:36–18:22',text:'소아시아에서 드로아를 건너 마게도냐와 아가야로 복음이 뻗어 갑니다.',points:[known.antioch,known.tarsus,p.derbe,known.lystra,p.iconium,known.troas,p.samothrace,p.neapolis,known.philippi,p.amphipolis,p.apollonia,known.thessalonica,known.berea,known.athens,known.corinth,p.cenchreae,known.ephesus,known.caesarea,known.jerusalem,known.antioch]},
 journey3:{label:'3차 전도여행',ref:'사도행전 18:23–21:17',text:'에베소의 긴 사역 뒤 마게도냐와 헬라를 돌아 예루살렘으로 향한 여정입니다.',points:[known.antioch,known.tarsus,p.derbe,known.pisidian,known.ephesus,known.troas,known.philippi,known.thessalonica,known.berea,known.corinth,known.philippi,known.troas,p.assos,p.mitylene,p.chios,p.samos,known.miletus,p.cos,p.rhodes,p.patara,p.tyre,p.ptolemais,known.caesarea,known.jerusalem]},
 rome:{label:'로마로 가는 길',ref:'사도행전 27:1–28:16',text:'가이사랴에서 시작해 풍랑과 난파를 지나 마침내 로마에 닿은 호송 여정입니다.',points:[known.caesarea,p.sidon,p.myra,p.cnidus,p.fairHavens,known.malta,p.syracuse,p.rhegium,p.puteoli,known.rome]}
};
const routeOrder=['journey1','journey2','journey3','rome'];
let active='all',storyTimer=0,introPending=false,introObserver=null,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function el(name,attrs={}){const n=document.createElementNS(svgNS,name);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));return n;}
function pathData(points){return points.map((point,i)=>{const q=xy(point);return`${i?'L':'M'} ${q.x.toFixed(1)} ${q.y.toFixed(1)}`;}).join(' ');}
function drawRoute(svg,key,route){
 const group=el('g',{'class':'paul-route-group is-selected','data-route':key}),d=pathData(route.points);
 const shadow=el('path',{d,class:'paul-route-shadow'}),line=el('path',{d,class:'paul-route-line'});
 group.append(shadow,line);
 route.points.forEach((point,i)=>{if(i&&i<route.points.length-1&&i%2===0)return;const q=xy(point);group.append(el('circle',{class:'paul-route-stop',cx:q.x.toFixed(1),cy:q.y.toFixed(1),r:i===0||i===route.points.length-1?'4.1':'2.7'}));});
 if(!reduced){[0,1].forEach(i=>{const light=el('circle',{class:'paul-route-light',r:i?'2.7':'3.8'}),motion=el('animateMotion',{dur:(9+i*2.2)+'s',begin:(-i*4.4)+'s',repeatCount:'indefinite',path:d});light.append(motion);group.append(light);});}
 svg.append(group);
 requestAnimationFrame(()=>{const length=line.getTotalLength();group.style.setProperty('--route-length',length.toFixed(1));});
}
function story(routeKey,initial=false){
 const box=document.getElementById('paulRouteStory');if(!box)return;
 const data=routeKey==='all'?{label:'복음이 길이 되다',ref:'사도 바울의 길',text:'안디옥에서 로마까지, 사도행전의 기록을 따라 빛이 이어집니다.'}:routes[routeKey];
 document.getElementById('paulRouteStoryEyebrow').textContent=data.ref;
 document.getElementById('paulRouteStoryTitle').textContent=data.label;
 document.getElementById('paulRouteStoryText').textContent=data.text;
 box.hidden=false;clearTimeout(storyTimer);storyTimer=setTimeout(()=>box.hidden=true,initial?8500:4800);
}
function markStops(routeKey){
 document.querySelectorAll('.place-marker.is-paul-route-stop').forEach(n=>n.classList.remove('is-paul-route-stop'));
 if(routeKey==='all')return;
 routes[routeKey].points.forEach(point=>{if(point.id)document.querySelector(`[data-place="${point.id}"]`)?.classList.add('is-paul-route-stop');});
}
function focusMap(routeKey,attempt=0){if(!window.AtlasHall){if(attempt<20)setTimeout(()=>focusMap(routeKey,attempt+1),50);return;}if(routeKey==='all')window.AtlasHall.reset();else window.AtlasHall.fit(routes[routeKey].points.map(xy),routes[routeKey].label,routes[routeKey].ref);}
function select(routeKey,{announce=true,reset=true}={}){
 if(routeKey!=='all'&&!routes[routeKey])return;active=routeKey;
 if(announce){introPending=false;introObserver?.disconnect();}
 const journeySelected=routeKey!=='all';
 document.getElementById('atlasViewport')?.classList.toggle('is-paul-journey',journeySelected);
 const scaleNote=document.getElementById('mapScaleNote');
 if(scaleNote)scaleNote.textContent=journeySelected?'빛나는 선은 선택한 여정의 대표 경로입니다':'점의 숫자는 연결된 문헌 수입니다';
 document.querySelectorAll('[data-paul-route]').forEach(button=>{const on=button.dataset.paulRoute===routeKey;button.classList.toggle('is-active',on);button.setAttribute('aria-pressed',String(on));});
 document.querySelectorAll('.paul-route-group').forEach(group=>{const on=routeKey==='all'||group.dataset.route===routeKey;group.classList.toggle('is-muted',!on);group.classList.toggle('is-selected',on);group.classList.remove('is-drawing');if(routeKey!=='all'&&on&&!reduced){void group.getBoundingClientRect();group.classList.add('is-drawing');setTimeout(()=>group.classList.remove('is-drawing'),2100);}});
 markStops(routeKey);if(reset)focusMap(routeKey);if(announce)story(routeKey);
 const live=document.getElementById('mapLive');if(live)live.textContent=routeKey==='all'?'사도 바울의 전체 대표 경로가 표시되었습니다.':`${routes[routeKey].label}, ${routes[routeKey].ref} 대표 경로가 표시되었습니다.`;
}
function init(){
 const svg=document.getElementById('paulRouteMap');if(!svg)return;routeOrder.forEach(key=>drawRoute(svg,key,routes[key]));
 document.querySelectorAll('[data-paul-route]').forEach(button=>button.addEventListener('click',event=>{event.stopPropagation();select(button.dataset.paulRoute);}));
 document.querySelector('.paul-route-story-close')?.addEventListener('click',()=>{clearTimeout(storyTimer);document.getElementById('paulRouteStory').hidden=true;});
 const force=new URLSearchParams(location.search).get('routeIntro')==='1';let seen=false;try{seen=sessionStorage.getItem('kkumbaonPaulRouteSeen')==='1';}catch{}
 select('all',{announce:false,reset:false});
 if((force||!seen)&&!location.hash.startsWith('#place-')){introPending=true;const stage=document.getElementById('atlasViewport'),show=()=>{if(!introPending)return;introPending=false;story('all',true);try{sessionStorage.setItem('kkumbaonPaulRouteSeen','1');}catch{}};if('IntersectionObserver'in window&&stage){introObserver=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){introObserver.disconnect();show();}},{threshold:.18});introObserver.observe(stage);}else show();}
 window.PaulRoutes={select,getState:()=>({active,routes:routeOrder.map(key=>({key,label:routes[key].label,ref:routes[key].ref,stops:routes[key].points.length}))})};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
