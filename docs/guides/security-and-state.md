# Guia: segurança, state e armazenamento

OAuth envolve redirecionamentos entre domínios e credenciais que autorizam acesso a contas. O pacote implementa partes do protocolo; a aplicação que o integra precisa completar a segurança do fluxo.

## Proteja o callback contra CSRF e troca de sessão

- Gere um `state` criptograficamente aleatório por tentativa OAuth2 com `getState()`.
- Guarde-o em sessão/cookie seguro, associado ao navegador que iniciou a tentativa, e compare-o com o valor do callback usando `verifyState(saved, returned)`.
- Rejeite callback sem state, divergente, expirado, repetido ou sem associação à sessão correta.
- Trate `error` devolvido pelo provedor antes de tentar trocar o código.
- Para OAuth1, persista request token e secret em sessão temporária e confira que `oauth_token` no callback corresponde ao token salvo.
- Para PKCE, persista o verifier de forma temporária, vincule-o à sessão/state e envie o mesmo verifier na troca do código.

`verifyState` só compara os dois argumentos; não cria, guarda, expira, consome nem busca valores. `getState()` gera uma string; não a inclui no redirect automaticamente. Os hooks PKCE síncronos também não implementam armazenamento.

## Proteja segredos e tokens

- Leia client secrets de um gestor de segredos ou ambiente configurado com controles de acesso.
- Não envie client secret, access token, refresh token, request token/secret ou verifier ao navegador em respostas, HTML, logs ou telemetria.
- Use HTTPS para callback e para comunicação com o provedor em ambientes reais.
- Guarde tokens criptografados conforme o modelo de risco, limite acesso e remova tokens quando revogados/expirados.
- Nunca coloque valores reais em `.env.example`, documentação, snapshots ou exemplos.

## Valide entradas do callback

O consumidor deve validar o método, rota e parâmetros que recebe; rejeitar valores ausentes, repetidos ou inválidos; limitar o callback à sessão esperada; e tratar erros do provedor com respostas seguras. Só troque código depois de state validado e somente uma vez. O pacote não consulta APIs de perfil e não confirma a identidade final do usuário; essa etapa depende do provedor.

## Evite vazamentos em depuração

O `debuglog('oauth_client')` permite depuração via `NODE_DEBUG=oauth_client`. Como as mensagens podem incluir URLs ou opções de requisição/resposta, habilite somente em ambientes controlados e inspecione a versão antes de usá-la com credenciais reais. Nunca imprima objetos completos de erro ou resposta sem remover segredos.

## Configuração de cookies

O pacote não define cookie algum. Ao usar cookie como armazenamento, a aplicação deve selecionar `Secure`, `HttpOnly`, `SameSite`, escopo e expiração de acordo com o fluxo e origem; avaliar proteção de sessão e rotação; e não presumir que o exemplo Express forneça uma política pronta para produção.

## Tratamento de erros

- `E_OAUTH_STATE_MISMATCH`: state ausente/divergente segundo `verifyState`.
- `E_OAUTH_MISSING_TOKEN`: resposta do endpoint não contém os tokens obrigatórios reconhecidos.
- Erros de rede, status HTTP e parsing do transporte são gerados por `ky` ou pela conversão da resposta.

Mapeie erros para respostas que não revelem conteúdo de credenciais. Os exemplos no diretório `examples/` são didáticos; não substituem uma revisão de segurança da aplicação.
