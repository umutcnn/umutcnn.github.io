import type { VisualKind } from '../../types/content';
import { AerialScene } from './AerialScene';
import { ArchitectureGraph } from './ArchitectureGraph';
import { CadWireframe } from './CadWireframe';
import { DetectionPlayground } from './DetectionPlayground';
import { FederatedSim } from './FederatedSim';
import { RobotaxiScene } from './RobotaxiScene';

/** Maps a project's visual kind to its bespoke visualisation. */
export function ProjectVisual({
  kind,
  compact = false,
  active = true,
}: {
  kind: VisualKind;
  compact?: boolean;
  active?: boolean;
}) {
  switch (kind) {
    case 'federated':
      return <FederatedSim compact={compact} active={active} />;
    case 'aerial-detection':
      return <AerialScene compact={compact} />;
    case 'robotaxi':
      return <RobotaxiScene compact={compact} />;
    case 'cad-wireframe':
      return <CadWireframe compact={compact} active={active} />;
    case 'erp-architecture':
      return <ArchitectureGraph id="maks-erp" compact={compact} />;
    case 'coil-detection':
      return <DetectionPlayground compact={compact} active={active} />;
    case 'none':
      return null;
  }
}
