import { describe, expect, it } from 'vitest'
import {
  CATEGORIA_CORES,
  DEFAULT_CATEGORIA_COR,
  getCategoriaCorConfig,
  isCategoriaCor,
} from './categoriaCor'

describe('categoriaCor', () => {
  it('valida cores conhecidas', () => {
    expect(isCategoriaCor('blue')).toBe(true)
    expect(isCategoriaCor('invalid')).toBe(false)
  })

  it('retorna config da cor ou default slate', () => {
    expect(getCategoriaCorConfig('emerald').badgeClass).toContain('emerald')
    expect(getCategoriaCorConfig().label).toBe(getCategoriaCorConfig(DEFAULT_CATEGORIA_COR).label)
  })

  it('expõe paleta completa', () => {
    expect(CATEGORIA_CORES).toHaveLength(8)
    expect(CATEGORIA_CORES[0]).toBe('slate')
  })
})
