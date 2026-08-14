import { type Gender } from '../data/lms-reference';

interface PatientFormProps {
  gender: Gender;
  setGender: (g: Gender) => void;
  dob: string;
  setDob: (d: string) => void;
  name: string;
  setName: (n: string) => void;
}

export const PatientForm: React.FC<PatientFormProps> = ({ gender, setGender, dob, setDob, name, setName }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Data Anak</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Anak (Opsional)</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Masukkan nama..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input 
                type="radio" 
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" 
                checked={gender === 'L'}
                onChange={() => setGender('L')}
              />
              <span className="ml-2 text-sm text-gray-700">Laki-laki</span>
            </label>
            <label className="flex items-center">
              <input 
                type="radio" 
                className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300" 
                checked={gender === 'P'}
                onChange={() => setGender('P')}
              />
              <span className="ml-2 text-sm text-gray-700">Perempuan</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
          <input 
            type="date" 
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>
    </div>
  );
};
