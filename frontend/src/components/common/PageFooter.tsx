import type { ReactNode } from 'react';

interface FooterLink {
  label: string;
  href?: string;
  className?: string;
}

interface PageFooterProps {
  className?: string;
  dividerClassName?: string;
  containerClassName?: string;
  brandClassName?: string;
  descriptionClassName?: string;
  linksClassName?: string;
  links?: FooterLink[];
  brand?: ReactNode;
  description?: ReactNode;
  leftExtra?: ReactNode;
  rightExtra?: ReactNode;
}

export function PageFooter({
  className,
  dividerClassName,
  containerClassName,
  brandClassName,
  descriptionClassName,
  linksClassName,
  links = [],
  brand,
  description,
  leftExtra,
  rightExtra,
}: PageFooterProps) {
  return (
    <footer className={className}>
      {dividerClassName && <div className={dividerClassName} />}
      <div className={containerClassName}>
        <div>
          {brand && <span className={brandClassName}>{brand}</span>}
          {description && <p className={descriptionClassName}>{description}</p>}
          {leftExtra}
        </div>
        {links.length > 0 && (
          <div className={linksClassName}>
            {links.map((link) => (
              <a key={link.label} className={link.className} href={link.href ?? '#'}>
                {link.label}
              </a>
            ))}
          </div>
        )}
        {rightExtra}
      </div>
    </footer>
  );
}
