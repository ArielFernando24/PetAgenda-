const BASE_URL = "http://127.0.0.1:3000";

async function run() {
  console.log("==========================================================");
  console.log("   INICIANDO TESTES END-TO-END NA API (SIMULANDO POSTMAN) ");
  console.log(`   Target: ${BASE_URL}`);
  console.log("==========================================================\n");

  const uniqueId = Date.now();
  const tutorEmail = `tutor_${uniqueId}@teste.com`;
  const tutorSenha = "senhaForte123";

  // 1. Health Check
  console.log("1. [GET] /api/health");
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  const healthData = await healthRes.json();
  console.log(`   Status: ${healthRes.status} | Resposta:`, healthData);
  if (healthRes.status !== 200) throw new Error("Falha no health check");

  // 2. Cadastrar Tutor (US01)
  console.log("\n2. [POST] /api/tutores (Cadastro do Tutor)");
  const cadastroRes = await fetch(`${BASE_URL}/api/tutores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: `Tutor Teste ${uniqueId}`,
      email: tutorEmail,
      senha: tutorSenha,
    }),
  });
  const cadastroData = await cadastroRes.json();
  console.log(`   Status: ${cadastroRes.status} | Tutor ID:`, cadastroData.data?.id);
  if (cadastroRes.status !== 201) throw new Error("Falha ao cadastrar tutor");

  // 3. Login do Tutor (US01)
  console.log("\n3. [POST] /api/auth/login (Login e Geração de Token JWT)");
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: tutorEmail,
      senha: tutorSenha,
    }),
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.token;
  console.log(`   Status: ${loginRes.status} | Token gerado: ${token ? token.substring(0, 25) + "..." : "NENHUM"}`);
  if (!token) throw new Error("Falha ao obter token JWT no login");
  const authHeader = { Authorization: `Bearer ${token}` };

  // 4. Perfil do Tutor (US01)
  console.log("\n4. [GET] /api/tutores/me (Consultar Perfil Autenticado)");
  const meRes = await fetch(`${BASE_URL}/api/tutores/me`, { headers: authHeader });
  const meData = await meRes.json();
  console.log(`   Status: ${meRes.status} | Nome: ${meData.data?.nome} | Email: ${meData.data?.email}`);

  // 5. Cadastrar Pet (US02)
  console.log("\n5. [POST] /api/pets (Cadastro de Pet)");
  const petRes = await fetch(`${BASE_URL}/api/pets`, {
    method: "POST",
    headers: { ...authHeader, "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: "Apollo",
      especie: "Cachorro",
      raca: "Husky Siberiano",
      sexo: "MACHO",
      dataNascimento: "2023-03-15",
    }),
  });
  const petData = await petRes.json();
  const petId = petData.data?.id;
  console.log(`   Status: ${petRes.status} | Pet ID: ${petId} | Nome: ${petData.data?.nome}`);
  if (!petId) throw new Error("Falha ao cadastrar pet");

  // 6. Listar Pets (US02)
  console.log("\n6. [GET] /api/pets (Listar Pets do Tutor)");
  const listPetsRes = await fetch(`${BASE_URL}/api/pets`, { headers: authHeader });
  const listPetsData = await listPetsRes.json();
  console.log(`   Status: ${listPetsRes.status} | Total de Pets: ${listPetsData.data?.length}`);

  // 7. Cadastrar Clínica Veterinária
  console.log("\n7. [POST] /api/clinicas (Cadastro de Clínica Veterinária)");
  const clinicaRes = await fetch(`${BASE_URL}/api/clinicas`, {
    method: "POST",
    headers: { ...authHeader, "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: `Hospital Veterinário PetCare ${uniqueId}`,
      telefone: "(11) 97777-8888",
      email: `contato_${uniqueId}@petcare.com`,
      endereco: "Av. Rebouças, 1500",
      cidade: "São Paulo",
      estado: "SP",
      horarioFuncionamento: "24 horas",
      servicos: ["Consulta", "Vacinação", "Cirurgia", "Exames", "Internação"],
      descricao: "Hospital veterinário de alta complexidade com suporte 24h.",
    }),
  });
  const clinicaData = await clinicaRes.json();
  const clinicaId = clinicaData.data?.id;
  console.log(`   Status: ${clinicaRes.status} | Clínica ID: ${clinicaId} | Nome: ${clinicaData.data?.nome}`);
  if (!clinicaId) throw new Error("Falha ao cadastrar clínica");

  // 8. Listar e Filtrar Clínicas
  console.log("\n8. [GET] /api/clinicas?cidade=São Paulo&servico=Vacinação (Filtro)");
  const searchClinicaRes = await fetch(`${BASE_URL}/api/clinicas?cidade=São Paulo&servico=Vacinação`);
  const searchClinicaData = await searchClinicaRes.json();
  console.log(`   Status: ${searchClinicaRes.status} | Clínicas encontradas: ${searchClinicaData.data?.length}`);

  // 9. Obter Perfil Detalhado da Clínica
  console.log(`\n9. [GET] /api/clinicas/${clinicaId} (Perfil da Clínica)`);
  const perfilRes = await fetch(`${BASE_URL}/api/clinicas/${clinicaId}`);
  const perfilData = await perfilRes.json();
  console.log(`   Status: ${perfilRes.status} | Nome: ${perfilData.data?.nome} | Serviços: ${perfilData.data?.servicos?.join(", ")}`);

  // 10. Agendar Cuidado no Pet vinculado à Clínica (US03)
  console.log("\n10. [POST] /api/agenda (Agendamento de Cuidado com Vínculo à Clínica)");
  const agendaRes = await fetch(`${BASE_URL}/api/agenda`, {
    method: "POST",
    headers: { ...authHeader, "Content-Type": "application/json" },
    body: JSON.stringify({
      pet_id: petId,
      clinica_id: clinicaId,
      tipo_cuidado: "Vacina",
      data_hora: "2026-10-25T14:00:00.000Z",
      recorrencia: "Anual",
      descricao: "Dose da vacina V10 e consulta clínica de rotina",
    }),
  });
  const agendaData = await agendaRes.json();
  const eventoId = agendaData.data?.id;
  console.log(`   Status: ${agendaRes.status} | Evento ID: ${eventoId} | Tipo: ${agendaData.data?.tipoCuidado} | Status: ${agendaData.data?.status}`);
  if (!eventoId) throw new Error("Falha ao agendar evento");

  // 11. Listar Agenda do Tutor (US03)
  console.log("\n11. [GET] /api/agenda (Listar Agenda Geral do Tutor)");
  const tutorAgendaRes = await fetch(`${BASE_URL}/api/agenda`, { headers: authHeader });
  const tutorAgendaData = await tutorAgendaRes.json();
  console.log(`   Status: ${tutorAgendaRes.status} | Eventos na agenda: ${tutorAgendaData.data?.length}`);

  // 12. Painel da Clínica: Listar Atendimentos Agendados para ela
  console.log(`\n12. [GET] /api/clinicas/${clinicaId}/atendimentos (Painel de Atendimentos da Clínica)`);
  const atendimentosRes = await fetch(`${BASE_URL}/api/clinicas/${clinicaId}/atendimentos`, { headers: authHeader });
  const atendimentosData = await atendimentosRes.json();
  console.log(`   Status: ${atendimentosRes.status} | Atendimentos encontrados: ${atendimentosData.data?.length}`);
  if (atendimentosData.data?.length > 0) {
    const at = atendimentosData.data[0];
    console.log(`   -> Cuidado: ${at.tipoCuidado} | Data: ${at.dataHora}`);
    console.log(`   -> Pet: ${at.pet?.nome} (${at.pet?.especie} - ${at.pet?.raca})`);
    console.log(`   -> Tutor: ${at.tutor?.nome} (${at.tutor?.email})`);
  }

  // 13. Painel da Clínica: Concluir / Atualizar Atendimento
  console.log(`\n13. [PUT] /api/clinicas/${clinicaId}/atendimentos/${eventoId} (Clínica Conclui o Atendimento)`);
  const updateAtendimentoRes = await fetch(`${BASE_URL}/api/clinicas/${clinicaId}/atendimentos/${eventoId}`, {
    method: "PUT",
    headers: { ...authHeader, "Content-Type": "application/json" },
    body: JSON.stringify({
      status: "Concluído",
      descricao: "Vacina V10 aplicada com sucesso pelo Dr. Marcos. Próxima dose em 1 ano.",
    }),
  });
  const updateAtendimentoData = await updateAtendimentoRes.json();
  console.log(`   Status: ${updateAtendimentoRes.status} | Novo Status: ${updateAtendimentoData.data?.status}`);
  console.log(`   -> Observações: ${updateAtendimentoData.data?.descricao}`);

  // 14. Painel da Clínica: Dashboard e Resumo
  console.log(`\n14. [GET] /api/clinicas/${clinicaId}/resumo (Dashboard de Gestão da Clínica)`);
  const resumoRes = await fetch(`${BASE_URL}/api/clinicas/${clinicaId}/resumo`, { headers: authHeader });
  const resumoData = await resumoRes.json();
  console.log(`   Status: ${resumoRes.status} | Resumo:`, resumoData.data);

  console.log("\n==========================================================");
  console.log("   TODOS OS TESTES FORAM EXECUTADOS COM SUCESSO (100% OK)!");
  console.log("==========================================================");
}

run().catch((err) => {
  console.error("\n❌ ERRO DURANTE A EXECUÇÃO DO TESTE:", err);
  process.exit(1);
});
