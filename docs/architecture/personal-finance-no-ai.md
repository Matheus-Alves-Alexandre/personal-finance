# Personal Finance sem assistente e acesso por agentes

O aplicativo pessoal mantém contas, gastos, importações, investimentos e
patrimônio. O assistente, configurações de provedores de IA e acesso por agentes
MCP deixam de fazer parte da aplicação, no desktop e no servidor web.

**Architecture impact:** a composição dos dois runtimes deixa de registrar
comandos/rotas de IA e agentes, criar ambientes e serviços de chat, inicializar o
servidor MCP e depender diretamente desses pacotes. A interface não oferece
essas páginas ou atalhos, inclusive nos recentes da busca. Endereços antigos da
interface redirecionam ao painel/configurações. Configurações antigas de MCP não
reativam seu endpoint no servidor.

Não há migração ou exclusão de banco, conversas antigas, credenciais, contas ou
lançamentos. Os modelos e migrações históricos permanecem compatíveis com os
perfis existentes. Módulos de origem que já não são compostos pelos runtimes
podem permanecer no repositório como referência da base original; não ficam
registrados nem acessíveis na aplicação. Isso não é uma alegação de que todo
acesso à rede foi removido: cotações e outros recursos de dados continuam com
suas próprias configurações.

A adaptação brasileira usa os tipos de dívida já suportados: financiamento
imobiliário, de veículo e estudantil; empréstimo pessoal ou consignado; dívida
de cartão; crédito com garantia de imóvel; e outras dívidas. São nomes de
cadastro e exemplos locais. As fórmulas do projeto não foram modificadas nem
passam a implementar regras específicas de FIES, consignado ou tributos.

## Verificação

- Navegação sem assistente, mantendo painel e lançamentos.
- Configurações sem IA e acesso por agentes em desktop, web e celular.
- Teste do roteador real: contas e gastos acessíveis, chat, provedores, conversas,
  tokens e MCP ausentes, inclusive com a configuração legada de MCP ativada.
- Tipos, lint, verificação de traduções e builds web/Tauri.
- Compilação, formatação e Clippy dos runtimes afetados.
- Atualização do executável instalado, sem alterar o banco financeiro, e
  conferência visual dos pontos de acesso removidos.
