# Orientações para Claude e agentes de IA

As instruções canônicas estão em [AGENTS.md](./AGENTS.md). Comece pelo índice [docs/README.md](./docs/README.md). Este repositório contém `@jeftelabs/file-generator`, utilitário Node.js/TypeScript para criar buffers fictícios de arquivos em memória para testes.

## Documentação obrigatória

É extremamente obrigatório criar ou atualizar documentação detalhada toda vez que algo novo for criado ou qualquer parte do projeto for modificada. Isso inclui código, API, tipos, testes, arquivos-modelo, configuração, dependências, scripts, build, CI, exemplos e documentos. Atualize na mesma tarefa.

- Explique comportamento, fluxo, entradas, saídas, efeitos, limites e manutenção para humanos e IAs.
- Organize páginas em `docs/` como guias, referências, arquitetura e planejamento.
- Registre cada página nova no índice `docs/README.md`.
- Atualize o README para mudanças de instalação, formatos, API, compatibilidade ou exemplos.
- Valide detalhes na implementação e nos testes; documente limites reais dos arquivos gerados.

## Mapa do projeto

- `index.ts`: exporta as funções públicas `generateCsv`, `generateDocx`, `generateGif`, `generateJpg`, `generatePdf`, `generatePng` e `generateXlsx`.
- `src/files/<formato>/generate.ts`: monta metadados, carrega a fixture quando aplicável e cria o buffer.
- `src/files/<formato>/fake.*`: bytes iniciais de referência usados na geração e copiados ao build.
- `src/files/utils.ts`: converte expressões de bytes e preenche/alarga o buffer.
- `tests/`: verifica tamanhos, MIME, nomes personalizados e reconhecimento dos formatos binários.
- `package.json`: configura build e os scripts; `copy:files` leva fixtures ao diretório publicado.

Leia a documentação relevante antes de alterar. Não confunda assinatura reconhecível com documento íntegro. Os buffers são dados de teste; documentos e imagens maiores que as fixtures não são conteúdo completo nem são gravados em disco.
