//Carregando módulos
    const express = require("express")
    const handlebars = require("express-handlebars")
    const bodyParser = require("body-parser")
    const moment = require('moment')

    const app = express()
    const path = require("path")
    const mongoose = require("mongoose")
    const session = require("express-session")
    const flash = require("connect-flash")

    require("./models/Noticia")
    const Noticia = mongoose.model("noticias")

    require("./models/Categoria")
    const Categoria = mongoose.model("categorias")

    //Grupo de Rotas
    const admin = require("./routes/admin")
    const usuarios = require("./routes/usuario")

    const passport = require("passport")
    require("./config/auth")(passport)

    const {eAdmin} = require("./helpers/eAdmin")    

    const db = require("./config/db")

//Configurações
    //Sessão
        //Tudo que tiver app.use é um middleware
        app.use(session({
            secret: "cursodenode",
            resave: true,
            saveUninitialized: true 
        }))
        //Configuração do Passport
        app.use(passport.initialize())
        app.use(passport.session())

        //flash
        app.use(flash())

    //Middleware
        app.use((req, res, next) => {
            //para criar variáves globais
            res.locals.success_msg = req.flash("success_msg"),
            res.locals.error_msg = req.flash("error_msg")
            res.locals.error = req.flash("error")
            res.locals.user = req.user || null
            next()
        })

    //Body Parser
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())
    //Handlebars
        app.engine('handlebars', handlebars({
            defaultLayout: ('main'),
            helpers: { 
                formatDate: (date) => {
                    return moment(date).format('DD/MM/YYYY')
                }
            }
            
        }));

        
        
        app.set('view engine', 'handlebars');    

    // Mongoose
        mongoose.connect(db.mongoURI, {useNewUrlParser: true}).then(() => {
            console.log("Conectado ao Banco de dados!")
        }).catch((error) => {
            console.log("Erro ao conectar: "+ error)
        }) 
 
    //Public 
        app.use(express.static(path.join(__dirname, "public")))
        


//Rotas
    
    //Rota Principal
    app.get("/", (req, res) => {
        Noticia.find().populate("categoria").sort({data: "desc"}).then((noticias) =>{
            res.render("index", {noticias: noticias})
        }).catch((error) => {
            req.flash("error_msg", "Houve um erro interno." + error)
            res.redirect("/404")
        })
    }) 
    
    //Noticia - Leia Mais
    app.get("/Noticia/:slug", (req, res) => {
        Noticia.findOne({slug: req.params.slug}).then((Noticia) =>{

            if(Noticia){
               res.render("Noticia/index", {Noticia: Noticia}) 
            }else {
               req.flash("error_msg", "Está Noticia não existe.")
               res.redirect("/")
            }

        }).catch((error) => {
            req.flash("error_msg", "Houve um erro interno." + error)
            res.redirect("/")
        })    
    })

    //Listagem de categorias
    app.get("/categorias", (req, res) => {
        Categoria.find().then((categorias) => {
            res.render("categorias/index", {categorias: categorias})
        }).catch((error) => {
            req.flash("error_msg", "Houve um erro interno ao listar as categorias.")
            res.redirect("/")
        }) 
    })

    //Listar noticias pertencentes a uma certa categoria
    app.get("/categorias/:slug", (req, res) =>{
        Categoria.findOne({slug: req.params.slug}).then((categoria) => {

            if(categoria){
               
                Noticia.find({categoria: categoria._id}).then((noticias) => {

                    res.render("categorias/noticias", {noticias: noticias, categoria: categoria})

                }).catch((error) => {

                    req.flash("error_msg", "Houve um erro ao listar as noticias.")
                    res.redirect("/")
                }) 

            } else {

                req.flash("error_msg", "Essa categoria não existe.")
                res.redirect("/")    

            }

        }).catch((error) => {
            req.flash("error_msg", "Houve um erro interno ao carregar a página dessa categoria." + error)
            res.redirect("/")
        })
    })
    
    //Rota de erro
    app.get("/404", (req, res) => {
        res.send("Error 404!")
    })
    
    //eAdmin -> Verificar se o usuário tem permissão
    app.use('/admin', eAdmin, admin)
    app.use("/usuarios", usuarios)


//Porta de acesso
const PORT = process.env.PORT || 8081;
app.listen(PORT, () =>{
    console.log("Servidor ligado!");
});


    