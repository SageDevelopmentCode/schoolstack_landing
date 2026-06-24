import Link from "next/link";
import SchoolDemoWordmark from "@/components/demo/SchoolDemoWordmark";
import { listSchoolDemos } from "@/data/school-demos";

export default function AdminDemosPage() {
  const demos = listSchoolDemos();

  return (
    <div className="h-[calc(100vh-3rem)] overflow-y-auto font-secondary">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-text">Demos</h1>
          <p className="text-sm text-text-muted mt-1">
            School-branded interactive walkthroughs
          </p>
        </header>

        {demos.length === 0 ? (
          <p className="text-sm text-text-faint">No demos configured.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {demos.map((demo) => (
              <Link
                key={demo.slug}
                href={demo.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col rounded-xl border border-border bg-surface overflow-hidden transition-all duration-150 hover:border-clay/40 hover:shadow-sm"
              >
                <div
                  className="h-1 shrink-0"
                  style={{ backgroundColor: demo.themePrimary }}
                />
                <div className="flex flex-col flex-1 p-5 gap-4">
                  <div className="h-10 flex items-center">
                    <SchoolDemoWordmark
                      logo={demo.logo}
                      className="max-h-10 w-auto object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-sm font-semibold text-text leading-snug">
                      {demo.schoolName}
                    </h2>
                    <p className="text-xs text-text-muted mt-1.5 line-clamp-2 leading-relaxed">
                      {demo.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-medium text-text-faint px-2 py-0.5 rounded-full bg-bg border border-border">
                      {demo.slug}
                    </span>
                    <span className="text-xs font-medium text-text-muted group-hover:text-clay transition-colors">
                      Open demo →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
