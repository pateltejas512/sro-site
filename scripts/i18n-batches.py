# Writes translation source batches (30 questions each) for questions missing a language.
import json, sys
OUT = sys.argv[1]
q = json.load(open('data/live/questions.json'))
done = json.load(open('data/live/i18n.json'))
skip = {'English', 'Gujarati', 'Hindi'}
t = [x for x in q if x['subject'] not in skip]
key = lambda x: (x['subject'], x['chapter'], x['topic'], x['id'])
en = sorted([x for x in t if x['primaryLang'] == 'en'], key=key)
gu = sorted([x for x in t if x['primaryLang'] == 'gu'], key=key)
def dump(lst, prefix):
    for n, i in enumerate(range(0, len(lst), 30), 1):
        with open(f'{OUT}/{prefix}{n:02d}.txt', 'w') as f:
            for x in lst[i:i+30]:
                tx = x['text'][x['primaryLang']]
                f.write(json.dumps({'id': x['id'], 's': tx['stem'], 'o': tx['options'], 'q': tx['quick']}, ensure_ascii=False) + '\n')
dump(en, 'en'); dump(gu, 'gu')
print(len(en), len(gu))
