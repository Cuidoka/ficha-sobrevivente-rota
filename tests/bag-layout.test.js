'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function setup(){
  const controls = {};
  for(const id of ['inv-grid','bag-stored-weapons','bag-ammunition','inventory-capacity-tag','inventory-status','initial-items-status','weapon-add-feedback']) controls['#'+id]={};
  const context = vm.createContext({console,localStorage:{getItem(){return null;}},document:{
    querySelector(selector){return controls[selector] || null;},
    querySelectorAll(){return [];}
  }});
  context.window = context;
  for(const file of ['rules-data.js','automation-engine.js']) vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),context);
  const source = fs.readFileSync(path.join(__dirname,'..','script.js'),'utf8');
  vm.runInContext(source.replace('  initialize();', `
    renderEquipment = renderInventory; saveModel = function(){};
    window.bagTest = {renderInventory,moveWeaponToInventory,equipInventoryWeapon,weaponStateFromId,weaponPresentation,weaponTrackHtml,weaponFactsHtml,
      emptyInventoryItem,get model(){return model;}};
  `),context);
  return {api:context.bagTest,controls};
}

test('bolsa separa armas, munição e utilitários sem duplicar nem reordenar os dados',()=>{
  const {api,controls}=setup();
  api.model.inventory=[
    {id:'tool',kind:'item',name:'Corda',uses:'3'},
    {id:'stored',kind:'weapon',weapon:api.weaponStateFromId('canivete')},
    {id:'ammo',kind:'ammo',ammoId:'flechas',name:'Flechas',quantity:4,charges:0}
  ];
  const before=JSON.stringify(api.model.inventory);
  api.renderInventory();
  assert.equal(JSON.stringify(api.model.inventory),before);
  const expected={'inv-grid':'tool','bag-stored-weapons':'stored','bag-ammunition':'ammo'};
  for(const [container,id] of Object.entries(expected)){
    assert.deepEqual([...controls['#'+container].innerHTML.matchAll(/<(?:article|div) class="inv-slot[^>]*data-item-id="([^"]+)"/g)].map(match=>match[1]),[id]);
  }
  assert.equal(controls['#inventory-status'].textContent,'Ocupados: 3/3');
});

test('cartão diferencia arma quebrada de munição esgotada e usos personalizados',()=>{
  const {api}=setup();
  const blade=api.weaponStateFromId('canivete'); blade.current=0;
  const pistol=api.weaponStateFromId('pistola'); pistol.current=0;
  const bow=api.weaponStateFromId('arco');
  const custom=api.weaponStateFromId('custom'); custom.customMax=2; custom.current=0;
  assert.equal(api.weaponPresentation(blade).status,'Quebrada');
  assert.equal(api.weaponPresentation(pistol).status,'Sem munição');
  assert.equal(api.weaponPresentation(bow).status,'');
  assert.equal(api.weaponPresentation(custom).status,'Sem usos');
  assert.match(api.weaponTrackHtml(bow,'equipped',1),/Flechas usadas diretamente da reserva/);
});

test('detalhes de armas personalizadas escapam conteúdo e mantêm os valores completos',()=>{
  const {api}=setup();
  const custom=api.weaponStateFromId('custom');
  custom.customName='<nome>';custom.customDamage='<impacto>';custom.customRange='Muito longe';custom.customMax=5;custom.current=3;
  assert.match(api.weaponFactsHtml(custom),/&lt;impacto&gt;/);
  assert.match(api.weaponFactsHtml(custom),/Muito longe/);
  assert.match(api.weaponTrackHtml(custom,'inventory','w1'),/aria-label="Usos de &lt;nome&gt;"/);
  assert.match(api.weaponTrackHtml(custom,'inventory','w1'),/3<small> \/ 5/);
});

test('espaços vazios não provocam sobrecarga falsa; excesso real continua destacado',()=>{
  const {api,controls}=setup();
  api.model.inventory=[api.emptyInventoryItem(),api.emptyInventoryItem(),api.emptyInventoryItem(),
    {id:'stored',kind:'weapon',weapon:api.weaponStateFromId('canivete')}];
  api.renderInventory();
  assert.equal(controls['#inventory-status'].textContent,'Ocupados: 1/3');
  assert.doesNotMatch(controls['#bag-stored-weapons'].innerHTML,/overloaded-slot/);
  api.model.inventory.slice(0,3).forEach((item,i)=>{item.name='Ferramenta '+i;});
  api.renderInventory();
  assert.match(controls['#inventory-status'].textContent,/Ocupados: 4\/3 · Sobrecarregado/);
  assert.match(controls['#bag-stored-weapons'].innerHTML,/overloaded-slot/);
});

test('guardar e reequipar preserva durabilidade, modificações e notas sem criar cópia',()=>{
  const {api,controls}=setup();
  const state=api.weaponStateFromId('canivete');
  state.current=3; state.mods=['leve-empunhadura']; state.notes='Arma herdada';
  api.model.weapons[0]=state;
  const before=JSON.stringify(state);
  api.moveWeaponToInventory(0);
  const stored=api.model.inventory.find(item=>item.kind==='weapon');
  assert.ok(stored);
  assert.equal(JSON.stringify(stored.weapon),before);
  assert.match(controls['#bag-stored-weapons'].innerHTML,/Arma herdada|Canivete/);
  api.equipInventoryWeapon(stored.id);
  assert.equal(JSON.stringify(api.model.weapons[0]),before);
  assert.equal(api.model.inventory.filter(item=>item.kind==='weapon').length,0);
  assert.match(controls['#bag-stored-weapons'].innerHTML,/Nenhuma arma guardada/);
});
