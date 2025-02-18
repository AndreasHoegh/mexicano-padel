<nav className="bg-white/10 text-white p-2 md:p-4">
  <div className="flex items-center justify-between w-full">
    <Link href="/">
      <span className="font-bold text-base md:text-xl hover:text-yellow-400">
        PadelAmericano
      </span>
    </Link>

    <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm">
      {isAuthenticated && (
        <Link href="/tournament-history">
          <span className="hover:text-yellow-400 hidden sm:inline">
            Tournament History
          </span>
        </Link>
      )}

      {isAuthenticated ? (
        <div className="flex items-center gap-2">
          <span className="text-green-300">
            Hello,{" "}
            <span className="font-semibold">{user?.username || "User"}</span>
          </span>
          <span
            onClick={logout}
            className="hover:text-yellow-400 cursor-pointer"
          >
            Logout
          </span>
        </div>
      ) : (
        <Link href="/login">
          <span className="hover:text-yellow-400 cursor-pointer">
            Login/Register
          </span>
        </Link>
      )}
    </div>
  </div>
</nav>;
