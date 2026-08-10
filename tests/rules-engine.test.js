'use strict';

const assert = require('node:assert/strict');

global.window = global;
require('../rules-data.js');
const engine = require('../automation-engine.js');
const data = global.ROOTS_DATA;

function names(list){ return list.map((entry) => entry.name); }
function unique(list){ return new Set(list).size === list.length; }

assert.equal(Object.keys(data.origins).length, 16, 'devem existir 16 Origens');
assert.equal(Object.keys(data.occupations).length, 13, 'devem existir 13 Ocupações');
Object.entries(data.origins).forEach(([name, origin]) => {
  assert.equal(origin.powers.length, 10, `${name} deve ter 10 poderes compráveis`);
  assert.ok(origin.initial && origin.initial.name, `${name} precisa de poder inicial`);
});
Object.entries(data.occupations).forEach(([name, occupation]) => {
  assert.equal(occupation.powers.length, 3, `${name} deve ter 3 poderes`);
});
assert.ok(names(data.origins.Renegado.powers).some((name) => name.toLocaleLowerCase('pt-BR') === 'banho de sangue'), 'Banho de Sangue deve estar no Renegado');
assert.ok(names(data.origins.Renegado.powers).includes('Carnificina'), 'Carnificina deve estar no Renegado');

const addedFlowers = ['Raflésia','Dama da Noite','Papoula','Lírio da Morte','Margarida','Lótus'];
assert.equal(Object.keys(data.flowers).length, 18, 'todas as Flores da Corrupção devem estar cadastradas');
addedFlowers.forEach((name) => assert.ok(data.flowers[name], `${name} deve estar cadastrada`));
Object.entries(data.flowers).forEach(([name, flower]) => {
  assert.equal(flower.stages.length, 5, `${name} deve ter cinco estágios`);
  assert.ok(unique(flower.stages.map((stage) => stage.name)), `${name} não pode repetir poderes`);
});
const titan = data.flowers['Jarro-Titã'];
assert.ok(titan.specialRules.description.includes('não pode ser manobrado'), 'Jarro-Titã precisa informar a imunidade a manobras');
assert.ok(titan.specialRules.deactivation.includes('Dormir por 8 Cenas'), 'Jarro-Titã precisa manter a trava de reativação');
assert.deepEqual(titan.stages.map((stage) => stage.stats.fixedPf), [11,12,13,14,15], 'PF fixo do Jarro-Titã deve seguir o livro');
assert.deepEqual(titan.stages.map((stage) => stage.stats.reduction), [5,6,7,8,9], 'Redução do Jarro-Titã deve seguir o livro');

assert.equal(data.commonItems.length, 26, 'catálogo de itens comuns incompleto');
assert.ok(unique(data.commonItems.map((item) => item.id)), 'IDs de itens comuns devem ser únicos');
data.commonItems.forEach((item) => {
  assert.ok(item.uses && item.uses.label, `${item.name} precisa explicar seus usos`);
  assert.ok(item.uses.max === null || Number.isInteger(item.uses.max) && item.uses.max > 0, `${item.name} precisa ter limite positivo ou uso ilimitado`);
  if(item.uses.max !== null) assert.ok(item.uses.unit, `${item.name} precisa informar a unidade de uso`);
});

assert.equal(data.conditionCategories.length, 6, 'devem existir seis categorias de Condições');
assert.equal(data.conditionDurations.length, 5, 'devem existir cinco durações oficiais');
assert.equal(data.conditions.length, 48, 'catálogo oficial de Condições incompleto');
assert.ok(unique(data.conditions.map((condition) => condition.name)), 'Condições não podem estar duplicadas');
const conditionCategoryIds = new Set(data.conditionCategories.map((category) => category.id));
data.conditions.forEach((condition) => {
  assert.ok(condition.name && condition.description && condition.impact && condition.duration, `${condition.name || 'Condição sem nome'} precisa de Descrição, Impacto e Duração`);
  assert.ok(conditionCategoryIds.has(condition.category), `${condition.name} usa uma categoria inexistente`);
});
const conditionByName = Object.fromEntries(data.conditions.map((condition) => [condition.name, condition]));
assert.ok(conditionByName.Gangrena, 'Gangrena deve constar entre as Doenças');
assert.match(conditionByName.Necrose.impact,/3 Ciclos/,'Necrose deve avançar a cada 3 Ciclos');
assert.doesNotMatch(conditionByName.Necrose.impact,/4 Ciclos/,'a regra antiga de Necrose não pode permanecer');
assert.match(conditionByName.Cego.duration,/Permanente/,'Cego pode ser Persistente ou Permanente');
assert.match(conditionByName.Surdo.duration,/Permanente/,'Surdo pode ser Persistente ou Permanente');
assert.match(conditionByName.Desmembramento.impact,/Braço Perdido/,'Desmembramento precisa descrever a perda de braço');
assert.match(conditionByName.Desmembramento.impact,/Perna Perdida/,'Desmembramento precisa descrever a perda de perna');
assert.match(conditionByName.Ventania.impact,/6 – Lufada/,'Ventania precisa conter os seis resultados');
assert.match(conditionByName['Raízes Vivas'].impact,/6 – Presas/,'Raízes Vivas precisa conter os seis resultados');
assert.equal(data.conditionInteractions.processes.length,3,'interações de Condições incompletas');
assert.equal(data.conditionInteractions.escalations.length,4,'escaladas naturais incompletas');

assert.equal(data.ammunitionTypes.length, 6, 'catálogo de munições incompleto');
assert.ok(unique(data.ammunitionTypes.map((ammo) => ammo.id)), 'IDs de munição devem ser únicos');
assert.deepEqual(names(data.ammunitionTypes), ['Balas','Cartuchos','Pentes','Flechas','Combustível','Cargas']);

assert.equal(data.paradigms.length, 9, 'matriz de Paradigmas incompleta');
assert.deepEqual(names(data.paradigms), [
  'Guardião','Justo','Messias','Peregrino','Sobrevivente','Imperfeito','Ceifador','Mercenário','Inquisidor'
]);
assert.equal(data.reputationRules.initialParadigm, 'Sobrevivente');
assert.match(data.reputationRules.overview, /pública, impessoal/i, 'Reputação precisa explicar seu caráter público');
assert.match(data.reputationRules.consistentAction, /Apenas sobreviver/i, 'Bônus de Reputação precisa excluir ações corriqueiras');
assert.match(data.reputationRules.change, /um único gesto/i, 'mudança de Reputação precisa exigir um padrão');
assert.ok(unique(data.paradigms.map((paradigm) => `${paradigm.row}:${paradigm.column}`)), 'cada Paradigma precisa ocupar uma posição única na matriz');
data.paradigms.forEach((paradigm) => {
  assert.ok(paradigm.description && paradigm.positive && paradigm.negative, `${paradigm.name} precisa de descrição e efeitos`);
  assert.ok(paradigm.description.length >= 240, `${paradigm.name} precisa manter a descrição completa do livro`);
  assert.ok(paradigm.focus && paradigm.path, `${paradigm.name} precisa informar Caminho e foco`);
});

const trackNames = ['Terra Viva','Cães de Guerra','Donos da Razão','Línguas de Ferro'];
trackNames.forEach((name) => {
  const track = data.growthTracks[name];
  assert.equal(track.stages.length, 10, `${name} deve ter etapas I–X`);
  assert.deepEqual(track.stages.map((stage) => stage.stage), [1,2,3,4,5,6,7,8,9,10]);
  assert.deepEqual(track.stages[9].rewards, {}, `a etapa X de ${name} não concede PO/PP imediato`);
});
assert.equal(data.growthTracks['Cães de Guerra'].stages[2].unlockOrigin.scope, 'same-archetype');
assert.equal(data.growthTracks['Donos da Razão'].stages[2].unlockOrigin.scope, 'any-archetype');
assert.equal(data.growthTracks['Línguas de Ferro'].stages[5].unlockOrigin.scope, 'same-archetype');
assert.match(data.growthTracks['Donos da Razão'].stages[0].effects[0], /maior e qual é o menor/, 'Leitura Inicial deve revelar os dois extremos do Atributo');
assert.match(data.growthTracks['Línguas de Ferro'].stages[1].effects[0], /1D6 Ciclos/, 'Frase Marcada deve usar o prazo da versão atualizada');
assert.doesNotMatch(data.growthTracks['Línguas de Ferro'].stages[1].effects[0], /1D4 dias/, 'o prazo antigo de Frase Marcada não pode permanecer');

let woundRuleCount = 0;
Object.values(data.woundTable).forEach((regions) => {
  assert.deepEqual(Object.keys(regions), ['Cabeça','Tronco','Pernas','Braços']);
  Object.values(regions).forEach((rules) => {
    assert.equal(rules.length, 3);
    rules.forEach((rule) => {
      woundRuleCount += 1;
      assert.ok(rule.pf > 0 && typeof rule.condition === 'string', 'cada ferimento precisa declarar PF e eventual Condição');
    });
  });
});
assert.equal(woundRuleCount, 36, 'tabela somática deve ter 36 resultados');

assert.equal(engine.pfStage(15,15,[5,10,15]).key, 'critical');
assert.equal(engine.pfStage(16,15,[5,10,15]).key, 'dying');
assert.equal(engine.pfStage(20,15,[5,10,15]).key, 'dying');
assert.equal(engine.pfStage(21,15,[5,10,15]).key, 'dead');
assert.equal(engine.pfStage(20,20,[8,15,20]).key, 'critical');
assert.equal(engine.pfStage(25,20,[8,15,20]).key, 'dying');
assert.equal(engine.pfStage(26,20,[8,15,20]).key, 'dead');

assert.equal(engine.stressStage(5,15,[5,10,15]).key, 'stable');
assert.equal(engine.stressStage(6,15,[5,10,15]).key, 'unstable');
assert.equal(engine.stressStage(11,15,[5,10,15]).key, 'unbalanced');
assert.equal(engine.stressStage(15,15,[5,10,15]).key, 'breaking');
assert.equal(engine.stressStage(8,20,[8,15,20]).key, 'stable');
assert.equal(engine.stressStage(9,20,[8,15,20]).key, 'unstable');
assert.equal(engine.stressStage(16,20,[8,15,20]).key, 'unbalanced');
assert.equal(engine.stressStage(20,20,[8,15,20]).key, 'breaking');

assert.deepEqual(engine.determinationRange(3,3), {deficit:0,min:0,max:0,label:'Nenhum PE'});
assert.deepEqual([1,2,3].map((deficit) => {
  const range = engine.determinationRange(0,deficit);
  return [range.min,range.max];
}), [[1,3],[4,6],[7,9]]);
assert.deepEqual([4,5].map((deficit) => {
  const range = engine.determinationRange(0,deficit);
  return [range.min,range.max];
}), [[10,12],[10,12]], 'cinco níveis abaixo deve repetir a faixa de quatro níveis abaixo');
assert.equal(engine.determinationRange(0,5).sameAsFourth, true);
assert.equal(engine.capStressGain(8,engine.stressStage(3,15,[5,10,15]),false).applied, 4);
assert.equal(engine.capStressGain(8,engine.stressStage(7,15,[5,10,15]),false).applied, 6);
assert.equal(engine.capStressGain(8,engine.stressStage(12,15,[5,10,15]),false).applied, 8);
assert.equal(engine.capStressGain(8,engine.stressStage(12,15,[5,10,15]),true).applied, 4);

assert.equal(engine.crisisOutcome(1,{crisisShift:0}).key, 'desmaio');
assert.equal(engine.crisisOutcome(1,{crisisShift:2}).key, 'descontrole');
assert.equal(engine.crisisOutcome(7,{crisisShift:0}).name, 'Soltar');
assert.equal(engine.crisisOutcome(12,{crisisShift:0}).name, 'Tremedeira');
assert.equal(engine.crisisOutcome(2,{crisisShift:0}).condition, '', 'Descontrole não é uma Condição oficial');
assert.equal(engine.crisisOutcome(7,{crisisShift:0}).condition, '', 'Soltar não é uma Condição oficial');
assert.equal(engine.crisisOutcome(13,{crisisShift:0}).condition, 'Vulnerável');
assert.equal(engine.crisisOutcome(11,{crisisShift:3}).key, 'controle');
assert.equal(engine.deathTest(1,1).dead, true);
assert.equal(engine.deathTest(1,2).dead, false);
assert.equal(engine.deathTest(6,6).dead, true);

const plagueRandom = [0,.3,.99];
const plagueRoll = engine.rollPlagueDice(4,2,() => plagueRandom.shift());
assert.deepEqual(plagueRoll.results,[1,2,6]);
assert.equal(plagueRoll.count,3,'Dados da Praga devem ter limite máximo de 3');
assert.equal(plagueRoll.symptomCount,2,'cada Dado da Praga dentro da faixa deve gerar um Sintoma');
assert.deepEqual(plagueRoll.symptomResults,[1,2]);
assert.deepEqual(engine.rollPlagueDice(-2,6,() => 0).results,[],'zero Dados da Praga não deve rolar dados');

assert.equal(engine.usageScope('Uma vez por Ciclo, faça algo.').key, 'cycle');
assert.equal(engine.usageScope('Uma única vez por Sobrevivente.').key, 'survivor');
assert.equal(engine.usageScope('Uma Ameaça morta por Conflito.').key, 'conflict');
assert.equal(engine.usageScope('Use até 2 Provisões por Cena de Recuperação.').key, 'scene');
assert.equal(engine.normalizeAmmoName('Tanque de Combustível'), 'tanques');
assert.equal(engine.normalizeAmmoName('Munição solta'), 'balas');

const postCompletionRewards = data.growthTracks.rules.postCompletionRewards;
const oneArcTotals = engine.growthTotals(data.growthTracks['Cães de Guerra'],[1,2,3,4,5,6,7,8,9,10],1,postCompletionRewards);
const growthTotals = engine.growthTotals(data.growthTracks['Cães de Guerra'],[1,2,3,4,5,6,7,8,9,10],2,postCompletionRewards);
assert.deepEqual(growthTotals, {originPoints:25,skillPoints:9,attributePoints:6,postCapArcs:2});
assert.equal(growthTotals.originPoints-oneArcTotals.originPoints,2,'cada novo Arco após X deve conceder exatamente +2 PO');
assert.equal(growthTotals.skillPoints-oneArcTotals.skillPoints,2,'cada novo Arco após X deve conceder exatamente +2 PP');

console.log('OK — regras, catálogos e limites validados.');
