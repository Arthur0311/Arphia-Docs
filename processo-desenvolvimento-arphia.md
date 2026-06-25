# Processo de Desenvolvimento — Arphia / DamaTools

**Documento de referência interna**
Versão 1.1 · Junho de 2026

> **Arphia** é a empresa de tecnologia.
> **DamaTools** é a plataforma de software modular desenvolvida pela Arphia.

---

## Sumário

1. [Contexto e visão geral](#1-contexto-e-visão-geral)
2. [Equipe e responsabilidades](#2-equipe-e-responsabilidades)
3. [Plano de formação do desenvolvedor](#3-plano-de-formação-do-desenvolvedor)
4. [Sistema de Tiers de tarefas](#4-sistema-de-tiers-de-tarefas)
5. [Stack tecnológica](#5-stack-tecnológica)
6. [Arquitetura modular](#6-arquitetura-modular)
7. [Plataformas e custos](#7-plataformas-e-custos)
8. [Ambientes](#8-ambientes)
9. [Git flow e versionamento](#9-git-flow-e-versionamento)
10. [CI/CD](#10-cicd)
11. [Processo de trabalho (Scrumban adaptado)](#11-processo-de-trabalho-scrumban-adaptado)
12. [Comunicação](#12-comunicação)
13. [Uso da Inteligência Artificial](#13-uso-da-inteligência-artificial)
14. [Spec Driven Development (SDD)](#14-spec-driven-development-sdd)
15. [Segurança da aplicação](#15-segurança-da-aplicação)
16. [Code Review e qualidade](#16-code-review-e-qualidade)
17. [Monitoramento e observabilidade](#17-monitoramento-e-observabilidade)
18. [Roadmap de implantação](#18-roadmap-de-implantação)
19. [Indicadores de saúde do processo](#19-indicadores-de-saúde-do-processo)
20. [Gestão de dependências](#20-gestão-de-dependências)
21. [Apêndices](#21-apêndices)

---

## 1. Contexto e visão geral

### 1.1 Sobre a Arphia

A Arphia é uma empresa de tecnologia voltada a instituições financeiras reguladas pelo Banco Central do Brasil. Atende um nicho onde decisões dependem de interpretação regulatória correta, cálculos precisos e disciplina operacional — contexto em que erros geram exposição regulatória e perda de confiança do cliente.

### 1.2 O produto — DamaTools

DamaTools é a plataforma de software desenvolvida pela Arphia. É um produto modular: cada módulo resolve uma necessidade específica das instituições financeiras, e novos módulos são incorporados ao longo do tempo conforme o roadmap.

**Módulos em desenvolvimento atualmente:**

| Módulo | Função |
|---|---|
| AMCC | Geração e filing de arquivos regulatórios AMCC |
| Calculadora Financeira | Conversão de taxas, simulação de IOF, simulação de parcelas (pré + pós) |

### 1.3 Roadmap modular do DamaTools

O roadmap do produto está estruturado em três fases plurianuais. Esta visão de longo prazo é a base do planejamento estratégico da Arphia e fundamenta o desenho do processo descrito neste documento — pensado para sustentar essa cadência de entregas conforme a equipe amadurece.

**Fase 1 — entregas em 2027**

| Módulo | Descrição |
|---|---|
| Calculadora Financeira | Conversão de taxas, simulação IOF, simulação de parcelas (pré + pós) |
| RAS | Gestão dos indicadores da RAS |
| Calendário | Motor de eventos com calendários pré-cadastrados (informes, auditoria, RFB) e adicionados pelo cliente (demandas e lembretes específicos da IF) |
| FGC | Cálculos relacionados ao FGC (contribuições e limites operacionais) |

**Fase 2 — entregas em 2028**

| Módulo | Descrição |
|---|---|
| Rentabilidade de Produtos | Projeções de DRE (e realizado) por contrato/produto para avaliação de viabilidade |
| Ferramenta de Classificação | Classificação de risco de crédito, PLD, etc. |

**Fase 3 — entregas em 2029**

| Módulo | Descrição |
|---|---|
| Fluxo de Caixa | Fluxo de caixa realizado e projetado (com testes de estresse) |
| Orçamento | Orçamento realizado e projetado (com testes de estresse) para gestão de capital |

**Implicações desse roadmap para o processo:**

A natureza modular muda algumas decisões técnicas e processuais. Cada módulo terá suas próprias regras de domínio (FGC ≠ Calculadora ≠ RAS), seus próprios testes e potencialmente suas próprias dependências. O processo precisa suportar essa multiplicidade sem virar caos — o que se reflete na estrutura de pastas, no `CLAUDE.md` por módulo (ou seções dentro de um único arquivo) e na divisão de Tiers que aparece adiante.

### 1.4 A equipe

A equipe é composta por três pessoas, cada uma com papel claramente distinto:

| Pessoa | Função | Capacidade técnica |
|---|---|---|
| Sócio de negócio | Product Owner | Não-técnico |
| Tech Lead (sócio) | Arquitetura, domínio, código crítico | Sênior |
| Desenvolvedor | Em formação | Iniciante (background em WordPress e hospedagem) |

### 1.5 Princípios norteadores

Quatro princípios sustentam todas as decisões de processo descritas neste documento:

**Domínio acima de velocidade.** Errar uma fórmula de amortização ou interpretar mal uma resolução do CMN tem custo muito maior do que entregar uma feature uma semana depois. Toda decisão de processo prioriza correção sobre velocidade.

**O tech lead é recurso escasso a ser protegido.** Existe um único revisor sênior. Sem mecanismos explícitos de proteção desse tempo, ele rapidamente vira gargalo de tudo. O sistema de Tiers, a IA como filtro inicial e a revisão automatizada existem para isso.

**O desenvolvedor está aprendendo, não só produzindo.** Tratar um dev em formação como mini-sênior é a forma mais rápida de gerar código ruim em domínio crítico. A primeira fase do trabalho dele é estruturada como aprendizado, não como entrega.

**A IA é ferramenta, não substituto.** A IA acelera escrita de código e funciona como tutora. Não substitui entendimento, não substitui revisão humana em código crítico, e não substitui aprendizado real do desenvolvedor.

---

## 2. Equipe e responsabilidades

### 2.1 Sócio de negócio — Product Owner

**O que faz:**
- Define prioridades do produto e roadmap
- Mantém relacionamento com clientes (instituições financeiras)
- Valida se o que foi construído atende à necessidade de negócio
- Participa da Sprint Review (demonstração do que foi entregue)
- Atua como ponte entre regulação/cliente e a equipe técnica

**O que não faz:**
- Não escreve código
- Não revisa código tecnicamente
- Não decide stack ou arquitetura
- Não atribui tarefas técnicas diretamente ao dev (passa pelo tech lead)

### 2.2 Tech Lead — você

**O que faz:**
- Define arquitetura, stack e padrões técnicos
- Escreve todo código classificado como Tier 1 (crítico de domínio)
- Revisa 100% dos Pull Requests que tocam código de produção
- Codifica conhecimento de domínio no arquivo `CLAUDE.md` do projeto
- Mentora o desenvolvedor (pair programming semanal, revisões pedagógicas)
- Decide quando o dev está pronto para subir de Tier
- Configura CI/CD, ambientes, branch protection

**O que precisa proteger:**
- Tempo de revisão (orçamento mental diário: ~1h dedicada a PRs)
- Tempo de código profundo (Tier 1) — proteger blocos de 2-3 horas sem interrupção
- Capacidade de aprender e estudar regulação (PPGCONT)

### 2.3 Desenvolvedor — em formação

**Ponto de partida:** background em WordPress e hospedagem de sites. Conhece conceitos básicos de HTTP, domínios, FTP, e provavelmente o ciclo edit-save-refresh. Não tem experiência com programação estruturada, controle de versão, terminal avançado ou testes automatizados.

**O que vai fazer (evolução em fases — ver seção 3):**
- **Fase 0 (semanas 1-8):** aprender fundamentos, fazer tarefas guiadas
- **Fase 1 (semanas 9-16):** Tier 3 com alta supervisão
- **Fase 2 (semanas 17-24):** Tier 3 com autonomia + começar Tier 2
- **Fase 3 (a partir do 6º mês):** Tier 2 com autonomia, Tier 1 apenas com pair programming

**O que nunca faz, em nenhuma fase:**
- Merge direto em `main` ou `develop` (sempre via PR)
- Push em branch protegida
- Mexer em código Tier 1 sozinho
- Tomar decisão de arquitetura
- Confiar cegamente em código gerado por IA sem entender o que faz

### 2.4 Matriz RACI simplificada

Para cada tipo de atividade, quem é **R**esponsável, **A**provador, **C**onsultado, **I**nformado:

| Atividade | Sócio (PO) | Tech Lead | Dev |
|---|---|---|---|
| Priorização do backlog | R | C | I |
| Decisão de stack/arquitetura | I | R | I |
| Escrita de código Tier 1 | I | R | C |
| Escrita de código Tier 2 | I | A | R |
| Escrita de código Tier 3 | — | A | R |
| Code review de PRs | — | R | C |
| Configuração de ambientes/CI | I | R | C |
| Sprint Review (demo) | A | R | C |
| Retrospectiva semanal | C | R | R |

---

## 3. Plano de formação do desenvolvedor

Esta seção é a mais importante do documento. Sem um plano explícito de formação, o cenário mais provável é o dev escrever código em domínio financeiro sem entender o que está fazendo — gerando bugs invisíveis que só aparecem em produção, com impacto regulatório.

### 3.1 Realidade atual e ponto de partida

O dev tem familiaridade com WordPress e hospedagem. Isso significa que:

**O que ele já entende (aproveitar):**
- Como funciona um servidor web em alto nível
- Domínios, DNS, certificados SSL
- O conceito de banco de dados (mesmo que só MySQL via phpMyAdmin)
- HTML básico, provavelmente algum CSS
- A noção de "ambiente" (local vs produção)

**O que ele precisa aprender do zero:**
- Lógica de programação estruturada (variáveis, condicionais, loops, funções)
- Uma linguagem moderna (a definir na seção 5)
- Git e fluxo de trabalho com versionamento
- Terminal/linha de comando
- Testes automatizados
- Estruturação de código (módulos, separação de responsabilidades)
- Conceitos de domínio financeiro

### 3.2 Fase 0 — Fundamentos (semanas 1-8)

**Objetivo:** o dev sai dessa fase capaz de ler código do projeto, fazer pequenas alterações com supervisão direta e usar Git/IDE sem ajuda.

**Não há entrega de produto nessa fase.** Tentar extrair produtividade aqui é o erro mais comum e mais caro.

**Atividades:**

| Semana | Foco | Como medir progresso |
|---|---|---|
| 1-2 | Lógica de programação básica + ambiente de desenvolvimento | Conclui exercícios de lógica simples sem ajuda |
| 3-4 | Sintaxe da linguagem do projeto + Git básico | Faz commits e PRs corretamente |
| 5-6 | HTML/CSS modernos + JS básico (se for web) | Constrói uma página estática a partir de um mock |
| 7-8 | Fundamentos do framework escolhido + leitura de código existente | Consegue explicar o que um trecho de código faz |

**Trilha de estudos recomendada:**

- **Curso em vídeo, formato estruturado:** Curso em Vídeo (Gustavo Guanabara) para lógica e fundamentos web em português — gratuito e didático
- **Plataforma interativa:** Rocketseat Explorer (gratuito, foco em fundamentos web)
- **Documentação oficial:** MDN Web Docs para HTML/CSS/JS
- **IA como tutora:** Claude/ChatGPT para tirar dúvidas e explicar conceitos (NUNCA para gerar código a ser copiado sem entender)

**Cadência:**
- 4 horas/dia em estudo guiado
- 2 horas/dia em prática (exercícios, leitura do código do projeto)
- 1h semanal de pair programming com o tech lead

### 3.3 Fase 1 — Primeiro código produtivo (semanas 9-16)

**Objetivo:** o dev começa a produzir código que vai para produção, mas exclusivamente em Tier 3.

**Tipos de tarefa apropriados:**
- Ajustes de CSS e estilo visual
- Pequenos componentes de UI sem lógica de negócio
- Documentação de código existente
- Testes para código já escrito pelo tech lead
- Correção de bugs visuais
- Refatoração de nomenclatura

**Regras:**
- WIP limit de **1 tarefa** por vez
- PR aberto **diariamente** ou a cada 50 linhas de código (o que vier primeiro)
- Toda PR passa por CodeRabbit + revisão completa do tech lead
- 1h diária de pair programming nas primeiras 4 semanas, depois 2x por semana

### 3.4 Fase 2 — Autonomia em Tier 3, primeiros Tier 2 (semanas 17-24)

**Objetivo:** o dev faz Tier 3 com autonomia e começa a tocar em Tier 2 com supervisão.

**Tipos de tarefa adicionados:**
- Telas que consomem cálculos já validados
- Formulários de cadastro com validação simples
- Integrações com APIs já especificadas
- Relatórios baseados em dados já estruturados

**Mudanças no processo:**
- WIP limit sobe para 2 (mas só se uma das duas for Tier 3)
- Pair programming cai para 1x por semana
- PRs maiores são permitidos, mas ainda evitando blocos de >300 linhas

### 3.5 Fase 3+ — Maturação (a partir do 6º mês)

**Objetivo:** dev plenamente produtivo em Tier 2, começa a contribuir em Tier 1 via pair programming.

A partir daqui o processo se aproxima do que seria com dois devs intermediários. Tier 1 continua sendo predominantemente do tech lead, mas o dev participa de pair programming para transferir conhecimento de domínio.

### 3.6 Indicadores de progresso

Como medir se o dev está evoluindo no ritmo certo? Quatro sinais a observar:

1. **Tempo médio de PR** — diminuindo (PRs mais focados)
2. **Idas e voltas em revisão** — diminuindo (código fica melhor antes de submeter)
3. **Perguntas autônomas** — aumentando (pergunta antes de assumir)
4. **Capacidade de ler código existente** — aumentando (consegue navegar o codebase sem ajuda)

Esses indicadores devem ser conversados na retrospectiva quinzenal, não usados como cobrança imediata.

### 3.7 Sinais de alerta

Sinais de que algo está errado na formação:

- Dev copia e cola código de IA sem conseguir explicar o que faz
- PRs ficam estagnados por dias sem resposta às dúvidas
- Mesmo tipo de erro aparece repetidamente
- Dev evita perguntar (medo de "demonstrar não saber")
- Bugs em produção em código que ele escreveu

Qualquer um desses sinais demanda intervenção rápida — geralmente recuar uma fase e reforçar fundamentos.

---

## 4. Sistema de Tiers de tarefas

### 4.1 Por que Tiers

Em um app financeiro, nem todo código tem o mesmo peso. Um erro em um cálculo de amortização tem consequências infinitamente maiores que um erro em um espaçamento de CSS. Tratar todas as tarefas como iguais força o tech lead a revisar tudo com o mesmo rigor — o que rapidamente vira gargalo.

A classificação por Tier resolve isso: cada tarefa recebe uma label antes de ser atribuída, e essa label define o nível de revisão necessário.

### 4.2 Os três Tiers detalhados

#### Tier 1 — Crítico de domínio

**Característica:** se errado, gera prejuízo financeiro, exposição regulatória ou perda de confiança do cliente.

**Exemplos no contexto DamaTools (variam conforme o módulo):**

*Módulo Calculadora Financeira:*
- Implementação de fórmulas de amortização (PRICE, SAC, SAA, SAM, Bullet, SA-FGTS)
- Cálculo de CET (Custo Efetivo Total)
- Cálculo de IOF, IR sobre operações financeiras
- Conversão de taxas (a.m. ↔ a.a., nominal ↔ efetiva)

*Módulo AMCC:*
- Geração de arquivos regulatórios (ex: AMCC XML)
- Lógica de validação dos campos exigidos pelo BCB

*Outros módulos do roadmap:*
- RAS: cálculo e consolidação de indicadores prudenciais
- FGC: cálculo de contribuições e limites operacionais
- Fluxo de Caixa: testes de estresse e projeções
- Rentabilidade: projeção de DRE por contrato

*Transversais a todos os módulos:*
- Lógica de interpretação de resoluções (CMN, BCB)
- Lógica de validação de CPF/CNPJ em contexto financeiro
- Qualquer cálculo que use `decimal.js` ou aritmética monetária

**Quem executa:** Tech lead
**IA:** Usada pelo tech lead como acelerador pessoal (Cursor, Claude)
**Revisão:** Auto-revisão rigorosa + testes obrigatórios cobrindo casos extremos

#### Tier 2 — Lógica de negócio padrão

**Característica:** consome regras já validadas, mas tem complexidade de lógica e impacto se mal executada (UX ruim, integração quebrada, dado errado exibido).

**Exemplos:**
- Telas que consomem cálculos do Tier 1 (mas não os reimplementam)
- Formulários complexos com validação
- Integrações com APIs externas (BCB, Receita Federal, base de dados de clientes)
- Relatórios e exportações
- Fluxos de navegação multi-step
- Lógica de autenticação e autorização
- Queries de banco de dados não-triviais
- Motor de eventos do módulo Calendário (alertas, recorrência, lembretes)
- Telas de gestão de indicadores (RAS)

**Quem executa:** Dev (a partir da Fase 2) com supervisão
**IA:** Usada como par de programação ativo, com `CLAUDE.md` configurado
**Revisão:** CodeRabbit + revisão completa do tech lead, com checklist

#### Tier 3 — Baixo risco / scaffolding

**Característica:** se errado, é facilmente perceptível e corrigível, sem impacto regulatório ou financeiro.

**Exemplos:**
- CSS, estilo, espaçamento, cores
- Componentes de UI puramente visuais (botões, cards, modais sem lógica)
- Textos e copy estática
- Ícones e ilustrações
- Testes para código já escrito
- Documentação de código
- Refatoração de nomenclatura sem mudança de comportamento
- Atualização de dependências menores

**Quem executa:** Dev (desde a Fase 1)
**IA:** Usada extensivamente (Cursor/Copilot)
**Revisão:** CodeRabbit como primeiro filtro + revisão leve do tech lead

### 4.3 Como classificar uma tarefa nova

Antes de adicionar a tarefa ao board, faça três perguntas:

1. **Esta tarefa toca em algum cálculo financeiro ou regra regulatória?** Se sim → Tier 1.
2. **Esta tarefa consome cálculo já pronto OU lida com dados sensíveis OU integra sistemas externos?** Se sim → Tier 2.
3. **Caso contrário, é Tier 3.**

A label do Tier vai junto da tarefa no GitHub Projects. Filtragem por label permite que o tech lead veja rapidamente "todos os Tier 1 desta semana" para planejar seus blocos de código profundo.

---

## 5. Stack tecnológica

### 5.1 Decisões a tomar antes de começar

Algumas decisões de stack precisam estar definidas antes do dev começar a estudar — porque a trilha de estudo depende disso. As principais:

| Decisão | Recomendação para o contexto DamaTools |
|---|---|
| Linguagem principal | TypeScript |
| Framework frontend | React (via Next.js para SSR) |
| Backend | Node.js com Express ou Next.js API routes |
| Banco de dados | PostgreSQL |
| ORM/Query builder | Prisma |
| Biblioteca de cálculo decimal | `decimal.js` |
| Testes | Jest + Testing Library |
| Estilo | Tailwind CSS |

### 5.2 Justificativas

**TypeScript em vez de JavaScript puro:** o sistema de tipos detecta erros em tempo de desenvolvimento que de outra forma só apareceriam em produção. Para um app financeiro com um dev em formação, essa rede de segurança vale o overhead inicial.

**React/Next.js:** ecossistema maduro, documentação abundante (em português inclusive), comunidade ativa, IA conhece muito bem. Para um dev iniciando, isso significa que respostas para dúvidas estão sempre disponíveis.

**PostgreSQL:** padrão da indústria para aplicações que precisam de consistência transacional — essencial para contexto financeiro.

**Prisma como ORM:** o Prisma oferece type-safety completa entre código TypeScript e banco de dados — o schema é definido em um único arquivo (`schema.prisma`), e os tipos de queries, retornos e inputs são gerados automaticamente. Para um time com um dev em formação, essa rede de segurança em tempo de compilação previne uma classe inteira de erros que seriam descobertos apenas em runtime. Além disso, o Prisma Migrate cuida do versionamento de migrações de forma consistente entre os bancos de desenvolvimento e produção (ver Seção 6.4).

**`decimal.js`:** Math.round() e floats nativos em JavaScript causam erros de arredondamento que são inaceitáveis em cálculos monetários. `decimal.js` resolve isso. Esta regra entra no `CLAUDE.md` como obrigatória.

**Tailwind:** acelera muito o trabalho do dev em Tier 3 (estilização) e tem curva de aprendizado curta para quem vem de CSS clássico.

---

## 6. Arquitetura modular

### 6.1 Princípio: monolito modular, não microsserviços

A natureza modular do DamaTools (vários módulos com responsabilidades distintas) levanta naturalmente a pergunta: cada módulo deveria ser um serviço independente? A resposta, para o estágio atual da Arphia, é **não**.

A arquitetura escolhida é a de **monolito modular**: uma única aplicação, um único deploy, um único banco de dados — mas internamente estruturada como se fossem múltiplos módulos isolados. Cada módulo tem seu próprio código, seu próprio schema no banco, suas próprias regras, e o acoplamento entre eles é explícito e controlado.

**Por que não microsserviços agora:**

| Critério | Realidade da Arphia | Implicação |
|---|---|---|
| Orçamento de infraestrutura | Limitado (~R$ 200/mês para infra) | Múltiplos serviços = múltiplas VMs = custo multiplicado |
| Tamanho da equipe | 1 tech lead + 1 dev em formação | Microsserviços demandam DevOps maduro |
| Complexidade operacional | Equipe sem experiência em sistemas distribuídos | Falhas de rede, eventual consistency, distributed tracing são overhead enorme |
| Estágio do produto | Primeiros módulos sendo construídos | Domínios ainda não estão completamente estáveis |

Microsserviços resolvem problemas que vocês não têm: escala massiva, equipes grandes que precisam evoluir independentemente, sistemas com requisitos de disponibilidade extremos. Para o estágio atual, eles introduziriam complexidade sem benefício real.

**Por que monolito modular e não monolito tradicional:**

O monolito tradicional (tudo misturado, sem fronteiras) é o que vira o pesadelo conhecido como "big ball of mud" — código que ninguém entende, mudar uma coisa quebra outra inesperadamente. O monolito modular evita isso impondo disciplina interna: módulos são tratados como se fossem serviços separados em termos de organização e isolamento, mesmo rodando no mesmo processo.

O benefício colateral mais importante: se um dia for necessário separar um módulo em serviço próprio (por escala, por requisitos regulatórios, por equipe dedicada), a migração é factível porque as fronteiras já existem. O contrário (monolito misturado → microsserviços) é doloroso e demorado.

### 6.2 Visão geral da arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                     Cliente (navegador)                          │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Droplet DigitalOcean                          │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                 Nginx (reverse proxy + SSL)                │ │
│  └─────────────────────┬──────────────────────────────────────┘ │
│                        │                                         │
│                        ▼                                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │            Aplicação Next.js (gerenciada por PM2)          │ │
│  │                                                            │ │
│  │   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │ │
│  │   │ AMCC     │  │Calcula-  │  │   RAS    │  │   ...    │  │ │
│  │   │ módulo   │  │ dora     │  │ módulo   │  │          │  │ │
│  │   └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  │ │
│  │        │             │             │             │         │ │
│  │        └─────────────┴─────────────┴─────────────┘         │ │
│  │                            │                                │ │
│  │              ┌─────────────▼─────────────┐                  │ │
│  │              │  Camada compartilhada     │                  │ │
│  │              │  (auth, db client, utils) │                  │ │
│  │              └─────────────┬─────────────┘                  │ │
│  └────────────────────────────┼─────────────────────────────────┘ │
│                               │                                   │
│                               ▼                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                  PostgreSQL (mesma VM)                     │  │
│  │                                                            │  │
│  │  schema    schema      schema    schema     schema         │  │
│  │  shared    amcc        calc...   ras       (futuros)       │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                  ┌─────────────────────────┐
                  │  DigitalOcean Spaces    │
                  │  (backups e arquivos)   │
                  └─────────────────────────┘
```

Componentes principais:
- **Nginx**: terminação SSL, reverse proxy, rate limiting, basic auth para staging
- **Aplicação Next.js**: monolito com módulos isolados, gerenciada pelo PM2 para garantir restart automático
- **PostgreSQL**: banco único com múltiplos schemas, um por módulo
- **DigitalOcean Spaces**: armazenamento de objetos (backups, arquivos de upload do cliente)

### 6.3 Organização do código

A estrutura de pastas é o primeiro mecanismo de isolamento. Cada módulo vive em sua própria pasta sob `/src/modules/`, e a regra de import é estrita:

```
arphia-damatools/
├── src/
│   ├── app/                          # Rotas Next.js (App Router)
│   │   ├── (auth)/                   # Grupo de rotas de autenticação
│   │   ├── (modules)/
│   │   │   ├── calculator/           # Rotas do módulo Calculadora
│   │   │   ├── amcc/                 # Rotas do módulo AMCC
│   │   │   ├── ras/                  # Rotas do módulo RAS
│   │   │   └── ...
│   │   └── layout.tsx
│   │
│   ├── modules/
│   │   ├── calculator/
│   │   │   ├── domain/               # Cálculos: PRICE, SAC, CET, IOF
│   │   │   ├── repositories/         # Acesso a banco (schema 'calculator')
│   │   │   ├── services/             # Lógica de aplicação
│   │   │   ├── ui/                   # Componentes específicos do módulo
│   │   │   └── index.ts              # Interface pública do módulo
│   │   │
│   │   ├── amcc/
│   │   │   ├── domain/               # Geração de XML, validações
│   │   │   ├── repositories/
│   │   │   ├── services/
│   │   │   ├── ui/
│   │   │   └── index.ts
│   │   │
│   │   ├── ras/
│   │   ├── calendar/
│   │   ├── fgc/
│   │   └── ...
│   │
│   └── shared/
│       ├── auth/                     # Login, sessão, roles
│       ├── db/                       # Cliente PostgreSQL, migrations
│       ├── ui/                       # Design system, componentes base
│       ├── domain/                   # decimal-helpers, CPF/CNPJ validators
│       └── utils/                    # Logger, error handlers
│
├── tests/
│   └── modules/                      # Espelha estrutura de /src/modules
│
└── migrations/
    ├── shared/                       # Migrations das tabelas compartilhadas
    ├── calculator/                   # Migrations do schema calculator
    ├── amcc/
    └── ...
```

**Regras de import (enforçadas via ESLint):**

1. **Módulos não importam de outros módulos.** Se o módulo Calculadora precisa de algo do módulo RAS, é sinal de que essa coisa deveria estar em `/shared` ou que o desenho está errado.

2. **Módulos podem importar de `/shared`.** Tudo em `/shared` é considerado código transversal estável.

3. **Imports externos ao módulo só pela `index.ts`.** Cada módulo expõe uma interface pública via `index.ts`. Outros consumidores (rotas, futuros módulos via shared) só acessam por essa porta. O resto é interno e pode mudar sem quebrar nada.

4. **`/shared` não importa de módulos.** A direção é unidirecional: módulos → shared, nunca o contrário.

Essas regras podem ser verificadas automaticamente com ESLint usando o plugin `eslint-plugin-boundaries` ou regras de import customizadas. Tornar essas regras automáticas é importante porque é exatamente o tipo de disciplina que se afrouxa com pressa em qualquer projeto.

### 6.4 Organização do banco de dados

**Duas instâncias PostgreSQL distintas:**

| Ambiente | Instância | Conteúdo | Acesso |
|---|---|---|---|
| `arphia-db-dev` | PostgreSQL de desenvolvimento | Dados de teste, atende dev local + staging | Time todo |
| `arphia-db-prod` | PostgreSQL de produção | Dados reais dos clientes | Apenas tech lead em acessos pontuais |

A separação física dos bancos é um requisito de segurança e disciplina operacional: nenhum erro em desenvolvimento pode tocar dados de produção, e nenhuma exploração de produção pode poluir o ambiente onde o time trabalha no dia a dia. As credenciais dos dois bancos são geridas via variáveis de ambiente separadas e nunca convivem no mesmo arquivo `.env`.

**Schemas separados por módulo (dentro de cada banco):**

Cada banco (dev e prod) é internamente organizado em schemas — namespaces lógicos que isolam tabelas sem o overhead de instâncias separadas:

```sql
-- Schemas (aplicados igualmente em dev e prod)
CREATE SCHEMA shared;       -- tabelas transversais
CREATE SCHEMA calculator;   -- tabelas do módulo Calculadora
CREATE SCHEMA amcc;         -- tabelas do módulo AMCC
CREATE SCHEMA ras;          -- tabelas do módulo RAS
-- ... um schema por módulo
```

**Como ficam distribuídas as tabelas:**

| Schema | Tabelas (exemplos) | Quem acessa |
|---|---|---|
| `shared` | users, organizations, audit_log, sessions | Todos os módulos (via /shared) |
| `calculator` | simulations, amortization_results, tax_tables | Apenas módulo Calculadora |
| `amcc` | filings, xml_drafts, validations | Apenas módulo AMCC |
| `ras` | indicators, indicator_values, thresholds | Apenas módulo RAS |

**Regras de acesso ao banco:**

1. **Cada módulo só lê e escreve no próprio schema.** O repository do módulo Calculadora não acessa `amcc.filings` diretamente.

2. **Tabelas compartilhadas (`shared`) podem ser lidas por qualquer módulo**, mas escrita só via `/shared/auth` ou outros serviços compartilhados explícitos.

3. **Foreign keys entre schemas são permitidas apenas para `shared`.** Por exemplo, `calculator.simulations.user_id` pode referenciar `shared.users.id`. Mas `calculator.simulations` não pode ter FK para `amcc.filings` — se for necessário relacionar dados de módulos diferentes, isso vira código em camada de aplicação, não constraint de banco.

**Prisma como camada de acesso:**

O Prisma é o ORM padrão do projeto. Por causa da estrutura modular, recomenda-se uma das duas abordagens:

- **Schema único em `prisma/schema.prisma`** com modelos agrupados por módulo (mais simples para começar; suporta `@@schema` para múltiplos schemas em PostgreSQL)
- **Múltiplos schemas Prisma** (um por módulo) — mais isolado mas exige configuração adicional

A escolha inicial é pelo **schema único com `@@schema` por modelo**, evoluindo se necessário. Exemplo:

```prisma
// prisma/schema.prisma
datasource db {
  provider          = "postgresql"
  url               = env("DATABASE_URL")
  schemas           = ["shared", "calculator", "amcc", "ras"]
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["multiSchema"]
}

model User {
  id    String @id @default(cuid())
  email String @unique
  // ...
  @@schema("shared")
}

model Simulation {
  id     String @id @default(cuid())
  userId String
  user   User   @relation(fields: [userId], references: [id])
  // ...
  @@schema("calculator")
}
```

**Migrações:**

O Prisma Migrate gerencia a evolução do schema. Fluxo padrão:

```bash
# Desenvolvimento — gera nova migration a partir das mudanças no schema.prisma
npx prisma migrate dev --name add_simulation_table

# Aplica as migrations pendentes no banco de produção (rodado via CI)
npx prisma migrate deploy
```

As migrations vivem em `prisma/migrations/` e são versionadas no Git. **Migrations são imutáveis após aplicadas em produção** — se houver erro, cria-se uma nova migration corretiva, nunca edita-se uma migration histórica.

**Por que schemas e não bancos separados por módulo:**

Bancos separados (um PostgreSQL por módulo) seriam mais isolados, mas:
- Multiplicam custo de infra (managed DB) ou complexidade (vários PostgreSQL na mesma VM)
- Quebram transações cross-module (que às vezes precisamos para `shared`)
- Backup/restore vira N vezes mais complexo

Schemas dão isolamento lógico suficiente com complexidade operacional mínima.

### 6.5 Comunicação entre módulos

A regra padrão é: **módulos não se comunicam**. Cada módulo é uma ilha que processa suas próprias requisições, lê e escreve no próprio schema, e renderiza suas próprias telas.

Quando essa regra precisa ser quebrada (algo de um módulo afeta outro), há três padrões aceitos, em ordem de preferência:

**Padrão 1: o dado está em `shared`**

Se o dado é genuinamente transversal (usuário, organização, log de auditoria), ele vive em `/shared` e ambos os módulos leem dali. Esta é a solução mais comum.

**Padrão 2: serviço de aplicação na camada compartilhada**

Quando há uma operação que envolve múltiplos módulos (ex: gerar relatório consolidado), o código que orquestra essa operação vive em `/src/services/` ou `/src/app/api/`, não dentro de um módulo específico. Esse serviço pode importar das `index.ts` dos módulos envolvidos.

**Padrão 3: eventos de domínio (in-process)**

Quando uma ação em um módulo deve gerar efeitos em outro de forma desacoplada (ex: criar uma simulação no Calculator deve registrar entrada no log de auditoria de Compliance), usa-se um event bus simples in-process:

```typescript
// Módulo Calculator emite evento
events.emit('simulation.created', { userId, simulationId, ... });

// Módulo Audit (em /shared ou outro módulo) escuta
events.on('simulation.created', async (payload) => {
  await auditLogger.record(payload);
});
```

Esse padrão é simples de implementar (uma biblioteca como `eventemitter3` ou até o `EventEmitter` nativo de Node), e tem uma vantagem importante: no futuro, se o módulo for separado em microsserviço, esse mesmo padrão vira mensageria (RabbitMQ, Kafka) com mudança mínima de código.

**O que evitar:**

- Módulo A importando diretamente de `src/modules/B/...` (sempre passa pela `index.ts`, ou idealmente nem isso)
- Queries SQL cruzando schemas que não sejam `shared`
- Lógica de negócio de um módulo escondida dentro de outro

### 6.6 Autenticação e autorização

Centralizadas em `/shared/auth`. Não cada módulo implementa seu próprio login.

**Modelo:**

```
shared.users
  id, email, hashed_password, name, created_at

shared.organizations
  id, name, cnpj, plan

shared.user_organizations
  user_id, organization_id, role
    role ∈ {owner, admin, member}

shared.module_permissions
  organization_id, module, enabled
    module ∈ {calculator, amcc, ras, calendar, fgc, ...}
```

Esse modelo suporta:
- Multi-tenancy (uma instituição financeira = uma organization)
- Múltiplos usuários por organização com papéis distintos
- **Controle granular de qual organização tem acesso a qual módulo** (essencial para o modelo comercial: cliente pode contratar só AMCC, ou só Calculadora + RAS, etc.)

**Middleware de autorização:**

Toda rota protegida passa por um middleware compartilhado que:
1. Valida a sessão do usuário
2. Identifica a organização ativa
3. Verifica se aquela organização tem permissão no módulo daquela rota
4. Verifica se o usuário tem o papel necessário para a ação

Cada módulo apenas declara qual nível de acesso suas rotas exigem; a lógica de verificação vive em `/shared/auth`.

### 6.7 Roteamento e UI

**Estrutura de rotas (Next.js App Router):**

```
/app
  /(auth)/login
  /(auth)/signup
  /(modules)/calculator/        # Tela inicial do módulo
  /(modules)/calculator/new      # Nova simulação
  /(modules)/amcc/
  /(modules)/amcc/filings/[id]
  /(modules)/ras/
  /(admin)/                      # Área de administração
```

O agrupamento `(modules)` é uma convenção do Next.js que não aparece na URL final, mas permite aplicar layout compartilhado (sidebar com lista de módulos disponíveis, header com seleção de organização) a todas as rotas de módulos.

**Componentes compartilhados:**

`/shared/ui` contém o design system: botões, inputs, cards, tabelas, modais, navegação. Cada módulo consome esses componentes e só cria seus próprios quando há necessidade específica (gráfico de amortização, visualizador de XML, etc.) — esses ficam em `/src/modules/[modulo]/ui/`.

### 6.8 Configuração e feature flags

Variáveis de ambiente seguem convenção de prefixo por módulo:

```bash
# Compartilhadas
DATABASE_URL=postgres://...
SESSION_SECRET=...
APP_URL=https://damatools.com.br

# Módulo Calculator
CALCULATOR_ENABLED=true
CALCULATOR_MAX_INSTALLMENTS=600

# Módulo AMCC
AMCC_ENABLED=true
AMCC_BCB_API_URL=https://...
AMCC_VALIDATION_STRICT=true

# Módulo RAS (ainda não implementado)
RAS_ENABLED=false
```

A flag `{MODULE}_ENABLED` é o **feature flag de módulo**: permite desabilitar um módulo inteiro sem precisar removê-lo do código. Útil para:
- Lançar módulos progressivamente (RAS pronto mas não liberado ainda)
- Desabilitar em produção em caso de bug crítico
- Manter código de módulos em desenvolvimento ativo no repositório

### 6.9 Infraestrutura na DigitalOcean

**Setup inicial recomendado:**

| Recurso | Especificação | Custo aprox. |
|---|---|---|
| Droplet (VM) | Basic — 2 vCPU, 4GB RAM, 80GB SSD | $24/mês |
| DigitalOcean Spaces | 250GB para backups + arquivos | $5/mês |
| Domínio (registro.br) | arphia.com.br + damatools.com.br | ~R$ 80/ano |
| SSL | Let's Encrypt (via Certbot) | Gratuito |
| **Total mensal infra** | | **~$29/mês (~R$ 160)** |

**Tudo na mesma VM:**
- Nginx (reverse proxy, SSL, basic auth para staging)
- Node.js + aplicação Next.js (gerenciada pelo PM2)
- PostgreSQL (mesma VM, dados em `/var/lib/postgresql`)
- Cron jobs para tarefas agendadas (módulo Calendário, backups)

**Estrutura de pastas no servidor:**

```
/opt/arphia/
├── damatools-prod/         # Aplicação produção
│   ├── current/            # Symlink para release ativa
│   ├── releases/           # Releases antigas (mantém últimas 5 para rollback)
│   └── shared/             # Logs, .env, uploads
└── damatools-staging/      # Aplicação staging (mesma estrutura)

/var/lib/postgresql/16/main/   # Dados do PostgreSQL
/etc/nginx/sites-available/    # Configs do nginx
```

**PostgreSQL na mesma VM vs Managed Database:**

Começar com PostgreSQL na própria VM economiza ~$15-30/mês inicialmente. Migrar para [DO Managed Database](https://www.digitalocean.com/products/managed-databases) faz sentido quando:
- Volume de dados começar a impactar a operação da VM
- Backup manual virar overhead
- A equipe crescer e precisar de mais isolamento entre app e banco
- Houver pico de tráfego que exija escalar app sem escalar banco

Migração de PostgreSQL próprio para managed é factível (basicamente um dump/restore) — não é decisão irreversível.

**Backups:**

| O que | Como | Frequência | Onde |
|---|---|---|---|
| Banco de dados | `pg_dump` automatizado via cron | Diário às 3h | DO Spaces (criptografado) |
| Arquivos da aplicação (`shared/uploads`) | rsync para Spaces | Diário | DO Spaces |
| Snapshot completo do droplet | Via painel DO ou doctl CLI | Semanal | DO (interno) |
| Configurações (nginx, .env) | Versionadas em repositório privado | A cada mudança | GitHub |

Retenção mínima: 30 dias de backups diários, 12 semanas de snapshots semanais.

**Quando escalar para um setup maior:**

Sinais que indicam necessidade de upgrade:
- CPU consistentemente > 70%
- RAM consistentemente > 80%
- Latência de banco > 100ms em queries simples
- Tempo de build/deploy passando de 5 minutos

Caminhos de evolução:
1. **Vertical primeiro** — upgrade do droplet para 4 vCPU/8GB ($48/mês) ou maior
2. **Separar banco** — migrar para DO Managed PostgreSQL
3. **Separar app de assets** — CDN para arquivos estáticos (Cloudflare gratuito serve aqui)
4. **Múltiplas VMs com load balancer** — só quando a vertical não couber mais

### 6.10 Testes em arquitetura modular

A estrutura de testes espelha a estrutura do código:

```
/tests
  /modules
    /calculator
      /domain        # testes unitários de cálculos (críticos)
      /services
      /integration   # testes que tocam o schema 'calculator' do banco
    /amcc
      /domain
      /services
      /integration
  /shared            # testes de auth, decimal helpers, validators
  /e2e               # testes end-to-end (poucos, mas existem)
```

**Estratégia por tipo de teste:**

| Tipo | Cobertura ideal | Velocidade | Quando rodam |
|---|---|---|---|
| Unitário (domain/) | > 90% no Tier 1 | Milissegundos | A cada save (watch mode) |
| Integração (acesso a banco) | Fluxos principais | Segundos | A cada PR (CI) |
| End-to-end | Cenários críticos do produto | Minutos | Diariamente + antes de release |

**Banco de teste:**

Para testes de integração, o banco de testes usa um schema separado por execução (`test_<random_hash>`) ou um banco completamente separado. Isso evita poluir dados de desenvolvimento e permite testes paralelos.

### 6.11 Quando reconsiderar a arquitetura

Sinais de que o monolito modular está apertado e vale a pena considerar separação de serviços:

| Sinal | O que pode ser separado |
|---|---|
| Um módulo consome desproporcionalmente mais CPU/RAM | Aquele módulo vira serviço próprio |
| Um módulo precisa de SLA diferente (alta disponibilidade) | Idem |
| Um módulo evolui em ritmo muito diferente dos outros | Idem |
| Equipe cresce e times se dedicam a módulos diferentes | Separação ajuda autonomia |
| Volume de dados de um módulo justifica banco próprio | Banco daquele módulo migra primeiro |

O ponto importante: **com o monolito modular bem construído, essa migração é cirúrgica, não cataclísmica**. As fronteiras já existem no código, o schema já está separado no banco, a comunicação entre módulos (quando existe) já passa por eventos. Migrar um módulo para serviço próprio passa a ser principalmente um exercício de infraestrutura (deploy separado, comunicação via HTTP em vez de import), não um reescrita arquitetural.

Esse é o argumento central da abordagem: **comece simples (monolito), mas com fronteiras explícitas (modular), para que evolução futura seja opção viável, não pesadelo**.

---

## 7. Plataformas e custos

### 7.1 Versionamento e gestão de tarefas — GitHub Team

- **Plano:** GitHub Team
- **Custo:** ~$4/usuário/mês = $12/mês para 3 contas
- **Por quê:** repos privados com branch protection (essencial em contexto financeiro), code review obrigatório, CI/CD via GitHub Actions integrado, GitHub Projects para gestão de tarefas

### 7.2 Comunicação — Slack ou Discord

Duas opções viáveis. Decisão depende do perfil de profissionalismo desejado:

| Opção | Custo | Quando escolher |
|---|---|---|
| Discord (gratuito) | $0 | Time totalmente interno, histórico ilimitado |
| Slack Free | $0 | Inclusão de clientes/parceiros eventual |
| Slack Pro | ~$22/mês | Necessidade de histórico longo, integrações |

**Recomendação inicial:** começar com **Slack Free**, migrar para Pro se o limite de 90 dias de histórico se tornar restritivo.

### 7.3 IA

| Ferramenta | Plano | Custo |
|---|---|---|
| Cursor | Pro | $20/mês × 2 devs = $40/mês |
| Claude Pro | Pro | $20/mês × 2 = $40/mês (tech lead + dev) |
| CodeRabbit | Pro | ~$12-15/mês para repositórios privados pequenos |

**Total IA:** ~$95/mês

### 7.4 Hospedagem e infraestrutura

| Serviço | Uso | Custo estimado |
|---|---|---|
| DigitalOcean Droplet | Servidor staging + produção | $24-48/mês (depende do porte) |
| Domínio (registro.br) | damatools.com.br | ~R$ 40/ano |
| Let's Encrypt | SSL | Gratuito |
| DigitalOcean Spaces ou backup | Backups e arquivos | ~$5/mês |

### 7.5 Monitoramento

| Ferramenta | Plano | Custo |
|---|---|---|
| Sentry | Developer (gratuito) | $0 inicialmente |
| UptimeRobot ou similar | Free | $0 |

### 7.6 Consolidado mensal

| Categoria | Custo mensal aproximado |
|---|---|
| GitHub Team | $12 |
| Slack Free (ou Pro depois) | $0 (ou $22) |
| Cursor (2 devs) | $40 |
| Claude Pro (2 contas) | $40 |
| CodeRabbit | $15 |
| DigitalOcean (servidor + backup) | $30-50 |
| **Total inicial** | **~$140-160/mês** |

Em moeda local, aproximadamente **R$ 750-900/mês** dependendo do câmbio. Custo absolutamente viável para uma operação que atende instituições financeiras.

---

## 8. Ambientes

### 8.1 Local (desenvolvimento)

Cada dev roda a aplicação na própria máquina via Docker Compose. Inclui Node.js e PostgreSQL local, variáveis de ambiente isoladas em `.env.local` (nunca versionado). Banco local é descartável — pode ser zerado a qualquer momento.

**URL:** `http://localhost:3000`
**Banco:** PostgreSQL local na máquina de cada dev (Docker)

### 8.2 Staging (homologação)

Ambiente espelho da produção, rodando na infraestrutura DigitalOcean. Recebe deploy automático ao mergear no `develop`. Usado para validação antes de subir para produção e como ambiente de demonstração para clientes.

**URL:** `https://staging.damatools.com.br`
**Banco:** `arphia-db-dev` (PostgreSQL de desenvolvimento, isolado de produção)
**Acesso:** restrito via Basic Auth no nginx (apenas equipe e clientes em fase de homologação)

### 8.3 Produção

Ambiente final, exposto aos usuários reais (instituições financeiras clientes). Recebe deploy automático ao mergear na `main`, após validação em staging.

**URL:** `https://damatools.com.br`
**Banco:** `arphia-db-prod` (PostgreSQL de produção, isolado)
**Acesso:** público com autenticação da aplicação

### 8.4 Resumo dos bancos de dados

| Ambiente | Banco PostgreSQL | Conteúdo | Backup |
|---|---|---|---|
| Local (cada dev) | Container Docker local | Dados fictícios, descartáveis | Não há |
| Staging | `arphia-db-dev` (DO) | Dados de teste e homologação | Diário, retenção 7 dias |
| Produção | `arphia-db-prod` (DO) | Dados reais de clientes | Diário, retenção 30 dias, mais snapshots semanais |

**Princípio inegociável:** credenciais de `arphia-db-prod` nunca aparecem em ambiente de desenvolvimento, nunca são compartilhadas em chat ou e-mail, e o acesso direto ao banco de produção é feito apenas pelo tech lead, em momentos pontuais e auditados.

### 8.5 DNS

No registrador (Registro.br ou Cloudflare):

| Tipo | Nome | Destino |
|---|---|---|
| A | @ | IP do servidor |
| A | www | IP do servidor |
| A | staging | IP do servidor |

Ambos os subdomínios podem apontar para o mesmo servidor; o nginx separa internamente por porta.

---

## 9. Git flow e versionamento

### 9.1 Estrutura de branches

```
main         → produção (protegida)
develop      → staging (protegida)
feature/*    → novas funcionalidades
fix/*        → correções não-urgentes
hotfix/*     → correções urgentes em produção
refactor/*   → refatorações
```

### 9.2 Convenções de nomenclatura

Branches sempre em inglês, em kebab-case, descritivas. Recomenda-se incluir o prefixo do módulo quando aplicável:

- `feature/calculator-price-amortization`
- `feature/amcc-xml-generation`
- `feature/ras-indicators-dashboard`
- `fix/calculator-cpf-validation-error`
- `hotfix/amcc-wrong-field-mapping`
- `refactor/extract-tax-tables`

### 9.3 Conventional Commits

Todos os commits seguem o padrão Conventional Commits:

```
feat: adiciona cálculo de amortização SAC
fix: corrige arredondamento em CET
refactor: extrai tabelas de IOF para módulo separado
test: cobre casos extremos de PRICE
chore: atualiza dependências
docs: documenta arquivo CLAUDE.md
```

Isso permite gerar changelog automaticamente e dá visibilidade clara da natureza de cada mudança.

### 9.4 Template de Pull Request

Arquivo `.github/PULL_REQUEST_TEMPLATE.md` (ver Apêndice A) com checklist obrigatório que inclui:
- Descrição do que foi feito e por quê
- Tier da tarefa
- Como testar
- Checklist de qualidade
- Screenshots (se UI)
- Hotfix mergeado também no develop (se aplicável)

### 9.5 Branch protection (configurada no GitHub)

Para `main`:
- Exige PR antes de merge
- Exige 1 aprovação (do tech lead)
- Exige CI verde
- Bloqueia push direto e force push
- Bloqueia delete

Para `develop`:
- Exige PR antes de merge
- Exige CI verde
- Tech lead pode mergear; dev nunca

---

## 10. CI/CD

### 10.1 Pipeline de CI

Configurado via GitHub Actions, dispara a cada push e a cada PR:

```yaml
# .github/workflows/ci.yml
1. Checkout do código
2. Setup do Node.js
3. Instalação de dependências (com cache)
4. Lint (ESLint)
5. Type check (tsc --noEmit)
6. Testes (jest)
7. Build (next build)
```

Se qualquer etapa falhar, o PR fica com check vermelho e não pode ser mergeado.

### 10.2 Pipeline de deploy

Workflow separado, dispara apenas em push para `develop` ou `main`:

```yaml
# .github/workflows/deploy.yml
- Se branch = develop → deploy para staging
- Se branch = main → deploy para produção
```

O deploy via SSH no servidor, com PM2 gerenciando os processos da aplicação.

### 10.3 Rollback

Em caso de problema crítico em produção:

```bash
# No servidor
cd /app/prod
git reset --hard <hash-do-commit-estável>
npm install
pm2 restart prod
```

Como toda release tem tag (`v1.2.0`), o rollback é rastreável e rápido.

---

## 11. Processo de trabalho (Scrumban adaptado)

### 11.1 Por que Scrumban e não Scrum puro

Vocês têm dois tipos de trabalho competindo pela mesma capacidade: desenvolvimento de produto (DamaTools) e demandas de consultoria regulatória pontuais. Scrum puro assume um único fluxo planejável; Scrumban admite os dois coexistindo com WIP limit como mecanismo de proteção.

Além disso, com um dev em formação, sprints fechadas geram pressão indevida — "preciso terminar X até sexta" não combina com "estou aprendendo". O fluxo contínuo do Scrumban absorve melhor a variabilidade.

### 11.2 Ciclo semanal

| Dia | Atividade | Duração |
|---|---|---|
| Segunda | Planejamento semanal | 20-30 min |
| Terça a quinta | Daily assíncrono no Slack | 5 min |
| Diariamente | Trabalho com WIP limit | — |
| Sexta | Revisão + retrospectiva | 30-45 min |

### 11.3 Board e WIP limits

Board no GitHub Projects, com duas raias e colunas:

| | Backlog | A fazer | Em progresso | Em review | Concluído |
|---|---|---|---|---|---|
| **Produto** | | | | | |
| **Cliente/consultoria** | | | | | |

**WIP limits:**

| Pessoa | Limite | Motivo |
|---|---|---|
| Tech lead | 2 | 1 código Tier 1 + 1 buffer para review |
| Dev (Fase 1) | 1 | Foco total em uma tarefa por vez |
| Dev (Fase 2+) | 2 | Conforme ganha autonomia |

### 11.4 Cerimônias

**Planejamento semanal (segunda, 20-30 min):**
- Revisão do board completo
- Definição das prioridades da semana (3-5 itens principais)
- Distribuição: tech lead puxa Tier 1, dev puxa Tier 2/3
- Sócio de negócio participa para validar prioridades

**Daily assíncrono (terça-quinta, no Slack):**
Cada um posta no canal `#daily` pela manhã:
```
Ontem: ...
Hoje: ...
Bloqueio: ...
```

**Sprint Review (sexta, 20 min):**
- Tech lead e dev demonstram o que foi entregue
- Sócio de negócio valida e dá feedback
- Define se algo precisa ser ajustado antes de subir para produção

**Retrospectiva (sexta, 15-20 min):**
- O que funcionou bem?
- O que travou?
- Uma ou duas ações concretas para a próxima semana
- Pergunta específica: "o que da raia Cliente atrapalhou o Produto essa semana?"

### 11.5 Como tarefas são criadas

Tarefas nascem em três caminhos:

1. **Backlog estratégico** — sócio de negócio identifica necessidade do produto e cria issue
2. **Bug ou melhoria técnica** — tech lead ou dev identificam e criam issue
3. **Demanda de cliente** — sócio de negócio recebe e cria issue na raia Cliente

Toda issue criada precisa ter, antes de entrar no board:
- Título descritivo
- Descrição do que é e por quê
- **Tier (label)**
- Critério de aceite (como saber que está pronto)
- Estimativa de esforço (P/M/G — pequeno/médio/grande)

---

## 12. Comunicação

### 12.1 Canais e propósitos

| Canal | Propósito | Quem participa |
|---|---|---|
| `#geral` | Conversas, alinhamentos, decisões | Todos |
| `#daily` | Status assíncrono diário | Tech lead e dev |
| `#notificacoes-dev` | PRs abertos, reviews | Tech lead e dev |
| `#builds-e-deploys` | CI, deploys, falhas de pipeline | Tech lead e dev |
| `#alertas-producao` | Sentry, monitoramento, erros | Todos |
| `#dev-aprendizado` | Dúvidas do dev, links de estudo | Tech lead e dev |
| `#negocio-cliente` | Demandas de cliente, regulatório | Sócio de negócio e tech lead |

### 12.2 Integrações automáticas

- **GitHub → Slack:** notificações de PR no `#notificacoes-dev`
- **GitHub Actions → Slack:** resultado de builds no `#builds-e-deploys`
- **Sentry → Slack:** alertas de erro no `#alertas-producao`
- **UptimeRobot → Slack:** alertas de indisponibilidade no `#alertas-producao`

### 12.3 Regras de uso

**Code review acontece no GitHub, não no Slack.** Slack avisa que o PR existe ("abri o PR, dá uma olhada quando puder"), mas a revisão fica no PR para ficar registrada.

**Decisões importantes vão para documentação.** Conversas no Slack se perdem. Se uma decisão técnica for tomada via Slack, alguém precisa registrá-la em uma issue, no arquivo de documentação ou em um ADR (Architecture Decision Record).

**Urgência tem canal próprio.** Se algo é realmente urgente (produção quebrada), é no `#alertas-producao` + mensagem direta. Caso contrário, mensagem assíncrona.

**Respeitar foco profundo.** Tech lead em bloco de Tier 1 não responde Slack na hora. Dev em bloco de estudo não é interrompido por dúvida não-urgente.

---

## 13. Uso da Inteligência Artificial

### 13.1 Princípios de uso

A IA é parte essencial do processo, mas com regras claras:

**O dev que faz o commit é responsável pelo código.** Independentemente de quem (ou o quê) escreveu. Se um bug aparece em produção em código gerado por IA, a responsabilidade é de quem submeteu.

**Entender antes de mergear.** Código que o dev não consegue explicar não vai para o repositório. Isso vale especialmente para o dev em formação — a IA não pode virar muleta que impede aprendizado.

**IA não decide regra de domínio.** Para qualquer dúvida sobre regulação, cálculo financeiro ou interpretação normativa, a IA pode ajudar a estruturar a pergunta, mas a resposta vem do tech lead.

### 13.2 Arquivo de contexto compartilhado

Cada repositório tem um arquivo `CLAUDE.md` na raiz (e `.cursorrules` para quem usa Cursor) com as regras do projeto. Ver Apêndice B para o exemplo completo.

Esse arquivo é versionado no Git. Toda evolução de regra de domínio aparece como commit, com revisão. É o documento vivo onde o conhecimento do tech lead vira regra que a IA aplica automaticamente.

### 13.3 Ferramentas por papel

**Tech lead:**
- Cursor (Pro) como editor principal
- Claude Pro para tarefas de planejamento, debugging complexo e geração de specs
- IA pessoal — escreve código rapidamente, mas com discernimento sênior

**Dev em formação:**
- Cursor (Pro) como editor principal
- Claude Pro como tutora — para entender conceitos, não para gerar código sem entender
- Uso supervisionado, com revisão pedagógica do tech lead

**Sócio de negócio:**
- Claude Pro para análise regulatória, estruturação de requisitos, preparação de documentos

### 13.4 Guardrails de segurança

**O que NUNCA é compartilhado com IA:**
- Conteúdo de arquivos `.env`
- Credenciais, API keys, tokens
- Dados reais de clientes (CPF, CNPJ, saldos, transações)
- Documentos confidenciais de clientes (instituições financeiras)

**O que é seguro compartilhar:**
- Código de domínio sem dados reais
- Schemas de banco (estrutura, não conteúdo)
- Documentos públicos (resoluções, normativos)
- Código com dados fictícios em testes

---

## 14. Spec Driven Development (SDD)

### 14.1 Conceito e objetivo

Spec Driven Development (SDD) é a prática de produzir uma especificação técnica formal antes de qualquer linha de código ser escrita. A especificação — documento estruturado que define comportamento esperado, entradas, saídas, regras de domínio e critérios de aceite verificáveis — serve simultaneamente como instrução ao desenvolvedor, contrato com o Product Owner e referência de verificação após a implementação.

No contexto da Arphia, o SDD não representa uma camada burocrática adicional ao processo: é a resposta estrutural a dois riscos concretos do projeto. O primeiro é a execução de tarefas em domínio financeiro regulado por um desenvolvedor em formação — domínio onde uma especificação ambígua produz código tecnicamente compilável e financeiramente incorreto. O segundo é a dependência de IA generativa para escrita de código: modelos de linguagem geram código de maior qualidade e mais aderente ao domínio quando recebem especificações precisas do que quando operam sobre requisitos vagos.

A especificação, neste processo, tem três funções simultâneas:

- **Instrução:** define o que o desenvolvedor deve implementar, sem deixar margem para interpretação
- **Contrato:** registra o acordo entre PO e time técnico sobre o que será entregue
- **Verificação:** serve de referência objetiva para o code review e para os testes automatizados

### 14.2 Quando aplicar o SDD

A obrigatoriedade de spec é determinada pelo Tier da tarefa (Seção 4):

| Tier | Spec obrigatória? | Profundidade mínima |
|---|---|---|
| Tier 1 | Sim, obrigatória | Spec completa com regras de domínio exaustivas, casos extremos e critérios de aceite testáveis |
| Tier 2 | Sim, obrigatória | Spec padrão com entradas, saídas, comportamento e critérios de aceite |
| Tier 3 | Recomendada | Spec simplificada ou apenas critério de aceite descrito no card do board |

A spec deve estar com status `Aprovada` pelo tech lead antes da criação do branch de desenvolvimento. Submeter Pull Request sem spec aprovada para tarefas Tier 1 ou Tier 2 constitui motivo de recusa imediata.

### 14.3 O ciclo SDD no processo

O SDD se insere entre o planejamento (Seção 11) e o início do desenvolvimento (Seção 9), adicionando a etapa de especificação como pré-requisito para abertura do branch:

```
Backlog
  ↓
Planejamento semanal (priorização pelo PO)
  ↓
[SPEC EM ANDAMENTO]  ← tech lead ou dev produz com apoio de IA
  ↓
[SPEC EM REVISÃO]    ← tech lead valida regras de domínio
  ↓
[SPEC APROVADA]
  ↓
Abertura do branch (feature/*, fix/*, etc.)
  ↓
Implementação guiada pela spec
  ↓
Verificação contra a spec (antes de abrir PR)
  ↓
Pull Request → Code Review → Deploy
```

**Responsabilidade por Tier:**

| Tier | Quem produz a spec | Quem revisa |
|---|---|---|
| Tier 1 | Tech lead, com auxílio de IA | Tech lead (auto-revisão rigorosa) |
| Tier 2 | Dev produz rascunho com IA; tech lead revisa | Tech lead |
| Tier 3 | Dev produz spec simplificada | Tech lead (revisão leve) |

**Armazenamento:** specs são documentos Markdown versionados no repositório, em `docs/specs/[modulo]/[nome-da-spec].md`. O link para a spec é incluído obrigatoriamente na descrição do PR.

### 14.4 Estrutura padrão de uma especificação

Toda spec do DamaTools segue a estrutura abaixo. Campos marcados com `*` são obrigatórios para Tier 1 e Tier 2.

```markdown
# SPEC: [Título descritivo da funcionalidade]

## Metadados
- **Módulo:** [nome do módulo — calculator, amcc, ras, etc.]
- **Tier:** [1 / 2 / 3]
- **Status:** [Rascunho | Em revisão | Aprovada | Implementada]
- **Autor:** [quem redigiu]
- **Revisor:** [tech lead]
- **Data:** [yyyy-mm-dd]
- **Issue:** [link para o card no GitHub Projects]

## Objetivo *
[Uma frase: o sistema deve [ação] para que [usuário] possa [objetivo de negócio]]

## Contexto *
[Por que esta funcionalidade existe. Qual problema resolve para a IF.
Referências normativas quando aplicável — ex: Resolução CMN 3.909/2021.]

## Escopo *
### Inclui
- [Comportamentos cobertos por esta spec]

### Exclui (fora de escopo)
- [O que explicitamente não faz parte desta entrega]

## Regras de domínio *
[Seção crítica para Tier 1. Cada regra financeira ou regulatória
listada com fórmula, exceções e casos extremos quando aplicável.]

## Entradas *
| Campo | Tipo | Obrigatório | Validação | Exemplo |
|---|---|---|---|---|

## Saídas *
| Campo | Tipo | Formato | Exemplo |
|---|---|---|---|

## Comportamento esperado *
[Cenários no formato: "Dado X, quando Y, então Z"]

## Casos extremos *
[Limites e situações degenradas que precisam de tratamento explícito]

## Critérios de aceite *
- [ ] [Condição testável — cada item deve poder ser verificado por teste automatizado]

## Dependências
[Módulos, APIs externas, tabelas do banco envolvidas]

## Considerações de segurança
[Validações de entrada, dados sensíveis, regras de autorização]

## Notas de implementação
[Orientações técnicas específicas — sem prescrever a solução,
apenas sinalizando restrições ou caminhos a evitar]
```

### 14.5 Templates de prompt padronizados

Os prompts a seguir são os templates oficiais do processo SDD da Arphia. Devem ser copiados integralmente e preenchidos nos campos indicados por colchetes antes de cada execução.

---

#### Prompt 1 — Discovery

**Quando usar:** ao receber um requisito ainda informal do PO, antes de redigir a spec.

**Objetivo:** estruturar o requisito bruto, identificar ambiguidades e mapear as regras de domínio implícitas.

````
Você é um assistente de especificação técnica para o DamaTools, plataforma
SaaS da Arphia voltada a instituições financeiras reguladas pelo BCB.

## Contexto do projeto
- Módulo: [nome do módulo — ex: Calculadora Financeira]
- Tier estimado: [1 / 2 / 3]
- Stack: TypeScript, Next.js 14, PostgreSQL com Prisma, decimal.js para cálculos monetários

## Requisito recebido
[Colar aqui o texto original do requisito — pode ser informal]

## Tarefa
Analise o requisito acima e retorne exatamente as cinco seções abaixo:

**1. Reformulação objetiva**
O requisito em uma frase, no formato:
"O sistema deve [ação] para que [usuário] possa [objetivo de negócio]."

**2. Ambiguidades identificadas**
Cada ponto que exige esclarecimento antes de redigir a spec. Seja específico.

**3. Regras de domínio implícitas**
Regras financeiras ou regulatórias que o requisito pressupõe mas não menciona.
Para Tier 1, liste as fórmulas quando conhecidas.

**4. Escopo sugerido**
O que deve e o que não deve fazer parte desta entrega.

**5. Perguntas para o Product Owner**
Máximo 5 perguntas objetivas, em ordem de prioridade, para resolver
as ambiguidades antes de avançar.

Tom: técnico e objetivo. Responda em português.
````

---

#### Prompt 2 — Geração de spec Tier 1

**Quando usar:** após as ambiguidades do Prompt 1 estarem resolvidas, para tarefas que envolvem cálculos financeiros, regras regulatórias ou geração de arquivos para o BCB.

````
Você é um especialista em especificação de sistemas financeiros brasileiros
regulados pelo Banco Central.

## Contexto do módulo
- Módulo: [nome]
- Funcionalidade: [título da spec]
- Referências normativas aplicáveis: [ex: Resolução CMN 4.557/2017, Circular BCB 3.957/2019]

## Requisito estruturado
[Colar o resultado do Prompt 1 — Reformulação + escopo confirmado]

## Regras de domínio confirmadas pelo tech lead
[Listar as regras financeiras já validadas — fórmulas, arredondamentos, exceções]

## Tarefa
Gere uma especificação técnica completa seguindo exatamente a estrutura
do template padrão DamaTools:

# SPEC / ## Metadados / ## Objetivo / ## Contexto / ## Escopo /
## Regras de domínio / ## Entradas / ## Saídas /
## Comportamento esperado / ## Casos extremos /
## Critérios de aceite / ## Dependências /
## Considerações de segurança / ## Notas de implementação

**Instruções por seção:**
- Regras de domínio: seja exaustivo. Liste cada regra com fórmula, unidade,
  arredondamento e exceções. Erros aqui geram bugs silenciosos em produção.
- Comportamento esperado: use formato Gherkin (Dado / Quando / Então)
  para cada cenário, incluindo ao menos um cenário de erro.
- Critérios de aceite: cada item deve ser verificável por teste unitário.
  Inclua ao menos um caso numérico concreto calculado manualmente.
- Entradas/Saídas: use tabelas com tipo TypeScript explícito e exemplo real.

Responda somente com o conteúdo da spec, sem preâmbulo ou comentário.
````

---

#### Prompt 3 — Geração de spec Tier 2

**Quando usar:** para tarefas de lógica de negócio padrão — telas que consomem cálculos já validados, formulários, integrações de API, fluxos de navegação.

````
Você é um assistente de especificação técnica para o DamaTools.

## Contexto
- Módulo: [nome]
- Funcionalidade: [título]
- Tier: 2 — lógica de negócio padrão (não envolve cálculos financeiros críticos)
- Stack: TypeScript, Next.js 14 (App Router), PostgreSQL/Prisma, Tailwind CSS

## Requisito
[Descrição da funcionalidade com escopo já definido]

## Tarefa
Gere uma especificação técnica nível Tier 2 com ênfase em:

- Entradas e validações: campos obrigatórios, tipos, limites, formatos
- Comportamento de UI: estados vazios, loading, erro, sucesso — cada um
  com descrição de como deve se apresentar ao usuário
- Regras de autorização: qual role pode executar cada ação (owner, admin, member)
- Operações no banco: quais tabelas são lidas e escritas
- Critérios de aceite: verificáveis por teste de integração ou E2E

Onde houver dúvida sobre uma regra de negócio, sinalizar com:
> ⚠️ VERIFICAR COM TECH LEAD: [descrever a dúvida]

Seguir o template padrão DamaTools. Responder somente com o conteúdo da spec.
````

---

#### Prompt 4 — Plano de implementação

**Quando usar:** após a spec estar aprovada, para decompô-la em tarefas sequenciais executáveis pelo desenvolvedor em formação.

````
Você é um tech lead decompondo uma spec aprovada em tarefas de implementação
para um desenvolvedor em formação inicial.

## Spec aprovada
[Colar o conteúdo completo da spec aprovada]

## Contexto da equipe e arquitetura
- Executor: desenvolvedor em formação (TypeScript/React iniciante)
- Stack: TypeScript, Next.js 14 (App Router), PostgreSQL, Prisma, Tailwind CSS
- Arquitetura modular:
  - /src/modules/[modulo]/domain/    ← regras de negócio e cálculos
  - /src/modules/[modulo]/ui/        ← componentes do módulo
  - /src/modules/[modulo]/index.ts   ← interface pública
  - /src/shared/                     ← auth, utils, componentes base
  - /tests/modules/[modulo]/         ← testes espelhando src/modules

## Tarefa
Gere um plano de implementação com as seguintes regras:

1. Tasks sequenciais — cada task tem a anterior como pré-requisito
2. Granularidade — cada task implementável em no máximo 2 horas
3. Instrução clara — o dev não deve precisar deduzir o que fazer
4. Teste junto — cada task inclui o teste que deve ser escrito na mesma task,
   nunca depois
5. Pontos de revisão — indicar obrigatoriamente após tasks que tocam em
   lógica de domínio ou autorização

**Formato obrigatório de cada task:**

### Task N — [título objetivo]
- **O que fazer:** [instrução direta — começar com verbo no imperativo]
- **Onde:** [caminho exato do arquivo a criar ou modificar]
- **Como verificar:** [critério objetivo de conclusão]
- **Teste a escrever:** [o que o teste deve verificar]
- **⚠️ Ponto de revisão do tech lead:** Sim / Não
  - Se Sim: [o que especificamente o tech lead deve revisar]

**Sinalização de risco:**
- 🔴 tasks que tocam em lógica financeira (Tier 1)
- 🟡 tasks de autorização, banco de dados ou integração externa
- 🟢 tasks de UI, estrutura ou scaffolding

**Task final obrigatória em todo plano — incluir sempre como última task:**

```
### Task Final 🟢 — Atualizar CONTEXT.md do módulo
- **O que fazer:** atualizar docs/specs/[modulo]/CONTEXT.md com:
  1. Mover o item desta spec de "Backlog do módulo" para
     "Funcionalidades implementadas" com status "Implementada"
  2. Adicionar à seção "Interfaces públicas" os novos tipos e
     funções exportados pelo módulo após esta implementação
  3. Registrar em "Padrões de código estabelecidos" qualquer
     padrão novo introduzido (somente se genuinamente novo)
  4. Não remover nem alterar informações de specs anteriores
- **Onde:** docs/specs/[modulo]/CONTEXT.md
- **Como verificar:** o CONTEXT.md reflete com precisão o estado
  atual do módulo após a implementação desta spec
- **Teste a escrever:** não aplicável
- **⚠️ Ponto de revisão do tech lead:** Sim
  - Revisar o diff do CONTEXT.md no PR para confirmar que o
    agente registrou as informações corretamente e não removeu
    nem distorceu conteúdo de specs anteriores
```

Responder somente com o plano, sem preâmbulo.
````

---

#### Prompt 5 — Verificação pré-PR

**Quando usar:** com a implementação concluída, antes de abrir o Pull Request.
**Quem executa:** o próprio desenvolvedor, como auto-verificação obrigatória.

````
Você é um revisor técnico verificando aderência de uma implementação à
sua especificação aprovada.

## Spec aprovada
[Colar spec completa]

## Código implementado
[Colar os arquivos relevantes — domain, route, componente, testes]

## Tarefa
Execute uma verificação sistemática e retorne as seis seções abaixo:

**1. Cobertura de critérios de aceite**
Para cada item da seção "Critérios de aceite" da spec, classificar:
✅ implementado e testado | ⚠️ implementado sem teste | ❌ ausente

**2. Conformidade com regras de domínio**
Cada regra da seção "Regras de domínio" está refletida no código?
Sinalizar qualquer divergência entre spec e implementação.

**3. Cobertura de casos extremos**
Os casos extremos listados na spec têm tratamento explícito no código?

**4. Violações de padrão DamaTools**
Verificar obrigatoriamente:
- Uso de float nativo em vez de decimal.js em qualquer operação monetária
- Dados sensíveis (CPF, CNPJ, valores) presentes em logs
- Ausência de validação de entrada com Zod
- Query SQL ou Prisma sem filtro de organizationId (risco de IDOR)
- Segredo ou credencial em código-fonte

**5. Qualidade dos testes**
Os testes cobrem os cenários descritos nos critérios de aceite?
Existe ao menos um teste com valor numérico concreto para specs Tier 1?

**6. Veredicto**
PRONTO PARA PR — implementação atende integralmente à spec.
ou
BLOQUEADO — listar o que falta antes de abrir o PR.

Responder de forma objetiva, por tópico, sem preâmbulo.
````

---

### 14.6 Passo a passo completo — exemplo prático

A seguir, o ciclo SDD completo aplicado à implementação do cálculo de amortização SAC no módulo Calculadora Financeira.

---

**Requisito original recebido do PO:**

> "Precisamos que o usuário consiga simular um financiamento pelo SAC, com o valor das parcelas diminuindo ao longo do tempo."

---

**Etapa 1 — Discovery (Prompt 1)**

O tech lead executa o Prompt 1. Resultado relevante:

*Reformulação objetiva:* "O sistema deve calcular e exibir o cronograma completo de amortização SAC dado valor financiado, prazo em meses, taxa efetiva ao mês e data de início, para que o colaborador da IF possa apresentar a simulação ao cliente final."

*Ambiguidades identificadas:*
- A taxa fornecida é nominal ou efetiva? Ao mês ou ao ano?
- IOF deve ser incluído ou calculado em módulo separado?
- Carência pré-pagamento é suportada nesta entrega?

*Regras de domínio implícitas:*
- Amortização constante: `A = PV ÷ n`
- Juros no período k: `J_k = SD_{k-1} × i`
- Parcela no período k: `PMT_k = A + J_k`
- Arredondamento: ABNT NBR 5891, 2 casas decimais, apenas no resultado final de cada parcela

O tech lead esclarece as ambiguidades com o PO antes de prosseguir.

---

**Etapa 2 — Spec aprovada (Prompt 2)**

Com as ambiguidades resolvidas, o tech lead gera e aprova a seguinte spec:

```markdown
# SPEC: Simulação de Amortização SAC

## Metadados
- **Módulo:** Calculadora Financeira
- **Tier:** 1
- **Status:** Aprovada
- **Autor:** Tech Lead
- **Revisor:** Tech Lead
- **Data:** 2027-03-10
- **Issue:** #47

## Objetivo
O sistema deve calcular e exibir o cronograma completo de amortização
pelo método SAC para que o colaborador da instituição financeira possa
apresentar a simulação ao cliente final antes da contratação.

## Contexto
O SAC (Sistema de Amortização Constante) é amplamente utilizado em
financiamentos imobiliários e rurais no Brasil. A amortização é constante
em todas as parcelas, resultando em prestações decrescentes ao longo do tempo.
Referência: Manual de Normas do SFH, Circular BCB 3.957/2019.

## Escopo
### Inclui
- Cálculo do cronograma completo (todas as n parcelas)
- Exportação do cronograma em CSV

### Exclui
- IOF — calculado em CALC-02 (módulo separado)
- Carência — fora de escopo desta spec
- Seguros MIP/DFI

## Regras de domínio
**RD-01 Amortização constante**
`A = PV ÷ n`
Onde PV = valor financiado, n = prazo em meses.
A amortização é idêntica em todas as parcelas.

**RD-02 Saldo devedor**
`SD_0 = PV`
`SD_k = PV - (k × A)`

**RD-03 Juros do período**
`J_k = SD_{k-1} × i`
Onde i é a taxa efetiva ao mês em decimal (ex: 1% = 0.01).

**RD-04 Prestação do período**
`PMT_k = A + J_k`
As prestações são decrescentes — a primeira é a maior.

**RD-05 Arredondamento**
Todas as operações intermediárias mantêm precisão máxima (decimal.js).
O arredondamento para 2 casas decimais aplica-se somente ao
valor final de `amortizacao`, `juros` e `prestacao` de cada período.
Float nativo (Number) é proibido em qualquer operação desta função.

**RD-06 Ajuste da última parcela**
A última parcela absorve diferenças de arredondamento acumuladas,
garantindo que `SUM(amortizacao[1..n]) = PV` exatamente.

## Entradas
| Campo | Tipo TS | Obrigatório | Validação | Exemplo |
|---|---|---|---|---|
| valorFinanciado | `Decimal` | Sim | > 0 e ≤ 100.000.000 | `250000.00` |
| prazoMeses | `number` (int) | Sim | ≥ 1 e ≤ 600 | `360` |
| taxaMensal | `Decimal` | Sim | > 0 e ≤ 100 (%) | `0.75` |
| dataInicio | `Date` | Sim | ≥ data atual | `2027-04-01` |

## Saídas
Array `SACParcela[]` onde cada objeto contém:

| Campo | Tipo TS | Descrição |
|---|---|---|
| parcela | `number` | Índice da parcela (1..n) |
| dataVencimento | `Date` | Data de vencimento |
| saldoDevedor | `Decimal` | Saldo antes do pagamento |
| amortizacao | `Decimal` | Valor da amortização |
| juros | `Decimal` | Valor dos juros do período |
| prestacao | `Decimal` | Valor total (amortizacao + juros) |

## Comportamento esperado

**Cenário 1 — cálculo padrão**
Dado: valorFinanciado=120000, prazoMeses=12, taxaMensal=1%
Quando: o sistema calcula o cronograma
Então:
- amortizacao de todas as parcelas = 10000.00
- prestacao[1] = 11200.00 (10000 + 1200 de juros)
- prestacao[12] = 10100.00 (10000 + 100 de juros)
- SUM(amortizacao) = 120000.00 exatamente

**Cenário 2 — prazo único**
Dado: prazoMeses=1
Quando: o sistema calcula
Então: retorna array com exatamente 1 elemento,
onde prestacao[1] = valorFinanciado × (1 + taxaMensal)

**Cenário 3 — entrada inválida**
Dado: valorFinanciado=-1000
Quando: o sistema tenta calcular
Então: retorna erro de validação 400 com mensagem descritiva,
sem executar nenhum cálculo

## Casos extremos
- prazoMeses = 1: array com um único elemento
- taxaMensal = 0: prestações iguais a PV/n, sem juros
- valorFinanciado = 100.000.000: sem overflow com decimal.js
- Arredondamento acumulado: última parcela ajustada (RD-06)

## Critérios de aceite
- [ ] PV=120000, n=12, i=1%: amortizacao = 10000.00 em todas as parcelas
- [ ] PV=120000, n=12, i=1%: prestacao[0] = 11200.00
- [ ] PV=120000, n=12, i=1%: prestacao[11] = 10100.00
- [ ] SUM(amortizacao) = PV para qualquer combinação de entradas válidas
- [ ] taxaMensal=0: todas as prestacoes iguais a PV/n
- [ ] valorFinanciado=-1: retorna erro 400
- [ ] prazoMeses=601: retorna erro 400
- [ ] Nenhuma operação usa Number nativo para aritmética monetária
- [ ] Última parcela absorve diferença de arredondamento (RD-06)

## Dependências
- `decimal.js` para todas as operações monetárias
- `prisma.simulation` no schema `calculator` para persistência
- Módulo `shared/auth` para verificação de organização

## Considerações de segurança
- Validar todas as entradas com Zod antes de qualquer cálculo
- Não logar valorFinanciado nem taxaMensal nos logs de aplicação
- Verificar organizationId da sessão antes de persistir ou retornar dados

## Notas de implementação
- A função calculateSAC() deve ser pura (sem efeitos colaterais)
  para facilitar testes unitários
- Separar cálculo (domain/) de persistência (repository/) e
  de apresentação (ui/) conforme arquitetura modular
```

---

**Etapa 3 — Plano de implementação (Prompt 4)**

Com a spec aprovada, o dev executa o Prompt 4. Resultado:

```markdown
### Task 1 🟢 — Criar estrutura de arquivos do módulo
- **O que fazer:** criar os arquivos base do módulo SAC sem lógica ainda
- **Onde:** `/src/modules/calculator/domain/sac.ts` e
  `/tests/modules/calculator/domain/sac.test.ts`
- **Como verificar:** `npx tsc --noEmit` não retorna erros
- **Teste a escrever:** arquivo de teste criado com `describe('calculateSAC')` vazio
- **⚠️ Ponto de revisão:** Não

### Task 2 🔴 — Implementar a função calculateSAC()
- **O que fazer:** implementar a função seguindo exatamente as regras
  RD-01 a RD-06 da spec. Usar decimal.js em toda operação monetária.
  Assinatura: `calculateSAC(input: SACInput): SACParcela[]`
- **Onde:** `/src/modules/calculator/domain/sac.ts`
- **Como verificar:** os 5 critérios de aceite numéricos da spec passam
- **Teste a escrever:** cobrir os 9 critérios de aceite da spec,
  incluindo o caso de soma exata de amortizações (RD-06)
- **⚠️ Ponto de revisão:** SIM
  - Tech lead revisa os cálculos linha a linha antes de continuar

### Task 3 🟡 — Criar schema Prisma e migration
- **O que fazer:** adicionar model `Simulation` ao `schema.prisma`
  no schema `"calculator"`, com campos conforme seção Saídas da spec
- **Onde:** `prisma/schema.prisma` e migration gerada por
  `npx prisma migrate dev --name add_sac_simulation`
- **Como verificar:** migration aplica sem erro; `prisma studio` exibe a tabela
- **Teste a escrever:** teste de integração: salvar e recuperar uma simulação
- **⚠️ Ponto de revisão:** SIM
  - Tech lead revisa o schema antes de aplicar migration

### Task 4 🟡 — Criar API route POST /api/calculator/sac
- **O que fazer:** validar entrada com Zod, chamar `calculateSAC()`,
  persistir via Prisma, retornar resultado. Verificar `organizationId` da sessão.
- **Onde:** `/src/app/api/calculator/sac/route.ts`
- **Como verificar:** `curl -X POST` com payload válido retorna
  array de parcelas correto; payload inválido retorna 400
- **Teste a escrever:** teste de integração do endpoint (happy path + erros 400)
- **⚠️ Ponto de revisão:** Não (tasks 2 e 3 já revisadas)

### Task 5 🟢 — Criar componente SACResultTable
- **O que fazer:** tabela React exibindo o cronograma com colunas da seção
  Saídas da spec. Incluir botão de exportação CSV.
  Estados: loading (skeleton), erro (mensagem), dados (tabela).
- **Onde:** `/src/modules/calculator/ui/SACResultTable.tsx`
- **Como verificar:** renderiza sem erro com dados mock; botão CSV dispara download
- **Teste a escrever:** render test: tabela exibe dados mock corretamente
- **⚠️ Ponto de revisão:** Não
```

---

**Etapa 4 — Implementação**

O desenvolvedor executa as tasks em sequência, parando nos pontos de revisão marcados 🔴 e 🟡 antes de continuar.

---

**Etapa 5 — Verificação pré-PR (Prompt 5)**

Antes de abrir o PR, o desenvolvedor executa o Prompt 5 com a spec e o código produzido. Qualquer item classificado como ❌ ou ⚠️ no retorno deve ser corrigido antes da submissão. O link para `docs/specs/calculator/sac-amortizacao.md` é incluído na descrição do PR.

---

### 14.7 Armazenamento e versionamento

O repositório mantém dois tipos distintos de artefatos do SDD, com ciclos de vida diferentes:

**Specs** são permanentes e imutáveis após aprovação. Documentam *o que* foi construído e servem de referência para manutenção futura, onboarding e geração de novas specs no mesmo módulo.

**Planos de implementação** são efêmeros. Documentam *como* construir passo a passo, ficam obsoletos após a conclusão do PR e não precisam ser mantidos indefinidamente. São armazenados separadamente para não poluir o histórico de referência com artefatos transitórios.

```
docs/
├── specs/                          ← permanente; imutável após aprovação
│   ├── _template.md                ← template em branco para copiar
│   ├── calculator/
│   │   ├── CONTEXT.md              ← contexto do módulo para agentes de IA
│   │   ├── sac-amortizacao.md
│   │   ├── price-amortizacao.md
│   │   └── cet.md
│   ├── amcc/
│   │   ├── CONTEXT.md
│   │   └── xml-generation.md
│   ├── ras/
│   │   ├── CONTEXT.md
│   │   └── indicadores-dashboard.md
│   └── calendar/
│       ├── CONTEXT.md
│       └── event-motor.md
└── plans/                          ← efêmero; arquivado após merge do PR
    ├── calculator/
    │   └── sac-amortizacao.md      ← espelha o nome da spec correspondente
    ├── amcc/
    └── ras/
```

**Ciclo de vida por artefato:**

| Artefato | Localização | Criado quando | Ciclo de vida |
|---|---|---|---|
| Spec | `docs/specs/[modulo]/[nome].md` | Antes do branch | Permanente; imutável após aprovação |
| Plano de implementação | `docs/plans/[modulo]/[nome].md` | Após spec aprovada | Arquivado após merge do PR |
| CONTEXT.md do módulo | `docs/specs/[modulo]/CONTEXT.md` | Na primeira spec do módulo | Atualizado a cada nova spec |
| Template | `docs/specs/_template.md` | Uma vez | Permanente |

**Relacionamento entre spec e plano:**

O arquivo de plano referencia a spec no cabeçalho:

```markdown
# PLANO: Simulação de Amortização SAC
> Spec: docs/specs/calculator/sac-amortizacao.md
> Issue: #47 | Branch: feature/calculator-sac-amortization
```

Ao ser aprovada, a spec registra o link para o plano correspondente em seus metadados:

```markdown
## Metadados
- **Status:** Aprovada
- **Plano:** docs/plans/calculator/sac-amortizacao.md
```

Mudanças de requisito durante a implementação resultam na criação de uma nova spec ou de um adendo versionado — nunca na edição do documento original aprovado.

### 14.8 Critérios de aprovação de uma spec

O tech lead aprova uma spec quando todos os critérios abaixo são atendidos:

- **Objetivo testável:** cada critério de aceite pode ser verificado por um teste automatizado sem interpretação subjetiva
- **Regras de domínio completas:** nenhuma regra financeira foi deixada implícita; o desenvolvedor não precisa consultar fontes externas para implementar
- **Casos extremos mapeados:** os limites do sistema estão definidos explicitamente
- **Escopo delimitado:** o que não está descrito na spec não entra no PR — a spec é o contrato
- **Sem ambiguidade executável:** o desenvolvedor em formação consegue implementar sem precisar interpretar o que fazer em qualquer situação coberta pela spec

Specs reprovadas retornam ao autor com comentários objetivos por seção. O desenvolvimento não se inicia enquanto o status não estiver em `Aprovada`.

### 14.9 Integração com o board Scrumban

No GitHub Projects, o ciclo de uma tarefa com SDD segue a progressão:

```
Backlog
  → A fazer
      → Em progresso [label: spec:em-andamento]
      → Em progresso [label: spec:em-revisão]
      → Em progresso [label: spec:aprovada]  ← branch aberto aqui
  → Em review (PR aberto)
  → Concluído
```

A label `spec:aprovada` no card sinaliza para toda a equipe que o desenvolvimento pode ser iniciado. PRs de tarefas Tier 1 ou Tier 2 sem essa label são recusados na revisão.

### 14.10 Arquivo CONTEXT.md por módulo

O `CONTEXT.md` é um arquivo de referência rápida mantido na pasta de specs de cada módulo. Seu propósito principal é fornecer ao agente de IA o estado atual do módulo antes da geração de novas specs ou planos — sem ele, o agente desconhece o que já foi construído e gera artefatos redundantes, contraditórios ou fora dos padrões estabelecidos pelo time.

É também o ponto de entrada recomendado para qualquer desenvolvedor que começa a trabalhar em um módulo pela primeira vez.

**Estrutura do CONTEXT.md:**

```markdown
# Contexto do módulo — [Nome do Módulo]

## Propósito
[Uma ou duas frases: o que este módulo resolve para a IF]

## Funcionalidades implementadas
| Spec | Status | Descrição |
|---|---|---|
| [sac-amortizacao.md](sac-amortizacao.md) | Implementada | Cronograma SAC completo |
| [price-amortizacao.md](price-amortizacao.md) | Em desenvolvimento | ... |

## Interfaces públicas (index.ts)
[Funções e tipos exportados — atualizar a cada spec implementada]

## Regras de domínio transversais ao módulo
[Regras que se aplicam a todas as specs — ex: taxa sempre ao mês
em decimal, arredondamento sempre no resultado final]

## Padrões de código estabelecidos
- [Ex: funções de domain/ são puras, sem efeitos colaterais]
- [Ex: validação com Zod antes de entrar no domain/]

## Dependências externas consumidas
[APIs, tabelas de banco, módulos shared utilizados]

## Backlog do módulo (não iniciadas)
[Specs planejadas mas ainda não escritas — evita duplicação]
```

**Manutenção:** o tech lead atualiza o `CONTEXT.md` ao aprovar cada nova spec do módulo. A seção "Funcionalidades implementadas" cresce incrementalmente, tornando-se um índice vivo de tudo que o módulo entrega.

### 14.11 Contexto obrigatório para agentes de IA

Agentes de IA (Claude Code, Cursor, Claude via chat) devem carregar contexto antes de executar qualquer prompt do SDD. A qualidade da spec ou plano gerado é diretamente proporcional à profundidade do contexto fornecido.

**Por que o contexto é necessário:**

| Sem este contexto | Risco concreto |
|---|---|
| `CLAUDE.md` | Agente usa `Number` em vez de `decimal.js`; loga dados sensíveis; ignora padrões de commit e arquitetura |
| `CONTEXT.md` do módulo | Agente reimplementa função já existente em `domain/`; gera spec para algo já implementado; ignora padrões do módulo |
| Código `domain/` do módulo | Agente propõe estrutura divergente do padrão; desconhece tipos já definidos; duplica lógica |
| Specs existentes do módulo | Agente cria spec que contradiz comportamento já especificado em outra entrega do mesmo módulo |

**Hierarquia de contexto por Tier:**

| Arquivo de contexto | Tier 1 | Tier 2 | Tier 3 | Forma de fornecer |
|---|---|---|---|---|
| `CLAUDE.md` | Obrigatório | Obrigatório | Recomendado | Sempre presente no raiz do repo |
| `docs/specs/[modulo]/CONTEXT.md` | Obrigatório | Obrigatório | Recomendado | Referenciar antes do prompt |
| `src/modules/[modulo]/domain/` | Obrigatório | Recomendado | Não necessário | Referenciar arquivos relevantes |
| `src/modules/[modulo]/index.ts` | Recomendado | Recomendado | Não necessário | Referenciar antes do prompt |
| Specs existentes do módulo | Recomendado | Opcional | Não necessário | Referenciar antes do prompt |

**No Cursor (via `@`):**

```
@CLAUDE.md
@docs/specs/calculator/CONTEXT.md
@src/modules/calculator/domain/

[Prompt 2 — Geração de spec Tier 1 preenchido]
```

**No Claude Code (CLI):**

```bash
claude \
  --context CLAUDE.md \
  --context docs/specs/calculator/CONTEXT.md \
  --context src/modules/calculator/domain/ \
  "$(cat docs/plans/prompts/sdd-spec-tier1.md)"
```

**No Claude via chat:**

Colar sequencialmente no início da conversa, antes do prompt de spec:
1. Conteúdo de `CLAUDE.md`
2. Conteúdo de `docs/specs/[modulo]/CONTEXT.md`
3. Conteúdo dos arquivos de `domain/` relevantes
4. Em seguida, o prompt de spec preenchido

**Bloco de contexto para prefixar os Prompts 2, 3 e 4:**

O seguinte bloco deve ser adicionado no início de qualquer prompt que gera spec ou plano, com os campos preenchidos:

```
## Contexto do projeto (carregar antes de qualquer geração)

### Regras transversais — CLAUDE.md
[Conteúdo de CLAUDE.md]

### Estado atual do módulo [nome] — CONTEXT.md
[Conteúdo de docs/specs/[modulo]/CONTEXT.md]

### Interfaces existentes — domain/
[Conteúdo dos arquivos relevantes de src/modules/[modulo]/domain/]

---
[Prompt de spec ou plano a seguir]
```

Esse bloco garante que o agente nunca opere no vácuo: toda geração parte do estado real e atual do módulo, incorporando o que já foi construído, os padrões estabelecidos e as restrições de domínio já documentadas.

### 14.12 Atualização do CONTEXT.md pelo agente de IA

O agente que executa o plano de implementação é o artefato com maior contexto sobre o que foi construído naquele momento: conhece a spec que seguiu, o código que escreveu, os tipos que exportou e os padrões que aplicou. Atribuir a ele a responsabilidade de atualizar o `CONTEXT.md` ao final da execução é, portanto, mais preciso e confiável do que depender de o tech lead lembrar de fazê-lo manualmente após o merge.

Essa atualização está codificada como **Task Final obrigatória** em todo plano gerado pelo Prompt 4 (Seção 14.5). Ela faz parte do PR como qualquer outro arquivo modificado, e o diff é revisado pelo tech lead como parte do code review.

**O que o agente deve atualizar:**

| Seção do CONTEXT.md | Ação |
|---|---|
| Funcionalidades implementadas | Mover o item de "Backlog" para esta seção com status `Implementada` |
| Interfaces públicas (index.ts) | Adicionar os novos tipos e funções exportados |
| Padrões de código estabelecidos | Registrar apenas padrões genuinamente novos (não repetir os já listados) |
| Backlog do módulo | Remover o item recém-implementado |

**O que o agente não deve fazer:**

- Alterar ou remover registros de specs anteriores
- Reescrever o propósito do módulo
- Adicionar informações sobre outras specs além da que acabou de implementar
- Inferir padrões que não foram explicitamente aplicados nesta implementação

**Ciclo completo com atualização automática:**

```
[Agente lê CONTEXT.md]          ← contexto antes de gerar a spec
        ↓
[Agente gera spec]
        ↓
[Tech lead aprova spec]
        ↓
[Agente executa plano de implementação]
        ↓
[Task Final: agente atualiza CONTEXT.md]  ← fecha o ciclo
        ↓
[PR inclui: código + testes + CONTEXT.md atualizado]
        ↓
[Tech lead revisa diff do CONTEXT.md no code review]
        ↓
[Merge → CONTEXT.md reflete o estado atual do módulo]
        ↓
[Próxima spec: agente lê CONTEXT.md atualizado]  ← ciclo recomeça
```

**Revisão humana do diff:**

A atualização automática pelo agente não dispensa revisão. No code review, o tech lead verifica o diff do `CONTEXT.md` com duas perguntas objetivas:

1. O agente registrou corretamente o que foi implementado?
2. O agente preservou sem alteração o que já existia no arquivo?

Se o diff contiver imprecisões ou omissões, o tech lead corrige diretamente no PR antes do merge — o mesmo fluxo de qualquer outro arquivo do repositório.

**Benefício acumulado:**

A cada spec implementada, o `CONTEXT.md` cresce com uma entrada precisa sobre o que foi construído, validada pelo agente que construiu e revisada pelo tech lead que aprovou. Após seis meses de desenvolvimento, o arquivo contém um índice fiel de tudo que o módulo entrega — sem esforço de manutenção adicional além do que já está incorporado ao fluxo de code review.

---

## 15. Segurança da aplicação

Esta seção é particularmente crítica para a Arphia: os clientes são instituições financeiras reguladas pelo Banco Central, com obrigações legais sobre proteção de dados e cibersegurança. Falhas de segurança não são apenas problemas técnicos — geram exposição regulatória, perda de confiança e potencialmente exclusão do mercado.

A abordagem de segurança aqui é **defesa em profundidade**: múltiplas camadas independentes de proteção, partindo do princípio de que qualquer camada individual pode falhar.

### 15.1 Contexto regulatório

Dois corpos regulatórios principais incidem sobre o DamaTools:

**LGPD (Lei Geral de Proteção de Dados Pessoais — Lei 13.709/2018):**

Toda informação pessoal de cidadãos brasileiros (CPF, e-mail, dados financeiros pessoais) está sob escopo da LGPD. As implicações concretas para o produto:

- Coleta de dados apenas com finalidade explícita
- Direito do titular de acessar, corrigir e excluir seus dados
- Notificação obrigatória de incidentes de segurança à ANPD
- Designação de encarregado de dados (DPO) quando aplicável
- Bases legais documentadas para cada tratamento (consentimento, execução de contrato, obrigação legal)

**Resoluções do Banco Central sobre cibersegurança:**

A Resolução CMN nº 4.893/2021 (e suas atualizações posteriores, incluindo a Resolução CMN nº 5.274) estabelece requisitos de política de cibersegurança e contratação de serviços de processamento de dados para instituições financeiras. Embora a Arphia não seja uma IF, ao **prestar serviços a IFs** torna-se parte da cadeia de fornecedores que essas instituições precisam avaliar — o que significa que clientes farão due diligence de segurança antes de contratar.

Implicações práticas: a documentação de práticas de segurança (esta seção, mais procedimentos detalhados a desenvolver) será solicitada por clientes em processos de homologação. Tê-la robusta desde o início é tanto questão de segurança quanto de viabilidade comercial.

### 15.2 Princípios norteadores

Cinco princípios que devem orientar toda decisão de segurança no projeto:

**Defesa em profundidade.** Nenhuma camada de segurança é confiável sozinha. Autenticação forte + autorização granular + criptografia + logs + monitoramento. Se uma falha, as outras seguram.

**Princípio do menor privilégio.** Todo usuário, processo e serviço tem acesso ao mínimo necessário para sua função, e nada além. Dev em formação não tem acesso ao banco de produção. Aplicação não roda como root no servidor. Conexão de banco usa usuário com permissões limitadas, não superuser.

**Negar por padrão.** Em qualquer decisão de acesso (rota protegida, ação em recurso, leitura de dado), a postura inicial é negar; permissão deve ser explicitamente concedida. Bug em código de autorização que falha tem que falhar para o lado seguro.

**Falhar de forma segura.** Erros e exceções não devem vazar informação (stack traces em produção, mensagens detalhadas de erro de banco). Em situação de incerteza, a aplicação fecha as portas em vez de abri-las.

**Segredos nunca no código.** Senhas, chaves de API, tokens, strings de conexão — tudo via variáveis de ambiente ou secrets manager. Commitar segredo no Git é incidente de segurança mesmo que o repositório seja privado.

### 15.3 Autenticação e gestão de sessões

**Hash de senhas:** `argon2id` (ou `bcrypt` com cost factor >= 12 como alternativa). Nunca armazenar senha em texto, nunca usar MD5 ou SHA-1. Biblioteca recomendada: `argon2` para Node.js.

**Política de senha:**

Seguindo as recomendações modernas do NIST (SP 800-63B):
- Mínimo de 12 caracteres
- Sem exigência arbitrária de "1 maiúscula + 1 número + 1 especial" (causa senhas previsíveis)
- Verificação contra lista de senhas comprometidas (HaveIBeenPwned API)
- Sem expiração compulsória (forçar troca periódica gera senhas piores)

**Cookies de sessão:**

```
Set-Cookie: sessionId=...; HttpOnly; Secure; SameSite=Strict; Path=/
```

- `HttpOnly`: impede acesso via JavaScript (mitiga XSS exfiltrando sessão)
- `Secure`: cookie enviado apenas via HTTPS
- `SameSite=Strict`: protege contra CSRF

**Multi-factor authentication (MFA):**

Recomendada desde o início para usuários com papel admin (capazes de gerar arquivos regulatórios, alterar configurações). TOTP via apps como Authy ou Google Authenticator. Para usuários comuns, MFA é opcional inicialmente, mas a infraestrutura deve estar pronta.

**Proteção contra brute force:**

- Rate limiting em endpoints de login (5 tentativas por 15 minutos por IP + por usuário)
- Lock de conta após 10 tentativas falhas (com notificação por e-mail)
- CAPTCHA após 3 tentativas falhas em sequência

**Biblioteca recomendada:** Auth.js (NextAuth) — testada, ativamente mantida, integra bem com Next.js e Prisma.

### 15.4 Autorização e controle de acesso

Modelo baseado em **RBAC (Role-Based Access Control) multi-tenant**, conforme a estrutura definida em 6.6:

```
Usuário → pertence a → Organização → tem acesso a → Módulos
   ↑
   tem Role na organização
```

**Verificação em três camadas:**

1. **Middleware de rota** (servidor) — bloqueia acesso a rotas sem permissão antes mesmo do handler executar
2. **Lógica de aplicação** — cada operação verifica novamente (defesa em profundidade)
3. **UI** — esconde botões/links de ações sem permissão (UX, não segurança real)

**Prevenção de IDOR (Insecure Direct Object Reference):**

Toda query que busca um recurso por ID deve **incluir o owner ou organização na cláusula WHERE**, nunca apenas o ID:

```typescript
// ❌ Errado — usuário pode requisitar qualquer simulação
const sim = await prisma.simulation.findUnique({ where: { id } });

// ✅ Correto — só retorna se pertencer à organização do usuário
const sim = await prisma.simulation.findFirst({
  where: { id, organizationId: session.organizationId }
});
```

Esta é uma das classes de bug mais comuns em aplicações multi-tenant — exposição de dados de um cliente para outro. A regra é absoluta e deve estar no `CLAUDE.md`.

### 15.5 Proteção de dados

**Em trânsito (TLS):**

- HTTPS obrigatório em todas as rotas, sem exceção
- TLS 1.2 mínimo, preferência por 1.3
- HSTS (Strict-Transport-Security) com `max-age` longo após estabilização
- Certificados via Let's Encrypt com renovação automática (Certbot)
- Redirecionamento automático de HTTP para HTTPS no nginx

**Em repouso:**

- PostgreSQL com `encryption at rest` no nível do disco (LUKS na VM ou padrão do DO Managed Database)
- Campos extra sensíveis (se houver — ex.: dados de cartão, embora não devamos armazenar) com criptografia adicional via `pgcrypto` ou em camada de aplicação
- Backups criptografados antes de upload para Spaces (`gpg` ou `openssl enc`)

**Em uso:**

- Dados sensíveis não trafegam em logs (CPF, valores de transação)
- Mascaramento em telas administrativas (CPF aparece como `***.***.***-12`)
- Princípio de mínimo: APIs retornam apenas os campos necessários para a tela
- Variáveis em memória de dados sensíveis são zeradas quando não usadas mais (`secret.fill(0)` em buffers)

### 15.6 Mitigação contra OWASP Top 10

Mapeamento das ameaças do OWASP Top 10 para as mitigações no projeto:

| Ameaça | Mitigação aplicada |
|---|---|
| Broken Access Control | Verificação em três camadas (14.4); IDOR prevention obrigatório |
| Cryptographic Failures | TLS 1.2+; argon2 para senhas; campos sensíveis criptografados |
| Injection (SQL, etc.) | Prisma parametriza queries automaticamente; `$queryRaw` apenas com revisão obrigatória do tech lead |
| Insecure Design | Arquitetura modular com fronteiras explícitas; threat modeling antes de features sensíveis |
| Security Misconfiguration | Headers de segurança configurados (14.8); ambientes endurecidos; sem defaults perigosos |
| Vulnerable Components | Dependabot ativo; `npm audit` no CI; revisão antes de novas dependências |
| Auth Failures | Auth.js; MFA para admin; rate limiting; políticas modernas de senha |
| Software & Data Integrity | Lockfiles versionados; CI verifica integridade; assinaturas em releases |
| Logging & Monitoring Failures | Logs estruturados; Sentry; alertas de padrões suspeitos (14.10) |
| SSRF | Validação de URLs em qualquer integração externa; whitelist de hosts |

### 15.7 Gestão de secrets e variáveis de ambiente

**Onde vivem os segredos:**

| Local | O quê | Acesso |
|---|---|---|
| `.env.local` | Credenciais de desenvolvimento local (banco local, chaves de sandbox) | Apenas na máquina do dev |
| GitHub Actions Secrets | Credenciais para deploy (SSH, banco staging) | Apenas via CI/CD |
| Arquivo `.env` no servidor staging | Credenciais de `arphia-db-dev`, APIs externas (sandbox) | Servidor, leitura via PM2 |
| Arquivo `.env` no servidor produção | Credenciais de `arphia-db-prod`, APIs externas (prod) | Servidor, leitura via PM2, **acesso restrito ao tech lead** |

**Regras:**

- `.env*` no `.gitignore` (apenas `.env.example` versionado)
- Pre-commit hook (`husky` + `gitleaks`) escaneia commits em busca de padrões de secrets
- Rotação de credenciais a cada 6 meses ou em qualquer suspeita de comprometimento
- Quando o dev em formação precisar de credenciais novas (sandbox de API, etc.), o tech lead provê via canal seguro (não Slack/email — gerenciador de senhas compartilhado)

**Quando crescer:** considerar HashiCorp Vault, AWS Secrets Manager ou Doppler para gestão centralizada.

### 15.8 Headers de segurança

Configurados no nginx (afetam todas as respostas):

```nginx
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;" always;
```

**Verificação:** rodar [Mozilla Observatory](https://observatory.mozilla.org/) e [Security Headers](https://securityheaders.com/) periodicamente para validar score.

### 15.9 Validação de entrada e sanitização

**Validação em três camadas:**

1. **TypeScript em tempo de compilação** — tipos protegem boa parte dos casos
2. **Zod schemas em runtime** — toda entrada de API valida contra schema explícito
3. **Constraints de banco** — última linha de defesa (NOT NULL, CHECK, UNIQUE)

**Exemplo de uso de Zod:**

```typescript
import { z } from "zod";

const createSimulationSchema = z.object({
  amount: z.number().positive().max(100_000_000),
  installments: z.number().int().min(1).max(600),
  interestRate: z.number().min(0).max(1000),
  type: z.enum(["PRICE", "SAC", "SAA", "SAM"]),
});

// No handler de API
const result = createSimulationSchema.safeParse(request.body);
if (!result.success) {
  return Response.json({ error: "Invalid input" }, { status: 400 });
}
// result.data é tipado e validado
```

**Princípio:** nunca confiar em validação de cliente. UI valida para UX, servidor valida para segurança. Toda entrada — body, query params, headers customizados — passa por schema.

### 15.10 Auditoria e logs

**Tabela `shared.audit_log`:**

Registra eventos sensíveis para fins regulatórios e investigativos:

| Coluna | Conteúdo |
|---|---|
| `id` | UUID |
| `user_id` | Quem |
| `organization_id` | Em qual organização |
| `action` | O quê (ex: `simulation.created`, `user.login`, `permission.changed`) |
| `target_type` / `target_id` | Recurso afetado |
| `metadata` | JSON com contexto adicional (sem dados sensíveis) |
| `ip_address` | De onde |
| `user_agent` | Navegador |
| `created_at` | Quando |

**Eventos que devem ser auditados:**

- Login (sucesso e falha)
- Mudança de senha ou MFA
- Mudança de permissão
- Geração de arquivos regulatórios (AMCC, etc.)
- Exportação de dados em massa
- Acesso a relatórios financeiros
- Mudanças em configuração da organização

**Alertas automáticos (via Sentry/Slack):**

- 5+ logins falhos em sequência para mesmo usuário
- Login a partir de país/IP nunca usado antes
- Acesso fora de horário comercial (configurável por organização)
- Exportação de dados de volume incomum
- Erros 500 em endpoints sensíveis

### 15.11 Backups e continuidade

Já mencionados em 6.9, mas com foco em segurança:

- **Criptografia antes de upload:** backups passam por `gpg` com chave gerenciada separadamente antes de irem para Spaces
- **Teste mensal de restore:** uma vez por mês, restaurar backup em ambiente isolado e verificar integridade. Backup que nunca foi testado = não há backup.
- **RPO (Recovery Point Objective):** máximo 24h de perda aceitável (backups diários)
- **RTO (Recovery Time Objective):** máximo 4h para restaurar serviço em caso de incidente catastrófico
- **Documento de DR (Disaster Recovery):** procedimento passo a passo, mantido atualizado, para que qualquer membro do time consiga executar em emergência

### 15.12 Dependências e supply chain

**Configurações ativas:**

- `npm audit` rodando no CI (falha o build em vulnerabilidades high/critical)
- Dependabot configurado para PRs automáticos de updates de segurança
- `package-lock.json` sempre commitado (reprodutibilidade)
- Em produção, `npm ci --omit=dev` para garantir lockfile exato

**Política antes de adicionar nova dependência:**

Pergunta-chave: posso resolver isso sem essa biblioteca? Se sim, geralmente vale o esforço. Se não, antes de adicionar:

- Verificar última versão e data (manutenção ativa?)
- Estrelas no GitHub e número de mantenedores (bus factor)
- Vulnerabilidades conhecidas (`npm audit`, Snyk)
- Tamanho do bundle (impacto em performance)
- Licença compatível com uso comercial

**Lições do incidente xz/event-stream:** bibliotecas com poucos mantenedores são alvo de takeover; preferir bibliotecas com governança organizacional (Vercel, Microsoft, etc.) quando possível.

### 15.13 Cultura, treinamento e resposta a incidentes

**Treinamento contínuo:**

- Dev em formação faz, na Fase 0, um módulo introdutório de segurança web (OWASP Top 10 em vídeo gratuito, ~4h)
- Tech lead revisa periodicamente novidades em CVE relevantes para a stack
- Discussão em retrospectiva sempre que houver bug com componente de segurança

**Code review com lente de segurança:**

PRs que tocam autenticação, autorização, lógica financeira ou manipulação de dados sensíveis recebem label `security-impact` e exigem checklist específico:

- [ ] Autorização verificada em todas as queries
- [ ] Entrada validada com Zod
- [ ] Sem dados sensíveis em logs
- [ ] Erros não vazam informação interna
- [ ] Headers de segurança preservados

**Plano de resposta a incidentes:**

Documento separado (a criar) cobrindo:

1. **Detecção** — quem percebeu, como, quando
2. **Contenção** — ações imediatas (revogar credenciais, isolar VM, bloquear IP)
3. **Erradicação** — remover a causa raiz
4. **Recuperação** — restaurar operação normal
5. **Comunicação** — quem informar (ANPD em até 72h se dados pessoais; clientes afetados; autoridades regulatórias se aplicável)
6. **Lições aprendidas** — post-mortem sem culpa, ações para prevenir recorrência

**Pessoa de contato principal em incidentes:** tech lead. Em ausência, sócio de negócio acionado.

---

## 16. Code Review e qualidade

### 16.1 Checklist por Tier

**Tier 1 — checklist rigoroso:**
- [ ] Existem testes cobrindo o caso feliz
- [ ] Existem testes cobrindo casos extremos (zeros, negativos, valores máximos)
- [ ] Cálculo usa `decimal.js` (zero uso de float nativo)
- [ ] Resultado bate com cálculo manual em pelo menos 2 exemplos
- [ ] Validação de entrada cobre formatos inválidos
- [ ] Logs não vazam dados sensíveis
- [ ] Arquivo `CLAUDE.md` foi atualizado se regra nova foi introduzida

**Tier 2 — checklist padrão:**
- [ ] Existem testes para o fluxo principal
- [ ] Tratamento de erro está presente (não só caminho feliz)
- [ ] Estados de loading e erro são exibidos ao usuário
- [ ] Não há dados sensíveis em logs ou URLs
- [ ] Performance aceitável em datasets realistas

**Tier 3 — checklist leve:**
- [ ] CodeRabbit aprovou
- [ ] Build passou
- [ ] Visual confere com o esperado (screenshots no PR se UI)

### 16.2 Testes obrigatórios

Política mínima:
- **Tier 1:** 100% de cobertura de funções, com casos extremos
- **Tier 2:** cobertura do fluxo principal + tratamento de erro
- **Tier 3:** opcional, mas encorajado

A cobertura é verificada na CI e exibida no PR.

---

## 17. Monitoramento e observabilidade

### 17.1 Objetivo e escopo

O monitoramento constitui a última camada operacional do processo de desenvolvimento da Arphia. Sem visibilidade contínua sobre o estado da aplicação, erros passam despercebidos, degradações de performance acumulam-se silenciosamente e incidentes são descobertos apenas quando o cliente reporta — cenário inaceitável para uma plataforma que atende instituições financeiras reguladas.

Esta seção define os requisitos, as ferramentas, as responsabilidades e o processo de resposta a incidentes de monitoramento do DamaTools em ambiente de produção e, secundariamente, em staging.

### 17.2 Requisitos fundamentais

O sistema de monitoramento deve atender a cinco requisitos inegociáveis:

**Visibilidade total de erros.** Toda exceção não tratada, falha de requisição ou erro de servidor deve ser capturada, classificada e notificada automaticamente. Nenhum erro em produção deve passar despercebido por mais de 15 minutos.

**Disponibilidade contínua.** A aplicação deve ser monitorada externamente a cada 5 minutos. Qualquer indisponibilidade superior a 5 minutos deve gerar alerta imediato para a equipe.

**Rastreabilidade de performance.** Tempos de resposta de endpoints críticos (cálculos financeiros, geração de arquivos regulatórios) devem ser mensurados continuamente, com alertas em caso de degradação acima de limiares definidos.

**Logs estruturados e auditáveis.** Os logs da aplicação devem seguir formato estruturado (JSON), ser persistidos com rotação automática e estar disponíveis para consulta retrospectiva por pelo menos 30 dias.

**Independência de notificação.** Os alertas devem chegar à equipe por um canal externo à aplicação monitorada — se a aplicação está fora do ar, o alerta não pode depender dela para ser entregue.

### 17.3 Pilares do monitoramento

O monitoramento do DamaTools se organiza em cinco pilares, cada um com ferramenta, métrica e alerta próprios:

#### 16.3.1 Monitoramento de erros — Sentry

O Sentry constitui a ferramenta central de captura de erros. Deve ser integrado tanto no backend (Node.js/Next.js) quanto no frontend (React), cobrindo:

**Configuração obrigatória:**

- Integração via SDK oficial (`@sentry/nextjs`) inicializada no bootstrap da aplicação
- Source maps enviados a cada deploy para stack traces legíveis
- Configuração de `environment` (staging, production) e `release` (tag de versão) em cada inicialização
- Captura automática de exceções não tratadas e rejeições de Promises
- Breadcrumbs habilitados para rastrear sequência de eventos antes do erro

**Informações a capturar em cada evento:**

| Campo | Fonte | Obrigatório |
|---|---|---|
| Stack trace completo | Automático (SDK) | Sim |
| Usuário (ID, organização) | Contexto de sessão | Sim |
| Módulo afetado (calculator, amcc, etc.) | Tag customizada | Sim |
| Ambiente (staging/production) | Variável de ambiente | Sim |
| Release (tag de versão) | CI/CD | Sim |
| URL e método HTTP | Automático | Sim |
| Body da requisição | Não — dado sensível | Não |

**Regras de alerta no Sentry:**

| Condição | Ação |
|---|---|
| Erro novo (nunca visto antes) | Notificação imediata no Slack `#alertas-producao` |
| Erro existente reaparecendo após resolução | Notificação imediata |
| Volume de erros > 10 em 5 minutos | Alerta crítico (Slack + mensagem direta ao tech lead) |
| Erro em módulo Tier 1 (calculator, amcc) | Alerta crítico independente do volume |

**O que não capturar:** dados pessoais (CPF, CNPJ), valores monetários de operações, conteúdo de bodies de requisição e tokens de autenticação. O `beforeSend` do Sentry deve ser configurado para sanitizar esses campos antes do envio.

#### 16.3.2 Monitoramento de disponibilidade — UptimeRobot

O UptimeRobot (plano gratuito) realiza verificações externas de disponibilidade, independentes da infraestrutura da Arphia:

**Monitors configurados:**

| Monitor | URL | Intervalo | Tipo |
|---|---|---|---|
| Produção — principal | `https://damatools.com.br` | 5 min | HTTPS |
| Produção — API health | `https://damatools.com.br/api/health` | 5 min | Keyword (espera `"ok"`) |
| Staging | `https://staging.damatools.com.br` | 15 min | HTTPS |

**Endpoint `/api/health`:**

Implementar um endpoint dedicado que verifica a saúde real da aplicação, não apenas se o processo está respondendo:

```typescript
// src/app/api/health/route.ts
export async function GET() {
  const checks = {
    database: false,
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || 'unknown',
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (e) {
    // Banco inacessível
  }

  const healthy = checks.database;
  return Response.json(
    { status: healthy ? 'ok' : 'degraded', checks },
    { status: healthy ? 200 : 503 }
  );
}
```

O UptimeRobot deve verificar a presença da keyword `"ok"` na resposta. Se o banco estiver inacessível, o endpoint retorna `503` e o UptimeRobot detecta a falha mesmo com o processo Node.js ainda ativo.

**Alertas de disponibilidade:**

- Queda detectada → notificação no Slack `#alertas-producao` + e-mail para o tech lead
- Recuperação → notificação de recovery no mesmo canal
- Status page pública (opcional, via UptimeRobot) disponível para clientes consultarem

#### 16.3.3 Monitoramento de performance

Na fase inicial (equipe de 3 pessoas, volume baixo), a abordagem de performance deve ser pragmática — evitar a complexidade de ferramentas de APM completas (Datadog, New Relic) e adotar mecanismos leves que forneçam os sinais essenciais.

**Middleware de métricas de tempo de resposta:**

```typescript
// src/shared/middleware/metrics.ts
export function metricsMiddleware(req, res, next) {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const duration = Number(process.hrtime.bigint() - start) / 1e6; // ms
    const route = req.route?.path || req.url;
    const method = req.method;
    const status = res.statusCode;

    // Log estruturado com tempo de resposta
    logger.info({
      type: 'http_request',
      method,
      route,
      status,
      duration_ms: Math.round(duration),
      module: extractModule(route), // 'calculator', 'amcc', etc.
    });

    // Alerta se tempo de resposta exceder limiares
    if (duration > 5000) {
      logger.warn({
        type: 'slow_request',
        method,
        route,
        duration_ms: Math.round(duration),
      });
    }
  });

  next();
}
```

**Limiares de tempo de resposta:**

| Tipo de operação | Aceitável | Alerta (warning) | Crítico |
|---|---|---|---|
| Páginas e consultas simples | < 500ms | 500ms – 2s | > 2s |
| Cálculos financeiros (PRICE, SAC, CET) | < 2s | 2s – 5s | > 5s |
| Geração de arquivos (AMCC XML) | < 10s | 10s – 30s | > 30s |
| Health check | < 200ms | 200ms – 1s | > 1s |

**Evolução futura:** quando o volume de requisições justificar, considerar a adoção de Grafana Cloud (tier gratuito) ou Prometheus para dashboards de performance histórica. Essa migração não exige mudanças na aplicação se os logs já estiverem estruturados conforme descrito.

#### 16.3.4 Logs estruturados

Os logs constituem o registro histórico de tudo que acontece na aplicação. Devem seguir formato estruturado (JSON) para possibilitar consulta, filtragem e análise automatizada.

**Biblioteca recomendada:** `pino` — logger de alta performance para Node.js, com output JSON nativo.

**Configuração base:**

```typescript
// src/shared/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  serializers: {
    // Sanitizar dados sensíveis automaticamente
    req: (req) => ({
      method: req.method,
      url: req.url,
      // NÃO incluir headers (podem conter tokens) ou body (dados sensíveis)
    }),
  },
  redact: {
    paths: ['cpf', 'cnpj', 'password', 'token', 'authorization', '*.cpf', '*.cnpj'],
    censor: '[REDACTED]',
  },
});
```

**Níveis de log e quando utilizar cada um:**

| Nível | Uso | Exemplo |
|---|---|---|
| `fatal` | Aplicação não consegue continuar | Falha na conexão com banco ao iniciar |
| `error` | Erro que afeta uma requisição ou operação | Exceção em cálculo, falha de API externa |
| `warn` | Situação anormal que não bloqueia | Requisição lenta, retry bem-sucedido |
| `info` | Eventos operacionais normais | Requisição HTTP, deploy concluído, login |
| `debug` | Detalhes para diagnóstico | Valores intermediários de cálculo, queries SQL |

**Regra:** `debug` nunca ativo em produção (volume excessivo, risco de vazamento de dados). Em staging, ativar via variável de ambiente quando necessário para investigação.

**Persistência e rotação:**

| Aspecto | Configuração |
|---|---|
| Destino dos logs | Arquivo em `/var/log/arphia/damatools-prod.log` |
| Rotação | `logrotate` diário, compressão gzip |
| Retenção | 30 dias em disco, 90 dias em backup (Spaces) |
| Tamanho máximo por arquivo | 100MB antes de rotacionar |

**Formato de cada entrada:**

```json
{
  "level": "info",
  "time": "2027-03-15T14:32:01.234Z",
  "type": "http_request",
  "method": "POST",
  "route": "/api/calculator/simulate",
  "status": 200,
  "duration_ms": 142,
  "module": "calculator",
  "userId": "usr_abc123",
  "organizationId": "org_xyz789",
  "requestId": "req_8f3a2b"
}
```

O campo `requestId` (gerado no início de cada requisição via middleware) permite rastrear toda a cadeia de eventos de uma única operação nos logs.

#### 16.3.5 Métricas de infraestrutura

O servidor (Droplet DigitalOcean) deve ser monitorado quanto ao consumo de recursos do sistema operacional:

**Métricas coletadas pelo DigitalOcean Monitoring (nativo, gratuito):**

| Métrica | Limiar de alerta |
|---|---|
| CPU | > 80% por 10 minutos consecutivos |
| Memória RAM | > 85% utilizada |
| Disco | > 80% ocupado |
| Banda de rede | Pico anormal (> 3x a média) |

**Configuração:**

Ativar o DigitalOcean Monitoring Agent na VM (instalação via `apt install do-agent`). Os alertas são configurados no painel do DigitalOcean e enviam e-mail automaticamente. Para integrar com Slack, utilizar o webhook do DigitalOcean ou criar um monitor adicional no UptimeRobot.

**Monitoramento do PM2:**

O PM2 (gerenciador de processos) oferece métricas nativas do processo Node.js:

```bash
# Status em tempo real
pm2 monit

# Métricas acumuladas
pm2 info prod

# Itens a observar:
# - Restarts (se > 0, algo está causando crash)
# - Heap usage (tendência de crescimento = memory leak)
# - Event loop latency (> 100ms indica sobrecarga)
```

Configurar o PM2 para reiniciar automaticamente se o consumo de memória exceder o limite:

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'prod',
    script: 'node_modules/.bin/next',
    args: 'start',
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
  }],
};
```

### 17.4 Canais de notificação

As notificações de monitoramento seguem uma hierarquia de severidade que determina o canal e a urgência:

| Severidade | Exemplo | Canal | Tempo de resposta esperado |
|---|---|---|---|
| Crítica | Aplicação fora do ar; erro em cálculo Tier 1 | Slack `#alertas-producao` + DM ao tech lead + e-mail | Imediato (< 15 min) |
| Alta | Volume anormal de erros; performance degradada | Slack `#alertas-producao` | Até 1 hora |
| Média | Erro novo em módulo Tier 2/3; warning de infra | Slack `#alertas-producao` | Até 4 horas (horário comercial) |
| Baixa | Dependência com update de segurança; aviso de disco | Slack `#builds-e-deploys` | Próximo dia útil |

**Regra de silenciamento:** alertas de staging são encaminhados apenas para o canal `#builds-e-deploys`, nunca para `#alertas-producao`, exceto em preparação para release. Alertas de produção nunca são silenciados.

### 17.5 Processo de resposta a incidentes de monitoramento

Quando um alerta de severidade crítica ou alta é disparado, o seguinte processo deve ser seguido:

**Etapa 1 — Reconhecimento (< 15 minutos)**

O tech lead (ou, na sua ausência, o sócio de negócio) deve confirmar o recebimento do alerta no canal Slack com uma reação ou mensagem breve indicando que está investigando. O objetivo é sinalizar ao restante da equipe que o incidente foi percebido.

**Etapa 2 — Diagnóstico (< 30 minutos)**

Sequência recomendada de investigação:

1. Verificar o endpoint `/api/health` manualmente
2. Consultar o dashboard do Sentry para o erro específico
3. Verificar os logs da aplicação via SSH (`tail -f /var/log/arphia/damatools-prod.log | jq`)
4. Verificar métricas de infra no painel do DigitalOcean (CPU, memória, disco)
5. Verificar se houve deploy recente (`pm2 logs --lines 50`)

**Etapa 3 — Mitigação**

Dependendo do diagnóstico, aplicar a ação mais rápida para restaurar o serviço:

| Diagnóstico | Ação de mitigação |
|---|---|
| Erro introduzido por deploy recente | Rollback para versão anterior (`git reset --hard <tag>` + `pm2 restart`) |
| Processo Node.js travado | `pm2 restart prod` |
| Banco de dados inacessível | Verificar status do PostgreSQL (`systemctl status postgresql`) e reiniciar se necessário |
| Disco cheio | Rotacionar logs manualmente (`logrotate -f`) e limpar arquivos temporários |
| Ataque ou tráfego anormal | Ativar rate limiting adicional no nginx; bloquear IPs suspeitos |

**Etapa 4 — Comunicação**

Após mitigação, registrar no canal Slack:

- O que aconteceu (causa raiz identificada ou hipótese)
- O que foi feito para resolver
- Se há risco de recorrência
- Se clientes foram afetados

Se clientes foram impactados, o sócio de negócio é responsável pela comunicação externa.

**Etapa 5 — Post-mortem (até 48h após o incidente)**

Para incidentes de severidade crítica, redigir um post-mortem breve documentando:

- Timeline do incidente (quando começou, quando foi detectado, quando foi resolvido)
- Causa raiz
- Impacto (número de usuários afetados, duração)
- Ações preventivas para evitar recorrência

O post-mortem deve ser armazenado em `docs/post-mortems/` no repositório e referenciado na retrospectiva semanal mais próxima.

### 17.6 Dashboard operacional

Embora ferramentas avançadas de dashboard (Grafana, Datadog) estejam fora de escopo na fase inicial, é necessário manter uma visão consolidada do estado da plataforma. A seguinte composição cumpre esse papel com custo zero:

| Componente | Ferramenta | Acesso |
|---|---|---|
| Status de uptime e histórico | UptimeRobot status page | URL pública (compartilhável com clientes) |
| Erros recentes e tendência | Dashboard do Sentry | Login do Sentry |
| Métricas de infraestrutura | Painel do DigitalOcean | Login do DigitalOcean |
| Processos e restarts | PM2 via SSH | Terminal no servidor |

A consolidação em um dashboard único (Grafana ou similar) deve ser considerada quando o volume de requisições tornar a consulta manual insuficiente, ou quando clientes exigirem SLA com relatórios de disponibilidade formalizados.

### 17.7 Monitoramento por módulo

A natureza modular do DamaTools exige atenção diferenciada por módulo, proporcional ao risco de cada um:

| Módulo | Nível de monitoramento | Justificativa |
|---|---|---|
| Calculadora Financeira | Máximo | Cálculos incorretos geram prejuízo financeiro direto |
| AMCC | Máximo | Arquivos regulatórios com erro podem causar sanções do BCB |
| RAS | Alto | Indicadores prudenciais alimentam decisões de gestão |
| Calendário | Médio | Eventos perdidos geram atraso, não erro financeiro |
| FGC | Máximo | Contribuições e limites impactam diretamente a operação |
| Rentabilidade / Classificação | Alto | Projeções incorretas comprometem decisões de negócio |
| Fluxo de Caixa / Orçamento | Máximo | Testes de estresse alimentam gestão de capital |

Na prática, o nível de monitoramento se traduz em granularidade de alertas no Sentry: módulos com nível "Máximo" disparam alerta em qualquer erro, enquanto módulos de nível "Médio" seguem as regras padrão de volume.

Para implementar essa diferenciação, adicionar a tag `module` em todo erro reportado ao Sentry e configurar regras de alerta separadas por tag.

### 17.8 Etapas de implantação do monitoramento

A implantação do monitoramento segue o ritmo do roadmap geral (Seção 17) e não deve ser tratada como atividade à parte — cada ambiente e ferramenta é configurado junto com a infraestrutura correspondente.

**Mês 1 — Fundação (junto com setup de infra)**

- [ ] Criar conta no Sentry e integrar SDK ao projeto
- [ ] Criar conta no UptimeRobot e configurar monitors de produção e staging
- [ ] Implementar endpoint `/api/health` com verificação de banco
- [ ] Configurar `pino` como logger com sanitização de dados sensíveis
- [ ] Instalar DigitalOcean Monitoring Agent na VM
- [ ] Configurar canal `#alertas-producao` no Slack com integrações

**Mês 2 — Estabilização**

- [ ] Configurar regras de alerta no Sentry por módulo (tag `module`)
- [ ] Implementar middleware de métricas de tempo de resposta
- [ ] Configurar `logrotate` e backup de logs para Spaces
- [ ] Configurar PM2 com `max_memory_restart`
- [ ] Validar que alertas de todos os pilares estão chegando no Slack

**Mês 3+ — Maturação**

- [ ] Definir e documentar limiares de performance por tipo de operação
- [ ] Criar status page pública (UptimeRobot) para comunicação com clientes
- [ ] Realizar primeiro teste de incidente simulado (derrubar staging propositalmente e medir tempo de resposta da equipe)
- [ ] Avaliar necessidade de Grafana Cloud para dashboards de tendência

### 17.9 Custos

| Ferramenta | Plano | Custo |
|---|---|---|
| Sentry | Developer (gratuito) | $0 |
| UptimeRobot | Free (50 monitors, 5 min) | $0 |
| DigitalOcean Monitoring | Nativo (incluso na VM) | $0 |
| PM2 | Open source | $0 |
| Pino | Open source | $0 |
| **Total monitoramento** | | **$0/mês** |

O custo zero na fase inicial é viável porque as ferramentas escolhidas oferecem tiers gratuitos suficientes para o volume atual. Conforme o número de clientes e o volume de requisições crescerem, os upgrades mais prováveis são Sentry Team (~$26/mês) e UptimeRobot Pro (~$7/mês) — investimento marginal comparado ao custo de um incidente não detectado em produção.

---

## 18. Roadmap de implantação

Implantar todo o processo de uma vez é receita para nada funcionar. O roadmap abaixo escalona a complexidade de forma realista, ajustada ao período de formação do dev.

### 18.1 Mês 1 — Fundação

**Foco:** infraestrutura pronta, dev iniciando estudos.

| Semana | Tech lead | Dev | Sócio |
|---|---|---|---|
| 1 | Cria GitHub Org, configura repo, branch protection | Inicia estudos (lógica de programação) | Define backlog inicial do produto |
| 2 | Configura ambientes (local, staging), DNS, SSL | Continua estudos + Git básico | Valida requisitos com possíveis clientes |
| 3 | Implementa primeiro módulo Tier 1 (ex: PRICE) | Pratica HTML/CSS, lê código existente | Refina roadmap |
| 4 | Configura CI/CD, Slack, integrações | Faz primeiro PR (tarefa Tier 3 simples) | Acompanha demos |

**Marcos do mês:**
- Repositório com branch protection ativa
- Ambientes staging e produção no ar
- CLAUDE.md inicial escrito
- Dev fez pelo menos 1 PR (mesmo que simples)

### 18.2 Mês 2-3 — Estabilização

**Foco:** processos rodando, dev começando a contribuir.

- Cerimônias Scrumban acontecendo semanalmente
- Tech lead em ritmo de Tier 1
- Dev em ritmo de Tier 3 com 1h/dia de pair programming
- CodeRabbit configurado e ativo
- Primeiras features de produto em produção

**Marcos:**
- Mínimo de 3 PRs por semana do dev (todos Tier 3)
- Zero bugs de Tier 1 em produção
- Retrospectiva semanal acontecendo regularmente

### 18.3 Mês 4-6 — Maturação

**Foco:** dev migra para Tier 2, processo ganha consistência.

- Dev começa Tier 2 com supervisão
- Pair programming cai para 1x por semana
- Métricas de processo começam a ser observadas
- Primeiros clientes-piloto utilizando o produto

**Marcos:**
- Dev completou primeira tarefa Tier 2 em produção
- Cobertura de testes em Tier 1 > 90%
- SLA básico definido para o produto (ex: 99% uptime)

### 18.4 A partir do mês 7 — Operação

Processo estabilizado, equipe em ritmo. A partir daqui, avaliações trimestrais:

- A equipe atual ainda atende a demanda? Precisa contratar?
- Stack continua adequada?
- Métricas de qualidade estão saudáveis?
- Há clientes pagantes em volume suficiente?

---

## 19. Indicadores de saúde do processo

Cinco métricas a observar continuamente, mas sem virar obsessão:

| Métrica | Como medir | Sinal saudável |
|---|---|---|
| Lead time de PR | Tempo entre abertura e merge | < 24h para Tier 3, < 48h para Tier 2 |
| Bugs em produção | Issues de bug abertas/mês | Tendência decrescente |
| Idas e voltas em review | Comentários por PR | < 5 para dev consolidado |
| Cobertura de testes Tier 1 | Reportada pela CI | > 90% |
| Throughput | Issues fechadas/semana | Estável ou crescente |

**Anti-métricas — o que NÃO medir:**
- Linhas de código escritas (mede volume, não valor)
- Velocity em story points para um dev em formação (vai variar muito)
- Tempo gasto em estudo do dev (estudar é trabalho)

---

## 20. Gestão de dependências

### 20.1 Categorias de dependência

Toda dependência do projeto é classificada em uma das três categorias abaixo. Essa classificação determina o rigor na avaliação inicial, a estratégia de versionamento e a prioridade de atualização em caso de vulnerabilidade:

| Categoria | Exemplos no DamaTools | Critério de classificação |
|---|---|---|
| **Crítica de domínio** | `decimal.js`, `prisma`, `@prisma/client`, `zod` | Falha ou comportamento incorreto impacta diretamente a correção dos cálculos financeiros ou a integridade dos dados |
| **Infraestrutura** | `next`, `react`, `tailwindcss`, `pino`, `argon2` | Sustentam a aplicação mas não determinam o resultado de operações financeiras |
| **Desenvolvimento** | `typescript`, `eslint`, `jest`, `@testing-library/*` | Presentes apenas no ambiente de desenvolvimento; não chegam ao bundle de produção |

### 20.2 Avaliação antes de adicionar uma dependência

A adição de qualquer pacote ao projeto exige avaliação prévia. A primeira pergunta é sempre: **a funcionalidade pode ser implementada internamente sem a dependência?** Para lógicas simples (formatação de data, truncamento de string, cálculo pontual), implementar internamente é preferível a introduzir um pacote externo.

Quando a dependência for necessária, aplicar o seguinte checklist antes de instalar:

```
□ Última publicação no npm: há menos de 12 meses?
□ Issues abertas sem resposta do mantenedor: ausentes ou poucas?
□ npm audit não reporta vulnerabilidades conhecidas?
□ Licença compatível com uso comercial: MIT, Apache-2.0 ou ISC?
□ Governança: mantida por organização (não por um único contribuidor)?
□ Para deps de frontend: bundle size aceitável (< 20 kB gzip para utils)?
□ Para deps críticas de domínio: aprovação explícita do tech lead?
```

Qualquer item reprovado deve ser discutido com o tech lead antes de prosseguir. Dependências que envolvam parsing de dados financeiros, geração de arquivos regulatórios ou criptografia exigem aprovação do tech lead independentemente do resultado do checklist.

### 20.3 Semver e estratégia de versionamento

O `package.json` registra a dependência com um range de versão. A estratégia por categoria:

```jsonc
{
  "dependencies": {
    // Críticas de domínio — pinnar versão exata
    // Motivo: uma atualização não planejada não deve alterar
    // comportamento de cálculo ou schema de banco silenciosamente
    "decimal.js": "10.4.3",
    "prisma": "5.10.2",
    "@prisma/client": "5.10.2",  // sempre igual à versão do prisma

    // Infraestrutura — range minor compatível
    // Motivo: patches e melhorias são bem-vindos; breaking changes
    // de major serão bloqueados pelo range
    "next": "^14.2.0",
    "react": "^18.3.0",
    "pino": "^9.1.0",

    // zod — exceção: pin exato apesar de ser "infraestrutura"
    // Motivo: mudanças em tipos de validação podem quebrar
    // schemas de spec silenciosamente
    "zod": "3.22.4"
  },
  "devDependencies": {
    // Dev — range minor é suficiente
    "typescript": "^5.4.0",
    "jest": "^29.7.0",
    "@types/node": "^20.12.0"
  }
}
```

`^MAJOR.MINOR.PATCH` aceita atualizações de minor e patch, nunca de major.
`~MAJOR.MINOR.PATCH` aceita apenas atualizações de patch.
`MAJOR.MINOR.PATCH` (sem prefixo) pin exato — nenhuma atualização automática.

### 20.4 Lock file — package-lock.json

O `package-lock.json` registra a versão exata de cada pacote instalado, incluindo as dependências transitivas (dependências das dependências). É o arquivo que garante que `npm ci` instale exatamente os mesmos pacotes em todas as máquinas e no CI.

**Regras:**

- O `package-lock.json` é sempre commitado no repositório. Nunca adicionado ao `.gitignore`.
- `npm ci` (usado no CI) instala a partir do lock file sem modificá-lo. `npm install` (usado localmente) pode atualizá-lo.
- Em conflitos de lock file durante merge, a resolução correta é:

```bash
# 1. Aceitar a versão do branch de destino como base
git checkout develop -- package-lock.json

# 2. Reinstalar respeitando o package.json resultante do merge
npm install

# 3. Commitar o lock file atualizado
git add package-lock.json
git commit -m "chore: resolve package-lock conflict"
```

### 20.5 Workflow do Dependabot

O Dependabot verifica automaticamente dependências desatualizadas e abre PRs com as atualizações. A estratégia de triagem por tipo de atualização:

| Tipo | Exemplo | Ação |
|---|---|---|
| **Patch** (`x.y.3` → `x.y.4`) | Correção de bug | Mergear após CI verde, sem revisão manual |
| **Minor** (`x.2.z` → `x.3.z`) | Feature retrocompatível | Mergear após CI verde; inspecionar changelog para deps críticas |
| **Major** (`1.x.z` → `2.x.z`) | Possíveis breaking changes | Revisão manual obrigatória; testar localmente; atualizar um major por vez |
| **Security** (qualquer nível) | Vulnerabilidade conhecida | Tratar como hotfix — prioridade sobre features em andamento |

Para evitar sobrecarga de PRs, configurar o Dependabot para agrupar atualizações relacionadas:

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: npm
    directory: "/"
    schedule:
      interval: weekly
      day: monday
    groups:
      dev-dependencies:
        dependency-type: development
      prisma:
        patterns:
          - "prisma"
          - "@prisma/*"
    ignore:
      # Atualizações major de deps críticas só via revisão manual
      - dependency-name: "decimal.js"
        update-types: ["version-update:semver-major"]
      - dependency-name: "prisma"
        update-types: ["version-update:semver-major"]
```

### 20.6 npm audit — pipeline de segurança

O `npm audit` compara as dependências instaladas contra o banco de vulnerabilidades do npm e reporta por nível de severidade: `info`, `low`, `moderate`, `high` e `critical`.

**No CI (step obrigatório antes do build):**

```yaml
# .github/workflows/ci.yml
- name: Verificar vulnerabilidades
  run: npm audit --audit-level=high
  # Falha o build se houver vulnerabilidades high ou critical
  # Moderate e abaixo não bloqueiam — são tratadas no ciclo semanal
```

**Localmente (rodar antes de abrir PR):**

```bash
npm audit                          # relatório completo
npm audit --audit-level=moderate   # filtrar moderate+
npm audit fix                      # aplica correções automáticas seguras
                                   # (não introduz breaking changes)
```

`npm audit fix --force` aplica correções que podem introduzir breaking changes — usar somente com conhecimento do impacto e nunca em deps críticas de domínio sem revisão do tech lead.

**Quando o audit fix automático não resolve:**

Ocorre quando a vulnerabilidade está em uma dependência transitiva (dep da dep) sem versão corrigida disponível. A solução temporária é o campo `overrides` no `package.json`:

```json
{
  "overrides": {
    "nome-da-dep-transitiva-vulneravel": ">=2.1.0"
  }
}
```

Todo `override` deve ser documentado em um comentário no PR com: qual vulnerabilidade resolve, por que o fix automático não funcionou e quando pode ser removido.

### 20.7 Processo de resposta a vulnerabilidades

| Severidade | Exemplo de risco | Prazo | Tratamento |
|---|---|---|---|
| **Critical** | Execução remota de código, exfiltração | < 4 horas | Hotfix — segue o fluxo `hotfix/*` da Seção 9 |
| **High** | Bypass de autenticação, SQL injection | < 24 horas | Hotfix ou PR urgente no develop |
| **Moderate** | DoS localizado, information leak limitado | Próximo ciclo semanal | PR normal com label `security` |
| **Low / Info** | Comportamento indesejado não exploitável | Próxima janela de manutenção | Agrupa com atualizações regulares |

O canal `#alertas-producao` no Slack recebe notificações automáticas de vulnerabilidades high e critical via integração do GitHub com o canal (configurada no Dependabot ou via GitHub Security Advisories).

### 20.8 Prisma — gestão específica

O Prisma tem um ciclo de gestão próprio por ser responsável pelas migrations do banco de dados:

**Regra de versão:** `prisma` e `@prisma/client` devem sempre ter a mesma versão exata. Um mismatch causa erros em runtime.

**Após qualquer mudança no `schema.prisma`:**

```bash
npx prisma generate        # regenera o client TypeScript
npx prisma migrate dev     # cria e aplica migration no banco de dev
```

**No CI (executado antes do build):**

```yaml
- name: Gerar Prisma Client
  run: npx prisma generate

- name: Verificar migrations pendentes
  run: npx prisma migrate status
  # Falha se houver migration não aplicada no banco de CI
```

**Atualizar o Prisma (major):**

Atualizações major do Prisma podem requerer alterações no `schema.prisma` e nos arquivos de migration. Executar a atualização em branch isolada, com revisão das release notes antes de qualquer migração em staging.

### 20.9 Dependências internas entre módulos

No monolito modular do DamaTools, as dependências internas (imports entre arquivos do próprio projeto) seguem regras tão estritas quanto as dependências externas — com a diferença de que são verificadas via ESLint.

**A regra de importação (Seção 6.3):**

```
Permitido:
  módulo → /shared              ✓  (qualquer módulo pode importar de shared)
  /shared → /shared             ✓  (com atenção a circularidades)

Proibido:
  módulo A → módulo B           ✗  (viola isolamento do módulo)
  /shared → qualquer módulo     ✗  (inverte a hierarquia)
  import fora da index.ts       ✗  (viola a interface pública do módulo)
```

**Configuração ESLint com `eslint-plugin-boundaries`:**

```javascript
// .eslintrc.js
module.exports = {
  plugins: ['boundaries'],
  settings: {
    'boundaries/elements': [
      { type: 'shared',     pattern: 'src/shared/**' },
      { type: 'calculator', pattern: 'src/modules/calculator/**' },
      { type: 'amcc',       pattern: 'src/modules/amcc/**' },
      { type: 'ras',        pattern: 'src/modules/ras/**' },
      { type: 'calendar',   pattern: 'src/modules/calendar/**' },
    ],
  },
  rules: {
    'boundaries/element-types': ['error', {
      default: 'disallow',
      rules: [
        { from: 'shared',     allow: ['shared']     },
        { from: 'calculator', allow: ['shared']     },
        { from: 'amcc',       allow: ['shared']     },
        { from: 'ras',        allow: ['shared']     },
        { from: 'calendar',   allow: ['shared']     },
      ],
    }],
  },
};
```

Qualquer import cruzando uma fronteira proibida gera erro de lint e bloqueia o PR no CI.

**Detecção de dependências circulares em `/shared`:**

```bash
npx madge --circular src/shared/
```

Adicionar como step no CI:

```yaml
- name: Verificar dependências circulares
  run: npx madge --circular --extensions ts src/shared/
  # Falha se encontrar circularidade
```

Quando o desenvolvimento de um novo módulo exigir adicionar um elemento ao `boundaries`, o tech lead deve atualizar o `.eslintrc.js` como parte do PR que cria o módulo.

### 20.10 Referência rápida

| Situação | Ação |
|---|---|
| Quer instalar dependência nova | Executar checklist da Seção 20.2 antes |
| Dep crítica de domínio | Approval do tech lead obrigatória |
| Dependabot abre PR de patch/minor | Mergear após CI verde |
| Dependabot abre PR de major | Revisar changelog, testar localmente, um major por vez |
| `npm audit` reporta critical/high | Tratar como hotfix — fluxo `hotfix/*` |
| Conflito no package-lock.json | `git checkout develop -- package-lock.json && npm install` |
| Mudança no schema.prisma | `npx prisma generate && npx prisma migrate dev` |
| Import de módulo A para módulo B | Não é permitido — mover para `/shared` ou usar evento de domínio |
| Circularidade em /shared detectada | Refatorar imediatamente — não mergear com circularidade |

---

## 21. Apêndices

### Apêndice A — Template de Pull Request

Arquivo `.github/PULL_REQUEST_TEMPLATE.md`:

```markdown
## O que foi feito

<!-- Descrição clara do que mudou e por quê -->

## Tier desta tarefa

- [ ] Tier 1 — crítico de domínio
- [ ] Tier 2 — lógica de negócio padrão
- [ ] Tier 3 — baixo risco

## Como testar

<!-- Passo a passo para revisar/testar a mudança -->

## Checklist

- [ ] Código foi auto-revisado
- [ ] Testes foram adicionados (obrigatório para Tier 1 e 2)
- [ ] Sem dados sensíveis em logs
- [ ] Documentação atualizada (se aplicável)
- [ ] Se é hotfix: já foi mergeado no develop também

## Screenshots (se UI)

<!-- Anexar prints de antes e depois -->
```

### Apêndice B — CLAUDE.md exemplo

Arquivo `CLAUDE.md` na raiz do projeto:

````markdown
# Contexto do projeto — DamaTools (Arphia)

## Sobre o produto
DamaTools é a plataforma modular da Arphia para instituições financeiras
reguladas pelo Banco Central do Brasil. Cada módulo (AMCC, Calculadora,
RAS, Calendário, FGC, etc.) tem suas próprias regras de domínio.

Erros em cálculos ou interpretação regulatória geram prejuízo real ao cliente.

## Stack
- TypeScript + Next.js (App Router)
- PostgreSQL
- Tailwind CSS
- Jest + Testing Library

## ⚠️ Regras de domínio — OBRIGATÓRIO

### Transversais a todos os módulos

#### Cálculos monetários
- SEMPRE `decimal.js`, NUNCA `Number` ou `Math.round()` para valores monetários
- Arredondamento: ABNT NBR 5891, 2 casas decimais para R$

#### Validações
- CPF: validar com algoritmo oficial (não regex apenas)
- CNPJ: idem
- Datas: sempre em UTC no banco, fuso local apenas na apresentação

### Específicas por módulo

#### Calculadora Financeira
- Funções de amortização: usar APENAS as de `/src/modules/calculator/amortization.ts`
- CET: lógica em `/src/modules/calculator/cet.ts`
- Tabelas de IOF/IR: buscar de `/src/modules/calculator/tax-tables.ts`

#### AMCC
- Estrutura de XML: seguir EXATAMENTE o schema definido pelo BCB
- Validações de campos: módulo `/src/modules/amcc/validators.ts`

(Adicionar regras específicas conforme cada novo módulo do roadmap for desenvolvido)

### Em caso de dúvida sobre regra de negócio
PARE e pergunte. Não infira regras financeiras ou regulatórias. Sinalize:
"Isso envolve regra de domínio que precisa ser confirmada pelo tech lead."

## Convenções de código
- Conventional Commits (feat, fix, refactor, test, chore, docs)
- Nomes em inglês (variáveis, funções, branches)
- Componentes em PascalCase, hooks com prefixo `use`
- Sem `any` em TypeScript sem comentário justificando

## Estrutura
- `/src/modules/[modulo]` — código específico de cada módulo (calculator, amcc, ras, ...)
- `/src/modules/[modulo]/domain` — regras de negócio e cálculos do módulo
- `/src/modules/[modulo]/ui` — componentes específicos do módulo
- `/src/shared` — código compartilhado entre módulos (auth, validações, utils)
- `/src/app` — rotas Next.js
- `/tests` — testes (espelhando estrutura de modules)

## Proibições
- Nunca logar CPF, CNPJ, valores de operações
- Nunca expor stack trace em respostas de API em produção
- Nunca commitar `.env*`
````

### Apêndice C — Onboarding checklist do dev

**Semana 1:**
- [ ] Acesso ao GitHub Org concedido
- [ ] Acesso ao Slack/Discord
- [ ] Acesso ao Claude Pro e Cursor
- [ ] Repositório clonado localmente
- [ ] Ambiente local rodando
- [ ] Primeiro commit feito (mesmo que trivial, ex: ajuste em README)
- [ ] Leitura do `CLAUDE.md` completa
- [ ] Trilha de estudo iniciada

### Apêndice D — Trilha de estudos sugerida

**Fase 0 (semanas 1-8):**
1. Curso em Vídeo (Gustavo Guanabara) — Lógica de Programação
2. Rocketseat Explorer — fundamentos web
3. Khan Academy — JavaScript básico (opcional, para reforço)
4. freeCodeCamp — Responsive Web Design

**Fase 1 (semanas 9-16):**
5. Documentação oficial do React
6. Curso de Next.js (Rocketseat ou similar)
7. Curso de Git (Curso em Vídeo)

**Contínuo:**
- Leitura de PRs do tech lead (ver código real do projeto)
- Sessões de pair programming
- Documentação MDN para qualquer dúvida web

---

## Encerramento

Este documento é vivo. Revisar trimestralmente para verificar o que continua válido e o que precisa ser ajustado conforme o produto, a equipe e o mercado evoluem.

Decisões importantes que mudarem o que está aqui devem ser registradas com data e justificativa, mantendo o histórico de evolução do processo.

**Próxima revisão prevista:** três meses após adoção.
