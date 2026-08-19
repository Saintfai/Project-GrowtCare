import React, { useEffect, useState } from 'react';
import { getPatients, type Patient } from '../lib/api';

interface PatientListProps {
  onSelectPatient: (patient: Patient) => void;
}

export const PatientList: React.FC<PatientListProps> = ({ onSelectPatient }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getPatients();
      setPatients(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div className="text-gray-500 text-sm p-4">Loading patients...</div>;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Pilih Pasien (Dari Database)</h2>
      
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {patients.length === 0 ? (
          <p className="text-sm text-gray-500">Belum ada data pasien.</p>
        ) : (
          patients.map(p => (
            <button
              key={p.id}
              onClick={() => onSelectPatient(p)}
              className="w-full text-left p-3 rounded-md hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-colors"
            >
              <div className="font-medium text-gray-800">{p.name}</div>
              <div className="text-xs text-gray-500 flex gap-2 mt-1">
                <span>{p.medical_record_no}</span>
                <span>•</span>
                <span>{p.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                <span>•</span>
                <span>{p.date_of_birth}</span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
