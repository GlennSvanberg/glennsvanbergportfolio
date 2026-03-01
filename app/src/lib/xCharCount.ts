export const X_CHAR_LIMIT = 280;
export const T_CO_LENGTH = 23;

export function getEffectiveLength(text: string): number {
  if (!text) return 0;
  
  let length = 0;
  
  // Basic URL regex (finds http/https links)
  const urlRegex = /https?:\/\/[^\s]+/g;
  
  // Replace URLs with a placeholder of T_CO_LENGTH length
  // We use a dummy string of exactly 23 characters so we can just count characters after
  const textWithoutUrls = text.replace(urlRegex, 'x'.repeat(T_CO_LENGTH));
  
  // Count emojis as 2 chars. We can use Intl.Segmenter to count graphemes properly.
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
    const segments = Array.from(segmenter.segment(textWithoutUrls));
    
    for (const segment of segments) {
      // Rough heuristic: if a grapheme has length > 1 (e.g. surrogates) and it's not the URL placeholder,
      // it might be an emoji or CJK. In X, emojis are 2 chars. 
      // A more robust way is just counting graphemes, but let's approximate X's weight:
      // Standard chars = 1, complex/emojis = 2.
      // We can just rely on string.length of the grapheme to guess if it's an emoji (often length 2+).
      if (segment.segment.length > 1) {
        length += 2;
      } else {
        length += 1;
      }
    }
  } else {
    // Fallback if Segmenter is not available
    length = Array.from(textWithoutUrls).length;
  }

  return length;
}

export function isOverLimit(text: string): boolean {
  return getEffectiveLength(text) > X_CHAR_LIMIT;
}
