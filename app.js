let SITE={name:'Havoc.gg',logo:'images/Havoc-logo.png',footer:'Havoc.gg',accent:'',nav:[{label:'Новини',href:'index.html',page:'home'},{label:'Матчі',href:'matches.html',page:'matches'},{label:'Події',href:'events.html',page:'events'}]};
const E=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const get=async f=>{try{return await (await fetch('data/'+f+'.json')).json()}catch(e){return null}};
const page=document.body.dataset.page, Q=new URLSearchParams(location.search);
let TEAMS={},EVENTS={};
const tm=id=>TEAMS[id]||{id,name:id,logo:''};
const im=t=>t.logo?`<img src="${E(t.logo)}" alt="">`:'';
const tl=id=>`<a class="team" href="view.html?type=team&id=${E(id)}">${im(tm(id))}<span>${E(tm(id).name)}</span></a>`;
const sc=m=>m.status==='live'?'<b class="live">LIVE</b>':m.status==='finished'?`<b>${m.score1} - ${m.score2}</b>`:`<b>${E(m.time)}</b>`;
const row=m=>`<a class="match" href="view.html?type=match&id=${E(m.id)}"><span class="t l">${E(tm(m.team1).name)}${im(tm(m.team1))}</span>${sc(m)}<span class="t r">${im(tm(m.team2))}${E(tm(m.team2).name)}</span></a>`;
const fd=d=>new Date(d).toLocaleDateString('uk-UA',{weekday:'long',day:'numeric',month:'long'});
const plr=p=>{p=typeof p==='string'?{name:p}:p;return `<li style="display:flex;align-items:center;gap:10px;list-style:none;margin:6px 0">${p.photo?`<img src="${E(p.photo)}" alt="" style="width:40px;height:40px;border-radius:50%;object-fit:cover">`:''}<span>${E(p.name)}${p.role?` <span class="mut">· ${E(p.role)}</span>`:''}</span></li>`};
const evimg=e=>e.logo?`<img src="${E(e.logo)}" alt="" style="height:48px;width:48px;object-fit:contain">`:'';
const none=t=>`<p class="mut">${t}</p>`;
const card=(h,b)=>`<div class="card">${h?`<h2>${h}</h2>`:''}${b}</div>`;
const newsRow=(n,big)=>`<a class="news ${big?'big':''}" href="view.html?type=news&id=${E(n.id)}">${n.image?`<img src="${E(n.image)}" alt="">`:''}<div><h3>${E(n.title)}</h3><div class="mut">${E(n.date)}</div><p>${E(n.summary)}</p></div></a>`;

async function side(M){
  const live=M.filter(m=>m.status==='live'), res=M.filter(m=>m.status==='finished').sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);
  return card('Матчі в прямому ефірі',live.map(row).join('')||none('Зараз немає'))+card('Останні результати',res.map(row).join('')||none('Немає'));
}
function shell(main,sidebar){
  if(SITE.accent)document.documentElement.style.setProperty('--acc',SITE.accent);
  document.body.innerHTML=`<header><a href="index.html">${SITE.logo?`<img src="${E(SITE.logo)}" alt="${E(SITE.name)}">`:E(SITE.name)}</a><nav>${SITE.nav.map(n=>`<a href="${E(n.href)}" class="${n.page===page?'on':''}">${E(n.label)}</a>`).join('')}</nav></header><main><div>${main}</div><aside>${sidebar}</aside></main><footer>&copy; ${new Date().getFullYear()} ${E(SITE.footer)}</footer>`;
}
(async()=>{
  const [teams,matches,events,news,site]=await Promise.all(['teams','matches','events','news','site'].map(get));
  if(site)SITE={...SITE,...site};
  if(!teams||!matches){document.body.innerHTML='<p style="padding:20px;color:#fff">Не вдалось завантажити data/*.json. Відкрий сайт через сервер (GitHub Pages або <code>python -m http.server</code>), а не подвійним кліком по файлу.</p>';return}
  (teams||[]).forEach(t=>TEAMS[t.id]=t);(events||[]).forEach(e=>EVENTS[e.id]=e);
  const S=await side(matches), evn=id=>EVENTS[id]?E(EVENTS[id].name):E(id);
  let m='';
  if(page==='home'){
    const N=[...(news||[])].sort((a,b)=>b.date.localeCompare(a.date)), f=N.find(n=>n.featured)||N[0];
    m=card('Головні новини',f?newsRow(f,1):none('Немає новин'))+card('Останні новини',N.filter(n=>n!==f).map(n=>newsRow(n)).join('')||none('Немає'));
  }
  if(page==='matches'){
    const tab=Q.get('tab')||'upcoming', ev=Q.get('event');
    let L=matches.filter(x=>(!ev||x.event===ev)&&(tab==='results'?x.status==='finished':x.status!=='finished')).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)*(tab==='results'?-1:1));
    const g={};L.forEach(x=>(g[x.date]=g[x.date]||[]).push(x));
    m=`<div class="tabs"><button class="${tab!=='results'?'on':''}" onclick="location.search='?tab=upcoming${ev?'&event='+ev:''}'">Розклад</button><button class="${tab==='results'?'on':''}" onclick="location.search='?tab=results${ev?'&event='+ev:''}'">Результати</button></div>`+(Object.keys(g).map(d=>card(fd(d),g[d].map(x=>row(x)+`<div class="mut" style="text-align:center">${evn(x.event)}</div>`).join(''))).join('')||none('Матчів немає'));
  }
  if(page==='events'){
    m=(events||[]).map(e=>card('',`${e.banner?`<img src="${E(e.banner)}" alt="" style="width:100%;max-height:160px;object-fit:cover;border-radius:6px;margin-bottom:10px">`:''}<div class="hero" style="gap:12px">${evimg(e)}<h3 style="margin:0"><a href="view.html?type=event&id=${E(e.id)}">${E(e.name)}</a></h3></div><span class="tag">${E(e.status)}</span> <span class="mut">${E(e.dates)} · Призовий: ${E(e.prize)}</span><p>${E(e.description)}</p>`)).join('');
  }
  if(page==='view'){
    const type=Q.get('type'),id=Q.get('id');m=none('Не знайдено');
    if(type==='news'){const n=(news||[]).find(x=>x.id===id);if(n)m=card('',`<h1>${E(n.title)}</h1><div class="mut">${E(n.date)}</div>${n.image?`<img src="${E(n.image)}" style="max-width:100%;border-radius:8px;margin:12px 0">`:''}${(n.content||[]).map(p=>`<p>${E(p)}</p>`).join('')}`)}
    if(type==='team'&&TEAMS[id]){const t=TEAMS[id];m=card('',`<div class="hero">${im(t).replace('<img','<img style="height:90px;width:90px"')}<div><h1>${E(t.name)}</h1><p>${E(t.description)}</p></div></div>`)+card('Склад',`<ul style="padding:0;margin:0">${(t.players||[]).map(plr).join('')}</ul>`)+card('Матчі',matches.filter(x=>x.team1===id||x.team2===id).map(row).join('')||none('Немає'))}
    if(type==='match'){const x=matches.find(y=>y.id===id);if(x)m=card('',`<div class="match" style="font-size:20px">${E(tm(x.team1).name)}${sc(x)}${E(tm(x.team2).name)}</div><p class="mut" style="text-align:center">${fd(x.date)} · ${E(x.time)} · <a href="view.html?type=event&id=${E(x.event)}">${evn(x.event)}</a></p>`)+((x.maps||[]).length?card('Карти',x.maps.map(k=>`<div class="match"><span class="t l">${E(k.map)}</span><b>${k.score1} - ${k.score2}</b><span></span></div>`).join('')):'')+(x.notes?card('Коментар',`<p>${E(x.notes)}</p>`):'')}
    if(type==='event'&&EVENTS[id]){const e=EVENTS[id];m=card('',`${e.banner?`<img src="${E(e.banner)}" alt="" style="width:100%;max-height:220px;object-fit:cover;border-radius:6px;margin-bottom:10px">`:''}<div class="hero" style="gap:12px">${evimg(e)}<h1 style="margin:0">${E(e.name)}</h1></div><span class="tag">${E(e.status)}</span> <span class="mut">${E(e.dates)} · Призовий: ${E(e.prize)}</span><p>${E(e.description)}</p>`)+card('Команди',(e.teams||[]).map(tl).join('<br>'))+card(`Матчі · <a href="matches.html?event=${E(id)}">усі</a>`,matches.filter(x=>x.event===id).map(row).join('')||none('Немає'))}
  }
  shell(m,S);
})();
