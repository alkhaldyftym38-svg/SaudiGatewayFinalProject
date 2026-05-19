import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe, MessageCircle, Share2, Mail, Phone, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Footer() {
  const { t } = useTranslation();
  const { sessionUser } = useApp();

  const platform = [
    { label: t('nav.home'), to: '/' },
    { label: t('nav.heritage'), to: '/heritage' },
    { label: t('nav.events'), to: '/events' },
    { label: t('nav.investment'), to: '/investment' },
  ];

  const services = [
    { label: t('nav.support'), to: '/support' },
    { label: t('nav.favorites'), to: '/favorites' },
    { label: t('nav.about'), to: '/about' },
    ...(sessionUser
      ? []
      : [
          { label: t('auth.loginTitle'), to: '/login' },
          { label: t('auth.registerTitle'), to: '/register' },
        ]),
  ];

  return (
    <footer className="bg-surface-container w-full mt-auto border-t border-outline-variant/15">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 px-6 sm:px-12 py-14 max-w-screen-2xl mx-auto">
        <div>
          <Link to="/" className="text-xl font-bold text-on-surface mb-4 block font-headline">
            Saudi Gateway
          </Link>
          <p className="text-on-surface-variant text-sm mb-6 leading-relaxed max-w-xs">
            {t('hero.subtitle').slice(0, 160)}…
          </p>
          <div className="flex gap-3">
            {[Globe, MessageCircle, Share2].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm hover:bg-primary hover:text-on-primary transition-all"
                aria-label="social"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest text-primary font-bold mb-5">Platform</h4>
          <ul className="space-y-3 font-semibold text-on-surface-variant text-sm">
            {platform.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="hover:text-primary underline-offset-4 hover:underline transition-opacity opacity-90 hover:opacity-100"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest text-primary font-bold mb-5">Services</h4>
          <ul className="space-y-3 font-semibold text-on-surface-variant text-sm">
            {services.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="hover:text-primary underline-offset-4 hover:underline transition-opacity opacity-90 hover:opacity-100"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest text-primary font-bold mb-5">Contact</h4>
          <ul className="space-y-3 font-semibold text-on-surface-variant text-sm">
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary shrink-0" />
              hello@saudigateway.sa
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary shrink-0" />
              +966 800 123 4567
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              Riyadh, Saudi Arabia
            </li>
          </ul>
        </div>
      </div>

      <div className="px-6 sm:px-12 py-6 border-t border-outline-variant/15 flex flex-col sm:flex-row justify-between items-center gap-4 text-on-surface-variant text-sm max-w-screen-2xl mx-auto">
        <p>© {new Date().getFullYear()} Saudi Gateway. All rights reserved.</p>
        <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest">
          <Link to="/about" className="hover:text-primary">
            Legal
          </Link>
          <span className="hover:text-primary cursor-pointer">Privacy</span>
          <span className="hover:text-primary cursor-pointer">Terms</span>
        </div>
      </div>
    </footer>
  );
}
