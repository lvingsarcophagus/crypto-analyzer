import re
from playwright.sync_api import sync_playwright, Page, expect

def run_verification(page: Page):
    print("Navigating to the analysis page...")
    page.goto("http://localhost:3001/analysis")

    expect(page.get_by_role("heading", name="Comprehensive Crypto Risk Analysis")).to_be_visible()

    print("Filling out the analysis form for Uniswap...")
    page.get_by_label("Token Symbol").fill("uniswap")

    print("Submitting the form...")
    page.get_by_role("button", name="Run Advanced Analysis").click()

    print("Waiting for results to appear on the same page...")
    # Wait for the results to appear by looking for the new heading
    expect(page.get_by_role("heading", name=re.compile("Uniswap \\(UNI\\)"))).to_be_visible(timeout=60000)

    # Also wait for a key part of the results view
    expect(page.get_by_text("Overall Risk Assessment")).to_be_visible()

    print("Taking a screenshot of the integrated results view...")
    page.screenshot(path="jules-scratch/verification/single_page_results.png", full_page=True)
    print("Screenshot saved.")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        run_verification(page)
        browser.close()

if __name__ == "__main__":
    main()
