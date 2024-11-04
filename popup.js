const isNodeEnv = typeof exports !== 'undefined'

// Chrome support: `browser` should fallback to `chrome`
// since Chrome doesn't fully support WebExtensions
if (typeof browser === 'undefined' && !isNodeEnv) {
    browser = chrome
}

document.addEventListener('DOMContentLoaded', function() {
  const statusElement = document.getElementById('status');
  const toggleButton = document.getElementById('toggleButton');

  function updateUI(isEnabled) {
    statusElement.textContent = isEnabled ? 'Enabled' : 'Disabled';
    statusElement.style.color = isEnabled ? '#4CAF50' : '#FF5252';
    toggleButton.textContent = isEnabled ? 'Disable' : 'Enable';
    toggleButton.style.backgroundColor = isEnabled ? '#FF5252' : '#4CAF50';
  }

  function toggleExtension() {
    browser.storage.local.get('enabled', function(data) {
      const newState = !data.enabled;
      browser.storage.local.set({enabled: newState}, function() {
        updateUI(newState);
        updateIcon(newState);
      });
    });
  }

  function updateIcon(isEnabled) {
    const iconPath = isEnabled ? "icon-enabled.png" : "icon-disabled.png";
    browser.browserAction.setIcon({path: iconPath}, function() {
      if (browser.runtime.lastError) {
        console.error("Error updating icon:", browser.runtime.lastError);
      } else {
        console.log("Icon updated successfully");
      }
    });
  }

  toggleButton.addEventListener('click', toggleExtension);

  browser.storage.local.get('enabled', function(data) {
    const isEnabled = data.enabled !== false; // Default to true if not set
    updateUI(isEnabled);
    updateIcon(isEnabled);
  });
});
