'use client';

import { useEffect, useState, useCallback } from 'react';
import { Car } from '../types';
import { useInView } from 'react-intersection-observer';
import { useSearchParams } from 'next/navigation';

async function getCars(query: string | null, page: number): Promise<{
  cars: Car[];
  hasMore: boolean;
  total: number;
}> {
  const params = new URLSearchParams();
  if (query) params.set('query', query);
  params.set('page', page.toString());
  
  const res = await fetch(`/api/cars?${params.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to fetch cars');
  }
  return res.json();
}

export default function CarList() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query');
  const [cars, setCars] = useState<Car[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { ref, inView } = useInView({
    threshold: 0.1,
    rootMargin: '0px',
  });

  const loadCars = useCallback(async (pageNum: number, isNewSearch: boolean) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const result = await getCars(query, pageNum);
      setCars(prev => isNewSearch ? result.cars : [...prev, ...result.cars]);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Error loading cars:', error);
    } finally {
      setIsLoading(false);
    }
  }, [query, isLoading]);

  // Initial load and search query changes
  useEffect(() => {
    setPage(1);
    loadCars(1, true);
  }, [query]); 

  // infinite scroll
  useEffect(() => {
    if (inView && hasMore && !isLoading && page > 1) {
      loadCars(page, false);
    }
  }, [inView, page]);

  // Update page number only when actually reaching bottom
  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      setPage(prev => prev + 1);
    }
  }, [inView]);

  if (cars.length === 0 && !isLoading) {
    return <p className="text-center">No cars found.</p>;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map((car, index) => (
          <div
            key={`${car.id}-${index}`}
            className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold">
              {car.year} {car.make} {car.model}
            </h2>
            <p className="text-gray-600">${car.price.toLocaleString()}</p>
            {car.description && (
              <p className="text-gray-500 mt-2">{car.description}</p>
            )}
          </div>
        ))}
      </div>
      
      {hasMore && (
        <div 
          ref={ref}
          className="h-20 flex items-center justify-center"
        >
          {isLoading && (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          )}
        </div>
      )}
    </div>
  );
} 