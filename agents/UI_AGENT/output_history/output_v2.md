# UI_AGENT OUTPUT V2
**Task:** Project Generator UI (Core Engine Screen)

## 1. Project Builder Main UI
**Layout:**
- **Header:** "Project Generator" (Simple, clean)
- **Main Container (Centered):**
  - **Card Title:** "Start a New Project"
  - **Form Group 1:**
    - Label: "Project Name"
    - Input: Text Field (Placeholder: "e.g., E-Commerce Platform")
  - **Form Group 2:**
    - Label: "Domain"
    - Select Dropdown: [Web, App, AI, IOT, Fintech, Edu, Other]
  - **Form Group 3:**
    - Label: "Difficulty Level"
    - Radio Buttons/Chips: [Easy, Medium, Hard]
  - **Primary Action:**
    - Button: "Generate Full Project" (Large, Prominent, maybe with a magic icon)

**Component Structure:**
```jsx
<ProjectBuilderContainer>
  <Header title="Project Generator" />
  <GeneratorCard>
    <InputGroup label="Project Name" type="text" />
    <SelectGroup label="Domain" options={['Web', 'App', 'AI', ...]} />
    <RadioGroup label="Difficulty" options={['Easy', 'Medium', 'Hard']} />
    <GenerateButton icon="magic">Generate Full Project</GenerateButton>
  </GeneratorCard>
</ProjectBuilderContainer>
```

## 2. After Generate (Results View)
**Layout:**
- **Transition:** Loading spinner/animation while generating.
- **Results Container:**
  - **Tabs Navigation:** [Overview] [ER Diagram] [DFD] [Schema] [Report PDF]
  - **Tab Content Area:**
    - *Overview Tab:* Summary text of the project.
    - *ER Diagram Tab:* Visual representation (or mermaid.js code block).
    - *DFD Tab:* Data Flow Diagram text/visual.
    - *Schema Tab:* SQL/NoSQL code block.
    - *Report PDF Tab:* "Download PDF" button + Preview.

**Component Structure:**
```jsx
<ResultsContainer>
  <Tabs>
    <Tab label="Overview" active />
    <Tab label="ER Diagram" />
    <Tab label="DFD" />
    <Tab label="Schema" />
    <Tab label="Report PDF" />
  </Tabs>
  <ContentArea>
    {/* Dynamic content based on active tab */}
  </ContentArea>
</ResultsContainer>
```

## 3. UI Requirements Checklist
- [x] Light theme
- [x] Expandable structure (Tabs allow adding more outputs later)
- [x] No backend logic (Mock data for now)
