# Correções da ficha ROTA — orientações consolidadas

Data: 07/09/2026.

Estado: etapas 1 a 5 implementadas e verificadas. Etapa 5 concluída em 08/09/2026. Etapa 6 pendente.

Fonte: mensagens e prints enviados nesta conversa, incluindo o feedback de T.K. de 29/08/2026 e o relato de uso de Moira. O usuário encerrou os envios com “Esta tudo pronto agora” e pediu a organização das correções em sequência.

## Objetivo e critérios gerais

Melhorar a primeira página, sua organização e legibilidade, mantendo a identidade visual aprovada e as funcionalidades existentes. Priorizar a interface; revisar textos e balanceamento do livro em uma etapa posterior.

- As cores desenhadas nos prints indicam grupos de informação, não uma nova paleta para o site.
- Preservar a estética de papel, carvão, bronze e detalhes coloridos por atributo.
- Preservar o rolador, os marcadores com brilho, a seleção de perícias por atributo e as transições suaves, sem introduzir borrões.
- Manter salvamento local, restauração de fichas, impressão, cálculos e navegação funcionando.
- Trabalhar em etapas verificáveis. A retirada da faixa decorativa e o reagrupamento dos painéis devem vir antes do ajuste final de fontes e imagens.
- Buscar uma visão principal completa no desktop, sem cortar informações para forçar tudo a caber. Em telas menores, adaptar a organização e permitir a rolagem necessária.

## Sequência de execução

### 1. Reorganizar a página e a navegação

- [x] Trocar o nome da aba “Player” para “Sobrevivente”.
- [x] Remover a faixa decorativa lateral marcada em verde, liberando sua largura para o conteúdo.
- [x] Manter a marca ROTA no cabeçalho, no local marcado em rosa. O projeto já contém um emblema; uma logo diferente só será aplicada se houver o arquivo correspondente.
- [x] Reunir Identificação e Características em um painel contínuo de papel, estendendo a textura até o fim desse painel na composição da página.
- [x] Manter Atributos e Perícias juntos.
- [x] Manter as barras e Necessidades próximas, com Ferimentos/PF também próximo do mapa corporal e das condições.
- [x] Unificar o resumo de Ferimentos e Condições com o mapa corporal, preservando o detalhe em pop-up.
- [x] Manter Rolar Dados e as opções de ficha acessíveis fora dos painéis principais.
- [x] Retirar o atalho externo duplicado “Condições” depois de oferecer o acesso no painel unificado.

Composição proposta para avaliar durante a implementação:

| Área | Conteúdo |
| --- | --- |
| Identidade | Identificação, fotografia, crescimento e Características no mesmo papel |
| Estado do sobrevivente | Barras, avisos, Necessidades, mapa corporal e resumo de condições próximos |
| Capacidades | Atributos e perícias do atributo selecionado |

Esses nomes descrevem os grupos do plano; não obrigam a criação de novos títulos na interface. Larguras e alturas serão definidas pela legibilidade do conteúdo real.

Conclusão da etapa: a estrutura comunica os agrupamentos pedidos, libera a faixa lateral e permite consultar condições sem abrir o mapa a cada vez.

Verificação realizada: navegador em 1280×720, 1920×1080, 900×768 e 390×844, sem transbordamento horizontal da página; abertura e fechamento por Esc dos painéis de morte, crises, mapa corporal, condições e rolador; seleção de PF e retorno a zero; alternância das perícias por atributo; inclusão de Quebrado, consulta pelo resumo e remoção. Console sem erros ou avisos registrados durante a rodada. Sintaxe de script.js, testes existentes de regras e git diff --check passaram.

Os acessos a Morrendo e Crises já foram movidos para suas barras. As mudanças de cores, nomes, controles permanentes e avisos críticos continuam na etapa 3. Os cortes de nomes e Características e o formato do retrato continuam na etapa 2; esta primeira entrega conclui a organização dos painéis. Impressão, backup/restauração e zoom ainda terão validação completa na etapa 6.

Ponto de retorno: backups/revisao-2026-09-07_19-48-22/antes-das-correcoes.zip e commit-base.txt. Prévia local usada na validação: http://127.0.0.1:4180/.

### 2. Ajustar Identificação e Características

- [x] Corrigir o tamanho do campo de nome e do texto “NOME DO SOBREVIVENTE”, incluindo nomes longos.
- [x] Corrigir a sobreposição de letras no Arquétipo e seu negrito destoante.
- [x] Usar uma moldura de fotografia mais próxima de uma foto quadrada/Polaroid, com reposicionamento da imagem preservado.
- [x] Organizar os campos e grupos com divisões claras; pequenos ícones são uma possibilidade sugerida no feedback.
- [x] Corrigir o corte dos textos de Vantagens, Desvantagens e Cicatrizes. Abreviar rótulos é uma alternativa, sem truncar ou modificar o conteúdo escrito pelo jogador.
- [x] Iniciar fichas novas com três campos de vantagem, dois de desvantagem e um de cicatriz.
- [x] Preservar as Características já preenchidas em fichas existentes. A configuração 3/2/1 não foi definida como limite máximo.
- [x] Oferecer consulta de detalhes da Identificação em pop-up, evitando a ida obrigatória à quarta página.

Pop-ups implementados: Origem, Ocupação, Sangue, Paradigma e Arquétipo/Crescimento pelos botões de consulta ao lado dos rótulos. A Trilha de Crescimento também abre sua consulta local. O conteúdo usa os dados atuais do projeto; os seletores continuam separados da consulta.

Conclusão da etapa: informações legíveis, sem sobreposição, foto proporcional e acesso aos detalhes sem perder o contexto da primeira página.

Verificação da etapa 2: textos extensos em Nome, Vantagens, Desvantagens e Cicatrizes, persistência após recarga, inclusão/remoção de campo adicional, detalhes de Curandeiro e Determinado, Paradigma e os dois tipos de Sangue. Pop-ups fecham por Esc e devolvem o foco. Conferidos 1280×720, 1920×1080, 900×768 e 390×844 sem transbordamento horizontal dos campos testados. A moldura tem área quadrada e mantém o editor de enquadramento existente.

Em telas baixas ou com textos extensos, o painel de papel permite rolagem; o conteúdo cresce em altura em vez de ser truncado. Em celular, as Características ficam em uma coluna. O padrão 3/2/1 vale para fichas novas; listas salvas, inclusive vazias ou maiores, são preservadas. A migração do formato legado mantém seu comportamento anterior.

Validação automatizada: quatro testes passaram (três de criação/restauração em tests/identity-model.test.js e a suíte existente de regras). Sintaxe e git diff --check também passaram. Prévia final: http://localhost:4181/. A revisão completa de impressão e regras continua na etapa 6.

### 3. Corrigir apresentação e controles das barras

Antes da etapa 3, complemento solicitado em 08/09/2026 e concluído: clicar na foto abre um visualizador ampliado com “Alterar foto” e “Ajustar enquadramento”. Após aplicar o recorte, a visualização reaparece. Novas imagens guardam uma cópia anterior ao recorte e os ajustes de zoom/posição para reedição; fotos antigas continuam disponíveis e usam o recorte existente quando a imagem anterior não está salva. O editor agora indica corretamente a área quadrada.

Fontes da Identificação e Características ampliadas discretamente; em telas grandes, campos e grupos se distribuem pela altura do papel. Verificados envio de imagem de teste, zoom, ajuste por teclado, reedição, persistência após recarga, retorno de foco e visualizador em 390×844. Conferido uso do papel em 1920×1080 e ausência de cortes nos campos em 1280×720. Cinco testes passaram, incluindo compatibilidade de fotos antigas e restauração dos novos dados de enquadramento.

- [x] Diferenciar cada estágio por seu próprio nome e cor, sincronizando o texto do estado com os marcadores.
- [x] Substituir “Nenhum” por “Intacto” em PF zero e por “Íntegro” em PE zero.
- [x] Aumentar a espessura dos quadrados de PF e PE e manter espaço suficiente entre eles para clicar.
- [x] Preservar seleção e retorno a zero pelos marcadores.
- [x] Permitir ajustar Corrupção clicando diretamente na barra, com leitura clara do valor de 0 a 100 e alternativa por teclado/controles existentes.
- [x] Simplificar a edição de PF e PE permanentes com botões − e + e valor visível.
- [x] Colocar aviso e acesso a Morrendo/Testes de Morte junto de PF.
- [x] Colocar aviso e acesso a Enlouquecendo/Determinação e Crises junto de PE.
- [x] Retirar esses controles de Necessidades, onde atualmente confundem sua função.
- [x] Verificar a exibição quando há problemas físicos e mentais ao mesmo tempo, evitando que um aviso oculte o outro.

Cores solicitadas:

| Recurso | Estágio | Cor |
| --- | --- | --- |
| Ferimentos | Intacto | Verde |
| Ferimentos | Machucado | Amarelo |
| Ferimentos | Ferido | Laranja |
| Ferimentos | Crítico | Vermelho |
| Ferimentos | Morrendo | Roxo |
| Estresse | Íntegro | Verde-claro |
| Estresse | Estável | Azul-claro |
| Estresse | Instável | Azul-escuro |
| Estresse | Desequilibrado | Roxo |
| Estresse | Enlouquecendo | Rosa |

Morte Direta deve continuar identificada separadamente. Não foi pedida uma nova cor para esse estado. A progressão atual de cores da Corrupção também deve permanecer coerente.

Conclusão da etapa: nomes, cores, valores, cliques e avisos correspondem ao estado do personagem e ficam junto do recurso relacionado.

Verificação da etapa 3: progressão dos estágios, retorno a zero, controles de permanentes e limites nos dois tipos de Sangue; Corrupção por clique e teclado nos valores 0 e 100; avisos físicos e mentais simultâneos em 1280×720, 1920×1080, 900×768 e 390×844, sem transbordamento das barras. Em telas baixas, a página permite rolagem para preservar a leitura. Cinco testes passaram, além de sintaxe e git diff --check. A regra atual que mantém Enlouquecendo até o encerramento pelo MP foi preservada e segue para revisão na etapa 6.

### 4. Consolidar o registro de ferimentos e condições

- [x] Usar um nome compreensível pelo sistema para o conjunto; proposta: “Ferimentos e Condições”, com “Mapa corporal” no detalhe, substituindo “Mapeamento Somático” na interface.
- [x] Preservar a miniatura clicável e o mapa completo em pop-up, que foram aprovados.
- [x] Exibir abaixo do mapa um resumo das condições ativas, como Sangrando, e dos ferimentos registrados.
- [x] Tornar claros os acessos a registrar ferimento por região e adicionar condição.
- [x] Manter múltiplos ferimentos, gravidades, tratamentos e efeitos de armadura funcionando.
- [x] Evitar condições duplicadas quando um ferimento já produz a condição automaticamente.
- [x] Verificar a localização e inclusão de “Quebrado” no seletor e no fluxo de tratamento.
- [x] Manter Dores acessíveis durante a reorganização.

Conclusão da etapa: o jogador encontra “Quebrado”, entende como registrar um problema e consulta o estado atual sem navegar entre áreas separadas.

Verificação da etapa 4: busca e inclusão manual de Quebrado, bloqueio de duplicatas manuais e derivadas, dois ferimentos no Tronco, tratamento de Ferida Severa para Quebrado, edição de observações sem perder o tratamento e persistência após recarga. Um ferimento na Cabeça com Capacete resultou em 0 PF, condição impedida e consumo da Integridade. O resumo abre o editor diretamente, inclusive a partir das condições, sem depender de o mapa estar aberto. Conferidos fechamento por Esc, remoção dos registros de teste, acesso a Dores e telas 1280×720, 1920×1080, 900×768 e 390×844. Listas extensas permitem rolagem dentro do painel no desktop. Oito testes passaram, incluindo três regressões de condições/tratamentos; console sem erros ou avisos. Prévia: http://127.0.0.1:4182/.

### 5. Refinar Atributos, Perícias e tipografia

- [x] Manter a ordem Físico → Destreza → Intelecto → Instinto → Espírito.
- [x] Preservar as cores: vermelho, amarelo/dourado, azul, verde e roxo, respectivamente.
- [x] Preservar o clique no atributo para mostrar suas perícias, os controles de atributo e os quadrados com brilho.
- [x] Corrigir a fonte do nome interno do atributo no painel de perícias, destacado como “FÍSICO” no print.
- [x] Corrigir o alinhamento visual dos ícones dos atributos.
- [x] Aumentar os textos usando o espaço disponível na nova composição.
- [x] Corrigir cortes nas partes inferiores de ç, g e outras letras; conferir Raízologia, Intimidação e Investigação, além dos outros nomes.
- [x] Avaliar o aumento das artes para que seus desenhos sejam identificáveis.
- [x] Preservar o visualizador ampliado das artes.
- [x] Considerar ícones simples somente se as miniaturas continuarem ilegíveis. Essa substituição foi apresentada como alternativa, não como decisão definitiva.
- [x] Conferir também textos de Características, Necessidades e identificação em telas amplas, evitando fontes excessivamente pequenas.

Conclusão da etapa: não há letras cortadas ou borradas; textos e imagens são legíveis e os controles mantêm os comportamentos aprovados.

Verificação da etapa 5: as cinco famílias (35 perícias) em 1280×720, 1920×1080, 900×768 e 390×844, sem transbordamento dos nomes ou cartões. Nomes com 14–15 px, altura de linha 1,4 e quebra livre; título interno com a fonte Oswald dos demais títulos. Artes originais preservadas, exibidas inteiras em 60×90, 68×102 ou 72×108 px, conforme a largura do painel, e distribuídas em uma, duas ou três colunas. A ampliação tornou desnecessária a substituição por ícones simples. Símbolos dos atributos desenhados em SVG, centralizados na mesma caixa e mantendo suas cores. Necessidades recebeu texto maior; os campos de Identificação e Características mantêm as ampliações anteriores, sem cortes na conferência ampla.

Conferidos clique nas cinco famílias, navegação por setas nas abas, incremento/decremento do atributo, seleção de perícia por teclado e retorno ao valor inicial. Visualizadores de Raízologia, Investigação e Intimidação abrem; Esc fecha e devolve o foco. Oito testes existentes passaram, além de sintaxe e git diff --check; console sem erros ou avisos. Em telas baixas, a lista de perícias permite rolagem para preservar os novos tamanhos. Prévia: http://127.0.0.1:4182/.

### 6. Validar o conjunto e revisar regras separadamente

- [ ] Conferir a composição no navegador em desktop, incluindo 1280×720 e uma tela ampla, e com zoom de 110%/125%.
- [ ] Conferir a adaptação a tablet/celular e a ausência de cortes ou sobreposição de controles.
- [ ] Conferir navegação por teclado, fechamento dos pop-ups por Esc, retorno de foco e preferência de movimento reduzido.
- [ ] Validar as barras nos dois tipos de Sangue, os estágios, permanentes e Corrupção nos limites.
- [ ] Validar ficha nova 3/2/1 e carregamento de ficha antiga sem perda de informações.
- [ ] Conferir salvamento local, backup/restauração em JSON e impressão de todas as páginas.
- [ ] Executar os testes de regras existentes após alterações funcionais; acrescentar cobertura apenas para comportamentos modificados que justifiquem teste.
- [ ] Reproduzir o relato de Enlouquecendo e conferir a regra na versão do livro adotada antes de alterar a saída desse estado.
- [ ] Depois dos ajustes visuais, conferir textos e balanceamentos atualizados de Origens e Ocupações.

Conclusão da etapa: correções visuais e funcionais verificadas; eventuais mudanças de regras fundamentadas na versão correta do livro.

## Constatações da leitura inicial do código

Estas constatações são de leitura, ainda sem validação desta rodada no navegador:

1. **Quebrado já está cadastrado**, em `rules-data.js`, na categoria `treated` (Tratadas). O seletor em `renderConditionPicker`, em `script.js`, usa categorias. Portanto o relato pode envolver localização/filtro; não há motivo para cadastrar uma segunda condição igual antes de reproduzir o problema.
2. **Enlouquecendo persiste de propósito na implementação atual**: o estado `model.stress.breaking` permanece mesmo com redução de PE. O painel informa que a redução não encerra o surto e oferece “O MP encerrou o surto”. Isso explica o comportamento relatado, mas não comprova sua conformidade com o livro atualizado.
3. **Há um problema de mapeamento visual dos estágios**: `renderHealth` usa a mesma classe para Machucado/Ferido e a mesma classe para Crítico/Morrendo/Morte Direta, impedindo a diferenciação solicitada apenas por esses seletores.
4. **As Características iniciais hoje são 2/1/1** no modelo padrão. A mudança para 3/2/1 deve cuidar também dos caminhos de inicialização e restauração sem sobrescrever fichas existentes.
5. **A estrutura visual é montada por JavaScript**, principalmente em `buildDossierLayout`, e estilizada em `dashboard-ui.css`, com estilos anteriores em `new-ui.css` e `style.css`. Mover somente o HTML estático não resolve toda a reorganização.
6. **O Git não mostrou alterações em arquivos rastreados** na conferência inicial. Existe uma pasta de extração de backup não rastreada; ela deve ser preservada. Antes da implementação, registrar o ponto de partida atual para permitir comparação e retorno.

## Decisões em aberto, sem impedir a primeira etapa

| Ponto | Encaminhamento |
| --- | --- |
| Nome que substituirá Mapeamento Somático | Proposta: painel “Ferimentos e Condições” e detalhe “Mapa corporal” |
| Escopo do pop-up de Identificação | Resolvido na etapa 2: Origem, Ocupação, Sangue, Paradigma e Arquétipo/Crescimento |
| Artes versus ícones de perícias | Primeiro avaliar as artes com o novo espaço; ícones simples são alternativa |
| Logo definitiva | Verificar o arquivo já disponível; usar um novo apenas quando fornecido |
| Enlouquecendo após reduzir PE | Conferir regra e fluxo de encerramento antes de mudar a mecânica |
| Livro e balanceamentos posteriores | Usar a versão confirmada para a revisão final; registros antigos do projeto não bastam para determinar as regras mais recentes |

## Arquivos previstos por tipo de mudança

| Tipo | Arquivos principais |
| --- | --- |
| Organização, rótulos e acesso a painéis | `script.js`, `index.html` |
| Layout, fontes, espaçamento e responsividade | `dashboard-ui.css`, com conferência de `new-ui.css` e `style.css` |
| Estado inicial e controles | `script.js` |
| Regras e textos, somente após conferência | `automation-engine.js`, `rules-data.js` |
| Validação funcional | `tests/rules-engine.test.js` e verificação no navegador |

O plano foi criado para acompanhar as correções em sequência. Nenhuma caixa marcada significa implementação concluída nesta rodada.
