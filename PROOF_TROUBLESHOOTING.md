# 🔧 Proof Submission Troubleshooting

## Issue: Can't Submit Proof

### ✅ Updated Fixes Applied

I've just updated the code with better error handling and debugging. Here's what changed:

1. **Better Error Messages**: Now shows specific error from server
2. **Console Logging**: Click submit to see debug info in console (F12)
3. **Button State**: Button disabled if type or file not selected
4. **Auto-Approval Feedback**: Different message for auto-approved vs pending
5. **Memory Cleanup**: Properly revokes preview URLs

---

## 🔍 Step-by-Step Debugging

### Step 1: Open Browser Console
1. Press **F12** to open Developer Tools
2. Go to **Console** tab
3. Keep it open while testing

### Step 2: Try to Submit
1. Go to `/proof` page
2. Select a proof type (e.g., "Energy Bill")
3. Upload a file
4. Click "Submit & Earn X ecoBits"
5. **Watch the console** for messages

### Step 3: Check Console Output

**You should see:**
```
Submit button clicked {selectedType: "energy_bill", selectedFile: "test.jpg"}
```

**If you see an error**, it will show what went wrong.

---

## 🐛 Common Issues & Solutions

### Issue 1: Button is Disabled (Grayed Out)

**Symptoms:**
- Can't click submit button
- Button appears faded

**Causes:**
- No proof type selected
- No file uploaded
- Already submitting

**Solution:**
1. Make sure you clicked a proof type card (it should have green border)
2. Make sure you uploaded a file (preview should show)
3. Wait if it says "Submitting..."

---

### Issue 2: Nothing Happens When Clicking Submit

**Check Console (F12) for:**

**Error: "Please select proof type and file"**
- Solution: Select proof type first, then upload file

**Error: "Failed to submit proof"**
- Solution: Check server is running
- Check you're logged in
- Try refreshing page

**Error: "Unauthorized"**
- Solution: Log out and log back in
- Clear cookies and try again

---

### Issue 3: File Upload Fails

**Symptoms:**
- Can't select file
- File doesn't preview

**Solutions:**

**File too large:**
```
Error: File size must be less than 10MB
```
- Compress your image
- Use a smaller file

**Wrong file type:**
```
Error: Only images (JPEG, PNG, WEBP) and PDF files are allowed
```
- Convert to JPEG or PNG
- Don't use .doc, .txt, or other formats

---

### Issue 4: Submission Succeeds But No EcoBits

**This is NORMAL for:**
- 🎫 Transport Tickets (manual review)
- 🚗 Carpool Receipts (manual review)
- 🛍️ Shopping Receipts (manual review)
- 🌿 Eco Products (manual review)

**These get instant ecoBits:**
- ⚡ Energy Bills (auto-approved)
- 💧 Water Bills (auto-approved)

**Check:**
1. Look at "Your Submissions" sidebar
2. Status should show "⏳ Pending" or "✓ Approved"
3. If pending, wait up to 24 hours

---

## 🧪 Test Procedure

### Test 1: Energy Bill (Should Work Instantly)

1. **Select**: Click "Energy Bill" card
2. **Upload**: Any image file (even a screenshot)
3. **Details**: 
   - Date: Today
   - Amount: 100
   - Vendor: "Power Company"
4. **Submit**: Click button
5. **Expected**: 
   - Success toast: "Proof Approved! 🎉"
   - Message: "You earned 10 ecoBits!"
   - EcoBits balance increases immediately

### Test 2: Transport Ticket (Manual Review)

1. **Select**: Click "Public Transport Ticket"
2. **Upload**: Any image
3. **Details**: Optional
4. **Submit**: Click button
5. **Expected**:
   - Success toast: "Proof Submitted! 📄"
   - Message: "You'll earn 5 ecoBits once approved!"
   - Status shows "⏳ Pending"

---

## 🔍 Debug Checklist

Run through this checklist:

- [ ] Server is running (check terminal)
- [ ] Logged in to app
- [ ] On `/proof` page
- [ ] Proof type selected (green border on card)
- [ ] File uploaded (preview visible)
- [ ] Console open (F12)
- [ ] No errors in console
- [ ] Button not disabled
- [ ] Clicked submit button
- [ ] Watched for toast notification

---

## 📊 Expected Flow

### Successful Submission:

```
1. User clicks proof type card
   → Card gets green border
   → selectedType state updates

2. User uploads file
   → File preview appears
   → selectedFile state updates
   → Step 3 section appears

3. User adds details (optional)
   → metadata state updates

4. User clicks Submit button
   → Console logs: "Submit button clicked"
   → Button shows "Submitting..."
   → FormData sent to server

5. Server processes
   → Validates file
   → Saves to database
   → Returns response

6. Success!
   → Toast notification appears
   → Form resets
   → Submission appears in history
   → EcoBits updated (if auto-approved)
```

---

## 🚨 Server-Side Checks

### Check Server Logs

Look for these in terminal:

**Success:**
```
POST /api/proof-documents 200 in XXXms
```

**Validation Error:**
```
POST /api/proof-documents 400 in XXXms
```

**Server Error:**
```
POST /api/proof-documents 500 in XXXms
Error: [specific error message]
```

### Common Server Errors:

**"Proof file is required"**
- File didn't upload properly
- Try again with smaller file

**"Failed to create proof"**
- Database issue
- Check database connection

**"Unauthorized"**
- Session expired
- Log in again

---

## 🔧 Quick Fixes

### Fix 1: Clear Everything
```
1. Close browser
2. Clear cache (Ctrl+Shift+Delete)
3. Restart server
4. Open browser
5. Log in fresh
6. Try again
```

### Fix 2: Use Different File
```
1. Take a screenshot (Windows: Win+Shift+S)
2. Save as .png
3. Use that file
4. Should be small and valid
```

### Fix 3: Try Energy Bill First
```
1. Always test with Energy Bill first
2. It's auto-approved
3. You'll see immediate feedback
4. Confirms system is working
```

---

## 📞 Still Not Working?

### Collect This Information:

1. **Browser Console Errors** (F12 → Console tab)
2. **Server Terminal Output** (last 20 lines)
3. **What you clicked** (step by step)
4. **What you expected** vs **what happened**
5. **Screenshot** of the page

### Check These:

- [ ] Node.js version: `node --version` (should be 18+)
- [ ] NPM version: `npm --version`
- [ ] Database connected (check .env file)
- [ ] Uploads folder exists and writable
- [ ] Port 5000 not blocked by firewall

---

## ✅ Verification

**System is working if:**
- ✅ Can select proof type
- ✅ Can upload file
- ✅ Can see preview
- ✅ Submit button enabled
- ✅ Console shows "Submit button clicked"
- ✅ Toast notification appears
- ✅ Submission in history

**Try this simple test:**
1. Go to http://localhost:5000/proof
2. Click "Energy Bill"
3. Upload ANY image
4. Click Submit
5. Should see success message!

---

**The code has been updated with better debugging. Try again and check the console!** 🔧✨
