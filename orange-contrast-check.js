// Orange #F28C28 Contrast Verification

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

console.log('=== ORANGE #F28C28 CONTRAST VERIFICATION ===\n');
console.log('WCAG AA: 4.5:1 normal text, 3:1 large text (18pt+)\n');

console.log('1. ORANGE BACKGROUNDS:');
console.log('   White text on Orange #F28C28:', getContrastRatio('#ffffff', '#F28C28').toFixed(2) + ':1', 
  getContrastRatio('#ffffff', '#F28C28') >= 3.0 ? '✅ Pass (Large Text)' : '❌ Fail');

console.log('\n2. ORANGE TEXT:');
console.log('   Orange #F28C28 on White:', getContrastRatio('#F28C28', '#ffffff').toFixed(2) + ':1', 
  getContrastRatio('#F28C28', '#ffffff') >= 3.0 ? '✅ Pass (Large Text)' : '❌ Fail');
console.log('   Orange #F28C28 on Navy #0A2E5C:', getContrastRatio('#F28C28', '#0A2E5C').toFixed(2) + ':1', 
  getContrastRatio('#F28C28', '#0A2E5C') >= 4.5 ? '✅ Pass (Normal Text)' : '⚠️ Large Text Only');

console.log('\n3. ORANGE LIGHT VARIANT:');
console.log('   White text on Orange Light #FFA459:', getContrastRatio('#ffffff', '#FFA459').toFixed(2) + ':1', 
  getContrastRatio('#ffffff', '#FFA459') >= 3.0 ? '✅ Pass (Large Text)' : '❌ Fail');

console.log('\n4. COMPARISONS:');
console.log('   Orange vs Previous Red #c0392b on White:', getContrastRatio('#c0392b', '#ffffff').toFixed(2) + ':1');
console.log('   Orange vs Previous Gold #F39C12 on White:', getContrastRatio('#F39C12', '#ffffff').toFixed(2) + ':1');

console.log('\n=== VERIFICATION COMPLETE ===');
