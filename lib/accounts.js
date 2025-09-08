import keytar from "keytar";
import simpleGit from "simple-git";
import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { promptAddAccount, promptSelectAccount, promptConfirmDelete } from "./prompts.js";

const SERVICE_PREFIX = "git-accounts";
const git = simpleGit();

// ========================= SHOW TUTORIAL =========================
export async function showTutorial() {
  console.log(`
📘 Git Accounts Manager Tutorial
──────────────────────────────────
Este CLI te permite administrar múltiples cuentas de GitHub en tu PC.

🔑 Funcionalidades principales:
  • Add Account → Agregar una nueva cuenta de GitHub
  • List Accounts → Ver, editar o exportar cuentas guardadas
  • Use Account → Configurar globalmente tu usuario de Git
  • Delete Account → Eliminar una cuenta guardada

ℹ️ Tips:
  - Puedes cambiar entre cuentas fácilmente.
  - Siempre tendrás opción de "Back to Main Menu" o "Cancel".
`);

  // 👉 Espera a que el usuario confirme antes de volver al menú principal
  await inquirer.prompt([
    {
      type: "confirm",
      name: "continue",
      message: "Press ENTER to continue to the Main Menu",
      default: true,
    },
  ]);
}

// ========================= ADD ACCOUNT =========================
export async function addAccountInteractive(data = {}) {
  const answers = await promptAddAccount(data);

  if (!answers.githubUser || !answers.githubEmail || !answers.token) {
    console.log("❌ Add canceled. Returning to main menu...");
    return;
  }

  const payload = JSON.stringify({
    githubUser: answers.githubUser,
    githubEmail: answers.githubEmail,
    commitName: answers.commitName || answers.githubUser,
    commitEmail: answers.commitEmail || answers.githubEmail,
    token: answers.token,
  });

  await keytar.setPassword(`${SERVICE_PREFIX}:${answers.githubUser}`, answers.githubUser, payload);

  console.log(`✅ Account saved: ${answers.githubUser} (${answers.githubEmail})`);
}

// ========================= EDIT ACCOUNT =========================
async function editAccountInteractive(accountName) {
  const dataStr = await keytar.getPassword(`${SERVICE_PREFIX}:${accountName}`, accountName);
  if (!dataStr) return;
  const data = JSON.parse(dataStr);

  let editing = true;
  while (editing) {
    const fieldChoices = Object.keys(data).map(f => ({ name: `${f}: ${data[f]}`, value: f }));
    fieldChoices.push({ name: "Save & Exit", value: "__SAVE__" });
    fieldChoices.push({ name: "Cancel", value: "__CANCEL__" });
    fieldChoices.push({ name: "⬅️ Back to Main Menu", value: "__BACK__" });

    const { selectedField } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedField",
        message: "Select a field to edit:",
        choices: fieldChoices,
      },
    ]);

    if (selectedField === "__SAVE__") {
      await keytar.setPassword(`${SERVICE_PREFIX}:${accountName}`, accountName, JSON.stringify(data));
      console.log(`✅ Account updated: ${accountName}`);
      editing = false;
    } else if (selectedField === "__CANCEL__") {
      console.log("❌ Edit canceled, returning to account menu.");
      editing = false;
    } else if (selectedField === "__BACK__") {
      console.log("↩️ Returning to Main Menu...");
      return; // vuelve al main menu
    } else {
      await editFieldInteractive(data, selectedField);
    }
  }
}

// ========================= EDIT FIELD =========================
async function editFieldInteractive(data, fieldName) {
  const { newValue, action } = await inquirer.prompt([
    {
      type: "input",
      name: "newValue",
      message: `Edit ${fieldName}:`,
      default: data[fieldName],
    },
    {
      type: "list",
      name: "action",
      message: "Do you want to save or cancel?",
      choices: ["Save", "Cancel", "⬅️ Back to Main Menu"],
    },
  ]);

  if (action === "Save") {
    data[fieldName] = newValue;
    console.log(`✅ ${fieldName} updated`);
  } else if (action === "Cancel") {
    console.log(`❌ Edit of ${fieldName} canceled`);
  } else {
    console.log("↩️ Returning to Main Menu...");
    throw new Error("__BACK__"); // rompe edición y vuelve
  }
}

// ========================= LIST ACCOUNTS =========================
export async function listAccountsInteractive() {
  const creds = await keytar.findCredentials(SERVICE_PREFIX);
  if (!creds.length) {
    console.log("⚠️ No saved accounts.");
    return;
  }

  let exitList = false;
  while (!exitList) {
    const choices = creds.map(c => {
      const { githubUser, githubEmail } = JSON.parse(c.password);
      return { name: `${githubUser} (${githubEmail})`, value: c.account };
    }).concat([{ name: "⬅️ Back to Main Menu", value: "__back" }]);

    const selected = await promptSelectAccount(choices, "Select an account to view/edit:");

    if (selected === "__back") {
      console.log("↩️ Returning to Main Menu...");
      return; // vuelve al mainMenu
    }

    const dataStr = await keytar.getPassword(`${SERVICE_PREFIX}:${selected}`, selected);
    const data = JSON.parse(dataStr);

    let backToList = false;
    while (!backToList) {
      console.log("\n📄 Account details:");
      console.log(`GitHub Username: ${data.githubUser}`);
      console.log(`GitHub Email: ${data.githubEmail}`);
      console.log(`Commit Name: ${data.commitName}`);
      console.log(`Commit Email: ${data.commitEmail}`);
      console.log(`Token: ${"*".repeat(data.token.length)}\n`);

      const action = await promptSelectAccount(
        [
          { name: "✏️ Edit", value: "Edit" },
          { name: "💾 Download JSON", value: "Download JSON" },
          { name: "⬅️ Back to Account List", value: "Back" },
          { name: "⬅️ Back to Main Menu", value: "__main" },
        ],
        "Select an action:"
      );

      switch (action) {
        case "Edit":
          try {
            await editAccountInteractive(selected);
          } catch (err) {
            if (err.message === "__BACK__") return; // back to main
            else throw err;
          }
          const newDataStr = await keytar.getPassword(`${SERVICE_PREFIX}:${selected}`, selected);
          Object.assign(data, JSON.parse(newDataStr));
          break;

        case "Download JSON":
          const filePath = path.resolve(`${selected}.json`);
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
          console.log(`✅ Account exported to ${filePath}`);
          break;

        case "Back":
          backToList = true;
          break;

        case "__main":
          console.log("↩️ Returning to Main Menu...");
          return;
      }
    }
  }
}

// ========================= USE ACCOUNT =========================
export async function useAccountInteractive() {
  const creds = await keytar.findCredentials(SERVICE_PREFIX);
  if (!creds.length) {
    console.log("⚠️ No saved accounts.");
    return;
  }

  const choices = creds.map((c) => {
    const { githubUser, githubEmail, commitName, commitEmail } = JSON.parse(c.password);
    return {
      name: `${githubUser} (${githubEmail}) | Commits: ${commitName} (${commitEmail})`,
      value: { githubUser, githubEmail, commitName, commitEmail },
    };
  });

  // 👉 Agregar opción de volver al menú principal
  choices.push({ name: "⬅️ Back to Main Menu", value: "__back" });

  const { selected } = await inquirer.prompt([
    {
      type: "list",
      name: "selected",
      message: "Select an account to use:",
      choices,
    },
  ]);

  if (!selected || selected === "__back") {
    console.log("↩️ Returning to Main Menu.");
    return;
  }

  await git.raw(["config", "--global", "user.name", selected.commitName]);
  await git.raw(["config", "--global", "user.email", selected.commitEmail]);

  console.log(`✅ Using GitHub account: ${selected.githubUser} (${selected.githubEmail})`);
  console.log(`✅ Commit config: ${selected.commitName} (${selected.commitEmail})`);
}

// ========================= DELETE ACCOUNT =========================
export async function deleteAccountInteractive() {
  const creds = await keytar.findCredentials(SERVICE_PREFIX);
  if (!creds.length) return console.log("⚠️ No saved accounts.");

  const choices = creds.map(c => {
    const { githubUser, githubEmail } = JSON.parse(c.password);
    return { name: `${githubUser} (${githubEmail})`, value: c.account };
  }).concat([{ name: "⬅️ Back to Main Menu", value: null }]);

  const selected = await promptSelectAccount(choices, "Select an account to delete:");
  if (!selected) {
    console.log("↩️ Returning to Main Menu...");
    return;
  }

  const confirm = await promptConfirmDelete(`Are you sure you want to delete ${selected}?`);
  if (!confirm) {
    console.log("❌ Delete canceled, returning to main menu...");
    return;
  }

  await keytar.deletePassword(`${SERVICE_PREFIX}:${selected}`, selected);
  console.log(`🗑️ Account deleted: ${selected}`);
}
