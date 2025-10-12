import React from "react";
import { Sheet, SheetContent, SheetFooter } from "@/components/sheet";
import { Button, buttonVariants } from "@/components/ui/button";
import { MenuToggle } from "@/components/menu-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export function SimpleHeader() {
  const [open, setOpen] = React.useState(false);
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  const links = [
    {
      label: "About",
      href: "/about",
    }
  ];

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur-lg">
      <nav className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        <Link to="/home">
          <div className="flex items-center gap-2">
            <img
              src="https://res.cloudinary.com/dykzzd9sy/image/upload/v1760186291/lucifer_face_tdgrnv.png"
              className="size-6"
            />
            <p className="font-inter text-lg font-bold">Lucifer</p>
          </div>
        </Link>
        <div className="hidden items-center gap-2 lg:flex">
          {links.map((link) => (
            <a
              className={buttonVariants({ variant: "ghost" })}
              href={link.href}
            >
              {link.label}
            </a>
          ))}
          <Button variant="outline" onClick={() => {
            navigate("/home");
            // Scroll to features after navigation
            setTimeout(() => {
              const element = document.getElementById("features");
              element?.scrollIntoView({ behavior: "smooth" });
            }, 100);
          }}>
            Features
          </Button>
          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
              <Button variant="outline" className="hover:bg-red-400 dark:hover:bg-red-900 hover:text-white" onClick={logout}>Logout</Button>
              <span className="flex text-sm">
                <img 
                  src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                  alt={user.username}
                  title={user.username}
                  className="border-2 border-neutral-300 dark:border-neutral-800 w-9 h-9 rounded-sm"
                />
              </span>
            </div>
          ) : (
            <Button onClick={login} className="hover:cursor-pointer">Login with Discord</Button>
          )}
          <ThemeToggle />
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <Button size="icon" variant="outline" className="lg:hidden">
            <MenuToggle
              strokeWidth={2.5}
              open={open}
              onOpenChange={setOpen}
              className="size-6"
            />
          </Button>
          <SheetContent
            className="bg-background/95 supports-[backdrop-filter]:bg-background/80 gap-0 backdrop-blur-lg"
            showClose={false}
            side="left"
          >
            <div className="grid gap-y-2 overflow-y-auto px-4 pt-12 pb-5">
              <>
                <Link to="/home"
                  className={buttonVariants({
                    variant: "ghost",
                    className: "justify-start",
                  })}
                >
                  Home
                </Link>
                <Button 
                  className={buttonVariants({
                    variant: "ghost",
                    className: "justify-start bg-[transparent] text-black dark:text-white",
                  })} onClick={() => {
                    navigate("/home");
                    // Scroll to features after navigation
                    setTimeout(() => {
                      const element = document.getElementById("features");
                      element?.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                  }}
                >
                  Features
                </Button>
                {user ? (
                  <Link to="/dashboard"
                    className={buttonVariants({
                      variant: "ghost",
                      className: "justify-start",
                    })}
                  >
                    Dashboard
                  </Link>
                ) : (
                  <></>
                )}
                {links.map((link) => (
                  <a
                    className={buttonVariants({
                      variant: "ghost",
                      className: "justify-start",
                    })}
                    href={link.href}
                  >
                    {link.label}
                  </a>
                ))}
              </>
              
            </div>
            <SheetFooter>
              <div className="flex">
              {user ? (
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex w-full items-center gap-2">
                    <div className="flex items-center">
                      <ThemeToggle/>
                    </div>
                    <div className="flex">
                      <p className="text-3xl text-white font-light dark:text-neutral-800 pb-2">|</p>
                    </div>
                    <span className="flex text-sm gap-3">
                      <img 
                        src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                        alt={user.username}
                        title={user.username}
                        className="border-2 border-neutral-300 dark:border-neutral-800 w-9 h-9 rounded-md"
                      />
                      <div className="flex items-center w-full">
                        <p className="text-black dark:text-neutral-300 text-xl font-inter">{user.username}</p>
                      </div>
                    </span>
                  </div>
                  <Button variant="outline" className="w-full" onClick={logout}>Logout</Button>
                </div>
                
              ) : (
                <div className="flex flex-col gap-3 w-full">
                  <ThemeToggle/>
                  <Button onClick={login} className="flex w-full">Login with Discord</Button>
                </div>
              )}
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
