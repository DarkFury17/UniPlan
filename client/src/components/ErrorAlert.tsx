import React from "react";
import { AlertTriangle, ArrowRight, X } from "lucide-react";
import type { ApiError } from "../types";

interface ErrorAlertProps {
  error: ApiError;
  onDismiss: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ error, onDismiss }) => {
  const isCyclic = error.statusCode === 422 || Boolean(error.cycle && error.cycle.length > 0);
  const isUnfeasible = error.statusCode === 409;

  return (
    <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl p-4 text-xs text-red-900 dark:text-red-200 animate-in fade-in duration-150 space-y-2.5 shadow-xs transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start space-x-2.5">
          <div className="p-1 rounded-md bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold uppercase tracking-wider text-red-700 dark:text-red-300">
                {isCyclic
                  ? "Errore 422 • Dipendenza Ciclica Rilevata"
                  : isUnfeasible
                  ? "Errore 409 • Vincoli Irrisolvibili (Unfeasible)"
                  : `Errore ${error.statusCode} • ${error.error}`}
              </span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-sans">{error.message}</p>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors cursor-pointer shrink-0"
          title="Chiudi avviso"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Dettaglio ciclo per 422 */}
      {error.cycle && error.cycle.length > 0 && (
        <div className="p-2.5 rounded-lg bg-white dark:bg-slate-950/80 border border-red-200 dark:border-red-900/40 space-y-1.5 ml-8">
          <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Percorso del Ciclo (DFS Topological Cycle):
          </p>
          <div className="flex items-center flex-wrap gap-1.5 font-mono text-xs text-red-800 dark:text-red-200">
            {error.cycle.map((node, index) => (
              <React.Fragment key={index}>
                <span className="px-2 py-0.5 rounded bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-200 border border-red-200 dark:border-red-800/50 font-medium">
                  {node}
                </span>
                {index < error.cycle!.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-red-500 dark:text-red-400" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Dettaglio motivo per 409 */}
      {error.reason && (
        <div className="p-2.5 rounded-lg bg-white dark:bg-slate-950/80 border border-red-200 dark:border-red-900/40 text-xs text-slate-800 dark:text-slate-300 font-mono ml-8">
          <span className="text-red-600 dark:text-red-400 font-bold uppercase text-[11px] mr-1.5">Diagnosi:</span>
          {error.reason}
        </div>
      )}

      {/* Dettaglio issues per 400 */}
      {error.issues && error.issues.length > 0 && (
        <ul className="ml-8 list-disc list-inside space-y-0.5 text-slate-700 dark:text-slate-300 text-xs">
          {error.issues.map((issue, idx) => (
            <li key={idx}>
              <span className="font-mono font-semibold text-red-700 dark:text-red-300">{issue.path}</span>:{" "}
              {issue.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
