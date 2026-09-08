'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Exercita os caminhos reais de criação/restauração sem inicializar a interface.
const context = vm.createContext({console, localStorage:{getItem(){return null;}}});
context.window = context;
for (const file of ['rules-data.js', 'automation-engine.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), context);
}
const source = fs.readFileSync(path.join(__dirname, '..', 'script.js'), 'utf8');
assert.ok(source.includes('  initialize();'));
vm.runInContext(source.replace('  initialize();', '  window.identityModelTest = {defaultModel, normalizeModel};'), context);
const plain = value => JSON.parse(JSON.stringify(value));
const {defaultModel, normalizeModel} = context.identityModelTest;

test('fichas novas começam com três vantagens, duas desvantagens e uma cicatriz', () => {
  assert.deepEqual(plain(defaultModel().characteristics), {
    vantagens:['','',''], desvantagens:['',''], cicatrizes:['']
  });
});

test('restauração preserva listas antigas, campos vazios e textos completos', () => {
  const saved = plain(defaultModel());
  saved.characteristics = {
    vantagens:['Percepção aguçada em ambientes escuros', ''],
    desvantagens:['Obcecado por investigação'],
    cicatrizes:['Uma cicatriz extensa\nno braço esquerdo', 'Ausente']
  };
  saved.fields['nome-sobrevivente'] = 'Maria das Graças de Albuquerque e Vasconcelos';
  const before = JSON.stringify(saved);
  const restored = plain(normalizeModel(saved));
  assert.deepEqual(restored.characteristics, saved.characteristics);
  assert.equal(restored.fields['nome-sobrevivente'], saved.fields['nome-sobrevivente']);
  assert.equal(JSON.stringify(saved), before, 'restaurar não deve mutar a entrada');
});

test('3/2/1 não limita listas existentes nem repõe campos removidos', () => {
  for (const vantagens of [[], ['A','B','C','D','E']]) {
    const saved = {characteristics:{vantagens, desvantagens:[], cicatrizes:[]}};
    assert.deepEqual(plain(normalizeModel(saved).characteristics), saved.characteristics);
  }
});
