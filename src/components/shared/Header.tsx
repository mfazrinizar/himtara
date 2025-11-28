"use client";

import Link from "next/link";
import { MapPin, Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { logoutAction, getCurrentUserAction } from "@/actions/auth";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { data: userResult } = useQuery({
    queryKey: ["auth-user"],
    queryFn: getCurrentUserAction,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });

  const user = userResult?.data?.user;

  const handleLogout = async () => {
    const result = await logoutAction();
    if (result.success) {
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
      toast.success(result.message);
      router.push("/");
    }
  };

  return (
    <header
      className={`sticky top-0 z-[100] w-full border-b transition-all duration-300 backdrop-blur-md ${
        isScrolled
          ? "border-transparent shadow-lg bg-white/50 dark:bg-neutral-900/50"
          : "border-transparent bg-white/70 dark:bg-emerald-950"
      }`}
    >
      <div className="container mx-auto flex h-20 sm:h-20 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary text-white shadow-md group-hover:shadow-lg transition-shadow">
            <MapPin className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-foreground">
            HIMTARA
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          <Link
            href="/"
            className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Beranda
          </Link>
          <Link
            href="/gems"
            className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Destinasi
          </Link>
          <Link
            href="/contact"
            className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Kontak
          </Link>
          {user ? (
            <Link
              href="/gems/submit"
              className="text-base font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
            >
              Ajukan Hidden Gem
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-base font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
            >
              Ajukan Hidden Gem
            </Link>
          )}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <>
              <Link
                href={user.role === "admin" ? "/admin/dashboard" : "/dashboard"}
              >
                <Button variant="ghost" className="gap-2">
                  <User className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>
              <Button variant="ghost" onClick={handleLogout} className="gap-2">
                <LogOut className="w-4 h-4" />
                Keluar
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Masuk</Button>
              </Link>
              <Link href="/register">
                <Button>Daftar</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Actions */}
        <div className="flex lg:hidden items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            className="relative"
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-6 w-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-6 w-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden border-t border-border bg-background overflow-hidden"
          >
            <motion.nav
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="flex flex-col px-4 py-3 space-y-3"
            >
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                Beranda
              </Link>
              <Link
                href="/gems"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                Destinasi
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                Kontak
              </Link>
              {user ? (
                <Link
                  href="/gems/submit"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors py-2"
                >
                  Ajukan Hidden Gem
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors py-2"
                >
                  Ajukan Hidden Gem
                </Link>
              )}
              <div className="flex flex-col gap-2 pt-2 border-t border-border">
                {user ? (
                  <>
                    <Link
                      href={
                        user.role === "admin"
                          ? "/admin/dashboard"
                          : "/dashboard"
                      }
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button variant="ghost" className="w-full gap-2">
                        <User className="w-4 h-4" />
                        Dashboard
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className="w-full gap-2"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="w-4 h-4" />
                      Keluar
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button variant="ghost" className="w-full">
                        Masuk
                      </Button>
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button className="w-full">Daftar</Button>
                    </Link>
                  </>
                )}
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
