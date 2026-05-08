import os

path = r'c:\Users\mayur\Company-Project\trans\frontend\src\pages\profile\BusinessProfile.jsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
inserted = False
for line in lines:
    new_lines.append(line)
    if 'maxLength={15}' in line and not inserted:
        # Find the next </Field> and </div>
        # Actually just insert after the Field closing
        pass

# Easier approach: find the specific block and replace
content = "".join(lines)
target = """                  <Field label={getTranslatedText('GSTIN (Optional)')} error={errors.gstin}>
                    <input 
                      {...register('gstin', {
                        pattern: { value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}Z[A-Z0-9]{1}$/i, message: getTranslatedText('Invalid GSTIN format') }
                      })} 
                      onInput={(e) => {
                        e.target.value = e.target.value.toUpperCase().replace(/\\s/g, '').slice(0, 15);
                      }}
                      placeholder="24AAAAA0000A1Z5" 
                      className="form-input" 
                      maxLength={15} 
                    />
                  </Field>
               </div>"""

replacement = """                  <Field label={getTranslatedText('GSTIN (Optional)')} error={errors.gstin}>
                    <input 
                      {...register('gstin', {
                        pattern: { value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}Z[A-Z0-9]{1}$/i, message: getTranslatedText('Invalid GSTIN format') }
                      })} 
                      onInput={(e) => {
                        e.target.value = e.target.value.toUpperCase().replace(/\\s/g, '').slice(0, 15);
                      }}
                      placeholder="24AAAAA0000A1Z5" 
                      className="form-input" 
                      maxLength={15} 
                    />
                  </Field>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', padding: '12px 16px', borderRadius: 16, border: '1px solid #E2E8F0', marginTop: 10 }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0F0D2E' }}>{getTranslatedText('GST Applicable')}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748B' }}>{getTranslatedText('Calculate GST on bills')}</div>
                    </div>
                    <label className="switch">
                      <input type="checkbox" {...register('isGstApplicable')} />
                      <span className="slider round"></span>
                    </label>
                  </div>
               </div>"""

if target in content:
    new_content = content.replace(target, replacement)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Success")
else:
    # Try with different whitespace
    print("Target not found exactly")
    # Let's try finding the line index
    idx = -1
    for i, l in enumerate(lines):
        if 'maxLength={15}' in l:
            idx = i
            break
    if idx != -1:
        # Search for the next </div>
        for j in range(idx, len(lines)):
            if '</div>' in lines[j] and lines[j].strip() == '</div>':
                # Check if it's the right one (the one closing the column)
                # In our file, it's lines 408
                lines.insert(j, """                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', padding: '12px 16px', borderRadius: 16, border: '1px solid #E2E8F0', marginTop: 10 }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0F0D2E' }}>{getTranslatedText('GST Applicable')}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748B' }}>{getTranslatedText('Calculate GST on bills')}</div>
                    </div>
                    <label className="switch">
                      <input type="checkbox" {...register('isGstApplicable')} />
                      <span className="slider round"></span>
                    </label>
                  </div>
""")
                with open(path, 'w', encoding='utf-8') as f:
                    f.write("".join(lines))
                print("Success via line search")
                break
