export interface Clinica {
  id: string;
  nome: string;
  telefone: string;
  email: string | null;
  endereco: string;
  cidade: string;
  estado: string;
  horarioFuncionamento: string | null;
  servicos: string[];
  descricao: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClinicaData {
  nome: string;
  telefone: string;
  email?: string | null;
  endereco: string;
  cidade: string;
  estado: string;
  horarioFuncionamento?: string | null;
  servicos?: string[];
  descricao?: string | null;
}

export interface UpdateClinicaData {
  nome?: string;
  telefone?: string;
  email?: string | null;
  endereco?: string;
  cidade?: string;
  estado?: string;
  horarioFuncionamento?: string | null;
  servicos?: string[];
  descricao?: string | null;
}

export interface ListClinicasFilter {
  busca?: string;
  cidade?: string;
  estado?: string;
  servico?: string;
}

export interface AtendimentoClinica {
  id: string;
  clinicaId: string;
  tipoCuidado: string;
  dataHora: string;
  status: string;
  recorrencia: string;
  descricao: string | null;
  pet: {
    id: string;
    nome: string;
    especie: string;
    raca: string | null;
  };
  tutor: {
    id: string;
    nome: string;
    email: string;
  };
}

export interface ListAtendimentosFilter {
  status?: string;
  dataInicio?: string;
  dataFim?: string;
}

export interface UpdateAtendimentoData {
  status?: string;
  descricao?: string | null;
}

export interface ResumoGestaoClinica {
  totalAtendimentos: number;
  pendentes: number;
  concluidos: number;
  cancelados: number;
  proximosAtendimentos: AtendimentoClinica[];
}

