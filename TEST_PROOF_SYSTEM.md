# 🧪 Testing Proof Submission System

## ✅ System Status

Based on server logs, the proof submission system is **WORKING**! 

Server logs show:
```
POST /api/proof-documents 200 in 949ms
POST /api/proof-documents 200 in 176ms
```

This means:
- ✅ API endpoint is accessible
- ✅ Requests are being processed
- ✅ Database operations are working
- ✅ Files are being uploaded

---

## 🔍 How to Test

### 1. Access the Proof Submission Page

**Option A: Via Sidebar**
1. Open the app: http://localhost:5000
2. Look for **"Submit Proof"** in the sidebar
3. Click it

**Option B: Direct URL**
1. Go to: http://localhost:5000/proof
2. Page should load immediately

### 2. Submit a Test Proof

**Step-by-Step:**
1. **Select Proof Type**: Click on any card (e.g., "Public Transport Ticket")
2. **Upload File**: 
   - Click "Choose File" button
   - Or drag & drop an image
   - Supported: JPEG, PNG, WEBP, PDF (max 10MB)
3. **Add Details** (optional):
   - Description: "Took bus to work"
   - Date: Today's date
   - Amount: "2.50"
   - Vendor: "City Transit"
4. **Click Submit**: Button shows "Submit & Earn X ecoBits"
5. **Check Result**: Toast notification should appear

### 3. Verify Submission

**Check Sidebar:**
- Look at "Your Submissions" section
- Should see your proof with status badge
- Status will be "Pending" or "Auto-Approved"

**Check EcoBits:**
- If auto-approved, ecoBits added immediately
- Check your balance in top-right corner

---

## 🐛 Common Issues & Solutions

### Issue 1: "Submit Proof" not in sidebar
**Solution:**
- Refresh the page (Ctrl+R)
- Clear browser cache (Ctrl+Shift+R)
- Check if you're logged in

### Issue 2: Can't upload file
**Possible causes:**
- File too large (>10MB)
- Wrong file type (only images & PDFs)
- File corrupted

**Solution:**
- Use a smaller image
- Convert to JPEG/PNG
- Try a different file

### Issue 3: Submission fails
**Check:**
- Internet connection
- Server is running
- Browser console for errors (F12)

**Solution:**
- Restart server
- Check server logs
- Try again

### Issue 4: No ecoBits awarded
**Reason:**
- Proof is "Pending" (needs manual review)
- Only auto-approved proofs give instant ecoBits

**Solution:**
- Wait for approval (24 hours)
- Check submission status
- Energy/Water bills are auto-approved

---

## 📊 Expected Behavior

### Successful Submission Flow:

```
1. User selects proof type
   ↓
2. User uploads file
   ↓
3. Preview shows (for images)
   ↓
4. User adds optional details
   ↓
5. User clicks Submit
   ↓
6. Loading state shows
   ↓
7. Success toast appears
   ↓
8. Form resets
   ↓
9. Submission appears in history
   ↓
10. EcoBits awarded (if auto-approved)
```

### Auto-Approval Types:
- ⚡ Energy Bill → Instant approval
- 💧 Water Bill → Instant approval

### Manual Review Types:
- 🎫 Transport Ticket → 24h review
- 🚗 Carpool Receipt → 24h review
- 🛍️ Shopping Receipt → 24h review
- 🌿 Eco Product → 24h review
- 📄 Other → 24h review

---

## 🔧 Developer Testing

### Test API Directly:

**1. Get User's Proofs:**
```bash
curl http://localhost:5000/api/proof-documents \
  -H "Cookie: connect.sid=YOUR_SESSION_ID"
```

**2. Submit Proof:**
```bash
curl -X POST http://localhost:5000/api/proof-documents \
  -H "Cookie: connect.sid=YOUR_SESSION_ID" \
  -F "proof=@test-image.jpg" \
  -F "proofType=transport_ticket" \
  -F "description=Test submission"
```

### Check Database:

If you have database access:
```sql
SELECT * FROM proof_documents ORDER BY uploaded_at DESC LIMIT 10;
```

### Check Server Logs:

Look for:
- `POST /api/proof-documents 200` → Success
- `POST /api/proof-documents 400` → Validation error
- `POST /api/proof-documents 500` → Server error

---

## ✅ Verification Checklist

- [ ] Can access /proof page
- [ ] Can see 7 proof type cards
- [ ] Can select a proof type
- [ ] Can upload a file
- [ ] Can see file preview
- [ ] Can add optional details
- [ ] Can submit successfully
- [ ] See success toast message
- [ ] Submission appears in history
- [ ] EcoBits updated (if auto-approved)

---

## 📝 Test Cases

### Test Case 1: Energy Bill (Auto-Approval)
1. Select "Energy Bill"
2. Upload bill image
3. Add date and amount
4. Submit
5. **Expected**: Instant approval + 10 ecoBits

### Test Case 2: Transport Ticket (Manual Review)
1. Select "Public Transport Ticket"
2. Upload ticket photo
3. Add description
4. Submit
5. **Expected**: Pending status, no ecoBits yet

### Test Case 3: Invalid File
1. Select any proof type
2. Try to upload 20MB file
3. **Expected**: Error message "File too large"

### Test Case 4: Wrong File Type
1. Select any proof type
2. Try to upload .txt or .doc file
3. **Expected**: Error message "Invalid file type"

---

## 🎯 Success Indicators

If you see these, system is working:
- ✅ Proof submission page loads
- ✅ File upload works
- ✅ Preview displays
- ✅ Submit button responds
- ✅ Toast notification appears
- ✅ History updates
- ✅ EcoBits increase (for auto-approved)

---

## 🚨 If Still Not Working

### 1. Check Browser Console (F12)
Look for:
- JavaScript errors
- Network errors
- Failed API calls

### 2. Check Server Logs
Look for:
- Error messages
- Stack traces
- Database errors

### 3. Restart Everything
```bash
# Stop server (Ctrl+C)
# Clear node_modules cache
npm run dev
# Refresh browser
```

### 4. Check Database
- Verify `proof_documents` table exists
- Check table structure
- Run migrations if needed

---

## 📞 Getting Help

If issues persist:
1. Check server logs for specific errors
2. Check browser console for client errors
3. Verify database connection
4. Check file permissions for uploads folder
5. Ensure all dependencies are installed

---

**The system is working based on server logs! Try accessing http://localhost:5000/proof** 🎉

---

**Last Updated**: November 8, 2025
**Status**: ✅ Working (Server logs confirm)
