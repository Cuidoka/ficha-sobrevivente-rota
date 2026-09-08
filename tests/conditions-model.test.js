'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function setup(){
  const controls = {
    '#condition-feedback':{},
    '#wound-type':{value:'Corte'},
    'input[name="wound-severity"]:checked':{value:'3'},
    '#wound-note':{value:'Observação revisada'},
    '#wound-apply-pf':{checked:false},
    '#wound-ignore-first-defense':{checked:false},
    '#wound-rule-preview':{classList:{remove(){}}}
  };
  const context = vm.createContext({console,localStorage:{getItem(){return null;}},document:{querySelector(selector){return controls[selector] || null;}}});
  context.window = context;
  for(const file of ['rules-data.js','automation-engine.js']) vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),context);
  const source = fs.readFileSync(path.join(__dirname,'..','script.js'),'utf8');
  assert.ok(source.includes('  initialize();'));
  vm.runInContext(source.replace('  initialize();', `
    renderConditions = renderWounds = renderHealth = renderArmor = saveModel = closeWoundModal = function(){};
    window.conditionTest = {
      addCondition, applyWound, derivedWoundConditions,
      get model(){return model;},
      edit(zone,id){editingZoneId=zone;editingWoundId=id;}
    };
  `),context);
  return {api:context.conditionTest,controls};
}

test('condição derivada não cria cópia manual, mesmo com variação de caixa',()=>{
  const {api,controls} = setup();
  api.model.wounds['z-tronco']=[{id:'w1',condition:'Sangrando',conditionApplied:true,armorBlocked:false,severity:1}];
  api.addCondition(' sangrando ');
  assert.equal(api.model.conditions.length,0);
  assert.equal(api.derivedWoundConditions().length,1);
  assert.match(controls['#condition-feedback'].textContent,/já vem de um ferimento/);
});

test('busca manual reconhece nome oficial e impede duplicata',()=>{
  const {api} = setup();
  api.addCondition('quebrado');
  api.addCondition('QUEBRADO');
  assert.equal(api.model.conditions.length,1);
  assert.equal(api.model.conditions[0],'Quebrado');
});

test('editar observações preserva Quebrado e os demais ferimentos da região',()=>{
  const {api} = setup();
  api.model.wounds['z-tronco']=[
    {id:'w1',type:'Corte',severity:1,pf:5,condition:'Sangrando',conditionApplied:true},
    {id:'w2',type:'Corte',severity:3,pf:7,condition:'Quebrado',conditionApplied:true,conditionTicks:0,toleranceResolved:true,rulesApplied:true}
  ];
  api.edit('z-tronco','w2');
  api.applyWound();
  assert.equal(api.model.wounds['z-tronco'].length,2);
  assert.equal(api.model.wounds['z-tronco'][0].condition,'Sangrando');
  const updated=api.model.wounds['z-tronco'][1];
  assert.equal(updated.condition,'Quebrado');
  assert.equal(updated.conditionApplied,true);
  assert.equal(updated.note,'Observação revisada');
  assert.equal(updated.pf,7);
});
