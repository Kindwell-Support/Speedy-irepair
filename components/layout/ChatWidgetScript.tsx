/**
 * LeadConnector (GHL) chat widget, attribute values exactly as GHL gave them. A plain <script>, not next/script,
 * so it is in the server-rendered HTML (a compliance scanner reads the raw page source); React hoists async
 * scripts into <head>. Rendered by the (site) and (landing) layouts only, so the CMS at /studio has no chat.
 */
export function ChatWidgetScript() {
  return (
    <script
      src="https://widgets.leadconnectorhq.com/loader.js"
      data-resources-url="https://widgets.leadconnectorhq.com/chat-widget/loader.js"
      data-widget-id="6aee0a29e90adeca207874fa"
      async
    ></script>
  );
}
