# Análise de automação — Roots of the Abyss

Fonte de regras: `ROOTS OF THE ABYSS_compressed.pdf` (443 páginas).

## Estado dos seis itens principais

1. **Bugs de regras:** corrigidos e preservados na nova estrutura.
2. **Origem/Ocupação:** 16 Origens e 13 Ocupações disponíveis. Restrições e bônus objetivos foram automatizados quando não dependem de decisão narrativa.
3. **Abas:** quatro páginas — Ficha Principal, Equipamentos, História & Anotações e Origem & Corrupção. Na impressão, todas aparecem, mesmo que só uma esteja ativa na tela.
4. **Equipamentos:** inventário `2 + Físico`, sobrecarga, espaços exclusivos de arma, 29 armas de referência, durabilidade/munição, 36 modificações, 4 armaduras, Partes, 6 Recursos e 13 Receitas.
5. **Flores/Poderes:** 16 listas de Poderes de Origem, orçamento de 7 PO (9 para Herdeiro), Poder Inicial gratuito e as **12 Flores oficiais**, cada uma com 5 estágios sincronizados ao PC. Sangue Velho usa o Filtro Corruptivo.
6. **Rolador:** Atributo define a quantidade de D6; Perícia define o resultado necessário em cada dado. Bônus, Penalidades, Aposta de Estresse, teste com zero dados, Dado da Praga, sucessos e NS estão integrados.

## Revisão Alpha — feedback do TK (Criador da ficha)

Os onze pontos da revisão foram aplicados sem reconstruir a ficha:

1. **Rolador:** Bônus e Penalidades agora usam marcadores clicáveis de 0 a 3, com seleção visível e botão para zerar. O Sensor da Pulseira não aparece no rolador.
2. **Poderes:** os Poderes de Ocupação e os três Poderes de cada uma das 29 armas oficiais mostram nome e descrição.
3. **Armas e Inventário:** uma arma nova ocupa um espaço compatível vazio; se os espaços estiverem ocupados, vai ao Inventário. É possível transferir nos dois sentidos sem copiar nem perder estado, modificações, durabilidade ou munição. Armas em zero recebem o estado visual **QUEBRADA**.
4. **PC:** há controles visíveis para aumentar e diminuir, ambos limitados ao intervalo de 0 a 100 e ligados à Disseminação, Flores e Filtro.
5. **Estados:** Instável e Ferido usam alerta amarelo; Crítico, Morrendo, Enlouquecendo e Morte Direta usam alerta crítico. Verde fica restrito aos estados saudáveis/positivos.
6. **Paradigma:** o cabeçalho mostra apenas Paradigma. Ponto de Partida e Grupo/Estrada foram movidos para História, mantendo os mesmos identificadores para carregar fichas antigas.
7. **PF/PE:** Sangue Velho usa 20 PF/15 PE e Sangue Novo usa 15 PF/20 PE. Morrendo foi preservado; Morte Direta gera aviso imediato. Enlouquecendo ocorre em 16+ PE para Sangue Velho e 21+ PE para Sangue Novo.
8. **Ferimentos:** o seletor do mapa corporal contém somente Corte, Impacto e Perfuração. Explosão, Fogo, Veneno, Corrosão e Clima continuam disponíveis nas regras e Condições ambientais.
9. **Disseminação:** os efeitos mecânicos negativos aparecem separados por nível, com o estágio atual em destaque.
10. **Filtro Corruptivo:** modos têm nomes e ajuda explícitos, seleção ativa visível e limpeza da seleção. Sangue Velho pode registrar até três efeitos anulados por nível; as escolhas ficam marcadas e podem ser limpas com confirmação.
11. **Sobrevivência e vínculos:** Descanso & Recuperação foi removido. A Ficha Principal agora registra Fome, Sede e Sono com todos os estágios do livro; História & Anotações registra Relacionamentos de −5 a +5 por PNJ.

O catálogo do livro foi auditado nas páginas 135–155: as **29 armas oficiais já estavam presentes**, portanto nenhuma arma inventada ou duplicada foi adicionada.

## Correções importantes encontradas no livro

- O livro possui **12 Flores**, não 5: Orquídea, Crisântemo, Dália, Íris, Begônia, Jasmim, Jarro-Titã, Hibisco, Camomila, Rosa, Girassol e Dente-de-Leão.
- Os dois espaços normais de arma são exclusivos: um para Arma Branca e outro para Fogo/Disparo. Arsenalista recebe um terceiro espaço livre.
- O inventário comporta `2 + Físico`; cada item excedente impõe perda de 1 PA em Físico ou Destreza, decidida pelo MP.
- Os 7 PO da Origem devem ser totalmente gastos. Herdeiro recebe +2 PO.
- O Dado da Praga é separado da parada normal. Em “Ela Joga Comigo”, ele só vira sucesso adicional quando é rolado **contra** o Devoto.
- A ficha usa “Justo” entre os Paradigmas Sublimes. O livro tem um exemplo divergente em outra passagem, tratado como inconsistência editorial.

## Automações adicionais incluídas

- Salvamento local automático, migração da ficha anterior, backup e restauração em JSON.
- PF/PE por tipo de Sangue, PF/PE permanentes, Morrendo e Morte Direta.
- Vários Ferimentos podem coexistir na mesma região; o corpo mostra a maior gravidade, enquanto o relatório preserva todos. Armadura reduz PF e perde Integridade.
- Condições ativas separadas em Mentais, Físicas, Tratadas, Doenças, Terreno e Ambiente, com duração e resumo de efeito.
- Fome, Sede e Sono usam as progressões completas de dias sem atender a necessidade e avisam sobre Exaustão/Inconsciência ao combinar privações.
- Relacionamentos individuais usam a escala completa de −5 (Ameaça) a +5 (Irmão), com nome e efeito de cada nível.
- Fraqueza Absoluta bloqueia suas Perícias; Perícia de Origem bloqueada devolve +3 PP.
- Estudioso recebe +4 PP e +1 PP por etapa de Crescimento; Herdeiro recebe PA/PO; Preparado, Arsenalista, Prodígio, Masoquista, Abutre, Espectro, Verdugo e Devoto possuem suas partes objetivas automatizadas.
- Prodígio escolhe as duas Perícias de Dom Superior; Abutre escolhe o Recurso de Acumulador; Masoquista reduz PE ao sofrer PF.
- Receitas consomem unidades completas de Recursos. Flecha Explosiva consome Flecha, Flecha produz duas munições e Conserto restaura uma arma danificada.

## O que ainda pode ser evoluído

Estes itens não impedem o uso da ficha atual. São expansões futuras:

1. **Trilha de Crescimento completa:** hoje a etapa e um resumo são registrados; faltam as recompensas específicas dos quatro Arquétipos em cada etapa.
2. **Poderes narrativos:** muitos Poderes de Origem, Ocupação, Flores e Armas dependem de alvo, Cena, Ciclo, sessão ou decisão do MP. Podem ganhar marcadores de “usado”, mas não devem aplicar efeitos automaticamente sem contexto.
3. **Combate:** iniciativa, Ações/Reações, distâncias, coberturas, Vigílias, recuo e efeitos especiais de arma podem virar um painel opcional.
4. **Reputação por comunidade:** Relacionamentos por PNJ já estão estruturados; ainda pode ser criada uma trilha independente de Reputação para cada região ou facção.
5. **Ciclos:** um botão opcional de nova Cena/Ciclo/sessão ainda poderia avançar necessidades, limpar bônus temporários e renovar poderes usados.
6. **Checklist de criação:** uma validação final poderia avisar PO restantes, PP/PA não gastos, itens iniciais excedentes, Receita faltante e escolhas de Ocupação ainda vazias.

## Recomendação de arquitetura

Por enquanto, **não recomendo separar Origem e Corrupção em duas abas**. As duas áreas compartilham PC, tipo de Sangue, Flores, Filtro e Poderes; mantê-las juntas reduz navegação e deixa as dependências visíveis. A divisão só passa a valer a pena se a futura Trilha de Crescimento completa ou marcadores de Poderes fizerem a página ficar longa demais no celular. Nesse momento, a melhor divisão seria `Origem & Crescimento` e `Corrupção & Flores`, preservando uma visão resumida de PC nas duas.

## Páginas principais consultadas

- Sangue e Ocupações: 47–52.
- Origens e Poderes: 53–94.
- Inventário e espaços de arma: 116 em diante.
- Catálogo e Poderes de Arma: 135–155.
- Condições, categorias e durações: 211–223.
- Fome, Sede, Sono, Exaustão e Inconsciência: 234–237.
- Relacionamentos e Reputação: 277–278.
- Disseminação e efeitos negativos: 293–297.
- Filtro Corruptivo: 300–301.
- Flores da Corrupção: 303–314.
