this.contentBlocking = class extends ExtensionAPI {
  getAPI(context) {
    return {
      contentBlocking: {
        async getContentBlockingLog(id) {
          return context.extension.tabManager.get(id).nativeTab
                        .linkedBrowser.getContentBlockingLog();
        }
      }
    }
  }
}
