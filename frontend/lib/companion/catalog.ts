import apps from '../../mock/apps.json';
import { CatalogApp } from './types';

export const getCatalog = (): CatalogApp[] => {
  return apps.map((app: {
    id: string;
    name: string;
    publisher: string;
    category: string;
    description: string;
    wingetId: string;
    iconPlaceholder?: string;
    verified?: boolean;
  }) => ({
    id: app.id,
    name: app.name,
    publisher: app.publisher,
    category: app.category,
    description: app.description,
    wingetId: app.wingetId,
    icon: app.iconPlaceholder || "",
    size: "Unknown",
    verified: !!app.verified,
    featured: false,
  }));
};

export const getAppById = (id: string): CatalogApp | undefined => {
  return getCatalog().find(app => app.id === id || app.wingetId === id);
};
