import React from "react";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  BookOpen,
  Bot,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clipboard,
  Clock,
  Cog,
  Crown,
  EyeOff,
  Facebook,
  FileText,
  Globe,
  Home,
  Inbox,
  Info,
  Linkedin,
  Mail,
  MailCheck,
  MailPlus,
  Plus,
  RefreshCw,
  Scale,
  Search,
  Send,
  Settings,
  Shield,
  ShieldCheck,
  Smartphone,
  SlidersHorizontal,
  Twitter,
  User,
  UserCheck,
  X,
  XCircle,
  Zap,
} from "lucide-react";

const ICON_MAP = {
  // Font Awesome aliases used in the project
  "fa-shield-alt": Shield,
  "fa-bolt": Zap,
  "fa-question-circle": Info,
  "fa-home": Home,
  "fa-envelope": Mail,
  "fa-newspaper": FileText,
  "fa-info-circle": Info,
  "fa-sync-alt": RefreshCw,
  "fa-exchange-alt": ArrowUpDown,
  "fa-trash-alt": XCircle,
  "fa-user-shield": UserCheck,
  "fa-chevron-right": ChevronRight,
  "fa-paper-plane": Send,
  "fa-inbox": Inbox,
  "fa-history": Clock,
  "fa-cog": Cog,
  "fa-crown": Crown,
  "fa-clock": Clock,
  "fa-sim-card": Smartphone,
  "fa-book": BookOpen,
  "fa-balance-scale": Scale,
  "fa-code-branch": Bot,
  "fa-chevron-down": ChevronDown,
  "fa-twitter": Twitter,
  "fa-facebook-f": Facebook,
  "fa-instagram": Globe,
  "fa-linkedin-in": Linkedin,
  "fa-github": Globe,

  // Bootstrap icon aliases used in the project
  "bi-shield-check": ShieldCheck,
  "bi-arrow-right-circle": ArrowRight,
  "bi-clock": Clock,
  "bi-calendar3": Calendar,
  "bi-arrow-right": ArrowRight,
  "bi-exclamation-triangle-fill": AlertTriangle,
  "bi-calendar": Calendar,
  "bi-twitter": Twitter,
  "bi-linkedin": Linkedin,
  "bi-arrow-up": ArrowUp,
  "bi-envelope": Mail,
  "bi-chevron-up": ChevronUp,
  "bi-chevron-down": ChevronDown,
  "bi-search": Search,
  "bi-x": X,
  "bi-envelope-fill": Mail,
  "bi-check2": Check,
  "bi-clipboard": Clipboard,
  "bi-arrow-clockwise": RefreshCw,
  "bi-inbox": Inbox,
  "bi-inbox-fill": Inbox,
  "bi-plus-lg": Plus,
  "bi-lightning-charge-fill": Zap,
  "bi-envelope-plus-fill": MailPlus,
  "bi-person": User,
  "bi-sliders": SlidersHorizontal,
  "bi-check-circle": CheckCircle2,
  "bi-browser-chrome": Globe,
  "bi-database-x": Settings,
  "bi-eye-slash": EyeOff,
  "bi-x-circle": XCircle,
  "bi-envelope-check": MailCheck,
};

const SIZE_MAP = {
  "fs-1": 40,
};

function pickToken(iconClass = "") {
  const tokens = iconClass.split(/\s+/).filter(Boolean);
  return tokens.find((t) => t.startsWith("fa-") || t.startsWith("bi-"));
}

function pickSize(iconClass = "", size) {
  if (size) return size;
  const tokens = iconClass.split(/\s+/).filter(Boolean);
  for (const token of tokens) {
    if (SIZE_MAP[token]) return SIZE_MAP[token];
  }
  return 18;
}

const AppIcon = ({ iconClass = "", className = "", size, ...props }) => {
  const token = pickToken(iconClass || className);
  const Icon = ICON_MAP[token] || Info;
  const mergedClass = [iconClass, className].filter(Boolean).join(" ");

  return <Icon className={mergedClass} size={pickSize(iconClass || className, size)} aria-hidden="true" {...props} />;
};

export default AppIcon;
