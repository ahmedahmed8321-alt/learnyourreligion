"use client";

import React from "react";

// Matches http(s):// URLs and bare www. links
const URL_REGEX = /((?:https?:\/\/|www\.)[^\s<]+)/gi;
// Trailing characters that are usually punctuation, not part of the URL
const TRAILING = /[)\]\}.,!?؛،»"']+$/;

/**
 * Renders plain text with any URLs turned into clickable links.
 * Hook-free, so it works in both server and client components.
 * Links stopPropagation so they work inside clickable containers (e.g. accordions).
 */
export default function Linkify({ text, linkClassName }: { text: string | null | undefined; linkClassName?: string }) {
  if (!text) return null;

  const parts = text.split(URL_REGEX);

  return (
    <>
      {parts.map((part, i) => {
        if (!part) return null;

        if (/^(https?:\/\/|www\.)/i.test(part)) {
          const trailingMatch = part.match(TRAILING);
          const trailing = trailingMatch ? trailingMatch[0] : "";
          const url = trailing ? part.slice(0, -trailing.length) : part;
          const href = url.startsWith("http") ? url : `https://${url}`;

          return (
            <React.Fragment key={i}>
              <a href={href} target="_blank" rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className={linkClassName ?? "text-green-700 underline underline-offset-2 hover:text-green-600 break-all"}>
                {url}
              </a>
              {trailing}
            </React.Fragment>
          );
        }

        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </>
  );
}
