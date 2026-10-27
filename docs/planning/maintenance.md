# Planejamento de manutenção

Este documento registra áreas que merecem atenção quando a biblioteca evolui. Não é um compromisso de roadmap nem afirma que itens abaixo já estão implementados.

## Regras contínuas

1. Leia `AGENTS.md`, `CLAUDE.md` e [índice docs](../README.md) antes de mudanças.
2. Mantenha comportamento descrito, exemplos e testes alinhados ao código; documentação detalhada é obrigatória na mesma tarefa que qualquer alteração.
3. Atualize `docs/README.md` sempre que criar uma página.
4. Para mudanças de API, revise `package.json#exports`, tipos gerados, README e exemplos.
5. Para fluxo OAuth, descreva armazenamento e responsabilidade externa do integrador e confira efeitos sobre state, sessão, secrets e callback.
6. Use Conventional Commits; valide pelo hook do repositório.

## Áreas sensíveis à compatibilidade

- Exports públicos e versões Node/TypeScript (`package.json`, `tsconfig.json`, entries `tsdown`).
- Nomes/forma do objeto de token, campos padrão e ordem de callbacks/hook.
- Canonicalização e assinatura OAuth1, que precisa acompanhar casos de teste e especificação.
- Nomes e status dos erros específicos do pacote.
- Parsing de resposta por provedor, que influencia normalização e mensagens de erro.
- Métodos síncronos de PKCE: não podem aguardar storage sem alteração deliberada do contrato.

## Critérios para mudança de protocolo

Antes de expandir suporte, identifique grant/specificação e requisitos de servidor; determine o que pertence ao núcleo genérico e o que cabe a uma subclasse; documente efeitos em segurança; mantenha compatibilidade dos exports; e inclua casos de teste determinísticos com servidor HTTP simulado. Não alegue suporte por semelhança com OAuth se o fluxo não estiver implementado.

## Futuras decisões a avaliar

- Melhorar o modelo de hooks/parsing de resposta sem quebrar provedores que usam querystring.
- Revisar logs de depuração para reduzir risco de exposição de URLs, headers, campos e respostas.
- Considerar se o tipo público deve permitir `clientSecret` ausente em cenários PKCE-only (o tipo atual requer secret e o OAuth2 envia-o por padrão).
- Avaliar cobertura automatizada de build, typecheck e lint no workflow; o workflow de checks atual lista commitlint.
- Revisar dependências Node `ky`, TypeScript e a engine declarada em atualizações de release.

Itens futuros só devem virar escopo após decisão explícita; este documento serve de contexto e checklist para mantenedores.
