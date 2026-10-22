import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';
import './styles/theme.css';

const root = document.getElementById('root');
if (!root) {
  throw new Error('root 요소가 없어요.');
}

createRoot(root).render(
  <StrictMode>
    <div className="p-4 text-title-lg">뚜니레시피</div>
  </StrictMode>,
);
