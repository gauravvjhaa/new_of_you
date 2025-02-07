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
 * MenuItems component
 * ----------------------------------------------- */
function MenuItems() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeDropdown, setActiveDropdown] = useState(null);

  function handleNavigate(getCurrentMenuItem) {
    sessionStorage.removeItem("filters");
    const currentFilter =
      getCurrentMenuItem.id !== "home"
        ? { category: [getCurrentMenuItem.id] }
        : null;

    sessionStorage.setItem("filters", JSON.stringify(currentFilter));

    if (location.pathname.includes("listing") && currentFilter !== null) {
      setSearchParams(new URLSearchParams(`?category=${getCurrentMenuItem.id}`));
    } else {
      navigate(getCurrentMenuItem.path);
    }
  }

  return (
    <nav className="flex flex-col mb-3 lg:mb-0 lg:items-center gap-6 lg:flex-row">
      {shoppingViewHeaderMenuItems
        .filter((item) => item.id !== "products") // Remove 'products' if needed
        .map((menuItem) => (
          <div
            key={menuItem.id}
            className="relative"
            onMouseEnter={() => setActiveDropdown(menuItem.id)}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <Label
              onClick={() => handleNavigate(menuItem)}
              className="text-sm font-medium cursor-pointer hover:text-primary transition-colors"
              tabIndex="0"
              onFocus={() => setActiveDropdown(menuItem.id)}
              onBlur={() => setActiveDropdown(null)}
            >
              {menuItem.label}
            </Label>

            {menuItem.subItems && (
              <div
                className={`absolute top-5 mt-1 w-80 bg-white border rounded-lg shadow-xl z-10 transition-all duration-200 ${
                  activeDropdown === menuItem.id
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-95 pointer-events-none"
                }`}
                role="menu"
              >
                <h3 className="text-lg font-semibold px-6 pt-4 pb-2 border-b">
                  {menuItem.label} Collection
                </h3>
                <div className="grid grid-cols-2 gap-4 p-4">
                  {menuItem.subItems.map((subItem) => (
                    <Link
                      to={subItem.path}
                      key={subItem.id}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <span className="ml-2">{subItem.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
    </nav>
  );
}

/* -----------------------------------------------
 * HeaderRightContent component
 * ----------------------------------------------- */
function HeaderRightContent() {
  const { user } = useSelector((state) => state.auth);
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
      {/* Cart */}
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

      {/* User Menu */}
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
 * ShoppingHeader component
 * ----------------------------------------------- */
function ShoppingHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left: Logo */}
        <Link to="/shop/home" className="flex items-center gap-2">
          <span className="w-36 h-36 top-[42px] left-[42px] overflow-hidden relative">
            <img src={Logo} alt="Logo" className="absolute w-10/12 h-auto" />
          </span>
        </Link>

        {/* Mobile Menu (includes mobile search) */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full max-w-xs">
            <MenuItems />
            {/* Mobile Search Form (remove if you don't want mobile search either) */}
            <form className="mt-4 space-y-2">
              <Input placeholder="Search products..." />
              <Button type="submit" className="w-full">
                Search
              </Button>
            </form>
          </SheetContent>
        </Sheet>

        {/* Desktop Navigation (center) */}
        <div className="hidden lg:block">
          <MenuItems />
        </div>

        {/* Right Content (cart, user menu, etc.) */}
        <div className="hidden lg:block">
          <HeaderRightContent />
        </div>
      </div>
    </header>
  );
}

export default ShoppingHeader;
