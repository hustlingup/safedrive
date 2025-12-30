// Simple minification script for production deployment
// This script removes comments and unnecessary whitespace from CSS and JS files
// For production, consider using professional tools like Terser (JS) and cssnano (CSS)

const fs = require('fs');
const path = require('path');

// Simple CSS minification
function minifyCSS(css) {
    return css
        // Remove comments
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Remove unnecessary whitespace
        .replace(/\s+/g, ' ')
        // Remove spaces around special characters
        .replace(/\s*([{}:;,>+~])\s*/g, '$1')
        // Remove trailing semicolons
        .replace(/;}/g, '}')
        .trim();
}

// Simple JS minification (basic - for production use Terser)
function minifyJS(js) {
    return js
        // Remove single-line comments (but preserve URLs)
        .replace(/(?<!:)\/\/.*$/gm, '')
        // Remove multi-line comments
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Remove unnecessary whitespace (preserve strings)
        .replace(/\s+/g, ' ')
        .trim();
}

// Read, minify, and write CSS
try {
    const cssContent = fs.readFileSync('styles.css', 'utf8');
    const minifiedCSS = minifyCSS(cssContent);
    fs.writeFileSync('styles.min.css', minifiedCSS);
    // console.log('CSS minified successfully');
    // console.log(`Original: ${cssContent.length} bytes`);
    // console.log(`Minified: ${minifiedCSS.length} bytes`);
    // console.log(`Saved: ${((1 - minifiedCSS.length / cssContent.length) * 100).toFixed(1)}%`);
} catch (error) {
    console.error('Error minifying CSS:', error.message);
}

// Read, minify, and write JS
try {
    const jsContent = fs.readFileSync('script.js', 'utf8');
    const minifiedJS = minifyJS(jsContent);
    fs.writeFileSync('script.min.js', minifiedJS);
    // console.log('JavaScript minified successfully');
    // console.log(`Original: ${jsContent.length} bytes`);
    // console.log(`Minified: ${minifiedJS.length} bytes`);
    // console.log(`Saved: ${((1 - minifiedJS.length / jsContent.length) * 100).toFixed(1)}%`);
} catch (error) {
    console.error('Error minifying JavaScript:', error.message);
}

// console.log('Note: For production deployment, use professional minification tools:');
// console.log('- JavaScript: Terser (npm install -g terser)');
// console.log('- CSS: cssnano or clean-css');
// console.log('To use minified files, update HTML to reference:');
// console.log('- styles.min.css instead of styles.css');
// console.log('- script.min.js instead of script.js');
