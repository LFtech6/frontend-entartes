import './globals.css';

export const metadata = {
  title: "Ent'Artes — Backoffice",
  description: "Portal de gestão da escola de dança Ent'Artes",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
          async
        />
      </body>
    </html>
  );
}
