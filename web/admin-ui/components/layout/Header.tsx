import Image from "next/image";

export default function Header() {
  return (
    <header className="app-header">
      <div className="center">
        <div className="header-search">
          <span className="icon" aria-hidden>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </span>
          <input aria-label="Search" placeholder="Search machines, inventory..." />
        </div>
      </div>

      <div className="header-actions">
        <button className="bell" aria-label="Notifications">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 1 0-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="badge" />
        </button>

        <div className="header-divider" />

        <div className="profile">
          <div className="avatar">
            <Image src="/Pao.png" alt="Admin" width={36} height={36} />
          </div>
          <div className="name">Admin</div>
        </div>
      </div>
    </header>
  );
}

