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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
              <CalendarPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Nuovo Appello d'Esame</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[240px]">{courseName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Data Appello *</label>
              <input
                type="date"
                required
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Ora Inizio</label>
              <input
                type="time"
                value={ora}
                onChange={(e) => setOra(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tipo Prova</label>
            <select
              value={tipoProva}
              onChange={(e) => setTipoProva(e.target.value as ExamType)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            >
              <option value="SCRITTO">Scritto</option>
              <option value="ORALE">Orale</option>
              <option value="SCRITTO_ORALE">Scritto + Orale</option>
              <option value="PROGETTO">Progetto</option>
              <option value="LABORATORIO">Laboratorio</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Aula / Luogo</label>
            <input
              type="text"
              placeholder="es. Aula 4 / Lab Turing"
              value={aula}
              onChange={(e) => setAula(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          <div className="flex justify-end space-x-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
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
