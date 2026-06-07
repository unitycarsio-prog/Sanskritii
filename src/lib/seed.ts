import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

const premiumLiveProducts = [
  { 
    name: 'Varanasi Swarna-Zari Pure Cotton Dhoti', 
    price: 2400, 
    description: 'Meticulously woven pure cotton Dhoti from the traditional handlooms of Varanasi, adorned with 2-inch pristine pure gold Zari borders suitable for all sacred rituals.', 
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80', 
    sellerName: 'Varanasi Handlooms Association', 
    sellerEmail: 'benares.weaves@sanskritii.in', 
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() 
  },
  { 
    name: 'Kerala Premium Double Kasavu Mundu', 
    price: 1550, 
    description: 'The authentic pristine white double Kerala Mundu (Mundu Set), woven with superfine 80s count combed organic cotton and rich premium gold zari margins.', 
    imageUrl: 'https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?w=600&q=80', 
    sellerName: 'Malabar Karalkada Weavers', 
    sellerEmail: 'kerala.mundu@sanskritii.in', 
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() 
  },
  { 
    name: 'Madhubani Hand-Painted Raw Silk Kurta', 
    price: 3800, 
    description: 'Rich Bhagalpur tussar raw silk long kurta, featuring exquisite hand-painted neck plackets and borders illustrating classic Mithila line art.', 
    imageUrl: 'https://images.unsplash.com/photo-1590736969955-71cb94801759?w=600&q=80', 
    sellerName: 'Bihar Craft Cooperative, Patna', 
    sellerEmail: 'bihar.art@sanskritii.in', 
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() 
  },
  { 
    name: 'Kanchipuram Silk Saree (Crimson Ruby)', 
    price: 18500, 
    description: 'Sumptuous pure mulberry silk bridal Kanchipuram Saree featuring majestic temple borders and gold-gilded weave motifs. Certified Silk Mark India.', 
    imageUrl: 'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?w=600&q=80', 
    sellerName: 'Kancheepuram Silk Guild', 
    sellerEmail: 'kanchi.silk@sanskritii.in', 
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() 
  },
  { 
    name: 'Sanganeri Indigo Block Print Kurta Set', 
    price: 2750, 
    description: 'Premium handspun breathable cotton Kurta paired with soft comfort pajamas, hand-printed with authentic organic natural indigo botanical dyes.', 
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80', 
    sellerName: 'Sanganer Printers Guild, Jaipur', 
    sellerEmail: 'jaipur.block@sanskritii.in', 
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() 
  },
];

const newProductNames = premiumLiveProducts.map(p => p.name);

export async function seedProducts() {
  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    
    // Purge any products whose names are NOT in our brand new premium Indian wear names
    for (const d of querySnapshot.docs) {
      const data = d.data();
      if (!newProductNames.includes(data.name)) {
        await deleteDoc(doc(db, 'products', d.id));
      }
    }

    // Capture the snapshot again
    const updatedSnapshot = await getDocs(collection(db, 'products'));
    const currentProductNames = updatedSnapshot.docs.map(doc => doc.data().name);

    // If any product isn't seeded, seed it
    for (const product of premiumLiveProducts) {
      if (!currentProductNames.includes(product.name)) {
        await addDoc(collection(db, 'products'), product);
      }
    }
  } catch (error) {
    console.warn('Seeding / Cleanup failed or skipped:', error);
  }
}

const premiumLiveReviews = [
  {
    name: 'Devendra Shastri',
    role: 'Pradhan Acharya, Vedic Sanskrit Vidyapeeth (Ujjain)',
    rating: 5,
    comment: 'The Varanasi Swarna-Zari Cotton Dhoti is of pure quality. Sourced 15 pairs for our upcoming Mahayajna; the handloom thread density and gold zari are completely ceremonial compliant.',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    name: 'Anjali Raghavan',
    role: 'Fine Textiles Historian (Chennai)',
    rating: 5,
    comment: 'Sublime luxury. Sanskritii’s Kerala double Kasavu mundu has the exact weight and traditional coarse weave characteristic of authentic hand-drawn looms. Will order again!',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    name: 'Vikramaditya Roy',
    role: 'Heritage Collector (Kolkata)',
    rating: 5,
    comment: 'Impressed with the Madhubani raw silk kurta. The hand-painted Mithila art on absolute non-composite silk is a spectacular display of true artisan lineage.',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export async function seedReviews() {
  try {
    const querySnapshot = await getDocs(collection(db, 'reviews'));
    
    // Purge any old reviews containing non-traditional titles like Credenza, Lamp or Vase
    for (const d of querySnapshot.docs) {
      const data = d.data();
      const commentLower = (data.comment || '').toLowerCase();
      if (commentLower.includes('credenza') || commentLower.includes('lamp') || commentLower.includes('vase') || commentLower.includes('table')) {
        await deleteDoc(doc(db, 'reviews', d.id));
      }
    }

    // Refresh query snapshot
    const updatedSnapshot = await getDocs(collection(db, 'reviews'));
    if (updatedSnapshot.empty) {
      for (const r of premiumLiveReviews) {
        await addDoc(collection(db, 'reviews'), r);
      }
    }
  } catch (error) {
    console.warn('Seeding reviews failed or skipped:', error);
  }
}
