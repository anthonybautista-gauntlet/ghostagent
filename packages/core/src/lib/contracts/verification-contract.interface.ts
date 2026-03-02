import type { AiCitedFigure } from './ai-cited-figure.interface';

export interface VerificationContract {
  verify({
    citedFigures,
    factRegistry,
    toolResults
  }: {
    citedFigures: AiCitedFigure[];
    factRegistry: Record<string, number>;
    toolResults: Record<string, unknown>;
  }): {
    failedCitations: string[];
    passed: boolean;
  };
}
