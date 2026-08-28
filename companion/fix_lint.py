import os
import re

def fix_file(filepath, fixes):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for fix in fixes:
        content = content.replace(fix[0], fix[1])
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

base_dir = r"d:\web project\multi app downloader\frontend\components"

# CompanionDialog.tsx
fix_file(os.path.join(base_dir, "dialogs", "CompanionDialog.tsx"), [
    ('import { motion } from "framer-motion";\n', ''),
    ('import { Download, WifiOff, ExternalLink } from "lucide-react";', 'import { Download, WifiOff } from "lucide-react";')
])

# InfoDialog.tsx
fix_file(os.path.join(base_dir, "dialogs", "InfoDialog.tsx"), [
    ('import { motion, AnimatePresence } from "framer-motion";\n', '')
])

# InstallDialog.tsx
fix_file(os.path.join(base_dir, "dialogs", "InstallDialog.tsx"), [
    ('import { motion, AnimatePresence } from "framer-motion";', 'import { motion, AnimatePresence } from "framer-motion";'), # no-op, just to check
    ('  CheckCircle2,\n  Circle,\n  Loader2,\n  XCircle,', '  CheckCircle2,\n  Circle,\n  XCircle,'),
    ('}, [hasStarted, localQueue.length, backendStatus.queue]);', '}, [hasStarted, localQueue, backendStatus.queue]);')
])

# ReportDialog.tsx
fix_file(os.path.join(base_dir, "dialogs", "ReportDialog.tsx"), [
    ('import { Bug, Lightbulb, MessageSquare, Send, ChevronDown } from "lucide-react";', 'import { Bug, Lightbulb, MessageSquare, Send } from "lucide-react";'),
    ('import { Bug, MessageSquare, Send, ChevronDown, CheckCircle2 } from "lucide-react";', 'import { Bug, MessageSquare, Send, CheckCircle2 } from "lucide-react";')
])
# Need to know the exact import for ReportDialog. I'll use regex.
with open(os.path.join(base_dir, "dialogs", "ReportDialog.tsx"), 'r', encoding='utf-8') as f:
    content = f.read()
content = re.sub(r'ChevronDown,\s*', '', content)
with open(os.path.join(base_dir, "dialogs", "ReportDialog.tsx"), 'w', encoding='utf-8') as f:
    f.write(content)


# SearchInput.tsx
with open(os.path.join(base_dir, "inputs", "SearchInput.tsx"), 'r', encoding='utf-8') as f:
    content = f.read()
content = re.sub(r'import { Button } from "@/components/ui/button";\n', '', content)
with open(os.path.join(base_dir, "inputs", "SearchInput.tsx"), 'w', encoding='utf-8') as f:
    f.write(content)

# CartDrawer.tsx
with open(os.path.join(base_dir, "layout", "CartDrawer.tsx"), 'r', encoding='utf-8') as f:
    content = f.read()
content = re.sub(r'Download,\s*', '', content)
with open(os.path.join(base_dir, "layout", "CartDrawer.tsx"), 'w', encoding='utf-8') as f:
    f.write(content)

# Footer.tsx, Navbar.tsx, app-icon.tsx -> eslint-disable-next-line @next/next/no-img-element
def disable_img_warning(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    content = re.sub(r'(<img)', r'{/* eslint-disable-next-line @next/next/no-img-element */}\n\1', content)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

disable_img_warning(os.path.join(base_dir, "layout", "Footer.tsx"))
disable_img_warning(os.path.join(base_dir, "navigation", "Navbar.tsx"))
disable_img_warning(os.path.join(base_dir, "ui", "app-icon.tsx"))

# Navbar.tsx theme unused
with open(os.path.join(base_dir, "navigation", "Navbar.tsx"), 'r', encoding='utf-8') as f:
    content = f.read()
content = re.sub(r'const { theme, setTheme }', r'const { setTheme }', content)
with open(os.path.join(base_dir, "navigation", "Navbar.tsx"), 'w', encoding='utf-8') as f:
    f.write(content)

# InstallProgress.tsx isInstalling unused
with open(os.path.join(base_dir, "ui", "InstallProgress.tsx"), 'r', encoding='utf-8') as f:
    content = f.read()
content = re.sub(r',\s*isInstalling\s*=\s*false', '', content)
content = re.sub(r',\s*isInstalling\?: boolean;', '', content)
with open(os.path.join(base_dir, "ui", "InstallProgress.tsx"), 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixes applied.")
