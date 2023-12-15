Update log: (guys when u update something, please write a log here):

13/12:

1. Chan Cho Kit
Update index.js -> index.jsx
I change a little bit on the UI, basically introduce a global var "login"=0. When login as an user, login=1. When login as an admin, login=2. It will affect the content on content and login page. 

2. Fong
   add sorting and searching function in index.jsx and server.js

3. Chan Cho Kit
   Add forms to "Content" for admin (login=2), buttons have no functions yet. Also the "Title" part for non-user (login=0) changes

14/12:

1. Chan Cho Kit
fix the bug of cannot register/login an admin ac
bug1. cannot register an user ac ('Fail to register due to unknown error')
bug2. after login as an admin, the web cannot GET "/". But if you terminate "node server.js" and reload, it works. Same situation happens in logout

15/12:

1. Chan Cho Kit
The admin CRUD part is done. Please fill in your Work Distribution on Home page.

