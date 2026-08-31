# 📊 How to Connect Your Google Sheet for Direct Order Auto-Sync

Even if a customer **forgets to send their receipt to WhatsApp**, every single order detail automatically streams directly into your **Google Sheet** in real-time as a new row!

---

## 🚀 2-Minute Google Sheet Web App Deployment (Zero Extensions Required)

### Step 1: Create Your Google Sheet
1. Open [Google Sheets](https://sheets.google.com) and create a **Blank Spreadsheet**.
2. Name it **Trendy Pearls Website Orders**.
3. In Row 1, add these column headers:
   - **Column A**: `Order ID`
   - **Column B**: `Date & Time`
   - **Column C**: `Customer Name`
   - **Column D**: `Customer Phone`
   - **Column E**: `Shipping Address`
   - **Column F**: `Order Items & Details`
   - **Column G**: `Total Amount`

---

### Step 2: Add Google Apps Script (Copy & Paste Code)
1. Click **Extensions** in the top menu -> select **Apps Script**.
2. Delete any code in the editor and **paste this exact code**:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    sheet.appendRow([
      data.orderId || '',
      data.date || new Date().toLocaleString(),
      data.customerName || '',
      data.customerPhone || '',
      data.customerAddress || '',
      data.orderDetails || '',
      data.totalAmount || ''
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ "status": "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

---

### Step 3: Deploy as Web App & Copy URL
1. Click the blue **Deploy** button at top-right -> select **New deployment**.
2. Click the ⚙️ gear icon next to "Select type" -> choose **Web app**.
3. Configure settings:
   - **Description**: `Trendy Pearls Web App Sync`
   - **Execute as**: `Me (your email)`
   - **Who has access**: `Anyone` *(Crucial so your website can send orders!)*
4. Click **Deploy** (Authorize access if prompted by Google).
5. Copy your **Web App URL** (e.g. `https://script.google.com/macros/s/AKfycb.../exec`).

---

### Step 4: Paste Web App URL in `app.js`
Open **`app.js`** line 32 and paste your Web App URL:

```javascript
const CONFIG = {
    whatsappNumber: "61461522439",
    currency: "A$",
    itemsPerPage: 24,
    googleSheetUrl: "https://script.google.com/macros/s/YOUR_COPIED_URL_HERE/exec"
};
```

---

### ✅ Result
Every order submitted on your store will instantly pop up as a clean, structured row in your Google Sheet spreadsheet in real time!
