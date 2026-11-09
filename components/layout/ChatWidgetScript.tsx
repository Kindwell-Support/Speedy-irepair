/**
 * LeadConnector (GHL) chat widget, attribute values exactly as GHL gave them. A plain <script>, not next/script,
 * so it is in the server-rendered HTML (a compliance scanner reads the raw page source); React hoists async
 * scripts into <head>. Home page only (app/(site)/page.tsx).
 *
 * Once loaded, the script's <chat-widget> element stays in <body> across client-side navigation, so the marker
 * below exists only while this component is on the page and styles/globals.css hides <chat-widget> without it.
 */
export function ChatWidgetScript() {
  return (
    <>
      <script
        src="https://widgets.leadconnectorhq.com/loader.js"
        data-resources-url="https://widgets.leadconnectorhq.com/chat-widget/loader.js"
        data-widget-id="6aee0a29e90adeca207874fa"
        async
      ></script>
      <span data-chat-page hidden />
    </>
  );
}
