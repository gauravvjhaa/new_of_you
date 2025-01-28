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
      "/src/assets/6.jpg",
      "/src/assets/7.png",
      "/src/assets/8.jpeg",
      "/src/assets/9.jpg",
      "/src/assets/10.jpg",
    ],
  },
];

function ShoppingHome() {
  const [currentSlideWomen, setCurrentSlideWomen] = useState(0);
  const [currentSlideKids, setCurrentSlideKids] = useState(0);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const { productList, productDetails } = useSelector(
    (state) => state.shopProducts
  );
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle "Women" carousel
  useEffect(() => {
    if (hoveredCategory !== "women") {
      const timer = setInterval(() => {
        setCurrentSlideWomen(
          (prev) => (prev + 1) % categoriesWithCarousel[0].images.length
        );
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [hoveredCategory]);

  // Handle "Kids" carousel
  useEffect(() => {
    if (hoveredCategory !== "kids") {
      const timer = setInterval(() => {
        setCurrentSlideKids(
          (prev) => (prev + 1) % categoriesWithCarousel[1].images.length
        );
      }, 1000);
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categoriesWithCarousel.map((category, index) => (
              <Card
                key={category.id}
                onMouseEnter={() => setHoveredCategory(category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
                onClick={() => handleNavigateToListingPage(category)}
                className="cursor-pointer hover:shadow-lg transition-shadow"
              >
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="relative w-full h-80 overflow-hidden mb-4">
                    <img
                      src={
                        category.id === "women"
                          ? category.images[currentSlideWomen]
                          : category.images[currentSlideKids]
                      }
                      alt={`${category.label} carousel`}
                      className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-2000 transform translate-x-0 ease-in-out"
                    />
                  </div>
                  <span className="font-bold text-center">{category.label}</span>
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
