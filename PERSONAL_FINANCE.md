# Personal Finance

Fork pessoal e aberto da base Wealthfolio, mantido inicialmente por
Matheus-Alves-Alexandre. O nome é provisório.

## Já preparado

- Histórico Git e licença original preservados.
- Tradução brasileira existente, mantida na estrutura oficial de idiomas (`pt`).
- Dados fictícios reproduzíveis em `examples/demo/`: três contas, 454
  movimentações entre abril de 2025 e outubro de 2026, aportes, compras, vendas,
  dividendos e despesas.
- Gerador local: `node scripts/generate-demo-data.mjs`.
- Executável Windows próprio, com atalhos e dados no HD F:.
- Build pessoal sem Wealthfolio Connect e sem suas ofertas de assinatura.

## Próximas personalizações

1. Criar identidade própria: logotipo, ícones, cores, nome exibido e
   identificadores de distribuição.
2. Automatizar a distribuição do executável próprio e a migração para um
   identificador independente.
3. Revisar a experiência brasileira: real, datas, fuso horário, importações e
   apresentação das contas.
4. Ajustar painéis, categorias, metas e informações conforme o uso pessoal.
5. Configurar builds e atualizações próprios antes de distribuir uma versão
   modificada.

A instalação ativa usa `F:\PersonalFinance\app\PersonalFinance.exe`, compilado
deste fork, com atalhos **Personal Finance** na Área de Trabalho e no menu
Iniciar. O perfil e suas configurações foram preservados. O build pessoal
desativa o Connect e usa atualizações manuais. Não foram criadas integrações
bancárias, assinaturas ou serviços de nuvem para este fork.

Para reproduzir o build, consulte
[Executável local sem Connect](docs/architecture/personal-finance-offline-build.md).

O SQLite local está configurado no HD F:, em `F:\PersonalFinance\dados`, com
redirecionamento da pasta padrão do Windows. A futura versão online está
planejada em
[SQLite local e Firebase](docs/architecture/personal-finance-local-and-firebase.md):
armazenamento local preservado, sincronização opcional e consulta online
privada. A integração ainda não está ativa.

## Limites da alteração inicial

Esta etapa adiciona documentação e arquivos de demonstração. Os serviços,
chamadas de rede, persistência, eventos e regras financeiras da aplicação
permanecem como na base original. O gerador escreve somente dados sintéticos e
não lê o banco local, configurações ou credenciais do usuário.

O cálculo de controle dos CSVs verifica que não haja caixa negativo, vendas
acima das posições ou datas posteriores a 16/10/2026. Isso valida a coerência
dos exemplos; não substitui verificar a importação e o resultado no aplicativo.

## Publicação

O repositório contém o código e exemplos sintéticos. Bancos locais,
configurações pessoais, credenciais e backups do aplicativo não devem ser
adicionados ao Git.

A licença [AGPL-3.0](LICENSE), os avisos de autoria e a origem permanecem
preservados. As marcas e os serviços do Wealthfolio pertencem a seus respectivos
titulares. A identidade do produto e a publicação de executáveis próprios serão
tratadas antes da primeira distribuição modificada.

## Uso pessoal sem IA

**Architecture impact da identidade:** o nome exibido nas telas, traduções,
menus e metadados é Personal Finance. Identificadores de perfil, banco,
credenciais e protocolos permanecem compatíveis. Os créditos e a licença da base
Wealthfolio são preservados; o suporte do fork aponta para este repositório.

O assistente, os provedores de IA e o acesso por agentes MCP foram removidos da
interface e da composição dos runtimes desktop/web. Os dados e o histórico do
perfil são preservados. Veja
[a decisão e os critérios de verificação](docs/architecture/personal-finance-no-ai.md).

Os nomes de passivos e exemplos de cadastro em português foram adaptados para o
Brasil. A adaptação de texto não altera as fórmulas de empréstimos nem cria
regras específicas de produtos bancários.
