import re
from playwright.sync_api import sync_playwright, Page, expect

def run_verification(page: Page):
    print("Navigating to the new overview page...")
    page.goto("http://localhost:3001/overview")

    print("Waiting for the dashboard elements to load...")
    expect(page.get_by_role("heading", name="Crypto Market Overview")).to_be_visible()
    expect(page.get_by_text("Total Market Cap")).to_be_visible(timeout=15000)

    print("Taking screenshot of the initial overview page...")
    page.screenshot(path="jules-scratch/verification/overview_page.png", full_page=True)
    print("Initial screenshot saved.")

    print("Filling out the analysis form for Uniswap...")
    page.get_by_label("Token Symbol").fill("uniswap")

    print("Submitting the form...")
    page.get_by_role("button", name="Run Advanced Analysis").click()

    print("Waiting for results to appear on the same page...")
    expect(page.get_by_role("heading", name=re.compile("Uniswap \\(UNI\\)"))).to_be_visible(timeout=60000)
    expect(page.get_by_text("Overall Risk Assessment")).to_be_visible()

    print("Taking a screenshot of the integrated results view...")
    page.screenshot(path="jules-scratch/verification/overview_with_results.png", full_page=True)
    print("Results screenshot saved.")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        run_verification(page)
        browser.close()

if __name__ == "__main__":
    main()
