export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#00d4ff] mx-auto mb-4"></div>
        <p className="text-[#b3b3b3] text-lg">Laden...</p>
      </div>
    </div>
  );
}

