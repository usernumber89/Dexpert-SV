const sections = [
  {
    num: "1",
    title: "Aceptación de los términos",
    text: "Al registrarte o usar Dexpert, aceptas estos Términos y Condiciones en su totalidad. Si no estás de acuerdo con alguna parte, no debes utilizar la plataforma. Nos reservamos el derecho de actualizar estos términos en cualquier momento; el uso continuado después de un cambio implica aceptación de los nuevos términos.",
  },
  {
    num: "2",
    title: "¿Qué es Dexpert?",
    text: "Dexpert es una plataforma que conecta a estudiantes salvadoreños sin experiencia laboral previa con pequeñas y medianas empresas (PYMEs) que necesitan apoyo en proyectos reales. Los estudiantes obtienen experiencia práctica, portafolio y certificados; las PYMEs obtienen talento joven para tareas concretas mediante un sistema de créditos.",
  },
  {
    num: "3",
    title: "Cuentas y roles",
    text: "Al registrarte debes elegir un rol: Estudiante o Empresa (PYME). Cada cuenta corresponde a una sola persona o entidad y no debe compartirse. Eres responsable de mantener la confidencialidad de tu contraseña y de toda actividad realizada desde tu cuenta. Debes proporcionar información veraz: los estudiantes deben describir honestamente sus habilidades y nivel educativo, y las empresas deben representar correctamente su negocio. Nos reservamos el derecho de suspender o eliminar cuentas que proporcionen información falsa, suplanten identidades, o violen estos términos.",
  },
  {
    num: "4",
    title: "Para estudiantes",
    text: "El uso de Dexpert es completamente gratuito para estudiantes, sin costo alguno por aplicar a proyectos, usar el mentor de IA o recibir certificados. Al aplicar a un proyecto, te comprometes a actuar de buena fe: comunicarte con la empresa, cumplir con los plazos razonables acordados y entregar trabajo propio. Dexpert no garantiza que serás aceptado en un proyecto ni que recibirás compensación económica por tu participación, salvo que la empresa lo ofrezca explícitamente fuera de la plataforma. La relación entre estudiante y empresa (incluyendo pagos, si los hubiera) se da de forma independiente a Dexpert; la plataforma actúa únicamente como intermediario de contacto y gestión.",
  },
  {
    num: "5",
    title: "Para empresas (PYMEs)",
    text: "Las empresas acceden a la plataforma mediante la compra de paquetes de créditos (Starter, Growth o Pro). Cada crédito permite publicar un proyecto. Los créditos no caducan, pero no son reembolsables una vez utilizados para publicar un proyecto. Si un pago es procesado pero los créditos no se reflejan, contacta a soporte con el comprobante de pago. Las empresas se comprometen a publicar proyectos legítimos, con descripciones claras y honestas, y a tratar a los estudiantes con respeto profesional. Dexpert puede remover proyectos que incumplan estas condiciones sin reembolso del crédito utilizado.",
  },
  {
    num: "6",
    title: "Pagos y facturación",
    text: "Los pagos se procesan a través de Stripe, un proveedor externo de pagos. Dexpert no almacena ni tiene acceso a los datos completos de tarjetas de crédito o débito. Todos los precios están expresados en dólares estadounidenses (USD). Los pagos son únicos (no recurrentes); no existen suscripciones automáticas. En caso de cobros duplicados, errores de facturación o disputas, contacta a soporte dentro de los 7 días posteriores a la transacción.",
  },
  {
    num: "7",
    title: "Funciones de inteligencia artificial",
    text: "Dexpert utiliza modelos de inteligencia artificial para: generar borradores de descripciones de proyectos a partir de las indicaciones de las empresas, y ofrecer un mentor de IA que apoya a los estudiantes durante sus proyectos. El contenido generado por IA es un punto de partida y debe ser revisado por el usuario antes de su uso final. Dexpert no garantiza la exactitud, idoneidad legal o calidad del contenido generado por IA, y no se hace responsable de decisiones tomadas con base en sus respuestas. Las conversaciones con el mentor de IA pueden ser almacenadas temporalmente para mejorar el servicio, pero no se comparten públicamente ni se venden a terceros.",
  },
  {
    num: "8",
    title: "Conducta esperada",
    text: "Está prohibido: publicar contenido ofensivo, discriminatorio, fraudulento o ilegal; usar la plataforma para acoso, spam o contacto no solicitado fuera del propósito de los proyectos; intentar vulnerar la seguridad de la plataforma o acceder a cuentas ajenas; usar bots o automatización no autorizada para interactuar con la plataforma. El incumplimiento puede resultar en suspensión inmediata de la cuenta, sin derecho a reembolso de créditos no utilizados en caso de violaciones graves.",
  },
  {
    num: "9",
    title: "Propiedad intelectual",
    text: "El nombre Dexpert, su logotipo, diseño, código fuente y materiales de marca son propiedad de Dexpert y no pueden reproducirse sin autorización. El contenido y los entregables producidos por un estudiante para un proyecto pertenecen, salvo acuerdo distinto entre las partes, a la empresa que publicó el proyecto, una vez completado y aceptado. Los estudiantes conservan el derecho a mostrar su participación en el proyecto como parte de su portafolio personal, salvo que la empresa solicite confidencialidad de forma explícita y razonable.",
  },
  {
    num: "10",
    title: "Certificados",
    text: "Dexpert emite certificados digitales a estudiantes que completan proyectos satisfactoriamente, según la confirmación de la empresa correspondiente. Estos certificados reflejan la participación del estudiante en un proyecto a través de la plataforma y no constituyen un título académico ni una certificación profesional oficial reconocida por el Ministerio de Educación de El Salvador u otra autoridad educativa.",
  },
  {
    num: "11",
    title: "Privacidad y datos personales",
    text: "Recopilamos información como nombre, correo electrónico, habilidades, educación y, en el caso de empresas, datos de la compañía. Esta información se utiliza únicamente para el funcionamiento de la plataforma: hacer match entre estudiantes y proyectos, comunicación entre las partes, y procesamiento de pagos. No vendemos información personal a terceros. Los datos se almacenan de forma segura mediante Supabase, y los pagos se procesan mediante Stripe, ambos con sus propias políticas de privacidad y seguridad.",
  },
  {
    num: "12",
    title: "Disponibilidad del servicio",
    text: "Dexpert se ofrece \"tal cual\" y \"según disponibilidad\". No garantizamos que la plataforma esté libre de errores, interrupciones o tiempos de inactividad. Podemos realizar mantenimiento, actualizaciones o cambios en las funcionalidades sin previo aviso. Nos esforzamos por notificar con anticipación cualquier interrupción significativa que pueda afectar créditos o proyectos activos.",
  },
  {
    num: "13",
    title: "Limitación de responsabilidad",
    text: "Dexpert actúa como intermediario entre estudiantes y empresas, pero no es parte de los acuerdos laborales, contractuales o de pago que surjan entre ambos fuera de la plataforma. No somos responsables de: la calidad del trabajo entregado por un estudiante, el cumplimiento de pagos o compromisos por parte de una empresa, disputas, malentendidos o conflictos entre usuarios, ni de pérdidas derivadas del uso de información generada por IA. En la medida permitida por la ley, la responsabilidad total de Dexpert ante cualquier reclamo se limita al monto pagado por el usuario en los últimos 3 meses.",
  },
  {
    num: "14",
    title: "Resolución de conflictos entre usuarios",
    text: "Si surge un conflicto entre un estudiante y una empresa (por ejemplo, falta de comunicación, incumplimiento de expectativas del proyecto, etc.), Dexpert puede mediar de buena fe pero no está obligado a hacerlo, y no garantiza una resolución a favor de ninguna de las partes. Recomendamos documentar acuerdos importantes (alcance del proyecto, plazos, compensación si aplica) por escrito antes de comenzar a trabajar.",
  },
  {
    num: "15",
    title: "Terminación de cuentas",
    text: "Puedes eliminar tu cuenta en cualquier momento desde la configuración de tu perfil. Al eliminar tu cuenta, los créditos no utilizados (en el caso de empresas) se perderán sin derecho a reembolso, salvo que la solicitud se haga dentro de los primeros 14 días desde la compra y no se hayan utilizado créditos. Dexpert puede suspender o eliminar cuentas que violen estos términos, con o sin previo aviso, según la gravedad de la infracción.",
  },
  {
    num: "16",
    title: "Legislación aplicable",
    text: "Estos términos se rigen por las leyes de la República de El Salvador. Cualquier disputa derivada del uso de la plataforma se resolverá, en primera instancia, mediante negociación directa con nuestro equipo de soporte.",
  },
];

export default function TermsPage() {
  return (
    <main className="px-6 py-16">
      <section className="mx-auto max-w-2xl">

        {/* Header */}
        <header className="mb-14 text-center">
          <span className="mb-4 inline-block rounded-full bg-[#F0F7FF] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#38A3F1]">
            Legal
          </span>
          <h1 className="mb-3 text-3xl md:text-4xl font-semibold text-[#0D3A6E]">
            Términos y Condiciones
          </h1>
          <p className="text-sm text-[#93B8D4]">
            Última actualización: 13 de junio de 2026
          </p>
        </header>

        <p className="mb-10 text-sm text-[#5B8DB8] leading-relaxed">
          Bienvenido a <strong className="text-[#0D3A6E] font-semibold">Dexpert</strong>. Estos términos describen las reglas que rigen el uso de la plataforma, tanto para estudiantes como para empresas. Te recomendamos leerlos completos antes de continuar.
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
              17. ¿Tienes preguntas?
            </h2>
            <p className="mb-5 text-sm text-[#5B8DB8]">
              Si tienes dudas sobre estos términos o sobre tu cuenta, contáctanos directamente.
            </p>
            <a
              href="mailto:dexpertwork@gmail.com"
              className="inline-block rounded-xl bg-[#38A3F1] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#0D5FA6] transition-colors"
            >
              Contactar soporte
            </a>
          </section>
        </div>
      </section>
    </main>
  );
}