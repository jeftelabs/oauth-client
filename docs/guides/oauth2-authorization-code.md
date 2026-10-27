# Guia: OAuth 2 Authorization Code e PKCE

## Pré-requisitos

Registre no provedor o callback HTTPS esperado e configure `clientId`, `clientSecret`, `callbackUrl`, `authorizeUrl` e `accessTokenUrl`. Embora as URLs de endpoint sejam opcionais no tipo de configuração, cada uma precisa estar configurada por `options` ou por uma subclasse antes de chamar o método correspondente. Não use segredo real em código versionado.

```ts
import { Oauth2Client } from '@jeftelabs/oauth-client/oauth2'

const client = new Oauth2Client({
  clientId: process.env.OAUTH_CLIENT_ID!,
  clientSecret: process.env.OAUTH_CLIENT_SECRET!,
  callbackUrl: 'https://app.example.com/auth/callback',
  authorizeUrl: 'https://provider.example.com/oauth/authorize',
  accessTokenUrl: 'https://provider.example.com/oauth/token',
})
```

## Iniciar autorização

Gere um state imprevisível em cada tentativa e guarde-o em sessão segura, com escopo/duração adequados. Depois inclua-o na URL de autorização. O cliente não persiste o valor e não o acrescenta automaticamente.

```ts
const state = client.getState()
await sessionStore.save(sessionId, { oauthState: state })

const redirectUrl = client.getRedirectUrl((request) => {
  request.param('state', state)
  request.param('response_type', 'code')
  request.param('scope', 'profile email')
})
// Use o mecanismo de redirect do framework.
```

O callback `getRedirectUrl` roda depois dos parâmetros padrão `redirect_uri` e `client_id`. Pode incluir parâmetros do provedor, substituir valores existentes por `param`, remover com `clearParam` ou limpar tudo com `clear`.

## Tratar callback e trocar código

Primeiro trate `error`/negação e verifique que há um único código válido, de acordo com as regras do provedor. Compare o state recebido com o state salvo na mesma sessão. Só então faça a troca:

```ts
client.verifyState(savedState, returnedState)

const accessToken = await client.getAccessToken((request) => {
  request.param('code', authorizationCode)
})
```

`getAccessToken` faz POST ao endpoint e inclui como form fields os campos `grant_type=authorization_code`, `redirect_uri`, `client_id` e `client_secret`. O callback é executado depois dos padrões para adicionar `code`, modificar valores, ajustar headers ou remover campos. O cliente espera JSON por padrão. Para um provedor que devolve resposta urlencoded, configure `request.parseAs('text')` e converta via `processClientResponse` numa subclasse apropriada.

O objeto retornado normaliza os nomes usuais para `token`, `type`, `refreshToken`, `expiresIn` e `expiresAt`; dados extras do provedor permanecem no resultado. `expiresAt` existe apenas se `expiresIn` for truthy. Consulte [API](../references/api.md) para os tipos exatos.

## Integrar PKCE

Crie uma subclasse que gere e armazene um verifier durante o início do fluxo e devolva exatamente esse verifier no callback. O exemplo usa uma interface abstrata de armazenamento, pois o repositório não escolhe sessão/cookie por você:

```ts
import { Oauth2Client } from '@jeftelabs/oauth-client/oauth2'
import type { Oauth2ClientConfig } from '@jeftelabs/oauth-client/types'

class PkceClient extends Oauth2Client {
  constructor(
    config: Oauth2ClientConfig,
    private readonly verifier: string | null = null
  ) {
    super(config)
  }

  createVerifier() {
    return this.makeCodeVerifier()
  }

  protected override getPkceCodeVerifierForRedirect() {
    return this.verifier
  }

  protected override getPkceCodeVerifierForAccessToken() {
    return this.verifier
  }
}

// Request de início: gere o verifier com uma instância efêmera, persista-o e
// use outra instância com esse valor para construir o redirect.
const generator = new PkceClient(config)
const verifier = generator.createVerifier()
await verifierStore.save(sessionId, verifier)
const redirectClient = new PkceClient(config, verifier)
const redirectUrl = redirectClient.getRedirectUrl((request) => {
  request.param('state', state)
})

// Callback: recupere o verifier associado à sessão/state validado.
const savedVerifier = await verifierStore.load(sessionId)
const callbackClient = new PkceClient(config, savedVerifier)
const accessToken = await callbackClient.getAccessToken((request) => {
  request.param('code', authorizationCode)
})
```

`verifierStore` representa o storage de sessão da aplicação; vincule o registro ao state, expire-o e consuma-o uma vez. Como os hooks atuais são síncronos, carregue o verifier antes de construir o cliente do callback e exponha-o na instância, como no exemplo.

O método de challenge padrão é `S256`; a subclasse pode sobrescrever `getPkceCodeChallengeMethod()` para retornar `plain` quando necessário e permitido pelo provedor. `getPkceCodeChallenge` também é substituível. Evite `plain` em situações em que S256 esteja disponível. A implementação adiciona `code_challenge` e `code_challenge_method` quando o hook de verifier retorna valor; na troca adiciona `code_verifier` quando o hook correspondente retorna valor.

## Hooks e ordem

- `configureRedirectRequest(request)` roda após os padrões de redirect/PKCE.
- callback de `getRedirectUrl(request)` roda depois do hook protegido.
- `configureAccessTokenRequest(request)` roda após campos padrões e parsing JSON.
- callback de `getAccessToken(request)` roda por último, podendo ajustar tudo.

## Erros e falhas

`E_OAUTH_STATE_MISMATCH` é lançado se state estiver ausente ou diferente. `E_OAUTH_MISSING_TOKEN` ocorre se a resposta não trouxer `access_token`. Erros HTTP, timeouts e falhas de parsing do `ky` propagam-se. Registre os erros sem despejar access tokens, segredo, código ou corpo sensível da resposta.
