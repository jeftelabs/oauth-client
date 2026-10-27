# Desenvolvimento, build e automação

## Ambiente e instalação

O pacote declara Node.js `>=24.0.0` em `package.json`. Instale dependências com `npm install` para desenvolvimento ou `npm ci` em ambiente reproduzível. Exemplos locais exigem as variáveis definidas em `.env.example`; não preencha o arquivo versionado com secrets.

## Scripts npm

| Script | Ação |
| --- | --- |
| `npm test` | Lifecycle `pretest` executa lint; depois executa cobertura C8 sobre `quick:test` |
| `npm run quick:test` | Executa `bin/test.ts` via `@jeftelabs/exec` |
| `npm run lint` | ESLint em todo o repositório |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run build` | Executa compile e gera declarações TypeScript |
| `npm run compile` | Bundle ESM via `tsdown` |
| `npm run clean` | Remove `build/` |
| `npm run format` | Formata com Prettier |

`precompile` executa lint e clean antes de `compile`. `prepublishOnly` constrói antes de publicar. O hook `.husky/pre-commit` executa `npm test`; `.husky/commit-msg` valida Conventional Commit.

## Layout compilado

`tsdown` usa entries `index.ts`, clientes OAuth1/OAuth2 e `src/types.ts`, emite ESM para `build/` e sem declarations embutidas. O comando `build` em seguida executa `tsc --emitDeclarationOnly --declaration`. `package.json#exports` seleciona o arquivo de entrada para cada subpath. Mudanças em exports devem atualizar esta referência e o README.

## Testes

Os testes usam `@t8ngs/runner`; chamadas HTTP são isoladas com `nock`. Arquivos por área:

- `tests/oauth1.spec.ts`: request/access token, callback, erros, parâmetros e configuração do fluxo.
- `tests/oauth1_signature.spec.ts`: forma da assinatura OAuth1.
- `tests/oauth2.spec.ts`: URL, state, PKCE, parsing e troca de token.
- `tests/http_client.spec.ts`: body, headers, query e parsing HTTP.
- `tests/url_builder.spec.ts`: composição e remoção de query.

Ao alterar contratos, atualize testes e documentação. O pipeline atual `.github/workflows/checks.yml` valida mensagens de commit no push para `main`; apesar de citar evento de pull request num passo condicional, o gatilho listado no arquivo é push. Não assuma que o workflow executa lint/testes sem verificar a configuração atual.

## CI, release e publicação

- `.github/workflows/checks.yml`: valida commitlint em push para `main`.
- `.github/workflows/release.yml`: em push para `main`, usa Release Please e, se release criado, gera build e pacote npm como artefato.
- `.github/workflows/deploy.yml`: ao publicar release, compila e publica no GitHub Packages e no npm.
- `labels.yml` e `stale.yml`: automações de triagem e issues.

Não publique nem dispare release como parte de uma mudança documental. Requisitos de credenciais de publicação pertencem aos secrets do CI.

## Convenções

Use ESM/TypeScript, formato estabelecido pelo Prettier e Conventional Commits. Leia as instruções de `AGENTS.md`; documentação detalhada é obrigatória para qualquer mudança. Evite editar saída gerada (`build/`, `coverage/`, `node_modules/`).
