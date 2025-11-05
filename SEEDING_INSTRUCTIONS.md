# 🌱 Database Seeding Instructions

## Overview
This guide will help you populate your Bridge platform with realistic test data to make it look like a thriving, active platform ready for deployment.

## What Will Be Created

### 👥 **20 Jobseekers**
- Diverse names and backgrounds
- Various skill sets (Scaffolding, Welding, Carpentry, etc.)
- Different experience levels (1-10 years)
- Locations across Singapore
- Complete profiles with contact info

### 🏢 **10 Employers**
- Construction companies of various sizes
- Different specializations (Commercial, Infrastructure, MEP, etc.)
- Complete company profiles
- Verified accounts

### 💼 **28 Jobs**
- Distributed across all employers
- Realistic job descriptions
- Various roles and skill requirements
- Different salary ranges
- Active job postings

### 📝 **60-100 Applications**
- Each jobseeker applies to 2-5 jobs
- Mix of statuses: Pending (60%), Reviewed (25%), Accepted (10%), Rejected (5%)
- Recent timestamps (last 15 days)

### 📚 **15-45 Quiz Completions**
- 15 jobseekers with completed quizzes
- 1-3 quizzes each
- Various scores (2/5 to 5/5)
- Different categories (Safety, Technical Skills)

### 💬 **8 Chat Conversations**
- Active conversations between jobseekers and employers
- Recent message timestamps
- Realistic chat scenarios

---

## Prerequisites

Before running the seed script, make sure you have:

1. ✅ **Node.js** installed (v14 or higher)
2. ✅ **Firebase Admin SDK** installed
3. ✅ **firebase_private_key.json** in your project root
4. ✅ **Firestore database** set up and running

---

## Installation Steps

### Step 1: Install Firebase Admin SDK

```bash
cd "/Users/tate/Library/CloudStorage/OneDrive-Personal/wamp64/www/IS216 Web Application Development II/WAD Project/Bridge"
npm install firebase-admin --save-dev
```

### Step 2: Verify Firebase Private Key

Make sure your `firebase_private_key.json` file is in the project root and contains valid credentials.

### Step 3: Run the Seed Script

```bash
node seed-data.cjs
```

---

## What to Expect

When you run the script, you'll see output like this:

```
🌱 Starting database seeding...

═══════════════════════════════════════════════════════

🔷 Creating Jobseekers...
  ✓ Created jobseeker: Ahmad Rahman
  ✓ Created jobseeker: Kumar Selvam
  ✓ Created jobseeker: Liu Wei
  ... (and 17 more)

🏢 Creating Employers...
  ✓ Created employer: BuildTech Construction Pte Ltd
  ✓ Created employer: Metro Infrastructure Solutions
  ... (and 8 more)

💼 Creating Jobs...
  ✓ Created job: Senior Scaffolder at BuildTech Construction Pte Ltd
  ✓ Created job: Heavy Machinery Operator at Metro Infrastructure Solutions
  ... (and 26 more)

📝 Creating Applications...
  ✓ Created applications for: Ahmad Rahman
  ✓ Created applications for: Kumar Selvam
  ... (and 18 more)
  ✓ Total applications created: 78

📚 Creating Quiz Completions...
  ✓ Created quizzes for: Ahmad Rahman
  ✓ Created quizzes for: Suresh Kumar
  ... (and 13 more)
  ✓ Total quizzes created: 34

💬 Creating Chat Rooms...
  ✓ Created chat: Ahmad Rahman ↔ BuildTech Construction Pte Ltd
  ✓ Created chat: Kumar Selvam ↔ Metro Infrastructure Solutions
  ... (and 6 more)
  ✓ Total chat rooms created: 8

═══════════════════════════════════════════════════════

✅ Database seeding completed successfully!

📊 Summary:
   • Jobseekers: 20
   • Employers: 10
   • Jobs: 28
   • Applications: Generated based on jobseekers
   • Quiz Completions: Generated for 15 jobseekers
   • Chat Rooms: 8 conversations

🎉 Your Bridge platform is now ready for deployment!

📝 Note: All users have password: Password123!
```

---

## Important Notes

### 🔐 **Authentication**
- The seed script creates user documents in Firestore
- **It does NOT create Firebase Authentication accounts**
- You'll need to manually create Auth accounts OR modify your login to handle test users
- All test users have password: `Password123!`

### 🔄 **Running Multiple Times**
- Running the script multiple times will create duplicate data
- If you want to start fresh, run the cleanup script: `node cleanup-seed-data.cjs`
- You can also use Firebase Console to delete all documents manually

### 📅 **Timestamps**
- All dates are randomized to appear recent (last 1-2 months)
- Applications are from the last 15 days
- Jobs posted in the last 20 days
- Quizzes completed in the last 25 days

### 🎯 **Customization**
- You can edit `seed-data.js` to modify:
  - Number of users
  - Job descriptions
  - Company names
  - Skills and experience levels
  - Any other data fields

---

## Test Login Credentials

### Jobseeker Accounts:
```
Email: ahmad.rahman@email.com
Password: Password123!

Email: kumar.selvam@email.com
Password: Password123!

Email: liu.wei@email.com
Password: Password123!
```

### Employer Accounts:
```
Email: hr@buildtech.sg
Password: Password123!

Email: careers@metroinfra.sg
Password: Password123!

Email: jobs@skyhigh.sg
Password: Password123!
```

**Note:** These will only work after you create the corresponding Firebase Authentication accounts.

---

## Troubleshooting

### ❌ **Error: Cannot find module 'firebase-admin'**
**Solution:** Run `npm install firebase-admin --save-dev`

### ❌ **Error: ENOENT: no such file 'firebase_private_key.json'**
**Solution:** Make sure your Firebase private key is in the project root

### ❌ **Error: Permission denied**
**Solution:** Check your Firestore security rules allow writes from Admin SDK

### ❌ **Error: 7 PERMISSION_DENIED**
**Solution:** Verify your Firebase private key has the correct permissions

---

## Next Steps After Seeding

1. ✅ **Create Firebase Auth Accounts** (optional)
   - Use Firebase Console to create auth accounts matching the seeded users
   - Or modify your login to handle test data

2. ✅ **Test All Features**
   - Browse jobs as different jobseekers
   - Review applications as employers
   - Test chat functionality
   - Check quiz results
   - Verify achievements

3. ✅ **Adjust Data as Needed**
   - Add more specific jobs for your demo
   - Update company descriptions
   - Customize user profiles

4. ✅ **Take Screenshots**
   - Capture your platform looking alive and active
   - Show various pages with realistic data
   - Demonstrate features with populated content

5. ✅ **Ready for Deployment! 🚀**

---

## Support

If you encounter any issues:
1. Check the console output for specific error messages
2. Verify your Firebase configuration
3. Ensure Firestore security rules allow the operations
4. Check that firebase_private_key.json is valid

---

**Happy Seeding! 🌱✨**

