(
  function(){

  var SHEET_STORAGE_KEY = 'survivor-sheet-state-v2';
  function collectSheetState(){
    var formFields = Array.prototype.slice.call(document.querySelectorAll('input[type="text"], input[type="number"], textarea, select'));
    var formValues = formFields.map(function(el){ return el.value; });
    var pipStates = Array.prototype.slice.call(document.querySelectorAll('.pips')).map(function(group){
      return {
        id: group.id || '',
        value: group.dataset.value || '0',
        origin: group.dataset.origin || '0',
        max: group.dataset.max || ''
      };
    });
    var dorStates = Array.prototype.slice.call(document.querySelectorAll('.dor-row .dor-check')).map(function(chk){
      return chk.dataset.checked || '0';
    });
    var zoneStates = {};
    document.querySelectorAll('.zone').forEach(function(z){
      zoneStates[z.id] = zoneState && zoneState[z.id] !== undefined ? zoneState[z.id] : 0;
    });
    var zoneDetailsSnapshot = {};
    document.querySelectorAll('.zone').forEach(function(z){
      try{ zoneDetailsSnapshot[z.id] = zoneDetails && zoneDetails[z.id] ? JSON.parse(JSON.stringify(zoneDetails[z.id])) : null; }catch(e){ zoneDetailsSnapshot[z.id] = null; }
    });
    return {
      version: 1,
      updatedAt: new Date().toISOString(),
      formValues: formValues,
      pipStates: pipStates,
      dorStates: dorStates,
      zoneStates: zoneStates,
      zoneDetails: zoneDetailsSnapshot,
      pc: document.getElementById('pc-input') ? document.getElementById('pc-input').value : '0',
      notes: notesState ? JSON.parse(JSON.stringify(notesState)) : null
    };
  }
  function saveSheetState(){
    try{
      localStorage.setItem(SHEET_STORAGE_KEY, JSON.stringify(collectSheetState()));
    } catch(e){
      console.warn('Não foi possível salvar a ficha automaticamente.', e);
    }
  }
  function applySnapshot(snapshot){
    if(!snapshot || !snapshot.version){ return; }
    var formFields = Array.prototype.slice.call(document.querySelectorAll('input[type="text"], input[type="number"], textarea, select'));
    if(snapshot.formValues && formFields.length){
      formFields.forEach(function(el, idx){
        if(snapshot.formValues[idx] !== undefined){
          el.value = snapshot.formValues[idx];
        }
      });
    }
    var pipGroups = Array.prototype.slice.call(document.querySelectorAll('.pips'));
    if(snapshot.pipStates && pipGroups.length){
      pipGroups.forEach(function(group, idx){
        if(snapshot.pipStates[idx]){
          group.dataset.value = snapshot.pipStates[idx].value || group.dataset.value || '0';
          group.dataset.origin = snapshot.pipStates[idx].origin || group.dataset.origin || '0';
          group.dataset.max = snapshot.pipStates[idx].max || group.dataset.max || '';
        }
      });
    }
    var dorChecks = Array.prototype.slice.call(document.querySelectorAll('.dor-row .dor-check'));
    if(snapshot.dorStates && dorChecks.length){
      dorChecks.forEach(function(chk, idx){
        if(snapshot.dorStates[idx] !== undefined){
          chk.dataset.checked = snapshot.dorStates[idx];
          chk.classList.toggle('checked', snapshot.dorStates[idx] === '1');
        }
      });
    }
    if(snapshot.zoneStates){
      Object.keys(snapshot.zoneStates).forEach(function(zoneId){
        if(zoneState && zoneState[zoneId] !== undefined){
          zoneState[zoneId] = snapshot.zoneStates[zoneId];
        }
        var zoneEl = document.getElementById(zoneId);
        if(zoneEl){ applyZoneState(zoneEl); }
      });
    }
    if(snapshot.zoneDetails){
      Object.keys(snapshot.zoneDetails).forEach(function(zoneId){
        try{
          zoneDetails[zoneId] = snapshot.zoneDetails[zoneId] ? JSON.parse(JSON.stringify(snapshot.zoneDetails[zoneId])) : null;
        }catch(e){ zoneDetails[zoneId] = null; }
        var zoneEl2 = document.getElementById(zoneId);
        if(zoneEl2){ /* no-op: details used in summary/modal */ }
      });
      updateWoundSummary();
    }
    var pcInput = document.getElementById('pc-input');
    if(pcInput && snapshot.pc !== undefined){
      pcInput.value = snapshot.pc;
    }
    if(snapshot.notes){
      notesState = snapshot.notes;
    }
  }
  function restoreSheetState(){
    try{
      var raw = localStorage.getItem(SHEET_STORAGE_KEY);
      if(!raw) return;
      applySnapshot(JSON.parse(raw));
    } catch(e){
      console.warn('Não foi possível restaurar a ficha salva.', e);
    }
  }
  function exportBackup(){
    try{
      var snapshot = collectSheetState();
      var blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.href = url;
      link.download = 'backup-ficha-sobrevivente-' + new Date().toISOString().slice(0,10) + '.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch(e){
      alert('Não foi possível exportar o backup.');
    }
  }
  function importBackup(file){
    if(!file) return;
    var reader = new FileReader();
    reader.onload = function(){
      try{
        var snapshot = JSON.parse(reader.result);
        applySnapshot(snapshot);
        localStorage.setItem(SHEET_STORAGE_KEY, JSON.stringify(snapshot));
        if(snapshot.notes){
          notesState = snapshot.notes;
          saveNotesState();
        }
        renderNotesUI();
        document.querySelectorAll('.pips').forEach(renderGroup);
        updateWoundSummary();
        updateBloodThresholds();
        setPC(parseInt(document.getElementById('pc-input').value || '0', 10));
        recomputeSkillStats();
        alert('Backup importado com sucesso.');
      } catch(e){
        alert('O arquivo de backup não é válido.');
      }
    };
    reader.readAsText(file);
  }
  var backupFileInput = document.getElementById('backup-file-input');
  if(backupFileInput){
    backupFileInput.addEventListener('change', function(e){
      if(e.target.files && e.target.files[0]){
        importBackup(e.target.files[0]);
        e.target.value = '';
      }
    });
  }
  document.getElementById('btn-save-backup').addEventListener('click', exportBackup);
  document.getElementById('btn-load-backup').addEventListener('click', function(){ if(backupFileInput){ backupFileInput.click(); } });

  var SKILLS = {
    "Físico":   ["Atletismo","Acrobacia","Força","Briga","Respiração","Esquivar","Tolerância"],
    "Destreza": ["Armas Brancas","Furtividade","Mirar","Cautela","Condução","Crime","Fuga"],
    "Intelecto":["Medicina","Planejar","Exatas","Humanas","Ciências","Mecânica","Raízologia"],
    "Instinto": ["Percepção","Intuição","Improvisar","Sobrevivência","Reflexos","Investigação","Lidar com Animais"],
    "Espírito": ["Empatia","Intimidação","Persuasão","Performance","Determinação","Coragem","Mentira"]
  };

  var RESOURCES = ["Pano","Álcool","Recipiente","Sucata","Explosivo","Fita"];

  /* ---------- build skills grid ---------- */
  var skillsGrid = document.getElementById('skills-grid');
  var skillIndex = 0;
  Object.keys(SKILLS).forEach(function(attr){
    var col = document.createElement('div');
    var title = document.createElement('div');
    title.className = 'skill-col-title';
    title.textContent = attr;
    col.appendChild(title);
    SKILLS[attr].forEach(function(name){
      skillIndex++;
      var row = document.createElement('div');
      row.className = 'skill-row';
      var id = 'sk-' + skillIndex;
      row.innerHTML =
        '<span class="skill-name">'+name+'</span>' +
        '<div class="pips skill-pips" data-value="1" data-max="4" data-origin="0" data-skill-name="'+name+'" id="'+id+'">' +
          '<button type="button" class="pip" data-i="1" title="1"></button>' +
          '<button type="button" class="pip" data-i="2" title="2"></button>' +
          '<button type="button" class="pip" data-i="3" title="3"></button>' +
          '<button type="button" class="pip" data-i="4" title="4"></button>' +
          '<button type="button" class="pip origin-pip" data-i="5" title="Perícia de Origem (+5)"></button>' +
        '</div>';
      col.appendChild(row);
    });
    skillsGrid.appendChild(col);
  });

  /* ---------- Origem: 4 perícias fixas + categoria de arma ---------- */
  var ORIGIN_DATA = {
    "Cultivador": { skills:["Raízologia","Medicina","Tolerância","Força"], weapon:"Pesadas" },
    "Camaleão":   { skills:["Performance","Acrobacia","Persuasão","Intimidação"], weapon:"Leves" },
    "Acadêmico":  { skills:["Condução","Ciências","Exatas","Improvisar"], weapon:"Versáteis" },
    "Curandeiro": { skills:["Determinação","Medicina","Cautela","Coragem"], weapon:"Leves" },
    "Líder":      { skills:["Intuição","Planejar","Reflexos","Empatia"], weapon:"Versáteis" },
    "Cronista":   { skills:["Mentira","Humanas","Investigação","Percepção"], weapon:"Leves" },
    "Renegado":   { skills:["Intimidação","Briga","Força","Tolerância"], weapon:"Pesadas" },
    "Corredor":   { skills:["Atletismo","Respiração","Condução","Furtividade"], weapon:"Leves" },
    "Gótico":     { skills:["Determinação","Performance","Empatia","Intuição"], weapon:"Versáteis" },
    "Andarilho":  { skills:["Furtividade","Fuga","Crime","Sobrevivência"], weapon:"Pesadas" },
    "Ith'Na":     { skills:["Lidar com Animais","Raízologia","Armas Brancas","Improvisar"], weapon:"Versáteis" },
    "Bélico":     { skills:["Mirar","Investigação","Cautela","Reflexos"], weapon:"De Fogo" },
    "Lutador":    { skills:["Briga","Esquivar","Acrobacia","Atletismo"], weapon:"Nenhuma" },
    "Caçador":    { skills:["Sobrevivência","Armas Brancas","Mirar","Percepção"], weapon:"Versáteis ou De Fogo" },
    "Fundador":   { skills:["Mecânica","Planejar","Ciências","Exatas"], weapon:"Pesadas" },
    "Áspide":     { skills:["Persuasão","Humanas","Mentira","Crime"], weapon:"Leves" }
  };

  function resetAllOriginSkills(){
    document.querySelectorAll('.skill-pips').forEach(function(g){
      if(g.dataset.origin === '1'){
        g.dataset.origin = '0';
        g.dataset.value = '1';
        renderGroup(g);
      }
    });
  }
  function updateOriginWeaponHint(originName){
    var hintEl = document.getElementById('origin-weapon-hint');
    if(!hintEl) return;
    var data = ORIGIN_DATA[originName];
    hintEl.textContent = data ? ('Categoria de arma inicial: ' + data.weapon) : '';
  }
  function applyOriginSkills(originName){
    resetAllOriginSkills();
    var data = ORIGIN_DATA[originName];
    if(data){
      data.skills.forEach(function(skillName){
        var g = document.querySelector('.skill-pips[data-skill-name="' + skillName + '"]');
        if(g){
          g.dataset.origin = '1';
          g.dataset.value = '5';
          renderGroup(g);
        }
      });
    }
    updateOriginWeaponHint(originName);
    recomputeSkillStats();
  }
  var origemSelect = document.getElementById('origem-select');
  if(origemSelect){
    origemSelect.addEventListener('change', function(){
      var newValue = origemSelect.value;
      var previous = origemSelect.dataset.lastValue || '';
      if(previous){
        var ok = confirm('Trocar de Origem vai resetar as 4 Perícias de Origem atuais (de "' + previous + '") e travar as novas 4 perícias fixas de "' + (newValue || '— nenhuma —') + '". Continuar?');
        if(!ok){
          origemSelect.value = previous;
          return;
        }
      }
      applyOriginSkills(newValue);
      origemSelect.dataset.lastValue = newValue;
      saveSheetState();
    });
  }

  /* ---------- build resource pips ---------- */
  var resGrid = document.getElementById('res-pips-grid');
  RESOURCES.forEach(function(name, idx){
    var row = document.createElement('div');
    row.className = 'res-pip-row';
    var id = 'res-' + idx;
    row.innerHTML =
      '<span class="skill-name">'+name+'</span>' +
      '<div class="pips res-pips" data-value="0" data-max="4" id="'+id+'">' +
        '<button type="button" class="pip" data-i="1"></button>' +
        '<button type="button" class="pip" data-i="2"></button>' +
        '<button type="button" class="pip" data-i="3"></button>' +
        '<button type="button" class="pip" data-i="4"></button>' +
      '</div>';
    resGrid.appendChild(row);
  });

  /* ---------- build weapons list ---------- */
  var weaponsList = document.getElementById('weapons-list');
  function buildWeaponCard(type, index){
    var card = document.createElement('div');
    card.className = 'weapon-card';
    card.dataset.weaponType = type;
    var titleLabel = type === 'fogo' ? 'Arma de Fogo / Disparo' : 'Arma Branca';
    var fieldsHtml = type === 'fogo' ?
      '<div class="meta-field"><label>Nome</label><input type="text"></div>' +
      '<div class="meta-field"><label>Munição</label><input type="text" placeholder="X / X"></div>' +
      '<div class="meta-field"><label>Distância</label><input type="text"></div>' +
      '<div class="meta-field"><label>Recuo</label><input type="text"></div>' :
      '<div class="meta-field"><label>Nome</label><input type="text"></div>' +
      '<div class="meta-field"><label>Ferimento</label><input type="text" placeholder="Leve–Grave"></div>' +
      '<div class="meta-field"><label>Distância</label><input type="text"></div>' +
      '<div class="meta-field"><label>Durabilidade</label><input type="text"></div>';
    card.innerHTML = '<div class="weapon-card-header"><div class="weapon-card-title">Espaço de Arma ' + index + ' — ' + titleLabel + '</div><button type="button" class="weapon-card-remove-btn" title="Remover arma">×</button></div><div class="weapon-fields">' + fieldsHtml + '</div>';
    return card;
  }
  function refreshWeaponCards(){
    if(!weaponsList) return;
    var cards = weaponsList.querySelectorAll('.weapon-card');
    cards.forEach(function(card, idx){
      var title = card.querySelector('.weapon-card-title');
      if(!title) return;
      var type = card.dataset.weaponType === 'fogo' ? 'Arma de Fogo / Disparo' : 'Arma Branca';
      title.textContent = 'Espaço de Arma ' + (idx + 1) + ' — ' + type;
    });
  }
  function addWeapon(type){
    if(!weaponsList) return;
    var nextIndex = weaponsList.querySelectorAll('.weapon-card').length + 1;
    weaponsList.appendChild(buildWeaponCard(type, nextIndex));
    refreshWeaponCards();
  }
  if(weaponsList){
    addWeapon('branca');
    addWeapon('fogo');
  }
  document.querySelectorAll('.add-weapon-btn').forEach(function(btn){
    btn.addEventListener('click', function(){ addWeapon(btn.getAttribute('data-type')); });
  });
  if(weaponsList){
    weaponsList.addEventListener('click', function(e){
      var removeBtn = e.target.closest('.weapon-card-remove-btn');
      if(!removeBtn) return;
      var card = removeBtn.closest('.weapon-card');
      if(card){
        card.remove();
        refreshWeaponCards();
      }
    });
  }

  /* ---------- build inventory slots ---------- */
  function buildInventorySlot(index){
    var slot = document.createElement('div');
    slot.className = 'inv-slot';
    slot.innerHTML = '<span class="list-num">'+String(index).padStart(2,'0')+'</span><div class="list-row-actions"><input type="text" placeholder="Item..."><button type="button" class="list-row-remove" title="Excluir">×</button></div>';
    return slot;
  }
  var invGrid = document.getElementById('inv-grid');
  for(var s=1;s<=8;s++){
    invGrid.appendChild(buildInventorySlot(s));
  }
  function refreshInventoryNumbers(){
    var slots = invGrid.querySelectorAll('.inv-slot');
    slots.forEach(function(slot, idx){
      var num = slot.querySelector('.list-num');
      if(num){ num.textContent = String(idx + 1).padStart(2,'0'); }
    });
  }
  document.getElementById('add-inv-btn').addEventListener('click', function(){
    invGrid.appendChild(buildInventorySlot(invGrid.querySelectorAll('.inv-slot').length + 1));
    refreshInventoryNumbers();
  });

  /* ---------- build vantagens / desvantagens / cicatrizes ---------- */
  function buildList(containerId, count, placeholder){
    var el = document.getElementById(containerId);
    for(var i=1;i<=count;i++){
      var row = document.createElement('div');
      row.className = 'list-input-row';
      row.innerHTML = '<span class="list-num">'+i+'</span><input type="text" placeholder="'+placeholder+'">';
      el.appendChild(row);
    }
  }
  function addListItem(containerId, placeholder){
    var el = document.getElementById(containerId);
    if(!el) return;
    var existing = el.querySelectorAll('.list-input-row').length + 1;
    var row = document.createElement('div');
    row.className = 'list-input-row';
    row.innerHTML = '<span class="list-num">'+existing+'</span><div class="list-row-actions"><input type="text" placeholder="'+placeholder+'"><button type="button" class="list-row-remove" title="Excluir">×</button></div>';
    el.appendChild(row);
    refreshListNumbers(containerId);
  }
  function refreshListNumbers(containerId){
    var el = document.getElementById(containerId);
    if(!el) return;
    var rows = el.querySelectorAll('.list-input-row');
    rows.forEach(function(row, idx){
      var num = row.querySelector('.list-num');
      if(num){ num.textContent = idx + 1; }
    });
  }
  function buildList(containerId, count, placeholder){
    var el = document.getElementById(containerId);
    for(var i=1;i<=count;i++){
      var row = document.createElement('div');
      row.className = 'list-input-row';
      row.innerHTML = '<span class="list-num">'+i+'</span><div class="list-row-actions"><input type="text" placeholder="'+placeholder+'"><button type="button" class="list-row-remove" title="Excluir">×</button></div>';
      el.appendChild(row);
    }
  }
  function addListItem(containerId, placeholder){
    var el = document.getElementById(containerId);
    if(!el) return;
    var row = document.createElement('div');
    row.className = 'list-input-row';
    row.innerHTML = '<span class="list-num">'+(el.querySelectorAll('.list-input-row').length + 1)+'</span><div class="list-row-actions"><input type="text" placeholder="'+placeholder+'"><button type="button" class="list-row-remove" title="Excluir">×</button></div>';
    el.appendChild(row);
    refreshListNumbers(containerId);
  }
  function refreshListNumbers(containerId){
    var el = document.getElementById(containerId);
    if(!el) return;
    var rows = el.querySelectorAll('.list-input-row');
    rows.forEach(function(row, idx){
      var num = row.querySelector('.list-num');
      if(num){ num.textContent = idx + 1; }
    });
  }
  buildList('vantagens-list', 5, 'Vantagem...');
  buildList('desvantagens-list', 5, 'Desvantagem...');
  buildList('cicatrizes-list', 5, 'Cicatriz...');

  document.querySelectorAll('.add-char-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      var listId = btn.getAttribute('data-list');
      var placeholder = listId === 'vantagens-list' ? 'Vantagem...' : (listId === 'desvantagens-list' ? 'Desvantagem...' : 'Cicatriz...');
      addListItem(listId, placeholder);
    });
  });

  function autoExpandTextarea(el){
    if(!el) return;
    el.style.height = 'auto';
    el.style.height = Math.max(150, el.scrollHeight) + 'px';
  }
  document.addEventListener('input', function(e){
    var input = e.target;
    if(input.matches('.note-content')){
      autoExpandTextarea(input);
    }
    if(input.matches('.list-input-row input, .inv-slot input')){
      input.style.height = 'auto';
      input.style.height = Math.max(24, input.scrollHeight) + 'px';
    }
    saveSheetState();
  });
  document.addEventListener('change', function(){
    saveSheetState();
  });
  document.addEventListener('click', function(e){
    var removeBtn = e.target.closest('.list-row-remove');
    if(!removeBtn) return;
    var row = removeBtn.closest('.list-input-row');
    var slot = removeBtn.closest('.inv-slot');
    if(row){
      row.remove();
      var listId = row.parentElement.id;
      refreshListNumbers(listId);
    }
    if(slot){
      slot.remove();
      refreshInventoryNumbers();
    }
  });

  /* ---------- build dores ---------- */
  var doresList = document.getElementById('dores-list');
  for(var d=1; d<=3; d++){
    var drow = document.createElement('div');
    drow.className = 'dor-row';
    drow.innerHTML =
      '<span class="dor-check" data-checked="0"></span>' +
      '<span class="dor-label">DOR '+d+'</span>' +
      '<input type="text" placeholder="Ex.: Eu não deixarei mais ninguém morrer...">';
    doresList.appendChild(drow);
  }
  doresList.addEventListener('click', function(e){
    var chk = e.target.closest('.dor-check');
    if(!chk) return;
    var checked = chk.dataset.checked === '1';
    chk.dataset.checked = checked ? '0' : '1';
    chk.classList.toggle('checked', !checked);
    saveSheetState();
  });

  /* ---------- generic pip rendering ---------- */
  var BASE_ATTRIBUTE_POINTS = 8;
  var ATTRIBUTE_ZERO_BONUS = 2;
  function getAttributeCost(value){
    var v = parseInt(value || '0', 10);
    return Math.max(0, v - 1);
  }
  function getAttributeMaxPoints(){
    var zeroCount = 0;
    document.querySelectorAll('.attr-row .pips').forEach(function(group){
      if(parseInt(group.dataset.value || '1', 10) === 0){ zeroCount++; }
    });
    return BASE_ATTRIBUTE_POINTS + (zeroCount * ATTRIBUTE_ZERO_BONUS);
  }
  function getManualBonus(inputId){
    var el = document.getElementById(inputId);
    return el ? (parseInt(el.value || '0', 10) || 0) : 0;
  }
  function updateAttributeBudget(){
    var spent = 0;
    var zeroCount = 0;
    document.querySelectorAll('.attr-row .pips').forEach(function(group){
      var val = parseInt(group.dataset.value || '1', 10);
      spent += getAttributeCost(val);
      if(val === 0){ zeroCount++; }
    });
    var manualBonus = getManualBonus('attr-bonus-manual');
    var maxPoints = BASE_ATTRIBUTE_POINTS + (zeroCount * ATTRIBUTE_ZERO_BONUS) + manualBonus;
    var remaining = maxPoints - spent;
    var spentEl = document.getElementById('attr-spent');
    if(spentEl){ spentEl.textContent = spent; }
    var maxEl = document.getElementById('attr-max');
    if(maxEl){ maxEl.textContent = maxPoints; }
    var remainingEl = document.getElementById('attr-remaining');
    if(remainingEl){
      remainingEl.textContent = remaining;
      remainingEl.classList.toggle('over', remaining < 0);
    }
  }

  function getTrackStageForIndex(index, stages){
    for(var i=0; i<stages.length; i++){
      if(index <= stages[i].max){
        return stages[i] || null;
      }
    }
    return stages && stages.length ? stages[stages.length - 1] : null;
  }

  function renderGroup(group){
    var val = parseInt(group.dataset.value || '0', 10);
    group.querySelectorAll('.pip').forEach(function(p){
      var i = parseInt(p.dataset.i, 10);
      var filled = i <= val;
      p.classList.toggle('filled', filled);
      p.classList.remove('stage-ok','stage-warn','stage-crit');
      if(filled && (group.id === 'pf-boxes' || group.id === 'pe-boxes')){
        var stages = group.id === 'pf-boxes' ? trackStageData.pf : trackStageData.pe;
        var stage = getTrackStageForIndex(i, stages);
        if(stage){ p.classList.add(stage.className); }
      }
    });
    group.classList.toggle('origin-active', group.dataset.origin === '1');
    var readout = group.parentElement ? group.parentElement.querySelector('.readout') : null;
    if(readout && !readout.querySelector('.track-max')){
      readout.textContent = String(val).padStart(2,'0') + '/' + group.dataset.max;
    } else if(readout){
      readout.childNodes[0].nodeValue = String(val).padStart(2,'0');
    }
    if(group.id && group.id.indexOf('attr-') === 0){
      updateAttributeBudget();
    }
  }

  document.addEventListener('click', function(e){
    var pip = e.target.closest('.pip');
    if(!pip) return;
    var group = pip.closest('.pips');
    if(!group) return;
    var i = parseInt(pip.dataset.i, 10);
    var isOriginPip = group.classList.contains('skill-pips') && i === 5;
    var isAttributeGroup = group.id && group.id.indexOf('attr-') === 0;
    var cur = parseInt(group.dataset.value || '1', 10);

    if(isOriginPip){
      var isOrigin = group.dataset.origin === '1';
      if(isOrigin){ group.dataset.origin = '0'; group.dataset.value = '1'; }
      else { group.dataset.origin = '1'; group.dataset.value = '5'; }
    } else if(isAttributeGroup){
      var targetValue = (cur === i) ? (i - 1) : i;
      targetValue = Math.max(0, Math.min(parseInt(group.dataset.max || '5', 10), targetValue));
      if(targetValue === 0 && cur !== 0){
        var alreadyZeroed = false;
        document.querySelectorAll('.attr-row .pips').forEach(function(otherGroup){
          if(otherGroup !== group && parseInt(otherGroup.dataset.value || '1', 10) === 0){ alreadyZeroed = true; }
        });
        if(alreadyZeroed){
          alert('Só é possível ter uma Fraqueza Absoluta (um único atributo em 0) por vez.');
          return;
        }
      }
      if(targetValue > cur){
        var attrValues = [];
        document.querySelectorAll('.attr-row .pips').forEach(function(attrGroup){
          var attrValue = parseInt(attrGroup.dataset.value || '1', 10);
          if(attrGroup === group){
            attrValues.push(targetValue);
          } else {
            attrValues.push(attrValue);
          }
        });
        var proposedSpent = 0;
        var proposedZeroCount = 0;
        attrValues.forEach(function(attrValue){
          proposedSpent += getAttributeCost(attrValue);
          if(attrValue === 0){ proposedZeroCount++; }
        });
        var proposedMax = BASE_ATTRIBUTE_POINTS + (proposedZeroCount * ATTRIBUTE_ZERO_BONUS) + getManualBonus('attr-bonus-manual');
        if(proposedSpent > proposedMax){
          return;
        }
      }
      group.dataset.value = String(targetValue);
    } else {
      if(group.dataset.origin === '1') return;
      group.dataset.value = (cur === i) ? (i - 1) : i;
    }
    renderGroup(group);
    saveSheetState();
    if(group.id === 'attr-intelecto' || group.classList.contains('skill-pips')){
      recomputeSkillStats();
    }
    if(group.id === 'pf-boxes'){
      updateTrackStage('pf-readout', parseInt(group.dataset.value || '0', 10), parseInt(group.dataset.max || '0', 10), trackStageData.pf);
    }
    if(group.id === 'pe-boxes'){
      updateTrackStage('pe-readout', parseInt(group.dataset.value || '0', 10), parseInt(group.dataset.max || '0', 10), trackStageData.pe);
    }
  });

  function recomputeSkillStats(){
    var basePP = 28;
    var intVal = parseInt(document.getElementById('attr-intelecto').dataset.value || '0', 10);
    var bonusMap = {0:0,1:0,2:2,3:4,4:6,5:8};
    var bonus = bonusMap[intVal] || 0;
    var manualBonus = getManualBonus('pp-bonus-manual');
    var total = basePP + bonus + manualBonus;
    var spent = 0, originCount = 0;
    document.querySelectorAll('.skill-pips').forEach(function(g){
      var val = parseInt(g.dataset.value || '0', 10);
      if(g.dataset.origin === '1'){ originCount++; }
      else { spent += Math.max(0, val - 1); }
    });
    var remaining = total - spent;
    document.getElementById('pp-bonus').textContent = bonus;
    document.getElementById('pp-total').textContent = total;
    document.getElementById('pp-spent').textContent = spent;
    var remEl = document.getElementById('pp-remaining');
    remEl.textContent = remaining;
    remEl.classList.toggle('over', remaining < 0);
    var origEl = document.getElementById('origin-count');
    origEl.textContent = originCount;
    origEl.classList.toggle('over', originCount > 4);
  }

  /* ---------- blood-based PF / PE thresholds ---------- */
  function buildBoxRow(id, max){
    var el = document.getElementById(id);
    el.innerHTML = '';
    var curVal = parseInt(el.dataset.value || '0', 10);
    el.dataset.max = max;
    if(curVal > max) curVal = max;
    el.dataset.value = curVal;
    for(var i=1;i<=max;i++){
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'pip';
      b.dataset.i = i;
      el.appendChild(b);
    }
    renderGroup(el);
  }

  function buildZones(stripId, textId, segs, labels){
    var strip = document.getElementById(stripId);
    strip.innerHTML = '';
    var classes = ['zone-ok','zone-warn','zone-crit'];
    segs.forEach(function(w, idx){
      var seg = document.createElement('div');
      seg.className = 'zone-seg ' + classes[idx];
      seg.style.flex = w;
      strip.appendChild(seg);
    });
    document.getElementById(textId).textContent = labels.join('  ·  ');
  }

  var trackStageData = {
    pf: null,
    pe: null
  };

  function updateTrackStage(trackId, value, max, stages){
    var readout = document.getElementById(trackId);
    var stageLabelEl = document.getElementById(trackId === 'pf-readout' ? 'pf-stage' : 'pe-stage');
    if(!readout || !stageLabelEl || !stages) return;

    var stageLabel = 'Nenhum';
    var stageClass = 'stage-ok';
    for(var i=0; i<stages.length; i++){
      if(value <= stages[i].max){
        stageLabel = stages[i].label;
        stageClass = stages[i].className;
        break;
      }
    }
    if(value === 0){ stageLabel = 'Nenhum'; stageClass = 'stage-ok'; }

    readout.className = 'readout ' + stageClass;
    stageLabelEl.className = 'track-stage ' + stageClass;
    stageLabelEl.textContent = 'Estágio atual: ' + stageLabel;
    readout.querySelector('.track-max') && (readout.querySelector('.track-max').className = 'track-max');
  }

  function updateBloodThresholds(){
    var sangue = document.getElementById('sangue').value;
    var pfMax, pfSegs, peMax, peSegs;
    if(sangue === 'novo'){
      pfMax = 15; pfSegs = [5,5,5];
      trackStageData.pf = [
        { max:5, label:'Machucado', className:'stage-ok' },
        { max:10, label:'Ferido', className:'stage-warn' },
        { max:15, label:'Crítico', className:'stage-crit' }
      ];
      peMax = 20; peSegs = [8,7,5];
      trackStageData.pe = [
        { max:8, label:'Estável', className:'stage-ok' },
        { max:15, label:'Instável', className:'stage-warn' },
        { max:20, label:'Desequilibrado', className:'stage-crit' }
      ];
      buildZones('pf-zones', 'pf-zones-text', pfSegs, ['Machucado 1–5','Ferido 6–10','Crítico 11–15']);
      buildZones('pe-zones', 'pe-zones-text', peSegs, ['Estável 1–8','Instável 9–15','Desequilibrado 16–20']);
    } else {
      pfMax = 20; pfSegs = [8,7,5];
      trackStageData.pf = [
        { max:8, label:'Machucado', className:'stage-ok' },
        { max:15, label:'Ferido', className:'stage-warn' },
        { max:20, label:'Crítico', className:'stage-crit' }
      ];
      peMax = 15; peSegs = [5,5,5];
      trackStageData.pe = [
        { max:5, label:'Estável', className:'stage-ok' },
        { max:10, label:'Instável', className:'stage-warn' },
        { max:15, label:'Desequilibrado', className:'stage-crit' }
      ];
      buildZones('pf-zones', 'pf-zones-text', pfSegs, ['Machucado 1–8','Ferido 9–15','Crítico 16+']);
      buildZones('pe-zones', 'pe-zones-text', peSegs, ['Estável 1–5','Instável 6–10','Desequilibrado 11–15']);
    }

    document.getElementById('pf-max-label').textContent = '/' + pfMax;
    document.getElementById('pe-max-label').textContent = '/' + peMax;
    buildBoxRow('pf-boxes', pfMax);
    buildBoxRow('pe-boxes', peMax);
    var pfValue = parseInt(document.getElementById('pf-boxes').dataset.value || '0', 10);
    var peValue = parseInt(document.getElementById('pe-boxes').dataset.value || '0', 10);
    updateTrackStage('pf-readout', pfValue, pfMax, trackStageData.pf);
    updateTrackStage('pe-readout', peValue, peMax, trackStageData.pe);
  }
  document.getElementById('sangue').addEventListener('change', updateBloodThresholds);

  /* ---------- corruption bar ---------- */
  function setPC(val){
    val = Math.max(0, Math.min(100, val));
    document.getElementById('pc-input').value = val;
    document.getElementById('pc-marker').style.left = val + '%';
    var stage;
    var stageClass = 'stage-imaculada';
    if(val >= 100){ stage = 'Corrompido'; stageClass = 'stage-corrompido'; }
    else if(val >= 80){ stage = 'Crítica'; stageClass = 'stage-critica'; }
    else if(val >= 60){ stage = 'Severa'; stageClass = 'stage-severa'; }
    else if(val >= 40){ stage = 'Alarmante'; stageClass = 'stage-alarmante'; }
    else if(val >= 20){ stage = 'Incipiente'; stageClass = 'stage-incipiente'; }
    else{ stage = 'Imaculada'; stageClass = 'stage-imaculada'; }
    var stageEl = document.getElementById('pc-stage');
    stageEl.textContent = 'Estágio atual: ' + stage;
    stageEl.className = 'pc-stage ' + stageClass;
  }
  document.getElementById('pc-bar').addEventListener('click', function(e){
    var rect = this.getBoundingClientRect();
    var pct = Math.round((e.clientX - rect.left) / rect.width * 100);
    setPC(pct);
  });
  document.querySelectorAll('.pc-control-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      var current = parseInt(document.getElementById('pc-input').value || '0', 10);
      var delta = btn.getAttribute('data-action') === 'inc' ? 1 : -1;
      setPC(Math.max(0, Math.min(100, current + delta)));
    });
  });
  document.getElementById('pc-input').addEventListener('input', function(e){
    setPC(parseInt(e.target.value || '0', 10));
  });

  /* ---------- wound diagram (with detail modal) ---------- */
  var zoneState = {};
  var zoneDetails = {};
  var currentEditingZone = null;

  // mapping for automatic condition suggestions
  var WOUND_CONDITION_MAP = {
    'Explosão': 'Caído',
    'Corrosão': 'Corrosão',
    'Fogo': 'Em Chamas',
    'Veneno': 'Envenenado',
    'Clima': 'Clima Extremo'
  };

  document.querySelectorAll('.zone').forEach(function(z){
    zoneState[z.id] = 0;
    zoneDetails[z.id] = zoneDetails[z.id] || null;
    z.addEventListener('click', function(e){
      openWoundModal(z);
    });
  });

  function applyZoneState(z){
    z.classList.remove('w-none','w-light','w-medium','w-severe');
    var s = parseInt(zoneState[z.id] || 0, 10) || 0;
    z.classList.add(s === 0 ? 'w-none' : (s === 1 ? 'w-light' : (s === 2 ? 'w-medium' : 'w-severe')));
  }

  function updateWoundSummary(){
    var list = [];
    document.querySelectorAll('.zone').forEach(function(z){
      var s = parseInt(zoneState[z.id] || 0, 10) || 0;
      if(s > 0){
        var label = s === 1 ? 'Leve' : (s === 2 ? 'Mediano' : 'Grave');
        var det = zoneDetails[z.id] || {};
        var typeLabel = det.type ? (' (' + det.type + ')') : '';
        var note = det && det.note ? ' — ' + det.note : '';
        list.push(z.dataset.part + ' — ' + label + typeLabel + note);
      }
    });
    document.getElementById('wound-summary').textContent = list.length ? list.join('  ·  ') : 'Nenhum ferimento registrado.';
  }

  // Modal behavior
  function openWoundModal(zoneEl){
    currentEditingZone = zoneEl.id;
    var title = zoneEl.dataset.part || zoneEl.id;
    document.getElementById('wound-zone-name').textContent = title;
    var det = zoneDetails[zoneEl.id] || { type:'', condition:'', note:'', severity:0 };
    document.getElementById('wound-type').value = det.type || '';
    document.getElementById('wound-condition').value = det.condition || '';
    document.getElementById('wound-note').value = det.note || '';
    var radios = document.getElementsByName('wound-severity');
    for(var i=0;i<radios.length;i++){ radios[i].checked = (parseInt(radios[i].value,10) === (det.severity||0)); }
    document.getElementById('wound-modal').style.display = 'flex';
  }
  function closeWoundModal(){
    currentEditingZone = null;
    document.getElementById('wound-modal').style.display = 'none';
  }

  document.getElementById('wound-cancel').addEventListener('click', function(){ closeWoundModal(); });
  document.getElementById('wound-save').addEventListener('click', function(){
    if(!currentEditingZone) return closeWoundModal();
    var type = document.getElementById('wound-type').value || '';
    var condition = document.getElementById('wound-condition').value || '';
    var note = document.getElementById('wound-note').value || '';
    var radios = document.getElementsByName('wound-severity');
    var severity = 0;
    for(var i=0;i<radios.length;i++){ if(radios[i].checked){ severity = parseInt(radios[i].value,10); break; } }

    // automatic condition suggestion if none selected
    if(!condition && WOUND_CONDITION_MAP[type]){ condition = WOUND_CONDITION_MAP[type]; }

    zoneState[currentEditingZone] = severity;
    if(severity === 0){
      // treat 'Nenhum' as cleared
      zoneDetails[currentEditingZone] = null;
    } else {
      zoneDetails[currentEditingZone] = { type: type, condition: condition, note: note, severity: severity };
    }
    var el = document.getElementById(currentEditingZone);
    if(el){ applyZoneState(el); }
    updateWoundSummary();
    saveSheetState();
    closeWoundModal();
  });

  // auto-update suggested condition when type changes
  document.getElementById('wound-type').addEventListener('change', function(e){
    var v = e.target.value;
    var suggested = WOUND_CONDITION_MAP[v] || '';
    if(suggested){ document.getElementById('wound-condition').value = suggested; }
  });

  /* ---------- notebooks / post-its ---------- */
  var NOTES_STORAGE_KEY = 'survivor-notes-state-v2';
  function createNotebookId(){ return 'nb-' + Date.now() + '-' + Math.floor(Math.random()*100000); }
  function createNoteId(){ return 'note-' + Date.now() + '-' + Math.floor(Math.random()*100000); }
  function escapeHtml(value){ return String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
  function loadNotesState(){
    try{
      var raw = localStorage.getItem(NOTES_STORAGE_KEY);
      if(raw){
        var parsed = JSON.parse(raw);
        if(parsed && Array.isArray(parsed.notebooks) && parsed.notebooks.length){
          return parsed;
        }
      }
    } catch(e){}
    return {
      notebooks: [
        { id:createNotebookId(), title:'História Principal', notes:[{ id:createNoteId(), title:'Resumo', content:'' }] },
        { id:createNotebookId(), title:'Anotações de Missões', notes:[{ id:createNoteId(), title:'Objetivos', content:'' }] }
      ],
      selectedNotebookId: null
    };
  }
  function saveNotesState(){
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify({ notebooks: notesState.notebooks, selectedNotebookId: notesState.selectedNotebookId }));
    saveSheetState();
  }
  var notesState = loadNotesState();
  if(!notesState.selectedNotebookId || !notesState.notebooks.some(function(nb){ return nb.id === notesState.selectedNotebookId; })){
    notesState.selectedNotebookId = notesState.notebooks[0].id;
  }
  function getSelectedNotebook(){
    return notesState.notebooks.find(function(nb){ return nb.id === notesState.selectedNotebookId; }) || notesState.notebooks[0];
  }
  function renderNotebookTabs(){
    var tabsEl = document.getElementById('notes-tabs');
    if(!tabsEl) return;
    tabsEl.innerHTML = '';
    notesState.notebooks.forEach(function(nb){
      var tab = document.createElement('button');
      tab.type = 'button';
      tab.className = 'notes-tab' + (nb.id === notesState.selectedNotebookId ? ' active' : '');
      tab.textContent = nb.title || 'Novo Caderno';
      tab.addEventListener('click', function(){
        notesState.selectedNotebookId = nb.id;
        saveNotesState();
        renderNotebookTabs();
        renderNotesCanvas();
      });
      tabsEl.appendChild(tab);
    });
  }
  function renderNotesCanvas(){
    var canvas = document.getElementById('notes-canvas');
    var titleInput = document.getElementById('notebook-title-input');
    if(!canvas || !titleInput) return;
    var notebook = getSelectedNotebook();
    if(!notebook){ return; }
    titleInput.value = notebook.title || '';
    canvas.innerHTML = '';
    if(!notebook.notes || !notebook.notes.length){
      var empty = document.createElement('div');
      empty.className = 'empty-notebook';
      empty.innerHTML = '<p>Nenhum post-it aqui ainda.</p><span>Adicione um novo post-it para começar a organizar.</span>';
      canvas.appendChild(empty);
      return;
    }
    notebook.notes.forEach(function(note){
      var card = document.createElement('article');
      card.className = 'note-card';
      card.innerHTML = '<div class="note-card-header"><input type="text" class="note-title-input" value="' + escapeHtml(note.title || 'Post-it') + '" placeholder="Título do post-it"><button type="button" class="notes-btn small danger note-remove-btn" data-note-id="' + note.id + '">×</button></div><textarea class="note-content" placeholder="Anote ideias, pistas, capítulos, missões...">' + escapeHtml(note.content || '') + '</textarea>';
      canvas.appendChild(card);
    });
    document.querySelectorAll('.note-content').forEach(autoExpandTextarea);
  }
  function renderNotesUI(){
    renderNotebookTabs();
    renderNotesCanvas();
  }
  function createNotebook(title){
    var nb = { id:createNotebookId(), title:title || 'Novo Caderno', notes:[{ id:createNoteId(), title:'Novo Post-it', content:'' }] };
    notesState.notebooks.push(nb);
    notesState.selectedNotebookId = nb.id;
    saveNotesState();
    renderNotesUI();
  }
  function addNote(){
    var notebook = getSelectedNotebook();
    if(!notebook){ return; }
    notebook.notes.push({ id:createNoteId(), title:'Novo Post-it', content:'' });
    saveNotesState();
    renderNotesCanvas();
  }
  document.querySelector('.add-notebook-btn').addEventListener('click', function(){ createNotebook('Novo Caderno'); });
  document.querySelector('.add-note-btn').addEventListener('click', function(){ addNote(); });
  document.querySelector('.remove-notebook-btn').addEventListener('click', function(){
    if(notesState.notebooks.length <= 1){
      alert('Mantenha pelo menos um caderno para organizar as anotações.');
      return;
    }
    if(confirm('Excluir este caderno e todos os seus post-its?')){
      notesState.notebooks = notesState.notebooks.filter(function(nb){ return nb.id !== notesState.selectedNotebookId; });
      notesState.selectedNotebookId = notesState.notebooks[0].id;
      saveNotesState();
      renderNotesUI();
    }
  });
  document.getElementById('notes-tabs').addEventListener('click', function(e){
    var tab = e.target.closest('.notes-tab');
    if(!tab) return;
    var id = tab.textContent;
    var notebook = notesState.notebooks.find(function(nb){ return nb.title === id; });
    if(notebook){
      notesState.selectedNotebookId = notebook.id;
      saveNotesState();
      renderNotesUI();
    }
  });
  document.getElementById('notes-canvas').addEventListener('input', function(e){
    var noteTitleInput = e.target.closest('.note-title-input');
    var noteContent = e.target.closest('.note-content');
    var notebook = getSelectedNotebook();
    if(!notebook) return;
    if(noteTitleInput){
      var noteId = noteTitleInput.closest('.note-card').querySelector('.note-remove-btn').getAttribute('data-note-id');
      var note = notebook.notes.find(function(n){ return n.id === noteId; });
      if(note){ note.title = noteTitleInput.value || 'Post-it'; saveNotesState(); }
      return;
    }
    if(noteContent){
      var noteId2 = noteContent.closest('.note-card').querySelector('.note-remove-btn').getAttribute('data-note-id');
      var note2 = notebook.notes.find(function(n){ return n.id === noteId2; });
      if(note2){ note2.content = noteContent.value; saveNotesState(); }
    }
  });
  document.getElementById('notes-canvas').addEventListener('click', function(e){
    var removeBtn = e.target.closest('.note-remove-btn');
    if(!removeBtn) return;
    var notebook = getSelectedNotebook();
    if(!notebook) return;
    notebook.notes = notebook.notes.filter(function(note){ return note.id !== removeBtn.getAttribute('data-note-id'); });
    saveNotesState();
    renderNotesCanvas();
  });
  document.getElementById('notebook-title-input').addEventListener('input', function(e){
    var notebook = getSelectedNotebook();
    if(notebook){
      notebook.title = e.target.value || 'Novo Caderno';
      saveNotesState();
      renderNotebookTabs();
    }
  });

  function resetListSection(containerId, count, placeholder){
    var el = document.getElementById(containerId);
    if(!el) return;
    el.innerHTML = '';
    for(var i=1;i<=count;i++){
      var row = document.createElement('div');
      row.className = 'list-input-row';
      row.innerHTML = '<span class="list-num">'+i+'</span><div class="list-row-actions"><input type="text" placeholder="'+placeholder+'"><button type="button" class="list-row-remove" title="Excluir">×</button></div>';
      el.appendChild(row);
    }
  }
  function resetSheetState(){
    if(!confirm('Isso apagará todos os dados preenchidos na ficha. Continuar?')) return;

    localStorage.removeItem(SHEET_STORAGE_KEY);
    localStorage.removeItem(NOTES_STORAGE_KEY);

    document.querySelectorAll('input[type="text"], input[type="number"], textarea, select').forEach(function(el){
      if(el.tagName === 'SELECT'){
        el.selectedIndex = 0;
      } else if(el.type === 'number'){
        el.value = '';
      } else {
        el.value = '';
      }
    });
    document.getElementById('sangue').value = 'velho';
    document.querySelectorAll('.pips').forEach(function(group){
      if(group.classList.contains('res-pips')){
        group.dataset.value = '0';
      } else {
        group.dataset.value = '1';
      }
      group.dataset.origin = '0';
      group.classList.remove('origin-active');
      renderGroup(group);
    });
    document.querySelectorAll('.dor-row').forEach(function(row){
      var chk = row.querySelector('.dor-check');
      if(chk){
        chk.dataset.checked = '0';
        chk.classList.remove('checked');
      }
      var input = row.querySelector('input');
      if(input){ input.value = ''; }
    });

    var weaponsList = document.getElementById('weapons-list');
    if(weaponsList){
      weaponsList.innerHTML = '';
      addWeapon('branca');
      addWeapon('fogo');
    }

    var invGrid = document.getElementById('inv-grid');
    if(invGrid){
      invGrid.innerHTML = '';
      for(var s=1;s<=8;s++){
        invGrid.appendChild(buildInventorySlot(s));
      }
    }

    resetListSection('vantagens-list', 5, 'Vantagem...');
    resetListSection('desvantagens-list', 5, 'Desvantagem...');
    resetListSection('cicatrizes-list', 5, 'Cicatriz...');

    if(typeof zoneState === 'object'){
      document.querySelectorAll('.zone').forEach(function(z){
        zoneState[z.id] = 0;
        zoneDetails[z.id] = null;
        applyZoneState(z);
      });
      updateWoundSummary();
    }

    document.getElementById('pc-input').value = '0';
    setPC(0);
    updateBloodThresholds();
    recomputeSkillStats();

    notesState = loadNotesState();
    if(!notesState.selectedNotebookId || !notesState.notebooks.some(function(nb){ return nb.id === notesState.selectedNotebookId; })){ 
      notesState.selectedNotebookId = notesState.notebooks[0].id;
    }
    renderNotesUI();
    saveSheetState();
  }

  /* ---------- toolbar ---------- */
  document.getElementById('btn-print').addEventListener('click', function(){ window.print(); });
  document.getElementById('btn-reset').addEventListener('click', resetSheetState);

  /* ---------- footer date ---------- */
  document.getElementById('footer-date').textContent = 'IMPRESSO EM ' + new Date().toLocaleDateString('pt-BR').toUpperCase();

  /* ---------- init ---------- */
  window.addEventListener('beforeunload', saveSheetState);
  window.addEventListener('pagehide', saveSheetState);
  restoreSheetState();
  document.querySelectorAll('.pips').forEach(renderGroup);
  updateWoundSummary();
  updateBloodThresholds();
  setPC(parseInt(document.getElementById('pc-input').value || '0', 10));
  recomputeSkillStats();
  renderNotesUI();
  saveSheetState();

})();
