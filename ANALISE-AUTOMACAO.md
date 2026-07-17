# Análise de automação — Roots of the Abyss

Fonte de regras: `ROOTS OF THE ABYSS_compressed.pdf` (443 páginas).

## Estado dos seis itens principais

1. **Bugs de regras:** corrigidos e preservados na nova estrutura.
2. **Origem/Ocupação:** 16 Origens e 13 Ocupações disponíveis. Restrições e bônus objetivos foram automatizados quando não dependem de decisão narrativa.
3. **Abas:** quatro páginas — Ficha Principal, Equipamentos, História & Anotações e Origem & Corrupção. Na impressão, todas aparecem, mesmo que só uma esteja ativa na tela.
4. **Equipamentos:** inventário `2 + Físico`, sobrecarga, espaços exclusivos de arma, 29 armas de referência, durabilidade/munição, 36 modificações, 4 armaduras, Partes, 6 Recursos e 13 Receitas.
5. **Flores/Poderes:** 16 listas de Poderes de Origem, orçamento de 7 PO (9 para Herdeiro), Poder Inicial gratuito e as **12 Flores oficiais**, cada uma com 5 estágios sincronizados ao PC. Sangue Velho usa o Filtro Corruptivo.
6. **Rolador:** Atributo define a quantidade de D6; Perícia define o resultado necessário em cada dado. Bônus, Penalidades, Aposta de Estresse, teste com zero dados, Dado da Praga, sucessos e NS estão integrados.

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
- Ferimentos por região, tipo e gravidade; cálculo de PF e aplicação de Condição; Armadura reduz PF e perde Integridade.
- Condições ativas, Dores, Vantagens, Desvantagens, Cicatrizes, História e cadernos de anotações.
- Fraqueza Absoluta bloqueia suas Perícias; Perícia de Origem bloqueada devolve +3 PP.
- Estudioso recebe +4 PP e +1 PP por etapa de Crescimento; Herdeiro recebe PA/PO; Preparado, Arsenalista, Prodígio, Masoquista, Abutre, Espectro, Verdugo e Devoto possuem suas partes objetivas automatizadas.
- Prodígio escolhe as duas Perícias de Dom Superior; Abutre escolhe o Recurso de Acumulador; Masoquista reduz PE ao sofrer PF.
- Receitas consomem unidades completas de Recursos. Flecha Explosiva consome Flecha, Flecha produz duas munições e Conserto restaura uma arma danificada.

## O que ainda pode ser evoluído

Estes itens não impedem o uso da ficha atual. São expansões futuras:

1. **Trilha de Crescimento completa:** hoje a etapa e um resumo são registrados; faltam as recompensas específicas dos quatro Arquétipos em cada etapa.
2. **Poderes narrativos:** muitos Poderes de Origem, Ocupação, Flores e Armas dependem de alvo, Cena, Ciclo, sessão ou decisão do MP. Podem ganhar marcadores de “usado”, mas não devem aplicar efeitos automaticamente sem contexto.
3. **Combate:** iniciativa, Ações/Reações, distâncias, coberturas, Vigílias, recuo e efeitos especiais de arma podem virar um painel opcional.
4. **Reputação e Relacionamentos:** faltam trilhas estruturadas por comunidade/PNJ; hoje o Paradigma é registrado e as restrições de Espectro/Verdugo são aplicadas.
5. **Ciclos e recuperação:** um botão de nova Cena/Ciclo/sessão poderia limpar bônus temporários, renovar poderes e executar recuperação guiada.
6. **Checklist de criação:** uma validação final poderia avisar PO restantes, PP/PA não gastos, itens iniciais excedentes, Receita faltante e escolhas de Ocupação ainda vazias.

## Páginas principais consultadas

- Sangue e Ocupações: 47–52.
- Origens e Poderes: 53–94.
- Inventário e espaços de arma: 116 em diante.
- Flores da Corrupção: 303–314.

