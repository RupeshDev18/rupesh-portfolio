import React from 'react';
import { Helmet } from 'react-helmet-async';
import portfolioData from '../../data/data.json';

const SEO = ({ title, description, image, url }) => {
  const siteTitle = title ? `${title} | ${portfolioData.name}` : `${portfolioData.name} - Portfolio`;
  const siteDescription = description || portfolioData.summary;
  const siteImage = image || "https://rupesh-yadav.fun/og-image.jpg"; // Fallback image
  const siteUrl = url || "https://rupesh-yadav.fun";

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{siteTitle}</title>
      <meta name="description" content={siteDescription} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={siteDescription} />
      <meta property="og:image" content={siteImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={siteUrl} />
      <meta property="twitter:title" content={siteTitle} />
      <meta property="twitter:description" content={siteDescription} />
      <meta property="twitter:image" content={siteImage} />
    </Helmet>
  );
};

export default SEO;
