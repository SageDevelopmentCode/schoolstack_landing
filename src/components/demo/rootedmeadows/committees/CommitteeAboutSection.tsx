"use client";

import type { Committee } from "./types";

export default function CommitteeAboutSection({ committee }: { committee: Committee }) {
  const paragraphs = committee.aboutHtml.split("\n\n");

  return (
    <div className="max-w-3xl">
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
        {paragraphs.map((block, i) => {
          if (block.startsWith("**") && block.includes(":**")) {
            const [heading, ...rest] = block.split("\n");
            const title = heading.replace(/\*\*/g, "").replace(":", "");
            return (
              <div key={i}>
                <h3 className="text-sm font-semibold text-gray-800 mb-2">{title}</h3>
                <ul className="space-y-1.5">
                  {rest
                    .filter((line) => line.startsWith("- "))
                    .map((line, j) => (
                      <li key={j} className="text-sm text-gray-600 flex gap-2">
                        <span className="text-[#827096]">•</span>
                        {line.slice(2)}
                      </li>
                    ))}
                </ul>
              </div>
            );
          }
          return (
            <p key={i} className="text-sm text-gray-600 leading-relaxed">
              {block}
            </p>
          );
        })}
      </div>
    </div>
  );
}
