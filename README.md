# Generador DAS — Documento de Arquitectura de Software
### Beta V0.1

> **⚠ Esta es una versión beta.** La aplicación está en desarrollo activo. Algunas funciones pueden comportarse de manera inesperada o estar incompletas. Se recomienda revisar siempre el documento exportado antes de entregarlo.

Aplicación web para generar informes académicos con formato **DAS (Documento de Arquitectura de Software)** de forma automatizada. El usuario solo completa los campos; la app genera la portada, el índice, la numeración, las referencias APA 7 y todos los saltos de página de forma automática.

---

## Características

### Edición
- **Portada automática** — institución, logo, proyecto, entrega, asignatura, sección, profesor, integrantes y fecha en español
- **Tabla de identificación del documento** — versión, responsables y fechas de revisión/aprobación
- **Historial de revisiones** — tabla editable con fecha, versión, autor y descripción del cambio
- **Secciones con jerarquía H1 / H2 / H3** — cada nivel se numera y estiliza de forma diferente (capítulo, sección, subsección)
- **Drag-and-drop** para reordenar secciones
- **Contenido con viñetas** — escribe `- ítem` para listas y `  - sub-ítem` para sub-listas
- **Figuras por sección** — sube imágenes, se numeran automáticamente (`Figura N.`)
- **Tablas por sección** — editor de celdas inline, numeración automática (`Tabla N.`)
- **Referencias bibliográficas** — soporte para libro, artículo, sitio web, norma técnica y otros; ordenadas A–Z automáticamente
- **Configuración tipográfica** — fuente, tamaño, interlineado y márgenes configurables

### Diseño de tablas
- 5 estilos predefinidos: Azul, Gris, Verde, Naranja, Minimalista
- Colores completamente personalizables: fondo y texto del encabezado, filas pares/impares, bordes
- 4 tipos de borde: todos, solo horizontales, solo exterior, sin bordes
- Vista previa en miniatura del estilo dentro del editor

### Documentos generados automáticamente
- Portada
- Página de identificación del documento
- Historial de revisiones
- Índice general (con puntos de relleno)
- Índice de figuras
- Índice de tablas
- Cuerpo del informe con capítulos, secciones y subsecciones
- Lista de referencias en **formato APA 7** (sangría francesa, cursivas, orden alfabético)

### Vista previa en vivo
El panel derecho muestra el documento renderizado en HTML con los mismos estilos del informe final, actualizándose en tiempo real al editar cualquier campo.

### Exportación
| Formato | Características |
|---|---|
| **DOCX** | Estilos nombrados Heading 1/2/3, tabla de contenido con `updateFields`, saltos de página entre capítulos, pie de página con número, colores de tablas |
| **PDF** | Generado con `@react-pdf/renderer`, misma estructura que la vista previa, fuentes PDF integradas, numeración de páginas |

---

## Tecnologías

| Librería | Uso |
|---|---|
| React 18 + Vite | Entorno de desarrollo y UI |
| TypeScript | Tipado estático del modelo de datos |
| Tailwind CSS v4 | Estilos de la interfaz |
| Zustand | Estado global del documento (persistido en `localStorage`) |
| React Hook Form | Formularios de metadatos |
| `@dnd-kit` | Drag-and-drop para reordenar secciones |
| `docx` | Generación de archivos `.docx` |
| `@react-pdf/renderer` | Generación de archivos `.pdf` |
| `lucide-react` | Iconos |

---

## Estructura del proyecto

```
src/
├── types/
│   └── index.ts              # Modelo de datos completo (Seccion, Tabla, Referencia, etc.)
│
├── store/
│   └── documentStore.ts      # Store Zustand con todas las operaciones CRUD
│
├── utils/
│   ├── apa/
│   │   └── formatCitation.ts # Formateador APA 7 (libro, artículo, web, norma)
│   └── date.ts               # Fechas en español + generador de IDs
│
├── components/
│   ├── ui/                   # Componentes base reutilizables
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   └── Textarea.tsx
│   ├── MetadataForm.tsx      # Formulario de portada, integrantes e identificación
│   ├── SeccionesEditor.tsx   # Editor de secciones con drag-and-drop
│   ├── TablaEditor.tsx       # Editor de tablas con panel de diseño
│   ├── ReferenciasEditor.tsx # Editor de referencias con vista previa APA 7
│   ├── ConfigForm.tsx        # Configuración tipográfica y márgenes
│   ├── VistaPrevia.tsx       # Vista previa HTML en tiempo real
│   └── ExportButtons.tsx     # Botones de exportación DOCX / PDF
│
├── export/
│   ├── docx/
│   │   └── generateDocx.ts   # Generador de Word (.docx)
│   └── pdf/
│       └── generatePdf.tsx   # Generador de PDF
│
├── App.tsx                   # Layout principal (panel editor + panel vista previa)
├── main.tsx                  # Entry point con polyfill de Buffer
└── index.css                 # Estilos globales + Tailwind
```

---

## Instalación y uso

### Requisitos
- Node.js 18 o superior
- npm 9 o superior

### Pasos

```bash
# 1. Clonar o descomprimir el proyecto
cd Generador_informes

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor de desarrollo
npm run dev
```

La app estará disponible en `http://localhost:5173`.

> **Nota beta:** Si el puerto 5173 está ocupado, Vite asignará el siguiente disponible (ej. 5174). Revisa la terminal para ver la URL exacta.

### Build para producción

```bash
npm run build
# Los archivos generados quedan en /dist
```

---

## Guía de uso

### 1. Portada
Ve a la pestaña **Portada** y completa:
- **Institución** — nombre de la universidad o escuela
- **Nombre del Proyecto** — aparece en mayúsculas y negrita en la portada
- **Entrega** — por ejemplo `ENTREGA 1`
- **Asignatura, Sección, Profesor, Ciudad, Fecha**
- **Logo Institucional** — sube una imagen PNG/JPG; se mostrará centrada en la portada
- **Integrantes** — haz clic en `+ Agregar` para añadir cada integrante con nombre y rol opcional
- **Identificación del Documento** — versión, responsable de mantenimiento, fechas
- **Historial de Revisiones** — agrega filas con fecha, número de revisión, autor y descripción del cambio

### 2. Secciones
Ve a la pestaña **Secciones**.

- **H1 Capítulo** — crea un capítulo principal (comienza en página nueva en el documento exportado)
- **H2 Sección** — crea una sección dentro de un capítulo
- **H3 Sub** — crea una sub-sección

Para cada sección puedes:
- Editar el **título** y el **contenido**
- Reordenar arrastrando el ícono `⠿` de la izquierda
- Agregar **figuras** (imágenes con descripción)
- Agregar **tablas** con su propio editor

#### Viñetas en el contenido
```
- Elemento de lista
- Otro elemento
  - Sub-elemento con sangría (2 espacios + guion)
```

#### Editor de tablas
1. Haz clic en **Agregar tabla** dentro de cualquier sección
2. En la pestaña **Datos**: edita los encabezados de columna, completa las celdas, agrega o elimina filas y columnas
3. En la pestaña **Diseño**:
   - Elige un **estilo predefinido** (Azul, Gris, Verde, Naranja, Minimalista)
   - O personaliza cada color individualmente con el selector de color
   - Configura el **tipo de borde** (todos, solo horizontales, solo exterior, sin bordes)
   - La **vista previa en miniatura** muestra el resultado en tiempo real

### 3. Referencias
Ve a la pestaña **Referencias**.

- Haz clic en **Nueva referencia** y selecciona el tipo:
  - **Libro** — autores, año, título, editorial, ciudad
  - **Artículo** — autores, año, título, revista, DOI
  - **Sitio web** — autores, año, título, URL
  - **Norma técnica** — título, año, fuente (ej. ISO/IEC 42010)
  - **Otro** — campos genéricos

- Los autores se ingresan en formato `Apellido, N.` (uno por línea)
- La **vista previa APA 7** se actualiza debajo de cada referencia
- La lista se ordena **alfabéticamente** de forma automática

### 4. Configuración
Ve a la pestaña **Configuración** para ajustar:
- **Fuente** — Times New Roman, Arial, Calibri, Georgia
- **Tamaño** — en puntos (por defecto 12 pt)
- **Interlineado** — simple, 1.5 o doble
- **Márgenes** — en centímetros (por defecto 2.54 cm en todos los lados)

### 5. Exportar
En la parte inferior izquierda:
- **Exportar DOCX** — genera un archivo Word con estilos nombrados, tabla de contenido y paginación. Abre el archivo en Word y presiona `Ctrl+A` → `F9` para actualizar el índice.
- **Exportar PDF** — genera un PDF con el mismo contenido y diseño que la vista previa.

El archivo se descarga automáticamente con el nombre del proyecto.

---

## Modelo de datos

Todo el documento se representa en un único objeto JSON:

```typescript
{
  metadata: {
    proyecto, asignatura, seccion, profesor, fecha, entrega,
    integrantes: [{ id, nombre, rol }],
    institucion, logoUrl, ciudad, version,
    mantenidoPor, fechaUltimaRevision, fechaProximaRevision,
    aprobadoPor, fechaUltimaAprobacion,
    historialRevisiones: [{ id, fecha, revision, autor, modificacion }]
  },
  config: {
    fuente, tamano, interlineado,
    margenes: { top, bottom, left, right }
  },
  secciones: [{
    id, titulo, nivel (1|2|3), contenido, orden,
    imagenes: [{ id, url, figuraNumero, descripcion }],
    tablas: [{
      id, descripcion, columnas: string[],
      filas: [{ id, celdas: [{ id, valor }] }],
      estilo: {
        colorEncabezado, colorTextoEncabezado,
        colorFilaImpar, colorFilaPar,
        colorBorde, tiposBorde
      }
    }]
  }],
  referencias: [{
    id, tipo, autores, anio, titulo,
    fuente, url, editorial, doi, ciudad
  }]
}
```

El estado se persiste automáticamente en `localStorage` bajo la clave `das-documento`, por lo que no se pierde al recargar la página.

---

## Notas técnicas

- Las tablas y figuras se numeran de forma **correlativa global** en el orden en que aparecen las secciones.
- El índice general, el índice de figuras y el índice de tablas se generan **automáticamente** a partir de los datos; nunca se escriben a mano.
- Cada capítulo (H1) comienza en una **página nueva** tanto en la vista previa como en los archivos exportados.
- Las referencias se formatean según la norma **APA 7ª edición** con sangría francesa.
- El estado del documento se persiste en `localStorage`; no se pierde al recargar la página.

---

## Estado del proyecto — Beta V0.1

| Funcionalidad | Estado |
|---|---|
| Portada e identificación del documento | ✅ Estable |
| Historial de revisiones | ✅ Estable |
| Secciones H1 / H2 / H3 con drag-and-drop | ✅ Estable |
| Vista previa en tiempo real | ✅ Estable |
| Figuras con numeración automática | ✅ Estable |
| Tablas con diseño configurable | ✅ Estable |
| Referencias APA 7 | ✅ Estable |
| Exportación a DOCX | ✅ Funcional — revisar índice en Word con `F9` |
| Exportación a PDF | ✅ Funcional — fuentes limitadas a las integradas en PDF |
| Subida de logo institucional | ✅ Estable |
| Soporte multi-idioma | ❌ No disponible |
| Colaboración en tiempo real | ❌ No disponible |
| Guardado en la nube | ❌ No disponible (solo `localStorage`) |

---

## Roadmap

### v0.2 — Corto plazo

| Feature | Descripción |
|---|---|
| Formato enriquecido | Negrita, cursiva y negrita+cursiva en el contenido de secciones (`**texto**`, `*texto*`) con mini toolbar B / I sobre el editor |
| Deshacer / Rehacer | Historial de acciones para recuperar secciones, tablas o campos eliminados |
| Numeración de páginas en vista previa | Páginas numeradas visibles en el panel HTML, no solo en los archivos exportados |
| Tabla de identificación personalizable | Mismo sistema de colores y bordes que el historial de revisiones |
| Buscador de secciones | Filtro rápido por título en el panel de secciones |

### v0.3 — Mediano plazo

| Feature | Descripción |
|---|---|
| Plantillas predefinidas | Esqueletos de documento para IEEE 1471, ISO/IEC 42010 y plantilla genérica |
| Múltiples documentos | Lista de proyectos guardados en `localStorage` con opción de cambiar entre ellos |
| Bloques de código | Syntax highlighting dentro del contenido de secciones |
| Glosario y abreviaciones | Sección fija generada automáticamente antes de las referencias |
| Soporte multi-idioma | Interfaz y documento generado en español / inglés |

### v1.0 — Largo plazo

| Feature | Descripción |
|---|---|
| Guardado en la nube | Backend o Firebase para persistir documentos entre dispositivos |
| Colaboración en tiempo real | Edición simultánea entre múltiples usuarios vía WebSockets / CRDT |
| Importar desde Word | Parsear un `.docx` existente y convertirlo al modelo de datos de la app |
| Exportar a otros formatos | Markdown, LaTeX y HTML estático como destinos adicionales de exportación |
| Modo oscuro | Tema oscuro para la interfaz del editor |

---

### Limitaciones conocidas en Beta V0.1

- El índice en el DOCX requiere actualizarse manualmente en Word (`Ctrl+A` → `F9`).
- El PDF usa únicamente fuentes integradas en el estándar PDF (Times Roman, Helvetica, Courier); no se renderizan fuentes como Calibri con su tipografía exacta.
- Las imágenes muy grandes pueden ralentizar la vista previa; se recomienda optimizarlas antes de subir.
- No existe función de deshacer (undo) por acción; si se elimina una sección o tabla, no se puede recuperar excepto recargando la página antes de que `localStorage` se actualice.
