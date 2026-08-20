import os

files = ['index.html', 'cross-trainer.html', 'gym-equipment.html', 'protein-powder.html', 'treadmills.html']

for f in files:
    if os.path.exists(f):
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Check if already added
        if 'src="js/script.js"' not in content:
            new_content = content.replace('</body>', '  <!-- Custom JS -->\n  <script src="js/script.js"></script>\n</body>')
            with open(f, 'w', encoding='utf-8') as file:
                file.write(new_content)
            print(f"Updated {f}")
        else:
            print(f"Skipped {f}")
