(function(){
  'use strict';

  window.ROOTS_DATA = {
    skills: {
      "Físico": ["Atletismo","Acrobacia","Força","Briga","Respiração","Esquivar","Tolerância"],
      "Destreza": ["Armas Brancas","Furtividade","Mirar","Cautela","Condução","Crime","Fuga"],
      "Intelecto": ["Medicina","Planejar","Exatas","Humanas","Ciências","Mecânica","Raízologia"],
      "Instinto": ["Percepção","Intuição","Improvisar","Sobrevivência","Reflexos","Investigação","Lidar com Animais"],
      "Espírito": ["Empatia","Intimidação","Persuasão","Performance","Determinação","Coragem","Mentira"]
    },

    resources: ["Pano","Álcool","Recipiente","Sucata","Explosivo","Fita"],

    occupations: {
      "Estudioso": { powers:[
        {name:"Inteligência Expandida",description:"Ganhe +4 PP. Além disso, para cada Etapa na Trilha de Crescimento, receba +1 PP."},
        {name:"Eu Sempre Tenho um Plano",description:"Antes de iniciar um Conflito, role um teste de Planejar. Se obtiver ao menos 1 sucesso, ganhe Bônus no primeiro teste da cena para você ou um Aliado de sua escolha."},
        {name:"Nada é em Vão",description:"Quando falhar em um teste de Perícia e isso te custar algo, marque essa experiência negativa. Na próxima Cena de Recuperação, transforme a falha em aprendizado e receba +1 PP na perícia testada (máx. 1 vez por perícia)."}
      ], bonus:"+4 PP e +1 PP por etapa de Crescimento.", ppBonus:4 },
      "Arsenalista": { powers:[
        {name:"Gêmeas de Guerra",description:"Você pode ter +1 Arma à sua escolha no Inventário Inicial, da mesma Categoria de Origem."},
        {name:"Coldre Especial",description:"Você pode sacar Armas que estão no seu Espaço de Arma sem usar Ações."},
        {name:"Sempre Tem Mais Uma",description:"Você possui 3 Espaços de Arma, em vez de 2: um para Brancas, um para Fogo/Disparo e o último de sua escolha."}
      ], bonus:"3 Espaços de Arma em vez de 2.", weaponSlots:3 },
      "Preparado": { powers:[
        {name:"Nunca é Demais",description:"Você pode possuir até 5 Itens no começo da vida em vez de 3."},
        {name:"Instinto de Sobrevivência",description:"Uma vez por Cena, evite automaticamente um perigo ambiental que perceberia tarde demais, como uma armadilha ou deslizamento."},
        {name:"Eu Sei Usar Isso",description:"Receba 2 Bônus em testes auxiliados por itens, como usar uma corda para escalar."}
      ], bonus:"Até 5 itens iniciais em vez de 3.", initialItems:5 },
      "Herdeiro": { powers:[
        {name:"Genética Aprimorada",description:"Receba +2 Pontos de Origem."},
        {name:"Sangue Real",description:"Ganhe +1 Ponto de Atributo em um Atributo de sua escolha."},
        {name:"Vozes Ancestrais",description:"Uma vez por sessão, conjure uma dica de seus Antepassados; o MP deve dar uma dica sobre a situação interpretando alguém de sua linhagem."}
      ], bonus:"+2 PO e +1 PA.", originPointsBonus:2, attributeBonus:1 },
      "Determinado": { powers:[
        {name:"Valente",description:"Role 5D6 em Crises de Estresse. Além disso, nunca receba mais que 4 PE em uma só Rolagem de Determinação."},
        {name:"Vai Dar Tudo Certo",description:"Você não recebe PE por Crises de Estresse de outros Aliados nem por vê-los Feridos ou Enlouquecendo."},
        {name:"Corpo Adaptado",description:"Sua Cicatriz Inicial não impõe mais sua penalidade, mas você mantém o benefício que ela concede."}
      ], bonus:"Rola 5D6 em Crises de Estresse.", crisisDice:5 },
      "Prodígio": { powers:[
        {name:"Vantagem de Largada",description:"Você não precisa escolher Desvantagens na criação."},
        {name:"Aprendizado Rápido",description:"Após falhar em um teste, ganhe Bônus no próximo teste igual."},
        {name:"Dom Superior",description:"Escolha duas Perícias. Sempre que realizar um Teste com uma delas, ganhe Bônus."}
      ], bonus:"Não escolhe Desvantagens na criação." },
      "Engenhoqueiro": { powers:[
        {name:"Minha Melhor Criação",description:"Gaste uma Ação Principal ou uma Cena para aprimorar uma Arma Branca do seu Inventário. Quem a empunhar ganha Bônus em ataques. Só uma arma pode permanecer aprimorada por vez."},
        {name:"Efeito Explosivo",description:"Ao usar um item ou arma que criou ou aprimorou, cada resultado 1 permite rolar um dado adicional, até o máximo de 3."},
        {name:"Solução de Emergência",description:"Uma vez por Conflito, conserte temporariamente algo quebrado para durar até o fim da Cena."}
      ], bonus:"Aprimora e conserta criações próprias." },
      "Masoquista": { powers:[
        {name:"Carne Voluntária",description:"Uma vez por Ciclo, aceite +1 PC voluntariamente para ganhar Bônus em todos os testes até o fim da Cena."},
        {name:"Florescer na Dor",description:"Sempre que sofrer PF, reduza seus PE pela metade dos PF recebidos, arredondando para cima. Se reduzir 5 ou mais, ganhe Bônus em todos os testes até o fim da Cena."},
        {name:"Você Não Gosta de Dor?",description:"Em Cenas de Recuperação, sempre que recuperar PF, Aliados presentes reduzem 2 PE."}
      ], bonus:"Transforma dor física em resistência mental." },
      "Espectro": { powers:[
        {name:"Sem Nome",description:"Sua Reputação nunca é positiva nem negativa. Suas ações geram apenas consequências narrativas; você só pode trilhar Paradigmas Síntese."},
        {name:"Momento Certo",description:"Você não rola Iniciativa. Após ver a ordem, declare em qual posição age; essa escolha pode mudar no início de cada Rodada."},
        {name:"Eu Vejo o que Você Faz",description:"Uma vez por Conflito, quando errarem um ataque em você, marque esse método. O Alvo não pode acertá-lo novamente com esse método até o fim do Conflito. Máximo de 3 Alvos."}
      ], bonus:"Reputação neutra; apenas Paradigmas Síntese.", paradigm:"Síntese" },
      "Abutre": { powers:[
        {name:"Bolso Extra",description:"Você pode carregar até 2 unidades completas do mesmo Recurso, quebrando o limite padrão da Bolsa."},
        {name:"Olho de Urubu",description:"Ao vasculhar uma Ameaça abatida, encontre Espólios Extras como se tivesse rolado 1, sem rolar. Uma Ameaça morta por Conflito."},
        {name:"Acumulador",description:"Escolha um Recurso; você sempre tem uma Unidade dele na Bolsa de Recursos."}
      ], bonus:"Até 2 unidades do mesmo Recurso.", resourceMax:8 },
      "Verdugo": { powers:[
        {name:"Sinta Medo de Mim",description:"Sempre que causar um Ferimento Grave em uma Ameaça Humana, ela recebe Aterrorizado."},
        {name:"Não Amado, Temido",description:"Em territórios onde seu Paradigma é conhecido, PNJs oferecem descontos, comida, passagem ou informações e não se recusam abertamente. Só pode trilhar Paradigmas Abissais."},
        {name:"Coração de Pedra",description:"Você não ganha PE por culpa ao ferir alguém, mas também não reduz PE por vínculos, conexões ou afeto."}
      ], bonus:"Apenas Paradigmas Abissais.", paradigm:"Abissal" },
      "Âncora": { powers:[
        {name:"Primeiro em Mim",description:"No início do Conflito, declare um Aliado Protegido sem gastar Ação. Ataques contra ele são redirecionados para você enquanto estiver Perto. Troque-o com uma Ação Secundária."},
        {name:"Enquanto Eu Respirar",description:"Enquanto estiver vivo e Perto de um Aliado em Teste de Morte, o valor mínimo dele trava em 1. Após 6 Rodadas ele ainda morre. Funciona para um Aliado por vez."},
        {name:"Não se Vá",description:"Uma vez por Sobrevivente, aumente em +4 o limite de PF para Morte Direta. Após escapar, o limite volta ao normal."}
      ], bonus:"Proteção e estabilização de Aliados." },
      "Devoto": { powers:[
        {name:"Escolhido",description:"As Dádivas da Flor funcionam como se estivessem um estágio acima. Você deve ser Sangue Novo."},
        {name:"Ouça Minha Prece",description:"Uma vez por Ciclo, ao sofrer +5 PC voluntariamente ou avançar de estágio, faça um pedido à Praga; o MP deve atendê-lo de forma útil, mesmo que torta."},
        {name:"Ela Joga Comigo",description:"Dados da Praga rolados contra o Devoto contam como sucessos adicionais. Sintomas só se manifestam ao fim da Cena."}
      ], bonus:"Obrigatoriamente Sangue Novo.", requiresBlood:"novo" }
    },

    archetypes: {
      "Cultivador":"Terra Viva", "Andarilho":"Terra Viva", "Ith'Na":"Terra Viva", "Caçador":"Terra Viva",
      "Renegado":"Cães de Guerra", "Bélico":"Cães de Guerra", "Corredor":"Cães de Guerra", "Lutador":"Cães de Guerra",
      "Acadêmico":"Donos da Razão", "Cronista":"Donos da Razão", "Curandeiro":"Donos da Razão", "Fundador":"Donos da Razão",
      "Líder":"Línguas de Ferro", "Camaleão":"Línguas de Ferro", "Gótico":"Línguas de Ferro", "Áspide":"Línguas de Ferro"
    },

    corruptionStages: [
      { name:"Imaculada", min:0, max:19, plagueThreshold:1, summary:"Mente clara e corpo intacto.", effects:[] },
      { name:"Incipiente", min:20, max:39, plagueThreshold:2, summary:"Pesadelos, marcas discretas e os primeiros impulsos da Sententia.", effects:[
        {key:"incipiente-social",name:"Testes Sociais",description:"Penalidade em interações que envolvam confiança ou aparência."},
        {key:"incipiente-descanso",name:"Descanso Demorado",description:"Recuperar Estresse custa o dobro de tempo devido aos pesadelos."},
        {key:"incipiente-chamado",name:"Chamado da Terra",description:"Uma vez por Ciclo, surge a compulsão de se aproximar de raízes, áreas corrompidas ou Ameaças Enraizadas."}
      ]},
      { name:"Alarmante", min:40, max:59, plagueThreshold:3, summary:"A Corrupção altera pele, fluidos, dieta e convivência.", effects:[
        {key:"alarmante-sensibilidade",name:"Sensibilidade",description:"Penalidade em testes que envolvam dor ou contato físico."},
        {key:"alarmante-dieta",name:"Dieta Esquisita",description:"Alimentos comuns saciam apenas metade; somente alimentos corrompidos saciam normalmente."},
        {key:"alarmante-cheiro",name:"Cheiro Estranho",description:"Duas Penalidades em interações que envolvam confiança ou aparência."},
        {key:"alarmante-olhar",name:"Olhar Vazio",description:"Ao rolar 6 em qualquer dado de um teste social, o teste falha."},
        {key:"alarmante-corpo",name:"Corpo Estranho",description:"Ao receber PF, role 1D6; com resultado 1, receba +1 PF."}
      ]},
      { name:"Severa", min:60, max:79, plagueThreshold:4, summary:"Vozes, deformidades e perda de controle passam a dominar a rotina.", effects:[
        {key:"severa-sensibilidade",name:"Sensibilidade Extrema",description:"Penalidade em ambientes externos ou climas extremos."},
        {key:"severa-dieta",name:"Dieta Alterada",description:"Apenas carne crua, vísceras, minerais ou substâncias brutas saciam a fome."},
        {key:"severa-instabilidade",name:"Instabilidade",description:"Sempre que acumular Estresse, role 1D6; com 6, sofra uma Crise de Estresse imediata."},
        {key:"severa-desejo",name:"Desejo Voraz",description:"Ao ver carne crua, sangue fresco ou minerais, teste Determinação (Dilacerante); em falha, consuma compulsivamente."},
        {key:"severa-controle",name:"Quebra de Controle",description:"Ao acumular +3 PE de uma vez, entre em Enlouquecendo por uma Cena ou Rodada."},
        {key:"severa-mente",name:"Mente Fechada",description:"Você não recebe Bônus vindos de Aliados em Cena."},
        {key:"severa-memoria",name:"Perda de Memória",description:"Reduza 10 PP entre quaisquer Perícias."}
      ]},
      { name:"Crítica", min:80, max:99, plagueThreshold:5, summary:"A forma humana entra em colapso e a Sententia transborda para os outros.", effects:[
        {key:"critica-mobilidade",name:"Mobilidade Comprometida",description:"Deslocamento reduzido em 50% e Penalidade em qualquer ação física."},
        {key:"critica-dieta",name:"Dieta Específica",description:"Sem dieta corrompida diária, perca 1 PF permanente por Ciclo."},
        {key:"critica-colapso",name:"Colapso Mental",description:"Sempre que acumular Estresse, sofra +1 PE adicional."},
        {key:"critica-aura",name:"Aura de Sententia",description:"Criaturas corrompidas não o atacam, mas você também não pode atacá-las."},
        {key:"critica-contagio",name:"Contágio Passivo",description:"Aliados Perto rolam 1D6; com 5–6, recebem 1D6 PC."},
        {key:"critica-ruina",name:"Ruína Orgânica",description:"Ao sofrer Ferimento Grave, role 1D6; com 4–6, reduza 1 Ponto de Atributo."},
        {key:"critica-receptaculo",name:"Receptáculo",description:"Todos os Aliados até Perto recebem Dados da Praga."}
      ]},
      { name:"Corrompido", min:100, max:100, plagueThreshold:6, summary:"Humanidade perdida; corpo e mente pertencem à Sententia.", effects:[
        {key:"corrompido-enraizamento",name:"Enraizamento",description:"O Sobrevivente é tomado e passa ao controle da Sententia."}
      ]}
    ],

    woundTable: {
      "Corte": {
        "Cabeça": [{pf:6,condition:"Sangrando"},{pf:7,condition:"Ferida Profunda"},{pf:8,condition:"Ferida Severa"}],
        "Tronco": [{pf:5,condition:"Sangrando"},{pf:6,condition:"Ferida Profunda"},{pf:7,condition:"Ferida Severa"}],
        "Pernas": [{pf:4,condition:"Sangrando"},{pf:5,condition:"Ferida Profunda"},{pf:6,condition:"Ferida Severa"}],
        "Braços": [{pf:3,condition:"Sangrando"},{pf:4,condition:"Ferida Profunda"},{pf:5,condition:"Ferida Severa"}]
      },
      "Impacto": {
        "Cabeça": [{pf:8,condition:""},{pf:9,condition:"Atordoado"},{pf:10,condition:"Ferida Severa"}],
        "Tronco": [{pf:7,condition:""},{pf:8,condition:""},{pf:9,condition:"Ferida Severa"}],
        "Pernas": [{pf:6,condition:""},{pf:7,condition:""},{pf:8,condition:"Ferida Severa"}],
        "Braços": [{pf:5,condition:""},{pf:6,condition:""},{pf:7,condition:"Ferida Severa"}]
      },
      "Perfuração": {
        "Cabeça": [{pf:9,condition:"Sangrando"},{pf:10,condition:"Ferida Profunda"},{pf:11,condition:"Ferida Severa"}],
        "Tronco": [{pf:8,condition:"Sangrando"},{pf:9,condition:"Ferida Profunda"},{pf:10,condition:"Ferida Severa"}],
        "Pernas": [{pf:5,condition:""},{pf:6,condition:"Sangrando"},{pf:7,condition:"Ferida Profunda"}],
        "Braços": [{pf:4,condition:""},{pf:5,condition:"Sangrando"},{pf:6,condition:"Ferida Profunda"}]
      }
    },

    armors: [
      { id:"colete", name:"Colete", location:"Tronco", reduction:3, maxUses:3, effect:"Reduz 3 PF de ataques no Tronco e impede Condições." },
      { id:"bracadeiras", name:"Braçadeiras", location:"Braços", reduction:3, maxUses:3, effect:"Reduz 3 PF de ataques nos Braços e impede Condições." },
      { id:"caneleiras", name:"Caneleiras", location:"Pernas", reduction:3, maxUses:3, effect:"Reduz 3 PF de ataques nas Pernas e impede Condições." },
      { id:"capacete", name:"Capacete", location:"Cabeça", reduction:"todos", maxUses:1, effect:"Anula os PF de um ataque na Cabeça e impede Condições." }
    ],

    recipes: [
      { id:"bandagem", name:"Bandagem", ingredients:["Pano","Álcool"], effect:"Estanca sangramentos e auxilia no tratamento de feridas." },
      { id:"kit-medico", name:"Kit Médico", ingredients:["Pano","Recipiente","Álcool"], effect:"Ferramentas para tratar ferimentos com eficiência." },
      { id:"molotov", name:"Molotov", ingredients:["Pano","Recipiente","Álcool"], effect:"Ferimento de Fogo em área até Perto." },
      { id:"carga-explosiva", name:"Carga Explosiva", ingredients:["Explosivo","Fita"], effect:"Explode após 10 segundos a 3 minutos." },
      { id:"bomba-estilhacos", name:"Bomba de Estilhaços", ingredients:["Explosivo","Recipiente"], effect:"Ferimento de Explosão e Ferida Severa." },
      { id:"flecha-explosiva", name:"Flecha Explosiva", ingredients:["Explosivo","Fita"], itemIngredient:"Flecha", effect:"Ferimento normal da flecha mais Explosão." },
      { id:"bomba-atordoamento", name:"Bomba de Atordoamento", ingredients:["Explosivo","Recipiente"], effect:"Atordoado, Desorientado e Surdo." },
      { id:"bomba-fumaca", name:"Bomba de Fumaça", ingredients:["Explosivo","Recipiente","Álcool"], effect:"Cobertura Improvisada Robusta por 3 Rodadas." },
      { id:"mina-estilhacos", name:"Mina de Estilhaços", ingredients:["Explosivo","Recipiente","Fita"], effect:"Ferimento de Explosão e Ferida Severa." },
      { id:"lata-ruidos", name:"Lata de Ruídos", ingredients:["Fita","Sucata","Recipiente"], effect:"Eleva a Detecção das Ameaças para Alerta." },
      { id:"adaga", name:"Adaga", ingredients:["Fita","Sucata"], effect:"Perfuração Grave automática na cabeça em Agarrão Silencioso." },
      { id:"flecha", name:"Flecha", ingredients:["Fita","Sucata"], effect:"Produz 2 munições para Besta ou Arco." },
      { id:"conserto-arma", name:"Conserto de Arma", ingredients:["Fita","Sucata"], effect:"Restaura uma arma branca; normalmente uma vez por arma." }
    ],

    weapons: [
      { id:"canivete", name:"Canivete", category:"Leves", group:"branca", damage:"Corte / Perfuração", severity:"Leve ou Moderado", range:"Em Contato", durability:8, specials:["Rio de Sangue","Perfuração de Escudo","Abertura Facilitada"] },
      { id:"martelo", name:"Martelo", category:"Leves", group:"branca", damage:"Impacto / Perfuração", severity:"Leve ou Moderado", range:"Em Contato", durability:8, specials:["Ricochete","Cai pro Chão","Acerto de Reverso"] },
      { id:"faca", name:"Faca", category:"Leves", group:"branca", damage:"Corte / Perfuração", severity:"Leve ou Moderado", range:"Em Contato", durability:8, specials:["Tendão de Aquiles","Corte na Jugular","Veias Principais"] },
      { id:"serrote", name:"Serrote", category:"Leves", group:"branca", damage:"Corte", severity:"Leve ou Moderado", range:"Em Contato", durability:8, specials:["Eu Vou te Rasgar","Dentes Enferrujados","Olhe Para Mim"] },
      { id:"chicote", name:"Chicote", category:"Leves", group:"branca", damage:"Impacto", severity:"Leve ou Moderado", range:"Próximo", durability:8, specials:["Vem Pra Cá","Controle Ambiental","Alcance Estendido"] },
      { id:"corrente", name:"Corrente", category:"Leves", group:"branca", damage:"Impacto", severity:"Leve ou Moderado", range:"Próximo", durability:8, specials:["Mordida de Metal","Manobra de Estrangulamento","Cobra de Ferro"] },
      { id:"leque", name:"Leque", category:"Leves", group:"branca", damage:"Corte / Perfuração", severity:"Leve ou Moderado", range:"Em Contato", durability:8, specials:["Corta-Luz","Parede de Metal","Manchado de Sangue"] },
      { id:"taco", name:"Taco de Beisebol", category:"Versáteis", group:"branca", damage:"Impacto", severity:"Leve, Moderado ou Grave", range:"Em Contato", durability:7, specials:["Home Run","Fratura","Bola Curva"] },
      { id:"katana", name:"Katana", category:"Versáteis", group:"branca", damage:"Corte / Perfuração", severity:"Leve, Moderado ou Grave", range:"Em Contato", durability:7, specials:["Iaijutsu","Espírito Vingativo","Passo Ágil"] },
      { id:"arco", name:"Arco e Flecha", category:"Versáteis", group:"disparo", damage:"Perfuração", severity:"Moderado", range:"Longe", ammo:0, ammoType:"Flechas", specials:["Marca de Caça","Ego do Predador","Achei Você"] },
      { id:"machadinha", name:"Machadinha", category:"Versáteis", group:"branca", damage:"Corte", severity:"Leve, Moderado ou Grave", range:"Em Contato", durability:7, specials:["Você Não Vai Fugir","Matar ou Morrer","Enterrado na Carne"] },
      { id:"besta", name:"Besta", category:"Versáteis", group:"disparo", damage:"Perfuração", severity:"Moderado", range:"Longe", ammo:0, ammoType:"Flechas", specials:["Disparo das Sombras","Ponto Vital","Prego no Caixão"] },
      { id:"dardo-corda", name:"Dardo e Corda", category:"Versáteis", group:"branca", damage:"Corte / Perfuração", severity:"Leve, Moderado ou Grave", range:"Próximo", durability:7, specials:["Dança da Lâmina","Furacão Defensivo","Performance Mortal"] },
      { id:"soco-ingles", name:"Soco-Inglês", category:"Versáteis", group:"branca", damage:"Impacto", severity:"Leve, Moderado ou Grave", range:"Em Contato", durability:7, specials:["Habilidade Transferida","Peek-A-Boo","Contra-Ataque"] },
      { id:"machado", name:"Machado", category:"Pesadas", group:"branca", damage:"Corte", severity:"Moderado ou Grave", range:"Em Contato", durability:6, specials:["Cortando Árvores","Carne Fraca","360°"] },
      { id:"lanca", name:"Lança", category:"Pesadas", group:"branca", damage:"Perfuração", severity:"Moderado ou Grave", range:"Próximo", durability:6, specials:["Furo Veloz","Arremesso Preciso","Transpassada"] },
      { id:"marreta", name:"Marreta", category:"Pesadas", group:"branca", damage:"Impacto", severity:"Moderado ou Grave", range:"Em Contato", durability:6, specials:["Onda de Choque","Impacto Doloroso","Grand Slam"] },
      { id:"foice", name:"Foice", category:"Pesadas", group:"branca", damage:"Corte / Perfuração", severity:"Moderado ou Grave", range:"Próximo", durability:6, specials:["Colheita","Faro de Morte","Sentença de Morte"] },
      { id:"tridente", name:"Tridente", category:"Pesadas", group:"branca", damage:"Perfuração", severity:"Moderado ou Grave", range:"Próximo", durability:6, specials:["Cravada no Chão","Jogo de Corpo","Dividido por 3"] },
      { id:"cajado", name:"Cajado", category:"Pesadas", group:"branca", damage:"Impacto", severity:"Moderado ou Grave", range:"Próximo", durability:6, specials:["Extensão dos Braços","Muleta Improvisada","Posturas de Guerra"] },
      { id:"motosserra", name:"Motosserra", category:"Pesadas", group:"combustivel", damage:"Corte", severity:"Moderado ou Grave", range:"Próximo", ammo:5, ammoType:"Tanque", unmodifiable:true, specials:["Lenta e Barulhenta","Sobrecarga","Mutilação"] },
      { id:"pistola", name:"Pistola", category:"De Fogo", group:"fogo", damage:"Perfuração", severity:"Grave", range:"Longe", ammo:8, ammoType:"Balas", recoil:"Gangrenado", maxMods:4, specials:["Altamente Customizável","Cobertura Humana","Gunfu"] },
      { id:"revolver", name:"Revólver", category:"De Fogo", group:"fogo", damage:"Perfuração", severity:"Grave", range:"Longe", ammo:6, ammoType:"Balas", recoil:"Gangrenado", specials:["Contagem de Seis","Bala Marcada","Coronhada Afiada"] },
      { id:"escopeta", name:"Escopeta", category:"De Fogo", group:"fogo", damage:"Perfuração", severity:"Grave", range:"Afastado", ammo:3, ammoType:"Cartuchos", recoil:"Dilacerante", specials:["Dispersão","Fogo Destruidor","Flash na Boca"] },
      { id:"fuzil-assalto", name:"Fuzil de Assalto", category:"De Fogo", group:"fogo", damage:"Perfuração", severity:"Grave", range:"Distante", ammo:10, ammoType:"Pente", recoil:"Profano", specials:["Vigília Aprimorada","Respingo de Sangue","Controle Total"] },
      { id:"submetralhadora", name:"Submetralhadora", category:"De Fogo", group:"fogo", damage:"Perfuração", severity:"Moderado (2 projéteis)", range:"Distante", ammo:20, ammoType:"Pente", recoil:"Dilacerante", specials:["Rajada Incontrolável","Tiro pra Todo Lado","Saque Tático"] },
      { id:"fuzil-precisao", name:"Fuzil de Precisão", category:"De Fogo", group:"fogo", damage:"Perfuração", severity:"Grave", range:"Distante", ammo:2, ammoType:"Balas", recoil:"Profano", specials:["De Qualquer Lugar","Mira Paciente","Tripé"] },
      { id:"lanca-chamas", name:"Lança-Chamas", category:"De Fogo", group:"combustivel", damage:"Fogo", severity:"7 PF em Afastado; +1 por faixa mais próxima", range:"Afastado", ammo:8, ammoType:"Tanque", recoil:"Sofrido", unmodifiable:true, specials:["Mais Perto, Mais Fogo","Chamas em Tudo","Parede de Fogo"] },
      { id:"lanca-granadas", name:"Lança-Granadas Improvisado", category:"De Fogo", group:"fogo", damage:"Variável", severity:"Conforme a carga", range:"Longe", ammo:1, ammoType:"Carga", recoil:"Absoluto", unmodifiable:true, specials:["Bomba de Todo Tipo","Tiro Instável","Força de Impacto"] }
    ],

    modifications: [
      { id:"empunhadura", name:"Empunhadura Engrossada", group:"branca", cost:10, effect:"Bônus em Armas Brancas." },
      { id:"corrente-pulso", name:"Corrente de Pulso", group:"branca", cost:15, effect:"Você não pode ser Desarmado." },
      { id:"prego-torto", name:"Prego Torto", group:"branca", cost:20, effect:"Ao errar, 1-2 em 1D6 causa Corte Leve nos Braços." },
      { id:"correia-puxada", name:"Correia de Puxada", group:"branca", cost:20, effect:"Puxe de volta uma arma arremessada com uma Reação." },
      { id:"gancho", name:"Gancho", group:"branca", cost:25, effect:"Ao errar, pode atingir outra Ameaça Em Contato." },
      { id:"barra-cruzada", name:"Barra Cruzada", group:"branca", cost:30, effect:"Repita uma falha por empate uma vez." },
      { id:"contrapeso", name:"Contrapeso", group:"branca", cost:30, effect:"Ignora 1 Penalidade de Ferimentos/Tratados ao atacar." },
      { id:"estilhacos-colados", name:"Estilhaços Colados", group:"branca", cost:30, effect:"Ferimento Grave pode penalizar Físico ou Destreza." },
      { id:"mira-improvisada", name:"Mira Improvisada", group:"disparo", cost:20, effect:"Bônus em Mirar." },
      { id:"estabilidade-metal", name:"Estabilidade de Metal", group:"disparo", cost:20, effect:"Flechas não quebram e podem ser recuperadas." },
      { id:"puxada-aprimorada", name:"Puxada Aprimorada", group:"disparo", cost:25, effect:"Distância de Eficácia passa a Distante." },
      { id:"corda-nylon", name:"Corda de Nylon", group:"disparo", cost:30, effect:"Severidade de Moderado para Grave." },
      { id:"pistola-silenciador", name:"Silenciador", weapon:"pistola", cost:50, effect:"Som alcança uma categoria abaixo da eficácia." },
      { id:"pistola-laser", name:"Mira Laser", weapon:"pistola", cost:40, effect:"Bônus abaixo da Distância de Eficácia." },
      { id:"pistola-pente", name:"Pente Estendido", weapon:"pistola", cost:45, effect:"Capacidade +3 Balas." },
      { id:"pistola-saque", name:"Trava de Saque Rápido", weapon:"pistola", cost:60, effect:"Primeiro saque no Conflito permite atacar." },
      { id:"revolver-speed", name:"Speed Loader", weapon:"revolver", cost:55, effect:"Recarrega até 6 balas de uma vez." },
      { id:"revolver-coldre", name:"Coldre de Couro", weapon:"revolver", cost:40, effect:"Sacar ou guardar usa Ação Secundária." },
      { id:"revolver-cano", name:"Cano Alongado", weapon:"revolver", cost:50, effect:"Distância de Eficácia passa a Longe." },
      { id:"revolver-tambor", name:"Tambor Modificado", weapon:"revolver", cost:50, effect:"Uma vez por Cena, escolha a bala disparada." },
      { id:"escopeta-armadura", name:"Quebra-Armadura", weapon:"escopeta", cost:60, effect:"PF causado à Armadura reduz seus usos." },
      { id:"escopeta-dragao", name:"Bafo de Dragão", weapon:"escopeta", cost:60, effect:"Tiros aplicam Em Chamas." },
      { id:"escopeta-cano", name:"Cano Cerrado", weapon:"escopeta", cost:55, effect:"PF dobrado Em Contato." },
      { id:"escopeta-coronha", name:"Coronha Acolchoada", weapon:"escopeta", cost:40, effect:"Anula uma Penalidade de Recuo por Conflito." },
      { id:"smg-cabo", name:"Cabo Texturizado", weapon:"submetralhadora", cost:45, effect:"Bônus nos testes de Ataque." },
      { id:"smg-punho", name:"Punho Frontal", weapon:"submetralhadora", cost:50, effect:"Recuo diminui um nível." },
      { id:"smg-pente", name:"Pente Acoplado", weapon:"submetralhadora", cost:60, effect:"Dois pentes trocados com Ação Secundária." },
      { id:"smg-gatilho", name:"Gatilho Solto", weapon:"submetralhadora", cost:60, effect:"Dispara 3 tiros por ataque." },
      { id:"fuzil-guarda", name:"Guarda-Mão", weapon:"fuzil-assalto", cost:55, effect:"Após falhar Recuo, 6 em 1D6 segura a mira." },
      { id:"fuzil-lanterna", name:"Lanterna Tática", weapon:"fuzil-assalto", cost:45, effect:"Funciona como uma Lanterna." },
      { id:"fuzil-bandoleira", name:"Bandoleira", weapon:"fuzil-assalto", cost:60, effect:"Não ocupa espaço no Inventário." },
      { id:"fuzil-red-dot", name:"Red Dot", weapon:"fuzil-assalto", cost:50, effect:"Reduz em 1 o NS para Pontos Vitais." },
      { id:"precisao-luneta", name:"Luneta Ampliada", weapon:"fuzil-precisao", cost:45, effect:"Pode ser usado como Binóculo." },
      { id:"precisao-gatilho", name:"Gatilho Pesado", weapon:"fuzil-precisao", cost:60, effect:"Uma Falha por Conflito vira 1 Sucesso." },
      { id:"precisao-fmp", name:"Projéteis FMP", weapon:"fuzil-precisao", cost:60, effect:"PF ignora Redução de PF." },
      { id:"precisao-cano", name:"Cano Acolchoado", weapon:"fuzil-precisao", cost:50, effect:"Primeiro tiro do Conflito é silencioso." }
    ],

    origins: {},
    flowers: {}
  };
})();
Object.assign(window.ROOTS_DATA.flowers,
{
  "Camomila": {
    "description": "Você é um oásis de calma em um mundo de caos. As pessoas se acalmam ao seu redor, seus segredos e angústias escorrendo para fora como água, encontrando refúgio na sua serenidade aparente. Mas você sente a agitação delas se instalando em você, uma névoa pesada de ansiedade alheia que envenena seu espírito. Você se move em um estado de tranquilidade sonâmbula, sempre um pouco distante, um pouco lento, porque carrega o peso de todos que precisam descansar.",
    "stages": [
      {
        "stage": "Imaculada",
        "name": "CALMANTE NATURAL",
        "description": "sua presença tranquiliza. As pessoas tendem a baixar a voz e ser pacíficas perto de você, sentem-se menos agitadas."
      },
      {
        "stage": "Incipiente",
        "name": "ABSORÇÃO DE PESO",
        "description": "Você pode receber PC ou PE de qualquer Alvo no lugar dele, sofra-os pela metade (arredondado para baixo). Sempre que fizer isso, você ganha +1 PC acumulativo por uso na mesma Cena (primeiro uso +1 PC, segundo +2 PC, terceiro +3 PC, etc). Você não pode absorver mais do que seu limite de PE atual sem sofrer consequências a critério do MP."
      },
      {
        "stage": "Alarmante",
        "name": "LEMBRE-SE DA DOR",
        "description": "Gastando sua Ação Principal, você se conecta a todas as emoções negativas de um Alvo em até Perto: suas memórias, cicatrizes e traumas. Você força essas emoções a voltarem para ele, todas de uma vez. Você só pode usar isso uma vez por Alvo por Cena."
      },
      {
        "stage": "Severa",
        "name": "DURMA",
        "description": "Você solta um pólen de suas mãos e cabelos, que se espalha em uma área até Longe de você. Gastando sua Secundária, você libera o pólen. Ameaças ou Aliados que permanecerem dentro da área por 2 Turnos seguidos (contando a partir do momento que inalaram o pólen) caem em um sono profundo por 8 Cenas. Você não é afetado pelo próprio pólen. Você pode manter o pólen ativo gastando uma Reação por Rodada. A cada rodada mantida, você recebe 1 PC."
      },
      {
        "stage": "Crítica",
        "name": "MARÉ DE PAZ",
        "description": "Gaste todas as suas Ações e sofra 1 PE permanente. Você cria uma área de Paz absoluta em um raio Afastado ao seu redor. Dentro dela, NINGUÉM (incluindo você) pode fazer qualquer Ato Violento. O efeito dura enquanto você gastar sua Ação Secundária por Rodada ou até você decidir encerrar. Se alguém tentar forçar um ataque, a Ação é Automaticamente cancelada e o agressor sofre Atordoado. Cada Rodada ativa te causa +2 PC."
      }
    ]
  },
  "Rosa": {
    "description": "Você é bonito e isso dói, literalmente. As pessoas amam você sem saber por quê. E o pior: você sabe que pode usar isso. Pode fazer qualquer um cair a seus pés. Mas cada coração conquistado deixa um espinho enterrado no seu. Qualquer toque em sua pele nua deixa pequenas marcas vermelhas, como se espinhos tivessem picado. Amigos aprendem a não tocar em você. Amantes, quando existem, usam luvas. Mas, você não tem certeza se ainda sabe amar.",
    "stages": [
      {
        "stage": "Imaculada",
        "name": "ENCANTO FATAL",
        "description": "Sua aparência é inesquecível e perturbadora. Pessoas querem agradá-lo sem saber por quê."
      },
      {
        "stage": "Incipiente",
        "name": "CIÚMES OBSESSIVO",
        "description": "Gastando sua Ação Secundária, cause Enraivecido em um Alvo. A fonte da raiva será qualquer Ameaça ou Aliado em até Próximo de você. Para manter efeito, nas Rodadas seguintes, gaste uma Reação."
      },
      {
        "stage": "Alarmante",
        "name": "AMOR TÓXICO",
        "description": "Gastando sua Ação Principal e Secundária, escolha 2 Ameaças Humanas. Elas sentem uma vontade avassaladora de se relacionar (A critério do MP), recebendo Atordoado e Vulnerável. Para manter o efeito, nas Rodadas Seguintes, gaste sua Ação Secundária. Sofra +2 PC."
      },
      {
        "stage": "Severa",
        "name": "MASSACRE À TROIS",
        "description": "Gaste Todas as suas Ações e 1 PE Permanente escolha 3 Ameaças Humanas. Todas recebem Enraivecido entre si. Para manter o efeito, gaste sua Ação Secundária. Para cada Rodada com o efeito, receba +2 PE e +2 PC."
      },
      {
        "stage": "Crítica",
        "name": "ORGIA SANGRENTA",
        "description": "Gastando sua Ação Principal, uma grande rosa rompe seu peito, descendo pelas pernas e se prendendo ao chão, te ramificando, enquanto isso, não pode se mover. Até 3 Ameaças Humanas em alcance Afastado ficam Atraídas pela Rosa. Quando a Ameaça encostar na Rosa, sofre um Ferimento de Corte Grave em ambos os Braços e perde Atraído. Enquanto ramificado, pode alimentá-la: Adicionando sua Ação Secundária, Ameaças Atraídas aumenta para 4 e além dos Ferimentos, cada Ameaça pode receber uma Condição Mental Extra à sua escolha. Adicionando uma Reação, Ameaças Atraídas aumenta para 5 e, além dos efeitos anteriores, cada Ameaça perde um membro, Braço ou Perna, escolhido por você. Gastando Todas as suas Ações e 1 PE Permanente, até 6 Ameaças Humanas em até Longe ficam Atraídas por você. Cada uma sofre todos os efeitos anteriores, você pode escolher como esses efeitos se manifestam ou não em cada Ameaça separadamente. Você recebe +2 PC por Ameaça afetada dessa forma."
      }
    ]
  },
  "Girassol": {
    "description": "Desde pequeno você aprendeu que ficar sob a luz era uma necessidade. Pela manhã, nasce algo dentro de você, uma clareza, um peso que some dos ombros, uma sensação de que o mundo finalmente faz sentido. Mas quando o sol desce, você desce junto. À noite você é melancólico, triste sem saber o motivo, fraco como uma raíz velha. As pessoas comentam como você \"muda de humor com o clima\". Elas não sabem o quanto estão certas.",
    "stages": [
      {
        "stage": "Imaculada",
        "name": "FOTOSSÍNTESE",
        "description": "Passar 3 Cenas seguidas Sob o Sol durante o Dia ou a Tarde supre sua necessidade de comer naquele Ciclo. Você ainda precisa beber e dormir normalmente."
      },
      {
        "stage": "Incipiente",
        "name": "FILHO DO SOL",
        "description": "Seus Bônus seguem o horário. Durante o Dia, você recebe +1 PA Temporário sem todos os Atributos e +1 PP Temporário em todas as Perícias. Durante a Tarde, recebe apenas +1 PA em todos os Atributos. Durante a Noite, tudo some, PP's temporários se dissipam, PA's voltam ao normal. PA's vindo do Girassol ultrapassam o limite de 5 por Atributo, mas não conseguem superar Fraqueza Absoluta. PP's seguem suas regras normalmente (+5 nas de Origem e até +4 para as demais)."
      },
      {
        "stage": "Alarmante",
        "name": "MEIO-DIA",
        "description": "Durante o Dia, você recebe +2 PA's Temporários em todos os Atributos e +2 PP's Temporários em todas as Perícias. Durante a Tarde, recebe +1 PA em todos os Atributos e +1 PP temporário em todas as Perícias. Durante a Noite, tudo some."
      },
      {
        "stage": "Severa",
        "name": "ÁPICE SOLAR",
        "description": "Durante o Dia, você recebe +3 PA's Temporários em todos os Atributos e +3 PP's temporários em todas as Perícias. Durante a Tarde, recebe +2 PA em todos os Atributos e +2 PP temporários em todas as Perícias. Durante a Noite, tudo some."
      },
      {
        "stage": "Crítica",
        "name": "ETERNO SOL",
        "description": "O sol agora vive dentro de você. Os Bônus do Dia tornam-se permanentes, aplicam-se em qualquer período, inclusive à tarde e à noite."
      }
    ]
  },
  "Dente-de-Leão": {
    "description": "Você sempre foi rápido. Rápido demais. Na infância você chegava antes de ser chamado, saía antes de ouvir o fim da frase, atravessava a rua sem olhar porque seu corpo já tinha decidido. As pessoas riam. Depois pararam de rir quando começaram a aparecer os hematomas, as articulações inchadas, os tendões que cediam sem aviso. Seu corpo nunca conseguiu acompanhar o que você precisava dele. Mas você precisa correr.",
    "stages": [
      {
        "stage": "Imaculada",
        "name": "ACATISIA",
        "description": "Seu deslocamento aumenta em +4 Metros Permanentemente (20 Metros com a Ação Principal / 12 Metros com a Ação Secundária). Além disso, ao se mover com sua Ação Principal, você não provoca Vigílias de Ameaças."
      },
      {
        "stage": "Incipiente",
        "name": "EU TÔ AQUI, AGORA TÔ ALI",
        "description": "No começo de cada Rodada, escolha um ponto em até 10 Metros de onde está para se locomover. Além disso, sempre que um Aliado seguir um caminho que você trilhou, consegue se mover +5 Metros adicionais."
      },
      {
        "stage": "Alarmante",
        "name": "POR MILÉSIMOS",
        "description": "Entre perceber e agir, não existe mais demora. Agora, você é capaz de se esquivar de Balas e Flechas, ainda gastando uma Reação normalmente e rolando o Teste Oposto contra o Atirador ao invés de um Acerto Inevitável."
      },
      {
        "stage": "Severa",
        "name": "VENDAVAL",
        "description": "Gastando sua Ação Principal, você conjura do seu próprio corpo uma rajada de vento constante em um Cone Longe na direção escolhida, partindo de você. Ela dura enquanto mantiver gastando uma Reação por Rodada, você pode se mover livremente enquanto a mantém. ○ Quem se mover a favor do Vendaval pode se deslocar o dobro do normal; contra, é reduzido à metade. ■ Quando quiser, gastando uma Reação e sofrendo +1 PC, você intensifica a rajada: todos na área sem cobertura em relação à rajada sofrem +6 PF de Impacto e são empurrados na direção do Vendaval, até 9 metros se estiverem Perto, até 6 metros se estiverem Afastado e até 3 metros se estiverem Longe."
      },
      {
        "stage": "Crítica",
        "name": "EM TODO LUGAR AO MESMO TEMPO",
        "description": "Gaste Todas as suas Ações e sofra 1 PE Permanentes e +2 PC. Durante a Cena, pode se mover livremente até 3 vezes para qualquer ponto dentro de um raio de até Horizonte (80 metros) a partir de onde você está. Ao fim da Cena, sofra Sangrando em ambas as Pernas."
      }
    ]
  }
}
);
Object.assign(window.ROOTS_DATA.flowers,
{
  "Begônia": {
    "description": "Seus olhos não veem só rostos, veem cicatrizes. Uma tristeza escondida, uma raiva abafada, um medo que insiste em tremer por trás da pele. As pessoas se sentem nuas diante do seu olhar, como se você folheasse seus sentimentos com a mesma naturalidade de quem vira páginas de um livro gasto. O problema é que as emoções grudam em você. Alegria, desespero, ódio, tudo se mistura na sua carne, e às vezes você não tem certeza de onde terminam as dos outros e onde começam as suas.",
    "stages": [
      {
        "stage": "Imaculada",
        "name": "AURA EMOTIVA",
        "description": "emoções nunca te passam despercebidas. Em volta das pessoas, você enxerga suas emoções como cores pulsantes."
      },
      {
        "stage": "Incipiente",
        "name": "METAMORFOSE SENTIMENTAL",
        "description": "Você aprendeu a moldar emoções, transmutá-las. Gastando sua Ação Principal, você pode tocar um Alvo e alterar seu estado emocional para outro à sua escolha: medo, raiva, alegria, paixão, nojo, tristeza… O comportamento do Alvo tende a seguir o rumo do sentimento imposto, sua mente buscando sentido para aquilo que agora sente."
      },
      {
        "stage": "Alarmante",
        "name": "LEMBRE-SE DE MIM",
        "description": "Gastando sua Ação Principal e Secundária em um Alvo que possa te ver e semeie nele a sensação de que já te conhece, que já te amou, já te perdeu ou já te odiou. Mas, você precisa evocá-la em si, logo, também passa a acreditar que aquilo aconteceu. Enquanto a lembrança existir, o Alvo tratará você conforme a lembrança; e você também."
      },
      {
        "stage": "Severa",
        "name": "IMPÉRIO EMOCIONAL",
        "description": "Sua maestria sobre o coração alheio atinge seu ápice. Agora, ao usar Lembre-se de Mim, você não precisa mais acreditar na memória falsa que criou. E o efeito de Metamorfose Sentimental pode se intensificar: a emoção imposta se torna dominante, ditando as ações do Alvo, em vez de apenas influenciar seu comportamento. Mas isso exige mais de você, ao usar ambos, sofra 2 PC."
      },
      {
        "stage": "Crítica",
        "name": "A MINHA REALIDADE",
        "description": "Seu corpo não é mais um recipiente, mas um catalisador. Gastando todas suas Ações, todos os Humanos em um raio Longe de você são afetados. Para cada Humano individualmente na área, você pode aplicar Metamorfose Sentimental, ou aplicar Lembre-se de Mim. Podendo misturar e combinar os efeitos livremente. Ao fazer isso, para cada Humano afetado, você recebe +1 PE Permanente e os PC equivalentes."
      }
    ]
  },
  "Jasmim": {
    "description": "Há algo leve demais em você. Quando fica parado, seus ombros parecem tremer com um movimento invisível, como se algo quisesse se abrir ali. Às vezes, na luz, reflexos translúcidos cintilam atrás de você, uma sugestão de asas que ninguém consegue decidir se viu ou não. Seu corpo carrega a estranheza de um inseto: a vontade súbita de saltar, a ânsia de escapar de lugares fechados, a inquietação de estar sempre à beira do ar.",
    "stages": [
      {
        "stage": "Imaculada",
        "name": "PESO DE PLUMA",
        "description": "seu corpo é mais leve. Você sofre metade dos PF's (arredondado para baixo) que receberia em Quedas."
      },
      {
        "stage": "Incipiente",
        "name": "MEMBRANA QUITINOSA",
        "description": "Sua pele adquire um brilho iridescente, como asas de cigarra. Gastando sua Ação Secundária, você pode desenvolver membranas finas entre os dedos e sob os braços, recebendo +3 PC. Em seu Turno, pode se locomover horizontalmente mesmo sem um chão, podendo planar por uma distância igual ao seu movimento gastando sua Ação Principal (Até 16 Metros) ou Secundária (Até 8 Metros)."
      },
      {
        "stage": "Alarmante",
        "name": "REFLEXOS DE INSETO",
        "description": "Seus reflexos ficam afiados. Você recebe +1 Reação por Rodada (3 Reações por Rodada). Além disso, sempre que uma Ameaça errar um ataque contra você, você pode se mover até 3 metros."
      },
      {
        "stage": "Severa",
        "name": "ASAS DE JASMIM",
        "description": "Algo rompe suas costas, duas asas translúcidas, finas e iridescentes, com veias que brilham como pétalas. Em seu Turno, pode se locomover Verticalmente podendo subir no ar por uma distância igual ao seu movimento gastando Ação Principal (Até 16 Metros) ou Secundária (Até 8 Metros), recebendo +2 PC. Enquanto estiver no ar, você pode agir normalmente mas não se movimentar. Gaste uma Reação para se manter Voando em Turnos seguintes. Para descer, deve gastar uma Ação Principal ou Secundária (a mesma que usou para subir). Se Receber PF enquanto Voando, Rode Tolerância (Gangrenado), se falhar, caia da Altura que esteja, recebendo os PF's da Queda."
      },
      {
        "stage": "Crítica",
        "name": "SENHOR DO CÉU",
        "description": "O céu agora é seu lar. Gaste todas as suas Ações e sofra 1 PE Permanente e +4 PC. Você pode voar livremente para qualquer direção, para cima, para baixo, para os lados, sem limitação de rodadas ou distância enquanto a Cena durar. Enquanto voa, pode continuar agindo normalmente sem Penalidades."
      }
    ]
  },
  "Jarro-Titã": {
    "description": "Você nasceu mais alto que todo mundo. Sua família se assustava, seus amigos brincavam sobre você ter comido adubo. Dois metros e ainda crescendo. Mas o problema nunca foi só a altura. Desde criança, uma voz grave vem de dentro do seu peito. \"Mais\", ela diz, \"Cresce.\", \"Quebra.\" Você sabe que, se quiser, pode libertar o Titã. Mas cada vez, a voz fica mais alta. TRANSFORMANDO-SE Gaste Todas suas Ações, sua flor começa a corrompê-lo por inteiro, trazendo vigas e raízes de dentro da sua Carne, te transformando em um Titã Enraizado que se parece com você, mas colossal. Você perde acesso ao seu Inventário e Armas. Seu único modo de ataque é a Briga. Cause PF fixo por estágio já que não pode Mirar em Pontos Vitais. A cada Metro que crescer, Aumente seu Alcance (em uma Categoria a partir de Em Contato até Afastado), Aumente seu Atributo de Físico em +1 e Ganhe Redução de PF (impedindo Condições). Ameaças atacadas por você podem apenas se Esquivar, mas Ameaças ganham Bônus para Atacar você mas podem apenas mirar nas suas Pernas (com Armas Brancas).",
    "stages": [
      {
        "stage": "Imaculada",
        "name": "GRANDE (3 METROS / REDUZ 5 PF / 1 BÔNUS)\n○ PF",
        "description": "11 PF. ○ Sofra por Rodada: 2 PE e 1 PC."
      },
      {
        "stage": "Incipiente",
        "name": "ENORME (4 METROS / REDUZ 6 PF / 2 BÔNUS)\n○ PF",
        "description": "12 PF. ○ Sofra por Rodada: 3 PE e 2 PC."
      },
      {
        "stage": "Alarmante",
        "name": "GIGANTE (5 METROS / REDUZ 7 PF / 3 BÔNUS…)\n○ PF",
        "description": "13 PF. ○ Sofra por Rodada: 4 PE e 3 PC."
      },
      {
        "stage": "Severa",
        "name": "COLOSSO (6 METROS / REDUZ 8 PF)\n○ PF",
        "description": "14 PF. ○ Sofra por Rodada: 5 PE e 4 PC."
      },
      {
        "stage": "Crítica",
        "name": "TITÃ (7 METROS / REDUZ 9 PF)\n○ PF",
        "description": "15 PF. ○ Sofra por Rodada: 6 PE e 4 PC. Quando desativar Titã, gaste Todas suas Ações, volte ao seu estado e corpo natural, nu e confuso, seu Inventário ao seu lado. Sofra Exaustão, Clima Extremo (Calor), Pânico e Desorientado. Perca 1 PP de qualquer Perícia e 3 anos de \"longevidade\", sofrendo cada vez mais cedo por causas naturais de morte. Após isso, não consiga ativar Titã até Dormir por 8 Cenas."
      }
    ]
  },
  "Hibisco": {
    "description": "Você habita um mundo feito de papel. Sua mão aperta uma caneta e ela racha. Você se apoia em uma mesa e ela geme sob o peso. Um aperto de mão amigável pode se tornar um incidente doloroso se você não dosar cuidadosamente cada grama da sua força. Seu andar é pesado, seus passos soam como marcos graves. Você é a fortaleza, aquele que segura a porta, que carrega o fardo, mas essa solidez é uma solidão. Sua grandeza física é, também, sua gaiola.",
    "stages": [
      {
        "stage": "Imaculada",
        "name": "OSSOS DE PEDRA",
        "description": "Escolha um Ponto Vital (Braços, Pernas, Tronco ou Cabeça). Nela, sua densidade é anormal. Quando sofre um Ferimento nesse local, sua Severidade é reduzida em uma Gravidade (Grave → Moderado → Leve → Anula)."
      },
      {
        "stage": "Incipiente",
        "name": "ESTÁTUA",
        "description": "Sua pele começa a rachar, adquirindo uma textura cinzenta de calcário. Gastando todas suas Ações, você se endurece completamente em pedra, recebendo +2 PC. Até o Início do seu próximo Turno, você não pode sofrer PF de nenhuma fonte. Durante esse período, você não pode se mover ou ser movido."
      },
      {
        "stage": "Alarmante",
        "name": "KILOS E MAIS KILOS",
        "description": "Sua densidade dispara e o chão range sob você. Quando quiser, Gastando uma Reação e recebendo +2 PC, você recebe de volta sua Ação Principal e Secundária e passa a agir novamente naquele instante, independentemente da ordem atual. Após isso, você assume um segundo lugar fixo na Iniciativa, agindo 2 vezes na rodada pelo restante do Conflito."
      },
      {
        "stage": "Severa",
        "name": "FORÇA ANORMAL",
        "description": "Sua força é quintuplicada em relação a qualquer homem comum. Você pode levantar, arrancar, empurrar ou destruir objetos que seriam considerados impossíveis (portas de aço, vigas de concreto, árvores grossas). Além disso, qualquer manobra que use Força que você realize tem 2 Bônus e seus ataques de Briga causam +5 PF."
      },
      {
        "stage": "Crítica",
        "name": "QUE TREMA O CHÃO",
        "description": "Gaste Todas as suas Ações e sofra 1 PE Permanente e 3 PC. Você bate com tanta força no chão que a terra estremece num Cone Longe. Todas as Ameaças e Aliados são propulsionados ao céu para qualquer direção que você preferir. Cada Alvo voa até 8 metros na direção escolhida e sofre o Dano de Queda ao cair. Todos os afetados recebem as Condições: Caído e Vulnerável. Você não pode escolher direções diferentes para cada Alvo, é um único sentido (todos para a esquerda, todos para cima, etc)."
      }
    ]
  }
}
);
Object.assign(window.ROOTS_DATA.flowers,
{
  "Orquídea": {
    "description": "Seu corpo rejeita tudo que vêm de fora. As pessoas comentam sobre sua \"sorte\" ou sua \"saúde de ferro\", mas você sente a vitalidade como uma pressão constante sob a pele, um rio que precisa encontrar seu leito. Você se pega olhando para uma lâmina não com medo, mas com uma curiosidade mórbida, calculando mentalmente quanto do seu líquido vital seria necessário para estancar a dor de alguém. A tentação de se tornar um poço de cura é um sussurro constante, mas cada gota doada é uma ferida que você abre em si mesmo. Você carrega o peso de ser um recurso, não apenas uma pessoa.",
    "stages": [
      {
        "stage": "Imaculada",
        "name": "SANGUE DE SOBRA",
        "description": "Seu sangue é abundante. Sangrar de qualquer maneira não te deixará Inconsciente."
      },
      {
        "stage": "Incipiente",
        "name": "O NEGATIVO",
        "description": "Gastando sua Ação Principal, você pode doar seu sangue como cura para alguém que possa tocar, mas cada bombeada arranca um pedaço da sua alma. O Alvo recupera 2D6+4 PF. Você sofre metade dos PC's equivalentes ao tanto que você curar (arredondado para baixo)."
      },
      {
        "stage": "Alarmante",
        "name": "LIGAÇÃO DE HEMOGLOBINA",
        "description": "Gastando sua Ação Principal e Secundária, seu sangue estica como um cabo vivo, unindo você e uma Ameaça em até Perto. Cria uma linha de sangue e vigas que liga você e o Alvo. O Alvo fica Preso, Cego e Vulnerável enquanto a ligação durar. Quando receber PF, o Alvo recebe por você. Se a linha for cortada (ataque de corte, ou perder linha de visão), o efeito acaba. Pode cortar a ligação com uma Reação."
      },
      {
        "stage": "Severa",
        "name": "FERRO SÉRICO",
        "description": "Seu sangue coagula em densidade absurda, você arranca e molda como aço vivo. Gastando sua Ação Secundária e sofrendo +1 PF Permanente, crie uma Arma de Sangue: Leve / Versátil / Pesada (à sua escolha, que não utilize munição). Ela terá metade da Durabilidade da arma equivalente. Cada vez que ferir alguém com essa arma, roube +3 PF de seu Alvo. Ao fim do conflito, a arma se desfaz."
      },
      {
        "stage": "Crítica",
        "name": "SEU SANGUE É MEU",
        "description": "O deles será seu… Escolha um Alvo Perto e Gaste todas suas Ações, você perde 2 PE Permanentes. Do corpo de seu Alvo nascem Orquídeas, de dentro para fora, recebendo um Ferimento Leve de Corte em todos os Pontos Vitais de tal Corpo. Escolha um Aliado em até Próximo, o Todos os PF's causados se transferem para ele."
      }
    ]
  },
  "Crisântemo": {
    "description": "Seu mundo tem um gosto amargo permanente. Cada refeição é um risco, cada gole de água é precedido por uma checagem instintiva para ver se ela irá piorar o fogo quieto no seu estômago. Seu hálito é um desconforto que você tenta disfarçar com balas de hortelã, criando uma distância involuntária entre você e os outros. Sua pressão ácida sobe pela garganta em momentos de estresse, é uma ameaça constante de que o seu interior corrosivo pode transbordar e queimar tudo e todos ao seu redor. Você vive intoxicado pela sua própria essência.",
    "stages": [
      {
        "stage": "Imaculada",
        "name": "ESTÔMAGO DE FERRO",
        "description": "Você tolera comidas estragadas, água turva e cheiros nocivos sem se abalar."
      },
      {
        "stage": "Incipiente",
        "name": "BILE CORROSIVA",
        "description": "Seu estômago é um poço de ácido vivo, sempre em ebulição. Gastando sua Ação Principal e Secundária, você pode expelir um jorro de vômito corrosivo em um Alvo em até Perto, causando +7 PF de Corrosão. Isso pode ser feito uma vez por Ciclo. Se tentar vomitar novamente no mesmo Ciclo, o esforço dilacera, seu vômito funcionará, mas você sofrerá +2 PF."
      },
      {
        "stage": "Alarmante",
        "name": "SALIVA DE KOMODO",
        "description": "Sua saliva, antes apenas estranha, revela-se venenosa. Ao gastar sua Ação Principal, você pode cobrir sua Arma Branca ou a de um Aliado com ela, fazendo com que cause +6 PF de Veneno, você sofre +1 PF devido ao contato com o Veneno. Ao fim do Conflito, o Veneno se Dissipa."
      },
      {
        "stage": "Severa",
        "name": "HÁLITO MALDITO",
        "description": "Sua respiração exala uma névoa venenosa. Gastando sua Ação Secundária e Reações, uma nuvem amarelada sai de sua boca e se espalha em um raio Perto ao seu redor pelo chão, sofra +2 PC. Aliados ou Ameaças dentro da área sofrem 3 Penalidades em Testes de Físico e Destreza enquanto permanecerem nela, e causando +6 PF de Veneno por Turno que passarem nela."
      },
      {
        "stage": "Crítica",
        "name": "CARNE VIVA",
        "description": "Você sente fome. Pode se alimentar de um Alvo durante a manobra Agarrar, realizando a Mordida que causa Ferimento Moderado de Corte no local mordido. Além disso, a mordida aplica o efeito de Saliva de Komodo. Cada vez que se alimentar de Ameaças, recupera 7 PF, mas sofra PE e carrega as consequências desse ato."
      }
    ]
  },
  "Dália": {
    "description": "Seu corpo equilibra. Você é o ponto de encontro entre o frio e o calor, um termostato vivo em um mundo de extremos. Você não gera temperatura, você a redistribui, carregando o fardo de manter um equilíbrio impossível. As pessoas sentem apenas o resultado final: o conforto enganoso de sua presença, sem perceber que você está constantemente negociando com a física. Tornando um lugar agradável às custas de outro, e de si mesmo.",
    "stages": [
      {
        "stage": "Imaculada",
        "name": "EQUILÍBRIO TÉRMICO",
        "description": "Seu corpo regula a temperatura ao seu redor. Em um raio Perto, o clima torna-se mais ameno, aliviando desconfortos para Aliados e a si mesmo."
      },
      {
        "stage": "Incipiente",
        "name": "MUDANÇA CLIMÁTICA",
        "description": "Quando você toca alguém, impõe a sua desregulação térmica. Ao se Esquivar de um Alvo, você pode gastar uma Reação para tocá-lo, ou gastar sua Ação Secundária. Você altera brutalmente a temperatura corporal dele (a sua escolha), infligindo a Condição: Clima Extremo. Para parar a condição, a Ameaça deve fazer algo que restaure seu equilíbrio térmico."
      },
      {
        "stage": "Alarmante",
        "name": "METALURGIA",
        "description": "Você foca calor em pontos nas suas palmas, fundindo ou derretendo metais. Armaduras, algemas e armas podem ser sabotadas, fechaduras podem ser seladas, armas reparadas ou destruídas... Se você conseguir pôr as mãos nelas."
      },
      {
        "stage": "Severa",
        "name": "PILAR TÉRMICO",
        "description": "Você concentra o clima local em um Pilar instável de até 5 metros. Gastando sua Ação Principal, você o gera, para mantê-lo, fique até Perto dele e gaste uma Reação por Rodada. O Pilar reflete a temperatura ambiente, enquanto ele existir, você recebe a Condição: Clima Extremo ao oposto (se quente, você congela; se fria, você superaquece). Ao desfazer a coluna, a Condição termina. Um Aliado pode subir no pilar se Em Contato, gastando uma Reação, a descida também exige uma Reação. Enquanto o Pilar existir, o Aliado pode permanecer no topo, ganhando visões altas ou alcançando lugares inacessíveis. Se você sofrer PF ou interromper a manutenção, a coluna se desfaz imediatamente, derrubando quem estiver no Alto."
      },
      {
        "stage": "Crítica",
        "name": "CRISTALIZAÇÃO SENSORIAL",
        "description": "Antes limitado a ambientes inteiros, agora é preciso. Gastando Todas suas Ações e recebendo +1 PE Permanente, você drena o calor da retina e da cóclea de um Alvo, que se cristalizam e estilhaçam de forma irreversível. O Alvo fica Cego e Surdo Permanentemente, condenado ao Nada."
      }
    ]
  },
  "Íris": {
    "description": "Seus olhos nunca descansam. O que para os outros é vento, poeira ou sombra, para você são rastros, véus de fumaça que se enroscam nas paredes, manchas que se movem no chão, como se a própria Praga respirasse ao seu redor. Você vê demais. As correntes invisíveis da Corrupção, as nuvens que passam sem que ninguém perceba, o fluxo de algo que não pertence ao mundo, mas insiste em estar nele, e em você.",
    "stages": [
      {
        "stage": "Imaculada",
        "name": "OLHAR DA PRAGA",
        "description": "Você percebe rastros da Corrupção, nuvens tênues, fluxos invisíveis, raízes que crescem onde ninguém nota. Esses sinais nunca passam despercebidos para você, ainda que os outros não vejam nada."
      },
      {
        "stage": "Incipiente",
        "name": "LINGUAGEM DAS RAÍZES",
        "description": "Você começa a compreender e se comunicar com as criaturas e entidades ligadas às Raízes. Pode entender ou ser entendido por monstros das Raízes e interpretar inscrições arcanas, obtendo conhecimentos secretos ou abrindo diálogo com o desconhecido."
      },
      {
        "stage": "Alarmante",
        "name": "CHAMADO DO SUBTERRÂNEO",
        "description": "Seu vínculo com o solo se aprofunda. Gastando sua Ação Principal, você pode convocar uma horda de roedores e insetos a partir de fendas, buracos ou da própria terra. Você escolhe uma das formas de manifestação: ○ Infiltração: Você envia os animais por passagens estreitas, pequenas ou inacessíveis. Você sente o que eles percebem, sons abafados, movimentos e cheiros, podendo detectar presenças ocultas, armadilhas ou rotas alternativas em até Distante. ○ Banquete: Se houver um cadáver ou carcaça, a horda o devora, apagando rastros biológicos, vestígios de Corrupção e cheiros de sangue naquela área, dificultando o rastreio ou atração de Ameaças. Se vivo, o Alvo recebe Preso e Ferimento de Corte Moderado na Perna enquanto permanecer Preso."
      },
      {
        "stage": "Severa",
        "name": "BROTAMENTO",
        "description": "A fronteira entre você e o solo é quebrada. Gastando sua Ação Secundária, você recebe 2 PC's e pode fazer brotar raízes vivas do chão em até Afastado. Elas crescem como serpentes: segurando, bloqueando ou erguendo o que tocarem."
      },
      {
        "stage": "Crítica",
        "name": "VENHAM ATÉ MIM",
        "description": "Você crava as mãos no solo e sussurra uma única palavra de comando pelas fundações do mundo. Sofra +5 PC e sofra 1 PE Permanente. Seu chamado é perceptível apenas pela vida corrompida e enraizada, atraindo para a sua localização TODAS as Ameaças Enraizadas em um raio Distante."
      }
    ]
  }
}
);
Object.assign(window.ROOTS_DATA.origins,
{
  "Lutador": {
    "weapon": "Nenhuma",
    "skills": [
      "Briga",
      "Esquivar",
      "Acrobacia",
      "Atletismo"
    ],
    "initial": {
      "name": "Punhos, Mais Nada",
      "description": "Seus punhos são armas confiáveis. Todo ataque seu de Briga causa Ferimento de Impacto Moderado, independente dos Sucessos."
    },
    "powers": [
      {
        "cost": 3,
        "name": "Minhas Mãos São Armas",
        "description": "Gaste sua Ação Secundária, uma Reação e escolha 3 Ações/Características Especiais de qualquer Arma de Impacto, distintas ou não. Você aplica essas características aos seus ataques de Briga com mãos e pés até o fim do Conflito, mas sua Distância de Eficácia não muda."
      },
      {
        "cost": 3,
        "name": "Saco De Pancada",
        "description": "Você sabe mover e controlar suas Ameaças, assim podem fazer Manobras de Combate como Ações Secundárias."
      },
      {
        "cost": 3,
        "name": "Encadeamento Brutal",
        "description": "Você transforma manobras em um massacre. Aumente o limite de Manobras de Combate para 3 Manobras em sequência no mesmo combo."
      },
      {
        "cost": 2,
        "name": "Um, Dois, Três",
        "description": "Gaste sua Ação Principal e Secundária e escolha uma Ameaça em alcance Perto. Você e o MP, em segredo, escolhem um número de 1 a 3 e revelam. Inicia-se uma sequência de até 3 apostas: ● Se os números forem diferentes você a acerta: ○ 1º Acerto: causa 6 PF. ○ 2º Acerto: causa 6 PF. ○ 3º Acerto: causa 7 PF e a Ameaça recebe a Condição: Caído. ● Se os números forem iguais: ○ A sequência é interrompida e você sofre um Acerto Inevitável da Ameaça. Após cada acerto, pode decidir cancelar a sequência."
      },
      {
        "cost": 2,
        "name": "Passo Fantasma",
        "description": "Gastando sua Ação Secundária e uma Reação, mova-se de forma rápida e imprevisível até uma Ameaça em até Afastado, você não pode ser atacado por Vigílias se movendo dessa maneira, se atacar a Ameaça sobre qual avançou, receba Bônus."
      },
      {
        "cost": 2,
        "name": "Todos Contra Um",
        "description": "Gaste sua Ação Principal e Secundária e marque um Alvo em alcance Afastado. Sempre que o Alvo for acertado por um Aliado diferente (incluindo você), ele sofre +2 PF extras multiplicados pelo número de Aliados diferentes que já acertaram ele neste Conflito. ● 1º Aliado a acertar: +2 PF extras (2×1). ● 2º Aliado diferente a acertar: +4 PF extras (2×2). ● 3º Aliado diferente a acertar: +6 PF extras (2×3). Os Bônus são aplicados imediatamente a cada acerto. Após todos os Aliados acertarem ele, o poder acaba."
      },
      {
        "cost": 1,
        "name": "Punho De Pedra",
        "description": "Seus ataques de Briga causam +1 PF adicional."
      },
      {
        "cost": 1,
        "name": "Rasteira",
        "description": "Se acertar as Pernas de um Alvo, gaste uma Reação para aplicar a Condição: Caído."
      },
      {
        "cost": 1,
        "name": "Jab",
        "description": "Gaste uma Reação para fazer uma Ameaça usar uma Reação."
      },
      {
        "cost": 1,
        "name": "O Sino Não Tocou",
        "description": "Ao voltar do Estado de Morrendo, recupere +3 PF."
      }
    ]
  },
  "Caçador": {
    "weapon": "Escolha entre Versáteis / De Fogo",
    "skills": [
      "Sobrevivência",
      "Armas Brancas",
      "Mirar",
      "Percepção"
    ],
    "initial": {
      "name": "Instinto De Perseguição",
      "description": "Você é um predador nato, e a perseguição é seu território. Durante uma Perseguição, você se adapta ao papel que assumir: ● Predador: Movimenta-se 2 marcos por rodada automaticamente (em vez de 1). Se estiver com Ímpeto, move-se 3 marcos. ● Presa: Você sempre se move 1 marco automaticamente por Rodada. Além disso, quando realiza um teste de Avanço com sucesso, pode se mover até 3 marcos (em vez de 1 ou 2)."
    },
    "powers": [
      {
        "cost": 3,
        "name": "Emboscador",
        "description": "Gaste todas as suas Ações e se enterre, cubra com vegetação ou se oculte entre escombros. Enquanto você não agir, você está invisível para qualquer Ameaça que não pise em você. Se uma Ameaça tiver visto você entrar nesse estado, ela saberá sua localização. Você pode sair da emboscada quando preferir, gastando uma Reação. Se ao sair houver uma Ameaça em Até Próximo que não tenha percebido sua presença, você pode imediatamente colocá-lo em um Agarrão Silencioso."
      },
      {
        "cost": 3,
        "name": "Vestes Enraizadas",
        "description": "Ao matar uma Ameaça Enraizada, você pode usar uma Cena para estripá-la e transformar suas partes em uma jaqueta ou manto grotesco. Enquanto vestir essa peça, recebe uma de suas Características Especiais, como Sangue Ácido, Carapaça ou similares. Você pode apenas usar um manto por vez e eles apodrecem em 7 Ciclos, você pode conceder Mantos a Aliados."
      },
      {
        "cost": 3,
        "name": "O Uso Correto",
        "description": "Você sabe usar Lâminas melhor que qualquer um. Suas Armas Brancas só perdem Durabilidade a cada 2 Ataques ou Aparadas."
      },
      {
        "cost": 2,
        "name": "Colar De Presas",
        "description": "Você carrega um colar feito de partes de Animais, Humanos ou Enraizados que abateu. O colar pode carregar até 5 peças, cada uma de uma origem diferente ou não. Dependendo da origem das peças, você recebe efeitos narrativos por peça a critério do MP, medo de humanos que vejam a orelha, respeito de mercantes ao verem o olho do urso ou a hesitação de enraizados ao sentirem o cheiro de um dos seus. Você pode trocar peças sempre que abater uma nova presa digna."
      },
      {
        "cost": 2,
        "name": "O Cheiro Deles",
        "description": "Você possui um jarro de tripas e sangue enraizado. Gaste sua Ação Secundária para cobrir-se ou um Aliado com o conteúdo. Até o fim da Cena, você fica Invisível para Ameaças Enraizadas a menos que você ataque ou toque nelas. O jarro tem 3 usos; reabastecendo seus 3 usos abatendo uma criatura enraizada e extraindo suas vísceras gastando uma Cena."
      },
      {
        "cost": 2,
        "name": "Veneno Na Ponta",
        "description": "Gaste sua Ação Principal e Secundária e esteja em um ambiente com plantas tóxicas ou as pegue com antecedência em uma Área Natural/Selvagem. Você envenena até 3 Munições do seu inventário, concedendo a Condição: Envenenado."
      },
      {
        "cost": 1,
        "name": "A Linguagem Do Assobio",
        "description": "Você tirou tempo para ensinar aos seus a Linguagem do Assobio, assim podendo se comunicar por mensagens simples a distância que só vocês entendem."
      },
      {
        "cost": 1,
        "name": "Inspira, Expira",
        "description": "Gaste sua Ação Secundária para inspirar, soltar o ar lentamente e efetuar o disparo, recebendo Bônus em testes de Ataque com Armas de Disparo / De Fogo."
      },
      {
        "cost": 1,
        "name": "Flechas E Mais Flechas",
        "description": "Ao fabricar Flechas, fabrique 3 ao invés de 2."
      },
      {
        "cost": 1,
        "name": "Crocodilo",
        "description": "Na Chuva, lama ou água você se sente em casa. Enquanto estiver nesses ambientes, você consegue se mover sem produzir ruídos, no seu primeiro Ataque nesse estado, receba Bônus."
      }
    ]
  },
  "Fundador": {
    "weapon": "Pesadas",
    "skills": [
      "Mecânica",
      "Planejar",
      "Ciências",
      "Exatas"
    ],
    "initial": {
      "name": "Olho De Engenheiro",
      "description": "Sempre que rodar para encontrar Recursos, você pode rolar ambas as tabelas duas vezes, encontrando Dois Recursos diferentes com Duas Quantidades diferentes."
    },
    "powers": [
      {
        "cost": 3,
        "name": "Caixa De Gatilhos",
        "description": "Você carrega uma caixa de componentes. Você começa com uma unidade de cada Gatilho. Para montar uma armadilha, instale um Gatilho com uma Ação Principal e acople um Acionador do seu inventário com uma Ação Secundária. Quando o gatilho for ativado, o acionador dispara automaticamente contra a vítima. GATILHOS: ● SENSOR DE VIBRAÇÃO: Detecta movimento em até Perto. Ao ativar, emite um ruído alto ou dispara o acionador acoplado. ● FIO DE NYLON (10M): Instalado rente ao chão ou na altura do tornozelo. Quando puxado, ativa o acionador acoplado. ● PRESSIONADOR DE PLACA: Uma placa de pressão que ativa o acionador ao ser pisada. Após ser ativado, um gatilho pode ser recuperado e reutilizado, desde que não tenha sido destruído. Se perdido ou danificado, você pode fabricar outro gastando 1 Unidade de Sucata e Uma Cena. Os acionadores são itens que você já possui no inventário, como: ● BOMBAS: Acoplada ao gatilho, explode quando ativada. ● ARMAS BRANCAS: Posicionada para golpear, causando a maior Severidade de Ferimento na área que estiver posicionada para acertar. ● MUNIÇÕES: Disparada pelo mecanismo. Mesmo que o item já possua um método próprio de ativação, você pode acoplá-lo aos seus gatilhos para criar ativações alternativas ou remotas."
      },
      {
        "cost": 3,
        "name": "Torreta",
        "description": "Você construiu uma torreta. Para Montá-la use Todas as suas Ações. Quando ativada, a Torreta entra em Vigília e dispara automaticamente contra qualquer Ameaça ou Aliado em um Cone Afastado, usando seus próprios Atributos e Perícias para os testes de Ataque. A Torreta possui 3 disparos de borracha que não dão PF, mas impedem as Ações do Alvo automaticamente. Você pode usar sua Ação Secundária para girá-la para outra direção. Após o terceiro disparo, ela superaquece e fica inutilizável até o fim do Conflito. Fora de Conflito, ela esfria e restaura sua munição automaticamente. Se sofrer um ataque direto, a Torreta quebra. Consertá-la exige uma Cena. Apenas você pode montar ou reparar a Torreta."
      },
      {
        "cost": 3,
        "name": "Espanta Planta",
        "description": "Você criou um bastão emissor de uma luz que queima Enraizados e Raízes. O bastão tem 5 usos. Gastando uma Ação Principal, você ativa o bastão, que ilumina um raio de Perto (5m) ao seu redor. Ele aquece muito rápido, durando apenas 1 Rodada (em Conflito) ou 1 Cena (fora de Conflito), após isso, precisa de 2 Rodadas ou 2 Cenas Esfriando até ser Ativa novamente. Enquanto ativo, Enraizados e Raízes que entrarem ou começarem seu turno dentro da área sofrem queimaduras na pele, isso não causa PF, mas a dor os obriga a gastar suas Ações para recuar para fora do raio (se possível). Se não puderem recuar, gastam suas Ações tentando se proteger da luz. Após 5 usos, a bateria se esgota, tendo que Recarregar."
      },
      {
        "cost": 2,
        "name": "Pequeno Gerador",
        "description": "Você construiu um gerador portátil que ocupa 1 espaço no inventário. Ele pode fornecer energia para dispositivos elétricos (luzes, rádios, etc) ou passar eletricidade (água, baterias, etc), servindo como uma extensão de até 20 Metros. Você pode ativá-lo de três maneiras: ● DÍNAMO: Gire a manivela acoplada ao lado do gerador. O gerador funciona por 1 Cena inteira, mas durante esse período você não pode se afastar do gerador, pois precisa mantê-lo girando. ● BATERIA: Insira uma bateria recarregável. Cada bateria faz o gerador funcionar por 3 Cenas. ● ENERGIA (TOMADA): Se houver uma fonte de energia elétrica funcional no local (ex: tomada de um prédio com gerador próprio, painel solar abandonado, etc.), você pode conectar o gerador diretamente com um fio (incluído no equipamento) e ele funcionará enquanto permanecer conectado."
      },
      {
        "cost": 2,
        "name": "Balas Caseiras",
        "description": "Você sabe fabricar munição para armas de fogo. Gastando uma Cena, com Sucata + Explosivo, você produz 3 Munições para qualquer Arma De Fogo que queira. Pode fabricar as balas gastando todas suas Ações durante um Conflito."
      },
      {
        "cost": 2,
        "name": "Acampamento Fortificado",
        "description": "Você sabe montar um acampamento melhorado. Gaste uma Cena para preparar a área. Todos os Sobreviventes que descansarem nesse acampamento têm 3 Ações de Recuperação em vez de 2."
      },
      {
        "cost": 1,
        "name": "Olho Estrutural",
        "description": "Você identifica fragilidades em construções. Ao examinar uma parede, ponte ou teto, o MP deve responder se a estrutura está: Estável, Instável ou Caindo, passivamente, o MP avisa se você estiver em um local prestes a desabar."
      },
      {
        "cost": 1,
        "name": "Ferramenta Multifuncional",
        "description": "Você possui uma ferramenta que não ocupa espaço de inventário que te concede Bônus para qualquer Teste de Mecânica."
      },
      {
        "cost": 1,
        "name": "Reciclagem",
        "description": "Você sabe extrair o máximo de materiais. Recicle uma Arma quebrada ou não para receber 1 Unidade de Fita, Pano, Recipiente ou Sucata."
      },
      {
        "cost": 1,
        "name": "Pá De Campo",
        "description": "Você possui uma pequena pá. Permite cavar trincheiras, enterrar ou desenterrar itens, nivelar ou criar terreno irregular, abrir valas ou criar pequenas barreiras de terra conforme sua criatividade e o ambiente permitirem. Além disso, pode ser usada como uma Arma Improvisada de Corte ou Impacto."
      }
    ]
  },
  "Áspide": {
    "weapon": "Leves",
    "skills": [
      "Persuasão",
      "Humanas",
      "Mentira",
      "Crime"
    ],
    "initial": {
      "name": "Por Benefício Próprio",
      "description": "Quando participa de uma Ação Conjunta como apoiador, você pode escolher até Dois Atributos diferentes para conceder benefícios à Cabeça, em vez de apenas um, além disso, precise de apenas 3 em Atributos para contribuir, pois você se esforça mais quando o benefício é seu."
    },
    "powers": [
      {
        "cost": 3,
        "name": "Meu Cavaleiro Branco",
        "description": "Quando impede diretamente que um Alvo Humano morra, seja salvando-o de uma Ameaça, protegendo-o de um golpe fatal ou tirando-o de Estado de Morrendo, você pode se tornar o centro emocional daquela pessoa, criando um Vínculo. Após aquilo, se preferir ou a critério do MP, o Alvo passa a enxergar você como sua salvação, seguindo, protegendo, servindo e defendendo você obsessivamente, mesmo contra sua própria lógica. O Vínculo só se quebra caso você o fira gravemente diretamente. Porém, se ignorar, abandonar ou rejeitar emocionalmente essa pessoa por muito tempo, a obsessão apodrece, fazendo o Alvo procurar você compulsivamente, abandonar responsabilidades, agir de forma perigosa para chamar sua atenção e se você continuar ignorando-o, desenvolve um instinto assassino contra você por não ser “amado” de volta. Alvos afetados por este Poder tendem a desenvolver sentimentos extremos entre si, como rivalidade, ciúme, devoção coletiva ou comportamento possessivo, a critério do MP. Esse efeito se aplica a até 3 Alvos por Vez."
      },
      {
        "cost": 3,
        "name": "O Chocalho Da Cascavel",
        "description": "Uma vez por Conflito, Gastando Todas suas Ações, você faz Ameaças Humanas compreenderem que qualquer movimento errado os levará à própria morte. 2 Ameaças da sua escolha que te ouçam perdem suas Reações, incapazes de agir por puro instinto de sobrevivência, hesitação ou paranoia. Não funciona em Ameaças incapazes de compreender você."
      },
      {
        "cost": 3,
        "name": "Presas Inoculadoras",
        "description": "Você instalou em sua própria boca presas artificiais ocas, usadas para armazenar e inocular toxinas raras através de mordidas, beijos ou saliva. Uma vez por Ciclo, com ervas tóxicas, você pode preparar uma das toxinas abaixo, injetando-a em seus dentes, gastando uma Cena. ● SORO DA VERDADE: Durante 3 Cenas, o Alvo é incapaz de mentir conscientemente. Ele ainda pode se recusar a responder perguntas, mas toda resposta dada será absolutamente honesta. ● PARALISIA OFÍDICA: O corpo do Alvo entra em colapso por puro pânico químico. O corpo do Alvo fica completamente paralisado por 2 Cenas, mas mantendo plena consciência. Ele não pode fazer ações físicas, mas pode falar e responder perguntas. ● NÉVOA BRANCA: O Alvo sofre lapsos severos de memória recente, esquecendo acontecimentos das últimas horas, incluindo rostos, conversas ou eventos. Informações antigas, identidade e habilidades não são afetadas."
      },
      {
        "cost": 2,
        "name": "Jogo Da Sedução",
        "description": "Uma vez por Cena, você pode iniciar um jogo de sedução com um PNJ não hostil. Durante a interação, o MP descreve a resistência ou provocação do PNJ, e você responde com palavras ou gestos. O MP avalia cada sua resposta: se for boa (coerente, impactante, sedutora), você ganha 1 ponto; se for fraca (sem força, incoerente, sem sentido), o PNJ ganha 1 ponto. Se você acumular 3 pontos primeiro, a Escala de Relacionamento com aquele PNJ aumenta em +3. Se o PNJ acumular 3 pontos primeiro, a escala diminui em -1. Você só pode tentar uma vez por PNJ por Ciclo."
      },
      {
        "cost": 2,
        "name": "Mãos Ágeis",
        "description": "Você pode roubar os bolsos de um Ameaça que não saiba da sua presença ou que estejam distraídos sem Rolagens. Tendo acesso ao seu inventário e podendo pegar Um Item / Arma que queira, se claro, for possível."
      },
      {
        "cost": 2,
        "name": "Lábios De Mel",
        "description": "Sua Escala de Relacionamento Positiva ignora níveis pares, pulando de 1 para 3 para 5."
      },
      {
        "cost": 1,
        "name": "Viciado Em Mim",
        "description": "Pessoas que passam muito tempo emocionalmente próximas de você começam a desenvolver dependência da sua presença. Quando você desaparece repentinamente, elas ficam inquietas, irritadas, ansiosas ou obsessivas, tendo dificuldade em focar até saberem onde você está ou se voltarão a vê-lo, estranhamente, aumentando sua Escala de Relacionamento com ela."
      },
      {
        "cost": 1,
        "name": "Você Me Deve",
        "description": "Quem aceita um favor seu sente dificuldade genuína em decepcionar você depois, sentindo-se em dívida."
      },
      {
        "cost": 1,
        "name": "Cheiro De Sangue",
        "description": "Você nota facilmente pessoas emocionalmente frágeis, carentes, solitárias ou desesperadas por aprovação."
      },
      {
        "cost": 1,
        "name": "Tadinho De Mim",
        "description": "Você sabe parecer frágil no momento certo. Uma vez por Cena, em situações Não Hostis, pode fingir desmaio, choro, crise de pânico, convulsão ou qualquer reação desesperada de forma extremamente convincente, fazendo pessoas próximas interromperem o que estão fazendo para te ajudar e verificar seu estado."
      }
    ]
  }
}
);
Object.assign(window.ROOTS_DATA.origins,
{
  "Gótico": {
    "weapon": "Versáteis",
    "skills": [
      "Determinação",
      "Performance",
      "Empatia",
      "Intuição"
    ],
    "initial": {
      "name": "Eu Já Vi Pior",
      "description": "A convivência com o horrível e o sombrio tornou os Góticos imunes a muitos dos choques emocionais que paralisariam outras pessoas. Seja pela exposição constante a histórias macabras, arte perturbadora ou experiências pessoais intensas, eles desenvolveram uma resistência psicológica única. Uma vez por Ciclo, você pode ignorar completamente o ganho de PE's."
    },
    "powers": [
      {
        "cost": 3,
        "name": "Totem Enraizado",
        "description": "As raízes parecem estar ligadas a você, ouvindo suas preces e permitindo que você as use como deseja, consumindo um pedaço da sua mente no processo. Sempre que montar um Totem, você recebe +2 de PE Permanente, representando o desgaste mental necessário para manter essa conexão. Gastando sua Ação Principal e Secundária você planta ou crava ele solo, disso se cria uma Zona em um raio de 10 metros (Afastado), formando um círculo perfeito ao redor do ponto onde foi instalado, onde os totens mantém sua influência. Ao conjurar o Totem, você deve escolher um dos dois efeitos disponíveis: ● CÍRCULO DE PROTEÇÃO: Invoca uma aura de energia pulsante que se manifesta como linhas luminosas e enraizadas irradiando do centro do Totem. Quando um Ataque acerta Você ou um Aliado dentro da Área, você pode ativar o Totem para que ele absorva o Ferimento no lugar do Alvo, se quebrando logo depois. ● BONECO DE VOODOO: Cria uma ligação sinistra entre você e até um Alvo dentro do raio do Totem. Essa conexão é visualmente representada por finos filamentos vermelhos pulsantes que conectam seu corpo ao do Alvo escolhido. Enquanto o vínculo estiver ativo, todo o Ferimento que você receber, o Alvo também receberá, porém dobrado. O efeito acaba quando um de vocês entrar morrendo, um de vocês sair da área ou o totem for destruído. Apenas um Totem pode estar ativo por vez. O Totem permanece ativo enquanto você estiver consciente. O Totem pode ser Alvo de ataques diretos, se quebrando depois de um ataque."
      },
      {
        "cost": 3,
        "name": "A Força De Quem Caiu",
        "description": "À medida que seus aliados caem ao seu redor, você sente uma força crescente, como se o peso de suas perdas o impulsionasse a continuar, mais forte do que nunca. A cada Sobrevivente que entrar em Estado de Morrendo ou Morre, você ganha Bônus em todos os seus testes. Se seus Aliados levantarem você perde o Bônus equivalente."
      },
      {
        "cost": 3,
        "name": "Estado De Flow",
        "description": "Você achou um par de Fones no chão, atrelados a um dispositivo, e hoje em dia não larga deles. A música que você ouve molda seu estado emocional e físico. Ao usar sua Ação Principal, você liga o ESTADO DE FLOW e escolhe uma \"Mixtape\". O estado dura até seus fones quebrarem, o Fim da Cena ou Desligar gastando sua Ação Secundária.   Você pode trocar de Mixtape, mas isso exige uma Ação Principal. Sempre que estiver em ESTADO DE FLOW, você recebe Penalidade em Percepção. MIXTAPES: ● Pop – \"Flash of Fame\" ○ Bônus: Bônus em Esquivar e Persuasão. ○ Penalidade: Penalidade em Furtividade e Armas Brancas. ● Jazz – \"Smoky Drift\" ○ Bônus: Bônus em Furtividade e Improvisar. ○ Penalidade: Penalidade em Briga e Persuasão. ● Rock – \"Blaze of Defiance\" ○ Bônus: Bônus em Briga e Intimidação. ○ Penalidade: Penalidade em Fuga e Esquiva. ● Eletrônica – \"Neon Blitz\" ○ Bônus: Bônus em Mirar e Reflexos. ○ Penalidade: Penalidade em Intuição e Improvisar. ● Clássica – \"Crest of Valor\" ○ Bônus: Bônus em Determinação e Coragem. ○ Penalidade: Penalidade em Atletismo e Reflexos."
      },
      {
        "cost": 2,
        "name": "Laços De Tinta",
        "description": "Suas tatuagens não são apenas desenhos; elas criam uma ligação emocional e simbólica entre você e aqueles que as carregam, fortalecendo os laços do grupo e inspirando coragem em momentos de necessidade. Você pode uma única vez criar tatuagens em até Dois Aliados, formando um vínculo especial com eles. Você e esses Aliados recebem Bônus em todos os Testes de Determinação, Coragem e Tolerância enquanto estiverem Perto um do outro."
      },
      {
        "cost": 2,
        "name": "Eu Vejo Gente Morta...",
        "description": "Uma vez por Cena, em um lugar associado a morte ou sofrimento, você pode buscar \"respostas\" no ambiente. O MP deve fornecer uma dica , como \"O padrão das marcas no chão sugere que algo foi arrastado para longe\" ou \"As vítimas parecem ter tentado escapar desesperadamente, mas todas foram atingidas nas costas\". Caso existam corpos no local, o MP deve descrever brevemente como as vítimas podem ter morrido, baseando-se nos sinais visíveis, como ferimentos, expressões ou o estado do ambiente ao redor."
      },
      {
        "cost": 2,
        "name": "Minha Mente Pela Sua",
        "description": "Sua mente é um pilar, capaz de sustentar aqueles ao seu redor, mas se desgastando no processo. Você pode conceder -2 PE para um Aliado que possa tocar, enquanto absorve parte dessa carga, recebendo +1 PE. Você pode repetir o processo, transferindo quantos pontos desejar, acumulando os efeitos a cada ponto concedido."
      },
      {
        "cost": 1,
        "name": "Histórias Do Corpo",
        "description": "Toda pele tem uma história. Você pode saber sobre cicatrizes, tatuagens ou marcas no corpo de alguém para conseguir detalhes sobre sua história, como eventos passados, afiliações ou possíveis ocorridos na vida de tal."
      },
      {
        "cost": 1,
        "name": "Premonição",
        "description": "Você pode realizar um teste de Intuição ou Percepção com Bônus para perceber presenças não visíveis, como Ameaças escondidos, Armadilhas ou até mesmo algo sobrenatural."
      },
      {
        "cost": 1,
        "name": "Marca Profana",
        "description": "Você pode deixar uma marca sutil com uma tinta que tem um cheiro forte, quase invisível, em uma superfície ou pessoa que não saiba da sua presença, ou que permita que você a marque. Você sente o cheiro da marca até a Distância: Distante, conseguindo saber a direção de onde ele está."
      },
      {
        "cost": 1,
        "name": "Inspiração Artística",
        "description": "Você ama quando escutam sua música, ouvem suas poesias ou veem seus desenhos com atenção. Sempre que fizer um teste de Performance bem sucedido para um grupo de 2 pessoas ou mais, receba -2 PE."
      }
    ]
  },
  "Andarilho": {
    "weapon": "Pesadas",
    "skills": [
      "Furtividade",
      "Fuga",
      "Crime",
      "Sobrevivência"
    ],
    "initial": {
      "name": "Fantasma",
      "description": "Quando você se encontra em uma situação onde sua presença não deve ser notada, sua habilidade de desaparecer se intensifica, aumentando o tanto de Falhas necessárias para transição de estados em +1 em Cenas de Furtividade."
    },
    "powers": [
      {
        "cost": 3,
        "name": "Provisões Da Terra",
        "description": "Você pode preparar até 2 provisões, trazendo-os consigo para ser consumidas em Cenas de Recuperação sem usar suas Ações, e Aliados também não gastam Ações ao usá-las. É possível usar ou fornecer até 2 Provisões por Cena de Recuperação. Cada 2 Provisões contam como um Item no seu Inventário e é consumida após o uso. Consumir uma segunda Provisão na mesma Recuperação faz o Sobrevivente perder sua Ação de Recuperação. Você pode obter \"provisões\" no caminho quando estiver em lugares propensos a encontrar os recursos ou quando o ambiente permitir a coleta. ● Carne Seca – Restaura -2 PF e -2 PE. Um pedaço de carne salgada e defumada, resistente ao tempo, ideal para recarregar forças em condições extremas. ● Chá Amargo de Ervas – Remove 2 até 2 Condições Tratadas. Um chá quente feito de ervas amargas, usado para aliviar dores. ● Grãos Secos e Nozes – Concede +1 PA em qualquer Atributo por um Ciclo. Uma mistura energética de sementes e nozes, perfeita para manter a resistência em terrenos difíceis. ● Pão Velho – Restaura -3 PF. Um alimento simples, mas rico em nutrientes, que acelera a recuperação do corpo. ● Água da Chuva – Restaura -3 PE. Um cantil com água pura e fresca, capaz de aliviar o cansaço mental e clarear a mente."
      },
      {
        "cost": 3,
        "name": "O Eco Da Estrada",
        "description": "Você não pertencem a lugar algum, e por isso, a própria morte parece relutar em levá-los. Uma única vez, ao sofrer um ataque que o mataria ou ao entrar em Estado de Morrendo, você pode ativar o Eco da Estrada.   Você retorna à vida com metade de seus PF's e sem Condições Provenientes de Ferimentos, como se tivesse sido puxado de volta por um instinto primal ou pela própria vontade de seguir em frente."
      },
      {
        "cost": 3,
        "name": "Lobo Solitário",
        "description": "Você é mais eficiente quando age sozinho, longe da interferência dos outros. Ao atuar sem Aliados próximos em um Raio Distante (30 Metros), você recebe um Bônus em todas as suas Rolagens. Se um Aliado entrar na sua área durante a Cena, o Bônus é perdido até que você volte a ficar sozinho."
      },
      {
        "cost": 2,
        "name": "Déjà Vu",
        "description": "Anos cruzando caminhos inseguros ensinaram você a “sentir” o território antes mesmo de explorá-lo. Sempre que entra em um novo Hex, você reconhece sua Influência, Terreno e Pontos de Interesse que existem ali."
      },
      {
        "cost": 2,
        "name": "Vou Morrer Do Meu Jeito",
        "description": "Quando você sente que sua história está prestes a chegar ao fim, depois de tanto caminhar, você briga para que, se a morte é inevitável, que ela venha do seu jeito. Caso ainda esteja consciente durante seu Estado de \"Morrendo\", você pode desafiar a morte e negar UM golpe de misericórdia."
      },
      {
        "cost": 2,
        "name": "Olhos Oportunistas",
        "description": "A percepção aguçada permite que você enxergue além da superfície, buscando vulnerabilidades ou preciosidades. Gastando sua Ação Secundária, você pode \"ler\" um Alvo que possa ver claramente de 3 formas: ● VITALIDADE: percebe o estado físico do Ameaça, descobrindo seus PF's. ● ARMAS: consegue identificar a Arma mais perigosa que um Alvo carrega. ● OBJETOS: identifica qual o Item mais Valioso que o Alvo carrega."
      },
      {
        "cost": 1,
        "name": "O Vento É Meu Guia",
        "description": "Você possui um instinto quase sobrenatural para perceber perigos iminentes. Uma vez por Cena, você pode pedir ao MP uma dica sobre uma decisão que está prestes a tomar. O MP deve responder verdadeiramente com \"Seguro\", \"Sorte\" ou \"Perigo\", sem detalhes adicionais."
      },
      {
        "cost": 1,
        "name": "Burro De Carga",
        "description": "Você ignora completamente uma penalidade de -1 PA em Físico ou Destreza por estar Sobrecarregado."
      },
      {
        "cost": 1,
        "name": "Rastreador Ambulante",
        "description": "Você é capaz de perceber detalhes no terreno que escapam aos outros. Ao analisar pegadas, marcas ou sinais no chão, caçando alguém, você pode perguntar ao MP “Quem passou por aqui?”, “Há quanto tempo?” ou “Para onde foram?”, e ele deve fornecer uma resposta curta e útil."
      },
      {
        "cost": 1,
        "name": "Eu Ando Há Muito Tempo",
        "description": "Longas caminhadas e noites sem descanso te fortaleceram. Você não pode receber a condição: Exaustão por muito esforço, como andar excessivamente ou ficar em um combate por longos períodos de tempo."
      }
    ]
  },
  "Ith'Na": {
    "weapon": "Versáteis",
    "skills": [
      "Lidar com Animais",
      "Raízologia",
      "Armas Brancas",
      "Improvisar"
    ],
    "initial": {
      "name": "Filho Da Terra",
      "description": "Você se sente acolhido quando sente a Mãe te rodear, e grato quando sente a Praga te abraçar. Enquanto em uma Área Corrompida, receba Bônus em todos os seus testes. E sempre que atingir um novo estado de Disseminação, receba +1 PA em um Atributo de sua escolha. No entanto, todo ITH’NA é, obrigatoriamente, Sangue Novo."
    },
    "powers": [
      {
        "cost": 3,
        "name": "O Melhor Amigo Do Homem",
        "description": "Você possui um Cachorro companheiro que possui 10 PF e age logo após você no Turno executando Comandos. O Cachorro inicia conhecendo 3 Comandos (como Ataca, Busca, Guia ou Pegue). Ao executar um Comando conhecido, realiza o Teste com 3 de Atributo e 3 de Valor-Alvo. Se o comando for apenas parecido com algo que conhece, realiza o Teste com 2 e 2. Se não conhecer o comando, realiza o Teste com 1 e 1. Durante Cenas de Recuperação, você pode usar: ● Uma Ação Significativa para aumentar em +1 o Atributo e Valor-Alvo de um Comando conhecido. ● Duas Ações Significativas para ensinar um novo Comando, que começa com 3 e 3. Manobras de Combate (que não envolva Intelecto) podem ser ensinadas ao Cachorro como Comandos. O máximo de Atributo e Valor-Alvo de um Comando é 5. O número máximo de Comandos conhecidos é igual ao dobro do seu Intelecto. Ao Atacar, Cachorros causam apenas Ferimentos de Perfuração Leve. Se o Cachorro morrer, você recebe uma Dor Permanente ligada a ele, definida narrativamente. Caso encontre outro Cachorro no futuro, é possível criar uma nova relação até que ele se torne seu novo companheiro, curando essa Dor."
      },
      {
        "cost": 3,
        "name": "A Dança Da Praga",
        "description": "Uma vez por Ciclo, Gastando todas suas Ações, você escolhe dois Alvos vivos visíveis e transfere toda a Corrupção de um deles para o outro, querendo eles ou não. Ao fazê-lo, você recebe +1 PE Permanente e +5 PC, sentindo a Praga atravessar seu corpo. O Alvo que recebe a Corrupção sofre imediatamente os efeitos narrativos e mecânicos da mudança, sem mitigações. O Alvo original fica livre da Corrupção, mas carrega cicatrizes narrativas Permanentes deixadas pela passagem da Praga, definidas pelo MP. Isto nunca pode ser usado em si mesmo ou em outros Sobreviventes (Pré-Req: Sangue Novo)."
      },
      {
        "cost": 3,
        "name": "Mente Coletiva",
        "description": "Gastando todas as suas Ações e recebendo +1 PE Permanente e +1D6 PC, você força sua consciência para dentro da mente de uma Ameaça Enraizada visível em até Afastado, até o início do seu próximo Turno, você não age com seu corpo. No próximo Turno da Ameaça, você assume o controle da mente dela, após isso, é forçado para fora. Se durante seu controle, a Ameaça morrer, sofra +4 PE (Pré-Req: Sangue Novo)."
      },
      {
        "cost": 2,
        "name": "Flor Multi-Pétalas",
        "description": "Escolha 2 Flores diferentes. Sempre que alcançar um novo estágio de Disseminação, receba ambas as dádivas das flores escolhidas. Em troca, os efeitos Psicológicos e Físicos da Disseminação te afetam de maneira dobrada (Pré-Req: Sangue Novo)."
      },
      {
        "cost": 2,
        "name": "Venham Até Mim!",
        "description": "Você abre o peito e chama a Mãe pelo nome que só a terra conhece. Gastando sua Ação Principal e Secundária, você emite um grito gutural ritualístico No Limite. Todas as Ameaças Bestiais na área são imediatamente atraídas para o local."
      },
      {
        "cost": 2,
        "name": "A Arte Da Violência",
        "description": "Você sabe transformar matéria vegetal em instrumentos de violência funcional. Você pode Improvisar Armas Brancas de qualquer Categoria com madeira ou recursos naturais. Essas armas possuem metade da Durabilidade padrão (arredondada para baixo). Armas criadas dessa forma não podem ser reparadas ou modificadas."
      },
      {
        "cost": 1,
        "name": "Sou De Casa",
        "description": "Você está acostumado com o mundo de hoje em dia. Sempre que sofrer com Condições de Ambiente, receba Bônus em todos seus Testes."
      },
      {
        "cost": 1,
        "name": "Cheiro Familiar",
        "description": "As raízes reconhecem você. Ameaças Enraizadas nunca te escolhem como primeiro Alvo, a menos que você seja a única presença ou aja diretamente contra elas primeiro."
      },
      {
        "cost": 1,
        "name": "O Ritmo Da Terra",
        "description": "Quando quiser, comece a andar com o Ritmo da Terra, e conceda Bônus para Aliados que queiram te imitar com Performance, ao andar assim, não deixe rastros."
      },
      {
        "cost": 1,
        "name": "Aceitação",
        "description": "Você entende a morte como parte do ciclo. Sempre que mortes gerariam PE, você nunca pode receber mais do que 3 PE provenientes dessas fontes."
      }
    ]
  },
  "Bélico": {
    "weapon": "De Fogo",
    "skills": [
      "Mirar",
      "Investigação",
      "Cautela",
      "Reflexos"
    ],
    "initial": {
      "name": "Meu Bebê",
      "description": "Você não confia em armas improvisadas. A sua foi escolhida, ajustada e cuidada quando ainda havia tempo para fazer isso direito. No início da vida, sua arma vem equipada com 2 modificações à sua escolha."
    },
    "powers": [
      {
        "cost": 3,
        "name": "Ponto De Fulcro",
        "description": "Você ativa a Vigília usando apenas sua Ação Secundária, mantendo pressão constante sobre o campo de batalha."
      },
      {
        "cost": 3,
        "name": "Ponto De Choque",
        "description": "Você transforma uma posição defensiva em um funil de morte. Enquanto estiver atrás de uma Cobertura, você pode usar sua Ação Principal e Secundária para estabelecer um Ponto de Choque. Aliados posicionados atrás da mesma cobertura recebem bônus em todos seus testes de Ataque e Ameaças que avançarem contra o Ponto tem Penalidades em todos seus testes."
      },
      {
        "cost": 3,
        "name": "Bala Curva",
        "description": "Você consegue realizar um ataque de forma precisa e imprevisível. Ao usar Ação Principal e Secundária, você pode fazer um disparo “curvo”, atingindo uma Ameaça que não esteja diretamente na sua linha de visão, contornando coberturas ou Aliados na sua frente."
      },
      {
        "cost": 2,
        "name": "Reutilização",
        "description": "A guerra nunca deu tempo para desperdício. Você pode retirar Modificações de uma arma e aplicá-las em outra da mesma Categoria, desde que haja tempo e ferramentas mínimas."
      },
      {
        "cost": 2,
        "name": "Silenciador Improvisado",
        "description": "Com Recipiente + Fita, você pode criar um Silenciador Improvisado e acoplá-lo a uma Arma de Fogo compatível, definida pelo MP. O silenciador funciona por 4 disparos antes de quebrar."
      },
      {
        "cost": 2,
        "name": "Ombros Calejados",
        "description": "Você já sentiu solavancos demais. Seu NS exigido para Recuo é sempre um abaixo do normal."
      },
      {
        "cost": 1,
        "name": "Só Preciso De Fita",
        "description": "Você resolve o problema com o que tem à mão. Ao fabricar um Conserto de Arma, você pode utilizar apenas Fita."
      },
      {
        "cost": 1,
        "name": "Eficiência Das Partes",
        "description": "Você sabe exatamente onde as armas cedem primeiro. Você pode Consertar uma Arma Branca até 2 vezes, em vez de apenas 1."
      },
      {
        "cost": 1,
        "name": "Onde Eu Estaria?",
        "description": "Sempre que sofrer um disparo, próximo ou direto, você identifica aproximadamente a origem do disparo, permitindo reagir com precisão ao buscar cobertura."
      },
      {
        "cost": 1,
        "name": "Disciplina De Gatilho",
        "description": "Treinos de disciplina eram vitais. Sempre que falhar em um teste de Ataque com Armas de Fogo, não consome munição, trocando o erro do disparo por não atirar."
      }
    ]
  }
}
);
Object.assign(window.ROOTS_DATA.origins,
{
  "Líder": {
    "weapon": "Versáteis",
    "skills": [
      "Intuição",
      "Planejar",
      "Reflexos",
      "Empatia"
    ],
    "initial": {
      "name": "Você Consegue!",
      "description": "Líderes sabem como transformar momentos de desespero em oportunidades de vitória. Uma vez por Cena, se estiverem até em Alcance Afastado, eles podem conceder Bônus, seja para si mesmos ou para Aliados. Essa capacidade de infundir confiança e superar as probabilidades faz deles peças-chave em momentos cruciais."
    },
    "powers": [
      {
        "cost": 3,
        "name": "Segue O Plano!",
        "description": "Você sabe o que os outros têm que fazer para tudo dar certo, mas só funciona se cada um fizer sua parte. Durante um Conflito, gastando sua Ação Principal, você pode elaborar rapidamente uma estratégia detalhada e passar ordens claras a todos os seus Aliados. Enquanto os Aliados seguirem suas instruções ao pé da letra, todos recebem Bônus em seus testes. Se qualquer Aliado falhar em cumprir seu papel ou agir de maneira impetuosa, o Bônus será anulado e você sofrerá +2 PE, devido à descoordenação gerada. Se o plano funcionar, todos os envolvidos recebem -2 PE. O MP pode negar o poder caso o plano seja excessivamente simples ou não traga uma mudança significativa para a Cena. Com isso, estratégias genéricas como \"Fiquem abaixados\" ou \"Atirem todos de uma vez\" não seriam aceitas."
      },
      {
        "cost": 3,
        "name": "Fiquem Firmes",
        "description": "Sua voz constrói fé, fé essa defende qualquer coisa. Você pode usar todas as suas Ações para inspirar Aliados que possam te ouvir. Os Aliados recebem a Condição: IMUNE para Condições até o fim de seu próximo Turno. Após o efeito terminar, você sofre +2 PE devido ao peso emocional de manter a esperança alheia, você perde +1 PE por +1 Aliado que queira afetar com essa habilidade."
      },
      {
        "cost": 3,
        "name": "É Tudo Ou Nada",
        "description": "Você sabe que às vezes, tudo o que alguém precisa é de um incentivo, motivação extrema, e você faz isso melhor que ninguém. Uma vez por Conflito, gastando todas suas Ações, você concede 2 Ações Principais para todos os Aliados que possam te ouvir até seu próximo turno."
      },
      {
        "cost": 2,
        "name": "Estratégia De Contenção",
        "description": "Você é capaz de usar sua autoridade e presença para impor uma estratégia de contenção contra um Alvo. Gastando sua Ação Principal, você pode forçar uma Ameaça Humana a hesitar e congelar, limitando sua capacidade de ação. A Ameaça recebe a Condição: Paralisado até seu próximo turno. Isso só pode ser feito uma vez por Alvo."
      },
      {
        "cost": 2,
        "name": "Efeito Dominó",
        "description": "Quando você convence uma pessoa em um grupo a aceitar seu ponto de vista com qualquer teste de Espírito, automaticamente influencia os outros do grupo, permitindo que você faça um novo teste com Bônus para convencer mais pessoas daquele grupo. Se pelo menos metade do grupo for convencida, os demais cedem sem necessidade de testes adicionais."
      },
      {
        "cost": 2,
        "name": "Eu Te Ensino",
        "description": "Ao possuir 4 PP+ em uma Perícia, você pode transmiti-la a um Sobrevivente, concedendo +1 PP Permanente ou +3 PP temporários (durando a cena) nessa Perícia. Cada Perícia só pode ser ensinada uma única vez por Sobrevivente."
      },
      {
        "cost": 1,
        "name": "Carisma Natural",
        "description": "Sua presença é magnética. Sempre que você entra em um ambiente, as pessoas ao seu redor ficam mais dispostas a ouvir o que você tem a dizer, todos os PNJ's não Hostis que você conhece pela primeira vez, tem +1 na Escala de Relacionamento com você."
      },
      {
        "cost": 1,
        "name": "Autocontrole Glacial",
        "description": "Seu Estresse não aumenta em situações sociais ou com ameaças verbais, não importa quão tensas ou hostis sejam."
      },
      {
        "cost": 1,
        "name": "Ego Inflado",
        "description": "Você se sente muito bem ao convencer as pessoas. Sempre que convencer um PNJ a fazer algo que não era de seu interesse, reduza seu próprio Estresse em 2 PE. Se um grupo de pessoas for convencido ao mesmo tempo, o Ego Inflado só se ativa uma vez, assim, você não reduz mais Estresse por convencer múltiplos indivíduos em uma única situação."
      },
      {
        "cost": 1,
        "name": "As Entrelinhas Falam",
        "description": "Você sabe ler as entrelinhas de um diálogo. Após uma conversa com qualquer PNJ, você pode fazer uma pergunta ao MP sobre uma emoção ou intenção daquele diálogo, que será respondida com \"Sim\" ou \"Não\"."
      }
    ]
  },
  "Cronista": {
    "weapon": "Leves",
    "skills": [
      "Mentira",
      "Humanas",
      "Investigação",
      "Percepção"
    ],
    "initial": {
      "name": "Eu Tenho História",
      "description": "O Cronista não precisa se apresentar, seu nome já o precede. Seja por feitos reais ou histórias distorcidas que se espalharam no caos do Enraizamento, ele carrega uma fama que o acompanha onde quer que vá. Escolha uma Reputação de sua Escolha."
    },
    "powers": [
      {
        "cost": 3,
        "name": "P.A.G.E.R",
        "description": "Você guarda um velho pager, conectado a contatos espalhados pelo mundo arruinado, pessoas que ainda atendem quando chama, seja por dívida, medo ou fé em sua palavra. O Pager possui 3 Sinais para as seguintes Ações: ● ATIRA NELE: Você manda suas coordenadas. Em 1D4 Rodadas, um atirador oculto tentará disparar contra um Alvo à sua escolha, se ele estiver morto, o Atirador escolherá um Alvo aleatório. O ataque é feito com um Fuzil de Precisão e usará os seus Atributos. ● SEJAM MEUS OLHOS: Você aciona um informante próximo, que passa detalhes sobre uma área. Em um Ciclo, ele revelará a posição de Ameaças ocultas ou Alertar sobre armadilhas. Se não houver nada escondido, o informante entrega um detalhe útil sobre o Terreno. ● SOS: Um grupo de sobreviventes aliados a você se move em resposta ao pager. Eles não são combatentes leais, mas criarão uma distração: barulho, fogo, confusão ou bloqueios improvisados. Pode demorar até 1D4 Cenas. Para usar, gaste uma Cena / Ação Principal e Secundária. Para restaurar o Pager, você precisa reconstruir sua rede (mentindo, pagando favores, deixando novas histórias espalhadas). Isso recupera 1 Sinal, até o máximo de 3. Naturalmente, seu P.A.G.E.R recupera 1 Sinal a cada 1 Ciclo sem uso."
      },
      {
        "cost": 3,
        "name": "Ecos Do Futuro",
        "description": "Após anos de estudo sobre o passado e seus padrões, você aprendeu a prever o futuro. Gastando sua Ação Secundária, você pode ativar essa habilidade para visualizar a Ação de um Aliado em Até Afastado e seus resultados através de uma \"jogada fantasma\", sem rolagens de dados, revelando o futuro mais provável. Essa habilidade permite ver apenas o destino do Aliado visualizado, não revelando ameaças ocultas diretamente. Você não descobrirá, por exemplo, que há um atirador escondido em um telhado, mas poderá ver que o Aliado será atingido caso realize determinada ação. Você ganha +1 PE para cada Rodada futura visualizada, acumulando mais PE quanto mais longe olhar. Se as visões forem horrendas, você sofre PE condizente devido ao impacto emocional."
      },
      {
        "cost": 3,
        "name": "Falso Profeta",
        "description": "Tudo que você diz carrega peso, como se fosse parte de uma lenda maior. E você sabe usar isso ao seu favor. Você pode usar sua Ação Principal para declarar em voz alta uma visão clara e específica sobre algo que acontecerá ainda naquela Rodada. Se a previsão se cumprir, um Aliado à sua escolha recebe Bônus em todas as suas Ações, fortalecido pela crença de que você realmente enxerga o futuro. Ao acertar duas previsões seguidas, todas as Ameaças Humanas que ouvirem sofrem Penalidade, temendo que seu destino já esteja escrito. Cada nova previsão correta repete esses efeitos. Mas se uma previsão falhar, todos os Bônus e Penalidades acumulados desaparecem de imediato, corroídos pela dúvida e pela perda de confiança. Se falhar duas vezes seguidas, o poder se encerra neste Conflito e não poderá ser usado. Para todos ali, você não passa de um charlatão… Ou de alguém que, se um dia realmente via o futuro, agora perdeu esse dom."
      },
      {
        "cost": 2,
        "name": "Ferramenta Fotográfica",
        "description": "Você possui uma câmera de última pré-geração, além de fotografar e manter até 3 fotos, substituindo a mais velha pela mais recente quando chegar ao limite. Ela tem 7 usos para os seguintes efeitos, antes de precisar ser recarregada. ● VISÃO INFRAVERMELHA – Você pode ativar o modo de visão noturna em sua câmera, iluminando o ambiente com uma leve luz infravermelha que você pode ver através do visor ou em seu display. Você consegue enxergar em ambientes totalmente escuros ou com pouca luz sem revelar sua posição. ● BONS TEMPOS – Reviver lembranças faz você recuperar PE."
      },
      {
        "cost": 2,
        "name": "Rede De Contatos",
        "description": "Você tem acesso a 3 informantes distintos, seus ajudantes quando precisou de fontes confiáveis para suas anotações. Você pode contatar eles em busca de informações ou entregas de itens, mas, deve ser cuidadoso com o modo como lida com cada um deles. Caso os desrespeite ou ultrapasse certos limites, você pode perder o acesso às informações deles Permanentemente, e como Sobreviventes da história, podem morrer ou se ferir temporariamente (Recomendamos a criação deles por parte do Sobrevivente com a autorização do MP! Ou do próprio MP)."
      },
      {
        "cost": 2,
        "name": "Boca A Boca",
        "description": "Sua voz se espalha rápido. Gaste uma Cena para espalhar rumores sobre alguém naquela comunidade, podendo alterar sua Reputação para qualquer na Matriz. Porém, se te pegarem mentindo sem provas, este poder não poderá ser usado na região até que você recupere sua credibilidade com um feito significativo."
      },
      {
        "cost": 1,
        "name": "Detalhe Oculto",
        "description": "Você pode analisar fotos, papéis, manuscritos e desenhos para revelar detalhes ocultos que passariam despercebidos. Ao usar essa habilidade, escolha focar em: Detalhes, Ligações, Padrões, Histórias ou Significados. O MP fornecerá uma descrição com base na sua escolha. Se o item / cena analisada não puder ser reconhecido por você ou nada que viu ou estudou, o poder não terá efeito."
      },
      {
        "cost": 1,
        "name": "Isso Vai Pro Livro",
        "description": "Após qualquer evento significativo, você pode espalhar uma versão dramatizada dos fatos. Na próxima vez que o grupo for reconhecido naquela região, o MP deve considerar que rumores sobre eles já existem."
      },
      {
        "cost": 1,
        "name": "Eu Não Morrerei Em Vão!",
        "description": "Quando você morre, todos os seus Aliados próximos recebem imediatamente +1 PA em um Atributo à escolha deles. Esse bônus simboliza não apenas a dor da perda, mas a inspiração que suas palavras e sua presença deixaram."
      },
      {
        "cost": 1,
        "name": "Sussurros Do Passado",
        "description": "Você é sensível a vestígios emocionais deixados em objetos antigos. Você pode tocar um objeto ou arma e sentir uma breve impressão emocional do último evento significativo relacionado a ele."
      }
    ]
  },
  "Renegado": {
    "weapon": "Pesadas",
    "skills": [
      "Intimidação",
      "Briga",
      "Força",
      "Tolerância"
    ],
    "initial": {
      "name": "Isso Não É Nada",
      "description": "Ferimentos que derrubariam outras pessoas são apenas arranhões para os Rebeldes. Uma vez por Conflito, eles podem reduzir um Ferimento Grave / Moderado a um Ferimento Leve de mesmo tipo."
    },
    "powers": [
      {
        "cost": 3,
        "name": "Voz Da Resistência",
        "description": "Você tem o dom de influenciar e motivar pessoas. Uma vez por Conflito, gastando sua Ação Secundária ao usar sua voz para motivar, você é capaz de inspirar Aliados a superar o medo e partir para cima, todos os Aliados Perto de Você recebem um Bônus relacionado a QUALQUER Teste de Ataque até seu Próximo Turno."
      },
      {
        "cost": 2,
        "name": "Ei, Briga Comigo!",
        "description": "Você odeia ver injustiças, pra você, se alguém vai brigar, que seja com alguém do mesmo tamanho. Gastando uma Reação, pode atrair a atenção de todas as Ameaças para você até seu próximo Turno."
      },
      {
        "cost": 2,
        "name": "Braços De Ferro",
        "description": "Seus Braços são cheios de cicatrizes, seus ossos, calejados. Ao se Defender, reduza -5 PF de qualquer Ferimento."
      },
      {
        "cost": 2,
        "name": "Foi Tudo Calculado",
        "description": "Uma vez por Conflito, que você tomar uma ação arriscada com grandes chances de falha (Profano ou Absoluto), você pode re-rolar a mesma jogada, ficando com o melhor resultado."
      },
      {
        "cost": 1,
        "name": "Vida Sob Pressão",
        "description": "De tanto lutar, você não pode receber a Condição: Pânico."
      },
      {
        "cost": 1,
        "name": "O Calor Do Combate",
        "description": "Você precisa de mais, você adora o calor do combate. Sempre que entrar em um Conflito, você ganha -2 PE."
      },
      {
        "cost": 1,
        "name": "Tudo No Vermelho",
        "description": "Você é um mestre quando o assunto é apostar na jogada certa, você pode usar sua Ação Secundária para ganhar Bônus na sua Ação Principal."
      },
      {
        "cost": 1,
        "name": "Último Esforço",
        "description": "Seu corpo libera uma última onda de energia quando está prestes a cair. Quando em Estado Crítico, ganhe Bônus em todos seus Testes de Ataque."
      }
    ]
  },
  "Corredor": {
    "weapon": "Leves",
    "skills": [
      "Atletismo",
      "Respiração",
      "Condução",
      "Furtividade"
    ],
    "initial": {
      "name": "Efeito Manada",
      "description": "Você aprendeu a navegar pelo caos e guiar outros em momentos críticos. Uma vez por Perseguição, ao ter sucesso em um teste de Avanço, você pode escolher um Aliado. Esse Aliado avançará para o marco que você está sem precisar rolar e mantendo seu turno. Sua habilidade instintiva de liderar e inspirar seus aliados em situações de alta tensão pode fazer toda a diferença."
    },
    "powers": [
      {
        "cost": 3,
        "name": "Movimento Impecável",
        "description": "Você, devido à sua habilidade única em acrobacias e mobilidade, nunca precisa fazer uma rolagem de Atletismo ou Respiração. Isso significa que você pode atravessar obstáculos urbanos ou naturais, como telhados ou paredes. No entanto, se você estiver com alguma Condição / Ferimento que limite sua movimentação (como Atordoado, Preso e etc), ou, em Cenas de Conflito, esse poder não se aplica."
      },
      {
        "cost": 3,
        "name": "Eu Sou Mais Rápido Que Você",
        "description": "Sua velocidade fulminante transforma sua defesa. Sempre que você Aparar com sucesso, pode imediatamente Atacar a Ameaça que tentou te acertar, como um Acerto Inevitável."
      },
      {
        "cost": 3,
        "name": "Execução Fantasma",
        "description": "Seus ataques surgem do nada e terminam antes que a Ameaça perceba o que aconteceu. Quando você atacar um Ameaça que esteja no seu \"Agarrão Silencioso\", o Ataque causa Ferimento Triplicado ao invés de duplicado como é naturalmente."
      },
      {
        "cost": 2,
        "name": "Nas Sombras",
        "description": "Em áreas com pouca visibilidade ou luz, você ganha Bônus em todas as rolagens de Furtividade, permitindo que explore locais de alto risco com eficiência e cautela."
      },
      {
        "cost": 2,
        "name": "Sai Da Minha Frente",
        "description": "Nada nem ninguém consegue ficar no seu caminho quando você decide avançar. Sempre que você usar Correr entre Distâncias, se houver um Ameaça no seu trajeto, você pode ombrear o Alvo e empurrá-lo violentamente para fora do seu caminho, para: frente, esquerda ou direita, sem interromper seu movimento e empurrando ele para um local desejado."
      },
      {
        "cost": 2,
        "name": "Reflexos Sobre-Humanos",
        "description": "Sua mente e corpo reagem antes mesmo de você perceber o perigo. Em Cenas de Conflito, você pode agir no início da rodada, independentemente da ordem de Iniciativa. Isso pode ser usado para atacar, fugir ou qualquer outra ação, mesmo que você seja emboscado."
      },
      {
        "cost": 1,
        "name": "Não Vou Te Deixar!",
        "description": "Você é especialista em salvar Aliados em situações extremas. Ao se deparar com um companheiro em perigo iminente, seja ele preso, sangrando, ou em um estado de \"Morrendo\" ou \"Crítico\", você ganha Bônus para se aproximar rapidamente (com Qualquer Teste que o Ajude nisso) e garantir que o Aliado receba os cuidados necessários."
      },
      {
        "cost": 1,
        "name": "Vamos Sair Daqui!",
        "description": "Correr é sua natureza, e você faz isso melhor que ninguém. Você pode \"Correr entre Distâncias\" usando sua Ação Secundária, em vez da Ação Principal."
      },
      {
        "cost": 1,
        "name": "Faça Chuva, Faça Sol",
        "description": "Sempre que estiver sofrendo Condições de Terreno, receba Bônus em todos seus Testes, garantindo sua segurança em qualquer situação."
      },
      {
        "cost": 1,
        "name": "Queda Controlada",
        "description": "Após anos de treino, quedas e rolamentos, seu corpo aprendeu a absorver impactos de forma instintiva. Sempre que você sofrer Ferimento de Queda, reduza automaticamente -4 PF do total recebido."
      }
    ]
  }
}
);
Object.assign(window.ROOTS_DATA.origins,
{
  "Cultivador": {
    "weapon": "Pesadas",
    "skills": [
      "Raízologia",
      "Medicina",
      "Tolerância",
      "Força"
    ],
    "initial": {
      "name": "Sangue De Touro",
      "description": "Quando a vida de um Cultivador está por um fio, a adrenalina toma conta, mantendo-os de pé mesmo quando deveriam cair. Se entrar em Estado de Morrendo, pode se manter funcional e de pé pelo número de rodadas em que normalmente ficaria Incapacitado. Durante esse breve momento, pode agir naturalmente. Mas, se for curado e no mesmo Conflito, entrar em Morrendo novamente, tem uma Morte Direta."
    },
    "powers": [
      {
        "cost": 3,
        "name": "Remédio Natural",
        "description": "Quando em Ambientes Naturais / Selvagens, ache ervas medicinais. Com elas, pode preparar rapidamente uma solução, contanto que a tenha no seu inventário, gastando sua Ação Principal. Essa solução alivia dores de um aliado ferido, reduzindo -3 PF e Removendo / Substituindo Condições de Ferimentos de Corte / Perfuração, ou com as mesmas ervas, podem preparar uma solução que relaxa o cérebro. Aliviando -3 PE."
      },
      {
        "cost": 3,
        "name": "Terreno Familiar",
        "description": "Você teve que moldar e decorar muitas fazendas. Você pode Interagir com o Cenário apenas com sua Ação Secundária."
      },
      {
        "cost": 3,
        "name": "Linha De Resistência",
        "description": "Desde cedo, você aprendeu que, no campo, a diferença entre perder tudo ou proteger o rebanho estava em usar o que tivesse à mão. Você pode erguer uma cobertura improvisada em meio ao caos. Toda cobertura criada começa como Frágil. O tamanho e a resistência dependem do quanto você se dedica: ● Ação Principal: cobertura Pequena e Frágil. ● Ação Principal + Secundária: cobertura Média e Frágil. ● Ação Principal + Secundária + Reação: cobertura Grande e Frágil. ● Todas as Ações no Turno: a cobertura se torna Sólida. Você pode apenas ter uma Cobertura ativa por vez, tendo uma que quebrar para poder fabricar outra."
      },
      {
        "cost": 2,
        "name": "Sintonia Com A Terra",
        "description": "Ao entrar em uma área / cenário, você imediatamente compreende a causa e a intensidade das emoções dominantes, como medo, raiva ou tristeza. Pode fazer até 2 perguntas ao MP sobre o que pode ter ocorrido no local, como: ● \"Qual a Emoção mais forte aqui?\" ● \"Essa tristeza que sinto, vem de qual fonte? Mortes, arrependimentos?\" Esse poder é ativado apenas no primeiro contato com a área / cenário."
      },
      {
        "cost": 2,
        "name": "Não Mexa Com Meu Rebanho",
        "description": "Quando um Aliado Perto estiver prestes a sofrer um Ferimento, você pode sofrer 1 PE para intervir e recebê-lo por ele, o Ferimento que receberá é reduzido em 4 PF."
      },
      {
        "cost": 2,
        "name": "Ferramentas De Trabalho",
        "description": "Quando você está usando Armas Improvisadas, elas têm 2 Usos Extras e você ganha Bônus em todas as Rolagens de Ataque."
      },
      {
        "cost": 1,
        "name": "Vistoria Do Gado",
        "description": "Você sabe identificar sinais de saúde em animais e pessoas pelo jeito de andar, pela pele ou pelos olhos. Você pode perguntar ao MP se alguém ou algum animal que você observa está Ferido, Faminto, Sedento ou Exausto."
      },
      {
        "cost": 1,
        "name": "Mão No Solo",
        "description": "Acostumado a sentir o chão, e o chão a se comunicar com você, percebe vibrações. Encostando a mão na terra, pode perguntar ao MP se há movimento significativo acontecendo na área ao redor (como cavalos correndo, passos de grupo ou máquinas pesadas)."
      },
      {
        "cost": 1,
        "name": "Pomologia",
        "description": "Você entende quando algo da terra está próprio ou estragado. Pode perguntar ao MP se frutas ou plantas diante de você estão seguras para consumo ou se apresentam risco de Contaminação, Doenças, Venenos ou Podridão."
      },
      {
        "cost": 1,
        "name": "Sinais Da Natureza",
        "description": "Desde cedo você aprendeu a ler o céu, o vento e os bichos. Pode perguntar ao MP como será o clima nas próximas horas."
      }
    ]
  },
  "Camaleão": {
    "weapon": "Leves",
    "skills": [
      "Performance",
      "Acrobacia",
      "Persuasão",
      "Intimidação"
    ],
    "initial": {
      "name": "Química Instantânea",
      "description": "Sua habilidade inata de compreender e manipular as emoções humanas faz com que até os mais desconfiados hesitem em duvidar de suas palavras. Uma vez por Cena, quando falar com um PNJ Não Hostil que conhecer pela primeira vez, você pode ativar QUÍMICA INSTANTÂNEA. role 6D6. O MP rola outros 6D6 para o PNJ. Compare os resultados: O número de dados iguais entre vocês determina o nível de conexão inicial e os tipos de favores ou comandos que você pode solicitar.   TABELA DE CONEXÃO: ● 0 dado igual: Ele não sente nada por você (sem mudanças). ● 1 dado igual: O PNJ sente uma leve simpatia por você, mas nada significativo (+1 na Escala de Relacionamento). ● 2 dados iguais: Você pode pedir um pequeno favor (+2 na Escala de Relacionamento). ● 3 dados iguais: Você pode dar uma ordem simples, desde que pareça razoável (+2 na Escala de Relacionamento). ● 4 dados iguais: O PNJ está inclinado a ajudá-lo em algo arriscado, mas não que ameace sua vida ou reputação (+3 na Escala de Relacionamento). ● 5 dados iguais: O PNJ confia em você profundamente e pode se colocar em risco por sua causa (+4 na Escala de Relacionamento). ● 6 dados iguais: O PNJ sente uma conexão quase sobrenatural e está disposto a fazer sacrifícios por você (+5 na Escala de Relacionamento). Onde a confiança e influência podem salvar vidas, ter um Camaleão ao lado pode ser a diferença entre um Aliado ou um Rival."
    },
    "powers": [
      {
        "cost": 3,
        "name": "Charme Letal",
        "description": "Seu carisma envolve a mente do inimigo como correntes invisíveis. Com sua Ação Principal, escolha uma Ameaça Humana. A Ameaça passa a considerar você como sua única prioridade, ignorando Aliados e outros perigos. Enquanto estiver sob o Efeito: ● Ele direciona seus ataques prioritariamente contra você. ● Não pode se afastar voluntariamente de você. ● No fim de cada Turno dele, perde 2 de Espírito. No início de cada um dos seus turnos, gaste sua Ação Secundária para manter o Charme Ativo. Se o Espírito da Ameaça chegar a 0 enquanto estiver sob este efeito, sua mente quebra. Você pode então impor um Comando que ele obedecerá sem hesitação. O comando deve ser algo direto e de execução rápida (ex.: “Renda-se”, “Deite-se”, “Ataque seus aliados”, “Esqueça que eu existo”). O efeito termina imediatamente após o comando ser cumprido, se o pedido for impossível, a Ameaça cairá inconsciente por 1D6 Rodadas."
      },
      {
        "cost": 3,
        "name": "Olhe Nos Meus Olhos",
        "description": "Você pode usar sua Ação Principal para exercer sua presença sobre até uma Ameaça Humana que possa ver seus olhos, fazendo com que ele ganhe a Condição: Atraído por você. Nas rodadas seguintes, se quiser continuar atraindo o Alvo, você gasta sua Ação Principal."
      },
      {
        "cost": 3,
        "name": "Eu, Você E Os Holofotes",
        "description": "Você assume o papel de protagonista e designa quem será seu parceiro de cena. Juntos, brilham no palco e dominam a narrativa. Todo começo de Conflito, escolha um Aliado Perto de você. Até o fim do Conflito, se estiver Perto dele, ganhe os seguintes efeitos: ● VEM PRA CÁ: Com sua Ação Secundária, pode imediatamente puxá-lo para um ponto ao seu lado. ● VOCÊ É MELHOR NISSO: Se desejar, gaste qualquer uma das suas Ações (Principal, Secundária ou Reações) para concedê-las ao seu Aliado, permitindo que ele realize essas Ações extras em seu Turno. ● NÓS CONTRA ELES: Ao atacar Ameaças que seu Aliado atacou no mesmo turno e vice-versa, receba Bônus."
      },
      {
        "cost": 2,
        "name": "Voz Aterrorizante",
        "description": "Você pode emitir ruídos e grunhidos contra uma Ameaça Humana que não saiba da sua presença e possa ouvir sua voz para aplicar a Condição: Aterrorizado."
      },
      {
        "cost": 2,
        "name": "Traje De Cena",
        "description": "Você se veste rapidamente para parecer membro de qualquer grupo que tenha observado por uma Cena. Enquanto vestido, receba 2 Bônus em todos seus testes de Espírito com qualquer participante de tal Grupo."
      },
      {
        "cost": 2,
        "name": "Carta Coringa",
        "description": "Com sua experiência, você sabe que precisa estar sempre pronto para improvisos. Logo, você tem 1 espaço de item adicional no seu Inventário, independente do seu Físico, e começa com 1 item a mais."
      },
      {
        "cost": 1,
        "name": "Mestre Da Fuga",
        "description": "Esse é o truque mais velho do livro. Você pode escapar de Amarras, Cordas ou Algemas sem a necessidade de rolagens, apenas gastando sua Ação Secundária / Cena."
      },
      {
        "cost": 1,
        "name": "Teatro Mudo",
        "description": "Você é capaz de compreender o que uma pessoa está dizendo ao observar os movimentos de sua boca, mesmo que não consiga ouvir o som de sua voz."
      },
      {
        "cost": 1,
        "name": "Eu Sou Você",
        "description": "Você pode imitar perfeitamente a voz de outra pessoa que tenha ouvido por pelo menos um minuto, ganhando Bônus em Testes de Espírito que envolvam aquela voz. Confundindo Ameaças Humanas, criando distrações, ou se infiltrando em situações onde o reconhecimento vocal é necessário."
      },
      {
        "cost": 1,
        "name": "Utilidade Máxima",
        "description": "Escolha um Recurso, com apenas 3/4 dele, já conta como uma Unidade."
      }
    ]
  },
  "Acadêmico": {
    "weapon": "Versáteis",
    "skills": [
      "Condução",
      "Ciências",
      "Exatas",
      "Improvisar"
    ],
    "initial": {
      "name": "A Língua Dos Livros",
      "description": "Você, diferente dos demais, sabe ler, dedicou sua vida a entender a Língua dos Livros. Gaste suas Duas Ações Significativas em Recuperação para \"Estudar\", ganhe 3 PP."
    },
    "powers": [
      {
        "cost": 3,
        "name": "Olhos No Céu",
        "description": "Você possui um drone portátil equipado com uma câmera que construiu durante sua vida. O drone é controlado diretamente por um controle, permitindo a exploração e coleta de informações à distância. O drone pode ser destruído por ataques físicos ou tiros e é vulnerável a condições climáticas adversas, exigindo um Teste de Condução para ser operado em tempo ruim. Enquanto controla o drone, você não pode realizar outras ações. O drone possui uma bateria limitada e pode ser usado até três vezes antes de precisar ser recarregado."
      },
      {
        "cost": 3,
        "name": "Anatomicamente Estudado",
        "description": "Você usa seu conhecimento científico para identificar os pontos fracos de uma Ameaça que possa ver. Gastando sua Ação Principal e Secundária. Você estuda seu Alvo com clareza, descobrindo assim todos seus números de Atributo, que deve ser dito por seu MP. Você escolhe UM Atributo Dele para ser cortado pela metade (arredondado pra cima), até seu próximo Turno. Essa habilidade só pode ser usada uma vez por Alvo."
      },
      {
        "cost": 3,
        "name": "Teoria Do Caos",
        "description": "Você consegue manipular pequenas variáveis para criar grandes mudanças. Ao ativar essa habilidade, você começa a alterar o ambiente de forma sutil, como deixar objetos perto jogados ou gritando frases sem sentido. Você gasta sua Ação Secundária, e no seu próximo Turno, deve usar sua Ação Principal e sua Secundária para se concentrar no caos e garantir que o efeito aconteça. Após essa Rodada, 2 Alvos da sua escolha falham em suas Ações Automaticamente na chegada de seus Turnos, como se o caos estivesse se espalhando ao seu redor. Se receber PF entre as Rodadas, o efeito dissipa e não acontece."
      },
      {
        "cost": 2,
        "name": "Geometria Básica",
        "description": "Você pode substituir a perícia de Mirar pela precisão matemática de Exatas, ainda rodando com Destreza. Ao invés de se concentrar puramente na técnica física de mira, você analisa rapidamente a trajetória do projétil ou do alvo."
      },
      {
        "cost": 2,
        "name": "Eu Vejo Tudo",
        "description": "Sua habilidade de detectar sinais de alerta e ler as intenções das pessoas torna você quase impossível de surpreender. Você pode usar sua Ação Secundária para ler os movimentos de UM Alvo que você possa ver, antecipando o que ele vai fazer no conflito, dando Bônus em Ações dos seus Aliados contra ele até o Turno dele ou Penalidades em Ações dele até o seu Turno. Ou sua Ação Principal para ler até DOIS Alvos. Você não pode ler os mesmos Alvos duas vezes."
      },
      {
        "cost": 2,
        "name": "Aprendizado Rápido",
        "description": "Se você já viu um Aliado realizar um teste com uma determinada perícia, você pode usar essa perícia nos seus próprios testes, como se tivesse aprendido a técnica observando-o. Você só pode usar essa perícia UMA vez. Após usar a perícia uma vez, você não consegue mais replicá-la até que tenha uma nova oportunidade de observar um Aliado utilizando-a de forma eficaz."
      },
      {
        "cost": 1,
        "name": "Lowel.Exe",
        "description": "LOWEL.EXE é um programa que você desenvolveu em meio ao caos do apocalipse. Criado a partir de fragmentos de códigos antigos e adaptado para as redes e dispositivos decadentes que restaram. Você tem Bônus em todas suas rolagens de Mecânica ao lidar com tecnologia."
      },
      {
        "cost": 1,
        "name": "Eu Não Conheço Esse Cheiro",
        "description": "Você pode perceber cheiros estranhos, sejam de sangue, monstros ou venenos."
      },
      {
        "cost": 1,
        "name": "Instinto De Diógenes",
        "description": "Uma vez por Cena, pode vasculhar um cenário para encontrar um item específico dentro de três categorias: Itens (como corda, binóculos ou apito), Armas (para partes, improvisadas) e Recursos (sucata, álcool ou pano). Sem necessidade de testes, o MP informa se a categoria de itens desejada está presente, refletindo a atenção obsessiva a suprimentos e sua habilidade em antecipar o que precisará em emergências."
      },
      {
        "cost": 1,
        "name": "Insônia Construtiva",
        "description": "Você sempre dormiu pouco, quem tinha que estudar, não tinha tempo de dormir. Precisa dormir apenas 4 Cenas para que sua necessidade de sono seja completa."
      }
    ]
  },
  "Curandeiro": {
    "weapon": "Leves",
    "skills": [
      "Determinação",
      "Medicina",
      "Cautela",
      "Coragem"
    ],
    "initial": {
      "name": "Cura Inevitável",
      "description": "Curandeiros dedicam suas vidas ao aprendizado sobre o corpo humano, treinando incansavelmente para salvar vidas e aliviar o sofrimento. Os Curandeiros sempre têm seus NS's para testes de Medicina reduzidos em um Nível. Além disso, sempre que realizar um teste de Medicina bem-sucedido ao curar alguém, ganhe Bônus acumulativo para o próximo teste de Medicina. Caso você sofra PF, o Bônus será perdido."
    },
    "powers": [
      {
        "cost": 3,
        "name": "Divinas Sejam Minhas Mãos",
        "description": "Curas bem-sucedidas realizadas por você reduz -2 PF Adicionais, refletindo a precisão e o cuidado que tem para tratar ferimentos ou doenças."
      },
      {
        "cost": 3,
        "name": "Caso X, Solução Y",
        "description": "Com tantos pacientes e casos diferentes, você sabe o que alguém tem só de bater o olho, você gasta sua Ação Secundária, mas seus Diagnósticos sempre tem sucesso automaticamente."
      },
      {
        "cost": 3,
        "name": "Confie Em Mim",
        "description": "Uma vez por Cena, usando palavras ou técnicas de apoio psicológico, você pode conceder -3 PE ou Remover uma Condição Mental para um Aliado que possa ouvir sua Voz. Essa habilidade pode ser usada uma vez por Aliado por Ciclo."
      },
      {
        "cost": 2,
        "name": "Bem Para O Mundo",
        "description": "O Cirurgião dedica sua vida a salvar os outros, guiado por um amor pela humanidade e um desejo de salvar vidas. Ao curar, reduz seu próprio Estresse em 2 PE's."
      },
      {
        "cost": 2,
        "name": "Isso Não Vai Me Matar",
        "description": "Cético sobre feridas depois de tanto estudar sobre elas, você não recebe PE's por Ataques recebidos de qualquer tipo. Além disso, reduza-os em -1 PF, por saber como relaxar os músculos para receber tal Ataque."
      },
      {
        "cost": 2,
        "name": "Você Não Vai Morrer!",
        "description": "Sua habilidade cirúrgica é incomparável. Uma vez por Cena/Conflito, se no seu inventário você possuir um Kit de Primeiros Socorros, você pode estabilizar um Aliado que estiver em Estado de Morrendo imediatamente sem rolagens, fazendo-o recuperar 3 PF e Removendo/Substituindo Condições, impedindo que ele morra. Seu Kit Médico é gasto independente de quantas cargas tiver."
      },
      {
        "cost": 1,
        "name": "Olfato Clínico",
        "description": "Você desenvolveu um faro apurado para identificar substâncias e contaminações. Você pode perceber venenos, remédios adulterados, ou a presença de doenças e até contaminações das raízes em um indivíduo apenas pelo cheiro."
      },
      {
        "cost": 1,
        "name": "Corte Preciso",
        "description": "Ataques usando Armas Brancas nas Pernas, a Ameaça não recebe Bônus para se esquivar."
      },
      {
        "cost": 1,
        "name": "Manual Da Mente",
        "description": "Sua capacidade de compreender a psique humana e manipular as emoções ao redor é afiada. Uma vez por Cena você pode saber o que um PNJ que você possa ver claramente está pensando / sentindo."
      },
      {
        "cost": 1,
        "name": "Luvas De Bismuto",
        "description": "Equipado com Luvas de Bismuto, você consegue manipular objetos e substâncias corrompidas sem sofrer os efeitos da corrupção por toque. Essas luvas podem ser passadas para outros Sobreviventes ou até roubadas por Ameaças."
      }
    ]
  }
}
);
