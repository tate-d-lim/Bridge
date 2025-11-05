# 🌱 Database Seeding - Quick Start

## 🚀 TL;DR - Get Started in 3 Steps

```bash
# 1. Install Firebase Admin
npm install firebase-admin --save-dev

# 2. Run the seed script
node seed-data.cjs

# 3. Done! Your database now has 20 jobseekers, 10 employers, 28 jobs, and more!
```

---

## 📁 Files Created

### 1. **seed-data.cjs** - Main Seeding Script
Creates all test data:
- 20 diverse jobseekers with skills and experience
- 10 construction companies (employers)
- 28 realistic job postings
- 60-100 applications (various statuses)
- 15-45 completed quizzes
- 8 active chat conversations

### 2. **cleanup-seed-data.cjs** - Cleanup Script
Removes all seeded data if you need to start fresh.

```bash
node cleanup-seed-data.cjs
```

### 3. **SEEDING_INSTRUCTIONS.md** - Detailed Guide
Complete instructions with:
- Installation steps
- What to expect when running
- Troubleshooting tips
- Next steps after seeding

### 4. **TEST_CREDENTIALS.md** - Login Reference
Quick reference for:
- All test user emails and passwords
- Job listings by company
- Data statistics
- Testing scenarios
- Demo tips

---

## ⚡ Quick Reference

### Test Logins

**Jobseekers:**
- ahmad.rahman@email.com / Password123!
- kumar.selvam@email.com / Password123!
- liu.wei@email.com / Password123!
- _(... and 17 more)_

**Employers:**
- hr@buildtech.sg / Password123!
- careers@metroinfra.sg / Password123!
- jobs@skyhigh.sg / Password123!
- _(... and 7 more)_

### What You'll Get

| Data Type | Count | Details |
|-----------|-------|---------|
| 👥 Jobseekers | 20 | Complete profiles with skills |
| 🏢 Employers | 10 | Verified companies |
| 💼 Jobs | 28 | Active postings |
| 📝 Applications | 60-100 | Mixed statuses |
| 📚 Quizzes | 15-45 | Completed by 15 users |
| 💬 Chats | 8 | Active conversations |

---

## 🎯 Why Use This?

### Before Seeding:
```
❌ Empty job listings
❌ No user activity
❌ "No data" placeholders everywhere
❌ Looks like a ghost town
❌ Hard to demonstrate features
```

### After Seeding:
```
✅ 28 realistic job postings
✅ Active applications and messages
✅ Real user profiles with skills
✅ Completed quizzes and achievements
✅ Looks like a thriving platform!
✅ Perfect for demos and screenshots
```

---

## 📋 Pre-Seeding Checklist

Before running the seed script, make sure you have:

- [x] **Node.js** installed (v14+)
- [x] **Firebase project** set up
- [x] **firebase_private_key.json** in project root
- [x] **Firestore database** created
- [x] **Firestore rules** allow writes (Admin SDK bypasses rules)

---

## 🎬 Step-by-Step Guide

### Step 1: Install Dependencies
```bash
npm install firebase-admin --save-dev
```

### Step 2: Verify Firebase Key
Make sure `firebase_private_key.json` exists in your project root.

### Step 3: Run Seeding
```bash
node seed-data.cjs
```

You'll see progress output:
```
🌱 Starting database seeding...

🔷 Creating Jobseekers...
  ✓ Created jobseeker: Ahmad Rahman
  ✓ Created jobseeker: Kumar Selvam
  ...

✅ Database seeding completed successfully!
```

### Step 4: (Optional) Create Auth Accounts
The seed script creates **Firestore documents only**.

To enable login, you need Firebase Authentication accounts:

**Option A:** Create manually in Firebase Console
- Use the same emails from TEST_CREDENTIALS.md
- Set password: `Password123!`

**Option B:** Modify your login (dev only)
- Skip auth check for test emails
- Look up users directly in Firestore

---

## 🧪 Testing Your Seeded Data

### Browse Jobs
```
Login as: ahmad.rahman@email.com
→ Browse 28 active jobs
→ View your 2-5 existing applications
→ Apply to new positions
```

### Review Applications
```
Login as: hr@buildtech.sg
→ See 3 posted jobs
→ Review multiple applications
→ View candidate profiles
```

### Check Quizzes & Achievements
```
Login as jobseekers
→ View completed quiz history
→ See quiz scores (2/5 to 5/5)
→ Check unlocked achievements
```

### Test Messaging
```
Login as users with active chats
→ View 8 chat conversations
→ Send test messages
→ Verify real-time updates
```

---

## 🎨 Perfect for Demos

Use seeded data to showcase:

1. **Job Marketplace** - 28 real job listings across 10 companies
2. **Smart Matching** - Skills matching between jobs and candidates
3. **Application Flow** - Complete hiring pipeline with statuses
4. **Gamification** - Quizzes, achievements, and points
5. **Communication** - Active chats between users
6. **Dashboard Stats** - Real numbers and metrics
7. **Search & Filters** - Actual data to filter through

---

## 🔄 Reset & Cleanup

To remove all seeded data and start fresh:

```bash
node cleanup-seed-data.cjs
```

This will delete ALL documents from:
- users
- jobs
- applications
- quizzes
- chatRooms

---

## ⚠️ Important Notes

1. **Not for Production**: This is test data only. Use different data for production.

2. **Password Security**: All test accounts use `Password123!` - change before real deployment.

3. **Auth vs Firestore**: The script creates Firestore documents, NOT Firebase Auth accounts.

4. **Timestamps**: All dates are randomized to look recent (last 1-2 months).

5. **Running Multiple Times**: Will create duplicates. Use cleanup script first if re-seeding.

---

## 📚 Additional Resources

- **SEEDING_INSTRUCTIONS.md** - Detailed setup guide
- **TEST_CREDENTIALS.md** - Complete user list with credentials
- **seed-data.cjs** - Source code (customize as needed)
- **cleanup-seed-data.cjs** - Cleanup utility

---

## 🎉 Result

After seeding, your Bridge platform will:

✨ Look **professional and active**
✨ Have **real data** in every feature
✨ Be **demo-ready** with realistic scenarios
✨ Show **platform engagement** across all pages
✨ Impress **stakeholders** with a "live" feel

**Your platform will look 99% production-ready! 🚀**

---

## 💡 Pro Tips

1. **Take screenshots** of key pages before presentations
2. **Record a demo video** showing different user types
3. **Test all user flows** with the seeded data
4. **Customize data** if needed (edit seed-data.cjs)
5. **Keep credentials handy** (TEST_CREDENTIALS.md)

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| `Cannot find module 'firebase-admin'` | Run `npm install firebase-admin --save-dev` |
| `ENOENT: no such file` | Verify firebase_private_key.json exists |
| `Permission denied` | Check Firestore rules (Admin SDK should bypass) |
| `Want to start fresh` | Run `node cleanup-seed-data.cjs` |

---

## 🎯 Next Steps

1. ✅ Run seed script
2. ✅ Verify data in Firebase Console
3. ✅ Create Auth accounts (optional)
4. ✅ Test all features
5. ✅ Take screenshots
6. ✅ Prepare demo presentation
7. ✅ Deploy to production! 🚀

---

**Happy Seeding! Your Bridge platform is about to come alive! ✨**

