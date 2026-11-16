import { useId, useState } from 'react';
import { useLocale } from '../../app/providers/LocaleProvider';
import { ArchitectureGraph } from '../../components/visualizations/ArchitectureGraph';
import { DetectionPlayground } from '../../components/visualizations/DetectionPlayground';
import { FederatedSim } from '../../components/visualizations/FederatedSim';
import { ARCHITECTURES, EXPLORER_ARCHITECTURES } from '../../content/architectures';
import type { ArchitectureId } from '../../types/content';

function ArchExplorer() {
  const { t, l } = useLocale();
  const [arch, setArch] = useState<ArchitectureId>(EXPLORER_ARCHITECTURES[0]!);
  const uid = useId().replace(/:/g, '');
  return (
    <div className="viz">
      <p className="badge-note">{t.lab.arch.badge}</p>
      <fieldset className="segmented">
        <legend className="label">{t.lab.arch.select}</legend>
        {EXPLORER_ARCHITECTURES.map(id => (
          <label key={id} className={arch === id ? 'is-on' : ''}>
            <input type="radio" name={`${uid}-arch`} checked={arch === id} onChange={() => setArch(id)} />
            {l(ARCHITECTURES[id].title)}
          </label>
        ))}
      </fieldset>
      <ArchitectureGraph key={arch} id={arch} />
    </div>
  );
}

/** The heavy lab demos, split into their own chunk. */
export default function LabPanel({ id }: { id: 'fl' | 'cv' | 'arch' }) {
  if (id === 'fl') return <FederatedSim />;
  if (id === 'cv') return <DetectionPlayground />;
  return <ArchExplorer />;
}
