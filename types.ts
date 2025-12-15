export enum AgentType {
  NAVIGATOR = 'Navigator',
  FINANCIAL = 'FinancialTransactionAnalyst',
  MEDICAL_RECORDS = 'MedicalRecordsAgent',
  PATIENT_INFO = 'PatientInformationAgent',
  SCHEDULER = 'AppointmentScheduler'
}

export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  agent?: AgentType; // The agent who "spoke" this message
  timestamp: number;
  isRouting?: boolean; // If true, it's a system message saying "Routing to..."
}

export interface AgentConfig {
  id: AgentType;
  name: string;
  shortName: string;
  description: string;
  color: string;
  icon: string; // Lucide icon name
  systemInstruction: string;
}