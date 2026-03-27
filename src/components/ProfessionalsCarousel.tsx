import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import ProfessionalCard from "./ProfessionalCard";

type Professional = {
  id: string;
  name: string;
  specialty: string | null;
  whatsapp: string | null;
  bio: string | null;
  image?: string;
  is_active: boolean;
};

const ProfessionalsCarousel = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadFeaturedProfessionals();
  }, []);

  const loadFeaturedProfessionals = async () => {
    const { data } =
