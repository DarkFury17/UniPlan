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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">Nuovo Insegnamento Universitario</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">Specifica CFU, semestre e propedeuticità</p>
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
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Nome Insegnamento *</label>
              <input
                type="text"
                required
                placeholder="es. Basi di Dati"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-750 text-stone-900 dark:text-stone-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 placeholder:text-stone-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Codice SSD</label>
              <input
                type="text"
                placeholder="ING-INF/05"
                value={codice}
                onChange={(e) => setCodice(e.target.value)}
                className="w-full bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-750 text-stone-900 dark:text-stone-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 placeholder:text-stone-400 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">CFU</label>
              <input
                type="number"
                min={1}
                max={30}
                value={cfu}
                onChange={(e) => setCfu(parseInt(e.target.value, 10))}
                className="w-full bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-750 text-stone-900 dark:text-stone-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Semestre</label>
              <select
                value={semestre}
                onChange={(e) => setSemestre(parseInt(e.target.value, 10) as 1 | 2)}
                className="w-full bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-750 text-stone-900 dark:text-stone-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800"
              >
                <option value={1}>1° Semestre</option>
                <option value={2}>2° Semestre</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Anno</label>
              <input
                type="number"
                min={1}
                max={5}
                value={annoCorso}
                onChange={(e) => setAnnoCorso(parseInt(e.target.value, 10))}
                className="w-full bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-750 text-stone-900 dark:text-stone-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Difficoltà (1-5)</label>
              <input
                type="number"
                min={1}
                max={5}
                value={difficoltaStimata}
                onChange={(e) => setDifficoltaStimata(parseInt(e.target.value, 10))}
                className="w-full bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-750 text-stone-900 dark:text-stone-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 font-mono"
              />
            </div>
          </div>

          {/* Propedeuticità DAG */}
          {existingCourses.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-stone-150 dark:border-stone-800">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block">
                Propedeuticità richieste (questo esame richiede il previo superamento di):
              </label>
              <div className="max-h-36 overflow-y-auto space-y-1 p-2 bg-stone-50 dark:bg-stone-950 rounded-lg border border-stone-200 dark:border-stone-800">
                {existingCourses.map((c) => (
                  <label
                    key={c.id}
                    className="flex items-center space-x-2 text-xs text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 cursor-pointer select-none p-1.5 rounded hover:bg-stone-200/50 dark:hover:bg-stone-900"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPrereqs.includes(c.id)}
                      onChange={() => togglePrereq(c.id)}
                      className="rounded border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-emerald-800 focus:ring-emerald-700"
                    />
                    <span>{c.nome}</span>
                    <span className="text-stone-500 dark:text-stone-400 font-mono text-[11px]">({c.cfu} CFU)</span>
                  </label>
                ))}
              </div>
            </div>
          )}

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
              <span>Salva Insegnamento</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
