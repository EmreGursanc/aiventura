import os, re, glob

game_dir = r'C:\Users\EMRE\.gemini\antigravity\scratch\aidex\public\game'

# Fix iframe navigation: location.href = '/game/chapterX.html?mission=c-gY-Z'
# should become: window.parent.location.href = '/ders/c-gY-Z'
# Also: parent.location.href = '/dersler' should stay as is for map returns

files = ['chapter3.html', 'chapter4.html', 'chapter5.html', 'chapter6.html', 'chapter7.html']

for fname in files:
    fpath = os.path.join(game_dir, fname)
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content

    # Fix 1: location.href = '/game/chapterN.html?mission=c-gX-Y' -> window.parent.location.href = '/ders/c-gX-Y'
    # Pattern: location.href = '/game/chapterN.html?mission=c-gX-Y'
    def fix_nav(m):
        mission = m.group(1)
        return f"window.parent.location.href = '/ders/{mission}'"
    
    content = re.sub(
        r"location\.href\s*=\s*['\"]\/game\/chapter\d+\.html\?mission=(c-g\d+-\d+)['\"]",
        fix_nav,
        content
    )
    
    # Fix 2: parent.location.href='/dersler' inside iframe is already okay
    # but if written as location.href='/dersler' fix it too
    content = re.sub(
        r"(?<!window\.parent\.)location\.href\s*=\s*['\"]\/dersler['\"]",
        "window.parent.location.href = '/dersler'",
        content
    )

    if content != original:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Nav patched: {fname}')
    else:
        print(f'No nav change needed: {fname}')

print('Navigation fixes done!')
