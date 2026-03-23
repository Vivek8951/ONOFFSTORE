const fs = require('fs');
const file = 'frontend/src/components/Navbar.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `import { usePathname } from 'next/navigation';`,
  `import { usePathname } from 'next/navigation';\nimport { useState, useEffect } from 'react';`
);

content = content.replace(
  `const isLanding = pathname === '/';`,
  `const isLanding = pathname === '/';\n  const [cartCount, setCartCount] = useState(0);\n\n  useEffect(() => {\n    const updateCount = () => {\n      const saved = localStorage.getItem('onoff_cart');\n      if (saved) {\n        try { \n          const items = JSON.parse(saved);\n          setCartCount(items.reduce((acc, item) => acc + (item.qty || 1), 0));\n        } catch {}\n      } else { setCartCount(0); }\n    };\n    updateCount();\n    window.addEventListener('storage', updateCount);\n    return () => window.removeEventListener('storage', updateCount);\n  }, []);`
);

content = content.replace(
  `<span className="absolute -top-1.5 -right-1.5 bg-[#f21c43] text-white text-[7px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-black">2</span>`,
  `{cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-[var(--indian-maroon)] text-[var(--indian-gold)] border border-[var(--indian-gold)]/40 text-[7px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-serif font-semibold">{cartCount}</span>}`
);

fs.writeFileSync(file, content);
