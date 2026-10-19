with open('map.html','r',encoding='utf-8') as f: c=f.read()
fixes=[('lng:123.0906,lat:10.4808','lng:123.092328,lat:10.481988'),('lng:123.0474,lat:10.4552','lng:123.047931,lat:10.455348'),('lng:123.0555,lat:10.4486','lng:123.086663,lat:10.427096'),('lng:123.0474, lat:10.4552}','lng:123.047931, lat:10.455348}')]
[ (c:=c.replace(o,n), print('Fixed',o[:30])) for o,n in fixes if o in c ]
with open('map.html','w',encoding='utf-8') as f: f.write(c)
print('done')
