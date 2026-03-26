export const SkeletonCard = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-6 text-center animate-pulse">
    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200" />
    <div className="h-5 w-3/4 mx-auto mb-2 bg-gray-200 rounded" />
    <div className="h-4 w-1/2 mx-auto mb-4 bg-gray-200 rounded" />
    <div className="flex justify-center gap-2 mb-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="w-6 h-6 bg-gray-200 rounded" />
      ))}
    </div>
    <div className="flex justify-center gap-3">
      <div className="h-9 w-24 bg-gray-200 rounded-lg" />
      <div className="h-9 w-24 bg-gray-200 rounded-lg" />
    </div>
  </div>
);