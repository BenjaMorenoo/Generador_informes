import { useMemo } from 'react';
import { useDocumentStore } from '../store/documentStore';
import { Seccion, Tabla, EstiloTabla, PRESETS_TABLA } from '../types';
import { formatFechaEspanol } from '../utils/date';
import { formatAPA7, sortReferences } from '../utils/apa/formatCitation';

function renderContenido(contenido: string): string {
  const lines = contenido.split('\n');
  let html = '';
  let inList = false;
  let inSubList = false;

  for (const raw of lines) {
    const line = raw;
    if (/^\s{2,}- /.test(line)) {
      if (!inSubList) { html += '<ul style="margin-left:2em;list-style-type:circle">'; inSubList = true; }
      html += `<li style="margin-bottom:0.3em">${line.replace(/^\s+- /, '')}</li>`;
    } else if (/^- /.test(line)) {
      if (inSubList) { html += '</ul>'; inSubList = false; }
      if (!inList) { html += '<ul style="margin-left:1.2em;list-style-type:disc">'; inList = true; }
      html += `<li style="margin-bottom:0.3em">${line.replace(/^- /, '')}</li>`;
    } else {
      if (inSubList) { html += '</ul>'; inSubList = false; }
      if (inList) { html += '</ul>'; inList = false; }
      if (line.trim() === '') {
        html += '<br/>';
      } else {
        html += `<p style="margin:0 0 0.6em 0;text-align:justify">${line}</p>`;
      }
    }
  }
  if (inSubList) html += '</ul>';
  if (inList) html += '</ul>';
  return html;
}

function renderTabla(tabla: Tabla, tablaNum: number, tamano: number): React.ReactNode {
  const { estilo, columnas, filas, descripcion } = tabla;

  const borderStyle = (side: 'top' | 'bottom' | 'left' | 'right'): string => {
    const b = `1px solid ${estilo.colorBorde}`;
    if (estilo.tiposBorde === 'todos') return b;
    if (estilo.tiposBorde === 'horizontales') return side === 'top' || side === 'bottom' ? b : 'none';
    if (estilo.tiposBorde === 'exterior') return 'none';
    return 'none';
  };
  const outerBorder = estilo.tiposBorde === 'exterior' || estilo.tiposBorde === 'todos'
    ? `1px solid ${estilo.colorBorde}`
    : 'none';

  return (
    <div key={tabla.id} style={{ margin: '0.5cm 0', textAlign: 'center' }}>
      <p style={{ textAlign: 'center', marginBottom: '0.15cm', fontSize: `${tamano - 1}pt` }}>
        <strong>Tabla {tablaNum}.</strong> {descripcion}
      </p>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: `${tamano - 1}pt`,
          border: outerBorder,
        }}
      >
        <thead>
          <tr>
            {columnas.map((col, ci) => (
              <th
                key={ci}
                style={{
                  background: estilo.colorEncabezado,
                  color: estilo.colorTextoEncabezado,
                  fontWeight: 'bold',
                  padding: '0.2cm 0.3cm',
                  textAlign: 'left',
                  borderTop: borderStyle('top'),
                  borderBottom: borderStyle('bottom'),
                  borderLeft: ci === 0 ? borderStyle('left') : borderStyle('left'),
                  borderRight: borderStyle('right'),
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila, fi) => (
            <tr
              key={fila.id}
              style={{ background: fi % 2 === 0 ? estilo.colorFilaImpar : estilo.colorFilaPar }}
            >
              {fila.celdas.map((celda, ci) => (
                <td
                  key={celda.id}
                  style={{
                    padding: '0.2cm 0.3cm',
                    textAlign: 'left',
                    borderTop: borderStyle('top'),
                    borderBottom: borderStyle('bottom'),
                    borderLeft: ci === 0 ? borderStyle('left') : borderStyle('left'),
                    borderRight: borderStyle('right'),
                  }}
                >
                  {celda.valor}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function buildTOCNumbers(secciones: Seccion[]) {
  const counters = [0, 0, 0];
  return secciones.map((sec) => {
    const lvl = sec.nivel - 1;
    counters[lvl]++;
    for (let i = lvl + 1; i < 3; i++) counters[i] = 0;
    if (sec.nivel === 1) return `${counters[0]}.`;
    if (sec.nivel === 2) return `${counters[0]}.${counters[1]}`;
    return `${counters[0]}.${counters[1]}.${counters[2]}`;
  });
}

export function VistaPrevia() {
  const { documento } = useDocumentStore();
  const { metadata, config, secciones, referencias } = documento;

  const tocNumbers = useMemo(() => buildTOCNumbers(secciones), [secciones]);
  const sortedRefs = useMemo(() => sortReferences(referencias), [referencias]);

  const pageStyle: React.CSSProperties = {
    fontFamily: config.fuente,
    fontSize: `${config.tamano}pt`,
    lineHeight: config.interlineado,
    padding: `${config.margenes.top}cm ${config.margenes.right}cm ${config.margenes.bottom}cm ${config.margenes.left}cm`,
    background: 'white',
    width: '21cm',
    minHeight: '29.7cm',
    boxSizing: 'border-box',
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
    margin: '0 auto',
    position: 'relative',
  };

  const dividerStyle: React.CSSProperties = {
    ...pageStyle,
    borderTop: '3px solid #1e40af',
    marginTop: '0.5cm',
  };

  const fechaFormateada = formatFechaEspanol(metadata.fecha);

  // Contadores globales de figuras y tablas
  let figNum = 0;
  let tablaNum = 0;
  // Mapa tablaId -> número global (precalculado para índice de tablas)
  const tablaNumMap = useMemo(() => {
    const map: Record<string, number> = {};
    let n = 0;
    for (const sec of secciones) {
      for (const t of sec.tablas ?? []) {
        n++;
        map[t.id] = n;
      }
    }
    return map;
  }, [secciones]);

  return (
    <div style={{ background: '#e5e7eb', padding: '1.5cm 1cm', overflowY: 'auto', height: '100%' }}>

      {/* ═══ PORTADA ═══ */}
      <div style={pageStyle}>
        <div style={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ width: '100%' }}>
            {metadata.logoUrl ? (
              <img src={metadata.logoUrl} alt="Logo" style={{ height: '80px', objectFit: 'contain', marginBottom: '1cm' }} />
            ) : (
              <div style={{ height: '80px', lineHeight: '80px', color: '#6b7280', fontSize: '14pt', marginBottom: '1cm', fontWeight: 'bold' }}>
                {metadata.institucion || 'INSTITUCIÓN'}
              </div>
            )}
            <div style={{ height: '3cm' }} />
            <p style={{ fontWeight: 'bold', fontSize: '18pt', textTransform: 'uppercase', marginBottom: '0.5cm', letterSpacing: '0.05em' }}>
              {metadata.proyecto || 'NOMBRE DEL PROYECTO'}
            </p>
            <p style={{ fontSize: '14pt', marginBottom: '2cm' }}>
              – {metadata.entrega || 'ENTREGA 1'} –
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7cm', alignItems: 'center', marginBottom: '1cm' }}>
              {metadata.asignatura && (
                <div>
                  <p style={{ fontWeight: 'bold', margin: 0 }}>Asignatura</p>
                  <p style={{ margin: 0 }}>{metadata.asignatura}</p>
                </div>
              )}
              {metadata.seccion && (
                <div>
                  <p style={{ fontWeight: 'bold', margin: 0 }}>Sección</p>
                  <p style={{ margin: 0 }}>{metadata.seccion}</p>
                </div>
              )}
              {metadata.profesor && (
                <div>
                  <p style={{ fontWeight: 'bold', margin: 0 }}>Profesor</p>
                  <p style={{ margin: 0 }}>{metadata.profesor}</p>
                </div>
              )}
              {metadata.integrantes.length > 0 && (
                <div>
                  <p style={{ fontWeight: 'bold', margin: 0 }}>Integrantes</p>
                  {metadata.integrantes.map((i) => (
                    <p key={i.id} style={{ margin: 0 }}>{i.nombre}{i.rol ? ` – ${i.rol}` : ''}</p>
                  ))}
                </div>
              )}
            </div>
          </div>

          <p style={{ fontWeight: 'bold', fontSize: `${config.tamano}pt` }}>
            {metadata.ciudad || 'Ciudad'}{fechaFormateada ? `, ${fechaFormateada}` : ''}
          </p>
        </div>
      </div>

      {/* ═══ IDENTIFICACIÓN DEL DOCUMENTO ═══ */}
      {documento.mostrarIdentificacion !== false && (
      <div style={dividerStyle}>
        <h1 style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: `${config.tamano + 2}pt`, marginBottom: '0.5cm' }}>
          Identificación del Documento
        </h1>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: `${config.tamano}pt` }}>
          <tbody>
            {[
              ['Identificación', `${metadata.proyecto} – ${metadata.entrega}`],
              ['Proyecto', metadata.proyecto],
              ['Versión', metadata.version],
              ['Documento mantenido por', metadata.mantenidoPor],
              ['Fecha última revisión', formatFechaEspanol(metadata.fechaUltimaRevision)],
              ['Fecha próxima revisión', formatFechaEspanol(metadata.fechaProximaRevision)],
              ['Documento aprobado por', metadata.aprobadoPor],
              ['Fecha última aprobación', formatFechaEspanol(metadata.fechaUltimaAprobacion)],
            ].map(([campo, valor]) => (
              <tr key={campo} style={{ borderBottom: '1px solid #d1d5db' }}>
                <td style={{ fontWeight: 'bold', padding: '0.25cm 0.3cm', width: '40%', background: '#f9fafb', border: '1px solid #d1d5db' }}>
                  {campo}
                </td>
                <td style={{ padding: '0.25cm 0.3cm', border: '1px solid #d1d5db' }}>{valor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      {/* ═══ HISTORIAL DE REVISIONES ═══ */}
      {metadata.historialRevisiones.length > 0 && (
        <div style={dividerStyle}>
          <h1 style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: `${config.tamano + 2}pt`, marginBottom: '0.5cm' }}>
            Historial de Revisiones
          </h1>
          {(() => {
            const eh = metadata.estiloHistorial ?? PRESETS_TABLA.azul;
            const borde = (side: 'top' | 'bottom' | 'left' | 'right'): string => {
              const b = `1px solid ${eh.colorBorde}`;
              if (eh.tiposBorde === 'todos') return b;
              if (eh.tiposBorde === 'horizontales') return side === 'top' || side === 'bottom' ? b : 'none';
              return 'none';
            };
            const outerBorder = eh.tiposBorde === 'exterior' || eh.tiposBorde === 'todos'
              ? `1px solid ${eh.colorBorde}` : 'none';
            return (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: `${config.tamano}pt`, border: outerBorder }}>
                <thead>
                  <tr style={{ background: eh.colorEncabezado, color: eh.colorTextoEncabezado }}>
                    {['Fecha', 'Revisión', 'Autor', 'Modificación'].map((h) => (
                      <th key={h} style={{ padding: '0.2cm 0.3cm', textAlign: 'left', borderTop: borde('top'), borderBottom: borde('bottom'), borderLeft: borde('left'), borderRight: borde('right') }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {metadata.historialRevisiones.map((fila, idx) => (
                    <tr key={fila.id} style={{ background: idx % 2 === 0 ? eh.colorFilaImpar : eh.colorFilaPar }}>
                      {[formatFechaEspanol(fila.fecha), fila.revision, fila.autor, fila.modificacion].map((val, ci) => (
                        <td key={ci} style={{ padding: '0.2cm 0.3cm', borderTop: borde('top'), borderBottom: borde('bottom'), borderLeft: borde('left'), borderRight: borde('right') }}>{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          })()}
        </div>
      )}

      {/* ═══ ÍNDICE GENERAL ═══ */}
      <div style={dividerStyle}>
        <h1 style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: `${config.tamano + 2}pt`, marginBottom: '0.5cm' }}>
          Índice General
        </h1>
        <div style={{ fontSize: `${config.tamano}pt` }}>
          {secciones.map((sec, idx) => {
            const num = tocNumbers[idx];
            const indent = (sec.nivel - 1) * 1.2;
            const isBold = sec.nivel === 1;
            return (
              <div
                key={sec.id}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  paddingLeft: `${indent}cm`,
                  marginBottom: '0.2cm',
                  fontWeight: isBold ? 'bold' : 'normal',
                }}
              >
                <span style={{ minWidth: `${1.5 + indent * 0.3}cm` }}>{num}</span>
                <span style={{ flex: 1 }}>{sec.titulo || '(sin título)'}</span>
                <span
                  style={{
                    borderBottom: '1px dotted #9ca3af',
                    flex: 1,
                    height: '0.5em',
                    margin: '0 0.3cm',
                  }}
                />
                <span style={{ minWidth: '1.5cm', textAlign: 'right', color: '#6b7280' }}>—</span>
              </div>
            );
          })}
          {/* Referencias en el índice */}
          {referencias.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '0.2cm', fontWeight: 'bold' }}>
              <span style={{ flex: 1 }}>Referencias</span>
              <span style={{ borderBottom: '1px dotted #9ca3af', flex: 1, height: '0.5em', margin: '0 0.3cm' }} />
              <span style={{ minWidth: '1.5cm', textAlign: 'right', color: '#6b7280' }}>—</span>
            </div>
          )}
        </div>
      </div>

      {/* ═══ ÍNDICE DE FIGURAS ═══ */}
      {secciones.some((s) => s.imagenes.length > 0) && (
        <div style={dividerStyle}>
          <h1 style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: `${config.tamano + 2}pt`, marginBottom: '0.5cm' }}>
            Índice de Figuras
          </h1>
          {(() => {
            let n = 0;
            return secciones.flatMap((sec) =>
              sec.imagenes.map((img) => {
                n++;
                return (
                  <div key={img.id} style={{ display: 'flex', alignItems: 'baseline', marginBottom: '0.2cm', fontSize: `${config.tamano}pt` }}>
                    <span style={{ flex: 1 }}>Figura {n}. {img.descripcion || '(sin descripción)'}</span>
                    <span style={{ borderBottom: '1px dotted #9ca3af', flex: 1, height: '0.5em', margin: '0 0.3cm' }} />
                    <span style={{ minWidth: '1.5cm', textAlign: 'right', color: '#6b7280' }}>—</span>
                  </div>
                );
              })
            );
          })()}
        </div>
      )}

      {/* ═══ ÍNDICE DE TABLAS ═══ */}
      {secciones.some((s) => (s.tablas ?? []).length > 0) && (
        <div style={dividerStyle}>
          <h1 style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: `${config.tamano + 2}pt`, marginBottom: '0.5cm' }}>
            Índice de Tablas
          </h1>
          {secciones.flatMap((sec) =>
            (sec.tablas ?? []).map((t) => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'baseline', marginBottom: '0.2cm', fontSize: `${config.tamano}pt` }}>
                <span style={{ flex: 1 }}>Tabla {tablaNumMap[t.id]}. {t.descripcion || '(sin descripción)'}</span>
                <span style={{ borderBottom: '1px dotted #9ca3af', flex: 1, height: '0.5em', margin: '0 0.3cm' }} />
                <span style={{ minWidth: '1.5cm', textAlign: 'right', color: '#6b7280' }}>—</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* ═══ SECCIONES DEL CUERPO — agrupadas por capítulo H1 ═══ */}
      {(() => {
        // Agrupa secciones: cada H1 abre un nuevo "capítulo" (página blanca).
        // Las H2/H3 van DENTRO del capítulo al que pertenecen.
        type Chapter = { headIdx: number | null; items: number[] };
        const chapters: Chapter[] = [];
        let current: Chapter = { headIdx: null, items: [] };

        secciones.forEach((sec, idx) => {
          if (sec.nivel === 1) {
            if (current.headIdx !== null || current.items.length > 0) chapters.push(current);
            current = { headIdx: idx, items: [] };
          } else {
            current.items.push(idx);
          }
        });
        if (current.headIdx !== null || current.items.length > 0) chapters.push(current);

        const renderSeccion = (idx: number) => {
          const sec = secciones[idx];
          const num = tocNumbers[idx];
          const isH1 = sec.nivel === 1;
          const headingStyle: React.CSSProperties = {
            fontWeight: 'bold',
            textTransform: isH1 ? 'uppercase' : 'none',
            fontSize: isH1
              ? `${config.tamano + 3}pt`
              : sec.nivel === 2
              ? `${config.tamano + 1}pt`
              : `${config.tamano}pt`,
            margin: isH1 ? '0 0 0.4cm 0' : `0.4cm 0 0.25cm ${(sec.nivel - 1) * 0.4}cm`,
          };
          return (
            <div key={sec.id} style={isH1 ? undefined : { paddingLeft: `${(sec.nivel - 1) * 0.4}cm` }}>
              <h2 style={headingStyle}>{num} {sec.titulo}</h2>
              <div
                style={{ fontSize: `${config.tamano}pt`, lineHeight: config.interlineado, textAlign: 'justify' }}
                dangerouslySetInnerHTML={{ __html: renderContenido(sec.contenido) }}
              />
              {sec.imagenes.map((img) => {
                figNum++;
                const fn = figNum;
                return (
                  <div key={img.id} style={{ textAlign: 'center', margin: '0.5cm 0' }}>
                    <img src={img.url} alt={img.descripcion} style={{ maxWidth: '100%', maxHeight: '10cm', objectFit: 'contain' }} />
                    <p style={{ textAlign: 'center', marginTop: '0.2cm', fontSize: `${config.tamano - 1}pt` }}>
                      <strong>Figura {fn}.</strong> {img.descripcion}
                    </p>
                  </div>
                );
              })}
              {(sec.tablas ?? []).map((tabla) => {
                tablaNum++;
                const tn = tablaNum;
                return renderTabla(tabla, tn, config.tamano);
              })}
            </div>
          );
        };

        return chapters.map((chapter, ci) => (
          <div key={`chapter-${ci}`} style={dividerStyle}>
            {chapter.headIdx !== null && renderSeccion(chapter.headIdx)}
            {chapter.items.map((idx) => renderSeccion(idx))}
          </div>
        ));
      })()}

      {/* ═══ REFERENCIAS ═══ */}
      {sortedRefs.length > 0 && (
        <div style={dividerStyle}>
          <h1 style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: `${config.tamano + 3}pt`, marginBottom: '0.5cm' }}>
            Referencias
          </h1>
          <div style={{ fontSize: `${config.tamano}pt`, lineHeight: config.interlineado }}>
            {sortedRefs.map((ref) => (
              <p
                key={ref.id}
                style={{ textIndent: '-1.27cm', paddingLeft: '1.27cm', marginBottom: '0.4cm', textAlign: 'justify' }}
                dangerouslySetInnerHTML={{ __html: formatAPA7(ref) }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
