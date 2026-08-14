import React from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';

export interface MeasurementData {
  id: string;
  date: string;
  weight: string; // Keep as string for input to handle empty state
  height: string;
}

interface MeasurementFormProps {
  measurements: MeasurementData[];
  setMeasurements: React.Dispatch<React.SetStateAction<MeasurementData[]>>;
}

export const MeasurementForm: React.FC<MeasurementFormProps> = ({ measurements, setMeasurements }) => {

  const addMeasurement = () => {
    setMeasurements([
      ...measurements,
      { id: Date.now().toString(), date: new Date().toISOString().split('T')[0], weight: '', height: '' }
    ]);
  };

  const removeMeasurement = (id: string) => {
    setMeasurements(measurements.filter(m => m.id !== id));
  };

  const updateMeasurement = (id: string, field: keyof MeasurementData, value: string) => {
    setMeasurements(measurements.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mt-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Data Pengukuran</h2>
        <button 
          onClick={addMeasurement}
          className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          <PlusCircle size={16} className="mr-1" />
          Tambah
        </button>
      </div>

      <div className="space-y-3">
        {measurements.map((m, index) => (
          <div key={m.id} className="flex gap-2 items-start relative p-3 border border-gray-200 rounded-md bg-gray-50">
            <div className="text-xs font-bold text-gray-400 absolute -left-2 -top-2 bg-white px-1 border border-gray-200 rounded-full">{index + 1}</div>
            
            <div className="flex-1 space-y-2">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Tanggal Ukur</label>
                <input 
                  type="date" 
                  value={m.date}
                  onChange={(e) => updateMeasurement(m.id, 'date', e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Berat (kg)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    min="0.5"
                    max="40"
                    value={m.weight}
                    onChange={(e) => updateMeasurement(m.id, 'weight', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="0.0"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Tinggi (cm)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    min="30"
                    max="150"
                    value={m.height}
                    onChange={(e) => updateMeasurement(m.id, 'height', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="0.0"
                  />
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => removeMeasurement(m.id)}
              disabled={measurements.length === 1}
              className={`p-1.5 mt-5 rounded-md ${measurements.length === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'}`}
              title="Hapus baris"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
