# Verificações automáticas e bloqueio de publicação

**Architecture impact:** somente o processo de integração e publicação muda. O
aplicativo, o SQLite e os dados pessoais permanecem inalterados. Os testes
remotos usam fixtures e instalações temporárias, sem copiar o banco do usuário.

O workflow `Project Checks` roda em pull requests para `main`, `develop` e
`feature/**`, em pushes nessas branches e manualmente pela aba Actions. Ele
também é reutilizado pelos fluxos de publicação para verificar o mesmo commit
que será distribuído, inclusive quando uma tag é enviada diretamente.

## Verificações

- Testes dos auxiliares Node/Python, formatação e paridade de traduções.
- Suíte completa do Vitest, lint, tipos e builds dos frontends web e desktop.
- Testes de layout e sandbox de extensões nos navegadores já suportados.
- Testes Rust do workspace com `--no-fail-fast`, fixtures adicionais das
  bibliotecas legadas, formatação, Clippy e compilação dos runtimes pessoais.
- Suíte E2E completa da aplicação, executada em série com um novo banco
  sintético pelo runner existente, e suíte isolada de perfis.
- Verificações móveis existentes continuam condicionais aos arquivos do PR.

Testes que já exigem opt-in, provedores reais, dispositivos ou credenciais
específicas continuam com essas limitações. Não é uma garantia de cobertura de
todos os sistemas operacionais nem de ausência de defeitos.

## Reprovação e relatórios

O job `Build Status` exige sucesso de todos os jobs obrigatórios. Falha,
cancelamento, resultado ausente ou job obrigatório pulado reprovam a execução.
Os testes independentes continuam quando possível, para reunir mais erros em uma
única execução, sem transformar falhas em sucesso.

O resumo da execução mostra a tabela de resultados. Os artefatos `ci-frontend`,
`ci-rust`, `ci-application` e `ci-summary` guardam logs e relatórios por 14
dias; os relatórios de navegador incluem evidências de falha. Erros de
preparação ou infraestrutura também aparecem nos logs dos passos. Não são
enviados bancos, arquivos de ambiente ou credenciais nos artefatos.

Os jobs de release dependem do workflow de qualidade. O fluxo Docker herdado, se
acionado, também exige essa aprovação antes de enviar imagens. Nenhum deploy,
tag, release ou instalação no computador é acionado automaticamente por um push
comum. Este trabalho não cria um ambiente de produção ou integração Firebase.

Para impedir também a integração de código reprovado na branch principal, a
proteção da `main` deve exigir `Build Status` atualizado, inclusive para
administradores. Essa é uma configuração no GitHub, além dos arquivos
versionados.

## Validação do controle

`python -m unittest discover -s .github/scripts -p 'test_*.py'` cobre os
auxiliares de CI. Os testes de `ci_report.py` verificam aprovação, reprovação,
cancelamento, jobs ausentes ou pulados e relatório salvo mesmo na falha. O
validador Actionlint confere a sintaxe e as dependências dos workflows. A
execução real e seus logs na aba Actions são a evidência do resultado das
suítes; uma validação de YAML sozinha não demonstra que os testes passaram.
