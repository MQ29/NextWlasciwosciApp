'use client';

import { useRouter } from 'next/navigation';

const HomePage = () => {
  const router = useRouter();

  return (
    <div className="w-full h-full">
      {/* Hero Section */}
      <section className="h-screen flex flex-col items-center justify-center bg-indigo-600 text-white text-center px-6">
        <div className="text-6xl mb-4">💊</div> {/* Dodana emotka tabletki */}
        <h1 className="text-5xl font-bold mb-6">Poznaj Suplementy Diety!</h1>
        <p className="text-lg max-w-2xl mb-8">
          Odkryj świat suplementów i ich właściwości. Wyszukuj, oceniaj i odkrywaj naukowe informacje, aby podejmować świadome decyzje.
        </p>
        <button
          onClick={() => router.push('/supplements')}
          className="px-8 py-4 bg-white text-indigo-600 font-semibold rounded-lg shadow-lg hover:bg-indigo-100 transition-all"
        >
          Eksploruj Suplementy
        </button>
      </section>

      {/* About Section */}
      <section className="h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-800 text-center px-6">
        <h2 className="text-4xl font-bold mb-6">Jak to działa?</h2>
        <p className="text-lg max-w-2xl mb-8">
          Nasza platforma umożliwia eksplorację suplementów, poznawanie ich właściwości i dostęp do naukowych badań.
        </p>
        <ul className="text-left list-disc list-inside max-w-3xl text-lg">
          <li>🌟 Eksploruj bazę suplementów</li>
          <li>📊 Sprawdzaj średnie oceny i opinie innych użytkowników</li>
          <li>📝 Zapisuj swoje ulubione suplementy w profilu</li>
          <li>🔗 Otwieraj linki do badań naukowych</li>
        </ul>
      </section>

      {/* Features Section */}
      <section className="h-screen flex flex-col items-center justify-center bg-white text-gray-800 text-center px-6">
        <h2 className="text-4xl font-bold mb-6">Funkcje</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
          <div className="p-6 bg-gray-100 rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold mb-4">⭐ Oceny</h3>
            <p>
              Oceniaj suplementy na podstawie swoich doświadczeń i sprawdzaj, jak oceniają je inni.
            </p>
          </div>
          <div className="p-6 bg-gray-100 rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold mb-4">📚 Baza Wiedzy</h3>
            <p>
              Zyskaj dostęp do szczegółowych opisów i naukowych linków dotyczących każdego suplementu.
            </p>
          </div>
          <div className="p-6 bg-gray-100 rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold mb-4">🔗 Profile</h3>
            <p>
              Zapisuj swoje ulubione suplementy, by mieć do nich szybki dostęp w każdej chwili.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="h-screen flex flex-col items-center justify-center bg-indigo-600 text-white text-center px-6">
        <h2 className="text-4xl font-bold mb-6">Dołącz do nas już teraz!</h2>
        <p className="text-lg max-w-2xl mb-8">
          Dołącz do naszej społeczności i odkryj potencjał suplementów w zdrowiu i dobrym samopoczuciu.
        </p>
        <button
          onClick={() => router.push('/supplements')}
          className="px-8 py-4 bg-white text-indigo-600 font-semibold rounded-lg shadow-lg hover:bg-indigo-100 transition-all"
        >
          Eksploruj Suplementy
        </button>
      </section>
    </div>
  );
};

export default HomePage;
