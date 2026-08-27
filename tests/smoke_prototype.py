from pathlib import Path

from playwright.sync_api import expect, sync_playwright


BASE_URL = "http://127.0.0.1:4321/"
SCREENSHOT = Path("test-results/prototype-home.png")


def main():
    SCREENSHOT.parent.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 1100})
        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")

        expect(page.get_by_role("heading", name="Tell us the issue. We will find the right office.")).to_be_visible()
        expect(page.get_by_role("heading", name="Recommended route")).to_be_visible()

        page.get_by_role("button", name="Try rail refund").click()
        expect(page.get_by_text("Northern Railway Refunds")).to_be_visible()

        page.get_by_role("button", name="Confirm and file").click()
        expect(page.get_by_text("Filing submitted")).to_be_visible()
        expect(page.get_by_text("Your filing was submitted")).to_be_visible()

        page.get_by_label("Switch demo role").select_option("officer")
        expect(page.get_by_role("heading", name="Confirm routes, request details, and move cases forward.")).to_be_visible()

        page.get_by_role("button", name="Ask for clarification").click()
        expect(page.get_by_text("Clarification requested")).to_be_visible()
        expect(page.get_by_text("More information is needed")).to_be_visible()

        page.screenshot(path=str(SCREENSHOT), full_page=True)
        browser.close()


if __name__ == "__main__":
    main()
