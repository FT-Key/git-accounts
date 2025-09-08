#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import inquirer from "inquirer";

import {
  addAccountInteractive,
  listAccountsInteractive,
  useAccountInteractive,
  deleteAccountInteractive,
  showTutorial,
} from "./lib/accounts.js";

async function mainMenu() {
  let exit = false;

  while (!exit) {
    const { cmd } = await inquirer.prompt([
      {
        type: "list",
        name: "cmd",
        message: "📌 Select an action:",
        choices: [
          { name: "➕ Add Account", value: "add" },
          { name: "📋 List Accounts", value: "list" },
          { name: "🔄 Use Account", value: "use" },
          { name: "🗑️ Delete Account", value: "delete" },
          { name: "📘 Tutorial", value: "tutorial" },
          { name: "❌ Exit", value: "exit" },
        ],
      },
    ]);

    switch (cmd) {
      case "add":
        await addAccountInteractive({});
        break;
      case "use":
        await useAccountInteractive();
        break;
      case "delete":
        await deleteAccountInteractive();
        break;
      case "list":
        await listAccountsInteractive();
        break;
      case "tutorial":
        await showTutorial();
        break;
      case "exit":
        console.log("👋 Exiting Git Accounts CLI...");
        exit = true;
        break;
    }
  }
}

async function main() {
  const argv = await yargs(hideBin(process.argv))
    .command(
      "add [githubUser] [githubEmail] [commitName] [commitEmail] [token]",
      "➕ Add a GitHub account",
      {},
      async (argv) => addAccountInteractive(argv)
    )
    .command("list", "📋 List saved accounts", {}, listAccountsInteractive)
    .command("use", "🔄 Select an account to use", {}, useAccountInteractive)
    .command("delete", "🗑️ Delete a GitHub account", {}, deleteAccountInteractive)
    .demandCommand(0)
    .help()
    .parseAsync();

  const commands = Array.isArray(argv._) ? argv._ : [];

  // 👉 If no subcommand, show interactive menu
  if (!commands.length) {
    await mainMenu();
  }
}

main().catch((err) => {
  if (err.isTtyError) {
    console.error("⚠️ Interactive prompts are not supported in this environment.");
  } else {
    console.error("❌ Error:", err.message);
  }
  process.exit(1);
});
