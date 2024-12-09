import CarList from "./components/CarList";
import CarSearch from "./components/CarSearch";
import { Suspense } from 'react'

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <main className="container mx-auto px-4 py-8 ">
        <h1 className="text-3xl font-bold mb-8">Car Search</h1>
        <CarSearch />
        <CarList />
      </main>
    </Suspense>
  );
} 