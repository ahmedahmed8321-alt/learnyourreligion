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

  // Filter all QA by global search
  const filterItems = (items: QA[]) => {
    if (!search.trim()) return items;
    return items.filter(
      (q) => q.question.includes(search) || (q.answer ?? "").includes(search)
    );
  };

  const hasResults = sections.some((s) => filterItems(bySectionId[s.id] ?? []).length > 0)
    || filterItems(unsectioned).length > 0;

  return (
    <>
      <div className="mb-6">
        <SearchInput value={search} onChange={setSearch} placeholder="ابحث في جميع الأسئلة والأجوبة..." />
      </div>

      {!hasResults ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg font-medium">{search ? `لا توجد نتائج لـ "${search}"` : "لا توجد أسئلة منشورة بعد"}</p>
        </div>
      ) : (
        <div id="all" className="space-y-10">
          {sections.map((section) => {
            const sectionQA = filterItems(bySectionId[section.id] ?? []);
            if (sectionQA.length === 0) return null;
            return (
              <div key={section.id} id={`section-${section.id}`}>
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

          {filterItems(unsectioned).length > 0 && (
            <div>
              {sections.length > 0 && (
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
