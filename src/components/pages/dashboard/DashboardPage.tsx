"use client";

import { motion } from "framer-motion";
import { MapPin, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { logoutAction } from "@/actions/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function DashboardPage() {
  const router = useRouter();

  const handleLogout = async () => {
    const result = await logoutAction();
    if (result.success) {
      toast.success(result.message);
      router.push("/");
    } else {
      toast.error(result.message);
    }
  };

  // Mock user data
  const user = {
    displayName: "Pengguna Demo",
    email: "demo@himtara.com",
    role: "user",
  };

  const bookmarkedGems = [
    {
      id: "1",
      name: "Pantai Tersembunyi Nusa Penida",
      rating: 4.8,
      reviewCount: 120,
    },
    {
      id: "2",
      name: "Air Terjun Coban Rondo",
      rating: 4.6,
      reviewCount: 85,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background py-8 px-4"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-text-primary mb-2">
              Dashboard
            </h1>
            <p className="text-text-secondary">
              Selamat datang kembali, {user.displayName}!
            </p>
          </div>
          <Button onClick={handleLogout} variant="secondary">
            <LogOut className="w-4 h-4 mr-2" />
            Keluar
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* User Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profil Saya
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-text-secondary">Nama</p>
                <p className="font-medium">{user.displayName}</p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Role</p>
                <p className="font-medium capitalize">{user.role}</p>
              </div>
            </CardContent>
          </Card>

          {/* Bookmarked Gems */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Destinasi Favorit
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bookmarkedGems.length === 0 ? (
                <p className="text-text-secondary text-center py-8">
                  Belum ada destinasi favorit
                </p>
              ) : (
                <div className="space-y-4">
                  {bookmarkedGems.map((gem) => (
                    <div
                      key={gem.id}
                      className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-surface/50 transition-colors"
                    >
                      <div>
                        <h3 className="font-semibold text-text-primary">
                          {gem.name}
                        </h3>
                        <p className="text-sm text-text-secondary">
                          ⭐ {gem.rating} ({gem.reviewCount} ulasan)
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        Lihat
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
