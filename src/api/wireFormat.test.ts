import { describe, expect, it } from 'vitest'
import { mapObjectToFrontend, mapPatchToBackend } from './wireFormat'

describe('wireFormat', () => {
  it('converte campos snake_case da API para camelCase do frontend', () => {
    expect(
      mapObjectToFrontend({
        id: 'g1',
        ficha_id: 'f1',
        nome_personagem: 'Aria',
        pv_maximo: 20,
        pv_temporario: 0,
        fortitude_base: 1,
        fortitude_magico: 0,
        fortitude_outros: 0,
        corpo_a_corpo_outros: 2,
        pericia_de_classe: true,
        espacos_por_dia: 3,
      }),
    ).toEqual({
      id: 'g1',
      nomePersonagem: 'Aria',
      pvMax: 20,
      pvTemp: 0,
      fortBase: 1,
      fortMagico: 0,
      fortOutros: 0,
      corpoACorpoOutros: 2,
      periciaDeClasse: true,
      espacosPorDia: 3,
    })
  })

  it('converte campos camelCase do frontend para snake_case da API', () => {
    expect(
      mapPatchToBackend({
        nomePersonagem: 'Aria',
        pvMax: 20,
        pvTemp: 0,
        fortBase: 1,
        fortMagico: 0,
        fortOutros: 0,
        corpoACorpoOutros: 2,
        periciaDeClasse: true,
        espacosPorDia: 3,
      }),
    ).toEqual({
      nome_personagem: 'Aria',
      pv_maximo: 20,
      pv_temporario: 0,
      fortitude_base: 1,
      fortitude_magico: 0,
      fortitude_outros: 0,
      corpo_a_corpo_outros: 2,
      pericia_de_classe: true,
      espacos_por_dia: 3,
    })
  })
})
