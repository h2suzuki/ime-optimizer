import { StorageManager } from '@/core/storage-manager';

class BackgroundService {
  private storageManager: StorageManager;

  constructor() {
    this.storageManager = new StorageManager();
  }

  init() {
    // Handle installation
    chrome.runtime.onInstalled.addListener(this.handleInstall.bind(this));
    
    // Handle messages from content scripts and popup
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
  }

  private async handleInstall(details: chrome.runtime.InstalledDetails) {
    if (details.reason === 'install') {
      // Set default settings on first install
      await this.storageManager.setGlobalSettings({
        enabled: true,
        autoEnableJapaneseSites: true,
      });
      
      console.log('IME Optimizer installed with default settings');
    }
  }

  private async handleMessage(
    message: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ) {
    try {
      switch (message.type) {
        case 'GET_GLOBAL_SETTINGS': {
          const globalSettings = await this.storageManager.getGlobalSettings();
          sendResponse({ success: true, data: globalSettings });
          break;
        }

        case 'SET_GLOBAL_SETTINGS': {
          await this.storageManager.setGlobalSettings(message.data);
          sendResponse({ success: true });
          break;
        }

        case 'GET_SITE_SETTINGS': {
          const siteSettings = await this.storageManager.getSiteSettings(message.domain);
          sendResponse({ success: true, data: siteSettings });
          break;
        }

        case 'SET_SITE_SETTINGS': {
          await this.storageManager.setSiteSettings(message.domain, message.data);
          sendResponse({ success: true });
          break;
        }

        case 'REMOVE_SITE_SETTINGS': {
          await this.storageManager.removeSiteSettings(message.domain);
          sendResponse({ success: true });
          break;
        }

        case 'GET_ALL_SITE_SETTINGS': {
          const allSiteSettings = await this.storageManager.getAllSiteSettings();
          sendResponse({ success: true, data: allSiteSettings });
          break;
        }

        case 'GET_FIELD_SETTINGS': {
          const fieldSettings = await this.storageManager.getFieldSettings(
            message.domain,
            message.selector
          );
          sendResponse({ success: true, data: fieldSettings });
          break;
        }

        case 'SET_FIELD_SETTINGS': {
          await this.storageManager.setFieldSettings(
            message.domain,
            message.selector,
            message.data
          );
          sendResponse({ success: true });
          break;
        }

        case 'REMOVE_FIELD_SETTINGS': {
          await this.storageManager.removeFieldSettings(message.domain, message.selector);
          sendResponse({ success: true });
          break;
        }

        case 'EXPORT_DATA': {
          const exportData = await this.storageManager.exportData();
          sendResponse({ success: true, data: exportData });
          break;
        }

        case 'IMPORT_DATA': {
          await this.storageManager.importData(message.data);
          sendResponse({ success: true });
          break;
        }

        default:
          sendResponse({ success: false, error: 'Unknown message type' });
      }
    } catch (error) {
      console.error('Background script error:', error);
      sendResponse({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }

    return true; // Keep message channel open for async response
  }
}

// Initialize background service
const backgroundService = new BackgroundService();
backgroundService.init();