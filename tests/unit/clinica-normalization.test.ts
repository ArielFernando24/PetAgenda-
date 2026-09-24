import { normalizarTexto } from '../../src/utils/clinica-wizard';

describe('normalizarTexto', () => {
  it('remove acentos e caracteres especiais de nomes de estabelecimentos', () => {
    expect(normalizarTexto('Clínica Veterinária São João & Cia')).toBe('clinica veterinaria sao joao cia');
    expect(normalizarTexto('Pet Shop Café')).toBe('pet shop cafe');
    expect(normalizarTexto('Ação e Coração')).toBe('acao e coracao');
  });
});
