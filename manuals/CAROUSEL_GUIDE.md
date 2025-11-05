# 🎠 Carousel Image Setup Guide (AUTOMATIC)

## ✨ Automatic Image Discovery

The carousel now **automatically discovers ALL images** from the carousel folder!

## 📁 Where to Add Images

**Folder Location:** `src/assets/carousel/`

Simply add your image files to this folder and they will automatically appear in the carousel - **no configuration needed!**

## 🚀 How to Add New Images

### That's it! Just:

1. **Add your image file** to `src/assets/carousel/`
   - Name it however you like (e.g., `my-image.jpg`, `photo.png`, `hero-6.webp`)
2. **Refresh your browser** (or wait for hot reload)
3. **Done!** The image will automatically appear in the carousel

**No config file updates, no coding, nothing else needed!**

## 📋 Image Requirements

- **Formats Supported**: `.jpg`, `.jpeg`, `.png`, `.webp`
- **Recommended Resolution**: 1920x1080 or higher (16:9 aspect ratio)
- **File Size**: Keep under 500KB for best performance
- **Naming**: Any name works - images are sorted alphabetically

## 💡 Examples

### Adding a single image:
1. Copy `construction-site.jpg` to `src/assets/carousel/`
2. Refresh → Done!

### Adding multiple images:
1. Copy `worker-1.jpg`, `worker-2.jpg`, `worker-3.jpg` to `src/assets/carousel/`
2. Refresh → All appear automatically!

## 🔍 How It Works

The carousel uses Vite's `import.meta.glob` to automatically discover all images in the folder at build time. This means:

- ✅ All images in the folder are automatically included
- ✅ No manual configuration needed
- ✅ Images are optimized during build
- ✅ Works in both development and production

## 🎯 Current Setup

- **Folder**: `src/assets/carousel/`
- **Config File**: `src/config/carousel.js` (automatic - don't edit!)
- **Component**: `src/views/Home.vue`

## ❓ Troubleshooting

**Image not showing?**
- Make sure the file is in `src/assets/carousel/` (not `public/carousel/`)
- Check the file format (must be .jpg, .jpeg, .png, or .webp)
- Refresh your browser or restart the dev server
- Check browser console for errors

**Image too large/slow?**
- Compress your images before adding (use TinyPNG or Squoosh)
- Use WebP format for best compression
- Keep file sizes under 500KB each

**Need to remove an image?**
- Simply delete the file from `src/assets/carousel/`
- It will automatically disappear from the carousel

## 🎉 That's It!

Just add images to the folder and they'll appear automatically. No configuration, no hassle!
