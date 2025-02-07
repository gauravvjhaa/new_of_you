// file: src/components/shopping-view/ShoppingHeader.jsx

import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCartItems } from "@/store/shop/cart-slice";
import { logoutUser } from "@/store/auth-slice";
import {
  Avatar,
  AvatarFallback,
} from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Label } from "../ui/label";

import {
  HousePlug,
  LogOut,
  Menu,
  ShoppingCart,
  UserCog,
} from "lucide-react";

import Logo from "../../assets/Logo_transparent_Black.png";
import UserCartWrapper from "./cart-wrapper";

// ------------------------------------------
// 1. Define your updated menu items here
// ------------------------------------------
const menuItems = [
  {
    id: "home",
    label: "Home",
    path: "/shop/home",
  },
  {
    id: "women",
    label: "Women",
    path: "/shop/listing",
    subItems: [
      { id: "women-saree", label: "Saree" },
      { id: "women-suit", label: "Suit" },
      { id: "women-suit-piece", label: "Suit-Piece" },
      { id: "women-lehenga", label: "Lehenga" },
      { id: "women-kurti", label: "Kurti" },
    ],
  },
  {
    id: "kids",
    label: "Kids",
    path: "/shop/listing",
    subItems: [
      { id: "kids-lehenga", label: "Lehenga" },
      { id: "kids-anarkali", label: "Anarkali" },
      { id: "kids-shararaa", label: "Shararaa" },
      { id: "kids-kurta-set", label: "Kurta Set" },
      { id: "kids-dupatta", label: "Dupatta" },
    ],
  },
];

// ------------------------------------------
// 2. MenuItems component
// ------------------------------------------
function MenuItems() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  function handleNavigate(mainItem, subItem) {
    // If user clicks "Home"
    if (mainItem.id === "home" && !subItem) {
      navigate("/shop/home");
      return;
    }

    // Otherwise, set the filter based on either mainItem or subItem
    const categoryId = subItem ? subItem.id : mainItem.id;
    sessionStorage.removeItem("filters");
    sessionStorage.setItem("filters", JSON.stringify({ category: [categoryId] }));

    // If we are already on /shop/listing, we can update the search params
    // so it re-filters without a full reload
    if (location.pathname.includes("listing")) {
      setSearchParams(new URLSearchParams(`?category=${categoryId}`));
    } else {
      navigate("/shop/listing");
    }
  }

  return (
    <nav className="flex flex-col mb-3 lg:mb-0 lg:items-center gap-6 lg:flex-row">
      {menuItems.map((item) => (
        <div
          key={item.id}
          className="relative group" 
          // group is for hover styling in desktop
        >
          {/* Main label (clickable) */}
          <span
            onClick={() => handleNavigate(item)}
            className="text-sm font-medium cursor-pointer hover:underline"
          >
            {item.label}
          </span>

          {/* Only show sub-items if they exist */}
          {item.subItems && item.subItems.length > 0 && (
            <div
              // Hide by default, show on hover (desktop). 
              // On mobile, this block *will* appear in the Sheet, so it’ll be always visible.
              className="hidden group-hover:block absolute left-0 top-full bg-white border shadow px-4 py-2 mt-1 z-50"
            >
              {item.subItems.map((sub) => (
                <div
                  key={sub.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavigate(item, sub);
                  }}
                  className="py-1 px-2 hover:bg-gray-100 cursor-pointer"
                >
                  {sub.label}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}

// ------------------------------------------
// 3. HeaderRightContent
// ------------------------------------------
function HeaderRightContent() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const [openCartSheet, setOpenCartSheet] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  function handleLogout() {
    dispatch(logoutUser());
  }

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCartItems(user.id));
    }
  }, [dispatch, user?.id]);

  return (
    <div className="flex lg:items-center lg:flex-row flex-col gap-4">
      {/* Cart Button */}
      <Sheet open={openCartSheet} onOpenChange={() => setOpenCartSheet(false)}>
        <Button
          onClick={() => setOpenCartSheet(true)}
          variant="outline"
          size="icon"
          className="relative"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="absolute top-[-5px] right-[2px] font-bold text-sm">
            {cartItems?.items?.length || 0}
          </span>
          <span className="sr-only">User cart</span>
        </Button>
        <UserCartWrapper
          setOpenCartSheet={setOpenCartSheet}
          cartItems={cartItems?.items || []}
        />
      </Sheet>

      {/* Profile Section */}
      {isAuthenticated ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="bg-black cursor-pointer">
              <AvatarFallback className="bg-black text-white font-extrabold">
                {user?.userName ? user.userName[0].toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" className="w-56">
            <DropdownMenuLabel>Logged in as {user?.userName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/shop/account")}>
              <UserCog className="mr-2 h-4 w-4" />
              Account
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button
          variant="outline"
          onClick={() => navigate("/auth/login")}
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Login
        </Button>
      )}
    </div>
  );
}

// ------------------------------------------
// 4. ShoppingHeader Component
// ------------------------------------------
function ShoppingHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo and Home Link */}
        <Link to="/shop/home" className="flex items-center gap-2">
          <span className="w-36 h-36 overflow-hidden relative">
            <img src={Logo} alt="Logo" className="absolute w-10/12 h-auto" />
          </span>
        </Link>

        {/* Mobile Navigation (Sheet) */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle header menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full max-w-xs">
            <MenuItems />
            <HeaderRightContent />
          </SheetContent>
        </Sheet>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-10">
          <MenuItems />
        </div>

        {/* Desktop Right Side (cart, profile, etc.) */}
        <div className="hidden lg:block">
          <HeaderRightContent />
        </div>
      </div>
    </header>
  );
}

export default ShoppingHeader;
