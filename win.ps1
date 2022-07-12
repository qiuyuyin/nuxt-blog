npm run generate
Copy-Item dist E:\yili-blog  -recurse -force
cd E:\yili-blog
git add .
git commit -m "feat: add something"
git push
cd E:\github_project\nuxt-blog