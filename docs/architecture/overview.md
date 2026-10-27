# Arquitetura e fluxo

## Propósito

O pacote implementa partes comuns dos fluxos OAuth usados em aplicações Node.js sem acoplar o protocolo a um framework. O código entrega URLs e executa chamadas ao token endpoint; a integração com navegador e sessão pertence ao consumidor.

## Componentes

```text
Consumidor / framework
  ├─ armazena state, request token/secret e verifier PKCE
  ├─ redireciona usuário, recebe callback e valida entradas
  └─ invoca clientes e guarda tokens com segurança
          │ callbacks fluentes e hooks protegidos
          ▼
Oauth1Client ── Oauth1Signature (HMAC-SHA1) ─┐
Oauth2Client ── helpers PKCE/state ──────────┤
                                              ▼
                               HttpClient / UrlBuilder
                                    │           │
                                    ▼           ▼
                                  ky        URL / query
                                    │
                                    ▼
                             authorization server
```

## Caminho OAuth2

1. O integrador instancia `Oauth2Client` com credenciais, callback e endpoints.
2. A aplicação gera `state` com `getState()`, persiste-o temporariamente na sessão e acrescenta-o ao redirect por callback.
3. A aplicação redireciona o usuário e recebe a navegação de retorno no endpoint registrado.
4. A aplicação verifica o erro/código da resposta e chama `verifyState(saved, received)`.
5. `getAccessToken` prepara os campos padrão, define parsing JSON por padrão, executa hooks e callback, então faz POST.
6. A resposta é transformada de nomes OAuth (`access_token`, `token_type`, etc.) para `token`, `type`, `refreshToken`, `expiresIn` e `expiresAt`, preservando campos extras.

PKCE é opt-in via subclasse. O hook de redirect fornece o verifier; o cliente o transforma em challenge (S256 por padrão) e inclui método e challenge. No callback, a subclasse deve recuperar o mesmo verifier para `getAccessToken`. A persistência e associação de sessão são externas.

## Caminho OAuth1

1. `getRequestToken` cria um cliente HTTP, aplica `oauth_callback` e demais configurações, coleta parâmetros de URL, assinatura e campos urlencoded, assina a chamada e faz POST.
2. A resposta urlencoded é interpretada e precisa conter `oauth_token` e `oauth_token_secret`; a API normaliza para `token` e `secret`.
3. O integrador persiste os dois valores e inclui o request token na URL de autorização.
4. No callback, a aplicação compara o token retornado com aquele da sessão e obtém o verifier.
5. `getAccessToken` assina o POST com consumer secret, request token/secret e `oauth_verifier`; a resposta é normalizada para token e secret definitivos.

## Camadas reutilizáveis

- `UrlBuilder` usa `URL` e `URLSearchParams`; definir um parâmetro substitui um valor existente com o mesmo nome.
- `HttpClient` mantém query params, campos, headers e OAuth1 params separados. Envia `ky.get` ou `ky.post` após a configuração.
- `Oauth1Signature` implementa a assinatura da requisição; OAuth1 params de assinatura não são query params. Campos de corpo urlencoded participam da assinatura; campos JSON não.
- `errors.ts` declara códigos para ausência de token esperado e divergência de state. Erros de transporte/parsing do `ky` são propagados.

## Fronteiras e limites

O pacote não trata telas/rotas HTTP, não redireciona respostas do framework, não cria cookies, não protege nem persiste state/verifier, não valida automaticamente query do callback, não renova tokens e não chama endpoints de identidade/perfil. Também não oferece grants OAuth2 diferentes de Authorization Code.

## Como navegar no código

Para seguir uma chamada de OAuth2, comece em `src/clients/oauth2/main.ts`; para OAuth1, em `src/clients/oauth1/main.ts` e depois `signature.ts`. Transporte e configuração fluente estão em `src/http_client.ts`; teste os contratos correspondentes em `tests/`. A API com exports publicados está mapeada em `references/api.md`.
