import { useState } from "react";

function ModalExportacaoADM({
  aberto,
  onFechar,
  dados,
}) {
  const [formato, setFormato] = useState("CSV");

  const [colunas, setColunas] = useState({
    data: true,
    usuario: true,
    servico: true,
    estabelecimento: true,
    status: true,
    valor: true,
  });

  const [exportando, setExportando] = useState(false);
  const [progresso, setProgresso] = useState(0);

  if (!aberto) {
    return null;
  }

  const colunasDisponiveis = [
    {
      chave: "data",
      label: "Data",
    },
    {
      chave: "usuario",
      label: "Usuário",
    },
    {
      chave: "servico",
      label: "Serviço",
    },
    {
      chave: "estabelecimento",
      label: "Estabelecimento",
    },
    {
      chave: "status",
      label: "Status",
    },
    {
      chave: "valor",
      label: "Valor",
    },
  ];

  function alternarColuna(chave) {
    setColunas((estadoAtual) => ({
      ...estadoAtual,
      [chave]: !estadoAtual[chave],
    }));
  }

  function selecionarTodas() {
    setColunas({
      data: true,
      usuario: true,
      servico: true,
      estabelecimento: true,
      status: true,
      valor: true,
    });
  }

  function gerarCSV() {
    const colunasSelecionadas = colunasDisponiveis.filter(
      (coluna) => colunas[coluna.chave]
    );

    const cabecalho = colunasSelecionadas
      .map((coluna) => `"${coluna.label}"`)
      .join(";");

    const linhas = dados.map((item) =>
      colunasSelecionadas
        .map((coluna) => {
          const valor = item[coluna.chave] ?? "";

          return `"${String(valor).replace(/"/g, '""')}"`;
        })
        .join(";")
    );

    const conteudo = [cabecalho, ...linhas].join("\n");

    const blob = new Blob(
      ["\uFEFF" + conteudo],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "relatorio-petagenda.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  function iniciarExportacao() {
    const algumaColunaSelecionada = Object.values(
      colunas
    ).some(Boolean);

    if (!algumaColunaSelecionada) {
      alert("Selecione pelo menos uma coluna.");
      return;
    }

    if (dados.length === 0) {
      alert("Não existem registros para exportar.");
      return;
    }

    setExportando(true);
    setProgresso(0);

    let valor = 0;

    const intervalo = setInterval(() => {
      valor += 20;

      setProgresso(valor);

      if (valor >= 100) {
        clearInterval(intervalo);

        if (formato === "CSV") {
          gerarCSV();
        }

        if (formato === "PDF") {
          alert(
            "A exportação em PDF será adicionada na próxima etapa."
          );
        }

        setTimeout(() => {
          setExportando(false);
          setProgresso(0);
          onFechar();
        }, 600);
      }
    }, 200);
  }

  const quantidadeColunasSelecionadas =
    Object.values(colunas).filter(Boolean).length;

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-exportacao">

        {/* CABEÇALHO */}
        <div className="admin-modal-cabecalho">
          <div>
            <span className="admin-modal-breadcrumb">
              Exportação
            </span>

            <h2>Exportar relatório</h2>

            <p>
              Escolha o formato e as informações que deseja exportar.
            </p>
          </div>

          <button
            type="button"
            className="admin-modal-fechar"
            onClick={onFechar}
            disabled={exportando}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        {!exportando ? (
          <>
            {/* FORMATO */}
            <div className="admin-modal-secao">
              <h3>Formato do arquivo</h3>

              <div className="admin-formatos">

                <button
                  type="button"
                  className={
                    formato === "CSV"
                      ? "admin-formato ativo"
                      : "admin-formato"
                  }
                  onClick={() => setFormato("CSV")}
                >
                  <strong>CSV</strong>

                  <span>
                    Ideal para Excel e planilhas
                  </span>
                </button>

                <button
                  type="button"
                  className={
                    formato === "PDF"
                      ? "admin-formato ativo"
                      : "admin-formato"
                  }
                  onClick={() => setFormato("PDF")}
                >
                  <strong>PDF</strong>

                  <span>
                    Ideal para visualização e impressão
                  </span>
                </button>

              </div>
            </div>

            {/* COLUNAS */}
            <div className="admin-modal-secao">

              <div className="admin-modal-secao-titulo">

                <div>
                  <h3>Colunas do relatório</h3>

                  <span>
                    Selecione as informações desejadas.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={selecionarTodas}
                >
                  Selecionar todas
                </button>

              </div>

              <div className="admin-colunas-exportacao">

                {colunasDisponiveis.map((coluna) => (
                  <label
                    key={coluna.chave}
                    className="admin-coluna-item"
                  >
                    <input
                      type="checkbox"
                      checked={colunas[coluna.chave]}
                      onChange={() =>
                        alternarColuna(coluna.chave)
                      }
                    />

                    <span>{coluna.label}</span>
                  </label>
                ))}

              </div>
            </div>

            {/* RESUMO */}
            <div className="admin-modal-info">
              <strong>{dados.length}</strong>

              <span>
                registro(s) serão exportados com{" "}
                {quantidadeColunasSelecionadas} coluna(s).
              </span>
            </div>

            {/* RODAPÉ */}
            <div className="admin-modal-acoes">

              <button
                type="button"
                className="admin-modal-btn-cancelar"
                onClick={onFechar}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="admin-modal-btn-exportar"
                onClick={iniciarExportacao}
              >
                Confirmar exportação
              </button>

            </div>
          </>
        ) : (
          /* PROGRESSO */
          <div className="admin-exportando">

            <div className="admin-exportando-icone">
              ↓
            </div>

            <h3>Preparando arquivo...</h3>

            <p>
              Seu relatório está sendo preparado.
            </p>

            <div className="admin-progresso">
              <div
                className="admin-progresso-barra"
                style={{
                  width: `${progresso}%`,
                }}
              />
            </div>

            <strong>
              {progresso}%
            </strong>

          </div>
        )}

      </div>
    </div>
  );
}

export default ModalExportacaoADM;