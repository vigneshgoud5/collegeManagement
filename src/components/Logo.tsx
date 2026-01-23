export function Logo({ 
  size = 80, 
  useImage = false, 
  imageSrc 
}: { 
  size?: number; 
  useImage?: boolean; 
  imageSrc?: string;
}) {
  // If using an image file, render img tag
  if (useImage && imageSrc) {
    return (
      <img
        src={imageSrc}
        alt="GNIT Logo"
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          display: 'block',
          flexShrink: 0,
        }}
      />
    );
  }

  // SVG logo: GNT with N as open book with flying birds
  // Based on the provided logo description
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', flexShrink: 0 }}
    >
      {/* Letter G - Red */}
      <text
        x="10"
        y="145"
        fontFamily="Arial, sans-serif"
        fontSize="110"
        fontWeight="bold"
        fill="#ef4444"
      >
        G
      </text>
      
      {/* Stylized N - Open Book with Flying Birds (between G and T) */}
      <g transform="translate(70, 25)">
        {/* Book - Left page (connects to G) */}
        <path
          d="M 0 130 L 0 50 L 12 38 L 24 50 L 24 130 Z"
          fill="white"
          stroke="#1e293b"
          strokeWidth="2.5"
        />
        {/* Book - Right page (connects to T) */}
        <path
          d="M 24 130 L 24 50 L 36 38 L 48 50 L 48 130 Z"
          fill="white"
          stroke="#1e293b"
          strokeWidth="2.5"
        />
        {/* Book spine (center vertical line connecting the pages) */}
        <line x1="24" y1="38" x2="24" y2="130" stroke="#1e293b" strokeWidth="3" />
        {/* Book pages detail lines */}
        <line x1="6" y1="50" x2="6" y2="130" stroke="#1e293b" strokeWidth="1.5" opacity="0.5" />
        <line x1="12" y1="45" x2="12" y2="130" stroke="#1e293b" strokeWidth="1.5" opacity="0.5" />
        <line x1="18" y1="50" x2="18" y2="130" stroke="#1e293b" strokeWidth="1.5" opacity="0.5" />
        <line x1="30" y1="50" x2="30" y2="130" stroke="#1e293b" strokeWidth="1.5" opacity="0.5" />
        <line x1="36" y1="45" x2="36" y2="130" stroke="#1e293b" strokeWidth="1.5" opacity="0.5" />
        <line x1="42" y1="50" x2="42" y2="130" stroke="#1e293b" strokeWidth="1.5" opacity="0.5" />
        
        {/* Birds flying from the top right of the book (black silhouettes) */}
        <g transform="translate(42, 20)">
          {/* Bird 1 */}
          <path
            d="M 0 0 Q -3 -5 -6 -3 Q -3 -1 0 0"
            fill="#1e293b"
          />
          {/* Bird 2 */}
          <path
            d="M 5 -1.5 Q 2 -6.5 -1 -4.5 Q 2 -3 5 -1.5"
            fill="#1e293b"
          />
          {/* Bird 3 */}
          <path
            d="M 10 -3 Q 7 -8 4 -6 Q 7 -4.5 10 -3"
            fill="#1e293b"
          />
          {/* Bird 4 */}
          <path
            d="M 15 -4.5 Q 12 -9.5 9 -7.5 Q 12 -6 15 -4.5"
            fill="#1e293b"
          />
        </g>
      </g>
      
      {/* Letter T - Red */}
      <text
        x="130"
        y="145"
        fontFamily="Arial, sans-serif"
        fontSize="110"
        fontWeight="bold"
        fill="#ef4444"
      >
        T
      </text>
    </svg>
  );
}
