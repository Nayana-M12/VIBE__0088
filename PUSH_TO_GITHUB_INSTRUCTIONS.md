# Push Code to GitHub - Manual Instructions

Follow these steps to push your code to GitHub:

## Step 1: Open Command Prompt (CMD)
1. Press `Win + R`
2. Type `cmd` and press Enter
3. Navigate to your project folder:
   ```
   cd C:\Users\nayan\Downloads\GreenIntelligence\GreenIntelligence-1
   ```

## Step 2: Configure Git Remote
Run this command to add the GitHub repository:
```bash
git remote add origin https://github.com/Nayana-M12/VIBE__0088.git
```

If you get an error saying "remote origin already exists", run:
```bash
git remote set-url origin https://github.com/Nayana-M12/VIBE__0088.git
```

## Step 3: Check Current Status
```bash
git status
```

## Step 4: Add All Files
```bash
git add .
```

## Step 5: Commit Changes
```bash
git commit -m "Update: Fixed connection request system and database schema migration"
```

## Step 6: Push to GitHub
Try pushing to main branch first:
```bash
git push -u origin main
```

If that fails, try master branch:
```bash
git push -u origin master
```

## Step 7: If Push is Rejected
If you get an error about updates being rejected, you may need to force push (only if you're sure):
```bash
git push -u origin main --force
```

Or pull first and then push:
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

## Troubleshooting

### Authentication Required
If GitHub asks for authentication:
1. Use your GitHub username
2. For password, use a Personal Access Token (not your GitHub password)
3. Generate a token at: https://github.com/settings/tokens

### Branch Name Issues
Check your current branch:
```bash
git branch
```

If you're on a different branch, either:
- Switch to main: `git checkout -b main`
- Or push your current branch: `git push -u origin <your-branch-name>

---

## Quick Copy-Paste Commands (Run in CMD)

```bash
cd C:\Users\nayan\Downloads\GreenIntelligence\GreenIntelligence-1
git remote add origin https://github.com/Nayana-M12/VIBE__0088.git
git add .
git commit -m "Update: Fixed connection request system and database schema"
git push -u origin main
```

If the above fails, try:
```bash
git push -u origin master
```
