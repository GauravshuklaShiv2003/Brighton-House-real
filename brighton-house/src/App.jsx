import { useCallback, useEffect, useState } from 'react';
import { LeadProvider } from './components/Lead.jsx';
import { Header, Hero, Intro, Why, ReadyBand } from './components/Top.jsx';
import { Homes, Plans } from './components/Homes.jsx';
import { Explorer } from './components/Explorer.jsx';
import { Amenities, Life } from './components/Lifestyle.jsx';
import { Location } from './components/Location.jsx';
import { Developer, Faq, FinalCta, Footer, StickyBar } from './components/Closing.jsx';
import { Loader } from './components/Misc.jsx';

export default function App() {
  // The "3D buffer": the page waits for real work (fonts, building the 3D model, first frame)
  // and the tower loader fills from that actual progress, not a fake timer.
  const [sceneP, setSceneP] = useState(0);
  const [fonts, setFonts] = useState(false);
  const [frame, setFrame] = useState(false);
  const [failed, setFailed] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let alive = true;
    const ok = () => alive && setFonts(true);
    if (document.fonts?.ready) document.fonts.ready.then(ok, ok);
    else ok();
    const t = setTimeout(ok, 2500); // never wait forever on a slow network
    return () => { alive = false; clearTimeout(t); };
  }, []);

  useEffect(() => {
    const el = document.documentElement;
    el.style.overflow = done ? '' : 'hidden';
    return () => { el.style.overflow = ''; };
  }, [done]);

  const onProgress = useCallback((p) => setSceneP(p), []);
  const onReady = useCallback(() => setFrame(true), []);
  const onFail = useCallback(() => setFailed(true), []);
  const onDone = useCallback(() => setDone(true), []);

  const target = failed || (frame && fonts) ? 1 : Math.min(0.94, (fonts ? 0.18 : 0.04) + 0.76 * sceneP);

  return (
    <LeadProvider>
      <Loader target={target} onDone={onDone} />
      <Header />
      <main>
        <Hero onProgress={onProgress} onReady={onReady} onFail={onFail} />
        <Intro />
        <Why />
        <ReadyBand />
        <Homes />
        <Explorer />
        <Plans />
        <Amenities />
        <Life />
        <Location />
        <Developer />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <StickyBar />
    </LeadProvider>
  );
}
