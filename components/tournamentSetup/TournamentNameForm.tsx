"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronRight, Trophy, Users, Calendar, Share2 } from "lucide-react";
import { translations, type Language } from "@/lib/translations";
import { trackEvent } from "@/lib/analytics";
import { useLanguage } from "@/lib/LanguageContext";
import WorldFlag from "react-world-flags";
import type React from "react";

export type TournamentNameFormData = {
  tournamentName: string;
};

type TournamentNameFormProps = {
  onSubmit: SubmitHandler<TournamentNameFormData>;
};

export default function TournamentNameForm({
  onSubmit,
}: TournamentNameFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TournamentNameFormData>();
  const [isHovered, setIsHovered] = useState(false);
  const { language, setLanguage } = useLanguage();
  const t = translations[language];

  const onFormSubmit = (data: TournamentNameFormData) => {
    trackEvent("tournament_created", "tournament", data.tournamentName);
    onSubmit(data);
  };

  const handleLanguageChange = (
    newLanguage: Language,
    event: React.MouseEvent
  ) => {
    event.preventDefault();
    setLanguage(newLanguage);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-700 to-green-900">
      <Card className="w-full max-w-6xl shadow-2xl bg-white/10 border border-white/20 relative overflow-y-auto">
        {/* Language Flags positioned in the top right corner */}
        <div className="absolute top-4 right-4 flex gap-4 z-10">
          <span
            onClick={(e) => handleLanguageChange("en", e)}
            className={`cursor-pointer ${
              language === "en" ? "opacity-100" : "opacity-50"
            } hover:opacity-100 transition-opacity`}
          >
            <WorldFlag code="GB" className="h-4 w-4 sm:h-5 sm:w-5" />
          </span>
          <span
            onClick={(e) => handleLanguageChange("da", e)}
            className={`cursor-pointer ${
              language === "da" ? "opacity-100" : "opacity-50"
            } hover:opacity-100 transition-opacity`}
          >
            <WorldFlag code="DK" className="h-4 w-4 sm:h-5 sm:w-5" />
          </span>
          <span
            onClick={(e) => handleLanguageChange("es", e)}
            className={`cursor-pointer ${
              language === "es" ? "opacity-100" : "opacity-50"
            } hover:opacity-100 transition-opacity`}
          >
            <WorldFlag code="ES" className="h-4 w-4 sm:h-5 sm:w-5" />
          </span>
        </div>

        <CardHeader className="text-center pt-16">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {t.welcome}
          </h1>
          <CardDescription className="text-m sm:text-lg text-white/80 mt-2">
            {t.createTournaments}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="about" className="border-white/20">
              <AccordionTrigger className="text-white hover:text-white/80">
                {t.whatIsPadelTournaments}
              </AccordionTrigger>
              <AccordionContent className="text-white/80">
                <p className="leading-relaxed">{t.aboutPadelTournaments}</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
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
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white transition-all duration-300 transform shadow-lg"
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center space-y-2">
              <Trophy className="h-12 w-12 text-yellow-600" />
              <h2 className="font-semibold text-lg text-white">
                {t.dynamicTournaments}
              </h2>
              <p className="text-sm text-white/80">{t.shortExcitingMatches}</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Users className="h-12 w-12 text-blue-400" />
              <h2 className="font-semibold text-lg text-white">
                {t.forEveryone}
              </h2>
              <p className="text-sm text-white/80">{t.allLevels}</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Calendar className="h-12 w-12 text-green-400" />
              <h3 className="font-semibold text-lg text-white">
                {t.easyToOrganize}
              </h3>
              <p className="text-sm text-white/80">
                {t.createManageEffortlessly}
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Share2 className="h-12 w-12 text-purple-400" />
              <h3 className="font-semibold text-lg text-white">
                {t.shareAndSave}
              </h3>
              <p className="text-sm text-white/80">{t.shareLinksInfo}</p>
              <p className="text-sm text-white/80">{t.loginToSave}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
