'use babel';
import runGitCommand from './runCommand';
async function email() {
    return runGitCommand(__dirname, `config --global user.email`);
}
export default email;
