export interface GlobalSettings {
  enabled: boolean;
  autoEnableJapaneseSites: boolean;
}

export interface FieldSettings {
  type?: string;
  inputmode?: string;
}

export interface SiteSettings {
  enabled: boolean;
  defaultImeMode: 'on' | 'off' | 'auto';
  fields?: Record<string, FieldSettings>;
}

export interface StorageData {
  global: GlobalSettings;
  sites: Record<string, SiteSettings>;
}

export class StorageManager {
  private readonly DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
    enabled: true,
    autoEnableJapaneseSites: true,
  };

  private readonly DEFAULT_SITE_SETTINGS: SiteSettings = {
    enabled: true,
    defaultImeMode: 'auto',
  };

  async getGlobalSettings(): Promise<GlobalSettings> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(['global'], (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message || 'Storage error'));
          return;
        }

        const globalSettings = result.global || this.DEFAULT_GLOBAL_SETTINGS;
        resolve(globalSettings);
      });
    });
  }

  async setGlobalSettings(settings: GlobalSettings): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ global: settings }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message || 'Storage error'));
          return;
        }
        resolve();
      });
    });
  }

  async getSiteSettings(domain: string): Promise<SiteSettings | undefined> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(['sites'], (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message || 'Storage error'));
          return;
        }

        const sites = result.sites || {};
        resolve(sites[domain]);
      });
    });
  }

  async setSiteSettings(domain: string, settings: SiteSettings): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(['sites'], (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message || 'Storage error'));
          return;
        }

        const sites = result.sites || {};
        sites[domain] = settings;

        chrome.storage.local.set({ sites }, () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message || 'Storage error'));
            return;
          }
          resolve();
        });
      });
    });
  }

  async removeSiteSettings(domain: string): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(['sites'], (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message || 'Storage error'));
          return;
        }

        const sites = result.sites || {};
        delete sites[domain];

        chrome.storage.local.set({ sites }, () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message || 'Storage error'));
            return;
          }
          resolve();
        });
      });
    });
  }

  async getAllSiteSettings(): Promise<Record<string, SiteSettings>> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(['sites'], (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message || 'Storage error'));
          return;
        }

        resolve(result.sites || {});
      });
    });
  }

  async getFieldSettings(domain: string, selector: string): Promise<FieldSettings | undefined> {
    const siteSettings = await this.getSiteSettings(domain);
    return siteSettings?.fields?.[selector];
  }

  async setFieldSettings(domain: string, selector: string, fieldSettings: FieldSettings): Promise<void> {
    let siteSettings = await this.getSiteSettings(domain);
    
    if (!siteSettings) {
      siteSettings = { ...this.DEFAULT_SITE_SETTINGS };
    }

    if (!siteSettings.fields) {
      siteSettings.fields = {};
    }

    siteSettings.fields[selector] = fieldSettings;
    await this.setSiteSettings(domain, siteSettings);
  }

  async removeFieldSettings(domain: string, selector: string): Promise<void> {
    const siteSettings = await this.getSiteSettings(domain);
    
    if (siteSettings?.fields) {
      delete siteSettings.fields[selector];
      await this.setSiteSettings(domain, siteSettings);
    }
  }

  async clearAllData(): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.clear(() => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message || 'Storage error'));
          return;
        }
        resolve();
      });
    });
  }

  async exportData(): Promise<StorageData> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(null, (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message || 'Storage error'));
          return;
        }

        const data: StorageData = {
          global: result.global || this.DEFAULT_GLOBAL_SETTINGS,
          sites: result.sites || {},
        };

        resolve(data);
      });
    });
  }

  async importData(data: StorageData): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set(data, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message || 'Storage error'));
          return;
        }
        resolve();
      });
    });
  }
}