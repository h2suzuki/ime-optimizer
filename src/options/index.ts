class OptionsManager {
  async init() {
    await this.loadSettings();
    this.setupEventListeners();
  }

  private async loadSettings() {
    try {
      // Load global settings
      const globalResponse = await this.sendMessage({
        type: 'GET_GLOBAL_SETTINGS',
      });

      if (globalResponse.success) {
        const autoEnableCheckbox = document.getElementById('auto-enable-japanese') as HTMLInputElement;
        autoEnableCheckbox.checked = globalResponse.data.autoEnableJapaneseSites;
      }

      // Load all site settings
      const sitesResponse = await this.sendMessage({
        type: 'GET_ALL_SITE_SETTINGS',
      });

      if (sitesResponse.success) {
        this.displaySiteSettings(sitesResponse.data);
      }
    } catch (error) {
      console.error('Error loading options:', error);
      this.showStatus('設定の読み込みに失敗しました', 'error');
    }
  }

  private displaySiteSettings(sites: Record<string, any>) {
    const enabledContainer = document.getElementById('enabled-sites');
    const disabledContainer = document.getElementById('disabled-sites');

    if (!enabledContainer || !disabledContainer) return;

    enabledContainer.innerHTML = '';
    disabledContainer.innerHTML = '';

    Object.entries(sites).forEach(([domain, settings]) => {
      const siteItem = this.createSiteItem(domain, settings);
      
      if (settings.enabled) {
        enabledContainer.appendChild(siteItem);
      } else {
        disabledContainer.appendChild(siteItem);
      }
    });

    if (enabledContainer.children.length === 0) {
      enabledContainer.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">有効化されているサイトはありません</p>';
    }

    if (disabledContainer.children.length === 0) {
      disabledContainer.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">無効化されているサイトはありません</p>';
    }
  }

  private createSiteItem(domain: string, settings: any): HTMLElement {
    const item = document.createElement('div');
    item.className = 'site-item';

    const domainSpan = document.createElement('span');
    domainSpan.textContent = `${domain} (${settings.defaultImeMode})`;

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = '削除';
    removeBtn.addEventListener('click', () => this.removeSite(domain));

    item.appendChild(domainSpan);
    item.appendChild(removeBtn);

    return item;
  }

  private async removeSite(domain: string) {
    if (!confirm(`${domain} の設定を削除しますか？`)) {
      return;
    }

    try {
      await this.sendMessage({
        type: 'REMOVE_SITE_SETTINGS',
        domain: domain,
      });

      this.showStatus('サイト設定を削除しました', 'success');
      await this.loadSettings(); // Reload to update display
    } catch (error) {
      console.error('Error removing site:', error);
      this.showStatus('削除に失敗しました', 'error');
    }
  }

  private setupEventListeners() {
    const autoEnableCheckbox = document.getElementById('auto-enable-japanese') as HTMLInputElement;
    const saveButton = document.getElementById('save-btn');

    autoEnableCheckbox?.addEventListener('change', this.handleAutoEnableChange.bind(this));
    saveButton?.addEventListener('click', this.saveSettings.bind(this));
  }

  private async handleAutoEnableChange() {
    // Auto-save on change
    await this.saveSettings();
  }

  private async saveSettings() {
    try {
      const autoEnableCheckbox = document.getElementById('auto-enable-japanese') as HTMLInputElement;

      const globalSettings = {
        enabled: true, // Always enabled globally
        autoEnableJapaneseSites: autoEnableCheckbox.checked,
      };

      await this.sendMessage({
        type: 'SET_GLOBAL_SETTINGS',
        data: globalSettings,
      });

      this.showStatus('設定を保存しました', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      this.showStatus('保存に失敗しました', 'error');
    }
  }

  private showStatus(message: string, type: 'success' | 'error') {
    const statusDiv = document.getElementById('status');
    if (!statusDiv) return;

    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';

    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 3000);
  }

  private sendMessage(message: any): Promise<any> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });
  }
}

// Initialize options when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const optionsManager = new OptionsManager();
  optionsManager.init();
});