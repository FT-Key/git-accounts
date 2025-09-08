# Git Accounts CLI

[![npm version](https://img.shields.io/npm/v/git-accounts.svg)](https://www.npmjs.com/package/git-accounts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Git Accounts CLI** is a command-line tool to manage multiple GitHub accounts on Windows using `keytar`.  
It allows you to **add, list, select, edit, and delete GitHub accounts** easily, and automatically configures Git for commits and pushes.

---

## Features

- Add GitHub accounts with username, email, commit name, commit email, and personal access token (PAT)
- List all saved accounts
- Select an active account for Git commits and pushes
- Edit account details (commit config or credentials)
- Delete accounts interactively
- Fully interactive CLI menu
- Supports both **oneline commands** and **interactive prompts**
- Safe handling of secrets using **keytar**
- Works on Windows, macOS, Linux

---

## Installation

Install globally using npm:

```bash
npm install -g git-accounts
```

> The CLI will automatically install all required dependencies.

---

## Usage

You can use the CLI **in two ways**:

### 1. Interactive menu

```bash
git-accounts
```

You'll see a menu:

```
Select an action:
- add
- use
- delete
- list
- tutorial
- exit
```

Follow the prompts to manage your accounts.

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

> If you omit some arguments in `add`, the CLI will prompt you interactively.

---

## Example

```bash
git-accounts add FT-Key ft-key@email.com "Franco Toledo" franco.toledo@rollingcodestudio.com ghp_yourPAT
git-accounts list
git-accounts use
git-accounts delete FT-Key
```

---

## Tips

- For commit configuration (`user.name` and `user.email`), you can press **Enter** to reuse your GitHub credentials.
- Press **Ctrl+C** anytime to safely cancel interactive prompts without errors.

---

## Contributing

Contributions are welcome! Feel free to:

- Report issues
- Suggest improvements
- Submit pull requests

Make sure to test interactive flows and oneline commands.

---

## Author

**Franco Nicolas Toledo**

- GitHub: [https://github.com/FT-RC](https://github.com/FT-RC)
- LinkedIn: [https://www.linkedin.com/in/franco-toledo](https://www.linkedin.com/in/franco-toledo)
- Email: franco.toledo@rollingcodestudio.com

---

## License

MIT License © Franco Nicolas Toledo
