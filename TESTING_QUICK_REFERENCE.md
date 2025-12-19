# Cross-Browser Testing Quick Reference Card

## 🚀 Quick Start

1. **Start local server:**
   ```bash
   python -m http.server 8000
   # OR
   npx http-server -p 8000
   ```

2. **Open test page:**
   - Navigate to: `http://localhost:8000/test-cross-browser.html`

3. **Run tests in each browser:**
   - Chrome
   - Firefox
   - Safari
   - Edge

---

## ✅ Quick Checklist (Per Browser)

### Before Testing
- [ ] Browser is latest version
- [ ] DevTools open (F12 or Cmd+Option+I)
- [ ] Console tab visible
- [ ] Network tab ready

### Automated Test Page
- [ ] Browser detected correctly
- [ ] IntersectionObserver: ✅
- [ ] Anime.js: ✅
- [ ] Hover buttons scale on hover
- [ ] Timeline boxes animate in sequence
- [ ] Scroll items fade in with stagger
- [ ] Loop element rotates continuously
- [ ] Stagger boxes animate with delay
- [ ] "Run All Tests" completes successfully
- [ ] No console errors

### Production Pages
- [ ] index.html - QR sliding puzzle works
- [ ] index.html - QR color cycling works
- [ ] index.html - Announcement banner works
- [ ] index.html - Quote animation works
- [ ] index.html - Leaderboard scroll works
- [ ] plate.html - Subscribe button hover works

### Performance
- [ ] Network: No GSAP requests
- [ ] Performance: 60fps during animations
- [ ] Console: No errors or warnings

---

## 🎯 What Success Looks Like

### Hover Animations
- Button scales from 1.0 → 1.1 on hover
- Button scales from 1.1 → 1.0 on leave
- Duration: 300ms
- Smooth easing

### Timeline Animations
- Elements animate in sequence
- Timing offsets preserved
- Smooth transitions

### Scroll Animations
- Trigger at correct scroll position (top 80%)
- Stagger delay visible (80ms between items)
- Animate only once
- Smooth fade-in

### Infinite Loops
- Animation continues indefinitely
- No stuttering or pauses
- Smooth continuous motion

### Stagger Animations
- Visible delay between elements
- All elements animate
- Consistent timing

---

## 🐛 Common Issues

| Issue | Check | Fix |
|-------|-------|-----|
| Animations don't work | Anime.js loaded? | Check script tag |
| Scroll doesn't trigger | IntersectionObserver? | Check browser support |
| Choppy animations | Frame rate? | Check Performance tab |
| Hover feels wrong | Duration/easing? | Verify 300ms + easeOutQuad |
| Loop stops | loop: true? | Check animation config |

---

## 📊 Document Results

After testing each browser, fill out:
- `CHROME_TEST_RESULTS.md`
- `FIREFOX_TEST_RESULTS.md`
- `SAFARI_TEST_RESULTS.md`
- `EDGE_TEST_RESULTS.md`

---

## 🎓 Browser DevTools Shortcuts

| Browser | Open DevTools | Console | Network | Performance |
|---------|---------------|---------|---------|-------------|
| Chrome | F12 / Cmd+Opt+I | Ctrl+2 | Ctrl+4 | Ctrl+5 |
| Firefox | F12 / Cmd+Opt+I | Ctrl+2 | Ctrl+4 | Ctrl+5 |
| Safari | Cmd+Opt+I | Cmd+Opt+C | Cmd+Opt+N | Cmd+Opt+T |
| Edge | F12 / Cmd+Opt+I | Ctrl+2 | Ctrl+4 | Ctrl+5 |

---

## 📝 Test Report Template

```
Browser: [Name + Version]
OS: [Operating System]
Date: [Date]

✅ All tests passed
❌ Issues found: [describe]

Performance: [fps]
Console: [errors/warnings]
Network: [GSAP requests?]

Notes: [observations]
```

---

## 🔗 Useful Links

- Test Page: `http://localhost:8000/test-cross-browser.html`
- Index Page: `http://localhost:8000/index.html`
- Plate Page: `http://localhost:8000/plate.html`
- Full Guide: `CROSS_BROWSER_TESTING_GUIDE.md`

---

## ⏱️ Estimated Time

- Per browser: 15-20 minutes
- Total (4 browsers): 60-80 minutes
- Documentation: 20-30 minutes
- **Total: ~2 hours**

---

## 🎉 Done?

When all browsers pass:
- [ ] All 4 result files completed
- [ ] No critical issues found
- [ ] Performance acceptable
- [ ] Documentation updated
- [ ] Task marked complete

**Congratulations! Cross-browser testing complete! 🚀**
