# Instruções para agentes — @jeftelabs/file-generator

Leia este arquivo antes de alterar o projeto. A implementação, os testes, `package.json`, as configurações e a documentação são fontes de verdade.

## Escopo

`@jeftelabs/file-generator` gera buffers em memória para arquivos fictícios de sete formatos: CSV, DOCX, GIF, JPG/JPEG, PDF, PNG e XLSX. O consumidor escolhe o tamanho em bytes ou como texto legível (por exemplo, `1mb`), pode fornecer um nome e recebe um objeto `{ contents, size, name, mime }`. É voltado principalmente a testes de upload e validação inicial de tipo. Ele não grava os arquivos gerados no disco.

Os arquivos binários DOCX, GIF, JPG, PDF, PNG e XLSX usam arquivos-modelo `fake.*` empacotados e os repetem/preenchem para chegar ao tamanho solicitado. O CSV começa com bytes de exemplo. Arquivos maiores que o modelo não são documentos/imagens completos e não devem ser considerados válidos para leitura, edição, renderização ou processamento de conteúdo. Tamanhos menores que os bytes iniciais resultam no tamanho mínimo do modelo.

## Documentação obrigatória

É obrigatório criar ou atualizar documentação detalhada sempre que algo novo for criado ou qualquer parte do projeto for modificada: código, API, tipos, testes, fixtures, configuração, dependências, scripts, build, CI, exemplos e documentação. Conclua a atualização na mesma tarefa.

- Explique propósito, fluxo, entradas, saídas, efeitos, limites e manutenção para humanos e agentes de IA.
- Organize documentos em `docs/` e registre cada página em `docs/README.md`.
- Mantenha guias, referências, arquitetura, planejamento e ferramentas proporcionais ao escopo.
- Atualize o README se instalação, formatos, API pública, compatibilidade ou exemplos mudarem.
- Confira afirmações e exemplos no código e nos testes.

## Antes de alterar

1. Leia `docs/README.md` e as páginas pertinentes.
2. Inspecione `index.ts`, `src/files/`, fixtures, testes, `package.json`, `tsconfig.json` e workflows relevantes.
3. Preserve os nomes e o contrato dos sete métodos públicos e o formato retornado.
4. Considere o limite dos modelos, leitura das fixtures no runtime, cópia das fixtures no build e validação de tipo.
5. Não afirme que os arquivos gerados são completos nem que o pacote persiste arquivos em disco.

## Comandos

Confirme os scripts reais em `package.json`. Os principais são `npm test` (inclui lint pelo lifecycle `pretest`), `npm run quick:test`, `npm run lint`, `npm run typecheck` e `npm run build`. Build também copia as fixtures para `build/`.

## Convenções

- Mantenha ESM, export default e imports `.ts` compatíveis com `@jeftelabs/exec`.
- Não edite `build/`, `coverage/` ou `node_modules/` como fontes.
- Use Conventional Commits quando criar commits.
- Preserve alterações preexistentes e nunca inclua credenciais.
