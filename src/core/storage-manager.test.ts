import { StorageManager, StorageData, SiteSettings, GlobalSettings } from './storage-manager';

describe('StorageManager', () => {
  let storageManager: StorageManager;
  let mockStorage: any;

  beforeEach(() => {
    // Reset chrome.storage mock
    mockStorage = {
      local: {
        get: jest.fn(),
        set: jest.fn(),
        remove: jest.fn(),
        clear: jest.fn(),
      },
    };
    (global as any).chrome.storage = mockStorage;
    
    storageManager = new StorageManager();
  });

  describe('getGlobalSettings', () => {
    it('should return default settings when storage is empty', async () => {
      mockStorage.local.get.mockImplementation((keys: any, callback: any) => {
        callback({});
      });

      const settings = await storageManager.getGlobalSettings();
      
      expect(settings).toEqual({
        enabled: true,
        autoEnableJapaneseSites: true,
      });
    });

    it('should return stored settings when available', async () => {
      const storedData: Partial<StorageData> = {
        global: {
          enabled: false,
          autoEnableJapaneseSites: false,
        },
      };

      mockStorage.local.get.mockImplementation((keys: any, callback: any) => {
        callback(storedData);
      });

      const settings = await storageManager.getGlobalSettings();
      
      expect(settings).toEqual({
        enabled: false,
        autoEnableJapaneseSites: false,
      });
    });
  });

  describe('setGlobalSettings', () => {
    it('should save global settings to storage', async () => {
      const newSettings: GlobalSettings = {
        enabled: false,
        autoEnableJapaneseSites: true,
      };

      mockStorage.local.set.mockImplementation((data: any, callback: any) => {
        callback();
      });

      await storageManager.setGlobalSettings(newSettings);

      expect(mockStorage.local.set).toHaveBeenCalledWith(
        {
          global: newSettings,
        },
        expect.any(Function)
      );
    });
  });

  describe('getSiteSettings', () => {
    it('should return undefined for unregistered site', async () => {
      mockStorage.local.get.mockImplementation((keys: any, callback: any) => {
        callback({ sites: {} });
      });

      const settings = await storageManager.getSiteSettings('example.com');
      
      expect(settings).toBeUndefined();
    });

    it('should return site settings when available', async () => {
      const siteSettings: SiteSettings = {
        enabled: true,
        defaultImeMode: 'off',
        fields: {
          'input[name="email"]': {
            type: 'email',
            inputmode: 'email',
          },
        },
      };

      mockStorage.local.get.mockImplementation((keys: any, callback: any) => {
        callback({
          sites: {
            'example.com': siteSettings,
          },
        });
      });

      const settings = await storageManager.getSiteSettings('example.com');
      
      expect(settings).toEqual(siteSettings);
    });
  });

  describe('setSiteSettings', () => {
    it('should save site settings to storage', async () => {
      const siteSettings: SiteSettings = {
        enabled: true,
        defaultImeMode: 'on',
      };

      mockStorage.local.get.mockImplementation((keys: any, callback: any) => {
        callback({ sites: {} });
      });

      mockStorage.local.set.mockImplementation((data: any, callback: any) => {
        callback();
      });

      await storageManager.setSiteSettings('example.com', siteSettings);

      expect(mockStorage.local.set).toHaveBeenCalledWith(
        {
          sites: {
            'example.com': siteSettings,
          },
        },
        expect.any(Function)
      );
    });

    it('should merge with existing sites', async () => {
      const existingSites = {
        'other.com': {
          enabled: false,
          defaultImeMode: 'auto' as const,
        },
      };

      const newSiteSettings: SiteSettings = {
        enabled: true,
        defaultImeMode: 'on',
      };

      mockStorage.local.get.mockImplementation((keys: any, callback: any) => {
        callback({ sites: existingSites });
      });

      mockStorage.local.set.mockImplementation((data: any, callback: any) => {
        callback();
      });

      await storageManager.setSiteSettings('example.com', newSiteSettings);

      expect(mockStorage.local.set).toHaveBeenCalledWith(
        {
          sites: {
            'other.com': existingSites['other.com'],
            'example.com': newSiteSettings,
          },
        },
        expect.any(Function)
      );
    });
  });

  describe('removeSiteSettings', () => {
    it('should remove site from storage', async () => {
      const existingSites = {
        'example.com': {
          enabled: true,
          defaultImeMode: 'on' as const,
        },
        'other.com': {
          enabled: false,
          defaultImeMode: 'off' as const,
        },
      };

      mockStorage.local.get.mockImplementation((keys: any, callback: any) => {
        callback({ sites: existingSites });
      });

      mockStorage.local.set.mockImplementation((data: any, callback: any) => {
        callback();
      });

      await storageManager.removeSiteSettings('example.com');

      expect(mockStorage.local.set).toHaveBeenCalledWith(
        {
          sites: {
            'other.com': existingSites['other.com'],
          },
        },
        expect.any(Function)
      );
    });

    it('should handle removing non-existent site gracefully', async () => {
      mockStorage.local.get.mockImplementation((keys: any, callback: any) => {
        callback({ sites: {} });
      });

      mockStorage.local.set.mockImplementation((data: any, callback: any) => {
        callback();
      });

      await storageManager.removeSiteSettings('nonexistent.com');

      expect(mockStorage.local.set).toHaveBeenCalledWith(
        { sites: {} },
        expect.any(Function)
      );
    });
  });

  describe('getAllSiteSettings', () => {
    it('should return all site settings', async () => {
      const sites = {
        'example.com': {
          enabled: true,
          defaultImeMode: 'on' as const,
        },
        'test.com': {
          enabled: false,
          defaultImeMode: 'off' as const,
        },
      };

      mockStorage.local.get.mockImplementation((keys: any, callback: any) => {
        callback({ sites });
      });

      const allSites = await storageManager.getAllSiteSettings();
      
      expect(allSites).toEqual(sites);
    });

    it('should return empty object when no sites', async () => {
      mockStorage.local.get.mockImplementation((keys: any, callback: any) => {
        callback({});
      });

      const allSites = await storageManager.getAllSiteSettings();
      
      expect(allSites).toEqual({});
    });
  });

  describe('getFieldSettings', () => {
    it('should return field settings for specific selector', async () => {
      const fieldSettings = {
        type: 'email',
        inputmode: 'email',
      };

      mockStorage.local.get.mockImplementation((keys: any, callback: any) => {
        callback({
          sites: {
            'example.com': {
              enabled: true,
              defaultImeMode: 'on',
              fields: {
                'input[name="email"]': fieldSettings,
              },
            },
          },
        });
      });

      const settings = await storageManager.getFieldSettings('example.com', 'input[name="email"]');
      
      expect(settings).toEqual(fieldSettings);
    });

    it('should return undefined for non-existent field', async () => {
      mockStorage.local.get.mockImplementation((keys: any, callback: any) => {
        callback({
          sites: {
            'example.com': {
              enabled: true,
              defaultImeMode: 'on',
            },
          },
        });
      });

      const settings = await storageManager.getFieldSettings('example.com', 'input[name="email"]');
      
      expect(settings).toBeUndefined();
    });
  });

  describe('setFieldSettings', () => {
    it('should save field settings for specific selector', async () => {
      const fieldSettings = {
        type: 'tel',
        inputmode: 'tel',
      };

      mockStorage.local.get.mockImplementation((keys: any, callback: any) => {
        callback({
          sites: {
            'example.com': {
              enabled: true,
              defaultImeMode: 'on',
            },
          },
        });
      });

      mockStorage.local.set.mockImplementation((data: any, callback: any) => {
        callback();
      });

      await storageManager.setFieldSettings('example.com', 'input[name="phone"]', fieldSettings);

      expect(mockStorage.local.set).toHaveBeenCalledWith(
        {
          sites: {
            'example.com': {
              enabled: true,
              defaultImeMode: 'on',
              fields: {
                'input[name="phone"]': fieldSettings,
              },
            },
          },
        },
        expect.any(Function)
      );
    });

    it('should create site settings if not exists', async () => {
      const fieldSettings = {
        type: 'text',
        inputmode: 'text',
      };

      mockStorage.local.get.mockImplementation((keys: any, callback: any) => {
        callback({ sites: {} });
      });

      mockStorage.local.set.mockImplementation((data: any, callback: any) => {
        callback();
      });

      await storageManager.setFieldSettings('newsite.com', 'input[name="name"]', fieldSettings);

      expect(mockStorage.local.set).toHaveBeenCalledWith(
        {
          sites: {
            'newsite.com': {
              enabled: true,
              defaultImeMode: 'auto',
              fields: {
                'input[name="name"]': fieldSettings,
              },
            },
          },
        },
        expect.any(Function)
      );
    });
  });

  describe('removeFieldSettings', () => {
    it('should remove field settings for specific selector', async () => {
      mockStorage.local.get.mockImplementation((keys: any, callback: any) => {
        callback({
          sites: {
            'example.com': {
              enabled: true,
              defaultImeMode: 'on',
              fields: {
                'input[name="email"]': { type: 'email', inputmode: 'email' },
                'input[name="phone"]': { type: 'tel', inputmode: 'tel' },
              },
            },
          },
        });
      });

      mockStorage.local.set.mockImplementation((data: any, callback: any) => {
        callback();
      });

      await storageManager.removeFieldSettings('example.com', 'input[name="email"]');

      expect(mockStorage.local.set).toHaveBeenCalledWith(
        {
          sites: {
            'example.com': {
              enabled: true,
              defaultImeMode: 'on',
              fields: {
                'input[name="phone"]': { type: 'tel', inputmode: 'tel' },
              },
            },
          },
        },
        expect.any(Function)
      );
    });
  });

  describe('error handling', () => {
    it('should handle chrome.runtime.lastError', async () => {
      const error = new Error('Storage error');
      (global as any).chrome.runtime = { lastError: error };

      mockStorage.local.get.mockImplementation((keys: any, callback: any) => {
        callback({});
      });

      await expect(storageManager.getGlobalSettings()).rejects.toThrow('Storage error');
    });

    it('should handle storage quota exceeded', async () => {
      mockStorage.local.set.mockImplementation((data: any, callback: any) => {
        (global as any).chrome.runtime = { 
          lastError: { message: 'QUOTA_BYTES_PER_ITEM quota exceeded' } 
        };
        callback();
      });

      const largeSettings: GlobalSettings = {
        enabled: true,
        autoEnableJapaneseSites: true,
      };

      await expect(storageManager.setGlobalSettings(largeSettings))
        .rejects.toThrow('QUOTA_BYTES_PER_ITEM quota exceeded');
    });
  });
});