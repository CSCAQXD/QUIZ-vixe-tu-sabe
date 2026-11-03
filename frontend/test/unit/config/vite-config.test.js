import { describe, expect, it } from 'vitest'

import viteConfig from '../../../vite.config'

describe('configuração local do Vite', () => {
  it('encaminha as chamadas de /api para o backend local', () => {
    const proxy = viteConfig.server.proxy['/api']

    expect(proxy.target).toBe('http://localhost:3001')
    expect(proxy.changeOrigin).toBe(true)
    expect(proxy.rewrite('/api/escolas/catalogo?municipioIbgeId=2311306')).toBe(
      '/escolas/catalogo?municipioIbgeId=2311306',
    )
  })
})
