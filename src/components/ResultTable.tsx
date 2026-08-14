import { type Indicator } from '../data/kemenkes-standards';
import { getNutritionalStatus } from '../utils/zscore';

interface ResultRow {
  date: string;
  ageInMonths: number;
  weight: number;
  height: number;
  zScore: number | null;
}

interface ResultTableProps {
  indicator: Indicator;
  results: ResultRow[];
}

export const ResultTable: React.FC<ResultTableProps> = ({ indicator, results }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mt-4">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usia (Bulan)</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nilai Ukur</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Z-Score</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-4 text-center text-sm text-gray-500">Belum ada data pengukuran yang valid.</td>
              </tr>
            ) : (
              results.map((r, i) => {
                const status = r.zScore !== null ? getNutritionalStatus(indicator, r.zScore) : null;
                
                let nilaiLabel = '';
                if (indicator === 'BBU') nilaiLabel = `${r.weight} kg`;
                else if (indicator === 'TBU') nilaiLabel = `${r.height} cm`;
                else if (indicator === 'BBTB') nilaiLabel = `${r.weight} kg / ${r.height} cm`;
                else if (indicator === 'IMTU') {
                  const imt = r.weight / Math.pow(r.height / 100, 2);
                  nilaiLabel = `${imt.toFixed(2)} kg/m²`;
                }

                return (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{r.date}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{r.ageInMonths}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{nilaiLabel}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {r.zScore !== null ? r.zScore.toFixed(2) : '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {status ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${status.color}`}>
                          {status.label}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
