import { useEffect, useMemo, useState } from 'react';
import './Charts.css';

// Gráficos SVG propios, sin librerías: barras verticales, anillo y barras
// horizontales. Todos animan al aparecer y muestran el valor al pasar el mouse.

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return mounted;
}

// Escala "bonita" para el eje: 0, paso, 2·paso… hasta cubrir el máximo.
function niceTicks(max, count = 4) {
  if (max <= 0) return [0, 1];
  const raw = max / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw);
  const ticks = [];
  for (let v = 0; v <= max + step * 0.001; v += step) ticks.push(v);
  if (ticks[ticks.length - 1] < max) ticks.push(ticks[ticks.length - 1] + step);
  return ticks;
}

export function BarChart({ data, format = (v) => v, formatAxis = format, height = 260, label }) {
  const mounted = useMounted();
  const [hover, setHover] = useState(null);
  const max = Math.max(...data.map((d) => d.value), 0);
  const ticks = useMemo(() => niceTicks(max), [max]);
  const top = ticks[ticks.length - 1] || 1;
  // Etiquetas del eje x sin amontonarse: menos en pantallas angostas.
  const maxLabels = typeof window !== 'undefined' && window.innerWidth < 600 ? 3 : 7;
  const every = Math.max(1, Math.ceil((data.length - 1) / (maxLabels - 1)));

  return (
    <div className="bar-chart" role="img" aria-label={label}>
      <div className="bar-plot" style={{ height }}>
        <div className="bar-grid" aria-hidden="true">
          {ticks.map((t) => (
            <div key={t} className="bar-gridline" style={{ bottom: `${(t / top) * 100}%` }}>
              <span>{formatAxis(t)}</span>
            </div>
          ))}
        </div>
        <div className="bar-columns">
          {data.map((d, i) => (
            <div
              key={d.key}
              className={`bar-col ${hover === i ? 'hover' : ''} ${hover != null && hover !== i ? 'dim' : ''}`}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <div
                className="bar"
                style={{
                  height: `${(d.value / top) * 100}%`,
                  transform: mounted ? 'scaleY(1)' : 'scaleY(0)',
                  transitionDelay: `${i * 18}ms`,
                }}
              />
              {hover === i && (
                <div
                  className={`chart-tip ${i > data.length * 0.7 ? 'left' : ''} ${i < data.length * 0.2 ? 'right' : ''}`}
                  style={{ bottom: `calc(${(d.value / top) * 100}% + 10px)` }}
                >
                  <strong>{format(d.value)}</strong>
                  <span>{d.tip || d.label}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="bar-axis" aria-hidden="true">
        {data.map((d, i) => {
          const show = i % every === 0 || i === data.length - 1;
          if (!show || (i !== data.length - 1 && data.length - 1 - i < every / 2)) return null;
          const left = ((i + 0.5) / data.length) * 100;
          const edge = i === 0 ? 'first' : i === data.length - 1 ? 'last' : '';
          return (
            <span key={d.key} className={edge} style={{ left: edge === 'first' ? 0 : edge === 'last' ? '100%' : `${left}%` }}>
              {d.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export function Donut({ data, center, centerLabel, size = 184, stroke = 22, format = (v) => v }) {
  const mounted = useMounted();
  const [hover, setHover] = useState(null);
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const gap = total > 0 && data.filter((d) => d.value > 0).length > 1 ? 3 : 0;
  let offset = 0;
  const active = hover != null ? data[hover] : null;

  return (
    <div className="donut">
      <div className="donut-figure" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={centerLabel}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--grid)" strokeWidth={stroke} />
          {total > 0 &&
            data.map((d, i) => {
              if (!d.value) return null;
              const len = (d.value / total) * c;
              const seg = (
                <circle
                  key={d.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  fill="none"
                  stroke={d.color}
                  strokeWidth={hover === i ? stroke + 6 : stroke}
                  strokeDasharray={`${mounted ? Math.max(len - gap, 0.5) : 0} ${c}`}
                  strokeDashoffset={-offset}
                  transform={`rotate(-90 ${size / 2} ${size / 2})`}
                  className={`donut-seg ${hover != null && hover !== i ? 'dim' : ''}`}
                  style={{ transitionDelay: `${i * 80}ms` }}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                />
              );
              offset += len;
              return seg;
            })}
        </svg>
        <div className="donut-center">
          <strong>{active ? format(active.value) : center}</strong>
          <span>{active ? active.label : centerLabel}</span>
        </div>
      </div>
      <ul className="chart-legend">
        {data.map((d, i) => (
          <li
            key={d.label}
            className={hover != null && hover !== i ? 'dim' : ''}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <i style={{ background: d.color }} />
            <span>{d.label}</span>
            <strong>{format(d.value)}</strong>
            <em>{total ? Math.round((d.value / total) * 100) : 0}%</em>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HBars({ data, format = (v) => v, color = 'var(--series-1)', empty = 'Sin datos todavía.' }) {
  const mounted = useMounted();
  const max = Math.max(...data.map((d) => d.value), 0) || 1;
  if (!data.length) return <p className="chart-empty">{empty}</p>;
  return (
    <ul className="hbars">
      {data.map((d, i) => (
        <li key={d.key || d.label}>
          <div className="hbar-head">
            <span className="hbar-label">{d.label}</span>
            <strong>{format(d.value)}</strong>
          </div>
          <div className="hbar-track">
            <div
              className="hbar-fill"
              style={{
                width: mounted ? `${Math.max((d.value / max) * 100, 1.5)}%` : '0%',
                background: d.color || color,
                transitionDelay: `${i * 60}ms`,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

// Línea mínima para la tendencia dentro de una tarjeta de cifra.
export function Sparkline({ values, color = 'var(--series-1)', width = 120, height = 36 }) {
  if (!values.length) return null;
  const max = Math.max(...values, 1);
  const step = values.length > 1 ? width / (values.length - 1) : width;
  const pts = values.map((v, i) => `${(i * step).toFixed(1)},${(height - 2 - (v / max) * (height - 4)).toFixed(1)}`);
  return (
    <svg className="sparkline" width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
