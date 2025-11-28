"use client";

import { motion } from "framer-motion";
import {
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  TrendingUp,
  Users,
  Shield,
  UserX,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGemList, useApproveGem, useRejectGem } from "@/features/gems/hooks";
import {
  useUserList,
  useUpdateUserRole,
  useUpdateUserStatus,
} from "@/features/users/hooks";
import { Skeleton } from "@/components/shared/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Header } from "@/components/shared/Header";
import Link from "next/link";
import { toast } from "sonner";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUserAction } from "@/actions/auth";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { toDate } from "@/lib/utils";

export function AdminDashboardPage() {
  const [mainTab, setMainTab] = useState<"gems" | "users">("gems");
  const [gemTab, setGemTab] = useState<"pending" | "approved" | "rejected">(
    "pending"
  );
  const [userTab, setUserTab] = useState<"all" | "admins" | "banned">("all");

  // Dialog states
  const [makeAdminDialog, setMakeAdminDialog] = useState<{
    open: boolean;
    uid: string;
    name: string;
  }>({ open: false, uid: "", name: "" });
  const [removeAdminDialog, setRemoveAdminDialog] = useState<{
    open: boolean;
    uid: string;
    name: string;
  }>({ open: false, uid: "", name: "" });
  const [banDialog, setBanDialog] = useState<{
    open: boolean;
    uid: string;
    name: string;
  }>({ open: false, uid: "", name: "" });
  const [banReason, setBanReason] = useState("");
  const [unbanDialog, setUnbanDialog] = useState<{
    open: boolean;
    uid: string;
    name: string;
  }>({ open: false, uid: "", name: "" });
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    id: string;
    name: string;
  }>({ open: false, id: "", name: "" });
  const [rejectReason, setRejectReason] = useState("");

  const { data: userResult } = useQuery({
    queryKey: ["auth-user"],
    queryFn: getCurrentUserAction,
    staleTime: 1000 * 60 * 5,
  });

  const user = userResult?.data?.user;

  // Get gems data
  const { data: gems, isLoading: gemsLoading } = useGemList(
    { status: gemTab },
    { pageSize: 20 }
  );
  const { data: pendingGems } = useGemList(
    { status: "pending" },
    { pageSize: 100 }
  );
  const { data: approvedGems } = useGemList(
    { status: "approved" },
    { pageSize: 100 }
  );
  const { data: rejectedGems } = useGemList(
    { status: "rejected" },
    { pageSize: 100 }
  );

  // Get users data - fetch all users once and filter client-side for stats
  const { data: allUsersResponse, isLoading: usersLoading } = useUserList(
    {},
    { pageSize: 1000 }
  );

  // Client-side filtering for different views
  const allUsers = allUsersResponse?.data?.data || [];
  const adminUsers = allUsers.filter((u) => u.role === "admin");
  const bannedUsers = allUsers.filter((u) => u.status === "banned");

  // Filter based on active tab
  const displayedUsers =
    userTab === "all"
      ? allUsers
      : userTab === "admins"
      ? adminUsers
      : bannedUsers;

  // Mutations
  const approveMutation = useApproveGem();
  const rejectMutation = useRejectGem();
  const updateRoleMutation = useUpdateUserRole();
  const updateStatusMutation = useUpdateUserStatus();

  // Gem handlers
  const handleApprove = async (gemId: string) => {
    if (!user?.uid) {
      toast.error("Anda harus login sebagai admin");
      return;
    }

    try {
      const result = await approveMutation.mutateAsync({
        id: gemId,
        verifiedBy: user.uid,
      });
      if (result.success) {
        toast.success("Hidden Gem berhasil disetujui!");
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Gagal menyetujui Hidden Gem");
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Alasan penolakan harus diisi");
      return;
    }

    try {
      const result = await rejectMutation.mutateAsync({
        id: rejectDialog.id,
        reason: rejectReason,
      });
      if (result.success) {
        toast.success("Hidden Gem berhasil ditolak");
        setRejectDialog({ open: false, id: "", name: "" });
        setRejectReason("");
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Gagal menolak Hidden Gem");
    }
  };

  // User handlers
  const handleMakeAdmin = async () => {
    try {
      const result = await updateRoleMutation.mutateAsync({
        uid: makeAdminDialog.uid,
        role: "admin",
      });
      if (result.success) {
        toast.success("Pengguna berhasil dijadikan admin");
        setMakeAdminDialog({ open: false, uid: "", name: "" });
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Gagal mengubah role pengguna");
    }
  };

  const handleRemoveAdmin = async () => {
    try {
      const result = await updateRoleMutation.mutateAsync({
        uid: removeAdminDialog.uid,
        role: "user",
      });
      if (result.success) {
        toast.success("Admin berhasil diubah menjadi user");
        setRemoveAdminDialog({ open: false, uid: "", name: "" });
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Gagal mengubah role pengguna");
    }
  };

  const handleBanUser = async () => {
    if (!banReason.trim()) {
      toast.error("Alasan pemblokiran harus diisi");
      return;
    }

    try {
      const result = await updateStatusMutation.mutateAsync({
        uid: banDialog.uid,
        status: "banned",
        reason: banReason,
      });
      if (result.success) {
        toast.success("Pengguna berhasil diblokir");
        setBanDialog({ open: false, uid: "", name: "" });
        setBanReason("");
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Gagal memblokir pengguna");
    }
  };

  const handleUnbanUser = async () => {
    try {
      const result = await updateStatusMutation.mutateAsync({
        uid: unbanDialog.uid,
        status: "active",
      });
      if (result.success) {
        toast.success("Pengguna berhasil diaktifkan kembali");
        setUnbanDialog({ open: false, uid: "", name: "" });
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Gagal mengaktifkan pengguna");
    }
  };

  return (
    <>
      <Header />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-gradient-to-br overflow-hidden from-slate-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950 py-12 px-4"
      >
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 dark:from-emerald-400 dark:to-blue-400 bg-clip-text text-transparent mb-2">
              Admin Dashboard
            </h1>
            <p className="text-lg text-muted-foreground">
              Kelola destinasi wisata dan pengguna platform
            </p>
          </div>

          {/* Main Tab Selector */}
          <div className="overflow-x-auto pb-2 -mx-4 px-4">
            <div className="flex gap-2 border-b-2 border-border pb-2 min-w-max">
              <Button
                variant={mainTab === "gems" ? "default" : "ghost"}
                onClick={() => setMainTab("gems")}
                className="gap-2 whitespace-nowrap"
                size="lg"
              >
                <MapPin className="w-5 h-5" />
                Kelola Destinasi
              </Button>
              <Button
                variant={mainTab === "users" ? "default" : "ghost"}
                onClick={() => setMainTab("users")}
                className="gap-2 whitespace-nowrap"
                size="lg"
              >
                <Users className="w-5 h-5" />
                Kelola Pengguna
              </Button>
            </div>
          </div>

          {/* Gems Management Tab */}
          {mainTab === "gems" && (
            <>
              {/* Gems Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-amber-900 dark:text-amber-100">
                      Menunggu Review
                    </CardTitle>
                    <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-amber-900 dark:text-amber-100">
                      {pendingGems?.data?.pagination.totalCount || 0}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">
                      Disetujui
                    </CardTitle>
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-900 dark:text-green-100">
                      {approvedGems?.data?.pagination.totalCount || 0}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-red-900 dark:text-red-100">
                      Ditolak
                    </CardTitle>
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-900 dark:text-red-100">
                      {rejectedGems?.data?.pagination.totalCount || 0}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                      Total Destinasi
                    </CardTitle>
                    <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
                      {(pendingGems?.data?.pagination.totalCount || 0) +
                        (approvedGems?.data?.pagination.totalCount || 0) +
                        (rejectedGems?.data?.pagination.totalCount || 0)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Gems Filter Tabs */}
              <div className="overflow-x-auto pb-2 -mx-4 px-4">
                <div className="flex gap-2 border-b border-border pb-2 min-w-max">
                  <Button
                    variant={gemTab === "pending" ? "default" : "ghost"}
                    onClick={() => setGemTab("pending")}
                    className="gap-2 whitespace-nowrap"
                  >
                    <Clock className="w-4 h-4" />
                    Menunggu ({pendingGems?.data?.pagination.totalCount || 0})
                  </Button>
                  <Button
                    variant={gemTab === "approved" ? "default" : "ghost"}
                    onClick={() => setGemTab("approved")}
                    className="gap-2 whitespace-nowrap"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Disetujui ({approvedGems?.data?.pagination.totalCount || 0})
                  </Button>
                  <Button
                    variant={gemTab === "rejected" ? "default" : "ghost"}
                    onClick={() => setGemTab("rejected")}
                    className="gap-2 whitespace-nowrap"
                  >
                    <XCircle className="w-4 h-4" />
                    Ditolak ({rejectedGems?.data?.pagination.totalCount || 0})
                  </Button>
                </div>
              </div>

              {/* Gems List */}
              <Card className="border-2 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <MapPin className="w-6 h-6 text-emerald-600" />
                    Daftar Destinasi -{" "}
                    {gemTab === "pending"
                      ? "Menunggu Review"
                      : gemTab === "approved"
                      ? "Disetujui"
                      : "Ditolak"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {gemsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                      ))}
                    </div>
                  ) : !gems?.data?.data || gems.data.data.length === 0 ? (
                    <EmptyState
                      icon={<MapPin className="w-16 h-16" />}
                      title={`Tidak ada destinasi ${
                        gemTab === "pending"
                          ? "menunggu review"
                          : gemTab === "approved"
                          ? "disetujui"
                          : "ditolak"
                      }`}
                      description="Belum ada data untuk ditampilkan"
                    />
                  ) : (
                    <div className="space-y-4">
                      {gems.data.data.map((gem) => (
                        <motion.div
                          key={gem.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex flex-col sm:flex-row items-start justify-between p-6 rounded-xl border-2 border-border hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all gap-4"
                        >
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="font-bold text-lg text-foreground">
                                {gem.name}
                              </h3>
                              {gem.status === "pending" && (
                                <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-semibold flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Menunggu Review
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
                            {gem.status === "rejected" &&
                              gem.rejectionReason && (
                                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 mt-2">
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
                              {gem.verifiedBy && (
                                <span className="text-xs text-green-600 dark:text-green-400">
                                  Diverifikasi
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 min-w-[200px]">
                            <Link href={`/gems/${gem.id}`} className="w-full">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                              >
                                Lihat Detail
                              </Button>
                            </Link>
                            {gem.status === "pending" && (
                              <>
                                <Button
                                  onClick={() => handleApprove(gem.id)}
                                  disabled={approveMutation.isPending}
                                  size="sm"
                                  className="w-full bg-green-600 hover:bg-green-700 gap-2"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Setujui
                                </Button>
                                <Button
                                  onClick={() =>
                                    setRejectDialog({
                                      open: true,
                                      id: gem.id,
                                      name: gem.name,
                                    })
                                  }
                                  disabled={rejectMutation.isPending}
                                  variant="destructive"
                                  size="sm"
                                  className="w-full gap-2"
                                >
                                  <XCircle className="w-4 h-4" />
                                  Tolak
                                </Button>
                              </>
                            )}
                            {gem.status === "approved" && (
                              <Button
                                onClick={() =>
                                  setRejectDialog({
                                    open: true,
                                    id: gem.id,
                                    name: gem.name,
                                  })
                                }
                                disabled={rejectMutation.isPending}
                                variant="destructive"
                                size="sm"
                                className="w-full gap-2"
                              >
                                <XCircle className="w-4 h-4" />
                                Ubah ke Ditolak
                              </Button>
                            )}
                            {gem.status === "rejected" && (
                              <Button
                                onClick={() => handleApprove(gem.id)}
                                disabled={approveMutation.isPending}
                                size="sm"
                                className="w-full bg-green-600 hover:bg-green-700 gap-2"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Ubah ke Disetujui
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {/* Users Management Tab */}
          {mainTab === "users" && (
            <>
              {/* Users Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
                <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Total Pengguna
                    </CardTitle>
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                      {allUsers.length}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
                      Admin
                    </CardTitle>
                    <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                      {adminUsers.length}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-red-900 dark:text-red-100">
                      Diblokir
                    </CardTitle>
                    <UserX className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-900 dark:text-red-100">
                      {bannedUsers.length}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Users Filter Tabs */}
              <div className="overflow-x-auto pb-2 -mx-4 px-4">
                <div className="flex gap-2 border-b border-border pb-2 min-w-max">
                  <Button
                    variant={userTab === "all" ? "default" : "ghost"}
                    onClick={() => setUserTab("all")}
                    className="gap-2 whitespace-nowrap"
                  >
                    <Users className="w-4 h-4" />
                    Semua ({allUsers.length})
                  </Button>
                  <Button
                    variant={userTab === "admins" ? "default" : "ghost"}
                    onClick={() => setUserTab("admins")}
                    className="gap-2 whitespace-nowrap"
                  >
                    <Shield className="w-4 h-4" />
                    Admin ({adminUsers.length})
                  </Button>
                  <Button
                    variant={userTab === "banned" ? "default" : "ghost"}
                    onClick={() => setUserTab("banned")}
                    className="gap-2 whitespace-nowrap"
                  >
                    <UserX className="w-4 h-4" />
                    Diblokir ({bannedUsers.length})
                  </Button>
                </div>
              </div>

              {/* Users List */}
              <Card className="border-2 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Users className="w-6 h-6 text-blue-600" />
                    Daftar Pengguna -{" "}
                    {userTab === "all"
                      ? "Semua"
                      : userTab === "admins"
                      ? "Admin"
                      : "Diblokir"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {usersLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                      ))}
                    </div>
                  ) : !displayedUsers || displayedUsers.length === 0 ? (
                    <EmptyState
                      icon={<Users className="w-16 h-16" />}
                      title={`Tidak ada pengguna ${
                        userTab === "all"
                          ? ""
                          : userTab === "admins"
                          ? "admin"
                          : "diblokir"
                      }`}
                      description="Belum ada data untuk ditampilkan"
                    />
                  ) : (
                    <div className="space-y-4">
                      {displayedUsers.map((usr) => (
                        <motion.div
                          key={usr.uid}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex flex-col sm:flex-row items-start justify-between p-6 rounded-xl border-2 border-border hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all gap-4"
                        >
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="font-bold text-lg text-foreground">
                                {usr.displayName}
                              </h3>
                              {usr.uid === user?.uid && (
                                <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                                  Anda
                                </span>
                              )}
                              {usr.role === "admin" && (
                                <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold flex items-center gap-1">
                                  <Shield className="w-3 h-3" />
                                  Admin
                                </span>
                              )}
                              {usr.status === "banned" && (
                                <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-1">
                                  <UserX className="w-3 h-3" />
                                  Diblokir
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {usr.email}
                            </p>
                            {usr.lastLoginAt && (
                              <p className="text-xs text-muted-foreground">
                                Login terakhir:{" "}
                                {formatDistanceToNow(toDate(usr.lastLoginAt), {
                                  addSuffix: true,
                                  locale: localeId,
                                })}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col gap-2 min-w-[200px]">
                            {usr.role === "user" ? (
                              <Button
                                onClick={() =>
                                  setMakeAdminDialog({
                                    open: true,
                                    uid: usr.uid,
                                    name: usr.displayName,
                                  })
                                }
                                disabled={updateRoleMutation.isPending}
                                size="sm"
                                className="w-full bg-purple-600 hover:bg-purple-700 gap-2"
                              >
                                <Shield className="w-4 h-4" />
                                Jadikan Admin
                              </Button>
                            ) : (
                              <Button
                                onClick={() =>
                                  setRemoveAdminDialog({
                                    open: true,
                                    uid: usr.uid,
                                    name: usr.displayName,
                                  })
                                }
                                disabled={
                                  updateRoleMutation.isPending ||
                                  usr.uid === user?.uid
                                }
                                variant="outline"
                                size="sm"
                                className="w-full gap-2"
                              >
                                Hapus Role Admin
                              </Button>
                            )}
                            {usr.status === "active" ? (
                              <Button
                                onClick={() => {
                                  if (usr.uid === user?.uid) {
                                    toast.error(
                                      "Anda tidak dapat memblokir diri sendiri"
                                    );
                                    return;
                                  }
                                  setBanDialog({
                                    open: true,
                                    uid: usr.uid,
                                    name: usr.displayName,
                                  });
                                }}
                                disabled={
                                  updateStatusMutation.isPending ||
                                  usr.uid === user?.uid
                                }
                                variant="destructive"
                                size="sm"
                                className="w-full gap-2"
                              >
                                <UserX className="w-4 h-4" />
                                Blokir Pengguna
                              </Button>
                            ) : (
                              <Button
                                onClick={() =>
                                  setUnbanDialog({
                                    open: true,
                                    uid: usr.uid,
                                    name: usr.displayName,
                                  })
                                }
                                disabled={updateStatusMutation.isPending}
                                size="sm"
                                className="w-full bg-green-600 hover:bg-green-700 gap-2"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Aktifkan Kembali
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </motion.div>

      {/* Reject Gem Dialog */}
      <Dialog
        open={rejectDialog.open}
        onOpenChange={(open: boolean) =>
          setRejectDialog({ open, id: "", name: "" })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Destinasi</DialogTitle>
            <DialogDescription>
              Masukkan alasan penolakan untuk destinasi &ldquo;
              {rejectDialog.name}&rdquo;
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Contoh: Foto tidak jelas, lokasi tidak sesuai, dll."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialog({ open: false, id: "", name: "" });
                setRejectReason("");
              }}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectMutation.isPending || !rejectReason.trim()}
            >
              Tolak
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Make Admin Dialog */}
      <AlertDialog
        open={makeAdminDialog.open}
        onOpenChange={(open: boolean) =>
          !open && setMakeAdminDialog({ open: false, uid: "", name: "" })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Jadikan Admin</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menjadikan{" "}
              <strong>{makeAdminDialog.name}</strong> sebagai admin? Admin
              memiliki akses penuh untuk mengelola platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleMakeAdmin}
              disabled={updateRoleMutation.isPending}
            >
              Ya, Jadikan Admin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Admin Dialog */}
      <AlertDialog
        open={removeAdminDialog.open}
        onOpenChange={(open: boolean) =>
          !open && setRemoveAdminDialog({ open: false, uid: "", name: "" })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Role Admin</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus role admin dari{" "}
              <strong>{removeAdminDialog.name}</strong>? Pengguna akan kembali
              menjadi user biasa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveAdmin}
              disabled={updateRoleMutation.isPending}
            >
              Ya, Hapus Role Admin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Ban User Dialog */}
      <Dialog
        open={banDialog.open}
        onOpenChange={(open: boolean) =>
          !open && setBanDialog({ open: false, uid: "", name: "" })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Blokir Pengguna</DialogTitle>
            <DialogDescription>
              Masukkan alasan pemblokiran untuk{" "}
              <strong>{banDialog.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Contoh: Melanggar kebijakan, spam, konten tidak pantas, dll."
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setBanDialog({ open: false, uid: "", name: "" });
                setBanReason("");
              }}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleBanUser}
              disabled={updateStatusMutation.isPending || !banReason.trim()}
            >
              Blokir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unban User Dialog */}
      <AlertDialog
        open={unbanDialog.open}
        onOpenChange={(open: boolean) =>
          !open && setUnbanDialog({ open: false, uid: "", name: "" })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aktifkan Kembali Pengguna</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin mengaktifkan kembali{" "}
              <strong>{unbanDialog.name}</strong>? Pengguna akan dapat mengakses
              platform kembali.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnbanUser}
              disabled={updateStatusMutation.isPending}
            >
              Ya, Aktifkan Kembali
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
