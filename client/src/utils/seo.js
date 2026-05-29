/**
 * Enhanced SEO utilities for SaveTheServe
 */

// Page-specific SEO configurations
export const seoConfigs = {
  home: {
    title: 'Food Rescue Platform',
    description: 'Connect with restaurants and NGOs to rescue surplus food and serve communities. Join SaveTheServe to reduce food waste and fight hunger.',
    keywords: 'food rescue, food waste, NGO, restaurants, community service, food donation, sustainability, hunger relief',
  },

  login: {
    title: 'Sign In',
    description: 'Sign in to your SaveTheServe account to continue rescuing food and serving communities.',
    noIndex: true,
  },

  register: {
    title: 'Create Account',
    description: 'Join SaveTheServe as an NGO or restaurant to start rescuing surplus food and helping communities in need.',
    keywords: 'sign up, register, NGO registration, restaurant registration, food rescue, join SaveTheServe',
  },

  'ngo-dashboard': {
    title: 'NGO Dashboard',
    description: 'Browse available food listings, create rescue requests, and track your community impact.',
    keywords: 'NGO dashboard, food requests, available food, food rescue impact, community service',
    noIndex: true,
  },

  'donor-dashboard': {
    title: 'Restaurant Dashboard',
    description: 'Manage your food donations, handle pickup requests, and track your positive impact.',
    keywords: 'restaurant dashboard, food donations, surplus food, donation impact, food waste reduction',
    noIndex: true,
  },

  'admin-dashboard': {
    title: 'Admin Dashboard',
    description: 'Platform administration and monitoring for SaveTheServe food rescue operations.',
    noIndex: true,
  },

  'food-listings': {
    title: 'Available Food Donations',
    description: 'Browse surplus food available for rescue from restaurants and food donors near you.',
    keywords: 'available food, surplus food, food listings, food rescue, food donations near me',
  },
};

/**
 * Generate SEO props for a specific page
 */
export const generateSEOProps = (pageKey, data = {}) => {
  const config = seoConfigs[pageKey] || {};
  
  return {
    ...config,
    title: data.title || config.title,
    description: data.description || config.description,
    keywords: data.keywords || config.keywords,
    noIndex: data.noIndex || config.noIndex || false,
  };
};

/**
 * Generate structured data for different page types
 */
export const generateStructuredData = (type, data) => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://savetheserve.com';
  
  const schemas = {
    organization: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'SaveTheServe',
      description: 'Food rescue platform connecting restaurants and NGOs to reduce waste and fight hunger',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/images/logo.png`,
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Customer Service',
        email: 'support@savetheserve.com',
      },
      areaServed: {
        '@type': 'Country',
        name: 'India',
      },
      serviceType: 'Food Rescue and Distribution',
    },
    
    foodListing: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: data.title,
      description: data.description,
      category: 'Food',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
      },
      brand: {
        '@type': 'Organization',
        name: data.restaurantName || 'SaveTheServe Partner',
      },
    },
    
    breadcrumb: (items) => ({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: `${baseUrl}${item.url}`,
      })),
    }),
    
    webpage: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: data.title,
      description: data.description,
      url: data.url,
      isPartOf: {
        '@type': 'WebSite',
        name: 'SaveTheServe',
        url: baseUrl,
      },
    },
  };
  
  return schemas[type] || schemas.organization;
};

/**
 * Generate Open Graph metadata
 */
export const generateOpenGraphMeta = ({
  title,
  description,
  image,
  url,
  type = 'website',
  siteName = 'SaveTheServe'
}) => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://savetheserve.com';
  const defaultImage = `${baseUrl}/images/og-image.jpg`;
  
  return {
    'og:type': type,
    'og:title': title,
    'og:description': description,
    'og:image': image || defaultImage,
    'og:url': url,
    'og:site_name': siteName,
    'og:locale': 'en_US',
  };
};

/**
 * Generate Twitter Card metadata
 */
export const generateTwitterMeta = ({
  title,
  description,
  image,
  card = 'summary_large_image'
}) => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://savetheserve.com';
  const defaultImage = `${baseUrl}/images/og-image.jpg`;
  
  return {
    'twitter:card': card,
    'twitter:title': title,
    'twitter:description': description,
    'twitter:image': image || defaultImage,
  };
};