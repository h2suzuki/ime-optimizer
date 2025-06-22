import { AttributePredictor } from './attribute-predictor';

describe('AttributePredictor', () => {
  let predictor: AttributePredictor;

  beforeEach(() => {
    predictor = new AttributePredictor();
  });

  describe('predictFromFieldInfo', () => {
    describe('Email fields', () => {
      it('should predict email attributes for fields with email keywords', () => {
        const testCases = [
          { name: 'email', placeholder: '' },
          { name: 'user_email', placeholder: '' },
          { name: '', placeholder: 'メールアドレス' },
          { name: '', placeholder: 'your@email.com' },
          { name: 'mail', placeholder: '' },
          { name: '', placeholder: 'E-mail' },
        ];

        testCases.forEach((fieldInfo) => {
          const result = predictor.predictFromFieldInfo(fieldInfo);
          expect(result.type).toBe('email');
          expect(result.inputmode).toBe('email');
          expect(result.emoji).toBe('📧');
          expect(result.confidence).toBeGreaterThan(0.8);
        });
      });
    });

    describe('Phone number fields', () => {
      it('should predict tel attributes for phone number fields', () => {
        const testCases = [
          { name: 'tel', placeholder: '' },
          { name: 'phone', placeholder: '' },
          { name: '', placeholder: '電話番号' },
          { name: '', placeholder: '090-1234-5678' },
          { name: 'mobile', placeholder: '' },
          { name: '', placeholder: '携帯番号' },
        ];

        testCases.forEach((fieldInfo) => {
          const result = predictor.predictFromFieldInfo(fieldInfo);
          expect(result.type).toBe('tel');
          expect(result.inputmode).toBe('tel');
          expect(result.emoji).toBe('📞');
          expect(result.confidence).toBeGreaterThan(0.8);
        });
      });
    });

    describe('Numeric fields', () => {
      it('should predict numeric attributes for number fields', () => {
        const testCases = [
          { name: 'age', placeholder: '' },
          { name: 'price', placeholder: '' },
          { name: '', placeholder: '年齢' },
          { name: '', placeholder: '金額' },
          { name: 'quantity', placeholder: '' },
          { name: '', placeholder: '数量' },
        ];

        testCases.forEach((fieldInfo) => {
          const result = predictor.predictFromFieldInfo(fieldInfo);
          expect(result.type).toBe('text'); // Using text to allow better IME control
          expect(result.inputmode).toBe('numeric');
          expect(result.emoji).toBe('🔢');
          expect(result.confidence).toBeGreaterThan(0.7);
        });
      });

      it('should predict postal code attributes', () => {
        const testCases = [
          { name: 'zip', placeholder: '' },
          { name: 'postal_code', placeholder: '' },
          { name: '', placeholder: '郵便番号' },
          { name: '', placeholder: '〒' },
          { name: '', placeholder: '123-4567' },
        ];

        testCases.forEach((fieldInfo) => {
          const result = predictor.predictFromFieldInfo(fieldInfo);
          expect(result.type).toBe('text');
          expect(result.inputmode).toBe('numeric');
          expect(result.emoji).toBe('🔢');
          expect(result.confidence).toBeGreaterThan(0.8);
        });
      });
    });

    describe('URL fields', () => {
      it('should predict url attributes for URL fields', () => {
        const testCases = [
          { name: 'url', placeholder: '' },
          { name: 'website', placeholder: '' },
          { name: '', placeholder: 'https://example.com' },
          { name: '', placeholder: 'ホームページ' },
          { name: 'link', placeholder: '' },
        ];

        testCases.forEach((fieldInfo) => {
          const result = predictor.predictFromFieldInfo(fieldInfo);
          expect(result.type).toBe('url');
          expect(result.inputmode).toBe('url');
          expect(result.emoji).toBe('🔗');
          expect(result.confidence).toBeGreaterThan(0.7);
        });
      });
    });

    describe('Password fields', () => {
      it('should predict password attributes', () => {
        const testCases = [
          { name: 'password', placeholder: '' },
          { name: 'pass', placeholder: '' },
          { name: '', placeholder: 'パスワード' },
          { name: 'user_password', placeholder: '' },
          { name: '', placeholder: '暗証番号' },
        ];

        testCases.forEach((fieldInfo) => {
          const result = predictor.predictFromFieldInfo(fieldInfo);
          expect(result.type).toBe('password');
          expect(result.inputmode).toBeUndefined(); // Password fields don't need inputmode
          expect(result.emoji).toBe('🔒');
          expect(result.confidence).toBe(1.0); // Password should never be changed
        });
      });
    });

    describe('Japanese text fields', () => {
      it('should predict text attributes for Japanese input fields', () => {
        const testCases = [
          { name: 'name', placeholder: '' },
          { name: 'address', placeholder: '' },
          { name: '', placeholder: '氏名' },
          { name: '', placeholder: '住所' },
          { name: 'company', placeholder: '' },
          { name: '', placeholder: 'コメント' },
          { name: 'description', placeholder: '' },
          { name: '', placeholder: '備考' },
        ];

        testCases.forEach((fieldInfo) => {
          const result = predictor.predictFromFieldInfo(fieldInfo);
          expect(result.type).toBe('text');
          expect(result.inputmode).toBe('text');
          expect(result.emoji).toBe('📝');
          expect(result.confidence).toBeGreaterThan(0.7);
        });
      });
    });

    describe('Search fields', () => {
      it('should predict search attributes', () => {
        const testCases = [
          { name: 'search', placeholder: '' },
          { name: 'q', placeholder: '' },
          { name: '', placeholder: '検索' },
          { name: 'query', placeholder: '' },
          { name: '', placeholder: 'キーワード' },
        ];

        testCases.forEach((fieldInfo) => {
          const result = predictor.predictFromFieldInfo(fieldInfo);
          expect(result.type).toBe('search');
          expect(result.inputmode).toBe('search');
          expect(result.emoji).toBe('🔍');
          expect(result.confidence).toBeGreaterThan(0.7);
        });
      });
    });

    describe('Date/Time fields', () => {
      it('should predict date attributes', () => {
        const testCases = [
          { name: 'date', placeholder: '' },
          { name: 'birthday', placeholder: '' },
          { name: '', placeholder: '日付' },
          { name: '', placeholder: '2024/01/01' },
          { name: 'birth_date', placeholder: '' },
        ];

        testCases.forEach((fieldInfo) => {
          const result = predictor.predictFromFieldInfo(fieldInfo);
          expect(result.type).toBe('date');
          expect(result.inputmode).toBeUndefined();
          expect(result.emoji).toBe('📅');
          expect(result.confidence).toBeGreaterThan(0.7);
        });
      });

      it('should predict time attributes', () => {
        const testCases = [
          { name: 'time', placeholder: '' },
          { name: 'start_time', placeholder: '' },
          { name: '', placeholder: '時刻' },
          { name: '', placeholder: '00:00' },
        ];

        testCases.forEach((fieldInfo) => {
          const result = predictor.predictFromFieldInfo(fieldInfo);
          expect(result.type).toBe('time');
          expect(result.inputmode).toBeUndefined();
          expect(result.emoji).toBe('🕐');
          expect(result.confidence).toBeGreaterThan(0.7);
        });
      });
    });

    describe('Credit card fields', () => {
      it('should predict credit card attributes', () => {
        const testCases = [
          { name: 'card_number', placeholder: '' },
          { name: 'credit_card', placeholder: '' },
          { name: '', placeholder: 'カード番号' },
          { name: '', placeholder: 'クレジットカード' },
          { name: 'cc_number', placeholder: '' },
        ];

        testCases.forEach((fieldInfo) => {
          const result = predictor.predictFromFieldInfo(fieldInfo);
          expect(result.type).toBe('text');
          expect(result.inputmode).toBe('numeric');
          expect(result.emoji).toBe('💳');
          expect(result.confidence).toBeGreaterThan(0.8);
        });
      });
    });

    describe('Unknown fields', () => {
      it('should return undefined for unpredictable fields', () => {
        const testCases = [
          { name: 'random_field', placeholder: '' },
          { name: '', placeholder: '' },
          { name: 'x', placeholder: 'y' },
        ];

        testCases.forEach((fieldInfo) => {
          const result = predictor.predictFromFieldInfo(fieldInfo);
          expect(result.type).toBeUndefined();
          expect(result.inputmode).toBeUndefined();
          expect(result.emoji).toBe('❓');
          expect(result.confidence).toBe(0);
        });
      });
    });
  });

  describe('predictFromElement', () => {
    it('should use existing type attribute when appropriate', () => {
      const input = document.createElement('input');
      input.type = 'email';
      input.name = 'contact';

      const result = predictor.predictFromElement(input);
      expect(result.type).toBe('email');
      expect(result.inputmode).toBe('email');
    });

    it('should extract field info from label', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <label for="field1">メールアドレス</label>
        <input id="field1" type="text">
      `;
      
      // Add container to document for querySelector to work
      document.body.appendChild(container);
      const input = container.querySelector('input') as HTMLInputElement;

      const result = predictor.predictFromElement(input);
      expect(result.type).toBe('email');
      expect(result.inputmode).toBe('email');
      
      // Clean up
      document.body.removeChild(container);
    });

    it('should prioritize aria-label over other attributes', () => {
      const input = document.createElement('input');
      input.setAttribute('aria-label', '電話番号');
      input.name = 'contact';
      input.placeholder = 'Enter contact';

      const result = predictor.predictFromElement(input);
      expect(result.type).toBe('tel');
      expect(result.inputmode).toBe('tel');
    });
  });
});