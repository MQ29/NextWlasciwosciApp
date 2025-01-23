'use client';

import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { useRouter } from "next/navigation";

export default function EditSupplementPage() {
  const [name, setName] = useState("");
  const [property, setProperty] = useState("");
  const [link, setLink] = useState("");
  const router = useRouter();

  // Pobieranie parametru ID z query string
  const id = new URLSearchParams(window.location.search).get("id");

  useEffect(() => {
    const fetchSupplement = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "supplements", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || "");
          setProperty(data.property || "");
          setLink(data.link || "");
        } else {
          console.error("Nie znaleziono dokumentu");
        }
      } catch (error) {
        console.error("Błąd podczas pobierania suplementu:", error);
      }
    };
    fetchSupplement();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      const docRef = doc(db, "supplements", id);
      await updateDoc(docRef, {
        name,
        property,
        link,
      });
      alert("Suplement został zaktualizowany!");
      router.push("/supplements");
    } catch (error) {
      console.error("Błąd podczas aktualizacji suplementu:", error);
      alert("Nie udało się zaktualizować suplementu.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Edytuj suplement</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-lg font-medium">Nazwa</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 w-full"
            required
          />
        </div>
        <div>
          <label className="block text-lg font-medium">Właściwości</label>
          <input
            type="text"
            value={property}
            onChange={(e) => setProperty(e.target.value)}
            className="border p-2 w-full"
            required
          />
        </div>
        <div>
          <label className="block text-lg font-medium">Link do badania</label>
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="border p-2 w-full"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-primary text-white px-4 py-2 rounded"
        >
          Zapisz zmiany
        </button>
      </form>
    </div>
  );
}
