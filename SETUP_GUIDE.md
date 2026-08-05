# Trendy Pearls Boutique - Multi-Laptop & GitHub Setup Guide

This guide explains how to set up, test locally, and update your store on any Windows 10 laptop using 3 simple batch files.

---

## 1. Initial 1-Click Package Setup (`install_packages.bat`)

When opening this project folder on a fresh laptop for the first time:
1. Double-click **`install_packages.bat`**.
2. It automatically installs all required project packages (`xlsx`, `serve`, etc.) from the internet into your folder.

---

## 2. How to Run Localhost on Any Laptop (`run_localhost.bat`)

1. **Double-click `run_localhost.bat`**:
   - It automatically launches `http://localhost:3000` in your default web browser.
   - You can browse products, test categories, and inspect your shop locally with 0 delay!

---

## 3. How to Update & Push Products to GitHub (`update_store.bat`)

1. Edit your product catalog spreadsheet in `products.xlsx` (or place new photos in `raw_images/`).
2. **Double-click `update_store.bat`**:
   - It converts `products.xlsx` into `data/products.json` & `data/products.js`.
   - It commits and pushes your updates directly to the live GitHub repository (`main` branch).

---

## 4. Connecting GitHub on a Second Laptop or Different Account

If you move this project folder to another laptop (or sign in with a different GitHub account):

### Method A: Automatic Login Prompt (Windows Git Credential Manager)
When you run `update_store.bat` for the first time on a new laptop, Windows Git Credential Manager will pop up a browser window asking you to authorize access to `github.com/trendypearlsjp/trendypearlsv2`.

### Method B: Using Personal Access Token (1-Line Permanent Setup)
If the new laptop uses a different GitHub account, open **Command Prompt** in the project folder and run:

```cmd
git remote set-url origin https://YOUR_GITHUB_TOKEN@github.com/trendypearlsjp/trendypearlsv2.git
```
*(Replace `YOUR_GITHUB_TOKEN` with a GitHub Personal Access Token generated from GitHub Settings -> Developer Settings -> Personal Access Tokens).*

Once set, `update_store.bat` will push automatically without asking for login passwords ever again!
