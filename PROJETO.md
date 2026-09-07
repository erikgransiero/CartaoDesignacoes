# Gerenciador de Documentos — Congregação Parque Scaffid

Documento de registro do projeto (memória técnica e funcional).
Última atualização: setembro/2026.

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
produção.** O projeto entrou na fase de **revisão tela-por-tela**, simulando
o uso real mensal, para adicionar funcionalidades que faltam (exportar PDF,
imprimir, corrigir bugs de parsing) antes de partir para backend/integrações.

| Tela | Situação |
|---|---|
| Login | Concluída e em produção |
| Menu principal | Concluída e em produção |
| Discurso Público | Construída · **em revisão** (ver §6) |
| Reunião A Sentinela | Construída · revisão ainda não iniciada |
| Cartão de Designações | Construída · revisão ainda não iniciada |
| Calendário de Pregação | Construída · revisão ainda não iniciada |
| Bastidores | Construída · revisão ainda não iniciada |
| Configurações → Usuários | Concluída e em produção |

**Ordem da revisão escolhida pelo usuário:** Discurso Público → Reunião A
Sentinela → Cartão de Designações → Calendário de Pregação → Bastidores.
Para cada tela: o usuário simula o dia a dia, envia uma lista numerada de
ajustes, eu implemento, valido em `preview`, e só então avançamos para a
próxima tela.

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
  Reconhece datas em `DD/MM`, `DD/MM/AAAA`, `DD de <mês>`, dia ordinal
  (`1º de setembro`), separador por ponto (`13.09`) e prefixo de dia da
  semana (`Domingo, 06/09`) — corrigido em set/2026 (antes perdia talks
  nesses formatos).
- **Exportar PDF**: botão no cabeçalho, imprime apenas a pré-visualização.

### 5.2 Reunião A Sentinela
- Blocos semanais com campos que mudam conforme o tipo: Semana Normal,
  Assembleia, Congresso, Visita do SC.
- Colar do WhatsApp + Processar (reconhece cabeçalho de data e pares
  "Rótulo: Nome"), observações editáveis com destaque em vinho.
- Ainda **não revisado** no ciclo atual — pendências desconhecidas até a
  simulação de uso real.

### 5.3 Cartão de Designações
- Import automático a partir do PDF anotado do apostilado (FreeText
  annotations) — reconhece nomes dos designados por parte (Tesouros,
  Ministério, Vida Cristã).
- Blocos semanais editáveis manualmente como alternativa/complemento ao
  import.
- Usado como referência cruzada pela validação de conflitos do Bastidores
  (mesmo nome na mesma semana).
- Ainda **não revisado** no ciclo atual.

### 5.4 Calendário de Pregação
- Grade automática de 7 colunas a partir do mês/ano.
- Célula = texto livre, cor de fundo por dia, formatação de trecho
  (cor/negrito), notas de rodapé (Nota/Título), imagem do topo editável.
- Ainda **não revisado** no ciclo atual.

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
- Ainda **não revisado** no ciclo atual.

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

---

## 6. Revisão em andamento — histórico de itens já resolvidos

### Discurso Público (item 1 concluído em set/2026)
1. ~~Bug: colar 4 discursos do WhatsApp só reconhecia 3~~ — **corrigido**
   (causa: formatos de data não previstos — ordinal, ponto, dia da semana).
2. ~~Adicionar botão "Exportar PDF"~~ — **feito** (`window.print()` +
   `@media print`, área `id="area-impressao"`).

*(Publicado em `preview`, aguardando validação do usuário antes de seguir
para a próxima tela: Reunião A Sentinela.)*

---

## 7. Roteiro (próximas etapas, nesta ordem)

1. **Finalizar revisão do Discurso Público** (aguardando validação do
   usuário no `preview`).
2. Revisar **Reunião A Sentinela** (simulação de uso + lista de ajustes).
3. Revisar **Cartão de Designações**.
4. Revisar **Calendário de Pregação**.
5. Revisar **Bastidores**.
6. Somente depois da revisão completa: **backend/banco de dados**
   (o usuário já tem uma VM Ubuntu na Oracle Cloud com PostgreSQL
   configurado, falta liberar acesso externo — pode ser feito em paralelo,
   sem bloquear o front) + **integração WhatsApp API** + **integração
   OneDrive API**, tudo via Git.

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
