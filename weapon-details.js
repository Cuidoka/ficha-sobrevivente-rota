(function(){
  'use strict';

  var details = {
    "canivete": {"specials": [
      {"name":"Rio de Sangue","description":"Ao gastar sua Ação Principal, Ação Secundária e uma Reação, desencadeie três ataques rápidos: um Ferimento Leve de Corte no Tronco e dois Ferimentos Leves em áreas aleatórias."},
      {"name":"Perfuração de Escudo","description":"Quando estiver com um Alvo em Escudo Humano, ataque-o com um Acerto Inevitável no seu Turno."},
      {"name":"Abertura Facilitada","description":"Se Sacar e Atacar no mesmo Turno, o primeiro ataque recebe Bônus."}
    ]},
    "martelo": {"specials": [
      {"name":"Ricochete","description":"Após um ataque bem-sucedido, gaste sua Ação Secundária para transferir a força do impacto e atacar outro Alvo Em Contato no mesmo Turno."},
      {"name":"Cai pro Chão","description":"Gaste a Ação Principal e uma Reação para atacar com a parte traseira. Ao acertar, cause Perfuração Moderada e aplique Caído."},
      {"name":"Acerto de Reverso","description":"Após errar um ataque, tente acertar novamente com a parte traseira do Martelo, sofrendo Penalidade."}
    ]},
    "faca": {"specials": [
      {"name":"Tendão de Aquiles","description":"Ao acertar as Pernas, gaste uma Reação para cortar o calcanhar do Alvo e aplicar Caído."},
      {"name":"Corte na Jugular","description":"Ao acertar um Alvo que não saiba de sua presença, ataque uma segunda vez, ainda como Acerto Inevitável."},
      {"name":"Veias Principais","description":"Ao atingir os Braços, gaste uma Reação para forçar a Ameaça a soltar imediatamente o Item ou Arma que segura."}
    ]},
    "serrote": {"specials": [
      {"name":"Eu Vou te Rasgar","description":"Ao causar Ferimento Moderado ou Grave, gaste a Ação Secundária para continuar serrando diante de um Alvo Humano e aplicar Pânico."},
      {"name":"Dentes Enferrujados","description":"Ao acertar o mesmo Ponto Vital duas vezes, aplique Infecção e Tétano."},
      {"name":"Olhe Para Mim","description":"Após matar uma Ameaça, gaste a Ação Secundária para exibir sua cabeça. Ameaças Humanas que vejam e tenham Espírito menor que 3 recebem Aterrorizado."}
    ]},
    "chicote": {"specials": [
      {"name":"Vem Pra Cá","description":"Ao atingir um Alvo, gaste uma Reação para arrastá-lo até ficar Em Contato."},
      {"name":"Controle Ambiental","description":"Interaja com objetos e mecanismos dentro da Distância de Eficácia, puxando, abrindo passagens ou criando obstáculos."},
      {"name":"Alcance Estendido","description":"Gaste uma Reação para estender a Distância de Eficácia até Perto durante a Ação ou Ataque atual."}
    ]},
    "corrente": {"specials": [
      {"name":"Mordida de Metal","description":"Ao Aparar com sucesso, enrosque a Corrente na arma. No seu Turno, gaste a Ação Secundária para quebrar uma arma Leve/Versátil ou arrancar uma Pesada."},
      {"name":"Manobra de Estrangulamento","description":"Ao acertar a Cabeça, gaste a Ação Secundária para puxar o Alvo e colocá-lo em Agarrão Silencioso."},
      {"name":"Cobra de Ferro","description":"Realize Manobras de Combate baseadas em Briga usando Armas Brancas e a Distância de Eficácia da Corrente."}
    ]},
    "leque": {"specials": [
      {"name":"Corta-Luz","description":"Gaste a Ação Principal para ocultar os movimentos de um Aliado atrás de você; o próximo Ataque dele recebe Bônus."},
      {"name":"Parede de Metal","description":"Ao Defender, bloqueie totalmente um golpe corpo a corpo e perca 1 de Durabilidade. Ataques seguintes seguem as regras normais."},
      {"name":"Manchado de Sangue","description":"Após causar Perfuração, gaste a Ação Secundária para ativar o estado: Corta-Luz concede 2 Bônus e Parede de Metal bloqueia até 2 ataques. O estado termina após usar uma das melhorias."}
    ]},
    "taco": {"specials": [
      {"name":"Home Run","description":"Ao acertar diretamente a Cabeça, cause +3 PF."},
      {"name":"Fratura","description":"Ao acertar o mesmo Ponto Vital duas vezes, ele fica Fraturado. O próximo acerto seu ou de um Aliado nesse ponto dobra os PF."},
      {"name":"Bola Curva","description":"Gaste a Ação Principal para rebater um objeto solto contra uma Ameaça até Afastado, usando Mirar ou Armas Brancas. Ao acertar, cause Ferimento Moderado."}
    ]},
    "katana": {"specials": [
      {"name":"Iaijutsu","description":"Na primeira vez em um Conflito que Sacar a Katana contra um Alvo Em Contato, faça um Acerto Inevitável de Corte enquanto a saca."},
      {"name":"Espírito Vingativo","description":"Contra um Alvo que o acertou na Rodada atual ou anterior, receba Bônus e cause apenas Ferimentos Graves. O efeito termina após acertá-lo."},
      {"name":"Passo Ágil","description":"Após um Ataque, acertando ou não, mova-se 3 metros."}
    ]},
    "arco": {"specials": [
      {"name":"Marca de Caça","description":"Gaste a Ação Principal para marcar um Alvo visível até o fim do Conflito. Seus Ferimentos contra ele sobem um grau. Ao morrer ou fugir, transfira a Marca com uma Reação."},
      {"name":"Ego do Predador","description":"Quando um Alvo Marcado morrer, recupere 2 PF ou 2 PE. Se fugir ou sobreviver ao Conflito, sofra +2 PE."},
      {"name":"Achei Você","description":"Gaste a Ação Secundária para saber exatamente onde está sua Marca e o que ela faz ou pretende fazer no momento."}
    ]},
    "machadinha": {"specials": [
      {"name":"Você Não Vai Fugir","description":"Gaste a Ação Principal para arremessar a Machadinha. Ao acertar, gaste uma Reação para correr até ficar Em Contato com o Alvo."},
      {"name":"Matar ou Morrer","description":"Enquanto estiver em Estado Crítico, ataques com a Machadinha causam +3 PF."},
      {"name":"Enterrado na Carne","description":"Ao causar Ferimento Grave, deixe a Machadinha presa. Gaste a Ação Secundária para acertar Briga no Tronco sem rolagem e uma Reação para retirá-la."}
    ]},
    "besta": {"specials": [
      {"name":"Disparo das Sombras","description":"Ao disparar contra um Alvo que não saiba de sua presença, receba Bônus no Ataque."},
      {"name":"Ponto Vital","description":"Contra um Alvo que não saiba de sua presença, reduza em 1 o NS do Acerto Inevitável."},
      {"name":"Prego no Caixão","description":"Contra um Alvo em Estado Crítico, o disparo causa +4 PF."}
    ]},
    "dardo-corda": {"specials": [
      {"name":"Dança da Lâmina","description":"Gaste a Ação Secundária para causar +2 PF com a arma até o fim do Turno. Gaste também uma Reação para dobrar esse bônus, que se perde se não atacar no Turno."},
      {"name":"Furacão Defensivo","description":"Gaste a Ação Principal e uma Reação para criar uma barreira. O primeiro Alvo que entrar no alcance sofre Acerto Inevitável e encerra o efeito. Sofrer PF também o encerra; mantenha nas Rodadas seguintes com a Ação Principal."},
      {"name":"Performance Mortal","description":"Ao ativar Dança da Lâmina e Furacão Defensivo na mesma Rodada, o ataque do Furacão recebe o bônus da Dança e seu próximo ataque na Rodada seguinte dobra os PF."}
    ]},
    "soco-ingles": {"specials": [
      {"name":"Habilidade Transferida","description":"Você pode atacar usando Físico e Briga em vez de Armas Brancas."},
      {"name":"Peek-A-Boo","description":"Gaste a Ação Principal para entrar em Postura Defensiva. Ao Esquivar com sucesso, ative Contra-Ataque."},
      {"name":"Contra-Ataque","description":"Ao Esquivar com sucesso, use Jab (eleva o próximo Contra-Ataque a Moderado), Direto (Leve em Ponto Vital escolhido), Cruzado (Exaustão e Irritação temporária) ou Gancho (Surdo e Atordoado). Para uma segunda opção, gaste uma Reação."}
    ]},
    "machado": {"specials": [
      {"name":"Cortando Árvores","description":"Contra Seres Enraizados, cause PF dobrados."},
      {"name":"Carne Fraca","description":"Ao acertar os mesmos Braços ou Pernas três vezes com o Machado, cause Desmembramento."},
      {"name":"360°","description":"Gaste a Ação Principal e a Secundária para atingir todos, Aliados ou Ameaças, Em Contato, causando Ferimento Moderado em área aleatória. Perca apenas 1 Durabilidade."}
    ]},
    "lanca": {"specials": [
      {"name":"Furo Veloz","description":"Gaste a Ação Principal e a Secundária para fazer dois Ataques no mesmo Turno, que podem atingir Pontos Vitais diferentes."},
      {"name":"Arremesso Preciso","description":"Arremesse a Lança até Afastado. Ao acertar, o Alvo fica Preso, empalado pela arma."},
      {"name":"Transpassada","description":"Ao causar Ferimento Grave, um segundo Alvo diretamente atrás sofre Ferimento Moderado do mesmo ataque."}
    ]},
    "marreta": {"specials": [
      {"name":"Onda de Choque","description":"Gaste a Ação Principal e a Secundária e perca 1 Durabilidade para aplicar Caído a todos, Aliados ou Ameaças, em alcance Próximo."},
      {"name":"Impacto Doloroso","description":"Gaste a Ação Principal e a Secundária; se o próximo impacto acertar, o Alvo perde sua Ação Principal."},
      {"name":"Grand Slam","description":"Ao causar Ferimento Grave, arremesse o Alvo 5 metros para a esquerda, frente ou direita."}
    ]},
    "foice": {"specials": [
      {"name":"Colheita","description":"Cada morte concede 1 Acúmulo, até 3. Gaste-os para ataques extras no mesmo Turno sem perder Durabilidade. Acúmulos restantes somem ao fim do Conflito."},
      {"name":"Faro de Morte","description":"Gaste uma Reação para o MP indicar a direção da Ameaça com mais PF até Afastado. Ao mover-se até ela, ignore Terreno Difícil."},
      {"name":"Sentença de Morte","description":"Gaste 3 Acúmulos, a Ação Principal, a Secundária e duas Reações contra um Alvo Em Contato. Se ele tiver 15 PF ou menos, morre sem rolagem; caso contrário, perca ataque e Acúmulos."}
    ]},
    "tridente": {"specials": [
      {"name":"Cravada no Chão","description":"Contra um Alvo Caído, cause PF dobrado."},
      {"name":"Jogo de Corpo","description":"Ao acertar o Tronco, gaste uma Reação para arrastar o Alvo 2 metros à sua frente enquanto se move. Contra obstáculo ele fica Preso; você pode soltá-lo e empurrá-lo 3 metros."},
      {"name":"Dividido por 3","description":"Ferimentos causam +3 PF. Ao Aparar com sucesso, divida pela metade a Durabilidade da arma agressora."}
    ]},
    "cajado": {"specials": [
      {"name":"Extensão dos Braços","description":"Realize Manobras de Combate baseadas em Força usando Armas Brancas e a Distância de Eficácia do Cajado."},
      {"name":"Muleta Improvisada","description":"Enquanto estiver com o Cajado nas mãos, ignore Condições de Terreno."},
      {"name":"Posturas de Guerra","description":"Gaste a Ação Secundária para adotar uma postura: Fera dá Bônus em Armas Brancas, Serpente em Esquiva e Rocha em Tolerância. Troque depois com uma Ação Principal."}
    ]},
    "motosserra": {"specials": [
      {"name":"Lenta e Barulhenta","description":"Ligar exige Ação Principal e produz som audível até Distante, depois até Longe por Rodada. Desliga ao fim do Conflito."},
      {"name":"Sobrecarga","description":"Ao ligar, recarregar ou causar Ferimento Grave, ative no próximo Turno: atacar enquanto Corre Entre Distâncias, causar +4 PF no Tronco com a Secundária ou aplicar Pânico com a Secundária."},
      {"name":"Mutilação","description":"Gaste a Ação Principal, a Secundária e duas Reações; ao causar Ferimento Grave em Braços ou Pernas, aplique Desmembramento."}
    ]},
    "pistola": {"specials": [
      {"name":"Altamente Customizável","description":"A Pistola pode receber 4 modificações em vez de 2."},
      {"name":"Cobertura Humana","description":"Enquanto mantiver um Alvo como Escudo Humano, você ainda pode Atirar no seu Turno."},
      {"name":"Gunfu","description":"Ao acertar um Alvo até Perto, gaste a Ação Secundária para fazer uma Manobra de Combate logo em seguida."}
    ]},
    "revolver": {"specials": [
      {"name":"Contagem de Seis","description":"Gaste as Ações Principal e Secundária para marcar até 2 Alvos visíveis até Afastado; em Turnos seguintes, mantenha com a Principal e adicione marcas até o limite do tambor. Gaste uma Reação para encerrar e faça um único teste de Mirar: os sucessos determinam quantos Alvos marcados são atingidos. Não é possível segurar o Recuo."},
      {"name":"Bala Marcada","description":"Ao recarregar, escolha secretamente uma das 4 balas e um Alvo. Se essa bala específica acertá-lo, o Ferimento dobra. Errar ou gastá-la em outro disparo encerra o efeito; apenas uma pode estar ativa."},
      {"name":"Coronhada Afiada","description":"Contra um Alvo Em Contato, gaste a Ação Secundária e use Mirar ou Briga para causar Ferimento Moderado de Impacto."}
    ]},
    "escopeta": {"specials": [
      {"name":"Dispersão","description":"Ao atirar em um Alvo, todos Em Contato com ele recebem metade dos PF, sejam Aliados ou não."},
      {"name":"Fogo Destruidor","description":"Seus disparos destroem Coberturas Frágeis. Quem estiver atrás sofre um Ferimento uma categoria abaixo do causado à Cobertura."},
      {"name":"Flash na Boca","description":"Ao atirar contra um Alvo Em Contato, acertando ou não, aplique Desorientado."}
    ]},
    "fuzil-assalto": {"specials": [
      {"name":"Vigília Aprimorada","description":"Ao ativar Vigília, atire até duas vezes em Alvos diferentes, gastando as Reações correspondentes."},
      {"name":"Respingo de Sangue","description":"Ao matar um Alvo, escolha outro Humano consciente até Afastado do corpo. Se ele tiver Espírito menor que 3, aplique Paralisado."},
      {"name":"Controle Total","description":"Ao segurar o Recuo do Fuzil de Assalto, o próximo teste de Recuo é sucesso automático."}
    ]},
    "submetralhadora": {"specials": [
      {"name":"Rajada Incontrolável","description":"Cada Ataque consome 2 balas em um único teste. As duas acertam ou erram juntas; ao acertar, atingem Pontos Vitais aleatórios diferentes e causam Ferimentos Moderados."},
      {"name":"Tiro pra Todo Lado","description":"Gaste as Ações Principal e Secundária e 4 balas. Role 4D6; até 4 Alvos no cone rolam 1D6 e são atingidos quando igualam um dos seus resultados. Você falha automaticamente no Recuo."},
      {"name":"Saque Tático","description":"Saque a Submetralhadora usando uma Reação."}
    ]},
    "fuzil-precisao": {"specials": [
      {"name":"De Qualquer Lugar","description":"Gaste a Ação Secundária mirando antes de disparar para ignorar 1 Penalidade de Distância no próximo tiro. Não cumulativo."},
      {"name":"Mira Paciente","description":"Use a Ação Principal para Mirar. Após dois Turnos consecutivos Mirando sem atirar, dobre os PF do disparo."},
      {"name":"Tripé","description":"Enquanto estiver atrás de Cobertura, o Recuo diminui para Gangrenado."}
    ]},
    "lanca-chamas": {"specials": [
      {"name":"Mais Perto, Mais Fogo","description":"Causa 7 PF em Afastado e +1 PF por categoria mais próxima, até Próximo."},
      {"name":"Chamas em Tudo","description":"Todo ataque bem-sucedido aplica Em Chamas."},
      {"name":"Parede de Fogo","description":"Gaste as Ações Principal e Secundária para criar uma parede de 5 metros. Quem atravessar recebe Em Chamas. Dura até o início do seu próximo Turno."}
    ]},
    "lanca-granadas": {"specials": [
      {"name":"Bomba de Todo Tipo","description":"Use Explosivos fabricados como munição e lance-os dentro da Distância de Eficácia."},
      {"name":"Tiro Instável","description":"Sempre teste Recuo ao atirar. Em falha, role 1D6: com 1 a carga explode em suas mãos e causa metade dos PF ou efeitos; com 2–6, o tiro ocorre normalmente."},
      {"name":"Força de Impacto","description":"Toda carga disparada tem sua Distância de Eficácia elevada para Perto ou mantém uma distância maior que já possua."}
    ]}
  };

  if(!window.ROOTS_DATA) return;
  window.ROOTS_DATA.weapons.forEach(function(weapon){
    if(details[weapon.id]) weapon.specials = details[weapon.id].specials;
  });
})();
