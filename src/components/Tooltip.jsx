import React, { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

export default function Tooltip({ text, children }) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);

  const showTooltip = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setCoords({
      top: rect.top - 8,
      left: rect.left + rect.width / 2,
    });
    setVisible(true);
  }, []);

  const hideTooltip = useCallback(() => setVisible(false), []);

  if (!text) return children;

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        className="inline-flex"
      >
        {children}
      </div>
      {visible &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              top: coords.top,
              left: coords.left,
              transform: 'translate(-50%, -100%)',
              zIndex: 9999,
              pointerEvents: 'none',
            }}
            className="flex flex-col items-center"
          >
            <span className="bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl border border-slate-700/30">
              {text}
            </span>
            <svg className="w-3 h-2 -mt-[1px]" viewBox="0 0 12 8" fill="none">
              <path d="M6 8L0 0H12L6 8Z" className="fill-slate-900 dark:fill-slate-800" />
            </svg>
          </div>,
          document.body
        )}
    </>
  );
}
