'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname,'..');
const read = file => fs.readFileSync(path.join(root,file),'utf8');

test('sistema visual global carrega antes das folhas específicas',()=>{
  const html = read('index.html');
  const system = html.indexOf('dossier-system.css');
  const survivor = html.indexOf('dashboard-ui.css');
  const bag = html.indexOf('bag-ui.css');
  assert.ok(system >= 0,'dossier-system.css deve estar carregado');
  assert.ok(system < survivor,'o sistema deve carregar antes do layout do Sobrevivente');
  assert.ok(survivor < bag,'a Bolsa deve poder especializar a base compartilhada');
});

test('contrato visual expõe tokens e componentes reutilizáveis',()=>{
  const css = read('dossier-system.css');
  for(const token of [
    '--dossier-surface','--dossier-border','--dossier-accent','--dossier-text',
    '--dossier-space-4','--dossier-radius','--dossier-shadow','--dossier-focus',
    '--dossier-paper-ink','--dossier-neon-amber','--dossier-neon-cyan','--dossier-neon-violet'
  ]) assert.match(css,new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
  for(const component of [
    'dossier-panel','dossier-panel__title','dossier-card','dossier-paper',
    'dossier-field','dossier-button','dossier-chip','dossier-marker',
    'dossier-expansion','dossier-empty','dossier-feedback'
  ]) assert.match(css,new RegExp('\\.'+component.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?:[\\s:{.,]|$)'));
});

test('Bolsa consome a base comum sem redefinir a paleta do Sobrevivente',()=>{
  const bagCss = read('bag-ui.css');
  const dashboardCss = read('dashboard-ui.css');
  const script = read('script.js');
  assert.doesNotMatch(bagCss,/--(?:panel|text|line|green)(?:-[\w-]+)?\s*:/);
  assert.doesNotMatch(dashboardCss,/--rota-(?:charcoal|ink|panel|bronze|gold|text)\s*:/);
  assert.match(script,/dossier-secondary-page/);
  assert.match(script,/section dossier-panel/);
  assert.match(script,/weapon-dossier dossier-card/);
  assert.match(script,/bag-empty dossier-empty/);
});
