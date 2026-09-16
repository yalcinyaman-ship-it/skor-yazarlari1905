import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { User, Season, Week, Match } from "../types";
import PredictionModal from "../components/PredictionModal";
import { AlertCircle, Trophy } from "lucide-react";

const getDateMs = (date: any) => {
  if (!date) return 0;
  if (typeof date.toDate === "function") return date.toDate().getTime();
  if (date.seconds) return date.seconds * 1000;
  if (date instanceof Date) return date.getTime();
  if (typeof date === "string") return new Date(date).getTime();
  return 0;
};

const PredictionPage: React.FC = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [activeSeason, setActiveSeason] = useState<Season | null>(null);
  const [activeWeek, setActiveWeek] = useState<Week | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubWeeks: (() => void) | undefined;
    let unsubMatches: (() => void) | undefined;

    const clearNestedSubscriptions = () => {
      if (unsubWeeks) {
        unsubWeeks();
        unsubWeeks = undefined;
      }

      if (unsubMatches) {
        unsubMatches();
        unsubMatches = undefined;
      }
    };

    const unsubUsers = onSnapshot(
      collection(db, "users"),
      (snap) => {
        setUsers(snap.docs.map((document) => ({ id: document.id, ...document.data() } as User)));
      },
      (err) => {
        console.error("PredictionPage: Error fetching users:", err);
        setError("Firestore bağlantı hatası: " + err.message);
      }
    );

    const unsubSeason = onSnapshot(
      query(collection(db, "seasons"), where("status", "==", "active")),
      (snap) => {
        const seasonDoc = snap.docs[0];

        clearNestedSubscriptions();

        if (!seasonDoc) {
          setActiveSeason(null);
          setActiveWeek(null);
          setMatches([]);
          return;
        }

        const seasonData = {
          id: seasonDoc.id,
          ...seasonDoc.data()
        } as Season;

        setActiveSeason(seasonData);

        unsubWeeks = onSnapshot(
          query(
            collection(db, "seasons", seasonDoc.id, "weeks"),
            where("isActive", "==", true)
          ),
          (weekSnap) => {
            const weekDoc = weekSnap.docs[0];

            if (unsubMatches) {
              unsubMatches();
              unsubMatches = undefined;
            }

            if (!weekDoc) {
              setActiveWeek(null);
              setMatches([]);
              return;
            }

            const weekData = {
              id: weekDoc.id,
              ...weekDoc.data()
            } as Week;

            setActiveWeek(weekData);

            unsubMatches = onSnapshot(
              collection(db, "seasons", seasonDoc.id, "weeks", weekDoc.id, "matches"),
              (matchSnap) => {
                const matchList = matchSnap.docs
                  .map((document) => ({
                    id: document.id,
                    ...document.data()
                  } as Match))
                  .sort((a, b) => getDateMs(a.matchDate) - getDateMs(b.matchDate));

                setMatches(matchList);
              },
              (err) => {
                console.error("PredictionPage: Error fetching matches:", err);
                setError("Firestore bağlantı hatası: " + err.message);
              }
            );
          },
          (err) => {
            console.error("PredictionPage: Error fetching weeks:", err);
            setError("Firestore bağlantı hatası: " + err.message);
          }
        );
      },
      (err) => {
        console.error("PredictionPage: Error fetching seasons:", err);
        setError("Firestore bağlantı hatası: " + err.message);
      }
    );

    return () => {
      unsubUsers();
      unsubSeason();
      clearNestedSubscriptions();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1A1A] px-4 py-8">
      {error && (
        <div
          className="mx-auto mb-6 flex max-w-2xl items-start gap-3 rounded-2xl border border-red-400/25 bg-red-400/10 p-4 text-sm text-red-600 shadow-sm"
          id="prediction-page-db-error"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
          <div>
            <p className="mb-1 font-bold uppercase tracking-wider">
              Veritabanı uyarısı
            </p>
            <span className="font-medium opacity-90">{error}</span>
          </div>
        </div>
      )}

      {activeSeason && activeWeek ? (
        <PredictionModal
          isVisible={true}
          onClose={() => navigate("/")}
          users={users}
          activeWeek={activeWeek}
          matches={matches}
          seasonId={activeSeason.id}
        />
      ) : (
        <div className="flex min-h-[80vh] items-center justify-center text-center">
          <div className="rounded-3xl border border-[#EAE6DF] bg-white px-8 py-10 shadow-sm max-w-md">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FAF8F5] text-[#D96B43] border border-[#EAE6DF]">
              <Trophy className="h-7 w-7" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#1A1A1A]">
              Aktif tahmin dönemi bulunamadı
            </h1>
            <p className="mt-2 text-sm font-medium text-[#6B6760]">
              Admin aktif hafta oluşturduğunda tahmin ekranı açılır.
            </p>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="btn-primary mt-6 justify-center w-full"
            >
              Ana sayfaya dön
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionPage;