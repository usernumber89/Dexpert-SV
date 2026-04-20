// scripts/create-project.js
require('dotenv').config();
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const readline = require('readline');

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createProject() {
  console.log('\n🚀 CREAR NUEVO PROYECTO\n');
  console.log('═'.repeat(50));
  
  try {
    // 1. Mostrar PYMEs disponibles (SIN el campo industry)
    const pymes = await prisma.pyme.findMany({
      select: {
        id: true,
        name: true,
        description: true, // ✅ Campo que sí existe
        website: true,     // ✅ Campo que sí existe
      }
    });
    
    if (pymes.length === 0) {
      console.log('\n❌ No hay PYMEs registradas.');
      console.log('\n📝 Para crear una PYME rápidamente:');
      console.log('1. Abre Prisma Studio: npx prisma studio');
      console.log('2. Ve a la tabla UserProfile');
      console.log('3. Crea un usuario con role: PYME');
      console.log('4. Ve a la tabla Pyme y crea una empresa');
      return;
    }
    
    console.log('\n📋 PYMEs disponibles:');
    pymes.forEach((p, i) => {
      console.log(`\n  ${i + 1}. ${p.name || 'Sin nombre'}`);
      console.log(`     ID: ${p.id}`);
      if (p.description) console.log(`     Descripción: ${p.description.substring(0, 50)}...`);
      if (p.website) console.log(`     Web: ${p.website}`);
    });
    
    // 2. Seleccionar PYME
    console.log('\n═'.repeat(50));
    const pymeIndex = await question('\n📌 Selecciona el número de la PYME: ');
    const selectedPyme = pymes[parseInt(pymeIndex) - 1];
    
    if (!selectedPyme) {
      console.log('❌ Selección inválida');
      return;
    }
    
    console.log(`\n✅ PYME seleccionada: ${selectedPyme.name}`);
    console.log('\n═'.repeat(50));
    
    // 3. Datos del proyecto
    console.log('\n📝 DATOS DEL PROYECTO\n');
    
    const title = await question('📌 Título del proyecto: ');
    
    if (!title) {
      console.log('❌ El título es obligatorio');
      return;
    }
    
    const description = await question('📄 Descripción: ');
    const skills = await question('🛠️  Skills (separadas por coma): ');
    
    console.log('\n📂 Categorías disponibles:');
    const categories = ['Web development', 'Marketing', 'Design', 'Data', 'Other'];
    categories.forEach((c, i) => console.log(`  ${i + 1}. ${c}`));
    const categoryIndex = await question('🏷️  Selecciona categoría (número): ');
    const category = categories[parseInt(categoryIndex) - 1] || 'Other';
    
    console.log('\n📊 Niveles disponibles:');
    const levels = ['Beginner', 'Intermediate', 'Advanced'];
    levels.forEach((l, i) => console.log(`  ${i + 1}. ${l}`));
    const levelIndex = await question('📈 Selecciona nivel (número): ');
    const level = levels[parseInt(levelIndex) - 1] || 'Beginner';
    
    const publishAnswer = await question('✅ ¿Publicar ahora? (s/n): ');
    const isPublished = publishAnswer.toLowerCase() === 's';
    
    // 4. Crear proyecto
    console.log('\n⏳ Creando proyecto...');
    
    const project = await prisma.project.create({
      data: {
        pymeId: selectedPyme.id,
        title,
        description: description || null,
        skills: skills || null,
        category: category || null,
        level: level || null,
        isPublished,
        status: 'active',
      },
      include: {
        pyme: {
          select: {
            name: true
          }
        }
      }
    });
    
    console.log('\n═'.repeat(50));
    console.log('✅ ¡PROYECTO CREADO EXITOSAMENTE!');
    console.log('═'.repeat(50));
    console.log(`\n📋 Título: ${project.title}`);
    console.log(`🏢 Empresa: ${project.pyme?.name || 'N/A'}`);
    console.log(`📂 Categoría: ${project.category || 'No especificada'}`);
    console.log(`📊 Nivel: ${project.level || 'No especificado'}`);
    console.log(`👁️  Publicado: ${project.isPublished ? 'Sí' : 'No'}`);
    console.log(`\n🔗 URL: /student/projects/${project.id}`);
    console.log(`🆔 ID: ${project.id}`);
    
  } catch (error) {
    console.error('\n❌ Error al crear proyecto:', error.message);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

createProject();