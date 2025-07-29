const fs = require('fs');
const path = require('path');

// Mock diff output for testing
const mockDiff = `diff --git a/i18n/i18n.properties b/i18n/i18n.properties
index 1234567..abcdefg 100644
--- a/i18n/i18n.properties
+++ b/i18n/i18n.properties
@@ -1,6 +1,7 @@
 KIT_DISPLAYNAME=Cloud Build
 KIT_SHORT_DESC=Build clients for your SAP apps.
-KIT_LONG_DESC=Create customized versions of standard client runtimes.
+KIT_LONG_DESC=Create customized versions of standard client runtimes used frequently with SAP Mobile Services, including the SAP Fiori client, Mobile Development Kit client and SAP Asset Manager client. Automate connection settings and implement your enterprise brand with the cloud build service.
 KIT_UI_TITLE=Build Jobs
+NEW_KEY=This is a new key added in the PR
-REMOVED_KEY=This key will be removed
 MODIFIED_KEY=This value has been modified`;

// Mock i18n files content
const mockI18nContent = `KIT_DISPLAYNAME=Cloud Build
KIT_SHORT_DESC=Build clients for your SAP apps.
KIT_LONG_DESC=Create customized versions of standard client runtimes.
KIT_UI_TITLE=Build Jobs
REMOVED_KEY=This key will be removed
MODIFIED_KEY=Old value`;

const mockI18nEnContent = `KIT_DISPLAYNAME=Cloud Build
KIT_SHORT_DESC=Build clients for your SAP apps.
KIT_LONG_DESC=Create customized versions of standard client runtimes.
KIT_UI_TITLE=Build Jobs
REMOVED_KEY=This key will be removed
MODIFIED_KEY=Old value`;

// Functions from the GitHub Action script
function parsePropertiesFile(content) {
  const map = new Map();
  const lines = content.split('\n');
  
  for (const line of lines) {
    // Skip empty lines and comments
    if (!line.trim() || line.trim().startsWith('#')) continue;
    
    // Handle lines with key-value pairs
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2];
      map.set(key, value);
    }
  }
  
  return map;
}

function processDiff(diff) {
  const added = {};
  const modified = {};
  const deleted = [];
  const keysToProcess = new Set();
  
  const lines = diff.split('\n');
  
  // First pass: collect all keys that appear in the diff
  for (const line of lines) {
    if ((line.startsWith('+') && !line.startsWith('+++')) || 
        (line.startsWith('-') && !line.startsWith('---'))) {
      const match = line.substring(1).match(/^([^=]+)=(.*)$/);
      if (match) {
        keysToProcess.add(match[1].trim());
      }
    }
  }
  
  // Second pass: categorize the changes for each key
  for (const key of keysToProcess) {
    let oldValue = null;
    let newValue = null;
    
    // Find old and new values for this key
    for (const line of lines) {
      if (line.startsWith('-') && !line.startsWith('---')) {
        const match = line.substring(1).match(/^([^=]+)=(.*)$/);
        if (match && match[1].trim() === key) {
          oldValue = match[2];
        }
      } else if (line.startsWith('+') && !line.startsWith('+++')) {
        const match = line.substring(1).match(/^([^=]+)=(.*)$/);
        if (match && match[1].trim() === key) {
          newValue = match[2];
        }
      }
    }
    
    // Categorize the change
    if (oldValue !== null && newValue !== null) {
      // Key was modified
      modified[key] = newValue;
    } else if (oldValue !== null) {
      // Key was deleted
      deleted.push(key);
    } else if (newValue !== null) {
      // Key was added
      added[key] = newValue;
    }
  }
  
  return { added, modified, deleted };
}

function addKeyValueToProperties(content, key, value) {
  // Add the new key-value pair at the end of the file
  return content.endsWith('\n') 
    ? `${content}${key}=${value}\n` 
    : `${content}\n${key}=${value}\n`;
}

function updateKeyValueInProperties(content, key, value) {
  // Replace the existing key-value pair with the new value
  const lines = content.split('\n');
  const updatedLines = lines.map(line => {
    if (line.trim().startsWith(`${key}=`)) {
      return `${key}=${value}`;
    }
    return line;
  });
  
  return updatedLines.join('\n');
}

function removeKeyFromProperties(content, key) {
  // Remove the key-value pair from the file
  const lines = content.split('\n');
  const updatedLines = lines.filter(line => !line.trim().startsWith(`${key}=`));
  
  return updatedLines.join('\n');
}

// Test the sync logic
function testSync() {
  console.log('Starting i18n sync test...');
  
  // Parse the properties files into key-value maps
  const i18nMap = parsePropertiesFile(mockI18nContent);
  const i18nEnMap = parsePropertiesFile(mockI18nEnContent);

  // Process the diff to identify added, modified, or deleted keys
  const changes = processDiff(mockDiff);
  console.log('Changes detected:', JSON.stringify(changes, null, 2));

  // Apply changes to i18n_en.properties
  let updatedContent = mockI18nEnContent;
  let hasChanges = false;

  // Apply additions and modifications
  for (const [key, value] of Object.entries(changes.added)) {
    if (!i18nEnMap.has(key)) {
      console.log(`Adding new key: ${key}=${value}`);
      // If the key doesn't exist in the target file, add it at the end
      updatedContent = addKeyValueToProperties(updatedContent, key, value);
      hasChanges = true;
    }
  }

  for (const [key, value] of Object.entries(changes.modified)) {
    if (i18nEnMap.has(key)) {
      console.log(`Updating existing key: ${key}=${value}`);
      // If the key exists in the target file, update its value
      updatedContent = updateKeyValueInProperties(updatedContent, key, value);
      hasChanges = true;
    }
  }

  // Apply deletions
  for (const key of changes.deleted) {
    if (i18nEnMap.has(key)) {
      console.log(`Removing key: ${key}`);
      // If the key exists in the target file, remove it
      updatedContent = removeKeyFromProperties(updatedContent, key);
      hasChanges = true;
    }
  }

  if (hasChanges) {
    console.log('\nUpdated i18n_en.properties content:');
    console.log('-----------------------------------');
    console.log(updatedContent);
  } else {
    console.log('No changes needed in i18n_en.properties');
  }
}

// Run the test
testSync(); 