const sections = [
  {
    num: "1",
    title: "Información que recopilamos",
    text: "Recopilamos información que nos proporcionas directamente al registrarte y utilizar la plataforma. Para los Estudiantes, esto incluye: nombre, correo electrónico, habilidades técnicas, nivel educativo e historial de proyectos aplicados. Para las Empresas (PYMEs), recopilamos: nombre del representante, correo electrónico, nombre de la compañía, información comercial básica e historial de proyectos publicados.",
  },
  {
    num: "2",
    title: "Uso de la información",
    text: "Utilizamos los datos recopilados exclusivamente para el funcionamiento operativo de Dexpert: facilitar el emparejamiento (match) entre estudiantes y proyectos de las PYMEs, permitir la comunicación interna entre las partes seleccionadas, procesar las transacciones de créditos y emitir los certificados digitales al finalizar los proyectos.",
  },
  {
    num: "3",
    title: "Proveedores externos y almacenamiento",
    text: "Para garantizar la seguridad de tu información, nos apoyamos en proveedores tecnológicos líderes que cumplen con altos estándares de la industria. Toda nuestra base de datos y autenticación de usuarios se almacena de forma segura mediante Supabase. El procesamiento de pagos y datos de facturación se realiza de manera externa y encriptada a través de Stripe; Dexpert nunca almacena los datos completos de tus tarjetas de crédito o débito.",
  },
  {
    num: "4",
    title: "Uso de datos en funciones de IA",
    text: "Las interacciones y conversaciones con nuestro mentor de IA se almacenan temporalmente con el único propósito de contextualizar la tutoría y mejorar la experiencia de aprendizaje del estudiante. Estas conversaciones y las indicaciones para generar borradores de proyectos son estrictamente confidenciales: no se comparten públicamente, no se venden a terceros, ni se utilizan para entrenar modelos comerciales externos.",
  },
  {
    num: "5",
    title: "Protección y no comercialización de datos",
    text: "En Dexpert tenemos un compromiso firme con tu privacidad: no vendemos, alquilamos ni comercializamos tus datos personales con terceras empresas bajo ninguna circunstancia. La información solo es visible para otros usuarios de la plataforma cuando aplicas a una oportunidad o cuando publicas un proyecto, limitándose estrictamente a lo necesario para la colaboración.",
  },
  {
    num: "6",
    title: "Tus derechos (Acceso y Eliminación)",
    text: "Tienes total control sobre tus datos personales. Puedes acceder, rectificar o actualizar tu información en cualquier momento desde la configuración de tu perfil. Asimismo, cuentas con el derecho de eliminar tu cuenta de forma definitiva cuando lo decidas. Al hacerlo, tus datos personales identificables serán borrados permanentemente de nuestros registros activos en Supabase.",
  },
  {
    num: "7",
    title: "Actualizaciones de esta política",
    text: "Nos reservamos el derecho de modificar esta Política de Privacidad para adaptarla a novedades legislativas o mejoras técnicas de la plataforma. Cualquier cambio significativo será notificado mediante un aviso en la aplicación o actualizando la fecha de vigencia en la parte superior de esta página.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="px-6 py-16">
      <section className="mx-auto max-w-2xl">

        {/* Header */}
        <header className="mb-14 text-center">
          <span className="mb-4 inline-block rounded-full bg-[#F0F7FF] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#38A3F1]">
            Legal
          </span>
          <h1 className="mb-3 text-3xl md:text-4xl font-semibold text-[#0D3A6E]">
            Política de Privacidad
          </h1>
          <p className="text-sm text-[#93B8D4]">
            Última actualización: 13 de junio de 2026
          </p>
        </header>

        <p className="mb-10 text-sm text-[#5B8DB8] leading-relaxed">
          En <strong className="text-[#0D3A6E] font-semibold">Dexpert</strong> nos tomamos muy en serio la seguridad y protección de tus datos. Esta Política de Privacidad describe cómo recopilamos, usamos y resguardamos la información de estudiantes y empresas en El Salvador.
        </p>

        <hr className="border-[#E8F3FD] mb-10" />

        {/* Sections */}
        <div className="flex flex-col gap-8">
          {sections.map((item) => (
            <section key={item.num}>
              <h2 className="mb-2 text-base font-semibold text-[#0D3A6E]">
                <span className="text-[#38A3F1] mr-1">{item.num}.</span>
                {item.title}
              </h2>
              <p className="text-sm text-[#5B8DB8] leading-relaxed">
                {item.text}
              </p>
            </section>
          ))}

          {/* Contact card */}
          <section className="mt-4 rounded-2xl border border-[#BAD8F7] bg-[#F0F7FF] p-8 text-center">
            <h2 className="mb-2 text-base font-semibold text-[#0D3A6E]">
              8. ¿Dudas sobre tus datos?
            </h2>
            <p className="mb-5 text-sm text-[#5B8DB8]">
              Si deseas solicitar la eliminación total de tus registros o tienes dudas sobre cómo manejamos tu información, escríbenos de inmediato.
            </p>
            <a
              href="mailto:dexpertwork@gmail.com"
              className="inline-block rounded-xl bg-[#38A3F1] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#0D5FA6] transition-colors"
            >
              Contactar a privacidad
            </a>
          </section>
        </div>
      </section>
    </main>
  );
}