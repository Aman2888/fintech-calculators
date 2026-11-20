import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getPageSeo, serializeSchema } from '../data/pageSeo';

export function SeoTags({ pathname, origin }: { pathname: string; origin?: string }) {
  const { title, description, canonical, robots, schema } = getPageSeo(pathname, origin);
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta name="twitter:card" content="summary" />
      {canonical && <link rel="canonical" href={canonical} />}
      {canonical && <meta property="og:url" content={canonical} />}
      {schema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeSchema(schema) }} />}
    </>
  );
}

export function PageSeo() {
  const { pathname } = useLocation();
  useEffect(() => {
    const seo = getPageSeo(pathname, document.head.querySelector('meta[name="site-origin"]')?.getAttribute('content') ?? undefined);
    document.title = seo.title;
    const values = [
      ['meta[name="description"]', 'content', seo.description],
      ['meta[name="robots"]', 'content', seo.robots],
      ['meta[property="og:title"]', 'content', seo.title],
      ['meta[property="og:description"]', 'content', seo.description],
      ['meta[property="og:url"]', 'content', seo.canonical],
      ['link[rel="canonical"]', 'href', seo.canonical],
      ['script[type="application/ld+json"]', 'textContent', seo.schema && serializeSchema(seo.schema)],
    ] as const;
    for (const [selector, attribute, value] of values) {
      let tag = document.head.querySelector(selector);
      if (!value) {
        tag?.remove();
        continue;
      }
      if (!tag) {
        const [, type, key, match] = selector.match(/^(\w+)\[([\w-]+)="([^"]+)"\]$/)!;
        tag = document.createElement(type);
        tag.setAttribute(key, match);
        document.head.appendChild(tag);
      }
      if (attribute === 'textContent') tag.textContent = value;
      else tag.setAttribute(attribute, value);
    }
  }, [pathname]);
  return null;
}
