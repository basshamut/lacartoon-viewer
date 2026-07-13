export default function VideoPlayer({ episode }) {
  if (!episode) {
    return (
      <div className="aspect-video rounded-xl bg-gray-200 flex items-center justify-center">
        <p className="text-gray-500">Selecciona un episodio</p>
      </div>
    );
  }

  if (!episode.videoUrl) {
    return (
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          {episode.title}
        </h2>
        <div className="aspect-video rounded-xl bg-gray-200 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500">Video no disponible</p>
            <p className="text-xs text-gray-400 mt-1">
              La URL del video se esta cargando
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-2">
        Reproduciendo: {episode.title}
      </h2>
      <div className="aspect-video rounded-xl overflow-hidden shadow-lg bg-black">
        <iframe
          src={episode.videoUrl}
          className="w-full h-full border-0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          title={episode.title}
        />
      </div>
    </div>
  );
}
