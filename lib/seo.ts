export const SITE_URL = 'https://fadrodzak.my.id';
export const SITE_NAME = 'Fadrodzak';
export const DEFAULT_TAGLINE = 'Ruang Sastra & Komunitas Aksara';

/**
 * Membersihkan kode HTML dari teks dan menghasilkan ringkasan cuplikan (snippet)
 * yang aman, alami, dan ideal untuk meta description (140-160 karakter).
 */
export function cleanTextSnippet(htmlOrText: string | null | undefined, maxLength = 160): string {
  if (!htmlOrText) return '';
  const plain = htmlOrText
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();

  if (plain.length <= maxLength) return plain;
  return plain.slice(0, maxLength - 3) + '...';
}
