# Profile Picture Storage - Migration Guide

## Current Implementation: Base64 in Firestore (Option 2)

Currently, profile pictures are stored as base64-encoded strings directly in the Firestore `users` collection. This approach was chosen because Firebase Storage requires the Blaze (paid) plan.

### Current Limitations
- **Max image size**: 700KB (to stay under 1MB Firestore document limit)
- **Performance**: Slower loading, no CDN caching
- **Bandwidth**: 33% larger files due to base64 encoding
- **Scalability**: Higher costs at scale

### File Locations
- **Upload handler**: `src/store/modules/auth.js` - `uploadProfilePicture` action
- **Validation**: `src/views/Profile.vue` - `handleFileUpload` function
- **Storage location**: Firestore `users/{userId}` document, `photoURL` field

---

## Future Migration: Firebase Storage (Option 1)

When you upgrade to Firebase Blaze plan, follow these steps to migrate:

### Step 1: Enable Firebase Storage
1. Go to Firebase Console → Storage
2. Deploy storage rules from `storage.rules` file
3. Verify storage bucket is active

### Step 2: Update `src/store/modules/auth.js`

Replace the `uploadProfilePicture` action with:

```javascript
import { storage } from '../../firebase/config'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'

async uploadProfilePicture({ commit, state }, file) {
  commit('SET_LOADING', true)
  commit('SET_ERROR', null)
  try {
    const userId = state.user.uid
    const fileRef = storageRef(storage, `profile-pictures/${userId}`)
    
    // Upload file to Storage
    await uploadBytes(fileRef, file)
    
    // Get download URL
    const photoURL = await getDownloadURL(fileRef)
    
    // Update Firestore with photo URL (not base64)
    await updateDoc(doc(db, 'users', userId), {
      photoURL,
      updatedAt: new Date().toISOString()
    })
    
    // Update local state
    commit('SET_USER_PROFILE', {
      ...state.userProfile,
      photoURL
    })
    
    commit('SET_LOADING', false)
    return photoURL
  } catch (error) {
    commit('SET_ERROR', error.message)
    commit('SET_LOADING', false)
    throw error
  }
}
```

### Step 3: Update Validation

In `src/views/Profile.vue`, update file size limit:

```javascript
// Change from 700KB to 5MB
if (file.size > 5 * 1024 * 1024) {
  uploadError.value = 'Image size must be less than 5MB'
  return
}
```

### Step 4: Migrate Existing Images (Optional)

Run this one-time migration script to move existing base64 images to Storage:

```javascript
// migration-script.js
import { db, storage } from './src/firebase/config'
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'
import { ref as storageRef, uploadString, getDownloadURL } from 'firebase/storage'

async function migrateProfilePictures() {
  const usersSnapshot = await getDocs(collection(db, 'users'))
  
  for (const userDoc of usersSnapshot.docs) {
    const userData = userDoc.data()
    
    // Check if photoURL is base64 (starts with "data:")
    if (userData.photoURL && userData.photoURL.startsWith('data:')) {
      console.log(`Migrating user ${userDoc.id}...`)
      
      // Upload base64 to Storage
      const fileRef = storageRef(storage, `profile-pictures/${userDoc.id}`)
      await uploadString(fileRef, userData.photoURL, 'data_url')
      
      // Get new URL
      const downloadURL = await getDownloadURL(fileRef)
      
      // Update Firestore with new URL
      await updateDoc(doc(db, 'users', userDoc.id), {
        photoURL: downloadURL
      })
      
      console.log(`✅ Migrated user ${userDoc.id}`)
    }
  }
  
  console.log('Migration complete!')
}

// Run: node migration-script.js
migrateProfilePictures()
```

### Step 5: Test

1. Upload a new profile picture (should go to Storage)
2. Verify old base64 images still display (if not migrated)
3. Check Firebase Storage console for new uploads

---

## Benefits After Migration

✅ **5MB max image size** (vs 700KB)  
✅ **CDN caching** (faster loads globally)  
✅ **Lower costs** at scale  
✅ **Better performance**  
✅ **Professional implementation**  

---

## Notes

- Current implementation is **perfectly fine** for small projects and demos
- Migration is **optional** but recommended for production
- No user-facing changes required
- Images will work during and after migration

