import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import inquirer from "inquirer";

import {
  addAccountInteractive,
  listAccountsInteractive,
  useAccountInteractive,
  deleteAccountInteractive,
} from "./lib/accounts.js";

async function main() {
  const argv = await yargs(hideBin(process.argv))
    .command("add [githubUser] [githubEmail] [commitName] [commitEmail] [token]", "Add a GitHub account", {}, async (argv) => addAccountInteractive(argv))
    .command("list", "List saved accounts", {}, listAccountsInteractive)
    .command("use", "Select an account to use", {}, useAccountInteractive)
    .command("delete", "Delete a GitHub account", {}, deleteAccountInteractive)
    .demandCommand(0)
    .help()
    .parseAsync();

  // For safety: ensure argv._ exists and is an array
  const commands = Array.isArray(argv._) ? argv._ : [];

  // Interactive menu if no subcommand
  if (!commands.length) {
    const action = await inquirer.prompt([
      {
        type: "list",
        name: "cmd",
        message: "Select an action:",
        choices: ["add", "use", "delete", "list", "tutorial", "exit"],
      },
    ]);

    switch (action.cmd) {
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
        console.log(`
📖 Tutorial:
- 'git-accounts add' to add a new account
- 'git-accounts use' to select an account for Git
- 'git-accounts delete' to remove an account
- 'git-accounts list' to view saved accounts
        `);
        break;
      case "exit":
        console.log("Exiting...");
        break;
    }
  }
}

main().catch((err) => {
  if (err.isTtyError) {
    console.error("Interactive prompts are not supported in this environment.");
  } else {
    console.error(err.message);
  }
  process.exit(1);
});
