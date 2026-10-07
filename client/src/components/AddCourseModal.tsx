import React, { useState } from "react";
import { X, Plus, BookOpen } from "lucide-react";
import type { Course } from "../types";

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCourse: (course: Course, prerequisiteIds: string[]) => void;
  existingCourses: Course[];
}

export const AddCourseModal: React.FC<AddCourseModalProps> = ({
  isOpen,
  onClose,
  onAddCourse,
  existingCourses,
}) => {
  const [nome, setNome] = useState("");
  const [codice, setCodice] = useState("");
  const [cfu, setCfu] = useState(6);
  const [semestre, setSemestre] = useState<1 | 2>(1);
  const [annoCorso, setAnnoCorso] = useState(1);
  const [difficoltaStimata, setDifficoltaStimata] = useState(3);
  const [selectedPrereqs, setSelectedPrereqs] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    const id = "course-" + Math.random().toString(36).substring(2, 9);
    onAddCourse(
      {
        id,
        nome: nome.trim(),
        codice: codice.trim() || undefined,
        cfu,
        semestre,
        annoCorso,
        difficoltaStimata,
      },
      selectedPrereqs
    );

    // Reset
    setNome("");
    setCodice("");
    setSelectedPrereqs([]);
    onClose();
  };

  const togglePrereq = (courseId: string) => {
    setSelectedPrereqs((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Aggiungi Nuovo Esame</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nome Esame *</label>
              <input
                type="text"
                required
                placeholder="es. Basi di Dati"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Codice</label>
              <input
                type="text"
                placeholder="es. ING-INF/05"
                value={codice}
                onChange={(e) => setCodice(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">CFU</label>
              <input
                type="number"
                min={1}
                max={30}
                value={cfu}
                onChange={(e) => setCfu(parseInt(e.target.value, 10))}
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Semestre</label>
              <select
                value={semestre}
                onChange={(e) => setSemestre(parseInt(e.target.value, 10) as 1 | 2)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value={1}>1° Semestre</option>
                <option value={2}>2° Semestre</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Anno</label>
              <input
                type="number"
                min={1}
                max={5}
                value={annoCorso}
                onChange={(e) => setAnnoCorso(parseInt(e.target.value, 10))}
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Difficoltà (1-5)</label>
              <input
                type="number"
                min={1}
                max={5}
                value={difficoltaStimata}
                onChange={(e) => setDifficoltaStimata(parseInt(e.target.value, 10))}
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Propedeuticità DAG */}
          {existingCourses.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Propedeuticità richieste (questo esame richiede il superamento di):
              </label>
              <div className="max-h-36 overflow-y-auto space-y-1 p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                {existingCourses.map((c) => (
                  <label
                    key={c.id}
                    className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer select-none p-1 rounded hover:bg-slate-200/60 dark:hover:bg-slate-900"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPrereqs.includes(c.id)}
                      onChange={() => togglePrereq(c.id)}
                      className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{c.nome}</span>
                    <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">({c.cfu} CFU)</span>
                  </label>
                ))}
              </div>
            </div>
          )}

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
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Aggiungi Esame</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
