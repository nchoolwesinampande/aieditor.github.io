import subprocess
import os

def run_cmd(cmd):
    """Run a git command"""
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return result.returncode == 0, result.stdout, result.stderr

print("Setting up Git repository...")

# Initialize git if needed
if not os.path.exists('.git'):
    success, out, err = run_cmd('git init')
    print("Git initialized" if success else f"Init failed: {err}")

# Set user config
run_cmd('git config user.name "Nchoolwe Progress Sinampande"')
run_cmd('git config user.email "nsinampande@snapsmicrosystems.com"')
print("Git config set")

# Remove old origin and add new
run_cmd('git remote remove origin')
success, out, err = run_cmd('git remote add origin https://github.com/snapsmicrosystems/aieditor.git')
print("Remote added" if success else f"Remote: {err}")

# Update .gitignore
gitignore = """__pycache__/
*.py[cod]
.venv/
.vscode/
*.log
test_*.jpg
test_*.png
"""
with open('.gitignore', 'w') as f:
    f.write(gitignore)
print("Updated .gitignore")

# Stage and commit
run_cmd('git add .')
success, out, err = run_cmd('git commit -m "Initial commit: AI Image Editor"')
print("Files committed" if success else f"Commit: {err}")

# Rename to main branch
run_cmd('git branch -M main')

print("\n" + "="*50)
print("READY TO PUSH TO GITHUB")
print("="*50)
print("Repository: https://github.com/snapsmicrosystems/aieditor")
print("\nPushing...")

# Push
success, out, err = run_cmd('git push -u origin main')
if success:
    print("\nSUCCESS! Project pushed to GitHub")
    print(out)
else:
    print(f"\nPush status: {err}")
    
print("\nView at: https://github.com/snapsmicrosystems/aieditor")
print("\nFuture updates:")
print("  git add .")
print('  git commit -m "message"')
print("  git push")
