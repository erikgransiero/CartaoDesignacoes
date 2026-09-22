# Gerenciador de Documentos — Congregação Parque Scaffid

Documento de registro do projeto (memória técnica e funcional).
Última atualização: 22/09/2026.

> **Como usar este arquivo:** no início de qualquer sessão nova (ou quando a
> conversa for compactada), leia este arquivo primeiro. Ele evita ter que reler
> o `src/App.tsx` inteiro (~130 mil tokens) só para relembrar decisões já
> tomadas. Mantenha-o atualizado a cada entrega relevante.

---

## 1. Objetivo do projeto

Aplicação web para **gerar e versionar os documentos mensais da congregação**
a partir de dados variáveis do mês, mantendo uma identidade visual
padronizada. O elder alimenta o sistema (colando texto do WhatsApp, PDFs,
ou digitando manualmente) e obtém os documentos prontos, sem reformatação
manual.

Princípio central: **separar os dados (nomes, datas, temas) do estilo
(cores, bordas, layout)**. O usuário troca apenas os dados do mês; o estilo
é constante.

---

## 2. Estado atual — visão geral

**Todas as 5 telas de documento + Login + Usuários estão construídas e em
produção.** O projeto está na fase de **revisão tela-por-tela**, simulando
o uso real mensal, para adicionar funcionalidades que faltam (exportar PDF,
imprimir, corrigir bugs de parsing) antes de partir para backend/integrações.
Em paralelo, abriu-se uma **segunda frente**: novas telas de "Publicadores"
que vão alimentar dados para o futuro envio de cartões (ver §5.8/5.9).

**Atualização 16-17/09/2026:** o import de PDF do Cartão de Designações foi
removido (não sobrevivia a um formato mais novo de apostilado — ver §5.3/§6)
e a tela ganhou um botão "Exportar JSON" para começar a acumular um
histórico mensal fora do `localStorage`, pensando em futuras estatísticas de
partes dos publicadores. Uma reestruturação maior da tela (dropdowns +
semanas automáticas) chegou a ser implementada e validada, mas foi revertida
a pedido do usuário — ver a nota de "não reabrir" em §5.3.

**Atualização 18/09/2026:** lote de ajustes incrementais no Cartão de
Designações e telas relacionadas, todos em produção — botão "Limpar" (não
apaga observações), autocompletar por atalho de digitação em "Faça seu
melhor no ministério" e em "Nossa Vida Cristã", prefixo padrão "th lição "
em "Lição da leitura", mensagem do WhatsApp da tela Enviar Cartão de
Designação reordenada e sem o campo Local, cadastro de Publicadores
populado com os 16 publicadores reais da congregação (substituindo os 5 de
exemplo) e validação para não deixar cadastrar dois publicadores com o
mesmo telefone. Ver §5.3/§5.8/§5.9 e §6.

**Atualização 20/09/2026:** ajustes no Bastidores e no Calendário de
Pregação, todos em produção — no Bastidores, cada linha ganhou um seletor
de data exata (semana anterior, atual e as duas próximas do mesmo dia da
semana) e o auto-preenchimento do mês inteiro a partir do padrão dos dois
primeiros dias; no Calendário, um botão "Salvar" com confirmação visual.
Além disso, foi criado no menu lateral um novo item **"Estatísticas"**
(abaixo de "Cadastro Publicadores", com divisória própria) — ainda sem
tela, esmaecido, aguardando definição do que deve mostrar. Ver §5.4/§5.5,
§5.10 e §6.

**Atualização 21/09/2026:** dados de fábrica do Cartão atualizados para
**Outubro/2026** (JSON exportado pelo usuário) e criados botões de
**backup manual** (Exportar/Importar .json) em Bastidores, Calendário de
Pregação e Cartão de Designações — ponte até o backend para o usuário não
perder o conteúdo ao limpar o cache do navegador. Também neste ciclo:
Enter no campo do designado do Cartão adiciona nova parte (funciona no
Safari) e destaque na tabela de Bastidores ao clicar num nome do resumo
de participações. Ver §3, §5.3/§5.4/§5.5 e §6.

**Atualização 22/09/2026:** construída e publicada em produção a tela de
**Estatísticas de Designações** — painel de apoio à decisão com 5
relatórios (volume por irmão, rodízio/recência, duplas, variedade de
partes, apoio à montagem do próximo mês), fusão manual de nomes com
recálculo real (não cosmético), exportar/importar backup das correções, e
uma rodada de correções na base histórica de dados feita junto com o
usuário (nomes que deveriam estar fundidos e registros com dois nomes numa
única célula). Ver §5.10 e §6.

| Tela | Situação |
|---|---|
| Login | Concluída e em produção |
| Menu principal | Concluída e em produção |
| Discurso Público | Construída e revisada · em produção (ver §6) |
| Reunião A Sentinela | Construída e revisada · em produção (ver §6) |
| Cartão de Designações | Construída · **em revisão** (ver §6), itens 1-3 em produção; preenchimento **100% manual** com atalhos de autocompletar (ver §5.3) |
| Calendário de Pregação | Construída · Exportar PDF (1 página) + botão "Salvar" em produção; revisão completa (lista de ajustes) ainda não iniciada |
| Bastidores | Construída · Exportar PDF + seletor de data exata + auto-preenchimento do mês em produção; revisão completa (lista de ajustes) ainda não iniciada |
| Configurações → Usuários | Concluída e em produção |
| Cadastro de Publicadores | Construída e em produção (nova, ver §5.8) |
| Enviar Cartão de Designação | Construída e em produção · **em desenvolvimento incremental** (ver §5.9/§6) |
| Estatísticas | Construída e em produção · uso incremental contínuo (ver §5.10) |

**Ordem da revisão escolhida pelo usuário:** Discurso Público → Reunião A
Sentinela → Cartão de Designações → Calendário de Pregação → Bastidores.
Para cada tela: o usuário simula o dia a dia, envia uma lista numerada de
ajustes, eu implemento, valido em `preview`, e só então avançamos para a
próxima tela. O botão "Exportar PDF" do Calendário e do Bastidores foi
adiantado a pedido do usuário, fora dessa ordem — a revisão completa
(lista numerada de ajustes) dessas duas telas continua pendente.

---

## 3. Arquitetura e stack (decisões já tomadas — não reabrir)

- **Vite + React + TypeScript**, mas o app inteiro vive em **um único
  arquivo**: `src/App.tsx` (convenção herdada do protótipo original). Todas
  as telas, estilos e lógica estão lá dentro.
- **Sem backend.** Persistência 100% client-side via `localStorage`
  (`useEstadoSalvo`, chave-prefixo `gerenciador-documentos:`).
- **Hospedagem:** GitHub Pages, com **dois ambientes**:
  - `main` → produção → `https://erikgransiero.github.io/CartaoDesignacoes/`
  - `preview` → validação → `.../CartaoDesignacoes/preview/`
  - Pipeline única em `.github/workflows/deploy.yml`: builda as duas branches
    e publica ambas juntas (uma nunca sobrescreve a outra).
- **Fluxo de publicação (sempre seguir esta ordem):**
  1. Desenvolver na branch `claude/ipad-code-app-setup-x8ewo4`.
  2. Validar com screenshot (Playwright headless) antes de publicar quando
     houver dúvida de layout.
  3. Publicar em `preview` (`git push origin <branch>:preview`) e avisar o
     usuário para conferir no navegador/iPad.
  4. **Só ir para produção (`main`) quando o usuário disser explicitamente**
     ("Faça o deploy em produção"), via fast-forward
     `git push origin origin/preview:main` — **nunca force-push**.
- **Login/sessão:** hash SHA-256 da senha (nunca texto puro), sessão em
  `localStorage`/`sessionStorage` conforme "lembrar". Usuário literal
  `"super adm"` sempre entra como Editor sem senha (bypass intencional,
  pedido pelo usuário). Perfis: Visualizador (só vê) e Editor (edita).
- **Import de PDF removido (16/09/2026).** O Cartão de Designações chegou a
  ter import automático via `pdfjs-dist`, mas só funcionava com apostilados
  cujos nomes eram **anotações PDF do tipo FreeText**. Um PDF real enviado
  pelo usuário (formato mais novo do apostilado) não tinha anotação nenhuma
  — os nomes eram texto de página comum, com letras acentuadas decompostas
  em glifos separados — o que quebrava tanto o parsing quanto a premissa
  inteira do recurso. Decisão do usuário após diagnóstico: remover o
  import por completo (`pdfjs-dist` desinstalado, ~1,7 MB a menos no
  bundle) e manter a tela **só com preenchimento manual**. Não reabrir essa
  ideia sem um novo pedido explícito.
- **Exportar PDF:** abordagem escolhida é `window.print()` + CSS
  `@media print` (sem biblioteca extra), imprimindo só a área de
  pré-visualização (`id="area-impressao"`, regra genérica reaproveitável em
  qualquer tela). Implementado assim no Discurso Público; replicar o mesmo
  padrão nas demais telas quando pedido.
- **Backup manual (Exportar/Importar .json) — ponte até o backend
  (21/09/2026):** como não há backend e os dados vivem só no `localStorage`
  de cada navegador, o usuário perde tudo ao limpar o cache. Enquanto o
  PostgreSQL não entra, existem dois helpers reutilizáveis no topo do
  `App.tsx`: `baixarJSON(nomeArquivo, obj)` (baixa o estado da tela num
  `.json`) e o componente `BotaoImportarJSON` (abre seletor de arquivo, lê
  o `.json`, valida e chama `setDados`, com `window.confirm` antes por
  substituir tudo). Já usados em Cartão, Calendário e Bastidores. **Limite
  importante:** o backup só captura o que está salvo **na mesma URL** onde
  os dados foram digitados — `preview` e `main` têm `localStorage`
  separados; logo, para o usuário salvar o que já editou, o recurso
  precisa estar **em produção**. A tecnologia de "gravar/substituir um
  arquivo automaticamente" (File System Access API) **não funciona no
  Safari/iPad**, por isso a escolha do arquivo é manual. Não é uma
  substituição do backend — é ponte até ele.
- **Testes:** Playwright headless (Chromium em `/opt/pw-browsers/chromium`,
  rodar com `NODE_PATH=$(npm root -g) node script.mjs`). Screenshots
  enviados ao usuário antes de decisões de layout, sempre que houver dúvida.
- **Dois "estilos" de tela na aplicação:**
  1. **Telas de documento** (Discurso, Sentinela, Cartão, Calendário,
     Bastidores) — layout próprio `S.page`, com `<header>` interno e botão
     "Voltar ao menu principal"; não usam a barra lateral.
  2. **Telas "de sistema"** (Menu principal, Configurações → Usuários,
     Cadastro de Publicadores, Enviar Cartão de Designação) — usam
     `M.layout` (grid `260px 1fr`) com a `<Sidebar>` compartilhada à
     esquerda e `<main style={M.main}>` à direita; cabeçalho com breadcrumb
     opcional + ícones (sino/avatar) e, quando fizer sentido, uma faixa
     "hero" (`M.hero`/`M.heroText`/`M.heroArt`, título+subtítulo ao lado de
     uma ilustração). Ao criar uma tela nova desse tipo, reaproveitar esse
     padrão em vez do `S.page`.
- **Itens do menu lateral sem card no menu principal:** a constante
  `MENU_LATERAL_EXTRA` (separada de `DOCUMENTOS`) guarda itens que só
  aparecem na barra lateral, abaixo de uma linha separadora — usada para
  "Cadastro Publicadores" e "Enviar Cartão de Designação". Cada item tem
  `pronto: true/false`; quando `false`, fica esmaecido e o clique não navega
  (mesmo padrão visual dos itens "em construção" de `DOCUMENTOS`). Um item
  desses só ganha um card na área principal do menu se for explicitamente
  pedido — por padrão, fica só na lateral.

---

## 4. Identidade visual (paleta do template)

| Elemento | Cor |
|---|---|
| Vinho (cabeçalhos, moldura, títulos) | `#800000` |
| Dourado (observações, destaques) | `#B08500` |
| Azul institucional (subtítulos, interface) | `#1F3864` |
| Teal (Bastidores) | `#2B6E63` |
| Rosa-claro (linha de congresso) | `#F2DEDE` |
| Fundo amarelo (linha de visita/evento) | `#FBF3D5` |
| Vermelho claro (aviso/conflito, Bastidores) | usado em `S.aviso*` |
| Marca-texto de trecho | `#FFF2A8` |

Fonte padrão dos documentos: Arial.

---

## 5. Funcionalidades por documento (o que já existe)

### 5.1 Discurso Público
- Tabela de datas/temas fiel ao PDF original, com destaque **amarelo**
  (visita do superintendente) e **rosa** (congresso/assembleia), sugestão
  automática de destaque por palavra-chave, marca-texto de trecho,
  observações editáveis, foto do orador (original ou importada).
- **Colar do WhatsApp + Processar**: interpreta texto colado
  (data → tema → subtítulo opcional), mostra prévia, substitui os quadros.
  Reconhece datas em `DD/MM`, `DD/MM/AAAA` (ano é descartado, fica só
  `DD/MM`), `DD de <mês>`, dia ordinal (`1º de setembro`), separador por
  ponto (`13.09`, sem confundir com um ponto final de frase tipo
  `23/08/2026.`) e prefixo de dia da semana (`Domingo, 06/09`). Remove o
  rótulo "Tema" (qualquer caixa) e os símbolos `*`/`:` de qualquer parte
  do tema/subtítulo (negrito e pontuação do WhatsApp). Preenche sozinho o
  campo "Mês / Ano" a partir da primeira data reconhecida.
- **Exportar PDF**: botão no cabeçalho, imprime apenas a pré-visualização.

### 5.2 Reunião A Sentinela
- Blocos semanais com campos que mudam conforme o tipo: Semana Normal,
  Assembleia, Congresso, Visita do SC.
- Colar do WhatsApp + Processar: reconhece tanto o formato antigo
  ("Rótulo: Nome" com dois-pontos) quanto o **formato real do WhatsApp
  do usuário** — cabeçalho "Dia DD mês" (ex.: "Dia 27 setembro", vira
  "27 – Setembro – 2026" com o ano corrente do sistema) e designações sem
  dois-pontos ("Presidente Nome", "Estudo Nome", "Leitor Nome", "Oração
  Nome"), com tolerância a erros de digitação comuns ("Tudo"→Estudo,
  "Leito"→Leitor). "Oração Inicial" é preenchida automaticamente com o
  mesmo nome do Presidente. Campo "Mês / Ano" detectado automaticamente.
  Limite de 5 semanas / 3 observações por página.
- **Exportar PDF**: mesmo layout de página única A4 do Discurso Público.
- Em **revisão** no ciclo atual (item 1 concluído, publicado em `preview`
  — ver §6).

### 5.3 Cartão de Designações
- Preenchimento **100% manual**, em blocos semanais (import de PDF foi
  removido em 16/09/2026 — ver §3 e §6).
- Usado como referência cruzada pela validação de conflitos do Bastidores
  (mesmo nome na mesma semana) e como fonte de dados da tela Enviar
  Cartão de Designação (§5.9).
- **Exportar PDF**: layout próprio, diferente das telas anteriores — em
  vez de forçar 1 página sempre, pagina de verdade com **até 2 semanas
  por página física** (cabeçalho do cartão repetido em cada página,
  observações na última). Ver §6.
- **Exportar JSON / Importar JSON** (17/09 e 21/09/2026): "Exportar JSON"
  baixa o `dados` completo em `cartao.json` (via helper `baixarJSON`);
  "Importar JSON" restaura de um `.json` (via `BotaoImportarJSON`, ver §3).
  Serve tanto de backup contra limpeza de cache quanto para acumular um
  histórico mensal fora do `localStorage`, com vistas a futuras
  análises/estatísticas de partes dos publicadores. Ainda não há tela de
  análise consumindo esses arquivos.
- **Enter adiciona parte** (20/09/2026): pressionar Enter no campo
  "Designado(s)" da **última** linha de "Faça seu melhor no ministério" ou
  "Nossa Vida Cristã" cria uma nova parte e move o foco para o primeiro
  campo dela. Foi a forma de dar navegação por teclado que funciona no
  Safari/iPad (onde Tab não alcança botões); o botão "Remover" da linha
  tem `tabIndex=-1` para o Tab pular direto do designado para o
  "+ Adicionar parte". Ver `ParteCartao`.
- **Botão "Limpar"** (18/09/2026): no cabeçalho, ao lado de "Exportar
  JSON"/"Exportar PDF". Pede confirmação e reseta Mês/Ano e as semanas
  (volta a uma única semana em branco), deixando pronto para o próximo
  mês. **Não apaga as Observações** — isso foi um requisito explícito do
  usuário, testado e confirmado.
- **Autocompletar por atalho de digitação** (18/09/2026), só em campos de
  texto livre (não é dropdown/`<select>` — essa ideia foi revertida, ver
  nota abaixo): o `onChange` compara o texto digitado (normalizado,
  minúsculo) contra um mapa fixo e, se bater, substitui pelo texto
  completo.
  - Em "Faça seu melhor no ministério": campo Título aceita `cu`→
    "Cultivando o Interesse", `di`→"Discurso", `ex`→"Explicando suas
    crenças", `fa`→"Fazendo discípulos", `in`→"Iniciando conversas",
    `le`→"Leitura Bíblica", `o`→"O que você diria?". Campo Detalhe aceita
    `i`→"imd lição 0 ponto 0" e `th`→"th lição " (usuário completa o
    número na sequência). Implementado em `TITULO_MINISTERIO_ATALHOS` /
    `DETALHE_MINISTERIO_ATALHOS` + helper `aplicaAtalho`, aplicado só
    quando `secao === "ministerio"` dentro de `ParteCartao`.
  - Em "Nossa Vida Cristã": campo Título aceita `est`→"Estudo bíblico de
    congregação" e `nes`→"Necessidades Locais"; qualquer outra sequência
    fica livre para digitação normal (`TITULO_VIDA_CRISTA_ATALHOS`,
    aplicado só quando `secao === "vidaCrista"`).
  - Em "Tesouros da Palavra de Deus": o campo "Lição da leitura" de toda
    semana nova (`novaSemanaCartao()`) já nasce com `"th lição "`
    preenchido — o usuário só completa o número.
- Em **revisão** no ciclo atual (itens 1-3 concluídos, em produção).
- **Tentativa revertida (16-17/09/2026):** chegou a ser implementada uma
  reestruturação grande da tela — Mês/Ano como dropdown com geração
  automática de semanas (segunda a domingo), e quase todo campo de nome
  virando `<select>` a partir do Cadastro de Publicadores (inclusive
  combinação de até 4/2 designados separados por "/"), mais uma nova lista
  de "Tipos de partes" no Cadastro de Publicadores. Foi validada em
  `preview` e funcionava corretamente, mas o usuário pediu rollback pouco
  depois (revert por commit, sem force-push) e a tela voltou a ser 100%
  texto livre. **Não reimplementar essa ideia sem um novo pedido
  explícito do usuário** — se pedir de novo, o código já existiu uma vez
  (commit `ad7ffa5`, revertido em `96f2d64`) e pode servir de ponto de
  partida.

### 5.4 Calendário de Pregação
- Grade automática de 7 colunas a partir do mês/ano.
- Célula = texto livre, cor de fundo por dia, formatação de trecho
  (cor/negrito), notas de rodapé (Nota/Título), imagem do topo editável.
- **Exportar PDF**: mesmo padrão de página única (zoom-to-fit) do Discurso
  Público/Sentinela — adiantado a pedido do usuário; revisão completa
  (lista numerada de ajustes) ainda **não iniciada**.
- **Botão "Salvar"** (20/09/2026): no cabeçalho, ao lado de "Exportar PDF".
  Os dados já eram salvos sozinhos a cada alteração (`useEstadoSalvo`); o
  botão grava imediatamente no `localStorage` e mostra "Calendário salvo
  com sucesso!" por 3s — é uma confirmação visual explícita pedida pelo
  usuário, que tem muitas informações nessa tela e não quer perdê-las ao
  atualizar o site. Ver `salvarAgora`.
- **Exportar / Importar** (21/09/2026): backup manual em `.json`
  (`calendario.json`) para não perder o conteúdo ao limpar o cache — ver §3.

### 5.5 Bastidores
- Tabela por data: Áudio/Vídeo, Volantes, Indicadores, Limpeza
  Pós-Reunião, com ciclo A/B/C de responsáveis.
- Cadastro de irmãos disponíveis por função, sorteio automático ao abrir a
  tela (só quando a célula está vazia).
- **Validações de conflito** (fundo vermelho claro): mesmo nome mais de 1x
  na linha; mesmo nome na linha seguinte (fundo amarelo claro); mesmo nome
  na mesma semana do Cartão de Designações (dias úteis) ou da Reunião A
  Sentinela (fim de semana) — comparação leva em conta mês, não só dia do
  número, para evitar falso positivo entre meses diferentes.
- **Resumo de participação no mês**: 3 grupos — mais de 2x, exatamente 1x,
  não escalados no mês. Os nomes de "Mais de 2 vezes" e "Apenas 1 vez" são
  **clicáveis** (20/09/2026): ao clicar, as células da tabela com aquele
  nome ficam realçadas (vermelho claro / azul claro), para localizar onde o
  irmão aparece; clicar de novo desliga (toggle). Ver `nomeDestacado` /
  `fundoCelula`.
- **Realce de linha inteira**: Evento (amarelo, layout normal) ou Aviso
  (vermelho, mescla todas as colunas e abre campo de texto livre).
- **Exportar PDF**: mesmo padrão de página única (zoom-to-fit) das demais
  telas — adiantado a pedido do usuário; revisão completa (lista numerada
  de ajustes) ainda **não iniciada**.
- **Célula de Data — dois seletores** (20/09/2026): além do dropdown de dia
  da semana, cada linha tem um segundo dropdown com a **data exata**, que
  oferece 4 opções do mesmo dia da semana — a **anterior** (-7), a atual, e
  as **duas próximas** (+7, +14). Serve para adiantar ou pular uma semana
  (ex.: congresso) sem perder o dia escolhido, e para ajustar uma reunião
  pontual. Ver `candidatosMesmoDiaDaSemana` e `mudaDataExataDaLinha`.
- **Auto-preenchimento do mês pelo padrão dos 2 primeiros dias**
  (20/09/2026): ao trocar o dia da semana da **1ª ou 2ª linha** (as mais
  antigas do mês), o projeto entende que esses dois dias formam o padrão
  semanal da congregação e **completa o mês inteiro** alternando entre eles
  (ex.: terça na 1ª linha + domingo na 2ª → terça/domingo até o fim do
  mês). A operação é **aditiva e não-destrutiva**: linhas com datas que
  continuam no novo padrão mantêm as designações; linhas que ficam fora do
  padrão **não são apagadas** (continuam na tabela); a linha editada nunca
  duplica. Da 3ª linha em diante, mudar o dia é uma **exceção** que altera
  só aquela linha (via `trocaDiaDaSemana`), sem mexer no resto do mês. Ver
  `mudaDiaDaLinha`.
- **Exportar / Importar** (21/09/2026): backup manual em `.json`
  (`bastidores.json`) para não perder o conteúdo ao limpar o cache — ver §3.

### 5.6 Configurações → Usuários
- Cadastro de usuários (nome, e-mail, senha com confirmação, perfil
  Visualizador/Editor). Senha armazenada só como hash SHA-256.
- Sidebar compartilhada e navegável em todas as telas (inclusive
  Configurações, que antes não levava a lugar nenhum).

### 5.7 Login
- Tela obrigatória ao acessar a URL — gate de toda a aplicação.
- Valida usuário+senha contra os cadastrados; `"super adm"` sempre entra
  como Editor sem validação (bypass intencional).
- Sessão persistida conforme opção "lembrar".

### 5.8 Cadastro de Publicadores (nova, 12/09/2026)
- Tela "de sistema" (padrão Sidebar, sem breadcrumb — o usuário pediu para
  desconsiderar o breadcrumb do layout de referência).
- Cadastra **nome + telefone** (celular, DDD + 9 dígitos) de cada
  publicador, com máscara automática `(DD) DDDDD-DDDD` aplicada durante a
  digitação.
- Edição inline: o lápis carrega o publicador no formulário do topo e o
  botão vira "Salvar alterações"; a lixeira remove direto (sem confirmação,
  mesmo padrão do resto do app).
- Busca por nome ou telefone + paginação de 5 por página.
- Guardado em `localStorage` (chave `publicadores`) — é a fonte de dados
  que a tela **Enviar Cartão de Designação** deverá usar futuramente para
  obter o telefone de cada designado na hora de enviar (essa ligação ainda
  **não foi feita**; hoje as duas telas não conversam entre si).
- **Validação de telefone duplicado** (18/09/2026): ao cadastrar (nesta
  tela ou pelo cadastro rápido da tela Enviar Cartão de Designação —
  ver §5.9), compara os dígitos do telefone digitado (sem formatação)
  contra todos os já cadastrados; se já existir, bloqueia com a mensagem
  "Este contato já existe: \<nome\>." Editar um publicador mantendo o
  próprio número continua funcionando (a comparação ignora o próprio
  `id` em edição).
- **Dados de fábrica atualizados** (18/09/2026): `src/data/publicadores.json`
  passou a ter os **16 publicadores reais** da congregação (nome +
  telefone), exportados pela própria tela e enviados para eu atualizar o
  arquivo — substituindo os 5 registros de exemplo originais.

### 5.9 Enviar Cartão de Designação (nova, 12-13/09/2026 — em desenvolvimento incremental)
- Tela "de sistema" (padrão Sidebar, **com** breadcrumb: "Cartão de
  designações › Enviar Cartão de designações").
- **Mês da reunião**: dropdown que hoje mostra só o único mês/ano que o
  Cartão de Designações guarda (`leSalvo("cartao", ...)`, leitura pontual
  ao abrir a tela, mesmo padrão já usado pelo Bastidores para cruzar dados
  com outras telas). Múltiplos meses dependem de um histórico de cartões
  por mês, que fica para quando o backend/banco de dados entrar no
  projeto — decisão explícita do usuário.
- **Dia da Reunião**: dropdown ao lado de "Mês da reunião" (mesma linha,
  no topo da tela — não fica dentro do formulário da designação
  selecionada). É estado da tela inteira, não da designação: **não reseta**
  ao trocar de designação selecionada, fica fixo até o usuário mudar
  manualmente ou sair da tela.
- **Participantes e designações**: lista construída a partir do Cartão de
  Designações do mês (`gerarDesignacoesMinisterio`), **somente** com a
  Leitura da Bíblia e as partes da sessão "Faça seu melhor no Ministério"
  — nunca Presidente, Tesouros ou Vida Cristã. Quando o campo de designado
  do Cartão traz dois nomes separados por `/` (padrão comum nas partes de
  ministério, ex.: "Giuliana / Helena"), o primeiro nome vira o titular e o
  segundo o "Ajudante". Cada linha mostra nome (+ ajudante) e a semana
  correspondente (`dataLabel` do Cartão, ex.: "03 – 09 DE AGOSTO"); busca
  filtra por nome ou tipo de designação.
- **Numeração das partes**: a Leitura da Bíblia é sempre o item **3**; as
  partes de "Faça seu melhor no Ministério" seguem a partir do **4**, na
  ordem em que aparecem no array `ministerio` daquela semana (índice do
  array + 4) — reflete a estrutura real da reunião Vida e Ministério. O
  campo "Número da parte" mostra o número concatenado com o tipo (ex.:
  `"3 - Leitura da Bíblia"`, `"4 - Iniciando conversas"`), editável.
- **Dados da designação selecionada**: Nome, Ajudante (editáveis), Data
  (texto livre `DD/MM/AAAA` + botão de calendário), Número da parte, Local
  (rádio: Salão principal/Sala B/Sala C, padrão "Salão principal"), e um
  campo de observação (textarea dentro de um card informativo azul) que
  vem pré-preenchido com o texto padrão do aviso ao estudante (igual ao
  slip real S-89 da JW: "A lição e a fonte de matéria... (S-38)"), mas é
  editável.
- **Minicalendário de destaque** (botão de calendário ao lado do campo
  Data): como o Cartão só guarda a semana como intervalo (ex.:
  "03 – 09 DE AGOSTO"), não uma data exata, o popup mostra o mês inteiro e
  destaca em vermelho **todas** as datas do mês que caem no dia da semana
  escolhido em "Dia da Reunião" — o usuário clica na data certa dentro do
  intervalo da semana. Implementado em `CalendarioDestaquePopup`,
  independente da grade do Calendário de Pregação (usa `getDay()` direto,
  não o `gerarDias`/`ORDEM_DIAS` daquela tela).
- **Pré-visualização do cartão**: card com o cabeçalho fixo "DESIGNAÇÃO
  PARA A REUNIÃO NOSSA VIDA E MINISTÉRIO CRISTÃO", os dados preenchidos,
  os 3 checkboxes de Local (só o escolhido marcado) e a observação —
  atualiza em tempo real conforme o formulário muda.
- **Enviar cartão** (botões "Enviar pelo WhatsApp" / "Enviar por e-mail"):
  "Enviar por e-mail" continua só **visualmente** (mostra aviso de que o
  envio real fica para uma próxima etapa). "Enviar pelo WhatsApp" **já
  funciona de verdade** (ver `abrirWhatsapp`/`montarMensagemWhatsapp`,
  `wa.me`) — busca o telefone no Cadastro de Publicadores por nome
  (`encontraPublicadorPorNome`) e, se não achar, abre um modal para
  cadastrar o telefone na hora (com a validação de duplicado de §5.8)
  antes de prosseguir.
- **Mensagem do WhatsApp** (formato atualizado em 18/09/2026): saudação
  personalizada (Irmão/Irmã + primeiro nome, gênero adivinhado ou
  confirmado pelo usuário), seguida de `Nome:`, `Ajudante:` (só se
  houver), `*Data: ...*` **em negrito** (sintaxe `*texto*` do próprio
  WhatsApp) e `Número da parte:`. O campo **Local não entra mais na
  mensagem** (continua visível só na pré-visualização em tela) — pedido
  explícito do usuário. Ver `montarMensagemWhatsapp`.
- **Pendências conhecidas / decisões explicitamente adiadas pelo usuário:**
  envio real por e-mail; múltiplos meses no dropdown "Mês da reunião"
  (depende de backend). (A ligação com Cadastro de Publicadores e o envio
  real por WhatsApp **já foram feitos** — ver acima.) O usuário disse que
  vai continuar mandando pontos de ajuste incrementalmente para esta
  tela — **não considerar esta tela "fechada"**.

### 5.10 Estatísticas de Designações (construída 21-22/09/2026)
- Item de menu (`MENU_ESTATISTICAS`, ícone `grafico`) virou `pronto: true`
  e ganhou tela própria (`TelaEstatisticas`, padrão Sidebar/`M.layout`).
  Painel analítico de equilíbrio de designações, para ajudar a distribuir
  as partes dos meses seguintes de forma justa e variada. **Ferramenta de
  apoio à decisão — nunca gera designações automaticamente.**
- **Fonte de dados**: histórico de uma planilha (2025-2026) convertido
  para `src/data/designacoes.json` (git-tracked, **380 registros** depois
  das correções abaixo) + os dados do Cartão de Designações atual
  (`registrosDoCartao(cartao)`, em append) — combinados e deduplicados
  (`data|tipo|titular|ajudante`) num único `useMemo` (`an`). Presidente e
  orações ficam **fora de toda análise** (regra obrigatória do usuário).
- **Segmentação de elegibilidade**: o Cadastro de Publicadores ganhou os
  campos `elegibilidade` (Não definido / Ancião / Servo ministerial /
  Publicador batizado / Irmã) e `ativo`, para nunca comparar pessoas de
  grupos diferentes no mesmo ranking de justiça.
- **A. Volume por irmão**: total/média mensal, titular×ajudante, carga por
  categoria (Tesouros/Ministério/Vida Cristã). Colunas "Irmão" e "Grupo"
  são **editáveis**, todas as colunas têm ordenação por clique (ícone ⇅).
  Editar o nome funde de verdade os dados (ver "Fusão manual" abaixo).
- **B. Rodízio e recência** — tabela "FILA DE DESIGNAÇÃO": dias sem parte
  e última data **separados por papel** (titular × ajudante, colunas de
  titular com fundo azul claro), ignorando designações futuras já
  adiantadas no cartão (nunca aparece número negativo); ordenação por
  clique em qualquer coluna; clicar numa linha destaca ela inteira em
  vermelho claro. ("Esquecidos" e "Dispersão por grupo" foram retirados
  desta tela a pedido do usuário — ficam para uma rodada futura.)
- **C. Duplas (parcerias)**: "Duplas mais repetidas" e o mapa de calor
  (irmão × irmão) sem mudança de comportamento. "Parceiros distintos por
  irmão" — ordenado alfabeticamente, 8 linhas visíveis com rolagem;
  clicar no nome (marcado com +/−) expande quem já fez parte com a pessoa
  (e quando); a lista de quem **nunca** fez parte fica numa caixa própria
  abaixo da tabela (mesma largura, até 4 linhas com rolagem), em
  vermelho, **ordenada por gênero** — primeiro o mesmo gênero da pessoa
  selecionada, depois gênero indefinido (a transição) e por último o
  outro gênero. Gênero usa o grupo "Irmã" do Cadastro de Publicadores e o
  mesmo mecanismo de adivinhação/confirmação já usado no envio por
  WhatsApp (§5.9).
- **D. Variedade de partes** (pessoa × tipo): ordenação só na coluna
  "Irmão"; cabeçalhos dos tipos quebram linha sem quebrar palavra (fonte
  menor, nomes completos); "Conc." virou "Concentração" por extenso;
  clicar na linha destaca em vermelho claro; coluna "Irmão" fica fixa ao
  rolar a tabela na horizontal; tabela limitada a ~20 linhas visíveis com
  rolagem vertical.
- **E. Apoio à montagem do próximo mês**: score de sugestão configurável
  (intervalo/carga/tipo/parceiro), alertas (dupla repetida, +2 partes no
  mês, esquecido há muito tempo) e simulação de designação hipotética.
- **Fusão manual de nomes (recálculo real)**: `fusoesNome` e
  `gruposOverride` (`useEstadoSalvo`) guardam as correções feitas na
  tabela A; `resolveNomeFinal()` aplica a cadeia de fusões (protegida
  contra ciclo) dentro do `useMemo` de agregação — corrigir "Lucas S."
  para "Lucas Soares" soma de verdade tudo que era do nome antigo no nome
  novo, refletindo em todos os relatórios (A-E). Commit só ao sair da
  célula (Enter/blur/setas); inputs não-controlados (`defaultValue`+`key`)
  para não perder foco durante a digitação. Navegação por teclado nas
  células Irmão/Grupo: setas cima/baixo e Enter vão para a mesma coluna na
  linha seguinte/anterior; esquerda/direita só trocam de célula quando o
  cursor já está na ponta do texto.
- **Exportar/Importar JSON**: "Exportar JSON" baixa `periodo`, `registros`,
  `fusoesNome` e `gruposOverride`; "Importar JSON" restaura só as duas
  últimas chaves (as correções manuais) — nunca apaga o que já existe se
  o arquivo não trouxer essas chaves (ex.: backup de versão antiga só com
  `registros`), sempre avisando o que foi ou não alterado.
- **Correções feitas na base histórica** (`src/data/designacoes.json`,
  durante validação com o usuário):
  - "Vicente" (2 designações) e "José Vicente" (7, incluindo a mais
    recente) eram pessoas separadas por um limite do script original de
    clusterização (só juntava nomes com o mesmo primeiro nome) —
    corrigido via `aliasMap` (`"José Vicente": "Vicente"`).
  - 12 registros tinham **dois nomes numa única célula** (ex.: "Ariane e
    Cacilda", "Felipe M. / Aline", "Marjore/Zé Carlos") — separados em
    titular+ajudante reais. Numa primeira tentativa, a separação
    sobrescreveu sem querer o nome que já estava correto no outro campo
    (perdendo "Elizene", "Cristiane Ribeiro", "José Carlos", "Sarah" e
    "Dayane" como titulares); corrigido preservando o nome já existente e
    duplicando a designação para cada nome do campo composto.
  - O mesmo padrão apareceu também no Cartão de Designações atual ("Sarah
    / Priscilla e Rebeca"): `registrosDoCartao()` agora separa um campo
    de ajudante com "e" em duas designações de ajudante para o mesmo
    titular.
- Ver §6 para o histórico detalhado desta construção, incluindo os bugs
  encontrados e corrigidos no processo.

---

## 6. Revisão em andamento — histórico de itens já resolvidos

### Discurso Público (item 1 — concluído e em produção, set/2026)
1. ~~Bug: colar 4 discursos do WhatsApp só reconhecia 3~~ — **corrigido**
   (causa: formatos de data não previstos — ordinal, ponto, dia da semana).
2. ~~Adicionar botão "Exportar PDF"~~ — **feito**, com garantia de **1
   página A4 sempre**, independente do conteúdo:
   - `@page { size: A4 portrait; margin: 12mm; }`.
   - Conteúdo não-imprimível é removido do fluxo (`display:none`), não só
     escondido — evita a paginação fantasma que replicava o cartão em
     páginas extras.
   - A moldura vinho tem **altura fixa entre 200mm e 220mm com
     `overflow: hidden`** (não apenas `min-height`) — a garantia de página
     única é 100% CSS, não depende de nenhum evento (`beforeprint`) rodar
     a tempo. Valor reduzido de 250mm para 220mm depois de descobrir que
     250mm deixava pouca folga (23mm) contra a área útil real da A4 —
     risco em dispositivos/impressoras que não respeitam exatamente o
     `@page` (ex.: papel Carta/Letter em vez de A4). Com 220mm, sobra
     folga bem maior mesmo nesses casos.
   - Conteúdo limitado na origem para nunca precisar cortar: **máx. 6
     discursos e 3 observações** (bloqueado nos botões "+ Adicionar" e no
     colar do WhatsApp, que trunca com aviso se detectar mais de 6).
   - Os 3 blocos da folha (cabeçalho+foto, tabela, observações) se
     distribuem com `justify-content: space-evenly` quando há menos
     conteúdo que o máximo, preenchendo a página em vez de deixar vão
     vazio embaixo.
   - Foto do orador aumentada (agora 7,85cm × 5,56cm, `object-fit: cover`).

3. ~~Colar do WhatsApp: rótulo "Tema" e símbolos `*`/`:` vazando no tema~~
   — **corrigido**, em produção (08-09/2026):
   - Rótulo "Tema" (qualquer caixa, com ou sem `*`/`:`) é removido, seja
     como prefixo na mesma linha ou como linha isolada antes do texto.
   - Símbolos `*` (negrito do WhatsApp) e `:` são removidos de qualquer
     posição no tema/subtítulo — não só ao redor do rótulo "Tema".
   - Bug real encontrado no meio da correção: o WhatsApp permite negritar
     como `*Tema:*` (asterisco depois dos dois-pontos) **ou** `*Tema*:`
     (asterisco antes) — a regra inicial só reconhecia a segunda forma, e
     com `*Tema:*` (a mais comum) o rótulo não era descartado, empurrando
     o tema real para o campo de subtítulo. Correção definitiva: remover
     todos os `*`/`:` da linha primeiro, só depois checar se sobrou o
     rótulo "tema" — evita ter que prever cada ordem possível.
   - Datas `DD/MM/AAAA` viram `DD/MM` (ano descartado do campo); ponto
     final na data (`23/08/2026.`) é ignorado sem afetar o ponto usado
     como separador alternativo (`13.09`).
   - Campo "Mês / Ano" é preenchido automaticamente a partir do mês/ano da
     primeira data reconhecida (ex.: `09/2026` → "Setembro/2026"),
     mostrado na prévia antes de aplicar.

4. ~~PDF ainda saía em 2 páginas no Safari/iPad (página 2 em branco)~~ —
   **corrigido**, em produção (08/09/2026). **Causa raiz real, não
   relacionada a tamanho de conteúdo:** o `<div>` raiz de todo o app
   (`M.appShell`, renderizado pelo componente `App`, bem acima de
   qualquer tela) tem `min-height: 100vh`, e essa regra nunca era
   neutralizada durante a impressão — só o container interno da própria
   tela (`.pagina-com-impressao`) tinha sido corrigido antes. Em
   navegadores que resolvem `100vh` de forma mais generosa em contexto de
   impressão (caso do Safari no iPad, confirmado por print real do
   usuário mostrando "Página 1 de 2" com a página 2 inteiramente branca),
   isso força pelo menos uma tela cheia de altura e estoura para uma
   segunda página — o Chromium usado nos testes automatizados nunca
   reproduziu isso, por isso passou despercebido até o teste no
   dispositivo real. Corrigido zerando `min-height`/`height` em toda a
   cadeia de containers (`html`, `body`, `#root`, `.app-shell`,
   `.pagina-com-impressao`) durante a impressão — não só no container da
   tela, mas em TODOS os ancestrais até a raiz do DOM. **Lição para as
   próximas telas com exportar PDF:** replicar esse reset completo da
   cadeia de containers desde o início, não só o container da tela.

*(Publicado em produção em 08/09/2026.)*

**Nota técnica:** durante a correção do item 2, `package.json`/
`package-lock.json` haviam divergido entre `main` e a branch de trabalho
(o usuário atualizou Vite 5→6 e `@vitejs/plugin-react` 4→5 direto pelo
GitHub, e um `package-lock.json` chegou a ser apagado em `main`). Foi
feito merge de `main` na branch de trabalho, lockfile regenerado e todas
as telas validadas antes de promover — branches sincronizadas novamente.

### Reunião A Sentinela (item 1 — publicado em `preview`, 11/09/2026)
1. ~~Parser do "Colar do WhatsApp" não reconhecia o formato real do
   usuário (sem dois-pontos, cabeçalho "Dia DD mês")~~ — **corrigido**:
   novo reconhecimento de "Dia DD mês" → "DD – Mês – AAAA" (ano corrente
   do sistema), designações sem dois-pontos ("Presidente Nome" etc.) com
   tolerância a typos comuns ("Tudo"/"Leito"), "Oração Inicial" auto-
   preenchida a partir do Presidente, e "Mês / Ano" detectado
   automaticamente. Limite de 5 semanas / 3 observações.
2. ~~Adicionar botão "Exportar PDF"~~ — **feito**, reaproveitando 100% da
   infraestrutura de impressão já global (classes `oculta-impressao`,
   `pagina-com-impressao`, `secao-impressao`, `#area-impressao`,
   `pv-moldura`/`pv-moldura-interna`).

**Bug real descoberto e corrigido durante este desenvolvimento — relevante
para QUALQUER tela futura com exportar PDF:** o mecanismo de "encolher
para caber em 1 página" usava `el.style.transform = "scale(...)"`. Isso é
**visual apenas** — não influencia o cálculo de paginação do navegador,
que decide quantas páginas usar a partir do layout **antes** do transform
ser aplicado. Para conteúdo que cabia naturalmente em uma página (caso do
Discurso Público, sempre ≤6 temas/3 obs), isso nunca dava problema porque
o "scale" quase nunca precisava reduzir de verdade. Mas a Reunião A
Sentinela tem blocos bem maiores por semana, e com 4-5 semanas o conteúdo
natural passa de uma página — revelando dois problemas ao mesmo tempo:
(a) mesmo com o fator de escala calculado corretamente, o `transform`
não evitava a segunda página; (b) o corte rígido (`overflow: hidden` +
`max-height: 220mm`) que existia como proteção extra para o Discurso
Público **descartava silenciosamente** o conteúdo que excedia o limite
(as observações somem sem nenhum aviso, sem erro no console). Corrigido
trocando `transform: scale()` por `zoom` (que realmente redimensiona o
layout antes da paginação) e removendo o corte rígido, mantendo só
`min-height: 200mm` como piso decorativo. Testado até o limite de 5
semanas + 3 observações, com e sem o evento `beforeprint` disparado, e em
papel Carta/Letter com margem de 1 polegada — sempre 1 página, sempre com
todo o conteúdo visível. **Essa correção está no CSS global
compartilhado, então o Discurso Público também se beneficia dela.**

3. ~~Linhas de designação muito altas no PDF~~ — **corrigido**: nas
   semanas normais, as 5 linhas (Presidente, Oração Inicial, Estudo da
   Revista A Sentinela, Leitor do Estudo da Revista, Oração Final) ficam
   compactas (padding menor + fonte 8px) só na impressão — a tela de
   edição não muda. Reduz a altura natural de ~270mm para ~210mm com 4
   semanas, então o PDF quase não precisa mais reduzir escala.

*(Concluída e publicada em produção em 12/09/2026.)*

### Cartão de Designações (item 1 — publicado em produção, 12/09/2026)
1. ~~Adicionar botão "Exportar PDF"~~ — **feito**, com layout de impressão
   **diferente** das telas anteriores: em vez de forçar 1 página sempre
   (conteúdo por semana é longo demais para isso), pagina de verdade com
   **até 2 semanas por página física**, cabeçalho do cartão (título,
   subtítulo, congregação, mês/ano) repetido no topo de cada página, e
   observações na última página. Implementado com quebra de página via
   CSS (`break-after`/`page-break-after` a cada par de semanas,
   `break-inside: avoid` em cada semana) — sem precisar de zoom/escala,
   já que aqui múltiplas páginas são o comportamento desejado, não uma
   exceção a evitar. Nova classe global reutilizável
   `.somente-impressao` (o inverso de `.oculta-impressao`: escondida na
   tela, visível só na impressão), útil para futuras telas que também
   precisem de uma versão de impressão estruturalmente diferente da
   pré-visualização em tela. Testado com as 5 semanas padrão → 3 páginas
   (2+2+1), tela de edição/pré-visualização contínua inalteradas.

*(Publicado em produção em 12/09/2026. Usuário indicou que enviará mais
pontos de ajuste para esta tela após validar este layout — aguardando.)*

### Cartão de Designações (item 2 — publicado em produção, 17/09/2026)
1. ~~Import de PDF quebrado em formato novo de apostilado~~ — usuário
   enviou um PDF real (`mwb_T_202609.pdf`) que dava erro "Não consegui ler
   esse arquivo". Diagnóstico: acentos decompostos em glifos separados
   **e**, mais grave, o PDF não tem nenhuma anotação (`getAnnotations()`
   vazio) — os nomes são texto de página comum, não a anotação FreeText de
   que o recurso inteiro dependia. Após duas rodadas de perguntas, o
   usuário decidiu **remover o import por completo** (16/09) — `pdfjs-dist`
   desinstalado, bundle caiu de ~2,2 MB para 456 KB, tela virou só
   preenchimento manual.
2. Na sequência, o usuário pediu uma reestruturação grande (Mês/Ano
   dropdown + semanas automáticas + quase todo campo virando `<select>` do
   Cadastro de Publicadores) — implementada, validada em `preview` com
   Playwright (inclusive o caso de virada de mês, ex.: Ago→Set/2026), mas
   **revertida a pedido do usuário** pouco depois (revert por commit,
   `ad7ffa5` → `96f2d64`, sem force-push). Ver nota em §5.3 sobre não
   reabrir essa ideia sem pedido explícito.
3. ~~Adicionar botão "Exportar JSON"~~ — **feito** (17/09): baixa o
   `dados` completo da tela, para servir de base a futuras
   análises/estatísticas de partes. Ver §5.3.

*(Publicado em produção em 17/09/2026.)*

### Cartão de Designações (item 3) e telas relacionadas (publicado em produção, 18/09/2026)
1. ~~Botão "Limpar"~~ — **feito**: reseta Mês/Ano e semanas (volta a uma
   semana em branco), pede confirmação antes (ação irreversível), e
   **não mexe nas Observações** — testado e confirmado via Playwright.
2. ~~Autocompletar por atalho de digitação~~ — **feito** em "Faça seu
   melhor no ministério" (Título e Detalhe) e em "Nossa Vida Cristã"
   (Título); "Lição da leitura" de semana nova já nasce com
   `"th lição "`. Ver detalhes técnicos em §5.3.
3. ~~Reordenar a mensagem do WhatsApp (Enviar Cartão de Designação)~~ —
   **feito**: agora segue Nome → Ajudante → Data (negrito) → Número da
   parte, sem o campo Local. Testado abrindo o link `wa.me` gerado e
   conferindo o texto decodificado.
4. ~~Atualizar cadastro de Publicadores com dados reais~~ — **feito**:
   usuário populou o cadastro pela própria tela ao longo do tempo,
   exportou o JSON e enviou; `src/data/publicadores.json` passou a ter
   os 16 publicadores reais (antes eram 5 de exemplo).
5. ~~Impedir publicador duplicado pelo telefone~~ — **feito**, nos dois
   pontos de cadastro (Cadastro de Publicadores e o cadastro rápido da
   tela Enviar Cartão de Designação), com a mensagem "Este contato já
   existe: \<nome\>." Ver §5.8.

*(Todos os itens validados em `preview` via Playwright antes de ir para
produção, no mesmo dia.)*

### Bastidores, Calendário e menu de Estatísticas (publicado em produção, 20/09/2026)
1. ~~Calendário: botão "Salvar" com confirmação visual~~ — **feito**. Ver §5.4.
2. ~~Bastidores: seletor de data exata por linha~~ — **feito**: começou com
   3 opções (atual + 2 próximas) e depois passou a **4** (inclui a semana
   anterior), a pedido do usuário. Ver §5.5.
3. ~~Bastidores: auto-preenchimento do mês pelo padrão dos 2 primeiros
   dias~~ — **feito**, de forma não-destrutiva (não apaga linhas nem dados;
   sem duplicar a linha editada). Bug de perda de dado e de linha duplicada
   foi pego nos testes Playwright e corrigido antes de subir. Ver §5.5.
4. ~~Menu lateral: divisória + item "Estatísticas"~~ — **feito** (esmaecido,
   sem tela ainda). Ver §5.10.
5. Observação: o usuário relatou que "o número do dia ficava vazio até
   selecionar o dia". Não consegui reproduzir esse comportamento nos testes
   (o valor sempre veio preenchido); o auto-preenchimento reduz muito a
   necessidade de mexer linha a linha. Ficou combinado que, se reaparecer,
   ele manda navegador/aparelho + passo a passo para investigar.

*(Todos os itens validados em `preview` via Playwright antes de ir para
produção.)*

### Cartão (Enter/backup), destaque de Bastidores e backups (produção, 20-21/09/2026)
1. ~~Bastidores: clicar num nome do resumo destaca as células na tabela~~ —
   **feito** (vermelho/azul, toggle). Ver §5.5.
2. ~~Cartão: navegar/adicionar parte pelo teclado~~ — **feito**: primeiro
   tentei Tab→botão+Espaço, que **não funciona no Safari** (não dá Tab a
   botões); a solução final foi **Enter no campo do designado** adiciona a
   parte e move o foco. Ver §5.3.
3. ~~Atualizar dados de fábrica do Cartão para Outubro/2026~~ — **feito**
   (JSON exportado pelo usuário substituiu o `CARTAO_INICIAL` inline).
4. ~~Botões Exportar/Importar (.json) em Cartão, Calendário e Bastidores~~ —
   **feito**, como backup manual até o backend. Testado o ciclo
   exportar→alterar→importar (restaura). Ver §3 e §5.3/§5.4/§5.5.
   - **Pegadinha registrada:** o backup só enxerga o `localStorage` da URL
     onde foi digitado; `preview` e `main` são separados. Por isso este lote
     foi para **produção** — é lá que o usuário tem os dados a salvar antes
     de limpar o cache.

*(Validados em `preview` via Playwright; publicados em produção em
21/09/2026.)*

### Estatísticas de Designações — construção da tela (produção, 21-22/09/2026)
1. ~~Construir o painel do zero (planilha + regras obrigatórias do
   usuário)~~ — **feito**: histórico convertido para `designacoes.json`,
   5 relatórios (A-E), segmentação de elegibilidade no Cadastro de
   Publicadores. Ver §5.10.
2. ~~1ª rodada: fonte/tamanho, colunas Irmão/Grupo editáveis, ordenação
   por coluna, remover o quadro de pesos/limites~~ — **feito**.
3. ~~Editar um nome deve recalcular de verdade, não só trocar o texto
   exibido~~ — **feito**: redesenhado para `fusoesNome`/`resolveNomeFinal`
   real, aplicado dentro da agregação. Corrigido também um risco de perda
   de foco no input durante a digitação (inputs não-controlados).
4. ~~Navegação por teclado (setas/Enter) nas células Irmão/Grupo~~ —
   **feito**.
5. ~~Verificar/corrigir "Vicente" na Fila de escolha~~ — investigado a
   fundo: era bug de **dado** (clusterização incompleta no histórico), não
   de código. Corrigido na fonte (`aliasMap`), e aproveitado para escanear
   e corrigir mais 12 registros com nomes compostos numa única célula.
   Nessa correção inicial, um descuido meu sobrescreveu por engano nomes
   que já estavam certos no campo oposto (ex.: "Elizene" sumiu como
   titular); o usuário percebeu e a correção foi refeita preservando o
   nome existente e duplicando a designação por nome do campo composto.
6. ~~Botão "Importar JSON"~~ — **feito**, mas a 1ª versão tinha um bug
   sério: importar um arquivo sem `fusoesNome`/`gruposOverride` (ex.: um
   backup de versão antiga) **apagava silenciosamente** as correções já
   feitas. Corrigido para nunca sobrescrever com `{}` — só atualiza as
   chaves que o arquivo realmente trouxer, avisando o usuário do que
   aconteceu.
7. ~~Quadro B: fila de designação separada por titular/ajudante, com
   linha clicável para destacar~~ — **feito**.
8. ~~Quadro C: expandir parceiros/nunca-fez-parte, ordenado por gênero~~ —
   **feito**, reaproveitando o mecanismo de gênero já usado no envio por
   WhatsApp (§5.9).
9. ~~Quadro D: ordenação só no Irmão, cabeçalhos com quebra de linha,
   linha clicável, coluna Irmão fixa no scroll horizontal~~ — **feito**.
10. ~~Quadros C/D: ajustar altura das tabelas (8/4/20 linhas com
    rolagem)~~ — **feito**.
11. ~~Alinhar o cabeçalho de "Duplas mais repetidas" com "Parceiros
    distintos por irmão" (quadro C)~~ — levou 2 tentativas. A 1ª
    (adicionar uma nota abaixo do título, para as duas colunas terem a
    mesma quantidade de linhas de texto antes da tabela) só alinhava por
    **coincidência de largura de tela**: como as duas notas têm tamanhos
    de texto diferentes, em certas larguras uma quebra em mais linhas que
    a outra e o cabeçalho desalinha de novo — só não apareceu no primeiro
    teste porque a largura usada por acaso não expunha o problema.
    **Corrigido de verdade** reestruturando as duas colunas para
    compartilharem o mesmo grid CSS por linha (título / nota / tabela como
    linhas explícitas do grid, não blocos independentes por coluna) — a
    altura de cada linha passa a acompanhar o maior conteúdo dos dois
    lados automaticamente. Testado de 1100px a 1920px. **Lição para
    qualquer layout de duas colunas lado a lado nesta tela:** não confiar
    em "textos de tamanho parecido quebram do mesmo jeito" — usar linhas
    de grid compartilhadas quando o cabeçalho/início do conteúdo precisa
    alinhar entre colunas.
12. **Pegadinha de infraestrutura registrada:** um deploy em `preview`
    falhou não por causa do código, mas por um erro 403 transitório do
    GitHub Actions ao subir o artefato de publicação
    (`upload-pages-artifact`) — build e testes tinham passado
    normalmente. Resolvido só re-executando o job que falhou
    (`rerun_failed_jobs`); nenhuma mudança de código foi necessária. Se o
    usuário relatar de novo "limpei o cache e não mudou nada", checar
    primeiro o status do workflow no GitHub Actions antes de investigar
    o código.

*(Todos os itens validados em `preview` via Playwright antes de publicar;
publicado em produção em 22/09/2026.)*

### Calendário de Pregação e Bastidores (Exportar PDF adiantado, 12/09/2026)
1. ~~Adicionar botão "Exportar PDF" com garantia de 1 página~~ — **feito**
   nas duas telas, reaproveitando 100% do padrão zoom-to-fit já global
   (`impressaoRef` + `beforeprint`/`afterprint` ajustando `el.style.zoom`,
   classes `pagina-com-impressao`/`oculta-impressao`/`secao-impressao`/
   `#area-impressao`). No Calendário, `PreviewCalendario` ganhou as
   classes `pv-moldura`/`pv-moldura-interna` (antes não tinha, porque a
   tela não tinha impressão própria); no Bastidores, `PreviewBastidores`
   idem. Testado com o conteúdo padrão de cada tela → 1 página, sem
   conteúdo cortado, sem erros de console.
2. **Isto não é a revisão completa dessas duas telas** — foi um pedido
   pontual do usuário, fora da ordem de revisão combinada em §2/§7. A
   lista numerada de ajustes (como recebida para Discurso/Sentinela/
   Cartão) ainda não foi enviada pelo usuário para Calendário/Bastidores.

*(Publicado em produção em 12/09/2026, no mesmo lote do item 1 do Cartão
de Designações.)*

### Menu lateral — novos itens (12/09/2026)
1. ~~Linha separadora + "Enviar Cartão de Designação" + "Cadastro
   Publicadores" abaixo de Bastidores~~ — **feito**. Nasceu a constante
   `MENU_LATERAL_EXTRA` (ver §3) para itens de menu que não têm card na
   área principal. Os dois começaram com `pronto: false` (esmaecidos,
   clique não navega) e foram virando `pronto: true` conforme cada tela
   foi construída (Publicadores no mesmo dia; Enviar Cartão logo em
   seguida).

### Cadastro de Publicadores e Enviar Cartão de Designação (12-13/09/2026)
Ver §5.8 e §5.9 para a descrição funcional completa. Resumo do histórico:
1. ~~Construir Cadastro de Publicadores~~ (12/09) — **feito e em
   produção**, a partir de um exemplo de tela fornecido pelo usuário
   (nome + telefone com máscara, busca, paginação, editar/excluir).
2. ~~Construir Enviar Cartão de Designação — primeiro ponto~~ (12/09) —
   **feito e em produção**, também a partir de um exemplo de tela.
   Antes de implementar, 4 perguntas de arquitetura foram feitas ao
   usuário (a pedido dele mesmo, "para não termos que refazer depois") e
   todas as recomendações foram aceitas: (a) "Mês da reunião" mostra só o
   mês único que o Cartão guarda hoje, múltiplos meses ficam para o
   backend; (b) designação com 2 nomes ("Fulano / Beltrano") vira Nome +
   Ajudante, não duas linhas; (c) botões de envio só visuais por enquanto;
   (d) o par "Dia da Reunião" + minicalendário serve para achar a data
   exata dentro da semana (intervalo) do Cartão.
3. ~~Ajuste: mover "Dia da Reunião" para o topo (ao lado de "Mês da
   reunião") e não resetar ao trocar de designação~~ (13/09) — **feito**.
4. ~~Ajuste: "Número da parte" concatenado com o tipo da parte
   ("3 - Leitura da Bíblia", "4 - Iniciando conversas", ...), com Leitura
   da Bíblia sempre = 3 e Ministério a partir de 4~~ (13/09) — **feito**.

*(Publicado em produção em 13/09/2026, junto com o restante do lote desta
seção. Usuário confirmou que vai continuar mandando pontos de ajuste
incrementais para "Enviar Cartão de Designação" — tratar como tela viva,
não como capítulo fechado.)*

---

## 7. Roteiro (próximas etapas, nesta ordem)

1. ~~Revisão do Discurso Público~~ — concluída, em produção.
2. ~~Revisão da Reunião A Sentinela~~ — concluída, em produção.
3. **Continuar revisão do Cartão de Designações** (item 1 — Exportar PDF
   com 2 semanas por página — em produção; aguardando próximos pontos do
   usuário).
4. Revisar **Calendário de Pregação** (já tem Exportar PDF adiantado;
   falta a revisão completa por lista numerada de ajustes).
5. Revisar **Bastidores** (já tem Exportar PDF adiantado; falta a revisão
   completa por lista numerada de ajustes).
6. **Frente paralela em andamento:** continuar recebendo e implementando
   pontos de ajuste incrementais para **Enviar Cartão de Designação** (ver
   §5.9) — envio real por WhatsApp já feito (ligado ao Cadastro de
   Publicadores); falta o envio real por e-mail, quando o usuário pedir.
7. ~~Construir a tela de Estatísticas~~ — **feito e em produção** (ver
   §5.10/§6). Segue como frente incremental: o usuário vai mandando mais
   pontos de ajuste, mesmo padrão de "Enviar Cartão de Designação"
   (item 6) — não considerar esta tela "fechada".
8. Somente depois da revisão completa: **backend/banco de dados**
   (o usuário já tem uma VM Ubuntu na Oracle Cloud com PostgreSQL
   configurado, falta liberar acesso externo — pode ser feito em paralelo,
   sem bloquear o front) + **integração WhatsApp API** + **integração
   OneDrive API**, tudo via Git. É também quando "Mês da reunião" (Enviar
   Cartão) passa a ter múltiplos meses de histórico.

Decisão já tomada e confirmada pelo usuário: **front-end primeiro**, backend
depois — revisão pode mudar requisitos, e as funcionalidades de
exportar/imprimir/salvar não dependem de backend.

---

## 8. Padrões recorrentes de UX/processo (não reabrir sem necessidade)

- Fluxo de validação: entrego versão → usuário avalia e envia lista numerada
  de ajustes → implemento → screenshot se houver dúvida de layout → publico
  em `preview` → usuário confirma → só então produção.
- Nunca publicar em produção sem o usuário pedir explicitamente.
- Nunca force-push; produção avança só por fast-forward de `preview`.
- Botão "Voltar ao menu principal" em todas as telas internas.
- "Colar do WhatsApp" com prévia antes de aplicar, onde fizer sentido.
