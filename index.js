const express = require('express')
const db = require('./connection/db')
const bcrypt = require('bcrypt')
const session = require('express-session')
const flash = require('express-flash')
const upload = require('./middleware/fileUpload')

const app = express()
port = 2000

app.set('view engine', 'hbs')
app.use('/assets', express.static(__dirname + '/assets'))
app.use('/upload', express.static(__dirname + '/upload'))
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized : true,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000
    }

}))




app.get('/', function (request, response) {

    db.connect(function (err, client, done) {
        if (err) throw err

        const query = `SELECT tb_project.id, tb_project.name, tb_project.start_date, tb_project.end_date, tb_project.description, tb_project.technologies,tb_project.image, tb_project.name_id 
                        FROM public.tb_project
                        left JOIN tb_user on tb_project.name_id = tb_user.id ORDER BY id DESC`

        client.query(query, function (err, result) {
            if (err) throw err

            // console.log(result.rows)
            let data = result.rows

            let myProject = data.map(function (item) {
                return {
                    ...item,
                    start_date: getFullTime(item.start_date),
                    end_date: getFullTime(item.end_date),
                    duration: getDistanceTime(item.start_date, item.end_date),
                    isLogin: request.session.isLogin 

                }
            })

            let filterProject
            if (request.session.user){
                filterProject = myProject.filter(function(item){
                    return item.name_id === request.session.user.id
                })
                // console.log(filterProject);
            }

            let project = request.session.user ? filterProject : myProject

            // console.log(myProject);
            response.render('index', {myProject : project, user: request.session.user,  isLogin: request.session.isLogin })
        })
    })
})

app.get('/form', function (request, response) {

    response.render('form', {user: request.session.user,  isLogin: request.session.isLogin})
})

app.get('/detail-project/:index', function (request, response) {
    let index = request.params.index

    db.connect(function (err, client, done) {
        if (err) throw err

        client.query(`SELECT * FROM tb_project WHERE id=${index}`, function (err, result) {
            if (err) throw err

            // console.log(result.rows)
            let data = result.rows

            let myProject = data.map(function (item) {
                return {
                    ...item,
                    start_date: getFullTime(item.start_date),
                    end_date: getFullTime(item.end_date),
                    duration: getDistanceTime(item.start_date, item.end_date),
                }
            })
            response.render('detail-project', { project: myProject[0], isLogin: request.session.isLogin, user: request.session.user  })
        })
    })
})

app.get('/delete-project/:index', function (request, response) {
    let index = request.params.index

    db.connect(function (err, client, done) {
        if (err) throw err

        let query = `DELETE FROM tb_project WHERE id=${index}`

        client.query(query, function (err, result) {
            if (err) throw err

            response.redirect('/')
        })
    })
})

app.get('/add-project', function (request, response) {
    if(!request.session.user){
        request.flash('warning', 'silahkan login terlebih dahulu')
        return response.redirect('/login')
    }
    response.render('add-project',{user: request.session.user,  isLogin: request.session.isLogin})
})

app.post('/add-project', upload.single('inputFile'), function (request, response) {
   
    // let image = request.body.inputFile
   
    let {inputName,inputStartDate,inputEndDate,exampleFormControlTextarea1,check1,check2,check3,check4,inputFile} = request.body
    // console.log(request.file.filename);
    const image = request.file.filename


    db.connect(function (err, client, done) {
        if (err) throw err
        let userId = request.session.user.id


        let query = `INSERT INTO tb_project (name, start_date, end_date, description, technologies, image, name_id) VALUES
                ('${inputName}', '${inputStartDate}', '${inputEndDate}', '${exampleFormControlTextarea1}','{"${check1}","${check2}","${check3}","${check4}"}','${image}', '${userId}')`

        client.query(query, function (err, result) {
            if (err) throw err

            // console.log(result.rows)
            let data = result.rows

            let myProject = data.map(function (item) {
                return {
                    ...item,
                    start_date: getFullTime(item.start_date),
                    end_date: getFullTime(item.end_date),
                    duration: getDistanceTime(item.start_date, item.end_date),
                }
            })
            response.redirect('/')
        })
    })
})

app.get('/edit-project/:index', function (request, response) {
    let index = request.params.index

    db.connect(function (err, client, done) {
        if (err) throw err // menampilkan error koneksi database

        let query = `SELECT * FROM tb_project WHERE id='${index}'`

        client.query(query, function (err, result) {
            if (err) throw err // menampilkan error dari query

            let data = result.rows
            // console.log(result.rows[0].image);
            let day = result.rows[0].start_date.getDate()
            if(day < 10){
                day = `0${day}`
            }
            let month = result.rows[0].start_date.getMonth()
            if(month <= 9){
                month = `0${month + 1}`
            }else{
                month = `${month + 1}`
            }
            
            let year = result.rows[0].start_date.getFullYear()
            let startDate = `${year}-${month}-${day}`

            let endDay = result.rows[0].end_date.getDate()
            if(endDay < 10){
                endDay =`0${endDay}`
            }
            let endMonth = result.rows[0].end_date.getMonth()
            if(endMonth <= 9){
                endMonth = `0${endMonth + 1}`
            }else{
                endMonth = `${endMonth + 1}`
            }
            let endYear = result.rows[0].end_date.getFullYear()
            let endDate =`${endYear}-${endMonth}-${endDay}`

            response.render('edit-project', { data: data[0], startDate, endDate, user: request.session.user, isLogin: request.session.isLogin})
        })
    })
})

app.post('/edit-project/:index', upload.single('inputFile'), function (request, response) {
    let index = request.params.index
    // let image = request.body.inputFile
  
    let {inputName,inputStartDate,inputEndDate,exampleFormControlTextarea1,check1,check2,check3,check4,inputFile} = request.body

    const image = request.file.filename

    db.connect(function (err, client, done) {
        if (err) throw err

        let query = `UPDATE public.tb_project
                    SET  name='${inputName}', start_date='${inputStartDate}', end_date='${inputEndDate}', description='${exampleFormControlTextarea1}',
                    technologies = '{${check1},${check2},${check3},${check4}}', image = '${image}'
                    WHERE id ='${index}';`

        client.query(query, function (err, result) {
            if (err) throw err
            let data = result.rows

            response.redirect('/')
        })
    })

})

app.get('/register', function (request, response) {
    response.render('register')
})
app.post('/register', function (request, response) {
    let {inputName, inputEmail, inputPassword} = request.body
    const password = bcrypt.hashSync(inputPassword, 10)
    
    // console.log(request.body);
    db.connect(function (err, client, done) {
        if (err) throw err

        let query = `INSERT INTO public.tb_user(name, email, password)
            VALUES ('${inputName}', '${inputEmail}', '${password}');`

        client.query(query, function (err, result) {
            if (err) throw err
            // map
            response.redirect('/login')
        })
    })
})

app.get('/login', function (request, response) {
    response.render('login')
})

app.post('/login', function (request, response) {
    const {inputEmail, inputPassword} = request.body

    let query = `SELECT * FROM tb_user WHERE email='${inputEmail}'`

    db.connect(function(err, client, done) {
        if (err) throw err

        client.query(query, function(err, result){
            if (err) throw err
            done()
            
            if(result.rows.length == 0){
                // console.log("Email belum terdaftar");
                
                request.flash('warning', 'Email belum terdaftar')
                return response.redirect('/login') 
              
            }

            let isMatch = bcrypt.compareSync(inputPassword, result.rows[0].password)

            // console.log(isMatch);

            if(isMatch){

                request.session.isLogin = true

                request.session.user = {
                    id: result.rows[0].id,
                    name: result.rows[0].name,
                    email: result.rows[0].email
                }

                request.flash('succes', 'login berhasil')
                response.redirect('/')     

            }else{
                // console.log("Password salah");
                request.flash('warning', 'Password salah')
                response.redirect('/login')     
            }
        })
    })
})

app.get('/logout', function (request, response) {
    request.session.destroy()

    response.redirect('/')
})

function getFullTime(time) {

    let month = ["Januari", "Febuari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "Nopember", "Desember"]

    let date = time.getDate()
    let monthIndex = time.getMonth()
    let year = time.getFullYear()

    let hours = time.getHours()
    let minutes = time.getMinutes()

    let fullTime = `${date} ${month[monthIndex]} ${year}`
    return fullTime
}

function getDistanceTime(start, end) {
    let startDate = new Date(start)
    let endDate = new Date(end)

    let distance = endDate - startDate

    let milisecond = 1000
    let secondInHours = 3600
    let hoursInDay = 24

    let distanceDay = Math.floor(distance / (milisecond * secondInHours * hoursInDay))
    let distanceHours = Math.floor(distance / (milisecond * 60 * 60))
    let distanceMinutes = Math.floor(distance / (milisecond * 60))
    let distanceSeconds = Math.floor(distance / milisecond)

    return `${distanceDay} day`

}

app.listen(port, function () {
    console.log(`server running on port ${port}`);
})
