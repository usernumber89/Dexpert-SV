"use client";

export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="text-center max-w-md">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Error del servidor</h1>
        <p className="text-sm text-gray-500 mb-6">Ocurrió un error inesperado.</p>
        <button
          onClick={reset}
          className="bg-gray-900 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-gray-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
