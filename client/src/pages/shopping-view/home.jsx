import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products-slice";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { useNavigate } from "react-router-dom";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/components/ui/use-toast";
import ProductDetailsDialog from "@/components/shopping-view/product-details";

const categoriesWithCarousel = [
  {
    id: "women",
    label: "Women",
    images: [
      "/src/assets/1.png",
      "/src/assets/2.png",
      "/src/assets/3.png",
      "/src/assets/4.png",
      "/src/assets/5.png",
    ],
  },
  {
    id: "kids",
    label: "Kids",
    images: [
      "/src/assets/6.png",
      "/src/assets/7.png",
      "/src/assets/8.png",
      "/src/assets/9.png",
      "/src/assets/10.png",
    ],
  },
];

function ShoppingHome() {
  const [currentSlides, setCurrentSlides] = useState({ women: 0, kids: 0 });
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const { productList, productDetails } = useSelector(
    (state) => state.shopProducts
  );
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle carousel sync for "Women" and "Kids"
  useEffect(() => {
    if (hoveredCategory !== "women" && hoveredCategory !== "kids") {
      const timer = setInterval(() => {
        setCurrentSlides((prev) => ({
          women: (prev.women + 1) % categoriesWithCarousel[0].images.length,
          kids: (prev.kids + 1) % categoriesWithCarousel[1].images.length,
        }));
      }, 2000);
      return () => clearInterval(timer);
    }
  }, [hoveredCategory]);

  useEffect(() => {
    if (productDetails !== null) setOpenDetailsDialog(true);
  }, [productDetails]);

  useEffect(() => {
    dispatch(
      fetchAllFilteredProducts({
        filterParams: {},
        sortParams: "price-lowtohigh",
      })
    );
  }, [dispatch]);

  function handleNavigateToListingPage(getCurrentItem) {
    sessionStorage.removeItem("filters");
    const currentFilter = { category: [getCurrentItem.id] };
    sessionStorage.setItem("filters", JSON.stringify(currentFilter));
    navigate(`/shop/listing`);
  }

  function handleGetProductDetails(getCurrentProductId) {
    dispatch(fetchProductDetails(getCurrentProductId));
  }

  function handleAddtoCart(getCurrentProductId) {
    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          title: "Product is added to cart",
        });
      }
    });
  }

  return (
    <div className="flex flex-col min-h-screen">
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Shop by category</h2>
          <div className="md:grid grid-cols md:grid-cols-2 lg:grid-cols-2 gap-4">
            {categoriesWithCarousel.map((category, index) => (
              <Card
                key={category.id}
                onMouseEnter={() => setHoveredCategory(category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
                onClick={() => handleNavigateToListingPage(category)}
                className="cursor-pointer hover:shadow-lg transition-shadow h-full"
              >
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <span
                    className="font-medium text-4xl text-gray-900 text-center mb-4"
                    style={{ fontFamily: '"Fleur De Leah", serif' }}
                    >{category.label}</span>
                  <div className="relative w-full h-screen overflow-hidden">
                    <img
                      src={
                        category.id === "women"
                          ? category.images[currentSlides.women]
                          : category.images[currentSlides.kids]
                      }
                      alt={`${category.label} carousel`}
                      className="absolute top-0 left-0 w-full h-full object-cover transition-all duration-1000 ease-in-out"
                      style={{
                        animation: 'fadeInOut 1s ease-in-out infinite',
                        opacity: hoveredCategory === category.id ? 1 : 0.8,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Best Selling Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productList && productList.length > 0
              ? productList.map((productItem) => (
                  <ShoppingProductTile
                    key={productItem.id}
                    handleGetProductDetails={handleGetProductDetails}
                    product={productItem}
                    handleAddtoCart={handleAddtoCart}
                  />
                ))
              : null}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Feature Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productList && productList.length > 0
              ? productList.map((productItem) => (
                  <ShoppingProductTile
                    key={productItem.id}
                    handleGetProductDetails={handleGetProductDetails}
                    product={productItem}
                    handleAddtoCart={handleAddtoCart}
                  />
                ))
              : null}
          </div>
        </div>
      </section>

      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
      />
    </div>
  );
}

export default ShoppingHome;
