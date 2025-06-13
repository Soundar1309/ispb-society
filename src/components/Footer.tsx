
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    about: [
      { name: 'Genesis', href: '/genesis' },
      { name: 'Office Bearers', href: '/office-bearers' },
      { name: 'Mandate & Activities', href: '/mandate-activities' },
      { name: 'Contact Us', href: '/contact' }
    ],
    resources: [
      { name: 'Publications', href: '/publications' },
      { name: 'Conferences', href: '/conference' },
      { name: 'Life Members', href: '/life-members' },
      { name: 'Membership', href: '/membership' }
    ],
    support: [
      { name: 'Help Center', href: '#' },
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'Sitemap', href: '#' }
    ]
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Organization Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">I</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">ISPB</h3>
                <p className="text-sm text-gray-400">Indian Society of Plant Breeders</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Advancing plant breeding science for sustainable agriculture and food security 
              through research, education, and collaboration.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                <span className="text-sm">📘</span>
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                <span className="text-sm">🐦</span>
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                <span className="text-sm">💼</span>
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                <span className="text-sm">📧</span>
              </a>
            </div>
          </div>

          {/* About Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">About ISPB</h4>
            <ul className="space-y-2">
              {footerLinks.about.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Information */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-3">Headquarters</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                Division of Genetics<br />
                Indian Agricultural Research Institute<br />
                New Delhi - 110012, India
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-3">Contact</h4>
              <p className="text-gray-400 text-sm">
                Phone: +91-11-2584-0000<br />
                Email: info@ispb.org.in<br />
                Web: www.ispb.org.in
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-3">Office Hours</h4>
              <p className="text-gray-400 text-sm">
                Monday - Friday: 9:00 AM - 5:00 PM<br />
                Saturday: 9:00 AM - 1:00 PM<br />
                Sunday: Closed
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} Indian Society of Plant Breeders. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
