"use client";

export default function RootError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F4F9FF] via-white to-[#EEF6FF] p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">!</span>
        </div>
        <h1 className="text-xl font-bold text-[#0D3A6E] mb-2">Algo salió mal</h1>
        <p className="text-sm text-[#5B8DB8] mb-6">Ocurrió un error inesperado. Intentá de nuevo.</p>
        <button
          onClick={reset}
          className="bg-[#38A3F1] text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-[#0D5FA6] transition-colors"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}
