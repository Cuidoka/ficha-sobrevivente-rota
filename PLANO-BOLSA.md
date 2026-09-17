# Bolsa — base de organização

Análise e primeira implementação: 17/09/2026.

A aba Sobrevivente organiza informações relacionadas em painéis, usa a paleta escura e bronze, títulos Oswald e detalhes consultáveis. A Bolsa já tinha catálogo, carga, armas equipadas/guardadas, munição, integridade das armaduras, partes, recursos e fabricação. O principal problema estrutural era misturar armas guardadas e munições com os utilitários.

## Base implementada

- Carga compartilhada no topo, com capacidade, ocupação e aviso de excesso.
- Armas e munições no mesmo painel: equipadas, guardadas e reserva de munição.
- Utilitários e outros itens em painel próprio, incluindo registros personalizados.
- Proteções com seleção e integridade.
- Recursos e partes próximos à área de fabricação; receitas com ingredientes e controles existentes.
- Atalhos para cada seção e adaptação das colunas a telas menores.
- Paleta, bordas e tipografia alinhadas ao Sobrevivente, em `bag-ui.css`, restrita à Bolsa.

A separação é visual: o inventário mantém seus IDs, ordem e capacidade compartilhada. Não há migração de ficha nem criação de capacidades por categoria. Itens personalizados permanecem em “Utilitários e outros itens”; não se tenta adivinhar sua categoria pelo nome. A marcação de excesso considera itens ocupados, não espaços vazios anteriores na lista.

## Próximos aprimoramentos

1. **Concluído:** cartões de armas equipadas e guardadas com nome em destaque, categoria, dados de combate em campos separados e marcador de usos/durabilidade/munição. Poderes e ajustes expansíveis; espaços vazios compactos. Armas sem munição não recebem mais o aviso visual “Quebrada”. Edição personalizada atualiza os dados visíveis imediatamente.
2. Refinar o catálogo por contexto (armas, munições, utilitários), mantendo as regras atuais.
3. Avaliar subdivisões dos utilitários, como tratamento, exploração e consumíveis. Definir categorias explícitas antes de classificar itens personalizados.
4. Se houver artes oficiais de equipamentos, incorporá-las com a mesma linguagem dos atributos. Não são necessárias para usar esta base.

## Verificação

Testes de regressão cobrem separação sem duplicação/reordenação, carga compartilhada, espaços vazios e transferência de armas com preservação de dados. A conferência no navegador usa uma ficha local de teste, isolada da ficha do usuário.

Cartões de armas: 17 testes passaram. No navegador, conferidos disparo até esgotar munição, edição de anotações, alteração de durabilidade, guardar/reequipar, atualização de arma personalizada e tela estreita de 390 px sem transbordamento horizontal. Ajustes abertos são preservados ao atualizar o marcador; na impressão, a área de ajustes é aberta temporariamente para incluir os dados.
