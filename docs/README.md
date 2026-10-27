# Documentação de @jeftelabs/oauth-client

Esta documentação explica a biblioteca para quem integra, mantém ou analisa o pacote, incluindo agentes de IA. O código, `package.json`, testes e workflows são a fonte de verdade quando uma página ficar desatualizada; corrija a página correspondente no mesmo trabalho.

## Começar

- [Visão da arquitetura e fluxos](architecture/overview.md) — componentes, ciclo das chamadas e fronteiras de responsabilidade.
- [OAuth2 Authorization Code e PKCE](guides/oauth2-authorization-code.md) — construção do redirect, callback, troca de código e hooks PKCE.
- [OAuth1 de três etapas](guides/oauth1-three-legged.md) — request token, redirect, verifier e assinatura.
- [Segurança, state e armazenamento](guides/security-and-state.md) — responsabilidades da aplicação, segredos e mitigação de CSRF.

## Referências

- [API pública](references/api.md) — exports, contratos, opções, hooks e respostas.
- [Detalhes de implementação](references/implementation.md) — clientes HTTP, resposta, serialização, assinatura e erros.
- [Desenvolvimento e automação](references/development.md) — scripts, build, testes, CI, release e estrutura do repositório.

## Planejamento e manutenção

- [Manutenção e documentação](planning/maintenance.md) — regras para mudanças, compatibilidade e áreas de atenção.

## Mapa de arquivos

| Caminho | Responsabilidade |
| --- | --- |
| `index.ts` | Export público da raiz |
| `src/clients/oauth1/` | Cliente OAuth1 e assinatura RFC 5849 |
| `src/clients/oauth2/` | Cliente OAuth2 Authorization Code e hooks PKCE |
| `src/http_client.ts` | Builder fluente e transporte HTTP baseado em `ky` |
| `src/url_builder.ts` | URL de autorização e seus parâmetros |
| `src/types.ts`, `src/errors.ts` | Tipos públicos e erros específicos do pacote |
| `src/helpers.ts`, `src/debug.ts` | Geração aleatória e logging de depuração |
| `tests/` | Testes automatizados dos contratos e fluxos |
| `examples/` | Integrações de demonstração com Express e provedores |

## Regra documental

Toda criação ou modificação no projeto exige documentação detalhada e atualizada na mesma tarefa. Veja [AGENTS.md](../AGENTS.md) e [CLAUDE.md](../CLAUDE.md). Ao criar uma página, inclua-a neste índice e explique seu público e relação com o código.
