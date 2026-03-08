import { fingerButtonLayout } from "../domain/keyboard";
import { getFingerButtonLabel } from "../i18n";
import type { DisplayLanguage, FingerId } from "../domain/types";

interface FingerGuideButtonsProps {
  activeFingerId: FingerId | null;
  hasMistype: boolean;
  helper: string;
  label: string;
  language: DisplayLanguage;
  title: string;
  compact?: boolean;
}

export function FingerGuideButtons({ activeFingerId, hasMistype, helper, label, language, title, compact = false }: FingerGuideButtonsProps) {
  return (
    <section className={`guide-card ${compact ? "compact" : ""}`} data-testid="finger-button-visual">
      <div className={`guide-card-header ${compact ? "compact" : ""}`}>
        <div>
          <span className="label">{title}</span>
          <strong data-testid="finger-button-label">{label}</strong>
        </div>
        {!compact ? <p className="guide-card-copy">{helper}</p> : null}
      </div>
      <div className={`finger-button-map ${compact ? "compact" : ""}`} aria-label="Finger guide buttons">
        {fingerButtonLayout.map((cluster) => (
          <div
            key={cluster.side}
            className={`finger-cluster ${cluster.side} ${compact ? "compact" : ""}`}
            data-testid={`finger-cluster-${cluster.side}`}
          >
            {cluster.fingers.map((fingerId) => (
              <span
                key={fingerId}
                aria-label={label}
                className={[
                  "finger-button",
                  compact ? "compact" : "",
                  activeFingerId === fingerId && !hasMistype ? "active" : "",
                  activeFingerId === fingerId && hasMistype ? "target-outline" : ""
                ]
                  .filter(Boolean)
                  .join(" ")}
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
