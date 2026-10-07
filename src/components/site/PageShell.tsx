import { ReactNode, useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";

type Props = { title: string; subtitle?: string; children: ReactNode; narrow?: boolean };

const PageShell = ({ title, subtitle, children, narrow }: Props) => {
  useEffect(() => {
    document.title = `${title} — BestGames`;
    window.scrollTo(0, 0);
  }, [title]);

  return (
    <div className="page-glow flex min-h-screen flex-col overflow-x-hidden">
      <div className="mx-auto w-full max-w-[1920px] px-4 pt-5 md:px-7 lg:px-[30px] lg:pt-6">
        <Header />
      </div>
      <main className={`mx-auto w-full flex-1 px-4 py-10 md:px-7 md:py-14 lg:px-[30px] ${narrow ? "max-w-[520px]" : "max-w-[1920px]"}`}>
        <div className="mb-8 animate-fade-in">
          <h1 className="font-head text-4xl font-medium tracking-[-0.02em] md:text-5xl">{title}</h1>
          {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="animate-fade-in [animation-delay:100ms]">{children}</div>
      </main>
      <Footer />
    </div>
  );
};

export default PageShell;
