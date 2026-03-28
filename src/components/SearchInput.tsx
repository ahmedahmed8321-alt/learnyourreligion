"use client";

export default function SearchInput({
  value,
  onChange,
  placeholder = "ابحث...",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative max-w-xl">
      <svg className="absolute right-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none"
        fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl px-5 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white shadow-sm"
      />
    </div>
  );
}
