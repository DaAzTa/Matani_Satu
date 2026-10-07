/* js/icons.js
   Semua komponen ikon (gaya garis ala Lucide, dibuat manual dengan SVG
   supaya tidak bergantung pada library ikon eksternal). Di-load paling
   awal karena file data.js dan komponen lain memakainya. */

const Icon = ({ children, className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
       strokeLinecap="round" strokeLinejoin="round" className={className}>
    {children}
  </svg>
);
const SolidIcon = ({ children, className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className}>{children}</svg>
);

const MenuIcon  = p => <Icon {...p}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></Icon>;
const CloseIcon = p => <Icon {...p}><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></Icon>;
const SearchIcon= p => <Icon {...p}><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></Icon>;
const ChevronRightIcon = p => <Icon {...p}><polyline points="9 6 15 12 9 18"/></Icon>;
const ArrowRightIcon = p => <Icon {...p}><line x1="4" y1="12" x2="19" y2="12"/><polyline points="13 6 19 12 13 18"/></Icon>;
const PhoneIcon = p => <Icon {...p}><path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.3 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1L6.6 10.8z"/></Icon>;
const MailIcon  = p => <Icon {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="3 7 12 13 21 7"/></Icon>;
const MapPinIcon= p => <Icon {...p}><path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11z"/><circle cx="12" cy="10" r="2.4"/></Icon>;
const ClockIcon = p => <Icon {...p}><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 16 14"/></Icon>;
const UsersIcon = p => <Icon {...p}><circle cx="9" cy="8" r="3.2"/><path d="M3.3 20c0-3.3 2.9-5.8 6.5-5.8s6.5 2.5 6.5 5.8"/><circle cx="17.3" cy="9" r="2.5"/><path d="M20.6 20c0-2.6-1.8-4.7-4.2-5.4"/></Icon>;
const MapAreaIcon = p => <Icon {...p}><polygon points="3 6 9 4 15 6 21 4 21 18 15 20 9 18 3 20 3 6"/><line x1="9" y1="4" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="20"/></Icon>;
const LayersIcon = p => <Icon {...p}><polygon points="12 3 21 8 12 13 3 8 12 3"/><polyline points="3 14 12 19 21 14"/><polyline points="3 11 12 16 21 11"/></Icon>;
const HomeIcon = p => <Icon {...p}><path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9a1 1 0 0 0 1 1h4v-5h2v5h4a1 1 0 0 0 1-1v-9"/></Icon>;
const IdCardIcon = p => <Icon {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="11" r="2"/><line x1="5.5" y1="16" x2="11.5" y2="16"/><line x1="14" y1="9" x2="19" y2="9"/><line x1="14" y1="12.5" x2="19" y2="12.5"/></Icon>;
const FileTextIcon = p => <Icon {...p}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><polyline points="14 3 14 8 19 8"/><line x1="8.5" y1="13" x2="15.5" y2="13"/><line x1="8.5" y1="17" x2="13.5" y2="17"/></Icon>;
const Building2Icon = p => <Icon {...p}><rect x="4" y="3" width="9" height="18" rx="1"/><rect x="13" y="9" width="7" height="12" rx="1"/><line x1="7" y1="7" x2="7.01" y2="7"/><line x1="10" y1="7" x2="10.01" y2="7"/><line x1="7" y1="11" x2="7.01" y2="11"/><line x1="10" y1="11" x2="10.01" y2="11"/><line x1="7" y1="15" x2="7.01" y2="15"/><line x1="10" y1="15" x2="10.01" y2="15"/></Icon>;
const CertificateIcon = p => <Icon {...p}><circle cx="12" cy="9" r="6"/><polyline points="9 9 11 11 15 6.5"/><path d="M8.3 14.5 5.8 21l6.2-3 6.2 3-2.5-6.5"/></Icon>;
const LeafIcon = p => <Icon {...p}><path d="M20 4C10 4 4 10 4 18c0 .6.4 1 1 1 8 0 14-6 14-14 0-.6-.4-1-1-1z"/><path d="M5 19c3-6 8-10 14-13"/></Icon>;
const FishIcon = p => <Icon {...p}><path d="M3 12c4-5 9-7 13-5 2 1 3.2 3 4 5-.8 2-2 4-4 5-4 2-9 0-13-5z"/><circle cx="15.3" cy="10.6" r="0.6" fill="currentColor" stroke="none"/><path d="M20 12c1-1 2-1.6 2-1.6S21 13 20 13.6"/></Icon>;
const StoreIcon = p => <Icon {...p}><path d="M3.5 9 4.5 4h15l1 5"/><path d="M4.2 9v10a1 1 0 0 0 1 1h13.6a1 1 0 0 0 1-1V9"/><path d="M9.3 20v-6.5h5.4V20"/><line x1="3.5" y1="9" x2="20.5" y2="9"/></Icon>;
const CalendarIcon = p => <Icon {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><line x1="16" y1="3" x2="16" y2="7"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="3" y1="10" x2="21" y2="10"/></Icon>;
const MegaphoneIcon = p => <Icon {...p}><path d="M3 11v2a2 2 0 0 0 2 2h1l1 5h2l-1-5h2l9 4V6l-9 4H6a2 2 0 0 0-2 2z"/><path d="M16 8.5v7"/></Icon>;
const ShieldIcon = p => <Icon {...p}><path d="M12 2 4 5v6c0 5 3.4 8.7 8 11 4.6-2.3 8-6 8-11V5l-8-3z"/></Icon>;
const StarSolid = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className}><polygon fill="currentColor" points="12 6.2 13.4 9.9 17.4 10.1 14.2 12.6 15.3 16.5 12 14.2 8.7 16.5 9.8 12.6 6.6 10.1 10.6 9.9"/></svg>
);
const FacebookIcon = p => <SolidIcon {...p}><path d="M15 8h2V5h-2a4 4 0 0 0-4 4v2H9v3h2v7h3v-7h2.3l.5-3H14V9c0-.6.4-1 1-1z"/></SolidIcon>;
const XLogoIcon = p => <SolidIcon {...p}><path d="M4 4l7.2 8.6L4.4 20H7l5.6-6.1L17 20h3l-7.6-9.1L19.4 4H17l-5.2 5.7L7.6 4H4z"/></SolidIcon>;
const InstagramIcon = p => <Icon {...p}><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></Icon>;
const YoutubeIcon = p => <SolidIcon {...p}><path d="M22 8.5s-.2-1.6-.8-2.3c-.8-.8-1.7-.8-2.1-.9C16.4 5 12 5 12 5s-4.4 0-7.1.3c-.4.1-1.3.1-2.1.9C2.2 6.9 2 8.5 2 8.5S1.8 10.4 1.8 12.3v1.4c0 1.9.2 3.8.2 3.8s.2 1.6.8 2.3c.8.8 1.9.8 2.4.9 1.7.2 7.3.3 7.3.3s4.4 0 7.1-.3c.4-.1 1.3-.1 2.1-.9.6-.7.8-2.3.8-2.3s.2-1.9.2-3.8v-1.4c0-1.9-.2-3.8-.2-3.8zM10 15.3V8.7l6 3.3-6 3.3z"/></SolidIcon>;
const PlayIcon = p => <SolidIcon {...p}><path d="M8 5.5v13a1 1 0 0 0 1.5.9l10.2-6.5a1 1 0 0 0 0-1.7L9.5 4.6A1 1 0 0 0 8 5.5z"/></SolidIcon>;
const ImageIcon = p => <Icon {...p}><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.8"/><path d="m21 16-5.2-5.2a1 1 0 0 0-1.4 0L4 21"/></Icon>;
const VideoIcon = p => <Icon {...p}><rect x="2.5" y="6" width="13" height="12" rx="2"/><path d="m15.5 10.5 6-3.5v10l-6-3.5"/></Icon>;
const ChevronLeftIcon = p => <Icon {...p}><polyline points="15 6 9 12 15 18"/></Icon>;
const ExternalLinkIcon = p => <Icon {...p}><path d="M14 4h6v6"/><line x1="20" y1="4" x2="11" y2="13"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></Icon>;
const UserIcon = p => <Icon {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></Icon>;
const CompassIcon = p => <Icon {...p}><circle cx="12" cy="12" r="9"/><polygon points="15.5 8.5 13.5 13.5 8.5 15.5 10.5 10.5 15.5 8.5"/></Icon>;
const ICONS = { MapArea: MapAreaIcon, Users: UsersIcon, Home: HomeIcon, Layers: LayersIcon };
