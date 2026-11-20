import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { AppContent } from './App';
import { SeoTags } from './components/PageSeo';

export { seoPaths } from './data/pageSeo';

export function renderPage(pathname: string, origin?: string) {
  return {
    head: renderToString(<SeoTags pathname={pathname} origin={origin} />),
    body: renderToString(<StaticRouter location={pathname}><AppContent /></StaticRouter>),
  };
}
