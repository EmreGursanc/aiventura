import os
import glob

directory = r"C:\Users\EMRE\.gemini\antigravity\scratch\aidex\public\game"
html_files = glob.glob(os.path.join(directory, "*.html"))

for file_path in html_files:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    modified = False
    
    # 1. Inject script tag
    script_tag = '<script src="/game/audio.js"></script>'
    if script_tag not in content:
        content = content.replace("</head>", f"{script_tag}\n</head>")
        modified = True
        
    # 2. Inject laser sound trigger
    laser_trigger = "if(window.playLaserSound) window.playLaserSound();"
    if laser_trigger not in content:
        # Most files use scene.add(beam);
        if "scene.add(beam);" in content:
            content = content.replace("scene.add(beam);", f"scene.add(beam);\n  {laser_trigger}")
            modified = True
            
    # 3. Inject explosion sound trigger (optional, for result screens or boss death)
    explosion_trigger = "if(window.playExplosionSound) window.playExplosionSound();"
    if explosion_trigger not in content:
        if "endGame(false" in content:
            content = content.replace("endGame(false", f"{explosion_trigger} endGame(false")
            modified = True

    if modified:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Patched {os.path.basename(file_path)}")

print("Done patching audio!")
