import { About } from '../../sections/About/About';
import { Achievements } from '../../sections/Achievements/Achievements';
import { Contact } from '../../sections/Contact/Contact';
import { Hero } from '../../sections/Hero/Hero';
import { Lab } from '../../sections/InteractiveLab/Lab';
import { Journey } from '../../sections/Journey/Journey';
import { Work } from '../../sections/Projects/Work';
import { Research } from '../../sections/Research/Research';
import { TechStack } from '../../sections/TechStack/TechStack';

export function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Work />
      <Research />
      <Achievements />
      <TechStack />
      <Journey />
      <Lab />
      <Contact />
    </>
  );
}
