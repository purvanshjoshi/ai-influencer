# Bella Integration Installation Manifest

## Overview
This document provides the complete manifest of all source files from the Bella repository (https://github.com/purvanshjoshi/Bella) that need to be integrated into the AI Influencer platform's `public/bella/` folder structure.

## Status
✅ **In Progress** - Selective file integration from Bella repository
- ✅ Core.js - Integrated (BellaAI core logic)
- ⏳ Remaining files - To be copied following this manifest

## Source Repository
**Bella Repository**: https://github.com/purvanshjoshi/Bella  
**Bella Main Branch**: https://github.com/purvanshjoshi/Bella/tree/main

## Required Files by Category

### 1. Core AI Logic Files
**Directory**: `public/bella/core/`

#### ✅ core.js (DONE)
- **Source**: https://raw.githubusercontent.com/purvanshjoshi/Bella/main/core.js
- **Size**: ~11.1 KB
- **Description**: Bella's core AI logic supporting hybrid local/cloud architecture
- **Key Classes**: BellaAI (Singleton pattern)
- **Dependencies**: cloudAPI.js, transformers.js
- **Status**: Integrated

#### ⏳ simpleBellaAI.js (PENDING)
- **Source**: https://raw.githubusercontent.com/purvanshjoshi/Bella/main/simpleBellaAI.js
- **Description**: Lightweight fallback AI implementation
- **Use Case**: For situations where full model loading fails

### 2. Chat Interface Components
**Directory**: `public/bella/components/`

#### ⏳ chatInterfacejs (PENDING)
- **Source**: https://github.com/purvanshjoshi/Bella/blob/main/chatInterfacejs
- **Description**: Chat UI interface component
- **Key Functions**: Message rendering, user interaction handling

#### ⏳ bellaInteraction.js (PENDING)
- **Description**: Event handling and user interaction logic
- **Key Features**: Message processing, response formatting

#### ⏳ BellaWrapper.jsx (PENDING)
- **Description**: React component wrapper for Bella integration
- **Integration Point**: Connect to React app component hierarchy

### 3. Styling Files
**Directory**: `public/bella/styles/`

#### ⏳ bellaMain.css (PENDING)
- **Source**: https://github.com/purvanshjoshi/Bella/blob/main/style.css
- **Description**: Main styling for Bella UI
- **Components**: Chat interface, buttons, layouts

#### ⏳ chatStyles.css (PENDING)
- **Source**: https://github.com/purvanshjoshi/Bella/blob/main/chatStyles.css
- **Description**: Chat-specific styling
- **Components**: Message bubbles, input fields, response containers

### 4. External Service Integration
**Directory**: `public/bella/services/`

#### ⏳ cloudAPI.js (PENDING)
- **Source**: https://raw.githubusercontent.com/purvanshjoshi/Bella/main/cloudAPI.js
- **Description**: Cloud LLM API integration (OpenAI, Anthropic, etc.)
- **Key Methods**: chat(), switchProvider(), setAPIKey()
- **Supported Providers**: OpenAI, Anthropic, Gemini

### 5. Assets
**Directory**: `public/bella/assets/`

#### Icons (PENDING)
- **Source**: https://github.com/purvanshjoshi/Bella/tree/main/assets/icons
- **Description**: Bella avatar icons and UI icons
- **Format**: SVG/PNG

#### Videos (PENDING)
- **Source**: https://github.com/purvanshjoshi/Bella/tree/main/assets/videos
- **Description**: Demo videos and tutorials
- **Format**: MP4/WebM

## Installation Instructions

### Method 1: Manual Copy (Current Approach)
1. Visit each source file in the Bella repository
2. Copy raw content from GitHub Raw view
3. Create corresponding file in ai-influencer
4. Commit with appropriate semantic message

### Method 2: Git Submodule (Recommended for Production)
```bash
cd public/bella
git submodule add https://github.com/purvanshjoshi/Bella.git source
```
Then copy specific files to their respective directories.

### Method 3: Automated Script (For CI/CD)
```bash
#!/bin/bash
BELLA_REPO="https://raw.githubusercontent.com/purvanshjoshi/Bella/main"

# Copy core files
wget -O public/bella/core/simpleBellaAI.js "$BELLA_REPO/simpleBellaAI.js"
wget -O public/bella/services/cloudAPI.js "$BELLA_REPO/cloudAPI.js"

# Copy components
wget -O public/bella/components/chatInterfacejs "$BELLA_REPO/chatInterfacejs"

# Copy styles
wget -O public/bella/styles/chatStyles.css "$BELLA_REPO/chatStyles.css"
wget -O public/bella/styles/bellaMain.css "$BELLA_REPO/style.css"
```

## File Summary Table

| File | Category | Status | Size | Dependencies |
|------|----------|--------|------|______________|
| core.js | Core | ✅ Done | 11.1 KB | cloudAPI.js |
| simpleBellaAI.js | Core | ⏳ Pending | ~5 KB | None |
| chatInterfacejs | Components | ⏳ Pending | ~3 KB | core.js |
| bellaInteraction.js | Components | ⏳ Pending | ~2 KB | core.js |
| BellaWrapper.jsx | Components | ⏳ Pending | ~4 KB | React |
| bellaMain.css | Styles | ⏳ Pending | ~2 KB | None |
| chatStyles.css | Styles | ⏳ Pending | ~1.5 KB | None |
| cloudAPI.js | Services | ⏳ Pending | ~6 KB | axios |
| icons/* | Assets | ⏳ Pending | ~100 KB | None |
| videos/* | Assets | ⏳ Pending | ~500 MB | None |

## Integration Checklist

- [x] Create folder structure (`public/bella/*`)
- [x] Add core.js
- [ ] Add simpleBellaAI.js
- [ ] Add chat components
- [ ] Add styles
- [ ] Add cloudAPI.js
- [ ] Copy assets
- [ ] Update React components to import Bella
- [ ] Test Bella initialization
- [ ] Configure API keys
- [ ] Test chat functionality
- [ ] Deploy to production

## Next Steps

1. **Complete Core Files**: Copy simpleBellaAI.js and cloudAPI.js
2. **Add Components**: Integrate React components for chat UI
3. **Apply Styling**: Add CSS files for visual design
4. **Copy Assets**: Include icons and demo videos
5. **Update App Integration**: Connect Bella to main AI Influencer platform
6. **Testing**: Full integration and functionality testing

## References

- [Bella GitHub Repository](https://github.com/purvanshjoshi/Bella)
- [BELLA_FOLDER_STRUCTURE_GUIDE.md](../../BELLA_FOLDER_STRUCTURE_GUIDE.md)
- [AI Influencer Platform](../../README.md)

---

**Last Updated**: December 14, 2025  
**Next Review**: After all files are integrated
