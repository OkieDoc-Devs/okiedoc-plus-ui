from pathlib import Path
from pprint import pprint
text = Path('src/Specialists/SpecialistDashboard.jsx').read_text(encoding='utf-8')
stack = []
openers = {'(':')','{':'}','[':']'}
closers = {')':'(', '}':'{', ']':'['}
line=1
for idx,ch in enumerate(text):
    if ch == '\n':
        line += 1
    elif ch in openers:
        stack.append((ch,line,idx))
    elif ch in closers:
        if not stack or stack[-1][0] != closers[ch]:
            print('MISMATCH', ch, 'at line', line, 'stack top', stack[-1] if stack else None)
            break
        stack.pop()
else:
    if stack:
        print('UNMATCHED', stack[-1])
    else:
        print('BALANCED')

# print around line 2680 context if unmatched
if stack:
    for opener,line,idx in stack[-5:]:
        start = max(0, idx-80)
        end = min(len(text), idx+80)
        print('--- context around', opener, 'line', line, '---')
        print(repr(text[start:end]))
