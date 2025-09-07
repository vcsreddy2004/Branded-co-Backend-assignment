# Branded-co-Backend-assignment

This Document helps how to set this project with environment variable configuration using a `.env` file.

---

## 📌 Features
- Node.js + Express server setup  
- Environment variables managed with **dotenv**  
- Organized project structure  
- Easy to run and configure  

---

## 📂 Project Structure

```
├── node_modules/
├── src/
│ ├── index.js # Main server file
│ ├── routes/ # Route handlers (if any)
│ └── utilities/ # Business logic (if any)
├── .env # Environment variables
├── .env.example ## Environment Variable example
├── .gitignore # Files to ignore in git
├── package.json # Dependencies & scripts
└── README.md # Documentation
```
## Prerequisites
- [Node.js](https://nodejs.org/) (>= 14.x)  
- npm (comes with Node.js) or yarn  

---

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/vcsreddy2004/Branded-co-Backend-assignment.git
   cd Branded-co-Backend-assignment
   ```
2. **Create .env file**
    ```bash
      PORT=5000
      MONGO_DB_URL=mongodb://localhost:27017/AuthX
      CLIENT_SECRET_KEY=your_client_secret
      ADMIN_SECRET_KEY=your_admin_secret
      GMAIL_USER=your_gmail@example.com
      GMAIL_APP_PASSWORD=your_gmail_app_password
    ```
**Note:** Create App password and then add as GMAIL_APP_PASSWORD

3. **Run Server**
  ```bash
    npm run dev
  ```
