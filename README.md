# HTML Authentication System POC

A simple HTML-based authentication system Proof of Concept (POC) built with plain HTML — no CSS or JavaScript.

## Pages

| File | Description |
|------|-------------|
| `login.html` | Login page with username, password fields and navigation links |
| `register.html` | Registration page with name, email, phone, password fields |
| `forgot-password.html` | Forgot password page with email field |
| `reset-password.html` | Reset password page with new password fields |
| `dashboard.html` | Dashboard page with logout button |

## Page Redirections

- **Login** → Submit redirects to **Dashboard**
- **Login** → "Forgot Password?" redirects to **Forgot Password**
- **Login** → "Create a New Account" redirects to **Register**
- **Register** → Submit redirects to **Login**
- **Register** → "I already have an account" redirects to **Login**
- **Forgot Password** → Submit redirects to **Login**
- **Reset Password** → Submit redirects to **Login**
- **Dashboard** → Logout redirects to **Login**

## How to Run

Simply open `login.html` in any web browser to get started. No server or build tools required.

## Tech Stack

- HTML5 only (no CSS, no JavaScript)

## Project Structure

```
html-authentication-poc/
├── login.html
├── register.html
├── forgot-password.html
├── reset-password.html
├── dashboard.html
└── README.md
```
