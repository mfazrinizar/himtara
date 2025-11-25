import { Suspense } from "react";
import { GemsListPage } from "@/components/pages/gems/GemsListPage";
import { GemCardSkeleton } from "@/components/shared/Skeleton";

function GemsListFallback() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 sm:mb-6">
            Jelajahi Destinasi Wisata
          </h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(9)].map((_, i) => (
            <GemCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Gems() {
  return (
    <Suspense fallback={<GemsListFallback />}>
      <GemsListPage />
    </Suspense>
  );
}
