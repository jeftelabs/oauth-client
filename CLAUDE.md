# Orientações para Claude e agentes de IA

As instruções canônicas estão em [AGENTS.md](./AGENTS.md). Antes de analisar ou alterar o projeto, leia também o índice e os documentos pertinentes em [docs/README.md](./docs/README.md).

Este repositório contém `@jeftelabs/oauth-client`, uma biblioteca Node.js/TypeScript independente de framework para OAuth 1.0a de três etapas e OAuth 2 Authorization Code. O pacote oferece clientes genéricos, assinatura OAuth1, suporte extensível a PKCE no OAuth2, utilitários HTTP/URL, tipos e erros. Não oferece integração pronta com framework, persistência de sessão, cookie ou token.

## Documentação obrigatória

É extremamente obrigatório criar ou atualizar documentação detalhada toda vez que algo novo for criado ou qualquer parte do projeto for modificada. Isso inclui código, API, tipos, testes, exemplos, dependências, configuração, scripts, build, CI, release e documentos. Atualize a documentação na mesma tarefa.

- Descreva comportamento real, fluxo, entradas, saídas, efeitos, erros, limites, segurança e manutenção para humanos e IAs.
- Organize o material em `docs/` por guias, referências, arquitetura, planejamento e ferramentas, de modo proporcional à mudança.
- Registre toda nova página em `docs/README.md` e preserve navegação por links relativos.
- Mantenha o README público alinhado com mudanças de instalação, exports, API, fluxos ou exemplos.
- Verifique toda afirmação em código, testes, manifesto e workflows. Não reaproveite conteúdo de outro projeto sem validação.

## Pontos que exigem cuidado

- A aplicação que integra o cliente deve criar e armazenar `state`/PKCE verifier, validar o callback e proteger tokens/segredos. Os métodos de state apenas geram ou comparam valores quando chamados.
- Os hooks PKCE são `getPkceCodeVerifierForRedirect`, `getPkceCodeVerifierForAccessToken`, `getPkceCodeChallenge` e `getPkceCodeChallengeMethod` em uma subclasse de `Oauth2Client`.
- Os callbacks dos métodos configuram parâmetros; hooks protegidos de classe configuram o padrão antes do callback do consumidor.
- Respostas OAuth1 são interpretadas como querystring por padrão; OAuth2 espera JSON no token endpoint, com possibilidade de configurar parsing.
- Alterações na API publicada precisam considerar `exports` e declarações TypeScript do build.
- Não registrar tokens ou secrets, nem introduzir credenciais reais.

Consulte `docs/references/api.md`, `docs/architecture/overview.md` e `docs/guides/` antes de alterar os fluxos. Consulte `docs/references/development.md` e `docs/planning/maintenance.md` para build, testes, workflows e documentação.
