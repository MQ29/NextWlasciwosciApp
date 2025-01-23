'use client';

import { useState, useEffect } from "react";
import { auth } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkUser = () => {
      const user = auth.currentUser;
      if (user) {
        setIsLoggedIn(true);
        router.replace("/supplements"); // Przekierowanie, jeśli użytkownik jest zalogowany
      }
    };
    checkUser();
    const unsubscribe = auth.onAuthStateChanged(checkUser);
    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/supplements"); // Przekierowanie na stronę katalogu
    } catch (error: any) {
      setError("Nieprawidłowe dane logowania. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoggedIn) {
    return null; // Zapobiegamy renderowaniu formularza
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-3xl font-bold mb-6 text-center">Log in</h1>
      <form onSubmit={handleLogin} className="space-y-6 bg-white p-6 shadow-md rounded-lg">
        {error && (
          <p className="text-red-500 bg-red-100 p-3 rounded text-center">
            {error}
          </p>
        )}
        <div>
          <label className="block text-lg font-medium mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring focus:ring-indigo-500"
            placeholder="Wprowadź email"
            required
          />
        </div>
        <div>
          <label className="block text-lg font-medium mb-2">Hasło</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring focus:ring-indigo-500"
            placeholder="Wprowadź hasło"
            required
          />
        </div>
        <button
          type="submit"
          className={`w-full bg-indigo-600 text-white py-3 rounded font-medium hover:bg-indigo-700 transition ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? "Logowanie..." : "Zaloguj się"}
        </button>
      </form>
    </div>
  );
}
