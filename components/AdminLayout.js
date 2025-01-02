import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";

const AdminLayout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    // Implement logout logic here
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-white shadow-lg">
        <div className="flex items-center justify-center h-20 shadow-md">
          <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
        </div>
        <ul className="flex flex-col py-4">
          <li>
            <Link href="/admin" className="flex items-center px-6 py-2 text-gray-700 hover:bg-gray-200">
              <span className="mx-3">Dashboard</span>
            </Link>
          </li>
          <li>
            <Link href="/admin/products" className="flex items-center px-6 py-2 text-gray-700 hover:bg-gray-200">
              <span className="mx-3">Products</span>
            </Link>
          </li>
          <li>
            <Link href="/admin/featured-products" className="flex items-center px-6 py-2 text-gray-700 hover:bg-gray-200">
              <span className="mx-3">Featured Products</span>
            </Link>
          </li>
          <li>
            <Link href="/admin/home-setting" className="flex items-center px-6 py-2 text-gray-700 hover:bg-gray-200">
              <span className="mx-3">Home Setting</span>
            </Link>
          </li>
          <li>
            <Link href="/admin/orders" className="flex items-center px-6 py-2 text-gray-700 hover:bg-gray-200">
              <span className="mx-3">Orders</span>
            </Link>
          </li>
          <li>
            <Link href="/admin/users" className="flex items-center px-6 py-2 text-gray-700 hover:bg-gray-200">
              <span className="mx-3">Users</span>
            </Link>
          </li>
        </ul>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navbar */}
        <header className="flex justify-between items-center p-4 bg-white shadow-md">
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Button onClick={handleLogout}>Logout</Button>
        </header>

        {/* Mobile sidebar */}
        {isOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsOpen(false)}></div>
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" onClick={() => setIsOpen(false)}>
                  <span className="sr-only">Close sidebar</span>
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {/* Mobile sidebar content */}
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4">
                  <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
                </div>
                <nav className="mt-5 px-2 space-y-1">
                  {/* Add mobile navigation items here */}
                  <Link href="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Dashboard</Link>
                  <Link href="/admin/products" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Products</Link>
                  <Link href="/admin/featured-products" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Featured Products</Link>
                  <Link href="/admin/home-setting" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Home Setting</Link>
                  <Link href="/admin/orders" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Orders</Link>
                  <Link href="/admin/users" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Users</Link>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
