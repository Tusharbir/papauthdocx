import { Link } from 'react-router-dom';

const APP_NAME = process.env.REACT_APP_NAME || 'PapDocAuthX';
const SECURITY_EMAIL = process.env.REACT_APP_SECURITY_EMAIL || 'security@papdocauthx.com';
const STATUS_URL = process.env.REACT_APP_STATUS_URL || 'https://status.papdocauthx.com';
const TRUST_URL = process.env.REACT_APP_TRUST_URL || 'https://trust.papdocauthx.com';

const Footer = () => (
  <footer className="bg-slate-950 border-t border-white/10">
    <div className="max-w-[1400px] mx-auto px-6 py-12 grid gap-10 md:grid-cols-4 text-sm text-slate-300">
      <div>
        <p className="font-semibold text-white mb-3">{APP_NAME}</p>
        <p className="text-slate-400 text-sm">
          Zero-trust document verification stack with Merkle visibility, QR checkpoints, and automated workflows.
        </p>
      </div>
      <div>
        <p className="font-medium text-white mb-3">Platform</p>
        <div className="flex flex-col gap-2">
          <Link to="/demo" className="hover:text-white">Live demo</Link>
          <Link to="/docs" className="hover:text-white">Documentation</Link>
          <Link to="/verify" className="hover:text-white">Verifier portal</Link>
        </div>
      </div>
      <div>
        <p className="font-medium text-white mb-3">Resources</p>
        <div className="flex flex-col gap-2">
          <a href={`mailto:${SECURITY_EMAIL}`} className="hover:text-white">
            {SECURITY_EMAIL}
          </a>
          <a href={STATUS_URL} className="hover:text-white">
            Status page
          </a>
          <a href={TRUST_URL} className="hover:text-white">
            Trust center
          </a>
        </div>
      </div>
      <div>
        <p className="font-medium text-white mb-3">Legal</p>
        <div className="flex flex-col gap-2">
          <Link to="/docs#compliance" className="hover:text-white">Compliance</Link>
          <Link to="/docs#rbac" className="hover:text-white">RBAC model</Link>
          <Link to="/docs#api" className="hover:text-white">API usage</Link>
        </div>
      </div>
    </div>
    <div className="border-t border-white/5 py-4 text-center text-xs text-slate-500">
      © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
    </div>
  </footer>
);

export default Footer;
