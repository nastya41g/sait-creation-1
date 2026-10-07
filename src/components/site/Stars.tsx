const Stars = ({ value, className = "" }: { value: number; className?: string }) => (
  <span className={`text-star tracking-[1px] ${className}`} aria-label={`Рейтинг ${value} из 5`}>
    {"★★★★★".slice(0, value)}
    <span className="opacity-30">{"★★★★★".slice(value)}</span>
  </span>
);

export default Stars;
