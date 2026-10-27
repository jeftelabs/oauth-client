# Referência da API pública

Confirme paths de import em `package.json#exports`; os clientes OAuth não são exportados pela raiz.

## Imports publicados

```ts
import { HttpClient, UrlBuilder, errors } from '@jeftelabs/oauth-client'
import { Oauth1Client } from '@jeftelabs/oauth-client/oauth1'
import { Oauth2Client } from '@jeftelabs/oauth-client/oauth2'
import type { Oauth1ClientConfig, Oauth2ClientConfig } from '@jeftelabs/oauth-client/types'
```

## Configuração compartilhada

Ambos os clientes recebem `clientId`, `clientSecret` e `callbackUrl`, todos strings obrigatórios em `Oauth2ClientConfig`. `authorizeUrl` e `accessTokenUrl` são opcionais no tipo, mas necessárias para os métodos que usam cada endpoint; podem vir do objeto de opções ou de propriedades protegidas numa subclasse.

`Oauth1ClientConfig` adiciona `requestTokenUrl`, também opcional no tipo e necessária para `getRequestToken` se não for fornecida por uma subclasse. OAuth1 ainda usa `authorizeUrl` e `accessTokenUrl`.

## `Oauth2Client`

- `getState(): string`: gera state aleatório. O consumidor guarda e associa a uma sessão.
- `verifyState(state: string, inputValue?: string): void`: lança `E_OAUTH_STATE_MISMATCH` se o state salvo estiver vazio ou diferente do valor recebido.
- `getRedirectUrl(callback?): string | Promise<string>`: cria URL a partir de `authorizeUrl`; inclui `redirect_uri` e `client_id`; adiciona parâmetros PKCE se hook de verifier retornar valor; roda hook protegido e callback público nessa ordem.
- `getAccessToken(callback?): Promise<Token>`: POST ao `accessTokenUrl`; inclui campos padrão e opcionalmente `code_verifier`; espera JSON por padrão; normaliza a resposta.
- `makeCodeVerifier(): string`, `makeCodeChallenge(verifier, method?)`: helpers protegidos de PKCE. Challenge padrão usa SHA-256 base64url; método padrão é `S256`.

Hooks protegidos: `getPkceCodeVerifierForRedirect`, `getPkceCodeVerifierForAccessToken`, `getPkceCodeChallenge`, `getPkceCodeChallengeMethod`, `configureRedirectRequest`, `configureAccessTokenRequest`, `processClientResponse`, `httpClient` e `urlBuilder`. O consumidor precisa manter o verifier entre os requests; os hooks são síncronos.

Resposta do token converte `access_token` em `token`, `token_type` em `type`, `refresh_token` em `refreshToken` e `expires_in` em `expiresIn`. Se `expiresIn` for truthy, `expiresAt` é `Date` calculada com o relógio atual. Campos adicionais são espalhados no objeto de retorno.

## `Oauth1Client`

- `getRequestToken(callback?): Promise<Oauth1RequestToken>`: POST assinado com `oauth_callback` por padrão; exige `oauth_token` e `oauth_token_secret` na resposta e normaliza para `token`/`secret`.
- `getRedirectUrl(callback?): string | Promise<string>`: monta URL de autorização; não adiciona `oauth_token` automaticamente.
- `verifyState(state, inputValue?)`: mesma comparação de igualdade usada para verificar o request token retornado.
- `getAccessToken(requestToken, callback?): Promise<Token>`: exige `{ token, secret }`, assina POST e inclui parâmetros recebidos no callback.

Hooks protegidos: `configureRequestTokenRequest`, `configureRedirectRequest`, `configureAccessTokenRequest`, `processClientResponse`, `httpClient`, `urlBuilder`, `getSignature` e `makeSignedRequest`.

## Callbacks fluentes

Os callbacks de redirect recebem `RedirectRequestContract`; callbacks de requisição API recebem `ApiRequestContract`.

| Método | Efeito |
| --- | --- |
| `param(key, value)` / `clearParam(key)` | Define/remove query parameter |
| `oauth1Param(key, value)` / `clearOauth1Param(key)` | Define/remove parâmetro usado na assinatura e header OAuth1 |
| `field(key, value)` / `clearField(key)` | Define/remove campo de body |
| `header(key, value)` / `clearHeader(key)` | Define/remove header HTTP |
| `parseAs('json' \| 'text')` | Define parsing da resposta |
| `sendAs('json' \| 'urlencoded')` | Define formato do body |
| `clear()` | Limpa estado do request; em API HTTP também restaura tipos padrão |

Os callbacks dos métodos executam após os padrões e hooks protegidos, podendo sobrescrevê-los ou removê-los. O callback OAuth1 deve usar `oauth1Param` para valores do header assinado e `param` para query string; não são intercambiáveis.

## `HttpClient` e `UrlBuilder`

`HttpClient(baseUrl)` fornece getters para parâmetros/campos/headers, `get()` e `post()`, builders acima e opções de parsing/envio. Configuração padrão: body urlencoded e resposta text. A instância é mutável; chame `clear()` para reutilizá-la sem estado anterior.

`UrlBuilder(baseUrl)` valida a URL com `URL`, oferece `param`, `clearParam`, `clear`, `getParams` e `makeUrl`. `param` substitui valor existente com o mesmo nome.

## Erros

O namespace de export `errors` contém `E_OAUTH_MISSING_TOKEN` e `E_OAUTH_STATE_MISMATCH`. O primeiro é lançado por clientes quando campos de token obrigatórios faltam. Erros de configuração ausente são `RuntimeException` da dependência `@jeftelabs/exception`; erros HTTP do `ky` não são encapsulados.

## Tipos

`src/types.ts` exporta tipos de contratos (`ApiRequestContract`, `RedirectRequestContract`), configuração, tokens, `Oauth2PkceMethod` (`'S256' | 'plain'`) e opções de assinatura `Oauth1SignatureOptions`. Os clientes usam genéricos de token para permitir campos específicos do provedor.
