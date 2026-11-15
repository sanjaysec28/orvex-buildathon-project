import type { CorridorId, UserRole } from '../../types/domain';

export interface AgentContextPayload {
  role: UserRole;
  corridorId: CorridorId;
  languageCode: string;
}

export interface AiOrchestrationContract {
  readonly engines: readonly ['google-gemini-api', 'google-adk'];
  readonly isConnected: false;
  describeContext(payload: AgentContextPayload): AgentContextPayload;
}

export const aiOrchestrationContract: AiOrchestrationContract = {
  engines: ['google-gemini-api', 'google-adk'],
  isConnected: false,
  describeContext(payload) {
    return payload;
  },
};
