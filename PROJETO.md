# Gerenciador de Documentos — Congregação Parque Scaffid

Documento de registro do projeto (memória técnica e funcional).
Última atualização: agosto/2026.

---

## 1. Objetivo do projeto

Aplicação web para **gerar e versionar os documentos mensais da congregação** a partir de dados variáveis do mês, mantendo uma identidade visual padronizada. O elder (Sr. Ancião) extrai as instruções de textos, PDFs e WhatsApp, alimenta o sistema e obtém os documentos prontos, sem reformatação manual.

Princípio central: **separar os dados (nomes, datas, temas) do estilo (cores, bordas, layout)**. O usuário troca apenas os dados do mês; o estilo é constante.

---

## 2. Documentos em escopo

São cinco documentos mensais padronizados:

1. **Discurso Público de final de semana** — tabela de datas e temas.
2. **Reunião A Sentinela** — blocos semanais de designações de fim de semana.
3. **Cartão de Designações** — reuniões de meio de semana (Vida e Ministério Cristão).
4. **Calendário de Pregação** — grade mensal de atividades de campo.
5. **Bastidores** — áudio/vídeo, volantes, indicadores e limpeza.

---

## 3. Estado atual (o que já está pronto)

| Documento | Situação | Conectado ao menu |
|---|---|---|
| Tela inicial (menu) | Concluída | — |
| Discurso Público | Concluído e validado | Sim |
| Reunião A Sentinela | Concluído e validado | Sim |
| Calendário de Pregação | Concluído e validado | Sim |
| Cartão de Designações | Pendente | Cartão "Em construção" |
| Bastidores | Pendente | Cartão "Em construção" |

---

## 4. Decisões de arquitetura

- **Geração por código (Caminho 1):** os documentos são construídos programaticamente (biblioteca `docx-js`), com os parâmetros de estilo centralizados e comentados, em vez de usar um template `.docx` editável. A estrutura de dados JSON permanece a mesma caso se opte por migrar no futuro.
- **Dados separados do estilo:** cada documento lê de um objeto de dados do mês; o estilo é aplicado à parte.
- **Preview ≠ A4:** a pré-visualização na tela serve para editar e conferir (é completa em conteúdo, mas não é espelho milimétrico do A4). O ajuste para folha A4 (dimensões, margens, quebras) fica para a **etapa de exportação**, usando o mesmo motor de geração já provado no piloto do Discurso Público.
- **Nuvem escolhida:** OneDrive (integração planejada para o final do projeto).
- **Entrada de dados atual:** colar texto/PDF manualmente. Automação por WhatsApp fica para a v2.
- **Hospedagem:** repositório Git (GitHub Pages / Vercel), conforme o primeiro projeto salvo em artefatos.
- **Referência visual da interface:** site jw.org (azul institucional, tipografia limpa, navegação por cartões).

---

## 5. Identidade visual (paleta do template)

| Elemento | Cor |
|---|---|
| Vinho (cabeçalhos, moldura, títulos) | `#800000` |
| Dourado (observações, destaques) | `#B08500` |
| Azul institucional (subtítulos, interface) | `#1F3864` |
| Rosa-claro (linha de congresso) | `#F2DEDE` |
| Fundo amarelo (linha de visita) | `#FBF3D5` |
| Marca-texto de trecho | `#FFF2A8` |

Fonte padrão dos documentos: Arial. Calendário em orientação paisagem (A4).

---

## 6. Tela inicial (menu)

- Barra lateral com logo JW.ORG e os cinco itens de documento, mais "Configurações" no rodapé.
- Área de boas-vindas ("Bem-vindo!") com ilustração superior direita.
- Cinco cartões de acesso (um por documento), com selo "Em construção" nos ainda não prontos.
- Rodapé com o texto de Gálatas 6:9 e ilustração inferior direita.
- **Regra de navegação:** toda tela interna possui o botão **"Voltar ao menu principal"**.
- As duas ilustrações (superior e inferior direita) foram extraídas do layout de referência e embutidas.

---

## 7. Funcionalidades por documento

### 7.1 Discurso Público (concluído)

- Tabela de datas e temas, fiel ao PDF (moldura vinho, cabeçalho, observações).
- **Dois modos de destaque por linha:**
  - **Amarelo:** tema em negrito + vinho; subtítulo em negrito + dourado.
  - **Rosa:** tema em itálico + negrito + vinho; subtítulo herda a mesma formatação.
- **Detecção automática de palavras-chave** (Congresso, superintendente, assembleia): sugere marcar a linha em amarelo (o usuário aceita ou dispensa).
- **Destaque de trecho selecionado** (marca-texto) dentro dos campos.
- **Observações importantes editáveis**, com destaque de trecho em vinho + negrito, adicionar e remover.
- **Foto do orador:** manter a original (embutida do documento) ou importar outra imagem.
- **Colar do WhatsApp + Processar:** interpreta o texto (data numa linha, tema na seguinte), mostra prévia e substitui os quadros; aplica realce automático (rosa/amarelo).
- **Adicionar / remover tema** avulso.

### 7.2 Reunião A Sentinela (concluído)

- Blocos semanais com **campos fixos por tipo de bloco**.
- **Dropdown de tipo de semana:** Semana Normal, Assembleia, Congresso, Visita do SC.
  - **Semana Normal:** Presidente, Oração Inicial, Estudo da Revista A Sentinela, Leitor do Estudo da Revista, Oração Final (caso o orador não fique).
  - **Assembleia / Congresso:** apenas Aviso e Subtítulo (renderizados com cabeçalho vinho e corpo rosa).
  - **Visita do SC:** Subtítulo, Presidente, Oração Inicial, Discurso Inicial (tema + responsável), Estudo da Revista (resumo), Discurso Final (tema + responsável), Oração Final.
- **Adicionar / remover semana** (meses com mais ou menos semanas).
- **Colar do WhatsApp + Processar:** reconhece cabeçalhos de data e pares "Rótulo: Nome", identifica o tipo de bloco e mostra prévia antes de substituir.
- **Observações editáveis** com destaque em vinho.
- **Logotipo "A SENTINELA"** (imagem extraída do documento original) centralizado no topo da pré-visualização.

### 7.3 Calendário de Pregação (concluído)

- **Grade automática** de 7 colunas (segunda a domingo), gerada a partir da quantidade de dias e do dia da semana em que o mês começa.
- **Cada dia = caixa de texto livre**, editada ao clicar no dia.
- **Cor de fundo por dia** (paleta: verde, dourado, rosa, azul, cinza ou nenhuma) para destacar datas especiais.
- **Formatação de trecho no texto do dia:** cor de fonte livre (qualquer cor), cor + negrito, ou só negrito, aplicada ao trecho selecionado.
- **Texto das células centralizado** na pré-visualização.
- **Título e Subtítulo opcionais:** caixa de seleção para exibir ou ocultar no calendário (nem todo mês há aviso).
- **Notas de rodapé** com adicionar/remover e escolha por dropdown entre **Nota** (padrão) e **Título** (vermelho + itálico).
- **Imagem do topo:** importar da galeria a cada mês ou manter a original.
- Observação: a antiga seção "Texto da campanha" (versículo, parágrafo, metas, encerramento) foi removida por ser específica de um mês atípico.

### 7.4 Cartão de Designações (pendente)

Ainda a construir. Estrutura de referência: blocos semanais (Jeremias, cânticos, orações) com Tesouros da Palavra de Deus, Faça Seu Melhor no Ministério e Nossa Vida Cristã, com designados por parte.

### 7.5 Bastidores (pendente)

Ainda a construir. Estrutura de referência: tabela por data com Áudio/Vídeo, Volante Direito, Volante Esquerdo, Indicador Entrada, Indicador Auditório e Limpeza Pós-Reunião, mais responsáveis e orientações.

---

## 8. Padrões recorrentes de UX

- **Fluxo de validação:** o assistente entrega uma versão → o Sr. Ancião avalia e envia correções numeradas → ajustes → nova validação.
- **Colar do WhatsApp:** presente onde faz sentido (Discurso Público, Sentinela); sempre com prévia antes de aplicar.
- **Destaques:** trecho selecionado e/ou linha inteira, conforme o documento.
- **Adicionar / remover** itens (temas, semanas, observações, notas) onde a quantidade varia por mês.
- **Botão "Voltar ao menu principal"** em todas as telas internas.

---

## 9. Roteiro (próximas etapas)

1. Construir o **Cartão de Designações** e conectá-lo ao menu.
2. Construir o **Bastidores** e conectá-lo ao menu.
3. **Exportação:** motor que gera cada documento em `.docx`/PDF no formato A4 a partir do JSON do mês.
4. **Integração com OneDrive:** armazenar templates e documentos do mês.
5. **v2 — Automação WhatsApp Business:** receber as instruções automaticamente, reaproveitando a lógica de interpretação já construída.

---

## 10. Stack técnico

- **Interface:** React (arquivo único `GerenciadorDocumentos.jsx`), estilo inspirado no jw.org.
- **Geração de documentos (piloto e exportação):** Node.js com `docx-js`; conversão para PDF via LibreOffice; inspeção visual via renderização de imagem.
- **Hospedagem:** GitHub Pages / Vercel.
- **Persistência (planejada):** OneDrive.
- **Entrada (planejada, v2):** WhatsApp Business.
