class PopupManager {
  private currentDomain: string = '';

  async init() {
    await this.loadCurrentDomain();
    await this.loadSettings();
    this.setupEventListeners();
  }

  private async loadCurrentDomain() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.url) {
        const url = new URL(tab.url);
        this.currentDomain = url.hostname;
        
        const domainElement = document.getElementById('domain');
        if (domainElement) {
          domainElement.textContent = this.currentDomain;
        }
      }
    } catch (error) {
      console.error('Error loading current domain:', error);
    }
  }

  private async loadSettings() {
    try {
      // Load site settings
      const siteResponse = await this.sendMessage({
        type: 'GET_SITE_SETTINGS',
        domain: this.currentDomain,
      });

      const enableToggle = document.getElementById('enable-toggle') as HTMLInputElement;
      const defaultIMEMode = document.getElementById('default-ime-mode') as HTMLSelectElement;

      if (siteResponse.success && siteResponse.data) {
        enableToggle.checked = siteResponse.data.enabled;
        defaultIMEMode.value = siteResponse.data.defaultImeMode || 'auto';
      } else {
        // Check if site should be auto-enabled for Japanese sites
        const globalResponse = await this.sendMessage({
          type: 'GET_GLOBAL_SETTINGS',
        });

        if (globalResponse.success && globalResponse.data.autoEnableJapaneseSites) {
          // We can't detect Japanese here, so default to disabled for unknown sites
          enableToggle.checked = false;
          defaultIMEMode.value = 'auto';
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  private setupEventListeners() {
    const enableToggle = document.getElementById('enable-toggle') as HTMLInputElement;
    const defaultIMEMode = document.getElementById('default-ime-mode') as HTMLSelectElement;
    const optionsLink = document.getElementById('options-link');

    enableToggle?.addEventListener('change', this.handleEnableToggle.bind(this));
    defaultIMEMode?.addEventListener('change', this.handleDefaultIMEModeChange.bind(this));
    optionsLink?.addEventListener('click', this.openOptionsPage.bind(this));
  }

  private async handleEnableToggle() {
    const enableToggle = document.getElementById('enable-toggle') as HTMLInputElement;
    const defaultIMEMode = document.getElementById('default-ime-mode') as HTMLSelectElement;

    try {
      const siteSettings = {
        enabled: enableToggle.checked,
        defaultImeMode: defaultIMEMode.value as 'on' | 'off' | 'auto',
      };

      await this.sendMessage({
        type: 'SET_SITE_SETTINGS',
        domain: this.currentDomain,
        data: siteSettings,
      });

      // Reload the current tab to apply changes
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        chrome.tabs.reload(tab.id);
      }
    } catch (error) {
      console.error('Error saving enable toggle:', error);
    }
  }

  private async handleDefaultIMEModeChange() {
    const enableToggle = document.getElementById('enable-toggle') as HTMLInputElement;
    const defaultIMEMode = document.getElementById('default-ime-mode') as HTMLSelectElement;

    try {
      const siteSettings = {
        enabled: enableToggle.checked,
        defaultImeMode: defaultIMEMode.value as 'on' | 'off' | 'auto',
      };

      await this.sendMessage({
        type: 'SET_SITE_SETTINGS',
        domain: this.currentDomain,
        data: siteSettings,
      });
    } catch (error) {
      console.error('Error saving default IME mode:', error);
    }
  }

  private openOptionsPage() {
    chrome.runtime.openOptionsPage();
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

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const popupManager = new PopupManager();
  popupManager.init();
});