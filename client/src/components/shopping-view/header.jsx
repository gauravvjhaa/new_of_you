// header.jsx
import React, { useEffect, useState } from "react";
import {
  HousePlug,
  LogOut,
  Menu,
  Search,
  ShoppingCart,
  UserCog,
} from "lucide-react";
import Logo from "../../assets/Logo_transparent_Black.png";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { shoppingViewHeaderMenuItems } from "@/config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { logoutUser } from "@/store/auth-slice";
import UserCartWrapper from "./cart-wrapper";
import { fetchCartItems } from "@/store/shop/cart-slice";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

/* -----------------------------------------------
 * MenuItems component: remains mostly the same
 * ----------------------------------------------- */
function MenuItems() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize activeDropdown state
  const [activeDropdown, setActiveDropdown] = useState(null);

  function handleNavigate(getCurrentMenuItem) {
    sessionStorage.removeItem("filters");
    const currentFilter =
      getCurrentMenuItem.id !== "home" &&
      getCurrentMenuItem.id !== "products" &&
      getCurrentMenuItem.id !== "search"
        ? {
            category: [getCurrentMenuItem.id],
          }
        : null;

    sessionStorage.setItem("filters", JSON.stringify(currentFilter));

    if (location.pathname.includes("listing") && currentFilter !== null) {
      setSearchParams(
        new URLSearchParams(`?category=${getCurrentMenuItem.id}`)
      );
    } else {
      navigate(getCurrentMenuItem.path);
    }
  }

  return (
    <nav className="flex flex-col mb-3 lg:mb-0 lg:items-center gap-6 lg:flex-row">
      {shoppingViewHeaderMenuItems.map((menuItem) => (
        <div
          key={menuItem.id}
          className="relative"
          onMouseEnter={() => setActiveDropdown(menuItem.id)}
          onMouseLeave={() => setActiveDropdown(null)}
        >
          <Label
            onClick={() => handleNavigate(menuItem)}
            className="text-sm font-medium cursor-pointer"
            tabIndex="0"
            onFocus={() => setActiveDropdown(menuItem.id)}
            onBlur={() => setActiveDropdown(null)}
          >
            {menuItem.label}
          </Label>
          {/* Dropdown Menu */}
          {menuItem.subItems && (
            <div
              className={`absolute top-5 mt-1 w-40 bg-white border rounded shadow-lg z-10 ${
                activeDropdown === menuItem.id
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-95 pointer-events-none"
              }`}
              role="menu"
              aria-label={`${menuItem.label} submenu`}
            >
              {menuItem.subItems.map((subItem) => (
                <Link
                  to={subItem.path}
                  key={subItem.id}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  {subItem.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}

/* -----------------------------------------------
 * HeaderRightContent component:
 * Now includes searchQuery, handleSearch, and a form
 * ----------------------------------------------- */
function HeaderRightContent() {
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);

  const [openCartSheet, setOpenCartSheet] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  function handleLogout() {
    dispatch(logoutUser());
  }

  // Handle search submission
  function handleSearch(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      // e.g. navigate to your listing route
      navigate(`/shop/listing?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCartItems(user.id));
    }
  }, [dispatch, user?.id]);

  return (
    <div className="flex lg:items-center lg:flex-row flex-col gap-4">
      {/* ------ Search form (Desktop) ------ */}
      <form
        onSubmit={handleSearch}
        className="hidden lg:flex items-center gap-2"
      >
        <Input
          placeholder="Search products..."
          className="w-48"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button type="submit" variant="outline" size="icon">
          <Search className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>
      </form>

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

      {/* If user is not logged in, show login button; if logged in, show avatar menu */}
      {!user ? (
        <Button onClick={() => navigate("/auth/login")}>
          <HousePlug className="h-4 w-4 mr-2" />
          Login
        </Button>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="bg-black cursor-pointer">
              <AvatarFallback className="bg-black text-white font-extrabold">
                {user?.userName?.[0]?.toUpperCase() || "U"}
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
      )}
    </div>
  );
}

/* -----------------------------------------------
 * ShoppingHeader component:
 * (Mostly unchanged, except we keep the new
 * search form in the mobile Sheet as well if desired)
 * ----------------------------------------------- */
function ShoppingHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <Link to="/shop/home" className="flex items-center gap-2">
          <span className="w-36 h-36 top-[42px] left-[42px] overflow-hidden relative">
            <img src={Logo} alt="Logo" className="absolute w-10/12 h-auto" />
          </span>
        </Link>

        {/* Mobile Menu Trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle header menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full max-w-xs">
            <MenuItems />
            {/* Mobile Search Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault(); /* add your own logic if you want mobile search to navigate */
              }}
              className="mt-4 space-y-2"
            >
              <Input placeholder="Search products..." />
              <Button type="submit" className="w-full">
                Search
              </Button>
            </form>

            {/* If you want the cart and user in the mobile sheet, you can place
                <HeaderRightContent /> or a portion of it here. */}
          </SheetContent>
        </Sheet>

        {/* Desktop Navigation */}
        <div className="hidden lg:block">
          <MenuItems />
        </div>

        {/* Right-side content (Search, Cart, User) */}
        <div className="hidden lg:block">
          <HeaderRightContent />
        </div>
      </div>
    </header>
  );
}

export default ShoppingHeader;
