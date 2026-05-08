import os

path = r'c:\Users\mayur\Company-Project\trans\frontend\src\pages\admin\SoftwareSales.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix setForm logic
target1 = """            const price = Number(selected.price) || 0
            const gst = Math.round(price * 0.18)
            const total = price + gst
            setForm(p => ({ ...p, planId: val, totalAmount: total }))"""

replacement1 = """            setForm(p => ({ ...p, planId: val, totalAmount: Number(selected.price) || 0 }))"""

# 2. Fix the UI text
target2 = """                {form.planId && (
                    <div style={{ fontSize: '0.65rem', color: '#64748B', marginTop: 4, fontWeight: 700 }}>
                       Inc. 18% GST (₹{Math.round(form.totalAmount - (form.totalAmount / 1.18))} approx)
                    </div>
                 )}"""

replacement2 = """                {form.planId && (
                    <div style={{ fontSize: '0.65rem', color: '#64748B', marginTop: 4, fontWeight: 700 }}>
                       Final All-inclusive Price
                    </div>
                 )}"""

# Use flexible replacement for target1 (handling potential indentation issues)
if "const gst = Math.round(price * 0.18)" in content:
    # Find the block manually
    lines = content.splitlines()
    new_lines = []
    skip = 0
    for i in range(len(lines)):
        if skip > 0:
            skip -= 1
            continue
        if "const gst = Math.round(price * 0.18)" in lines[i]:
            # This line and the surrounding ones need to be replaced
            # We assume it's part of the planId block
            # Actually, let's just look for the specific lines
            # lines[i-1] should be const price = ...
            # lines[i+1] should be const total = ...
            # lines[i+2] should be setForm...
            # We'll just replace this one line and the total calculation
            pass
    
    # Simpler: regex-like replacement for specific lines
    import re
    content = re.sub(r'const price = Number\(selected\.price\) \|\| 0\s+const gst = Math\.round\(price \* 0\.18\)\s+const total = price \+ gst\s+setForm\(p => \(\{ \.\.\.p, planId: val, totalAmount: total \}\)\)', 
                     'setForm(p => ({ ...p, planId: val, totalAmount: Number(selected.price) || 0 }))', content, flags=re.MULTILINE)
    
    content = re.sub(r'Inc\. 18% GST \(₹\{Math\.round\(form\.totalAmount - \(form\.totalAmount / 1\.18\)\)\} approx\)', 
                     'Final All-inclusive Price', content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated SoftwareSales.jsx")
