import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

type FeedbackRating = 'down' | 'up';

export interface GhostAgentApiClient {
  getAiChatSession(args: {
    sessionId?: string;
  }): Observable<{ messages: { content: string; role: 'assistant' | 'user' }[]; sessionId?: string }>;
  getAiModelPreference(): Observable<{
    availableModels: string[];
    selectedModel?: string;
  }>;
  getAiSessionFeedback(args: {
    sessionId: string;
  }): Observable<{
    feedback: {
      assistantReply: string;
      comment?: string;
      id: string;
      query: string;
      rating: FeedbackRating;
    }[];
  }>;
  postAiChat(args: {
    message: string;
    selectedModel?: string;
    sessionId?: string;
  }): Observable<{
    disclaimer?: string;
    message: string;
    sessionId: string;
    toolInvocations?: unknown[];
    verification?: unknown;
  }>;
  postAiFeedback(args: {
    assistantReply: string;
    comment?: string;
    model?: string;
    query: string;
    rating: FeedbackRating;
    sessionId: string;
    toolInvocations?: unknown[];
    verification?: unknown;
  }): Observable<unknown>;
  updateAiModelPreference(args: {
    selectedModel: string;
  }): Observable<{
    availableModels?: string[];
    selectedModel?: string;
  }>;
}

export const GHOSTAGENT_API_CLIENT = new InjectionToken<GhostAgentApiClient>(
  'GHOSTAGENT_API_CLIENT'
);
