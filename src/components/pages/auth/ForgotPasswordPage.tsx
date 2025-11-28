"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Mail, CheckCircle } from "lucide-react";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/schemas";
import { forgotPasswordAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { toast } from "sonner";

export function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    try {
      const result = await forgotPasswordAction(data);
      if (result.success) {
        toast.success(result.message);
        setSubmitted(true);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-accent/5 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          <Card className="shadow-2xl border-2 backdrop-blur-sm bg-card/95">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Email Terkirim
              </CardTitle>
              <CardDescription className="text-base">
                Kami telah mengirimkan tautan reset kata sandi ke email Anda.
                Silakan periksa inbox Anda.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/login">
                <Button className="w-full h-11">
                  Kembali ke Halaman Masuk
                </Button>
              </Link>
              <div className="text-center">
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Kembali ke Beranda
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-accent/5 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 justify-center mb-8 group"
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-white shadow-lg group-hover:shadow-xl transition-shadow">
            <MapPin className="w-7 h-7" />
          </div>
          <span className="text-2xl font-bold text-foreground">HIMTARA</span>
        </Link>

        <Card className="shadow-2xl border-2 backdrop-blur-sm bg-card/95">
          <CardHeader className="space-y-1 text-center pb-6">
            <CardTitle className="text-2xl font-bold">
              Lupa Kata Sandi?
            </CardTitle>
            <CardDescription className="text-base">
              Masukkan email Anda dan kami akan mengirimkan tautan untuk mereset
              kata sandi Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@contoh.com"
                  className="h-11"
                  {...register("email")}
                />
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-destructive"
                  >
                    {errors.email.message}
                  </motion.p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base"
                disabled={isLoading}
              >
                {isLoading ? "Mengirim..." : "Kirim Tautan Reset"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Atau</span>
              </div>
            </div>

            <div className="text-center text-sm">
              <Link
                href="/login"
                className="text-primary hover:underline font-semibold"
              >
                Kembali ke Halaman Masuk
              </Link>
            </div>

            <div className="text-center">
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Kembali ke Beranda
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
