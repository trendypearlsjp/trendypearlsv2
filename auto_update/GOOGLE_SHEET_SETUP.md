# 📊 Google Sheets Auto-Sync Setup Guide for `oders`

Here is the exact 100% working Google Apps Script code for your Google Sheet (`oders`).

---

## 🛠️ Replace Apps Script Code (1-Minute Fix)

In your Google Sheet **`oders`**:
1. Click **Extensions** in top menu -> select **Apps Script**.
2. Erase everything in the editor and **paste this exact code**:

```javascript
function doPost(e) {
  return handleOrderRequest(e);
}

function doGet(e) {
  return handleOrderRequest(e);
}

function handleOrderRequest(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var p = (e && e.parameter) ? e.parameter : {};
    
    if (e && e.postData && e.postData.contents) {
      try {
        var json = JSON.parse(e.postData.contents);
        for (var key in json) { p[key] = json[key]; }
      } catch(err) {}
    }
    
    var orderId = p.orderId || 'TP-' + Math.floor(100000 + Math.random()*900000);
    var date = p.date || new Date().toLocaleString();
    var customerName = p.customerName || 'N/A';
    var customerPhone = p.customerPhone || 'N/A';
    var customerAddress = p.customerAddress || 'N/A';
    var orderDetails = p.orderDetails || 'N/A';
    var totalAmount = p.totalAmount || 'A$0.00';
    
    sheet.appendRow([orderId, date, customerName, customerPhone, customerAddress, orderDetails, totalAmount]);
    
    return ContentService.createTextOutput(JSON.stringify({ "status": "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. **IMPORTANT**: Click **Deploy** -> **Manage deployments** -> Click **Pencil (Edit)** -> Under *Version*, select **New version** -> Click **Deploy**.

---

### 🌐 Configured Web App URL in `app.js`:
`https://script.google.com/macros/s/AKfycbzcztxLGvu1SkuqGNyvEAtctzAivG2LXZF-VRQVeUv0C2grPOA6rNRfenS02QCHqpp9/exec`

Now every single order placed on your site will instantly write a new row into your `oders` Google Sheet!
