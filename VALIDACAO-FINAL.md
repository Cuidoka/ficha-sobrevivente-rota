# Validação da etapa 6

Revisão concluída em 09/09/2026. Etapas 1–5 preservadas. O usuário dispensou a conferência de zoom real; as seis etapas estão concluídas no escopo acordado, sem alteração do TK pendente com o material recebido.

## Correções desta etapa

- Backup: arquivos JSON sem estrutura de ficha são recusados antes de substituir o modelo atual. Compatibilidade com formato legado e versões 3/4 preservada.
- Teclado: Tab e Shift+Tab permanecem no pop-up superior; Esc devolve o foco ao controle de origem. Preferência de movimento reduzido cobre também animações e transições gerais.
- Impressão: folha de estilos própria, campos apresentados como texto completo, registro de ferimentos/condições incluído e todas as famílias de perícias visíveis. A ficha padrão passou de 16 para 9 páginas A4; a quantidade varia conforme o preenchimento. Conferência visual das nove páginas e do contraste final dos atributos.
- Prodígio: três escolhas de Dom Superior, bônus automático também na terceira perícia, orientação sobre imunidade a Penalidades de Ambiente/Terreno e duas vantagens adicionais. As características continuam editáveis pelos controles existentes; a seleção da ocupação não apaga nem substitui listas preenchidas.
- Aprendizado Rápido: bônus não cumulativo, consumido no próximo teste igual ou encerrado ao avançar a Cena. Bônus antigos desse poder são normalizados para a mesma duração.

## Livro adotado

Fonte confirmada pelo usuário: `C:/Users/Cuidoka/Downloads/ROOTS OF THE ABYSS UPDATE.pdf`, 465 páginas. Numeração abaixo corresponde às páginas do PDF.

| Referência | Resultado |
| --- | --- |
| p. 50, Prodígio | +2 Vantagens; três Perícias; imunidade a Penalidades de Ambiente/Terreno; Aprendizado Rápido limitado à Cena. |
| p. 50, Engenhoqueiro | Minha Melhor Criação: a próxima arma aprimorada depende da destruição da atual. Texto corrigido. |
| pp. 75–76, Gótico | Mixtapes atualizadas para pares de atributos, em vez dos pares antigos de perícias. |
| p. 87, Caçador | Veneno na Ponta afeta uma munição, em vez de até três. Texto corrigido. |
| pp. 34 e 231, Enlouquecendo | A p. 34 estabelece entrada ao atingir o limite; a p. 231 entrega o controle ao MP e não estabelece saída automática pela redução de PE. Mantido o encerramento explícito pelo MP. A duração/resolução narrativa não recebeu uma regra inventada. |

Foram alinhadas 215 descrições de poderes iniciais, poderes de Origem e poderes de Ocupação com o texto extraído; diferenças relevantes foram revisadas no contexto. Os custos dos 160 poderes compráveis de Origem coincidiram com o UPDATE. Isso é uma revisão do catálogo solicitado, não uma auditoria completa de todas as regras das 465 páginas. Documentos anteriores de análise não substituem esta fonte.

## Verificação

- 12 testes automatizados passaram, incluindo catálogo/limites, tratamentos, novo padrão 3/2/1, listas antigas, fotos, backup, terceira perícia e duração de Aprendizado Rápido.
- Sintaxe de JavaScript e `git diff --check` passaram.
- Quatro abas em 390×844, 900×768, 1280×720 e 1920×1080: nenhum transbordamento horizontal dos controles.
- Pop-ups de Ferimentos, Estresse, Mapa corporal e Dados: Esc e retorno de foco. Ciclo Tab/Shift+Tab conferido no painel de regras. Visualizadores de foto/perícias e editor de ferimentos já haviam sido verificados nas etapas anteriores.
- Salvamento confirmado após recarga e retomada do navegador. Exportação em JSON e restauração pela interface preservaram nome longo, características e a terceira escolha de Dom Superior. Formato legado e rejeição de JSON inválido cobertos por regressões.
- Barras, permanentes e Corrupção nos dois Sangues: evidências das etapas 3/4 preservadas e testes de regras repetidos.
- Console da prévia sem erros ou avisos.

## Verificação dispensada e limites da revisão

O usuário dispensou a conferência de zoom real em 09/09/2026. Foram conferidas as áreas úteis equivalentes a 110% e 125% de uma janela 1280×720 (1164×655 e 1024×576), sem transbordamento. Isso não é uma medição de zoom real, e não é apresentado como tal. A dispensa encerra essa pendência do plano.

O cabeçalho utiliza o emblema existente `assets/ui/icone-rota.png`. Uma eventual logo diferente e uma versão futura do livro dependem de novos arquivos, conforme combinado; não são alterações pendentes executáveis com o material atual.

Movimento reduzido foi conferido pelas regras CSS; a preferência do sistema do usuário não foi alterada. Penalidades informadas no rolador continuam manuais: para Dom Superior, o usuário exclui as de Ambiente/Terreno conforme a orientação exibida.
