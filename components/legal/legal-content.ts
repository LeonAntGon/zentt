import type { LegalSection } from "./LegalDocumentLayout";

export const privacySections: LegalSection[] = [
  {
    title: "1. Responsable y alcance",
    paragraphs: [
      "El responsable del tratamiento de los datos es Leonardo Antonio González, con domicilio en San Miguel de Tucumán, República Argentina. Esta Política describe cómo Zentt recopila, utiliza, almacena y protege información personal y comercial de quienes utilizan la Plataforma.",
      "El tratamiento se realiza conforme a la Ley de Protección de Datos Personales N.º 25.326 y demás normativa argentina aplicable. Cuando el usuario carga información de sus propios clientes, actúa como responsable de contar con una base legal y de informarles adecuadamente sobre ese tratamiento.",
    ],
  },
  {
    title: "2. Información que recopilamos",
    bullets: [
      "Datos de cuenta: nombre, apellido, usuario, correo electrónico, teléfono y credenciales necesarias para acceder al servicio.",
      "Datos de clientes del usuario: nombre, correo electrónico, teléfono y contenido de consultas enviadas desde los sitios públicos.",
      "Datos operativos: alojamientos, reservas, disponibilidad, tarifas, fechas y datos que el usuario declara o registra para administrar su negocio.",
      "Datos de rendimiento: ingresos registrados por el usuario y métricas de ocupación o reportes internos.",
      "Contenido público: textos, fotografías, videos, logotipos, enlaces y datos de contacto publicados por el usuario.",
      "Datos de sincronización: enlaces y datos provenientes de calendarios iCal, incluidos calendarios de Airbnb u otros canales.",
      "Datos técnicos: dirección IP, navegador, dispositivo, registros de acceso, errores y eventos necesarios para seguridad y funcionamiento.",
    ],
  },
  {
    title: "3. Uso de la información y comunicaciones",
    paragraphs: [
      "Utilizamos la información para crear y mantener cuentas, alojar sitios públicos, administrar alojamientos, reservas y consultas, generar reportes, sincronizar disponibilidad, prevenir abusos, brindar soporte y mejorar la Plataforma.",
      "Podemos utilizar el correo registrado para enviar bienvenida, códigos de recuperación, nuevas consultas, recordatorios de prueba, avisos de suscripción, cambios legales y comunicaciones operativas necesarias para el servicio.",
      "Los datos comerciales, ingresos, reservas y métricas de un usuario se mantienen aislados de otros usuarios y no se venden ni se publican como información individual.",
    ],
  },
  {
    title: "4. Analíticas web y cookies",
    paragraphs: [
      "Zentt utiliza Google Analytics 4 en la página institucional y en los sitios públicos generados para los usuarios cuando la medición está habilitada. Esto permite medir sesiones, usuarios activos, vistas de página, rutas visitadas, fechas, navegador, dispositivo y datos técnicos o de ubicación aproximada.",
      "Los reportes del panel se generan a partir de esas métricas y se muestran de forma asociada al usuario o alojamiento correspondiente. Las métricas pueden presentar demoras, diferencias o indisponibilidad por causas de Google Analytics u otros proveedores.",
      "Google puede utilizar cookies, identificadores y tecnologías similares conforme a sus propias políticas. Los visitantes de los sitios públicos deben recibir la información y opciones de consentimiento que correspondan según la normativa aplicable. Zentt no utiliza los reportes para vender perfiles publicitarios individuales.",
    ],
  },
  {
    title: "5. Pagos y transacciones",
    paragraphs: [
      "Zentt facilita la recepción de consultas, pero no interviene en los acuerdos, ventas ni pagos entre el usuario y sus clientes finales. Esas operaciones se realizan por fuera de la Plataforma.",
      "El pago por el uso de Zentt puede gestionarse mediante transferencia bancaria o mediante los procesadores que se encuentren integrados y habilitados, como Polar o Stripe. Zentt no almacena datos completos de tarjetas; el procesamiento se rige por las políticas de cada proveedor.",
    ],
  },
  {
    title: "6. Proveedores e infraestructura",
    paragraphs: [
      "Para operar el servicio podemos utilizar proveedores especializados, incluyendo Render para el backend, Vercel para el frontend, Supabase/PostgreSQL para base de datos y almacenamiento, Brevo para correos transaccionales, y Google Analytics/Google Cloud para analíticas. Podrán intervenir AWS, Cloudflare, Airbnb u otros proveedores cuando formen parte de la configuración activa del servicio.",
      "Estos proveedores pueden alojar, procesar o transferir información en servidores ubicados fuera de Argentina y cuentan con sus propias condiciones y políticas de seguridad y privacidad.",
    ],
  },
  {
    title: "7. Seguridad y conservación",
    paragraphs: [
      "Aplicamos medidas técnicas y organizativas razonables, como control de acceso, autenticación, separación por usuario, cifrado en tránsito y gestión de secretos. Ninguna transmisión por internet o infraestructura de terceros puede garantizarse como absolutamente invulnerable.",
      "Conservamos la información mientras la cuenta esté activa o sea necesaria para prestar el servicio, cumplir obligaciones legales, resolver disputas, prevenir fraude o mantener registros técnicos. Luego podrá eliminarse, anonimizarse o conservarse durante el plazo legal correspondiente.",
    ],
  },
  {
    title: "8. Derechos de los titulares",
    paragraphs: [
      "Los titulares pueden solicitar acceso, actualización, rectificación o supresión de sus datos personales. El derecho de acceso puede ejercerse gratuitamente a intervalos no inferiores a seis meses, salvo que exista un interés legítimo para solicitarlo antes.",
      "Las solicitudes pueden enviarse a leonarddevweb@gmail.com indicando el dato o cuenta involucrada. También puede acudirse a la Agencia de Acceso a la Información Pública, autoridad de aplicación competente en materia de protección de datos personales en Argentina.",
    ],
  },
  {
    title: "9. Datos de terceros y menores",
    paragraphs: [
      "El usuario es responsable de obtener las autorizaciones necesarias antes de cargar datos de huéspedes, clientes o terceros. No debe cargar datos sensibles que no sean necesarios para la gestión del alojamiento.",
      "La Plataforma no está destinada a menores de edad. Si se detecta la creación de una cuenta o el envío de datos de un menor sin autorización válida, podrá solicitarse su eliminación.",
    ],
  },
  {
    title: "10. Contacto",
    paragraphs: [
      "Para ejercer derechos o realizar consultas sobre el tratamiento de datos: leonarddevweb@gmail.com.",
      "Teléfono / WhatsApp / SMS: +54 9 381 338 0751.",
    ],
  },
];

export const termsSections: LegalSection[] = [
  {
    title: "1. Descripción del servicio",
    paragraphs: [
      "Zentt es una plataforma SaaS de gestión de alojamientos y creación de sitios web públicos. Sus funcionalidades pueden incluir carga de contenido, administración de alojamientos, recepción de consultas, reservas, sincronización iCal, tarifas, calendarios y reportes.",
      "Zentt no es intermediario comercial, agencia de viajes ni pasarela de pago para las operaciones entre el usuario y sus clientes. Las ventas, acuerdos, prestación del alojamiento y cobros finales se realizan fuera de la Plataforma.",
    ],
  },
  {
    title: "2. Cuenta y datos de registro",
    paragraphs: [
      "Para utilizar el servicio, el usuario debe proporcionar información verdadera, mantener sus credenciales seguras y notificar cualquier uso no autorizado. La cuenta no puede transferirse sin autorización.",
      "El usuario acepta la Política de Privacidad y estos Términos al registrarse. La aceptación se registra junto con la versión del documento, fecha, IP y datos técnicos necesarios para acreditar el consentimiento.",
    ],
  },
  {
    title: "3. Contenido y datos de clientes",
    paragraphs: [
      "El usuario conserva sus derechos sobre textos, imágenes, videos, logotipos y datos que cargue. Otorga a Zentt una licencia limitada, no exclusiva y necesaria para almacenar, procesar, mostrar y operar ese contenido dentro de las funciones contratadas.",
      "El usuario garantiza que cuenta con derechos y permisos para publicar el contenido y que tratará los datos de sus clientes de acuerdo con la normativa aplicable. No debe usar Zentt para actividades ilícitas, fraudulentas, discriminatorias o que vulneren derechos de terceros.",
    ],
  },
  {
    title: "4. Analíticas web",
    paragraphs: [
      "Zentt puede utilizar Google Analytics 4 en la landing institucional y en los sitios públicos de los usuarios para calcular sesiones, usuarios activos y vistas de página. Estas métricas pueden mostrarse al propietario del alojamiento en reportes filtrados por período y alojamiento.",
      "Los reportes dependen de la correcta configuración, disponibilidad y criterios de medición de Google Analytics. No constituyen garantía de ventas, conversiones, reservas ni ingresos y pueden diferir de otros sistemas de medición.",
      "El usuario debe informar a los visitantes de su sitio público sobre cookies y analítica web, y obtener los consentimientos que resulten exigibles. No puede manipular las métricas ni utilizar la información para vigilancia o identificación ilegal de personas.",
    ],
  },
  {
    title: "5. Suscripción y pagos",
    paragraphs: [
      "El acceso a determinadas funciones requiere una suscripción. Los pagos pueden realizarse por transferencia bancaria o mediante los procesadores que estén efectivamente habilitados, como Polar o Stripe.",
      "El usuario debe mantener su suscripción al día. Ante falta de pago o vencimiento, Zentt podrá enviar avisos al correo registrado y suspender temporal o definitivamente el panel o el sitio público, respetando las obligaciones legales aplicables.",
    ],
  },
  {
    title: "6. Disponibilidad y servicios de terceros",
    paragraphs: [
      "El funcionamiento puede depender de Render, Vercel, Supabase, Brevo, Google Analytics, servicios de almacenamiento, APIs de Airbnb/iCal y procesadores de pago. Cambios, caídas, límites, bloqueos o errores de dichos servicios pueden afectar la Plataforma.",
      "Zentt procurará restablecer el servicio razonablemente, pero no garantiza disponibilidad permanente ni sincronización ininterrumpida. Los calendarios iCal pueden presentar demoras o errores ajenos a Zentt.",
    ],
  },
  {
    title: "7. Reembolsos y limitación de responsabilidad",
    paragraphs: [
      "Las solicitudes de reembolso se resolverán según las condiciones comerciales aplicables y los derechos irrenunciables previstos por la legislación argentina. No se garantizan reembolsos por interrupciones o errores imputables exclusivamente a proveedores externos, sin perjuicio de los derechos obligatorios del consumidor.",
      "En la máxima medida permitida por la ley, Zentt no será responsable por lucro cesante, pérdida de ventas, daños indirectos, disputas entre el usuario y sus clientes, ni por la legalidad, veracidad o calidad del contenido publicado por el usuario.",
    ],
  },
  {
    title: "8. Propiedad intelectual",
    paragraphs: [
      "El código, diseño, marca, arquitectura, bases de datos y componentes propios de Zentt pertenecen a Leonardo Antonio González o a sus licenciantes y están protegidos por las normas de propiedad intelectual aplicables.",
    ],
  },
  {
    title: "9. Suspensión, cierre y modificaciones",
    paragraphs: [
      "Zentt podrá suspender o cerrar cuentas por falta de pago, incumplimiento, fraude, riesgo de seguridad o uso ilegal. Al cerrar una cuenta, podrán conservarse datos durante el tiempo necesario para obligaciones legales, seguridad o resolución de disputas.",
      "Estos Términos pueden modificarse. Las nuevas versiones regirán desde su publicación y se comunicarán a usuarios activos cuando el cambio sea relevante, utilizando el correo asociado a la cuenta.",
    ],
  },
  {
    title: "10. Ley aplicable y contacto",
    paragraphs: [
      "Estos Términos se rigen por las leyes de la República Argentina. Las controversias se someterán a los tribunales competentes de la Provincia de Tucumán, sin perjuicio de los derechos de consumidores y usuarios que no puedan ser renunciados.",
      "Para consultas o notificaciones legales: leonarddevweb@gmail.com. Teléfono / WhatsApp / SMS: +54 9 381 338 0751.",
    ],
  },
];
