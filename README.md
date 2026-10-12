# Missão Português 11

Jogo de estudo de Português (10.º e 11.º ano) para o PRI 1 (leitura e gramática) e o PRI 2 (texto de opinião).

Site: https://bcryptopinheiro.github.io/missao-portugues/

## Onde está cada coisa

| Ficheiro | O que tem |
|---|---|
| `index.html` | A estrutura da página e a lista de ficheiros a carregar |
| `css/estilo.css` | Cores e aspeto (computador e telemóvel) |
| `js/conteudo/licoes.js` | Lições e perguntas: Os Lusíadas, leitura, gramática, opinião |
| `js/conteudo/testes.js` | Testes tipo A a H (excertos de Os Lusíadas) |
| `js/conteudo/exames-iave.js` | Gramática dos exames nacionais (IAVE, 2021-2025) |
| `js/conteudo/bancos.js` | Frases do treino infinito e das perguntas geradas |
| `js/conteudo/escrita.js` | «Justifica como no teste» e o texto-modelo de opinião |
| `js/conteudo/mapa.js` | Linhas e estações do mapa |
| `js/jogo.js` | A lógica do jogo (não é preciso mexer para acrescentar perguntas) |
| `testes/validar.js` | Verificação automática do conteúdo |

## Antes de publicar uma alteração

1. Verificar o conteúdo: `node testes/validar.js` (tem de dizer «✓ Tudo certo.»).
2. No `index.html`, mudar o `?v=` em **todas** as linhas para um valor novo (por exemplo `?v=20261013a`), para os telemóveis irem buscar a versão nova.
3. Commit e push. O site atualiza em 1 a 2 minutos.
