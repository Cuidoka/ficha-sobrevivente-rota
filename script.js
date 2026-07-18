(function(){
  'use strict';

  var DATA = window.ROOTS_DATA;
  if(!DATA){ throw new Error('ROOTS_DATA não foi carregado.'); }

  var STORAGE_KEY = 'roots-survivor-state-v3';
  var LEGACY_STORAGE_KEY = 'survivor-sheet-state-v2';
  var LEGACY_NOTES_KEY = 'survivor-notes-state-v2';
  var saveTimer = null;
  var model = loadModel();

  function $(selector, root){ return (root || document).querySelector(selector); }
  function $$(selector, root){ return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }
  function clamp(value, min, max){ return Math.max(min, Math.min(max, Number(value) || 0)); }
  function uid(prefix){ return prefix + '-' + Date.now() + '-' + Math.floor(Math.random() * 100000); }
  function escapeHtml(value){
    return String(value == null ? '' : value)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }
  function clone(value){ return JSON.parse(JSON.stringify(value)); }
  function isObject(value){ return value && typeof value === 'object' && !Array.isArray(value); }
  function mergeModel(base, saved){
    if(!isObject(saved)) return base;
    Object.keys(saved).forEach(function(key){
      if(isObject(saved[key]) && isObject(base[key])) mergeModel(base[key], saved[key]);
      else base[key] = clone(saved[key]);
    });
    return base;
  }

  function defaultNotes(){
    return {
      selectedNotebookId:'notebook-history',
      notebooks:[
        { id:'notebook-history', title:'História Principal', notes:[{ id:'note-summary', title:'Resumo', content:'' }] },
        { id:'notebook-missions', title:'Anotações de Missões', notes:[{ id:'note-objectives', title:'Objetivos', content:'' }] }
      ]
    };
  }

  function defaultModel(){
    var skillValues = {};
    Object.keys(DATA.skills).forEach(function(attribute){
      DATA.skills[attribute].forEach(function(skill){ skillValues[skill] = 1; });
    });
    var resources = {};
    DATA.resources.forEach(function(resource){ resources[resource] = 0; });
    var armor = {};
    DATA.armors.forEach(function(item){ armor[item.id] = { equipped:false, remaining:0 }; });
    return {
      version:3,
      updatedAt:null,
      fields:{
        registro:'', 'nome-sobrevivente':'', jogador:'', idade:'', sangue:'velho',
        'origem-select':'', 'ocupacao-select':'', 'reputacao-select':'',
        'flor-select':'', 'pulseira-select':'Verde', 'ponto-partida':'',
        'grupo-estrada':'', 'attr-bonus-manual':0, 'pp-bonus-manual':0,
        'prodigio-skill-1':'', 'prodigio-skill-2':'', 'abutre-resource':'',
        'history-before':'', 'history-loss':'', 'history-purpose':'',
        'history-fear':'', 'history-bonds':'', 'growth-stage':0
      },
      attributes:{ Físico:1, Destreza:1, Intelecto:1, Instinto:1, Espírito:1 },
      skills:skillValues,
      originSkills:[],
      originPowers:[],
      health:{ pf:0, pe:0, permanentPf:0, permanentPe:0 },
      pc:0,
      corruptionFilters:[],
      wounds:{},
      conditions:[],
      characteristics:{ vantagens:['',''], desvantagens:[''], cicatrizes:[''] },
      pains:[{checked:false,text:''},{checked:false,text:''},{checked:false,text:''}],
      inventory:[],
      weapons:[emptyWeapon(), emptyWeapon()],
      armor:armor,
      resources:resources,
      parts:0,
      knownRecipes:[],
      allowCampaignRecipes:false,
      rest:{ scenes:0, actions:[{type:'',note:''},{type:'',note:''}] },
      notes:defaultNotes(),
      ui:{ activePage:'principal', lastRoll:null, filterMode:'', editingInventoryWeaponId:'' }
    };
  }

  function emptyWeapon(){
    return { weaponId:'', current:0, mods:[], notes:'', customName:'', customDamage:'', customRange:'', customMax:0 };
  }

  function loadModel(){
    var base = defaultModel();
    try{
      var raw = localStorage.getItem(STORAGE_KEY);
      if(raw){ return normalizeModel(mergeModel(base, JSON.parse(raw))); }
      var legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if(legacyRaw){ return normalizeModel(migrateLegacy(JSON.parse(legacyRaw), base)); }
      var notesRaw = localStorage.getItem(LEGACY_NOTES_KEY);
      if(notesRaw){ base.notes = JSON.parse(notesRaw); }
    } catch(error){ console.warn('Não foi possível restaurar a ficha.', error); }
    return normalizeModel(base);
  }

  function normalizeModel(value){
    var base = mergeModel(defaultModel(), value || {});
    base.version = 3;
    if(!Array.isArray(base.weapons)) base.weapons = [emptyWeapon(), emptyWeapon()];
    while(base.weapons.length < 2) base.weapons.push(emptyWeapon());
    if(!Array.isArray(base.inventory)) base.inventory = [];
    base.inventory = base.inventory.map(function(entry){
      if(entry && entry.kind === 'weapon' && entry.weapon) return {id:entry.id || uid('weapon-item'),kind:'weapon',weapon:mergeModel(emptyWeapon(),entry.weapon)};
      return { id:entry && entry.id || uid('item'), kind:'item', name:String(entry && entry.name || ''), uses:String(entry && entry.uses || '') };
    });
    if(!Array.isArray(base.originSkills)) base.originSkills = [];
    if(!Array.isArray(base.originPowers)) base.originPowers = [];
    if(!Array.isArray(base.knownRecipes)) base.knownRecipes = [];
    if(!Array.isArray(base.conditions)) base.conditions = [];
    if(!Array.isArray(base.corruptionFilters)) base.corruptionFilters = [];
    base.corruptionFilters = base.corruptionFilters.filter(function(key){ return typeof key === 'string'; });
    if(!base.rest || !Array.isArray(base.rest.actions)) base.rest = {scenes:0,actions:[{type:'',note:''},{type:'',note:''}]};
    base.rest.scenes = clamp(base.rest.scenes,0,8);
    while(base.rest.actions.length < 2) base.rest.actions.push({type:'',note:''});
    base.rest.actions = base.rest.actions.map(function(action){
      return { type:String(action && action.type || ''), note:String(action && action.note || '') };
    });
    if(!base.ui) base.ui = {activePage:'principal',lastRoll:null,filterMode:'',editingInventoryWeaponId:''};
    if(typeof base.ui.filterMode !== 'string') base.ui.filterMode = '';
    if(typeof base.ui.editingInventoryWeaponId !== 'string') base.ui.editingInventoryWeaponId = '';
    if(base.ui.editingInventoryWeaponId && !base.inventory.some(function(item){ return item.id === base.ui.editingInventoryWeaponId && item.kind === 'weapon'; })) base.ui.editingInventoryWeaponId = '';
    if(!base.notes || !Array.isArray(base.notes.notebooks) || !base.notes.notebooks.length) base.notes = defaultNotes();
    if(!base.notes.selectedNotebookId || !base.notes.notebooks.some(function(nb){ return nb.id === base.notes.selectedNotebookId; })){
      base.notes.selectedNotebookId = base.notes.notebooks[0].id;
    }
    DATA.resources.forEach(function(name){ if(base.resources[name] == null) base.resources[name] = 0; });
    DATA.armors.forEach(function(item){
      if(!base.armor[item.id]) base.armor[item.id] = { equipped:false, remaining:0 };
    });
    return base;
  }

  function migrateLegacy(snapshot, base){
    if(!snapshot) return base;
    var fields = snapshot.formValues || [];
    var fieldMap = {
      0:'registro', 1:'nome-sobrevivente', 2:'jogador', 3:'idade', 4:'sangue',
      5:'origem-select', 6:'ocupacao-select', 7:'reputacao-select', 8:'flor-select',
      9:'pulseira-select', 10:'ponto-partida', 11:'grupo-estrada',
      12:'attr-bonus-manual', 17:'pp-bonus-manual'
    };
    Object.keys(fieldMap).forEach(function(index){
      if(fields[index] != null) base.fields[fieldMap[index]] = fields[index];
    });
    var characterStart = 18;
    base.characteristics.vantagens = fields.slice(characterStart, characterStart + 5).filter(Boolean);
    base.characteristics.desvantagens = fields.slice(characterStart + 5, characterStart + 10).filter(Boolean);
    base.characteristics.cicatrizes = fields.slice(characterStart + 10, characterStart + 15).filter(Boolean);
    if(!base.characteristics.vantagens.length) base.characteristics.vantagens = ['',''];
    if(!base.characteristics.desvantagens.length) base.characteristics.desvantagens = [''];
    if(!base.characteristics.cicatrizes.length) base.characteristics.cicatrizes = [''];
    base.inventory = fields.slice(33, 41).filter(Boolean).map(function(name){ return { id:uid('item'), name:name, uses:'' }; });
    if(fields[41]){
      base.weapons[0] = { weaponId:'custom', current:parseInt(fields[44],10) || 0, mods:[], notes:'', customName:fields[41], customDamage:fields[42] || '', customRange:fields[43] || '', customMax:parseInt(fields[44],10) || 0 };
    }
    if(fields[45]){
      base.weapons[1] = { weaponId:'custom', current:0, mods:[], notes:'Recuo: ' + (fields[48] || ''), customName:fields[45], customDamage:'Munição: ' + (fields[46] || ''), customRange:fields[47] || '', customMax:0 };
    }
    for(var painIndex=0; painIndex<3; painIndex++){
      base.pains[painIndex].text = fields[49 + painIndex] || '';
      base.pains[painIndex].checked = snapshot.dorStates && snapshot.dorStates[painIndex] === '1';
    }
    (snapshot.pipStates || []).forEach(function(pip, index){
      var value = parseInt(pip.value || '0', 10) || 0;
      var attributeMap = { 'attr-fisico':'Físico', 'attr-destreza':'Destreza', 'attr-intelecto':'Intelecto', 'attr-instinto':'Instinto', 'attr-espirito':'Espírito' };
      if(attributeMap[pip.id]) base.attributes[attributeMap[pip.id]] = value;
      if(pip.id === 'pf-boxes') base.health.pf = value;
      if(pip.id === 'pe-boxes') base.health.pe = value;
      if(/^res-\d+$/.test(pip.id)){
        var resourceIndex = parseInt(pip.id.split('-')[1],10);
        if(DATA.resources[resourceIndex]) base.resources[DATA.resources[resourceIndex]] = value;
      }
      if(/^sk-\d+$/.test(pip.id)){
        var flatSkills = [];
        Object.keys(DATA.skills).forEach(function(attr){ flatSkills = flatSkills.concat(DATA.skills[attr]); });
        var skill = flatSkills[parseInt(pip.id.split('-')[1],10) - 1];
        if(skill){
          base.skills[skill] = value;
          if(pip.origin === '1') base.originSkills.push(skill);
        }
      }
    });
    base.pc = clamp(snapshot.pc, 0, 100);
    base.wounds = snapshot.zoneDetails || {};
    if(snapshot.notes) base.notes = snapshot.notes;
    return base;
  }

  function saveModel(immediate){
    if(saveTimer){ clearTimeout(saveTimer); saveTimer = null; }
    var write = function(){
      try{
        model.updatedAt = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(model));
        localStorage.setItem(LEGACY_NOTES_KEY, JSON.stringify(model.notes));
      } catch(error){ console.warn('Não foi possível salvar automaticamente.', error); }
    };
    if(immediate) write();
    else saveTimer = setTimeout(write, 180);
  }

  function buildTabs(){
    var sheet = $('#sheet');
    var footer = $('.footer', sheet);
    var mainNodes = [$('.doc-header'), $$('.row-2')[0], $('.diagram-section'), $('#skills-grid').closest('.section'), $('#vantagens-list').closest('.section')];
    var equipmentLegacy = $('#inv-grid').closest('.row-2');
    var painSection = $('#dores-list').closest('.section');
    var notesSection = $('#notes-canvas').closest('.section');
    var nav = document.createElement('nav');
    nav.className = 'sheet-tabs no-print';
    nav.setAttribute('role','tablist');
    nav.innerHTML = [
      ['principal','Ficha Principal'], ['equipamentos','Equipamentos'],
      ['historia','História & Anotações'], ['origem','Origem & Corrupção']
    ].map(function(item){
      return '<button type="button" class="sheet-tab" role="tab" data-page-target="'+item[0]+'">'+item[1]+'</button>';
    }).join('');
    sheet.insertBefore(nav, sheet.firstChild);

    var pages = {};
    ['principal','equipamentos','historia','origem'].forEach(function(name){
      var page = document.createElement('section');
      page.className = 'sheet-page';
      page.id = 'page-' + name;
      page.dataset.page = name;
      page.setAttribute('role','tabpanel');
      pages[name] = page;
      sheet.insertBefore(page, footer);
    });
    mainNodes.forEach(function(node){ if(node) pages.principal.appendChild(node); });
    if(equipmentLegacy){ equipmentLegacy.remove(); }
    if(painSection) pages.historia.appendChild(painSection);
    if(notesSection) pages.historia.appendChild(notesSection);
    buildMainEnhancements(pages.principal);
    buildEquipmentPage(pages.equipamentos);
    buildHistoryPage(pages.historia);
    buildOriginPage(pages.origem);
    activatePage(model.ui.activePage || 'principal');
  }

  function pageHeading(title, subtitle){
    return '<div class="page-heading"><div><span class="page-kicker">DOSSIÊ DE SOBREVIVENTE</span><h1>'+title+'</h1></div><p>'+subtitle+'</p></div>';
  }

  function modifierPicker(id, label){
    var dots = '';
    for(var value=1; value<=3; value++){
      dots += '<button type="button" class="modifier-option modifier-dot" data-modifier-input="'+id+'" data-value="'+value+'" aria-pressed="false" aria-label="'+label+' '+value+'"></button>';
    }
    return '<div class="modifier-control"><span>'+label+'</span><div class="modifier-picker">'+
      '<input id="'+id+'" class="modifier-number" type="number" min="0" max="3" step="1" value="0" inputmode="numeric" aria-label="Valor de '+label+'">'+
      '<div class="modifier-dots" role="group" aria-label="'+label+' de zero a três">'+dots+'</div>'+
      '</div></div>';
  }

  function setModifier(id, value){
    value = clamp(parseInt(value,10) || 0,0,3);
    var input = $('#' + id);
    if(!input) return;
    input.value = value;
    $$('[data-modifier-input="'+id+'"]').forEach(function(option){
      var filled = Number(option.dataset.value) <= value;
      var current = Number(option.dataset.value) === value;
      option.classList.toggle('filled',filled);
      option.classList.toggle('current',current);
      option.setAttribute('aria-pressed',filled ? 'true' : 'false');
    });
  }

  function buildMainEnhancements(page){
    var header = $('.doc-header', page);
    var dice = document.createElement('div');
    dice.className = 'section dice-section';
    dice.innerHTML = '<div class="section-title">Rolador de Testes <span class="tag">ATRIBUTO = DADOS · PERÍCIA = LIMITE</span></div>'+
      '<div class="section-body dice-layout">'+
        '<div class="dice-controls">'+
          '<label>Atributo<select id="roll-attribute"></select></label>'+
          '<label>Perícia<select id="roll-skill"></select></label>'+
          modifierPicker('roll-bonus','Bônus')+
          modifierPicker('roll-penalty','Penalidades')+
          '<label>NS exigido<select id="roll-target"><option value="0">Sem alvo</option><option value="1">Sofrido</option><option value="2">Gangrenado</option><option value="3">Dilacerante</option><option value="4">Profano</option><option value="5">Absoluto</option></select></label>'+
          '<label>Número escolhido (0 dados)<select id="roll-guess"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option></select></label>'+
        '</div>'+
        '<div class="dice-options">'+
          '<label class="check-line"><input type="checkbox" id="roll-plague"> Dado da Praga</label>'+
          '<label class="check-line hidden" id="roll-devotee-option"><input type="checkbox" id="roll-devotee"> Teste rolado contra o Devoto</label>'+
          '<label class="check-line"><input type="checkbox" id="roll-stress"> Apostar Estresse (+1 dado, +2 PE)</label>'+
          '<div class="dice-actions"><button type="button" class="notes-btn small" id="roll-reset-modifiers">Zerar modificadores</button><button type="button" class="primary-action" id="roll-button">Rolar dados</button></div>'+
        '</div>'+
        '<div class="dice-result" id="roll-result"><span>Escolha Atributo e Perícia para rolar.</span></div>'+
      '</div>';
    if(header && header.nextSibling) page.insertBefore(dice, header.nextSibling);
    else page.appendChild(dice);

    var conditionSection = document.createElement('div');
    conditionSection.className = 'section';
    conditionSection.innerHTML = '<div class="section-title">Condições Ativas <span class="tag">CORPO · MENTE · AMBIENTE</span></div>'+
      '<div class="section-body condition-shell"><div class="condition-add">'+
      '<select id="condition-select"><option value="">— Selecionar —</option></select>'+
      '<input id="condition-custom" type="text" placeholder="Condição personalizada">'+
      '<button type="button" class="notes-btn" id="condition-add-button">Adicionar</button></div>'+
      '<div class="condition-list" id="condition-list"></div></div>';
    var diagram = $('.diagram-section', page);
    if(diagram && diagram.nextSibling) page.insertBefore(conditionSection, diagram.nextSibling);
    else page.appendChild(conditionSection);

    var pfBlock = $('#pf-boxes').closest('.track-block');
    var peBlock = $('#pe-boxes').closest('.track-block');
    var permanentPf = document.createElement('label');
    permanentPf.className = 'permanent-control';
    permanentPf.innerHTML = 'PF permanentes <input id="pf-permanent" type="number" min="0" max="20" value="0">';
    pfBlock.appendChild(permanentPf);
    var permanentPe = document.createElement('label');
    permanentPe.className = 'permanent-control';
    permanentPe.innerHTML = 'PE permanentes <input id="pe-permanent" type="number" min="0" max="20" value="0">';
    peBlock.appendChild(permanentPe);
    var criticalAlert = document.createElement('div');
    criticalAlert.id = 'critical-state-alert';
    criticalAlert.className = 'critical-state-alert hidden';
    criticalAlert.setAttribute('role','alert');
    criticalAlert.setAttribute('aria-live','assertive');
    var resourcesList = pfBlock.closest('.resources-list');
    if(resourcesList) resourcesList.appendChild(criticalAlert);
  }

  function buildEquipmentPage(page){
    page.innerHTML = pageHeading('Equipamentos','Carga, armas, proteção e fabricação em uma página própria.')+
      '<div class="row-2 equipment-top">'+
        '<div class="section"><div class="section-title">Inventário <span class="tag" id="inventory-capacity-tag">MÁX. = 2 + FÍSICO</span></div><div class="section-body">'+
          '<div class="status-line"><span id="inventory-status"></span><span id="initial-items-status"></span></div>'+
          '<div class="inv-grid" id="inv-grid"></div><button type="button" class="add-inv-btn" id="add-inv-btn">+ Adicionar espaço sobrecarregado</button>'+
        '</div></div>'+
        '<div class="section"><div class="section-title">Espaços de Arma <span class="tag" id="weapon-slots-tag">2 EXCLUSIVOS</span></div><div class="section-body">'+
          '<div class="weapon-add-bar"><label>Catálogo oficial<select id="new-weapon-select">'+allWeaponOptions()+'</select></label><button type="button" class="notes-btn" id="add-weapon-button">Adicionar arma</button></div>'+
          '<p id="weapon-add-feedback" class="inline-feedback" aria-live="polite"></p><div id="weapons-list"></div></div></div>'+
      '</div>'+
      '<div class="row-2">'+
        '<div class="section"><div class="section-title">Armadura</div><div class="section-body"><div class="armor-grid" id="armor-list"></div></div></div>'+
        '<div class="section"><div class="section-title">Recursos & Partes</div><div class="section-body">'+
          '<div class="parts-control"><span>Partes</span><button type="button" data-parts-delta="-1">−</button><input id="parts-input" type="number" min="0" value="0"><button type="button" data-parts-delta="1">+</button></div>'+
          '<div class="weapon-card-title">Bolsa de Recursos (¼ de unidade)</div><div class="res-pips-grid" id="res-pips-grid"></div>'+
        '</div></div>'+
      '</div>'+
      '<div class="section"><div class="section-title">Receitas de Fabricação <span class="tag" id="recipe-limit-tag">CONHECIDAS = INTELECTO</span></div><div class="section-body">'+
        '<div class="recipe-toolbar"><span id="recipe-known-status"></span><label class="check-line"><input type="checkbox" id="allow-campaign-recipes"> Permitir receitas aprendidas durante a campanha</label></div>'+
        '<div class="recipe-grid" id="recipe-grid"></div></div></div>';
  }

  function buildHistoryPage(page){
    var background = document.createElement('div');
    background.className = 'section';
    background.innerHTML = '<div class="section-title">História do Sobrevivente <span class="tag">MEMÓRIA · PROPÓSITO · LAÇOS</span></div><div class="section-body history-grid">'+
      historyField('history-before','Quem você era antes?','Infância, profissão, comunidade e visão do mundo...')+
      historyField('history-loss','O que você perdeu?','Pessoas, lugares, certezas ou partes de si...')+
      historyField('history-purpose','O que mantém você na estrada?','Sobrevivência, redenção, vingança, esperança...')+
      historyField('history-fear','O que você mais teme?','O que não pode perder novamente?')+
      historyField('history-bonds','Laços e conflitos','Família, aliados, rivais, dívidas e promessas...')+
      '</div>';
    var campaignMeta = document.createElement('div');
    campaignMeta.className = 'section';
    campaignMeta.innerHTML = '<div class="section-title">Contexto da História</div><div class="section-body history-meta-grid">'+
      '<label>Ponto de Partida<input id="ponto-partida" type="text" placeholder="Onde tudo começou..."></label>'+
      '<label>Grupo / Estrada<input id="grupo-estrada" type="text" placeholder="Companheiros, rota ou campanha..."></label></div>';
    var rest = document.createElement('div');
    rest.className = 'section';
    rest.innerHTML = '<div class="section-title">Descanso & Recuperação <span class="tag">8 CENAS POR CICLO</span></div><div class="section-body rest-shell">'+
      '<div class="rest-scenes"><div><strong>Cenas descansadas</strong><span id="rest-scenes-readout">0/8</span></div><div class="rest-pips pips" id="rest-scenes-pips">'+pipButtons(8)+'</div><button type="button" class="notes-btn small" id="rest-clear-button">Limpar descanso</button></div>'+
      '<p class="rule-help">Ao completar 8 cenas de descanso no Ciclo, escolha duas ações de recuperação. O mesmo benefício não pode ser escolhido duas vezes; poderes podem conceder uma terceira ação.</p><div id="rest-actions" class="rest-actions"></div><div id="rest-warning" class="inline-feedback" aria-live="polite"></div></div>';
    page.insertBefore(rest, page.firstChild);
    page.insertBefore(background, page.firstChild);
    page.insertBefore(campaignMeta, page.firstChild);
    var heading = document.createElement('div');
    heading.innerHTML = pageHeading('História & Anotações','O que aconteceu, quem ficou e por que continuar.');
    page.insertBefore(heading.firstChild, page.firstChild);
  }

  function historyField(id, label, placeholder){
    return '<label class="history-field"><span>'+label+'</span><textarea id="'+id+'" placeholder="'+placeholder+'"></textarea></label>';
  }

  function buildOriginPage(page){
    page.innerHTML = pageHeading('Origem & Corrupção','Poderes, Ocupação, Crescimento e a marca da Praga.')+
      '<div class="row-2">'+
        '<div class="section"><div class="section-title">Poderes de Origem <span class="tag">TODOS OS PO DEVEM SER GASTOS</span></div><div class="section-body">'+
          '<div class="origin-overview" id="origin-overview"></div><div class="origin-budget" id="origin-budget"></div><div class="power-list" id="origin-power-list"></div>'+
        '</div></div>'+
        '<div class="section"><div class="section-title">Ocupação</div><div class="section-body"><div id="occupation-detail"></div></div></div>'+
      '</div>'+
      '<div class="section"><div class="section-title">Disseminação <span class="tag" id="plague-threshold-tag">DADO DA PRAGA: 1</span></div><div class="section-body">'+
        '<div class="corruption-overview" id="corruption-overview"></div><div class="corruption-effects" id="corruption-effects"></div>'+
        '<div class="blood-path" id="new-blood-panel"><div class="subsection-heading">Flor da Corrupção</div><div id="flower-overview"></div><div class="flower-stages" id="flower-stages"></div></div>'+
        '<div class="blood-path" id="old-blood-panel"><div class="subsection-heading">Filtro Corruptivo</div>'+filterControls()+'<div id="corruption-filter-picker"></div><div id="filter-result" class="rule-preview" aria-live="polite"></div></div>'+
      '</div></div>'+
      '<div class="section"><div class="section-title">Crescimento <span class="tag">TRILHA I–X</span></div><div class="section-body growth-row">'+
        '<label>Arquétipo<input id="growth-archetype" type="text" readonly></label><label>Etapa<select id="growth-stage"><option value="0">Ainda não iniciou</option>'+growthOptions()+'</select></label><div id="growth-summary" class="rule-preview"></div>'+
      '</div></div>';
  }

  function filterControls(){
    return '<p class="rule-help">Escolha como a Pulseira reduz o ganho de PC. A opção usada fica destacada; a seleção pode ser limpa sem alterar a ficha.</p><div class="filter-grid">'+
      '<div class="filter-mode" data-filter-mode="fixed"><strong>Redução fixa</strong><label>PC antes do filtro<input id="filter-fixed-input" type="number" min="0" value="5"></label><button type="button" class="notes-btn" id="filter-fixed-button">Reduzir 4 PC e aplicar</button></div>'+
      '<div class="filter-mode" data-filter-mode="variable"><strong>Redução variável</strong><label>Dados do ganho<input id="filter-dice-count" type="number" min="1" max="6" value="2"></label><button type="button" class="notes-btn" id="filter-variable-button">Rolar e descartar o maior</button></div>'+
      '<div class="filter-mode" data-filter-mode="overload"><strong>Sobrecarga</strong><p>Anula todo o ganho, mas causa 2 PF permanentes e Inconsciente.</p><button type="button" class="notes-btn danger" id="filter-overload-button">Acionar Sobrecarga</button></div>'+
      '</div><div class="filter-active-line"><span id="active-filter-mode">Nenhum modo selecionado.</span><button type="button" class="notes-btn small" id="clear-filter-mode">Limpar seleção</button></div>';
  }

  function allWeaponOptions(){
    var categories = ['Leves','Versáteis','Pesadas','De Fogo'];
    return '<option value="">— Escolha uma arma —</option>' + categories.map(function(category){
      return '<optgroup label="'+category+'">'+DATA.weapons.filter(function(weapon){ return weapon.category === category; }).map(function(weapon){
        return '<option value="'+weapon.id+'">'+escapeHtml(weapon.name)+'</option>';
      }).join('')+'</optgroup>';
    }).join('');
  }

  function growthOptions(){
    var roman = ['I','II','III','IV','V','VI','VII','VIII','IX','X'];
    return roman.map(function(label, index){ return '<option value="'+(index+1)+'">'+label+'</option>'; }).join('');
  }

  function activatePage(name){
    if(!$('#page-' + name)) name = 'principal';
    model.ui.activePage = name;
    $$('.sheet-page').forEach(function(page){ page.classList.toggle('active', page.dataset.page === name); });
    $$('.sheet-tab').forEach(function(tab){
      var active = tab.dataset.pageTarget === name;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    saveModel();
  }

  function bindFields(){
    var ids = [
      'registro','nome-sobrevivente','jogador','idade','sangue','origem-select','ocupacao-select','reputacao-select',
      'flor-select','pulseira-select','ponto-partida','grupo-estrada','attr-bonus-manual','pp-bonus-manual',
      'history-before','history-loss','history-purpose','history-fear','history-bonds','growth-stage'
    ];
    ids.forEach(function(id){
      var element = $('#' + id);
      if(element){ element.dataset.modelField = id; }
    });
  }

  function applyFields(){
    $$('[data-model-field]').forEach(function(element){
      var value = model.fields[element.dataset.modelField];
      if(value != null) element.value = value;
    });
    $('#pf-permanent').value = model.health.permanentPf;
    $('#pe-permanent').value = model.health.permanentPe;
    $('#parts-input').value = model.parts;
    $('#allow-campaign-recipes').checked = !!model.allowCampaignRecipes;
    renderParadigmStyle();
  }

  function buildSkills(){
    var grid = $('#skills-grid');
    grid.innerHTML = '';
    var skillIndex = 0;
    Object.keys(DATA.skills).forEach(function(attribute){
      var column = document.createElement('div');
      column.innerHTML = '<div class="skill-col-title">'+attribute+'</div>';
      DATA.skills[attribute].forEach(function(skill){
        skillIndex++;
        var row = document.createElement('div');
        row.className = 'skill-row';
        row.dataset.skill = skill;
        row.dataset.attribute = attribute;
        row.innerHTML = '<span class="skill-name">'+skill+'</span><div class="pips skill-pips" id="sk-'+skillIndex+'" data-skill-name="'+skill+'" data-attribute="'+attribute+'" data-max="4">'+pipButtons(5)+'</div>';
        column.appendChild(row);
      });
      grid.appendChild(column);
    });
    var attrOptions = Object.keys(DATA.skills).map(function(name){ return '<option>'+name+'</option>'; }).join('');
    $('#roll-attribute').innerHTML = attrOptions;
    $('#roll-skill').innerHTML = flattenSkills().map(function(name){ return '<option>'+name+'</option>'; }).join('');
  }

  function flattenSkills(){
    var list = [];
    Object.keys(DATA.skills).forEach(function(attribute){ list = list.concat(DATA.skills[attribute]); });
    return list;
  }

  function pipButtons(max){
    var html = '';
    for(var index=1; index<=max; index++) html += '<button type="button" class="pip" data-i="'+index+'" title="'+index+'"></button>';
    return html;
  }

  function renderPips(group, value, max, options){
    options = options || {};
    group.dataset.value = String(value);
    group.dataset.max = String(max);
    $$('.pip', group).forEach(function(pip){
      var index = parseInt(pip.dataset.i,10);
      pip.classList.toggle('filled', index <= value);
      pip.classList.toggle('permanent', !!options.permanentFrom && index >= options.permanentFrom && index <= options.permanentTo);
      pip.classList.toggle('overflow', !!options.safeMax && index > options.safeMax);
    });
  }

  function attributeId(name){
    return { Físico:'attr-fisico', Destreza:'attr-destreza', Intelecto:'attr-intelecto', Instinto:'attr-instinto', Espírito:'attr-espirito' }[name];
  }

  function getOccupation(){ return DATA.occupations[model.fields['ocupacao-select']] || null; }
  function getOrigin(){ return DATA.origins[model.fields['origem-select']] || null; }
  function attributeBudget(values){
    values = values || model.attributes;
    var spent = 0, zeroCount = 0;
    Object.keys(values).forEach(function(name){
      spent += Math.max(0, Number(values[name]) - 1);
      if(Number(values[name]) === 0) zeroCount++;
    });
    var occupation = getOccupation();
    var manual = parseInt(model.fields['attr-bonus-manual'] || 0,10) || 0;
    var max = 8 + (zeroCount ? 2 : 0) + (occupation && occupation.attributeBonus || 0) + manual;
    return { spent:spent, zeroCount:zeroCount, max:max, remaining:max-spent };
  }

  function renderAttributes(){
    Object.keys(model.attributes).forEach(function(name){
      var group = $('#' + attributeId(name));
      var value = clamp(model.attributes[name],0,5);
      model.attributes[name] = value;
      renderPips(group,value,5);
      var readout = $('.readout', group.parentElement);
      if(readout) readout.textContent = String(value).padStart(2,'0') + '/05';
    });
    var budget = attributeBudget();
    $('#attr-spent').textContent = budget.spent;
    $('#attr-max').textContent = budget.max;
    $('#attr-remaining').textContent = budget.remaining;
    $('#attr-remaining').classList.toggle('over', budget.remaining < 0);
    renderSkills();
    renderInventory();
    renderRecipes();
  }

  function skillAttribute(skill){
    var result = '';
    Object.keys(DATA.skills).some(function(attribute){
      if(DATA.skills[attribute].indexOf(skill) >= 0){ result = attribute; return true; }
      return false;
    });
    return result;
  }

  function isSkillLocked(skill){ return model.attributes[skillAttribute(skill)] === 0; }
  function effectiveOriginSkills(){ return model.originSkills.filter(function(skill){ return !isSkillLocked(skill); }); }
  function blockedOriginCount(){ return model.originSkills.filter(isSkillLocked).length; }

  function skillBudget(){
    var intellect = model.attributes.Intelecto;
    var bonusMap = {0:0,1:0,2:2,3:4,4:6,5:8};
    var occupation = getOccupation();
    var manual = parseInt(model.fields['pp-bonus-manual'] || 0,10) || 0;
    var bonus = bonusMap[intellect] || 0;
    var blockedBonus = blockedOriginCount() * 3;
    var growthBonus = model.fields['ocupacao-select'] === 'Estudioso' ? clamp(model.fields['growth-stage'],0,10) : 0;
    var total = 28 + bonus + blockedBonus + (occupation && occupation.ppBonus || 0) + growthBonus + manual;
    var spent = 0;
    Object.keys(model.skills).forEach(function(skill){
      if(model.originSkills.indexOf(skill) < 0 && !isSkillLocked(skill)) spent += Math.max(0, model.skills[skill] - 1);
    });
    return { bonus:bonus, blockedBonus:blockedBonus, growthBonus:growthBonus, total:total, spent:spent, remaining:total-spent };
  }

  function renderSkills(){
    $$('.skill-row').forEach(function(row){
      var skill = row.dataset.skill;
      var group = $('.skill-pips', row);
      var locked = isSkillLocked(skill);
      var origin = model.originSkills.indexOf(skill) >= 0;
      var value = locked ? 0 : (origin ? 5 : clamp(model.skills[skill],1,4));
      group.classList.toggle('origin-active', origin && !locked);
      group.classList.toggle('skill-locked', locked);
      row.classList.toggle('locked', locked);
      row.title = locked ? (origin ? 'Perícia de Origem bloqueada: concede +3 PP.' : 'Bloqueada pela Fraqueza Absoluta.') : '';
      renderPips(group,value,origin ? 5 : 4);
    });
    var budget = skillBudget();
    $('#pp-bonus').textContent = budget.bonus + (budget.blockedBonus ? ' + ' + budget.blockedBonus : '') + (budget.growthBonus ? ' + ' + budget.growthBonus + ' Cresc.' : '');
    $('#pp-total').textContent = budget.total;
    $('#pp-spent').textContent = budget.spent;
    $('#pp-remaining').textContent = budget.remaining;
    $('#pp-remaining').classList.toggle('over', budget.remaining < 0);
    $('#origin-count').textContent = effectiveOriginSkills().length;
    $('#origin-count').classList.toggle('over', effectiveOriginSkills().length !== 4 && !!getOrigin());
  }

  function bloodLimits(){
    if(model.fields.sangue === 'novo') return { pf:15, pe:15, pfSegments:[5,10,15], peSegments:[5,10,15] };
    return { pf:20, pe:20, pfSegments:[8,15,20], peSegments:[7,14,20] };
  }

  function buildTrackPips(group, max){
    if($$('.pip',group).length === max) return;
    group.innerHTML = pipButtons(max);
  }

  function applyMasochistRelief(pfReceived){
    if(model.fields['ocupacao-select'] !== 'Masoquista' || pfReceived <= 0) return;
    var reduction = Math.ceil(pfReceived / 2);
    model.health.pe = Math.max(0,model.health.pe-reduction);
    if(reduction >= 5 && model.conditions.indexOf('Florescer na Dor — Bônus') < 0){
      model.conditions.push('Florescer na Dor — Bônus');
      renderConditions();
    }
  }

  function renderHealth(){
    var limits = bloodLimits();
    model.health.permanentPf = clamp(model.health.permanentPf,0,limits.pf);
    model.health.permanentPe = clamp(model.health.permanentPe,0,limits.pe);
    model.health.pf = clamp(model.health.pf,0,limits.pf + 6 - model.health.permanentPf);
    model.health.pe = clamp(model.health.pe,0,limits.pe + 1 - model.health.permanentPe);
    var pfTotal = model.health.pf + model.health.permanentPf;
    var peTotal = model.health.pe + model.health.permanentPe;
    var pfGroup = $('#pf-boxes');
    var peGroup = $('#pe-boxes');
    buildTrackPips(pfGroup, limits.pf + 6);
    buildTrackPips(peGroup, limits.pe + 1);
    var permanentPfFrom = model.health.permanentPf ? limits.pf - model.health.permanentPf + 1 : 0;
    var permanentPeFrom = model.health.permanentPe ? limits.pe - model.health.permanentPe + 1 : 0;
    renderPips(pfGroup,pfTotal,limits.pf+6,{ safeMax:limits.pf, permanentFrom:permanentPfFrom, permanentTo:limits.pf });
    renderPips(peGroup,peTotal,limits.pe+1,{ safeMax:limits.pe, permanentFrom:permanentPeFrom, permanentTo:limits.pe });
    $('#pf-max-label').textContent = '/' + limits.pf + ' (+' + Math.max(0,pfTotal-limits.pf) + ')';
    $('#pe-max-label').textContent = '/' + limits.pe + (peTotal > limits.pe ? ' (+1)' : '');
    $('#pf-readout').childNodes[0].nodeValue = String(pfTotal).padStart(2,'0');
    $('#pe-readout').childNodes[0].nodeValue = String(peTotal).padStart(2,'0');
    $('#pf-permanent').value = model.health.permanentPf;
    $('#pe-permanent').value = model.health.permanentPe;
    renderTrackZones('pf', limits.pfSegments, limits.pf);
    renderTrackZones('pe', limits.peSegments, limits.pe);
    var pfStage = pfTotal === 0 ? 'Nenhum' : (pfTotal <= limits.pfSegments[0] ? 'Machucado' : (pfTotal <= limits.pfSegments[1] ? 'Ferido' : (pfTotal <= limits.pf ? 'Crítico' : (pfTotal <= limits.pf + 5 ? 'Morrendo' : 'Morte Direta'))));
    var peStage = peTotal === 0 ? 'Nenhum' : (peTotal <= limits.peSegments[0] ? 'Estável' : (peTotal <= limits.peSegments[1] ? 'Instável' : (peTotal <= limits.pe ? 'Desequilibrado' : 'Enlouquecendo')));
    $('#pf-stage').textContent = 'Estágio atual: ' + pfStage;
    $('#pe-stage').textContent = 'Estágio atual: ' + peStage;
    $('#pf-stage').className = 'track-stage ' + (pfStage === 'Morte Direta' || pfStage === 'Morrendo' || pfStage === 'Crítico' ? 'stage-crit' : (pfStage === 'Machucado' || pfStage === 'Ferido' ? 'stage-warn' : 'stage-ok'));
    $('#pe-stage').className = 'track-stage ' + (peStage === 'Enlouquecendo' || peStage === 'Desequilibrado' ? 'stage-crit' : (peStage === 'Instável' ? 'stage-warn' : 'stage-ok'));
    var alertBox = $('#critical-state-alert');
    if(alertBox){
      var alertText = '';
      var alertClass = '';
      if(pfStage === 'Morte Direta'){
        alertText = 'MORTE DIRETA — o total de PF atingiu 6 pontos além do limite. Aplique imediatamente a condição de morte prevista pela regra.';
        alertClass = 'death';
      } else if(pfStage === 'Morrendo'){
        alertText = 'MORRENDO — o personagem ultrapassou o limite de PF e precisa ser estabilizado antes de alcançar Morte Direta.';
        alertClass = 'dying';
      } else if(peStage === 'Enlouquecendo'){
        alertText = 'ENLOUQUECENDO — o personagem ultrapassou o limite de PE ('+(model.fields.sangue === 'novo' ? '16+' : '21+')+').';
        alertClass = 'insanity';
      }
      alertBox.textContent = alertText;
      alertBox.className = 'critical-state-alert' + (alertText ? ' '+alertClass : ' hidden');
    }
  }

  function renderTrackZones(type, segments, max){
    var strip = $('#' + type + '-zones');
    var text = $('#' + type + '-zones-text');
    strip.innerHTML = '';
    var previous = 0;
    segments.forEach(function(end,index){
      var segment = document.createElement('div');
      segment.className = 'zone-seg ' + ['zone-ok','zone-warn','zone-crit'][index];
      segment.style.flex = end - previous;
      strip.appendChild(segment);
      previous = end;
    });
    if(type === 'pf') text.textContent = 'Base ' + max + ' · Morrendo até +' + 5 + ' · Morte Direta em +' + 6;
    else text.textContent = 'Limite ' + max + ' · Enlouquecendo ao ultrapassar · pontos permanentes ocupam o fim da barra';
  }

  function currentCorruptionStage(){
    var pc = clamp(model.pc,0,100);
    return DATA.corruptionStages.filter(function(stage){ return pc >= stage.min && pc <= stage.max; })[0] || DATA.corruptionStages[0];
  }

  function renderPC(){
    model.pc = clamp(model.pc,0,100);
    $('#pc-input').value = model.pc;
    $('#pc-marker').style.left = model.pc + '%';
    var stage = currentCorruptionStage();
    $('#pc-stage').textContent = 'Estágio atual: ' + stage.name;
    $('#pc-stage').className = 'pc-stage stage-' + stage.name.toLowerCase().replace(/í/g,'i');
    renderCorruption();
  }

  function changePC(amount){
    amount = parseInt(amount,10) || 0;
    model.pc = clamp(model.pc + amount,0,100);
    renderPC();
    saveModel();
  }

  function addPC(amount){ changePC(Math.max(0,parseInt(amount,10) || 0)); }

  function renderBloodVisibility(){
    var isNew = model.fields.sangue === 'novo';
    $('#new-blood-meta').classList.toggle('hidden', !isNew);
    if($('#old-blood-meta')) $('#old-blood-meta').classList.toggle('hidden', isNew);
    $('#new-blood-panel').classList.toggle('hidden', !isNew);
    $('#old-blood-panel').classList.toggle('hidden', isNew);
  }

  function renderOrigin(){
    var originName = model.fields['origem-select'];
    var origin = DATA.origins[originName];
    var archetype = DATA.archetypes[originName] || '';
    $('#arquetipo-readout').value = archetype;
    $('#growth-archetype').value = archetype;
    $('#origin-weapon-hint').textContent = origin ? 'Categoria de arma inicial: ' + origin.weapon : '';
    if(!origin){
      $('#origin-overview').innerHTML = '<p class="empty-state">Selecione uma Origem na Ficha Principal.</p>';
      $('#origin-budget').innerHTML = '';
      $('#origin-power-list').innerHTML = '';
      renderGrowth();
      return;
    }
    var initial = origin.initial || {name:'Poder Inicial',description:''};
    $('#origin-overview').innerHTML = '<div class="origin-summary-line"><strong>'+originName+'</strong><span>'+origin.weapon+'</span><span>'+origin.skills.join(' · ')+'</span></div>'+
      '<article class="power-card initial-power"><span class="power-cost">GRÁTIS</span><h3>'+escapeHtml(initial.name)+'</h3><p>'+escapeHtml(initial.description)+'</p></article>';
    var occupation = getOccupation();
    var total = 7 + (occupation && occupation.originPointsBonus || 0);
    var spent = origin.powers.reduce(function(sum,power){ return sum + (model.originPowers.indexOf(power.name) >= 0 ? power.cost : 0); },0);
    $('#origin-budget').innerHTML = '<span>Total <b>'+total+' PO</b></span><span>Gasto <b>'+spent+'</b></span><span class="'+(spent === total ? 'budget-ok' : (spent > total ? 'over' : ''))+'">Restante <b>'+(total-spent)+'</b></span>';
    $('#origin-power-list').innerHTML = origin.powers.map(function(power){
      var checked = model.originPowers.indexOf(power.name) >= 0;
      return '<label class="power-card selectable '+(checked ? 'selected' : '')+'"><input type="checkbox" class="origin-power-check" data-power="'+escapeHtml(power.name)+'" '+(checked ? 'checked' : '')+'><span class="power-cost">'+power.cost+' PO</span><h3>'+escapeHtml(power.name)+'</h3><p>'+escapeHtml(power.description)+'</p></label>';
    }).join('');
    renderGrowth();
  }

  function applyOrigin(originName){
    model.originSkills.forEach(function(skill){ if(model.skills[skill] === 5) model.skills[skill] = 1; });
    model.fields['origem-select'] = originName;
    var origin = DATA.origins[originName];
    model.originSkills = origin ? origin.skills.slice() : [];
    model.originSkills.forEach(function(skill){ model.skills[skill] = 5; });
    model.originPowers = [];
    renderOrigin();
    renderRest();
    renderAttributes();
    renderEquipment();
    saveModel();
  }

  function renderOccupation(){
    var name = model.fields['ocupacao-select'];
    var occupation = DATA.occupations[name];
    var detail = $('#occupation-detail');
    configureParadigmOptions(occupation && occupation.paradigm || '');
    $('#roll-devotee-option').classList.toggle('hidden', name !== 'Devoto');
    if(name !== 'Devoto') $('#roll-devotee').checked = false;
    if(!occupation){
      $('#occupation-hint').textContent = '';
      detail.innerHTML = '<p class="empty-state">Selecione uma Ocupação na Ficha Principal.</p>';
      return;
    }
    var warning = occupation.requiresBlood && model.fields.sangue !== occupation.requiresBlood;
    $('#occupation-hint').textContent = occupation.bonus || '';
    $('#occupation-hint').classList.toggle('hint-warning', warning);
    detail.innerHTML = '<div class="occupation-title"><strong>'+escapeHtml(name)+'</strong>'+(warning ? '<span class="warning-chip">Requer Sangue Novo</span>' : '')+'</div>'+
      '<p>'+escapeHtml(occupation.bonus || '')+'</p><div class="occupation-powers">'+occupation.powers.map(function(power){
        var item = typeof power === 'string' ? {name:power,description:''} : power;
        return '<details class="occupation-power"><summary>'+escapeHtml(item.name)+'</summary><p>'+escapeHtml(item.description || 'Descrição preservada para compatibilidade; consulte o livro para a redação integral.')+'</p></details>';
      }).join('')+'</div>'+occupationChoiceControls(name);
  }

  function occupationChoiceControls(name){
    if(name === 'Prodígio'){
      var options1 = flattenSkills().map(function(skill){ return '<option '+(model.fields['prodigio-skill-1'] === skill ? 'selected' : '')+'>'+escapeHtml(skill)+'</option>'; }).join('');
      var options2 = flattenSkills().map(function(skill){ return '<option '+(model.fields['prodigio-skill-2'] === skill ? 'selected' : '')+'>'+escapeHtml(skill)+'</option>'; }).join('');
      return '<div class="occupation-choice"><strong>Dom Superior</strong><p>Escolha duas Perícias; o rolador aplica 1 Bônus automaticamente.</p><div class="occupation-choice-grid">'+
        '<select id="prodigio-skill-1" class="prodigio-skill"><option value="">— Perícia 1 —</option>'+options1+'</select>'+
        '<select id="prodigio-skill-2" class="prodigio-skill"><option value="">— Perícia 2 —</option>'+options2+'</select></div></div>';
    }
    if(name === 'Abutre'){
      return '<div class="occupation-choice"><strong>Acumulador</strong><p>O Recurso escolhido nunca fica abaixo de 1 unidade.</p><select id="abutre-resource"><option value="">— Escolher Recurso —</option>'+DATA.resources.map(function(resource){ return '<option '+(model.fields['abutre-resource'] === resource ? 'selected' : '')+'>'+resource+'</option>'; }).join('')+'</select></div>';
    }
    if(name === 'Masoquista'){
      return '<div class="occupation-choice"><strong>Carne Voluntária</strong><p>Uma vez por Ciclo: +1 PC e Bônus em todos os testes até o fim da Cena.</p><button type="button" class="notes-btn" id="masoquista-voluntary">Aceitar +1 PC</button></div>';
    }
    return '';
  }

  function configureParadigmOptions(requiredGroup){
    var allowed = {
      'Síntese':['Peregrino','Sobrevivente','Imperfeito'],
      'Abissal':['Ceifador','Mercenário','Inquisidor']
    };
    $$('#reputacao-select option').forEach(function(option){
      option.disabled = !!requiredGroup && !!option.value && allowed[requiredGroup].indexOf(option.value) < 0;
    });
    renderParadigmStyle();
  }

  function paradigmGroup(value){
    if(['Guardião','Justo','Messias'].indexOf(value) >= 0) return 'sublime';
    if(['Peregrino','Sobrevivente','Imperfeito'].indexOf(value) >= 0) return 'sintese';
    if(['Ceifador','Mercenário','Inquisidor'].indexOf(value) >= 0) return 'abissal';
    return '';
  }

  function renderParadigmStyle(){
    var select = $('#reputacao-select');
    if(!select) return;
    var group = paradigmGroup(select.value || model.fields['reputacao-select']);
    select.classList.remove('paradigm-selected-sublime','paradigm-selected-sintese','paradigm-selected-abissal');
    if(group) select.classList.add('paradigm-selected-' + group);
    $$('#paradigm-legend [data-paradigm-group]').forEach(function(label){
      label.classList.toggle('active',label.dataset.paradigmGroup === group);
    });
  }

  function applyOccupation(name){
    model.fields['ocupacao-select'] = name;
    var occupation = getOccupation();
    if(occupation && occupation.requiresBlood){ model.fields.sangue = occupation.requiresBlood; }
    if(occupation && occupation.paradigm){
      var allowed = occupation.paradigm === 'Síntese' ? ['Peregrino','Sobrevivente','Imperfeito'] : ['Ceifador','Mercenário','Inquisidor'];
      if(allowed.indexOf(model.fields['reputacao-select']) < 0) model.fields['reputacao-select'] = '';
    }
    applyFields();
    renderOccupation();
    renderAttributes();
    renderHealth();
    renderPC();
    ensureWeaponSlots();
    renderEquipment();
    renderOrigin();
    renderCharacteristics();
    saveModel();
  }

  function renderCorruption(){
    if(!$('#corruption-overview')) return;
    var stage = currentCorruptionStage();
    $('#corruption-overview').innerHTML = '<div><strong>'+stage.name+'</strong><span>'+model.pc+' PC</span></div><p>'+escapeHtml(stage.summary)+'</p>';
    $('#plague-threshold-tag').textContent = stage.name === 'Corrompido' ? 'ENRAIZAMENTO' : 'DADO DA PRAGA: 1–' + stage.plagueThreshold;
    var currentIndex = DATA.corruptionStages.indexOf(stage);
    $('#corruption-effects').innerHTML = DATA.corruptionStages.map(function(level,index){
      var filteredCount = level.effects.filter(function(effect){ return model.corruptionFilters.indexOf(effect.key) >= 0; }).length;
      var effects = level.effects.length ? level.effects.map(function(effect){
        var filtered = model.corruptionFilters.indexOf(effect.key) >= 0;
        return '<li class="'+(filtered ? 'effect-filtered' : '')+'"><strong>'+escapeHtml(effect.name)+'</strong><span>'+escapeHtml(effect.description)+'</span>'+(filtered ? '<em>Anulado pela Pulseira</em>' : '')+'</li>';
      }).join('') : '<li class="effect-empty">Sem efeitos negativos neste nível.</li>';
      return '<details class="corruption-level '+(index === currentIndex ? 'current' : '')+' '+(index <= currentIndex ? 'reached' : 'future')+'" '+(index === currentIndex ? 'open' : '')+'><summary><span>'+escapeHtml(level.name)+'</span><small>'+level.min+(level.max === level.min ? '' : '–'+level.max)+' PC'+(filteredCount ? ' · '+filteredCount+' anulado'+(filteredCount === 1 ? '' : 's') : '')+'</small></summary><ul>'+effects+'</ul></details>';
    }).join('');
    renderBloodVisibility();
    renderFlower();
    renderCorruptionFilters();
    renderFilterMode();
  }

  function renderCorruptionFilters(){
    var picker = $('#corruption-filter-picker');
    if(!picker) return;
    if(model.fields.sangue !== 'velho'){
      picker.innerHTML = '';
      return;
    }
    var stage = currentCorruptionStage();
    var selectable = stage.effects || [];
    var activeEffects = [];
    DATA.corruptionStages.forEach(function(level){
      level.effects.forEach(function(effect){ if(model.corruptionFilters.indexOf(effect.key) >= 0) activeEffects.push({stage:level.name,effect:effect}); });
    });
    var choices = selectable.length ? selectable.map(function(effect){
      var checked = model.corruptionFilters.indexOf(effect.key) >= 0;
      return '<label class="corruption-filter-option '+(checked ? 'selected' : '')+'"><input type="checkbox" class="corruption-filter-check" data-effect-key="'+effect.key+'" '+(checked ? 'checked' : '')+'><span><strong>'+escapeHtml(effect.name)+'</strong><small>'+escapeHtml(effect.description)+'</small></span></label>';
    }).join('') : '<p class="empty-state">Este nível não oferece efeitos mecânicos para anular.</p>';
    var active = activeEffects.length ? activeEffects.map(function(item){
      return '<span class="active-effect-chip"><b>'+escapeHtml(item.stage)+'</b> · '+escapeHtml(item.effect.name)+'</span>';
    }).join('') : '<span class="empty-state">Nenhum efeito anulado pela Pulseira.</span>';
    picker.innerHTML = '<div class="filter-effect-header"><div><strong>Efeitos anulados permanentemente</strong><p>Ao alcançar um novo nível de Corrupção, Sangue Velho escolhe até 3 efeitos mecânicos daquele nível para anular.</p></div><button type="button" class="notes-btn small danger" id="clear-corruption-filters" '+(activeEffects.length ? '' : 'disabled')+'>Limpar efeitos anulados</button></div><div class="active-effect-list">'+active+'</div><div class="filter-effect-choices"><strong>Escolhas de '+escapeHtml(stage.name)+'</strong>'+choices+'</div>';
  }

  function renderFilterMode(){
    var labels = {fixed:'Redução fixa',variable:'Redução variável',overload:'Sobrecarga'};
    $$('.filter-mode').forEach(function(card){ card.classList.toggle('active',card.dataset.filterMode === model.ui.filterMode); });
    var readout = $('#active-filter-mode');
    if(readout) readout.textContent = model.ui.filterMode ? 'Modo selecionado: '+labels[model.ui.filterMode]+'.' : 'Nenhum modo selecionado.';
  }

  function selectFilterMode(mode){
    model.ui.filterMode = mode || '';
    renderFilterMode();
    saveModel();
  }

  function renderFlower(){
    var name = model.fields['flor-select'];
    var flower = DATA.flowers[name];
    if(!flower){
      $('#flower-overview').innerHTML = '<p class="empty-state">Escolha uma Flor na Ficha Principal.</p>';
      $('#flower-stages').innerHTML = '';
      return;
    }
    $('#flower-overview').innerHTML = '<h3>'+escapeHtml(name)+'</h3><p>'+escapeHtml(flower.description)+'</p>';
    var stage = currentCorruptionStage();
    var currentIndex = DATA.corruptionStages.indexOf(stage);
    if(currentIndex > 4) currentIndex = 4;
    var occupation = getOccupation();
    var effectiveIndex = occupation && model.fields['ocupacao-select'] === 'Devoto' ? Math.min(4,currentIndex+1) : currentIndex;
    $('#flower-stages').innerHTML = flower.stages.map(function(item,index){
      var active = index === effectiveIndex;
      var unlocked = index <= effectiveIndex;
      return '<article class="flower-stage '+(active ? 'active' : '')+' '+(unlocked ? 'unlocked' : 'locked')+'"><span>'+escapeHtml(item.stage)+'</span><h4>'+escapeHtml(item.name)+'</h4><p>'+escapeHtml(item.description)+'</p>'+(active && effectiveIndex !== currentIndex ? '<em>Ativa um estágio acima por Devoto.</em>' : '')+'</article>';
    }).join('');
  }

  function growthSummary(stage){
    if(!stage) return 'A Trilha de Crescimento começa ao fim do primeiro Arco.';
    var rewards = stage % 3 === 0 ? 'Libera uma nova Origem e concede PO.' : 'Concede benefícios do Arquétipo, PO e possivelmente PP/PA.';
    if(stage === 10) rewards = 'Ápice da Trilha. A partir daqui: +2 PO e +2 PP por Arco.';
    return 'Etapa ' + ['','I','II','III','IV','V','VI','VII','VIII','IX','X'][stage] + ': ' + rewards;
  }

  function renderGrowth(){
    if(!$('#growth-stage')) return;
    var stage = clamp(model.fields['growth-stage'],0,10);
    $('#growth-stage').value = String(stage);
    $('#growth-summary').textContent = growthSummary(stage);
    if(model.fields['ocupacao-select'] === 'Estudioso') renderSkills();
  }

  function recoveryActionLimit(){
    return model.originPowers.indexOf('Acampamento Fortificado') >= 0 ? 3 : 2;
  }

  function recoveryActionOptions(selected){
    var options = [
      ['','— Escolher ação —'],
      ['pf','Recuperar PF'],
      ['pe','Recuperar PE'],
      ['condition','Tratar uma Condição'],
      ['bond','Fortalecer um Laço'],
      ['insight','Receber um Vislumbre'],
      ['other','Outro benefício definido pelo MP']
    ];
    return options.map(function(option){ return '<option value="'+option[0]+'" '+(selected === option[0] ? 'selected' : '')+'>'+option[1]+'</option>'; }).join('');
  }

  function renderRest(){
    if(!$('#rest-scenes-pips')) return;
    var limit = recoveryActionLimit();
    while(model.rest.actions.length < limit) model.rest.actions.push({type:'',note:''});
    renderPips($('#rest-scenes-pips'),model.rest.scenes,8);
    $('#rest-scenes-readout').textContent = model.rest.scenes+'/8';
    $('#rest-actions').innerHTML = model.rest.actions.slice(0,limit).map(function(action,index){
      return '<article class="rest-action-card" data-rest-action-index="'+index+'"><span>Ação '+(index+1)+(index === 2 ? ' · Acampamento Fortificado' : '')+'</span><select class="rest-action-type">'+recoveryActionOptions(action.type)+'</select><textarea class="rest-action-note" placeholder="Resultado, valor recuperado ou observação...">'+escapeHtml(action.note)+'</textarea></article>';
    }).join('');
    var chosen = model.rest.actions.slice(0,limit).map(function(action){ return action.type; }).filter(Boolean);
    var duplicate = chosen.some(function(type,index){ return chosen.indexOf(type) !== index; });
    var warning = $('#rest-warning');
    warning.textContent = duplicate ? 'A mesma categoria de benefício não pode ser escolhida duas vezes no mesmo descanso.' : (model.rest.scenes < 8 ? 'Faltam '+(8-model.rest.scenes)+' cenas para completar o descanso do Ciclo.' : 'Descanso completo: registre as '+limit+' ações de recuperação.');
    warning.className = 'inline-feedback '+(duplicate ? 'over' : (model.rest.scenes === 8 ? 'budget-ok' : ''));
  }

  function inventoryCapacity(){ return 2 + model.attributes.Físico; }
  function initialItemLimit(){ var occ = getOccupation(); return occ && occ.initialItems || 3; }
  function isInventoryWeapon(item){ return !!(item && item.kind === 'weapon' && item.weapon); }
  function inventoryEntryUsed(item){ return isInventoryWeapon(item) || !!String(item && item.name || '').trim(); }
  function emptyInventoryItem(){ return {id:uid('item'),kind:'item',name:'',uses:''}; }
  function inventoryWeaponOptions(selected){
    var categories = ['Leves','Versáteis','Pesadas','De Fogo'];
    var html = '<option value="custom" '+(selected === 'custom' ? 'selected' : '')+'>Arma personalizada</option>';
    categories.forEach(function(category){
      html += '<optgroup label="'+category+'">'+DATA.weapons.filter(function(weapon){ return weapon.category === category; }).map(function(weapon){
        return '<option value="'+weapon.id+'" '+(selected === weapon.id ? 'selected' : '')+'>'+escapeHtml(weapon.name)+'</option>';
      }).join('')+'</optgroup>';
    });
    return html;
  }

  function inventoryWeaponEditor(item, state, weapon){
    var max = weaponMax(state);
    var modLimit = weapon ? (weapon.maxMods || 2) : 0;
    var mods = weapon ? applicableMods(weapon) : [];
    var modHtml = '';
    for(var modIndex=0; modIndex<modLimit; modIndex++){
      var selected = state.mods[modIndex] || '';
      modHtml += '<label>Modificação '+(modIndex+1)+'<select class="inventory-weapon-mod-select" data-mod-index="'+modIndex+'"><option value="">— Nenhuma —</option>'+mods.map(function(mod){ return '<option value="'+mod.id+'" '+(selected === mod.id ? 'selected' : '')+'>'+escapeHtml(mod.name)+' · '+mod.cost+' Partes</option>'; }).join('')+'</select></label>';
    }
    var custom = state.weaponId === 'custom' ? '<div class="custom-weapon-fields"><input class="inventory-custom-weapon-name" value="'+escapeHtml(state.customName)+'" placeholder="Nome"><input class="inventory-custom-weapon-damage" value="'+escapeHtml(state.customDamage)+'" placeholder="Ferimento / munição"><input class="inventory-custom-weapon-range" value="'+escapeHtml(state.customRange)+'" placeholder="Distância / recuo"><input class="inventory-custom-weapon-max" type="number" min="0" value="'+state.customMax+'" placeholder="Usos"></div>' : '';
    var track = max ? '<div class="weapon-track"><span>'+(weapon && weapon.durability ? 'Durabilidade' : 'Munição')+' <b>'+state.current+'/'+max+'</b></span><div class="pips weapon-pips inventory-weapon-pips" data-item-id="'+item.id+'">'+pipButtons(max)+'</div></div>' : '<div class="weapon-track muted">Munição controlada pelo Inventário.</div>';
    return '<div class="inventory-weapon-editor" data-editor-item-id="'+item.id+'"><div class="inventory-editor-heading"><strong>Editando arma guardada</strong><span>Os ajustes não movem nem duplicam a arma.</span></div><label class="inventory-editor-field">Arma<select class="inventory-weapon-select">'+inventoryWeaponOptions(state.weaponId)+'</select></label>'+custom+weaponPowerDetails(weapon)+track+'<div class="weapon-mods">'+modHtml+'</div><textarea class="inventory-weapon-notes" placeholder="Anotações, munição, reparos...">'+escapeHtml(state.notes)+'</textarea><div class="inventory-editor-footer"><button type="button" class="notes-btn small inventory-weapon-equip">Equipar em espaço livre</button></div></div>';
  }
  function ensureInventorySlots(){
    var capacity = inventoryCapacity();
    while(model.inventory.length < capacity) model.inventory.push(emptyInventoryItem());
    while(model.inventory.length > capacity && !inventoryEntryUsed(model.inventory[model.inventory.length-1]) && !String(model.inventory[model.inventory.length-1].uses || '').trim()){ model.inventory.pop(); }
  }

  function renderInventory(){
    if(!$('#inv-grid')) return;
    ensureInventorySlots();
    var used = model.inventory.filter(inventoryEntryUsed).length;
    var capacity = inventoryCapacity();
    $('#inventory-capacity-tag').textContent = 'MÁX. = ' + capacity + ' (2 + FÍSICO)';
    var excess = Math.max(0,used-capacity);
    $('#inventory-status').textContent = 'Ocupados: ' + used + '/' + capacity + (excess ? ' · Sobrecarregado: −1 PA em Físico ou Destreza por item ('+excess+')' : '');
    $('#inventory-status').className = used > capacity ? 'over' : '';
    $('#initial-items-status').textContent = 'Criação: até ' + initialItemLimit() + ' itens';
    $('#inv-grid').innerHTML = model.inventory.map(function(item,index){
      if(isInventoryWeapon(item)){
        var state = item.weapon;
        var weapon = weaponData(state.weaponId);
        var max = weaponMax(state);
        state.current = clamp(state.current,0,max || 99);
        var name = weapon ? weapon.name : (state.customName || 'Arma personalizada');
        var broken = max > 0 && state.current === 0;
        var stats = weapon ? [weapon.category,weapon.damage,weapon.severity,weapon.range].filter(Boolean).join(' · ') : [state.customDamage,state.customRange].filter(Boolean).join(' · ');
        var editing = model.ui.editingInventoryWeaponId === item.id;
        return '<article class="inv-slot inventory-weapon '+(index >= capacity ? 'overloaded-slot ' : '')+(broken ? 'broken ' : '')+(editing ? 'editing' : '')+'" data-item-id="'+item.id+'"><span class="list-num">'+String(index+1).padStart(2,'0')+'</span><div class="inventory-weapon-body"><div class="weapon-card-header"><strong>'+escapeHtml(name)+'</strong>'+(broken ? '<span class="broken-chip">QUEBRADA</span>' : '')+'</div><span>'+escapeHtml(stats)+'</span>'+(max ? '<small>'+(weapon && weapon.durability ? 'Durabilidade' : 'Munição')+': '+state.current+'/'+max+'</small>' : '')+weaponPowerDetails(weapon)+'</div><div class="inventory-weapon-actions"><button type="button" class="notes-btn small inventory-weapon-edit '+(editing ? 'active' : '')+'" aria-expanded="'+(editing ? 'true' : 'false')+'">Editar</button><button type="button" class="list-row-remove inventory-remove" title="Excluir arma">×</button></div>'+(editing ? inventoryWeaponEditor(item,state,weapon) : '')+'</article>';
      }
      return '<div class="inv-slot '+(index >= capacity ? 'overloaded-slot' : '')+'" data-item-id="'+item.id+'"><span class="list-num">'+String(index+1).padStart(2,'0')+'</span><div class="inventory-fields"><input type="text" class="inventory-name" value="'+escapeHtml(item.name)+'" placeholder="Item..."><input type="text" class="inventory-uses" value="'+escapeHtml(item.uses)+'" placeholder="Usos"></div><button type="button" class="list-row-remove inventory-remove" title="Excluir">×</button></div>';
    }).join('');
    $$('.inventory-weapon-pips').forEach(function(group){
      var item = model.inventory.filter(function(entry){ return entry.id === group.dataset.itemId; })[0];
      if(item && isInventoryWeapon(item)) renderPips(group,item.weapon.current,weaponMax(item.weapon));
    });
  }

  function allowedWeaponSlots(){ var occ = getOccupation(); return occ && occ.weaponSlots || 2; }
  function ensureWeaponSlots(){
    var count = allowedWeaponSlots();
    while(model.weapons.length < count) model.weapons.push(emptyWeapon());
    while(model.weapons.length > count){
      var last = model.weapons[model.weapons.length-1];
      if(last.weaponId || last.customName || last.notes) break;
      model.weapons.pop();
    }
  }

  function weaponData(id){ return DATA.weapons.filter(function(item){ return item.id === id; })[0] || null; }
  function weaponHasContent(state){ return !!(state && (state.weaponId || state.customName || state.notes || state.mods && state.mods.length)); }
  function weaponStateFromId(id){
    var state = emptyWeapon();
    state.weaponId = id;
    state.current = weaponMax(state);
    return state;
  }
  function weaponMax(weaponState){
    var data = weaponData(weaponState.weaponId);
    if(!data) return parseInt(weaponState.customMax,10) || 0;
    var max = data.durability || data.ammo || 0;
    if(weaponState.mods.indexOf('pistola-pente') >= 0) max += 3;
    return max;
  }
  function applicableMods(weapon){
    if(!weapon || weapon.unmodifiable) return [];
    return DATA.modifications.filter(function(mod){
      if(mod.weapon) return mod.weapon === weapon.id;
      return mod.group === weapon.group;
    });
  }

  function weaponAllowedInSlot(weapon,index){
    if(index >= 2) return true;
    var ranged = weapon.category === 'De Fogo' || weapon.group === 'disparo';
    return index === 0 ? !ranged : ranged;
  }
  function weaponSlotLabel(index){ return index === 0 ? 'Arma Branca' : (index === 1 ? 'Fogo / Disparo' : 'Livre'); }
  function firstEmptyWeaponSlot(weapon){
    ensureWeaponSlots();
    for(var index=0; index<allowedWeaponSlots(); index++){
      if(!weaponHasContent(model.weapons[index]) && (!weapon || weaponAllowedInSlot(weapon,index))) return index;
    }
    return -1;
  }
  function weaponPowerDetails(weapon){
    if(!weapon || !Array.isArray(weapon.specials) || !weapon.specials.length) return '';
    return '<details class="weapon-power-details"><summary>Poderes da arma ('+weapon.specials.length+')</summary><div>'+weapon.specials.map(function(power){
      var item = typeof power === 'string' ? {name:power,description:''} : power;
      return '<article><strong>'+escapeHtml(item.name)+'</strong><p>'+escapeHtml(item.description || '')+'</p></article>';
    }).join('')+'</div></details>';
  }
  function addOfficialWeapon(id){
    var weapon = weaponData(id);
    if(!weapon) return;
    var state = weaponStateFromId(id);
    var slot = firstEmptyWeaponSlot(weapon);
    var feedback = $('#weapon-add-feedback');
    if(slot >= 0){
      model.weapons[slot] = state;
      feedback.textContent = weapon.name+' equipada no '+weaponSlotLabel(slot)+'.';
      feedback.className = 'inline-feedback budget-ok';
    } else {
      model.inventory.push({id:uid('weapon-item'),kind:'weapon',weapon:state});
      feedback.textContent = 'Espaços compatíveis ocupados: '+weapon.name+' foi guardada no Inventário.';
      feedback.className = 'inline-feedback';
    }
    $('#new-weapon-select').value = '';
    renderEquipment();
    saveModel();
  }
  function moveWeaponToInventory(index){
    var state = model.weapons[index];
    if(!weaponHasContent(state)) return;
    model.inventory.push({id:uid('weapon-item'),kind:'weapon',weapon:clone(state)});
    model.weapons[index] = emptyWeapon();
    renderEquipment();
    saveModel();
  }
  function equipInventoryWeapon(itemId){
    var itemIndex = model.inventory.findIndex(function(item){ return item.id === itemId; });
    if(itemIndex < 0 || !isInventoryWeapon(model.inventory[itemIndex])) return;
    var item = model.inventory[itemIndex];
    var slot = firstEmptyWeaponSlot(weaponData(item.weapon.weaponId));
    var feedback = $('#weapon-add-feedback');
    if(slot < 0){
      feedback.textContent = 'Nenhum espaço compatível está livre. Mova primeiro uma arma equipada para o Inventário.';
      feedback.className = 'inline-feedback over';
      return;
    }
    model.weapons[slot] = clone(item.weapon);
    model.inventory.splice(itemIndex,1);
    if(model.ui.editingInventoryWeaponId === itemId) model.ui.editingInventoryWeaponId = '';
    feedback.textContent = 'Arma equipada sem criar cópias.';
    feedback.className = 'inline-feedback budget-ok';
    renderEquipment();
    saveModel();
  }
  function weaponOptions(selected,index){
    var groups = ['Leves','Versáteis','Pesadas','De Fogo'];
    var html = '<option value="">— Espaço vazio —</option><option value="custom" '+(selected === 'custom' ? 'selected' : '')+'>Arma personalizada</option>';
    groups.forEach(function(category){
      var choices = DATA.weapons.filter(function(weapon){ return weapon.category === category && weaponAllowedInSlot(weapon,index); });
      if(!choices.length) return;
      html += '<optgroup label="'+category+'">';
      choices.forEach(function(weapon){
        html += '<option value="'+weapon.id+'" '+(selected === weapon.id ? 'selected' : '')+'>'+weapon.name+'</option>';
      });
      html += '</optgroup>';
    });
    var selectedWeapon = weaponData(selected);
    if(selectedWeapon && !weaponAllowedInSlot(selectedWeapon,index)) html += '<option value="'+selectedWeapon.id+'" selected>'+selectedWeapon.name+' · incompatível com o espaço</option>';
    return html;
  }

  function renderWeapons(){
    ensureWeaponSlots();
    var allowed = allowedWeaponSlots();
    $('#weapon-slots-tag').textContent = allowed + ' EXCLUSIVOS' + (model.weapons.length > allowed ? ' · SOBRECARREGADO' : '');
    $('#weapons-list').innerHTML = model.weapons.map(function(state,index){
      var weapon = weaponData(state.weaponId);
      var max = weaponMax(state);
      state.current = clamp(state.current,0,max || 99);
      var stats = weapon ? [weapon.category,weapon.damage,weapon.severity,weapon.range,weapon.recoil ? 'Recuo: '+weapon.recoil : ''].filter(Boolean).join(' · ') : '';
      var modLimit = weapon ? (weapon.maxMods || 2) : 0;
      var mods = weapon ? applicableMods(weapon) : [];
      var modHtml = '';
      for(var modIndex=0; modIndex<modLimit; modIndex++){
        var selected = state.mods[modIndex] || '';
        modHtml += '<label>Modificação '+(modIndex+1)+'<select class="weapon-mod-select" data-mod-index="'+modIndex+'"><option value="">— Nenhuma —</option>'+mods.map(function(mod){ return '<option value="'+mod.id+'" '+(selected === mod.id ? 'selected' : '')+'>'+mod.name+' · '+mod.cost+' Partes</option>'; }).join('')+'</select></label>';
      }
      var custom = state.weaponId === 'custom' ? '<div class="custom-weapon-fields"><input class="custom-weapon-name" value="'+escapeHtml(state.customName)+'" placeholder="Nome"><input class="custom-weapon-damage" value="'+escapeHtml(state.customDamage)+'" placeholder="Ferimento / munição"><input class="custom-weapon-range" value="'+escapeHtml(state.customRange)+'" placeholder="Distância / recuo"><input class="custom-weapon-max" type="number" min="0" value="'+state.customMax+'" placeholder="Usos"></div>' : '';
      var track = max ? '<div class="weapon-track"><span>'+(weapon && weapon.durability ? 'Durabilidade' : 'Munição')+' <b>'+state.current+'/'+max+'</b></span><div class="pips weapon-pips" data-weapon-index="'+index+'">'+pipButtons(max)+'</div></div>' : '<div class="weapon-track muted">Munição carregada diretamente do Inventário.</div>';
      var invalidSlot = weapon && !weaponAllowedInSlot(weapon,index);
      var broken = weaponHasContent(state) && max > 0 && state.current === 0;
      return '<article class="weapon-card '+(index >= allowed || invalidSlot ? 'overloaded-slot ' : '')+(broken ? 'broken' : '')+'" data-weapon-index="'+index+'"><div class="weapon-card-header"><div class="weapon-card-title">Espaço '+(index+1)+' · '+weaponSlotLabel(index)+'</div><div>'+(broken ? '<span class="broken-chip">QUEBRADA</span>' : '')+(invalidSlot ? '<span class="warning-chip">Espaço incompatível</span>' : '')+'</div></div><select class="weapon-select">'+weaponOptions(state.weaponId,index)+'</select>'+custom+'<div class="weapon-stats">'+escapeHtml(stats)+'</div>'+weaponPowerDetails(weapon)+track+'<div class="weapon-mods">'+modHtml+'</div><textarea class="weapon-notes" placeholder="Anotações, munição no Inventário, reparos...">'+escapeHtml(state.notes)+'</textarea>'+(weaponHasContent(state) ? '<button type="button" class="notes-btn small weapon-to-inventory">Mover para o Inventário</button>' : '')+'</article>';
    }).join('');
    $$('#weapons-list .weapon-pips').forEach(function(group){
      var index = parseInt(group.dataset.weaponIndex,10);
      renderPips(group,model.weapons[index].current,weaponMax(model.weapons[index]));
    });
  }

  function renderArmor(){
    $('#armor-list').innerHTML = DATA.armors.map(function(item){
      var state = model.armor[item.id];
      return '<article class="armor-card '+(state.equipped ? 'equipped' : '')+'" data-armor-id="'+item.id+'"><label class="check-line"><input type="checkbox" class="armor-equipped" '+(state.equipped ? 'checked' : '')+'> <strong>'+item.name+'</strong></label><p>'+item.effect+'</p><span>Integridade '+state.remaining+'/'+item.maxUses+'</span><div class="pips armor-pips">'+pipButtons(item.maxUses)+'</div></article>';
    }).join('');
    $$('.armor-card').forEach(function(card){
      var item = DATA.armors.filter(function(entry){ return entry.id === card.dataset.armorId; })[0];
      renderPips($('.armor-pips',card),model.armor[item.id].remaining,item.maxUses);
    });
  }

  function resourceMax(){ var occ = getOccupation(); return occ && occ.resourceMax || 4; }
  function renderResources(){
    var max = resourceMax();
    var guaranteed = model.fields['ocupacao-select'] === 'Abutre' ? model.fields['abutre-resource'] : '';
    if(guaranteed && model.resources[guaranteed] < 4) model.resources[guaranteed] = 4;
    $('#res-pips-grid').innerHTML = DATA.resources.map(function(name,index){
      return '<div class="res-pip-row"><span class="skill-name">'+name+'</span><div class="pips res-pips" id="res-'+index+'" data-resource="'+name+'">'+pipButtons(max)+'</div><span class="resource-readout">'+model.resources[name]+'/'+max+'</span></div>';
    }).join('');
    $$('.res-pips').forEach(function(group){ renderPips(group,clamp(model.resources[group.dataset.resource],0,max),max); });
    $('#parts-input').value = model.parts;
  }

  function recipeLimit(){ return model.attributes.Intelecto; }
  function findInventoryIngredient(name){
    var wanted = String(name || '').trim().toLocaleLowerCase('pt-BR');
    return model.inventory.filter(function(item){
      if(isInventoryWeapon(item)) return false;
      var candidate = String(item.name || '').trim().toLocaleLowerCase('pt-BR').replace(/^\d+\s+/, '');
      return candidate === wanted || candidate === wanted + 's';
    })[0] || null;
  }
  function repairTarget(){
    var equipped = model.weapons.filter(function(state){
      var max = weaponMax(state);
      return max > 0 && state.current < max && (state.weaponId || state.customName);
    })[0];
    if(equipped) return equipped;
    var stored = model.inventory.filter(isInventoryWeapon).map(function(item){ return item.weapon; }).filter(function(state){
      var max = weaponMax(state);
      return max > 0 && state.current < max && (state.weaponId || state.customName);
    })[0];
    return stored || null;
  }
  function canCraftRecipe(recipe){
    var resourcesReady = recipe.ingredients.every(function(name){ return model.resources[name] >= 4; });
    if(!resourcesReady) return false;
    if(recipe.itemIngredient && !findInventoryIngredient(recipe.itemIngredient)) return false;
    if(recipe.id === 'conserto-arma' && !repairTarget()) return false;
    return true;
  }
  function consumeInventoryIngredient(name){
    var item = findInventoryIngredient(name);
    if(!item) return;
    var uses = parseInt(item.uses,10);
    if(uses > 1) item.uses = String(uses-1);
    else { item.kind = 'item'; item.name = ''; item.uses = ''; }
  }
  function renderRecipes(){
    if(!$('#recipe-grid')) return;
    var limit = recipeLimit();
    var known = model.knownRecipes.length;
    $('#recipe-limit-tag').textContent = 'CONHECIDAS NA CRIAÇÃO = ' + limit;
    $('#recipe-known-status').textContent = 'Conhecidas: ' + known + (model.allowCampaignRecipes ? ' · campanha liberada' : '/' + limit);
    $('#recipe-known-status').className = !model.allowCampaignRecipes && known > limit ? 'over' : '';
    $('#recipe-grid').innerHTML = DATA.recipes.map(function(recipe){
      var learned = model.knownRecipes.indexOf(recipe.id) >= 0;
      var enough = canCraftRecipe(recipe);
      return '<article class="recipe-card '+(learned ? 'known' : '')+'"><label class="check-line"><input type="checkbox" class="recipe-known" data-recipe-id="'+recipe.id+'" '+(learned ? 'checked' : '')+'> <strong>'+recipe.name+'</strong></label><div class="ingredient-list">'+recipe.ingredients.map(function(name){ return '<span>'+name+'</span>'; }).join('')+(recipe.itemIngredient ? '<span>'+recipe.itemIngredient+'</span>' : '')+'</div><p>'+recipe.effect+'</p><button type="button" class="notes-btn craft-button" data-recipe-id="'+recipe.id+'" '+(!learned || !enough ? 'disabled' : '')+'>Fabricar</button></article>';
    }).join('');
  }

  function renderEquipment(){
    if(!$('#inv-grid')) return;
    renderInventory();
    renderWeapons();
    renderArmor();
    renderResources();
    renderRecipes();
  }

  function renderCharacteristics(){
    var map = { 'vantagens-list':'vantagens', 'desvantagens-list':'desvantagens', 'cicatrizes-list':'cicatrizes' };
    Object.keys(map).forEach(function(containerId){
      var key = map[containerId];
      var list = model.characteristics[key];
      $('#' + containerId).innerHTML = list.map(function(value,index){
        return '<div class="list-input-row" data-character-type="'+key+'" data-character-index="'+index+'"><span class="list-num">'+(index+1)+'</span><div class="list-row-actions"><input type="text" value="'+escapeHtml(value)+'" placeholder="'+(key === 'vantagens' ? 'Vantagem...' : (key === 'desvantagens' ? 'Desvantagem...' : 'Cicatriz...'))+'"><button type="button" class="list-row-remove character-remove">×</button></div></div>';
      }).join('');
    });
    var advantages = model.characteristics.vantagens.filter(Boolean).length;
    var disadvantages = model.characteristics.desvantagens.filter(Boolean).length;
    var minimumDisadvantages = model.fields['ocupacao-select'] === 'Prodígio' ? 0 : 1;
    var maxAdvantages = Math.min(5,2 + Math.max(0,disadvantages-minimumDisadvantages));
    var section = $('#vantagens-list').closest('.section-body');
    var status = $('#character-status');
    if(!status){ status = document.createElement('div'); status.id = 'character-status'; status.className = 'status-line character-status'; section.insertBefore(status, section.firstChild); }
    status.textContent = 'Criação: 2 Vantagens, ' + (minimumDisadvantages ? '1 Desvantagem' : 'nenhuma Desvantagem por Prodígio') + ' e 1 Cicatriz opcional · limite atual de Vantagens: ' + maxAdvantages + ' · preenchidas: ' + advantages;
    status.classList.toggle('over',advantages > maxAdvantages || disadvantages < minimumDisadvantages);
  }

  function renderPains(){
    $('#dores-list').innerHTML = model.pains.map(function(pain,index){
      return '<div class="dor-row" data-pain-index="'+index+'"><button type="button" class="dor-check '+(pain.checked ? 'checked' : '')+'" aria-pressed="'+(pain.checked ? 'true' : 'false')+'"></button><span class="dor-label">DOR '+(index+1)+'</span><input type="text" value="'+escapeHtml(pain.text)+'" placeholder="Ex.: Eu não deixarei mais ninguém morrer..."></div>';
    }).join('');
    var checked = model.pains.filter(function(pain){ return pain.checked; }).length;
    $('#dores-list').closest('.section').classList.toggle('pain-exhausted',checked >= 3);
  }

  function conditionOptions(){
    return ['Atordoado','Desorientado','Aterrorizado','Pânico','Atraído','Enraivecido','Envenenado','Cego','Caído','Surdo','Exaustão','Clima Extremo','Corrosão','Paralisado','Em Chamas','Inconsciente','Preso','Irritação','Vulnerável','Necrose','Insolação','Sangrando','Ferida Profunda','Ferida Severa','Desmembramento','Tratado','Estabilizado','Quebrado','Infecção','Tétano'];
  }
  function renderConditions(){
    $('#condition-select').innerHTML = '<option value="">— Selecionar —</option>' + conditionOptions().map(function(name){ return '<option>'+name+'</option>'; }).join('');
    $('#condition-list').innerHTML = model.conditions.length ? model.conditions.map(function(name,index){ return '<span class="condition-chip">'+escapeHtml(name)+'<button type="button" data-condition-index="'+index+'" title="Remover">×</button></span>'; }).join('') : '<span class="empty-state">Nenhuma condição ativa.</span>';
  }
  function addCondition(name){
    name = String(name || '').trim();
    if(name && model.conditions.indexOf(name) < 0) model.conditions.push(name);
    renderConditions();
    saveModel();
  }

  function renderWounds(){
    $$('.zone').forEach(function(zone){
      var detail = model.wounds[zone.id];
      var severity = detail ? Number(detail.severity) || 0 : 0;
      zone.classList.remove('w-none','w-light','w-medium','w-severe');
      zone.classList.add(severity === 1 ? 'w-light' : (severity === 2 ? 'w-medium' : (severity === 3 ? 'w-severe' : 'w-none')));
    });
    var lines = [];
    $$('.zone').forEach(function(zone){
      var detail = model.wounds[zone.id];
      if(detail && detail.severity){
        var label = detail.severity === 1 ? 'Leve' : (detail.severity === 2 ? 'Moderado' : 'Grave');
        lines.push('<div><strong>'+escapeHtml(zone.dataset.part)+'</strong> · '+label+(detail.type ? ' · '+escapeHtml(detail.type) : '')+(detail.pf != null ? ' · '+detail.pf+' PF' : '')+(detail.condition ? ' · '+escapeHtml(detail.condition) : '')+(detail.note ? '<span>'+escapeHtml(detail.note)+'</span>' : '')+'</div>');
      }
    });
    $('#wound-summary').innerHTML = lines.length ? lines.join('') : 'Nenhum ferimento registrado.';
  }

  function woundRegion(zoneId){
    if(zoneId === 'z-cabeca') return 'Cabeça';
    if(zoneId === 'z-tronco') return 'Tronco';
    if(/braco|antebraco|mao/.test(zoneId)) return 'Braços';
    return 'Pernas';
  }
  function woundRule(type, severity, zoneId){
    if(!type || !severity) return {pf:0,condition:''};
    var region = woundRegion(zoneId);
    if(DATA.woundTable[type] && DATA.woundTable[type][region]) return clone(DATA.woundTable[type][region][severity-1]);
    var environment = {
      'Explosão':{pf:10,condition:'Caído'}, 'Corrosão':{pf:8,condition:'Corrosão'},
      'Fogo':{pf:6,condition:'Em Chamas'}, 'Veneno':{pf:4,condition:'Envenenado'},
      'Clima':{pf:0,condition:'Clima Extremo'}
    };
    return environment[type] || {pf:0,condition:''};
  }
  function armorForRegion(region){
    var item = DATA.armors.filter(function(entry){ return entry.location === region; })[0];
    if(!item) return null;
    var state = model.armor[item.id];
    return state && state.equipped && state.remaining > 0 ? {item:item,state:state} : null;
  }

  var editingZoneId = null;
  function openWoundModal(zone){
    editingZoneId = zone.id;
    var detail = model.wounds[zone.id] || {type:'',condition:'',note:'',severity:0};
    $('#wound-zone-name').textContent = zone.dataset.part;
    $('#wound-type').value = detail.type || '';
    $('#wound-condition').value = detail.condition || '';
    $('#wound-note').value = detail.note || '';
    $$('input[name="wound-severity"]').forEach(function(radio){ radio.checked = Number(radio.value) === Number(detail.severity || 0); });
    $('#wound-apply-pf').checked = !detail.severity;
    updateWoundPreview();
    $('#wound-modal').style.display = 'flex';
  }
  function closeWoundModal(){ editingZoneId = null; $('#wound-modal').style.display = 'none'; }
  function selectedWoundSeverity(){
    var checked = $('input[name="wound-severity"]:checked');
    return checked ? parseInt(checked.value,10) : 0;
  }
  function updateWoundPreview(){
    if(!editingZoneId) return;
    var rule = woundRule($('#wound-type').value,selectedWoundSeverity(),editingZoneId);
    $('#wound-rule-preview').textContent = selectedWoundSeverity() ? ('Regra base: '+rule.pf+' PF'+(rule.condition ? ' · '+rule.condition : '')+'. Armadura equipada será aplicada automaticamente.') : 'Selecione tipo e gravidade para consultar a regra.';
    if(rule.condition && !$('#wound-condition').value) $('#wound-condition').value = rule.condition;
  }

  function applyWound(){
    if(!editingZoneId) return;
    var severity = selectedWoundSeverity();
    if(!severity){ delete model.wounds[editingZoneId]; renderWounds(); saveModel(); closeWoundModal(); return; }
    var type = $('#wound-type').value;
    var rule = woundRule(type,severity,editingZoneId);
    var condition = $('#wound-condition').value || rule.condition || '';
    var pf = rule.pf;
    var armor = armorForRegion(woundRegion(editingZoneId));
    if(armor && $('#wound-apply-pf').checked){
      if(armor.item.reduction === 'todos') pf = 0;
      else pf = Math.max(0,pf-armor.item.reduction);
      condition = '';
      armor.state.remaining = Math.max(0,armor.state.remaining-1);
    }
    model.wounds[editingZoneId] = { type:type, severity:severity, condition:condition, note:$('#wound-note').value, pf:pf };
    if($('#wound-apply-pf').checked){ model.health.pf += pf; applyMasochistRelief(pf); if(condition) addCondition(condition); }
    renderWounds(); renderHealth(); renderArmor(); saveModel(); closeWoundModal();
  }

  function getSelectedNotebook(){
    return model.notes.notebooks.filter(function(nb){ return nb.id === model.notes.selectedNotebookId; })[0] || model.notes.notebooks[0];
  }
  function renderNotes(){
    $('#notes-tabs').innerHTML = model.notes.notebooks.map(function(nb){ return '<button type="button" class="notes-tab '+(nb.id === model.notes.selectedNotebookId ? 'active' : '')+'" data-notebook-id="'+nb.id+'">'+escapeHtml(nb.title || 'Novo Caderno')+'</button>'; }).join('');
    var notebook = getSelectedNotebook();
    $('#notebook-title-input').value = notebook.title || '';
    $('#notes-canvas').innerHTML = notebook.notes && notebook.notes.length ? notebook.notes.map(function(note){
      return '<article class="note-card" data-note-id="'+note.id+'"><div class="note-card-header"><input type="text" class="note-title-input" value="'+escapeHtml(note.title)+'" placeholder="Título"><button type="button" class="notes-btn small danger note-remove-btn">×</button></div><textarea class="note-content" placeholder="Anote ideias, pistas, capítulos, missões...">'+escapeHtml(note.content)+'</textarea></article>';
    }).join('') : '<div class="empty-notebook"><p>Nenhum post-it aqui ainda.</p><span>Adicione um novo post-it para começar.</span></div>';
  }

  function buildLists(){ renderCharacteristics(); renderPains(); renderNotes(); renderConditions(); }

  function renderAll(){
    applyFields();
    renderOccupation();
    renderAttributes();
    renderHealth();
    renderPC();
    renderOrigin();
    renderEquipment();
    buildLists();
    renderWounds();
    renderGrowth();
    renderRest();
    setModifier('roll-bonus',0);
    setModifier('roll-penalty',0);
    activatePage(model.ui.activePage || 'principal');
  }

  function handleAttributeClick(group, index){
    var name = Object.keys(model.attributes).filter(function(attribute){ return attributeId(attribute) === group.id; })[0];
    if(!name) return;
    var current = model.attributes[name];
    var target = current === index ? index-1 : index;
    target = clamp(target,0,5);
    if(target === 0 && Object.keys(model.attributes).some(function(other){ return other !== name && model.attributes[other] === 0; })){
      alert('Só é possível ter uma Fraqueza Absoluta por vez.'); return;
    }
    var proposed = clone(model.attributes); proposed[name] = target;
    if(attributeBudget(proposed).remaining < 0 && target > current) return;
    model.attributes[name] = target;
    if(target === 0){
      DATA.skills[name].forEach(function(skill){ if(model.originSkills.indexOf(skill) < 0) model.skills[skill] = 1; });
    }
    renderAttributes(); renderHealth(); renderOrigin(); renderEquipment(); saveModel();
  }

  function handleSkillClick(group,index){
    var skill = group.dataset.skillName;
    if(isSkillLocked(skill) || model.originSkills.indexOf(skill) >= 0 || index > 4) return;
    var current = model.skills[skill];
    var target = current === index ? Math.max(1,index-1) : index;
    var previous = model.skills[skill];
    model.skills[skill] = clamp(target,1,4);
    if(skillBudget().remaining < 0 && target > previous){ model.skills[skill] = previous; return; }
    renderSkills(); saveModel();
  }

  function handleTrackClick(group,index){
    if(group.id === 'pf-boxes'){
      var total = model.health.pf + model.health.permanentPf;
      var target = total === index ? index-1 : index;
      model.health.pf = Math.max(0,target-model.health.permanentPf);
      applyMasochistRelief(Math.max(0,target-total));
    } else {
      var peTotal = model.health.pe + model.health.permanentPe;
      var peTarget = peTotal === index ? index-1 : index;
      model.health.pe = Math.max(0,peTarget-model.health.permanentPe);
    }
    renderHealth(); saveModel();
  }

  function handleResourceClick(group,index){
    var name = group.dataset.resource;
    var current = model.resources[name];
    var target = current === index ? index-1 : index;
    if(model.fields['ocupacao-select'] === 'Abutre' && model.fields['abutre-resource'] === name) target = Math.max(4,target);
    model.resources[name] = target;
    renderResources(); renderRecipes(); saveModel();
  }

  function handleArmorPip(card,index){
    var id = card.dataset.armorId;
    var current = model.armor[id].remaining;
    model.armor[id].remaining = current === index ? index-1 : index;
    model.armor[id].equipped = model.armor[id].remaining > 0;
    renderArmor(); saveModel();
  }

  function handleWeaponPip(group,index){
    var weapon = model.weapons[parseInt(group.dataset.weaponIndex,10)];
    weapon.current = weapon.current === index ? index-1 : index;
    renderWeapons(); saveModel();
  }

  function handleInventoryWeaponPip(group,index){
    var item = model.inventory.filter(function(entry){ return entry.id === group.dataset.itemId; })[0];
    if(!item || !isInventoryWeapon(item)) return;
    item.weapon.current = item.weapon.current === index ? index-1 : index;
    renderInventory(); renderRecipes(); saveModel();
  }

  function rollDice(){
    var attribute = $('#roll-attribute').value;
    var skill = $('#roll-skill').value;
    var attributeValue = model.attributes[attribute] || 0;
    var skillValue = isSkillLocked(skill) ? 0 : (model.originSkills.indexOf(skill) >= 0 ? 5 : model.skills[skill]);
    var prodigyBonus = model.fields['ocupacao-select'] === 'Prodígio' && [model.fields['prodigio-skill-1'],model.fields['prodigio-skill-2']].indexOf(skill) >= 0 ? 1 : 0;
    var bonus = clamp((Number($('#roll-bonus').value) || 0) + prodigyBonus,0,3);
    var penalty = clamp($('#roll-penalty').value,0,3);
    var stress = $('#roll-stress').checked;
    var net = bonus - penalty + (stress ? 1 : 0);
    var count = Math.max(0,attributeValue + net);
    var results = [];
    var successes = 0;
    var penalized = count === 0;
    var desperateSuccess = false;
    if(penalized){
      var desperate = 1 + Math.floor(Math.random()*6);
      results.push(desperate);
      desperateSuccess = desperate === parseInt($('#roll-guess').value,10);
      successes = desperateSuccess ? 1 : 0;
    } else {
      for(var index=0; index<count; index++){
        var die = 1 + Math.floor(Math.random()*6); results.push(die); if(die <= skillValue) successes++;
      }
    }
    var plagueResult = null, symptom = false;
    var againstDevotee = model.fields['ocupacao-select'] === 'Devoto' && $('#roll-devotee').checked;
    if($('#roll-plague').checked){
      plagueResult = 1 + Math.floor(Math.random()*6);
      symptom = plagueResult <= currentCorruptionStage().plagueThreshold;
      if(againstDevotee) successes++;
    }
    var target = parseInt($('#roll-target').value,10) || 0;
    if(stress){ model.health.pe += 2; renderHealth(); }
    var labels = ['Falha','Sofrido','Gangrenado','Dilacerante','Profano','Absoluto'];
    var nsIndex = Math.min(5,successes);
    var passed = target ? successes >= target : null;
    var crisis = stress && target && !passed;
    var html = '<div class="roll-summary"><strong>'+labels[nsIndex]+'</strong><span>'+successes+' sucesso'+(successes === 1 ? '' : 's')+'</span>'+(passed === null ? '' : '<span class="'+(passed ? 'budget-ok' : 'over')+'">'+(passed ? 'NS alcançado' : 'NS não alcançado')+'</span>')+'</div>'+
      '<div class="dice-faces">'+results.map(function(die){ return '<span class="die '+(penalized ? (desperateSuccess ? 'success' : 'fail') : (die <= skillValue ? 'success' : 'fail'))+'">'+die+'</span>'; }).join('')+'</div>'+
      (prodigyBonus ? '<p>Dom Superior aplicou 1 Bônus a esta Perícia.</p>' : '')+
      (penalized ? '<p>Teste penalizado: o número escolhido era '+$('#roll-guess').value+'.</p>' : '')+
      (plagueResult != null ? '<p>Dado da Praga: <b>'+plagueResult+'</b> · '+(symptom ? 'provoca Sintoma de '+currentCorruptionStage().name : 'sem Sintoma')+(againstDevotee ? ' · conta como sucesso adicional; o Sintoma só se manifesta ao fim da Cena' : '')+'.</p>' : '')+
      (crisis ? '<p class="over">A Aposta de Estresse falhou: ocorre uma Crise de Estresse.</p>' : '');
    $('#roll-result').innerHTML = html;
    model.ui.lastRoll = { attribute:attribute, skill:skill, results:results, successes:successes, plague:plagueResult, at:new Date().toISOString() };
    saveModel();
  }

  function craftRecipe(id){
    var recipe = DATA.recipes.filter(function(item){ return item.id === id; })[0];
    if(!recipe || model.knownRecipes.indexOf(id) < 0) return;
    if(!canCraftRecipe(recipe)) return;
    var targetWeapon = recipe.id === 'conserto-arma' ? repairTarget() : null;
    recipe.ingredients.forEach(function(name){ model.resources[name] -= 4; });
    if(recipe.itemIngredient) consumeInventoryIngredient(recipe.itemIngredient);
    if(targetWeapon){
      targetWeapon.current = weaponMax(targetWeapon);
      renderEquipment(); saveModel(); return;
    }
    var label = recipe.id === 'flecha' ? 'Flechas' : recipe.name;
    var empty = model.inventory.filter(function(item){ return !isInventoryWeapon(item) && !item.name; })[0];
    if(empty){ empty.name = label; empty.uses = recipe.id === 'flecha' ? '2' : ''; }
    else model.inventory.push({id:uid('item'),kind:'item',name:label,uses:recipe.id === 'flecha' ? '2' : ''});
    renderEquipment(); saveModel();
  }

  function exportBackup(){
    saveModel(true);
    var blob = new Blob([JSON.stringify(model,null,2)],{type:'application/json'});
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url; link.download = 'roots-ficha-' + new Date().toISOString().slice(0,10) + '.json';
    document.body.appendChild(link); link.click(); link.remove();
    var backupButton = $('#btn-save-backup');
    if(backupButton){
      backupButton.textContent = 'Backup gerado';
      setTimeout(function(){ backupButton.textContent = 'Salvar Backup'; },1600);
    }
    setTimeout(function(){ URL.revokeObjectURL(url); },1000);
  }
  function importBackup(file){
    if(!file) return;
    var reader = new FileReader();
    reader.onload = function(){
      try{
        var parsed = JSON.parse(reader.result);
        model = parsed.version === 3 ? normalizeModel(parsed) : normalizeModel(migrateLegacy(parsed,defaultModel()));
        renderAll(); saveModel(true); alert('Backup restaurado com sucesso.');
      } catch(error){ alert('O arquivo de backup não é válido.'); }
    };
    reader.readAsText(file);
  }

  function resetSheet(){
    if(!confirm('Isso apagará todos os dados preenchidos na ficha. Continuar?')) return;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    localStorage.removeItem(LEGACY_NOTES_KEY);
    model = defaultModel();
    renderAll(); saveModel(true);
  }

  function onClick(event){
    var tab = event.target.closest('.sheet-tab');
    if(tab){ activatePage(tab.dataset.pageTarget); return; }
    var modifier = event.target.closest('.modifier-option');
    if(modifier){ setModifier(modifier.dataset.modifierInput,parseInt(modifier.dataset.value,10)); return; }
    var pip = event.target.closest('.pip');
    if(pip){
      var group = pip.closest('.pips'); var index = parseInt(pip.dataset.i,10);
      if(group.classList.contains('skill-pips')) handleSkillClick(group,index);
      else if(/^attr-/.test(group.id)) handleAttributeClick(group,index);
      else if(group.id === 'pf-boxes' || group.id === 'pe-boxes') handleTrackClick(group,index);
      else if(group.classList.contains('res-pips')) handleResourceClick(group,index);
      else if(group.classList.contains('armor-pips')) handleArmorPip(group.closest('.armor-card'),index);
      else if(group.classList.contains('inventory-weapon-pips')) handleInventoryWeaponPip(group,index);
      else if(group.classList.contains('weapon-pips')) handleWeaponPip(group,index);
      else if(group.id === 'rest-scenes-pips'){
        model.rest.scenes = model.rest.scenes === index ? index-1 : index;
        renderRest(); saveModel();
      }
      return;
    }
    var zone = event.target.closest('.zone'); if(zone){ openWoundModal(zone); return; }
    if(event.target.closest('#wound-save')){ applyWound(); return; }
    if(event.target.closest('#wound-cancel')){ closeWoundModal(); return; }
    if(event.target.closest('#roll-button')){ rollDice(); return; }
    if(event.target.closest('#roll-reset-modifiers')){ setModifier('roll-bonus',0); setModifier('roll-penalty',0); return; }
    var pcControl = event.target.closest('.pc-control-btn[data-action]');
    if(pcControl){
      var pcGain = Math.max(0, parseInt($('#pc-gain-input').value,10) || 0);
      changePC(pcControl.dataset.action === 'subtract' ? -pcGain : pcGain);
      return;
    }
    if(event.target.closest('#condition-add-button')){
      addCondition($('#condition-custom').value || $('#condition-select').value); $('#condition-custom').value=''; return;
    }
    if(event.target.closest('#masoquista-voluntary')){
      addPC(1); addCondition('Carne Voluntária — Bônus'); return;
    }
    var conditionRemove = event.target.closest('[data-condition-index]');
    if(conditionRemove){ model.conditions.splice(parseInt(conditionRemove.dataset.conditionIndex,10),1); renderConditions(); saveModel(); return; }
    if(event.target.closest('#add-inv-btn')){ model.inventory.push(emptyInventoryItem()); renderInventory(); saveModel(); return; }
    if(event.target.closest('#add-weapon-button')){ addOfficialWeapon($('#new-weapon-select').value); return; }
    var moveWeapon = event.target.closest('.weapon-to-inventory');
    if(moveWeapon){ moveWeaponToInventory(parseInt(moveWeapon.closest('.weapon-card').dataset.weaponIndex,10)); return; }
    var editStoredWeapon = event.target.closest('.inventory-weapon-edit');
    if(editStoredWeapon){var editRow=editStoredWeapon.closest('.inv-slot');model.ui.editingInventoryWeaponId=model.ui.editingInventoryWeaponId===editRow.dataset.itemId?'':editRow.dataset.itemId;renderInventory();saveModel();return;}
    var equipStoredWeapon = event.target.closest('.inventory-weapon-equip');
    if(equipStoredWeapon){ equipInventoryWeapon(equipStoredWeapon.closest('.inv-slot').dataset.itemId); return; }
    var inventoryRemove = event.target.closest('.inventory-remove');
    if(inventoryRemove){ var itemRow=inventoryRemove.closest('.inv-slot');var removedItem=model.inventory.filter(function(item){return item.id===itemRow.dataset.itemId;})[0];if(isInventoryWeapon(removedItem)&&!confirm('Excluir esta arma do Inventário? Esta ação remove a arma e suas modificações.'))return;if(model.ui.editingInventoryWeaponId===itemRow.dataset.itemId)model.ui.editingInventoryWeaponId='';model.inventory=model.inventory.filter(function(item){ return item.id!==itemRow.dataset.itemId; }); renderInventory(); renderRecipes(); saveModel(); return; }
    var characterRemove = event.target.closest('.character-remove');
    if(characterRemove){ var charRow=characterRemove.closest('.list-input-row'); model.characteristics[charRow.dataset.characterType].splice(parseInt(charRow.dataset.characterIndex,10),1); renderCharacteristics(); saveModel(); return; }
    var addCharacter = event.target.closest('.add-char-btn');
    if(addCharacter){ var key={"vantagens-list":"vantagens","desvantagens-list":"desvantagens","cicatrizes-list":"cicatrizes"}[addCharacter.dataset.list]; if(model.characteristics[key].length<5){ model.characteristics[key].push(''); renderCharacteristics(); saveModel(); } return; }
    var painCheck = event.target.closest('.dor-check');
    if(painCheck){ var painIndex=parseInt(painCheck.closest('.dor-row').dataset.painIndex,10); model.pains[painIndex].checked=!model.pains[painIndex].checked; renderPains(); saveModel(); return; }
    var craft = event.target.closest('.craft-button'); if(craft){ craftRecipe(craft.dataset.recipeId); return; }
    var parts = event.target.closest('[data-parts-delta]'); if(parts){ model.parts=Math.max(0,model.parts+parseInt(parts.dataset.partsDelta,10)); renderResources(); saveModel(); return; }
    if(event.target.closest('.add-notebook-btn')){ var nb={id:uid('notebook'),title:'Novo Caderno',notes:[{id:uid('note'),title:'Novo Post-it',content:''}]}; model.notes.notebooks.push(nb); model.notes.selectedNotebookId=nb.id; renderNotes(); saveModel(); return; }
    if(event.target.closest('.add-note-btn')){ var notebook=getSelectedNotebook(); notebook.notes.push({id:uid('note'),title:'Novo Post-it',content:''}); renderNotes(); saveModel(); return; }
    if(event.target.closest('.remove-notebook-btn')){ if(model.notes.notebooks.length<=1){alert('Mantenha pelo menos um caderno.');return;} if(confirm('Excluir este caderno e seus post-its?')){model.notes.notebooks=model.notes.notebooks.filter(function(nb){return nb.id!==model.notes.selectedNotebookId;});model.notes.selectedNotebookId=model.notes.notebooks[0].id;renderNotes();saveModel();} return; }
    var notebookTab=event.target.closest('.notes-tab'); if(notebookTab){model.notes.selectedNotebookId=notebookTab.dataset.notebookId;renderNotes();saveModel();return;}
    var noteRemove=event.target.closest('.note-remove-btn'); if(noteRemove){var noteCard=noteRemove.closest('.note-card');var selected=getSelectedNotebook();selected.notes=selected.notes.filter(function(note){return note.id!==noteCard.dataset.noteId;});renderNotes();saveModel();return;}
    if(event.target.closest('#filter-fixed-button')){selectFilterMode('fixed');var gain=Math.max(0,parseInt($('#filter-fixed-input').value,10)||0);var net=Math.max(0,gain-4);addPC(net);$('#filter-result').textContent='Redução fixa: '+gain+' PC antes do filtro, −4 PC, '+net+' PC recebidos.';return;}
    if(event.target.closest('#filter-variable-button')){selectFilterMode('variable');var diceCount=clamp($('#filter-dice-count').value,1,6);var rolls=[];for(var d=0;d<diceCount;d++)rolls.push(1+Math.floor(Math.random()*6));var discarded=diceCount>1?Math.max.apply(Math,rolls):0;var total=rolls.reduce(function(sum,value){return sum+value;},0)-discarded;addPC(total);$('#filter-result').textContent='Redução variável: '+rolls.join(', ') + (discarded?' · maior descartado: '+discarded:'')+' · '+total+' PC recebidos.';return;}
    if(event.target.closest('#filter-overload-button')){selectFilterMode('overload');model.health.permanentPf+=2;addCondition('Inconsciente');renderHealth();saveModel();$('#filter-result').textContent='Sobrecarga acionada: ganho anulado, +2 PF permanentes e Inconsciente.';return;}
    if(event.target.closest('#clear-filter-mode')){selectFilterMode('');$('#filter-result').textContent='Seleção de modo limpa; nenhum valor da ficha foi alterado.';return;}
    if(event.target.closest('#clear-corruption-filters')){if(confirm('Limpar todos os efeitos permanentemente anulados pela Pulseira?')){model.corruptionFilters=[];renderCorruption();saveModel();}return;}
    if(event.target.closest('#rest-clear-button')){model.rest.scenes=0;model.rest.actions=model.rest.actions.map(function(){return {type:'',note:''};});renderRest();saveModel();return;}
    if(event.target.closest('#btn-save-backup')){exportBackup();return;}
    if(event.target.closest('#btn-load-backup')){$('#backup-file-input').click();return;}
    if(event.target.closest('#btn-print')){window.print();return;}
    if(event.target.closest('#btn-reset')){resetSheet();return;}
  }

  function onInput(event){
    var target = event.target;
    if(target.classList.contains('modifier-number')){ setModifier(target.id,target.value); return; }
    if(target.dataset.modelField){
      if(target.tagName === 'SELECT') return;
      model.fields[target.dataset.modelField] = target.value;
      if(target.id === 'attr-bonus-manual' || target.id === 'pp-bonus-manual'){ renderAttributes(); renderOrigin(); }
      if(target.id === 'growth-stage') renderGrowth();
      saveModel(); return;
    }
    if(target.id === 'pf-permanent'){ model.health.permanentPf=Math.max(0,parseInt(target.value,10)||0);renderHealth();saveModel();return; }
    if(target.id === 'pe-permanent'){ model.health.permanentPe=Math.max(0,parseInt(target.value,10)||0);renderHealth();saveModel();return; }
    if(target.id === 'parts-input'){ model.parts=Math.max(0,parseInt(target.value,10)||0);saveModel();return; }
    var invRow=target.closest('.inv-slot');
    if(invRow){
      var item=model.inventory.filter(function(entry){return entry.id===invRow.dataset.itemId;})[0];
      if(item&&isInventoryWeapon(item)){
        var storedState=item.weapon;
        if(target.classList.contains('inventory-weapon-notes'))storedState.notes=target.value;
        if(target.classList.contains('inventory-custom-weapon-name'))storedState.customName=target.value;
        if(target.classList.contains('inventory-custom-weapon-damage'))storedState.customDamage=target.value;
        if(target.classList.contains('inventory-custom-weapon-range'))storedState.customRange=target.value;
        if(target.classList.contains('inventory-custom-weapon-max')){storedState.customMax=Math.max(0,parseInt(target.value,10)||0);storedState.current=Math.min(storedState.current,storedState.customMax);}
        saveModel();
      }else if(item){
        if(target.classList.contains('inventory-name'))item.name=target.value;
        if(target.classList.contains('inventory-uses'))item.uses=target.value;
        var used=model.inventory.filter(inventoryEntryUsed).length;
        $('#inventory-status').textContent='Ocupados: '+used+'/'+inventoryCapacity();
        $('#inventory-status').className=used>inventoryCapacity()?'over':'';
        saveModel();
      }
      return;
    }
    var charRow=target.closest('.list-input-row'); if(charRow&&target.tagName==='INPUT'){model.characteristics[charRow.dataset.characterType][parseInt(charRow.dataset.characterIndex,10)]=target.value;saveModel();return;}
    var painRow=target.closest('.dor-row'); if(painRow&&target.tagName==='INPUT'){model.pains[parseInt(painRow.dataset.painIndex,10)].text=target.value;saveModel();return;}
    var weaponCard=target.closest('.weapon-card'); if(weaponCard){var weaponState=model.weapons[parseInt(weaponCard.dataset.weaponIndex,10)];if(target.classList.contains('weapon-notes'))weaponState.notes=target.value;if(target.classList.contains('custom-weapon-name'))weaponState.customName=target.value;if(target.classList.contains('custom-weapon-damage'))weaponState.customDamage=target.value;if(target.classList.contains('custom-weapon-range'))weaponState.customRange=target.value;if(target.classList.contains('custom-weapon-max')){weaponState.customMax=Math.max(0,parseInt(target.value,10)||0);weaponState.current=Math.min(weaponState.current,weaponState.customMax);}saveModel();return;}
    var noteCard=target.closest('.note-card'); if(noteCard){var note=getSelectedNotebook().notes.filter(function(entry){return entry.id===noteCard.dataset.noteId;})[0];if(note){if(target.classList.contains('note-title-input'))note.title=target.value;if(target.classList.contains('note-content'))note.content=target.value;saveModel();}return;}
    var restCard=target.closest('.rest-action-card');if(restCard&&target.classList.contains('rest-action-note')){var restIndex=parseInt(restCard.dataset.restActionIndex,10);model.rest.actions[restIndex].note=target.value;saveModel();return;}
    if(target.id==='notebook-title-input'){getSelectedNotebook().title=target.value;renderNotes();saveModel();return;}
  }

  function onChange(event){
    var target=event.target;
    if(target.classList.contains('modifier-number')){setModifier(target.id,target.value);return;}
    if(target.id==='sangue'){
      if(model.fields['ocupacao-select']==='Devoto' && target.value!=='novo'){
        target.value='novo';
        alert('Devoto requer Sangue Novo. Troque a Ocupação antes de escolher Sangue Velho.');
        return;
      }
      model.fields.sangue=target.value;
      renderHealth();renderPC();renderOccupation();renderFlower();saveModel();return;
    }
    if(target.id==='origem-select'){
      var previous=model.fields['origem-select'];
      if(previous&&previous!==target.value&&!confirm('Trocar a Origem redefine as quatro Perícias e os Poderes escolhidos. Continuar?')){target.value=previous;return;}
      applyOrigin(target.value);return;
    }
    if(target.id==='ocupacao-select'){applyOccupation(target.value);return;}
    if(target.id==='flor-select'){model.fields['flor-select']=target.value;renderFlower();saveModel();return;}
    if(target.classList.contains('prodigio-skill')){
      var otherSkillId = target.id === 'prodigio-skill-1' ? 'prodigio-skill-2' : 'prodigio-skill-1';
      if(target.value && model.fields[otherSkillId] === target.value){ alert('Dom Superior exige duas Perícias diferentes.'); renderOccupation(); return; }
      model.fields[target.id] = target.value; saveModel(); return;
    }
    if(target.id==='abutre-resource'){
      model.fields['abutre-resource']=target.value;
      renderOccupation();renderResources();renderRecipes();saveModel();return;
    }
    if(target.dataset.modelField){model.fields[target.dataset.modelField]=target.value;if(target.id==='growth-stage')renderGrowth();if(target.id==='reputacao-select')renderParadigmStyle();saveModel();return;}
    if(target.classList.contains('origin-power-check')){
      var origin=getOrigin();if(!origin)return;var power=origin.powers.filter(function(item){return item.name===target.dataset.power;})[0];var index=model.originPowers.indexOf(power.name);if(target.checked&&index<0){var occ=getOccupation();var total=7+(occ&&occ.originPointsBonus||0);var spent=origin.powers.reduce(function(sum,item){return sum+(model.originPowers.indexOf(item.name)>=0?item.cost:0);},0);if(spent+power.cost>total){target.checked=false;alert('Pontos de Origem insuficientes.');return;}model.originPowers.push(power.name);}else if(!target.checked&&index>=0)model.originPowers.splice(index,1);renderOrigin();renderRest();saveModel();return;
    }
    if(target.classList.contains('inventory-weapon-select')){var storedCard=target.closest('.inv-slot');var storedItem=model.inventory.filter(function(item){return item.id===storedCard.dataset.itemId;})[0];if(!storedItem||!isInventoryWeapon(storedItem))return;var storedWeaponState=storedItem.weapon;storedWeaponState.weaponId=target.value;storedWeaponState.mods=[];storedWeaponState.current=weaponMax(storedWeaponState);if(target.value!=='custom'){storedWeaponState.customName='';storedWeaponState.customDamage='';storedWeaponState.customRange='';storedWeaponState.customMax=0;}renderInventory();renderRecipes();saveModel();return;}
    if(target.classList.contains('inventory-weapon-mod-select')){var storedModCard=target.closest('.inv-slot');var storedModItem=model.inventory.filter(function(item){return item.id===storedModCard.dataset.itemId;})[0];if(!storedModItem||!isInventoryWeapon(storedModItem))return;var storedModState=storedModItem.weapon;var storedModIndex=parseInt(target.dataset.modIndex,10);var storedOldMod=storedModState.mods[storedModIndex]||'';var storedNextMod=target.value;if(storedOldMod&&storedNextMod!==storedOldMod){alert('Modificações são permanentes. Apenas poderes específicos permitem removê-las.');renderInventory();return;}if(storedNextMod){var storedMod=DATA.modifications.filter(function(item){return item.id===storedNextMod;})[0];if(model.parts<storedMod.cost){alert('Partes insuficientes para instalar esta modificação.');renderInventory();return;}model.parts-=storedMod.cost;storedModState.mods[storedModIndex]=storedNextMod;storedModState.current=Math.min(storedModState.current,weaponMax(storedModState));renderEquipment();saveModel();}return;}
    if(target.classList.contains('weapon-select')){var card=target.closest('.weapon-card');var state=model.weapons[parseInt(card.dataset.weaponIndex,10)];state.weaponId=target.value;state.mods=[];state.current=weaponMax(state);if(target.value!=='custom'){state.customName='';state.customDamage='';state.customRange='';state.customMax=0;}renderWeapons();saveModel();return;}
    if(target.classList.contains('weapon-mod-select')){var modCard=target.closest('.weapon-card');var weaponState=model.weapons[parseInt(modCard.dataset.weaponIndex,10)];var modIndex=parseInt(target.dataset.modIndex,10);var old=weaponState.mods[modIndex]||'';var next=target.value;if(old&&next!==old){alert('Modificações são permanentes. Apenas poderes específicos permitem removê-las.');renderWeapons();return;}if(next){var mod=DATA.modifications.filter(function(item){return item.id===next;})[0];if(model.parts<mod.cost){alert('Partes insuficientes para instalar esta modificação.');renderWeapons();return;}model.parts-=mod.cost;weaponState.mods[modIndex]=next;renderEquipment();saveModel();}return;}
    if(target.classList.contains('armor-equipped')){var armorCard=target.closest('.armor-card');var armorItem=DATA.armors.filter(function(item){return item.id===armorCard.dataset.armorId;})[0];var armorState=model.armor[armorItem.id];armorState.equipped=target.checked;if(target.checked&&armorState.remaining===0)armorState.remaining=armorItem.maxUses;renderArmor();saveModel();return;}
    if(target.classList.contains('corruption-filter-check')){
      var stage=currentCorruptionStage();var stageKeys=stage.effects.map(function(effect){return effect.key;});var effectKey=target.dataset.effectKey;var filterIndex=model.corruptionFilters.indexOf(effectKey);
      if(target.checked&&filterIndex<0){var selectedAtStage=model.corruptionFilters.filter(function(key){return stageKeys.indexOf(key)>=0;}).length;if(selectedAtStage>=3){target.checked=false;alert('A Pulseira pode anular no máximo 3 efeitos mecânicos por nível de Corrupção.');return;}model.corruptionFilters.push(effectKey);}else if(!target.checked&&filterIndex>=0)model.corruptionFilters.splice(filterIndex,1);
      renderCorruption();saveModel();return;
    }
    if(target.classList.contains('rest-action-type')){var restActionCard=target.closest('.rest-action-card');var actionIndex=parseInt(restActionCard.dataset.restActionIndex,10);model.rest.actions[actionIndex].type=target.value;renderRest();saveModel();return;}
    if(target.classList.contains('recipe-known')){var recipeId=target.dataset.recipeId;var recipeIndex=model.knownRecipes.indexOf(recipeId);if(target.checked&&recipeIndex<0){if(!model.allowCampaignRecipes&&model.knownRecipes.length>=recipeLimit()){target.checked=false;alert('O limite de Receitas conhecidas na criação é igual ao Intelecto.');return;}model.knownRecipes.push(recipeId);}else if(!target.checked&&recipeIndex>=0)model.knownRecipes.splice(recipeIndex,1);renderRecipes();saveModel();return;}
    if(target.id==='allow-campaign-recipes'){model.allowCampaignRecipes=target.checked;renderRecipes();saveModel();return;}
    if(target.id==='backup-file-input'){if(target.files&&target.files[0])importBackup(target.files[0]);target.value='';return;}
    if(target.id==='wound-type'||target.name==='wound-severity'){updateWoundPreview();return;}
  }

  function initialize(){
    buildTabs();
    bindFields();
    buildSkills();
    document.addEventListener('click',onClick);
    document.addEventListener('input',onInput);
    document.addEventListener('change',onChange);
    window.addEventListener('pagehide',function(){saveModel(true);});
    window.addEventListener('beforeunload',function(){saveModel(true);});
    $('#footer-date').textContent='IMPRESSO EM '+new Date().toLocaleDateString('pt-BR').toUpperCase();
    renderAll();
    saveModel(true);
  }

  initialize();
})();
