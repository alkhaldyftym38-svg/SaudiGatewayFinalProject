import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Heart, Globe, LogIn, UserPlus, LogOut, LayoutDashboard } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Navbar() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleLanguage, language, isRTL, favorites, sessionUser, logoutUser } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logoutUser();
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const links = [
    { to: '/', label: t('nav.home') },
    { to: '/assistant', label: t('nav.assistant') },
    { to: '/heritage', label: t('nav.heritage') },
    { to: '/events', label: t('nav.events') },
    { to: '/investment', label: t('nav.investment') },
    { to: '/about', label: t('nav.about') },
    { to: '/support', label: t('nav.support') },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const supportTo = sessionUser?.role === 'admin'
    ? '/admin/users?tab=messages'
    : '/support';

  const isSupportActive = sessionUser?.role === 'admin'
    ? location.pathname.startsWith('/admin/users') && new URLSearchParams(location.search).get('tab') === 'messages'
    : isActive('/support');

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface/80 dark:bg-on-surface/80 backdrop-blur-xl shadow-majlis">
        <div className="flex justify-between items-center px-4 sm:px-8 py-4 max-w-screen-2xl mx-auto w-full">
          <div className="flex items-center gap-6 md:gap-8">
            <Link
              to="/"
              className="text-xl sm:text-2xl font-black text-primary dark:text-primary-container tracking-tight font-headline"
            >
              Saudi Gateway
            </Link>
            <nav className="hidden md:flex items-center gap-6 font-semibold text-sm tracking-tight">
              {links.filter((l) => l.to !== '/support').map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`transition-colors pb-1 border-b-2 ${
                    isActive(link.to)
                      ? 'text-primary border-gold'
                      : 'text-on-surface-variant border-transparent hover:text-primary'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={toggleLanguage}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-surface-container transition-all cursor-pointer text-primary font-bold text-sm"
            >
              <Globe className="w-4 h-4" />
              EN/AR
            </button>
            <Link
              to="/favorites"
              className="relative p-2 hover:bg-surface-container rounded-xl transition-all"
              aria-label={t('nav.favorites')}
            >
              <Heart className="w-5 h-5 text-on-surface-variant" />
              {favorites.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-tertiary-container text-on-secondary-fixed text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.1rem] text-center">
                  {favorites.length}
                </span>
              )}
            </Link>
            {sessionUser ? (
              <>
                {sessionUser.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wide bg-primary/10 text-primary border border-primary/25 hover:bg-primary/20 transition-colors"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    {t('auth.adminBadge')}
                  </Link>
                )}
                <span className="hidden lg:inline max-w-[7rem] truncate text-sm font-semibold text-on-surface-variant" title={sessionUser.name}>
                  {sessionUser.name}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-primary hover:bg-surface-container transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  {t('auth.logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-primary hover:bg-surface-container transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  {t('auth.loginTitle')}
                </Link>
                <Link
                  to="/register"
                  className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold border-2 border-primary text-primary hover:bg-primary/5 transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  {t('auth.registerTitle')}
                </Link>
              </>
            )}
            <Link
              to={supportTo}
              className="hidden sm:inline-flex gold-gradient text-on-secondary-fixed px-5 py-2.5 rounded-full font-bold text-sm shadow-sm hover:brightness-105 active:scale-95 transition-all"
            >
              {t('nav.support')}
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-surface-container text-primary"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed top-[72px] left-0 right-0 z-40 bg-surface-container-low border-b border-outline-variant/20 shadow-majlis md:hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {links.map((link) => {
                const to = link.to === '/support' ? supportTo : link.to;
                const active = link.to === '/support' ? isSupportActive : isActive(link.to);
                return (
                  <Link
                    key={link.to}
                    to={to}
                    className={`py-3 px-3 rounded-xl font-semibold ${
                      active ? 'bg-surface-container text-primary' : 'text-on-surface-variant'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={toggleLanguage}
                className="flex items-center gap-2 py-3 px-3 text-primary font-bold text-left"
              >
                <Globe className="w-4 h-4" />
                {t('common.language')}
              </button>
              {sessionUser ? (
                <>
                  <div className="py-2 px-3 text-sm font-semibold text-on-surface-variant border-t border-outline-variant/20 mt-2 pt-3 flex flex-wrap items-center gap-2">
                    {sessionUser.role === 'admin' && (
                      <span className="inline-flex px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-primary/15 text-primary border border-primary/25">
                        {t('auth.adminBadge')}
                      </span>
                    )}
                    <span>{sessionUser.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleLogout();
                      setMobileOpen(false);
                    }}
                    className="flex items-center gap-2 py-3 px-3 text-primary font-bold"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('auth.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center gap-2 py-3 px-3 text-primary font-bold border-t border-outline-variant/20 mt-2 pt-3"
                  >
                    <LogIn className="w-4 h-4" />
                    {t('auth.loginTitle')}
                  </Link>
                  <Link to="/register" className="flex items-center gap-2 py-3 px-3 text-primary font-bold">
                    <UserPlus className="w-4 h-4" />
                    {t('auth.registerTitle')}
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
