import { Compass, Github } from 'lucide-react';
import { Link } from 'react-router-dom';

const techStack = ['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Node.js', 'Prisma'];

export function Footer() {
  return (
    <footer className="relative bg-canvas">
      {/* Top gradient line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="container-narrow py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-ai text-slate-50">
                <Compass className="h-4 w-4" />
              </div>
              <span className="font-display text-lg font-bold text-white">
                Globe<span className="gradient-ai-text">Sense</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-slate-500 max-w-xs leading-relaxed">
              AI-powered travel discovery. Describe your dream trip and find your perfect destination.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.1] transition-all"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4 text-slate-500" />
              </a>
            </div>
          </div>

          {/* Discover */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Discover</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/destinations" className="text-sm text-slate-400 hover:text-white transition-colors">
                  All Destinations
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Smart Search
                </Link>
              </li>
              <li>
                <Link to="/compare" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Compare Destinations
                </Link>
              </li>
            </ul>
          </div>



          {/* Built With */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Built With</h3>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full bg-white/[0.03] border border-white/[0.06] px-2.5 py-1 text-[10px] font-medium text-slate-500"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/[0.04] pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} GlobeSense.
          </p>
          <p className="text-xs text-slate-600">
            A portfolio project by Griffin Hall
          </p>
        </div>
      </div>
    </footer>
  );
}
