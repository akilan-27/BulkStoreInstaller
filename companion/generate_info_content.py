import os
import re

pages_dir = r'd:\web project\multi app downloader\prompt\pages'
output_file = r'd:\web project\multi app downloader\frontend\constants\infoContent.tsx'

files = {
    'about.txt': 'about',
    'disclimer.txt': 'disclaimer',
    'how it works.txt': 'how-it-works',
    'privacy policy.txt': 'privacy',
    'safety.txt': 'safety',
    'terms of use.txt': 'terms'
}

titles = {
    'about': 'About Us',
    'disclaimer': 'Disclaimer',
    'how-it-works': 'How It Works',
    'privacy': 'Privacy Policy',
    'safety': 'Safety',
    'terms': 'Terms of Use'
}

content_dict = []

for filename, route in files.items():
    with open(os.path.join(pages_dir, filename), 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.split('\n')
    jsx_lines = []
    
    # skip the first h1
    found_first_h1 = False

    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        if line.startswith('# '):
            if not found_first_h1:
                found_first_h1 = True
                continue
            jsx_lines.append(f'<h1 className="text-xl font-bold text-foreground mt-6 mb-3">{{`{line[2:]}`}}</h1>')
        elif line.startswith('## '):
            jsx_lines.append(f'<h2 className="text-sm font-semibold text-foreground mt-6 mb-2">{{`{line[3:]}`}}</h2>')
        elif line.startswith('* '):
            jsx_lines.append(f"""<li className="relative pl-4 text-[13px] text-muted-foreground leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:bg-primary/40 before:rounded-full">{{`{line[2:]}`}}</li>""")
        else:
            line = re.sub(r'\*\*(.*?)\*\*', r'<strong className="text-foreground font-medium">\1</strong>', line)
            line = line.replace('"', '\\"') # escape quotes
            jsx_lines.append(f'<p className="mb-4 text-[13px] text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{{{__html: "{line}"}}}}></p>')
            
    final_jsx = []
    in_list = False
    for line in jsx_lines:
        if line.startswith('<li'):
            if not in_list:
                final_jsx.append('<ul className="mb-4 space-y-2">')
                in_list = True
            final_jsx.append(line)
        else:
            if in_list:
                final_jsx.append('</ul>')
                in_list = False
            final_jsx.append(line)
    if in_list:
        final_jsx.append('</ul>')
        
    jsx_content = '\n      '.join(final_jsx)
    
    dict_entry = f'''
  "{route}": (
    <div className="space-y-1">
      {jsx_content}
    </div>
  )'''
    content_dict.append(dict_entry)

full_file = f'''import React from "react";

export const infoContent: Record<string, React.ReactNode> = {{{','.join(content_dict)}
}};

export const infoTitles: Record<string, string> = {titles};
'''

with open(output_file, 'w', encoding='utf-8') as f:
    f.write(full_file)

print('Done!')
