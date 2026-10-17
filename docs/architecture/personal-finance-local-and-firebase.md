# Personal Finance: SQLite local e versão online com Firebase

Status: plano de implementação, sem integração Firebase ativa. Revisado em
16/10/2026.

## Uso local agora

O aplicativo está disponível em `F:\PersonalFinance\app\PersonalFinance.exe`,
com atalhos chamados **Personal Finance** na Área de Trabalho e no menu Iniciar.
É uma compilação local do fork, baseada no Wealthfolio 3.10.0, com Connect
desativado. A pasta de instalação contém a licença original e um arquivo
`LEIA-ME.txt` com os caminhos e as informações da versão instalada.

O aplicativo desktop já persiste os dados no HD com SQLite. Não é necessário
criar uma tabela nova nem trocar o mecanismo de armazenamento. Cada perfil tem
um banco e as migrações existentes criam a estrutura de contas, atividades,
ativos, configurações e demais entidades.

No Windows, o executável oficial utilizado na exploração mantém os arquivos em
`%APPDATA%/com.teymz.wealthfolio/`, com `profiles.json` e
`profiles/<uuid>/app.db`. Essa pasta é independente do repositório Git. Ao
adotar identificadores próprios na distribuição, implementar uma migração
explícita ou uma importação de backup para preservar os dados.

Na configuração pessoal atual, os dados ativos foram transferidos para
`F:\PersonalFinance\dados`. A pasta original em `%APPDATA%` é uma junção do
Windows para esse destino, permitindo que o executável continue usando os mesmos
caminhos. O disco F: precisa estar disponível para abrir o perfil. Uma cópia
anterior à transferência foi preservada para reversão; novas gravações seguem
para F:. Foram conferidos os hashes dos arquivos copiados.

O perfil de demonstração foi excluído pelo aplicativo e substituído por
`Pessoal`. A consulta somente de leitura no banco do F: confirmou zero contas,
zero movimentações e zero metas; a verificação de integridade retornou `ok`.

Para começar o uso pessoal, remover o perfil de demonstração pela exclusão
nativa de perfil e criar um perfil vazio. Esse fluxo encerra o contexto anterior
e remove os dados associados sem executar SQL manualmente contra um banco
aberto. Os CSVs sintéticos continuam em `examples/demo/` para testes; eles não
são importados automaticamente.

O fork já foi compilado neste Windows, com Rust e as ferramentas C++ no F:, sem
Docker. O comando `pnpm build:personal` gera a versão local sem Connect. A
futura integração Firebase exigirá uma nova implementação e compilação.

## Resultado pretendido

Continuar cadastrando e consultando informações no computador sem internet. Ao
ativar a opção online, enviar uma cópia privada para o Firebase e consultar os
dados pelo navegador, inclusive no celular. Desativar a sincronização não pode
impedir salvar localmente.

A primeira entrega online terá consulta de contas, movimentações e resumos. A
edição pelo navegador e por múltiplos computadores virá em uma etapa posterior,
com resolução de conflitos.

```text
Desktop: React -> comandos Tauri -> serviços Rust -> SQLite no HD
                                                |
                                      sincronização opcional
                                                |
                             Firebase Auth + Cloud Firestore
                                                |
                         página de consulta online com login
```

## Decisões de arquitetura

- Manter SQLite como armazenamento principal do desktop. Firestore guarda
  documentos; a integração mapeia os registros, sem enviar o arquivo `app.db`
  como banco online.
- Usar Firebase Authentication para identificar o usuário e Cloud Firestore para
  os dados. Hospedar o frontend de consulta no Firebase Hosting. Hosting de
  arquivos estáticos não executa o backend Rust/Axum existente.
- Reutilizar os componentes React e os modelos financeiros atuais. Na primeira
  versão, os cálculos de saldo, carteira e desempenho continuam no Rust do
  desktop; o site recebe resumos calculados com data e versão. Não duplicar o
  motor financeiro em JavaScript.
- A página online inicial é uma consulta com adaptador próprio: a implementação
  web atual chama o servidor Axum e não funciona automaticamente só por publicar
  os arquivos no Hosting.
- Limitar a primeira etapa a um desktop escritor por conjunto de dados. O
  navegador lê e mostra a data da última sincronização; com o computador
  desligado, apresenta a última cópia enviada.
- Usar autenticação Firebase independente do Wealthfolio Connect. Não reutilizar
  assinatura, endpoints de produção, credenciais ou associação de conta do
  Connect para a nova integração.
- Configuração Firebase ausente ou sincronização desligada significa nenhuma
  requisição Firebase. Publicação de informações existentes exige ativação
  explícita do usuário na aplicação.

**Architecture impact:** esta etapa documental não altera persistência, eventos
ou chamadas de rede. A implementação futura adicionará transmissão opcional de
dados financeiros ao Firebase e uma nova leitura web. Gravações locais e regras
financeiras continuam nos serviços Rust. Nenhum upload foi habilitado por este
plano.

## Organização dos dados na nuvem

Estrutura proposta, a validar com os contratos de sincronização existentes:

```text
users/{uid}/datasets/{datasetId}
  accounts/{accountId}
  activities/{activityId}
  assets/{assetId}
  categories/{categoryId}
  goals/{goalId}
  preferences/{key}
  summaries/{summaryId}
```

`uid` vem do token autenticado; o `datasetId` é uma identidade online
persistente, vinculada explicitamente ao perfil local, sem depender de nomes ou
do caminho do banco no Windows. Categorias e relações de classificação precisam
de mapeamento próprio: não são cópias cegas de uma única tabela. Cada entidade
terá versão de esquema e revisão de sincronização. Valores monetários e
quantidades preservam a precisão decimal dos modelos Rust, sem conversão para
ponto flutuante; datas de movimentações mantêm a data financeira e timestamps
usam UTC.

Não enviar senhas, tokens, histórico de conversas do assistente ou credenciais
de provedores. Selecionar preferências por lista permitida. Enviar apenas
cotações/resumos necessários à consulta, sem replicar todo o histórico dos
provedores. Paginar movimentações e limitar os documentos para respeitar os
limites do Firestore.

## Sincronização e consistência

O projeto já tem projeção de eventos e fila persistente em
`crates/storage-sqlite/src/sync/app_sync/`, além dos contratos em
`crates/core/src/sync/app_sync_model.rs`. Avaliar seu reaproveitamento antes de
criar outra fila. Os estados e confirmações do transporte Firebase devem ser
independentes do Connect: confirmar um envio ao Firebase não pode consumir
eventos que outro transporte ainda precisa receber. Se o contrato atual não
permitir isso, documentar o motivo da extensão antes de migrar o banco.

Na implementação, uma alteração só pode ser confirmada na fila após o envio
correspondente. Falhas de rede deixam operações pendentes no disco, com nova
tentativa limitada. Reenvios devem ser idempotentes por identificador/revisão.
Uma reinicialização não pode perder uma gravação local nem duplicar uma
movimentação na nuvem.

A primeira publicação de um conjunto de dados precisa de leitura consistente do
SQLite e de um marcador de publicação completa: o site não deve tratar uma carga
parcial como carteira completa. Repetir a validação dos resumos quando houver
gravações concorrentes durante a carga. Exclusões de registros devem remover ou
marcar a versão online correspondente, sem permitir que um envio antigo
ressuscite o registro. Excluir um perfil local e apagar sua cópia na nuvem serão
ações distintas e visíveis.

O cache offline do Firestore não sincroniza automaticamente o SQLite do Rust. A
ponte precisa ser implementada. Para o site, usar inicialmente cache em memória
para evitar guardar informações financeiras em computadores compartilhados.

## Proteção e custos

- Aplicar regras por proprietário em cada caminho: token válido e
  `request.auth.uid == uid`. Estar autenticado, sozinho, não autoriza ler dados
  de outros usuários.
- Validar campos, tipos, tamanhos e versões permitidas; negar acesso por padrão.
  Testar também consultas de coleções e tentativas de mudar proprietário ou
  escrever campos inesperados.
- Nunca incluir uma chave de conta de serviço no app ou no site. O transporte
  usa identidade do usuário; segredos locais seguem o `SecretStore` existente e
  o cofre nativo do Windows.
- A integração proposta usa as proteções gerenciadas do Firebase e regras de
  acesso; não promete criptografia ponta a ponta. Se essa proteção for desejada,
  definir chaves, recuperação e busca antes da implementação.
- Começar avaliando o plano Spark. A cota gratuita publicada do Firestore é de 1
  GiB armazenado, 50 mil leituras/dia, 20 mil gravações/dia, 20 mil
  exclusões/dia e 10 GiB de saída/mês, com uma base gratuita por projeto. Esses
  limites podem mudar e não garantem custo zero para qualquer uso.
- A primeira versão não depende de Cloud Functions, Storage ou backup
  gerenciado. Backup local pelo recurso existente continua separado da
  sincronização; uma exclusão sincronizada também pode apagar a cópia online,
  portanto ela não substitui um backup.

## Etapas e critérios de conclusão

1. **Base local:** perfil sem contas e movimentações fictícias; banco no HD;
   abrir novamente e verificar a persistência. Manter idioma brasileiro e
   moeda-base BRL no uso pessoal.
2. **Build próprio:** manter a execução do fork e validar os dois adaptadores
   atuais. Registrar a migração do perfil oficial antes de mudar identificadores
   de distribuição.
3. **Ambiente Firebase de teste:** criar projeto do proprietário, configurar
   Auth, Firestore, regras, índices e emuladores. Usar dados sintéticos até
   passar os testes de isolamento.
4. **Desktop para nuvem:** sincronizar primeiro conta + movimentação, comparando
   campos, precisão decimal e totais. Ampliar para categorias, ativos e resumos
   após esse fluxo passar.
5. **Consulta online:** login, contas, busca/paginação de movimentações, painel
   e última sincronização. Publicar só após regras e navegação validadas com
   dois usuários distintos.
6. **Edição em vários dispositivos:** adicionar controle de revisão no servidor
   e apresentação de conflitos, antes de liberar escrita pelo site. Reutilizar
   serviços Rust/Axum em um serviço hospedado compatível, caso os cálculos
   precisem rodar sem o desktop ligado. Essa etapa terá um desenho de hospedagem
   e custo separado; Firebase Hosting não basta para executar Rust.

Verificação mínima antes de sincronizar informações pessoais: salvar/reabrir
offline; interrupção e retomada de envio; reenvio sem duplicação; exclusão;
carga inicial interrompida; troca de perfil; Firebase desligado sem requisições;
usuário A sem acesso ao B; restauração de backup local e conferência de resumos
contra o motor Rust. Testar regras no Firebase Emulator Suite, sem enviar dados
pessoais. Para alterações Rust/adaptadores, cumprir também os checks de
`AGENTS.md`.

Para ativar futuramente serão necessários um projeto Firebase do proprietário,
sua configuração pública e os métodos/domínios de login. A criação desse
ambiente e o envio de informações pessoais não fazem parte desta etapa de
planejamento.

## Referências verificadas

- [Perfis e banco local](multi-profile-and-app-lock.md).
- [Backups e criptografia existentes](database-encryption-and-backups.md).
- [Firebase Authentication](https://firebase.google.com/docs/auth).
- [Regras de segurança do Firestore](https://firebase.google.com/docs/firestore/security/get-started).
- [Cache offline e conflitos do Firestore](https://firebase.google.com/docs/firestore/manage-data/enable-offline).
- [Cotas do Firestore](https://firebase.google.com/docs/firestore/quotas).
