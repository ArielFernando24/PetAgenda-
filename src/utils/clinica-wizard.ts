export function normalizarTexto(valor: unknown): string {
  return String(valor ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildClinicaPayloadFromWizard(dados: any) {
  const partesEndereco = [
    dados.logradouro,
    dados.numero,
    dados.bairro ? `Bairro ${dados.bairro}` : "",
  ].filter(Boolean);

  const endereco = partesEndereco.length > 0
    ? partesEndereco.join(', ').replace(/,\s*,/g, ',').replace(/,\s*Bairro/g, ' -')
    : "";

  const horarioFuncionamento = Object.entries(dados.horarios ?? {})
    .map(([dia, config]: [string, any]) => {
      const nomeDia = {
        segunda: 'Segunda',
        terca: 'Terça',
        quarta: 'Quarta',
        quinta: 'Quinta',
        sexta: 'Sexta',
        sabado: 'Sábado',
        domingo: 'Domingo',
      }[dia] || dia;

      if (!config || !config.ativo) {
        return `${nomeDia}: fechado`;
      }

      return `${nomeDia}: ${config.abertura} - ${config.fechamento}`;
    })
    .filter(Boolean)
    .join('; ');

  return {
    nome: dados.nome,
    telefone: dados.telefone || dados.whatsapp || '(00) 00000-0000',
    email: dados.email || null,
    endereco,
    cidade: dados.cidade,
    estado: dados.estado,
    servicos: Array.isArray(dados.servicos) ? dados.servicos : [],
    descricao: dados.descricao || null,
    horarioFuncionamento: horarioFuncionamento || null,
  };
}
