"use client"

import Link from "next/link"
import Image from "next/image"
import { motion, useReducedMotion } from "framer-motion"
import { ArrowRight, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { routes } from "@/lib/config/routes"
import { getImageUrl } from "@/lib/utils/api-utils"
import { brand } from "@/lib/config/brand"

export function HeroSection() {
  const reduceMotion = useReducedMotion()
  const entrance = reduceMotion ? false : { opacity: 0, y: 20 }

  return (
    <section className="container flex flex-col items-center justify-center gap-4 py-24 md:py-32 text-center">
      <motion.div
        initial={entrance}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-center"
      >
        <div className="relative h-24 w-auto md:h-32">
          {brand.logoPath ? (
            <Image src={getImageUrl(brand.logoPath)} alt="" width={200} height={80} className="object-contain" priority />
          ) : (
            <div className="grid size-20 place-items-center rounded-2xl bg-upe-blue text-white md:size-24">
              <BarChart3 aria-hidden="true" className="size-11" />
            </div>
          )}
        </div>
      </motion.div>
      <motion.h1
        initial={entrance}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl lg:leading-[1.1] text-upe-blue"
      >
        {brand.name}
      </motion.h1>
      <motion.h2
        initial={entrance}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-xl md:text-2xl font-light text-upe-blue/80"
      >
        Plataforma de avaliações
      </motion.h2>
      <motion.p
        initial={entrance}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8"
      >
        Crie questionários, participe das avaliações disponíveis e acompanhe os resultados.
      </motion.p>
      <motion.div
        initial={entrance}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-4 mt-4"
      >
        <Button asChild size="lg" className="gap-2 bg-upe-red hover:bg-upe-red/90">
          <Link href={routes.auth.login}>Participar da avaliação <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="border-upe-blue text-upe-blue hover:bg-upe-blue/10">
          <Link href={routes.about}>Saiba mais</Link>
        </Button>
      </motion.div>
    </section>
  )
}
