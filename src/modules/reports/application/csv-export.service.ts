import { Readable } from 'node:stream';

export interface CsvEventRow {
  id: string;
  dataHora: string;
  petNome: string;
  petEspecie?: string;
  tipoCuidado: string;
  status: string;
  recorrencia?: string;
  descricao?: string | null;
  clinicaNome?: string | null;
  createdAt?: string;
}

export interface CsvExportOptions {
  columns?: string[];
  delimiter?: string;
}

export class CsvExportService {
  private readonly defaultColumns: Record<string, string> = {
    dataHora: 'Data e Hora',
    petNome: 'Nome do Pet',
    petEspecie: 'Espécie',
    tipoCuidado: 'Tipo de Cuidado',
    status: 'Status',
    recorrencia: 'Recorrência',
    descricao: 'Descrição',
    clinicaNome: 'Clínica',
  };

  /**
   * Cria uma Readable stream que emite o CSV em chunks com UTF-8 BOM.
   * Evita carregar todos os dados na memória de uma só vez (Streaming).
   */
  public createCsvStream(rows: CsvEventRow[], options: CsvExportOptions = {}): Readable {
    const delimiter = options.delimiter || ',';
    const selectedColumns = options.columns && options.columns.length > 0
      ? options.columns.filter((col) => this.defaultColumns[col])
      : Object.keys(this.defaultColumns);

    const headers = selectedColumns.map((col) => this.defaultColumns[col] || col);

    // Gera o stream
    let index = 0;
    const chunkSize = 100; // chunks de 100 linhas por vez para otimização de I/O
    let bomSent = false;

    const stream = new Readable({
      read() {
        // Envia o BOM UTF-8 (\uFEFF) e o cabeçalho na primeira leitura
        if (!bomSent) {
          const bom = '\uFEFF';
          const headerLine = headers.map((h) => CsvExportService.escapeField(h, delimiter)).join(delimiter) + '\r\n';
          this.push(Buffer.from(bom + headerLine, 'utf8'));
          bomSent = true;
          return;
        }

        if (index >= rows.length) {
          this.push(null); // Fim da stream
          return;
        }

        // Processa o próximo chunk
        const nextBatch = rows.slice(index, index + chunkSize);
        index += nextBatch.length;

        const lines = nextBatch.map((row) => {
          return selectedColumns.map((col) => {
            const val = (row as any)[col] ?? '';
            return CsvExportService.escapeField(String(val), delimiter);
          }).join(delimiter);
        }).join('\r\n') + '\r\n';

        this.push(Buffer.from(lines, 'utf8'));
      },
    });

    return stream;
  }

  /**
   * Trata e escapa campos para conformidade com a RFC 4180:
   * - Campos contendo delimitador, quebras de linha ou aspas são envolvidos por aspas duplas.
   * - Aspas duplas internas são duplicadas ("").
   */
  public static escapeField(field: string, delimiter: string = ','): string {
    if (field === null || field === undefined) {
      return '';
    }

    const stringField = String(field);
    const needsQuotes =
      stringField.includes(delimiter) ||
      stringField.includes('"') ||
      stringField.includes('\n') ||
      stringField.includes('\r');

    if (needsQuotes) {
      // Duplica as aspas internas: " -> ""
      const escaped = stringField.replace(/"/g, '""');
      return `"${escaped}"`;
    }

    return stringField;
  }
}

export const csvExportService = new CsvExportService();
