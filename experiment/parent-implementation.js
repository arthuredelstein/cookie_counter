const {Services} = ChromeUtils.import("resource://gre/modules/Services.jsm");

this.contentBlocking = class extends ExtensionAPI {
  getAPI(context) {
    return {
      contentBlocking: {
        async getContentBlockingLog(id) {
          return await context.extension.tabManager.get(id).nativeTab
                              .linkedBrowser.getContentBlockingLog();
        },
        useBasicList() {
          Services.prefs.setCharPref("urlclassifier.trackingAnnotationTable", "test-track-simple,base-track-digest256");
        }
      }
    }
  }
}
