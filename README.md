# 🚀 TRIANCE-AI

**TRIANCE-AI** is a modular, scalable microservices-based project built with **Node.js**, **TypeScript**, **React**, and **Tailwind CSS**. It supports both user and admin workflows and includes a shared `commons` library for code reuse.

---

## 📁 Monorepo Structure

```bash
TRIANCE-AI/
│
├── triance-user-frontend      # React + Tailwind (User App)
├── triance-user-backend       # Node.js + TypeScript (User API)
├── triance-admin-frontend     # React + Tailwind (Admin App)
├── triance-admin-backend      # Node.js + TypeScript (Admin API)
├── triance-auth-backend       # Node.js + TypeScript (Authentication API)
└── triance-commons            # Shared code (types, utils, interfaces)
