# HTML Authentication System POC

A simple HTML-based authentication system Proof of Concept (POC) built with plain HTML — no CSS or JavaScript.

# Pages

login.html-> Login page with username, password fields and navigation links.<br>

register.html-> Registration page with name, email, phone, password fields.<br>

forgot-password.html-> Forgot password page with email field.<br>

reset-password.html->  Reset password page with new password fields .<br>

dashboard.html-> Dashboard page with logout button. 

## Page Redirections

- **Login** → Submit redirects to **Dashboard**
- **Login** → "Forgot Password?" redirects to **Forgot Password**
- **Login** → "Create a New Account" redirects to **Register**
- **Register** → Submit redirects to **Login**
- **Register** → "I already have an account" redirects to **Login**
- **Forgot Password** → Submit redirects to **Login**
- **Reset Password** → Submit redirects to **Login**
- **Dashboard** → Logout redirects to **Login**



## Tech Stack

- HTML5 only 

