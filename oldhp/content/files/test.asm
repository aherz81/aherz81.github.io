0: jmp const 2256 
16: mov data , const 60 
40: sne 
48: mov reg1 , const 0 
72: mov reg2 , const 6857468 
96: mov [ reg2 ] , reg1 
124: mov reg1 , const 1936028796 
148: mov [ const 6857484 ] , reg1 
180: mov reg1 , const 1680154740 
204: mov [ const 6857488 ] , reg1 
236: mov reg1 , const 808533309 
260: mov [ const 6857492 ] , reg1 
292: mov reg1 , const 4259964 
316: mov [ const 6857496 ] , reg1 
348: mov reg1 , const 6857484 
372: mov [ const 6857500 ] , reg1 
404: mov reg1 , const 1818323068 
428: mov [ const 6857504 ] , reg1 
460: mov reg1 , const 624586604 
484: mov [ const 6857508 ] , reg1 
516: mov reg1 , const 2016419940 
540: mov [ const 6857512 ] , reg1 
572: mov reg1 , const 8157221 
596: mov [ const 6857516 ] , reg1 
628: mov reg1 , const 4259964 
652: mov [ const 6857520 ] , reg1 
684: mov reg1 , const 6857504 
708: mov [ const 6857524 ] , reg1 
740: ret 
748: mov reg1 , data 
768: sne 
776: pushn reg1 , const 2 
800: mov reg2 , reg1 
820: sub reg2 , const 12 
844: mov reg2 , [ reg2 ] 
872: push reg2 
884: mov reg2 , reg1 
904: sub reg2 , const 8 
928: mov reg2 , [ reg2 ] 
956: push reg2 
968: se 
976: call const 4247376 
992: mov reg3 , reg1 
1012: sub data , const 8 
1036: pop reg1 , const 2 
1060: mov reg2 , reg3 
1080: sne 
1088: mov data , reg1 
1108: ret 
1116: mov reg1 , data 
1136: sne 
1144: pushn reg1 , const 2 
1168: mov reg2 , const 6857500 
1192: mov reg2 , [ reg2 ] 
1220: push reg2 
1232: mov reg2 , const 10 
1256: push reg2 
1268: call const 748 
1284: mov reg3 , reg1 
1304: sub data , const 8 
1328: pop reg1 , const 2 
1352: mov reg2 , reg3 
1372: mov reg2 , const 1075838976 
1396: fadd reg2 , const 1075838976 
1420: ftodw reg2 
1432: mov [ const 6857468 ] , reg2 
1464: mov reg2 , const 6857472 
1488: add reg2 , const 0 
1512: mov reg3 , const 1078523331 
1536: mov reg4 , const 6857468 
1560: mov reg4 , [ reg4 ] 
1588: dwtof reg4 
1600: fadd reg4 , reg3 
1620: mov reg3 , reg4 
1640: ftodw reg3 
1652: mov [ reg2 ] , reg3 
1680: mov reg2 , const 6857472 
1704: add reg2 , const 4 
1728: mov reg3 , const 6857524 
1752: mov reg3 , [ reg3 ] 
1780: mov [ reg2 ] , reg3 
1808: pushn reg1 , const 2 
1832: mov reg2 , const 6857472 
1856: add reg2 , const 4 
1880: mov reg2 , [ reg2 ] 
1908: push reg2 
1920: mov reg3 , const 6857472 
1944: add reg3 , const 0 
1968: mov reg2 , reg3 
1988: mov reg2 , [ reg2 ] 
2016: push reg2 
2028: mov reg4 , const 6857472 
2052: mov reg2 , reg4 
2072: push reg2 
2084: se 
2092: call const 4247376 
2108: mov reg3 , reg1 
2128: sub data , const 12 
2152: pop reg1 , const 2 
2176: mov reg2 , reg3 
2196: sne 
2204: mov data , reg1 
2224: mov reg1 , const 1 
2248: ret 
2256: unknown command 