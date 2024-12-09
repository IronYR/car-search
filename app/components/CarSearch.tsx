'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function CarSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('query') || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) {
      params.set('query', query);
    }
    router.push(`/?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="mb-8">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search cars..."
          className="flex-1 p-2 border border-gray-300 rounded"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Search
        </button>
      </div>
    </form>
  );
}
