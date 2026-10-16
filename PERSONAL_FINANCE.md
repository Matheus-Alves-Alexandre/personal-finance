# Personal Finance

Fork pessoal e aberto da base Wealthfolio, mantido inicialmente por Matheus-Alves-Alexandre. O nome
é provisório.

## Já preparado

- Histórico Git e licença original preservados.
- Tradução brasileira existente, mantida na estrutura oficial de idiomas (`pt`).
- Dados fictícios reproduzíveis em `examples/demo/`: três contas, 454 movimentações entre abril de
  2025 e outubro de 2026, aportes, compras, vendas, dividendos e despesas.
- Gerador local: `node scripts/generate-demo-data.mjs`.

## Próximas personalizações

1. Criar identidade própria: logotipo, ícones, cores, nome exibido e identificadores de
   distribuição.
2. Preparar a execução do código no Windows, com Rust e as ferramentas C++ necessárias. Não é
   preciso usar Docker.
3. Revisar a experiência brasileira: real, datas, fuso horário, importações e apresentação das
   contas.
4. Ajustar painéis, categorias, metas e informações conforme o uso pessoal.
5. Configurar builds e atualizações próprios antes de distribuir uma versão modificada.

O executável oficial usado na exploração inicial não reflete alterações feitas neste repositório.
Não foram criadas integrações bancárias, assinaturas ou serviços de nuvem para este fork.

## Limites da alteração inicial

Esta etapa adiciona documentação e arquivos de demonstração. Os serviços, chamadas de rede,
persistência, eventos e regras financeiras da aplicação permanecem como na base original. O gerador
escreve somente dados sintéticos e não lê o banco local, configurações ou credenciais do usuário.

O cálculo de controle dos CSVs verifica que não haja caixa negativo, vendas acima das posições ou
datas posteriores a 16/10/2026. Isso valida a coerência dos exemplos; não substitui verificar a
importação e o resultado no aplicativo.

## Publicação

O repositório contém o código e exemplos sintéticos. Bancos locais, configurações pessoais,
credenciais e backups do aplicativo não devem ser adicionados ao Git.

A licença [AGPL-3.0](LICENSE), os avisos de autoria e a origem permanecem preservados. As marcas e
os serviços do Wealthfolio pertencem a seus respectivos titulares. A identidade do produto e a
publicação de executáveis próprios serão tratadas antes da primeira distribuição modificada.
