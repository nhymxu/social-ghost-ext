const URLS = [
    '*://*.instagram.com/api/graphql',
    '*://*.instagram.com/graphql/query',
    '*://*.facebook.com/api/graphql/'
]

const isNodeEnv = typeof exports !== 'undefined'

// Chrome support: `browser` should fallback to `chrome`
// since Chrome doesn't fully support WebExtensions
if (typeof browser === 'undefined' && !isNodeEnv) {
    browser = chrome
}

console.log('Social ghost extension loaded');

const handleRequest = (details) => {
    console.log('handleRequest called', details.url);
    
    return new Promise((resolve) => {
        browser.storage.local.get('enabled', function(data) {
            console.log('Extension enabled:', data.enabled);
            
            if (data.enabled === false) {
                console.log('Extension disabled, not blocking request');
                resolve({cancel: false});
                return;
            }

            if(details.method == "POST") {
                let formData = details.requestBody.formData;
                let cancel = false;

                if(formData) {
                    console.log('Form data:', formData);
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
                        console.log('Blocking request:', details.url);
                    }
                }

                resolve({cancel: cancel});
            } else {
                resolve({cancel: false});
            }
        });
    });
}

const listenToRequests = () => {
    console.log('Setting up request listener');
    browser.webRequest.onBeforeRequest.addListener(
        handleRequest,
        { urls: URLS },
        ['blocking', 'requestBody']
    );
    console.log('Request listener set up');
}

// Initialize extension state
browser.storage.local.get('enabled', function(data) {
    if (data.enabled === undefined) {
        console.log('Initializing extension state to enabled');
        browser.storage.local.set({enabled: true});
    } else {
        console.log('Extension state:', data.enabled ? 'enabled' : 'disabled');
    }
});

listenToRequests();

// Listen for changes in the extension's enabled state
browser.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && 'enabled' in changes) {
        console.log('Extension enabled state changed:', changes.enabled.newValue);
    }
});

console.log('Social ghost extension setup complete');