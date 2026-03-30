const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 667 });
    await page.goto('http://127.0.0.1:8080/index.html');
    
    await page.waitForSelector('.hamburger-line');
    
    const data = await page.evaluate(() => {
        const toggle = document.querySelector('.nav-toggle');
        const toggleStyle = window.getComputedStyle(toggle);
        const rect = toggle.getBoundingClientRect();
        
        const lines = document.querySelectorAll('.hamburger-line');
        const styles = Array.from(lines).map(l => {
            const s = window.getComputedStyle(l);
            const r = l.getBoundingClientRect();
            return {
                width: s.width,
                height: s.height,
                backgroundColor: s.backgroundColor,
                opacity: s.opacity,
                display: s.display,
                visibility: s.visibility,
                zIndex: s.zIndex,
                position: s.position,
                rect: { x: r.x, y: r.y, width: r.width, height: r.height }
            };
        });
        
        return {
            toggle: {
                display: toggleStyle.display,
                width: toggleStyle.width,
                height: toggleStyle.height,
                padding: toggleStyle.padding,
                margin: toggleStyle.margin,
                gap: toggleStyle.gap,
                flexDirection: toggleStyle.flexDirection,
                justifyContent: toggleStyle.justifyContent,
                alignItems: toggleStyle.alignItems,
                position: toggleStyle.position,
                rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
            },
            lines: styles
        };
    });
    
    console.log(JSON.stringify(data, null, 2));
    await browser.close();
})();
