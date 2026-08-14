import { useState, useMemo } from 'react';
import { PatientForm } from './components/PatientForm';
import { MeasurementForm, type MeasurementData } from './components/MeasurementForm';
import { GrowthChart } from './components/GrowthChart';
import { ResultTable } from './components/ResultTable';
import { type Gender, type Indicator } from './data/kemenkes-standards';
import { calculateAgeInMonths, getSDBands, calculateZScore } from './utils/zscore';

function App() {
  const [gender, setGender] = useState<Gender>('L');
  const [dob, setDob] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [indicator, setIndicator] = useState<Indicator>('BBU');
  
  const [measurements, setMeasurements] = useState<MeasurementData[]>([
    { id: '1', date: new Date().toISOString().split('T')[0], weight: '', height: '' }
  ]);

  // Process data for charts and tables
  const processedResults = useMemo(() => {
    if (!dob) return [];

    const dobDate = new Date(dob);

    return measurements.map(m => {
      if (!m.date || (!m.weight && indicator !== 'TBU') || (!m.height && indicator !== 'BBU')) {
        return { ...m, ageInMonths: 0, weightNum: 0, heightNum: 0, x: 0, y: 0, zScore: null, valid: false };
      }

      const mDate = new Date(m.date);
      const ageInMonths = calculateAgeInMonths(dobDate, mDate);
      const weightNum = parseFloat(m.weight) || 0;
      const heightNum = parseFloat(m.height) || 0;

      let x = ageInMonths;
      let y = 0;

      if (indicator === 'BBU') y = weightNum;
      else if (indicator === 'TBU') y = heightNum;
      else if (indicator === 'BBTB') {
        x = heightNum;
        y = weightNum;
      } else if (indicator === 'IMTU') {
        if (heightNum > 0) {
          y = weightNum / Math.pow(heightNum / 100, 2);
        }
      }

      let zScore = null;
      if (y > 0) {
        const bands = getSDBands(indicator, gender, x);
        if (bands) {
          zScore = calculateZScore(y, bands);
        }
      }

      return {
        ...m,
        ageInMonths,
        weightNum,
        heightNum,
        x,
        y,
        zScore,
        valid: y > 0
      };
    });
  }, [measurements, dob, gender, indicator]);

  const chartData = processedResults
    .filter(r => r.valid)
    .map(r => ({ x: r.x, y: r.y, date: r.date }));

  const tableResults = processedResults
    .filter(r => r.valid)
    .map(r => ({
      date: r.date,
      ageInMonths: r.ageInMonths,
      weight: r.weightNum,
      height: r.heightNum,
      zScore: r.zScore
    }));

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Growth Chart Simulator</h1>
            <p className="text-sm text-gray-500 mt-1">Simulasi Grafik Pertumbuhan Anak Berbasis PMK No. 2 Tahun 2020</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setDob('');
                setName('');
                setMeasurements([{ id: Date.now().toString(), date: new Date().toISOString().split('T')[0], weight: '', height: '' }]);
              }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
            >
              Reset Data
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Panel: Inputs */}
          <div className="lg:col-span-1 space-y-6">
            <PatientForm 
              gender={gender} setGender={setGender}
              dob={dob} setDob={setDob}
              name={name} setName={setName}
            />
            <MeasurementForm 
              measurements={measurements} 
              setMeasurements={setMeasurements}
            />
          </div>

          {/* Right Panel: Chart & Table */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-100 pb-4">
                {[
                  { id: 'BBU', label: 'Berat Badan / Usia (BB/U)' },
                  { id: 'TBU', label: 'Tinggi Badan / Usia (TB/U)' },
                  { id: 'BBTB', label: 'Berat Badan / Tinggi (BB/TB)' },
                  { id: 'IMTU', label: 'Indeks Massa Tubuh (IMT/U)' },
                ].map(ind => (
                  <button
                    key={ind.id}
                    onClick={() => setIndicator(ind.id as Indicator)}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                      indicator === ind.id 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {ind.label}
                  </button>
                ))}
              </div>

              {!dob ? (
                <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <p className="text-gray-500 text-sm">Silakan isi Tanggal Lahir anak terlebih dahulu.</p>
                </div>
              ) : (
                <GrowthChart 
                  indicator={indicator} 
                  gender={gender} 
                  userData={chartData} 
                />
              )}
            </div>

            {dob && (
              <ResultTable indicator={indicator} results={tableResults} />
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default App;
