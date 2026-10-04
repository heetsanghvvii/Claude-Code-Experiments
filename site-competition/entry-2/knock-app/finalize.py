s=open('bundle.html').read()
s=s.replace('<meta charset=UTF-8>','',1)
head='<meta charset=UTF-8><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&display=swap" rel="stylesheet">'
k='<html lang=en>'
assert k in s
s=s.replace(k,k+head,1)
open('../index.html','w').write(s)
