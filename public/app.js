import { language, setLanguage, t } from './i18n.js';
import { mergeOrder, moveBefore } from './order.js';
import { applicationLink, handshakeApplicationLink } from './referrals.js';
const $ = id => document.getElementById(id);
const orderKey='nexusia.column-order.v1';
let savedOrder = [], dragging = null;
const columnScroll = new Map();
try {
  const stored=JSON.parse(localStorage.getItem(orderKey) || '[]');
  if(Array.isArray(stored) && stored.every(name=>typeof name==='string')) savedOrder=stored;
} catch { /* A organização continua disponível nesta sessão. */ }
function saveOrder() {
  try { localStorage.setItem(orderKey,JSON.stringify(savedOrder)); $('order-status').textContent=t('Ordem salva neste navegador.'); }
  catch { $('order-status').textContent=t('Ordem alterada nesta sessão. O navegador não permitiu salvar.'); }
}
function columnOrder() { return mergeOrder(savedOrder, platforms.map(p=>p.name)); }
function moveColumn(name, offset) {
  const order=columnOrder(), index=order.indexOf(name), target=index+offset;
  if(target<0 || target>=order.length) return;
  [order[index],order[target]]=[order[target],order[index]];
  savedOrder=order; saveOrder(); render();
  const column=[...$('jobs').children].find(el=>el.dataset.platform===name);
  column?.querySelector('.column-handle')?.focus();
  column?.scrollIntoView({block:'nearest',inline:'nearest'});
}
function decorateColumn(column,heading,name) {
  column.dataset.platform=name;
  const header=element('div','','column-header');
  const handle=element('button','⠿','column-handle'); handle.type='button'; handle.draggable=true;
  handle.setAttribute('aria-label',t('Arrastar coluna')+' '+t(name));
  handle.title=t('Arraste a coluna ou use as setas para mover');
  handle.addEventListener('keydown',event=>{
    if(event.key==='ArrowLeft' || event.key==='ArrowRight') { event.preventDefault(); moveColumn(name,event.key==='ArrowLeft'?-1:1); }
  });
  header.append(handle,heading);
  const order=columnOrder(), index=order.indexOf(name);
  for(const [label,offset] of [['←',-1],['→',1]]) {
    const button=element('button',label,'column-move'); button.type='button';
    button.setAttribute('aria-label',t(offset<0?'Mover coluna para a esquerda':'Mover coluna para a direita')+' '+t(name));
    button.disabled=index+offset<0 || index+offset>=order.length;
    button.addEventListener('click',()=>moveColumn(name,offset)); header.append(button);
  }
  column.append(header);
  handle.addEventListener('dragstart',event=>{
    dragging=name; event.dataTransfer.setData('text/plain',name); event.dataTransfer.effectAllowed='move'; column.classList.add('dragging');
  });
  const clear=()=>{dragging=null; document.querySelectorAll('.column.dragging,.column.drop-target').forEach(el=>el.classList.remove('dragging','drop-target'));};
  handle.addEventListener('dragend',clear);
  column.addEventListener('dragover',event=>{
    if(!dragging || dragging===name) return;
    event.preventDefault(); event.dataTransfer.dropEffect='move'; column.classList.add('drop-target');
    const board=$('jobs'), bounds=board.getBoundingClientRect();
    if(event.clientX<bounds.left+50) board.scrollLeft-=25;
    if(event.clientX>bounds.right-50) board.scrollLeft+=25;
  });
  column.addEventListener('dragleave',event=>{if(!column.contains(event.relatedTarget)) column.classList.remove('drop-target');});
  column.addEventListener('drop',event=>{
    if(!dragging) return;
    event.preventDefault();
    if(dragging!==name) {
      const order=columnOrder(), bounds=column.getBoundingClientRect();
      const after=event.clientX>bounds.left+bounds.width/2;
      const remaining=order.filter(p=>p!==dragging);
      const next=after?remaining[remaining.indexOf(name)+1]:name;
      savedOrder=next?moveBefore(order,dragging,next):[...remaining,dragging];
      saveOrder(); clear(); render();
    } else clear();
  });
}
const platforms = [
  {name:'micro1',color:'#199e7c'},
  {name:'SuperAnnotate',color:'#d9562c'},
  {name:'Ethos AI',color:'#0795b1'},
  {name:'AfterQuery',color:'#df217d'},
  {name:'Handshake AI',color:'#a7db83',ink:'#203b19'},
  {name:'Mercor',color:'#6650b8'},
  {name:'Turing',color:'#36475d'},
  {name:'Outlier',color:'#9b4328'},
  {name:'Vetto',color:'#a73462'},
  {name:'Telus',color:'#4b287d'},
  {name:'Alignerr',color:'#267149'},
  {name:'Terac',color:'#176b85'},
  {name:'Outros',color:'#626b78',companies:['Revelo','G2i','Cocient','Torc','Strider']}
];
let updatedAt = null, loadFailed = false;
let jobs = [], referral, handshakeReferral, otherPlatforms = {}, selected = '', loaded = false;
const element = (tag,text,className) => { const el=document.createElement(tag); el.textContent=text; if(className) el.className=className; return el; };
const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function render() {
  if (!loaded) return;
  for(const column of $('jobs').children) { const list=column.querySelector('.cards'); if(list) columnScroll.set(column.dataset.platform,list.scrollTop); }
  const query=normalize($('search').value.trim());
  const filtered=jobs.filter(j => normalize(`${j.title} ${j.skills.join(' ')} ${j.location}`).includes(query) && (!selected || j.platform===selected));
  $('count').textContent=`${filtered.length} ${t('vagas')}`;
  const visible=columnOrder().map(name=>platforms.find(p=>p.name===name)).filter(p => !selected || p.name===selected);
  $('jobs').style.setProperty('--columns', visible.length);
  $('jobs').replaceChildren();
  for(const p of visible) {
    const matches=filtered.filter(j => j.platform===p.name);
    const column=element('section','','column'); column.style.setProperty('--accent',p.color); column.style.setProperty('--accent-ink',p.ink || '#fff');
    const companies=p.companies?.filter(name=>normalize(name).includes(query));
    const heading=element('h2',t(p.name)); heading.append(element('span',companies ? `${companies.length} ${t('plataformas')}` : String(matches.length),'badge')); decorateColumn(column,heading,p.name);
    const cards=element('div','','cards'); cards.tabIndex=0; cards.setAttribute('role','region'); cards.setAttribute('aria-label',t('Vagas por plataforma')+' — '+t(p.name));
    if(companies) {
      for(const name of companies) {
        const card=element('article','','job'), top=element('div','','job-top');
        card.dataset.cardId=`company:${name}`;
        const destination=otherPlatforms[name];
        const button=element(destination?.url?'a':'button',t('Candidatar-se ↗'),destination?.url?'':'apply-pending');
        if(destination?.url) {
          button.href=destination.url; button.target='_blank';
          button.rel=destination.referral?'sponsored noopener':'noopener';
          button.setAttribute('aria-label',`${t('Candidatar-se ↗')} — ${name} (${t('abre em nova aba')})`);
        } else {
          button.type='button'; button.disabled=true;
          button.title=`${t('Link público de candidatura')} — ${name}: ${t('ainda não configurado')}`;
          button.setAttribute('aria-label',`${t('Candidatar-se ↗')} — ${name}: ${t('link pendente')}`);
        }
        top.append(element('h3',name),button);
        card.append(top,element('p',t(destination?.description || 'Link de candidatura pendente'),'meta'));
        cards.append(card);
      }
      if(!companies.length) cards.append(element('p',t('Nenhuma plataforma encontrada para esta busca.'),'empty'));
      column.append(cards); $('jobs').append(column); cards.scrollTop=columnScroll.get(p.name)||0; continue;
    }
    for(const j of matches) {
      const card=element('article','','job'), top=element('div','','job-top');
      card.dataset.cardId=`job:${p.name}:${j.id}`;
      top.append(element('h3',j.title));
      if(p.name==='micro1') {
        const link=element('a',j.referralUrl?t('Candidatar-se ↗'):t('Ver vagas ↗')); link.href=applicationLink(j,referral); link.target='_blank'; link.rel='sponsored noopener'; link.title=j.referralUrl?`${t('Candidatar-se ↗')} — ${j.title}`:`${t('Abrir catálogo geral da micro1 e buscar:')} ${j.title}`; top.append(link);
      }
      if(p.name==='Mercor') {
        const url=new URL(j.sourceUrl);
        if(url.protocol==='https:' && url.hostname==='work.mercor.com') {
          const link=element('a',t('Candidatar-se ↗')); link.href=j.sourceUrl; link.target='_blank'; link.rel='noopener'; top.append(link);
        }
      }
      if(p.name==='Handshake AI') {
        const link=element('a',t('Candidatar-se ↗'));
        link.href=handshakeApplicationLink(j,handshakeReferral); link.target='_blank'; link.rel='sponsored noopener';
        top.append(link);
      }
      const meta=element('p','','meta');
      const arrangement=j.workArrangement==='onsite'?'Presencial':j.workArrangement==='hybrid'?'Híbrido':'Remoto';
      const location=element('span',`📍 ${t(arrangement)}`);
      location.title=t('Confira a modalidade, a localização e a elegibilidade na plataforma.');
      meta.append(location);
      if(j.compensation) meta.append(element('span',j.compensation,'pay'));
      else if(p.name==='Handshake AI') meta.append(element('span',t('Remuneração: consulte a plataforma')));
      card.append(top,meta);
      if(p.name==='micro1' && !j.referralUrl) card.append(element('p',t('Abre o catálogo geral. Busque o título desta vaga na micro1.'),'meta'));
      if(p.name==='Handshake AI' && j.referralScope==='general') card.append(element('p',t('Link geral de indicação. A plataforma direciona você conforme seu perfil.'),'meta'));
      cards.append(card);
    }
    if(!matches.length) {
      const empty=element('div','','empty');
      const hasData=jobs.some(j=>j.platform===p.name);
      empty.append(element('strong',hasData?t('Nenhum resultado'):p.name==='micro1'?t('Catálogo em preparação'):t('Em breve')));
      empty.append(element('span',hasData?t('Tente outra busca.'):p.name==='micro1'?t('As vagas aparecerão após a primeira importação verificada. Você já pode explorar a micro1 pelo link no topo.'):t('As vagas e o link de indicação desta plataforma ainda não foram conectados.')));
      cards.append(empty);
    }
    column.append(cards); $('jobs').append(column); cards.scrollTop=columnScroll.get(p.name)||0;
  }
}
function navigation() {
  $('platforms').replaceChildren();
  for(const p of [{name:'Todas',color:'#171916'},...platforms]) {
    const value=p.name==='Todas'?'':p.name;
    const button=element('button',t(p.name)); button.type='button'; button.style.setProperty('--accent',p.color); button.style.setProperty('--accent-ink',p.ink || '#fff'); button.setAttribute('aria-pressed',String(selected===value));
    button.addEventListener('click',()=>{selected=value; for(const sibling of $('platforms').children) sibling.setAttribute('aria-pressed','false'); button.setAttribute('aria-pressed','true'); render();});
    $('platforms').append(button);
  }
}
navigation();
const organization=element('div','','organization');
const orderStatus=element('span',t('Organize as colunas: arraste pelo ⠿ ou use ← →.'));
orderStatus.id='order-status'; orderStatus.setAttribute('role','status');
const resetOrder=element('button',t('Restaurar ordem')); resetOrder.type='button';
resetOrder.addEventListener('click',()=>{savedOrder=[]; saveOrder(); render();});
organization.append(orderStatus,resetOrder); $('jobs').before(organization);
try {
  const responses=await Promise.all([fetch('config.json'),fetch('jobs.json')]);
  if(responses.some(r=>!r.ok)) throw new Error('Falha ao carregar');
  const [config,data]=await Promise.all(responses.map(r=>r.json()));
  const url=new URL(config.micro1Referral);
  if(url.protocol!=='https:' || url.hostname!=='refer.micro1.ai') throw new Error('Destino inválido');
  referral=config.micro1Referral;
  handshakeReferral=config.handshakeReferral;
  otherPlatforms=config.otherPlatforms || {};
  for(const destination of Object.values(otherPlatforms)) {
    if(destination.url && new URL(destination.url).protocol!=='https:') throw new Error('Destino inválido');
  }
  document.querySelectorAll('.referral').forEach(a=>{a.href=referral; a.hidden=false;});
  jobs=data.jobs;
  for(const p of [{name:'Total'},...platforms]) {
    if(p.companies) continue;
    const total=element('div','','total'); total.append(element('strong',String(p.name==='Total'?jobs.length:jobs.filter(j=>j.platform===p.name).length)),element('small',p.name)); $('totals').append(total);
  }
  updatedAt=data.updatedAt; updateFreshness();
  loaded=true; render();
} catch {
  loadFailed=true;
  $('freshness').textContent=t('Não foi possível carregar os dados.');
  $('count').textContent=t('Indisponível');
  $('jobs').append(element('p',t('Não foi possível carregar o catálogo. Recarregue a página para tentar novamente.'),'error'));
}
$('search').addEventListener('input',render);

function updateFreshness() {
  $('freshness').textContent=loadFailed?t('Não foi possível carregar os dados.'):updatedAt?
    (Date.now()-Date.parse(updatedAt)>36*3600000?t('Dados possivelmente desatualizados · '):'')+t('Última sincronização:')+' '+new Date(updatedAt).toLocaleString(language==='en'?'en-US':'pt-BR'):t('Primeira sincronização pendente');
}
function applyLanguage() {
  document.documentElement.lang=language==='en'?'en':'pt-BR';
  document.title=t('NexusIA — mural de vagas');
  document.querySelector('meta[name="description"]').content=t('Oportunidades em IA organizadas por plataforma.');
  document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));
  document.querySelectorAll('[data-i18n-label]').forEach(el=>el.setAttribute('aria-label',t(el.dataset.i18nLabel)));
  $('search').placeholder=t('Busque por cargo ou habilidade…');
  orderStatus.textContent=t('Organize as colunas: arraste pelo ⠿ ou use ← →.');
  resetOrder.textContent=t('Restaurar ordem');
  $('language-toggle').textContent=language==='en'?'Português':'English';
  $('language-toggle').lang=language==='en'?'pt-BR':'en';
  $('language-toggle').setAttribute('aria-label',language==='en'?'Switch to Portuguese':'Mudar para inglês');
  navigation(); updateFreshness(); render();
  if(loadFailed) {
    $('count').textContent=t('Indisponível');
    $('jobs').replaceChildren(element('p',t('Não foi possível carregar o catálogo. Recarregue a página para tentar novamente.'),'error'));
  }
}
$('language-toggle').addEventListener('click',()=>{setLanguage(language==='en'?'pt':'en');applyLanguage();});
applyLanguage();
