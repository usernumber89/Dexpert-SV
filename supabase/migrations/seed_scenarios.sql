-- ============================================================
-- DATOS INICIALES: Escenarios de simulación
-- ============================================================

INSERT INTO simulation_scenarios (area, title, client_name, client_personality, client_goal, brief, objectives, constraints, skills_required, estimated_days, difficulty) VALUES

-- DESARROLLO DE SOFTWARE
(
  'Desarrollo de Software',
  'App de inventario para ferretería',
  'Don Roberto',
  'Dueño de ferretería tradicional, desconfiado de la tecnología pero sabe que la necesita. Es directo, impaciente y valora resultados prácticos por encima de teoría.',
  'Quiere una aplicación web simple para llevar el control de su inventario porque ya perdió ventas por no saber qué tenía en stock.',
  'Necesito una aplicación donde pueda registrar los productos que tengo, saber cuántos hay, y llevar control de las ventas. Algo sencillo porque no sé mucho de computadoras.',
  '["Registrar productos con nombre, precio y cantidad", "Buscar productos por nombre o categoría", "Generar alerta cuando un producto tenga bajo stock", "Registrar ventas y descontar del inventario automáticamente"]',
  '["Debe ser usable en tablet y computadora", "Sin conexión a internet no funciona (no offline)", "Presupuesto máximo: Q2000 equivalente"]',
  ARRAY['HTML/CSS', 'JavaScript', 'Node.js', 'Bases de Datos'],
  14,
  'beginner'
),
(
  'Desarrollo de Software',
  'Sistema de reservas para clínica dental',
  'Dra. Carmen',
  'Profesional ocupada, odia el papeleo. Quiere algo que simplemente funcione sin complicaciones. Es amable pero exigente con los plazos.',
  'Necesita un sistema donde sus pacientes puedan agendar citas en línea y ella pueda ver su agenda del día sin confusiones.',
  'Actualmente mis pacientes llaman para agendar y se me acumula el trabajo. Quiero un sistema web donde ellos mismos reserven su cita y yo solo vea mi agenda.',
  '["Catálogo de servicios con precios", "Calendario con horarios disponibles", "Reserva de citas por pacientes", "Notificación de recordatorio al paciente"]',
  '["Diseño profesional que inspire confianza médica", "Debe cumplir con ley de protección de datos", "Soporte para 3 consultorios simultáneos"]',
  ARRAY['React', 'Node.js', 'PostgreSQL', 'UX/UI'],
  21,
  'intermediate'
),

-- DISEÑO GRÁFICO
(
  'Diseño Gráfico',
  'Identidad visual para cafetería artesanal',
  'María José',
  'Emprendedora creativa y entusiasta, tiene claro el concepto pero no sabe expresarlo visualmente. Valora la originalidad y la conexión emocional con el cliente.',
  'Quiere el branding completo para su nueva cafetería de especialidad: logotipo, paleta de colores, tipografía y diseño de empaques.',
  'Voy a abrir una cafetería de especialidad y necesito toda la identidad visual: desde el logo hasta cómo se ven los empaques. Quiero algo que se sienta cálido y auténtico.',
  '["Crear logotipo versátil (horizontal, vertical, isotipo)", "Definir paleta de colores con significado", "Diseñar 3 empaques (bolsa de grano, caja de regalo, vaso térmico)", "Manual de marca básico"]',
  '["Debe transmitir calidez y tradición", "Diferenciarse de Starbucks y cadenas grandes", "Presupuesto ajustado para impresión"]',
  ARRAY['Adobe Illustrator', 'Adobe Photoshop', 'Branding', 'Tipografía'],
  14,
  'beginner'
),
(
  'Diseño Gráfico',
  'Rediseño de app móvil para gimnasio',
  'Carlos Méndez',
  'Empresario fitness con ojo para el diseño moderno. Sabe lo que le gusta pero no sabe cómo lograrlo. Exigente con los detalles.',
  'Su app de rutinas de ejercicio tiene buen contenido pero una interfaz anticuada que sus usuarios critican constantemente.',
  'Tengo una app de rutinas de ejercicio con buen contenido pero la interfaz se ve anticuada. Los usuarios me han dicho que no es intuitiva. Necesito un rediseño completo.',
  '["Rediseñar pantalla de inicio con rutina del día", "Mejorar navegación entre ejercicios", "Diseñar dashboard de progreso visual", "Crear sistema de iconos personalizados"]',
  '["Seguir lineamientos de Material Design 3", "Debe funcionar en iOS y Android", "Mantener identidad de marca existente"]',
  ARRAY['Figma', 'UX Research', 'Mobile Design', 'Prototyping'],
  21,
  'intermediate'
),

-- MARKETING
(
  'Marketing',
  'Lanzamiento de línea de ropa sostenible',
  'Andrea Larín',
  'Emprendedora social apasionada por el medio ambiente. Tiene una visión clara pero recursos limitados. Busca generar impacto real con poco presupuesto.',
  'Lanza una línea de ropa hecha con materiales reciclados y necesita una campaña que comunique su propósito sin caer en greenwashing.',
  'Estoy lanzando mi marca de ropa sostenible hecha con materiales reciclados. Necesito una campaña de marketing digital que conecte con personas conscientes del medio ambiente.',
  '["Estrategia de contenido para Instagram y TikTok (1 mes)", "3 pilares de contenido con ejemplos", "Calendario editorial semanal", "Métrica de engagement esperada"]',
  '["Presupuesto publicitario: $100/mes", "Sin influencers famosos (solo micro)", "Mensaje honesto, sin exageraciones ecológicas"]',
  ARRAY['Marketing Digital', 'Copywriting', 'Redes Sociales', 'Analítica'],
  14,
  'beginner'
),
(
  'Marketing',
  'Campaña de lanzamiento para SaaS B2B',
  'Ricardo Portillo',
  'CEO de startup tecnológica, orientado a datos y resultados. No le interesan los sentimientos, solo las conversiones y el ROI.',
  'Su empresa lanza un software de gestión para pequeñas empresas y quiere una campaña B2B que genere leads calificados.',
  'Lanzamos un SaaS de gestión empresarial para PYMEs. Necesito una estrategia B2B que genere leads calificados de dueños de negocio en El Salvador.',
  '["Landing page optimizada para conversión", "Email sequence de 5 correos para nurturing", "Estrategia de LinkedIn Ads con segmentación", "Embudo de conversión completo"]',
  '["Público objetivo: dueños de PYMEs (35-55 años)", "Presupuesto: $500/mes en ads", "Resultado esperado: 50 leads calificados/mes"]',
  ARRAY['Facebook Ads', 'Email Marketing', 'Copywriting', 'Google Analytics'],
  21,
  'intermediate'
),

-- ADMINISTRACIÓN
(
  'Administración',
  'Manual de procesos para restaurante',
  'Sra. Gloria',
  'Dueña de restaurante familiar, trabaja 14 horas al día y necesita delegar. Es práctica, desconfiada y quiere todo por escrito.',
  'Su restaurante ya tiene 5 empleados pero no hay procesos documentados. Cada vez que ella no está, algo sale mal.',
  'Tengo un restaurante con 5 empleados pero no tengo nada documentado. Cuando no estoy, todo se descontrola. Necesito manuales de proceso para cada puesto.',
  '["Mapear procesos operativos del día (apertura, servicio, cierre)", "Crear manual de procedimientos para cada puesto", "Diseñar checklist de tareas diarias", "Proponer KPIs básicos de operación"]',
  '["Lenguaje simple y accesible", "Los empleados tienen educación básica", "Formato imprimible para tener en físico"]',
  ARRAY['Gestión de Procesos', 'Excel', 'Liderazgo', 'Comunicación'],
  14,
  'beginner'
),
(
  'Administración',
  'Plan de negocio para expansión de taller mecánico',
  'Don Francisco',
  'Mecánico con 20 años de experiencia, quiere crecer pero le da miedo endeudarse. Necesita ver números concretos antes de decidir.',
  'Tiene un taller mecánico exitoso y quiere abrir una segunda sucursal. Necesita un plan de negocio sólido para presentar al banco.',
  'Mi taller mecánico va bien y quiero abrir una segunda sucursal. El banco me pide un plan de negocio para el préstamo. Necesito algo serio con números reales.',
  '["Análisis FODA del negocio actual", "Proyección financiera a 3 años", "Análisis de punto de equilibrio", "Estrategia de financiamiento"]',
  '["Datos realistas basados en su operación actual", "Presentación ejecutiva para banco", "Plan de contingencia incluido"]',
  ARRAY['Finanzas', 'Planificación Estratégica', 'Excel Avanzado', 'Análisis de Datos'],
  21,
  'intermediate'
),

-- ARQUITECTURA
(
  'Arquitectura',
  'Diseño de casa habitación económica',
  'Familia Pérez',
  'Familia joven con presupuesto ajustado que compró su primer terreno. Sueñan con una casa bonita pero funcional. No saben de arquitectura pero tienen muchas ideas.',
  'Necesitan el diseño de una casa de 60m² en un terreno de 8x15m que aproveche al máximo el espacio.',
  'Compramos un terreno de 8x15 metros y queremos construir nuestra primera casa. Necesitamos planos de una casa de 60m² que aproveche bien el espacio.',
  '["Distribución de 2 cuartos, sala-comedor, cocina, 1 baño", "Planos arquitectónicos básicos", "Render 3D de fachada", "Presupuesto estimado de materiales"]',
  '["Terreno en zona sísmica (debe cumplir normas)", "Presupuesto de construcción: $25,000 máximo", "Orientación: el sol da fuerte en la tarde"]',
  ARRAY['AutoCAD', 'SketchUp', 'Diseño Arquitectónico', 'Presupuestos'],
  21,
  'intermediate'
),

-- INGENIERÍA
(
  'Ingeniería',
  'Sistema de riego automatizado para cultivo',
  'Cooperativa El Progreso',
  'Grupo de agricultores organizados, conocen el campo pero no la tecnología. Buscan eficiencia sin perder el control manual.',
  'Quieren automatizar el riego de 5 manzanas de cultivo de maíz para ahorrar agua y mejorar rendimiento.',
  'Somos una cooperativa de agricultores y queremos automatizar el riego de 5 manzanas de maíz. Necesitamos un sistema que ahorre agua y sea fácil de operar.',
  '["Diseñar distribución de tuberías y aspersores", "Programar controlador lógico con sensores de humedad", "Crear panel de monitoreo básico", "Manual de mantenimiento y operación"]',
  '["Debe funcionar con energía solar", "Mantenimiento mínimo", "Operación simple (con botones físicos de respaldo)"]',
  ARRAY['Electrónica Básica', 'Programación Arduino', 'Diseño Mecánico', 'Hidráulica'],
  21,
  'intermediate'
),

-- OTRAS ÁREAS
(
  'Otras áreas',
  'Plan de logística para entrega de productos',
  'Doña Tere',
  'Emprendedora de repostería artesanal, vende por redes sociales y ya no da abasto con las entregas. Estresada, necesita orden.',
  'Vende pasteles por encargo y ahora recibe 15-20 pedidos semanales. Necesita organizar rutas de entrega eficientes.',
  'Mis pasteles se venden bien pero ya no doy abasto con las entregas. Necesito organizar las rutas para gastar menos gasolina y llegar más rápido.',
  '["Mapear zonas de entrega por sector", "Diseñar plan de rutas optimizadas", "Crear sistema de seguimiento de pedidos", "Propuesta de tarifas de envío"]',
  '["Sin inversión en software costoso", "Entregas en moto", "Ventana de entrega: 8am-6pm"]',
  ARRAY['Logística', 'Excel', 'Google Maps', 'Servicio al Cliente'],
  10,
  'beginner'
);
