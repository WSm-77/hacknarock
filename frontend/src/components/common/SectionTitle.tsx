interface SectionTitleProps {
  title: string;
  number?: string;
  wrapperClassName?: string;
  badgeClassName?: string;
  titleClassName?: string;
}

export function SectionTitle({
  title,
  number,
  wrapperClassName,
  badgeClassName,
  titleClassName,
}: SectionTitleProps) {
  return (
    <div className={wrapperClassName}>
      {number && <span className={badgeClassName}>{number}</span>}
      <h2 className={titleClassName}>{title}</h2>
    </div>
  );
}
