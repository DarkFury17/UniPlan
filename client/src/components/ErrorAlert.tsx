import React from "react";
import { AlertCircle, ArrowRight, X } from "lucide-react";
import type { ApiError } from "../types";

interface ErrorAlertProps {
  error: ApiError;
  onDismiss: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ error, onDismiss }) => {
  const isCyclic = error.statusCode === 422 || Boolean(error.cycle && error.cycle.length > 0);
  const isUnfeasible = error.statusCode === 409;

  return (
    <div className="bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-xl p-4 text-xs text-rose-900 dark:text-rose-200 animate-in fade-in duration-150 space-y-3 shadow-2xs transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start space-x-2.5">
          <div className="w-7 h-7 rounded-md bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 flex items-center justify-center shrink-0 mt-0.5">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300">
                {isCyclic
                  ? "Errore 422 • Dipendenza Ciclica Rilevata"
                  : isUnfeasible
                  ? "Errore 409 • Conflitto tra Vincoli (Insolvibile)"
                  : `Errore ${error.statusCode} • ${error.error}`}
              </span>
            </div>
            <p className="text-stone-700 dark:text-stone-300 leading-relaxed font-sans">{error.message}</p>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1 rounded-md hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors cursor-pointer shrink-0"
          title="Chiudi avviso"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Dettaglio ciclo per 422 */}
      {error.cycle && error.cycle.length > 0 && (
        <div className="p-3 rounded-lg bg-white dark:bg-stone-950/90 border border-rose-200 dark:border-rose-900/40 space-y-1.5 ml-9">
          <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Ciclo rilevato nell'ordinamento topologico (DAG):
          </p>
          <div className="flex items-center flex-wrap gap-1.5 font-mono text-xs text-rose-800 dark:text-rose-200">
            {error.cycle.map((node, index) => (
              <React.Fragment key={index}>
                <span className="px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-200 border border-rose-200 dark:border-rose-800/50 font-medium">
                  {node}
                </span>
                {index < error.cycle!.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-rose-500 dark:text-rose-400" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Dettaglio motivo per 409 */}
      {error.reason && (
        <div className="p-3 rounded-lg bg-white dark:bg-stone-950/90 border border-rose-200 dark:border-rose-900/40 text-xs text-stone-800 dark:text-stone-300 font-mono ml-9">
          <span className="text-rose-700 dark:text-rose-400 font-bold uppercase text-[11px] mr-1.5">Diagnosi Vincoli:</span>
          {error.reason}
        </div>
      )}

      {/* Dettaglio issues per 400 */}
      {error.issues && error.issues.length > 0 && (
        <ul className="ml-9 list-disc list-inside space-y-0.5 text-stone-700 dark:text-stone-300 text-xs">
          {error.issues.map((issue, idx) => (
            <li key={idx}>
              <span className="font-mono font-semibold text-rose-700 dark:text-rose-300">{issue.path}</span>:{" "}
              {issue.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
