import { createHashRouter } from 'react-router';
import { AppShell } from '../components/AppShell';
import { PickPage } from '../pages/PickPage';
import { RecipeDetailPage } from '../pages/RecipeDetailPage';
import { RecipeEditPage } from '../pages/RecipeEditPage';
import { RecipeListPage } from '../pages/RecipeListPage';
import { SettingsPage } from '../pages/SettingsPage';

export const router = createHashRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <RecipeListPage /> },
      { path: 'pick', element: <PickPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'recipes/new', element: <RecipeEditPage /> },
      { path: 'recipes/:id', element: <RecipeDetailPage /> },
      { path: 'recipes/:id/edit', element: <RecipeEditPage /> },
    ],
  },
]);
