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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronRight, Trophy, Users, Calendar } from "lucide-react";
import { translations, Language } from "../lib/translations";

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
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-end mb-4">
            <Select
              value={language}
              onValueChange={(value: Language) => setLanguage(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="da">Dansk</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <CardTitle className="text-4xl font-bold text-red-600">
            {t.welcome}
          </CardTitle>
          <CardDescription className="text-lg text-gray-600 mt-2">
            {t.createTournaments}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="about">
                <AccordionTrigger>{t.whatIsMexicanoPadel}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-700 leading-relaxed">
                    {t.aboutMexicanoPadel}
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center space-y-2">
                <Trophy className="h-12 w-12 text-yellow-500" />
                <h3 className="font-semibold text-lg">
                  {t.dynamicTournaments}
                </h3>
                <p className="text-sm text-gray-600">
                  {t.shortExcitingMatches}
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <Users className="h-12 w-12 text-blue-500" />
                <h3 className="font-semibold text-lg">{t.forEveryone}</h3>
                <p className="text-sm text-gray-600">{t.allLevels}</p>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <Calendar className="h-12 w-12 text-green-500" />
                <h3 className="font-semibold text-lg">{t.easyToOrganize}</h3>
                <p className="text-sm text-gray-600">
                  {t.createManageEffortlessly}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label
                  htmlFor="tournamentName"
                  className="block text-sm font-medium text-gray-700 mb-1"
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
                  className="w-full"
                />
                {errors.tournamentName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.tournamentName.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-red-500 to-yellow-500 hover:from-red-600 hover:to-yellow-600 text-white transition-all duration-300 transform hover:scale-105"
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
        </CardContent>
      </Card>
    </div>
  );
}
