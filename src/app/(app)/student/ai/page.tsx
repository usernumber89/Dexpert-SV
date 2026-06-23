import { SimulatorChat } from '@/components/SimulatorChat';
import { createClient } from '@/lib/supabase/client';


export default async function SimulatorPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Si quieres guardar la sesión en Supabase (opcional)
  // const { data: session } = await supabase
  //   .from('ai_simulator_sessions')
  //   .insert({ user_id: user.id, scenario_id: 'cliente_dificil' })
  //   .select()
  //   .single();

  const handleComplete = async (score: number) => {
    'use server';
    // Aquí actualizas la sesión en Supabase
    // await supabase.from('ai_simulator_sessions').update({ status: 'completed', score }).eq(...)
    console.log(`Simulación completada con nota: ${score}`);
  };

  return (
    <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-4 sm:mb-8 text-[#0D3A6E]">Simulador Laboral: Manejo de Clientes</h1>
      <SimulatorChat scenarioId="cliente_dificil" onComplete={handleComplete} />
    </main>
  );
}