import { QRCodeSVG } from "qrcode.react";

/**
 * Component that renders a grid of QR codes for all public pages.
 * Users can scan a QR code to navigate directly to the corresponding page.
 */
const PageQrLinks = () => {
  const pages = [
    { name: "Home", path: "/" },
    { name: "Rooms", path: "/rooms" },
    { name: "Room Detail", path: "/room/101" }, // Example room ID
    { name: "Menu", path: "/menu" },
    { name: "Menu Detail", path: "/menu/1" }, // Example menu ID
    { name: "Services", path: "/services" },
    { name: "Bookings", path: "/bookings" },
    { name: "About Us", path: "/about" },
    { name: "Amenities", path: "/amenities" },
    { name: "Amenity Detail", path: "/amenity/1" }, // Example amenity ID
    { name: "Lookup", path: "/lookup" },
    { name: "Reviews", path: "/reviews" },
    { name: "Contact", path: "/contact" },
    { name: "Profile", path: "/profile" },
  ];

  const BASE_URL = "https://yaduvanshiprince2007.github.io/reactapp";

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8 text-navy-600">
        Public Page QR Codes
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages.map((page) => {
          const url = `${BASE_URL}/#${page.path}`;

          return (
            <div
              key={page.path}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 flex flex-col items-center hover:shadow-xl transition-shadow"
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                {page.name}
              </h2>

              <QRCodeSVG
                value={url}
                size={160}
                bgColor="#ffffff"
                fgColor="#1a202c"
                level="M"
                includeMargin
              />

              <p className="mt-4 text-xs text-gray-500 break-all text-center">
                {url}
              </p>

              <button
                onClick={() => navigator.clipboard.writeText(url)}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition"
              >
                Copy Link
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PageQrLinks;