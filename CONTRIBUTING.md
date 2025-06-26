# 🤝 Contributing to Smart Home Automation

Thank you for your interest in contributing to our Smart Home Automation project! We welcome contributions from developers of all skill levels and backgrounds.

## 📋 **Table of Contents**
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contribution Types](#contribution-types)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Community Guidelines](#community-guidelines)

---

## 📜 **Code of Conduct**

This project adheres to our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [conduct@smarthome.com](mailto:conduct@smarthome.com).

---

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18.0 or higher
- Git version control
- Basic knowledge of React/Next.js
- TypeScript familiarity (preferred)
- Understanding of Tailwind CSS

### **First-Time Contributors**
1. **Star the repository** ⭐
2. **Fork the repository** to your GitHub account
3. **Clone your fork** locally
4. **Set up the development environment**
5. **Find a good first issue** labeled `good-first-issue`
6. **Make your contribution**
7. **Submit a pull request**

---

## 🛠️ **Development Setup**

### **1. Fork and Clone**
```bash
# Fork the repository on GitHub first
git clone https://github.com/Neerajupadhayay2004/smart-home-automation.git
cd smart-home-automation

# Add upstream remote
git remote add upstream https://github.com/Neerajupadhayay2004/smart-home-automation.git
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Environment Configuration**
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your configuration
```

### **4. Start Development Server**
```bash
npm run dev
```

### **5. Verify Setup**
- Open http://localhost:3000
- Login with demo credentials
- Check that all features work correctly

---

## 🎯 **Contribution Types**

### **🐛 Bug Fixes**
- Fix existing functionality issues
- Resolve UI/UX problems
- Correct TypeScript errors
- Address performance issues

### **✨ New Features**
- Add new smart home integrations
- Implement AI improvements
- Create new UI components
- Enhance user experience

### **📚 Documentation**
- Improve README files
- Add code comments
- Create tutorials
- Update API documentation

### **🧪 Testing**
- Write unit tests
- Add integration tests
- Improve test coverage
- Create E2E tests

### **🎨 Design & UI**
- Improve visual design
- Enhance animations
- Create new themes
- Optimize mobile experience

### **⚡ Performance**
- Optimize bundle size
- Improve loading times
- Enhance memory usage
- Reduce API calls

---

## 🔄 **Pull Request Process**

### **1. Preparation**
```bash
# Update your fork
git checkout main
git pull upstream main
git push origin main

# Create feature branch
git checkout -b feature/your-feature-name
```

### **2. Development**
- Make your changes
- Follow coding standards
- Write/update tests
- Update documentation
- Test thoroughly

### **3. Commit Guidelines**
```bash
# Use conventional commits
git commit -m "feat: add voice control for lights"
git commit -m "fix: resolve authentication timeout issue"
git commit -m "docs: update installation guide"
```

**Commit Types:**
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Maintenance tasks

### **4. Pre-submission Checklist**
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] No merge conflicts
- [ ] Screenshots included (for UI changes)

### **5. Submit Pull Request**
```bash
# Push your branch
git push origin feature/your-feature-name

# Create PR on GitHub with:
# - Clear title and description
# - Screenshots (if applicable)
# - Testing instructions
# - Related issue references
```

### **6. PR Template**
```markdown
## 📝 Description
Brief description of changes made.

## 🎯 Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## 🧪 Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Cross-browser testing done

## 📸 Screenshots
Add screenshots for UI changes.

## 📚 Documentation
- [ ] README updated
- [ ] Code comments added
- [ ] API docs updated

## ✅ Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] No merge conflicts
- [ ] Assignees added
```

---

## 💻 **Coding Standards**

### **TypeScript Guidelines**
```typescript
// Use proper typing
interface DeviceConfig {
  id: string;
  name: string;
  type: DeviceType;
  isActive: boolean;
}

// Prefer const assertions
const DEVICE_TYPES = ['light', 'lock', 'camera'] as const;
type DeviceType = typeof DEVICE_TYPES[number];

// Use proper error handling
try {
  const result = await deviceService.toggle(deviceId);
  return { success: true, data: result };
} catch (error) {
  console.error('Device toggle failed:', error);
  return { success: false, error: error.message };
}
```

### **React Component Standards**
```typescript
// Use functional components with hooks
interface Props {
  device: Device;
  onToggle: (id: string) => void;
}

export const DeviceCard: React.FC<Props> = ({ device, onToggle }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = useCallback(async () => {
    setIsLoading(true);
    try {
      await onToggle(device.id);
    } finally {
      setIsLoading(false);
    }
  }, [device.id, onToggle]);

  return (
    <div className="device-card">
      {/* Component content */}
    </div>
  );
};
```

### **CSS/Tailwind Standards**
```tsx
// Use Tailwind utilities consistently
<div className="flex items-center justify-between p-4 bg-gray-900/50 backdrop-blur-md rounded-lg border border-gray-700/50">
  <h3 className="text-lg font-semibold text-white">Device Name</h3>
  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 transition-colors rounded-md text-white font-medium">
    Toggle
  </button>
</div>

// Custom CSS for complex animations
.floating-animation {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}
```

### **File Organization**
```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   ├── layout/       # Layout components
│   └── features/     # Feature-specific components
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
├── types/            # TypeScript type definitions
├── styles/           # Global styles
└── utils/            # Helper functions
```

---

## 🧪 **Testing Guidelines**

### **Unit Tests**
```typescript
// components/__tests__/DeviceCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { DeviceCard } from '../DeviceCard';

describe('DeviceCard', () => {
  const mockDevice = {
    id: '1',
    name: 'Living Room Light',
    type: 'light',
    isActive: false
  };

  it('renders device information correctly', () => {
    render(<DeviceCard device={mockDevice} onToggle={jest.fn()} />);
    
    expect(screen.getByText('Living Room Light')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls onToggle when button is clicked', () => {
    const onToggle = jest.fn();
    render(<DeviceCard device={mockDevice} onToggle={onToggle} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledWith('1');
  });
});
```

### **Integration Tests**
```typescript
// __tests__/api/devices.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '../../pages/api/devices';

describe('/api/devices', () => {
  it('returns device list', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    
    await handler(req, res);
    
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toHaveProperty('devices');
  });
});
```

### **Running Tests**
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- DeviceCard.test.tsx
```

---

## 📚 **Documentation Standards**

### **Code Comments**
```typescript
/**
 * Toggles a device on/off and updates the UI state
 * @param deviceId - Unique identifier for the device
 * @param newState - Desired state (true = on, false = off)
 * @returns Promise resolving to the updated device state
 */
export async function toggleDevice(deviceId: string, newState: boolean): Promise<Device> {
  // Implementation
}
```

### **README Updates**
- Update features list for new functionality
- Add screenshots for UI changes
- Include setup instructions for new dependencies
- Update troubleshooting section as needed

### **API Documentation**
```typescript
/**
 * @api {post} /api/devices/:id/toggle Toggle Device
 * @apiName ToggleDevice
 * @apiGroup Devices
 *
 * @apiParam {String} id Device unique ID
 * @apiParam {Boolean} state Desired device state
 *
 * @apiSuccess {Object} device Updated device object
 * @apiSuccess {String} device.id Device ID
 * @apiSuccess {Boolean} device.isActive Current state
 *
 * @apiError {Object} error Error details
 * @apiError {String} error.message Error description
 */
```

---

## 🏆 **Recognition**

### **Contributor Levels**
- **🌟 First-time Contributor**: Made your first PR
- **🚀 Regular Contributor**: 5+ merged PRs
- **💎 Core Contributor**: 20+ merged PRs
- **👑 Maintainer**: Trusted with repository access

### **Monthly Recognition**
- Top contributors featured in release notes
- Special mentions in project README
- Contributor spotlight on social media
- Access to exclusive contributor Discord channel

---

## 📞 **Getting Help**

### **Communication Channels**
- **💬 Discord**: [Join our community](https://discord.gg/smarthome)
- **📧 Email**: [contributors@smarthome.com](mailto:contributors@smarthome.com)
- **🐛 Issues**: [GitHub Issues](https://github.com/yourusername/smart-home-automation/issues)
- **💡 Discussions**: [GitHub Discussions](https://github.com/yourusername/smart-home-automation/discussions)

### **Office Hours**
Join our weekly contributor office hours:
- **When**: Every Friday 3:00 PM UTC
- **Where**: Discord voice channel
- **What**: Q&A, code reviews, feature planning

---

## 🎯 **Current Priorities**

### **High Priority**
- [ ] Mobile app development
- [ ] Third-party device integrations
- [ ] Performance optimizations
- [ ] Advanced AI features

### **Medium Priority**
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Cloud sync capabilities
- [ ] Enhanced security features

### **Low Priority**
- [ ] AR/VR integration
- [ ] Blockchain features
- [ ] Advanced themes
- [ ] Community plugins

---

## 📋 **Issue Labels**

- `good-first-issue`: Perfect for new contributors
- `help-wanted`: Community help needed
- `bug`: Something isn't working
- `enhancement`: New feature request
- `documentation`: Documentation improvements
- `performance`: Performance related
- `security`: Security improvements
- `ui/ux`: User interface changes
- `ai/ml`: AI/ML related features
- `mobile`: Mobile-specific issues
- `priority-high`: High priority issues
- `priority-medium`: Medium priority issues
- `priority-low`: Low priority issues

---

**Thank you for contributing to Smart Home Automation! 🙏**

Your contributions help make smart home technology accessible to everyone. Together, we're building the future of home automation!
