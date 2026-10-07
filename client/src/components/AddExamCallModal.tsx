import React, { useState } from "react";
import { X, Plus, CalendarPlus } from "lucide-react";
import type { ExamCall, ExamType } from "../types";

interface AddExamCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseName: string;
  onAddCall: (call: ExamCall) => void;
}

export const AddExamCallModal: React.FC<AddExamCallModalProps> = ({
  isOpen,
  onClose,
  courseId,
  courseName,
  onAddCall,
}) => {
  const [data, setData] = useState("2026-06-20");
  const [ora, setOra] = useState("09:00");
  const [aula, setAula] = useState("Aula Magna");
  const [tipoProva, setTipoProva] = useState<ExamType>("SCRITTO");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isoDateTime = new Date(`${data}T${ora}:00.000Z`).toISOString();
    const id = "call-" + Math.random().toString(36).substring(2, 9);

    onAddCall({
      id,
      courseId,
      dataOra: isoDateTime,
      aula: aula.trim() || undefined,
      tipoProva,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
              <CalendarPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">Nuova Data Appello</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 truncate max-w-[240px]">{courseName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Data Appello *</label>
              <input
                type="date"
                required
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-750 text-stone-900 dark:text-stone-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Ora Inizio</label>
              <input
                type="time"
                value={ora}
                onChange={(e) => setOra(e.target.value)}
                className="w-full bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-750 text-stone-900 dark:text-stone-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Tipo Prova</label>
            <select
              value={tipoProva}
              onChange={(e) => setTipoProva(e.target.value as ExamType)}
              className="w-full bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-750 text-stone-900 dark:text-stone-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800"
            >
              <option value="SCRITTO">Scritto</option>
              <option value="ORALE">Orale</option>
              <option value="SCRITTO_ORALE">Scritto + Orale</option>
              <option value="PROGETTO">Progetto</option>
              <option value="LABORATORIO">Laboratorio</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Aula / Sede</label>
            <input
              type="text"
              placeholder="es. Aula Magna, Lab 3"
              value={aula}
              onChange={(e) => setAula(e.target.value)}
              className="w-full bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-750 text-stone-900 dark:text-stone-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 placeholder:text-stone-400"
            />
          </div>

          <div className="flex justify-end space-x-2.5 pt-3 border-t border-stone-100 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-200 text-xs font-medium transition-colors cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white dark:bg-emerald-700 dark:hover:bg-emerald-600 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Aggiungi Appello</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
