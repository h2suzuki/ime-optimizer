export interface DetectionResult {
  isJapanese: boolean;
  confidence: number;
  method: 'lang-attribute' | 'text-analysis' | 'none';
}

export class JapaneseDetector {
  private readonly JAPANESE_THRESHOLD = 0.2; // 20% of characters should be Japanese

  detectFromLang(lang: string | null | undefined): DetectionResult {
    if (!lang) {
      return { isJapanese: false, confidence: 0, method: 'none' };
    }

    const normalizedLang = lang.toLowerCase();
    const isJapanese = normalizedLang === 'ja' || normalizedLang.startsWith('ja-');

    return {
      isJapanese,
      confidence: 1.0,
      method: 'lang-attribute',
    };
  }

  detectFromText(text: string): DetectionResult {
    if (!text || text.length === 0) {
      return { isJapanese: false, confidence: 0, method: 'text-analysis' };
    }

    let japaneseCount = 0;
    let totalCount = 0;

    for (const char of text) {
      if (char.trim()) { // Count non-whitespace characters
        totalCount++;
        if (this.isJapaneseChar(char)) {
          japaneseCount++;
        }
      }
    }

    if (totalCount === 0) {
      return { isJapanese: false, confidence: 0, method: 'text-analysis' };
    }

    const ratio = japaneseCount / totalCount;
    const isJapanese = ratio >= this.JAPANESE_THRESHOLD;

    return {
      isJapanese,
      confidence: ratio,
      method: 'text-analysis',
    };
  }


  detectFromPage(): DetectionResult {
    // 1. Check lang attribute (highest priority)
    const htmlLang = document.documentElement.lang;
    const langResult = this.detectFromLang(htmlLang);
    
    // Only return lang result if it indicates Japanese
    // For non-Japanese lang attributes, continue with other detection methods
    if (langResult.confidence === 1.0 && langResult.isJapanese) {
      return langResult;
    }

    // 2. Analyze page text content
    const textContent = this.extractImportantText();
    const textResult = this.detectFromText(textContent);

    // Return text analysis result
    return textResult;
  }

  private extractImportantText(): string {
    const textParts: string[] = [];
    
    // Add title from head
    const titleElement = document.querySelector('title');
    if (titleElement && titleElement.textContent) {
      textParts.push(titleElement.textContent);
    }

    // Add text from important elements
    const importantSelectors = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'];
    importantSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element, index) => {
        if (selector === 'p' && index >= 10) return; // Limit paragraphs
        const text = element.textContent?.trim();
        if (text) {
          textParts.push(text);
        }
      });
    });

    return textParts.join(' ');
  }

  private isJapaneseChar(char: string): boolean {
    return this.isHiragana(char) || this.isKatakana(char) || this.isKanji(char);
  }

  isHiragana(char: string): boolean {
    const code = char.charCodeAt(0);
    return code >= 0x3040 && code <= 0x309F;
  }

  isKatakana(char: string): boolean {
    const code = char.charCodeAt(0);
    return code >= 0x30A0 && code <= 0x30FF;
  }

  isKanji(char: string): boolean {
    const code = char.charCodeAt(0);
    return code >= 0x4E00 && code <= 0x9FAF;
  }
}