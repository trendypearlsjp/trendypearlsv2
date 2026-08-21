# 🔄 Automatic Store Updates & Auto-Pull System

This directory manages the **Automatic Update System** for Trendy Pearls Boutique.

---

## ⚡ How Auto-Pull Works (Zero Reinstallation Needed!)

When your other team members or product managers update the catalog or store settings, **you DO NOT need to reinstall, re-download, or uninstall anything**. 

The system automatically syncs and pulls all new updates & product details:

1. **Automatic Pull on Admin Panel Open**:
   - Whenever anyone opens the Admin Section (`http://localhost:3000/admin` or runs `run_localhost.bat`), the local server automatically runs `git pull origin main` in the background.
   - All product updates, price changes, image uploads, and catalog details uploaded by the other team are pulled directly to your computer.

2. **Automatic Pull on Server Startup**:
   - When `admin_server.js` or `run_localhost.bat` is executed, it checks GitHub and pulls the latest code and product catalog before opening the browser.

3. **1-Click Manual Pull**:
   - Inside the Admin Dashboard header, click the **`PULL LATEST UPDATES`** button anytime to instantly sync.
   - Alternatively, double-click **`auto_update/pull_latest.bat`** in this directory to manually fetch all changes with 1 click.

---

## 📁 Directory Files

- **`pull_latest.bat`**: Double-click this script anytime to manually pull all latest store updates and product details from GitHub.
- **`README.md`**: Technical overview of the auto-sync & auto-pull engine.

---

## 🛠️ Troubleshoot & FAQs

**Q: Do I ever need to uninstall or reinstall this project when the team makes big changes?**  
**A: NO.** The auto-pull engine keeps your local project 100% updated automatically. Just open the admin section or run `run_localhost.bat`.

**Q: What if I modified `products.xlsx` locally while another team pushed changes?**  
**A: Git auto-merges the product updates.** If there is a conflict, clicking **`Publish to Live GitHub`** in the Admin panel will push the latest combined version automatically.
