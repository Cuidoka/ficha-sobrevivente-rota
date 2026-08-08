(function(){
  'use strict';

  var DATA = window.ROOTS_DATA;
  var ENGINE = window.ROOTS_ENGINE;
  if(!ENGINE){ throw new Error('ROOTS_ENGINE nao foi carregado.'); }
  if(!DATA){ throw new Error('ROOTS_DATA não foi carregado.'); }

  var STORAGE_KEY = 'roots-survivor-state-v4';
  var PREVIOUS_STORAGE_KEY = 'roots-survivor-state-v3';
  var LEGACY_STORAGE_KEY = 'survivor-sheet-state-v2';
  var LEGACY_NOTES_KEY = 'survivor-notes-state-v2';
  var saveTimer = null;

  var BODY_ZONE_LABELS = [
    {id:'z-cabeca',key:'cabeca',label:'Cabeça'},
    {id:'z-tronco',key:'tronco',label:'Tronco'},
    {id:'z-braco-d',key:'braco-d',label:'Braço Direito'},
    {id:'z-braco-e',key:'braco-e',label:'Braço Esquerdo'},
    {id:'z-perna-d',key:'perna-d',label:'Perna Direita'},
    {id:'z-perna-e',key:'perna-e',label:'Perna Esquerda'}
  ];
  var BODY_WOUND_GROUPS = {
    'z-cabeca':['z-cabeca'],
    'z-tronco':['z-tronco'],
    'z-braco-d':['z-braco-d','z-antebraco-d','z-mao-d'],
    'z-braco-e':['z-braco-e','z-antebraco-e','z-mao-e'],
    'z-perna-d':['z-perna-d','z-coxa-d','z-panturrilha-d','z-pe-d'],
    'z-perna-e':['z-perna-e','z-coxa-e','z-panturrilha-e','z-pe-e']
  };
  var NEED_RULES = {
    hunger:{
      label:'Fome', action:'Comer', max:4,
      levels:[
        {name:'Atendida',effect:'Sem penalidades.'},
        {name:'1º dia',effect:'Penalidade em Intelecto e Físico.'},
        {name:'2º dia',effect:'2 Penalidades em Intelecto e Físico; Penalidade em Espírito.'},
        {name:'3º dia',effect:'3 Penalidades em Intelecto e Físico; Penalidade em Espírito e Destreza; perca 1 PF por Cena.'},
        {name:'4º dia',effect:'Entre em Estado de Morrendo.'}
      ]
    },
    thirst:{
      label:'Sede', action:'Beber', max:3,
      levels:[
        {name:'Atendida',effect:'Sem penalidades.'},
        {name:'1º dia',effect:'Penalidade em Físico e Destreza.'},
        {name:'2º dia',effect:'2 Penalidades em Físico e Destreza; Penalidade em Espírito; perca 1 PF por Cena.'},
        {name:'3º dia',effect:'Entre em Estado de Morrendo.'}
      ]
    },
    sleep:{
      label:'Sono', action:'Dormir', max:4,
      levels:[
        {name:'Atendido',effect:'Sem penalidades.'},
        {name:'1º dia',effect:'Penalidade em Intelecto e Destreza.'},
        {name:'2º dia',effect:'2 Penalidades em Intelecto; Penalidade em Destreza e Instinto.'},
        {name:'3º dia',effect:'2 Penalidades em Intelecto; Penalidade em Destreza, Instinto e Espírito; perca 1 PE por Cena.'},
        {name:'4º dia',effect:'Caia Inconsciente por 2D6+6 Cenas.'}
      ]
    }
  };
  var RELATIONSHIP_LEVELS = {
    '-5':{name:'Ameaça',description:'Busca a destruição do Sobrevivente a qualquer custo.'},
    '-4':{name:'Hostil',description:'Evita os Sobreviventes e age contra eles quando possível.'},
    '-3':{name:'Indesejado',description:'Desconfia abertamente e pode difamá-los.'},
    '-2':{name:'Desconfiado',description:'Mantém cautela e reluta em ajudar.'},
    '-1':{name:'Reservado',description:'Indiferente, mas aberto à persuasão.'},
    '0':{name:'Neutro',description:'Sem opinião formada; reage conforme as ações iniciais.'},
    '1':{name:'Cordial',description:'Mostra disposição amigável e abertura ao diálogo.'},
    '2':{name:'Amigável',description:'Oferece ajuda simples e compartilha informações.'},
    '3':{name:'Leal',description:'Confia nos Sobreviventes e aceita arriscar-se por eles.'},
    '4':{name:'Aliado',description:'Considera os Sobreviventes amigos valiosos e oferece apoio significativo.'},
    '5':{name:'Irmão',description:'Demonstra lealdade absoluta e aceita grandes sacrifícios.'}
  };
  var CONDITION_CATEGORIES = [
    {id:'mental',label:'Mentais',description:'Afetam percepção, raciocínio e emoções.'},
    {id:'physical',label:'Físicas',description:'Afetam diretamente corpo, músculos e órgãos.'},
    {id:'treated',label:'Tratadas',description:'Sequelas de uma condição física estancada ou curada.'},
    {id:'disease',label:'Doenças',description:'Enfermidades, infecções e contaminações.'},
    {id:'terrain',label:'Terreno',description:'Originam-se da superfície onde o Sobrevivente pisa.'},
    {id:'environment',label:'Ambiente',description:'Originam-se do clima, atmosfera ou espaço ao redor.'}
  ];
  var CONDITION_LIBRARY = [
    {name:'Atordoado',category:'mental',duration:'Temporária',summary:'Não pode realizar Reações.'},
    {name:'Desorientado',category:'mental',duration:'Temporária',summary:'Após cada ação, role 1D6; em 1–3, a ação falha.'},
    {name:'Aterrorizado',category:'mental',duration:'Persistente',summary:'Não pode se aproximar da fonte do medo e sofre Penalidade enquanto estiver Perto dela.'},
    {name:'Pânico',category:'mental',duration:'Sem duração indicada',summary:'Sofre uma Crise de Estresse.'},
    {name:'Atraído',category:'mental',duration:'Vinculada / Persistente',summary:'Deve mover-se até a fonte e não pode realizar outras ações durante o efeito.'},
    {name:'Enraivecido',category:'mental',duration:'Persistente',summary:'Deve aproximar-se e atacar a fonte; Bônus em ações agressivas e Penalidade nas defensivas.'},

    {name:'Envenenado',category:'physical',duration:'Contínua',summary:'Sofre 2 PF no início de cada turno.'},
    {name:'Cego',category:'physical',duration:'Persistente',summary:'Penalidade em todas as rolagens que dependam da visão.'},
    {name:'Imune',category:'physical',duration:'Temporária',summary:'Ignora os Ferimentos ou Condições especificados pelo efeito.'},
    {name:'Caído',category:'physical',duration:'Persistente',summary:'Não pode se mover nem atacar Corpo a Corpo; ataques Corpo a Corpo contra o Alvo recebem Bônus.'},
    {name:'Surdo',category:'physical',duration:'Persistente',summary:'Penalidade em todas as rolagens que dependam da audição.'},
    {name:'Exaustão',category:'physical',duration:'Contínua',summary:'Penalidade em todas as rolagens de Físico e impede ações de grande esforço físico.'},
    {name:'Clima Extremo',category:'physical',duration:'Vinculada',summary:'Penalidade em todos os testes de Destreza e Físico.'},
    {name:'Corrosão',category:'physical',duration:'Contínua → Tratado',summary:'Sofre 1 PF por turno; a cada turno, 1–2 em 1D6 faz a arma perder 1 de Durabilidade.'},
    {name:'Paralisado',category:'physical',duration:'Persistente',summary:'Não pode realizar qualquer ação.'},
    {name:'Em Chamas',category:'physical',duration:'Contínua → Tratado',summary:'Sofre 2 PF por turno e Penalidade em Intelecto, Instinto e Espírito; pode incendiar quem estiver Em Contato.'},
    {name:'Inconsciente',category:'physical',duration:'Persistente',summary:'Não pode realizar Ações nem Reações.'},
    {name:'Preso',category:'physical',duration:'Persistente / Vinculada',summary:'Não pode se mover nem realizar Reações.'},
    {name:'Irritação',category:'physical',duration:'Vinculada',summary:'Perde Ação Principal e Secundária tossindo; nas rodadas seguintes, sofre 1 PF por turno.'},
    {name:'Vulnerável',category:'physical',duration:'Contínua',summary:'Todas as ações para atacar o Alvo recebem Bônus.'},
    {name:'Necrose',category:'physical',duration:'Permanente',summary:'A cada 4 Ciclos perde 1 PF Permanente; usar a área afetada sofre Penalidade e pode evoluir para Desmembramento.'},
    {name:'Insolação',category:'physical',duration:'Contínua',summary:'Sofre 1 PF no início de cada Cena, além de tontura, náusea e confusão; deve esfriar-se para tratar.'},
    {name:'Sangrando',category:'physical',duration:'Contínua → Tratado',summary:'Sofre 1 PF no início do turno e Penalidade em Espírito; após 4 Cenas/Rodadas, Tolerância (Dilacerante) ou fica Inconsciente.'},
    {name:'Ferida Profunda',category:'physical',duration:'Contínua → Estabilizado',summary:'Sofre 2 PF no início do turno e Penalidade em Físico, Destreza e Espírito; após 3 Cenas/Rodadas, Tolerância (Dilacerante) ou fica Inconsciente.'},
    {name:'Ferida Severa',category:'physical',duration:'Contínua → Quebrado',summary:'Sofre 3 PF no início do turno e Penalidade em Destreza, Físico, Intelecto e Espírito; após 2 Cenas/Rodadas, Tolerância (Dilacerante) ou fica Inconsciente.'},
    {name:'Desmembramento',category:'physical',duration:'Contínua / Permanente',summary:'Perde a função do membro, sofre Penalidade pela dor, perde 4 PF Permanentes e sofre 3 PF por turno até tratar o sangramento.'},

    {name:'Tratado',category:'treated',duration:'Permanente',summary:'Testes que usem a área afetada sofrem Penalidade.'},
    {name:'Estabilizado',category:'treated',duration:'Permanente',summary:'Testes que usem a área afetada sofrem 2 Penalidades.'},
    {name:'Quebrado',category:'treated',duration:'Permanente',summary:'Testes que usem a área afetada falham automaticamente; na cabeça, estresse súbito também exige Determinação.'},

    {name:'Gripe',category:'disease',duration:'Contínua',summary:'Penalidade em Instinto e Destreza; Furtividade recebe uma Penalidade extra por tosse e espirros.'},
    {name:'Virose',category:'disease',duration:'Contínua',summary:'Vomita aleatoriamente durante o Ciclo; em Conflito, perde o turno.'},
    {name:'Cólera',category:'disease',duration:'Contínua',summary:'Precisa do dobro de Água para saciar-se; fontes de Água contam pela metade.'},
    {name:'Kuru',category:'disease',duration:'Permanente',summary:'Penalidade em Intelecto e Instinto; no início de cada Ciclo, role 1D6 para os sintomas.'},
    {name:'Radiação',category:'disease',duration:'Permanente',summary:'Reduz Físico, Destreza e Instinto pela metade; vomita aleatoriamente e, em Conflito, perde o turno.'},
    {name:'Infecção',category:'disease',duration:'Contínua',summary:'Penalidade em Físico; a recuperação de PF após a cura é reduzida pela metade.'},
    {name:'Tétano',category:'disease',duration:'Contínua',summary:'Ao realizar ação física intensa, role 1D6; em 1–3, sofre espasmos e Penalidade.'},
    {name:'Diabetes',category:'disease',duration:'Permanente',summary:'Sofre episódios aleatórios de tontura, tremores, visão embaçada e fraqueza súbita.'},

    {name:'Irregular',category:'terrain',duration:'Vinculada',summary:'Ações que envolvam movimento recebem Penalidade.'},
    {name:'Alagado',category:'terrain',duration:'Vinculada',summary:'Movimento reduzido pela metade.'},
    {name:'Cortante',category:'terrain',duration:'Vinculada',summary:'Movimentar-se causa 1 PF.'},
    {name:'Instável',category:'terrain',duration:'Vinculada',summary:'Cada ação exige Acrobacia (Sofrido) para evitar queda, afundamento ou colapso.'},
    {name:'Escorregadio',category:'terrain',duration:'Vinculada',summary:'Ao mover-se, teste Acrobacia; em falha, perde o turno e fica Caído.'},

    {name:'Ar Impróprio',category:'environment',duration:'Vinculada',summary:'A cada Rodada, Respiração (Gangrenado); em falha, sofre Irritação.'},
    {name:'Escuro',category:'environment',duration:'Vinculada',summary:'Penalidade em todas as ações que dependam da visão.'},
    {name:'Chuvoso',category:'environment',duration:'Vinculada',summary:'Penalidade em Percepção e movimentos rápidos; itens sem proteção ficam inutilizados até secarem.'},
    {name:'Ventania',category:'environment',duration:'Vinculada',summary:'Ao fim de cada Rodada, role 1D6 para determinar o efeito da rajada.'},
    {name:'Raízes Vivas',category:'environment',duration:'Vinculada',summary:'Ao movimentar-se, role 1D6 para determinar a reação das raízes.'}
  ];
  var BODY_MAPS = {
    feminino:{
      label:'Feminino',image:'assets/corpos/feminino.png',zones:{
        'braco-d':'M 518 637 L 499 668 L 487 710 L 485 804 L 471 948 L 469 962 L 455 980 L 454 1013 L 439 1071 L 421 1272 L 411 1296 L 396 1386 L 397 1406 L 417 1448 L 452 1487 L 464 1487 L 482 1482 L 484 1467 L 482 1453 L 472 1441 L 474 1366 L 458 1292 L 494 1167 L 525 1081 L 530 1020 L 537 996 L 538 943 L 551 895 L 544 772 L 526 667 L 526 637 Z',
        'braco-e':'M 929 641 L 929 671 L 911 776 L 904 899 L 917 947 L 918 1000 L 931 1089 L 961 1171 L 997 1296 L 981 1370 L 983 1445 L 973 1457 L 971 1471 L 972 1485 L 990 1491 L 1003 1491 L 1038 1452 L 1058 1410 L 1059 1390 L 1044 1300 L 1034 1276 L 1016 1075 L 1001 1017 L 1000 984 L 986 966 L 984 952 L 970 808 L 968 714 L 956 672 L 937 641 Z',
        cabeca:'M 682 230 L 629 269 L 609 297 L 597 342 L 598 388 L 587 400 L 587 417 L 595 438 L 621 458 L 644 494 L 706 544 L 730 544 L 804 484 L 832 444 L 850 407 L 850 390 L 840 382 L 836 325 L 822 287 L 797 255 L 752 230 Z',
        'perna-d':'M 524 1207 L 505 1307 L 503 1373 L 515 1492 L 539 1580 L 566 1723 L 561 1820 L 533 1893 L 524 1975 L 525 2023 L 543 2159 L 574 2348 L 575 2431 L 565 2459 L 548 2580 L 588 2613 L 647 2613 L 654 2605 L 655 2581 L 646 2456 L 636 2401 L 634 2304 L 646 2106 L 666 1996 L 665 1848 L 668 1826 L 684 1786 L 680 1706 L 685 1573 L 704 1453 L 711 1358 L 683 1325 L 586 1243 L 534 1207 Z',
        'perna-e':'M 925 1209 L 873 1245 L 776 1327 L 748 1361 L 755 1455 L 774 1575 L 779 1708 L 775 1788 L 791 1828 L 794 1850 L 793 1998 L 813 2108 L 825 2306 L 823 2403 L 813 2458 L 804 2583 L 804 2603 L 812 2615 L 870 2615 L 911 2582 L 894 2461 L 884 2433 L 885 2350 L 916 2162 L 934 2025 L 935 1977 L 926 1895 L 898 1822 L 893 1725 L 920 1582 L 944 1494 L 956 1375 L 954 1308 L 935 1209 Z',
        tronco:'M 626 601 L 612 614 L 574 626 L 560 647 L 565 741 L 557 762 L 555 796 L 593 899 L 603 995 L 602 1006 L 543 1128 L 527 1191 L 633 1253 L 707 1315 L 740 1315 L 827 1241 L 923 1193 L 906 1133 L 846 1004 L 842 982 L 848 923 L 884 791 L 882 750 L 892 715 L 900 644 L 885 625 L 840 616 L 810 601 Z'
      },connections:{
        cabeca:'M 666 500 L 773 500 L 773 576 L 770 592 L 770 604 L 668 604 L 668 592 L 668 576 Z',
        'braco-d':'M 520 632 L 575 632 L 565 700 L 558 820 L 551 900 L 540 900 L 544 772 L 526 667 Z',
        'braco-e':'M 899 632 L 938 632 L 929 671 L 911 776 L 904 900 L 893 900 L 884 820 L 887 700 Z',
        'perna-d':'M 526 1188 L 640 1248 L 715 1315 L 718 1362 L 711 1358 L 683 1325 L 586 1243 L 524 1207 Z',
        'perna-e':'M 918 1188 L 935 1209 L 873 1245 L 776 1327 L 748 1361 L 736 1315 L 811 1250 Z'
      }
    },
    masculino:{
      label:'Masculino',image:'assets/corpos/masculino.png',zones:{
        'braco-d':'M 534 641 L 501 702 L 489 754 L 487 927 L 467 1121 L 479 1314 L 465 1447 L 470 1469 L 480 1482 L 522 1520 L 536 1520 L 541 1504 L 539 1482 L 551 1471 L 554 1415 L 530 1329 L 531 1283 L 554 1184 L 561 1131 L 560 1029 L 582 933 L 582 900 L 548 717 L 542 641 Z',
        'braco-e':'M 986 639 L 979 715 L 945 898 L 945 931 L 967 1027 L 967 1138 L 997 1293 L 997 1327 L 973 1413 L 976 1469 L 988 1480 L 986 1502 L 992 1518 L 1004 1518 L 1047 1480 L 1057 1467 L 1062 1445 L 1048 1312 L 1060 1119 L 1040 925 L 1038 752 L 1026 700 L 994 639 Z',
        cabeca:'M 735 250 L 704 269 L 679 298 L 667 339 L 665 380 L 652 383 L 647 406 L 657 437 L 683 466 L 693 487 L 748 542 L 773 542 L 830 484 L 870 412 L 870 391 L 855 381 L 855 341 L 846 304 L 828 281 L 783 250 Z',
        'perna-d':'M 582 1270 L 586 1542 L 605 1692 L 605 1794 L 589 1868 L 585 1926 L 607 2072 L 620 2252 L 611 2268 L 613 2299 L 607 2317 L 553 2451 L 553 2460 L 576 2477 L 664 2477 L 693 2462 L 698 2454 L 700 2271 L 693 2247 L 692 2171 L 706 2042 L 723 1958 L 723 1897 L 712 1815 L 712 1745 L 730 1625 L 746 1404 L 590 1270 Z',
        'perna-e':'M 938 1272 L 897 1312 L 784 1404 L 799 1627 L 817 1747 L 817 1818 L 806 1899 L 806 1960 L 823 2044 L 837 2173 L 836 2249 L 829 2273 L 831 2456 L 836 2464 L 865 2479 L 953 2479 L 976 2462 L 976 2453 L 922 2319 L 916 2301 L 918 2270 L 909 2254 L 922 2074 L 944 1928 L 940 1870 L 924 1796 L 924 1694 L 943 1544 L 948 1272 Z',
        tronco:'M 626 603 L 587 616 L 575 631 L 571 652 L 575 748 L 597 881 L 626 1006 L 623 1058 L 593 1191 L 587 1245 L 633 1271 L 748 1368 L 788 1368 L 931 1240 L 940 1226 L 897 1037 L 908 956 L 922 910 L 960 715 L 960 653 L 954 632 L 936 618 L 830 603 Z'
      },connections:{
        cabeca:'M 691 510 L 830 510 L 831 555 L 826 592 L 826 604 L 696 604 L 696 592 L 690 555 Z',
        'braco-d':'M 532 632 L 578 632 L 568 680 L 570 720 L 582 900 L 570 900 L 548 717 L 542 641 Z',
        'braco-e':'M 950 632 L 994 632 L 986 639 L 979 715 L 945 898 L 935 898 L 945 820 L 960 720 L 960 660 Z',
        'perna-d':'M 584 1236 L 641 1271 L 756 1368 L 746 1404 L 590 1270 L 582 1270 Z',
        'perna-e':'M 940 1226 L 938 1272 L 897 1312 L 784 1404 L 780 1368 L 923 1238 Z'
      }
    }
  };
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
      version:4,
      updatedAt:null,
      fields:{
        registro:'', 'nome-sobrevivente':'', jogador:'', idade:'', sangue:'velho', 'genero-select':'masculino',
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
      critical:{ status:'stable', enteredAt:null, tolerance:'pending', stabilizationWindow:true, deathRound:0, deathRolls:[], finalWound:'', postRecoveryRounds:0 },
      stress:{ breaking:false, lastDetermination:null, pendingDetermination:null, pendingCrisis:null, crises:[], recoveryLog:[] },
      pc:0,
      needs:{ hunger:0, thirst:0, sleep:0 },
      corruptionFilters:[],
      wounds:{},
      conditions:[],
      clock:{ round:1, scene:1, cycle:1, conflict:1, session:1, arc:1, survivor:1 },
      effects:[],
      powerUsage:{},
      growth:{ stage:0, claimedStages:[], originPoints:0, skillPoints:0, attributePoints:0, postCapArcs:0, unlockedOrigins:[], powerSelections:{} },
      paradigmNotes:'',
      log:[],
      relationships:[],
      characteristics:{ vantagens:['',''], desvantagens:[''], cicatrizes:[''] },
      pains:[{checked:false,text:''},{checked:false,text:''},{checked:false,text:''}],
      inventory:[],
      weapons:[emptyWeapon(), emptyWeapon()],
      armor:armor,
      resources:resources,
      parts:0,
      knownRecipes:[],
      allowCampaignRecipes:false,
      notes:defaultNotes(),
      ui:{ activePage:'principal', lastRoll:null, filterMode:'', editingInventoryWeaponId:'', activeModal:'', itemCatalogFilter:'', selectedPowerKey:'', powerFeedback:'' }
    };
  }

  function emptyWeapon(){
    return { weaponId:'', current:0, mods:[], notes:'', customName:'', customDamage:'', customRange:'', customMax:0 };
  }

  function loadModel(){
    var base = defaultModel();
    try{
      var raw = localStorage.getItem(STORAGE_KEY);
      if(raw){ return normalizeModel(JSON.parse(raw)); }
      var previousRaw = localStorage.getItem(PREVIOUS_STORAGE_KEY);
      if(previousRaw){ return normalizeModel(JSON.parse(previousRaw)); }
      var legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if(legacyRaw){ return normalizeModel(migrateLegacy(JSON.parse(legacyRaw), base)); }
      var notesRaw = localStorage.getItem(LEGACY_NOTES_KEY);
      if(notesRaw){ base.notes = JSON.parse(notesRaw); }
    } catch(error){ console.warn('Não foi possível restaurar a ficha.', error); }
    return normalizeModel(base);
  }

  function normalizeModel(value){
    var hadGrowth = !!(value && isObject(value.growth));
    var legacyGrowthStage = clamp(value && value.fields && value.fields['growth-stage'],0,10);
    var base = mergeModel(defaultModel(), value || {});
    base.version = 4;
    if(!Array.isArray(base.weapons)) base.weapons = [emptyWeapon(), emptyWeapon()];
    while(base.weapons.length < 2) base.weapons.push(emptyWeapon());
    if(!Array.isArray(base.inventory)) base.inventory = [];
    base.inventory = base.inventory.map(function(entry){
      if(entry && entry.kind === 'weapon' && entry.weapon) return {id:entry.id || uid('weapon-item'),kind:'weapon',weapon:mergeModel(emptyWeapon(),entry.weapon)};
      var legacyAmmo = DATA.ammunitionTypes && DATA.ammunitionTypes.filter(function(ammo){ return ENGINE.normalizeAmmoName(ammo.name) === ENGINE.normalizeAmmoName(entry && entry.name); })[0];
      if(entry && (entry.kind === 'ammo' || legacyAmmo)){
        var ammoId = String(entry.ammoId || entry.catalogId || legacyAmmo && legacyAmmo.id || '');
        var ammoData = DATA.ammunitionTypes.filter(function(ammo){ return ammo.id === ammoId; })[0];
        var legacyAmount = parseInt(entry.quantity != null ? entry.quantity : entry.uses,10) || 0;
        return {
          id:entry.id || uid('ammo'), kind:'ammo', catalogId:ammoId, ammoId:ammoId,
          name:String(entry.name || ammoData && ammoData.name || ''), weaponId:String(entry.weaponId || ''),
          quantity:Math.max(0,legacyAmount), charges:Math.max(0,parseInt(entry.charges,10) || (ammoData && ammoData.storage === 'container' ? legacyAmount : 0)),
          capacity:Math.max(0,parseInt(entry.capacity,10) || 0), uses:''
        };
      }
      return {
        id:entry && entry.id || uid('item'), kind:'item', catalogId:String(entry && entry.catalogId || ''),
        name:String(entry && entry.name || ''), uses:String(entry && entry.uses || ''), quantity:Math.max(0,parseInt(entry && entry.quantity,10) || 0)
      };
    });
    if(!Array.isArray(base.originSkills)) base.originSkills = [];
    if(!Array.isArray(base.originPowers)) base.originPowers = [];
    if(!Array.isArray(base.knownRecipes)) base.knownRecipes = [];
    if(!Array.isArray(base.conditions)) base.conditions = [];
    base.conditions = base.conditions.map(function(condition){
      return String(condition && condition.name || condition || '').trim();
    }).filter(Boolean);
    if(!isObject(base.clock)) base.clock = clone(defaultModel().clock);
    ['round','scene','cycle','conflict','session','arc','survivor'].forEach(function(scope){ base.clock[scope] = Math.max(1,parseInt(base.clock[scope],10) || 1); });
    base.effects = Array.isArray(base.effects) ? base.effects.filter(isObject).map(function(effect){
      return {
        id:String(effect.id || uid('effect')),
        sourceKey:String(effect.sourceKey || effect.name || uid('effect-source')),
        name:String(effect.name || 'Efeito temporário'),
        bonus:Math.max(0,parseInt(effect.bonus,10) || 0),
        expires:String(effect.expires || 'use'),
        allTests:effect.allTests !== false,
        attribute:String(effect.attribute || ''),
        skill:String(effect.skill || '')
      };
    }) : [];
    if(!isObject(base.powerUsage)) base.powerUsage = {};
    Object.keys(base.powerUsage).forEach(function(key){
      var usage = base.powerUsage[key];
      if(!isObject(usage)){ delete base.powerUsage[key]; return; }
      base.powerUsage[key] = {
        count:Math.max(0,parseInt(usage.count,10) || 0),
        scope:String(usage.scope || 'manual'),
        lastUsed:String(usage.lastUsed || ''),
        notes:String(usage.notes || '')
      };
    });
    if(!isObject(base.critical)) base.critical = clone(defaultModel().critical);
    if(['stable','dying','stabilized','dead'].indexOf(base.critical.status) < 0) base.critical.status = 'stable';
    if(['pending','success','failure'].indexOf(base.critical.tolerance) < 0) base.critical.tolerance = 'pending';
    base.critical.deathRound = Math.max(0,parseInt(base.critical.deathRound,10) || 0);
    base.critical.deathRolls = Array.isArray(base.critical.deathRolls) ? base.critical.deathRolls : [];
    base.critical.finalWound = String(base.critical.finalWound || '');
    base.critical.postRecoveryRounds = Math.max(0,parseInt(base.critical.postRecoveryRounds,10) || 0);
    if(!isObject(base.stress)) base.stress = clone(defaultModel().stress);
    base.stress.breaking = !!base.stress.breaking;
    if(base.stress.pendingDetermination && !isObject(base.stress.pendingDetermination)) base.stress.pendingDetermination = null;
    if(base.stress.pendingCrisis && !isObject(base.stress.pendingCrisis)) base.stress.pendingCrisis = null;
    base.stress.crises = Array.isArray(base.stress.crises) ? base.stress.crises : [];
    base.stress.recoveryLog = Array.isArray(base.stress.recoveryLog) ? base.stress.recoveryLog : [];
    if(!isObject(base.growth)) base.growth = clone(defaultModel().growth);
    base.growth.stage = clamp(base.growth.stage || legacyGrowthStage,0,10);
    if(!Array.isArray(base.growth.claimedStages)) base.growth.claimedStages = [];
    if(!hadGrowth && legacyGrowthStage){
      base.growth.claimedStages = Array.from({length:legacyGrowthStage},function(_,index){ return index+1; });
    }
    base.growth.claimedStages = base.growth.claimedStages.map(function(stage){ return clamp(stage,1,10); }).filter(function(stage,index,list){ return list.indexOf(stage) === index; }).sort(function(a,b){ return a-b; });
    base.growth.postCapArcs = Math.max(0,parseInt(base.growth.postCapArcs,10) || 0);
    base.growth.unlockedOrigins = Array.isArray(base.growth.unlockedOrigins) ? base.growth.unlockedOrigins.map(String) : [];
    if(!isObject(base.growth.powerSelections)) base.growth.powerSelections = {};
    Object.keys(base.growth.powerSelections).forEach(function(originName){
      base.growth.powerSelections[originName] = Array.isArray(base.growth.powerSelections[originName]) ? base.growth.powerSelections[originName].map(String) : [];
    });
    base.fields['growth-stage'] = base.growth.stage;
    base.paradigmNotes = String(base.paradigmNotes || '');
    base.log = Array.isArray(base.log) ? base.log.slice(-100) : [];
    if(!base.needs) base.needs = {hunger:0,thirst:0,sleep:0};
    var terraGrowthDelay = DATA.archetypes[base.fields['origem-select']] === 'Terra Viva' && base.growth.claimedStages.indexOf(10) >= 0 ? 2 : 0;
    Object.keys(NEED_RULES).forEach(function(key){
      base.needs[key] = clamp(base.needs[key],0,NEED_RULES[key].max+terraGrowthDelay);
    });
    base.wounds = normalizeWounds(base.wounds);
    if(!Array.isArray(base.relationships)) base.relationships = [];
    base.relationships = base.relationships.map(function(entry){
      return {
        id:String(entry && entry.id || uid('relationship')),
        name:String(entry && entry.name || ''),
        role:String(entry && entry.role || ''),
        score:clampRelationship(entry && entry.score),
        note:String(entry && entry.note || '')
      };
    });
    if(!Array.isArray(base.corruptionFilters)) base.corruptionFilters = [];
    base.corruptionFilters = base.corruptionFilters.filter(function(key){ return typeof key === 'string'; });
    if(!BODY_MAPS[base.fields['genero-select']]) base.fields['genero-select'] = 'masculino';
    delete base.rest;
    if(!base.ui) base.ui = clone(defaultModel().ui);
    if(typeof base.ui.filterMode !== 'string') base.ui.filterMode = '';
    if(typeof base.ui.editingInventoryWeaponId !== 'string') base.ui.editingInventoryWeaponId = '';
    if(typeof base.ui.activeModal !== 'string') base.ui.activeModal = '';
    if(typeof base.ui.itemCatalogFilter !== 'string') base.ui.itemCatalogFilter = '';
    if(typeof base.ui.selectedPowerKey !== 'string') base.ui.selectedPowerKey = '';
    if(typeof base.ui.powerFeedback !== 'string') base.ui.powerFeedback = '';
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

  function clampRelationship(value){
    return Math.max(-5,Math.min(5,parseInt(value,10) || 0));
  }

  function canonicalBodyZone(zoneId){
    var canonical = Object.keys(BODY_WOUND_GROUPS).filter(function(key){
      return BODY_WOUND_GROUPS[key].indexOf(zoneId) >= 0;
    })[0];
    return canonical || zoneId;
  }

  function normalizeWounds(wounds){
    var normalized = {};
    if(!wounds || typeof wounds !== 'object') return normalized;
    Object.keys(wounds).forEach(function(zoneId){
      var target = canonicalBodyZone(zoneId);
      var entries = Array.isArray(wounds[zoneId]) ? wounds[zoneId] : [wounds[zoneId]];
      entries.forEach(function(detail){
        if(!detail || !Number(detail.severity)) return;
        if(!normalized[target]) normalized[target] = [];
        var region = target === 'z-cabeca' ? 'Cabeça' : (target === 'z-tronco' ? 'Tronco' : (/braco/.test(target) ? 'Braços' : 'Pernas'));
        var derivedRule = ENGINE.woundOutcome(DATA.woundTable,String(detail.type || ''),region,detail.severity);
        normalized[target].push({
          id:String(detail.id || uid('wound')),
          type:String(detail.type || ''),
          severity:clamp(detail.severity,1,3),
          note:String(detail.note || ''),
          pf:Math.max(0,parseInt(detail.pf,10) || 0),
          basePf:Math.max(0,parseInt(detail.basePf,10) || derivedRule.pf || 0),
          condition:String(detail.condition != null ? detail.condition : derivedRule.condition || ''),
          conditionApplied:detail.conditionApplied == null ? !!derivedRule.condition : !!detail.conditionApplied,
          armorBlocked:!!(detail.armorBlocked || detail.conditionPrevented),
          rulesApplied:detail.rulesApplied == null ? true : !!detail.rulesApplied,
          conditionTicks:Math.max(0,parseInt(detail.conditionTicks,10) || 0),
          tolerancePending:!!detail.tolerancePending,
          toleranceResolved:!!detail.toleranceResolved
        });
      });
    });
    return normalized;
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
    var mainNodes = [$('[data-section="main-header"]'), $('[data-section="core-stats"]'), $('[data-section="body-map"]'), $('[data-section="skills"]'), $('[data-section="characteristics"]')];
    var equipmentLegacy = $('[data-section="legacy-equipment"]');
    var painSection = $('[data-section="pains"]');
    var notesSection = $('[data-section="notes"]');
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
    buildAutomationModal();
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
    conditionSection.innerHTML = '<div class="section-title">Condições Ativas <span class="tag">CATEGORIAS E EFEITOS DO LIVRO</span></div>'+
      '<div class="section-body condition-shell"><div class="condition-add">'+
      '<select id="condition-category" aria-label="Categoria da condição"></select>'+
      '<select id="condition-select" aria-label="Condição"><option value="">— Selecionar —</option></select>'+
      '<input id="condition-custom" type="text" placeholder="Condição personalizada">'+
      '<button type="button" class="notes-btn" id="condition-add-button">Adicionar</button></div>'+
      '<div class="condition-reference" id="condition-reference">Selecione uma condição para consultar seu resumo e duração.</div>'+
      '<div class="condition-groups" id="condition-list"></div></div>';
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
    if(resourcesList){
      resourcesList.appendChild(criticalAlert);
      var needsPanel = document.createElement('div');
      needsPanel.className = 'needs-panel';
      needsPanel.innerHTML = '<div class="needs-heading"><div><strong>Necessidades do Corpo</strong><span>1 CICLO = 24 CENAS</span></div><p>Sacie ao menos duas das três necessidades por Ciclo.</p></div>'+
        '<div class="needs-grid" id="needs-grid"></div><div class="needs-cycle-alert" id="needs-cycle-alert" aria-live="polite"></div>';
      resourcesList.insertBefore(needsPanel,criticalAlert);
      var ruleTools = document.createElement('div');
      ruleTools.className = 'health-rule-tools no-print';
      ruleTools.innerHTML = '<button type="button" class="rule-tool-card" id="open-dying-panel"><span>PF</span><strong>Morrendo & Morte</strong><small id="dying-tool-status">Estado estável</small></button>'+
        '<button type="button" class="rule-tool-card" id="open-stress-panel"><span>PE</span><strong>Determinação & Crises</strong><small id="stress-tool-status">Sem crise pendente</small></button>';
      resourcesList.appendChild(ruleTools);
    }
    var paradigmField = $('#reputacao-select') && $('#reputacao-select').closest('.meta-field');
    if(paradigmField){
      var paradigmSummary = document.createElement('div');
      paradigmSummary.id = 'paradigm-summary';
      paradigmSummary.className = 'paradigm-summary';
      paradigmSummary.innerHTML = '<span>Selecione um Paradigma para ver seus efeitos.</span><button type="button" class="text-action" id="paradigm-info-button">Ver todos</button>';
      paradigmField.appendChild(paradigmSummary);
    }
  }

  function buildAutomationModal(){
    if($('#rule-action-modal')) return;
    var overlay = document.createElement('div');
    overlay.id = 'rule-action-modal';
    overlay.className = 'modal-overlay rule-action-overlay no-print';
    overlay.style.display = 'none';
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-labelledby','rule-action-title');
    overlay.innerHTML = '<div class="modal rule-action-dialog" tabindex="-1"><div class="modal-header"><span id="rule-action-title">Central de Regras</span><button type="button" class="modal-close" data-close-rule-modal aria-label="Fechar">×</button></div><div class="modal-body" id="rule-action-content"></div><div class="modal-footer"><button type="button" id="rule-action-close" data-close-rule-modal>Fechar</button></div></div>';
    document.body.appendChild(overlay);
  }

  var lastModalFocus = null;
  function openRuleModal(title, content, modalName){
    var overlay = $('#rule-action-modal');
    if(!overlay) return;
    lastModalFocus = document.activeElement;
    $('#rule-action-title').textContent = title;
    $('#rule-action-content').innerHTML = content;
    overlay.dataset.modalName = modalName || '';
    overlay.style.display = 'flex';
    document.body.classList.add('modal-open');
    model.ui.activeModal = modalName || '';
    $('.rule-action-dialog',overlay).focus();
  }

  function closeRuleModal(){
    var overlay = $('#rule-action-modal');
    if(!overlay) return;
    overlay.style.display = 'none';
    overlay.dataset.modalName = '';
    document.body.classList.remove('modal-open');
    model.ui.activeModal = '';
    if(lastModalFocus && typeof lastModalFocus.focus === 'function') lastModalFocus.focus();
    lastModalFocus = null;
    saveModel();
  }

  function buildEquipmentPage(page){
    page.innerHTML = pageHeading('Equipamentos','Carga, armas, proteção e fabricação em uma página própria.')+
      '<div class="row-2 equipment-top">'+
        '<div class="section"><div class="section-title">Inventário <span class="tag" id="inventory-capacity-tag">MÁX. = 2 + FÍSICO</span></div><div class="section-body">'+
          '<div class="status-line"><span id="inventory-status"></span><span id="initial-items-status"></span></div><div class="catalog-launch"><button type="button" class="notes-btn" id="open-item-catalog">+ Catálogo de itens e munições</button><small>Itens oficiais entram com usos e regras preenchidos.</small></div>'+
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
    var relationships = document.createElement('div');
    relationships.className = 'section';
    relationships.innerHTML = '<div class="section-title">Relacionamentos <span class="tag">−5 AMEAÇA · 0 NEUTRO · +5 IRMÃO</span></div>'+
      '<div class="section-body relationship-shell"><div class="relationship-toolbar"><p>Registre cada PNJ separadamente. Valores extremos são mais difíceis de alterar.</p>'+
      '<button type="button" class="notes-btn" id="relationship-add-button">+ Adicionar pessoa</button></div>'+
      '<div class="relationship-list" id="relationship-list"></div></div>';
    var heading = document.createElement('div');
    heading.innerHTML = pageHeading('História & Anotações','O que aconteceu, quem ficou e por que continuar.');
    var firstLegacySection = page.firstChild;
    page.insertBefore(heading.firstChild,firstLegacySection);
    page.insertBefore(campaignMeta,firstLegacySection);
    page.insertBefore(relationships,firstLegacySection);
    page.insertBefore(background,firstLegacySection);
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
      '<div class="section no-print"><div class="section-title">Central de Poderes <span class="tag">USOS E RECARGAS</span></div><div class="section-body power-center-launch">'+
        '<div><strong id="power-center-status">Nenhum poder selecionado</strong><p>Registre usos de Ocupação, Origem e Flor sem perder limites por Cena, Ciclo, Conflito ou Sessão.</p></div>'+
        '<button type="button" class="primary-action" id="open-power-center">Abrir Central</button><div class="scope-clock" id="scope-clock"></div>'+
      '</div></div>'+
      '<div class="section"><div class="section-title">Crescimento <span class="tag">TRILHA I–X</span></div><div class="section-body growth-row">'+
        '<label>Arquétipo<input id="growth-archetype" type="text" readonly></label><label>Próxima etapa<select id="growth-stage"><option value="0">Ainda não iniciou</option>'+growthOptions()+'</select></label><div id="growth-summary" class="rule-preview"></div>'+
        '<div class="growth-ledger" id="growth-ledger"></div><div class="growth-track-list" id="growth-track-list"></div><div class="post-growth-controls no-print"><button type="button" class="notes-btn" id="growth-future-arc">Registrar Arco após a etapa X</button><span id="growth-future-status"></span></div>'+
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
      'registro','nome-sobrevivente','jogador','idade','sangue','genero-select','origem-select','ocupacao-select','reputacao-select',
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
    renderBodyMap();
  }

  function renderBodyMap(){
    var gender = BODY_MAPS[model.fields['genero-select']] ? model.fields['genero-select'] : 'masculino';
    var body = BODY_MAPS[gender];
    var svg = $('#body-svg');
    var layer = $('#body-zone-layer');
    var image = $('#body-art-image');
    if(!svg || !layer || !image) return;
    svg.dataset.gender = gender;
    image.setAttribute('href',body.image);
    $('#body-map-title').textContent = 'Mapeamento somático do corpo ' + body.label.toLowerCase();
    $('#body-map-caption').textContent = 'Vista Frontal — Corpo ' + body.label;
    layer.innerHTML = BODY_ZONE_LABELS.map(function(zone){
      var connection = body.connections && body.connections[zone.key] ? ' ' + body.connections[zone.key] : '';
      return '<path class="zone" id="'+zone.id+'" data-part="'+zone.label+'" d="'+body.zones[zone.key]+connection+'" tabindex="0" role="button" aria-label="Marcar ferimento em '+zone.label+'"><title>'+zone.label+'</title></path>';
    }).join('');
    renderWounds();
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
    var stages = options.stages || [];
    $$('.pip', group).forEach(function(pip){
      var index = parseInt(pip.dataset.i,10);
      var stageClass = stages.length ? (index <= stages[0] ? 'stage-ok' : (index <= stages[1] ? 'stage-warn' : 'stage-crit')) : '';
      pip.classList.toggle('filled', index <= value);
      pip.classList.toggle('permanent', !!options.permanentFrom && index >= options.permanentFrom && index <= options.permanentTo);
      pip.classList.toggle('overflow', !!options.safeMax && index > options.safeMax);
      pip.classList.toggle('stage-ok', stageClass === 'stage-ok');
      pip.classList.toggle('stage-warn', stageClass === 'stage-warn');
      pip.classList.toggle('stage-crit', stageClass === 'stage-crit');
      pip.classList.toggle('overflow-start', !!options.separateOverflow && index === options.safeMax + 1);
      pip.classList.toggle('death-direct', !!options.separateOverflow && index === options.safeMax + 6);
      if(options.separateOverflow && index > options.safeMax){
        var overflowValue = index - options.safeMax;
        pip.title = overflowValue <= 5 ? 'Morrendo +' + overflowValue : 'Morte Direta +' + overflowValue;
        pip.setAttribute('aria-label',pip.title);
      }
    });
  }

  function attributeId(name){
    return { Físico:'attr-fisico', Destreza:'attr-destreza', Intelecto:'attr-intelecto', Instinto:'attr-instinto', Espírito:'attr-espirito' }[name];
  }

  function getOccupation(){ return DATA.occupations[model.fields['ocupacao-select']] || null; }
  function getOrigin(){ return DATA.origins[model.fields['origem-select']] || null; }
  function currentGrowthTrack(){
    var archetype = DATA.archetypes[model.fields['origem-select']] || '';
    return DATA.growthTracks && DATA.growthTracks[archetype] || null;
  }
  function currentGrowthTotals(){
    var totals = ENGINE.growthTotals(currentGrowthTrack(),model.growth.claimedStages,model.growth.postCapArcs);
    model.growth.originPoints = totals.originPoints;
    model.growth.skillPoints = totals.skillPoints;
    model.growth.attributePoints = totals.attributePoints;
    return totals;
  }
  function hasGrowthStage(stage){ return model.growth.claimedStages.indexOf(Number(stage)) >= 0; }
  function attributeBudget(values){
    values = values || model.attributes;
    var spent = 0, zeroCount = 0;
    Object.keys(values).forEach(function(name){
      spent += Math.max(0, Number(values[name]) - 1);
      if(Number(values[name]) === 0) zeroCount++;
    });
    var occupation = getOccupation();
    var manual = parseInt(model.fields['attr-bonus-manual'] || 0,10) || 0;
    var max = 8 + (zeroCount ? 2 : 0) + (occupation && occupation.attributeBonus || 0) + currentGrowthTotals().attributePoints + manual;
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
    var trackGrowthBonus = currentGrowthTotals().skillPoints;
    var total = 28 + bonus + blockedBonus + (occupation && occupation.ppBonus || 0) + growthBonus + trackGrowthBonus + manual;
    var spent = 0;
    Object.keys(model.skills).forEach(function(skill){
      if(model.originSkills.indexOf(skill) < 0 && !isSkillLocked(skill)) spent += Math.max(0, model.skills[skill] - 1);
    });
    return { bonus:bonus, blockedBonus:blockedBonus, growthBonus:growthBonus + trackGrowthBonus, total:total, spent:spent, remaining:total-spent };
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
    if(model.fields.sangue === 'novo') return { pf:15, pe:20, pfSegments:[5,10,15], peSegments:[8,15,20] };
    return { pf:20, pe:15, pfSegments:[8,15,20], peSegments:[5,10,15] };
  }

  function buildTrackPips(group, max){
    group.dataset.max = max;
    if($$('.pip',group).length === max) return;
    group.innerHTML = pipButtons(max);
  }

  function addTemporaryEffect(config){
    config = config || {};
    var sourceKey = String(config.sourceKey || config.name || uid('effect'));
    model.effects = model.effects.filter(function(effect){ return effect.sourceKey !== sourceKey; });
    model.effects.push({
      id:uid('effect'),
      sourceKey:sourceKey,
      name:String(config.name || 'Efeito temporário'),
      bonus:Math.max(0,parseInt(config.bonus,10) || 0),
      expires:String(config.expires || 'use'),
      allTests:config.allTests !== false,
      attribute:String(config.attribute || ''),
      skill:String(config.skill || '')
    });
  }

  function effectMatchesRoll(effect, attribute, skill){
    if(!effect || !(parseInt(effect.bonus,10) > 0)) return false;
    if(effect.allTests) return true;
    return (!effect.attribute || effect.attribute === attribute) && (!effect.skill || effect.skill === skill);
  }

  function activeRollEffects(attribute, skill){
    return model.effects.filter(function(effect){ return effectMatchesRoll(effect,attribute,skill); });
  }

  function consumeNextTestEffects(attribute, skill){
    model.effects = model.effects.filter(function(effect){
      return !(effect.expires === 'use' && effectMatchesRoll(effect,attribute,skill));
    });
  }

  function applyMasochistRelief(pfReceived){
    if(model.fields['ocupacao-select'] !== 'Masoquista' || pfReceived <= 0) return;
    var reduction = Math.ceil(pfReceived / 2);
    changePE(-reduction,{source:'Florescer na Dor'});
    if(reduction >= 5){
      addTemporaryEffect({sourceKey:'occupation:masoquista:florescer-na-dor',name:'Florescer na Dor',bonus:1,expires:'scene',allTests:true});
      addRuleLog('poder','Florescer na Dor concedeu Bônus até o fim da Cena.',{reducedPe:reduction});
      renderPowerCenterStatus();
    }
  }

  function addRuleLog(kind, message, detail){
    model.log.push({id:uid('log'),kind:String(kind || 'regra'),message:String(message || ''),detail:detail || null,at:new Date().toISOString()});
    if(model.log.length > 100) model.log = model.log.slice(-100);
  }

  function pfTotal(){ return model.health.pf + model.health.permanentPf; }
  function peTotal(){ return model.health.pe + model.health.permanentPe; }

  function reconcileCriticalState(previousTotal, context){
    var limits = bloodLimits();
    var total = pfTotal();
    var stage = ENGINE.pfStage(total,limits.pf,limits.pfSegments);
    if(stage.key === 'dead'){
      if(model.critical.status !== 'dead'){
        model.critical.status = 'dead';
        model.critical.stabilizationWindow = false;
        addRuleLog('morte','Morte Direta atingida.',{total:total,limit:limits.pf,source:context && context.source || 'ajuste'});
      }
      return stage;
    }
    if(stage.key === 'dying'){
      if(model.critical.status === 'stable'){
        model.critical.status = 'dying';
        model.critical.enteredAt = new Date().toISOString();
        model.critical.tolerance = 'pending';
        model.critical.stabilizationWindow = true;
        model.critical.deathRound = 0;
        model.critical.deathRolls = [];
        addRuleLog('morrendo','Entrou em Morrendo.',{total:total,limit:limits.pf,previous:previousTotal,source:context && context.source || 'ajuste'});
      }
      return stage;
    }
    if((model.critical.status === 'dying' || model.critical.status === 'stabilized') && total <= limits.pf){
      model.critical.status = 'stable';
      model.critical.stabilizationWindow = true;
      model.critical.deathRound = 0;
      addRuleLog('recuperacao','Saiu do estado de Morrendo.',{total:total,limit:limits.pf});
    }
    return stage;
  }

  function changePF(amount, context){
    var previous = pfTotal();
    var limits = bloodLimits();
    var target = clamp(previous + (parseInt(amount,10) || 0),0,limits.pf+6);
    model.health.pf = Math.max(0,target-model.health.permanentPf);
    reconcileCriticalState(previous,context || {});
    renderHealth();
    saveModel();
    return target-previous;
  }

  function stressState(){
    var limits = bloodLimits();
    return ENGINE.stressStage(peTotal(),limits.pe,limits.peSegments);
  }

  function changePE(amount, context){
    var previous = peTotal();
    var limits = bloodLimits();
    var target = clamp(previous + (parseInt(amount,10) || 0),0,limits.pe);
    model.health.pe = Math.max(0,target-model.health.permanentPe);
    if(target >= limits.pe) model.stress.breaking = true;
    else if(context && context.resolveBreaking) model.stress.breaking = false;
    if(target !== previous && context && context.source) addRuleLog('estresse',(target > previous ? 'Recebeu ' : 'Reduziu ')+Math.abs(target-previous)+' PE.',{source:context.source,total:target});
    renderHealth();
    saveModel();
    return target-previous;
  }

  function corruptionEffectActive(key){
    var stage = currentCorruptionStage();
    return stage.effects.some(function(effect){ return effect.key === key; }) && model.corruptionFilters.indexOf(key) < 0;
  }

  function applyStress(amount, context){
    context = context || {};
    amount = Math.max(0,parseInt(amount,10) || 0);
    if(model.fields['ocupacao-select'] === 'Determinado' && (context.cause === 'ally-crisis' || context.cause === 'ally-wound' || context.cause === 'ally-breaking')) amount = 0;
    if(model.fields['ocupacao-select'] === 'Verdugo' && context.cause === 'guilt') amount = 0;
    if(amount > 0 && corruptionEffectActive('critica-colapso')) amount += 1;
    var stateBefore = stressState();
    var capped = ENGINE.capStressGain(amount,stateBefore,model.fields['ocupacao-select'] === 'Determinado' && context.determination);
    var applied = capped.applied;
    if(applied > 0) changePE(applied,{source:context.source || 'ganho de Estresse'});
    model.stress.lastDetermination = context.determination ? {requested:amount,applied:applied,range:context.range || null,at:new Date().toISOString()} : model.stress.lastDetermination;
    if(applied >= 4 || context.forceCrisis) triggerStressCrisis({source:context.source || 'ganho de Estresse',automatic:applied >= 4});
    renderStressToolStatus();
    saveModel();
    return {requested:amount,applied:applied,prevented:capped.prevented,crisis:applied >= 4 || !!context.forceCrisis};
  }

  function renderHealth(){
    var limits = bloodLimits();
    model.health.permanentPf = clamp(model.health.permanentPf,0,limits.pf);
    model.health.permanentPe = clamp(model.health.permanentPe,0,limits.pe);
    model.health.pf = clamp(model.health.pf,0,limits.pf + 6 - model.health.permanentPf);
    model.health.pe = clamp(model.health.pe,0,limits.pe - model.health.permanentPe);
    var pfTotal = model.health.pf + model.health.permanentPf;
    var peTotal = model.health.pe + model.health.permanentPe;
    var pfGroup = $('#pf-boxes');
    var peGroup = $('#pe-boxes');
    buildTrackPips(pfGroup, limits.pf + 6);
    buildTrackPips(peGroup, limits.pe);
    var permanentPfFrom = model.health.permanentPf ? limits.pf - model.health.permanentPf + 1 : 0;
    var permanentPeFrom = model.health.permanentPe ? limits.pe - model.health.permanentPe + 1 : 0;
    renderPips(pfGroup,pfTotal,limits.pf+6,{ safeMax:limits.pf, stages:limits.pfSegments, separateOverflow:true, permanentFrom:permanentPfFrom, permanentTo:limits.pf });
    renderPips(peGroup,peTotal,limits.pe,{ safeMax:limits.pe, stages:limits.peSegments, permanentFrom:permanentPeFrom, permanentTo:limits.pe });
    $('#pf-max-label').textContent = '/' + limits.pf + ' (+' + Math.max(0,pfTotal-limits.pf) + ')';
    $('#pe-max-label').textContent = '/' + limits.pe;
    $('#pf-readout').childNodes[0].nodeValue = String(pfTotal).padStart(2,'0');
    $('#pe-readout').childNodes[0].nodeValue = String(peTotal).padStart(2,'0');
    $('#pf-permanent').max = limits.pf;
    $('#pe-permanent').max = limits.pe;
    $('#pf-permanent').value = model.health.permanentPf;
    $('#pe-permanent').value = model.health.permanentPe;
    renderTrackZones('pf', limits.pfSegments, limits.pf);
    renderTrackZones('pe', limits.peSegments, limits.pe);
    var pfStageRule = ENGINE.pfStage(pfTotal,limits.pf,limits.pfSegments);
    var pfStage = model.critical.status === 'stabilized' && pfStageRule.key === 'dying' ? 'Estabilizado' : pfStageRule.name;
    var peStage = model.stress.breaking ? 'Enlouquecendo' : ENGINE.stressStage(peTotal,limits.pe,limits.peSegments).name;
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
      } else if(pfStage === 'Morrendo' && model.critical.status === 'dying'){
        alertText = 'MORRENDO — o personagem ultrapassou o limite de PF e precisa ser estabilizado antes de alcançar Morte Direta.';
        alertClass = 'dying';
      } else if(peStage === 'Enlouquecendo'){
        alertText = 'ENLOUQUECENDO — o personagem atingiu o limite de PE ('+limits.pe+'). O controle passa ao MP até a resolução narrativa.';
        alertClass = 'insanity';
      }
      alertBox.textContent = alertText;
      alertBox.className = 'critical-state-alert' + (alertText ? ' '+alertClass : ' hidden');
    }
    renderDyingToolStatus();
    renderStressToolStatus();
  }

  function characterTest(attribute, skill, bonus){
    var attributeValue = Math.max(0,Number(model.attributes[attribute]) || 0);
    var skillValue = isSkillLocked(skill) ? 0 : (model.originSkills.indexOf(skill) >= 0 ? 5 : Number(model.skills[skill]) || 0);
    var roll = ENGINE.rollPool(Math.max(0,attributeValue+(Number(bonus)||0)),skillValue);
    roll.attribute = attribute;
    roll.skill = skill;
    roll.threshold = skillValue;
    return roll;
  }

  function diceFaces(results, threshold){
    return '<div class="dice-faces">'+(results || []).map(function(die){ return '<span class="die '+(die <= threshold ? 'success' : 'fail')+'">'+die+'</span>'; }).join('')+'</div>';
  }

  function renderDyingToolStatus(){
    var status = $('#dying-tool-status');
    if(!status) return;
    var labels = {stable:'Estado estável',dying:'Morrendo · cuidado pendente',stabilized:'Estabilizado',dead:'Morte Direta'};
    status.textContent = labels[model.critical.status] || labels.stable;
    status.closest('.rule-tool-card').classList.toggle('critical',model.critical.status === 'dying' || model.critical.status === 'dead');
  }

  function dyingPanelHtml(){
    var limits = bloodLimits();
    var stage = ENGINE.pfStage(pfTotal(),limits.pf,limits.pfSegments);
    var labels = {stable:'Estável',dying:'Morrendo',stabilized:'Estabilizado',dead:'Morte Direta'};
    var toleranceText = model.critical.tolerance === 'success' ? 'Sucesso: consciente, apenas fala, rasteja e Ações Simples.' : (model.critical.tolerance === 'failure' ? 'Falha: Inconsciente até receber cuidado.' : 'Teste ainda não realizado.');
    var deathLog = model.critical.deathRolls.length ? model.critical.deathRolls.map(function(test){
      return '<li class="'+(test.dead ? 'danger-text' : '')+'"><b>Teste '+test.round+'</b><span>1D6 = '+test.roll+' · fatal em '+(test.round >= 6 ? 'qualquer resultado' : '1–'+test.threshold)+'</span></li>';
    }).join('') : '<li class="empty-state">Nenhum Teste de Morte realizado.</li>';
    var actions = '';
    if(model.critical.status === 'dying'){
      actions += '<section class="rule-step"><div><span>1</span><strong>Tolerância · NS Dilacerante</strong></div><p>'+toleranceText+'</p>'+
        (model.critical.tolerance === 'pending' ? '<div class="inline-actions"><button type="button" class="notes-btn" id="dying-tolerance-roll">Rolar Físico + Tolerância</button><button type="button" class="notes-btn" data-dying-tolerance="success">Registrar sucesso</button><button type="button" class="notes-btn danger" data-dying-tolerance="failure">Registrar falha</button></div>' : '')+'</section>'+
        '<section class="rule-step"><div><span>2</span><strong>Janela de salvamento</strong></div><p>'+(model.critical.stabilizationWindow ? 'Aliados têm esta Rodada/Cena para estabilizar condições contínuas e prestar cuidado.' : 'A janela encerrou; os Testes de Morte começaram.')+'</p><div class="inline-actions">'+
        '<button type="button" class="notes-btn" id="dying-stabilize-roll">Rolar Intelecto + Medicina</button><button type="button" class="notes-btn" id="dying-stabilize-success">Registrar cuidado bem-sucedido</button>'+
        (model.critical.stabilizationWindow ? '<button type="button" class="notes-btn danger" id="dying-end-window">Encerrar janela sem cuidado</button>' : '')+'</div></section>'+
        '<section class="rule-step"><div><span>3</span><strong>Testes de Morte</strong></div><p>1D6; o valor fatal cresce a cada Rodada/Cena. No sexto teste, a morte é inevitável.</p><button type="button" class="primary-action" id="death-test-roll" '+(model.critical.stabilizationWindow ? 'disabled' : '')+'>Rolar próximo Teste de Morte</button><ol class="death-test-log">'+deathLog+'</ol></section>';
    } else if(model.critical.status === 'stabilized'){
      actions = '<section class="rule-step success-step"><strong>Estabilizado</strong><p>Os Testes de Morte foram encerrados. A estabilização recuperou exatamente 1 PF; continue o tratamento normalmente.</p></section>';
    } else if(model.critical.status === 'dead'){
      actions = '<section class="rule-step death-step"><strong>Morte Direta</strong><p>O total chegou a '+stage.overflow+' PF além do limite. Esse resultado usa a fórmula coerente do livro: limite +6.</p><button type="button" class="notes-btn danger" id="dying-correct-state">Corrigir marcação de PF e reavaliar estado</button></section><ol class="death-test-log">'+deathLog+'</ol>';
    } else {
      actions = '<section class="rule-step"><strong>Nenhum episódio ativo</strong><p>Morrendo começa em '+(limits.pf+1)+' PF e vai até '+(limits.pf+5)+'. Morte Direta começa em '+(limits.pf+6)+' PF.</p></section>';
    }
    return '<div class="rule-dashboard"><div class="rule-state-banner state-'+model.critical.status+'"><span>'+labels[model.critical.status]+'</span><strong>'+pfTotal()+'/'+limits.pf+' PF</strong></div>'+actions+
      '<label class="rule-long-field">Ferida Final / consequência narrativa<textarea id="dying-final-wound" placeholder="Cicatriz, perda, limitação ou consequência definida com o MP...">'+escapeHtml(model.critical.finalWound)+'</textarea></label><p class="rule-footnote">A Ferida Final é narrativa. Condições que continuam causando PF devem ser estabilizadas antes da cura.</p></div>';
  }

  function openDyingPanel(){ openRuleModal('Morrendo & Testes de Morte',dyingPanelHtml(),'dying'); }
  function refreshDyingPanel(){ if($('#rule-action-modal').dataset.modalName === 'dying') $('#rule-action-content').innerHTML = dyingPanelHtml(); }

  function resolveDyingTolerance(success, roll){
    model.critical.tolerance = success ? 'success' : 'failure';
    if(!success && !hasCondition('Inconsciente')) model.conditions.push('Inconsciente');
    addRuleLog('morrendo','Teste de Tolerância: '+(success ? 'sucesso' : 'falha')+'.',roll || null);
    renderConditions();
    renderHealth();
    refreshDyingPanel();
    saveModel();
  }

  function resolveStabilization(success, roll){
    addRuleLog('morrendo','Estabilização: '+(success ? 'sucesso' : 'falha')+'.',roll || null);
    if(success){
      model.critical.status = 'stabilized';
      model.critical.stabilizationWindow = false;
      changePF(-1,{source:'estabilização'});
    }
    refreshDyingPanel();
    saveModel();
  }

  function rollDeathTest(){
    if(model.critical.status !== 'dying' || model.critical.stabilizationWindow) return;
    var round = model.critical.deathRound + 1;
    var roll = 1+Math.floor(Math.random()*6);
    var result = ENGINE.deathTest(round,roll);
    model.critical.deathRound = round;
    model.critical.deathRolls.push({round:round,roll:roll,threshold:result.threshold,dead:result.dead,at:new Date().toISOString()});
    if(result.dead) model.critical.status = 'dead';
    addRuleLog('morte','Teste de Morte '+round+': '+roll+(result.dead ? ' · morte' : ' · sobreviveu')+'.',result);
    renderHealth();
    refreshDyingPanel();
    saveModel();
  }

  var STRESS_RECOVERY = {
    rest:{name:'Descanso',min:1,max:3}, conversation:{name:'Conversas',min:2,max:5}, hobby:{name:'Hobbies',min:1,max:4},
    solitude:{name:'Solitude',min:1,max:5}, social:{name:'Momentos sociais',min:2,max:4}, beauty:{name:'Beleza no caos',min:2,max:4}, support:{name:'Apoio e companheirismo',min:1,max:3}
  };

  function renderStressToolStatus(){
    var status = $('#stress-tool-status');
    if(!status) return;
    var state = model.stress.breaking ? {name:'Enlouquecendo'} : stressState();
    status.textContent = state.name+(model.stress.pendingCrisis ? ' · crise registrada' : '');
    status.closest('.rule-tool-card').classList.toggle('critical',model.stress.breaking || !!model.stress.pendingCrisis);
  }

  function determinationChoiceHtml(pending){
    if(!pending) return '';
    var range = pending.range;
    if(range.undefinedByBook){
      return '<div class="rule-result warning-step">'+diceFaces(pending.results,pending.threshold)+'<strong>'+pending.successes+' sucessos · '+range.deficit+' níveis abaixo</strong><p>O livro não define 4 ou mais níveis abaixo. O MP deve informar o ganho; use “Aplicar outro evento” abaixo.</p></div>';
    }
    var buttons = '';
    for(var value=range.min;value<=range.max;value++) buttons += '<button type="button" class="notes-btn" data-determination-pe="'+value+'">'+value+' PE</button>';
    return '<div class="rule-result">'+diceFaces(pending.results,pending.threshold)+'<strong>'+pending.successes+' sucessos · '+range.label+'</strong><p>O MP escolhe o valor exato dentro da faixa.</p><div class="inline-actions">'+buttons+'</div></div>';
  }

  function stressPanelHtml(){
    var limits = bloodLimits();
    var state = model.stress.breaking ? {key:'breaking',name:'Enlouquecendo',eventCap:Infinity} : stressState();
    var crises = model.stress.crises.slice(-8).reverse().map(function(crisis){
      return '<li><div><strong>'+escapeHtml(crisis.name)+'</strong><span>'+crisis.rolls.join(' + ')+' = '+crisis.sum+(crisis.shift ? ' · ajuste +'+crisis.shift : '')+' · resultado '+crisis.adjusted+'</span></div><small>'+escapeHtml(crisis.description)+'</small></li>';
    }).join('') || '<li class="empty-state">Nenhuma Crise registrada.</li>';
    var recoveryOptions = Object.keys(STRESS_RECOVERY).map(function(key){ var item=STRESS_RECOVERY[key]; return '<option value="'+key+'">'+item.name+' · '+item.min+'–'+item.max+' PE</option>'; }).join('');
    var cap = state.eventCap === Infinity ? 'sem teto adicional' : 'máximo '+state.eventCap+' PE por evento';
    return '<div class="rule-dashboard"><div class="rule-state-banner stress-'+state.key+'"><span>'+state.name+'</span><strong>'+peTotal()+'/'+limits.pe+' PE</strong><small>'+cap+'</small></div>'+
      (model.stress.breaking ? '<section class="rule-step death-step"><strong>Surto em andamento</strong><p>O MP controla o personagem. Reduzir PE não encerra o estado sozinho.</p><button type="button" class="notes-btn" id="stress-resolve-breaking">O MP encerrou o surto</button></section>' : '')+
      '<section class="rule-step"><div><span>1</span><strong>Rolagem de Determinação</strong></div><p>Role Espírito + Determinação contra o NS escolhido pelo MP.</p><div class="inline-form"><label>NS<select id="determination-target"><option value="1">Sofrido</option><option value="2">Gangrenado</option><option value="3" selected>Dilacerante</option><option value="4">Profano</option><option value="5">Absoluto</option></select></label><button type="button" class="primary-action" id="determination-roll">Rolar Determinação</button></div>'+determinationChoiceHtml(model.stress.pendingDetermination)+'</section>'+
      '<section class="rule-step"><div><span>2</span><strong>Aplicar outro evento de Estresse</strong></div><div class="inline-form"><label>PE<input id="stress-manual-amount" type="number" min="0" max="9" value="1"></label><label>Causa<select id="stress-cause"><option value="other">Outro</option><option value="guilt">Culpa por ferir alguém</option><option value="ally-wound">Aliado ferido</option><option value="ally-crisis">Crise de um aliado</option><option value="ally-breaking">Aliado enlouquecendo</option></select></label><button type="button" class="notes-btn" id="stress-manual-apply">Aplicar</button><button type="button" class="notes-btn danger" id="stress-crisis-manual">Disparar Crise sem PE</button></div><p class="rule-footnote">Ganhos de 4+ PE disparam Crise automaticamente. Determinado e Verdugo aplicam suas imunidades conforme a causa.</p></section>'+
      '<section class="rule-step"><div><span>3</span><strong>Recuperação</strong></div><p>Uma Recuperação oferece duas Ações e não permite repetir o mesmo benefício.</p><div class="inline-form"><label>Método<select id="stress-recovery-method">'+recoveryOptions+'</select></label><label>PE a reduzir<input id="stress-recovery-amount" type="number" min="1" max="5" value="1"></label><button type="button" class="notes-btn" id="stress-recovery-apply">Recuperar</button></div></section>'+
      '<section class="rule-step"><div><strong>Histórico de Crises</strong><button type="button" class="text-action" id="stress-acknowledge-crisis">Limpar aviso</button></div><ul class="crisis-log">'+crises+'</ul></section></div>';
  }

  function openStressPanel(){ openRuleModal('Determinação, Estresse & Crises',stressPanelHtml(),'stress'); }
  function refreshStressPanel(){ if($('#rule-action-modal').dataset.modalName === 'stress') $('#rule-action-content').innerHTML = stressPanelHtml(); }

  function recordCrisisPain(name){
    var slot = model.pains.filter(function(pain){ return !pain.checked; })[0];
    if(slot){ slot.checked = true; if(!slot.text) slot.text = 'Crise de Estresse — '+name; }
  }

  function triggerStressCrisis(context){
    context = context || {};
    var diceCount = model.fields['ocupacao-select'] === 'Determinado' ? 5 : 3;
    var rolls = ENGINE.rollPool(diceCount,6).results;
    var sum = rolls.reduce(function(total,die){ return total+die; },0);
    var outcome = ENGINE.crisisOutcome(sum,stressState());
    var crisis = {id:uid('crisis'),rolls:rolls,sum:sum,shift:outcome.shift,adjusted:outcome.adjusted,name:outcome.name,condition:outcome.condition,description:outcome.description,source:context.source || '',at:new Date().toISOString()};
    model.stress.crises.push(crisis);
    model.stress.pendingCrisis = crisis;
    if(outcome.condition && !hasCondition(outcome.condition)) model.conditions.push(outcome.condition);
    recordCrisisPain(outcome.name);
    addRuleLog('crise','Crise de Estresse: '+outcome.name+'.',crisis);
    renderConditions();
    renderPains();
    renderStressToolStatus();
    saveModel();
    return crisis;
  }

  function rollDetermination(){
    var target = clamp($('#determination-target').value,1,5);
    var roll = characterTest('Espírito','Determinação',0);
    model.stress.pendingDetermination = {target:target,successes:roll.successes,results:roll.results,threshold:roll.threshold,range:ENGINE.determinationRange(roll.successes,target),at:new Date().toISOString()};
    addRuleLog('determinacao','Rolagem de Determinação: '+roll.successes+' sucessos contra NS '+target+'.',model.stress.pendingDetermination);
    refreshStressPanel();
    saveModel();
  }

  function renderNeeds(){
    var grid = $('#needs-grid');
    if(!grid) return;
    grid.innerHTML = ['hunger','sleep','thirst'].map(function(key){
      var rule = NEED_RULES[key];
      var delayed = DATA.archetypes[model.fields['origem-select']] === 'Terra Viva' && hasGrowthStage(10);
      var max = rule.max + (delayed ? 2 : 0);
      var value = clamp(model.needs[key],0,max);
      var effectiveValue = delayed ? Math.max(0,value-2) : value;
      var current = rule.levels[effectiveValue];
      var segments = '';
      for(var level=1;level<=max;level++){
        segments += '<button type="button" class="need-segment '+(level <= value ? 'filled' : '')+' '+(level === value ? 'current' : '')+'" data-need-key="'+key+'" data-need-value="'+level+'" aria-label="'+escapeHtml(rule.label)+' — '+level+'º dia" aria-pressed="'+(level <= value ? 'true' : 'false')+'"><span>'+level+'</span></button>';
      }
      return '<article class="need-card need-'+key+' '+(value ? 'active' : 'satisfied')+(value === max ? ' critical' : '')+'">'+
        '<div class="need-card-header"><strong>'+rule.label+'</strong><span>'+current.name+(delayed && value ? ' · Ritidoma' : '')+'</span></div>'+
        '<div class="need-bar" role="group" aria-label="Dias sem '+rule.label.toLowerCase()+'">'+segments+'</div>'+
        '<p>'+current.effect+'</p><button type="button" class="need-reset" data-need-reset="'+key+'" '+(value ? '' : 'disabled')+'>'+rule.action+' · atender necessidade</button>'+
        '</article>';
    }).join('');
    var ignored = Object.keys(NEED_RULES).filter(function(key){ return model.needs[key] > 0; }).length;
    var warning = $('#needs-cycle-alert');
    if(ignored === 3){
      warning.textContent = 'Três necessidades ignoradas no mesmo Ciclo: o Sobrevivente cai Inconsciente por 2D6 Cenas e retorna com Exaustão.';
      warning.className = 'needs-cycle-alert critical';
    } else if(ignored === 2){
      warning.textContent = 'Duas necessidades ignoradas: no próximo Ciclo, recebe Exaustão até atender ao menos uma delas.';
      warning.className = 'needs-cycle-alert warning';
    } else {
      warning.textContent = ignored === 1 ? 'Uma necessidade pendente deve ser obrigatoriamente saciada no próximo Ciclo.' : 'Corpo estável: as três necessidades estão atendidas.';
      warning.className = 'needs-cycle-alert';
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
    else text.textContent = 'Limite ' + max + ' · Enlouquecendo ao atingir · pontos permanentes ocupam o fim da barra';
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

  function extraOriginPowerCost(originName,power){
    var initialArchetype = DATA.archetypes[model.fields['origem-select']] || '';
    return Number(power.cost || 0) + (DATA.archetypes[originName] !== initialArchetype ? Number(DATA.growthTracks.rules.foreignOriginCost || 1) : 0);
  }

  function originPowerSpent(){
    var origin = getOrigin();
    var spent = origin ? origin.powers.reduce(function(sum,power){ return sum + (model.originPowers.indexOf(power.name) >= 0 ? power.cost : 0); },0) : 0;
    model.growth.unlockedOrigins.forEach(function(originName){
      var extraOrigin = DATA.origins[originName];
      if(!extraOrigin) return;
      var selected = model.growth.powerSelections[originName] || [];
      extraOrigin.powers.forEach(function(power){ if(selected.indexOf(power.name) >= 0) spent += extraOriginPowerCost(originName,power); });
    });
    return spent;
  }

  function renderUnlockedOriginPowers(){
    if(!model.growth.unlockedOrigins.length) return '';
    return '<div class="unlocked-origin-powers"><div class="subsection-heading">Origens liberadas pelo Crescimento</div>'+model.growth.unlockedOrigins.map(function(originName){
      var origin = DATA.origins[originName];
      if(!origin) return '';
      var selected = model.growth.powerSelections[originName] || [];
      return '<details class="unlocked-origin"><summary><strong>'+escapeHtml(originName)+'</strong><span>'+escapeHtml(DATA.archetypes[originName] || '')+' · Poder Inicial não comprável</span></summary><div class="power-list">'+origin.powers.map(function(power){
        var checked = selected.indexOf(power.name) >= 0;
        var cost = extraOriginPowerCost(originName,power);
        return '<label class="power-card selectable '+(checked ? 'selected' : '')+'"><input type="checkbox" class="growth-origin-power-check" data-growth-origin="'+escapeHtml(originName)+'" data-power="'+escapeHtml(power.name)+'" '+(checked ? 'checked' : '')+'><span class="power-cost">'+cost+' PO</span><h3>'+escapeHtml(power.name)+'</h3><p>'+escapeHtml(power.description)+'</p></label>';
      }).join('')+'</div></details>';
    }).join('')+'</div>';
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
    var total = 7 + (occupation && occupation.originPointsBonus || 0) + currentGrowthTotals().originPoints;
    var spent = originPowerSpent();
    $('#origin-budget').innerHTML = '<span>Total <b>'+total+' PO</b></span><span>Gasto <b>'+spent+'</b></span><span class="'+(spent === total ? 'budget-ok' : (spent > total ? 'over' : ''))+'">Restante <b>'+(total-spent)+'</b></span>';
    $('#origin-power-list').innerHTML = origin.powers.map(function(power){
      var checked = model.originPowers.indexOf(power.name) >= 0;
      return '<label class="power-card selectable '+(checked ? 'selected' : '')+'"><input type="checkbox" class="origin-power-check" data-power="'+escapeHtml(power.name)+'" '+(checked ? 'checked' : '')+'><span class="power-cost">'+power.cost+' PO</span><h3>'+escapeHtml(power.name)+'</h3><p>'+escapeHtml(power.description)+'</p></label>';
    }).join('')+renderUnlockedOriginPowers();
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
      option.disabled = !!requiredGroup && !!option.value && !!allowed[requiredGroup] && allowed[requiredGroup].indexOf(option.value) < 0;
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
    var summary=$('#paradigm-summary');
    if(summary){
      var selectedName=select.value||model.fields['reputacao-select'];
      var paradigm=(DATA.paradigms||[]).filter(function(item){return item.name===selectedName;})[0];
      summary.innerHTML=paradigm?'<span><b>'+escapeHtml(paradigm.path)+' · '+escapeHtml(paradigm.name)+'</b>'+escapeHtml(paradigm.positive)+'</span><button type="button" class="text-action" id="paradigm-info-button">Ver efeitos</button>':'<span>Selecione um Paradigma para ver seus efeitos.</span><button type="button" class="text-action" id="paradigm-info-button">Ver todos</button>';
    }
  }

  function paradigmMatrixHtml(){
    var selected=model.fields['reputacao-select'];
    var rules=DATA.reputationRules||{};
    var paths=['Sublime','Síntese','Abissal'];
    return '<div class="rule-dashboard paradigm-reference"><section class="rule-step"><strong>Como a Reputação funciona</strong><ul><li>'+escapeHtml(rules.consistentAction||'')+'</li><li>'+escapeHtml(rules.inconsistentAction||'')+'</li><li>'+escapeHtml(rules.change||'')+'</li></ul><p class="rule-footnote">A Reputação é regional e não possui pontuação numérica no livro.</p></section><div class="paradigm-matrix">'+paths.map(function(path){
      return '<section class="paradigm-path paradigm-'+paradigmGroup(path==='Sublime'?'Guardião':path==='Síntese'?'Sobrevivente':'Ceifador')+'"><div class="subsection-heading">'+path+'</div>'+(DATA.paradigms||[]).filter(function(item){return item.path===path;}).map(function(item){return '<article class="paradigm-card '+(item.name===selected?'selected':'')+'"><div><strong>'+escapeHtml(item.name)+'</strong><span>'+escapeHtml(item.focus)+'</span></div><p>'+escapeHtml(item.description)+'</p><dl><dt>Favorece</dt><dd>'+escapeHtml(item.positive)+'</dd><dt>Cobra</dt><dd>'+escapeHtml(item.negative)+'</dd></dl></article>';}).join('')+'</section>';
    }).join('')+'</div></div>';
  }
  function openParadigmMatrix(){openRuleModal('Paradigmas & Reputação',paradigmMatrixHtml(),'paradigms');}

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

  function effectiveFlowerIndex(){
    var stage = currentCorruptionStage();
    var currentIndex = Math.min(4,DATA.corruptionStages.indexOf(stage));
    return model.fields['ocupacao-select'] === 'Devoto' ? Math.min(4,currentIndex+1) : currentIndex;
  }

  function powerUsageState(key, scope){
    if(!model.powerUsage[key]) model.powerUsage[key] = {count:0,scope:scope || 'manual',lastUsed:'',notes:''};
    if(scope) model.powerUsage[key].scope = scope;
    return model.powerUsage[key];
  }

  function markPowerUsed(key, scope){
    var usage = powerUsageState(key,scope);
    usage.count += 1;
    usage.lastUsed = new Date().toISOString();
    return usage;
  }

  function powerLimit(description){
    var match = String(description || '').match(/(?:m[aá]ximo(?: de)?|at[eé])\s+(\d+)/i);
    return match ? Math.max(1,parseInt(match[1],10) || 1) : 1;
  }

  function detectedPowerCosts(description){
    var costs = {pf:0,pe:0,pc:0,permanentPf:0,permanentPe:0};
    var text = String(description || '');
    var pattern = /(?:gaste|sofra|sofre|sofrendo|receba|recebe|recebendo|aceite|perca|perde|perdendo)\s*\+?(\d+)\s*(PF|PE|PC)(?:'s)?(?:\s+permanentes?)?/gi;
    var match;
    while((match = pattern.exec(text))){
      var value = parseInt(match[1],10) || 0;
      var resource = match[2].toUpperCase();
      var permanent = /permanente/i.test(match[0]);
      if(resource === 'PF') costs[permanent ? 'permanentPf' : 'pf'] += value;
      if(resource === 'PE') costs[permanent ? 'permanentPe' : 'pe'] += value;
      if(resource === 'PC') costs.pc += value;
    }
    var pairedPattern = /(?:gaste|sofra|sofre|sofrendo|receba|recebe|recebendo|aceite|perca|perde|perdendo)\s*\+?\d+\s*(?:PF|PE|PC)(?:'s)?(?:\s+permanentes?)?\s+e\s+\+?(\d+)\s*(PF|PE|PC)(?:'s)?(?:\s+permanentes?)?/gi;
    while((match = pairedPattern.exec(text))){
      var pairedValue = parseInt(match[1],10) || 0;
      var pairedResource = match[2].toUpperCase();
      var pairedPermanent = new RegExp(match[2]+"(?:'s)?\\s+permanente",'i').test(match[0].slice(match[0].lastIndexOf(match[2])));
      if(pairedResource === 'PF') costs[pairedPermanent ? 'permanentPf' : 'pf'] += pairedValue;
      if(pairedResource === 'PE') costs[pairedPermanent ? 'permanentPe' : 'pe'] += pairedValue;
      if(pairedResource === 'PC') costs.pc += pairedValue;
    }
    var actionCostPattern = /(?:gaste|gastando)[^.]{0,80}a[cç][oõ]es\s+e\s+\+?(\d+)\s*(PF|PE|PC)(?:'s)?(?:\s+permanentes?)?/gi;
    while((match = actionCostPattern.exec(text))){
      var actionValue = parseInt(match[1],10) || 0;
      var actionResource = match[2].toUpperCase();
      var actionPermanent = /permanente/i.test(match[0]);
      if(actionResource === 'PF') costs[actionPermanent ? 'permanentPf' : 'pf'] += actionValue;
      if(actionResource === 'PE') costs[actionPermanent ? 'permanentPe' : 'pe'] += actionValue;
      if(actionResource === 'PC') costs.pc += actionValue;
    }
    return costs;
  }

  function hasDetectedCost(costs){ return Object.keys(costs).some(function(key){ return costs[key] > 0; }); }

  function activePowerList(){
    var list = [];
    var occupationName = model.fields['ocupacao-select'];
    var occupation = getOccupation();
    if(occupation){
      occupation.powers.forEach(function(power){
        var item = typeof power === 'string' ? {name:power,description:''} : power;
        list.push({key:ENGINE.powerKey('occupation',occupationName,item.name),sourceType:'Ocupação',sourceName:occupationName,name:item.name,description:item.description || ''});
      });
    }
    var originName = model.fields['origem-select'];
    var origin = getOrigin();
    if(origin){
      var initial = origin.initial || {name:'Poder Inicial',description:''};
      list.push({key:ENGINE.powerKey('origin',originName,initial.name),sourceType:'Origem · Inicial',sourceName:originName,name:initial.name,description:initial.description || ''});
      origin.powers.filter(function(power){ return model.originPowers.indexOf(power.name) >= 0; }).forEach(function(power){
        list.push({key:ENGINE.powerKey('origin',originName,power.name),sourceType:'Origem',sourceName:originName,name:power.name,description:power.description || ''});
      });
    }
    model.growth.unlockedOrigins.forEach(function(extraOriginName){
      var extraOrigin = DATA.origins[extraOriginName];
      var selected = model.growth.powerSelections[extraOriginName] || [];
      if(!extraOrigin) return;
      extraOrigin.powers.filter(function(power){ return selected.indexOf(power.name) >= 0; }).forEach(function(power){
        list.push({key:ENGINE.powerKey('growth-origin',extraOriginName,power.name),sourceType:'Origem',sourceName:extraOriginName,name:power.name,description:power.description || ''});
      });
    });
    var flowerName = model.fields['flor-select'];
    var flower = DATA.flowers[flowerName];
    if(model.fields.sangue === 'novo' && flower){
      var effectiveIndex = effectiveFlowerIndex();
      flower.stages.forEach(function(stage,index){
        if(index > effectiveIndex) return;
        list.push({key:ENGINE.powerKey('flower',flowerName,stage.name),sourceType:'Flor · '+stage.stage,sourceName:flowerName,name:stage.name,description:stage.description || ''});
      });
    }
    var track = currentGrowthTrack();
    if(track){
      track.stages.forEach(function(stage){
        if(!hasGrowthStage(stage.stage)) return;
        (stage.effects || []).forEach(function(effect,index){
          list.push({key:ENGINE.powerKey('growth',DATA.archetypes[originName],stage.name+'-'+index),sourceType:'Crescimento · '+stage.roman,sourceName:stage.name,name:stage.name,description:effect});
        });
      });
    }
    return list.map(function(power){
      power.scope = ENGINE.usageScope(power.description);
      power.limit = power.scope.key === 'manual' ? Infinity : powerLimit(power.description);
      power.costs = detectedPowerCosts(power.description);
      return power;
    });
  }

  function renderScopeClock(){
    var clock = $('#scope-clock');
    if(!clock) return;
    var labels = {round:'Rodada/Cena clínica',scene:'Cena',conflict:'Conflito',cycle:'Ciclo',session:'Sessão',arc:'Arco',survivor:'Sobrevivente'};
    clock.innerHTML = Object.keys(labels).map(function(scope){ return '<button type="button" class="scope-clock-button" data-advance-scope="'+scope+'"><span>'+labels[scope]+'</span><b>'+model.clock[scope]+'</b><small>avançar</small></button>'; }).join('');
  }

  function powerCenterHtml(){
    var powers = activePowerList();
    var groups = ['Ocupação','Origem · Inicial','Origem','Flor','Crescimento'];
    if(!powers.length) return '<p class="empty-state">Selecione Ocupação, Origem e, se for Sangue Novo, uma Flor.</p>';
    var expiryLabels = {use:'próximo teste',round:'fim da Rodada',scene:'fim da Cena',conflict:'fim do Conflito',cycle:'fim do Ciclo',session:'fim da Sessão',arc:'fim do Arco',survivor:'troca de Sobrevivente'};
    var effects = model.effects.length ? '<section class="power-source-group active-effects"><div class="subsection-heading">Efeitos temporários</div>'+model.effects.map(function(effect){
      return '<article class="power-use-card effect-card"><div class="power-use-heading"><div><span>Bônus ativo</span><strong>'+escapeHtml(effect.name)+'</strong></div><b>+'+effect.bonus+'</b></div><p>'+(effect.allTests ? 'Todos os testes' : escapeHtml([effect.attribute,effect.skill].filter(Boolean).join(' + ')))+' · até '+escapeHtml(expiryLabels[effect.expires] || effect.expires)+'</p></article>';
    }).join('')+'</section>' : '';
    var feedback = model.ui.powerFeedback ? '<div class="status-line power-feedback">'+escapeHtml(model.ui.powerFeedback)+'</div>' : '';
    return '<div class="power-center">'+feedback+'<p class="rule-footnote">O marcador controla limites explícitos de uso. Custos numéricos pessoais detectados na descrição podem ser aplicados junto do registro.</p>'+effects+groups.map(function(group){
      var entries = powers.filter(function(power){ return group === 'Flor' || group === 'Crescimento' ? power.sourceType.indexOf(group) === 0 : power.sourceType === group; });
      if(!entries.length) return '';
      return '<section class="power-source-group"><div class="subsection-heading">'+group+'</div>'+entries.map(function(power){
        var usage = powerUsageState(power.key,power.scope.key);
        var exhausted = power.limit !== Infinity && usage.count >= power.limit;
        var costText = Object.keys(power.costs).filter(function(key){ return power.costs[key] > 0; }).map(function(key){ return power.costs[key]+' '+({pf:'PF',pe:'PE',pc:'PC',permanentPf:'PF permanentes',permanentPe:'PE permanentes'}[key]); }).join(' · ');
        return '<article class="power-use-card '+(exhausted ? 'used' : '')+'" data-power-key="'+escapeHtml(power.key)+'"><div class="power-use-heading"><div><span>'+escapeHtml(power.sourceType)+' · '+escapeHtml(power.sourceName)+'</span><strong>'+escapeHtml(power.name)+'</strong></div><b>'+(power.scope.key === 'manual' ? usage.count+' usos' : usage.count+'/'+power.limit+' por '+power.scope.label)+'</b></div><p>'+escapeHtml(power.description)+'</p>'+(costText ? '<div class="detected-cost">Custo pessoal detectado: '+escapeHtml(costText)+'</div>' : '')+'<div class="inline-actions"><button type="button" class="notes-btn" data-power-use="'+escapeHtml(power.key)+'" '+(exhausted ? 'disabled' : '')+'>'+(costText ? 'Usar e aplicar custo' : 'Registrar uso')+'</button>'+(costText ? '<button type="button" class="text-action" data-power-use-free="'+escapeHtml(power.key)+'" '+(exhausted ? 'disabled' : '')+'>Registrar por outro gatilho</button>' : '')+'</div></article>';
      }).join('')+'</section>';
    }).join('')+'</div>';
  }

  function openPowerCenter(){ openRuleModal('Central de Poderes',powerCenterHtml(),'powers'); }
  function refreshPowerCenter(){ if($('#rule-action-modal').dataset.modalName === 'powers') $('#rule-action-content').innerHTML = powerCenterHtml(); }

  function usePower(key, skipCosts){
    var power = activePowerList().filter(function(item){ return item.key === key; })[0];
    if(!power) return;
    var usage = powerUsageState(power.key,power.scope.key);
    if(power.limit !== Infinity && usage.count >= power.limit) return;
    if(!skipCosts){
      if(power.costs.permanentPf){ var previous=pfTotal();model.health.permanentPf += power.costs.permanentPf;reconcileCriticalState(previous,{source:power.name}); }
      if(power.costs.permanentPe){ model.health.permanentPe += power.costs.permanentPe;if(peTotal()>=bloodLimits().pe)model.stress.breaking=true; }
      if(power.costs.pf) changePF(power.costs.pf,{source:power.name});
      if(power.costs.pe) applyStress(power.costs.pe,{source:power.name});
      if(power.costs.pc) addPC(power.costs.pc);
    }
    markPowerUsed(power.key,power.scope.key);
    model.ui.powerFeedback = 'Uso registrado: '+power.name+'.';
    if(power.sourceType === 'Ocupação' && power.sourceName === 'Masoquista' && power.name === 'Carne Voluntária'){
      addTemporaryEffect({sourceKey:power.key,name:power.name,bonus:1,expires:'scene',allTests:true});
      model.ui.powerFeedback = 'Carne Voluntária: Bônus ativo em todos os testes até o fim da Cena.';
    }
    if(power.sourceType === 'Ocupação' && power.sourceName === 'Preparado' && power.name === 'Eu Sei Usar Isso'){
      addTemporaryEffect({sourceKey:power.key,name:power.name,bonus:2,expires:'use',allTests:true});
      model.ui.powerFeedback = 'Eu Sei Usar Isso: 2 Bônus preparados para o próximo teste auxiliado por um item.';
    }
    if(power.sourceType === 'Ocupação' && power.sourceName === 'Estudioso' && power.name === 'Eu Sempre Tenho um Plano'){
      var planRoll = characterTest('Intelecto','Planejar',0);
      if(planRoll.successes >= 1){
        addTemporaryEffect({sourceKey:power.key,name:power.name,bonus:1,expires:'use',allTests:true});
        model.ui.powerFeedback = 'Plano bem-sucedido ('+planRoll.successes+' sucesso'+(planRoll.successes === 1 ? '' : 's')+'): Bônus preparado para o primeiro teste da Cena.';
      } else {
        model.ui.powerFeedback = 'O teste de Planejar não obteve sucessos; nenhum Bônus foi preparado.';
      }
      addRuleLog('poder','Teste de Planejar para Eu Sempre Tenho um Plano.',{results:planRoll.results,successes:planRoll.successes});
    }
    addRuleLog('poder','Poder usado: '+power.name+'.',{source:power.sourceType+' · '+power.sourceName,scope:power.scope.key,costs:skipCosts ? {} : power.costs});
    renderHealth();renderPC();renderScopeClock();refreshPowerCenter();renderPowerCenterStatus();saveModel();
  }

  function renderPowerCenterStatus(){
    var status = $('#power-center-status');
    if(!status) return;
    var powers = activePowerList();
    var limited = powers.filter(function(power){ return power.scope.key !== 'manual'; }).length;
    status.textContent = powers.length+' poderes disponíveis · '+limited+' com limite rastreado · '+model.effects.length+' efeitos ativos';
    renderScopeClock();
  }

  function applyContinuousWoundDamage(){
    var recurring = {Sangrando:{pf:1,threshold:4},'Ferida Profunda':{pf:2,threshold:3},'Ferida Severa':{pf:3,threshold:2}};
    var total = 0;
    Object.keys(model.wounds).forEach(function(zoneId){
      woundsForBodyZone(zoneId).forEach(function(wound){
        if(!wound.conditionApplied || wound.armorBlocked) return;
        if(wound.condition === 'Atordoado'){
          wound.conditionTicks = (wound.conditionTicks || 0)+1;
          wound.conditionApplied = false;
          addRuleLog('condicao','Atordoado encerrou ao fim da próxima Rodada.',{woundId:wound.id});
          return;
        }
        var rule = recurring[wound.condition];
        if(!rule) return;
        wound.conditionTicks = (wound.conditionTicks || 0)+1;
        total += rule.pf;
        if(!wound.toleranceResolved && wound.conditionTicks >= rule.threshold) wound.tolerancePending = true;
      });
    });
    if(total > 0){ changePF(total,{source:'Condições contínuas'}); applyMasochistRelief(total); }
    renderWounds();renderConditions();renderHealth();saveModel();
    return total;
  }

  function advanceScope(scope){
    if(!model.clock.hasOwnProperty(scope)) return;
    model.clock[scope] += 1;
    Object.keys(model.powerUsage).forEach(function(key){ if(model.powerUsage[key].scope === scope) model.powerUsage[key].count = 0; });
    model.effects = model.effects.filter(function(effect){ return effect.expires !== scope; });
    model.ui.powerFeedback = '';
    if(scope === 'round') applyContinuousWoundDamage();
    if(scope === 'conflict' && DATA.archetypes[model.fields['origem-select']] === 'Cães de Guerra' && hasGrowthStage(10)) changePF(-3,{source:'Máquina de Guerra · início do Conflito'});
    addRuleLog('relogio','Avançou '+scope+'.',{value:model.clock[scope]});
    renderScopeClock();refreshPowerCenter();renderPowerCenterStatus();renderConditions();saveModel();
  }

  function treatWoundCondition(zoneId, woundId){
    var wound = woundById(zoneId,woundId);
    if(!wound) return;
    var replacements = {Sangrando:'Tratado','Ferida Profunda':'Estabilizado','Ferida Severa':'Quebrado'};
    if(replacements[wound.condition]) wound.condition = replacements[wound.condition];
    else wound.conditionApplied = false;
    wound.conditionTicks = 0;
    wound.tolerancePending = false;
    wound.toleranceResolved = true;
    addRuleLog('tratamento','Condição do ferimento tratada.',{woundId:wound.id,result:wound.conditionApplied ? wound.condition : 'removida'});
    renderWounds();renderConditions();saveModel();
  }

  function rollWoundTolerance(zoneId,woundId){
    var wound = woundById(zoneId,woundId);
    if(!wound || !wound.tolerancePending) return;
    var roll = characterTest('Físico','Tolerância',0);
    var success = roll.successes >= 3;
    wound.tolerancePending = false;
    wound.toleranceResolved = true;
    if(!success && !hasCondition('Inconsciente')) model.conditions.push('Inconsciente');
    addRuleLog('condicao','Tolerância de '+wound.condition+': '+(success ? 'sucesso' : 'falha')+'.',{results:roll.results,successes:roll.successes});
    renderConditions();saveModel();
  }

  function renderFlower(){
    var name = model.fields['flor-select'];
    var flower = DATA.flowers[name];
    if(!flower){
      $('#flower-overview').innerHTML = '<p class="empty-state">Escolha uma Flor na Ficha Principal.</p>';
      $('#flower-stages').innerHTML = '';
      renderPowerCenterStatus();
      return;
    }
    $('#flower-overview').innerHTML = '<h3>'+escapeHtml(name)+'</h3><p>'+escapeHtml(flower.description)+'</p>';
    var currentIndex = Math.min(4,DATA.corruptionStages.indexOf(currentCorruptionStage()));
    var effectiveIndex = effectiveFlowerIndex();
    $('#flower-stages').innerHTML = flower.stages.map(function(item,index){
      var active = index === effectiveIndex;
      var unlocked = index <= effectiveIndex;
      return '<article class="flower-stage '+(active ? 'active' : '')+' '+(unlocked ? 'unlocked' : 'locked')+'"><span>'+escapeHtml(item.stage)+'</span><h4>'+escapeHtml(item.name)+'</h4><p>'+escapeHtml(item.description)+'</p>'+(active && effectiveIndex !== currentIndex ? '<em>Ativa um estágio acima por Devoto.</em>' : '')+'</article>';
    }).join('');
    renderPowerCenterStatus();
  }

  function growthRewardText(stage){
    var rewards = stage.rewards || {};
    var values = [];
    if(rewards.originPoints) values.push('+'+rewards.originPoints+' PO');
    if(rewards.skillPoints) values.push('+'+rewards.skillPoints+' PP');
    if(rewards.attributePoints) values.push('+'+rewards.attributePoints+' PA');
    return values.join(' · ') || 'Benefício de Arquétipo';
  }

  function claimedUnlockStages(){
    var track = currentGrowthTrack();
    return track ? track.stages.filter(function(stage){ return hasGrowthStage(stage.stage) && stage.unlockOrigin; }) : [];
  }

  function renderGrowth(){
    if(!$('#growth-stage')) return;
    var track = currentGrowthTrack();
    var stage = clamp(model.growth.stage,0,10);
    model.fields['growth-stage'] = stage;
    $('#growth-stage').value = String(stage);
    if(!track){
      $('#growth-summary').textContent = 'Selecione uma Origem para definir o Arquétipo e sua Trilha.';
      $('#growth-ledger').innerHTML = '';
      $('#growth-track-list').innerHTML = '';
      return;
    }
    var totals = currentGrowthTotals();
    $('#growth-summary').textContent = stage ? 'Etapa atual: '+['','I','II','III','IV','V','VI','VII','VIII','IX','X'][stage]+'. As recompensas marcadas já ampliam os orçamentos da ficha.' : 'A Trilha começa ao fim do primeiro Arco relevante.';
    $('#growth-ledger').innerHTML = '<span><small>PO acumulados</small><b>'+totals.originPoints+'</b></span><span><small>PP recebidos</small><b>'+totals.skillPoints+'</b></span><span><small>PA recebidos</small><b>'+totals.attributePoints+'</b></span><span><small>Origens liberadas</small><b>'+model.growth.unlockedOrigins.length+'</b></span>';
    $('#growth-track-list').innerHTML = track.stages.map(function(item){
      var claimed = hasGrowthStage(item.stage);
      return '<article class="growth-stage-card '+(claimed ? 'claimed' : 'future')+'"><div class="growth-stage-index">'+item.roman+'</div><div><div class="growth-stage-heading"><strong>'+escapeHtml(item.name)+'</strong><span>'+growthRewardText(item)+'</span></div><ul>'+(item.effects || []).map(function(effect){ return '<li>'+escapeHtml(effect)+'</li>'; }).join('')+'</ul>'+(item.unlockOrigin ? '<small class="growth-unlock">Nova Origem · '+(item.unlockOrigin.scope === 'same-archetype' ? 'mesmo Arquétipo' : 'qualquer Arquétipo')+'</small>' : '')+'</div><b class="growth-state">'+(claimed ? 'APLICADA' : 'FUTURA')+'</b></article>';
    }).join('');
    var missingUnlocks = Math.max(0,claimedUnlockStages().length-model.growth.unlockedOrigins.length);
    if(missingUnlocks) $('#growth-ledger').innerHTML += '<button type="button" class="notes-btn danger" id="growth-complete-choices">Escolher '+missingUnlocks+' Origem'+(missingUnlocks === 1 ? '' : 's')+' pendente'+(missingUnlocks === 1 ? '' : 's')+'</button>';
    $('#growth-future-arc').disabled = stage < 10;
    $('#growth-future-status').textContent = stage < 10 ? 'Disponível após a etapa X.' : model.growth.postCapArcs+' Arco'+(model.growth.postCapArcs === 1 ? '' : 's')+' após X · +'+(model.growth.postCapArcs*2)+' PO / +'+(model.growth.postCapArcs*2)+' PP';
    renderPowerCenterStatus();
  }

  function growthUnlockOptions(unlock, selectedValues){
    var track = currentGrowthTrack();
    var candidates = unlock.scope === 'same-archetype' ? track.origins.slice() : Object.keys(DATA.origins);
    var unavailable = [model.fields['origem-select']].concat(model.growth.unlockedOrigins).concat(selectedValues || []);
    return candidates.filter(function(name){ return unavailable.indexOf(name) < 0; }).map(function(name){ return '<option value="'+escapeHtml(name)+'">'+escapeHtml(name)+' · '+escapeHtml(DATA.archetypes[name] || '')+'</option>'; }).join('');
  }

  function growthApplyHtml(nextStage, repair){
    var track = currentGrowthTrack();
    var stages = repair ? claimedUnlockStages().slice(model.growth.unlockedOrigins.length) : track.stages.filter(function(stage){ return stage.stage > model.growth.stage && stage.stage <= nextStage; });
    var unlocks = stages.filter(function(stage){ return stage.unlockOrigin; });
    var selected = [];
    var choices = unlocks.map(function(stage,index){
      var options = growthUnlockOptions(stage.unlockOrigin,selected);
      return '<label class="growth-choice">Etapa '+stage.roman+' · Nova Origem ('+(stage.unlockOrigin.scope === 'same-archetype' ? 'mesmo Arquétipo' : 'qualquer Arquétipo')+')<select data-growth-unlock-choice="'+index+'"><option value="">— Escolher —</option>'+options+'</select></label>';
    }).join('');
    var stageCards = stages.filter(function(stage){ return !repair || stage.unlockOrigin; }).map(function(stage){ return '<li><b>'+stage.roman+' · '+escapeHtml(stage.name)+'</b><span>'+growthRewardText(stage)+'</span></li>'; }).join('');
    return '<div class="rule-dashboard"><p>'+(repair ? 'Complete as escolhas de Origem obtidas em etapas já aplicadas.' : 'Esta aplicação é permanente e inclui todas as etapas atravessadas.')+'</p><ul class="growth-apply-list">'+stageCards+'</ul>'+choices+'<div class="inline-actions"><button type="button" class="primary-action" id="growth-confirm" data-growth-stage="'+nextStage+'" data-growth-repair="'+(repair ? '1' : '0')+'">Confirmar '+(repair ? 'escolhas' : 'Crescimento')+'</button><button type="button" class="notes-btn" data-close-rule-modal>Cancelar</button></div></div>';
  }

  function openGrowthApply(nextStage, repair){
    var track = currentGrowthTrack();
    if(!track) return;
    if(!repair && nextStage <= model.growth.stage){ $('#growth-stage').value = String(model.growth.stage); return; }
    openRuleModal(repair ? 'Escolhas pendentes de Crescimento' : 'Aplicar Crescimento',growthApplyHtml(nextStage,!!repair),'growth');
  }

  function confirmGrowth(){
    var button = $('#growth-confirm');
    if(!button) return;
    var repair = button.dataset.growthRepair === '1';
    var nextStage = clamp(button.dataset.growthStage,0,10);
    var values = $$('[data-growth-unlock-choice]',$('#rule-action-content')).map(function(select){ return select.value; });
    if(values.some(function(value){ return !value; }) || values.some(function(value,index){ return values.indexOf(value) !== index; })){
      alert('Escolha uma Origem diferente em cada liberação antes de confirmar.'); return;
    }
    values.forEach(function(originName){ if(model.growth.unlockedOrigins.indexOf(originName) < 0){ model.growth.unlockedOrigins.push(originName); model.growth.powerSelections[originName] = []; } });
    if(!repair){
      for(var stage=model.growth.stage+1;stage<=nextStage;stage++) if(model.growth.claimedStages.indexOf(stage)<0) model.growth.claimedStages.push(stage);
      model.growth.stage = nextStage;
      model.fields['growth-stage'] = nextStage;
      addRuleLog('crescimento','Crescimento aplicado até a etapa '+nextStage+'.',{unlockedOrigins:values});
    }
    closeRuleModal();
    renderAttributes();renderOrigin();renderGrowth();renderNeeds();renderEquipment();saveModel();
  }

  function catalogItem(id){ return (DATA.commonItems || []).filter(function(item){ return item.id === id; })[0] || null; }
  function ammunitionData(id){ return (DATA.ammunitionTypes || []).filter(function(item){ return item.id === id; })[0] || null; }
  function isInventoryAmmo(item){ return !!(item && item.kind === 'ammo' && item.ammoId); }
  function inventoryCapacity(){
    var bonus = model.inventory.reduce(function(total,item){ var data=item && item.kind === 'item' ? catalogItem(item.catalogId) : null;return total+(data&&data.inventoryCapacityBonus||0); },0);
    return 2 + model.attributes.Físico + bonus;
  }
  function initialItemLimit(){ var occ = getOccupation(); return occ && occ.initialItems || 3; }
  function isInventoryWeapon(item){ return !!(item && item.kind === 'weapon' && item.weapon); }
  function inventoryEntryUsed(item){ return isInventoryWeapon(item) || isInventoryAmmo(item) && (item.quantity > 0 || item.charges > 0) || !!String(item && item.name || '').trim(); }
  function emptyInventoryItem(){ return {id:uid('item'),kind:'item',catalogId:'',name:'',uses:'',quantity:0}; }
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
      modHtml += '<label>Modificação '+(modIndex+1)+'<select class="inventory-weapon-mod-select" data-mod-index="'+modIndex+'"><option value="">— Nenhuma —</option>'+mods.map(function(mod){ return '<option value="'+mod.id+'" '+(selected === mod.id ? 'selected' : '')+'>'+escapeHtml(mod.name)+' · '+modificationCost(mod)+' Partes</option>'; }).join('')+'</select></label>';
    }
    var custom = state.weaponId === 'custom' ? '<div class="custom-weapon-fields"><input class="inventory-custom-weapon-name" value="'+escapeHtml(state.customName)+'" placeholder="Nome"><input class="inventory-custom-weapon-damage" value="'+escapeHtml(state.customDamage)+'" placeholder="Ferimento / munição"><input class="inventory-custom-weapon-range" value="'+escapeHtml(state.customRange)+'" placeholder="Distância / recuo"><input class="inventory-custom-weapon-max" type="number" min="0" value="'+state.customMax+'" placeholder="Usos"></div>' : '';
    var track = max ? '<div class="weapon-track"><span>'+(weapon && weapon.durability ? 'Durabilidade' : 'Munição')+' <b>'+state.current+'/'+max+'</b></span><div class="pips weapon-pips inventory-weapon-pips" data-item-id="'+item.id+'">'+pipButtons(max)+'</div></div>' : '<div class="weapon-track muted">Munição controlada pelo Inventário.</div>';
    return '<div class="inventory-weapon-editor" data-editor-item-id="'+item.id+'"><div class="inventory-editor-heading"><strong>Editando arma guardada</strong><span>Os ajustes não movem nem duplicam a arma.</span></div><label class="inventory-editor-field">Arma<select class="inventory-weapon-select">'+inventoryWeaponOptions(state.weaponId)+'</select></label>'+custom+weaponPowerDetails(weapon)+track+weaponAmmoActions(state,weapon,'inventory',item.id)+'<div class="weapon-mods">'+modHtml+'</div><textarea class="inventory-weapon-notes" placeholder="Anotações, munição, reparos...">'+escapeHtml(state.notes)+'</textarea><div class="inventory-editor-footer"><button type="button" class="notes-btn small inventory-weapon-equip">Equipar em espaço livre</button></div></div>';
  }

  function placeInventoryEntry(entry){
    var emptyIndex = model.inventory.findIndex(function(item){ return !inventoryEntryUsed(item) && !isInventoryWeapon(item); });
    if(emptyIndex >= 0) model.inventory[emptyIndex] = entry;
    else model.inventory.push(entry);
  }

  function addCatalogItem(id){
    var data = catalogItem(id);
    if(!data) return;
    placeInventoryEntry({id:uid('item'),kind:'item',catalogId:data.id,name:data.name,uses:data.uses && data.uses.max != null ? String(data.uses.max) : '',quantity:1});
    addRuleLog('inventario','Item adicionado: '+data.name+'.',{catalogId:data.id});
    renderEquipment();refreshItemCatalog();saveModel();
  }

  function ammoCompatibleWeaponOptions(ammo){
    return DATA.weapons.filter(function(weapon){ return ammo.compatibleWeapons.indexOf(weapon.name) >= 0; }).map(function(weapon){ return '<option value="'+weapon.id+'">'+escapeHtml(weapon.name)+' · capacidade '+weaponMax(weaponStateFromId(weapon.id))+'</option>'; }).join('');
  }

  function addAmmunition(id, mode, weaponId, amountOverride){
    var ammo = ammunitionData(id);
    if(!ammo) return;
    if(ammo.storage === 'container'){
      var weapon = weaponData(weaponId);
      if(!weapon || ammo.compatibleWeapons.indexOf(weapon.name) < 0) return;
      var capacity = weaponMax(weaponStateFromId(weapon.id));
      var charges = mode === 'initial' ? Math.ceil(capacity*Number(ammo.initialFill || .5)) : capacity;
      placeInventoryEntry({id:uid('ammo'),kind:'ammo',catalogId:ammo.id,ammoId:ammo.id,name:ammo.name,weaponId:weapon.id,quantity:1,charges:charges,capacity:capacity,uses:''});
    } else {
      var amount = amountOverride != null ? Math.max(0,parseInt(amountOverride,10)||0) : (mode === 'initial' ? Number(ammo.initialAmount || 0) : 1);
      if(amount <= 0) amount = 1;
      var max = Number(ammo.maxPerInventorySlot || ammo.maxLoaded || 6);
      while(amount > 0){
        var stack = model.inventory.filter(function(item){ return isInventoryAmmo(item) && item.ammoId === ammo.id && !item.weaponId && item.quantity < max; })[0];
        var room = stack ? max-stack.quantity : 0;
        if(stack && room > 0){ var moved=Math.min(room,amount);stack.quantity+=moved;amount-=moved; }
        else { var created=Math.min(max,amount);placeInventoryEntry({id:uid('ammo'),kind:'ammo',catalogId:ammo.id,ammoId:ammo.id,name:ammo.name,weaponId:'',quantity:created,charges:0,capacity:max,uses:''});amount-=created; }
      }
    }
    addRuleLog('inventario','Munição adicionada: '+ammo.name+'.',{mode:mode,weaponId:weaponId || ''});
    renderEquipment();refreshItemCatalog();saveModel();
  }

  function itemCatalogHtml(){
    var itemCards = DATA.commonItems.map(function(item){
      return '<article class="catalog-card" data-catalog-search-text="'+escapeHtml((item.name+' '+item.description).toLocaleLowerCase('pt-BR'))+'"><div><span>ITEM COMUM</span><strong>'+escapeHtml(item.name)+'</strong></div><p>'+escapeHtml(item.description)+'</p><ul>'+item.effects.map(function(effect){ return '<li><b>'+escapeHtml(effect.name)+'</b> · '+escapeHtml(effect.description)+'</li>'; }).join('')+'</ul><small>'+escapeHtml(item.uses.label)+'</small><button type="button" class="notes-btn" data-catalog-item="'+item.id+'">Adicionar ao Inventário</button></article>';
    }).join('');
    var ammoCards = DATA.ammunitionTypes.map(function(ammo){
      var controls = ammo.storage === 'container' ? '<label>Compatível com<select data-ammo-weapon-select="'+ammo.id+'">'+ammoCompatibleWeaponOptions(ammo)+'</select></label><div class="inline-actions"><button type="button" class="notes-btn" data-catalog-ammo="'+ammo.id+'" data-ammo-mode="full">Adicionar cheio</button><button type="button" class="text-action" data-catalog-ammo="'+ammo.id+'" data-ammo-mode="initial">Adicionar inicial · metade</button></div>' : '<div class="inline-actions"><button type="button" class="notes-btn" data-catalog-ammo="'+ammo.id+'" data-ammo-mode="single">Adicionar 1</button>'+(ammo.initialAmount ? '<button type="button" class="text-action" data-catalog-ammo="'+ammo.id+'" data-ammo-mode="initial">Adicionar inicial · '+ammo.initialAmount+'</button>' : '')+'</div>';
      return '<article class="catalog-card ammo-catalog-card" data-catalog-search-text="'+escapeHtml((ammo.name+' '+ammo.description+' '+ammo.compatibleWeapons.join(' ')).toLocaleLowerCase('pt-BR'))+'"><div><span>MUNIÇÃO · '+escapeHtml(ammo.storage)+'</span><strong>'+escapeHtml(ammo.name)+'</strong></div><p>'+escapeHtml(ammo.description)+'</p><small>'+escapeHtml(ammo.reload)+'</small>'+controls+'</article>';
    }).join('');
    return '<div class="catalog-shell"><label class="catalog-search">Buscar no catálogo<input id="catalog-search" type="search" placeholder="Nome, efeito ou arma..." value="'+escapeHtml(model.ui.itemCatalogFilter)+'"></label><div class="subsection-heading">Itens comuns · '+DATA.commonItems.length+'</div><div class="catalog-grid">'+itemCards+'</div><div class="subsection-heading">Munições · '+DATA.ammunitionTypes.length+'</div><div class="catalog-grid">'+ammoCards+'</div></div>';
  }

  function openItemCatalog(){ openRuleModal('Catálogo de Itens & Munições',itemCatalogHtml(),'catalog');filterCatalogCards(model.ui.itemCatalogFilter); }
  function refreshItemCatalog(){ if($('#rule-action-modal').dataset.modalName === 'catalog'){ $('#rule-action-content').innerHTML=itemCatalogHtml();filterCatalogCards(model.ui.itemCatalogFilter); } }
  function filterCatalogCards(value){
    value=String(value||'').toLocaleLowerCase('pt-BR').trim();
    $$('.catalog-card',$('#rule-action-content')).forEach(function(card){ card.classList.toggle('hidden',value && card.dataset.catalogSearchText.indexOf(value)<0); });
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
    var capacityBonus = capacity-(2+model.attributes.Físico);
    $('#inventory-capacity-tag').textContent = 'MÁX. = ' + capacity + ' (2 + FÍSICO'+(capacityBonus ? ' + '+capacityBonus+' EQUIP.' : '')+')';
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
      if(isInventoryAmmo(item)){
        var ammo=ammunitionData(item.ammoId);var ammoWeapon=weaponData(item.weaponId);var ammoAmount=ammo&&ammo.storage==='container' ? item.charges+'/'+item.capacity+' cargas' : item.quantity+' unidade'+(item.quantity===1?'':'s');
        return '<article class="inv-slot catalog-inventory-slot ammo-inventory-slot '+(index>=capacity?'overloaded-slot':'')+'" data-item-id="'+item.id+'"><span class="list-num">'+String(index+1).padStart(2,'0')+'</span><div><span class="inventory-kind">MUNIÇÃO</span><strong>'+escapeHtml(ammo?ammo.name:item.name)+'</strong><p>'+(ammoWeapon?escapeHtml(ammoWeapon.name)+' · ':'')+ammoAmount+'</p><small>'+escapeHtml(ammo?ammo.reload:'')+'</small></div><div class="inventory-quantity"><button type="button" data-ammo-delta="-1" aria-label="Diminuir munição">−</button><b>'+(ammo&&ammo.storage==='container'?item.charges:item.quantity)+'</b><button type="button" data-ammo-delta="1" aria-label="Aumentar munição">+</button></div><button type="button" class="list-row-remove inventory-remove" title="Excluir">×</button></article>';
      }
      var catalog=catalogItem(item.catalogId);
      if(catalog){
        var unlimited=catalog.uses&&catalog.uses.max==null;var remaining=unlimited?'∞':Math.max(0,parseInt(item.uses,10)||0);
        return '<article class="inv-slot catalog-inventory-slot '+(index>=capacity?'overloaded-slot':'')+'" data-item-id="'+item.id+'"><span class="list-num">'+String(index+1).padStart(2,'0')+'</span><div><span class="inventory-kind">ITEM COMUM</span><strong>'+escapeHtml(catalog.name)+'</strong><p>'+escapeHtml(catalog.effects.map(function(effect){return effect.name;}).join(' · '))+'</p><small>'+escapeHtml(catalog.uses.label)+'</small></div><div class="inventory-quantity">'+(unlimited?'<b>∞</b>':'<button type="button" data-item-use="-1" aria-label="Gastar uso">−</button><b>'+remaining+'</b><button type="button" data-item-use="1" aria-label="Recuperar uso">+</button>')+'</div><button type="button" class="list-row-remove inventory-remove" title="Excluir">×</button></article>';
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
  function modificationCost(mod){
    var discount = DATA.archetypes[model.fields['origem-select']] === 'Donos da Razão' && hasGrowthStage(8);
    return discount ? Math.ceil(Number(mod.cost || 0)/2) : Number(mod.cost || 0);
  }
  function weaponAmmunition(weapon){
    if(!weapon) return null;
    return DATA.ammunitionTypes.filter(function(ammo){ return ammo.compatibleWeapons.indexOf(weapon.name) >= 0; })[0] || null;
  }
  function looseAmmoAvailable(ammoId){
    return model.inventory.reduce(function(total,item){ return total+(isInventoryAmmo(item)&&item.ammoId===ammoId&&!item.weaponId?item.quantity:0); },0);
  }
  function consumeLooseAmmo(ammoId, amount){
    var remaining=Math.max(0,amount);
    model.inventory.forEach(function(item){if(!remaining||!isInventoryAmmo(item)||item.ammoId!==ammoId||item.weaponId)return;var used=Math.min(item.quantity,remaining);item.quantity-=used;remaining-=used;});
    model.inventory=model.inventory.filter(function(item){return !isInventoryAmmo(item)||item.quantity>0||item.charges>0;});
    return amount-remaining;
  }
  function weaponAmmoActions(state, weapon, location, itemId){
    var ammo=weaponAmmunition(weapon);if(!ammo)return '';
    var locationAttributes=location==='inventory'?' data-ammo-item="'+itemId+'"':' data-weapon-index="'+itemId+'"';
    var bow=ammo.id==='flechas';
    return '<div class="weapon-ammo-actions no-print"><button type="button" class="notes-btn small weapon-fire"'+locationAttributes+'>'+(bow?'Disparar · 1 Flecha':'Registrar ataque')+'</button>'+(bow?'':'<button type="button" class="notes-btn small weapon-reload"'+locationAttributes+'>Recarregar</button>')+'<small>'+escapeHtml(ammo.name)+' na reserva: '+(ammo.storage==='container'?model.inventory.filter(function(item){return isInventoryAmmo(item)&&item.ammoId===ammo.id&&item.weaponId===weapon.id&&item.charges>0;}).length:looseAmmoAvailable(ammo.id))+'</small></div>';
  }
  function reloadWeaponState(state){
    var weapon=weaponData(state.weaponId);var ammo=weaponAmmunition(weapon);if(!weapon||!ammo||ammo.id==='flechas')return {ok:false,message:'Esta arma não usa recarga carregada.'};
    var max=weaponMax(state);if(state.current>=max)return {ok:false,message:'A arma já está com a capacidade máxima.'};
    if(ammo.storage==='container'){
      var reserve=model.inventory.filter(function(item){return isInventoryAmmo(item)&&item.ammoId===ammo.id&&item.weaponId===weapon.id&&item.charges>0;})[0];
      if(!reserve)return {ok:false,message:'Não há '+ammo.name+' compatível no Inventário.'};
      var oldCurrent=state.current;
      state.current=Math.min(max,reserve.charges);
      model.inventory=model.inventory.filter(function(item){return item.id!==reserve.id;});
      if(oldCurrent>0)placeInventoryEntry({id:uid('ammo'),kind:'ammo',catalogId:ammo.id,ammoId:ammo.id,name:ammo.name,weaponId:weapon.id,quantity:1,charges:oldCurrent,capacity:max,uses:''});
      return {ok:true,message:ammo.name+' trocado: '+state.current+'/'+max+'. A munição anterior foi preservada no Inventário.'};
    }
    var perAction=ammo.id==='cargas'?1:4;var need=Math.min(perAction,max-state.current);var consumed=consumeLooseAmmo(ammo.id,need);
    if(!consumed)return {ok:false,message:'Não há '+ammo.name+' no Inventário.'};
    state.current+=consumed;
    return {ok:true,message:'Recarregou '+consumed+' '+ammo.name+' · '+state.current+'/'+max+'.'};
  }
  function fireWeaponState(state){
    var weapon=weaponData(state.weaponId);var ammo=weaponAmmunition(weapon);if(!weapon||!ammo)return {ok:false,message:'Esta arma não usa munição.'};
    if(ammo.id==='flechas'){
      if(consumeLooseAmmo('flechas',1)<1)return {ok:false,message:'Não há Flechas no Inventário.'};
      return {ok:true,message:'Disparo registrado: −1 Flecha. Se matou o Alvo, role 1D6 para possível recuperação.'};
    }
    var cost=weapon.id==='submetralhadora'?2:1;
    if(state.current<cost)return {ok:false,message:'Munição carregada insuficiente. Recarregue a arma.'};
    state.current-=cost;
    return {ok:true,message:'Ataque registrado: −'+cost+' '+ammo.name+' · '+state.current+'/'+weaponMax(state)+'.'};
  }
  function showWeaponFeedback(result){
    var feedback=$('#weapon-add-feedback');if(!feedback)return;feedback.textContent=result.message;feedback.className='inline-feedback '+(result.ok?'budget-ok':'over');
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
        modHtml += '<label>Modificação '+(modIndex+1)+'<select class="weapon-mod-select" data-mod-index="'+modIndex+'"><option value="">— Nenhuma —</option>'+mods.map(function(mod){ return '<option value="'+mod.id+'" '+(selected === mod.id ? 'selected' : '')+'>'+mod.name+' · '+modificationCost(mod)+' Partes</option>'; }).join('')+'</select></label>';
      }
      var custom = state.weaponId === 'custom' ? '<div class="custom-weapon-fields"><input class="custom-weapon-name" value="'+escapeHtml(state.customName)+'" placeholder="Nome"><input class="custom-weapon-damage" value="'+escapeHtml(state.customDamage)+'" placeholder="Ferimento / munição"><input class="custom-weapon-range" value="'+escapeHtml(state.customRange)+'" placeholder="Distância / recuo"><input class="custom-weapon-max" type="number" min="0" value="'+state.customMax+'" placeholder="Usos"></div>' : '';
      var track = max ? '<div class="weapon-track"><span>'+(weapon && weapon.durability ? 'Durabilidade' : 'Munição')+' <b>'+state.current+'/'+max+'</b></span><div class="pips weapon-pips" data-weapon-index="'+index+'">'+pipButtons(max)+'</div></div>' : '<div class="weapon-track muted">Munição carregada diretamente do Inventário.</div>';
      var invalidSlot = weapon && !weaponAllowedInSlot(weapon,index);
      var broken = weaponHasContent(state) && max > 0 && state.current === 0;
      return '<article class="weapon-card '+(index >= allowed || invalidSlot ? 'overloaded-slot ' : '')+(broken ? 'broken' : '')+'" data-weapon-index="'+index+'"><div class="weapon-card-header"><div class="weapon-card-title">Espaço '+(index+1)+' · '+weaponSlotLabel(index)+'</div><div>'+(broken ? '<span class="broken-chip">QUEBRADA</span>' : '')+(invalidSlot ? '<span class="warning-chip">Espaço incompatível</span>' : '')+'</div></div><select class="weapon-select">'+weaponOptions(state.weaponId,index)+'</select>'+custom+'<div class="weapon-stats">'+escapeHtml(stats)+'</div>'+weaponPowerDetails(weapon)+track+weaponAmmoActions(state,weapon,'equipped',index)+'<div class="weapon-mods">'+modHtml+'</div><textarea class="weapon-notes" placeholder="Anotações, munição no Inventário, reparos...">'+escapeHtml(state.notes)+'</textarea>'+(weaponHasContent(state) ? '<button type="button" class="notes-btn small weapon-to-inventory">Mover para o Inventário</button>' : '')+'</article>';
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
    if(isInventoryAmmo(item)){
      item.quantity=Math.max(0,item.quantity-1);
      if(item.quantity===0)model.inventory=model.inventory.filter(function(entry){return entry.id!==item.id;});
      return;
    }
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

  function conditionCategory(categoryId){
    return CONDITION_CATEGORIES.filter(function(category){ return category.id === categoryId; })[0] ||
      {id:'other',label:'Outras',description:'Condições e efeitos personalizados.'};
  }
  function conditionDefinition(name){
    return CONDITION_LIBRARY.filter(function(condition){ return condition.name === name; })[0] || null;
  }
  function hasCondition(name){
    return model.conditions.indexOf(name) >= 0;
  }
  function conditionCategoryOptions(selected){
    return '<option value="">Todas as categorias</option>'+CONDITION_CATEGORIES.map(function(category){
      return '<option value="'+category.id+'" '+(selected === category.id ? 'selected' : '')+'>'+category.label+'</option>';
    }).join('');
    renderPowerCenterStatus();
  }
  function renderConditionPicker(){
    var categorySelect = $('#condition-category');
    var conditionSelect = $('#condition-select');
    if(!categorySelect || !conditionSelect) return;
    var selectedCategory = categorySelect.value;
    var selectedCondition = conditionSelect.value;
    categorySelect.innerHTML = conditionCategoryOptions(selectedCategory);
    var choices = CONDITION_LIBRARY.filter(function(condition){
      return !selectedCategory || condition.category === selectedCategory;
    });
    if(selectedCategory){
      conditionSelect.innerHTML = '<option value="">— Selecionar —</option>'+choices.map(function(condition){
        return '<option value="'+escapeHtml(condition.name)+'">'+escapeHtml(condition.name)+'</option>';
      }).join('');
    } else {
      conditionSelect.innerHTML = '<option value="">— Selecionar —</option>'+CONDITION_CATEGORIES.map(function(category){
        var options = choices.filter(function(condition){ return condition.category === category.id; }).map(function(condition){
          return '<option value="'+escapeHtml(condition.name)+'">'+escapeHtml(condition.name)+'</option>';
        }).join('');
        return '<optgroup label="'+category.label+'">'+options+'</optgroup>';
      }).join('');
    }
    conditionSelect.value = choices.some(function(condition){ return condition.name === selectedCondition; }) ? selectedCondition : '';
    renderConditionReference();
  }
  function renderConditionReference(){
    var reference = $('#condition-reference');
    if(!reference) return;
    var definition = conditionDefinition($('#condition-select').value);
    if(!definition){
      var category = $('#condition-category').value ? conditionCategory($('#condition-category').value) : null;
      reference.innerHTML = category ? '<strong>'+category.label+'</strong><span>'+category.description+'</span>' : 'Selecione uma condição para consultar seu resumo e duração.';
      return;
    }
    var categoryInfo = conditionCategory(definition.category);
    reference.innerHTML = '<div><strong>'+escapeHtml(definition.name)+'</strong><span>'+categoryInfo.label+' · '+escapeHtml(definition.duration)+'</span></div><p>'+escapeHtml(definition.summary)+'</p>';
  }
  function derivedWoundConditions(){
    var entries = [];
    Object.keys(model.wounds).forEach(function(zoneId){
      var label = BODY_ZONE_LABELS.filter(function(zone){ return zone.id === zoneId; })[0];
      woundsForBodyZone(zoneId).forEach(function(wound){
        if(!wound.condition || !wound.conditionApplied || wound.armorBlocked) return;
        entries.push({name:wound.condition,zoneId:zoneId,woundId:wound.id,source:'Ferimento · '+(label ? label.label : woundRegion(zoneId)),severity:wound.severity,ticks:wound.conditionTicks || 0,tolerancePending:!!wound.tolerancePending});
      });
    });
    return entries;
  }
  function renderConditions(){
    renderConditionPicker();
    var list = $('#condition-list');
    if(!list) return;
    var grouped = {};
    model.conditions.forEach(function(name,index){
      if(!grouped[name]) grouped[name] = {name:name,manualIndices:[],sources:[],definition:conditionDefinition(name)};
      grouped[name].manualIndices.push(index);
    });
    derivedWoundConditions().forEach(function(source){
      if(!grouped[source.name]) grouped[source.name] = {name:source.name,manualIndices:[],sources:[],definition:conditionDefinition(source.name)};
      grouped[source.name].sources.push(source);
    });
    var allEntries = Object.keys(grouped).map(function(name){ return grouped[name]; });
    if(!allEntries.length){
      list.innerHTML = '<span class="empty-state">Nenhuma condição ativa.</span>';
      return;
    }
    var categoryIds = CONDITION_CATEGORIES.map(function(category){ return category.id; }).concat(['other']);
    list.innerHTML = categoryIds.map(function(categoryId){
      var entries = allEntries.filter(function(entry){
        return (entry.definition ? entry.definition.category : 'other') === categoryId;
      });
      if(!entries.length) return '';
      var category = conditionCategory(categoryId);
      return '<section class="condition-category-group"><div class="condition-category-heading"><div><strong>'+category.label+'</strong><span>'+category.description+'</span></div><b>'+entries.length+'</b></div>'+
        '<div class="condition-card-list">'+entries.map(function(entry){
          var duration = entry.definition ? entry.definition.duration : 'Personalizada';
          var summary = entry.definition ? entry.definition.summary : 'Efeito definido pelo grupo.';
          var sources = entry.sources.map(function(source){ return '<div class="condition-source-row"><button type="button" class="condition-source" data-wound-source="'+escapeHtml(source.zoneId)+'" data-wound-id="'+escapeHtml(source.woundId)+'">'+escapeHtml(source.source)+(source.ticks ? ' · '+source.ticks+' avanço'+(source.ticks === 1 ? '' : 's') : '')+'</button>'+(source.tolerancePending ? '<button type="button" class="notes-btn small danger" data-wound-tolerance="'+escapeHtml(source.woundId)+'" data-wound-zone="'+escapeHtml(source.zoneId)+'">Tolerância NS 3</button>' : '')+'<button type="button" class="notes-btn small" data-wound-treat="'+escapeHtml(source.woundId)+'" data-wound-zone="'+escapeHtml(source.zoneId)+'">Tratar</button></div>'; }).join('');
          var remove = entry.manualIndices.length ? '<button type="button" data-condition-index="'+entry.manualIndices[0]+'" title="Remover condição manual '+escapeHtml(entry.name)+'" aria-label="Remover condição manual '+escapeHtml(entry.name)+'">×</button>' : '';
          return '<article class="condition-card '+(entry.sources.length ? 'derived-condition' : '')+'"><div><strong>'+escapeHtml(entry.name)+'</strong><span>'+escapeHtml(duration)+'</span></div><p>'+escapeHtml(summary)+'</p>'+(sources ? '<div class="condition-sources">'+sources+'</div>' : '')+remove+'</article>';
        }).join('')+'</div></section>';
    }).join('');
  }
  function addCondition(name){
    name = String(name || '').trim();
    var definition = conditionDefinition(name);
    if(name && definition && (definition.category === 'terrain' || definition.category === 'environment') && DATA.archetypes[model.fields['origem-select']] === 'Terra Viva' && hasGrowthStage(7)){
      addRuleLog('imunidade','Resiliência Ecológica impediu '+name+'.',null);
      renderConditions();saveModel();return;
    }
    if(name && !hasCondition(name)) model.conditions.push(name);
    renderConditions();
    saveModel();
  }

  function woundsForBodyZone(zoneId){
    var canonical = canonicalBodyZone(zoneId);
    return Array.isArray(model.wounds[canonical]) ? model.wounds[canonical] : [];
  }
  function highestWoundForBodyZone(zoneId){
    var entries = woundsForBodyZone(zoneId).slice();
    if(!entries.length) return null;
    return entries.sort(function(a,b){ return Number(b.severity) - Number(a.severity); })[0];
  }
  function renderWounds(){
    $$('.zone').forEach(function(zone){
      var detail = highestWoundForBodyZone(zone.id);
      var severity = detail ? Number(detail.severity) || 0 : 0;
      zone.classList.remove('w-none','w-light','w-medium','w-severe');
      zone.classList.add(severity === 1 ? 'w-light' : (severity === 2 ? 'w-medium' : (severity === 3 ? 'w-severe' : 'w-none')));
      var count = woundsForBodyZone(zone.id).length;
      zone.setAttribute('aria-label',(count ? count+' ferimento'+(count === 1 ? '' : 's')+' em ' : 'Marcar ferimento em ')+zone.dataset.part);
    });
    var lines = [];
    $$('.zone').forEach(function(zone){
      var wounds = woundsForBodyZone(zone.id);
      if(wounds.length){
        var ordered = wounds.slice().sort(function(a,b){ return Number(b.severity)-Number(a.severity); });
        var items = ordered.map(function(detail){
        var label = detail.severity === 1 ? 'Leve' : (detail.severity === 2 ? 'Moderado' : 'Grave');
          return '<div class="wound-summary-entry severity-'+detail.severity+'"><span>'+label+(detail.type ? ' · '+escapeHtml(detail.type) : '')+(detail.pf != null ? ' · '+detail.pf+' PF' : '')+(detail.condition ? ' · '+escapeHtml(detail.condition)+(detail.armorBlocked || !detail.conditionApplied ? ' impedida' : '') : '')+'</span>'+(detail.note ? '<small>'+escapeHtml(detail.note)+'</small>' : '')+'</div>';
        }).join('');
        lines.push('<section class="wound-region-summary"><div><strong>'+escapeHtml(zone.dataset.part)+'</strong><b>'+wounds.length+'</b></div>'+items+'</section>');
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
    if(!type || !severity) return {pf:0};
    var region = woundRegion(zoneId);
    if(DATA.woundTable[type] && DATA.woundTable[type][region]){
      return ENGINE.woundOutcome(DATA.woundTable,type,region,severity);
    }
    var environment = {
      'Explosão':{pf:10,condition:'Ferida Severa'}, 'Corrosão':{pf:8,condition:'Corrosão'}, 'Fogo':{pf:6,condition:'Em Chamas'}, 'Veneno':{pf:4,condition:'Envenenado'}, 'Clima':{pf:0,condition:'Clima Extremo'}
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
  var editingWoundId = '';
  function woundById(zoneId,woundId){
    return woundsForBodyZone(zoneId).filter(function(detail){ return detail.id === woundId; })[0] || null;
  }
  function renderWoundModalList(){
    if(!editingZoneId || !$('#wound-existing-list')) return;
    var wounds = woundsForBodyZone(editingZoneId);
    $('#wound-existing-list').innerHTML = wounds.length ? wounds.map(function(detail,index){
      var severity = ['','Leve','Moderado','Grave'][detail.severity] || '';
      return '<article class="wound-existing-card '+(detail.id === editingWoundId ? 'editing' : '')+'"><div><strong>Ferimento '+(index+1)+' · '+severity+'</strong><span>'+escapeHtml(detail.type || 'Sem tipo')+' · '+detail.pf+' PF'+(detail.condition ? ' · '+escapeHtml(detail.condition)+(detail.armorBlocked ? ' impedida' : '') : '')+'</span></div>'+
        '<div><button type="button" class="wound-edit-button" data-wound-edit="'+escapeHtml(detail.id)+'">Editar</button><button type="button" class="wound-remove-button" data-wound-remove="'+escapeHtml(detail.id)+'">Remover</button></div></article>';
    }).join('') : '<span class="empty-state">Nenhum ferimento nesta região.</span>';
    $('#wound-existing-count').textContent = wounds.length+' registrado'+(wounds.length === 1 ? '' : 's');
  }
  function setWoundForm(detail){
    detail = detail || {type:'',note:'',severity:0};
    $('#wound-rule-preview').classList.remove('error');
    $('#wound-type').value = detail.type || '';
    $('#wound-note').value = detail.note || '';
    $$('input[name="wound-severity"]').forEach(function(radio){ radio.checked = Number(radio.value) === Number(detail.severity || 0); });
    $('#wound-apply-pf').checked = !detail.id;
    $('#wound-save').textContent = detail.id ? 'Atualizar ferimento' : 'Adicionar ferimento';
    $('#wound-new').classList.toggle('hidden',!detail.id);
    var firstDefenseOption = $('#wound-first-defense-option');
    if(firstDefenseOption){
      var firstDefenseKey = ENGINE.powerKey('growth','Cães de Guerra','Primeiro Impacto');
      var firstDefenseReady = DATA.archetypes[model.fields['origem-select']] === 'Cães de Guerra' && hasGrowthStage(1) && !(model.powerUsage[firstDefenseKey] && model.powerUsage[firstDefenseKey].count > 0);
      firstDefenseOption.classList.toggle('hidden',!firstDefenseReady || !!detail.id);
      $('#wound-ignore-first-defense').checked = false;
    }
    updateWoundPreview();
  }
  function startNewWound(){
    editingWoundId = '';
    setWoundForm(null);
    renderWoundModalList();
  }
  function openWoundModal(zone){
    editingZoneId = canonicalBodyZone(zone.id);
    $('#wound-zone-name').textContent = zone.dataset.part;
    startNewWound();
    $('#wound-modal').style.display = 'flex';
  }
  function editWound(woundId){
    var detail = woundById(editingZoneId,woundId);
    if(!detail) return;
    editingWoundId = woundId;
    setWoundForm(detail);
    renderWoundModalList();
  }
  function removeWound(woundId){
    if(!editingZoneId) return;
    model.wounds[editingZoneId] = woundsForBodyZone(editingZoneId).filter(function(detail){ return detail.id !== woundId; });
    if(!model.wounds[editingZoneId].length) delete model.wounds[editingZoneId];
    if(editingWoundId === woundId) startNewWound();
    else renderWoundModalList();
    renderWounds(); renderConditions();
    saveModel();
  }
  function closeWoundModal(){ editingZoneId = null; editingWoundId = ''; $('#wound-modal').style.display = 'none'; }
  function selectedWoundSeverity(){
    var checked = $('input[name="wound-severity"]:checked');
    return checked ? parseInt(checked.value,10) : 0;
  }
  function updateWoundPreview(){
    if(!editingZoneId) return;
    var rule = woundRule($('#wound-type').value,selectedWoundSeverity(),editingZoneId);
    var armor = armorForRegion(woundRegion(editingZoneId));
    var growthBlocks = DATA.archetypes[model.fields['origem-select']] === 'Terra Viva' && hasGrowthStage(8) && selectedWoundSeverity() <= 2;
    $('#wound-rule-preview').textContent = selectedWoundSeverity() && $('#wound-type').value ? ('Regra base: '+rule.pf+' PF'+(rule.condition ? ' + '+rule.condition : ' · sem Condição')+'. '+(armor ? armor.item.name+' reduzirá os PF, consumirá 1 Integridade e impedirá a Condição.' : (growthBlocks && rule.condition ? 'Ritidoma impedirá a Condição deste Ferimento.' : 'Sem proteção automática ativa.'))) : 'Selecione tipo e gravidade para consultar a regra.';
  }

  function applyWound(){
    if(!editingZoneId) return;
    var severity = selectedWoundSeverity();
    var type = $('#wound-type').value;
    if(!severity || !type){
      $('#wound-rule-preview').textContent = 'Escolha o tipo e a gravidade antes de salvar.';
      $('#wound-rule-preview').classList.add('error');
      return;
    }
    $('#wound-rule-preview').classList.remove('error');
    var rule = woundRule(type,severity,editingZoneId);
    var previousDetail = editingWoundId ? woundById(editingZoneId,editingWoundId) : null;
    var applyRules = $('#wound-apply-pf').checked;
    var pf = applyRules ? rule.pf : (previousDetail ? previousDetail.pf : rule.pf);
    var basePf = rule.pf;
    var conditionBlocked = false;
    var armor = armorForRegion(woundRegion(editingZoneId));
    if(armor && applyRules){
      if(armor.item.reduction === 'todos') pf = 0;
      else pf = Math.max(0,pf-armor.item.reduction);
      armor.state.remaining = Math.max(0,armor.state.remaining-1);
      conditionBlocked = true;
    }
    var firstDefense = $('#wound-ignore-first-defense');
    if(applyRules && firstDefense && firstDefense.checked){
      pf = 0; conditionBlocked = true;
      markPowerUsed(ENGINE.powerKey('growth','Cães de Guerra','Primeiro Impacto'),'conflict');
    }
    if(DATA.archetypes[model.fields['origem-select']] === 'Terra Viva' && hasGrowthStage(8) && severity <= 2) conditionBlocked = true;
    var detail = {
      id:editingWoundId || uid('wound'), type:type, severity:severity, note:$('#wound-note').value,
      pf:pf, basePf:basePf, condition:rule.condition || '',
      conditionApplied:applyRules ? !!rule.condition && !conditionBlocked : (previousDetail ? previousDetail.conditionApplied : false),
      armorBlocked:applyRules ? conditionBlocked : !!(previousDetail && previousDetail.armorBlocked), rulesApplied:applyRules || !!(previousDetail && previousDetail.rulesApplied),
      conditionTicks:previousDetail ? previousDetail.conditionTicks || 0 : 0,
      tolerancePending:previousDetail ? !!previousDetail.tolerancePending : false,
      toleranceResolved:previousDetail ? !!previousDetail.toleranceResolved : false
    };
    var wounds = woundsForBodyZone(editingZoneId).slice();
    if(editingWoundId){
      wounds = wounds.map(function(existing){ return existing.id === editingWoundId ? detail : existing; });
    } else {
      wounds.push(detail);
    }
    model.wounds[editingZoneId] = wounds;
    if(applyRules){ changePF(pf,{source:'ferimento '+type+' em '+woundRegion(editingZoneId)}); applyMasochistRelief(pf); }
    renderWounds(); renderConditions(); renderHealth(); renderArmor(); saveModel(); closeWoundModal();
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

  function relationshipScoreLabel(score){
    return (score > 0 ? '+' : '')+score;
  }
  function relationshipScale(entry){
    var buttons = '';
    for(var score=-5;score<=5;score++){
      var level = RELATIONSHIP_LEVELS[String(score)];
      buttons += '<button type="button" class="relationship-step '+(score === entry.score ? 'selected' : '')+' '+(score < 0 ? 'negative' : (score > 0 ? 'positive' : 'neutral'))+'" data-relationship-score="'+score+'" title="'+relationshipScoreLabel(score)+' · '+level.name+'" aria-label="'+relationshipScoreLabel(score)+' '+level.name+'" aria-pressed="'+(score === entry.score ? 'true' : 'false')+'">'+relationshipScoreLabel(score)+'</button>';
    }
    return buttons;
  }
  function renderRelationships(){
    var list = $('#relationship-list');
    if(!list) return;
    if(!model.relationships.length){
      list.innerHTML = '<div class="empty-state relationship-empty">Nenhuma pessoa registrada. Todo relacionamento começa em 0 (Neutro), salvo contexto anterior.</div>';
      return;
    }
    list.innerHTML = model.relationships.map(function(entry){
      var level = RELATIONSHIP_LEVELS[String(entry.score)];
      return '<article class="relationship-card" data-relationship-id="'+escapeHtml(entry.id)+'">'+
        '<div class="relationship-card-header"><input class="relationship-name" type="text" value="'+escapeHtml(entry.name)+'" placeholder="Nome da pessoa / PNJ">'+
        '<input class="relationship-role" type="text" value="'+escapeHtml(entry.role)+'" placeholder="Laço, função ou comunidade">'+
        '<button type="button" class="relationship-remove" title="Remover relacionamento" aria-label="Remover relacionamento">×</button></div>'+
        '<div class="relationship-state '+(entry.score < 0 ? 'negative' : (entry.score > 0 ? 'positive' : 'neutral'))+'"><button type="button" class="relationship-delta" data-relationship-delta="-1" aria-label="Diminuir relacionamento">−</button>'+
        '<div><strong>'+relationshipScoreLabel(entry.score)+' · '+level.name+'</strong><span>'+level.description+'</span></div>'+
        '<button type="button" class="relationship-delta" data-relationship-delta="1" aria-label="Aumentar relacionamento">+</button></div>'+
        '<div class="relationship-scale" role="group" aria-label="Escala de relacionamento de menos cinco a mais cinco">'+relationshipScale(entry)+'</div>'+
        '<textarea class="relationship-note" placeholder="Ações, promessas, conflitos e mudanças neste vínculo...">'+escapeHtml(entry.note)+'</textarea>'+
        '</article>';
    }).join('');
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
    renderPowerCenterStatus();
    renderNeeds();
    renderRelationships();
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
      var received = Math.max(0,target-total);
      changePF(target-total,{source:'ajuste manual da barra'});
      applyMasochistRelief(received);
    } else {
      var peTotal = model.health.pe + model.health.permanentPe;
      var peTarget = peTotal === index ? index-1 : index;
      changePE(peTarget-peTotal,{source:'ajuste manual da barra'});
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
    var rollEffects = activeRollEffects(attribute,skill);
    var temporaryBonus = rollEffects.reduce(function(total,effect){ return total + effect.bonus; },0);
    var bonus = clamp((Number($('#roll-bonus').value) || 0) + prodigyBonus + temporaryBonus,0,3);
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
    var labels = ['Falha','Sofrido','Gangrenado','Dilacerante','Profano','Absoluto'];
    var nsIndex = Math.min(5,successes);
    var passed = target ? successes >= target : null;
    var failed = target ? !passed : successes === 0;
    var crisis = stress && target && !passed;
    var stressCost = DATA.archetypes[model.fields['origem-select']] === 'Donos da Razão' && hasGrowthStage(4) ? 1 : 2;
    if(stress) applyStress(stressCost,{source:'Aposta de Estresse',forceCrisis:crisis});
    consumeNextTestEffects(attribute,skill);
    var rapidLearning = model.fields['ocupacao-select'] === 'Prodígio' && failed;
    if(rapidLearning){
      addTemporaryEffect({
        sourceKey:ENGINE.powerKey('occupation','Prodígio','Aprendizado Rápido')+':'+attribute+':'+skill,
        name:'Aprendizado Rápido · '+attribute+' + '+skill,
        bonus:1,
        expires:'use',
        allTests:false,
        attribute:attribute,
        skill:skill
      });
    }
    var html = '<div class="roll-summary"><strong>'+labels[nsIndex]+'</strong><span>'+successes+' sucesso'+(successes === 1 ? '' : 's')+'</span>'+(passed === null ? '' : '<span class="'+(passed ? 'budget-ok' : 'over')+'">'+(passed ? 'NS alcançado' : 'NS não alcançado')+'</span>')+'</div>'+
      '<div class="dice-faces">'+results.map(function(die){ return '<span class="die '+(penalized ? (desperateSuccess ? 'success' : 'fail') : (die <= skillValue ? 'success' : 'fail'))+'">'+die+'</span>'; }).join('')+'</div>'+
      (prodigyBonus ? '<p>Dom Superior aplicou 1 Bônus a esta Perícia.</p>' : '')+
      (rollEffects.length ? '<p>Efeito temporário aplicado: '+escapeHtml(rollEffects.map(function(effect){ return effect.name+' (+'+effect.bonus+')'; }).join(' · '))+'.</p>' : '')+
      (rapidLearning ? '<p>Aprendizado Rápido preparou Bônus para o próximo teste igual.</p>' : '')+
      (penalized ? '<p>Teste penalizado: o número escolhido era '+$('#roll-guess').value+'.</p>' : '')+
      (plagueResult != null ? '<p>Dado da Praga: <b>'+plagueResult+'</b> · '+(symptom ? 'provoca Sintoma de '+currentCorruptionStage().name : 'sem Sintoma')+(againstDevotee ? ' · conta como sucesso adicional; o Sintoma só se manifesta ao fim da Cena' : '')+'.</p>' : '')+
      (stress ? '<p>Aposta de Estresse: +1 dado e +'+stressCost+' PE.</p>' : '')+
      (crisis ? '<p class="over">A Aposta de Estresse falhou: ocorre uma Crise de Estresse.</p>' : '');
    $('#roll-result').innerHTML = html;
    model.ui.lastRoll = { attribute:attribute, skill:skill, results:results, successes:successes, plague:plagueResult, at:new Date().toISOString() };
    refreshPowerCenter();renderPowerCenterStatus();
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
    if(recipe.id === 'flecha'){addAmmunition('flechas','single','',model.originPowers.indexOf('Flechas E Mais Flechas')>=0?3:2);return;}
    var chargeAmmo=ammunitionData('cargas');
    if(chargeAmmo&&chargeAmmo.compatibleRecipes&&chargeAmmo.compatibleRecipes.indexOf(recipe.name)>=0){addAmmunition('cargas','single','',1);return;}
    var matchingCatalog=DATA.commonItems.filter(function(item){return item.name===recipe.name||(item.aliases||[]).indexOf(recipe.name)>=0;})[0];
    if(matchingCatalog){addCatalogItem(matchingCatalog.id);return;}
    var label = recipe.name;
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
        model = Number(parsed.version) >= 3 ? normalizeModel(parsed) : normalizeModel(migrateLegacy(parsed,defaultModel()));
        renderAll(); saveModel(true); alert('Backup restaurado com sucesso.');
      } catch(error){ alert('O arquivo de backup não é válido.'); }
    };
    reader.readAsText(file);
  }

  function resetSheet(){
    if(!confirm('Isso apagará todos os dados preenchidos na ficha. Continuar?')) return;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PREVIOUS_STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    localStorage.removeItem(LEGACY_NOTES_KEY);
    model = defaultModel();
    renderAll(); saveModel(true);
  }

  function onClick(event){
    var tab = event.target.closest('.sheet-tab');
    if(tab){ activatePage(tab.dataset.pageTarget); return; }
    if(event.target.closest('[data-close-rule-modal]')){closeRuleModal();return;}
    if(event.target.id==='rule-action-modal'){closeRuleModal();return;}
    if(event.target.closest('#open-dying-panel')){openDyingPanel();return;}
    if(event.target.closest('#open-stress-panel')){openStressPanel();return;}
    if(event.target.closest('#open-power-center')){openPowerCenter();return;}
    if(event.target.closest('#open-item-catalog')){openItemCatalog();return;}
    if(event.target.closest('#paradigm-info-button')){openParadigmMatrix();return;}
    if(event.target.closest('#dying-tolerance-roll')){var toleranceRoll=characterTest('Físico','Tolerância',0);resolveDyingTolerance(toleranceRoll.successes>=3,toleranceRoll);return;}
    var manualTolerance=event.target.closest('[data-dying-tolerance]');if(manualTolerance){resolveDyingTolerance(manualTolerance.dataset.dyingTolerance==='success',null);return;}
    if(event.target.closest('#dying-stabilize-roll')){var medicineRoll=characterTest('Intelecto','Medicina',0);resolveStabilization(medicineRoll.successes>=3,medicineRoll);return;}
    if(event.target.closest('#dying-stabilize-success')){resolveStabilization(true,{manual:true});return;}
    if(event.target.closest('#dying-end-window')){model.critical.stabilizationWindow=false;addRuleLog('morrendo','Janela de salvamento encerrada sem cuidado.',null);refreshDyingPanel();saveModel();return;}
    if(event.target.closest('#death-test-roll')){rollDeathTest();return;}
    if(event.target.closest('#dying-correct-state')){if(confirm('Corrigir o estado com base no total atual de PF?')){model.critical.status='stable';reconcileCriticalState(pfTotal(),{source:'correção manual'});renderHealth();refreshDyingPanel();saveModel();}return;}
    if(event.target.closest('#determination-roll')){rollDetermination();return;}
    var determinationGain=event.target.closest('[data-determination-pe]');if(determinationGain){var pendingDetermination=model.stress.pendingDetermination;if(!pendingDetermination)return;var chosenPE=parseInt(determinationGain.dataset.determinationPe,10)||0;model.stress.pendingDetermination=null;applyStress(chosenPE,{source:'Rolagem de Determinação',determination:true,range:pendingDetermination.range});refreshStressPanel();return;}
    if(event.target.closest('#stress-manual-apply')){var stressAmount=Math.max(0,parseInt($('#stress-manual-amount').value,10)||0);applyStress(stressAmount,{source:'Evento de Estresse',cause:$('#stress-cause').value});refreshStressPanel();return;}
    if(event.target.closest('#stress-crisis-manual')){triggerStressCrisis({source:'Crise definida pelo MP'});refreshStressPanel();return;}
    if(event.target.closest('#stress-recovery-apply')){var recoveryKey=$('#stress-recovery-method').value;var recoveryRule=STRESS_RECOVERY[recoveryKey];var recoveryAmount=clamp($('#stress-recovery-amount').value,recoveryRule.min,recoveryRule.max);if(model.fields['ocupacao-select']==='Verdugo'&&['conversation','social','support'].indexOf(recoveryKey)>=0){alert('Coração de Pedra impede reduzir PE por vínculos, conexões ou afeto.');return;}changePE(-recoveryAmount,{source:'Recuperação · '+recoveryRule.name});model.stress.recoveryLog.push({method:recoveryKey,amount:recoveryAmount,at:new Date().toISOString()});refreshStressPanel();saveModel();return;}
    if(event.target.closest('#stress-resolve-breaking')){if(peTotal()>=bloodLimits().pe){alert('Reduza os PE abaixo do limite antes de encerrar o Surto.');return;}changePE(0,{source:'Resolução narrativa',resolveBreaking:true});refreshStressPanel();return;}
    if(event.target.closest('#stress-acknowledge-crisis')){model.stress.pendingCrisis=null;renderStressToolStatus();refreshStressPanel();saveModel();return;}
    if(event.target.closest('#growth-confirm')){confirmGrowth();return;}
    if(event.target.closest('#growth-complete-choices')){openGrowthApply(model.growth.stage,true);return;}
    if(event.target.closest('#growth-future-arc')){if(model.growth.stage===10){model.growth.postCapArcs+=1;addRuleLog('crescimento','Arco após a Etapa X registrado.',{arc:model.growth.postCapArcs});renderAttributes();renderOrigin();renderGrowth();saveModel();}return;}
    var scopeAdvance=event.target.closest('[data-advance-scope]');if(scopeAdvance){advanceScope(scopeAdvance.dataset.advanceScope);return;}
    var powerUse=event.target.closest('[data-power-use]');if(powerUse){usePower(powerUse.dataset.powerUse,false);return;}
    var powerUseFree=event.target.closest('[data-power-use-free]');if(powerUseFree){usePower(powerUseFree.dataset.powerUseFree,true);return;}
    var catalogItemButton=event.target.closest('[data-catalog-item]');if(catalogItemButton){addCatalogItem(catalogItemButton.dataset.catalogItem);return;}
    var catalogAmmoButton=event.target.closest('[data-catalog-ammo]');if(catalogAmmoButton){var ammoId=catalogAmmoButton.dataset.catalogAmmo;var ammoWeaponSelect=$('[data-ammo-weapon-select="'+ammoId+'"]',$('#rule-action-content'));addAmmunition(ammoId,catalogAmmoButton.dataset.ammoMode,ammoWeaponSelect?ammoWeaponSelect.value:'');return;}
    var woundSource=event.target.closest('[data-wound-source]');if(woundSource){var sourceZone=$('#'+woundSource.dataset.woundSource);if(sourceZone){openWoundModal(sourceZone);editWound(woundSource.dataset.woundId);}return;}
    var woundTreat=event.target.closest('[data-wound-treat]');if(woundTreat){treatWoundCondition(woundTreat.dataset.woundZone,woundTreat.dataset.woundTreat);return;}
    var woundTolerance=event.target.closest('[data-wound-tolerance]');if(woundTolerance){rollWoundTolerance(woundTolerance.dataset.woundZone,woundTolerance.dataset.woundTolerance);return;}
    var catalogItemUse=event.target.closest('[data-item-use]');if(catalogItemUse){var catalogRow=catalogItemUse.closest('.inv-slot');var catalogEntry=model.inventory.filter(function(item){return item.id===catalogRow.dataset.itemId;})[0];var catalogData=catalogItem(catalogEntry&&catalogEntry.catalogId);if(catalogEntry&&catalogData&&catalogData.uses.max!=null){catalogEntry.uses=String(clamp((parseInt(catalogEntry.uses,10)||0)+parseInt(catalogItemUse.dataset.itemUse,10),0,catalogData.uses.max));renderInventory();saveModel();}return;}
    var ammoDelta=event.target.closest('[data-ammo-delta]');if(ammoDelta){var ammoRow=ammoDelta.closest('.inv-slot');var ammoEntry=model.inventory.filter(function(item){return item.id===ammoRow.dataset.itemId;})[0];var ammoInfo=ammunitionData(ammoEntry&&ammoEntry.ammoId);var ammoChange=parseInt(ammoDelta.dataset.ammoDelta,10)||0;if(ammoEntry&&ammoInfo){if(ammoInfo.storage==='container')ammoEntry.charges=clamp(ammoEntry.charges+ammoChange,0,ammoEntry.capacity);else ammoEntry.quantity=clamp(ammoEntry.quantity+ammoChange,0,ammoInfo.maxPerInventorySlot||ammoInfo.maxLoaded||6);renderInventory();saveModel();}return;}
    var weaponFire=event.target.closest('.weapon-fire');if(weaponFire){var fireState=weaponFire.dataset.ammoItem?model.inventory.filter(function(item){return item.id===weaponFire.dataset.ammoItem;})[0].weapon:model.weapons[parseInt(weaponFire.dataset.weaponIndex,10)];var fireResult=fireWeaponState(fireState);showWeaponFeedback(fireResult);renderEquipment();saveModel();return;}
    var weaponReload=event.target.closest('.weapon-reload');if(weaponReload){var reloadItem=weaponReload.dataset.ammoItem?model.inventory.filter(function(item){return item.id===weaponReload.dataset.ammoItem;})[0]:null;var reloadState=reloadItem?reloadItem.weapon:model.weapons[parseInt(weaponReload.dataset.weaponIndex,10)];var reloadResult=reloadWeaponState(reloadState);showWeaponFeedback(reloadResult);renderEquipment();saveModel();return;}
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
      return;
    }
    var needSegment = event.target.closest('[data-need-value]');
    if(needSegment){
      var needKey = needSegment.dataset.needKey;
      var needValue = parseInt(needSegment.dataset.needValue,10);
      model.needs[needKey] = model.needs[needKey] === needValue ? Math.max(0,needValue-1) : needValue;
      renderNeeds(); saveModel(); return;
    }
    var needReset = event.target.closest('[data-need-reset]');
    if(needReset){ model.needs[needReset.dataset.needReset] = 0; renderNeeds(); saveModel(); return; }
    var zone = event.target.closest('.zone'); if(zone){ openWoundModal(zone); return; }
    var woundEdit = event.target.closest('[data-wound-edit]');
    if(woundEdit){ editWound(woundEdit.dataset.woundEdit); return; }
    var woundRemove = event.target.closest('[data-wound-remove]');
    if(woundRemove){ removeWound(woundRemove.dataset.woundRemove); return; }
    if(event.target.closest('#wound-new')){ startNewWound(); return; }
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
      usePower(ENGINE.powerKey('occupation','Masoquista','Carne Voluntária'),false); return;
    }
    var conditionRemove = event.target.closest('[data-condition-index]');
    if(conditionRemove){ model.conditions.splice(parseInt(conditionRemove.dataset.conditionIndex,10),1); renderConditions(); saveModel(); return; }
    if(event.target.closest('#relationship-add-button')){
      model.relationships.push({id:uid('relationship'),name:'',role:'',score:0,note:''});
      renderRelationships(); saveModel(); return;
    }
    var relationshipCard = event.target.closest('.relationship-card');
    if(relationshipCard){
      var relationship = model.relationships.filter(function(entry){ return entry.id === relationshipCard.dataset.relationshipId; })[0];
      if(!relationship) return;
      if(event.target.closest('.relationship-remove')){
        model.relationships = model.relationships.filter(function(entry){ return entry.id !== relationship.id; });
        renderRelationships(); saveModel(); return;
      }
      var relationshipDelta = event.target.closest('[data-relationship-delta]');
      if(relationshipDelta){
        relationship.score = clampRelationship(relationship.score+parseInt(relationshipDelta.dataset.relationshipDelta,10));
        renderRelationships(); saveModel(); return;
      }
      var relationshipScore = event.target.closest('[data-relationship-score]');
      if(relationshipScore){
        relationship.score = clampRelationship(relationshipScore.dataset.relationshipScore);
        renderRelationships(); saveModel(); return;
      }
    }
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
    if(event.target.closest('#filter-overload-button')){selectFilterMode('overload');var overloadPrevious=pfTotal();model.health.permanentPf+=2;reconcileCriticalState(overloadPrevious,{source:'Sobrecarga do Filtro'});addCondition('Inconsciente');renderHealth();saveModel();$('#filter-result').textContent='Sobrecarga acionada: ganho anulado, +2 PF permanentes e Inconsciente.';return;}
    if(event.target.closest('#clear-filter-mode')){selectFilterMode('');$('#filter-result').textContent='Seleção de modo limpa; nenhum valor da ficha foi alterado.';return;}
    if(event.target.closest('#clear-corruption-filters')){if(confirm('Limpar todos os efeitos permanentemente anulados pela Pulseira?')){model.corruptionFilters=[];renderCorruption();saveModel();}return;}
    if(event.target.closest('#btn-save-backup')){exportBackup();return;}
    if(event.target.closest('#btn-load-backup')){$('#backup-file-input').click();return;}
    if(event.target.closest('#btn-print')){window.print();return;}
    if(event.target.closest('#btn-reset')){resetSheet();return;}
  }

  function onInput(event){
    var target = event.target;
    if(target.classList.contains('modifier-number')){ setModifier(target.id,target.value); return; }
    if(target.id==='catalog-search'){model.ui.itemCatalogFilter=target.value;filterCatalogCards(target.value);saveModel();return;}
    if(target.id==='dying-final-wound'){model.critical.finalWound=target.value;saveModel();return;}
    if(target.dataset.modelField){
      if(target.tagName === 'SELECT') return;
      model.fields[target.dataset.modelField] = target.value;
      if(target.id === 'attr-bonus-manual' || target.id === 'pp-bonus-manual'){ renderAttributes(); renderOrigin(); }
      if(target.id === 'growth-stage') renderGrowth();
      saveModel(); return;
    }
    if(target.id === 'pf-permanent'){ var previousPfTotal=pfTotal();model.health.permanentPf=Math.max(0,parseInt(target.value,10)||0);reconcileCriticalState(previousPfTotal,{source:'PF permanente'});renderHealth();saveModel();return; }
    if(target.id === 'pe-permanent'){ model.health.permanentPe=Math.max(0,parseInt(target.value,10)||0);if(peTotal()>=bloodLimits().pe)model.stress.breaking=true;renderHealth();saveModel();return; }
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
    var relationshipCard=target.closest('.relationship-card');
    if(relationshipCard){
      var relationship=model.relationships.filter(function(entry){return entry.id===relationshipCard.dataset.relationshipId;})[0];
      if(relationship){
        if(target.classList.contains('relationship-name'))relationship.name=target.value;
        if(target.classList.contains('relationship-role'))relationship.role=target.value;
        if(target.classList.contains('relationship-note'))relationship.note=target.value;
        saveModel();
      }
      return;
    }
    if(target.id==='notebook-title-input'){getSelectedNotebook().title=target.value;renderNotes();saveModel();return;}
  }

  function onChange(event){
    var target=event.target;
    if(target.classList.contains('modifier-number')){setModifier(target.id,target.value);return;}
    if(target.id==='condition-category'){renderConditionPicker();return;}
    if(target.id==='condition-select'){renderConditionReference();return;}
    if(target.id==='sangue'){
      if(model.fields['ocupacao-select']==='Devoto' && target.value!=='novo'){
        target.value='novo';
        alert('Devoto requer Sangue Novo. Troque a Ocupação antes de escolher Sangue Velho.');
        return;
      }
      model.fields.sangue=target.value;
      reconcileCriticalState(pfTotal(),{source:'troca do tipo de Sangue'});
      if(peTotal() >= bloodLimits().pe) model.stress.breaking = true;
      renderHealth();renderPC();renderOccupation();renderFlower();saveModel();return;
    }
    if(target.id==='origem-select'){
      var previous=model.fields['origem-select'];
      var resetsGrowth=previous&&previous!==target.value&&model.growth.stage>0;
      if(previous&&previous!==target.value&&!confirm('Trocar a Origem redefine as quatro Perícias e os Poderes escolhidos'+(resetsGrowth?' e reinicia a Trilha de Crescimento':'')+'. Continuar?')){target.value=previous;return;}
      if(resetsGrowth)model.growth=clone(defaultModel().growth);
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
    if(target.id==='growth-stage'){var requestedGrowth=clamp(target.value,0,10);target.value=String(model.growth.stage);openGrowthApply(requestedGrowth,false);return;}
    if(target.dataset.modelField){model.fields[target.dataset.modelField]=target.value;if(target.id==='growth-stage')renderGrowth();if(target.id==='reputacao-select')renderParadigmStyle();if(target.id==='genero-select')renderBodyMap();saveModel();return;}
    if(target.classList.contains('growth-origin-power-check')){
      var extraOriginName=target.dataset.growthOrigin;var extraOrigin=DATA.origins[extraOriginName];if(!extraOrigin)return;var extraPower=extraOrigin.powers.filter(function(item){return item.name===target.dataset.power;})[0];if(!extraPower)return;
      if(!model.growth.powerSelections[extraOriginName])model.growth.powerSelections[extraOriginName]=[];
      var extraSelected=model.growth.powerSelections[extraOriginName];var extraIndex=extraSelected.indexOf(extraPower.name);var extraOccupation=getOccupation();var extraTotal=7+(extraOccupation&&extraOccupation.originPointsBonus||0)+currentGrowthTotals().originPoints;
      if(target.checked&&extraIndex<0){if(originPowerSpent()+extraOriginPowerCost(extraOriginName,extraPower)>extraTotal){target.checked=false;alert('Pontos de Origem insuficientes. Poderes de Origem fora do Arquétipo custam +1 PO.');return;}extraSelected.push(extraPower.name);}else if(!target.checked&&extraIndex>=0)extraSelected.splice(extraIndex,1);
      renderOrigin();renderPowerCenterStatus();saveModel();return;
    }
    if(target.classList.contains('origin-power-check')){
      var origin=getOrigin();if(!origin)return;var power=origin.powers.filter(function(item){return item.name===target.dataset.power;})[0];var index=model.originPowers.indexOf(power.name);if(target.checked&&index<0){var occ=getOccupation();var total=7+(occ&&occ.originPointsBonus||0)+currentGrowthTotals().originPoints;var spent=originPowerSpent();if(spent+power.cost>total){target.checked=false;alert('Pontos de Origem insuficientes.');return;}model.originPowers.push(power.name);}else if(!target.checked&&index>=0)model.originPowers.splice(index,1);renderOrigin();renderPowerCenterStatus();saveModel();return;
    }
    if(target.classList.contains('inventory-weapon-select')){var storedCard=target.closest('.inv-slot');var storedItem=model.inventory.filter(function(item){return item.id===storedCard.dataset.itemId;})[0];if(!storedItem||!isInventoryWeapon(storedItem))return;var storedWeaponState=storedItem.weapon;storedWeaponState.weaponId=target.value;storedWeaponState.mods=[];storedWeaponState.current=weaponMax(storedWeaponState);if(target.value!=='custom'){storedWeaponState.customName='';storedWeaponState.customDamage='';storedWeaponState.customRange='';storedWeaponState.customMax=0;}renderInventory();renderRecipes();saveModel();return;}
    if(target.classList.contains('inventory-weapon-mod-select')){var storedModCard=target.closest('.inv-slot');var storedModItem=model.inventory.filter(function(item){return item.id===storedModCard.dataset.itemId;})[0];if(!storedModItem||!isInventoryWeapon(storedModItem))return;var storedModState=storedModItem.weapon;var storedModIndex=parseInt(target.dataset.modIndex,10);var storedOldMod=storedModState.mods[storedModIndex]||'';var storedNextMod=target.value;if(storedOldMod&&storedNextMod!==storedOldMod){alert('Modificações são permanentes. Apenas poderes específicos permitem removê-las.');renderInventory();return;}if(storedNextMod){var storedMod=DATA.modifications.filter(function(item){return item.id===storedNextMod;})[0];var storedModCost=modificationCost(storedMod);if(model.parts<storedModCost){alert('Partes insuficientes para instalar esta modificação.');renderInventory();return;}model.parts-=storedModCost;storedModState.mods[storedModIndex]=storedNextMod;storedModState.current=Math.min(storedModState.current,weaponMax(storedModState));renderEquipment();saveModel();}return;}
    if(target.classList.contains('weapon-select')){var card=target.closest('.weapon-card');var state=model.weapons[parseInt(card.dataset.weaponIndex,10)];state.weaponId=target.value;state.mods=[];state.current=weaponMax(state);if(target.value!=='custom'){state.customName='';state.customDamage='';state.customRange='';state.customMax=0;}renderWeapons();saveModel();return;}
    if(target.classList.contains('weapon-mod-select')){var modCard=target.closest('.weapon-card');var weaponState=model.weapons[parseInt(modCard.dataset.weaponIndex,10)];var modIndex=parseInt(target.dataset.modIndex,10);var old=weaponState.mods[modIndex]||'';var next=target.value;if(old&&next!==old){alert('Modificações são permanentes. Apenas poderes específicos permitem removê-las.');renderWeapons();return;}if(next){var mod=DATA.modifications.filter(function(item){return item.id===next;})[0];var modCost=modificationCost(mod);if(model.parts<modCost){alert('Partes insuficientes para instalar esta modificação.');renderWeapons();return;}model.parts-=modCost;weaponState.mods[modIndex]=next;renderEquipment();saveModel();}return;}
    if(target.classList.contains('armor-equipped')){var armorCard=target.closest('.armor-card');var armorItem=DATA.armors.filter(function(item){return item.id===armorCard.dataset.armorId;})[0];var armorState=model.armor[armorItem.id];armorState.equipped=target.checked;if(target.checked&&armorState.remaining===0)armorState.remaining=armorItem.maxUses;renderArmor();saveModel();return;}
    if(target.classList.contains('corruption-filter-check')){
      var stage=currentCorruptionStage();var stageKeys=stage.effects.map(function(effect){return effect.key;});var effectKey=target.dataset.effectKey;var filterIndex=model.corruptionFilters.indexOf(effectKey);
      if(target.checked&&filterIndex<0){var selectedAtStage=model.corruptionFilters.filter(function(key){return stageKeys.indexOf(key)>=0;}).length;if(selectedAtStage>=3){target.checked=false;alert('A Pulseira pode anular no máximo 3 efeitos mecânicos por nível de Corrupção.');return;}model.corruptionFilters.push(effectKey);}else if(!target.checked&&filterIndex>=0)model.corruptionFilters.splice(filterIndex,1);
      renderCorruption();saveModel();return;
    }
    if(target.classList.contains('recipe-known')){var recipeId=target.dataset.recipeId;var recipeIndex=model.knownRecipes.indexOf(recipeId);if(target.checked&&recipeIndex<0){if(!model.allowCampaignRecipes&&model.knownRecipes.length>=recipeLimit()){target.checked=false;alert('O limite de Receitas conhecidas na criação é igual ao Intelecto.');return;}model.knownRecipes.push(recipeId);}else if(!target.checked&&recipeIndex>=0)model.knownRecipes.splice(recipeIndex,1);renderRecipes();saveModel();return;}
    if(target.id==='allow-campaign-recipes'){model.allowCampaignRecipes=target.checked;renderRecipes();saveModel();return;}
    if(target.id==='backup-file-input'){if(target.files&&target.files[0])importBackup(target.files[0]);target.value='';return;}
    if(target.id==='wound-type'||target.name==='wound-severity'){$('#wound-rule-preview').classList.remove('error');updateWoundPreview();return;}
  }

  function onKeyDown(event){
    if(event.key === 'Escape' && $('#rule-action-modal') && $('#rule-action-modal').style.display !== 'none'){event.preventDefault();closeRuleModal();return;}
    var zone = event.target.closest && event.target.closest('.zone');
    if(zone && (event.key === 'Enter' || event.key === ' ')){
      event.preventDefault();
      openWoundModal(zone);
    }
  }

  function initialize(){
    buildTabs();
    bindFields();
    buildSkills();
    document.addEventListener('click',onClick);
    document.addEventListener('input',onInput);
    document.addEventListener('change',onChange);
    document.addEventListener('keydown',onKeyDown);
    window.addEventListener('pagehide',function(){saveModel(true);});
    window.addEventListener('beforeunload',function(){saveModel(true);});
    $('#footer-date').textContent='IMPRESSO EM '+new Date().toLocaleDateString('pt-BR').toUpperCase();
    reconcileCriticalState(pfTotal(),{source:'restauração da ficha'});
    if(peTotal()>=bloodLimits().pe) model.stress.breaking=true;
    renderAll();
    saveModel(true);
  }

  initialize();
})();
