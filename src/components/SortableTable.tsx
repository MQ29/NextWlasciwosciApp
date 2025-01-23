'use client';

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';

type SortOrder = 'asc' | 'desc' | 'default';

type TableProps = {
  headers: string[];
  footer?: string[];
};

type Supplement = {
  id: string;
  name?: string;
  property?: string;
  link?: string;
  ratings?: { rating: number; userId: string }[];
  averageRating?: number;
  [key: string]: string | number | undefined | { rating: number; userId: string }[];
};

export default function SortableTable({ headers, footer }: TableProps) {
  const [body, setBody] = useState<Supplement[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>('default');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [hiddenRows, setHiddenRows] = useState<number[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'supplements'), (snapshot) => {
      const supplements = snapshot.docs.map((doc) => {
        const data = doc.data() as Omit<Supplement, 'id'>;
        const ratingsArray = Array.isArray(data.ratings) ? data.ratings : [];
        const averageRating =
          ratingsArray.length > 0
            ? ratingsArray.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) /
              ratingsArray.length
            : 0;

        return { id: doc.id, ...data, averageRating };
      });
      setBody(supplements);
    });

    return () => unsubscribe();
  }, []);

  const sortData = (columnKey: string) => {
    let sortedData = [...body];

    if (sortOrder === 'default' || sortColumn !== columnKey) {
      sortedData.sort((a, b) => {
        if (columnKey === 'averageRating') {
          return (a[columnKey] ?? 0) - (b[columnKey] ?? 0);
        }
        return (a[columnKey] ?? '').toString().localeCompare((b[columnKey] ?? '').toString());
      });
      setSortOrder('asc');
    } else if (sortOrder === 'asc') {
      sortedData.reverse();
      setSortOrder('desc');
    } else {
      sortedData = [...body];
      setSortOrder('default');
    }

    setSortColumn(columnKey);
    setBody(sortedData);
  };

  const toggleRow = (rowIndex: number) => {
    if (hiddenRows.includes(rowIndex)) {
      setHiddenRows(hiddenRows.filter((index) => index !== rowIndex));
    } else {
      setHiddenRows([...hiddenRows, rowIndex]);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="table-auto border-collapse w-full rounded-lg shadow-lg bg-white">
        <thead>
          <tr className="bg-indigo-500 text-white rounded-t-lg">
            {headers.map((header, index) => (
              <th
                key={index}
                className={`p-3 text-left cursor-pointer ${
                  index === 0 ? 'rounded-tl-lg' : ''
                } ${index === headers.length - 1 ? 'rounded-tr-lg' : ''}`}
                onClick={() => sortData(header)}
              >
                {header}{' '}
                <span className="text-sm">
                  {sortColumn === header
                    ? sortOrder === 'asc'
                      ? '🔼'
                      : sortOrder === 'desc'
                      ? '🔽'
                      : '↔'
                    : ''}
                </span>
              </th>
            ))}
            <th className="p-3 rounded-tr-lg">Akcja</th>
          </tr>
        </thead>
        <tbody>
          {body.map((row, index) => (
            <React.Fragment key={row.id}>
              {!hiddenRows.includes(index) ? (
                <tr className="border-b hover:bg-gray-100 transition-all">
                  {headers.map((header, colIndex) => (
                    <td key={colIndex} className="p-3">
                      {header === 'link' ? (
                        <a
                          href={row[header] as string}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline hover:text-blue-700"
                        >
                          {row[header]}
                        </a>
                      ) : header === 'averageRating' ? (
                        (row.averageRating ?? 0).toFixed(2)
                      ) : (
                        row[header]?.toString()
                      )}
                    </td>
                  ))}
                  <td className="p-3 text-center">
                    <button
                      className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-all"
                      onClick={() => toggleRow(index)}
                    >
                      Collapse
                    </button>
                  </td>
                </tr>
              ) : (
                <tr className="border-b">
                  <td colSpan={headers.length + 1} className="p-3 text-center">
                    <button
                      className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-all"
                      onClick={() => toggleRow(index)}
                    >
                      Restore
                    </button>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
        {footer && (
          <tfoot>
            <tr>
              <td colSpan={headers.length + 1} className="bg-indigo-500 h-4 rounded-b-lg" />
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
