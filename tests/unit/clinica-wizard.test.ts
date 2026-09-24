import { buildClinicaPayloadFromWizard } from '../../src/utils/clinica-wizard';

describe('buildClinicaPayloadFromWizard', () => {
  it('transforma os dados do wizard em payload compatível com a API de clínicas', () => {
    const payload = buildClinicaPayloadFromWizard({
      nome: 'Pet Shop Bicho Feliz',
      tipo: 'Pet Shop + Banho e Tosa',
      telefone: '(11) 99999-9999',
      email: 'contato@petshop.com.br',
      descricao: 'Cuidados e banho para pets.',
      cep: '01000-000',
      logradouro: 'Avenida Paulista',
      numero: '1500',
      complemento: 'Loja 2',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      estado: 'SP',
      servicos: ['Banho', 'Tosa', 'Vacinação'],
      horarios: {
        segunda: { ativo: true, abertura: '08:00', fechamento: '18:00' },
        domingo: { ativo: false, abertura: '09:00', fechamento: '13:00' },
      },
    });

    expect(payload).toMatchObject({
      nome: 'Pet Shop Bicho Feliz',
      telefone: '(11) 99999-9999',
      email: 'contato@petshop.com.br',
      endereco: 'Avenida Paulista, 1500 - Bela Vista',
      cidade: 'São Paulo',
      estado: 'SP',
      servicos: ['Banho', 'Tosa', 'Vacinação'],
      descricao: 'Cuidados e banho para pets.',
    });

    expect(typeof payload.horarioFuncionamento).toBe('string');
    expect(payload.horarioFuncionamento).toContain('Segunda');
    expect(payload.horarioFuncionamento).toContain('Domingo');
  });
});
