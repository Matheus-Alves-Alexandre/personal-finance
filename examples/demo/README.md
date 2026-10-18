# Dados de demonstração

Dados inteiramente fictícios para testar o Personal Finance, sem acesso a bancos
ou corretoras. As movimentações, quantidades e preços de negociação são
simulados; os símbolos identificam ativos reais e suas cotações atuais podem ser
consultadas pelo aplicativo.

Crie estas contas no perfil local e importe o CSV correspondente em **Atividades
→ Adicionar atividades → Importar CSV**:

| Conta                         | Moeda | Tipo                         | Arquivo              |
| ----------------------------- | ----- | ---------------------------- | -------------------- |
| Investimentos Brasil - DEMO   | BRL   | Investimento, por transações | investimentos-br.csv |
| Investimentos Exterior - DEMO | USD   | Investimento, por transações | investimentos-us.csv |
| Conta Corrente - DEMO         | BRL   | Conta corrente               | conta-corrente.csv   |

Os arquivos cobrem abril de 2025 a outubro de 2026. As observações começam com
`DADO FICTICIO`. O gerador verifica saldos de caixa não negativos, ausência de
vendas a descoberto e datas até 16/10/2026.

Para gerar novamente: `node scripts/generate-demo-data.mjs`. Não importe o mesmo
arquivo duas vezes. O resumo de controle está em `summary.json`.

Não use estes dados como recomendação de investimento. Nenhum dado do perfil
local é enviado ao repositório por esse gerador.
