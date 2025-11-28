import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import {
  ANALYTICS_ENDPOINT,
  ANALYTICS_WEBSITE_ID,
  APP_LOGO,
  APP_TITLE,
} from "@/const";

const ensureDocumentChrome = () => {
  if (APP_TITLE) {
    document.title = APP_TITLE;
  }

  if (APP_LOGO) {
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (favicon) {
      favicon.href = APP_LOGO;
    }

    const appleTouch = document.querySelector<HTMLLinkElement>(
      'link[rel="apple-touch-icon"]',
    );
    if (appleTouch) {
      appleTouch.href = APP_LOGO;
    }
  }
};

const injectAnalytics = () => {
  if (!ANALYTICS_ENDPOINT || !ANALYTICS_WEBSITE_ID) {
    return;
  }

  const script = document.createElement("script");
  script.defer = true;
  script.src = `${ANALYTICS_ENDPOINT.replace(/\/$/, "")}/umami`;
  script.dataset.websiteId = ANALYTICS_WEBSITE_ID;
  document.body.appendChild(script);
};

ensureDocumentChrome();
injectAnalytics();

createRoot(document.getElementById("root")!).render(<App />);
