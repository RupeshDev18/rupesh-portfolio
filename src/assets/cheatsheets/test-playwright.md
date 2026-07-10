# Testing & Playwright Complete Cheatsheet

> In-depth guide to modern testing strategies, covering Unit, Integration, and End-to-End (E2E) testing with a primary focus on Playwright. Updated for Playwright 1.45+.

---

## Table of Contents
01. The Testing Pyramid
02. Unit Testing Fundamentals
03. Playwright Core Concepts
04. Locators & Selector Best Practices
05. Actions & Interactions
06. Assertions & Auto-Waiting
07. Page Object Model (POM)
08. Authentication & Session Sharing
09. API Testing & Mocking Network Traffic
15. Debugging & Tools (Codegen, Trace Viewer)
11. Parallel Execution & CI/CD Integration
12. Best Practices & Common Gotchas

---

## 01. The Testing Pyramid

Testing is about trade-offs: speed, cost, and confidence. The testing pyramid organizes tests into three distinct layers to optimize this trade-off.

```
      /\
     /  \     E2E (Playwright) — High Confidence, Slow, Expensive
    /----\
   /      \   Integration (Component) — Medium Confidence, Medium Speed
  /--------\
 /          \ Unit (Jest/Vitest) — Fast, Cheap, Low Scope
/------------\
```

| Test Type | Speed | cost to Run | Isolation | Confidence | Main Tools |
|---|---|---|---|---|---|
| **Unit** | Extremely Fast (< 10ms) | Low | High (Mocks dependencies) | Low (Only tests isolation) | Jest, Vitest, Mocha |
| **Integration** | Medium (50ms - 500ms) | Medium | Medium (Tests modules together) | Medium | React Testing Library, Vitest |
| **E2E** | Slow (Seconds) | High | Low (Tests full real system) | Extremely High | Playwright, Cypress |

### Core Philosophy
*   **Unit Tests:** Test individual functions, hooks, or classes. They are cheap, so write many of them.
*   **Integration Tests:** Test how multiple parts of the system interact (e.g., a component and a helper, or database transactions).
*   **End-to-End (E2E) Tests:** Run against a deployed version of your app. They control a real browser, click elements, fill inputs, and query real databases/APIs to simulate exact user paths.

---

## 02. Unit Testing Fundamentals

Unit tests verify that a single block of code (usually a pure function) returns the expected output for a given input.

### 2.1 The AAA Pattern
Every unit test should follow the **Arrange-Act-Assert** pattern to stay readable:
1.  **Arrange:** Set up the test data, mocks, and environment.
2.  **Act:** Execute the function or code block being tested.
3.  **Assert:** Compare the actual result against the expected outcome.

```js
// Example using Vitest / Jest
test('calculates discount correctly', () => {
  // 1. Arrange
  const price = 100;
  const discount = 0.2; // 20%
  
  // 2. Act
  const finalPrice = calculateDiscount(price, discount);
  
  // 3. Assert
  expect(finalPrice).toBe(80);
});
```

### 2.2 Mocks, Stubs, and Spies
*   **Mock:** A fake dependency programmed with expectations (e.g., mock an API response helper so it doesn't hit a real server).
*   **Stub:** A fake object that returns hardcoded values to satisfy a dependency interface.
*   **Spy:** A wrapper around a real function that records how it was called (arguments, how many times, return values) without changing its behavior.

```js
// Spying and Mocking with Vitest
import { vi, test, expect } from 'vitest';

test('calls tracking service', () => {
  const spy = vi.spyOn(console, 'log');
  
  logUserAction('login');
  
  expect(spy).toHaveBeenCalledWith('User action: login');
  spy.mockRestore(); // Restore original function
});
```

---

## 03. Playwright Core Concepts

Playwright executes E2E tests by directly controlling browser engines (Chromium, Firefox, WebKit) via the DevTools protocol. Unlike older Selenium setups, it does not rely on browser drivers, making it significantly faster and less flaky.

### 3.1 Architecture Overview
*   **Playwright Library:** Node.js package that sends commands.
*   **Browser:** The browser process (Chromium, WebKit, Firefox).
*   **BrowserContext:** An isolated, incognito-like session within the browser. Contexts are extremely cheap to create, allowing you to run each test in its own completely clean state.
*   **Page:** A single tab or window within a BrowserContext.

### 3.2 Basic Configuration (`playwright.config.js`)
The configuration file directs how tests run, including concurrency, browsers, base URLs, and test reporting.

```js
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true, // Run tests in parallel across worker processes
  forbidOnly: !!process.env.CI, // Fails build if test.only is left in code on CI
  retries: process.env.CI ? 2 : 0, // Retry failed tests on CI to handle flakiness
  workers: process.env.CI ? 1 : undefined, // Limit workers on CI
  reporter: 'html', // Generate readable HTML reports
  use: {
    baseURL: 'http://localhost:3000', // Base URL for navigate calls
    trace: 'on-first-retry', // Collect diagnostic traces only on retry
    screenshot: 'only-on-failure', // Take screenshots on failure
    video: 'retain-on-failure', // Record videos on failure
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
```

---

## 04. Locators & Selector Best Practices

Locators are Playwright's primary mechanism to find elements on the page. They have built-in **auto-waiting** and **retryability**, making tests highly stable.

### 4.1 Recommended Role Locators
Always prefer **ARIA role locators** over CSS selectors. They mimic how assistive technologies (like screen readers) interpret the page, ensuring accessibility.

```js
// Locating by accessible role (Highly Recommended)
await page.getByRole('button', { name: /submit/i }).click();
await page.getByRole('textbox', { name: 'Email Address' }).fill('user@example.com');
await page.getByRole('heading', { name: 'Welcome Back' }).waitFor();
```

### 4.2 Other Built-in Locators
If role selectors aren't practical, use these built-in locators:

```js
// Locate by label text
await page.getByLabel('Accept terms and conditions').check();

// Locate by placeholder text
await page.getByPlaceholder('Search products...').fill('laptop');

// Locate by exact visible text
await page.getByText('Transaction Successful').waitFor();

// Locate by test ID (data-testid attribute on the HTML element)
await page.getByTestId('cart-total-badge').click();
```

### 4.3 Selector Hierarchy (Worst to Best)
1.  **XPath / Full CSS paths (Worst):** `page.locator('div > ul > li:nth-child(3) > a')` — Extremely fragile. Any markup changes will break the test.
2.  **CSS Classes:** `page.locator('.btn-submit')` — Bad. Classes change during design updates.
3.  **Visible Text:** `page.getByText('Delete')` — Better. But can break on internationalization/translation changes.
4.  **Accessible Role (Best):** `page.getByRole('button', { name: 'Delete' })` — Best. Verifies that the element behaves and looks like a button to standard users.
5.  **Test ID (Best for non-semantic elements):** `page.getByTestId('canvas-wrapper')` — Excellent for dynamic charts, canvases, or interactive regions that lack specific ARIA roles.

---

## 05. Actions & Interactions

Actions perform the operations a real user would execute on a page. Playwright auto-waits for elements to become visible, enabled, and stable before acting.

### 5.1 Text Entry & Mouse Clicks
```js
// Text entry (fills inputs, triggers input/change events)
await page.getByRole('textbox').fill('hello world');

// Clear input
await page.getByRole('textbox').clear();

// Clicks
await page.getByRole('button', { name: 'Click Me' }).click(); // Left click
await page.getByRole('button').click({ button: 'right' });    // Right click
await page.getByRole('button').dblclick();                    // Double click
await page.getByRole('button').click({ modifiers: ['Shift'] }); // Shift + Click
```

### 5.2 Selecting Options & Checkboxes
```js
// Check and uncheck checkboxes or radio buttons
await page.getByLabel('Subscribe to newsletter').check();
await page.getByLabel('Subscribe to newsletter').uncheck();

// Select items from a drop-down menu
await page.getByRole('combobox').selectOption('value-2'); // select by value
await page.getByRole('combobox').selectOption({ label: 'Option Two' }); // select by label
```

### 5.3 Pressing Keys & Focused Interactions
```js
// Focus an element
await page.getByRole('textbox').focus();

// Press a key sequence (e.g. submit form via Enter)
await page.keyboard.press('Enter');

// Press key combinations
await page.keyboard.press('Control+KeyA');
await page.keyboard.press('Backspace');
```

---

## 06. Assertions & Auto-Waiting

Playwright uses **Web Assertions** which automatically wait and retry checking the page until the expectation is met or a timeout occurs (default is 5 seconds).

### 6.1 Basic Assertions

| Assertion | Checks |
|---|---|
| `await expect(locator).toBeVisible()` | Element is visible on screen |
| `await expect(locator).toBeEnabled()` | Element is not disabled |
| `await expect(locator).toBeChecked()` | Checkbox/Radio is checked |
| `await expect(locator).toContainText('abc')` | Element's text contains substring |
| `await expect(locator).toHaveValue('abc')` | Input element contains value |
| `await expect(locator).toHaveCount(3)` | List selector has exactly N matches |
| `await expect(page).toHaveURL(/dashboard/)` | Page URL matches pattern |
| `await expect(page).toHaveTitle('Dashboard')` | Tab title matches string |

```js
// Usage example
const successAlert = page.getByRole('alert');
await expect(successAlert).toBeVisible();
await expect(successAlert).toContainText('Successfully saved!');
```

### 6.2 Customizing Assertions & Timeouts
Sometimes an element takes longer to load (e.g., an export file generation). You can adjust the timeout per assertion:

```js
// Wait up to 15 seconds for a specific element
await expect(page.getByText('Report Generated')).toBeVisible({ timeout: 15000 });

// Negating assertions (use the .not modifier)
await expect(page.getByRole('progressbar')).not.toBeVisible();
```

---

## 07. Page Object Model (POM)

The **Page Object Model** is a design pattern used to encapsulate the layout and selectors of a page into a reusable class. This isolates the test code from layout changes.

### 7.1 Creating a Page Object Class
```js
// pages/LoginPage.js
export class LoginPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.emailInput = page.getByRole('textbox', { name: 'email' });
    this.passwordInput = page.getByRole('textbox', { name: 'password' });
    this.submitButton = page.getByRole('button', { name: /login/i });
    this.errorMessage = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
```

### 7.2 Writing Tests Using the POM
```js
// tests/login.spec.js
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('displays error message on invalid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);
  
  await loginPage.goto();
  await loginPage.login('wrong@example.com', 'badpassword');
  
  await expect(loginPage.errorMessage).toBeVisible();
  await expect(loginPage.errorMessage).toContainText('Invalid credentials');
});
```

---

## 08. Authentication & Session Sharing

Logging in at the start of every single E2E test introduces massive overhead and slows execution. Playwright allows you to save and share the authentication state (cookies and localStorage) across tests.

### 8.1 Setup Global Auth in Config
1.  Define a setup project in `playwright.config.js` to execute auth once.
2.  Save the session to a storage file.
3.  Inject the session automatically into other tests.

```js
// playwright.config.js
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    // 1. Setup project
    {
      name: 'setup',
      testMatch: /global\.setup\.js/,
    },
    // 2. Main tests project depending on setup
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Tell pages to load stored session cookies/localStorage
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
});
```

### 8.2 Create Global Setup Test
```js
// tests/global.setup.js
import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate user', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('textbox', { name: 'email' }).fill('admin@example.com');
  await page.getByRole('textbox', { name: 'password' }).fill('adminpassword');
  await page.getByRole('button', { name: /login/i }).click();

  // Verify login succeeded before saving state
  await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();

  // Save cookies and localStorage to file
  await page.context().storageState({ path: authFile });
});
```

---

## 9. API Testing & Mocking Network Traffic

Playwright allows you to intercept and modify network calls made by the browser, enabling fast E2E testing even when backend services are down or slow.

### 9.1 Mocking API Calls (`route`)
You can intercept an API request matching a pattern and fulfill it with mock data immediately, avoiding any network calls.

```js
test('mocks user settings load', async ({ page }) => {
  // Intercept GET requests matching user settings endpoint
  await page.route('/api/user/settings', async (route) => {
    const json = { theme: 'dark', notificationsEnabled: true };
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(json),
    });
  });

  await page.goto('/settings');
  // Verify UI displays the mocked configuration
  await expect(page.getByLabel('Dark Mode')).toBeChecked();
});
```

### 9.2 API Testing Directly
Playwright has a built-in request context, allowing you to run backend API integration tests without launching a browser.

```js
import { test, expect } from '@playwright/test';

test('creates a user via API request', async ({ request }) => {
  const newUser = await request.post('/api/users', {
    data: {
      name: 'Jane Doe',
      email: 'jane@example.com',
    },
  });

  expect(newUser.status()).toBe(201);
  const responseBody = await newUser.json();
  expect(responseBody.id).toBeDefined();
});
```

---

## 10. Debugging & Tools

Debugging E2E tests can be difficult since failures happen inside browser execution paths. Playwright provides tools to make debugging visual and step-by-step.

### 10.1 UI Mode & Trace Viewer
*   **UI Mode (`npx playwright test --ui`):** A visual desktop app showing a list of all tests, letting you inspect step-by-step DOM snapshots at each locator action.
*   **Trace Viewer (`npx playwright show-trace trace.zip`):** Records test runs on CI. You can step through locators, check network calls, read console logs, and hover over DOM screenshots from the moment the test failed.

### 10.2 Playwright Codegen (Record Tests)
Codegen launches a browser window alongside a code generator. As you click and navigate on screen, Playwright automatically generates clean, resilient selectors in your code file.

```bash
npx playwright codegen http://localhost:3000
```

### 10.3 Debug Commands
```bash
# Debug a specific spec file in windowed headful mode
npx playwright test tests/login.spec.js --debug

# Run tests in headful mode (watch the browser open and execute)
npx playwright test --headed
```

---

## 11. Parallel Execution & CI/CD Integration

### 11.1 Sharding Tests
Sharding distributes tests across multiple CI servers/containers, cutting E2E test suite execution time significantly.

```bash
# Split test suite into 3 buckets and run the first bucket
npx playwright test --shard=1/3

# Run the second bucket
npx playwright test --shard=2/3
```

### 11.2 GitHub Actions Workflow Example
A robust configuration to run Playwright tests on every push/Pull Request, maintaining high deployment safety.

```yaml
# .github/workflows/playwright.yml
name: Playwright Tests
on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: 18
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Install Playwright Browsers
      run: npx playwright install --with-deps
      
    - name: Run Playwright tests
      run: npx playwright test
      
    # Save traces and reports on failures
    - uses: actions/upload-artifact@v4
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30
```

---

## 12. Best Practices & Common Gotchas

### ⚠️ Never Use Arbitrary Waits (`page.waitForTimeout`)
Never add fixed sleep timers like `await page.waitForTimeout(3000)`. It slows down execution.
*   If an action takes time, wait for a specific element state instead:
    ```js
    // ✅ Good: waits dynamically up to default/custom timeout
    await page.getByRole('button', { name: 'Save' }).waitFor({ state: 'attached' });
    ```

### ⚠️ Run Each Test Independently
Do not chain tests together (e.g., Test 2 expecting Test 1's browser page state). Tests should be runnable in isolation and parallel:
*   Use `storageState` for auth instead of manually logging in.
*   Clean databases or set up mock states in `beforeEach` hooks.

### ⚠️ Avoid Over-Mocking
Mocking external payments is essential, but mocking all backend APIs in E2E tests defeats their purpose (which is to verify the entire system works together). Maintain a balanced ratio of mock-based integration tests and pure, unmocked E2E tests.
