import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({
  title = "Tidak ada data",
  description = "Belum ada data untuk ditampilkan",
  icon,
  action,
}: EmptyStateProps) {
  return (
    <Card className="flex flex-col py-16 px-4 text-center">
      <CardContent className="p-0 flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center text-muted-foreground mb-2">
          {icon || <MapPin className="w-16 h-16" />}
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <h3 className="text-xl font-semibold text-foreground mb-2 sm:text-2xl">
            {title}
          </h3>
          <p className="text-muted-foreground max-w-md text-sm sm:text-base mb-4">
            {description}
          </p>
          {action && <div className="mt-4">{action}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
