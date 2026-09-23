import type { LegalBlock, LegalSection as LegalSectionType } from "@/content/legal/types";

function LegalBlockContent({ block }: { block: LegalBlock }) {
  if (block.type === "paragraph") {
    return (
      <p className="text-[15px] font-secondary text-text-muted leading-relaxed">
        {block.text}
      </p>
    );
  }

  if (block.type === "table") {
    return (
      <div className="overflow-x-auto -mx-1 px-1">
        <table className="w-full min-w-[640px] border-collapse text-left text-[14px] font-secondary text-text-muted">
          <thead>
            <tr className="border-b border-border">
              {block.headers.map((header) => (
                <th
                  key={header}
                  className="py-2.5 pr-4 font-medium text-text align-top whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-border/60 align-top">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="py-2.5 pr-4 leading-relaxed">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <ul className="list-disc pl-5 space-y-2 text-[15px] font-secondary text-text-muted leading-relaxed">
      {block.items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default function LegalSection({ section }: { section: LegalSectionType }) {
  return (
    <section id={section.id} className="scroll-mt-28 space-y-4">
      <h2 className="font-display text-[1.35rem] text-text">{section.title}</h2>
      <div className="space-y-4">
        {section.blocks.map((block, index) => (
          <LegalBlockContent key={`${section.id ?? section.title}-${index}`} block={block} />
        ))}
      </div>
    </section>
  );
}
