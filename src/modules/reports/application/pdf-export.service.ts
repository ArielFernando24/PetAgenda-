import PDFDocument from 'pdfkit';
import { Readable } from 'node:stream';
import { CsvEventRow } from './csv-export.service';

export interface PdfReportMetadata {
  tutorNome: string;
  dataEmissao?: string;
  filtros?: {
    q?: string;
    tipoCuidado?: string;
    status?: string;
    periodo?: string;
    petNome?: string;
  };
}

export class PdfExportService {
  /**
   * Gera o relatório em PDF estruturado e retorna a Readable stream.
   */
  public createPdfStream(rows: CsvEventRow[], metadata: PdfReportMetadata): Readable {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 40,
      bufferPages: true, // Necessário para paginação no rodapé "Página X de Y"
    });

    const dataEmissao = metadata.dataEmissao || new Date().toLocaleString('pt-BR');

    // Cabeçalho institucional PetAgenda
    doc
      .fillColor('#2563EB')
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('PetAgenda', { continued: true })
      .fillColor('#64748B')
      .fontSize(14)
      .font('Helvetica')
      .text(' — Relatório de Cuidados e Auditoria');

    doc.moveDown(0.3);
    doc
      .strokeColor('#E2E8F0')
      .lineWidth(1)
      .moveTo(40, doc.y)
      .lineTo(555, doc.y)
      .stroke();

    doc.moveDown(0.5);

    // Bloco de Metadados e Sumário
    doc.fillColor('#1E293B').fontSize(10).font('Helvetica-Bold').text('Informações do Relatório:');
    doc.font('Helvetica').fontSize(9).fillColor('#475569');
    doc.text(`Solicitante: ${metadata.tutorNome}`);
    doc.text(`Data de Emissão: ${dataEmissao}`);
    doc.text(`Total de Registros: ${rows.length}`);

    if (metadata.filtros) {
      const activeFilters: string[] = [];
      if (metadata.filtros.tipoCuidado) activeFilters.push(`Categoria: ${metadata.filtros.tipoCuidado}`);
      if (metadata.filtros.status) activeFilters.push(`Status: ${metadata.filtros.status}`);
      if (metadata.filtros.periodo) activeFilters.push(`Período: ${metadata.filtros.periodo}`);
      if (metadata.filtros.petNome) activeFilters.push(`Pet: ${metadata.filtros.petNome}`);
      if (metadata.filtros.q) activeFilters.push(`Busca: "${metadata.filtros.q}"`);

      if (activeFilters.length > 0) {
        doc.text(`Filtros Aplicados: ${activeFilters.join(' | ')}`);
      }
    }

    doc.moveDown(0.8);

    // Tabela de Dados Sumarizada
    const tableTop = doc.y;
    const colX = {
      data: 40,
      pet: 130,
      cuidado: 220,
      status: 310,
      descricao: 390,
    };

    // Cabeçalho da Tabela
    doc
      .rect(40, tableTop, 515, 20)
      .fill('#F1F5F9');

    doc
      .fillColor('#0F172A')
      .fontSize(9)
      .font('Helvetica-Bold');

    doc.text('Data / Hora', colX.data + 5, tableTop + 5, { width: 85 });
    doc.text('Pet', colX.pet, tableTop + 5, { width: 85 });
    doc.text('Cuidado', colX.cuidado, tableTop + 5, { width: 85 });
    doc.text('Status', colX.status, tableTop + 5, { width: 75 });
    doc.text('Descrição / Clínica', colX.descricao, tableTop + 5, { width: 160 });

    let currentY = tableTop + 24;

    if (rows.length === 0) {
      doc
        .font('Helvetica-Oblique')
        .fontSize(9)
        .fillColor('#94A3B8')
        .text('Nenhum registro encontrado para os filtros selecionados.', 40, currentY + 10, {
          align: 'center',
          width: 515,
        });
    } else {
      // Linhas da Tabela
      rows.forEach((row, idx) => {
        // Quebra automática de página se necessário
        if (currentY > 750) {
          doc.addPage();
          currentY = 40;
        }

        // Zebrado de fundo
        if (idx % 2 === 1) {
          doc.rect(40, currentY - 2, 515, 18).fill('#F8FAFC');
        }

        doc.font('Helvetica').fontSize(8).fillColor('#334155');

        const formattedDate = row.dataHora ? new Date(row.dataHora).toLocaleString('pt-BR') : '-';
        doc.text(formattedDate, colX.data + 5, currentY, { width: 85, lineBreak: false });
        doc.text(row.petNome || '-', colX.pet, currentY, { width: 85, lineBreak: false });
        doc.text(row.tipoCuidado || '-', colX.cuidado, currentY, { width: 85, lineBreak: false });

        // Cor condicional de status
        if (row.status === 'CONCLUIDO') {
          doc.fillColor('#16A34A');
        } else if (row.status === 'PENDENTE') {
          doc.fillColor('#D97706');
        } else if (row.status === 'CANCELADO') {
          doc.fillColor('#DC2626');
        }
        doc.text(row.status || '-', colX.status, currentY, { width: 75, lineBreak: false });

        doc.fillColor('#334155');
        const descClinica = [row.descricao, row.clinicaNome ? `(${row.clinicaNome})` : '']
          .filter(Boolean)
          .join(' ') || '-';
        doc.text(descClinica, colX.descricao, currentY, { width: 160, lineBreak: false });

        currentY += 18;
      });
    }

    // Rodapé em todas as páginas com numeração dinâmica (Página X de Y)
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);

      // Linha separadora do rodapé
      doc
        .strokeColor('#E2E8F0')
        .lineWidth(0.5)
        .moveTo(40, 780)
        .lineTo(555, 780)
        .stroke();

      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#94A3B8')
        .text('PetAgenda — Sistema de Gestão e Cuidados Pet (Documento de Auditoria)', 40, 788, {
          align: 'left',
          width: 350,
        });

      doc.text(`Página ${i + 1} de ${range.count}`, 400, 788, {
        align: 'right',
        width: 155,
      });
    }

    doc.end();
    return doc;
  }
}

export const pdfExportService = new PdfExportService();
