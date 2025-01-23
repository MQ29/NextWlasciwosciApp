'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/firebase';
import SortableTable from '@/components/SortableTable';

const AdminPage = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const headers = ['name', 'property', 'link', 'averageRating'];

  useEffect(() => {
    const checkUserRole = async () => {
      const user = auth.currentUser;

      if (user) {
        const token = await user.getIdTokenResult();
        if (token.claims.admin) {
          setIsAdmin(true);
        } else {
          router.push('/');
        }
      } else {
        router.push('/auth/login');
      }
      setLoading(false);
    };

    checkUserRole();
  }, [router]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Filtering</h1>
      <SortableTable headers={headers} />
    </div>
  );
};

export default AdminPage;
