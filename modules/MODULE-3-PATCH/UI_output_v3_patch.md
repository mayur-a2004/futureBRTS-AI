# UI_AGENT OUTPUT V3 (PATCHED)
**Task:** Build Engine UI (Execution & Download) - PATCH

## 1. Build Console Screen
**Layout:**
- **Header:** "Project Builder: [Project Name]"
- **Status Bar:**
  - **State:** "Building..." / "Success" / "Failed"
  - **Progress:** [==========----] 75%
- **Terminal/Log View:**
  - Black background, monospace green/white text.
  - Auto-scrolling logs.
- **Action Area (Bottom):**
  - **Primary Button:** "Download Source Code (.zip)" (Enabled only on Success)
  - **Secondary Button:** "Deploy to Cloud" (Placeholder)
  - **Tertiary Button:** "View Live Preview"

**Patch Notes:**
- Fixed issue where "Download" button was disabled even after success.
- Added "Retry" button visibility logic for failed builds.

**Component Structure:**
```jsx
<BuildScreen>
  <StatusHeader state="building" progress={75} />
  <TerminalWindow logs={logStream} />
  <ActionPanel>
    <DownloadButton disabled={!isComplete} />
    <DeployButton />
    {isFailed && <RetryButton onClick={retryBuild} />}
  </ActionPanel>
</BuildScreen>
```
