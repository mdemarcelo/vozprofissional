import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const join=(...parts)=>path.join(root,...parts);
const output=join('dist');
function readEntries(sub){
  const folder=join('content',sub);
  return fs.readdirSync(folder).filter(x=>x.endsWith('.json')).map(file=>{
    try {return JSON.parse(fs.readFileSync(path.join(folder,file),'utf8'));}
    catch(e){throw new Error(`${sub}/${file}: ${e.message}`)}
  });
}
function safeUrl(value){
  if(!value||typeof value!=='string')return '';
  if(/^\/media\/[\w.%\-/]+$/.test(value)&&!value.includes('..')&&!/%2e|%2f|%5c/i.test(value))return value;
  try{return new URL(value).protocol==='https:'?value:''}catch{return ''}
}
function cleanMedia(entry,i){
 const title=String(entry.title||'').trim();
 const category=String(entry.category||'outros');
 const type=entry.type==='audio'?'audio':'video';
 const url=safeUrl((type==='audio'&&entry.audioFile)||entry.url);
 if(!title||!url){if(entry.published!==false)console.warn(`Aviso: mídia ${i} sem título ou URL válido; será omitida`);return null;}
 if(!['reel','tv','institucional','internet','caricata','eventos','audiolivros','outros'].includes(category))throw new Error(`Categoria inválida: ${category}`);
 return {title,category,type,url,cover:safeUrl(entry.cover),description:String(entry.description||''),order:Number(entry.order)||999,featured:!!entry.featured,published:entry.published!==false};
}
function cleanProduct(e,i){
 const url=safeUrl(e.url);if(!e.title||!url){if(e.published!==false)console.warn(`Aviso: treinamento ${i} sem URL válido; será omitido`);return null;}
 return {title:String(e.title),kind:['curso','workshop','ebook'].includes(e.kind)?e.kind:'curso',description:String(e.description||''),url,label:String(e.label||'Saiba mais'),order:Number(e.order)||999,published:e.published!==false};
}
const media=readEntries('midias').map(cleanMedia).filter(Boolean).sort((a,b)=>a.order-b.order);
const products=readEntries('treinamentos').map(cleanProduct).filter(Boolean).sort((a,b)=>a.order-b.order);
fs.rmSync(output,{recursive:true,force:true});fs.mkdirSync(output,{recursive:true});
fs.cpSync(join('site'),output,{recursive:true});
fs.cpSync(join('media'),path.join(output,'media'),{recursive:true});
const js=`// Gerado automaticamente. Atualize os trabalhos em app.pagescms.org, não este arquivo.\nwindow.VP_INITIAL_MEDIA = ${JSON.stringify(media,null,2)};\nwindow.VP_INITIAL_PRODUCTS = ${JSON.stringify(products,null,2)};\n`;
fs.writeFileSync(path.join(output,'assets','content.js'),js,'utf8');
const htmlFile=path.join(output,'index.html');
let page=fs.readFileSync(htmlFile,'utf8');
const staging=process.env.SITE_MODE!=='production';
page=page.replace('<!-- SITE_ROBOTS_MODE -->',staging?'<meta name="robots" content="noindex,nofollow">':'<meta name="robots" content="index,follow">');
fs.writeFileSync(htmlFile,page);
console.log(`Site gerado em dist/ • ${media.filter(x=>x.published).length} mídias e ${products.filter(x=>x.published).length} treinamentos • ${staging?'TESTE (noindex)':'PRODUÇÃO (index)'}`);
