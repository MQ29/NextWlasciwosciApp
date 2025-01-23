'use client';

import { useEffect, useState } from 'react';
import {
    collection,
    addDoc,
    onSnapshot,
    doc,
    deleteDoc,
    updateDoc,
    getDoc,
    query,
    where,
    getDocs,
} from 'firebase/firestore';
import { auth, db } from '@/firebase';
import { useRouter } from 'next/navigation';

type Supplement = {
    id: string;
    name: string;
    property: string;
    link: string;
    ratings?: { userId: string; rating: number }[];
};

const SupplementsPage = () => {
    const [supplements, setSupplements] = useState<Supplement[]>([]);
    const [filteredSupplements, setFilteredSupplements] = useState<Supplement[]>([]);
    const [userSupplements, setUserSupplements] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [newSupplement, setNewSupplement] = useState({ name: '', property: '', link: '' });
    const [editSupplement, setEditSupplement] = useState<Supplement | null>(null);
    const router = useRouter();

    // Sprawdzanie użytkownika
    useEffect(() => {
        const checkUser = async () => {
            const user = auth.currentUser;
            if (user) {
                setIsLoggedIn(true);
                const tokenResult = await user.getIdTokenResult();
                setIsAdmin(!!tokenResult.claims.admin);

                // Pobranie suplementów użytkownika
                const userSupplementsQuery = query(
                    collection(db, 'userSupplements'),
                    where('userId', '==', user.uid)
                );
                const userSupplementsSnapshot = await getDocs(userSupplementsQuery);
                const supplementIds = userSupplementsSnapshot.docs.map((doc) =>
                    doc.data().supplementId
                );
                setUserSupplements(supplementIds);
            } else {
                setIsAdmin(false);
                setUserSupplements([]);
                setIsLoggedIn(false);
            }
        };

        const unsubscribe = auth.onAuthStateChanged(() => {
            checkUser();
        });

        return () => unsubscribe();
    }, []);

    // Pobieranie suplementów
    useEffect(() => {
        const fetchSupplements = async () => {
            const unsubscribe = onSnapshot(collection(db, 'supplements'), (snapshot) => {
                const supplementsList = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    ratings: doc.data().ratings || [],
                })) as Supplement[];
                setSupplements(supplementsList);
                setFilteredSupplements(supplementsList);
            });

            return () => unsubscribe();
        };

        fetchSupplements();
    }, []);

    // Obsługa wyszukiwania
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredSupplements(supplements);
        } else {
            const lowerCaseQuery = searchQuery.toLowerCase();
            const filtered = supplements.filter(
                (supplement) =>
                    supplement.name.toLowerCase().includes(lowerCaseQuery) ||
                    supplement.property.toLowerCase().includes(lowerCaseQuery)
            );
            setFilteredSupplements(filtered);
        }
    }, [searchQuery, supplements]);

    const handleAddSupplement = async () => {
        if (!newSupplement.name || !newSupplement.property || !newSupplement.link) return;

        try {
            await addDoc(collection(db, 'supplements'), { ...newSupplement, ratings: [] });
            setNewSupplement({ name: '', property: '', link: '' });
        } catch (error) {
            console.error('Błąd podczas dodawania suplementu:', error);
        }
    };

    const handleDeleteSupplement = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'supplements', id));
        } catch (error) {
            console.error('Błąd podczas usuwania suplementu:', error);
        }
    };

    const handleEditSupplement = async () => {
        if (!editSupplement) return;

        try {
            const docRef = doc(db, 'supplements', editSupplement.id);
            await updateDoc(docRef, {
                name: editSupplement.name,
                property: editSupplement.property,
                link: editSupplement.link,
            });
            setEditSupplement(null);
        } catch (error) {
            console.error('Błąd podczas edycji suplementu:', error);
        }
    };

    const handleAddToProfile = async (supplementId: string) => {
        if (!isLoggedIn) {
            router.push('/auth/login');
            return;
        }

        try {
            if (userSupplements.includes(supplementId)) {
                return;
            }

            await addDoc(collection(db, 'userSupplements'), {
                userId: auth.currentUser?.uid,
                supplementId,
            });
            setUserSupplements((prev) => [...prev, supplementId]);
        } catch (error) {
            console.error('Błąd podczas dodawania suplementu do profilu:', error);
        }
    };

    const handleRate = async (id: string, rating: number) => {
        if (!isLoggedIn) {
            router.push('/auth/login');
            return;
        }

        try {
            const docRef = doc(db, 'supplements', id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                const ratings = data.ratings || [];
                const userId = auth.currentUser?.uid;

                const existingRatingIndex = ratings.findIndex((r: { userId: string; rating: number }) => r.userId === userId);

                if (existingRatingIndex !== -1) {
                    ratings[existingRatingIndex].rating = rating;
                } else {
                    ratings.push({ userId, rating });
                }

                await updateDoc(docRef, { ratings });
            }
        } catch (error) {
            console.error('Błąd podczas dodawania oceny:', error);
        }
    };

    const calculateAverageRating = (ratings: { userId: string; rating: number }[] = []) => {
        if (ratings.length === 0) return 0;
        const total = ratings.reduce((sum, r) => sum + r.rating, 0);
        return total / ratings.length;
    };

    return (
        <div className="container mx-auto p-6">
            {/* Pasek wyszukiwania */}
            <div className="mb-6">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Wyszukaj suplement..."
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-500"
                />
            </div>

            {isAdmin ? (
                <div className="flex space-x-6">
                    {/* Lista suplementów */}
                    <div className="w-2/3">
                        {filteredSupplements.map((supplement) => (
                            <div
                                key={supplement.id}
                                className="bg-white shadow-md rounded-lg p-4 mb-4 flex justify-between items-start"
                            >
                                <div>
                                    <h3 className="text-xl font-bold">{supplement.name}</h3>
                                    <p className="text-gray-700">{supplement.property}</p>
                                    <a
                                        href={supplement.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:text-blue-700 break-all"
                                    >
                                        {supplement.link}
                                    </a>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setEditSupplement(supplement)}
                                        className="px-4 py-2 bg-yellow-500 text-white font-medium rounded-md hover:bg-yellow-600"
                                    >
                                        Edytuj
                                    </button>
                                    <button
                                        onClick={() => handleDeleteSupplement(supplement.id)}
                                        className="px-4 py-2 bg-red-500 text-white font-medium rounded-md hover:bg-red-600"
                                    >
                                        Usuń
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Formularz dodawania suplementów */}
                    <div className="w-1/3 bg-white shadow-md rounded-lg p-4 border border-gray-200 max-h-[400px] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4">Dodaj suplement</h2>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleAddSupplement();
                            }}
                            className="space-y-4"
                        >
                            <input
                                type="text"
                                placeholder="Nazwa suplementu"
                                value={newSupplement.name}
                                onChange={(e) => setNewSupplement({ ...newSupplement, name: e.target.value })}
                                className="w-full p-2 border rounded-md"
                            />
                            <input
                                type="text"
                                placeholder="Opis właściwości"
                                value={newSupplement.property}
                                onChange={(e) => setNewSupplement({ ...newSupplement, property: e.target.value })}
                                className="w-full p-2 border rounded-md"
                            />
                            <input
                                type="text"
                                placeholder="Link do badania"
                                value={newSupplement.link}
                                onChange={(e) => setNewSupplement({ ...newSupplement, link: e.target.value })}
                                className="w-full p-2 border rounded-md"
                            />
                            <button
                                type="submit"
                                className="w-full p-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
                            >
                                Dodaj suplement
                            </button>
                        </form>
                    </div>


                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSupplements.map((supplement) => (
                        <div
                            key={supplement.id}
                            className="bg-white shadow-md rounded-lg p-4 flex flex-col justify-between border border-gray-200 hover:shadow-lg transition-all"
                        >
                            <div>
                                <h3 className="text-lg font-bold">{supplement.name}</h3>
                                <p className="text-sm text-gray-700 mb-3">{supplement.property}</p>
                                <a
                                    href={supplement.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:text-blue-700 break-all text-sm"
                                >
                                    {supplement.link}
                                </a>
                            </div>
                            <div className="mt-4">
                                <div className="text-yellow-500">
                                    {Array.from({ length: 5 }, (_, i) => (
                                        <span
                                            key={i}
                                            className={`cursor-pointer ${i < calculateAverageRating(supplement.ratings || [])
                                                ? 'text-yellow-500'
                                                : 'text-gray-400'
                                                }`}
                                            onClick={() => handleRate(supplement.id, i + 1)}
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                    {(supplement.ratings?.length || 0) > 0
                                        ? `Średnia: ${calculateAverageRating(supplement.ratings || []).toFixed(1)} (${supplement.ratings?.length || 0} ocen)`
                                        : 'Brak ocen'}
                                </p>
                                <button
                                    onClick={() => handleAddToProfile(supplement.id)}
                                    className={`mt-2 py-1 px-4 text-sm font-medium text-white rounded transition-all ${userSupplements.includes(supplement.id)
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-green-500 hover:bg-green-600'
                                        }`}
                                    disabled={userSupplements.includes(supplement.id)}
                                >
                                    {userSupplements.includes(supplement.id) ? 'Dodano' : 'Dodaj do profilu'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal edycji */}
            {editSupplement && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Edytuj suplement</h2>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleEditSupplement();
                            }}
                            className="space-y-4"
                        >
                            <input
                                type="text"
                                placeholder="Nazwa suplementu"
                                value={editSupplement.name}
                                onChange={(e) =>
                                    setEditSupplement({ ...editSupplement, name: e.target.value })
                                }
                                className="w-full p-2 border rounded-md"
                            />
                            <input
                                type="text"
                                placeholder="Opis właściwości"
                                value={editSupplement.property}
                                onChange={(e) =>
                                    setEditSupplement({ ...editSupplement, property: e.target.value })
                                }
                                className="w-full p-2 border rounded-md"
                            />
                            <input
                                type="text"
                                placeholder="Link do badania"
                                value={editSupplement.link}
                                onChange={(e) =>
                                    setEditSupplement({ ...editSupplement, link: e.target.value })
                                }
                                className="w-full p-2 border rounded-md"
                            />
                            <div className="flex justify-between">
                                <button
                                    type="button"
                                    onClick={() => setEditSupplement(null)}
                                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                                >
                                    Anuluj
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
                                >
                                    Zapisz
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupplementsPage;
