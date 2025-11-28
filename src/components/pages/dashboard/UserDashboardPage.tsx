"use client";

import { motion } from "framer-motion";
import {
  MapPin,
  Plus,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useGemList } from "@/features/gems/hooks";
import { Skeleton } from "@/components/shared/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Header } from "@/components/shared/Header";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUserAction } from "@/actions/auth";

export function UserDashboardPage() {
  const router = useRouter();
  const { data: userResult, isLoading: userLoading } = useQuery({
    queryKey: ["auth-user"],
    queryFn: getCurrentUserAction,
    staleTime: 1000 * 60 * 5, // 5 minutes - same as Header
  });

  const user = userResult?.data?.user;

  const { data: myGems, isLoading: gemsLoading } = useGemList(
    { submittedBy: user?.uid },
    { pageSize: 100 }
  );

  const handleSubmitGem = () => {
    router.push("/gems/submit");
  };

  // Calculate stats from all user's gems - handle undefined data
  const gemsData = myGems?.data?.data || [];
  const totalGems = gemsData.length;
  const pendingCount = gemsData.filter((g) => g.status === "pending").length;
  const approvedCount = gemsData.filter((g) => g.status === "approved").length;
  const rejectedCount = gemsData.filter((g) => g.status === "rejected").length;

  // Show loading skeleton while user data is loading
  if (userLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-950 py-12 px-4">
          <div className="max-w-7xl mx-auto space-y-8">
            <Skeleton className="h-20 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </>
    );
  }

  // Redirect to login if not authenticated (use replace to avoid back button issues)
  if (!user) {
    if (typeof window !== "undefined") {
      router.replace("/login");
    }
    return null;
  }

  return (
    <>
      <Header />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-950 py-12 px-4"
      >
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 dark:from-emerald-400 dark:to-emerald-600 bg-clip-text text-transparent mb-2">
                Dashboard Saya
              </h1>
              <p className="text-lg text-muted-foreground">
                Selamat datang kembali, {user?.displayName || "Pengguna"}!
              </p>
            </div>
            <Button
              onClick={handleSubmitGem}
              size="lg"
              className="gap-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Ajukan Hidden Gem
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Pengajuan
                </CardTitle>
                <MapPin className="w-5 h-5 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalGems}</div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Menunggu Review
                </CardTitle>
                <Clock className="w-5 h-5 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{pendingCount}</div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Disetujui
                </CardTitle>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{approvedCount}</div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Ditolak
                </CardTitle>
                <XCircle className="w-5 h-5 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{rejectedCount}</div>
              </CardContent>
            </Card>
          </div>

          {/* My Submissions */}
          <Card className="border-2 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <MapPin className="w-6 h-6 text-emerald-600" />
                Pengajuan Saya
              </CardTitle>
            </CardHeader>
            <CardContent>
              {gemsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : gemsData.length === 0 ? (
                <EmptyState
                  icon={<MapPin className="w-16 h-16" />}
                  title="Belum ada pengajuan"
                  description="Mulai berkontribusi dengan mengajukan destinasi wisata tersembunyi favorit Anda!"
                  action={
                    <Button onClick={handleSubmitGem} className="gap-2">
                      <Plus className="w-4 h-4" />
                      Ajukan Hidden Gem
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-4">
                  {gemsData.map((gem) => (
                    <motion.div
                      key={gem.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 rounded-xl border-2 border-border hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all gap-4"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-lg text-foreground">
                            {gem.name}
                          </h3>
                          {gem.status === "pending" && (
                            <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-semibold flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Menunggu
                            </span>
                          )}
                          {gem.status === "approved" && (
                            <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Disetujui
                            </span>
                          )}
                          {gem.status === "rejected" && (
                            <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              Ditolak
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {gem.description}
                        </p>
                        {/* Show rejection reason if rejected */}
                        {gem.status === "rejected" && gem.rejectionReason && (
                          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-red-700 dark:text-red-300 mb-0.5">
                                Alasan Penolakan:
                              </p>
                              <p className="text-sm text-red-600 dark:text-red-400">
                                {gem.rejectionReason}
                              </p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            {gem.ratingAvg?.toFixed(1) || "0.0"}
                          </span>
                          <span>{gem.reviewCount || 0} ulasan</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/gems/${gem.id}`}>
                          <Button variant="outline" size="sm">
                            Lihat Detail
                          </Button>
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </>
  );
}
