const Jimp = require('jimp');
const potrace = require('potrace');
const fs = require('fs');

const imagePath = 'C:\\Users\\Muhammad Ali\\.gemini\\antigravity\\brain\\4b0f2d7e-2562-4c23-9ea5-8f7057a1e8f7\\media__1778080346284.jpg';

Jimp.read(imagePath, (err, image) => {
  if (err) throw err;
  
  // Make it high contrast to trace it properly. The logo is dark with gold on white background.
  image.color([{ apply: 'greyscale', params: [100] }])
       .contrast(0.8)
       .getBuffer(Jimp.MIME_PNG, (err, buffer) => {
    if (err) throw err;
    
    // Potrace tracing
    potrace.trace(buffer, { color: 'currentColor', threshold: 140, optTolerance: 0.4 }, (err, svg) => {
      if (err) throw err;
      fs.writeFileSync('public/logo.svg', svg);
      console.log('Logo vectorized successfully!');
    });
  });
});
