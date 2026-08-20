import os, re

game_dir = r'C:\Users\EMRE\.gemini\antigravity\scratch\aidex\public\game'

# XP fixes: chapter file -> list of (mission_id, old_xp, new_xp)
FIXES = {
    'chapter3.html': [
        ('c-g3-1', 150, 300),
        ('c-g3-2', 150, 300),
        ('c-g3-3', 200, 400),
    ],
    'chapter4.html': [
        ('c-g4-1', 150, 400),
        ('c-g4-2', 150, 400),
        ('c-g4-3', 200, 500),
    ],
    'chapter5.html': [
        ('c-g5-1', 150, 500),
        ('c-g5-2', 150, 500),
        ('c-g5-3', 200, 600),
    ],
    'chapter6.html': [
        ('c-g6-1', 150, 600),
        ('c-g6-2', 150, 600),
        ('c-g6-3', 200, 700),
    ],
    'chapter7.html': [
        ('c-g7-1', 200, 700),
        ('c-g7-2', 200, 700),
        ('c-g7-3', 300, 800),
    ],
}

# voxel-ai-builder separate fix
VOXEL_FIXES = [
    ('xp: 50,', 'xp: 100,'),
    ('xp: 100,\n    introText: "GLITCH artık mavi', 'xp: 120,\n    introText: "GLITCH artık mavi'),
]

for fname, mission_fixes in FIXES.items():
    fpath = os.path.join(game_dir, fname)
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    for (mission_id, old_xp, new_xp) in mission_fixes:
        # The CFG block has structure like: 'c-g3-1': {\n    xp: 150,
        old_pattern = f"'{mission_id}':" + r"[\s\S]*?xp:\s*" + str(old_xp)
        def replacer(m, new_xp=new_xp):
            return m.group(0).rsplit(str(old_xp), 1)[0] + str(new_xp)
        content = re.sub(old_pattern, replacer, content, count=1)

    if content != original:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'XP patched: {fname}')
    else:
        print(f'WARNING - No change detected: {fname}')

# Fix voxel-ai-builder.html: c-g1-1 xp 50->100
voxel_path = os.path.join(game_dir, 'voxel-ai-builder.html')
with open(voxel_path, 'r', encoding='utf-8') as f:
    voxel = f.read()

voxel_orig = voxel
# c-g1-1 xp: 50 -> 100
voxel = re.sub(r"('c-g1-1':[\s\S]*?xp:\s*)50", lambda m: m.group(0)[:-2] + '100', voxel, count=1)
# c-g1-2 xp: 100 -> 120 (needs to be inside c-g1-2 block)
voxel = re.sub(r"('c-g1-2':[\s\S]*?xp:\s*)100", lambda m: m.group(0)[:-3] + '120', voxel, count=1)

if voxel != voxel_orig:
    with open(voxel_path, 'w', encoding='utf-8') as f:
        f.write(voxel)
    print('XP patched: voxel-ai-builder.html')
else:
    print('WARNING - No change detected: voxel-ai-builder.html')

print('Done!')
