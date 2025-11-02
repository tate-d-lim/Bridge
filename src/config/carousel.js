/**
 * Carousel Configuration
 * 
 * This file automatically discovers ALL images from the src/assets/carousel/ folder.
 * Simply add your image files to src/assets/carousel/ and they will automatically appear in the carousel!
 * 
 * To add new images:
 * 1. Add your image file to src/assets/carousel/ folder
 * 2. Refresh the page - it will automatically appear!
 * 
 * Supported formats: .jpg, .jpeg, .png, .webp
 */

// Use Vite's import.meta.glob to automatically discover ALL images in the carousel folder
// This works at build time and will pick up any images you add to src/assets/carousel/
const carouselModules = import.meta.glob('../assets/carousel/*.{jpg,jpeg,png,webp}', { 
  eager: true,
  import: 'default'
})

/**
 * Get all carousel images automatically
 * This function discovers ALL images in src/assets/carousel/ at build time
 */
export const getCarouselImagesFromConfig = () => {
  // Extract image paths and create image objects
  const images = Object.keys(carouselModules).map((path, index) => {
    // Get the filename from the path for alt text
    const filename = path.split('/').pop().replace(/\.(jpg|jpeg|png|webp)$/i, '')
    
    // Create a readable alt text from filename
    const altText = filename
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim() || `Carousel Image ${index + 1}`
    
    return {
      src: carouselModules[path],
      alt: altText
    }
  })
  
  // Sort by filename to ensure consistent order
  return images.sort((a, b) => {
    const filenameA = a.src.split('/').pop()
    const filenameB = b.src.split('/').pop()
    return filenameA.localeCompare(filenameB)
  })
}
