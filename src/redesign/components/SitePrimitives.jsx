import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import styles from './SitePrimitives.module.css';

export function SiteNavShell({ children, className = '', ...props }) {
  return (
    <nav
      className={`flex w-full max-w-6xl items-center justify-between rounded-full border border-sky-400/15 bg-[#070b14]/85 py-2 pl-4 pr-2.5 shadow-[0_20px_50px_-15px_rgba(2,8,23,0.9),0_0_30px_-18px_rgba(56,189,248,0.35)] backdrop-blur-xl transition-colors duration-300 hover:border-sky-400/30 ${className}`}
      {...props}
    >
      {children}
    </nav>
  );
}

export function SiteKicker({ children, className = '', dot = true, ...props }) {
  return <p className={`${styles.kicker} ${className}`} {...props}>{dot && <span className={styles.dot}/>} {children}</p>;
}

export const SiteAction = forwardRef(function SiteAction({ to, href, variant = 'primary', className = '', children, type = 'button', ...props }, ref) {
  const Component = to ? Link : href ? 'a' : 'button';
  return <Component ref={ref} {...(to ? { to } : href ? { href } : { type })} className={`${styles.action} ${variant === 'primary' ? styles.primary : styles.secondary} ${className}`} {...props}>{children}</Component>;
});

export function BrowserChrome({ address, className = '', trailing = <ArrowUpRight size={15}/> }) {
  return <div className={`${styles.chrome} ${className}`}><span className={styles.dots} aria-hidden="true"><i/><i/><i/></span><span className={styles.address}>{address}</span>{trailing}</div>;
}

export function SiteSectionHeading({ eyebrow, title, description, action, className = '' }) {
  return <header className={`${styles.sectionHeading} ${className}`}><div>{eyebrow && <SiteKicker dot={false}>{eyebrow}</SiteKicker>}<h2>{title}</h2>{description && <p className={styles.description}>{description}</p>}</div>{action}</header>;
}
