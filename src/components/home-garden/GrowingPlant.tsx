/**
 * Seed-to-bloom illustration. Animate its [data-stem], [data-seed],
 * [data-sprout="0|1|2"] and [data-bloom] parts from the parent section.
 * Renders fully grown by default (the no-motion final state).
 */
export default function GrowingPlant({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 400" className={className} aria-hidden="true">
      <ellipse cx="150" cy="372" rx="120" ry="16" fill="#7a5a3e" opacity="0.18" />
      <path d="M30 372 Q150 340 270 372" stroke="#7a5a3e" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.5" />
      <ellipse data-seed cx="150" cy="364" rx="13" ry="9" fill="#a3784f" />
      <path
        data-stem
        pathLength={1}
        strokeDasharray="1 2"
        d="M150 362 C 148 300, 158 250, 150 190 S 140 110, 152 70"
        stroke="var(--sf-forest)"
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
      />
      <g data-sprout="0">
        <path d="M150 300 C 120 290, 98 268, 92 240 C 122 244, 144 266, 150 300 Z" fill="var(--sf-forest)" />
      </g>
      <g data-sprout="1">
        <path d="M152 220 C 186 212, 212 186, 218 154 C 184 160, 160 186, 152 220 Z" fill="var(--sf-moss)" />
      </g>
      <g data-sprout="2">
        <path d="M150 150 C 118 140, 96 112, 94 82 C 126 90, 146 118, 150 150 Z" fill="var(--sf-forest)" />
      </g>
      <g data-bloom>
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} cx="152" cy="52" rx="10" ry="20" fill="var(--sf-clay)" transform={`rotate(${a} 152 70)`} />
        ))}
        <circle cx="152" cy="70" r="10" fill="var(--sf-butter)" />
      </g>
    </svg>
  );
}
