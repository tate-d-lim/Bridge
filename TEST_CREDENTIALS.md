# 🔐 Test Credentials & Data Reference

## Quick Setup

```bash
# Install dependencies
npm install firebase-admin --save-dev

# Run seed script
node seed-data.cjs

# If you need to clean up later
node cleanup-seed-data.cjs
```

---

## 👷 Jobseeker Test Accounts

All passwords: `Password123!`

| Name | Email | Skills | Experience | Location |
|------|-------|--------|------------|----------|
| Ahmad Rahman | ahmad.rahman@email.com | Scaffolding, Height Work, Safety Protocols | 5 years | Jurong West |
| Kumar Selvam | kumar.selvam@email.com | Welding, Metal Fabrication, Blueprint Reading | 7 years | Woodlands |
| Liu Wei | liu.wei@email.com | Concrete Work, Foundation, Masonry | 4 years | Tampines |
| Mohammad Hasan | m.hasan@email.com | Electrical Installation, Wiring, Safety Compliance | 6 years | Clementi |
| Raj Patel | raj.patel@email.com | Plumbing, Pipe Fitting, Water Systems | 5 years | Bedok |
| Nguyen Van | nguyen.van@email.com | Carpentry, Formwork, Finishing | 8 years | Yishun |
| Suresh Kumar | suresh.kumar@email.com | Heavy Machinery, Crane Operation, Site Safety | 10 years | Jurong East |
| Abdul Malik | abdul.malik@email.com | Painting, Surface Preparation, Coating Application | 3 years | Hougang |
| Chen Ming | chen.ming@email.com | Tile Setting, Flooring, Finishing Work | 6 years | Ang Mo Kio |
| Ravi Shankar | ravi.shankar@email.com | Steel Fixing, Reinforcement, Structural Work | 7 years | Bukit Batok |
| Zhang Wei | zhang.wei@email.com | HVAC Installation, Air Conditioning, Ventilation | 5 years | Sengkang |
| Arjun Singh | arjun.singh@email.com | General Construction, Site Work, Team Coordination | 4 years | Punggol |
| Budi Santoso | budi.santoso@email.com | Excavation, Earth Moving, Site Preparation | 6 years | Choa Chu Kang |
| Amir Hassan | amir.hassan@email.com | Roofing, Waterproofing, Height Work | 5 years | Pasir Ris |
| Vikram Kumar | vikram.kumar@email.com | Demolition, Site Clearing, Safety Management | 8 years | Sembawang |
| Li Jun | li.jun@email.com | Glass Installation, Glazing, Facade Work | 4 years | Bishan |
| Muhamad Rizal | m.rizal@email.com | Forklift Operation, Warehouse, Logistics | 3 years | Tuas |
| Prakash Rao | prakash.rao@email.com | Site Supervision, Quality Control, Team Management | 9 years | Queenstown |
| Wang Feng | wang.feng@email.com | Drywall Installation, Partition Work, Interior Fitting | 5 years | Serangoon |
| Sanjay Patel | sanjay.patel@email.com | Landscaping, Ground Work, Finishing | 4 years | Marine Parade |

---

## 🏢 Employer Test Accounts

All passwords: `Password123!`

| Contact Name | Email | Company Name | Industry | Size |
|--------------|-------|--------------|----------|------|
| Sarah Chen | hr@buildtech.sg | BuildTech Construction Pte Ltd | Commercial Construction | 200-500 employees |
| David Lim | careers@metroinfra.sg | Metro Infrastructure Solutions | Infrastructure Development | 500+ employees |
| Michelle Tan | jobs@skyhigh.sg | SkyHigh Builders Pte Ltd | Residential Construction | 100-200 employees |
| James Wong | recruit@premierreno.sg | Premier Renovations Group | Renovation & Upgrading | 50-100 employees |
| Robert Ng | hr@industrialworks.sg | Industrial Works Singapore | Industrial Construction | 300-500 employees |
| Emily Koh | jobs@greenearth.sg | Green Earth Landscaping Pte Ltd | Landscaping & Ground Work | 50-100 employees |
| Andrew Teo | careers@eliteeng.sg | Elite Engineering Contractors | MEP Services | 150-300 employees |
| Kevin Ong | hr@rapidbuild.sg | Rapid Build Solutions | General Construction | 100-200 employees |
| Patricia Lee | jobs@foundationspec.sg | Foundation Specialists Pte Ltd | Foundation & Structural | 100-150 employees |
| Michael Goh | recruit@urbandevelopment.sg | Urban Development Corp | Mixed Development | 500+ employees |

---

## 💼 Sample Jobs by Company

### BuildTech Construction Pte Ltd
- **Senior Scaffolder** - Marina Bay - $2,800-$3,500 - 3 openings
- **Concrete Specialist** - Downtown Core - $2,500-$3,200 - 5 openings
- **General Construction Worker** - Marina Bay - $2,200-$2,800 - 8 openings

### Metro Infrastructure Solutions
- **Heavy Machinery Operator** - Jurong East - $3,200-$4,000 - 2 openings
- **Steel Fixer - MRT Project** - Toa Payoh - $2,600-$3,300 - 6 openings
- **Site Supervisor** - Woodlands - $3,800-$4,500 - 2 openings
- **Excavation Worker** - Jurong West - $2,400-$3,000 - 4 openings

### SkyHigh Builders Pte Ltd
- **Carpenter - HDB Project** - Punggol - $2,500-$3,200 - 4 openings
- **Tile Setter** - Sengkang - $2,300-$2,900 - 3 openings
- **Painter - Residential** - Hougang - $2,200-$2,700 - 5 openings

### Elite Engineering Contractors
- **Licensed Electrician** - Orchard - $3,000-$3,800 - 3 openings
- **Plumber - Commercial Projects** - CBD Area - $2,700-$3,400 - 3 openings
- **HVAC Technician** - Marina Bay - $2,800-$3,500 - 2 openings

### Urban Development Corp
- **Roofing Specialist** - Bukit Timah - $2,700-$3,400 - 3 openings
- **Demolition Worker** - Kallang - $2,500-$3,100 - 4 openings
- **Site Coordinator** - Bugis - $3,500-$4,200 - 2 openings

_... and 18 more jobs across other employers!_

---

## 📊 Data Statistics

After seeding, you'll have:

- ✅ **20 Jobseekers** with complete profiles
- ✅ **10 Employers** with verified company accounts
- ✅ **28 Active Jobs** with realistic descriptions
- ✅ **60-100 Applications** with various statuses
- ✅ **15-45 Quiz Completions** with different scores
- ✅ **8 Chat Conversations** between users
- ✅ **12-20 Company Reviews** across all employers
- ✅ **20 User Statistics** profiles (levels, points, streaks)
- ✅ **40-120 Achievements** unlocked (2-6 per jobseeker)

---

## 🎯 Testing Scenarios

### Scenario 1: Browse Jobs as Jobseeker
1. Login as: `ahmad.rahman@email.com`
2. Browse available jobs (28 active postings)
3. View jobs Ahmad already applied to (2-5 applications)
4. Check quiz results and achievements

### Scenario 2: Review Applications as Employer
1. Login as: `hr@buildtech.sg`
2. View posted jobs (3 jobs: Scaffolder, Concrete Specialist, General Worker)
3. Review applications (multiple applicants per job)
4. Check candidate profiles with skills

### Scenario 3: View Active Chats
1. Login as any user involved in chats
2. View chat history with messages
3. Test messaging functionality

### Scenario 4: Quiz Performance
1. Login as jobseekers who completed quizzes
2. View quiz history and scores
3. Check unlocked achievements

---

## 🔄 Application Status Distribution

The seed script creates applications with realistic status distribution:

- **Pending**: ~60% (freshly submitted, awaiting review)
- **Reviewed**: ~25% (employer has viewed)
- **Accepted**: ~10% (candidate selected)
- **Rejected**: ~5% (not suitable)

---

## 📅 Timeline

All data appears recent and realistic:

- **User Accounts**: Created 1-2 months ago
- **Jobs Posted**: Last 20 days
- **Applications**: Last 15 days
- **Quizzes Completed**: Last 25 days
- **Chat Messages**: Last 10-12 days

---

## 💡 Pro Tips

1. **Demo Best Practices**:
   - Show the dashboard with populated stats
   - Browse jobs with actual listings
   - View applications with real data
   - Demonstrate chat functionality
   - Show quiz results and achievements

2. **Highlight Features**:
   - Search and filter jobs (28 real jobs to filter)
   - Skills matching (realistic skills on all users)
   - Application tracking (multiple statuses)
   - Gamification (quizzes, achievements, points)
   - Communication (active chat threads)

3. **Before Deployment**:
   - Take screenshots of key pages
   - Record a demo video
   - Test all user flows
   - Verify data relationships
   - Check mobile responsiveness

---

## ⚠️ Important Notes

### Authentication
The seed script creates **Firestore user documents only**. It does NOT create Firebase Authentication accounts.

**Option 1: Create Auth Accounts Manually**
- Use Firebase Console to create auth accounts
- Use the same emails and password: `Password123!`

**Option 2: Modify Login (Development Only)**
- Update your login logic to bypass auth for test emails
- Check Firestore directly for user data

### Security
- Change all passwords before real deployment
- These are TEST credentials only
- Don't use in production with real data

---

## 🚀 Ready to Deploy!

Once seeded, your Bridge platform will look like:
- ✨ An **active, thriving marketplace**
- 💼 **Real jobs** from legitimate companies
- 👥 **Engaged users** with completed profiles
- 📈 **Platform activity** across all features
- 💬 **Active communication** between users

**Your platform will look 100% production-ready! 🎉**

---

## 📞 Need Help?

If anything goes wrong:
1. Check console output for errors
2. Verify Firebase configuration
3. Check Firestore security rules
4. Run cleanup script and try again: `node cleanup-seed-data.cjs`

Good luck with your deployment! 🚀✨

