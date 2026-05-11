# vendor/

Pacotes locais que **não estão disponíveis em registry público** e precisam
ser distribuídos junto com o repositório para que `bun install` funcione
em qualquer máquina sem configuração manual.

## Conteúdo

### `lojascem-components-react-3.3.1.tgz`

Biblioteca de componentes React da Lojas CEM (`@lojascem/components-react@3.3.1`).

- **Origem:** registry privado interno (`https://gitea.lojascem.local:53000/api/packages/lojascem/npm`)
- **Como foi gerado:** empacotado a partir de uma instalação prévia em
  `apps/web/node_modules/@lojascem/components-react/` (excluindo `node_modules`
  internos do pacote, que são resolvidos pelo monorepo na instalação)
- **Como é consumido:** o `apps/web/package.json` referencia este tarball via
  `"@lojascem/components-react": "file:../../vendor/lojascem-components-react-3.3.1.tgz"`

### Atualizar a versão da lib

Quando uma nova versão da lib estiver disponível:

1. Instale a versão nova manualmente no `apps/web/node_modules/@lojascem/components-react/`
2. Re-empacote:
   ```bash
   mkdir -p /tmp/pack/package
   cp -a apps/web/node_modules/@lojascem/components-react/. /tmp/pack/package/
   rm -rf /tmp/pack/package/node_modules
   cd /tmp/pack && tar -czf <projeto>/vendor/lojascem-components-react-<versao>.tgz package/
   ```
3. Atualize o `apps/web/package.json` apontando para o novo arquivo
4. Atualize este README com a nova versão
5. `bun install`

### Por que não publicamos no registry público

A lib é privada e não está sob domínio público. Como o registry interno
(`gitea.lojascem.local`) não é acessível fora da rede da Lojas CEM, vendorar
o tarball é a única forma de garantir builds reprodutíveis em qualquer ambiente.
