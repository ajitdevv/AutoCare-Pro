import Link from "next/link";
import { Car, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                <Car className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">AutoCare Pro</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your one-stop solution for car servicing and auto parts. Book
              services, buy parts, and track your vehicle history.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/services" className="hover:text-white transition-colors">Book a Service</Link></li>
              <li><Link href="/parts" className="hover:text-white transition-colors">Parts Store</Link></li>
              <li><Link href="/vehicles" className="hover:text-white transition-colors">My Vehicles</Link></li>
              <li><Link href="/bookings" className="hover:text-white transition-colors">My Bookings</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/services?cat=maintenance" className="hover:text-white transition-colors">General Service</Link></li>
              <li><Link href="/services?cat=maintenance" className="hover:text-white transition-colors">Oil Change</Link></li>
              <li><Link href="/services?cat=repair" className="hover:text-white transition-colors">Brake Repair</Link></li>
              <li><Link href="/services?cat=diagnostics" className="hover:text-white transition-colors">Engine Diagnostics</Link></li>
              <li><Link href="/services?cat=tires" className="hover:text-white transition-colors">Tire Replacement</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-primary-light" />
                support@autocarepro.com
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-primary-light" />
                +91 98765 43210
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-primary-light" />
                123 Auto Street, Car City
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-8 text-center text-sm text-gray-500">
          <span>&copy; {new Date().getFullYear()} AutoCare Pro. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
