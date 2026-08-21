# How to Add & Manage Products and Images

Follow these 3 easy steps to add new products or update photos in your store:

---

### Step 1: Add New Product Photos
1. Take your product photos from your phone/camera.
2. Paste/drop the image files into the **`raw_images`** folder (or **`images`** folder).
   *Example filenames: `saree_blue.jpg`, `jhumka_gold.jpeg`*

---

### Step 2: Edit `products.xlsx` Spreadsheet
1. Open **`products.xlsx`** in Microsoft Excel.
2. Add a new row at the bottom with your product details:
   - **Product Code**: e.g., `LW-19` or `JW-20` (or leave blank to auto-generate)
   - **Product Name**: e.g., `Royal Silk Saree`
   - **Category**: Enter `Ladies Wear`, `Mens Wear`, `Kids Wear`, or `Jewellery`
   - **Price**: Selling price (e.g., `85`)
   - **Original Price**: Price before discount (e.g., `120`)
   - **Image 1**: Enter the exact photo filename from Step 1 (e.g., `saree_blue.jpg`)
   - **Stock Status**: `In Stock`, `Limited Stock`, or `Sold Out`
   - **Description**: Add item details, size, material, etc.
3. Save and close `products.xlsx`.

---

### Step 3: Double-Click `update_store.bat`
1. Double-click **`update_store.bat`**.
2. It automatically:
   - Copies photos from `raw_images/` to `images/`.
   - Syncs your `products.xlsx` into the website data.
   - Pushes all updates live to GitHub!
3. Open `http://localhost:3000` (or your live website) and refresh to see your new product live!
