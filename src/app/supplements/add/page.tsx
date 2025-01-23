'use client';
import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { useRouter } from "next/navigation";

export default function AddSupplementPage() {
  const [name, setName] = useState("");
  const [property, setProperty] = useState("");
  const [link, setLink] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "supplements"), {
        name,
        property,
        link,
      });
      router.push("/supplements");
    } catch (error) {
      console.error("Błąd podczas dodawania suplementu:", error);
      alert("Nie udało się dodać suplementu.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Dodaj nowy suplement</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-lg font-medium">Nazwa</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nazwa suplementu"
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
            placeholder="Opis właściwości"
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
            placeholder="Link do badania"
            className="border p-2 w-full"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-primary text-white px-4 py-2 rounded"
        >
          Dodaj suplement
        </button>
      </form>
    </div>
  );
}
