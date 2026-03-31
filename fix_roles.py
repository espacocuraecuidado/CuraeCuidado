c = open('src/components/admin/AdminUsers.tsx').read()
c = c.replace('role: "admin" | "manager" | "seller" | "client";', 'role: "admin" | "manager" | "seller" | "client" | "professional";')
c = c.replace('["admin", "manager", "seller", "client"]', '["admin", "manager", "seller", "client", "professional"]')
old = 'client: "bg-muted text-muted-foreground",'
new = old + chr(10) + '  professional: "bg-green-500/20 text-green-700",'
c = c.replace(old, new)
open('src/components/admin/AdminUsers.tsx', 'w').write(c)
print('OK')
