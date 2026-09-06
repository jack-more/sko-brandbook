import re,sys
BANNED=['GLP', 'GLP-1', 'GLP-3', 'GIP', 'glucagon', 'agonist', 'incretin', 'metabolic', 'metabolism', 'adipose', 'body composition', 'appetite', 'weight', 'fat', 'obesity', 'Cagrilintide', 'TRZ', 'SKO-TRZ', 'retatrutide', 'Metabolic Reference Bundle']
t=open(sys.argv[1],errors="ignore").read().lower(); hits=[w for w in BANNED if re.search(r"(?<![a-z])"+re.escape(w.lower())+r"(?![a-z])",t)]
print("hits:",hits); sys.exit(1 if hits else 0)
