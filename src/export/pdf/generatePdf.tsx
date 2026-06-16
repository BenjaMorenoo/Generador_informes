import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  pdf,
} from '@react-pdf/renderer';
import { DocumentoAcademico, Seccion } from '../../types';
import { formatAPA7Plain, sortReferences } from '../../utils/apa/formatCitation';
import { formatFechaEspanol } from '../../utils/date';

// Fuentes PDF integradas (no requieren registro externo)
// Times-Roman / Times-Bold / Times-Italic / Times-BoldItalic
// Helvetica / Helvetica-Bold / Helvetica-Oblique / Helvetica-BoldOblique
// Courier / Courier-Bold
const FONT_MAP: Record<string, { regular: string; bold: string }> = {
  'Times New Roman': { regular: 'Times-Roman', bold: 'Times-Bold' },
  Georgia:           { regular: 'Times-Roman', bold: 'Times-Bold' },
  Arial:             { regular: 'Helvetica',   bold: 'Helvetica-Bold' },
  Calibri:           { regular: 'Helvetica',   bold: 'Helvetica-Bold' },
  Courier:           { regular: 'Courier',     bold: 'Courier-Bold' },
};

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

function cmToPt(cm: number) {
  return cm * 28.3465;
}

function makeStyles(doc: DocumentoAcademico) {
  const { config } = doc;
  const sz = config.tamano;
  const lh = config.interlineado;
  const fonts = FONT_MAP[config.fuente] ?? FONT_MAP['Times New Roman'];

  return {
    fonts,
    styles: StyleSheet.create({
      page: {
        fontFamily: fonts.regular,
        fontSize: sz,
        lineHeight: lh,
        paddingTop: cmToPt(config.margenes.top),
        paddingBottom: cmToPt(config.margenes.bottom) + 22,
        paddingLeft: cmToPt(config.margenes.left),
        paddingRight: cmToPt(config.margenes.right),
      },
      coverPage: {
        fontFamily: fonts.regular,
        fontSize: sz,
        lineHeight: lh,
        paddingTop: cmToPt(config.margenes.top),
        paddingBottom: cmToPt(config.margenes.bottom),
        paddingLeft: cmToPt(config.margenes.left),
        paddingRight: cmToPt(config.margenes.right),
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      h1: {
        fontFamily: fonts.bold,
        fontSize: sz + 3,
        textTransform: 'uppercase',
        marginBottom: 8,
        marginTop: 12,
      },
      h2: {
        fontFamily: fonts.bold,
        fontSize: sz + 1,
        marginBottom: 6,
        marginTop: 10,
      },
      h3: {
        fontFamily: fonts.bold,
        fontSize: sz,
        marginBottom: 4,
        marginTop: 8,
      },
      body: {
        fontFamily: fonts.regular,
        fontSize: sz,
        lineHeight: lh,
        textAlign: 'justify',
        marginBottom: 4,
      },
      bold: { fontFamily: fonts.bold },
      center: { textAlign: 'center' },
      pageNumber: {
        position: 'absolute',
        fontFamily: fonts.regular,
        fontSize: sz - 1,
        bottom: 14,
        right: cmToPt(config.margenes.right),
        color: 'grey',
      },
      divider: { borderTopWidth: 2, borderColor: '#1e40af', marginBottom: 12 },
      tableRowAlt0: { flexDirection: 'row', backgroundColor: '#f9fafb', borderBottomWidth: 1, borderColor: '#d1d5db' },
      tableRowAlt1: { flexDirection: 'row', backgroundColor: 'white', borderBottomWidth: 1, borderColor: '#d1d5db' },
      tableCellLabel: { fontFamily: fonts.bold, fontSize: sz - 1, padding: 4, width: '40%', backgroundColor: '#f3f4f6', borderRightWidth: 1, borderColor: '#d1d5db' },
      tableCellValue: { fontFamily: fonts.regular, fontSize: sz - 1, padding: 4, width: '60%' },
      tableHeaderCell: { fontFamily: fonts.bold, fontSize: sz - 1, padding: 4, color: 'white', backgroundColor: '#1e40af', borderRightWidth: 1, borderColor: '#1e3a8a' },
      figCaption: { fontFamily: fonts.regular, textAlign: 'center', fontSize: sz - 1, marginTop: 4, marginBottom: 8 },
      figCaptionBold: { fontFamily: fonts.bold, textAlign: 'center', fontSize: sz - 1 },
      reference: { fontFamily: fonts.regular, fontSize: sz, lineHeight: lh, textAlign: 'justify', marginBottom: 6, marginLeft: 18 },
      tocEntry: { flexDirection: 'row', marginBottom: 3 },
      tocBold: { fontFamily: fonts.bold, fontSize: sz },
      tocNormal: { fontFamily: fonts.regular, fontSize: sz },
      tocDots: { fontFamily: fonts.regular, fontSize: sz, color: '#6b7280' },
    }),
  };
}

function parseLines(contenido: string, styles: ReturnType<typeof makeStyles>['styles'], fonts: ReturnType<typeof makeStyles>['fonts'], sz: number) {
  return contenido.split('\n').map((raw, idx) => {
    if (/^\s{2,}- /.test(raw)) {
      return <Text key={idx} style={[styles.body, { marginLeft: 24 }]}>{'  • '}{raw.replace(/^\s+- /, '')}</Text>;
    }
    if (/^- /.test(raw)) {
      return <Text key={idx} style={[styles.body, { marginLeft: 12 }]}>{'• '}{raw.replace(/^- /, '')}</Text>;
    }
    if (raw.trim() === '') return <Text key={idx} style={{ fontSize: sz / 2 }}>{' '}</Text>;
    return <Text key={idx} style={styles.body}>{raw}</Text>;
  });
}

export async function generatePdf(doc: DocumentoAcademico): Promise<Blob> {
  const { metadata, config, secciones, referencias } = doc;
  const { styles, fonts } = makeStyles(doc);
  const sz = config.tamano;
  const tocNumbers = buildTOCNumbers(secciones);
  const sortedRefs = sortReferences(referencias);

  let figCounter = 0;
  let tablaCounter = 0;

  // Agrupar secciones en capítulos (H1 + hijos H2/H3)
  type Chapter = { headIdx: number | null; items: number[] };
  const chapters: Chapter[] = [];
  let curr: Chapter = { headIdx: null, items: [] };
  secciones.forEach((sec, idx) => {
    if (sec.nivel === 1) {
      if (curr.headIdx !== null || curr.items.length > 0) chapters.push(curr);
      curr = { headIdx: idx, items: [] };
    } else {
      curr.items.push(idx);
    }
  });
  if (curr.headIdx !== null || curr.items.length > 0) chapters.push(curr);

  const renderSeccionContent = (idx: number) => {
    const sec = secciones[idx];
    const num = tocNumbers[idx];
    const hStyle = sec.nivel === 1 ? styles.h1 : sec.nivel === 2 ? styles.h2 : styles.h3;
    const indent = (sec.nivel - 1) * 12;

    return (
      <View key={sec.id} style={{ paddingLeft: indent }}>
        <Text style={hStyle}>{num} {sec.titulo}</Text>
        {parseLines(sec.contenido, styles, fonts, sz)}
        {sec.imagenes.map((img) => {
          figCounter++;
          const fn = figCounter;
          return (
            <View key={img.id} style={{ alignItems: 'center', marginVertical: 8 }}>
              <Image src={img.url} style={{ maxWidth: 360, maxHeight: 200, objectFit: 'contain' }} />
              <Text style={styles.figCaption}>
                <Text style={styles.figCaptionBold}>Figura {fn}. </Text>{img.descripcion}
              </Text>
            </View>
          );
        })}
        {(sec.tablas ?? []).map((tabla) => {
          tablaCounter++;
          const tn = tablaCounter;
          const { estilo, columnas, filas, descripcion } = tabla;
          const headerBg = estilo.colorEncabezado;
          const headerColor = estilo.colorTextoEncabezado;
          const borderColor = estilo.colorBorde;
          const showBorder = estilo.tiposBorde !== 'ninguno';
          const borderW = showBorder ? 1 : 0;

          return (
            <View key={tabla.id} style={{ marginVertical: 8 }}>
              <Text style={[styles.figCaption, { marginBottom: 4 }]}>
                <Text style={styles.figCaptionBold}>Tabla {tn}. </Text>{descripcion}
              </Text>
              {/* Header */}
              <View style={{ flexDirection: 'row', backgroundColor: headerBg, borderWidth: borderW, borderColor: borderColor }}>
                {columnas.map((col, ci) => (
                  <Text
                    key={ci}
                    style={{
                      flex: 1,
                      fontFamily: fonts.bold,
                      fontSize: sz - 2,
                      color: headerColor,
                      padding: 4,
                      borderRightWidth: ci < columnas.length - 1 ? borderW : 0,
                      borderRightColor: borderColor,
                    }}
                  >
                    {col}
                  </Text>
                ))}
              </View>
              {/* Filas */}
              {filas.map((fila, fi) => (
                <View
                  key={fila.id}
                  style={{
                    flexDirection: 'row',
                    backgroundColor: fi % 2 === 0 ? estilo.colorFilaImpar : estilo.colorFilaPar,
                    borderBottomWidth: borderW,
                    borderLeftWidth: borderW,
                    borderRightWidth: borderW,
                    borderColor: borderColor,
                  }}
                >
                  {fila.celdas.map((celda, ci) => (
                    <Text
                      key={celda.id}
                      style={{
                        flex: 1,
                        fontFamily: fonts.regular,
                        fontSize: sz - 2,
                        padding: 4,
                        borderRightWidth: ci < fila.celdas.length - 1 ? borderW : 0,
                        borderRightColor: borderColor,
                      }}
                    >
                      {celda.valor}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          );
        })}
      </View>
    );
  };

  const PdfDoc = (
    <Document title={metadata.proyecto} author={metadata.integrantes.map((i) => i.nombre).join(', ')}>

      {/* ── PORTADA ── */}
      <Page size="A4" style={styles.coverPage}>
        <View style={{ alignItems: 'center', width: '100%' }}>
          {metadata.logoUrl
            ? <Image src={metadata.logoUrl} style={{ width: 120, height: 70, objectFit: 'contain', marginBottom: 28 }} />
            : <Text style={[styles.bold, { fontSize: sz + 4, marginBottom: 28, textAlign: 'center' }]}>{metadata.institucion}</Text>
          }
          <View style={{ height: 36 }} />
          <Text style={[styles.bold, { fontFamily: fonts.bold, fontSize: sz + 6, textTransform: 'uppercase', textAlign: 'center', marginBottom: 8 }]}>
            {metadata.proyecto || 'NOMBRE DEL PROYECTO'}
          </Text>
          <Text style={{ fontFamily: fonts.regular, fontSize: sz + 1, textAlign: 'center', marginBottom: 36 }}>
            – {metadata.entrega || 'ENTREGA 1'} –
          </Text>
          {metadata.asignatura ? <Text style={[styles.bold, styles.center, { marginTop: 10 }]}>Asignatura</Text> : null}
          {metadata.asignatura ? <Text style={[styles.center, { fontFamily: fonts.regular }]}>{metadata.asignatura}</Text> : null}
          {metadata.seccion  ? <Text style={[styles.bold, styles.center, { marginTop: 10 }]}>Sección</Text> : null}
          {metadata.seccion  ? <Text style={[styles.center, { fontFamily: fonts.regular }]}>{metadata.seccion}</Text> : null}
          {metadata.profesor ? <Text style={[styles.bold, styles.center, { marginTop: 10 }]}>Profesor</Text> : null}
          {metadata.profesor ? <Text style={[styles.center, { fontFamily: fonts.regular }]}>{metadata.profesor}</Text> : null}
          {metadata.integrantes.length > 0 && <Text style={[styles.bold, styles.center, { marginTop: 10 }]}>Integrantes</Text>}
          {metadata.integrantes.map((i) => (
            <Text key={i.id} style={[styles.center, { fontFamily: fonts.regular }]}>
              {i.nombre}{i.rol ? ` – ${i.rol}` : ''}
            </Text>
          ))}
        </View>
        <Text style={[styles.bold, styles.center]}>
          {metadata.ciudad}, {formatFechaEspanol(metadata.fecha)}
        </Text>
      </Page>

      {/* ── IDENTIFICACIÓN ── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.divider} />
        <Text style={styles.h1}>Identificación del Documento</Text>
        <View style={{ borderWidth: 1, borderColor: '#d1d5db' }}>
          {[
            ['Identificación', `${metadata.proyecto} – ${metadata.entrega}`],
            ['Proyecto', metadata.proyecto],
            ['Versión', metadata.version],
            ['Documento mantenido por', metadata.mantenidoPor],
            ['Fecha última revisión', formatFechaEspanol(metadata.fechaUltimaRevision)],
            ['Fecha próxima revisión', formatFechaEspanol(metadata.fechaProximaRevision)],
            ['Documento aprobado por', metadata.aprobadoPor],
            ['Fecha última aprobación', formatFechaEspanol(metadata.fechaUltimaAprobacion)],
          ].map(([campo, valor], idx) => (
            <View key={idx} style={idx % 2 === 0 ? styles.tableRowAlt0 : styles.tableRowAlt1}>
              <Text style={styles.tableCellLabel}>{campo}</Text>
              <Text style={styles.tableCellValue}>{valor}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
      </Page>

      {/* ── HISTORIAL ── */}
      {metadata.historialRevisiones.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.divider} />
          <Text style={styles.h1}>Historial de Revisiones</Text>
          <View style={{ borderWidth: 1, borderColor: '#d1d5db' }}>
            <View style={{ flexDirection: 'row' }}>
              {['Fecha', 'Revisión', 'Autor', 'Modificación'].map((h) => (
                <Text key={h} style={[styles.tableHeaderCell, { flex: h === 'Modificación' ? 2 : 1 }]}>{h}</Text>
              ))}
            </View>
            {metadata.historialRevisiones.map((fila, idx) => (
              <View key={fila.id} style={idx % 2 === 0 ? styles.tableRowAlt0 : styles.tableRowAlt1}>
                <Text style={[styles.tableCellValue, { flex: 1 }]}>{formatFechaEspanol(fila.fecha)}</Text>
                <Text style={[styles.tableCellValue, { flex: 1 }]}>{fila.revision}</Text>
                <Text style={[styles.tableCellValue, { flex: 1 }]}>{fila.autor}</Text>
                <Text style={[styles.tableCellValue, { flex: 2 }]}>{fila.modificacion}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
        </Page>
      )}

      {/* ── ÍNDICE GENERAL ── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.divider} />
        <Text style={styles.h1}>Índice General</Text>
        {secciones.map((sec, idx) => (
          <View key={sec.id} style={[styles.tocEntry, { paddingLeft: (sec.nivel - 1) * 12 }]}>
            <Text style={sec.nivel === 1 ? styles.tocBold : styles.tocNormal}>
              {tocNumbers[idx]}{'  '}{sec.titulo || '(sin título)'}
            </Text>
          </View>
        ))}
        {referencias.length > 0 && (
          <View style={styles.tocEntry}>
            <Text style={styles.tocBold}>Referencias</Text>
          </View>
        )}
        <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
      </Page>

      {/* ── ÍNDICE DE FIGURAS ── */}
      {secciones.some((s) => s.imagenes.length > 0) && (
        <Page size="A4" style={styles.page}>
          <View style={styles.divider} />
          <Text style={styles.h1}>Índice de Figuras</Text>
          {(() => {
            let n = 0;
            return secciones.flatMap((sec) =>
              sec.imagenes.map((img) => {
                n++;
                return (
                  <View key={img.id} style={styles.tocEntry}>
                    <Text style={styles.tocNormal}>Figura {n}. {img.descripcion}</Text>
                  </View>
                );
              })
            );
          })()}
          <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
        </Page>
      )}

      {/* ── ÍNDICE DE TABLAS ── */}
      {secciones.some((s) => (s.tablas ?? []).length > 0) && (
        <Page size="A4" style={styles.page}>
          <View style={styles.divider} />
          <Text style={styles.h1}>Índice de Tablas</Text>
          {(() => {
            let n = 0;
            return secciones.flatMap((sec) =>
              (sec.tablas ?? []).map((t) => {
                n++;
                return (
                  <View key={t.id} style={styles.tocEntry}>
                    <Text style={styles.tocNormal}>Tabla {n}. {t.descripcion}</Text>
                  </View>
                );
              })
            );
          })()}
          <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
        </Page>
      )}

      {/* ── CAPÍTULOS ── cada H1 abre una página nueva; H2/H3 van dentro */}
      {chapters.map((chapter, ci) => (
        <Page key={`chapter-${ci}`} size="A4" style={styles.page}>
          <View style={styles.divider} />
          {chapter.headIdx !== null && renderSeccionContent(chapter.headIdx)}
          {chapter.items.map((idx) => renderSeccionContent(idx))}
          <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
        </Page>
      ))}

      {/* ── REFERENCIAS ── */}
      {sortedRefs.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.divider} />
          <Text style={styles.h1}>Referencias</Text>
          {sortedRefs.map((ref) => (
            <Text key={ref.id} style={styles.reference}>
              {formatAPA7Plain(ref)}
            </Text>
          ))}
          <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
        </Page>
      )}

    </Document>
  );

  return pdf(PdfDoc).toBlob();
}
