import { Compass, Github } from 'lucide-react';
import { Link } from 'react-router-dom';

const techStack = ['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Node.js', 'Prisma'];

export function Footer() {
  return (
    <footer className="relative bg-night text-white">
      {/* Top gradient border */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-aurora/50 to-transparent" />

      <div className="container-narrow py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-ai text-white">
                <Compass className="h-4 w-4" />
              </div>
              <span className="font-display text-lg font-bold">
                Globe<span className="text-aurora-light">Sense</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-white/40 max-w-xs leading-relaxed">
              AI-powered travel discovery. Describe your dream trip and find your perfect destination.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a
                href="https://github.com/Griffin-Hall/WebProject-AI"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4 text-white/60" />
              </a>
            </div>
          </div>

          {/* Discover */}
          <div>
            <h3 className="font-semibold text-white/80 text-sm">Discover</h3>
            <ul className="mt-3 space-y-2.5">
              <li>
                <Link to="/destinations" className="text-sm text-white/40 hover:text-aurora-light transition-colors">
                  All Destinations
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-sm text-white/40 hover:text-aurora-light transition-colors">
                  Smart Search
                </Link>
              </li>
            </ul>
          </div>

          {/* Built With */}
          <div>
            <h3 className="font-semibold text-white/80 text-sm">Built With</h3>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-[10px] font-medium text-white/50"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} GlobeSense.
          </p>
          <p className="text-xs text-white/30">
            A portfolio project by Griffin Hall
          </p>
        </div>
      </div>
    </footer>
  );
}
