"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Cloud, ShieldCheck } from "lucide-react";

export default function CloudProfileCard() {
  const [profile, setProfile] = useState(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;

      if (!user) return;

      setEmail(user.email);

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(data);
    }

    loadProfile();
  }, []);

  if (!profile) return null;

  return (
    <section className="card">
      <div className="row">
        <div className="gold-icon">
          <Cloud size={25} />
        </div>

        <div>
          <p className="label">Cloud PRIME</p>
          <h2 className="card-title">Profil connecté</h2>
        </div>
      </div>

      <p className="text">
        Connectée avec : <strong>{email}</strong>
      </p>

      <div className="stats-grid">
        <div className="mini-card">
          <ShieldCheck size={19} color="#d6b25f" />
          <p className="mini-label">Score</p>
          <p className="mini-value">{profile.discipline_score}%</p>
        </div>

        <div className="mini-card">
          <p className="mini-label">Streak</p>
          <p className="mini-value">{profile.streak}j</p>
        </div>

        <div className="mini-card">
          <p className="mini-label">XP</p>
          <p className="mini-value">{profile.xp}</p>
        </div>
      </div>
    </section>
  );
}
