(function(root, factory){
  'use strict';
  var api = factory();
  if(typeof module === 'object' && module.exports) module.exports = api;
  if(root) root.ROOTS_ENGINE = api;
})(typeof window !== 'undefined' ? window : globalThis, function(){
  'use strict';

  var CRISIS_TABLE = [
    {min:1,max:1,key:'desmaio',name:'Desmaio',condition:'Inconsciente',description:'Fica Inconsciente temporariamente.'},
    {min:2,max:3,key:'descontrole',name:'Descontrole',condition:'',description:'Por um Turno, ataca a pessoa mais próxima com o maior ferimento temporário que puder causar, seja Aliado ou não.'},
    {min:4,max:5,key:'fuga',name:'Fuga',condition:'',description:'Foge desesperadamente; todos que presenciarem a fuga irracional recebem +3 PE.'},
    {min:6,max:6,key:'gritar',name:'Gritar',condition:'',description:'Todos ao redor recebem +2 PE imediatamente.'},
    {min:7,max:9,key:'soltar',name:'Soltar',condition:'',description:'Larga imediatamente um item ou arma de seu Inventário, escolhido pelo MP.'},
    {min:10,max:11,key:'esconder',name:'Esconder',condition:'',description:'Procura abrigo e tenta se esconder da fonte de estresse.'},
    {min:12,max:12,key:'tremedeira',name:'Tremedeira',condition:'',description:'Sofre Penalidade em testes físicos temporariamente.'},
    {min:13,max:13,key:'reflexo',name:'Reflexo',condition:'Vulnerável',description:'Fica Vulnerável temporariamente.'},
    {min:14,max:Infinity,key:'controle',name:'Controle',condition:'',description:'Mantém o controle, não sofre consequência externa e conclui uma Rolagem Engatilhada, caso exista.'}
  ];

  function number(value, fallback){
    var parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : (fallback == null ? 0 : fallback);
  }

  function clamp(value, min, max){
    return Math.max(min, Math.min(max, number(value)));
  }

  function pfStage(total, limit, segments){
    total = Math.max(0,number(total));
    limit = Math.max(1,number(limit,20));
    segments = Array.isArray(segments) && segments.length >= 2 ? segments : [Math.ceil(limit * .4),Math.ceil(limit * .75),limit];
    if(total === 0) return {key:'none',name:'Nenhum'};
    if(total <= segments[0]) return {key:'hurt',name:'Machucado'};
    if(total <= segments[1]) return {key:'wounded',name:'Ferido'};
    if(total <= limit) return {key:'critical',name:'Crítico'};
    if(total <= limit + 5) return {key:'dying',name:'Morrendo',overflow:total-limit};
    return {key:'dead',name:'Morte Direta',overflow:total-limit};
  }

  function stressStage(total, limit, segments){
    total = Math.max(0,number(total));
    limit = Math.max(1,number(limit,15));
    segments = Array.isArray(segments) && segments.length >= 2 ? segments : [Math.ceil(limit / 3),Math.ceil(limit * 2 / 3),limit];
    if(total === 0) return {key:'none',name:'Nenhum',eventCap:4,crisisShift:0};
    if(total <= segments[0]) return {key:'stable',name:'Estável',eventCap:4,crisisShift:0};
    if(total <= segments[1]) return {key:'unstable',name:'Instável',eventCap:6,crisisShift:2};
    if(total < limit) return {key:'unbalanced',name:'Desequilibrado',eventCap:Infinity,crisisShift:3};
    return {key:'breaking',name:'Enlouquecendo',eventCap:Infinity,crisisShift:3};
  }

  function determinationRange(successes, target){
    successes = Math.max(0,Math.floor(number(successes)));
    target = Math.max(0,Math.floor(number(target)));
    var deficit = Math.max(0,target-successes);
    if(deficit === 0) return {deficit:0,min:0,max:0,label:'Nenhum PE'};
    if(deficit === 1) return {deficit:1,min:1,max:3,label:'1–3 PE'};
    if(deficit === 2) return {deficit:2,min:4,max:6,label:'4–6 PE'};
    if(deficit === 3) return {deficit:3,min:7,max:9,label:'7–9 PE'};
    return {deficit:deficit,min:10,max:12,label:'10–12 PE',sameAsFourth:deficit >= 5};
  }

  function capStressGain(requested, stage, determined){
    requested = Math.max(0,Math.floor(number(requested)));
    var cap = stage && Number.isFinite(stage.eventCap) ? stage.eventCap : Infinity;
    if(determined) cap = Math.min(cap,4);
    return {requested:requested,applied:Math.min(requested,cap),prevented:Math.max(0,requested-cap),cap:cap};
  }

  function crisisOutcome(rolledSum, stage){
    var shift = stage && number(stage.crisisShift) || 0;
    var adjusted = Math.max(1,Math.floor(number(rolledSum))+shift);
    var outcome = CRISIS_TABLE.filter(function(entry){ return adjusted >= entry.min && adjusted <= entry.max; })[0] || CRISIS_TABLE[CRISIS_TABLE.length-1];
    return {
      rolled:Math.floor(number(rolledSum)),
      shift:shift,
      adjusted:adjusted,
      key:outcome.key,
      name:outcome.name,
      condition:outcome.condition,
      description:outcome.description
    };
  }

  function deathTest(round, roll){
    round = Math.max(1,Math.floor(number(round,1)));
    roll = clamp(Math.floor(number(roll,1)),1,6);
    return {round:round,roll:roll,threshold:Math.min(6,round),dead:roll <= Math.min(6,round)};
  }

  function woundOutcome(woundTable, type, region, severity){
    severity = clamp(Math.floor(number(severity)),1,3);
    var row = woundTable && woundTable[type] && woundTable[type][region];
    var rule = row && row[severity-1];
    if(!rule) return {pf:0,condition:'',type:type || '',region:region || '',severity:severity};
    return {
      pf:Math.max(0,Math.floor(number(rule.pf))),
      condition:String(rule.condition || ''),
      type:String(type || ''),
      region:String(region || ''),
      severity:severity
    };
  }

  function usageScope(description){
    var value = String(description || '').toLocaleLowerCase('pt-BR');
    var scopes = [
      {key:'arc',label:'Arco',pattern:/(?:uma|1)\s+(?:única\s+)?vez\s+por arco/},
      {key:'session',label:'Sessão',pattern:/(?:uma|1)\s+(?:única\s+)?vez\s+por sess[aã]o/},
      {key:'cycle',label:'Ciclo',pattern:/(?:uma|1)\s+(?:única\s+)?vez\s+por ciclo/},
      {key:'scene',label:'Cena',pattern:/(?:uma|1)\s+(?:única\s+)?vez\s+por cena|at[eé]\s+\d+\s+provis[oõ]es\s+por cena/},
      {key:'conflict',label:'Conflito',pattern:/(?:uma|1)\s+(?:única\s+)?vez\s+por conflito|uma amea[cç]a morta por conflito/},
      {key:'round',label:'Rodada',pattern:/(?:uma|1)\s+(?:única\s+)?vez\s+por rodada/},
      {key:'survivor',label:'Sobrevivente',pattern:/(?:uma|1)\s+(?:única\s+)?vez\s+por sobrevivente/}
    ];
    return scopes.filter(function(scope){ return scope.pattern.test(value); })[0] || {key:'manual',label:'Uso livre / manual'};
  }

  function powerKey(sourceType, sourceName, powerName){
    return [sourceType,sourceName,powerName].map(function(value){
      return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    }).join(':');
  }

  function rollPool(count, threshold, random){
    count = Math.max(0,Math.floor(number(count)));
    threshold = clamp(Math.floor(number(threshold)),0,6);
    random = typeof random === 'function' ? random : Math.random;
    var results = [], successes = 0;
    for(var index=0;index<count;index++){
      var die = clamp(Math.floor(random()*6)+1,1,6);
      results.push(die);
      if(threshold > 0 && die <= threshold) successes++;
    }
    return {results:results,successes:successes};
  }

  function rollPlagueDice(count, threshold, random){
    count = clamp(Math.floor(number(count)),0,3);
    threshold = clamp(Math.floor(number(threshold)),0,6);
    var roll = rollPool(count,threshold,random);
    return {
      count:count,
      threshold:threshold,
      results:roll.results,
      symptomCount:roll.successes,
      symptomResults:roll.results.filter(function(die){ return threshold > 0 && die <= threshold; })
    };
  }

  function normalizeAmmoName(value){
    var normalized = String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    if(/flecha/.test(normalized)) return 'flechas';
    if(/cartucho/.test(normalized)) return 'cartuchos';
    if(/pente/.test(normalized)) return 'pentes';
    if(/tanque|combustivel/.test(normalized)) return 'tanques';
    if(/carga/.test(normalized)) return 'cargas';
    if(/bala|municao/.test(normalized)) return 'balas';
    return normalized.replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  }

  function growthTotals(track, claimedStages, postCapArcs, postCompletionRewards){
    var claimed = Array.isArray(claimedStages) ? claimedStages.map(Number) : [];
    var totals = {originPoints:0,skillPoints:0,attributePoints:0};
    if(track && Array.isArray(track.stages)){
      track.stages.forEach(function(stage,index){
        var level = number(stage.stage,index+1);
        if(claimed.indexOf(level) < 0) return;
        var rewards = stage.rewards || {};
        totals.originPoints += number(rewards.originPoints != null ? rewards.originPoints : rewards.po);
        totals.skillPoints += number(rewards.skillPoints != null ? rewards.skillPoints : rewards.pp);
        totals.attributePoints += number(rewards.attributePoints != null ? rewards.attributePoints : rewards.pa);
      });
    }
    var arcs = Math.max(0,Math.floor(number(postCapArcs)));
    var arcRewards = postCompletionRewards || {originPoints:2,skillPoints:2};
    totals.originPoints += arcs * number(arcRewards.originPoints);
    totals.skillPoints += arcs * number(arcRewards.skillPoints);
    totals.postCapArcs = arcs;
    return totals;
  }

  return {
    CRISIS_TABLE:CRISIS_TABLE,
    clamp:clamp,
    pfStage:pfStage,
    stressStage:stressStage,
    determinationRange:determinationRange,
    capStressGain:capStressGain,
    crisisOutcome:crisisOutcome,
    deathTest:deathTest,
    woundOutcome:woundOutcome,
    usageScope:usageScope,
    powerKey:powerKey,
    rollPool:rollPool,
    rollPlagueDice:rollPlagueDice,
    normalizeAmmoName:normalizeAmmoName,
    growthTotals:growthTotals
  };
});
