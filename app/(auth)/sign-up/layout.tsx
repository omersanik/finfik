export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children} {/* No Navbar */}
      </body>
    </html>
  );
}
