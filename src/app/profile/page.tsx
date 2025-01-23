'use client';

import { collection, doc, getDoc, getDocs, query, where, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { useEffect, useState } from "react";
import { auth } from "@/firebase";
import { User } from "firebase/auth"; // Importowanie typu User

type Supplement = {
  id: string; 
  supplementId: string; 
  name: string;
  property: string;
  link: string;
};

export default function ProfilePage() {
  const [userSupplements, setUserSupplements] = useState<Supplement[]>([]);
  const [user, setUser] = useState<User | null>(null); // Zmieniony typ użytkownika

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchSupplements = async () => {
      if (!user) return;

      try {
        const userSupplementsQuery = query(
          collection(db, "userSupplements"),
          where("userId", "==", user.uid)
        );
        const userSupplementsSnapshot = await getDocs(userSupplementsQuery);

        const supplementsData: Supplement[] = (
          await Promise.all(
            userSupplementsSnapshot.docs.map(async (userSupplementDoc) => {
              const supplementId = userSupplementDoc.data()?.supplementId;
              if (!supplementId) return undefined;

              const supplementDocRef = doc(db, "supplements", supplementId);
              const supplementDoc = await getDoc(supplementDocRef);

              if (!supplementDoc.exists()) return undefined;

              return {
                id: userSupplementDoc.id,
                supplementId: supplementDoc.id,
                ...supplementDoc.data(),
              } as Supplement;
            })
          )
        ).filter((item): item is Supplement => !!item);

        setUserSupplements(supplementsData);
      } catch (err) {
        console.error("Błąd podczas pobierania suplementów użytkownika:", err);
      }
    };

    fetchSupplements();
  }, [user]);

  const handleRemoveFromProfile = async (userSupplementId: string) => {
    try {
      await deleteDoc(doc(db, "userSupplements", userSupplementId));
      setUserSupplements((prev) =>
        prev.filter((supplement) => supplement.id !== userSupplementId)
      );
    } catch (err) {
      console.error("Błąd podczas usuwania suplementu z profilu:", err);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-extrabold mb-6 text-center text-gray-800">
        Moja Suplementacja
      </h1>
      {userSupplements.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">
          Nie masz jeszcze żadnych suplementów w swoim profilu.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userSupplements.map((supplement) => (
            <div
              key={supplement.id}
              className="bg-white shadow rounded-lg p-4 flex flex-col justify-between border border-gray-200 hover:shadow-md transition-all"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {supplement.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {supplement.property}
                </p>
                <a
                  href={supplement.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700 break-all text-sm"
                >
                  {supplement.link}
                </a>
              </div>
              <button
                onClick={() => handleRemoveFromProfile(supplement.id)}
                className="mt-2 py-1 px-3 text-sm font-medium text-white bg-red-500 rounded hover:bg-red-600 transition-all"
              >
                Usuń
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
