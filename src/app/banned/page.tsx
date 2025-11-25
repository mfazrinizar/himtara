import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ShieldOff } from "lucide-react";

export default function Banned() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full">
              <ShieldOff className="w-12 h-12 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Akun Diblokir</CardTitle>
          <CardDescription>
            Akun Anda telah diblokir karena melanggar ketentuan layanan kami.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-text-secondary">
            Jika Anda merasa ini adalah kesalahan, silakan hubungi tim dukungan kami.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
