# 📝 How to Connect Your Google Form / Google Sheet for Automatic Order Backup

Even if a customer **forgets to click "Send to WhatsApp"** or closes their browser, your website automatically captures their complete order details in the background and sends them to your Google Form / Google Sheet!

---

## ⚡ How it Works (3-Layer Zero-Loss Order Protection)

1. **Layer 1 (Google Form / Sheet Sync)**: Submits customer name, phone, address, items ordered, and total price to your Google Form / Sheet.
2. **Layer 2 (Browser Local Storage)**: Saves every order permanently on the browser memory under `tp_all_orders`.
3. **Layer 3 (Admin Server Backup)**: Automatically appends order details to `data/orders.json` on your local server.

---

## 🛠️ Step-by-Step 2-Minute Google Form Link Setup

### Step 1: Create a Google Form
1. Go to [Google Forms](https://forms.google.com) and click **Blank Form**.
2. Title it: **Trendy Pearls Orders Backup**.
3. Add 5 Short Answer Questions:
   - Question 1: `Customer Name`
   - Question 2: `Customer Phone`
   - Question 3: `Shipping Address`
   - Question 4: `Order Details & Items`
   - Question 5: `Total Amount`

---

### Step 2: Get Entry Field IDs
1. Click the **3 Dots** at top-right of your Google Form -> select **Get pre-filled link**.
2. Type test placeholder answers into each field: `name`, `phone`, `address`, `items`, `total`.
3. Click **Get Link** -> Click **Copy Link**.
4. Paste the link in Notepad. It will look like this:
   `https://docs.google.com/forms/d/e/1FAIpQLSc.../viewform?usp=pp_url&entry.1000001=name&entry.1000002=phone&entry.1000003=address&entry.1000004=items&entry.1000005=total`

---

### Step 3: Paste Entry IDs into `app.js`
Open **`app.js`** line 26 and paste your Form Action URL and Entry IDs:

```javascript
const CONFIG = {
    whatsappNumber: "61461522439",
    currency: "A$",
    itemsPerPage: 24,
    googleFormUrl: "https://docs.google.com/forms/u/0/d/e/1FAIpQLSc.../formResponse",
    googleFormEntries: {
        customerName: "entry.1000001",
        customerPhone: "entry.1000002",
        customerAddress: "entry.1000003",
        orderDetails: "entry.1000004",
        totalAmount: "entry.1000005"
    }
};
```

---

### 📊 How to Link Your Form to Google Sheets
Inside your Google Form, click **Responses** tab -> click **Link to Sheets**.  
Now, every single order will instantly populate as a new row in your Excel Google Sheet automatically!
