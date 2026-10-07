/* js/components/Header.js
   Navigasi utama: logo, menu desktop, dan hamburger untuk mobile. */

const Header = ({ scrolled, menuOpen, setMenuOpen, scrollToId, activeId }) => (
  <header className={`sticky top-0 z-40 bg-[var(--red)] transition-shadow ${scrolled ? "shadow-lg shadow-black/20" : ""}`}>
    <Container className="flex items-center justify-between h-16 md:h-[72px]">
      <button onClick={() => scrollToId("beranda")} className="flex items-center gap-2.5 shrink-0">
        <span className="relative w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
          <ShieldIcon className="w-6 h-6 text-white" />
          <StarSolid className="w-3.5 h-3.5 text-[var(--gold)] absolute" />
        </span>
        <span className="leading-tight text-left">
          <span className="block text-white/80 text-[10px] tracking-wide">KELURAHAN</span>
          <span className="block font-display font-semibold text-white text-lg -mt-0.5">Matani Satu</span>
        </span>
      </button>

      <nav className="hidden md:flex items-center gap-1">
        {NAV_LINKS.map(link => (
          <button key={link.id} onClick={() => scrollToId(link.id)}
            className={`px-3.5 py-2 rounded-md text-sm transition-colors ${activeId === link.id ? "bg-white/15 text-white" : "text-white/85 hover:text-white hover:bg-white/10"}`}>
            {link.label}
          </button>
        ))}
      </nav>

      <button onClick={() => setMenuOpen(o => !o)} aria-label="Menu"
        className="md:hidden w-10 h-10 rounded-full hover:bg-white/10 text-white flex items-center justify-center transition-colors">
        {menuOpen ? <CloseIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
      </button>
    </Container>

    <div className={`md:hidden menu-panel ${menuOpen ? "open" : ""} bg-[var(--red-dark)]`}>
      <Container className="py-2 flex flex-col">
        {NAV_LINKS.map(link => (
          <button key={link.id} onClick={() => scrollToId(link.id)}
            className="text-left px-2 py-3 border-b border-white/10 text-white/90 text-sm flex items-center justify-between">
            {link.label}
            <ChevronRightIcon className="w-4 h-4 opacity-60" />
          </button>
        ))}
      </Container>
    </div>
  </header>
);
