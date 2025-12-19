# Browser Compatibility Guide

## Development Browser Setup

### Chrome/Chromium
```bash
# Enable insecure localhost flag
chrome --disable-web-security --ignore-certificate-errors --ignore-ssl-errors --ignore-certificate-errors-spki-list --user-data-dir=/tmp/chrome_dev

# Or enable via chrome://flags
# Navigate to chrome://flags/#allow-insecure-localhost and enable
```

### Firefox
```bash
# Disable security checks for development
firefox --disable-web-security --ignore-certificate-errors

# Or enable via about:config
# Set security.fileuri.strict_origin_policy to false
```

### Safari
```bash
# Enable Develop menu in Safari Preferences > Advanced
# Then disable "Prevent cross-site tracking" and "Block all cookies" for development
```

### Edge
```bash
# Similar to Chrome flags
msedge --disable-web-security --ignore-certificate-errors
```

## Development Server Configuration

The project is configured with:
- CORS enabled for all origins in development
- HTTP/HTTPS mixed content allowed
- Host binding to 0.0.0.0 for external access
- Proper security headers for development

## Browser Testing Checklist

- [ ] Chrome/Chromium (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (Chrome Mobile, Safari Mobile)

## Common Issues & Solutions

### Mixed Content Errors
- Solution: Use HTTPS in development or disable mixed content checks
- Configured in vite.config.ts

### CORS Errors
- Solution: Backend allows all origins in development
- Configured in server/index.ts

### Certificate Errors
- Solution: Disable certificate checks in browser flags
- Or generate self-signed certificates

### Localhost Access Issues
- Solution: Use 0.0.0.0 instead of localhost
- Configured in vite.config.ts

## Production Deployment

For production, ensure:
- HTTPS is properly configured
- Security headers are restrictive
- CORS is limited to specific origins
- Content Security Policy is strict
