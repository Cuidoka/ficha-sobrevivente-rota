'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function setup(){
  const context = vm.createContext({console,localStorage:{getItem(){return null;}}});
  context.window = context;
  for(const file of ['rules-data.js','automation-engine.js']) vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),context);
  const source = fs.readFileSync(path.join(__dirname,'..','script.js'),'utf8');
  vm.runInContext(source.replace('  initialize();', `
    renderConsolidatedPowers = renderConditions = saveModel = function(){};
    window.validation = {parseBackup,defaultModel,prodigySkills,occupationChoiceControls,
      addTemporaryEffect,activeRollEffects,consumeNextTestEffects,advanceScope,
      get model(){return model;}};
  `),context);
  return context.validation;
}

test('backup inválido é recusado sem alterar a ficha em uso',()=>{
  const api=setup();
  api.model.fields['nome-sobrevivente']='Ficha preservada';
  for(const invalid of [null,[],{},42,{version:4,fields:[]}]) assert.throws(()=>api.parseBackup(invalid));
  assert.equal(api.model.fields['nome-sobrevivente'],'Ficha preservada');
});

test('backup atual e legado preservam identificação e características',()=>{
  const api=setup(), saved=api.defaultModel();
  saved.fields['nome-sobrevivente']='Graça — investigação';
  saved.fields['prodigio-skill-3']='Força';
  saved.characteristics.vantagens=['Longa descrição\nsegunda linha'];
  const restored=api.parseBackup(JSON.parse(JSON.stringify(saved)));
  assert.equal(restored.fields['nome-sobrevivente'],saved.fields['nome-sobrevivente']);
  assert.equal(restored.fields['prodigio-skill-3'],'Força');
  assert.equal(restored.characteristics.vantagens[0],saved.characteristics.vantagens[0]);
  const formValues=Array(33).fill('');formValues[1]='Ficha antiga';formValues[18]='Atento';formValues[23]='Obcecado';
  const legacy=api.parseBackup({formValues});
  assert.equal(legacy.fields['nome-sobrevivente'],'Ficha antiga');
  assert.equal(legacy.characteristics.vantagens[0],'Atento');
  assert.equal(legacy.characteristics.desvantagens[0],'Obcecado');
});

test('Dom Superior inclui a terceira perícia e preserva as duas escolhas antigas',()=>{
  const api=setup();
  api.model.fields['prodigio-skill-1']='Atletismo';
  api.model.fields['prodigio-skill-2']='Acrobacia';
  assert.equal(api.prodigySkills().length,2);
  api.model.fields['prodigio-skill-3']='Força';
  assert.equal(api.prodigySkills().indexOf('Força'),2);
  const html=api.occupationChoiceControls('Prodígio');
  assert.equal((html.match(/<select /g)||[]).length,3);
  assert.match(html,/Ambiente ou Terreno/);
});

test('Aprendizado Rápido não acumula, só vale para teste igual e termina na Cena',()=>{
  const api=setup();
  const effect={sourceKey:'aprendizado',bonus:1,expires:'use-scene',allTests:false,attribute:'Físico',skill:'Força'};
  api.addTemporaryEffect(effect);api.addTemporaryEffect(effect);
  assert.equal(api.activeRollEffects('Físico','Força').length,1);
  api.consumeNextTestEffects('Físico','Atletismo');
  assert.equal(api.model.effects.length,1);
  api.consumeNextTestEffects('Físico','Força');
  assert.equal(api.model.effects.length,0);
  api.addTemporaryEffect(effect);
  api.advanceScope('scene');
  assert.equal(api.model.effects.length,0);
});
