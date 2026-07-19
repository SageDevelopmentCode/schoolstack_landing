import Link from "next/link";
import SchoolDemoWordmark from "@/components/demo/SchoolDemoWordmark";
import { listSchoolDemos } from "@/data/school-demos";

export default function AdminDemosPage() {
  const demos = listSchoolDemos();

  return (
    <div className="h-[calc(100vh-3rem)] overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-admin-text">Demos</h1>
          <p className="text-sm text-admin-muted mt-1">
            School-branded interactive walkthroughs
          </p>
        </header>

        {demos.length === 0 ? (
          <p className="text-sm text-admin-faint">No demos configured.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {demos.map((demo) => (
              <Link
                key={demo.slug}
                href={demo.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col rounded-admin-md border border-admin-border bg-admin-surface overflow-hidden transition-all duration-150 hover:border-admin-accent/30 hover:shadow-sm"
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
                    <h2 className="text-sm font-semibold text-admin-text leading-snug">
                      {demo.schoolName}
                    </h2>
                    <p className="text-xs text-admin-muted mt-1.5 line-clamp-2 leading-relaxed">
                      {demo.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-medium text-admin-faint px-2 py-0.5 rounded-admin-sm bg-admin-bg border border-admin-border">
                      {demo.slug}
                    </span>
                    <span className="text-xs font-medium text-admin-muted group-hover:text-admin-accent transition-colors">
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
