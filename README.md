# Git Accounts CLI

[![npm version](https://img.shields.io/npm/v/git-accounts.svg)](https://www.npmjs.com/package/git-accounts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Git Accounts CLI** is a command-line tool to manage multiple GitHub accounts using `keytar`.  
It allows you to **add, list, select, edit, export, and delete GitHub accounts** easily, and automatically configures Git for commits and pushes.

---

## ✨ Features

- ➕ **Add** GitHub accounts with username, email, commit name/email, and personal access token (PAT)  
- 📋 **List** all saved accounts with details in a clean format  
- ✏️ **Edit** accounts field by field, with save/cancel options  
- 💾 **Export** accounts to JSON  
- 🔄 **Use** an account to configure `git config --global user.name` and `user.email`  
- 🗑️ **Delete** accounts interactively with confirmation  
- 📘 **Tutorial** built-in, with *Continue* option  
- ❌ Always possible to go back to the **Main Menu** or cancel safely  
- 🔒 Safe handling of secrets using **keytar**  
- 🌍 Works on Windows, macOS, and Linux

---

## 📦 Installation

Install globally using npm:

```bash
npm install -g git-accounts
```

---

## 🚀 Usage

You can use the CLI in **two ways**:

### 1. Interactive menu

```bash
git-accounts
```

You'll see a menu:

```
📌 Select an action:
- ➕ Add Account
- 📋 List Accounts
- 🔄 Use Account
- 🗑️ Delete Account
- 📘 Tutorial
- ❌ Exit
```

---

### 2. Oneline commands

```bash
# Add a new account
git-accounts add <githubUser> <githubEmail> <commitName> <commitEmail> <token>

# List saved accounts
git-accounts list

# Use/select an account
git-accounts use

# Delete an account
git-accounts delete <githubUser>
```

👉 If you omit some arguments in `add`, the CLI will prompt you interactively.

---

## 🖥️ Example

```bash
git-accounts add FT-Key ft-key@email.com "Franco Toledo" franco.toledo@rollingcodestudio.com ghp_yourPAT
git-accounts list
git-accounts use
git-accounts delete FT-Key
```

---

## 💡 Tips

- For commit configuration (`user.name` and `user.email`), press **Enter** to reuse your GitHub credentials.  
- You can always select **⬅️ Back to Main Menu** or **Cancel**.  
- Press **Ctrl+C** anytime to safely exit interactive prompts.

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Report issues  
- Suggest improvements  
- Submit pull requests  

---

## 👤 Author

**Franco Nicolas Toledo**

- GitHub: [https://github.com/FT-Key](https://github.com/FT-Key)  
- LinkedIn: [https://www.linkedin.com/in/ftkey](https://www.linkedin.com/in/ftkey)  
- Email: fr4nc0t2@gmail.com  

---

## 📄 License

MIT License © Franco Nicolas Toledo

