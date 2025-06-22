import { JapaneseDetector } from './japanese-detector';

describe('JapaneseDetector', () => {
  let detector: JapaneseDetector;

  beforeEach(() => {
    detector = new JapaneseDetector();
  });

  describe('detectFromLang', () => {
    it('should detect Japanese from lang="ja"', () => {
      const result = detector.detectFromLang('ja');
      expect(result.isJapanese).toBe(true);
      expect(result.confidence).toBe(1.0);
      expect(result.method).toBe('lang-attribute');
    });

    it('should detect Japanese from lang="ja-JP"', () => {
      const result = detector.detectFromLang('ja-JP');
      expect(result.isJapanese).toBe(true);
      expect(result.confidence).toBe(1.0);
      expect(result.method).toBe('lang-attribute');
    });

    it('should not detect Japanese from other languages', () => {
      const languages = ['en', 'en-US', 'zh', 'ko', 'fr', 'de'];
      languages.forEach(lang => {
        const result = detector.detectFromLang(lang);
        expect(result.isJapanese).toBe(false);
        expect(result.confidence).toBe(1.0);
        expect(result.method).toBe('lang-attribute');
      });
    });

    it('should handle empty or null lang attributes', () => {
      expect(detector.detectFromLang('')).toEqual({
        isJapanese: false,
        confidence: 0,
        method: 'none',
      });
      expect(detector.detectFromLang(null as any)).toEqual({
        isJapanese: false,
        confidence: 0,
        method: 'none',
      });
    });
  });

  describe('detectFromText', () => {
    it('should detect Japanese from hiragana text', () => {
      const texts = [
        'これはひらがなです',
        'こんにちは、世界',
        'ありがとうございます',
      ];
      
      texts.forEach(text => {
        const result = detector.detectFromText(text);
        expect(result.isJapanese).toBe(true);
        expect(result.confidence).toBeGreaterThan(0.8);
        expect(result.method).toBe('text-analysis');
      });
    });

    it('should detect Japanese from katakana text', () => {
      const texts = [
        'カタカナテキスト',
        'コンピューター',
        'インターネット',
      ];
      
      texts.forEach(text => {
        const result = detector.detectFromText(text);
        expect(result.isJapanese).toBe(true);
        expect(result.confidence).toBeGreaterThan(0.8);
        expect(result.method).toBe('text-analysis');
      });
    });

    it('should detect Japanese from kanji text', () => {
      const texts = [
        '日本語',
        '東京都',
        '富士山',
      ];
      
      texts.forEach(text => {
        const result = detector.detectFromText(text);
        expect(result.isJapanese).toBe(true);
        expect(result.confidence).toBeGreaterThan(0.8);
        expect(result.method).toBe('text-analysis');
      });
    });

    it('should detect Japanese from mixed text', () => {
      const text = '日本語のWebサイトです。IME制御を最適化します。';
      const result = detector.detectFromText(text);
      expect(result.isJapanese).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.method).toBe('text-analysis');
    });

    it('should not detect Japanese from English text', () => {
      const texts = [
        'This is English text',
        'Hello World',
        'Chrome Extension Development',
      ];
      
      texts.forEach(text => {
        const result = detector.detectFromText(text);
        expect(result.isJapanese).toBe(false);
        expect(result.confidence).toBeLessThan(0.2);
        expect(result.method).toBe('text-analysis');
      });
    });

    it('should handle empty text', () => {
      const result = detector.detectFromText('');
      expect(result.isJapanese).toBe(false);
      expect(result.confidence).toBe(0);
      expect(result.method).toBe('text-analysis');
    });

    it('should detect Japanese when threshold is met', () => {
      // Text with exactly 20% Japanese characters
      const text = '日本語abcdefghij'; // 3 Japanese chars out of 13 total (no spaces counted)
      const result = detector.detectFromText(text);
      expect(result.isJapanese).toBe(true);
      expect(result.confidence).toBeCloseTo(3/13, 2);
    });
  });


  describe('detectFromPage', () => {
    let originalDocument: Document;

    beforeEach(() => {
      originalDocument = global.document;
    });

    afterEach(() => {
      global.document = originalDocument;
    });

    it('should prioritize lang attribute when available', () => {
      document.documentElement.lang = 'ja';
      document.body.innerHTML = 'English content only';
      
      const result = detector.detectFromPage();
      expect(result.isJapanese).toBe(true);
      expect(result.confidence).toBe(1.0);
      expect(result.method).toBe('lang-attribute');
    });

    it('should use text analysis when lang attribute is not Japanese', () => {
      document.documentElement.lang = 'en';
      document.head.innerHTML = '<title>日本語のサイト</title>';
      document.body.innerHTML = `
        <h1>日本語のタイトル</h1>
        <p>これは日本語のコンテンツです。</p>
        <p>日本語のテキストが含まれています。</p>
      `;
      
      const result = detector.detectFromPage();
      expect(result.isJapanese).toBe(true);
      expect(result.method).toBe('text-analysis');
    });

    it('should analyze important elements for text content', () => {
      document.documentElement.lang = '';
      document.body.innerHTML = `
        <title>日本語サイト</title>
        <h1>メインタイトル</h1>
        <h2>サブタイトル</h2>
        <p>段落のテキスト</p>
        <div>その他のコンテンツ</div>
      `;
      
      const result = detector.detectFromPage();
      expect(result.isJapanese).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

  });

  describe('character detection helpers', () => {
    it('should correctly identify hiragana characters', () => {
      const hiragana = ['あ', 'い', 'う', 'え', 'お', 'ん'];
      const nonHiragana = ['ア', '亜', 'a', '1', ' '];
      
      hiragana.forEach(char => {
        expect(detector.isHiragana(char)).toBe(true);
      });
      
      nonHiragana.forEach(char => {
        expect(detector.isHiragana(char)).toBe(false);
      });
    });

    it('should correctly identify katakana characters', () => {
      const katakana = ['ア', 'イ', 'ウ', 'エ', 'オ', 'ン'];
      const nonKatakana = ['あ', '亜', 'a', '1', ' '];
      
      katakana.forEach(char => {
        expect(detector.isKatakana(char)).toBe(true);
      });
      
      nonKatakana.forEach(char => {
        expect(detector.isKatakana(char)).toBe(false);
      });
    });

    it('should correctly identify kanji characters', () => {
      const kanji = ['日', '本', '語', '東', '京'];
      const nonKanji = ['あ', 'ア', 'a', '1', ' '];
      
      kanji.forEach(char => {
        expect(detector.isKanji(char)).toBe(true);
      });
      
      nonKanji.forEach(char => {
        expect(detector.isKanji(char)).toBe(false);
      });
    });
  });
});