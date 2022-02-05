var http = require('http')

var url = require('url')
var qs = require('querystring')

const fs = require('fs')

var app = http.createServer((req, res) => {


    var _url = req.url
    var queryData = url.parse(_url, true).query

    var pathname = url.parse(_url, true).pathname

    var template = ``

    if (pathname === '/') {

        template = `
        <b>Hello Comrade</b>
        <br/>
        `
            + ((queryData.id !== undefined) ?
                `<a href ='/logout_process'>Logout</a>
            <form action="/delete_process" method='post'>
            <input type='hidden' value=${queryData.id} name='id'>
            <input type='submit' value='Withdraw'>
            </form>`
                :
                `<a href ='/login'>Login</a> 
             <a href ='/register'>Register</a>`)

        if (queryData.id !== undefined) {
            template += `
            <br/>
            <span>Welcome ${queryData.id}!</span>
            `
        }
        console.log('Id is ?:', queryData.id === undefined)
        console.log('url data:', url.parse(req.url, true).query)
        res.writeHead(200)
        res.end(template)

    } else if (pathname === '/login') {

        template = `
        <h1>loginpage</h1>
        <form action='/login_process' method='post'>
        <input type='text' name='id'>
        <br/>
        <input type='password' name='pw'>
        <br/>
        <input type='submit' value='Login'>
        </form>
        
        `
        console.log(queryData)
        if (queryData.notExistID) {
            template += `
            <br/>
            <span>Your input id doesn't exist!</span>
            <br/>
            <a href='/register'>Register</a>
            `
        } else if (queryData.pwIncorrect) {
            template += `
            <br/>
            <span>Your input pw is incorrect!</span>
            <br/>
            <a href='/find_pw'>Find Password</a>
            `
        }
        res.writeHead(200)
        res.end(template)

    } else if (pathname === '/login_process') {
        var body = ``

        req.on('data', (data) => {
            body += data
        })

        req.on('end', () => {
            var post = qs.parse(body)
            var id = post.id
            var pw = post.pw

            fs.readFile(`users/${id}.json`, 'utf8', (err, data) => {
                if (err) {
                    res.writeHead(302, { Location: `/login?notExistID=true` })
                    res.end()
                } else {
                    let userData = JSON.parse(data)
                    console.log('post:', post)
                    console.log('json:', userData)
                    if (pw !== userData.pw) {
                        res.writeHead(302, { Location: `/login?pwIncorrect=true` })
                        res.end()
                    } else {
                        res.writeHead(302, { Location: `/?id=${id}` })
                        res.end()
                    }

                }
            })



        })


    } else if (pathname === '/logout_process') {
        res.writeHead(302, { Location: '/' })
        res.end()
    }
    else if (pathname === '/find_pw') {
        template = `
       
        <h1>Find with your id and birthday</h1>
        <form action='/find_pw_process' method='post'>
            <label for='id'>type your id</label>
            <input type='text' id='id' placeholder='id' name='id'>
            <br/>
            <label for='birthday'>select your birthday</label>
            <input type='date' id='birthday' placeholder='birthday' name='birthday'>
            <br/>
            <input type='submit' value='Find Password'>
        </form>

        `

        if (queryData.userExist === 'false') {
            template += `
            <b>There is no matched user</b>
            `
        }
        res.writeHead(200)
        res.end(template)
    } else if (pathname === '/find_pw_process') {
        var body = ''

        req.on('data', (data) => {
            body += data
        })

        req.on('end', () => {
            var post = qs.parse(body)

            fs.readFile(`users/${post.id}.json`, 'utf8', (err, userData) => {
                if (err) {
                    var userExist = false
                    res.writeHead(302, { Location: `/find_pw?userExist=${userExist}` })
                    res.end(template)
                } else {
                    var user = JSON.parse(userData)
                    console.log(user)
                    console.log(user.birthday, post.birthday)
                    if (user.birthday === post.birthday) {
                        template =
                            `
                        <b>Your pw:${user.pw}</b>
                        <br/>
                        <a href='/login'>Login</a>
                        <br/>
                        <i>Would you like to change pw?</i>
                        <a href='/change_pw?id=${user.id}'>Yes</a>
                        `
                        res.writeHead(200)
                        res.end(template)

                    } else {
                        var userExist = false
                        res.writeHead(302, { Location: `/find_pw?userExist=${userExist}` })
                        res.end(template)
                    }
                }

            })
        })

    } else if (pathname === '/change_pw') {

        console.log('cp', queryData)


        template = `
            <div>
            <form action = '/change_pw_process?id=${queryData.id}' method= 'post'>
            <input type='hidden' name='id' value=${queryData.id}>
            <label for='new_pw' value="new password">Enter new password</label>
            <input type='password' id='new_pw' name='new_pw'>
            <br/>
            <label for='new_pw_confirm' value="new password">Confirm new password</label>
            <input type='password' id='new_pw_confirm' name='new_pw_confirm'>
            <br/>
            <input type='submit' value='Apply'>
            </form>
            </div>
            `
        if (queryData.unmatchedPW === 'true') {
            template += `
                <br/>
                <b>Passwords were differnent. Please make sure your input passwords are equal</b>
                `
        }

        res.writeHead(200)
        res.end(template)


    } else if (pathname === '/change_pw_process') {
        var body = ''
        req.on('data', (data) => {
            body += data
        })

        req.on('end', () => {
            var post = qs.parse(body)
            console.log('change pw process ', post)

            if (post.new_pw !== post.new_pw_confirm) {


                res.writeHead(302, { Location: `/change_pw?id=${post.id}&unmatchedPW=true` })
                res.end(template)
            } else {
                // console.log('qd', queryData)
                const userFile = require(`./users/${post.id}.json`)
                // console.log("user id ", post.id)
                userFile.pw = post.new_pw

                fs.writeFile(`users/${post.id}.json`, JSON.stringify(userFile), 'utf8', (err) => {
                    res.writeHead(302, { Location: `/login` })

                    res.end(template)


                })

            }

        })

    }
    else if (pathname === '/register') {

        template = `
        <h1>RegisterPage</h1>
        <br/>

        <form action="/register_process" method="post">
        <input type="text" name="id" placeholder="id">
        <br/>
        <input type="password" name="pw" placeholder="password" id="pw">
        <br/>
        <input type="password" name="pwconfirm" id =placeholder="Confirm password">
        <br/>
        <input type="date" name="birthday" placeholder="birthday">
        <br/>
        <input type="submit" value="Register">
        </form>

        
        `
        if (queryData.revisit) {
            template += `Passwords must be equal!`
        }

        res.writeHead(200)
        res.end(template)
    } else if (pathname === '/register_process') {
        var body = ''

        req.on('data', (data) => {
            body += data;
        })
        req.on('end', () => {
            var post = qs.parse(body)

            var id = post.id
            var pw = post.pw
            var pwconfirm = post.pwconfirm
            var birthday = post.birthday

            if (pw !== pwconfirm) {

                res.writeHead(302, { Location: "/register?revisit=true" })
                res.end(template)

            } else {

                let user = {
                    id: id,
                    pw: pw,
                    birthday: birthday
                }

                let data = JSON.stringify(user)
                fs.writeFile(`users/${user.id}.json`, data, 'utf8', (err) => {



                    res.writeHead(302, { Location: "/" })
                    res.end(template)
                })

            }
        })

    }else if(pathname ==='/delete_process'){

        var body = ''
        req.on('data',(data)=>{
            body+=data
        })

        req.on('end',()=>{
            var post = qs.parse(body)
            console.log('delete', post)
            fs.unlink(`users/${post.id}.json`, (err)=>{

                res.writeHead(302, { Location: "/" })
                res.end(template)
            })
        })
      
    }
})


app.listen(3000)