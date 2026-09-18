# Padrão visual do site ROTA

Análise consolidada em 18/09/2026. A aba **Sobrevivente** é a referência visual do projeto.

## Diagnóstico atual

A navegação, o fundo queimado e a barra inferior já são compartilhados. O conteúdo interno, porém, ainda pertence a três estágios visuais diferentes:

| Aba | Estado atual | Diferença principal |
| --- | --- | --- |
| Sobrevivente | Referência aprovada | Painéis com carvão, bronze, textura, hierarquia forte e papel somente onde faz sentido |
| Bolsa | Estrutura nova em andamento | Armas já seguem a direção correta, mas os demais cartões ainda são genéricos e a página redefine cores localmente |
| Social | Estrutura antiga | Títulos cinza de 13 px, bordas cinza, campos e cartões sem a hierarquia do Sobrevivente |
| Corrupção | Estrutura antiga | Mesma base genérica da Social, muitos blocos com peso visual igual e informações importantes sem destaque suficiente |

Na medição do navegador, os títulos de painel do Sobrevivente e da Bolsa usam 19 px e bronze. Social e Corrupção ainda usam 13 px e cinza. Os painéis antigos usam fundo `#141412` e borda `#2a2a25`; o padrão aprovado usa superfícies quase pretas, linhas bronze e detalhes internos sutis.

Também existem inconsistências de nome: a navegação diz “Social”, mas a página abre como “História & Anotações”; a navegação diz “Corrupção”, mas a página abre como “Origem & Corrupção”. Os subtítulos podem explicar o conteúdo, mas o título principal deve confirmar a aba escolhida.

## Contrato visual global

### Cores

A paleta nasce dos tokens já presentes no Sobrevivente:

| Função | Valor de referência | Uso |
| --- | --- | --- |
| Fundo queimado | `#050403` / textura carbonizada | Fundo global |
| Carvão | `#070705` | Fundo profundo |
| Tinta | `#0d0c09` | Cartões e controles |
| Painel | `#11100c` | Painéis principais |
| Painel elevado | `#17130e` | Campos, expansões e cartões internos |
| Bronze | `#6f4a27` | Bordas e controles neutros |
| Cobre | `#9c4b28` | Ênfase e faixa superior de cartão |
| Dourado | `#c8a66b` | Títulos, seleção e leitura importante |
| Texto | `#d4c29e` | Texto principal em fundo escuro |
| Texto secundário | derivado da paleta de papel | Ajuda, descrição e metadados |
| Papel | `#b8a481` + textura envelhecida | Identificação, história e notas narrativas |

Vermelho, laranja, verde, azul, roxo e rosa continuam como cores semânticas de estados, atributos, ferimentos, estresse e Corrupção. Elas não devem substituir o bronze como cor estrutural de uma página inteira.

Não serão criadas paletas independentes por aba. Cores novas devem virar tokens globais e ter uma função documentada. Valores hexadecimais soltos dentro de arquivos específicos serão eliminados gradualmente.

### Tipografia

- **Oswald:** títulos de página, painel, cartão, botões e rótulos importantes.
- **Barlow Condensed:** texto corrido, descrições, regras e conteúdo dos cartões.
- **Share Tech Mono:** números, contadores, códigos, capacidades e leituras curtas.
- **Kalam:** somente escrita humana em papel, como identidade, história e anotações. Não deve ser usada em seletores, botões ou regras mecânicas.

Escala de referência:

| Nível | Tamanho alvo |
| --- | --- |
| Título da página | 28–32 px |
| Título de painel | 17–19 px |
| Nome principal de cartão | 20–27 px |
| Subtítulo de cartão | 14–16 px |
| Corpo | 14–15 px |
| Texto auxiliar | 11–13 px |
| Microtexto | 10 px; somente metadados curtos |

### Superfícies e hierarquia

Todo conteúdo deverá usar um conjunto comum de componentes:

1. **Cabeçalho de página:** nome da aba, subtítulo curto e a mesma linha/divisão do Sobrevivente.
2. **Painel de dossiê:** carvão, borda bronze, linha interna discreta e título Oswald dourado com filetes laterais.
3. **Cartão de dossiê:** fundo de tinta, faixa superior cobre, nome forte, metadados e ações secundárias.
4. **Bloco de papel:** papel envelhecido para identificação e conteúdo narrativo. O texto escrito pelo usuário usa Kalam; rótulos continuam Oswald.
5. **Campo:** fundo escuro ou transparente conforme a superfície, borda bronze, altura e espaçamento comuns.
6. **Botões:** primário dourado/cobre, secundário carvão/bronze, perigo vermelho e ação de texto para controles de baixa importância.
7. **Marcadores:** quadrados clicáveis com brilho discreto e leitura numérica explícita.
8. **Chip:** categoria, estado ou origem; nunca deve substituir um título.
9. **Expansão:** poderes, regras e edição detalhada em `details`, preservando o contexto do cartão.
10. **Estado vazio:** borda tracejada, explicação curta e uma ação clara quando aplicável.
11. **Feedback:** sucesso, alerta e erro devem ter cor, texto e região anunciada; não depender somente da cor.
12. **Pop-up:** fundo carbonizado, foco preso ao diálogo, fechamento por botão, clique externo e Esc, com retorno de foco.

### Espaçamento e composição

Será usada uma escala de 4, 8, 12, 16, 24 e 32 px. Painéis da mesma importância terão o mesmo respiro. Cartões não ganharão altura fixa para simular alinhamento; conteúdo cresce sem corte.

As páginas secundárias continuarão com largura máxima próxima de 1480 px. A composição se adapta em três faixas:

- desktop amplo: duas ou três colunas conforme o conteúdo;
- tablet/tela baixa: colunas reduzidas, sem diminuir texto para forçar encaixe;
- celular: uma coluna, controles com área de toque adequada e nenhuma rolagem horizontal.

## Trabalho na Bolsa

A organização geral e os cartões de armas já foram iniciados. A aba ainda precisa ser concluída cartão por cartão:

1. Migrar a própria página para os tokens e componentes globais, retirando a paleta duplicada de `bag-ui.css`.
2. Consolidar o cabeçalho de carga como painel de estado: ocupação, capacidade, limite de criação e sobrecarga.
3. Finalizar armas equipadas e guardadas usando o componente comum de cartão. A base atual já possui nome, categoria, fatos, durabilidade/munição, poderes e ajustes expansíveis.
4. **Concluído em 18/09/2026:** cartão de munição com tipo traduzido, quantidade ou cargas, compatibilidade, regra de recarga, recuperação quando aplicável, marcadores e ações claras.
5. Criar cartão de utilitário com nome, categoria, efeitos principais, usos e detalhes expansíveis.
6. Criar cartão de proteção com região protegida, efeito, estado equipado e integridade.
7. Criar cartão de recurso com nome, frações, leitura atual/máxima e interação coerente com os marcadores.
8. Criar cartão de receita com nome, ingredientes, disponibilidade, efeito e ação de fabricar. Ingredientes ausentes precisam ser identificáveis.
9. Reorganizar o catálogo com filtros ou grupos visuais para utilitários e munições, mantendo uma única fonte de dados.
10. Padronizar espaços vazios, feedbacks e confirmações da Bolsa.
11. Revisar a impressão dos novos cartões sem imprimir botões de manutenção.

Ordem recomendada na Bolsa: **munição → utilitários → proteções → recursos → receitas → catálogo → cabeçalho de carga**. Assim cada cartão é aprovado antes da composição final.

## Trabalho na Social

1. Alterar o título principal para **Social**; “História, relações e anotações” passa a ser o subtítulo.
2. Criar uma composição própria: contexto e história no dossiê de papel; relacionamentos, Dores e controles em painéis escuros.
3. Unir “Ponto de partida” e “Grupo/Estrada” ao bloco narrativo, evitando um painel grande para apenas dois campos.
4. Criar cartão de relacionamento com nome, papel na história, estado atual, escala −5 a +5 e observação. O estado deve ter nome e cor, não apenas número.
5. Transformar as perguntas da história em campos de papel maiores e visualmente relacionados.
6. Criar um painel compacto de Dores com leitura 0/3, avisos e espaço completo para cada texto.
7. Padronizar Cadernos e Post-its: seletor de caderno, cartões de nota em papel, ações de adicionar/remover e estados vazios.
8. Diferenciar conteúdo permanente da história, relação mutável e anotação temporária por superfície e hierarquia.
9. Conferir textos longos, nomes acentuados, vários relacionamentos e muitas notas sem cortes.

## Trabalho na Corrupção

1. Alterar o título principal para **Corrupção**; Origem, Ocupação, Poderes e Crescimento são explicados no subtítulo e nas seções.
2. Reorganizar a página em três grupos: identidade de regras (Origem/Ocupação), poderes disponíveis e progressão (Corrupção/Flor/Filtro/Crescimento).
3. Criar cartões-resumo de Origem e Ocupação com nome, arquétipo, pontos e poderes relevantes; os estados vazios precisam direcionar o jogador à aba Sobrevivente.
4. Padronizar os cartões de poderes por fonte: Ocupação, Origem, Flor e Crescimento, com nome à vista e descrição expansível.
5. Integrar os controles de duração ao painel de poderes, deixando “Próxima rodada”, “Encerrar cena”, “Encerrar conflito” e “Encerrar ciclo” com peso coerente.
6. Refazer a Disseminação como painel de estado: valor atual, estágio, intervalo, efeito ativo e progressão. Vermelho e laranja entram apenas conforme o risco.
7. Criar cartões coerentes para os estágios de Corrupção e destacar claramente atual, liberado e futuro.
8. Padronizar Flor da Corrupção, regras especiais e estatísticas de estágio.
9. Reorganizar o Filtro Corruptivo em opções comparáveis, com ação perigosa identificada e resultado próximo ao controle utilizado.
10. Transformar a Trilha de Crescimento em uma progressão visual legível, mantendo recompensas, desbloqueios e estados aplicada/futura.
11. Rever a densidade de microtextos e tornar as leituras essenciais visíveis sem abrir todos os detalhes.

## Ajustes finais no Sobrevivente

O Sobrevivente não precisa ser redesenhado. Ele será usado para extrair o sistema comum. Ao fim, faremos apenas uma limpeza controlada:

- mover seus tokens e componentes reutilizáveis para a camada global;
- manter o papel, a composição de três colunas, as cores dos atributos e estados;
- substituir apenas regras duplicadas, sem alterar a aparência aprovada;
- garantir que mudanças globais não reduzam a legibilidade ou reintroduzam cortes.

## Estrutura técnica proposta

1. Criar uma folha global de sistema visual, carregada antes das folhas específicas.
2. Definir tokens globais de cor, tipografia, espaçamento, borda, sombra e foco.
3. Criar classes reutilizáveis para painel, cartão, cabeçalho, campo, botão, chip, marcador, expansão, vazio e feedback.
4. Manter folhas específicas somente para composição e particularidades da aba.
5. Migrar uma família de cartões por vez; não fazer uma troca total que dificulte conferir regressões.
6. Remover regras antigas e duplicadas somente depois que a aba correspondente estiver validada.

## Sequência de execução

| Etapa | Entrega |
| --- | --- |
| 1 | Fundação global: tokens e componentes, sem alterar a aparência aprovada do Sobrevivente |
| 2 | Conclusão da Bolsa cartão por cartão |
| 3 | Social: estrutura, papel narrativo, relacionamentos, Dores e notas |
| 4 | Corrupção: estrutura, poderes, disseminação, filtro/flor e crescimento |
| 5 | Revisão do Sobrevivente contra regressões e eliminação de duplicações |
| 6 | Responsividade, teclado, estados extremos, impressão e limpeza final |

### Progresso

- **Etapa 1 concluída em 18/09/2026:** a paleta canônica foi extraída para `dossier-system.css`; tokens semânticos e componentes compartilhados foram criados; a Bolsa passou a consumir painéis, títulos, cartões de armas, estados vazios, feedback, botões e foco dessa camada. O Sobrevivente mantém a aparência aprovada.
- **Cartão de munição concluído em 18/09/2026:** unidades soltas, pentes/tanques e cargas fabricadas agora compartilham o mesmo cartão de dossiê, com acentos neon por tipo e regras sobre papel envelhecido, sem alterar suas regras.
- **Próxima entrega:** cartões de utilitários da Bolsa.

## Critérios de aceite

Cada etapa só termina quando:

- usa os tokens globais e não introduz uma paleta paralela;
- mantém os dados, IDs, cálculos, salvamento e restauração existentes;
- diferencia vazio, selecionado, ativo, esgotado, quebrado, bloqueado e perigo por texto e estilo;
- preserva nomes e descrições longas sem truncamento;
- funciona por mouse e teclado, com foco visível;
- não apresenta rolagem horizontal em 390 px;
- permanece legível em 900 px, 1280 px e 1920 px;
- não gera erros no console;
- passa os testes automatizados pertinentes;
- imprime as informações úteis sem controles de manutenção.

O resultado esperado é um único dossiê ROTA: cada aba mantém sua função, mas todas parecem partes do mesmo objeto, com o mesmo vocabulário visual e as mesmas respostas de interação.
