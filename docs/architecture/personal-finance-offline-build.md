# Executável local do Personal Finance sem Connect

## Escopo e verificação

Gerar o executável do fork para Windows, instalar no F: e preservar o perfil e
seu banco SQLite. Remover os atalhos e ofertas do Wealthfolio Connect na
configuração inicial, navegação e configurações quando o recurso estiver
desativado. Contas manuais e importação CSV continuam disponíveis. O Firebase
permanece planejado e não faz parte deste build.

**Architecture impact:** o build pessoal não configura autenticação Connect e
compila o Rust sem os recursos padrão `connect-sync` e `device-sync`. Os
componentes respeitam a opção `CONNECT_ENABLED` existente. As regras
financeiras, o armazenamento SQLite, o cofre de credenciais e o diretório de
dados não mudam. As rotas antigas do Connect levam ao painel/contas quando o
recurso está desligado.

O identificador `com.teymz.wealthfolio` é mantido nesta instalação pessoal para
preservar o perfil e as credenciais existentes. Não executar o original e o fork
simultaneamente. A migração para um identificador próprio deve ser tratada antes
de distribuição independente.

O nome do executável e da janela é Personal Finance. Os demais elementos visuais
e avisos de autoria continuam na base original; esta alteração não é uma
reformulação completa da marca.

## Build e instalação

Usar Node 24, pnpm 10.33.4, Rust 1.98.1 e os componentes Microsoft C++/Windows
SDK no Windows. As ferramentas locais ficam em `F:\PersonalFinance\ferramentas`.
Não é necessário Docker.

```text
pnpm install --frozen-lockfile
pnpm build:types
pnpm build:personal
```

`scripts/build-personal.mjs` limpa as duas variáveis públicas de autenticação
Connect no processo de build e usa `apps/tauri/tauri.personal.conf.json`. Os
endpoints de atualização automática do original ficam vazios para não substituir
a versão personalizada por uma versão com Connect. As atualizações deste
executável serão manuais até termos nosso próprio canal.

Executável instalado: `F:\PersonalFinance\app\PersonalFinance.exe`. Dados
ativos: `F:\PersonalFinance\dados`, acessados pela junção já existente no
diretório padrão do Windows. Os atalhos Personal Finance da Área de
Trabalho/menu Iniciar devem apontar ao novo executável. O build local não recebe
a assinatura digital do distribuidor original.

## Critérios de validação

- Testes de navegação: barra lateral, barra flutuante e menu móvel sem Connect;
  links locais disponíveis; builds que configurarem Connect explicitamente
  continuam suportados.
- Configuração inicial do desktop termina após aparência, sem oferta de
  assinatura.
- Configurações mantêm contas e escondem Connect; links de conectar conta
  existentes usam o contexto desativado. Conferir esses links também nos testes
  de contas/importação.
- Executar testes focados, lint dos arquivos alterados, tipos, tradução e builds
  web/Tauri.
- Compilar o executável Windows e abrir a cópia instalada no F:. Conferir o
  perfil existente, navegação e contas sem anúncios. Não limpar ou reimportar
  dados durante a instalação.
- Verificar os destinos dos atalhos e que a junção de dados continua apontando
  ao F:.

Os resultados de compilação e execução devem ser registrados ao concluir a
instalação; gerar os arquivos frontend não prova que o executável Rust foi
compilado ou instalado.

## Verificação da instalação em 16/10/2026

- 37 testes focados passaram, cobrindo navegação, configuração inicial,
  configurações, opção de Connect e links de contas.
- Tipos, lint dos arquivos da interface alterados e tradução passaram; os 20
  namespaces de tradução não apresentaram problemas.
- O build web também foi concluído, incluindo a validação do runtime de
  extensões. A versão online não foi publicada.
- O build desktop release foi concluído. O executável instalado e o arquivo
  compilado possuem o mesmo SHA-256:
  `75BAA7BCB7A23BE0276A9566B17F4DDF1EC2DEDF82B47681C3AE04DAB4FDB689`.
- A cópia em `F:\PersonalFinance\app\PersonalFinance.exe` foi aberta e exibiu o
  perfil Pessoal existente. Painel, navegação e configurações de contas foram
  conferidos sem Connect; o cadastro manual permaneceu disponível.
- Os dois atalhos apontam ao executável próprio e a junção do diretório de dados
  continua apontando a `F:\PersonalFinance\dados`.

O build produziu avisos de sourcemap, tamanho dos chunks e símbolos PDB do
OpenSSL; eles não impediram a compilação nem a abertura do aplicativo. Não houve
mudanças nas regras financeiras ou no esquema do banco neste trabalho.
