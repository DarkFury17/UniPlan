import React from "react";
import { GraduationCap, Building2, BookOpen, CheckCircle, ArrowRight } from "lucide-react";
import { DEGREE_PRESETS, type DegreePreset } from "../data/degree-presets";

interface DegreeSelectorProps {
  selectedPresetId: string | null;
  onSelectPreset: (preset: DegreePreset) => void;
  onStartBlank: () => void;
}

export const DegreeSelector: React.FC<DegreeSelectorProps> = ({
  selectedPresetId,
  onSelectPreset,
  onStartBlank,
}) => {
  return (
    <div className="space-y-4">
      {/* Intro Header */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5 sm:p-6 shadow-sm">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold mb-3 border border-stone-200 dark:border-stone-700">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400" />
            <span>Passo 1 di 3 • Percorsi Accademici Istituzionali</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Seleziona il Corso di Laurea o Inizia da Zero
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1.5 leading-relaxed">
            Scegli un piano di studi precompilato con insegnamenti ufficiali, crediti formativi (CFU), propedeuticità vincolanti e date di sessione, oppure imposta un programma personalizzato.
          </p>
        </div>
      </div>

      {/* Degree Preset Cards Dense e Concrete */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {DEGREE_PRESETS.map((preset) => {
          const isSelected = selectedPresetId === preset.id;
          const totalCfu = preset.courses.reduce((sum, c) => sum + c.cfu, 0);

          return (
            <div
              key={preset.id}
              className={`text-left p-5 rounded-xl border border-l-4 transition-all flex flex-col justify-between shadow-sm ${
                isSelected
                  ? "bg-white dark:bg-stone-900 border-stone-300 dark:border-stone-700 border-l-emerald-800 dark:border-l-emerald-600 ring-2 ring-emerald-800/15"
                  : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 border-l-emerald-700 hover:border-stone-300 dark:hover:border-stone-700 hover:shadow-md"
              }`}
            >
              <div className="space-y-3">
                {/* Facoltà badge & Stato */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {preset.tag}
                  </span>
                  {isSelected && (
                    <span className="flex items-center space-x-1 text-xs font-bold text-emerald-800 dark:text-emerald-400">
                      <CheckCircle className="w-4 h-4 stroke-[2.5]" />
                      <span>Selezionato</span>
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                    {preset.name}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 flex items-center space-x-1.5 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-stone-400" />
                    <span>{preset.department}</span>
                  </p>
                </div>

                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed min-h-[3rem]">
                  {preset.description}
                </p>

                {/* Box Riassuntivo Compatto */}
                <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-950/80 border border-stone-200 dark:border-stone-800 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <span className="block text-xs font-mono font-bold text-stone-900 dark:text-stone-100">{preset.courses.length}</span>
                    <span className="block text-[10px] text-stone-500 dark:text-stone-400 uppercase font-semibold">Esami</span>
                  </div>
                  <div className="border-x border-stone-200 dark:border-stone-800">
                    <span className="block text-xs font-mono font-bold text-emerald-900 dark:text-emerald-400">{totalCfu}</span>
                    <span className="block text-[10px] text-stone-500 dark:text-stone-400 uppercase font-semibold">CFU Tot</span>
                  </div>
                  <div>
                    <span className="block text-xs font-mono font-bold text-amber-900 dark:text-amber-400">{preset.examCalls.length}</span>
                    <span className="block text-[10px] text-stone-500 dark:text-stone-400 uppercase font-semibold">Appelli</span>
                  </div>
                </div>
              </div>

              {/* Pulsante d'Azione Pieno Smeraldo */}
              <div className="pt-4 mt-3 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => onSelectPreset(preset)}
                  className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center space-x-1.5 ${
                    isSelected
                      ? "bg-emerald-900 hover:bg-emerald-950 text-white"
                      : "bg-emerald-800 hover:bg-emerald-900 text-white dark:bg-emerald-700 dark:hover:bg-emerald-600"
                  }`}
                >
                  <span>{isSelected ? "Ricarica questo piano" : "Seleziona questo piano"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sezione Separata Outline per Iniziare da Zero */}
      <div className="bg-stone-50 dark:bg-stone-900/60 border-2 border-dashed border-stone-300 dark:border-stone-850 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-700 dark:text-stone-300 shrink-0 shadow-2xs">
            <BookOpen className="w-5 h-5 text-emerald-800 dark:text-emerald-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Corso non presente o configurazione personalizzata?
            </h4>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
              Inizia da una scheda vuota per inserire i tuoi specifici insegnamenti, crediti e appelli d'esame.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onStartBlank}
          className="px-4 py-2.5 rounded-lg bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-750 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 text-xs font-bold shadow-2xs transition-colors cursor-pointer shrink-0"
        >
          Crea Piano Personalizzato da Zero
        </button>
      </div>
    </div>
  );
};
