import { supabase } from './supabase';

export interface Patient {
  id: string;
  medical_record_no: string;
  name: string;
  gender: 'L' | 'P';
  date_of_birth: string;
}

export interface DbMeasurement {
  id: string;
  patient_id: string;
  measured_at: string;
  weight_kg: number;
  height_cm: number;
}

export async function getPatients(): Promise<Patient[]> {
  const { data, error } = await supabase
    .from('patients')
    .select('id, medical_record_no, name, gender, date_of_birth')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching patients:', error);
    return [];
  }
  return data || [];
}

export async function getMeasurements(patientId: string): Promise<DbMeasurement[]> {
  const { data, error } = await supabase
    .from('measurements')
    .select('id, patient_id, measured_at, weight_kg, height_cm')
    .eq('patient_id', patientId)
    .order('measured_at', { ascending: true });

  if (error) {
    console.error('Error fetching measurements:', error);
    return [];
  }
  return data || [];
}
