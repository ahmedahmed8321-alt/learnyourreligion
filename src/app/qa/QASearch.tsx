"use client";

import { useState } from "react";
import SearchInput from "@/components/SearchInput";
import type { QA, QASection } from "@/lib/supabase";
import QAList from "./QAList";

interface Props {
  sections: QASection[];
  bySectionId: Record<string, QA[]>;
  unsectioned: QA[];
}

export default function QASearch({ sections, bySectionId, unsectioned }: Props) {
  const [search, setSearch] = useState("");
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const filterItems = (items: QA[]) => {
    if (!search.trim()) return items;
    return items.filter(
      (q) => q.question.includes(search) || (q.answer ?? "").includes(search)
    );
  };

  // Get sections to display based on active filter
  const visibleSections = activeSection
    ? sections.filter((s) => s.id === activeSection)
    : sections;

  const showUnsectioned = !activeSection || activeSection === "__none";

  const hasResults = visibleSections.some((s) => filterItems(bySectionId[s.id] ?? []).length > 0)
    || (showUnsectioned && filterItems(unsectioned).length > 0);

  return (
    <>
      {/* Search + Filter */}
      <div className="space-y-4 mb-6">
        <SearchInput value={search} onChange={setSearch} placeholder="ابحث في جميع الأسئلة والأجوبة..." />

        {sections.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setActiveSection(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-sm ${
                !activeSection ? "bg-green-700 text-white" : "bg-white border border-green-200 text-green-700 hover:bg-green-50"
              }`}>
              الكل
            </button>
            {sections.map((s) => (
              <button key={s.id} onClick={() => setActiveSection(activeSection === s.id ? null : s.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-sm ${
                  activeSection === s.id ? "bg-green-700 text-white" : "bg-white border border-green-200 text-green-700 hover:bg-green-50"
                }`}>
                {s.title}
                <span className="mr-1 text-xs opacity-70">({(bySectionId[s.id] ?? []).length})</span>
              </button>
            ))}
            {unsectioned.length > 0 && (
              <button onClick={() => setActiveSection(activeSection === "__none" ? null : "__none")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-sm ${
                  activeSection === "__none" ? "bg-green-700 text-white" : "bg-white border border-green-200 text-green-700 hover:bg-green-50"
                }`}>
                متنوعة
                <span className="mr-1 text-xs opacity-70">({unsectioned.length})</span>
              </button>
            )}
          </div>
        )}
      </div>

      {!hasResults ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg font-medium">{search ? `لا توجد نتائج لـ "${search}"` : "لا توجد أسئلة منشورة بعد"}</p>
        </div>
      ) : (
        <div className="space-y-10">
          {visibleSections.map((section) => {
            const sectionQA = filterItems(bySectionId[section.id] ?? []);
            if (sectionQA.length === 0) return null;
            return (
              <div key={section.id}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-1 h-7 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full shrink-0" />
                  <h2 className="text-xl font-bold text-green-900">{section.title}</h2>
                  <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-medium">
                    {sectionQA.length} سؤال
                  </span>
                </div>
                {section.description && (
                  <p className="text-gray-500 text-sm mb-4 mr-4">{section.description}</p>
                )}
                <QAList items={sectionQA} />
              </div>
            );
          })}

          {showUnsectioned && filterItems(unsectioned).length > 0 && (
            <div>
              {sections.length > 0 && !activeSection && (
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-1 h-7 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full shrink-0" />
                  <h2 className="text-xl font-bold text-green-900">متنوعة</h2>
                </div>
              )}
              <QAList items={filterItems(unsectioned)} />
            </div>
          )}
        </div>
      )}
    </>
  );
}
