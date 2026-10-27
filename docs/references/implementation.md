# Referência: implementação e contratos de transporte

## Cliente HTTP

`HttpClient` é um wrapper pequeno sobre `ky`. Cada instância guarda uma URL base e coleções mutáveis separadas para query params, campos, headers e OAuth1 params. `get()` executa GET e `post()` POST. Quando existem fields, o body padrão é `application/x-www-form-urlencoded` usando `URLSearchParams`; `sendAs('json')` envia JSON. Query params são passados separadamente como `searchParams`. Por padrão a resposta é lida como texto; `parseAs('json')` chama `response.json()`.

Não há retry/persistência explícita no pacote nem camada própria de tradução de erro HTTP. Comportamentos adicionais seguem `ky` instalado. `getParams`, `getFields`, `getHeaders` e `getOauth1Params` devolvem os próprios objetos de estado; não são cópias imutáveis.

## Respostas de provedor

- OAuth1 chama `processClientResponse(url, client, response)`. Se `client.getResponseType()` for `json`, devolve resposta como está; caso contrário usa `node:querystring.parse`.
- OAuth2 usa regra equivalente sem parâmetro `url`. Seu token endpoint começa configurado para JSON; callback pode mudar `parseAs`. Para texto/urlencoded, a subclasse pode implementar `processClientResponse`.
- A normalização lê os nomes de campos canônicos do protocolo e preserva o restante. A ausência dos campos mínimos leva a `E_OAUTH_MISSING_TOKEN`.

O tratamento do formato real da resposta é uma decisão do provedor. Verifique sua documentação e teste resposta vazia/erro de protocolo ao escrever uma integração.

## OAuth1 signature

`Oauth1Signature` monta parâmetros com dados do consumidor, nonce aleatório, timestamp UNIX, versão 1.0 e método HMAC-SHA1; adiciona token OAuth quando presente. Combina os params adicionais de URL, `oauth1Param` e body fields somente se enviados urlencoded. Ordena os pares codificados, cria base string com método, URL normalizada e string de parâmetros e calcula HMAC-SHA1 usando consumer secret e, quando aplicável, token secret. O header `Authorization: OAuth ...` é configurado pelo cliente.

Cuidados ao modificar: codificação/ordenação OAuth exige aderência exata à RFC 5849 e pode variar em expectativas de provedores. Preserve os vetores de `tests/oauth1_signature.spec.ts` e crie casos para qualquer correção de canonicalização. A URL é normalizada pelo construtor `URL`, que remove portas padrão.

## PKCE e aleatoriedade

`src/helpers.ts` usa `node:crypto.randomBytes` e base64url sem padding para gerar strings aleatórias. O cliente OAuth2 usa SHA-256 e codificação base64url para challenge `S256`; método `plain` retorna o verifier. Hooks são síncronos. A implementação não persiste secrets, não os associa à sessão e não implementa armazenamento assíncrono.

## Logging

`src/debug.ts` exporta `debuglog('oauth_client')` da biblioteca padrão Node. O debug habilita-se com `NODE_DEBUG=oauth_client`. Antes de aumentar logs, avalie exposição de URLs, campos de autenticação e respostas.

## Exceções

`E_OAUTH_MISSING_TOKEN` é uma classe baseada em `Exception`, status 400, com mensagens distintas para OAuth1 e OAuth2; o retorno restante pode ser passado como `cause`. `E_OAUTH_STATE_MISMATCH` é criado por `createError`, status 400. Configuração ausente lança `RuntimeException`; erro de transporte/parsing preserva a origem do `ky`/Response.
