import inquirer from "inquirer";

export async function promptAddAccount(data = {}) {
  return inquirer.prompt([
    { type: "input", name: "githubUser", message: "GitHub username:", default: data.githubUser },
    { type: "input", name: "githubEmail", message: "GitHub email:", default: data.githubEmail },
    { type: "input", name: "commitName", message: "Commit name (Enter to use GitHub username):", default: data.commitName },
    { type: "input", name: "commitEmail", message: "Commit email (Enter to use GitHub email):", default: data.commitEmail },
    { type: "password", name: "token", message: "Personal Access Token (PAT):", mask: "*", default: data.token },
  ]);
}

export async function promptSelectAccount(choices, message) {
  const { selected } = await inquirer.prompt([{ type: "list", name: "selected", message, choices }]);
  return selected;
}

export async function promptConfirmDelete(message) {
  const { confirm } = await inquirer.prompt([{ type: "confirm", name: "confirm", message }]);
  return confirm;
}
