function ProductCard({ recommendation }) {
  const { product, reason } = recommendation;

  if (!product) return null;

  // Determine THC badge color
  const getThcBadgeColor = (thc) => {
    if (!thc) return 'bg-gray-100 text-gray-600';
    if (thc < 15) return 'bg-gray-100 text-gray-600';
    if (thc < 25) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-amber-100 text-amber-800 border-amber-300';
  };

  // Get product type icon
  const getProductIcon = (category) => {
    const cat = category?.toLowerCase() || '';
    if (cat.includes('flower')) return '🌿';
    if (cat.includes('pre-roll') || cat.includes('preroll')) return '🚬';
    if (cat.includes('edible') || cat.includes('gummy') || cat.includes('chocolate')) return '🍬';
    if (cat.includes('vape') || cat.includes('cart')) return '💨';
    if (cat.includes('concentrate') || cat.includes('wax') || cat.includes('shatter')) return '💎';
    return '🌿';
  };

  // Generate fallback URL if no direct product link
  const getShopUrl = (product) => {
    // If we have a direct product link, use it
    if (product.dutchieUrl) {
      return product.dutchieUrl;
    }

    // Otherwise, create a fallback URL
    const baseUrl = 'https://cannabishealing.com';
    
    // Try category-based URL (most specific)
    if (product.category) {
      const category = product.category.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      return `${baseUrl}/products?category=${encodeURIComponent(product.category)}`;
    }
    
    // Try brand-based URL
    if (product.brand) {
      return `${baseUrl}/brands?search=${encodeURIComponent(product.brand)}`;
    }
    
    // Final fallback - just go to products page
    return `${baseUrl}/products`;
  };

  const shopUrl = getShopUrl(product);
  const hasDirectLink = !!product.dutchieUrl;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md hover:border-ch-gold/40 transition-all duration-200">
      {/* Horizontal Layout: Image Left, Content Right */}
      <div className="flex gap-3 p-3">
        {/* Thumbnail Image */}
        <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = `<div class="flex items-center justify-center h-full text-2xl bg-gradient-to-br from-ch-gold/10 to-ch-gold-light/10">${getProductIcon(product.category)}</div>`;
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-2xl bg-gradient-to-br from-ch-gold/10 to-ch-gold-light/10">
              {getProductIcon(product.category)}
            </div>
          )}
        </div>

        {/* Content Stack */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          {/* Title & Brand */}
          <div>
            <h4 className="font-semibold text-sm text-gray-900 leading-tight mb-0.5 truncate">
              {product.name}
            </h4>
            <p className="text-xs text-gray-500">{product.brand}</p>
          </div>

          {/* Metadata Row: THC, Strain, Price */}
          <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
            {product.thcPercent && (
              <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getThcBadgeColor(product.thcPercent)}`}>
                <span className="text-[10px]">⚡</span>
                {product.thcPercent.toFixed(1)}%
              </span>
            )}
            {product.strain && product.strain !== 'N/A' && (
              <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-[10px] font-medium">
                {product.strain}
              </span>
            )}
            <span className="ml-auto inline-flex items-center px-2 py-0.5 bg-ch-gold/20 text-ch-black rounded-full text-[10px] font-bold">
              ${product.price}
            </span>
          </div>
        </div>
      </div>

      {/* Short Description */}
      <div className="px-3 pb-2">
        <p className="text-[11px] text-gray-600 leading-snug italic line-clamp-2">
          {reason}
        </p>
      </div>

      {/* Compact CTA Button */}
      <div className="px-3 pb-3">
        <a
          href={shopUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center px-3 py-1.5 bg-white hover:bg-gradient-to-r hover:from-ch-gold/10 hover:to-ch-gold-light/10 text-gray-700 hover:text-ch-black text-xs font-medium rounded-lg transition-all duration-200 border border-gray-300 hover:border-ch-gold"
          title={hasDirectLink ? 'View this product' : `Browse ${product.category || product.brand || 'our menu'}`}
        >
          {hasDirectLink ? 'View on Menu →' : `Browse ${product.category || 'Menu'} →`}
        </a>
      </div>
    </div>
  );
}

export default ProductCard;

