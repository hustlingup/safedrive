# XSS Prevention Quick Reference Guide

## ⚠️ NEVER DO THIS

```javascript
// ❌ DANGEROUS - XSS vulnerability
element.innerHTML = userInput;
element.innerHTML = `<div>${data}</div>`;
element.innerHTML = '<span>' + message + '</span>';

// ❌ DANGEROUS - Inline event handlers with user data
element.setAttribute('onclick', `handleClick('${userData}')`);
```

## ✅ ALWAYS DO THIS

### 1. For Plain Text
```javascript
// ✅ SAFE - Use textContent
element.textContent = userInput;
```

### 2. For Structured Content
```javascript
// ✅ SAFE - Create elements programmatically
const div = document.createElement('div');
div.className = 'message';

const span = document.createElement('span');
span.textContent = userInput;

div.appendChild(span);
element.appendChild(div);
```

### 3. For URL Parameters
```javascript
// ✅ SAFE - Encode parameters
const url = `/page?param=${encodeURIComponent(userInput)}`;

// ✅ SAFE - Decode parameters
const params = new URLSearchParams(window.location.search);
const value = params.get('param'); // Already decoded
const sanitized = Validator.sanitizePlateNumber(value);
```

### 4. For Links
```javascript
// ✅ SAFE - Validate URLs
if (XSSPrevention.isValidURL(url)) {
    link.href = url;
} else {
    link.href = '#';
}

// Or use the helper
XSSPrevention.setSafeHref(link, url);
```

### 5. For User Input
```javascript
// ✅ SAFE - Sanitize input
const sanitized = XSSPrevention.sanitizeInput(userInput, 1000);
element.textContent = sanitized;
```

## Common Patterns

### Clearing Content
```javascript
// ✅ SAFE
container.textContent = '';

// ❌ AVOID
container.innerHTML = '';
```

### Creating Lists
```javascript
// ✅ SAFE
const list = document.createElement('ul');
items.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item.name;
    list.appendChild(li);
});
container.appendChild(list);

// ❌ DANGEROUS
container.innerHTML = items.map(item => 
    `<li>${item.name}</li>`
).join('');
```

### Adding Icons with Text
```javascript
// ✅ SAFE
const button = document.createElement('button');
const icon = document.createElement('span');
icon.textContent = '🔔';
button.appendChild(icon);
button.appendChild(document.createTextNode(' Subscribe'));

// ❌ DANGEROUS
button.innerHTML = '🔔 Subscribe';
```

### Static HTML (Safe Exception)
```javascript
// ✅ SAFE - Only static HTML, no user input
const template = document.createElement('div');
template.innerHTML = `
    <div class="header">
        <h1>Static Title</h1>
        <p>Static description</p>
    </div>
`;
```

## XSSPrevention Utility Functions

```javascript
// HTML encoding
const safe = XSSPrevention.encodeHTML(userInput);

// URL encoding
const encoded = XSSPrevention.encodeURLParam(param);
const decoded = XSSPrevention.decodeURLParam(param);

// Safe text setting
XSSPrevention.setTextContent(element, text);

// Safe element creation
const el = XSSPrevention.createElement('div', 'text content', 'css-class');

// Input sanitization
const clean = XSSPrevention.sanitizeInput(input, maxLength);

// Strip HTML tags
const plainText = XSSPrevention.stripHTML(htmlString);

// URL validation
if (XSSPrevention.isValidURL(url)) { /* safe to use */ }

// Safe href setting
XSSPrevention.setSafeHref(linkElement, url);
```

## Event Handlers

```javascript
// ✅ SAFE - Use addEventListener
button.addEventListener('click', () => {
    handleAction(userData);
});

// ✅ SAFE - Arrow function with closure
button.onclick = () => handleAction(userData);

// ❌ DANGEROUS - Inline with string concatenation
button.setAttribute('onclick', `handleAction('${userData}')`);
```

## Checklist Before Committing Code

- [ ] No innerHTML with user input or dynamic data
- [ ] All user text uses textContent
- [ ] URL parameters are encoded/decoded properly
- [ ] User input is validated and sanitized
- [ ] Event handlers use addEventListener, not inline strings
- [ ] Links are validated before setting href
- [ ] No eval() or Function() with user input
- [ ] No document.write() with user input

## Testing for XSS

Test with these payloads:
```
<script>alert('XSS')</script>
<img src=x onerror=alert(1)>
javascript:alert('XSS')
<svg onload=alert(1)>
'"><script>alert(String.fromCharCode(88,83,83))</script>
```

If any of these execute, you have an XSS vulnerability!

## Resources

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [MDN: textContent vs innerHTML](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
