import { useState } from 'react';
import Papa from 'papaparse';
import api from '@/lib/api';

interface ImportClientsModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function ImportClientsModal({ onClose, onSuccess }: ImportClientsModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Por favor, selecione um arquivo CSV.');
      return;
    }

    setLoading(true);
    setError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const headerMap: Record<string, string> = {
            'Nome Fantasia': 'tradeName',
            'Razão Social': 'legalName',
            'Segmento': 'segment',
            'Status': 'status',
            'Data de Entrada': 'entryDate',
            'ID do Gestor': 'managerId',
            'Nome do Decisor': 'decisionMakerName',
            'E-mail do Decisor': 'decisionMakerEmail',
            'Telefone do Decisor': 'decisionMakerPhone',
            'Cidade': 'city',
            'Estado': 'state',
          };

          const validData = results.data.map((row: any) => {
            // Converter colunas vazias para undefined e formatar dados
            const client: any = {};
            for (const key in row) {
              const trimmedKey = key.trim();
              const mappedKey = headerMap[trimmedKey] || trimmedKey;
              
              // Ignore ID do Squad (squadId) due to recent architectural change to Teams
              if (trimmedKey === 'ID do Squad' || mappedKey === 'squadId') continue;

              const val = row[key]?.trim();
              if (val) {
                client[mappedKey] = val;
              }
            }

            // Preencher Data de Entrada padrão (hoje) caso o usuário não tenha enviado na planilha
            if (!client.entryDate) {
              client.entryDate = new Date().toISOString().split('T')[0];
            }

            return client;
          });

          if (validData.length === 0) {
            throw new Error('O arquivo CSV está vazio ou não possui formato válido.');
          }

          const response = await api.post<{ count: number }>('/clients/bulk', validData);
          alert(`Importação concluída com sucesso! ${response.count} clientes criados.`);
          onSuccess();
          onClose();
        } catch (err: any) {
          setError(err.message || 'Erro ao importar clientes. Verifique o formato do arquivo.');
        } finally {
          setLoading(false);
        }
      },
      error: (err) => {
        setError(`Erro ao ler o arquivo: ${err.message}`);
        setLoading(false);
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[var(--card)] rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-5 border-b border-[var(--border)]">
          <h2 className="text-lg font-bold text-slate-200">Importar Clientes</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-400 transition-colors"
            title="Fechar"
            disabled={loading}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 bg-[var(--secondary)] border border-[var(--border)] rounded-lg text-sm text-slate-400">
            <p className="mb-2 font-medium text-slate-300">Instruções:</p>
            <ol className="list-decimal pl-4 mb-3 space-y-1">
              <li>Baixe o modelo de planilha abaixo.</li>
              <li>Preencha os dados dos clientes sem alterar os nomes das colunas.</li>
              <li>Salve o arquivo no formato <strong>CSV (Valores Separados por Vírgula)</strong>.</li>
              <li>Faça o upload do arquivo CSV aqui.</li>
            </ol>
            <a
              href="/template-clientes.csv"
              download="template-clientes.csv"
              className="inline-flex items-center gap-1.5 text-[var(--foreground)] hover:text-slate-300 font-medium"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Baixar Modelo (CSV)
            </a>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-300 mb-2">Arquivo CSV</label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={loading}
              className="w-full text-sm text-slate-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-[rgba(250,204,21,0.1)] file:text-[var(--foreground)]
                hover:file:bg-yellow-100 transition-colors
                border border-[var(--border)] rounded-lg p-1 cursor-pointer"
            />
          </div>

          {error && (
            <div className="p-3 mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}
        </div>

        <div className="p-5 border-t border-[var(--border)] flex justify-end gap-3 bg-[var(--secondary)]">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleImport}
            disabled={!file || loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Importando...
              </>
            ) : (
              'Importar Clientes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
