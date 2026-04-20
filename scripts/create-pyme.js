// scripts/crear-pyme.js
require('dotenv').config();
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

async function crearPyme() {
  const userId = "user_2yR1RumOPkou2fddbmM43L1Mn8p";
  
  try {
    // 1. Verificar/Crear UserProfile (SIN email)
    console.log('📝 Verificando UserProfile...');
    
    let userProfile = await prisma.userProfile.findUnique({
      where: { userId: userId }
    });
    
    if (!userProfile) {
      userProfile = await prisma.userProfile.create({
        data: {
          userId: userId,
          role: "PYME"
        }
      });
      console.log('✅ UserProfile creado:', userProfile.id);
    } else {
      console.log('✅ UserProfile existente:', userProfile.id);
    }
    
    // 2. Crear PYME
    console.log('\n🏢 Creando PYME...');
    
    const pyme = await prisma.pyme.create({
      data: {
        userId: userId,
        name: "CONTAES",
        contact: "70000000",
        description: "Servicios contables profesionales"
      }
    });
    
    console.log('✅ PYME creada:', pyme.id);
    console.log('   Nombre:', pyme.name);
    console.log('   Contacto:', pyme.contact);
    
    // 3. Crear proyecto
    console.log('\n📦 Creando proyecto de prueba...');
    
    const project = await prisma.project.create({
      data: {
        pymeId: pyme.id,
        title: "Rediseño de sitio web",
        skills: "React, Next.js, Tailwind",
        description: "Modernizar sitio web corporativo",
        isPublished: true,
        status: "active"
      }
    });
    
    console.log('✅ Proyecto creado:', project.id);
    console.log('   Título:', project.title);
    
    console.log('\n═══════════════════════════════════════');
    console.log('🎉 ¡LISTO!');
    console.log('═══════════════════════════════════════');
    console.log('✅ http://localhost:3000/pyme/dashboard');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  await prisma.$disconnect();
}

crearPyme();