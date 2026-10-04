"use client";

import { useEffect, useState } from "react";
import {
  Fingerprint,
  Target,
  Brain,
  ShieldCheck,
  Sparkles,
  CheckCircle,
  User,
} from "lucide-react";

import { supabase } from "../../lib/supabase";
import BottomNav from "../components/BottomNav";

export default function PrimeIdentityPage() {
  const [displayName, setDisplayName] = useState("");

  const [profile, setProfile] = useState({
    tradingStyle: "",
    customStyle: "",
    asset: "",
    experience: "",
    availability: "",
    weakness: "",
    psychology: "",
    goal: "",
    entryCriteria: "",
    invalidation: "",
  });

  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [tradingRules, setTradingRules] = useState([]);

  useEffect(() => {
    loadDisplayName();
  }, []);

 const loadDisplayName = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data, error } = await supabase
    .from("profiles")
    .select("display_name, answers, detected_profile")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Erreur chargement Identity :", error);
    return;
  }

  if (data?.display_name) {
    setDisplayName(data.display_name);
  }

  if (data?.answers) {
    setProfile((previousProfile) => ({
      ...previousProfile,
      ...data.answers,
    }));
  }
};

  const updateField = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isCustom = profile.tradingStyle === "Autre / personnalisé";

  const isComplete =
    displayName &&
    profile.tradingStyle &&
    profile.asset &&
    profile.experience &&
    profile.availability &&
    profile.weakness &&
    profile.psychology &&
    profile.goal &&
    (!isCustom ||
      (profile.customStyle && profile.entryCriteria && profile.invalidation));

  const buildTradingRules = (checklist, currentProfile) => {
    const rules = [];

    const addRule = (label, ruleType = "validation") => {
      const cleanLabel = typeof label === "string" ? label.trim() : "";
