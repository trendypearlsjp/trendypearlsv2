# 🛍️ WeTrail Boutique - 1-Click Excel-Driven Storefront

Welcome to your cost-free, high-performance static boutique storefront! Managing your store requires **zero coding** and **zero monthly backend/database fees**.

---

## 🚀 How to Manage Your Store in 3 Easy Steps

### 1. Edit Your Products in Excel
Open **`products.xlsx`** directly in Microsoft Excel (all columns are wide & pre-formatted so text is never cut off!).
Edit or add rows with the following columns:
- **Product Code**: Unique SKU/Code (Optional — auto-generated if left blank!)
- **Product Name**: Name of item (e.g., `Royal Kundan Choker Set`)
- **Category**: `Ladies Wear`, `Jewelry`, `Bags`, `Kids Wear`, or `Accessories`
- **Price**: Selling Price (e.g. `1899`)
- **Original Price**: MRP before discount (e.g. `2999`)
- **Stock Status**: `In Stock`, `Out of Stock`, or `Sold Out`
- **Image 1**, **Image 2**, **Image 3**: Photo filenames in `images/` folder
- **Description**: Product features & material details
- **Featured**: `Yes` to highlight on homepage, or `No`

### 2. Add Product Photos
Place product photos into the `images/` (or `raw_images/`) folder. Make sure the filename matches what you typed in the `Image File Name` column in Excel.

### 3. Double-Click `update_store.bat`
Double-click `update_store.bat` in this folder. It will automatically:
1. Sync your Excel spreadsheet.
2. Optimize data.
3. Run `git push` to publish your updates live to Vercel / GitHub Pages in seconds!

---

## 📱 How to Change Your WhatsApp Number
Open `app.js` in Notepad or VS Code and change line 6:
```javascript
whatsappNumber: "919876543210", // Replace with your country code + phone number
```
Also update the phone number in `index.html` line 20: `wa.me/919876543210`.

---

## 🌐 Free Hosting on Vercel / GitHub Pages

### Initial 1-Time Setup to Connect Git & Vercel:
1. Initialize Git in this folder (if not done already):
   ```bash
   git init
   git add .
   git commit -m "Initial store creation"
   ```
2. Create a new repository on [GitHub.com](https://github.com) named `wetrail-boutique`.
3. Connect local git to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/wetrail-boutique.git
   git branch -M main
   git push -u origin main
   ```
4. Import repo on [Vercel.com](https://vercel.com) — it will automatically deploy your live store URL!

From then on, whenever you run `update_store.bat`, your website updates automatically!
