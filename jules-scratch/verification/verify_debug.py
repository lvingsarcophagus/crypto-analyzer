from playwright.sync_api import sync_playwright, Page, expect

def run_debug_verification(page: Page):
    print("Navigating to the simplified analysis page...")
    page.goto("http://localhost:3001/analysis")
    expect(page.get_by_role("heading", name="Analysis Page Works")).to_be_visible()
    print("Simplified page loaded successfully!")
    page.screenshot(path="jules-scratch/verification/debug_screenshot.png")
    print("Debug screenshot saved.")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        run_debug_verification(page)
        browser.close()

if __name__ == "__main__":
    main()
