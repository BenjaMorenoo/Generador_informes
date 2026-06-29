import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  PageBreak,
  TableOfContents,
  ImageRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
  NumberFormat,
  Footer,
  PageNumber,
  convertInchesToTwip,
} from 'docx';
import { DocumentoAcademico, Seccion } from '../../types';
// Tabla is used indirectly via sec.tablas
import { formatAPA7Plain, sortReferences } from '../../utils/apa/formatCitation';
import { formatFechaEspanol } from '../../utils/date';

const CM_TO_TWIP = 567; // 1cm = 567 twip aprox (1440 twip/inch / 2.54)

function cmToTwip(cm: number) {
  return Math.round(cm * CM_TO_TWIP);
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

function parseContenido(contenido: string, fuente: string, tamano: number): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const lines = contenido.split('\n');
  let inList = false;
  let inSubList = false;

  for (const raw of lines) {
    if (/^\s{2,}- /.test(raw)) {
      inSubList = true;
      paragraphs.push(
        new Paragraph({
          text: raw.replace(/^\s+- /, ''),
          bullet: { level: 1 },
          run: { font: fuente, size: tamano * 2 },
        })
      );
    } else if (/^- /.test(raw)) {
      inList = true;
      inSubList = false;
      paragraphs.push(
        new Paragraph({
          text: raw.replace(/^- /, ''),
          bullet: { level: 0 },
          run: { font: fuente, size: tamano * 2 },
        })
      );
    } else {
      inList = false;
      inSubList = false;
      if (raw.trim() === '') {
        paragraphs.push(new Paragraph({ text: '' }));
      } else {
        paragraphs.push(
          new Paragraph({
            children: [new TextRun({ text: raw, font: fuente, size: tamano * 2 })],
            alignment: AlignmentType.JUSTIFIED,
          })
        );
      }
    }
  }
  void inList;
  void inSubList;
  return paragraphs;
}

async function fetchImageAsBuffer(url: string): Promise<{ data: Uint8Array; width: number; height: number } | null> {
  try {
    if (url.startsWith('data:')) {
      const base64 = url.split(',')[1];
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return { data: bytes, width: 400, height: 300 };
    }
    const res = await fetch(url);
    const buf = await res.arrayBuffer();
    return { data: new Uint8Array(buf), width: 400, height: 300 };
  } catch {
    return null;
  }
}

const hexToDocxColor = (hex: string) => hex.replace('#', '').toUpperCase().padEnd(6, '0');

export async function generateDocx(doc: DocumentoAcademico): Promise<Blob> {
  const { metadata, config, secciones, referencias } = doc;
  const { fuente, tamano, margenes, interlineado } = config;
  const half = tamano * 2; // half-points for docx

  const LINE_RULE = interlineado === 1 ? 'auto' : interlineado === 2 ? 'auto' : 'auto';
  const LINE_VAL = Math.round(interlineado * 240);

  const tocNumbers = buildTOCNumbers(secciones);
  const sortedRefs = sortReferences(referencias);

  // ── Párrafo helper ──
  const p = (text: string, opts: Record<string, unknown> = {}) =>
    new Paragraph({
      children: [new TextRun({ text, font: fuente, size: half, ...opts })],
      spacing: { line: LINE_VAL, lineRule: LINE_RULE as 'auto' },
    });

  const pCenter = (text: string, bold = false, sz = half) =>
    new Paragraph({
      children: [new TextRun({ text, font: fuente, size: sz, bold })],
      alignment: AlignmentType.CENTER,
      spacing: { line: LINE_VAL, lineRule: LINE_RULE as 'auto' },
    });

  // ── PORTADA ──
  const coverChildren: Paragraph[] = [
    new Paragraph({ text: '', spacing: { before: 0, after: 400 } }),
    ...(metadata.logoUrl
      ? [
          new Paragraph({
            children: [
              await (async () => {
                const img = await fetchImageAsBuffer(metadata.logoUrl);
                if (!img) return new TextRun({ text: metadata.institucion, bold: true, size: half });
                return new ImageRun({ data: img.data, transformation: { width: 150, height: 80 }, type: 'png' });
              })(),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
        ]
      : [pCenter(metadata.institucion, true, half + 4)]),
    new Paragraph({ text: '', spacing: { before: 800 } }),
    pCenter(metadata.proyecto.toUpperCase(), true, half + 8),
    new Paragraph({ text: '', spacing: { before: 200 } }),
    pCenter(`– ${metadata.entrega} –`, false, half + 2),
    new Paragraph({ text: '', spacing: { before: 800 } }),
    ...(metadata.asignatura ? [pCenter('Asignatura', true), pCenter(metadata.asignatura)] : []),
    ...(metadata.seccion ? [pCenter('Sección', true), pCenter(metadata.seccion)] : []),
    ...(metadata.profesor ? [pCenter('Profesor', true), pCenter(metadata.profesor)] : []),
    ...(metadata.integrantes.length
      ? [
          pCenter('Integrantes', true),
          ...metadata.integrantes.map((i) => pCenter(i.nombre + (i.rol ? ` – ${i.rol}` : ''))),
        ]
      : []),
    new Paragraph({ text: '', spacing: { before: 1200 } }),
    pCenter(`${metadata.ciudad}, ${formatFechaEspanol(metadata.fecha)}`, true),
    new Paragraph({ children: [new PageBreak()] }),
  ];

  // ── TABLA IDENTIFICACIÓN ──
  const identRows = [
    ['Identificación', `${metadata.proyecto} – ${metadata.entrega}`],
    ['Proyecto', metadata.proyecto],
    ['Versión', metadata.version],
    ['Documento mantenido por', metadata.mantenidoPor],
    ['Fecha última revisión', formatFechaEspanol(metadata.fechaUltimaRevision)],
    ['Fecha próxima revisión', formatFechaEspanol(metadata.fechaProximaRevision)],
    ['Documento aprobado por', metadata.aprobadoPor],
    ['Fecha última aprobación', formatFechaEspanol(metadata.fechaUltimaAprobacion)],
  ];

  const identTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: identRows.map(
      ([campo, valor]) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: 40, type: WidthType.PERCENTAGE },
              shading: { type: ShadingType.SOLID, color: 'F3F4F6' },
              children: [new Paragraph({ children: [new TextRun({ text: campo, bold: true, font: fuente, size: half })] })],
              borders: { top: { style: BorderStyle.SINGLE, size: 1 }, bottom: { style: BorderStyle.SINGLE, size: 1 }, left: { style: BorderStyle.SINGLE, size: 1 }, right: { style: BorderStyle.SINGLE, size: 1 } },
            }),
            new TableCell({
              width: { size: 60, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: valor, font: fuente, size: half })] })],
              borders: { top: { style: BorderStyle.SINGLE, size: 1 }, bottom: { style: BorderStyle.SINGLE, size: 1 }, left: { style: BorderStyle.SINGLE, size: 1 }, right: { style: BorderStyle.SINGLE, size: 1 } },
            }),
          ],
        })
    ),
  });

  // ── HISTORIAL ──
  const eh = metadata.estiloHistorial;
  const makeHistBorder = () => {
    const b = { style: BorderStyle.SINGLE, size: 4, color: hexToDocxColor(eh.colorBorde) };
    const none = { style: BorderStyle.NONE, size: 0, color: 'auto' };
    if (eh.tiposBorde === 'todos') return { top: b, bottom: b, left: b, right: b };
    if (eh.tiposBorde === 'horizontales') return { top: b, bottom: b, left: none, right: none };
    if (eh.tiposBorde === 'exterior') return { top: b, bottom: b, left: b, right: b };
    return { top: none, bottom: none, left: none, right: none };
  };
  const histBorders = makeHistBorder();

  const historialTable =
    metadata.historialRevisiones.length > 0
      ? new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              tableHeader: true,
              children: ['Fecha', 'Revisión', 'Autor', 'Modificación'].map(
                (h) =>
                  new TableCell({
                    shading: { type: ShadingType.SOLID, color: hexToDocxColor(eh.colorEncabezado) },
                    children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: hexToDocxColor(eh.colorTextoEncabezado), font: fuente, size: half })] })],
                    borders: histBorders,
                  })
              ),
            }),
            ...metadata.historialRevisiones.map(
              (fila, idx) =>
                new TableRow({
                  children: [
                    formatFechaEspanol(fila.fecha),
                    fila.revision,
                    fila.autor,
                    fila.modificacion,
                  ].map(
                    (val) =>
                      new TableCell({
                        shading: { type: ShadingType.SOLID, color: hexToDocxColor(idx % 2 === 0 ? eh.colorFilaImpar : eh.colorFilaPar) },
                        children: [new Paragraph({ children: [new TextRun({ text: val, font: fuente, size: half })] })],
                        borders: histBorders,
                      })
                  ),
                })
            ),
          ],
        })
      : null;

  // ── SECCIONES BODY ──
  const bodyChildren: (Paragraph | Table)[] = [];

  let figCounter = 0;
  let tablaCounter = 0;

  for (let i = 0; i < secciones.length; i++) {
    const sec = secciones[i];
    const num = tocNumbers[i];

    if (sec.nivel === 1) {
      bodyChildren.push(new Paragraph({ children: [new PageBreak()] }));
    }

    const headingLevel = sec.nivel === 1 ? HeadingLevel.HEADING_1 : sec.nivel === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3;

    bodyChildren.push(
      new Paragraph({
        text: `${num} ${sec.titulo}`,
        heading: headingLevel,
        spacing: { before: 400, after: 200 },
      })
    );

    const contentParas = parseContenido(sec.contenido, fuente, tamano);
    bodyChildren.push(...contentParas);

    for (const img of sec.imagenes) {
      figCounter++;
      const imgData = await fetchImageAsBuffer(img.url);
      if (imgData) {
        bodyChildren.push(
          new Paragraph({
            children: [new ImageRun({ data: imgData.data, transformation: { width: 400, height: 300 }, type: 'png' })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
          })
        );
      }
      bodyChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: `Figura ${figCounter}. `, bold: true, font: fuente, size: half - 2 }),
            new TextRun({ text: img.descripcion, font: fuente, size: half - 2 }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        })
      );
    }

    // Tablas de la sección
    for (const tabla of (sec.tablas ?? [])) {
      tablaCounter++;
      const tn = tablaCounter;

      // Título de tabla (encima)
      bodyChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: `Tabla ${tn}. `, bold: true, font: fuente, size: half - 2 }),
            new TextRun({ text: tabla.descripcion, font: fuente, size: half - 2 }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 100 },
        })
      );

      const makeDocxBorder = (color: string, tipo: string) => {
        if (tipo === 'ninguno') return { style: BorderStyle.NONE, size: 0, color: 'auto' };
        return { style: BorderStyle.SINGLE, size: 4, color: hexToDocxColor(color) };
      };

      const makeBorders = (tipo: string, borderColor: string) => {
        const b = makeDocxBorder(borderColor, tipo);
        const none = { style: BorderStyle.NONE, size: 0, color: 'auto' };
        if (tipo === 'todos') return { top: b, bottom: b, left: b, right: b };
        if (tipo === 'horizontales') return { top: b, bottom: b, left: none, right: none };
        if (tipo === 'exterior') return { top: b, bottom: b, left: b, right: b };
        return { top: none, bottom: none, left: none, right: none };
      };

      const borders = makeBorders(tabla.estilo.tiposBorde, tabla.estilo.colorBorde);

      const headerRow = new TableRow({
        tableHeader: true,
        children: tabla.columnas.map(
          (col) =>
            new TableCell({
              shading: { type: ShadingType.SOLID, color: hexToDocxColor(tabla.estilo.colorEncabezado) },
              borders,
              children: [
                new Paragraph({
                  children: [new TextRun({ text: col, bold: true, color: hexToDocxColor(tabla.estilo.colorTextoEncabezado), font: fuente, size: half - 2 })],
                }),
              ],
            })
        ),
      });

      const dataRows = tabla.filas.map(
        (fila, fi) =>
          new TableRow({
            children: fila.celdas.map(
              (celda) =>
                new TableCell({
                  shading: {
                    type: ShadingType.SOLID,
                    color: hexToDocxColor(fi % 2 === 0 ? tabla.estilo.colorFilaImpar : tabla.estilo.colorFilaPar),
                  },
                  borders,
                  children: [
                    new Paragraph({
                      children: [new TextRun({ text: celda.valor, font: fuente, size: half - 2 })],
                    }),
                  ],
                })
            ),
          })
      );

      bodyChildren.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [headerRow, ...dataRows],
        })
      );
      bodyChildren.push(new Paragraph({ text: '', spacing: { after: 200 } }));
    }
  }

  // ── REFERENCIAS ──
  const refChildren: Paragraph[] = [
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({
      text: 'Referencias',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    }),
    ...sortedRefs.map(
      (ref) =>
        new Paragraph({
          children: [new TextRun({ text: formatAPA7Plain(ref), font: fuente, size: half })],
          indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.5) },
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 200, line: LINE_VAL, lineRule: LINE_RULE as 'auto' },
        })
    ),
  ];

  // ── DOCUMENTO FINAL ──
  const document = new Document({
    styles: {
      default: {
        document: {
          run: { font: fuente, size: half },
          paragraph: {
            spacing: { line: LINE_VAL, lineRule: LINE_RULE as 'auto' },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: cmToTwip(margenes.top),
              bottom: cmToTwip(margenes.bottom),
              left: cmToTwip(margenes.left),
              right: cmToTwip(margenes.right),
            },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ children: [PageNumber.CURRENT], font: fuente, size: half }),
                ],
                alignment: AlignmentType.RIGHT,
              }),
            ],
          }),
        },
        children: [
          ...coverChildren,
          ...(doc.mostrarIdentificacion !== false
            ? [
                new Paragraph({
                  text: 'Identificación del Documento',
                  heading: HeadingLevel.HEADING_1,
                  spacing: { before: 400, after: 400 },
                }),
                identTable,
                new Paragraph({ children: [new PageBreak()] }),
              ]
            : []),
          ...(historialTable
            ? [
                new Paragraph({
                  text: 'Historial de Revisiones',
                  heading: HeadingLevel.HEADING_1,
                  spacing: { before: 400, after: 400 },
                }),
                historialTable,
                new Paragraph({ children: [new PageBreak()] }),
              ]
            : []),
          new Paragraph({
            text: 'Índice General',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new TableOfContents('Índice General', {
            hyperlink: true,
            headingStyleRange: '1-3',
          }),
          new Paragraph({ children: [new PageBreak()] }),
          ...bodyChildren,
          ...refChildren,
        ],
      },
    ],
  });

  return Packer.toBlob(document);
}
