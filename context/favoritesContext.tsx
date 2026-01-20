import React, { createContext, useContext, useState } from 'react';

export type Favorite = {
  id: string;
  title: string;
  icon: string;
  stopId?: string;
  line?: string;
  type: 'stop' | 'bus';
  
};

type FavoritesContextType = {
  favorites: Favorite[];
  addFavorite: (fav: Favorite) => void;
  removeFavorite: (id: string) => void;
  clearFavorites: () => void;

};

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  const addFavorite = (fav: Favorite) => {
    setFavorites((prev) => {
      // prevent duplicates
      if (prev.some((f) => f.id === fav.id)) return prev;
      return [...prev, fav];
    });
  };

  const removeFavorite = (id: string) => {
    setFavorites(prev => prev.filter(f => f.id !== id));
  };
  const clearFavorites = () => {
    setFavorites([]);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, clearFavorites, }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used inside FavoritesProvider');
  return ctx;
}
