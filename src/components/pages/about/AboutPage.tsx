"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin,
  Users,
  Target,
  Heart,
  Globe,
  Compass,
  Star,
  Shield,
} from "lucide-react";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { Card, CardContent } from "@/components/ui/card";

const teamMembers = [
  {
    name: "Tim HIMTARA",
    role: "Pengembang & Peneliti",
    description:
      "Tim yang berdedikasi untuk menghadirkan pengalaman wisata terbaik bagi pengguna.",
  },
];

const values = [
  {
    icon: Heart,
    title: "Kecintaan pada Indonesia",
    description:
      "Kami mencintai keindahan Indonesia dan ingin membagikannya kepada dunia.",
  },
  {
    icon: Users,
    title: "Komunitas",
    description:
      "Membangun komunitas wisatawan yang saling berbagi pengalaman dan rekomendasi.",
  },
  {
    icon: Shield,
    title: "Kepercayaan",
    description:
      "Menyediakan informasi yang akurat dan dapat dipercaya tentang setiap destinasi.",
  },
  {
    icon: Globe,
    title: "Keberlanjutan",
    description:
      "Mendukung pariwisata berkelanjutan yang menjaga kelestarian alam dan budaya.",
  },
];

const stats = [
  { value: "100+", label: "Hidden Gems" },
  { value: "34", label: "Provinsi" },
  { value: "1000+", label: "Pengguna" },
  { value: "500+", label: "Ulasan" },
];

export function AboutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-2xl bg-primary/10">
                  <MapPin className="w-12 h-12 text-primary" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Tentang HIMTARA
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Platform untuk menemukan dan berbagi destinasi wisata
                tersembunyi di seluruh Nusantara
              </p>
            </motion.div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold text-foreground">
                    Misi Kami
                  </h2>
                </div>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  HIMTARA (Hidden Gems Nusantara) lahir dari keinginan untuk
                  memperkenalkan keindahan Indonesia yang belum banyak diketahui
                  orang. Kami percaya bahwa setiap sudut Nusantara memiliki
                  pesona tersendiri yang layak untuk dijelajahi.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Misi kami adalah menghubungkan wisatawan dengan destinasi-
                  destinasi tersembunyi yang menakjubkan, sambil mendukung
                  ekonomi lokal dan melestarikan keindahan alam Indonesia.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Compass className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold text-foreground">
                    Visi Kami
                  </h2>
                </div>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Menjadi platform wisata terdepan di Indonesia yang membantu
                  wisatawan menemukan pengalaman autentik dan tak terlupakan di
                  destinasi-destinasi tersembunyi.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Kami bermimpi tentang Indonesia di mana setiap hidden gem
                  mendapat perhatian yang layak, di mana wisatawan dapat
                  menjelajah dengan percaya diri, dan di mana komunitas lokal
                  berkembang melalui pariwisata berkelanjutan.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-4 bg-muted/50">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-foreground mb-4">
                HIMTARA dalam Angka
              </h2>
              <p className="text-muted-foreground">
                Pencapaian kami dalam menghubungkan wisatawan dengan hidden gems
                Indonesia
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="text-center p-6">
                    <CardContent className="p-0">
                      <div className="text-4xl font-bold text-primary mb-2">
                        {stat.value}
                      </div>
                      <div className="text-muted-foreground">{stat.label}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Nilai-Nilai Kami
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Prinsip-prinsip yang memandu kami dalam membangun platform
                wisata terbaik untuk Indonesia
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full p-6 hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4">
                        <value.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {value.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 px-4 bg-muted/50">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Tim Kami
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Orang-orang di balik HIMTARA yang bekerja keras untuk
                menghadirkan pengalaman wisata terbaik
              </p>
            </motion.div>

            <div className="flex justify-center">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="max-w-sm"
                >
                  <Card className="text-center p-6">
                    <CardContent className="p-0">
                      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Users className="w-12 h-12 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-1">
                        {member.name}
                      </h3>
                      <p className="text-primary text-sm mb-3">{member.role}</p>
                      <p className="text-muted-foreground text-sm">
                        {member.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex justify-center mb-6">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Star className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Bergabunglah dengan Kami
              </h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Jadilah bagian dari komunitas wisatawan yang passionate dalam
                menemukan dan berbagi keindahan tersembunyi Indonesia. Daftar
                sekarang dan mulai petualangan Anda!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
                >
                  Daftar Sekarang
                </Link>
                <Link
                  href="/gems"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-colors"
                >
                  Jelajahi Destinasi
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
