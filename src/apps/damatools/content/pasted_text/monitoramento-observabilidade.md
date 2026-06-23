## 16. Monitoramento e observabilidade

### 16.1 Objetivo e escopo

O monitoramento constitui a última camada operacional do processo de desenvolvimento da Arphia. Sem visibilidade contínua sobre o estado da aplicação, erros passam despercebidos, degradações de performance acumulam-se silenciosamente e incidentes são descobertos apenas quando o cliente reporta — cenário inaceitável para uma plataforma que atende instituições financeiras reguladas.

Esta seção define os requisitos, as ferramentas, as responsabilidades e o processo de resposta a incidentes de monitoramento do DamaTools em ambiente de produção e, secundariamente, em staging.

### 16.2 Requisitos fundamentais

O sistema de monitoramento deve atender a cinco requisitos inegociáveis:

**Visibilidade total de erros.** Toda exceção não tratada, falha de requisição ou erro de servidor deve ser capturada, classificada e notificada automaticamente. Nenhum erro em produção deve passar despercebido por mais de 15 minutos.

**Disponibilidade contínua.** A aplicação deve ser monitorada externamente a cada 5 minutos. Qualquer indisponibilidade superior a 5 minutos deve gerar alerta imediato para a equipe.

**Rastreabilidade de performance.** Tempos de resposta de endpoints críticos (cálculos financeiros, geração de arquivos regulatórios) devem ser mensurados continuamente, com alertas em caso de degradação acima de limiares definidos.

**Logs estruturados e auditáveis.** Os logs da aplicação devem seguir formato estruturado (JSON), ser persistidos com rotação automática e estar disponíveis para consulta retrospectiva por pelo menos 30 dias.

**Independência de notificação.** Os alertas devem chegar à equipe por um canal externo à aplicação monitorada — se a aplicação está fora do ar, o alerta não pode depender dela para ser entregue.

### 16.3 Pilares do monitoramento

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

### 16.4 Canais de notificação

As notificações de monitoramento seguem uma hierarquia de severidade que determina o canal e a urgência:

| Severidade | Exemplo | Canal | Tempo de resposta esperado |
|---|---|---|---|
| Crítica | Aplicação fora do ar; erro em cálculo Tier 1 | Slack `#alertas-producao` + DM ao tech lead + e-mail | Imediato (< 15 min) |
| Alta | Volume anormal de erros; performance degradada | Slack `#alertas-producao` | Até 1 hora |
| Média | Erro novo em módulo Tier 2/3; warning de infra | Slack `#alertas-producao` | Até 4 horas (horário comercial) |
| Baixa | Dependência com update de segurança; aviso de disco | Slack `#builds-e-deploys` | Próximo dia útil |

**Regra de silenciamento:** alertas de staging são encaminhados apenas para o canal `#builds-e-deploys`, nunca para `#alertas-producao`, exceto em preparação para release. Alertas de produção nunca são silenciados.

### 16.5 Processo de resposta a incidentes de monitoramento

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

### 16.6 Dashboard operacional

Embora ferramentas avançadas de dashboard (Grafana, Datadog) estejam fora de escopo na fase inicial, é necessário manter uma visão consolidada do estado da plataforma. A seguinte composição cumpre esse papel com custo zero:

| Componente | Ferramenta | Acesso |
|---|---|---|
| Status de uptime e histórico | UptimeRobot status page | URL pública (compartilhável com clientes) |
| Erros recentes e tendência | Dashboard do Sentry | Login do Sentry |
| Métricas de infraestrutura | Painel do DigitalOcean | Login do DigitalOcean |
| Processos e restarts | PM2 via SSH | Terminal no servidor |

A consolidação em um dashboard único (Grafana ou similar) deve ser considerada quando o volume de requisições tornar a consulta manual insuficiente, ou quando clientes exigirem SLA com relatórios de disponibilidade formalizados.

### 16.7 Monitoramento por módulo

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

### 16.8 Etapas de implantação do monitoramento

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

### 16.9 Custos

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