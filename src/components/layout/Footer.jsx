import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaYoutube } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div>
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">C</span>
                            </div>
                            <span className="text-xl font-bold text-white">Coursen</span>
                        </Link>
                        <p className="text-sm text-gray-400 leading-relaxed mb-4">
                            Empowering learners and instructors worldwide with high-quality, accessible online education.
                        </p>
                        <div className="flex gap-3">
                            {[FaFacebookF, FaTwitter, FaLinkedinIn, FaYoutube].map((Icon, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-primary-600 transition-colors duration-200"
                                >
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2.5">
                            {['Home', 'Courses', 'About Us', 'Contact'].map((link) => (
                                <li key={link}>
                                    <Link to="/" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">
                                        {link}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Categories</h4>
                        <ul className="space-y-2.5">
                            {['Web Development', 'Data Science', 'UI/UX Design', 'Cloud Computing'].map((cat) => (
                                <li key={cat}>
                                    <Link to="/courses" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">
                                        {cat}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Support</h4>
                        <ul className="space-y-2.5">
                            {['Help Center', 'Terms of Service', 'Privacy Policy', 'FAQ'].map((item) => (
                                <li key={item}>
                                    <Link to="/" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-text-secondary">Â© 2026 Coursen. All rights reserved.</p>
                    <p className="text-sm text-text-secondary">Made with FCI Team¸ for learners everywhere</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

