this.contentBlocking = class extends ExtensionAPI {
  getAPI(context) {
    return {
      contentBlocking: {
        async getContentBlockingLog(id) {
          const log = await context.extension.tabManager.get(id).nativeTab
                                   .linkedBrowser.getContentBlockingLog();
          return JSON.parse(log);
        }
      }
    }
  }
}
