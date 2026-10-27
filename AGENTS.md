# Instruções para agentes — @jeftelabs/oauth-client

Leia este arquivo e o índice [docs/README.md](docs/README.md) antes de trabalhar. A implementação, os testes, `package.json`, workflows e documentação são fontes de verdade; quando houver divergência, confirme o comportamento no código e corrija a documentação.

## Escopo do pacote

`@jeftelabs/oauth-client` é uma biblioteca Node.js/TypeScript, independente de framework, para implementar dois fluxos de autorização de servidor:

- OAuth 1.0a de três etapas: adquirir request token, direcionar o usuário ao provedor e trocar o token/verifier por access token assinado com HMAC-SHA1.
- OAuth 2 Authorization Code: criar URL de autorização e trocar o código por access token. Há hooks protegidos que permitem integrar PKCE.

Também exporta `HttpClient`, `UrlBuilder`, erros e tipos. A biblioteca não é um middleware nem um driver de provedor completo. A aplicação integra rotas, redirecionamentos, sessões/cookies, persistência de estado/PKCE, validação do callback, tratamento de erros e armazenamento seguro dos tokens.

## Documentação obrigatória

É obrigatório criar ou atualizar documentação detalhada sempre que qualquer coisa nova for criada ou qualquer parte do projeto for modificada: código, API, tipos, testes, exemplos, dependências, configuração, scripts, build, CI, release ou documentação. Faça a atualização na mesma tarefa.

- Explique para humanos e agentes de IA propósito, fluxo, entradas, saídas, efeitos, erros, segurança, limites e manutenção.
- Organize páginas em `docs/` usando guias, referências, arquitetura, planejamento e ferramentas conforme o assunto.
- Registre cada página no índice `docs/README.md` e mantenha links relativos válidos.
- Atualize `README.md` se instalação, exports, API pública, fluxos, compatibilidade ou exemplos mudarem.
- Confira cada afirmação contra implementação e testes; não copie instruções de outro pacote sem validar.

## Mapa do código

- `index.ts`: exports do pacote raiz (`HttpClient`, `UrlBuilder`, namespace `errors`).
- `src/clients/oauth1/main.ts`: fluxo OAuth 1.0a, hooks de configuração e troca de tokens.
- `src/clients/oauth1/signature.ts`: nonce, parâmetros OAuth, base string e assinatura HMAC-SHA1.
- `src/clients/oauth2/main.ts`: Authorization Code, state e hooks PKCE.
- `src/http_client.ts`: armazenamento fluente de parâmetros, headers, campos e chamadas GET/POST via `ky`.
- `src/url_builder.ts`: composição de URL de autorização.
- `src/types.ts`, `src/errors.ts`, `src/helpers.ts`, `src/debug.ts`: contratos, erros, aleatoriedade e logging de depuração.
- `tests/`: testes de cliente HTTP, URL, assinatura OAuth1 e fluxos OAuth.
- `examples/`: demonstrações Express para GitHub, GitLab, Google e Twitter; são exemplos, não parte da API de framework.
- `package.json`: exports, scripts, engine Node e processo de build/release.

## Regras de implementação

- Preserve ESM, imports relativos com extensão `.ts` e os exports publicados definidos em `package.json`.
- Preserve a API pública e o comportamento coberto por testes, salvo solicitação explícita de mudança.
- Tokens, segredos, códigos, verifier e state são credenciais/valores sensíveis: não os exponha em logs, mensagens, testes ou documentação. Nunca adicione credenciais reais; use valores fictícios e `.env.example`.
- Estado OAuth e verifier PKCE precisam ser vinculados à sessão apropriada pela aplicação. Não diga que o pacote persiste ou valida automaticamente valores recebidos do provedor.
- OAuth 1 usa assinatura HMAC-SHA1 conforme RFC 5849. OAuth2 suporta somente Authorization Code, com PKCE por extensão da classe.
- Não altere `build/`, `coverage/` ou `node_modules/` como fonte.
- Confirme os comandos reais em `package.json`. `npm test` executa lint antes dos testes. O hook de pre-commit chama `npm test`; quando uma instrução de maior prioridade proibir executar testes, documente o motivo se precisar criar o commit sem esse hook.
- Use Conventional Commits e mantenha alterações preexistentes.
