import { fingerButtonLayout } from "../domain/keyboard";
import { getFingerButtonLabel } from "../i18n";
import type { DisplayLanguage, FingerId } from "../domain/types";

interface FingerGuideButtonsProps {
  activeFingerId: FingerId | null;
  label: string;
  language: DisplayLanguage;
}

export function FingerGuideButtons({ activeFingerId, label, language }: FingerGuideButtonsProps) {
  return (
    <section className="guide-card" data-testid="finger-button-visual">
      <div className="guide-card-header">
        <span className="label">Finger buttons</span>
        <strong data-testid="finger-button-label">{label}</strong>
      </div>
      <div className="finger-button-map" aria-label="Finger guide buttons">
        {fingerButtonLayout.map((cluster) => (
          <div key={cluster.side} className={`finger-cluster ${cluster.side}`} data-testid={`finger-cluster-${cluster.side}`}>
            {cluster.fingers.map((fingerId) => (
              <span
                key={fingerId}
                aria-label={label}
                className={`finger-button ${activeFingerId === fingerId ? "active" : ""}`}
                data-testid={activeFingerId === fingerId ? "active-finger-button" : undefined}
                data-finger-id={fingerId}
              >
                {getFingerButtonLabel(language, fingerId)}
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
