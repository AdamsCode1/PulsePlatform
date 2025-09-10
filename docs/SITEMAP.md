# DUPulse - PulsePlatform Sitemap

## 🌐 Website Structure Overview

### 📍 **Public Pages**
```
/                           - Homepage (Landing page)
/platform                   - Platform access (redirects to /)
/dev                        - Development access (redirects to /)
/deals                      - Browse deals and offers
/about                      - About DUPulse platform
/team                       - Meet the team
/schedule                   - Event schedule view
```

### 🔐 **Authentication Pages**
```
/login                      - User type selection for login
/register                   - User type selection for registration
/user-type                  - User type selection

Student Authentication:
/login/student             - Student login
/register/student          - Student registration

Society Authentication:
/login/society            - Society login
/register/society         - Society registration

Partner Authentication:
/login/partner            - Partner login
/register/partner         - Partner registration
/register/organization    - Organization registration (alias)

Admin Authentication:
/admin/login              - Admin login
/admin                    - Admin login (legacy redirect)
```

### 👨‍🎓 **Student Dashboard**
```
/student/dashboard         - Student main dashboard
/student/rsvps            - Student RSVP management
/student/profile          - Student profile editing
```

### 🏛️ **Society Dashboard**
```
/society/dashboard        - Society main dashboard
/society/events          - Society event management
/society/submit-event    - Submit new society event
```

### 🤝 **Partner Dashboard**
```
/partner/dashboard        - Partner main dashboard
/partner/events          - Partner event management
/partner/deals           - Partner deal management
/partner/submit-event    - Submit new partner event
/partner/submit-deal     - Submit new deal/offer
```

### 👨‍💼 **Admin Dashboard**
```
/admin/dashboard         - Admin main dashboard
/admin/events           - Admin event management
/admin/deals            - Admin deal management
/admin/users            - Admin user management
/admin/settings         - Admin system settings
```

### 🛠️ **Utility Pages**
```
/submit-event           - General event submission (public)
/events/manage         - Event management redirect
/*                     - 404 Not Found page
```

---

## 🔌 **API Endpoints**

### 📡 **General APIs**
```
/api/hello              - Health check endpoint
/api/unified            - Unified API endpoint
/api/partners           - Partner-related operations
```

### 🔒 **Admin APIs**
```
/api/admin/dashboard    - Admin dashboard data
/api/admin/users        - User management operations
/api/admin/events       - Event management operations
/api/admin/deals        - Deal management operations
/api/admin/settings     - System settings operations
/api/admin/activity     - Activity logs and monitoring
/api/admin/system       - System health and metrics
```

---

## 🎯 **User Journey Flow**

### New User Experience:
1. **/** → **/user-type** → **/{role}/register** → **/{role}/dashboard**

### Returning User:
1. **/** → **/{role}/login** → **/{role}/dashboard**

### Role-Based Access:
- **Students**: Browse events, manage RSVPs, profile management
- **Societies**: Event creation/management, view RSVPs
- **Partners**: Event/deal creation, business analytics
- **Admins**: Platform oversight, user/content moderation

---

## 📊 **Feature Access Matrix**

| Feature | Student | Society | Partner | Admin |
|---------|---------|---------|---------|--------|
| Browse Events | ✅ | ✅ | ✅ | ✅ |
| RSVP to Events | ✅ | ❌ | ❌ | ✅ |
| Submit Events | ❌ | ✅ | ✅ | ✅ |
| Manage Events | ❌ | ✅ | ✅ | ✅ |
| Submit Deals | ❌ | ❌ | ✅ | ✅ |
| User Management | ❌ | ❌ | ❌ | ✅ |
| Platform Settings | ❌ | ❌ | ❌ | ✅ |

---

*Last updated: August 25, 2025*
*Total Pages: 28 frontend routes + 10 API endpoints*
