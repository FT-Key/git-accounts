#!/usr/bin/env node
import keytar from "keytar";
import simpleGit from "simple-git";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import inquirer from "inquirer";

const SERVICE_PREFIX = "git-accounts";
const git = simpleGit();

async function addAccount(argv) {
  let { githubUser, githubEmail, commitName, commitEmail, token } = argv;

  if (!githubUser || !githubEmail || !commitName || !commitEmail || !token) {
    const answers = await inquirer.prompt([
      { type: "input", name: "githubUser", message: "Usuario de GitHub:" },
      { type: "input", name: "githubEmail", message: "Email de GitHub:" },
      { type: "input", name: "commitName", message: "Nombre para commits (user.name):" },
      { type: "input", name: "commitEmail", message: "Email para commits (user.email):" },
      { type: "password", name: "token", message: "Token personal de acceso (PAT):", mask: "*" },
    ]);
    githubUser = answers.githubUser;
    githubEmail = answers.githubEmail;
    commitName = answers.commitName;
    commitEmail = answers.commitEmail;
    token = answers.token;
  }

  const data = JSON.stringify({ githubUser, githubEmail, commitName, commitEmail, token });
  await keytar.setPassword(`${SERVICE_PREFIX}:${githubUser}`, githubUser, data);
  console.log(`✅ Cuenta guardada: ${githubUser} (${githubEmail})`);
}

async function listAccounts() {
  const creds = await keytar.findCredentials(SERVICE_PREFIX);
  if (!creds.length) return console.log("⚠️ No hay cuentas guardadas.");
  console.log("📂 Cuentas guardadas:");
  creds.forEach((c) => {
    try {
      const { githubUser, githubEmail, commitName, commitEmail } = JSON.parse(c.password);
      console.log(`- ${githubUser} (${githubEmail}) | Commits: ${commitName} (${commitEmail})`);
    } catch {
      console.log(`- ${c.account} (datos corruptos)`);
    }
  });
}

async function useAccount() {
  const creds = await keytar.findCredentials(SERVICE_PREFIX);
  if (!creds.length) return console.log("⚠️ No hay cuentas guardadas.");

  const choices = creds.map((c) => {
    const { githubUser, githubEmail, commitName, commitEmail } = JSON.parse(c.password);
    return {
      name: `${githubUser} (${githubEmail}) | Commits: ${commitName} (${commitEmail})`,
      value: { githubUser, githubEmail, commitName, commitEmail },
    };
  });

  const { selected } = await inquirer.prompt([
    { type: "list", name: "selected", message: "Selecciona la cuenta que quieres usar:", choices },
  ]);

  await git.raw(["config", "--global", "user.name", selected.commitName]);
  await git.raw(["config", "--global", "user.email", selected.commitEmail]);

  console.log(`✅ Autenticación GitHub: ${selected.githubUser} (${selected.githubEmail})`);
  console.log(`✅ Configuración de commits: ${selected.commitName} (${selected.commitEmail})`);
}

async function deleteAccount(argv) {
  await keytar.deletePassword(`${SERVICE_PREFIX}:${argv.githubUser}`, argv.githubUser);
  console.log(`🗑️ Cuenta eliminada: ${argv.githubUser}`);
}

// ========================================================
// Configuración de yargs
yargs(hideBin(process.argv))
  .command("add [githubUser] [githubEmail] [commitName] [commitEmail] [token]", "Agregar una cuenta de GitHub", {}, addAccount)
  .command("list", "Listar cuentas guardadas", {}, listAccounts)
  .command("use", "Seleccionar cuenta activa", {}, useAccount)
  .command("delete <githubUser>", "Eliminar una cuenta", {}, deleteAccount)
  // ========================================================
  .demandCommand(0)
  .help()
  .parseAsync()
  // ========================================================
  // Si no hay subcomando, mostrar menú interactivo
  .then(async (argv) => {
    if (!argv._.length) {
      const action = await inquirer.prompt([
        {
          type: "list",
          name: "cmd",
          message: "Selecciona una acción:",
          choices: ["add", "use", "delete", "list", "tutorial", "salir"],
        },
      ]);

      switch (action.cmd) {
        case "add": return addAccount({});
        case "use": return useAccount();
        case "delete":
          const { githubUser } = await inquirer.prompt([
            { type: "input", name: "githubUser", message: "Nombre de la cuenta a eliminar:" },
          ]);
          return deleteAccount({ githubUser });
        case "list": return listAccounts();
        case "tutorial":
          console.log("\n📖 Tutorial:\nUsa 'git-accounts add' para agregar cuentas, 'use' para seleccionar, 'delete' para eliminar y 'list' para ver cuentas.\n");
          return;
        case "salir": return;
      }
    }
  });
