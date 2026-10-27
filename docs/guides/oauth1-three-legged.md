# Guia: OAuth 1.0a de três etapas

OAuth1 precisa de três operações com segredos temporários: obter request token, obter autorização do usuário e trocar request token/verifier por access token. Configure credenciais e os três endpoints do provedor:

```ts
import { Oauth1Client } from '@jeftelabs/oauth-client/oauth1'

const client = new Oauth1Client({
  clientId: process.env.OAUTH_CONSUMER_KEY!,
  clientSecret: process.env.OAUTH_CONSUMER_SECRET!,
  callbackUrl: 'https://app.example.com/auth/provider/callback',
  requestTokenUrl: 'https://provider.example.com/oauth/request_token',
  authorizeUrl: 'https://provider.example.com/oauth/authorize',
  accessTokenUrl: 'https://provider.example.com/oauth/access_token',
})
```

## Etapa 1: request token

`getRequestToken` faz POST assinado e inclui `oauth_callback` com `callbackUrl` por padrão. Use callback para ajustar campos e OAuth params conforme o provedor. A resposta urlencoded deve conter `oauth_token` e `oauth_token_secret`.

```ts
const requestToken = await client.getRequestToken()
// Persista token e secret temporários, vinculados à sessão e com expiração curta.
```

## Etapa 2: autorização

Inclua `requestToken.token` como `oauth_token` na URL de autorização e redirecione o usuário pelo framework:

```ts
const redirectUrl = client.getRedirectUrl((request) => {
  request.param('oauth_token', requestToken.token)
})
```

OAuth1 não usa `state` do mesmo modo que OAuth2. A associação do request token à sessão e a comparação do token retornado são importantes para validar a resposta.

## Etapa 3: callback e troca

Leia `oauth_token` e `oauth_verifier` do callback; obtenha do storage o request token e secret da sessão iniciada. Aborte se dados estiverem ausentes ou se o token retornado não corresponder:

```ts
client.verifyState(savedRequestToken.token, returnedOauthToken)
const accessToken = await client.getAccessToken(savedRequestToken, (request) => {
  request.oauth1Param('oauth_verifier', returnedVerifier)
})
```

`getAccessToken` faz POST assinado e normaliza `oauth_token`/`oauth_token_secret` para `{ token, secret }`, preservando campos extras. Mantenha o access token e secret protegidos como credenciais.

## Configuração e assinatura

`configureRequestTokenRequest`, `configureRedirectRequest` e `configureAccessTokenRequest` são hooks protegidos para subclasses. Os callbacks passados a cada método executam depois desses hooks. A API oferece métodos diferentes para query params (`param`) e parâmetros de assinatura enviados no header (`oauth1Param`). Campos de corpo `urlencoded` entram na assinatura; campos JSON não. O algoritmo atual é HMAC-SHA1 e gera nonce e timestamp automaticamente.

OAuth1 requer que parâmetros e endpoint estejam de acordo com os requisitos do provedor. Consulte a [referência de implementação](../references/implementation.md) para detalhes de canonicalização e a [referência de API](../references/api.md) para callbacks e retorno.
