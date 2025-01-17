"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ChevronRight,
  Trophy,
  Users,
  Calendar,
  RatIcon as Racquet,
} from "lucide-react";
import { translations, Language } from "../lib/translations";
import { motion } from "framer-motion";

export type TournamentNameFormData = {
  tournamentName: string;
};

interface TournamentNameFormProps {
  onSubmit: SubmitHandler<TournamentNameFormData>;
}

export default function TournamentNameForm({
  onSubmit,
}: TournamentNameFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TournamentNameFormData>();
  const [isHovered, setIsHovered] = useState(false);
  const [language, setLanguage] = useState<Language>("en");

  const t = translations[language];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-700 to-green-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-3xl shadow-2xl bg-white/10 backdrop-blur-lg border border-white/20">
          <CardHeader className="text-center">
            <div className="flex justify-end mb-4 space-x-2">
              <button
                onClick={() => setLanguage("en")}
                className={`text-2xl ${
                  language === "en" ? "opacity-100" : "opacity-50"
                }`}
                aria-label="English"
              >
                🇬🇧
              </button>
              <button
                onClick={() => setLanguage("es")}
                className={`text-2xl ${
                  language === "es" ? "opacity-100" : "opacity-50"
                }`}
                aria-label="Español"
              >
                🇪🇸
              </button>
              <button
                onClick={() => setLanguage("da")}
                className={`text-2xl ${
                  language === "da" ? "opacity-100" : "opacity-50"
                }`}
                aria-label="Dansk"
              >
                🇩🇰
              </button>
            </div>
            <CardTitle className="text-5xl font-bold text-white mb-2">
              {t.welcome}
            </CardTitle>
            <CardDescription className="text-xl text-white/80 mt-2">
              {t.createTournaments}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="about" className="border-white/20">
                  <AccordionTrigger className="text-white hover:text-white/80">
                    {t.whatIsMexicanoPadel}
                  </AccordionTrigger>
                  <AccordionContent className="text-white/80">
                    <p className="leading-relaxed">{t.aboutMexicanoPadel}</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label
                    htmlFor="tournamentName"
                    className="block text-sm font-medium text-white mb-1"
                  >
                    {t.tournamentName}
                  </label>
                  <Input
                    id="tournamentName"
                    placeholder={t.enterTournamentName}
                    defaultValue={"My tournament"}
                    onFocus={(e) => e.target.select()}
                    {...register("tournamentName", {
                      required: t.tournamentNameRequired,
                    })}
                    className="w-full bg-white/20 text-white placeholder-white/50 border-white/30 focus:border-white focus:ring-white"
                  />
                  {errors.tournamentName && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.tournamentName.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-yellow-500 to-green-600 hover:from-yellow-600 hover:to-green-700 text-white transition-all duration-300 transform hover:scale-105 shadow-lg"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  {isHovered ? (
                    <span className="flex items-center justify-center">
                      {t.letsPlay} <ChevronRight className="ml-2 h-4 w-4" />
                    </span>
                  ) : (
                    t.createTournament
                  )}
                </Button>
              </form>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <motion.div
                className="flex flex-col items-center space-y-2"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Trophy className="h-12 w-12 text-yellow-400" />
                <h3 className="font-semibold text-lg text-white">
                  {t.dynamicTournaments}
                </h3>
                <p className="text-sm text-white/80">
                  {t.shortExcitingMatches}
                </p>
              </motion.div>
              <motion.div
                className="flex flex-col items-center space-y-2"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Users className="h-12 w-12 text-blue-400" />
                <h3 className="font-semibold text-lg text-white">
                  {t.forEveryone}
                </h3>
                <p className="text-sm text-white/80">{t.allLevels}</p>
              </motion.div>
              <motion.div
                className="flex flex-col items-center space-y-2"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Calendar className="h-12 w-12 text-green-400" />
                <h3 className="font-semibold text-lg text-white">
                  {t.easyToOrganize}
                </h3>
                <p className="text-sm text-white/80">
                  {t.createManageEffortlessly}
                </p>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
