---
tags: [env-setup, linux, sed, shell, text-processing]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28Environemnt%20Setup.one%7C2bfde96d-9f56-6047-9368-2a88190c24b7%2FLinux%20-sed%7Cab574e37-2c04-f842-b5b2-d7bd2d6da6ed%2F%29
---

# Linux - sed

sed: 单行文本编辑器，非交互式

## 替换命令 s

```bash
sed 's/old/new/' filename
sed -e 's/old/new/' -e 's/old/new/' filename   # multiple expressions
sed -i 's/old/new/' filename                    # in-place edit
sed -i '' 's/old/new/' filename                 # in-place (mac: add '' before filename)
```

## 使用正则表达式

```bash
sed 's/正则表达式/new/' filename
sed -r 's/扩展正则表达式/new/' filename
```

## Examples

```bash
# 1. Create test file
echo a a a > afile

# 2. Chain substitutions
sed 's/a/aa/;s/aa/bb/' afile

# 3. In-place (mac)
sed -i '' 's/a/aa/;s/aa/bb/' afile

# 4. Redirect output
sed 's/a/aa/;s/aa/bb/' afile > bfile

# 5. View first 5 lines
head -5 /etc/passwd

# 6. Delete 3 chars
sed 's/...//'

# 7. Match sbin and bin
sed 's/s*bin//'

# 8. Match lines starting with root
sed 's/^root//'

# 9. Extended regex: ab+ (ab, abbb, ...)
sed -r 's/ab+/' bfile

# 10. ab* (a or ab)
sed -r 's/ab*/' bfile

# 11. Alternation with |
sed -r 's/a|b/l/' bfile

# 12. Grouping with ()
sed -r 's/(aa)|(bb)/l/' bfile

# 13. Backreference
sed -r 's/(a.*b)\1 \1/' cfile

# 14. Global replace
sed 's/old/new/g'
sed 's@old@new@g'

# 15. Replace 2nd occurrence only
sed 's/old/new/2'

# 16. Print only substituted lines
sed -n 's/root/!!!!!/p'

# 17. Write substituted lines to file
sed -n 's/root/!!!!!/w /tmp/a.txt'
```

## Address Ranges

```bash
# 18. Process specific ranges
sed '/root/s/bash/l/'                    # regex address
sed '1s/adm/~/.l'                        # line number
sed '1,$s/adm/l/'                        # line 1 to last
sed '/bin/,$s/nologin/~/g'               # mixed
/regular/{ s/old/new/ ; s/old/new/ }     # multiple commands for address

# 19. Load script from file
sed -f sedscript filename
```

## Delete (d)

```bash
# 20. Delete matching lines
sed '/ab/d' bfile
# Note: line after d command won't execute
sed '/ab/d;=' bfile  # print line numbers (= after d won't run for deleted lines)
```

## Insert / Append / Change (a/i/c/r)

```bash
# 21.
sed '/ab/i hello' bfile   # insert before matching line
sed '/ab/a hello' bfile   # append after matching line
sed '/ab/c hello' bfile   # replace matching line
sed '/ab/r afile' bfile   # read afile and insert after match
```

## Read / Write Files (r/w)

```bash
# 22.
sed '/ab/r afile' bfile > cfile   # merge multiple files
```

## Next Line (n) / Print Line Number (=)

```bash
# 23-24.
sed '/ab/p' bfile
sed -n '/ab/p' bfile
```

## Quit (q)

```bash
# 25.
seq 1 1000000 > lines.txt
wc -l lines.txt
sed -n '1,10p' lines.txt        # print first 10 lines
time sed -n '1,10p' lines.txt   # time it
sed -n '10q' lines.txt          # read only first 10 lines then quit
```

## Multi-line Mode (N/D/P)

```bash
# 26.
# N: append next line to pattern space
sed 'N;s/hel\nlo/!!!/' a.txt
sed 'N;s/hel.lo/!!!/' a.txt   # . matches \n in multiline mode

# D: delete first line of pattern space
# P: print first line of pattern space
sed 'N;s/\n/;:hello bash/hello sed\n/;P;D' b.txt
sed 'N;N;...'
```

## Hold Space (h/H/g/G/x)

```bash
# 27.
# h/H: copy/append pattern space to hold space
# g/G: copy/append hold space to pattern space
# x:   exchange pattern space and hold space
```

## Practical: Update application_orginal.yaml

```bash
# Change port
sed 's/30583/20462/' application_orginal.yaml

# Uncomment config keys
sed 's/#identityToken/identityToken/;s/#collaborationServer/collaborationServer/;s/#iServer/iServer/;s/#notification/notification/' application_orginal.yaml

# Uncomment security settings
sed 's/^#.*secretKey/ secretKey/;s/^#.*url/ url/;s/^#.*trustStore/ trustStore/;s/^#.*host$/host/1;s/^#.*port/ port/;s/^#.*apiToken/ apiToken/;s/^#.*emailTemplate/ emailTemplate/' application_orginal.yaml

# Uncomment path settings
sed 's/^#.*path/ path/;s/^#.*passphrase/ passphrase/;s/^#.*libraryServerUrl/ libraryServerUrl/' application_orginal.yaml

# Replace tokens/URLs
sed 's/ZTzpcIvvMUCaond4zSRM/123456/' application_orginal.yaml
sed 's/localhost:3000/10.27.69.39:3000/' application_orginal.yaml
sed 's/A0QDAAAAMAAAABAAA1gCJxeul4O.*/000000000000/' application_orginal.yaml
sed 's!http://localhost:8080!http://10.27.69.39:8080!' application_orginal.yaml
sed 's!jdbc:postgresql://10.23.39.36:5432/mstr_insights!jdbc:postgresql://127.0.0.1:5432/mstr_insights!' application_orginal.yaml

# update iServer apiToken
# update collab url
```
