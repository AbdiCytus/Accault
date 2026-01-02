import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="flex flex-col justify-center items-center bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 py-5 mt-auto transition-colors">
      <div className="justify-center mx-auto px-4 py-5 flex gap-15">
        <div className="flex flex-col gap-3">
          <h3 className="text-md text-black dark:text-white">This Web</h3>
          <div className="flex gap-5">
            <div className="flex flex-col gap-3">
              <Link
                href="/privacy"
                className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                Terms of Service
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                href="/help"
                className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                Help
              </Link>
              <Link
                href="/about"
                className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                About
              </Link>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <h3 className="text-md text-black dark:text-white">Social</h3>
          <Link
            href="https://github.com/abdicytus"
            target="_blank"
            className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
            GitHub
          </Link>
          <Link
            href="https://www.linkedin.com/in/abdi-prayuda-8120aa368/"
            target="_blank"
            className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
            LinkedIn
          </Link>
        </div>
      </div>
      <p className="text-gray-500 dark:text-gray-400 pt-4 border-t max-w-max text-center text-sm">
        &copy; {year} Accault. All rights reserved.
      </p>
    </footer>
  );
}
