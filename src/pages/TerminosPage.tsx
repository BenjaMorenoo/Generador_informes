import LegalPage, { Seccion, Parrafo, Lista } from './LegalPage';

export default function TerminosPage() {
  return (
    <LegalPage titulo="Términos y Condiciones" ultimaActualizacion="17 de junio de 2026">

      <Seccion titulo="1. Aceptación de los términos">
        <Parrafo>
          Al acceder y utilizar Generador de Informes (en adelante, "la aplicación"), aceptas quedar
          vinculado por estos Términos y Condiciones. Si no estás de acuerdo con alguna parte de estos
          términos, debes abstenerte de utilizar la aplicación.
        </Parrafo>
      </Seccion>

      <Seccion titulo="2. Descripción del servicio">
        <Parrafo>
          Generador de Informes es una herramienta web gratuita y de código abierto que permite crear,
          editar y exportar documentos académicos en formato DOCX y PDF. La aplicación se encuentra
          actualmente en fase <strong>Beta V0.1</strong>, lo que implica que puede contener errores,
          funciones incompletas o cambios sin previo aviso.
        </Parrafo>
      </Seccion>

      <Seccion titulo="3. Uso aceptable">
        <Parrafo>El usuario se compromete a utilizar la aplicación exclusivamente para fines lícitos. Queda prohibido:</Parrafo>
        <Lista items={[
          'Usar la aplicación para generar contenido ilegal, difamatorio, fraudulento o que infrinja derechos de terceros.',
          'Intentar vulnerar la seguridad, integridad o disponibilidad del servicio.',
          'Realizar ingeniería inversa o reproducir el código con fines comerciales sin autorización.',
          'Hacer un uso que viole las leyes aplicables en el país del usuario.',
        ]} />
      </Seccion>

      <Seccion titulo="4. Contenido generado por el usuario">
        <Parrafo>
          El usuario es el único responsable del contenido que introduce en la aplicación (textos, imágenes,
          referencias, datos personales de terceros, etc.). El desarrollador no asume ninguna responsabilidad
          por el uso indebido de dicho contenido ni por posibles infracciones de derechos de propiedad
          intelectual cometidas por el usuario.
        </Parrafo>
      </Seccion>

      <Seccion titulo="5. Propiedad intelectual">
        <Parrafo>
          El código fuente de la aplicación está disponible bajo licencia de código abierto en{' '}
          <a href="https://github.com/BenjaMorenoo/Generador_informes" target="_blank" rel="noopener noreferrer"
            className="text-blue-600 hover:underline">
            GitHub
          </a>. Los documentos generados por el usuario pertenecen íntegramente al usuario; el
          desarrollador no reclama ningún derecho sobre ellos.
        </Parrafo>
      </Seccion>

      <Seccion titulo="6. Disponibilidad y limitación de responsabilidad">
        <Parrafo>
          La aplicación se proporciona "tal cual" (as-is), sin garantías de ningún tipo, expresas o implícitas.
          El desarrollador no garantiza la disponibilidad continua del servicio ni la exactitud de los
          formatos generados. En ningún caso el desarrollador será responsable de daños directos, indirectos,
          incidentales o consecuentes derivados del uso o la imposibilidad de uso de la aplicación.
        </Parrafo>
        <Lista items={[
          'Pérdida de datos almacenados en el navegador.',
          'Errores de formato en los archivos exportados.',
          'Interrupciones del servicio por mantenimiento o fallos técnicos.',
        ]} />
      </Seccion>

      <Seccion titulo="7. Modificaciones">
        <Parrafo>
          Nos reservamos el derecho de modificar estos Términos y Condiciones en cualquier momento.
          Los cambios entrarán en vigor desde su publicación en la aplicación. El uso continuado del
          servicio tras la publicación de cambios constituye aceptación de los nuevos términos.
        </Parrafo>
      </Seccion>

      <Seccion titulo="8. Ley aplicable">
        <Parrafo>
          Estos términos se rigen por las leyes de la República de Chile. Cualquier disputa derivada
          del uso de la aplicación se someterá a los tribunales competentes de Santiago de Chile.
        </Parrafo>
      </Seccion>

    </LegalPage>
  );
}
