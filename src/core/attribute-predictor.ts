export interface InputAttributes {
  type?: string;
  inputmode?: string;
}

export interface PredictionResult extends InputAttributes {
  emoji: string;
  confidence: number;
}

export interface FieldInfo {
  name?: string;
  placeholder?: string;
  ariaLabel?: string;
  label?: string;
  id?: string;
  className?: string;
}

interface KeywordPattern {
  keywords: string[];
  attributes: InputAttributes;
  emoji: string;
  confidence: number;
}

export class AttributePredictor {
  private patterns: KeywordPattern[] = [
    // Email patterns
    {
      keywords: ['email', 'mail', 'メール', 'e-mail', '@'],
      attributes: { type: 'email', inputmode: 'email' },
      emoji: '📧',
      confidence: 0.9,
    },
    // Phone patterns
    {
      keywords: ['tel', 'phone', '電話', '携帯', 'mobile', 'fax'],
      attributes: { type: 'tel', inputmode: 'tel' },
      emoji: '📞',
      confidence: 0.9,
    },
    // Password patterns
    {
      keywords: ['password', 'pass', 'パスワード', '暗証番号', 'pin'],
      attributes: { type: 'password' },
      emoji: '🔒',
      confidence: 1.0, // Never change password fields
    },
    // URL patterns
    {
      keywords: ['url', 'website', 'ホームページ', 'サイト', 'link', 'http'],
      attributes: { type: 'url', inputmode: 'url' },
      emoji: '🔗',
      confidence: 0.8,
    },
    // Postal code patterns
    {
      keywords: ['zip', 'postal', '郵便番号', '〒'],
      attributes: { type: 'text', inputmode: 'numeric' },
      emoji: '🔢',
      confidence: 0.85,
    },
    // Credit card patterns
    {
      keywords: ['card_number', 'credit_card', 'カード番号', 'クレジットカード', 'cc_number'],
      attributes: { type: 'text', inputmode: 'numeric' },
      emoji: '💳',
      confidence: 0.85,
    },
    // Numeric patterns
    {
      keywords: ['age', '年齢', 'price', '価格', '金額', 'amount', 'quantity', '数量', '個数'],
      attributes: { type: 'text', inputmode: 'numeric' },
      emoji: '🔢',
      confidence: 0.75,
    },
    // Date patterns
    {
      keywords: ['date', '日付', 'birthday', '生年月日', 'birth_date', '年月日'],
      attributes: { type: 'date' },
      emoji: '📅',
      confidence: 0.8,
    },
    // Time patterns
    {
      keywords: ['time', '時刻', '時間', 'start_time', 'end_time'],
      attributes: { type: 'time' },
      emoji: '🕐',
      confidence: 0.8,
    },
    // Search patterns
    {
      keywords: ['search', '検索', 'query', 'q', 'キーワード'],
      attributes: { type: 'search', inputmode: 'search' },
      emoji: '🔍',
      confidence: 0.75,
    },
    // Japanese text patterns (should be last to avoid overriding specific patterns)
    {
      keywords: ['name', '氏名', '名前', 'なまえ', 'address', '住所', 'company', '会社名', 
                'comment', 'コメント', 'description', '説明', '備考', 'memo', 'メモ', 
                'title', 'タイトル', '件名', '内容'],
      attributes: { type: 'text', inputmode: 'text' },
      emoji: '📝',
      confidence: 0.75,
    },
  ];

  predictFromFieldInfo(fieldInfo: FieldInfo): PredictionResult {
    const searchText = this.buildSearchText(fieldInfo).toLowerCase();
    
    // Handle special date/time formats
    if (searchText.match(/\d{4}[/-]\d{1,2}[/-]\d{1,2}/) || searchText.includes('yyyy')) {
      const pattern = this.patterns.find(p => p.attributes.type === 'date');
      if (pattern) {
        return {
          ...pattern.attributes,
          emoji: pattern.emoji,
          confidence: pattern.confidence,
        };
      }
    }
    
    if (searchText.match(/\d{1,2}:\d{2}/) || searchText.includes('hh:mm')) {
      const pattern = this.patterns.find(p => p.attributes.type === 'time');
      if (pattern) {
        return {
          ...pattern.attributes,
          emoji: pattern.emoji,
          confidence: pattern.confidence,
        };
      }
    }
    
    // Handle phone number patterns
    if (searchText.match(/\d{2,4}-\d{2,4}-\d{4}/)) {
      const pattern = this.patterns.find(p => p.attributes.type === 'tel');
      if (pattern) {
        return {
          ...pattern.attributes,
          emoji: pattern.emoji,
          confidence: pattern.confidence,
        };
      }
    }
    
    // Handle postal code patterns
    if (searchText.match(/\d{3}-\d{4}/)) {
      const pattern = this.patterns.find(p => p.keywords.includes('郵便番号'));
      if (pattern) {
        return {
          ...pattern.attributes,
          emoji: pattern.emoji,
          confidence: pattern.confidence,
        };
      }
    }
    
    // Find matching patterns
    for (const pattern of this.patterns) {
      for (const keyword of pattern.keywords) {
        if (searchText.includes(keyword.toLowerCase())) {
          return {
            ...pattern.attributes,
            emoji: pattern.emoji,
            confidence: pattern.confidence,
          };
        }
      }
    }

    // No match found
    return {
      type: undefined,
      inputmode: undefined,
      emoji: '❓',
      confidence: 0,
    };
  }

  predictFromElement(element: HTMLInputElement): PredictionResult {
    const fieldInfo = this.extractFieldInfo(element);
    
    // If element already has a specific type, consider it
    if (element.type && ['email', 'tel', 'url', 'password', 'date', 'time', 'search'].includes(element.type)) {
      const pattern = this.patterns.find(p => p.attributes.type === element.type);
      if (pattern) {
        return {
          ...pattern.attributes,
          emoji: pattern.emoji,
          confidence: 0.95, // High confidence for existing type
        };
      }
    }

    return this.predictFromFieldInfo(fieldInfo);
  }

  private buildSearchText(fieldInfo: FieldInfo): string {
    const parts = [
      fieldInfo.ariaLabel,
      fieldInfo.label,
      fieldInfo.name,
      fieldInfo.placeholder,
      fieldInfo.id,
      fieldInfo.className,
    ].filter(Boolean);
    
    return parts.join(' ');
  }

  private extractFieldInfo(element: HTMLInputElement): FieldInfo {
    const fieldInfo: FieldInfo = {
      name: element.name,
      placeholder: element.placeholder,
      ariaLabel: element.getAttribute('aria-label') || undefined,
      id: element.id,
      className: element.className,
    };

    // Try to find associated label
    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) {
        fieldInfo.label = label.textContent || undefined;
      }
    }

    // Check if input is inside a label
    const parentLabel = element.closest('label');
    if (parentLabel && !fieldInfo.label) {
      // Extract text content but exclude the input element's own text
      const labelClone = parentLabel.cloneNode(true) as HTMLLabelElement;
      const inputInLabel = labelClone.querySelector('input');
      if (inputInLabel) {
        inputInLabel.remove();
      }
      fieldInfo.label = labelClone.textContent?.trim() || undefined;
    }

    return fieldInfo;
  }
}