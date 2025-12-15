import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";
import { AGENTS } from "../constants";
import { AgentType } from "../types";

// Define the tool definitions for the Navigator
const tools: FunctionDeclaration[] = [
  {
    name: AgentType.FINANCIAL,
    description: "Modul yang menangani semua pertanyaan keuangan dan asuransi pasien, bertanggung jawab atas transparansi penagihan dan kepatuhan manfaat asuransi.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        financial_and_insurance_query: {
          type: Type.STRING,
          description: "The user's query regarding billing, insurance, or finance.",
        },
      },
      required: ["financial_and_insurance_query"],
    },
  },
  {
    name: AgentType.MEDICAL_RECORDS,
    description: "Retrieves and provides access to patient medical records, test results, diagnoses, and health history securely and confidentially.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        medical_records_request: {
          type: Type.STRING,
          description: "The user's request for medical records or history.",
        },
      },
      required: ["medical_records_request"],
    },
  },
  {
    name: AgentType.PATIENT_INFO,
    description: "Manages patient registration, updates patient details, and retrieves general patient information.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        patient_details_request: {
          type: Type.STRING,
          description: "The user's request regarding registration or patient details.",
        },
      },
      required: ["patient_details_request"],
    },
  },
  {
    name: AgentType.SCHEDULER,
    description: "Schedules, reschedules, and cancels patient appointments with doctors or departments.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        appointment_logistics_query: {
          type: Type.STRING,
          description: "The user's request regarding appointment logistics.",
        },
      },
      required: ["appointment_logistics_query"],
    },
  },
];

interface RouteResult {
  targetAgent: AgentType;
  query: string;
}

export const processUserRequest = async (userMessage: string): Promise<{ routedAgent: AgentType, responseText: string }> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY not found in environment.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // 1. Step 1: The Navigator (Router) decides which agent to call
  // We use a strict system instruction to FORCE a tool call.
  const navigatorResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: userMessage,
    config: {
      systemInstruction: AGENTS[AgentType.NAVIGATOR].systemInstruction,
      tools: [{ functionDeclarations: tools }],
      temperature: 0, // Deterministic for routing
    }
  });

  const toolCalls = navigatorResponse.candidates?.[0]?.content?.parts?.[0]?.functionCall;

  let routeResult: RouteResult;

  if (toolCalls) {
    const fnName = toolCalls.name as AgentType;
    let query = "";
    
    // Extract arguments based on function name
    if (fnName === AgentType.FINANCIAL) query = (toolCalls.args as any).financial_and_insurance_query;
    else if (fnName === AgentType.MEDICAL_RECORDS) query = (toolCalls.args as any).medical_records_request;
    else if (fnName === AgentType.PATIENT_INFO) query = (toolCalls.args as any).patient_details_request;
    else if (fnName === AgentType.SCHEDULER) query = (toolCalls.args as any).appointment_logistics_query;

    routeResult = { targetAgent: fnName, query };
  } else {
    // Fallback if Navigator fails to route (rare with strict prompt)
    // We treat it as a general inquiry or default to Patient Info
    routeResult = { targetAgent: AgentType.PATIENT_INFO, query: userMessage };
    console.warn("Navigator did not return a function call. Defaulting to Patient Info.");
  }

  // 2. Step 2: The Sub-Agent executes the task
  // We create a new generation request acting as the sub-agent
  const subAgentConfig = AGENTS[routeResult.targetAgent];
  
  const agentResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: routeResult.query,
    config: {
      systemInstruction: subAgentConfig.systemInstruction,
      temperature: 0.7, // Allow some creativity in response phrasing
    }
  });

  return {
    routedAgent: routeResult.targetAgent,
    responseText: agentResponse.text || "I apologize, I could not generate a response.",
  };
};