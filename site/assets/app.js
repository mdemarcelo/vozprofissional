(()=>{
'use strict';
const $=(s,root=document)=>root.querySelector(s);
const state={media:Array.isArray(window.VP_INITIAL_MEDIA)?window.VP_INITIAL_MEDIA:[],products:Array.isArray(window.VP_INITIAL_PRODUCTS)?window.VP_INITIAL_PRODUCTS:[],filter:'all',expanded:false,opener:null};
const labels={reel:'Reel',tv:'TV',institucional:'Institucional',internet:'Internet',caricata:'Vozes Caricatas',eventos:'Shows e Eventos',audiolivros:'Audiolivros',outros:'Outros'};
function validURL(url){
  if(typeof url!=='string'||!url.trim())return '';
  const value=url.trim();
  // Arquivos enviados pelo CMS: somente a pasta /media/, sem traversal ou caracteres especiais.
  if(/^\/media\/[\w.%\-/]+$/.test(value) && !value.includes('..') && !/%2e|%2f|%5c/i.test(value)) return value;
  try{const u=new URL(value);return u.protocol==='https:'?u.href:''}catch{return ''}
}
function youtubeId(url){try{let u=new URL(url);if(['youtu.be','www.youtu.be'].includes(u.hostname))return /^[\w-]{11}$/.test(u.pathname.slice(1))?u.pathname.slice(1):'';if(['youtube.com','www.youtube.com','m.youtube.com','www.youtube-nocookie.com'].includes(u.hostname)){const id=u.searchParams.get('v')||u.pathname.match(/^\/(?:embed|shorts)\/([\w-]{11})/)?.[1];return /^[\w-]{11}$/.test(id||'')?id:''}}catch{}return ''}
function soundcloudEmbedURL(raw){
  const url=validURL(raw);if(!url)return '';
  try{
    const u=new URL(url);
    if(!['soundcloud.com','www.soundcloud.com','m.soundcloud.com'].includes(u.hostname)||u.username||u.password||u.port||u.pathname==='/')return '';
    const track=`https://soundcloud.com${u.pathname}${u.search}`;
    return 'https://w.soundcloud.com/player/?url='+encodeURIComponent(track)+'&color=%23087c82&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&show_artwork=false';
  }catch{return ''}
}
function soundcloudPlayer(raw,title){
  const src=soundcloudEmbedURL(raw);if(!src)return null;
  const frame=document.createElement('iframe');frame.className='soundcloud-player';frame.src=src;
  frame.title=title||'Ouvir no SoundCloud';frame.loading='lazy';frame.setAttribute('allow','autoplay');
  frame.referrerPolicy='strict-origin-when-cross-origin';frame.setAttribute('scrolling','no');return frame;
}
function element(tag,cl,txt){let n=document.createElement(tag);if(cl)n.className=cl;if(txt!=null)n.textContent=String(txt);return n}
function actionButton(title,callback){const b=element('button','',title);b.type='button';b.addEventListener('click',callback);return b}
function usableMedia(){return state.media.filter(i=>i && i.published!==false && i.title && validURL(i.url) && ['video','audio'].includes(i.type) && (i.type!=='video'||youtubeId(i.url)||/\.(mp4|webm)(\?|$)/i.test(i.url))).sort((a,b)=>(Number(a.order)||999)-(Number(b.order)||999))}
function mediaOpen(item){
 const url=validURL(item.url),id=youtubeId(url);if(!url)return;
 const modal=$('#media-modal'),body=$('#modal-content');state.opener=document.activeElement;body.replaceChildren();
 $('#modal-title').textContent=item.title||'Ouvir trabalho';$('#modal-external').href=url;
 let node;
 if(item.type==='audio'&&soundcloudEmbedURL(url))node=soundcloudPlayer(url,item.title);
 else if(item.type==='audio'){node=document.createElement('audio');node.src=url;node.controls=true;node.preload='none'}
 else if(id){node=document.createElement('iframe');node.src=`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;node.title=item.title||'Vídeo';node.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';node.allowFullscreen=true;node.referrerPolicy='strict-origin-when-cross-origin'}
 else{node=document.createElement('video');node.src=url;node.controls=true;node.autoplay=true}
 body.append(node);modal.setAttribute('aria-hidden','false');document.body.classList.add('has-modal');$('.close-modal').focus();notifyHeight();
}
function closeMedia(){const m=$('#media-modal');if(m.getAttribute('aria-hidden')==='true')return;m.setAttribute('aria-hidden','true');$('#modal-content').replaceChildren();document.body.classList.remove('has-modal');if(state.opener?.focus)state.opener.focus();notifyHeight()}
function picture(item){const id=youtubeId(item.url);const value=validURL(item.cover||'');if(value)return value;if(id)return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;return ''}
function createMediaCard(item){const card=element('article','media-card');const cover=element('button','media-cover');cover.dataset.category=item.category||'outros';cover.type='button';cover.setAttribute('aria-label',`Reproduzir ${item.title}`);const img=picture(item);if(img){const im=document.createElement('img');im.src=img;im.loading='lazy';im.alt=`Capa de ${item.title}`;im.addEventListener('error',()=>{im.remove();cover.classList.add('has-fallback')});cover.append(im)}else{cover.style.background='linear-gradient(125deg,#75c7c0,#f2ba78)'}cover.append(element('span','poster-fallback',labels[item.category]||'TRABALHO'),element('span','shade'),element('span','media-play',item.type==='audio'?'♫':'▶'),element('span','media-type',labels[item.category]||'Trabalho'));cover.addEventListener('click',()=>mediaOpen(item));const info=element('div','media-info');info.append(element('strong','',item.title),element('small','',item.type==='audio'?'ÁUDIO':'VÍDEO'));card.append(cover,info);return card}
function renderReel(){const i=usableMedia().find(x=>x.category==='reel')||usableMedia().find(x=>x.type==='video');const area=$('#reel-feature'),button=$('#reel-launch');if(!i){area.replaceChildren(element('p','', 'Portfólio em atualização.'));button.disabled=true;return}const b=element('button','');b.type='button';b.setAttribute('aria-label','Assistir '+i.title);const img=picture(i);if(img){const el=document.createElement('img');el.src=img;el.alt='Capa do reel de 2026';el.loading='eager';el.addEventListener('error',()=>{el.remove();b.classList.add('has-fallback')});b.append(el)}b.append(element('span','reel-fallback','REEL 2026'),element('span','reel-play','▶'),element('span','reel-label','REEL / PLAY'));b.addEventListener('click',()=>mediaOpen(i));area.replaceChildren(b);button.disabled=false;button.onclick=()=>mediaOpen(i)}
function renderPortfolio(){const all=usableMedia().filter(x=>x.category!=='reel');const matches=all.filter(i=>state.filter==='all'||i.category===state.filter);const visible=state.expanded||state.filter!=='all'?matches:matches.slice(0,6);const grid=$('#media-grid');grid.replaceChildren(...visible.map(createMediaCard));if(!visible.length){const p=element('p','audio-empty','Nenhuma amostra publicada nesta categoria.');p.style.gridColumn='1/-1';grid.append(p)}$('#portfolio-count').textContent=`${visible.length} ${visible.length===1?'trabalho':'trabalhos'}`;const more=$('#show-more');more.hidden=state.expanded||state.filter!=='all'||matches.length<=6;document.querySelectorAll('.filter').forEach(b=>{const active=b.dataset.filter===state.filter;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});notifyHeight()}
function filterBy(f){if(!['all','tv','institucional','internet','caricata','eventos','audiolivros'].includes(f))return;state.filter=f;state.expanded=false;renderPortfolio()}
function renderCharacters(){const box=$('#character-list');const entries=usableMedia().filter(i=>i.category==='caricata').slice(0,3);box.replaceChildren(...entries.map(i=>{const btn=element('button','character-line');btn.type='button';btn.append(element('span','',i.type==='audio'?'♫':'▶'),element('span','',i.title),element('small','',''));btn.append(element('small','','OUVIR ↗'));btn.addEventListener('click',()=>mediaOpen(i));return btn}));}
function renderAudio(){
 const list=$('#audio-list');
 const audio=usableMedia().filter(i=>i.type==='audio' && i.category==='audiolivros');
 const cards=[];
 audio.forEach((item,index)=>{
   const card=element('article','audio-gallery-card');
   const head=element('div','audio-gallery-card-head');
   const no=element('span','audio-gallery-number',String(index+1).padStart(2,'0'));
   const title=element('h4','',item.title);
   head.append(no,title);
   card.append(head);
   if(item.description)card.append(element('p','audio-gallery-description',item.description));
   const player=soundcloudPlayer(item.url,item.title);
   if(player){
     // O player oficial do SoundCloud preserva a capa, a reprodução e os controles.
     card.append(player);
   }else{
     const native=document.createElement('audio');native.controls=true;native.preload='none';native.src=validURL(item.url);
     native.setAttribute('aria-label','Ouvir '+item.title);
     card.append(native);
   }
   cards.push(card);
 });
 // Na versão de testes exibimos seis espaços, sem fingir que as faixas ausentes existem.
 const filled=cards.length;
 const slots=Math.max(0,6-filled);
 for(let n=0;n<slots;n++){
   const card=element('article','audio-gallery-card audio-gallery-pending');
   const no=element('span','audio-gallery-number',String(filled+n+1).padStart(2,'0'));
   const head=element('div','audio-gallery-card-head');
   head.append(no,element('h4','',`Amostra ${String(filled+n+1).padStart(2,'0')}`));
   const pending=element('div','audio-gallery-placeholder');
   pending.append(element('span','audio-placeholder-icon','♫'),element('span','', 'Espaço reservado para uma nova amostra'));
   card.append(head,pending);
   cards.push(card);
 }
 list.replaceChildren(...cards);
 notifyHeight();
}
function renderEvents(){const box=$('#event-list');box.replaceChildren(...usableMedia().filter(i=>i.category==='eventos').slice(0,3).map(i=>{const b=actionButton('▶   '+i.title,()=>mediaOpen(i));return b}));}
function renderTraining(){const box=$('#training-catalog');const product=state.products.filter(x=>x && x.published!==false && x.title && validURL(x.url)).sort((a,b)=>(Number(a.order)||999)-(Number(b.order)||999));box.replaceChildren(...product.map((i,index)=>{const article=element('article','training-card');const glyph=element('div','product-glyph',i.kind==='ebook'?'▤':i.kind==='curso'?'✧':'♫');glyph.setAttribute('aria-hidden','true');const content=element('div');content.append(element('h3','',i.title),element('p','',i.description||''));const link=element('a','',`${i.label||'Conhecer'} ↗`);link.href=validURL(i.url);link.target='_blank';link.rel='noopener noreferrer';content.append(link);article.append(glyph,content);return article}));if(!product.length)box.replaceChildren(element('p','audio-empty','Novos cursos e publicações em breve.'));notifyHeight()}
function renderAll(){renderReel();renderPortfolio();renderCharacters();renderAudio();renderEvents();renderTraining()}
const nav=$('#nav-menu'),menu=$('.menu-button');menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')==='true';menu.setAttribute('aria-expanded',String(!open));menu.setAttribute('aria-label',open?'Abrir navegação':'Fechar navegação');nav.classList.toggle('open',!open)});document.querySelectorAll('.nav a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu?.setAttribute('aria-expanded','false')}));
document.querySelectorAll('.filter').forEach(b=>b.addEventListener('click',()=>filterBy(b.dataset.filter)));$('#show-more').addEventListener('click',()=>{state.expanded=true;renderPortfolio()});document.querySelectorAll('[data-filter-link]').forEach(a=>a.addEventListener('click',()=>filterBy(a.dataset.filterLink)));
$('.close-modal').addEventListener('click',closeMedia);$('.modal-scrim').addEventListener('click',closeMedia);document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMedia();if($('#media-modal').getAttribute('aria-hidden')==='false'&&e.key==='Tab'){let items=[...$('#media-modal').querySelectorAll('button,a[href]')];if(e.shiftKey&&document.activeElement===items[0]){e.preventDefault();items.at(-1).focus()}if(!e.shiftKey&&document.activeElement===items.at(-1)){e.preventDefault();items[0].focus()}}});
$('#current-year').textContent=new Date().getFullYear();
// Integração com o CMS do Wix Studio via Velo. Consulte wix/GUIA-WIX.md.
let trustedParentOrigin='';try{if(document.referrer)trustedParentOrigin=new URL(document.referrer).origin}catch{}
function notifyParent(payload){if(window.parent!==window && trustedParentOrigin && /^https:\/\//.test(trustedParentOrigin))window.parent.postMessage(payload,trustedParentOrigin)}
let lastHeight=0;function notifyHeight(){const height=Math.ceil(Math.max(document.body.scrollHeight,document.documentElement.scrollHeight));if(Math.abs(height-lastHeight)>4){lastHeight=height;notifyParent({type:'VP_HEIGHT',height})}}
window.addEventListener('message',event=>{const origin=event.origin;let fromWix=false;try{const host=new URL(origin).hostname;fromWix=host==='vozprofissional.com'||host.endsWith('.vozprofissional.com')||host==='wix.com'||host.endsWith('.wix.com')||host.endsWith('.wixsite.com')||host.endsWith('.wixstudio.com')}catch{}if(!fromWix)return;const data=event.data;if(!data||data.type!=='VP_CMS_DATA')return;trustedParentOrigin=origin;if(Array.isArray(data.media)&&data.media.length)state.media=data.media;if(Array.isArray(data.products)&&data.products.length)state.products=data.products;renderAll();notifyHeight()});
renderAll();notifyHeight();window.addEventListener('load',()=>{notifyParent({type:'VP_READY'});notifyHeight()});if(typeof ResizeObserver==='function'){new ResizeObserver(()=>notifyHeight()).observe(document.body)}
})();
