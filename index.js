const URLS = [
    '*://*.instagram.com/api/graphql',
    '*://*.instagram.com/graphql/query',
    '*://*.facebook.com/api/graphql/',
]

const isNodeEnv = typeof exports !== 'undefined'

// Chrome support: `browser` should fallback to `chrome`
// since Chrome doesn't fully support WebExtensions
if (typeof browser === 'undefined' && !isNodeEnv) {
    browser = chrome
}

let isEnabled = true; // Default state

// Initialize extension state
browser.storage.local.get('enabled', function (data) {
    isEnabled = data.enabled !== false;
});

// Listen for changes in the extension's enabled state
browser.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && 'enabled' in changes) {
        isEnabled = changes.enabled.newValue;
    }
});

const handleRequest = (details) => {
    if (!isEnabled) {
        return { cancel: false };
    }

    if (details.method == "POST") {
        let formData = details.requestBody.formData;
        let cancel = false;

        if (formData) {
            if (
                formData.hasOwnProperty("fb_api_req_friendly_name")
                && (
                    formData.fb_api_req_friendly_name.includes("PolarisAPIReelSeenMutation")
                    || formData.fb_api_req_friendly_name.includes("PolarisAPIReelSeenDirectMutation")
                    || formData.fb_api_req_friendly_name.includes("storiesUpdateSeenStateMutation")
                    || formData.fb_api_req_friendly_name.includes("usePolarisStoriesV3SeenMutation")
                    || formData.fb_api_req_friendly_name.includes("PolarisStoriesV3SeenMutation")
                    || formData.fb_api_req_friendly_name.includes("PolarisStoriesV3SeenDirectMutation")
                )
            ) {
                cancel = true;
            }
        }

        return { cancel: cancel };
    }

    return { cancel: false };
}

const listenToRequests = () => {
    browser.webRequest.onBeforeRequest.addListener(
        handleRequest,
        { urls: URLS },
        ['blocking', 'requestBody']
    );
}

listenToRequests();