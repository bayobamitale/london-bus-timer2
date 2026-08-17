import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const FAVORITES_STORAGE_KEY = '@london-bus-timer/favorites';

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
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;

    AsyncStorage.getItem(FAVORITES_STORAGE_KEY)
      .then((saved) => {
        if (!active || !saved) return;
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) setFavorites(parsed as Favorite[]);
      })
      .catch((error) => console.warn('Failed to load favourites', error))
      .finally(() => {
        if (active) setHydrated(true);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites)).catch((error) =>
      console.warn('Failed to save favourites', error)
    );
  }, [favorites, hydrated]);

  const addFavorite = (fav: Favorite) => {
    setFavorites((prev) => {
      // prevent duplicates
      if (prev.some((f) => f.id === fav.id)) return prev;
      return [...prev, fav];
    });
  };

  const removeFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, clearFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used inside FavoritesProvider');
  return ctx;
}
