// Finding WCAG-compliant orange variants

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(hex1, hex2) {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

console.log('=== ORANGE VARIANTS FOR WCAG COMPLIANCE ===\n');

const oranges = [
  { name: 'Original Orange', hex: '#F28C28', desc: 'Mayor\'s brand (too light)' },
  { name: 'Darker Orange 1', hex: '#E67E22', desc: 'Slightly darker' },
  { name: 'Darker Orange 2', hex: '#D97706', desc: 'Amber/Orange' },
  { name: 'Darker Orange 3', hex: '#DC7633', desc: 'Terra cotta orange' },
  { name: 'Darker Orange 4', hex: '#CA6F1E', desc: 'Burnt orange' }
];

oranges.forEach(orange => {
  const onWhite = getContrastRatio(orange.hex, '#ffffff');
  const onNavy = getContrastRatio(orange.hex, '#0A2E5C');
  console.log(`${orange.name} (${orange.hex}) - ${orange.desc}`);
  console.log(`  On White: ${onWhite.toFixed(2)}:1 ${onWhite >= 3.0 ? '✅' : '❌'} (need 3:1)`);
  console.log(`  On Navy:  ${onNavy.toFixed(2)}:1 ${onNavy >= 4.5 ? '✅' : '⚠️'}`);
  console.log('');
});

console.log('\n=== RECOMMENDATION ===');
console.log('Use darker variants for text/small elements');
console.log('Use #F28C28 for large buttons and backgrounds with white text');
