# Email Configuration Instructions

## Gmail Configuration Example:
1. Enable two-factor authentication
2. Generate app password (16 digits)
3. Replace your-email@gmail.com and your-app-password in email-template.json

## Other Email Providers:
- **QQ Mail**: smtp.qq.com (587) / imap.qq.com (993)
- **163 Mail**: smtp.163.com (587) / imap.163.com (993)
- **Outlook**: smtp.live.com (587) / imap-mail.outlook.com (993)

## After Configuration:
1. Copy email section to config/channels.json
2. Run: `claude-remote test`
3. Run: `claude-remote relay start`