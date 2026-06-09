import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
import type { ProductVariant } from '@/types/product.types';
import { useProduct } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { addToWishlist } from '@/lib/api/wishlist.api';
import { toast } from '@/lib/toast';
import { getApiError } from '@/lib/apiError';
import { ProductGallery } from '@/components/product/ProductGallery';
import { VariantSelector } from '@/components/product/VariantSelector';
import { PurchasePanel } from '@/components/product/PurchasePanel';
import { ProductTabs } from '@/components/product/ProductTabs';
import { StickyCartBar } from '@/components/product/StickyCartBar';
import { PriceDisplay } from '@/components/common/PriceDisplay';
import { StarRating } from '@/components/common/StarRating';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading, isError } = useProduct(slug);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [showSticky, setShowSticky] = useState(false);

  const variants = useMemo(() => product?.variants ?? [], [product]);
  const colors = useMemo(
    () => [...new Set(variants.map((v) => v.color).filter(Boolean) as string[])],
    [variants],
  );
  const sizes = useMemo(
    () => [...new Set(variants.map((v) => v.size).filter(Boolean) as string[])],
    [variants],
  );

  // Default selection once the product loads.
  useEffect(() => {
    if (!product) return;
    document.title = `${product.name} · ${APP_NAME}`;
    const def: ProductVariant | undefined = variants.find((v) => v.stock > 0) ?? variants[0];
    setSelectedColor(def?.color ?? null);
    setSelectedSize(def?.size ?? null);
    setQuantity(1);
  }, [product, variants]);

  const selectedVariant = useMemo(() => {
    if (variants.length === 0) return null;
    return (
      variants.find(
        (v) =>
          (colors.length === 0 || v.color === selectedColor) &&
          (sizes.length === 0 || v.size === selectedSize),
      ) ?? null
    );
  }, [variants, colors, sizes, selectedColor, selectedSize]);

  const isSizeAvailable = (size: string) =>
    variants.some((v) => v.size === size && (colors.length === 0 || v.color === selectedColor) && v.stock > 0);

  function handleColor(color: string) {
    setSelectedColor(color);
    // Keep size if still available, else pick first available for this colour.
    const stillOk = variants.some((v) => v.color === color && v.size === selectedSize && v.stock > 0);
    if (!stillOk) {
      const firstSize = variants.find((v) => v.color === color && v.stock > 0)?.size ?? null;
      setSelectedSize(firstSize);
    }
  }

  const price = selectedVariant?.price ?? product?.basePrice ?? 0;
  const maxStock = variants.length === 0 ? 99 : selectedVariant?.stock ?? 0;
  const inStock = variants.length === 0 ? true : (selectedVariant?.stock ?? 0) > 0;
  const needsVariant =
    (colors.length > 0 && !selectedColor) || (sizes.length > 0 && !selectedSize) || (variants.length > 0 && !selectedVariant);

  const mainImage = product?.images?.find((i) => i.isMain)?.url ?? product?.images?.[0]?.url ?? null;

  // Sticky bar appears once the purchase panel scrolls out of view.
  const panelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setShowSticky(!e.isIntersecting && e.boundingClientRect.top < 0), {
      threshold: 0,
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [product]);

  async function handleAddToCart() {
    if (!product) return;
    if (needsVariant || !inStock) {
      toast.error(!inStock ? 'This option is out of stock.' : 'Please select the available options.');
      return;
    }
    setAdding(true);
    try {
      await addToCart({
        productId: product.id,
        variantId: selectedVariant?.id ?? null,
        quantity,
        name: product.name,
        slug: product.slug,
        image: mainImage,
        unitPrice: price,
        size: selectedVariant?.size ?? null,
        color: selectedVariant?.color ?? null,
        maxStock,
      });
      toast.success('Added to your cart.');
    } catch (e) {
      toast.error(getApiError(e).message);
    } finally {
      setAdding(false);
    }
  }

  async function handleWishlist() {
    if (!product) return;
    if (!isAuthenticated) {
      toast.info('Sign in to save items.');
      navigate('/auth/login');
      return;
    }
    try {
      await addToWishlist(product.id);
      toast.success('Added to your wishlist.');
    } catch (e) {
      toast.error(getApiError(e).message);
    }
  }

  if (isLoading) {
    return (
      <div className="container grid gap-10 py-10 lg:grid-cols-2">
        <div className="skeleton aspect-[4/5] rounded-xl" />
        <div className="space-y-4">
          <div className="skeleton h-8 w-2/3 rounded" />
          <div className="skeleton h-5 w-1/3 rounded" />
          <div className="skeleton h-10 w-1/2 rounded" />
          <div className="skeleton h-32 w-full rounded" />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="container py-24 text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">Product not found</h1>
        <p className="mt-2 text-muted-foreground">It may have been removed or is no longer available.</p>
        <Link to="/" className="mt-4 inline-block text-gold-base hover:underline">Back to home</Link>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="size-3.5" />
        {product.category && (
          <>
            <Link to={`/shop/${product.category.slug}`} className="hover:text-foreground">
              {product.category.name}
            </Link>
            <ChevronRight className="size-3.5" />
          </>
        )}
        <span className="truncate text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <ProductGallery images={product.images ?? []} name={product.name} />

        <div>
          {product.brand && (
            <span className="text-sm uppercase tracking-wide text-muted-foreground">{product.brand}</span>
          )}
          <h1 className="mt-1 font-display text-2xl font-bold text-foreground">{product.name}</h1>
          <div className="mt-2">
            <StarRating
              value={product.reviewStats?.average ?? 0}
              count={product.reviewStats?.count ?? 0}
              size={16}
            />
          </div>

          <div className="mt-4">
            <PriceDisplay basePrice={price} comparePrice={product.comparePrice} size="lg" />
            <p className="mt-1 text-xs text-muted-foreground">Inclusive of all taxes</p>
          </div>

          <div className="my-6 h-px bg-border" />

          <VariantSelector
            colors={colors}
            sizes={sizes}
            selectedColor={selectedColor}
            selectedSize={selectedSize}
            onColor={handleColor}
            onSize={setSelectedSize}
            isSizeAvailable={isSizeAvailable}
          />

          <div className="my-6 h-px bg-border" />

          <div ref={panelRef}>
            <PurchasePanel
              maxStock={maxStock}
              inStock={inStock}
              quantity={quantity}
              setQuantity={setQuantity}
              onAddToCart={handleAddToCart}
              onWishlist={handleWishlist}
              adding={adding}
              needsVariant={needsVariant}
            />
          </div>
        </div>
      </div>

      <div className="mt-14">
        <ProductTabs product={product} />
      </div>

      <StickyCartBar
        visible={showSticky}
        name={product.name}
        image={mainImage}
        price={price}
        inStock={inStock}
        adding={adding}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
