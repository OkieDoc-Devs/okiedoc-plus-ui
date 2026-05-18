import { PAIN_MAP_AREAS, PAIN_MAP_VIEWS } from './painMapConstants.js';
import { useEffect, useState } from 'react';
import referredPainChart from '../../assets/1506_Referred_Pain_Chart.jpg';
import './PainMap.css';

const normalizeSelectedAreas = (selectedAreas) =>
  (Array.isArray(selectedAreas) ? selectedAreas : [])
    .map((area, index) => {
      if (typeof area === 'string') {
        const stringMatch = area.match(/^(front|back):(.+)$/i);
        if (stringMatch) {
          const view = stringMatch[1].toLowerCase();
          const key = stringMatch[2];
          return {
            id: `${view}:${key}`,
            view,
            key,
            label: key,
          };
        }

        return {
          id: `front:${area}:${index}`,
          view: 'front',
          key: area,
          label: area,
        };
      }

      const idMatch =
        typeof area?.id === 'string' ? area.id.match(/^(front|back):(.+)$/i) : null;
      const parsedView = idMatch ? idMatch[1].toLowerCase() : null;
      const parsedKey = idMatch ? idMatch[2] : null;
      const view = PAIN_MAP_VIEWS.includes(area?.view)
        ? area.view
        : PAIN_MAP_VIEWS.includes(parsedView)
          ? parsedView
          : 'front';
      const key = area?.key || parsedKey || area?.id || `area-${index}`;
      const label = area?.label || area?.name || area?.bodyPart || area?.value || 'Pain area';

      return {
        id: area?.id || `${view}:${key}`,
        view,
        key,
        label,
      };
    })
    .filter((area) => area.id && area.key && area.label);

const PainMap = ({
  view = 'front',
  selectedAreas = [],
  onViewChange,
  onAreaToggle,
  onAreaRemove,
  readOnly = false,
  className = '',
  emptyText = 'No areas selected',
  instructionText = 'Click on body parts to mark pain locations',
}) => {
  const normalizedView = PAIN_MAP_VIEWS.includes(view) ? view : 'front';
  const [internalView, setInternalView] = useState(normalizedView);

  useEffect(() => {
    setInternalView(normalizedView);
  }, [normalizedView]);

  const currentView = typeof onViewChange === 'function' ? normalizedView : internalView;
  const normalizedSelectedAreas = normalizeSelectedAreas(selectedAreas);
  const selectedAreaIds = new Set(normalizedSelectedAreas.map((area) => area.id));
  const canChangeView = true;
  const canToggleAreas = !readOnly && typeof onAreaToggle === 'function';
  const canRemoveAreas = !readOnly && typeof onAreaRemove === 'function';
  const handleViewChange = (nextView) => {
    if (!PAIN_MAP_VIEWS.includes(nextView)) {
      return;
    }

    if (typeof onViewChange === 'function') {
      onViewChange(nextView);
      return;
    }

    setInternalView(nextView);
  };

  return (
    <article className={`triage-pain-map-card ${className}`.trim()}>
      <h4>Pain Map</h4>
      <div className='triage-pain-map-view-toggle' role='tablist' aria-label='Pain map view'>
        <button
          type='button'
          role='tab'
          aria-selected={currentView === 'front'}
          className={`triage-pain-map-view-btn ${currentView === 'front' ? 'active' : ''}`}
          onClick={() => handleViewChange('front')}
          disabled={!canChangeView}
        >
          Front
        </button>
        <button
          type='button'
          role='tab'
          aria-selected={currentView === 'back'}
          className={`triage-pain-map-view-btn ${currentView === 'back' ? 'active' : ''}`}
          onClick={() => handleViewChange('back')}
          disabled={!canChangeView}
        >
          Back
        </button>
      </div>

      <div className='triage-pain-map-content'>
        <div className='triage-pain-map-picker'>
          <div className={`triage-pain-map-figure ${currentView === 'back' ? 'back' : 'front'}`}>
            {PAIN_MAP_AREAS[currentView].map((area) => {
              const areaId = `${currentView}:${area.key}`;
              const isSelected = selectedAreaIds.has(areaId);

              return (
                <button
                  key={areaId}
                  type='button'
                  className={`triage-body-part ${area.className} ${isSelected ? 'selected' : ''}`}
                  onClick={() => onAreaToggle?.(area)}
                  aria-pressed={isSelected}
                  aria-label={`${area.label} (${currentView})`}
                  disabled={!canToggleAreas}
                />
              );
            })}
          </div>
        </div>

        <figure className='triage-pain-reference-card'>
          <img src={referredPainChart} alt='Referred pain reference chart' />
        </figure>

        <div className='triage-pain-map-selection'>
          <div className='triage-pain-map-selection-title'>Selected pain areas:</div>
          {normalizedSelectedAreas.length === 0 ? (
            <div className='triage-pain-map-empty'>{emptyText}</div>
          ) : (
            <div className='triage-pain-map-chips'>
              {normalizedSelectedAreas.map((area) => (
                <div key={area.id} className='triage-pain-map-chip'>
                  <span>
                    {area.label}
                    {` (${area.view === 'back' ? 'Back' : 'Front'})`}
                  </span>
                  <button
                    type='button'
                    className='triage-pain-map-chip-remove'
                    onClick={() => onAreaRemove?.(area.id)}
                    aria-label={`Remove ${area.label}`}
                    disabled={!canRemoveAreas}
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className='triage-pain-map-instruction'>{instructionText}</div>
    </article>
  );
};

export default PainMap;
