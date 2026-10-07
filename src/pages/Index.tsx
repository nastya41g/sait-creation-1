import Header from "@/components/site/Header";
import HeroSlider from "@/components/site/HeroSlider";
import GenreSearch from "@/components/site/GenreSearch";
import PopularList from "@/components/site/PopularList";
import Advantages from "@/components/site/Advantages";
import PopularGames from "@/components/site/PopularGames";
import Partners from "@/components/site/Partners";
import Footer from "@/components/site/Footer";
import { useForcedTheme, type Theme } from "@/hooks/use-theme";

const Index = ({ forcedTheme }: { forcedTheme?: Theme }) => {
  useForcedTheme(forcedTheme);

  return (
    <div className="page-glow min-h-screen overflow-x-hidden">
      <div className="mx-auto grid max-w-[1920px] grid-cols-1 gap-6 px-4 pb-8 pt-5 md:grid-cols-2 md:gap-x-8 md:px-7 lg:h-screen lg:min-h-[680px] lg:max-h-[1080px] lg:grid-cols-[1.55fr_1fr] lg:grid-rows-[auto_auto_1fr] lg:gap-x-10 lg:gap-y-[22px] lg:px-[30px] lg:pb-[30px] lg:pt-6 lg:[grid-template-areas:'nav_nav'_'slider_search'_'slider_cards']">
        <div className="md:col-span-2 lg:col-span-1 lg:[grid-area:nav]">
          <Header hideThemeToggle={!!forcedTheme} />
        </div>
        <div className="flex flex-col md:col-span-2 lg:col-span-1 lg:[grid-area:slider] [&>section]:flex-1">
          <HeroSlider />
        </div>
        <GenreSearch />
        <PopularList />
      </div>
      <main className="mx-auto max-w-[1920px] px-4 md:px-7 lg:px-[30px]">
        <Advantages />
        <PopularGames />
        <Partners />
      </main>
      <Footer />
    </div>
  );
};

export default Index;