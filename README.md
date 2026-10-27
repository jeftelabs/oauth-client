# @jeftelabs/oauth-client

Biblioteca Node.js/TypeScript independente de framework para integrar aplicações com provedores de autorização OAuth 1.0a e OAuth 2.0. Ela implementa os fluxos e as requisições de protocolo; a aplicação continua responsável por rotas, sessão, cookies, validação do callback e armazenamento seguro de tokens.

> Requer Node.js 24 ou superior.

## O que oferece

- OAuth 1.0a no fluxo de três etapas, com assinatura HMAC-SHA1.
- OAuth 2 Authorization Code, com pontos de extensão para PKCE.
- Configuração de parâmetros, headers, campos e formato de envio/resposta.
- Clientes genéricos que podem ser estendidos para integrar provedores e frameworks.
- Utilitários `HttpClient`, `UrlBuilder`, tipos e erros exportados.

O pacote não implementa outros grants OAuth2 nem gerencia cookies, sessões ou tokens. Veja as [limitações e responsabilidades de segurança](docs/guides/security-and-state.md) antes de integrar.

## Instalação

```sh
npm install @jeftelabs/oauth-client
```

## OAuth 2 Authorization Code

Configure as URLs e credenciais registradas no provedor. Mantenha segredos fora do código e valide o `state` recebido antes de trocar o código:

```ts
import { Oauth2Client } from '@jeftelabs/oauth-client/oauth2'

const oauth = new Oauth2Client({
  clientId: process.env.GITHUB_CLIENT_ID!,
  clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  callbackUrl: 'https://app.example.com/auth/github/callback',
  authorizeUrl: 'https://github.com/login/oauth/authorize',
  accessTokenUrl: 'https://github.com/login/oauth/access_token',
})

// Rota de início: armazene state em sessão/cookie protegido e associe-o à sessão.
const state = oauth.getState()
const redirectUrl = oauth.getRedirectUrl((request) => {
  request.param('state', state)
  request.param('scope', 'read:user user:email')
})

// Redirecione o usuário para redirectUrl usando o framework da aplicação.

// Rota de callback: após validar a resposta do provedor, compare state salvo e recebido.
oauth.verifyState(savedState, receivedState)
const token = await oauth.getAccessToken((request) => {
  request.param('code', authorizationCode)
})
```

`getAccessToken` envia `grant_type`, `redirect_uri`, `client_id` e `client_secret` como campos por padrão. O `code` é adicionado pelo callback de configuração. A resposta é normalizada para `{ token, type, refreshToken?, expiresIn?, expiresAt?, ... }`; os demais campos do provedor são preservados. Consulte o [guia OAuth2 e PKCE](docs/guides/oauth2-authorization-code.md).

## OAuth 1.0a

O fluxo exige request token e secret temporários antes de redirecionar. Guarde-os em sessão vinculada ao usuário e valide os valores no callback:

```ts
import { Oauth1Client } from '@jeftelabs/oauth-client/oauth1'

const oauth = new Oauth1Client({
  clientId: process.env.TWITTER_API_KEY!,
  clientSecret: process.env.TWITTER_APP_SECRET!,
  callbackUrl: 'https://app.example.com/auth/provider/callback',
  requestTokenUrl: 'https://api.example.com/oauth/request_token',
  authorizeUrl: 'https://api.example.com/oauth/authorize',
  accessTokenUrl: 'https://api.example.com/oauth/access_token',
})

const requestToken = await oauth.getRequestToken()
// Persista token + secret de modo temporário e vinculado à sessão.
const redirectUrl = oauth.getRedirectUrl((request) => {
  request.param('oauth_token', requestToken.token)
})

// No callback, confira que o oauth_token recebido corresponde ao salvo.
oauth.verifyState(requestToken.token, receivedOauthToken)
const accessToken = await oauth.getAccessToken(requestToken, (request) => {
  request.oauth1Param('oauth_verifier', receivedVerifier)
})
```

O resultado de `getRequestToken` e `getAccessToken` usa `{ token, secret, ...camposDoProvedor }`. Leia o [guia OAuth1](docs/guides/oauth1-three-legged.md) e a [referência de segurança e estado](docs/guides/security-and-state.md).

## Exports públicos

| Import | Conteúdo |
| --- | --- |
| `@jeftelabs/oauth-client` | `HttpClient`, `UrlBuilder` e namespace `errors` |
| `@jeftelabs/oauth-client/oauth1` | `Oauth1Client` |
| `@jeftelabs/oauth-client/oauth2` | `Oauth2Client` |
| `@jeftelabs/oauth-client/types` | Tipos TypeScript de configuração, tokens e callbacks |

Tipos detalhados e hooks estão em [Referência da API](docs/references/api.md).

## Exemplos

O diretório [`examples/`](examples) contém uma aplicação Express demonstrativa com GitHub, GitLab, Google e Twitter. Configure as variáveis em `.env` conforme `.env.example` e execute com ambiente compatível com Node.js 24 e suporte a TypeScript do repositório. Os exemplos servem para estudo local; adapte cookies, proteção contra CSRF, URLs e políticas do provedor à aplicação real.

## Desenvolvimento

```sh
npm install
npm test
npm run typecheck
npm run build
```

`npm test` executa lint e os testes com cobertura. O build gera os módulos publicados em `build/` e declarações TypeScript. Consulte [Desenvolvimento e automação](docs/references/development.md).

## Documentação

Comece pelo [índice da documentação](docs/README.md), com guias de integração, arquitetura, referências técnicas e planejamento de manutenção.

## Licença

MIT — consulte [LICENSE](LICENSE).
