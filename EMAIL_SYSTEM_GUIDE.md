# Email System Implementation Guide

## 📧 Email Notifications

The POS system now includes email notifications for various events.

---

## ✅ Frontend Implementation

### Email Service Created
Location: `src/util/emailService.js`

### Integrated Email Notifications:
1. ✅ **Account Creation** - Sends welcome email after signup
2. 🔄 **Password Reset** - Ready for implementation
3. 🔄 **Order Confirmation** - Ready for implementation
4. 🔄 **Shift Report** - Ready for implementation

---

## 🎯 Account Creation Email Flow

### When Triggered:
- After successful user signup
- Before redirecting to login page

### Email Data Sent:
```javascript
{
  to: "user@example.com",
  fullName: "John Doe",
  storeName: "My Store",
  role: "ROLE_STORE_ADMIN"
}
```

### Frontend Flow:
```
User submits signup form
  ↓
Signup API call succeeds
  ↓
Send welcome email (async)
  ↓
Log success/failure (doesn't block navigation)
  ↓
Redirect to login page
```

---

## 🔧 Backend Requirements

### Required API Endpoints:

#### 1. Account Created Email
```
POST /api/email/account-created
```

**Request Body:**
```json
{
  "to": "user@example.com",
  "fullName": "John Doe",
  "storeName": "My Store",
  "role": "ROLE_STORE_ADMIN"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "messageId": "abc123"
}
```

#### 2. Welcome Email
```
POST /api/email/welcome
```

**Request Body:**
```json
{
  "to": "user@example.com",
  "fullName": "John Doe",
  "storeName": "My Store"
}
```

#### 3. Password Reset Email
```
POST /api/email/password-reset
```

**Request Body:**
```json
{
  "to": "user@example.com",
  "resetToken": "abc123xyz"
}
```

#### 4. Order Confirmation Email
```
POST /api/email/order-confirmation
```

**Request Body:**
```json
{
  "to": "customer@example.com",
  "orderId": 123,
  "orderDetails": { ... },
  "total": 1000
}
```

#### 5. Shift Report Email
```
POST /api/email/shift-report
```

**Request Body:**
```json
{
  "to": "manager@example.com",
  "shiftId": 456,
  "shiftData": { ... }
}
```

---

## 📝 Email Templates

### 1. Account Created Email Template

**Subject:** Welcome to POS Pro - Account Created Successfully

**Body:**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1a1d23, #4a4d55); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f5f5f5; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 12px 30px; background: #1a1d23; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .info-box { background: white; padding: 15px; border-left: 4px solid #1a1d23; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome to POS Pro!</h1>
    </div>
    <div class="content">
      <h2>Hello {{fullName}},</h2>
      <p>Your account has been created successfully!</p>
      
      <div class="info-box">
        <strong>Account Details:</strong><br>
        <strong>Email:</strong> {{email}}<br>
        <strong>Store Name:</strong> {{storeName}}<br>
        <strong>Role:</strong> {{role}}<br>
        <strong>Created:</strong> {{createdDate}}
      </div>
      
      <p>You can now log in to your account and start managing your store.</p>
      
      <a href="{{loginUrl}}" class="button">Login to Your Account</a>
      
      <h3>Getting Started:</h3>
      <ul>
        <li>Set up your store branches</li>
        <li>Add products and categories</li>
        <li>Create employee accounts</li>
        <li>Start processing orders</li>
      </ul>
      
      <p>If you have any questions, please don't hesitate to contact our support team.</p>
    </div>
    <div class="footer">
      <p>© 2024 POS Pro. All rights reserved.</p>
      <p>This is an automated email. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
```

### 2. Password Reset Email Template

**Subject:** Reset Your POS Pro Password

**Body:**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Same styles as above */
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔒 Password Reset Request</h1>
    </div>
    <div class="content">
      <h2>Hello {{fullName}},</h2>
      <p>We received a request to reset your password.</p>
      
      <p>Click the button below to reset your password:</p>
      
      <a href="{{resetUrl}}" class="button">Reset Password</a>
      
      <p><strong>This link will expire in 1 hour.</strong></p>
      
      <p>If you didn't request this, please ignore this email.</p>
    </div>
    <div class="footer">
      <p>© 2024 POS Pro. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
```

### 3. Order Confirmation Email Template

**Subject:** Order Confirmation - Order #{{orderId}}

**Body:**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Same styles as above */
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Order Confirmed</h1>
    </div>
    <div class="content">
      <h2>Thank you for your order!</h2>
      
      <div class="info-box">
        <strong>Order #{{orderId}}</strong><br>
        <strong>Date:</strong> {{orderDate}}<br>
        <strong>Total:</strong> रु {{total}}
      </div>
      
      <h3>Order Items:</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f5f5f5;">
            <th style="padding: 10px; text-align: left;">Item</th>
            <th style="padding: 10px; text-align: center;">Qty</th>
            <th style="padding: 10px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          {{#each items}}
          <tr>
            <td style="padding: 10px;">{{name}}</td>
            <td style="padding: 10px; text-align: center;">{{quantity}}</td>
            <td style="padding: 10px; text-align: right;">रु {{price}}</td>
          </tr>
          {{/each}}
        </tbody>
      </table>
      
      <p>Thank you for shopping with us!</p>
    </div>
    <div class="footer">
      <p>© 2024 POS Pro. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
```

---

## 🛠️ Backend Implementation (Spring Boot)

### 1. Add Dependencies (pom.xml)

```xml
<!-- Spring Boot Mail -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>

<!-- Thymeleaf for email templates -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-thymeleaf</artifactId>
</dependency>
```

### 2. Configure Email (application.properties)

```properties
# Email Configuration
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true

# Application URL
app.url=http://localhost:5173
```

### 3. Email Service (Java)

```java
@Service
public class EmailService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Autowired
    private TemplateEngine templateEngine;
    
    @Value("${app.url}")
    private String appUrl;
    
    public void sendAccountCreatedEmail(String to, String fullName, String storeName, String role) {
        try {
            Context context = new Context();
            context.setVariable("fullName", fullName);
            context.setVariable("email", to);
            context.setVariable("storeName", storeName);
            context.setVariable("role", role.replace("ROLE_", "").replace("_", " "));
            context.setVariable("createdDate", LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMM dd, yyyy")));
            context.setVariable("loginUrl", appUrl + "/login");
            
            String htmlContent = templateEngine.process("account-created", context);
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(to);
            helper.setSubject("Welcome to POS Pro - Account Created Successfully");
            helper.setText(htmlContent, true);
            helper.setFrom("noreply@pospro.com");
            
            mailSender.send(message);
            
            log.info("Account created email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send account created email", e);
            throw new RuntimeException("Failed to send email", e);
        }
    }
    
    public void sendPasswordResetEmail(String to, String resetToken) {
        // Implementation
    }
    
    public void sendOrderConfirmationEmail(OrderDTO orderData) {
        // Implementation
    }
}
```

### 4. Email Controller (Java)

```java
@RestController
@RequestMapping("/api/email")
public class EmailController {
    
    @Autowired
    private EmailService emailService;
    
    @PostMapping("/account-created")
    public ResponseEntity<?> sendAccountCreatedEmail(@RequestBody EmailRequest request) {
        try {
            emailService.sendAccountCreatedEmail(
                request.getTo(),
                request.getFullName(),
                request.getStoreName(),
                request.getRole()
            );
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Email sent successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "Failed to send email: " + e.getMessage()
            ));
        }
    }
    
    @PostMapping("/welcome")
    public ResponseEntity<?> sendWelcomeEmail(@RequestBody EmailRequest request) {
        // Implementation
    }
    
    @PostMapping("/password-reset")
    public ResponseEntity<?> sendPasswordResetEmail(@RequestBody EmailRequest request) {
        // Implementation
    }
}
```

### 5. Email Request DTO (Java)

```java
@Data
public class EmailRequest {
    private String to;
    private String fullName;
    private String storeName;
    private String role;
    private String resetToken;
}
```

---

## 🧪 Testing Email System

### Test Case 1: Account Created Email
**Steps:**
1. Sign up with valid details
2. Check email inbox
3. Verify email received

**Expected:**
- ✅ Email sent after signup
- ✅ Email contains correct user details
- ✅ Login link works
- ✅ Navigation not blocked if email fails

### Test Case 2: Email Service Failure
**Steps:**
1. Disable email service
2. Sign up
3. Check console

**Expected:**
- ⚠️ Warning logged in console
- ✅ User still redirected to login
- ✅ Account created successfully

---

## 📊 Email Tracking

### Recommended Metrics:
- Email sent count
- Email delivery rate
- Email open rate
- Link click rate
- Bounce rate

### Logging:
```javascript
console.log("✅ Welcome email sent successfully");
console.warn("⚠️ Failed to send welcome email:", error);
```

---

## 🔒 Security Considerations

1. **Never expose email credentials** in frontend
2. **Use environment variables** for email config
3. **Validate email addresses** before sending
4. **Rate limit** email sending
5. **Use app-specific passwords** for Gmail
6. **Implement email verification** for security

---

## 🚀 Future Enhancements

1. Email verification on signup
2. Email templates customization
3. Bulk email sending
4. Email scheduling
5. Email analytics dashboard
6. SMS notifications integration
7. Push notifications

---

## ✅ Implementation Checklist

### Frontend
- [x] Create email service utility
- [x] Integrate with signup flow
- [x] Add loading states
- [x] Handle errors gracefully
- [ ] Add email verification flow

### Backend
- [ ] Add Spring Mail dependency
- [ ] Configure SMTP settings
- [ ] Create EmailService
- [ ] Create EmailController
- [ ] Create email templates
- [ ] Add email endpoints
- [ ] Test email sending
- [ ] Add error handling
- [ ] Add logging

### Testing
- [ ] Test account created email
- [ ] Test email failure handling
- [ ] Test email templates
- [ ] Test with different email providers
- [ ] Load testing

---

## 📝 Notes

- Email sending is **non-blocking** - doesn't prevent user navigation
- Errors are **logged** but don't show to user
- Email service is **optional** - system works without it
- Use **HTML templates** for better formatting
- Consider using **email service providers** (SendGrid, AWS SES) for production
