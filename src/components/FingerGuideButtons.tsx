import { fingerButtonLayout } from "../domain/keyboard";
import { getFingerButtonLabel } from "../i18n";
import type { DisplayLanguage, FingerId } from "../domain/types";

interface FingerGuideButtonsProps {
  activeFingerId: FingerId | null;
  hasMistype: boolean;
  label: string;
  language: DisplayLanguage;
  compact?: boolean;
  plain?: boolean;
}

export function FingerGuideButtons({ activeFingerId, hasMistype, label, language, compact = false, plain = false }: FingerGuideButtonsProps) {
  return (
    <section className={`guide-card ${compact ? "compact" : ""} ${plain ? "guide-card-plain" : ""}`.trim()} data-testid="finger-button-visual">
      <div className={`finger-guide-layout ${compact ? "compact" : ""}`}>
        <div className="finger-guide-label-slot">
          <strong className="finger-guide-current" data-testid="finger-button-label">
            {label}
          </strong>
        </div>
        <div className="finger-guide-map-slot">
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
        </div>
      </div>
    </section>
  );
}
