import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { trackPageView } from '../services/analytics/googleAnalytics';

export interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article' | 'profile';
  ogImage?: string;
  schemaData?: Record<string, any> | Record<string, any>[];
  publishedTime?: string;
  author?: string;
}

const DEFAULT_KEYWORDS =
  'script writing, youtube script editor, teleprompter online, youtube hooks, ai scriptwriter, video production planning, b-roll planner, script repurposing, content creator tools';
const DEFAULT_OG_IMAGE = 'https://scriptflow.app/og-image.png';
const BASE_URL = 'https://scriptflow.app';

export function useSEO({
  title,
  description,
  keywords = DEFAULT_KEYWORDS,
  canonicalUrl,
  ogType = 'website',
  ogImage = DEFAULT_OG_IMAGE,
  schemaData,
  publishedTime,
  author,
}: SEOProps) {
  const location = useLocation();
  const currentCanonical = canonicalUrl || `${BASE_URL}${location.pathname}`;

  useEffect(() => {
    // 1. Set document title
    const fullTitle = title.includes('ScriptFlow') ? title : `${title} | ScriptFlow`;
    document.title = fullTitle;

    // 2. Helper to set or update meta tag
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.content = content;
    };

    // 3. Set standard meta tags
    setMetaTag('description', description);
    setMetaTag('keywords', keywords);
    setMetaTag('robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');

    // 4. Set OpenGraph tags
    setMetaTag('og:title', fullTitle, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:url', currentCanonical, true);
    setMetaTag('og:type', ogType, true);
    setMetaTag('og:image', ogImage, true);
    setMetaTag('og:site_name', 'ScriptFlow', true);

    if (publishedTime) {
      setMetaTag('article:published_time', publishedTime, true);
    }
    if (author) {
      setMetaTag('article:author', author, true);
    }

    // 5. Set Twitter Card tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', fullTitle);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', ogImage);

    // 6. Set Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = currentCanonical;

    // 7. Inject Schema.org JSON-LD Structured Data
    let schemaScript = document.getElementById('schema-jsonld') as HTMLScriptElement;
    if (schemaData) {
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.id = 'schema-jsonld';
        schemaScript.type = 'application/ld+json';
        document.head.appendChild(schemaScript);
      }
      schemaScript.text = JSON.stringify(schemaData);
    } else if (schemaScript) {
      schemaScript.remove();
    }

    // 8. Track Page View in Google Analytics
    trackPageView(location.pathname, fullTitle);
  }, [title, description, keywords, currentCanonical, ogType, ogImage, schemaData, publishedTime, author, location.pathname]);
}
