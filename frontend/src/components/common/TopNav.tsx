import type { ReactNode } from 'react';

interface TopNavLink {
  label: string;
  href?: string;
  active?: boolean;
  className?: string;
}

interface TopNavProps {
  brand: string;
  links?: TopNavLink[];
  className?: string;
  containerClassName?: string;
  leftClassName?: string;
  rightClassName?: string;
  brandClassName?: string;
  navClassName?: string;
  navListClassName?: string;
  actionArea?: ReactNode;
}

export function TopNav({
  brand,
  links = [],
  className,
  containerClassName,
  leftClassName,
  rightClassName,
  brandClassName,
  navClassName,
  navListClassName,
  actionArea,
}: TopNavProps) {
  return (
    <header className={className}>
      <div className={containerClassName}>
        <div className={leftClassName}>
          <span className={brandClassName}>{brand}</span>
          {links.length > 0 && (
            <nav className={navClassName}>
              <div className={navListClassName}>
                {links.map((link) => (
                  <a
                    key={link.label}
                    className={link.className}
                    href={link.href ?? '#'}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </nav>
          )}
        </div>
        {actionArea && <div className={rightClassName}>{actionArea}</div>}
      </div>
    </header>
  );
}
