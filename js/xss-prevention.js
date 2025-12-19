/**
 * XSS Prevention Utility
 * Provides HTML encoding, input validation, and safe DOM manipulation
 */

const XSSPrevention = {
    /**
     * HTML encode text to prevent XSS attacks
     * Converts special characters to HTML entities
     * @param {string} text - Text to encode
     * @returns {string} - HTML-encoded text
     */
    encodeHTML(text) {
        if (text === null || text === undefined) {
            return '';
        }
        
        const div = document.createElement('div');
        div.textContent = String(text);
        return div.innerHTML;
    },

    /**
     * Encode URL parameters to prevent XSS
     * @param {string} param - URL parameter to encode
     * @returns {string} - Encoded parameter
     */
    encodeURLParam(param) {
        if (param === null || param === undefined) {
            return '';
        }
        return encodeURIComponent(String(param));
    },

    /**
     * Decode URL parameters safely
     * @param {string} param - URL parameter to decode
     * @returns {string} - Decoded parameter
     */
    decodeURLParam(param) {
        if (param === null || param === undefined) {
            return '';
        }
        try {
            return decodeURIComponent(String(param));
        } catch (e) {
            console.warn('XSSPrevention: Failed to decode URL parameter', e);
            return String(param);
        }
    },

    /**
     * Safely set text content (prevents innerHTML XSS)
     * @param {HTMLElement} element - Target element
     * @param {string} text - Text to set
     */
    setTextContent(element, text) {
        if (!element) {
            console.warn('XSSPrevention.setTextContent: element is null');
            return;
        }
        element.textContent = text === null || text === undefined ? '' : String(text);
    },

    /**
     * Safely create element with text content
     * @param {string} tagName - HTML tag name
     * @param {string} text - Text content
     * @param {string} className - Optional CSS class
     * @returns {HTMLElement} - Created element
     */
    createElement(tagName, text = '', className = '') {
        const element = document.createElement(tagName);
        if (text) {
            element.textContent = String(text);
        }
        if (className) {
            element.className = className;
        }
        return element;
    },

    /**
     * Validate and sanitize user input
     * @param {string} input - User input
     * @param {number} maxLength - Maximum allowed length
     * @returns {string} - Sanitized input
     */
    sanitizeInput(input, maxLength = 1000) {
        if (input === null || input === undefined) {
            return '';
        }
        
        let sanitized = String(input).trim();
        
        // Limit length
        if (sanitized.length > maxLength) {
            sanitized = sanitized.substring(0, maxLength);
        }
        
        return sanitized;
    },

    /**
     * Strip HTML tags from text
     * @param {string} html - HTML string
     * @returns {string} - Plain text
     */
    stripHTML(html) {
        if (html === null || html === undefined) {
            return '';
        }
        const div = document.createElement('div');
        div.innerHTML = String(html);
        return div.textContent || div.innerText || '';
    },

    /**
     * Validate URL to prevent javascript: and data: URIs
     * @param {string} url - URL to validate
     * @returns {boolean} - True if URL is safe
     */
    isValidURL(url) {
        if (!url) return false;
        
        const urlStr = String(url).toLowerCase().trim();
        
        // Block dangerous protocols
        const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
        for (const protocol of dangerousProtocols) {
            if (urlStr.startsWith(protocol)) {
                return false;
            }
        }
        
        return true;
    },

    /**
     * Safely set href attribute
     * @param {HTMLElement} element - Link element
     * @param {string} url - URL to set
     */
    setSafeHref(element, url) {
        if (!element) {
            console.warn('XSSPrevention.setSafeHref: element is null');
            return;
        }
        
        if (this.isValidURL(url)) {
            element.href = url;
        } else {
            console.warn('XSSPrevention.setSafeHref: Invalid URL blocked', url);
            element.href = '#';
        }
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.XSSPrevention = XSSPrevention;
}
