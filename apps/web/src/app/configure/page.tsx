import { BuildShell } from "@/components/pages/PageShell";
import { Builder } from "@/components/build/Builder";
import { PRESETS, type Preset } from "@/lib/configurator/schema";

export const metadata = { title: "Build your bag | Sanchez Custom Boxing" };

/** The build step. `?preset=` starts from a design; the server prices and validates everything the builder sends. */
export default async function ConfigurePage({ searchParams }: { searchParams: Promise<{ preset?: string }> }) {
  const { preset } = await searchParams;
  const initial: Preset = (PRESETS as readonly string[]).includes(preset ?? "") ? (preset as Preset) : "plain";
  return (
    <BuildShell>
      <Builder initialPreset={initial} />
    </BuildShell>
  );
}
