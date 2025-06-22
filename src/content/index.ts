import { AttributePredictor } from '@/core/attribute-predictor';
import { JapaneseDetector } from '@/core/japanese-detector';
import { StorageManager } from '@/core/storage-manager';

class IMEOptimizer {
  private attributePredictor: AttributePredictor;
  private japaneseDetector: JapaneseDetector;
  private storageManager: StorageManager;
  private currentDomain: string;
  private isEnabled: boolean = false;
  private processedInputs: WeakSet<HTMLInputElement> = new WeakSet();

  constructor() {
    this.attributePredictor = new AttributePredictor();
    this.japaneseDetector = new JapaneseDetector();
    this.storageManager = new StorageManager();
    this.currentDomain = window.location.hostname;
  }

  async initialize() {
    try {
      // Check if extension should be enabled for this site
      await this.checkSiteSettings();
      
      if (this.isEnabled) {
        this.processExistingInputs();
        this.observeNewInputs();
      }
    } catch (error) {
      console.error('IME Optimizer initialization failed:', error);
    }
  }

  private async checkSiteSettings() {
    const globalSettings = await this.storageManager.getGlobalSettings();
    
    if (!globalSettings.enabled) {
      this.isEnabled = false;
      return;
    }

    // Check site-specific settings
    const siteSettings = await this.storageManager.getSiteSettings(this.currentDomain);
    
    if (siteSettings) {
      this.isEnabled = siteSettings.enabled;
      return;
    }

    // Auto-enable for Japanese sites if global setting is on
    if (globalSettings.autoEnableJapaneseSites) {
      const detectionResult = this.japaneseDetector.detectFromPage();
      this.isEnabled = detectionResult.isJapanese;
      
      // Save the auto-detected setting
      if (this.isEnabled) {
        await this.storageManager.setSiteSettings(this.currentDomain, {
          enabled: true,
          defaultImeMode: 'auto',
        });
      }
    }
  }

  private processExistingInputs() {
    const inputs = document.querySelectorAll('input[type="text"], input:not([type])');
    inputs.forEach((input) => {
      this.processInput(input as HTMLInputElement);
    });
  }

  private observeNewInputs() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
            // Check if the added element is an input
            if (element.tagName === 'INPUT') {
              this.processInput(element as HTMLInputElement);
            }
            
            // Check for inputs within the added element
            const inputs = element.querySelectorAll('input[type="text"], input:not([type])');
            inputs.forEach((input) => {
              this.processInput(input as HTMLInputElement);
            });
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  private async processInput(input: HTMLInputElement) {
    if (this.processedInputs.has(input)) {
      return;
    }

    this.processedInputs.add(input);

    try {
      // Get field-specific settings first
      const selector = this.generateSelector(input);
      const fieldSettings = await this.storageManager.getFieldSettings(this.currentDomain, selector);
      
      if (fieldSettings) {
        this.applyFieldSettings(input, fieldSettings);
        this.addIndicatorIcon(input, fieldSettings, true);
      } else {
        // Use AI prediction
        const prediction = this.attributePredictor.predictFromElement(input);
        
        if (prediction.type || prediction.inputmode) {
          this.applyPrediction(input, prediction);
          this.addIndicatorIcon(input, prediction, false);
        }
      }
    } catch (error) {
      console.error('Error processing input:', error);
    }
  }

  private generateSelector(input: HTMLInputElement): string {
    if (input.id) {
      return `input#${input.id}`;
    }
    if (input.name) {
      return `input[name="${input.name}"]`;
    }
    if (input.className) {
      return `input.${input.className.split(' ')[0]}`;
    }
    return 'input';
  }

  private applyFieldSettings(input: HTMLInputElement, settings: any) {
    if (settings.type && settings.type !== input.type) {
      input.type = settings.type;
    }
    if (settings.inputmode) {
      input.setAttribute('inputmode', settings.inputmode);
    }
  }

  private applyPrediction(input: HTMLInputElement, prediction: any) {
    if (prediction.type && prediction.type !== input.type && input.type === 'text') {
      input.type = prediction.type;
    }
    if (prediction.inputmode) {
      input.setAttribute('inputmode', prediction.inputmode);
    }
  }

  private addIndicatorIcon(input: HTMLInputElement, settings: any, isCustom: boolean) {
    // Remove existing indicator
    const existingIndicator = input.parentElement?.querySelector('.ime-optimizer-indicator');
    if (existingIndicator) {
      existingIndicator.remove();
    }

    // Create indicator
    const indicator = document.createElement('span');
    indicator.className = 'ime-optimizer-indicator';
    indicator.textContent = settings.emoji || '❓';
    indicator.style.cssText = `
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 16px;
      cursor: pointer;
      user-select: none;
      z-index: 1000;
      opacity: ${isCustom ? '1' : '0.5'};
      pointer-events: auto;
    `;

    // Set tooltip
    const tooltip = isCustom 
      ? `カスタム設定: ${settings.type || 'text'}${settings.inputmode ? `, ${settings.inputmode}` : ''}`
      : `AI推測: ${settings.type || 'text'}${settings.inputmode ? `, ${settings.inputmode}` : ''} (信頼度: ${Math.round(settings.confidence * 100)}%)`;
    
    indicator.title = tooltip;

    // Position input container
    const container = input.parentElement;
    if (container) {
      const computedStyle = getComputedStyle(container);
      if (computedStyle.position === 'static') {
        container.style.position = 'relative';
      }
    }

    // Add click handler for settings
    indicator.addEventListener('click', (e) => {
      e.stopPropagation();
      this.showFieldSettings(input, settings);
    });

    // Insert indicator
    input.parentElement?.appendChild(indicator);
  }

  private showFieldSettings(input: HTMLInputElement, currentSettings: any) {
    // Create modal for field settings
    const modal = document.createElement('div');
    modal.className = 'ime-optimizer-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      padding: 20px;
      border-radius: 8px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;

    content.innerHTML = `
      <h3 style="margin-top: 0;">フィールド設定</h3>
      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 4px;">Type属性:</label>
        <select id="ime-type-select" style="width: 100%; padding: 8px;">
          <option value="text">text</option>
          <option value="email">email</option>
          <option value="tel">tel</option>
          <option value="url">url</option>
          <option value="password">password</option>
          <option value="search">search</option>
          <option value="number">number</option>
        </select>
      </div>
      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 4px;">Inputmode属性:</label>
        <select id="ime-inputmode-select" style="width: 100%; padding: 8px;">
          <option value="">なし</option>
          <option value="text">text</option>
          <option value="email">email</option>
          <option value="tel">tel</option>
          <option value="url">url</option>
          <option value="numeric">numeric</option>
          <option value="decimal">decimal</option>
          <option value="search">search</option>
        </select>
      </div>
      <div style="display: flex; gap: 8px; justify-content: flex-end;">
        <button id="ime-cancel-btn" style="padding: 8px 16px; border: 1px solid #ccc; background: white; border-radius: 4px; cursor: pointer;">キャンセル</button>
        <button id="ime-save-btn" style="padding: 8px 16px; border: none; background: #2196F3; color: white; border-radius: 4px; cursor: pointer;">保存</button>
        <button id="ime-reset-btn" style="padding: 8px 16px; border: 1px solid #f44336; background: white; color: #f44336; border-radius: 4px; cursor: pointer;">リセット</button>
      </div>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    // Set current values
    const typeSelect = content.querySelector('#ime-type-select') as HTMLSelectElement;
    const inputmodeSelect = content.querySelector('#ime-inputmode-select') as HTMLSelectElement;
    
    typeSelect.value = currentSettings.type || 'text';
    inputmodeSelect.value = currentSettings.inputmode || '';

    // Event handlers
    content.querySelector('#ime-cancel-btn')?.addEventListener('click', () => {
      modal.remove();
    });

    content.querySelector('#ime-save-btn')?.addEventListener('click', async () => {
      const selector = this.generateSelector(input);
      const newSettings = {
        type: typeSelect.value,
        inputmode: inputmodeSelect.value || undefined,
      };

      await this.storageManager.setFieldSettings(this.currentDomain, selector, newSettings);
      this.applyFieldSettings(input, newSettings);
      
      // Update indicator
      const emoji = this.getEmojiForSettings(newSettings);
      this.addIndicatorIcon(input, { ...newSettings, emoji }, true);
      
      modal.remove();
    });

    content.querySelector('#ime-reset-btn')?.addEventListener('click', async () => {
      const selector = this.generateSelector(input);
      await this.storageManager.removeFieldSettings(this.currentDomain, selector);
      
      // Revert to AI prediction
      const prediction = this.attributePredictor.predictFromElement(input);
      this.applyPrediction(input, prediction);
      this.addIndicatorIcon(input, prediction, false);
      
      modal.remove();
    });

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  private getEmojiForSettings(settings: any): string {
    if (settings.type === 'email') return '📧';
    if (settings.type === 'tel') return '📞';
    if (settings.type === 'url') return '🔗';
    if (settings.type === 'password') return '🔒';
    if (settings.type === 'search') return '🔍';
    if (settings.type === 'number' || settings.inputmode === 'numeric') return '🔢';
    if (settings.inputmode === 'text') return '📝';
    return '❓';
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const optimizer = new IMEOptimizer();
    optimizer.initialize();
  });
} else {
  const optimizer = new IMEOptimizer();
  optimizer.initialize();
}