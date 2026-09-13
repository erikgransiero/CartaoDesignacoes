# Gerenciador de Documentos — Congregação Parque Scaffid

Documento de registro do projeto (memória técnica e funcional).
Última atualização: 13/09/2026.

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

| Tela | Situação |
|---|---|
| Login | Concluída e em produção |
| Menu principal | Concluída e em produção |
| Discurso Público | Construída e revisada · em produção (ver §6) |
| Reunião A Sentinela | Construída e revisada · em produção (ver §6) |
| Cartão de Designações | Construída · **em revisão** (ver §6), item 1 em produção |
| Calendário de Pregação | Construída · Exportar PDF (1 página) em produção; revisão completa (lista de ajustes) ainda não iniciada |
| Bastidores | Construída · Exportar PDF (1 página) em produção; revisão completa (lista de ajustes) ainda não iniciada |
| Configurações → Usuários | Concluída e em produção |
| Cadastro de Publicadores | Construída e em produção (nova, ver §5.8) |
| Enviar Cartão de Designação | Construída e em produção · **em desenvolvimento incremental** (ver §5.9/§6) |

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
- **Leitura de PDF** (import automático no Cartão de Designações): feita no
  navegador com `pdfjs-dist`. Os nomes dos designados no apostilado da JW
  são **anotações PDF do tipo FreeText**, não texto de página — foi
  necessário correlacionar posição (distância em Y) entre estrutura extraída
  do texto e as anotações.
- **Exportar PDF:** abordagem escolhida é `window.print()` + CSS
  `@media print` (sem biblioteca extra), imprimindo só a área de
  pré-visualização (`id="area-impressao"`, regra genérica reaproveitável em
  qualquer tela). Implementado assim no Discurso Público; replicar o mesmo
  padrão nas demais telas quando pedido.
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
- Import automático a partir do PDF anotado do apostilado (FreeText
  annotations) — reconhece nomes dos designados por parte (Tesouros,
  Ministério, Vida Cristã).
- Blocos semanais editáveis manualmente como alternativa/complemento ao
  import.
- Usado como referência cruzada pela validação de conflitos do Bastidores
  (mesmo nome na mesma semana).
- **Exportar PDF**: layout próprio, diferente das telas anteriores — em
  vez de forçar 1 página sempre, pagina de verdade com **até 2 semanas
  por página física** (cabeçalho do cartão repetido em cada página,
  observações na última). Ver §6.
- Em **revisão** no ciclo atual (item 1 concluído, em produção).

### 5.4 Calendário de Pregação
- Grade automática de 7 colunas a partir do mês/ano.
- Célula = texto livre, cor de fundo por dia, formatação de trecho
  (cor/negrito), notas de rodapé (Nota/Título), imagem do topo editável.
- **Exportar PDF**: mesmo padrão de página única (zoom-to-fit) do Discurso
  Público/Sentinela — adiantado a pedido do usuário; revisão completa
  (lista numerada de ajustes) ainda **não iniciada**.

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
  não escalados no mês.
- **Realce de linha inteira**: Evento (amarelo, layout normal) ou Aviso
  (vermelho, mescla todas as colunas e abre campo de texto livre).
- **Exportar PDF**: mesmo padrão de página única (zoom-to-fit) das demais
  telas — adiantado a pedido do usuário; revisão completa (lista numerada
  de ajustes) ainda **não iniciada**.

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
  presentes só **visualmente** por decisão explícita do usuário — ao
  clicar, mostram um aviso de que o envio real fica para uma próxima
  etapa. Ainda não puxam telefone do Cadastro de Publicadores nem montam
  mensagem nenhuma.
- **Pendências conhecidas / decisões explicitamente adiadas pelo usuário:**
  ligação com Cadastro de Publicadores (por nome) para obter telefone;
  envio real por WhatsApp (`wa.me`) e e-mail; múltiplos meses no dropdown
  "Mês da reunião" (depende de backend). O usuário disse que vai continuar
  mandando pontos de ajuste incrementalmente para esta tela — **não
  considerar esta tela "fechada"**.

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
   §5.9) — inclui, quando o usuário pedir, ligar essa tela ao Cadastro de
   Publicadores (buscar telefone por nome) e implementar o envio real
   (WhatsApp/e-mail).
7. Somente depois da revisão completa: **backend/banco de dados**
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
