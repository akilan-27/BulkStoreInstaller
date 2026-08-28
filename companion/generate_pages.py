import os
import re

pages_dir = r'd:\web project\multi app downloader\prompt\pages'
output_dir = r'd:\web project\multi app downloader\frontend\app'

files = {
    'about.txt': 'about',
    'disclimer.txt': 'disclaimer',
    'how it works.txt': 'how-it-works',
    'privacy policy.txt': 'privacy',
    'safety.txt': 'safety',
    'terms of use.txt': 'terms'
}

for filename, route in files.items():
    with open(os.path.join(pages_dir, filename), 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.split('\n')
    jsx_lines = []
    for line in lines:
        line = line.strip()
        if not line:
            continue
        if line.startswith('# '):
            jsx_lines.append(f'<h1 className="text-3xl font-bold mb-6 text-foreground">{{`{line[2:]}`}}</h1>')
        elif line.startswith('## '):
            jsx_lines.append(f'<h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">{{`{line[3:]}`}}</h2>')
        elif line.startswith('* '):
            jsx_lines.append(f'<li className="ml-6 list-disc mb-2 text-muted-foreground">{{`{line[2:]}`}}</li>')
        else:
            line = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', line)
            line = line.replace('"', '\\"') # escape quotes
            jsx_lines.append(f'<p className="mb-4 text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{{{__html: "{line}"}}}}></p>')
            
    final_jsx = []
    in_list = False
    for line in jsx_lines:
        if line.startswith('<li'):
            if not in_list:
                final_jsx.append('<ul className="mb-4">')
                in_list = True
            final_jsx.append(line)
        else:
            if in_list:
                final_jsx.append('</ul>')
                in_list = False
            final_jsx.append(line)
    if in_list:
        final_jsx.append('</ul>')
        
    jsx_content = '\n        '.join(final_jsx)
    
    component = f"""export default function Page() {{
  return (
    <main className="max-w-3xl mx-auto px-6 py-12 md:py-20 min-h-screen">
      <div className="prose prose-slate dark:prose-invert max-w-none">
        {jsx_content}
      </div>
    </main>
  );
}}"""
    
    page_dir = os.path.join(output_dir, route)
    os.makedirs(page_dir, exist_ok=True)
    with open(os.path.join(page_dir, 'page.tsx'), 'w', encoding='utf-8') as f:
        f.write(component)
print('Done!')
