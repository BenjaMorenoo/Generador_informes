import LegalPage, { Seccion, Parrafo, Lista } from './LegalPage';

export default function PrivacidadPage() {
  return (
    <LegalPage titulo="Política de Privacidad" ultimaActualizacion="17 de junio de 2026">

      <Seccion titulo="1. Principio general">
        <Parrafo>
          Generador de Informes está diseñado con privacidad por defecto. <strong>No recopilamos,
          almacenamos ni transmitimos ningún dato personal a servidores externos.</strong> Todo el
          contenido que el usuario introduce en la aplicación permanece exclusivamente en su propio
          navegador.
        </Parrafo>
      </Seccion>

      <Seccion titulo="2. Datos almacenados localmente">
        <Parrafo>
          La aplicación utiliza <strong>localStorage</strong> del navegador para guardar
          automáticamente el progreso del documento. Esta información nunca sale del dispositivo del usuario.
          Los datos guardados incluyen:
        </Parrafo>
        <Lista items={[
          'Contenido del documento: títulos, textos, tablas y secciones.',
          'Metadatos del informe: nombre del proyecto, integrantes, institución, fechas.',
          'Imágenes subidas por el usuario (almacenadas como Base64 en el navegador).',
          'Preferencias de configuración: fuente, márgenes, interlineado.',
          'Estado de la sesión: plantilla seleccionada y panel activo.',
        ]} />
        <Parrafo>
          Estos datos se eliminan automáticamente si el usuario borra el almacenamiento local
          de su navegador o utiliza el botón "Reiniciar documento" dentro de la aplicación.
        </Parrafo>
      </Seccion>

      <Seccion titulo="3. Datos que NO recopilamos">
        <Lista items={[
          'No usamos cookies de seguimiento ni analíticas.',
          'No recopilamos direcciones IP, identificadores de dispositivo ni metadatos de uso.',
          'No integramos herramientas de analítica de terceros (Google Analytics, Mixpanel, etc.).',
          'No tenemos cuentas de usuario; no solicitamos nombre, correo ni contraseña.',
          'No compartimos ningún dato con terceros bajo ninguna circunstancia.',
        ]} />
      </Seccion>

      <Seccion titulo="4. Servicios de terceros">
        <Parrafo>
          La aplicación está alojada en <strong>Vercel</strong>. Al acceder al sitio, Vercel puede
          registrar datos básicos de la solicitud HTTP (IP, agente de usuario, timestamp) según su
          propia política de privacidad, sobre la cual no tenemos control. Te recomendamos revisar
          la{' '}
          <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer"
            className="text-blue-600 hover:underline">
            Política de Privacidad de Vercel
          </a>.
        </Parrafo>
        <Parrafo>
          El código fuente está hospedado en <strong>GitHub</strong>. El acceso al repositorio está
          sujeto a la{' '}
          <a href="https://docs.github.com/site-policy/privacy-policies/github-general-privacy-statement"
            target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            Política de Privacidad de GitHub
          </a>.
        </Parrafo>
      </Seccion>

      <Seccion titulo="5. Tus derechos">
        <Parrafo>
          Dado que no recopilamos datos personales identificables, no existe una base de datos que
          gestionar. Sin embargo, tienes control total sobre tus datos locales:
        </Parrafo>
        <Lista items={[
          'Puedes ver y modificar el contenido en cualquier momento dentro de la aplicación.',
          'Puedes eliminar todos los datos abriendo las DevTools de tu navegador → Application → Local Storage → eliminar la clave "das-documento".',
          'Puedes usar el botón "Reiniciar documento" en la aplicación para borrar el contenido actual.',
        ]} />
      </Seccion>

      <Seccion titulo="6. Menores de edad">
        <Parrafo>
          La aplicación no está dirigida a menores de 14 años. Al utilizarla, confirmas tener al
          menos 14 años o contar con la autorización de un tutor legal.
        </Parrafo>
      </Seccion>

      <Seccion titulo="7. Cambios a esta política">
        <Parrafo>
          Podemos actualizar esta Política de Privacidad ocasionalmente. La fecha de la última
          actualización siempre se mostrará al inicio de este documento. Te recomendamos revisarla
          periódicamente.
        </Parrafo>
      </Seccion>

      <Seccion titulo="8. Contacto">
        <Parrafo>
          Si tienes preguntas sobre esta política puedes abrir un issue en el repositorio de GitHub:{' '}
          <a href="https://github.com/BenjaMorenoo/Generador_informes/issues" target="_blank"
            rel="noopener noreferrer" className="text-blue-600 hover:underline">
            github.com/BenjaMorenoo/Generador_informes/issues
          </a>
        </Parrafo>
      </Seccion>

    </LegalPage>
  );
}
