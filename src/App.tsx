import { PaletteProvider } from "./lib/PaletteContext";
import MoodShell from "./components/MoodShell";

import BackgroundCanvas from "./components/BackgroundCanvas";


import Panel from "./components/Panel";
import CollapsiblePanel from "./components/CollapsiblePanel";
import Clock from "./components/Clock";
import LocationPanel from "./components/LocationPanel";
import WeatherPanel from "./components/WeatherPanel";
import MoodPanel from "./components/MoodPanel";

export default function App() {
  return (
    <PaletteProvider>
      <MoodShell>
        <BackgroundCanvas />

        <main className="relative p-6 sm:p-8 text-[color:var(--text)]">
          {/* contenedor angosto, alineado a la izquierda */}
          <section className="w-[min(92vw,680px)] space-y-5">
            

            <Panel title="Hora actual" subtitle="Actualiza cada segundo" tone="glass" pad="sm" className="bg-black/25">
              <Clock />
            </Panel>

            {/*<Panel title="Ubicación" tone="glass" pad="sm" className="bg-black/25">
              <LocationPanel bare />
            </Panel>*/}

            <Panel title="Clima actual" tone="glass" pad="sm" className="bg-black/25"
              actions={<span className="text-xs text-zinc-300">Fuente: Open-Meteo</span>}
            >
              <WeatherPanel bare />
            </Panel>

            <CollapsiblePanel title="Mood" subtitle="Podés fijar una paleta manual">
              <MoodPanel bare />
            </CollapsiblePanel>
          </section>
        </main>
      </MoodShell>
    </PaletteProvider>
  );
}
