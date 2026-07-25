'use client';

import { SearchBar } from '@/components/search/SearchBar';

export default function SearchPage() {
  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Search Stocks</h1>
      <SearchBar />
    </div>
  );
}