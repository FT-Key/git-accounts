import keytar from "keytar";
import simpleGit from "simple-git";
import { promptAddAccount, promptSelectAccount, promptConfirmDelete } from "./prompts.js";

const SERVICE_PREFIX = "git-accounts";
const git = simpleGit();

export async function addAccountInteractive(data = {}) {
  let { githubUser, githubEmail, commitName, commitEmail, token } = data;

  const answers = await promptAddAccount(data);
  githubUser = answers.githubUser;
  githubEmail = answers.githubEmail;
  commitName = answers.commitName || githubUser; // default to auth user
  commitEmail = answers.commitEmail || githubEmail; // default to auth email
  token = answers.token;

  if (!githubUser || !githubEmail || !token) return;

  const payload = JSON.stringify({ githubUser, githubEmail, commitName, commitEmail, token });
  await keytar.setPassword(`${SERVICE_PREFIX}:${githubUser}`, githubUser, payload);

  console.log(`✅ Account saved: ${githubUser} (${githubEmail})`);
}

export async function listAccountsInteractive() {
  const creds = await keytar.findCredentials(SERVICE_PREFIX);
  if (!creds.length) return console.log("⚠️ No saved accounts.");

  const choices = creds.map((c) => {
    const { githubUser, githubEmail } = JSON.parse(c.password);
    return { name: `${githubUser} (${githubEmail})`, value: c.account };
  });

  const selected = await promptSelectAccount(choices, "Select an account to view/edit:");
  if (!selected) return;

  const data = JSON.parse((await keytar.getPassword(`${SERVICE_PREFIX}:${selected}`, selected)) || "{}");
  console.log("\nAccount details:");
  console.log(data);

  const edit = await promptConfirmDelete("Do you want to edit this account?");
  if (edit) {
    // call addAccountInteractive with preloaded data to edit
    await addAccountInteractive(data);
  }
}

export async function useAccountInteractive() {
  const creds = await keytar.findCredentials(SERVICE_PREFIX);
  if (!creds.length) return console.log("⚠️ No saved accounts.");

  const choices = creds.map((c) => {
    const { githubUser, githubEmail, commitName, commitEmail } = JSON.parse(c.password);
    return {
      name: `${githubUser} (${githubEmail}) | Commits: ${commitName} (${commitEmail})`,
      value: { githubUser, githubEmail, commitName, commitEmail },
    };
  });

  const { selected } = await promptSelectAccount(choices, "Select an account to use:");
  if (!selected) return;

  await git.raw(["config", "--global", "user.name", selected.commitName]);
  await git.raw(["config", "--global", "user.email", selected.commitEmail]);

  console.log(`✅ Using GitHub account: ${selected.githubUser} (${selected.githubEmail})`);
  console.log(`✅ Commit config: ${selected.commitName} (${selected.commitEmail})`);
}

export async function deleteAccountInteractive() {
  const creds = await keytar.findCredentials(SERVICE_PREFIX);
  if (!creds.length) return console.log("⚠️ No saved accounts.");

  const choices = creds.map((c) => {
    const { githubUser, githubEmail } = JSON.parse(c.password);
    return { name: `${githubUser} (${githubEmail})`, value: c.account };
  });

  const selected = await promptSelectAccount(choices, "Select an account to delete:");
  if (!selected) return;

  const confirm = await promptConfirmDelete(`Are you sure you want to delete ${selected}?`);
  if (!confirm) return;

  await keytar.deletePassword(`${SERVICE_PREFIX}:${selected}`, selected);
  console.log(`🗑️ Account deleted: ${selected}`);
}
