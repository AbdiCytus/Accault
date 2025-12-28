export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <p className="text-gray-500 text-sm">
          &copy; {year} Account Manager. All rights reserved.
        </p>
        <div className="mt-2 space-x-4 text-xs text-gray-400">
          <a href="#" className="hover:text-gray-600">
            Privacy Policy
          </a>
          <span className="text-gray-300">•</span>
          <a href="#" className="hover:text-gray-600">
            Terms of Service
          </a>
          <span className="text-gray-300">•</span>
          <a
            href="https://github.com/abdicytus"
            target="_blank"
            className="hover:text-gray-600">
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
